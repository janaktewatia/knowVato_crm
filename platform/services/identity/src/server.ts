import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "./config";
import { User, Role, Refresh } from "./models";
import { signAccessToken, signRefreshToken, resolvePerms, buildJwks } from "./tokens";

const app = express();
app.use(helmet());
app.use(cors({ origin: config.clientOrigins[0] === "*" ? true : config.clientOrigins, credentials: true }));
app.use(express.json());

const ok = (res: any, data: any, code = 200) => res.status(code).json({ ok: true, data });
const fail = (res: any, code: number, error: string) => res.status(code).json({ ok: false, error });

/* ---- health + JWKS (public; this is how everyone verifies tokens) ---- */
app.get("/health", (_req, res) => res.json({ ok: true, service: "identity" }));
app.get("/.well-known/jwks.json", (_req, res) => res.json(buildJwks()));

/* ---- auth ---- */
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user || user.status !== "Active") return fail(res, 401, "Invalid credentials");
    if (!(await bcrypt.compare(password || "", user.passwordHash))) return fail(res, 401, "Invalid credentials");

    user.lastLogin = new Date();
    await user.save();

    const accessToken = await signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await Refresh.create({ user: user._id, token: refreshToken, expiresAt: new Date(Date.now() + 30 * 864e5), revoked: false });

    const { roles, perms } = await resolvePerms(String(user._id));
    ok(res, { accessToken, refreshToken, user: { id: user._id, tenant: user.tenant, name: user.name, email: user.email, roles, perms } });
  } catch (e: any) { fail(res, 500, e.message); }
});

app.post("/auth/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    const rec = await Refresh.findOne({ token: refreshToken, revoked: false });
    if (!rec || rec.expiresAt < new Date()) return fail(res, 401, "Invalid refresh token");
    const user = await User.findById(rec.user);
    if (!user) return fail(res, 401, "User gone");
    const accessToken = await signAccessToken(user);
    ok(res, { accessToken });
  } catch (e: any) { fail(res, 500, e.message); }
});

app.post("/auth/logout", async (req, res) => {
  await Refresh.updateOne({ token: req.body?.refreshToken }, { $set: { revoked: true } });
  ok(res, { loggedOut: true });
});

/* ---- a tiny local verify so identity can guard its own admin routes ---- */
function authn(req: any, res: any, next: any) {
  const h = req.headers.authorization || "";
  const t = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!t) return fail(res, 401, "Missing token");
  try {
    req.auth = jwt.verify(t, config.publicKey, { algorithms: ["RS256"], issuer: config.issuer });
    next();
  } catch (e: any) { fail(res, 401, "Invalid token"); }
}
const need = (perm: string) => (req: any, res: any, next: any) =>
  (req.auth?.perms || []).some((p: string) => p === perm || p === "*") ? next() : fail(res, 403, "Forbidden: " + perm);

app.get("/auth/me", authn, async (req: any, res) => {
  const user = await User.findById(req.auth.sub);
  if (!user) return fail(res, 404, "Not found");
  const { roles, perms } = await resolvePerms(String(user._id));
  ok(res, { user: { id: user._id, tenant: user.tenant, name: user.name, email: user.email, roles, perms }, perms });
});

/* ---- users (admin) ---- */
app.get("/users", authn, need("identity.users:view"), async (req: any, res) => {
  const users = await User.find({ tenant: req.auth.tenant }).populate("roles");
  ok(res, users);
});
app.get("/users/:id", authn, need("identity.users:view"), async (req: any, res) => {
  const u = await User.findOne({ _id: req.params.id, tenant: req.auth.tenant }).populate("roles");
  if (!u) return fail(res, 404, "Not found");
  const { roles, perms } = await resolvePerms(String(u._id));
  ok(res, { id: u._id, tenant: u.tenant, name: u.name, email: u.email, roles, perms });
});
app.post("/users", authn, need("identity.users:manage"), async (req: any, res) => {
  const { name, email, password, roles } = req.body || {};
  const passwordHash = await bcrypt.hash(password || "TempPass!23", 10);
  const u = await User.create({ tenant: req.auth.tenant, name, email, passwordHash, roles: roles || [] });
  ok(res, u, 201);
});
app.patch("/users/:id", authn, need("identity.users:manage"), async (req: any, res) => {
  const { passwordHash, password, ...patch } = req.body || {};
  if (password) patch.passwordHash = await bcrypt.hash(password, 10);
  const u = await User.findOneAndUpdate({ _id: req.params.id, tenant: req.auth.tenant }, { $set: patch }, { new: true });
  if (!u) return fail(res, 404, "Not found");
  ok(res, u);
});

/* ---- roles (admin) ---- */
app.get("/roles", authn, need("identity.roles:view"), async (req: any, res) => {
  ok(res, await Role.find({ tenant: req.auth.tenant }));
});
app.post("/roles", authn, need("identity.roles:manage"), async (req: any, res) => {
  const r = await Role.create({ ...req.body, tenant: req.auth.tenant });
  ok(res, r, 201);
});
app.patch("/roles/:id", authn, need("identity.roles:manage"), async (req: any, res) => {
  const r = await Role.findOneAndUpdate({ _id: req.params.id, tenant: req.auth.tenant }, { $set: req.body }, { new: true });
  if (!r) return fail(res, 404, "Not found");
  ok(res, r);
});

async function main() {
  await mongoose.connect(config.mongoUri);
  app.listen(config.port, () => {
    console.log(`[identity] http://localhost:${config.port}`);
    console.log(`[identity] JWKS at /.well-known/jwks.json (issuer ${config.issuer})`);
  });
}
main().catch((e) => { console.error(e); process.exit(1); });
