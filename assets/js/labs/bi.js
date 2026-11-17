/* BI dashboard on the real urban-centres dataset: slicers, KPI cards, cross-filtering charts and a drill-down table.
   Measures are written the way they would be in a Power BI model, then evaluated over the filtered rows. */
(() => {
  const root = document.getElementById("bi-lab"); if (!root) return;
  const $ = s => root.querySelector(s);
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const NS = "http://www.w3.org/2000/svg";
  const F = { region: "all", income: new Set([0, 1, 2, 3]), size: "all", country: null };
  let D;
  const C = { name: 0, country: 1, income: 2, region: 3, pop: 4, hasH: 5, h: 6, hasP: 7, p: 8, q: 9 };
  const median = a => { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

  const filtered = (ignore) => D.rows.filter(r =>
    (ignore === "region" || F.region === "all" || r[C.region] === +F.region) &&
    (ignore === "income" || F.income.has(r[C.income])) &&
    (F.size === "all" || r[C.q] === +F.size) &&
    (ignore === "country" || F.country === null || r[C.country] === F.country));

  function bar(box, items, onClick, fmt, max = 100, active) {
    box.innerHTML = "";
    const W = Math.max(300, box.clientWidth || 480), rowH = 30, L = Math.min(210, W * .42), H = items.length * rowH + 8;
    const s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", `0 0 ${W} ${H}`); s.setAttribute("role", "img");
    items.forEach((it, i) => {
      const y = 4 + i * rowH, w = (W - L - 70) * Math.max(0, it.v) / max, on = active ? active(it) : true;
      const g = document.createElementNS(NS, "g"); g.style.cursor = onClick ? "pointer" : "default";
      const t = document.createElementNS(NS, "text"); t.setAttribute("x", L - 8); t.setAttribute("y", y + 18); t.setAttribute("text-anchor", "end"); const maxc = Math.floor(L / 6.6); t.textContent = it.label.length > maxc ? it.label.slice(0, maxc - 1) + "…" : it.label; const ti = document.createElementNS(NS, "title"); ti.textContent = it.label; t.appendChild(ti); if (on) t.setAttribute("fill", css("--text"));
      const bg = document.createElementNS(NS, "rect"); bg.setAttribute("x", L); bg.setAttribute("y", y + 4); bg.setAttribute("width", W - L - 70); bg.setAttribute("height", 18); bg.setAttribute("rx", 4); bg.setAttribute("fill", "rgba(29,40,66,.6)");
      const r = document.createElementNS(NS, "rect"); r.setAttribute("x", L); r.setAttribute("y", y + 4); r.setAttribute("width", w); r.setAttribute("height", 18); r.setAttribute("rx", 4); r.setAttribute("fill", on ? css("--scan") : "rgba(92,225,230,.25)");
      const v = document.createElementNS(NS, "text"); v.setAttribute("x", L + w + 8); v.setAttribute("y", y + 18); v.textContent = fmt(it.v); v.setAttribute("fill", on ? css("--amber") : css("--muted"));
      g.append(t, bg, r, v); if (onClick) g.addEventListener("click", () => onClick(it)); s.appendChild(g);
    });
    box.appendChild(s);
  }
  function hist(box, vals) {
    box.innerHTML = ""; const W = Math.max(300, box.clientWidth || 480), H = 190, L = 34, B = 26, T = 8;
    const edges = [0, 1, 2, 3, 4, 5, 7.5, 10, 15, 20, 40]; const counts = edges.slice(0, -1).map((e, i) => vals.filter(v => v >= e && v < edges[i + 1]).length);
    const max = Math.max(1, ...counts), bw = (W - L - 8) / counts.length;
    const s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", `0 0 ${W} ${H}`); s.setAttribute("role", "img"); s.setAttribute("aria-label", "Distribution of recorded hospitals per 100,000");
    counts.forEach((c, i) => { const h = (H - T - B) * c / max, r = document.createElementNS(NS, "rect"); r.setAttribute("x", L + i * bw + 2); r.setAttribute("y", H - B - h); r.setAttribute("width", bw - 4); r.setAttribute("height", h); r.setAttribute("rx", 3); r.setAttribute("fill", css("--amber")); s.appendChild(r);
      const t = document.createElementNS(NS, "text"); t.setAttribute("x", L + i * bw + bw / 2); t.setAttribute("y", H - 8); t.setAttribute("text-anchor", "middle"); t.textContent = edges[i]; s.appendChild(t); });
    const t = document.createElementNS(NS, "text"); t.setAttribute("x", L); t.setAttribute("y", 12); t.textContent = max.toLocaleString() + " centres"; s.appendChild(t);
    box.appendChild(s);
  }

  function render() {
    const rows = filtered();
    const pop = rows.reduce((s, r) => s + r[C.pop], 0);
    const rec = rows.length ? rows.filter(r => r[C.hasH]).length / rows.length : 0;
    const medH = median(rows.filter(r => r[C.hasH] && r[C.h] != null).map(r => r[C.h]));
    const medP = median(rows.filter(r => r[C.hasP] && r[C.p] != null).map(r => r[C.p]));
    $("#bi-n").textContent = rows.length.toLocaleString();
    $("#bi-pop").textContent = pop >= 1e9 ? (pop / 1e9).toFixed(2) + " bn" : (pop / 1e6).toFixed(1) + " m";
    $("#bi-rec").textContent = Math.round(rec * 100) + "%";
    $("#bi-medh").textContent = medH == null ? "-" : medH.toFixed(1);
    $("#bi-medp").textContent = medP == null ? "-" : medP.toFixed(1);
    // income chart (ignores its own filter so you can click between groups)
    const ri = filtered("income");
    bar($("#bi-income"), D.income.map((l, i) => { const g = ri.filter(r => r[C.income] === i); return { label: l, i, v: g.length ? 100 * g.filter(r => r[C.hasH]).length / g.length : 0 }; }),
      it => { if (F.income.size === 1 && F.income.has(it.i)) F.income = new Set([0, 1, 2, 3]); else F.income = new Set([it.i]); syncChips(); render(); },
      v => Math.round(v) + "%", 100, it => F.income.has(it.i));
    const rr = filtered("region");
    const reg = D.regions.map((l, i) => { const g = rr.filter(r => r[C.region] === i); return { label: l.replace("&", "and"), i, v: g.length ? 100 * g.filter(r => r[C.hasH]).length / g.length : 0, n: g.length }; }).filter(x => x.n).sort((a, b) => b.v - a.v);
    bar($("#bi-region"), reg, it => { F.region = F.region === String(it.i) ? "all" : String(it.i); $("#bi-reg").value = F.region; render(); }, v => Math.round(v) + "%", 100, it => F.region === "all" || F.region === String(it.i));
    hist($("#bi-hist"), rows.filter(r => r[C.hasH] && r[C.h] != null).map(r => r[C.h]));
    // drill-down table: countries, or centres within the chosen country
    const tb = $("#bi-table tbody"); tb.innerHTML = "";
    const q = $("#bi-search").value.trim().toLowerCase();
    if (F.country === null) {
      const by = {}; rows.forEach(r => { const k = r[C.country]; (by[k] ||= { n: 0, pop: 0, h: 0 }); by[k].n++; by[k].pop += r[C.pop]; by[k].h += r[C.hasH]; });
      $("#bi-th").innerHTML = "<th>Country</th><th class=num>Centres</th><th class=num>Population</th><th class=num>Hospital recorded</th>";
      Object.entries(by).filter(([k]) => !q || D.countries[k].toLowerCase().includes(q)).sort((a, b) => b[1].pop - a[1].pop).slice(0, 25).forEach(([k, v]) => {
        const tr = tb.insertRow(); tr.tabIndex = 0; tr.className = "click"; tr.innerHTML = `<td>${D.countries[k]}</td><td class=num>${v.n}</td><td class=num>${(v.pop / 1e6).toFixed(1)} m</td><td class=num>${Math.round(100 * v.h / v.n)}%</td>`;
        const go = () => { F.country = +k; render(); }; tr.addEventListener("click", go); tr.addEventListener("keydown", e => { if (e.key === "Enter") go(); }); });
      $("#bi-crumb").textContent = "All countries · select a row to drill down";
    } else {
      $("#bi-th").innerHTML = "<th>Urban centre</th><th class=num>Population</th><th class=num>Hospitals /100k</th><th class=num>Pharmacies /100k</th>";
      rows.filter(r => !q || r[C.name].toLowerCase().includes(q)).sort((a, b) => b[C.pop] - a[C.pop]).slice(0, 25).forEach(r => {
        const tr = tb.insertRow(); tr.innerHTML = `<td>${r[C.name]}</td><td class=num>${Math.round(r[C.pop]).toLocaleString()}</td><td class=num>${r[C.h] == null ? "not recorded" : r[C.h].toFixed(1)}</td><td class=num>${r[C.p] == null ? "not recorded" : r[C.p].toFixed(1)}</td>`; });
      $("#bi-crumb").innerHTML = `<a href="#bi-lab" id="bi-up">All countries</a> › ${D.countries[F.country]}`;
      $("#bi-up").addEventListener("click", e => { e.preventDefault(); F.country = null; render(); });
    }
  }
  function syncChips() { root.querySelectorAll("[data-inc]").forEach(b => b.setAttribute("aria-pressed", String(F.income.has(+b.dataset.inc)))); }

  fetch(root.dataset.src).then(r => r.json()).then(d => {
    D = d;
    const reg = $("#bi-reg"); D.regions.forEach((r, i) => { const o = document.createElement("option"); o.value = i; o.textContent = r; reg.appendChild(o); });
    reg.addEventListener("change", () => { F.region = reg.value; render(); });
    $("#bi-size").addEventListener("change", e => { F.size = e.target.value; render(); });
    root.querySelectorAll("[data-inc]").forEach(b => b.addEventListener("click", () => { const i = +b.dataset.inc; if (F.income.has(i) && F.income.size > 1) F.income.delete(i); else F.income.add(i); syncChips(); render(); }));
    $("#bi-search").addEventListener("input", render);
    $("#bi-clear").addEventListener("click", () => { F.region = "all"; F.income = new Set([0, 1, 2, 3]); F.size = "all"; F.country = null; reg.value = "all"; $("#bi-size").value = "all"; $("#bi-search").value = ""; syncChips(); render(); });
    syncChips(); render();
    let t; addEventListener("resize", () => { clearTimeout(t); t = setTimeout(render, 150); });
  }).catch(() => { $("#bi-n").textContent = "Data could not load"; });
})();
