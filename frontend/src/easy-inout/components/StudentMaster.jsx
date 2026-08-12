import React, { useState } from "react";
import { Upload, Plus, Search, Pencil, Trash2, Check } from "lucide-react";
import { Badge } from "./Badge";
import { Field, inputCls, btnPrimary, btnSecondary } from "./Field";
import { avatar } from "../data/mockData";

export function StudentMaster({ students, setStudents }) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", cls: "", section: "", mobile: "", email: "", nfc: "" });

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setForm({ name: "", cls: "", section: "", mobile: "", email: "", nfc: "" }); setEditing("new"); };
  const openEdit = (s) => { setForm(s); setEditing(s.id); };

  const save = () => {
    if (editing === "new") {
      setStudents(prev => [...prev, { ...form, id: Date.now(), photo: Math.ceil(Math.random() * 60) }]);
    } else {
      setStudents(prev => prev.map(s => s.id === editing ? { ...s, ...form } : s));
    }
    setEditing(null);
  };

  const remove = (id) => setStudents(prev => prev.filter(s => s.id !== id));

  return (
    <div className="p-3 sm:p-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Student Master</h2>
        <div className="flex gap-2">
          <label className={`${btnSecondary} cursor-pointer flex-1 sm:flex-initial`}>
            <Upload size={16} /> Import
            <input type="file" className="hidden" onChange={() => alert("Import file received — mapping screen would appear here.")} />
          </label>
          <button onClick={openNew} className={`${btnPrimary} flex-1 sm:flex-initial`}><Plus size={16} /> Add Student</button>
        </div>
      </div>

      <div className="relative mb-3 w-full sm:max-w-[320px]">
        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        <input className={`${inputCls} pl-9`} placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-white border rounded-xl overflow-x-auto shadow-xs w-full">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2">Student</th><th className="px-4 py-2">Class-Section</th><th className="px-4 py-2">Mobile</th>
              <th className="px-4 py-2">Email</th><th className="px-4 py-2">NFC Card</th><th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-2 flex items-center gap-2"><img src={avatar(s.photo)} className="w-7 h-7 rounded-full" alt={s.name} /> {s.name}</td>
                <td className="px-4 py-2">{s.cls}-{s.section}</td>
                <td className="px-4 py-2">{s.mobile}</td>
                <td className="px-4 py-2">{s.email}</td>
                <td className="px-4 py-2"><Badge color="gray">{s.nfc}</Badge></td>
                <td className="px-4 py-2 flex gap-2 justify-end">
                  <button onClick={() => openEdit(s)} className="text-sky-600 hover:text-sky-800 cursor-pointer p-1"><Pencil size={15} /></button>
                  <button onClick={() => remove(s.id)} className="text-red-500 hover:text-red-700 cursor-pointer p-1"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-gray-800 mb-3">{editing === "new" ? "Add Student" : "Edit Student"}</h3>
            <Field label="Student Name"><input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Class"><input className={inputCls} value={form.cls} onChange={e => setForm({ ...form, cls: e.target.value })} /></Field>
              <Field label="Section"><input className={inputCls} value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} /></Field>
            </div>
            <Field label="Mobile Number"><input className={inputCls} value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} /></Field>
            <Field label="Email ID"><input className={inputCls} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="NFC Card Number"><input className={inputCls} value={form.nfc} onChange={e => setForm({ ...form, nfc: e.target.value })} /></Field>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditing(null)} className={btnSecondary}>Cancel</button>
              <button onClick={save} className={btnPrimary}><Check size={16} /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
