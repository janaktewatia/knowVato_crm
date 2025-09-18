// getFadeInStyle.js
export const getFadeInStyle = (
  showdiv,
  x = 0,
  y = 0,
  z = 0,
  startX = 0,
  startY = -10,
  startZ = 0
) => ({
  opacity: showdiv ? 1 : 0,
  transform: showdiv
    ? `translate3d(${x}px, ${y}px, ${z}px)`
    : `translate3d(${startX}px, ${startY}px, ${startZ}px)`,
  transition: "opacity 0.5s ease-in-out, transform 0.5s ease-in-out",
});
