/* Coordinated-abuse ring detector on a synthetic account network.
   Accounts link when they share a device, a payment card or a /24 IP block. Rings are planted so the
   detector can be scored against known truth; families sharing a device are planted as innocent look-alikes. */
(() => {
  const root = document.getElementById("fraud-lab"); if (!root) return;
  const $ = s => root.querySelector(s);
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  let seed = 3, G, sel = null, thr = 0.45, raf;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pick = a => a[Math.floor(rnd() * a.length)];
  const hex = n => Math.floor(rnd() * 16 ** n).toString(16).padStart(n, "0");

  function generate(s) {
    seed = s; const acc = [];
    const add = (o) => { o.id = acc.length; acc.push(o); return o; };
    // 260 ordinary accounts, each with its own device/card, spread signup times over 30 days
    for (let i = 0; i < 260; i++) add({ kind: "legit", dev: "d" + hex(6), card: "c" + hex(6), ip: `${80 + Math.floor(rnd() * 120)}.${Math.floor(rnd() * 255)}.${Math.floor(rnd() * 255)}`, t: rnd() * 30 * 1440, tx: 1 + Math.floor(rnd() * 6), chargeback: rnd() < .02 });
    // 14 families: 2 to 4 accounts sharing a home device and IP, signups spread over weeks, normal behaviour
    for (let f = 0; f < 14; f++) { const dev = "d" + hex(6), ip = `${80 + Math.floor(rnd() * 120)}.${Math.floor(rnd() * 255)}.${Math.floor(rnd() * 255)}`, n = 2 + Math.floor(rnd() * 3);
      const same = f % 4 === 0, tf = rnd() * 29 * 1440; // some families sign up together on the same evening
      for (let i = 0; i < n; i++) add({ kind: "family", ring: "F" + f, dev, card: rnd() < .3 ? "cfam" + f : "c" + hex(6), ip, t: same ? tf + rnd() * 240 : rnd() * 30 * 1440, tx: 1 + Math.floor(rnd() * 9), chargeback: rnd() < .08 }); }
    // 6 abuse rings: 5 to 12 accounts, signups within an hour, rotating a few devices and cards, burst of activity, chargebacks
    for (let r = 0; r < 6; r++) { const n = 5 + Math.floor(rnd() * 8), t0 = rnd() * 28 * 1440, devs = Array.from({ length: 1 + Math.floor(rnd() * 3) }, () => "d" + hex(6)), cards = Array.from({ length: 1 + Math.floor(rnd() * 2) }, () => "c" + hex(6)), block = `${10 + Math.floor(rnd() * 60)}.${Math.floor(rnd() * 255)}.${Math.floor(rnd() * 255)}`;
      const spread = r % 3 === 2 ? 3 * 1440 : 60 + rnd() * 120; // a third of rings are patient and spread signups over days
      for (let i = 0; i < n; i++) add({ kind: "ring", ring: "R" + r, dev: pick(devs), card: rnd() < .7 ? pick(cards) : "c" + hex(6), ip: block, t: t0 + rnd() * spread, tx: 3 + Math.floor(rnd() * 18), chargeback: rnd() < .35 }); }
    // edges: shared device, card or IP block
    const E = [], idx = {};
    acc.forEach(a => ["dev", "card", "ip"].forEach(k => { const key = k + ":" + a[k]; (idx[key] ||= []).push(a.id); }));
    Object.entries(idx).forEach(([key, ids]) => { for (let i = 1; i < ids.length; i++) E.push({ a: ids[0], b: ids[i], k: key.split(":")[0] }); });
    // components (union-find)
    const par = acc.map((_, i) => i), f = i => par[i] === i ? i : (par[i] = f(par[i]));
    E.forEach(e => { par[f(e.a)] = f(e.b); });
    const comps = {}; acc.forEach(a => (comps[f(a.id)] ||= []).push(a));
    // score each component: size, signup burst, shared cards, activity, chargebacks
    Object.values(comps).forEach(c => {
      const ts = c.map(a => a.t).sort((x, y) => x - y), span = ts[ts.length - 1] - ts[0];
      const cards = new Set(c.map(a => a.card)).size, devs = new Set(c.map(a => a.dev)).size;
      const f1 = Math.min(1, (c.length - 1) / 8);                        // bigger cluster
      const f2 = c.length > 1 ? Math.max(0, 1 - span / (6 * 60)) : 0;    // signups within a few hours
      const f3 = c.length > 1 ? 1 - cards / c.length : 0;                // cards reused across accounts
      const f4 = Math.min(1, c.reduce((s, a) => s + a.tx, 0) / c.length / 15); // heavy activity per account
      const f5 = c.filter(a => a.chargeback).length / c.length;          // chargeback rate
      const score = c.length < 2 ? .05 * f4 + .3 * f5 : .22 * f1 + .30 * f2 + .2 * f3 + .13 * f4 + .15 * f5;
      c.forEach(a => { a.score = score; a.comp = c; a.feat = { size: c.length, spanMin: Math.round(span), cards, devs, tx: (c.reduce((s, x) => s + x.tx, 0) / c.length).toFixed(1), cb: Math.round(f5 * 100) }; });
    });
    // layout: initial positions on a circle, then a short force simulation
    const W = 1000, H = 640;
    acc.forEach((a, i) => { const ang = rnd() * Math.PI * 2, r = 120 + rnd() * 280; a.x = W / 2 + Math.cos(ang) * r; a.y = H / 2 + Math.sin(ang) * r * .7; a.vx = a.vy = 0; });
    return { acc, E, W, H };
  }

  function step(g) {
    const { acc, E, W, H } = g;
    for (const e of E) { const a = acc[e.a], b = acc[e.b], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, f = (d - 18) * .02; a.vx += dx / d * f; a.vy += dy / d * f; b.vx -= dx / d * f; b.vy -= dy / d * f; }
    for (let i = 0; i < acc.length; i++) for (let j = i + 1; j < acc.length; j++) { const a = acc[i], b = acc[j], dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy; if (d2 > 3600 || d2 === 0) continue; const f = 30 / d2; a.vx -= dx * f; a.vy -= dy * f; b.vx += dx * f; b.vy += dy * f; }
    for (const a of acc) { a.vx += (W / 2 - a.x) * .0015; a.vy += (H / 2 - a.y) * .0015; a.vx *= .82; a.vy *= .82; a.x = Math.max(10, Math.min(W - 10, a.x + a.vx)); a.y = Math.max(10, Math.min(H - 10, a.y + a.vy)); }
  }

  const cv = $("#fr-canvas"), x = cv.getContext("2d");
  function draw() {
    const dpr = Math.min(2, devicePixelRatio || 1), Wc = cv.clientWidth, Hc = cv.clientHeight;
    cv.width = Wc * dpr; cv.height = Hc * dpr; const s = Math.min(Wc / G.W, Hc / G.H); x.setTransform(dpr * s, 0, 0, dpr * s, (Wc - G.W * s) / 2 * dpr, (Hc - G.H * s) / 2 * dpr);
    x.clearRect(-1e4, -1e4, 3e4, 3e4);
    const kc = { dev: "rgba(92,225,230,.45)", card: "rgba(243,181,79,.55)", ip: "rgba(143,154,180,.25)" };
    for (const e of G.E) { const a = G.acc[e.a], b = G.acc[e.b]; x.strokeStyle = kc[e.k]; x.lineWidth = 1; x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke(); }
    for (const a of G.acc) {
      const flagged = a.score >= thr;
      x.fillStyle = flagged ? css("--rose") : a.comp.length > 1 ? "rgba(231,236,246,.75)" : "rgba(143,154,180,.45)";
      x.beginPath(); x.arc(a.x, a.y, flagged ? 6 : 4, 0, 7); x.fill();
      if (sel && sel.comp === a.comp) { x.strokeStyle = css("--scan"); x.lineWidth = 2; x.beginPath(); x.arc(a.x, a.y, 9, 0, 7); x.stroke(); }
    }
  }
  function score() {
    const tp = G.acc.filter(a => a.score >= thr && a.kind === "ring").length, fp = G.acc.filter(a => a.score >= thr && a.kind !== "ring").length, fn = G.acc.filter(a => a.score < thr && a.kind === "ring").length;
    const prec = tp + fp ? tp / (tp + fp) : 1, rec = tp / (tp + fn);
    $("#fr-flag").textContent = tp + fp; $("#fr-prec").textContent = Math.round(prec * 100) + "%"; $("#fr-rec").textContent = Math.round(rec * 100) + "%";
    $("#fr-fam").textContent = G.acc.filter(a => a.score >= thr && a.kind === "family").length;
    $("#fr-thr-o").textContent = thr.toFixed(2);
  }
  function inspect(a) {
    const box = $("#fr-detail");
    if (!a) { box.innerHTML = '<p class="muted">Select an account in the graph to see why it was or was not flagged.</p>'; return; }
    const f = a.feat, truth = a.kind === "ring" ? "Planted abuse ring" : a.kind === "family" ? "Planted innocent family" : "Ordinary account";
    box.innerHTML = `<div class="row"><span class="chip ${a.score >= thr ? "live" : ""}">Risk score ${a.score.toFixed(2)}${a.score >= thr ? " · flagged" : ""}</span><span class="chip">Truth: ${truth}</span></div>
      <dl class="kv"><dt>Linked accounts</dt><dd>${f.size}</dd><dt>Signup spread</dt><dd>${f.size > 1 ? (f.spanMin < 120 ? f.spanMin + " min" : Math.round(f.spanMin / 1440) + " days") : "single account"}</dd><dt>Distinct cards</dt><dd>${f.cards} for ${f.size} accounts</dd><dt>Distinct devices</dt><dd>${f.devs}</dd><dt>Transactions per account</dt><dd>${f.tx}</dd><dt>Chargeback rate</dt><dd>${f.cb}%</dd></dl>`;
  }
  cv.addEventListener("click", e => {
    const r = cv.getBoundingClientRect(), s = Math.min(r.width / G.W, r.height / G.H), ox = (r.width - G.W * s) / 2, oy = (r.height - G.H * s) / 2;
    const px = (e.clientX - r.left - ox) / s, py = (e.clientY - r.top - oy) / s;
    let best = null, bd = 400; for (const a of G.acc) { const d = (a.x - px) ** 2 + (a.y - py) ** 2; if (d < bd) { bd = d; best = a; } }
    sel = best; inspect(sel); draw();
  });
  $("#fr-thr").addEventListener("input", e => { thr = +e.target.value; score(); draw(); if (sel) inspect(sel); });
  function init(s) {
    G = generate(s); sel = null; inspect(null); score();
    cancelAnimationFrame(raf); let n = 0;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { for (let i = 0; i < 260; i++) step(G); draw(); return; }
    (function loop() { step(G); draw(); if (++n < 260) raf = requestAnimationFrame(loop); })();
  }
  $("#fr-new").addEventListener("click", () => init(Math.floor(Math.random() * 1e6) + 1));
  addEventListener("resize", () => draw());
  init(3);
})();
