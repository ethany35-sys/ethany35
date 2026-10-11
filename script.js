document.getElementById("year").textContent = new Date().getFullYear();

// Timeline: arrow buttons + click-and-drag scrolling
const tl = document.getElementById("tl-scroll");
const step = () => Math.min(600, tl.clientWidth * 0.8);
document.getElementById("tl-prev").onclick = () => tl.scrollBy({ left: -step(), behavior: "smooth" });
document.getElementById("tl-next").onclick = () => tl.scrollBy({ left: step(), behavior: "smooth" });

let down = false, startX = 0, startLeft = 0;
tl.addEventListener("pointerdown", e => {
  if (e.pointerType !== "mouse") return; // touch already scrolls natively
  down = true; startX = e.clientX; startLeft = tl.scrollLeft;
});
addEventListener("pointermove", e => {
  if (!down) return;
  if (Math.abs(e.clientX - startX) > 4) tl.classList.add("dragging");
  tl.scrollLeft = startLeft - (e.clientX - startX);
});
addEventListener("pointerup", () => { down = false; tl.classList.remove("dragging"); });
// Slow automatic scroll: runs while the timeline is on screen, pauses on hover/touch/drag,
// resumes shortly after, and loops back to the start when it reaches the end.
const SPEED = 35; // pixels per second
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
let pos = 0, last = 0, hover = false, visible = false, resumeAt = 0, pauseEnd = 0;
const pauseAuto = (ms = 2500) => { resumeAt = performance.now() + ms; pos = tl.scrollLeft; };

new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(tl);
tl.addEventListener("mouseenter", () => { hover = true; });
tl.addEventListener("mouseleave", () => { hover = false; pauseAuto(800); });
["pointerdown", "wheel", "touchstart", "keydown", "focusin"].forEach(ev => tl.addEventListener(ev, () => pauseAuto(4000), { passive: true }));
document.querySelectorAll("#tl-prev, #tl-next").forEach(b => b.addEventListener("click", () => pauseAuto(4000)));
tl.addEventListener("scroll", () => { if (performance.now() < resumeAt) pos = tl.scrollLeft; }, { passive: true });

function tick(now) {
  const dt = Math.min(now - last, 100) / 1000;
  last = now;
  if (!reduced && visible && !hover && !down && now > resumeAt && now > pauseEnd) {
    const max = tl.scrollWidth - tl.clientWidth;
    pos += SPEED * dt;
    if (pos >= max) { pos = max; pauseEnd = now + 2500; setTimeout(() => {
      if (tl.scrollLeft < max - 4) return; // user moved it; don't rewind
      pos = 0; tl.scrollTo({ left: 0, behavior: "smooth" }); pauseEnd = performance.now() + 3500;
    }, 2500); }
    else tl.scrollLeft = pos;
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

tl.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") tl.scrollBy({ left: 300, behavior: "smooth" });
  if (e.key === "ArrowLeft") tl.scrollBy({ left: -300, behavior: "smooth" });
});
