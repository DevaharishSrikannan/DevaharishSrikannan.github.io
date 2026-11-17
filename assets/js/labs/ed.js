/* Emergency department patient-flow simulator: discrete-event simulation, runs in the browser.
   All inputs are illustrative assumptions you can change; nothing here is real hospital data. */
(() => {
  const root = document.getElementById("ed-lab"); if (!root) return;
  const $ = s => root.querySelector(s);
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  // Triage categories (Manchester Triage System style). share of arrivals, mean minutes with a doctor, chance of admission
  const CAT = [
    { k: 1, name: "Immediate", share: .01, treat: 90, admit: .85, col: "#ff4d6d" },
    { k: 2, name: "Very urgent", share: .12, treat: 75, admit: .55, col: "#ff8a4c" },
    { k: 3, name: "Urgent", share: .42, treat: 55, admit: .30, col: "#f3b54f" },
    { k: 4, name: "Standard", share: .35, treat: 30, admit: .08, col: "#6fe3a5" },
    { k: 5, name: "Non-urgent", share: .10, treat: 20, admit: .02, col: "#5ce1e6" }];
  // Arrivals per hour across the day, shaped like a typical ED (low overnight, peak late morning)
  const SHAPE = [.45, .35, .3, .28, .28, .32, .45, .7, 1.05, 1.3, 1.4, 1.38, 1.3, 1.25, 1.2, 1.18, 1.15, 1.1, 1.05, 1, .95, .85, .7, .55];
  const SHAPE_SUM = SHAPE.reduce((a, b) => a + b, 0);
  const P = { arrivals: 150, doctors: 5, beds: 22, fast: true, days: 7 };
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const expo = m => -Math.log(1 - rnd()) * m;
  const logn = m => Math.max(5, m * Math.exp(.55 * Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd()) - .15));

  function simulate() {
    seed = 7;
    const H = P.days * 24, patients = [];
    // 1. arrivals: non-homogeneous Poisson by hour
    for (let h = 0; h < H; h++) {
      const rate = P.arrivals * SHAPE[h % 24] / SHAPE_SUM; let t = h * 60;
      while (true) { t += expo(60 / rate); if (t >= (h + 1) * 60) break;
        let u = rnd(), c = 0; while (u > CAT[c].share && c < 4) { u -= CAT[c].share; c++; }
        patients.push({ arr: t, cat: c }); }
    }
    patients.sort((a, b) => a.arr - b.arr);
    // 2. doctors: priority queue by category then arrival; fast track gives cat 4-5 one dedicated clinician
    const docFree = Array(P.doctors).fill(0), ftFree = [0];
    const queue = [];
    let i = 0, now = 0;
    const events = [];
    const seen = [];
    // process in time order with a simple discrete loop at 1-minute resolution (fast enough for a week)
    const END = H * 60 + 24 * 60;
    for (now = 0; now < END; now++) {
      while (i < patients.length && patients[i].arr <= now) queue.push(patients[i++]);
      if (!queue.length) continue;
      queue.sort((a, b) => a.cat - b.cat || a.arr - b.arr);
      for (let q = 0; q < queue.length; q++) {
        const p = queue[q];
        let pool = docFree, idx = docFree.findIndex(f => f <= now);
        if (P.fast && p.cat >= 3) { const j = ftFree.findIndex(f => f <= now); if (j >= 0) { pool = ftFree; idx = j; } }
        if (idx < 0) { if (p.cat < 3) break; else continue; }
        p.start = now; p.treat = logn(CAT[p.cat].treat); pool[idx] = now + p.treat; p.done = now + p.treat;
        p.admit = rnd() < CAT[p.cat].admit; seen.push(p); queue.splice(q, 1); q--;
      }
    }
    // 3. admitted patients wait on a trolley for a ward bed; beds free up at a steady rate through the day
    const admitted = seen.filter(p => p.admit).sort((a, b) => a.done - b.done);
    const bedTimes = []; for (let d = 0; d < P.days + 1; d++) for (let b = 0; b < P.beds; b++) bedTimes.push(d * 1440 + 8 * 60 + (b / P.beds) * 12 * 60); // discharges 08:00-20:00
    let bi = 0;
    for (const p of admitted) p.bed = bi < bedTimes.length ? Math.max(p.done, bedTimes[bi++]) : p.done + 1440; // FIFO: first treated, first bedded
    seen.forEach(p => { p.leave = p.admit ? p.bed : p.done; p.pet = p.leave - p.arr; });
    return { patients: seen, unseen: queue.length, H };
  }

  function metrics(r) {
    const ps = r.patients.filter(p => p.arr >= 24 * 60); // drop the first day as warm-up
    const wait = ps.map(p => p.start - p.arr).sort((a, b) => a - b);
    const med = a => a.length ? a[a.length >> 1] : 0;
    const within6 = ps.filter(p => p.pet <= 360).length / Math.max(1, ps.length);
    const trolley = ps.filter(p => p.admit).map(p => p.bed - p.done);
    // 08:00 trolley count each day (admitted, treated, still waiting for a bed)
    const at8 = []; for (let d = 1; d < P.days; d++) { const t = d * 1440 + 480; at8.push(r.patients.filter(p => p.admit && p.done <= t && p.bed > t).length); }
    // hourly census for the chart
    const census = []; for (let t = 1440; t < r.H * 60; t += 60) census.push({ t, wait: r.patients.filter(p => p.arr <= t && p.start > t).length, trolley: r.patients.filter(p => p.admit && p.done <= t && p.bed > t).length });
    return { n: ps.length, medWait: med(wait), within6, trolleyMed: med(trolley.sort((a, b) => a - b)), at8: at8.length ? Math.round(at8.reduce((a, b) => a + b, 0) / at8.length) : 0, census };
  }

  function chart(m) {
    const box = $("#ed-chart"); box.innerHTML = "";
    const W = Math.max(320, box.clientWidth || 600), H = 240, L = 40, B = 30, T = 12, R = W - 12;
    const NS = "http://www.w3.org/2000/svg", s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", `0 0 ${W} ${H}`); s.setAttribute("role", "img"); s.setAttribute("aria-label", "Patients waiting to be seen and on trolleys, by hour");
    const max = Math.max(10, ...m.census.map(c => Math.max(c.wait, c.trolley)));
    const x = i => L + i / (m.census.length - 1) * (R - L), y = v => T + (1 - v / max) * (H - T - B);
    const add = (tag, at) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); s.appendChild(e); return e; };
    for (let v = 0; v <= max; v += Math.ceil(max / 4)) { add("line", { x1: L, x2: R, y1: y(v), y2: y(v), stroke: css("--line") }); add("text", { x: L - 6, y: y(v) + 4, "text-anchor": "end" }).textContent = v; }
    for (let d = 1; d < P.days; d++) { const xi = x((d - 1) * 24); add("text", { x: xi, y: H - 8, "text-anchor": "middle" }).textContent = "Day " + (d + 1); }
    const path = (k, col) => add("path", { d: m.census.map((c, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(c[k]).toFixed(1)).join(""), fill: "none", stroke: col, "stroke-width": 2 });
    path("wait", css("--scan")); path("trolley", css("--rose"));
    box.appendChild(s);
  }

  // Animated floor view: dots flow from waiting room to treatment to trolley/home over one simulated day
  let anim, simCache;
  function floor(r) {
    const cv = $("#ed-floor"), x = cv.getContext("2d"), dpr = Math.min(2, devicePixelRatio || 1);
    const W = cv.clientWidth, H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
    const zones = [["Waiting room", .02], ["With a doctor", .27], ["Trolley, awaiting bed", .52], ["Home or ward", .77]];
    const zw = W * .21;
    const day = 3 * 1440; let t = day;
    cancelAnimationFrame(anim);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ps = r.patients.filter(p => p.arr < day + 1440 && p.leave > day);
    const pos = new Map();
    function tick() {
      x.clearRect(0, 0, W, H);
      zones.forEach(([n, fx]) => { x.strokeStyle = css("--line"); x.strokeRect(W * fx, 28, zw, H - 40); x.fillStyle = css("--muted"); x.font = "11px IBM Plex Mono, monospace"; x.fillText(n, W * fx + 6, 18); });
      const counts = [0, 0, 0, 0];
      for (const p of ps) {
        if (p.arr > t) continue;
        const z = t < p.start ? 0 : t < p.done ? 1 : (p.admit && t < p.bed) ? 2 : 3;
        if (z === 3 && t - p.leave > 90) continue;
        const k = counts[z]++, per = Math.max(4, Math.floor(zw / 11));
        const tx = W * zones[z][1] + 8 + (k % per) * 11, ty = 40 + Math.floor(k / per) * 11;
        const c = pos.get(p) || { x: W * zones[0][1] + 8, y: H - 20 };
        c.x += (tx - c.x) * .15; c.y += (ty - c.y) * .15; pos.set(p, c);
        x.fillStyle = CAT[p.cat].col; x.beginPath(); x.arc(c.x, c.y, 3.6, 0, 7); x.fill();
      }
      const hh = Math.floor((t % 1440) / 60), mm = Math.floor(t % 60);
      $("#ed-clock").textContent = `Day 4 · ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")} · ${counts[0]} waiting · ${counts[1]} being treated · ${counts[2]} on trolleys`;
      if (!reduce) { t += 2.2; if (t > day + 1440) t = day; anim = requestAnimationFrame(tick); }
    }
    if (reduce) t = day + 600; tick();
  }

  function run() {
    $("#ed-arr-o").textContent = P.arrivals + " per day"; $("#ed-doc-o").textContent = P.doctors; $("#ed-bed-o").textContent = P.beds + " per day";
    root.querySelectorAll("[data-fast]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.fast === String(P.fast))));
    simCache = simulate(); const m = metrics(simCache);
    $("#ed-wait").textContent = Math.round(m.medWait) + " min";
    $("#ed-6h").textContent = Math.round(m.within6 * 100) + "%";
    $("#ed-6h").style.color = m.within6 > .85 ? css("--mint") : m.within6 > .65 ? css("--amber") : css("--rose");
    $("#ed-trolley").textContent = m.at8;
    $("#ed-n").textContent = m.n.toLocaleString();
    chart(m); floor(simCache);
  }
  let deb; const later = () => { clearTimeout(deb); deb = setTimeout(run, 120); };
  $("#ed-arr").addEventListener("input", e => { P.arrivals = +e.target.value; later(); });
  $("#ed-doc").addEventListener("input", e => { P.doctors = +e.target.value; later(); });
  $("#ed-bed").addEventListener("input", e => { P.beds = +e.target.value; later(); });
  root.querySelectorAll("[data-fast]").forEach(b => b.addEventListener("click", () => { P.fast = b.dataset.fast === "true"; run(); }));
  addEventListener("resize", () => { clearTimeout(deb); deb = setTimeout(run, 200); });
  run();
})();
