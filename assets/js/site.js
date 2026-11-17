/* Shared behaviour: menu, reveal, lightbox, copy, filters, hero scanner. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mobile menu
  const btn = document.querySelector(".menu-btn"), ul = document.querySelector(".nav ul");
  if (btn && ul) btn.addEventListener("click", () => { const o = ul.classList.toggle("open"); btn.setAttribute("aria-expanded", o); });

  // Reveal on scroll (elements are visible at rest; the class only adds a short rise)
  if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
  }

  // Lightbox for figures
  document.querySelectorAll(".gallery img").forEach(img => img.addEventListener("click", () => {
    const lb = document.createElement("div"); lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-label", img.alt);
    const big = document.createElement("img"); big.src = img.src; big.alt = img.alt; lb.appendChild(big);
    const close = () => lb.remove(); lb.addEventListener("click", close);
    document.addEventListener("keydown", function k(e) { if (e.key === "Escape") { close(); document.removeEventListener("keydown", k); } });
    document.body.appendChild(lb);
  }));

  // Copy email
  document.querySelectorAll("[data-copy]").forEach(b => b.addEventListener("click", async () => {
    const t = b.getAttribute("data-copy");
    try { await navigator.clipboard.writeText(t); b.textContent = "Copied"; }
    catch { const r = document.createRange(); const c = b.parentElement.querySelector("code"); if (c) { r.selectNodeContents(c); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } b.textContent = "Selected, press copy"; }
    setTimeout(() => (b.textContent = "Copy email"), 2200);
  }));

  // Project filters
  const fb = document.querySelectorAll(".filters button");
  fb.forEach(b => b.addEventListener("click", () => {
    fb.forEach(x => x.setAttribute("aria-pressed", x === b));
    const f = b.dataset.f; document.querySelector(".cards.all")?.classList.toggle("filtered", f !== "all");
    document.querySelectorAll(".cards .card").forEach(c => { c.hidden = f !== "all" && !c.dataset.cat.split(" ").includes(f); });
  }));

  // Hero scanner: a point-cloud "axial slice" swept by a scan beam; points near the beam light up.
  const cv = document.getElementById("scan");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  let W, H, pts = [], t = 0, mx = -1e3, my = -1e3, dpr = Math.min(2, devicePixelRatio || 1);
  function rnd(a) { let s = a; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
  function build() {
    const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const R = rnd(7), cx = W / 2, cy = H / 2, rx = W * .36, ry = H * .42; pts = [];
    const N = Math.round(Math.min(1500, W * 2.4));
    for (let i = 0; i < N; i++) {
      const a = R() * Math.PI * 2, rr = Math.sqrt(R());
      let x = cx + Math.cos(a) * rx * rr, y = cy + Math.sin(a) * ry * rr;
      const fold = Math.sin(a * 9 + rr * 14) * 6 * rr;            // gyri-like folding near the edge
      x += Math.cos(a) * fold; y += Math.sin(a) * fold;
      if (Math.abs(x - cx) < 3 && rr > .15) continue;              // midline fissure
      const lesion = Math.hypot(x - (cx + rx * .32), y - (cy - ry * .18)) < W * .055; // one bright finding
      pts.push({ x, y, ox: x, oy: y, b: .25 + R() * .5, lesion, s: 1 + R() * 1.3 });
    }
  }
  function frame() {
    t += reduce ? 0 : 1;
    ctx.clearRect(0, 0, W, H);
    const beam = reduce ? H * .45 : (Math.sin(t / 140) * .5 + .5) * H;
    const g = ctx.createLinearGradient(0, beam - 60, 0, beam + 2);
    g.addColorStop(0, "rgba(92,225,230,0)"); g.addColorStop(1, "rgba(92,225,230,.16)");
    ctx.fillStyle = g; ctx.fillRect(0, beam - 60, W, 62);
    for (const p of pts) {
      const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
      if (d < 70) { p.x += dx / d * 1.6; p.y += dy / d * 1.6; } else { p.x += (p.ox - p.x) * .06; p.y += (p.oy - p.y) * .06; }
      const near = Math.max(0, 1 - Math.abs(p.y - beam) / 46);
      const a = Math.min(1, .18 + p.b * .7 + near * .8);
      ctx.fillStyle = p.lesion ? `rgba(243,181,79,${Math.min(1, a + .25)})` : `rgba(${140 + near * 60 | 0},${200 + near * 40 | 0},255,${a})`;
      ctx.fillRect(p.x, p.y, p.s, p.s);
    }
    ctx.fillStyle = "rgba(92,225,230,.9)"; ctx.fillRect(0, beam, W, 1);
    if (!reduce) requestAnimationFrame(frame);
  }
  cv.addEventListener("pointermove", e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
  cv.addEventListener("pointerleave", () => { mx = my = -1e3; });
  addEventListener("resize", () => { build(); if (reduce) frame(); });
  build(); frame();
  const sl = document.getElementById("slice");
  if (sl && !reduce) setInterval(() => { sl.textContent = String(1 + ((Date.now() / 900 | 0) % 24)).padStart(2, "0"); }, 900);
})();
