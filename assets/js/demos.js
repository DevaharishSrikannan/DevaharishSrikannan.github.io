/* Live demos. Every number comes from the project's own results files. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const NS = "http://www.w3.org/2000/svg";
  const svg = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  /* ---------- 1. Survival risk explorer (TCGA-STAD Cox model) ---------- */
  const sv = $("#survival-demo");
  if (sv) {
    const HR_STAGE = { I: 1, II: 1.3199, III: 2.2331, IV: 5.202 };
    const MED = { I: 72.2, II: 55.4, III: 25.0, IV: 13.0 };
    const N = { I: [55, 13], II: [130, 38], III: [181, 85], IV: [44, 26] };
    const FOREST = [
      ["Stage II vs I", 1.3199, .6853, 2.5422, "stage"], ["Stage III vs I", 2.2331, 1.2085, 4.1264, "stage"], ["Stage IV vs I", 5.202, 2.5586, 10.5764, "stage"],
      ["Age, per 10 y", 1.439, 1.2144, 1.7051, "age"], ["Female vs male", 1.0456, .7476, 1.4622, "sex"],
      ["Mutation count, per doubling", .886, .8148, .9635, "mut"], ["Genome altered, per 0.1", 1.0074, .9316, 1.0894, "fga"]];
    const st = { stage: "III", age: 65, sex: "M", dbl: 0 };
    const out = { hr: $("#sv-hr"), med: $("#sv-med"), n: $("#sv-n") };
    sv.querySelectorAll("[data-stage]").forEach(b => b.addEventListener("click", () => { st.stage = b.dataset.stage; draw(); }));
    sv.querySelectorAll("[data-sex]").forEach(b => b.addEventListener("click", () => { st.sex = b.dataset.sex; draw(); }));
    $("#sv-age").addEventListener("input", e => { st.age = +e.target.value; draw(); });
    $("#sv-mut").addEventListener("input", e => { st.dbl = +e.target.value; draw(); });

    function bars() {
      const box = $("#sv-bars"); box.innerHTML = "";
      const W = Math.max(320, box.clientWidth || 560), H = 220, L = 46, B = 34, T = 14, max = 80;
      const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Median overall survival by stage, months" }, box);
      for (let v = 0; v <= max; v += 20) { const y = T + (H - T - B) * (1 - v / max); svg("line", { x1: L, x2: W - 8, y1: y, y2: y, stroke: css("--line"), "stroke-width": 1 }, s); svg("text", { x: L - 8, y: y + 4, "text-anchor": "end" }, s).textContent = v; }
      const keys = Object.keys(MED), bw = (W - L - 20) / keys.length;
      keys.forEach((k, i) => {
        const h = (H - T - B) * MED[k] / max, x = L + 10 + i * bw, y = H - B - h, on = k === st.stage;
        svg("rect", { x, y, width: bw - 22, height: h, rx: 6, fill: on ? css("--amber") : "rgba(92,225,230,.35)" }, s);
        svg("text", { x: x + (bw - 22) / 2, y: y - 6, "text-anchor": "middle", fill: on ? css("--amber") : css("--muted") }, s).textContent = MED[k].toFixed(0) + " mo";
        svg("text", { x: x + (bw - 22) / 2, y: H - 12, "text-anchor": "middle" }, s).textContent = "Stage " + k;
      });
    }
    function forest() {
      const box = $("#sv-forest"); box.innerHTML = "";
      const W = Math.max(380, box.clientWidth || 560), rowH = 28, T = 10, H = T + FOREST.length * rowH + 30, L = 200, R = W - 16;
      const lx = v => L + (Math.log(v) - Math.log(.5)) / (Math.log(12) - Math.log(.5)) * (R - L);
      const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Hazard ratios with 95% confidence intervals" }, box);
      [.5, 1, 2, 4, 8].forEach(v => { svg("line", { x1: lx(v), x2: lx(v), y1: T, y2: H - 26, stroke: v === 1 ? css("--muted") : css("--line"), "stroke-dasharray": v === 1 ? "4 4" : "" }, s); svg("text", { x: lx(v), y: H - 8, "text-anchor": "middle" }, s).textContent = v; });
      const active = { stage: st.stage !== "I" ? "Stage " + st.stage + " vs I" : "", age: st.age !== 65, sex: st.sex === "F", mut: st.dbl !== 0 };
      FOREST.forEach(([lab, hr, lo, hi, g], i) => {
        const y = T + i * rowH + rowH / 2, on = g === "stage" ? lab === active.stage : !!active[g];
        const col = on ? css("--amber") : (lo > 1 || hi < 1 ? css("--scan") : css("--muted"));
        svg("text", { x: 0, y: y + 4, fill: on ? css("--text") : css("--muted") }, s).textContent = lab;
        svg("line", { x1: lx(lo), x2: lx(Math.min(hi, 12)), y1: y, y2: y, stroke: col, "stroke-width": 2 }, s);
        svg("rect", { x: lx(hr) - 5, y: y - 5, width: 10, height: 10, fill: col }, s);
      });
    }
    function draw() {
      sv.querySelectorAll("[data-stage]").forEach(b => b.setAttribute("aria-pressed", b.dataset.stage === st.stage));
      sv.querySelectorAll("[data-sex]").forEach(b => b.setAttribute("aria-pressed", b.dataset.sex === st.sex));
      $("#sv-age-o").textContent = st.age + " y";
      $("#sv-mut-o").textContent = (2 ** st.dbl).toFixed(st.dbl < 0 ? 2 : 0) + "x reference";
      const hr = HR_STAGE[st.stage] * 1.439 ** ((st.age - 65) / 10) * (st.sex === "F" ? 1.0456 : 1) * .886 ** st.dbl;
      out.hr.textContent = hr.toFixed(2) + "x"; out.hr.style.color = hr > 3 ? css("--rose") : hr > 1.5 ? css("--amber") : css("--mint");
      out.med.textContent = MED[st.stage].toFixed(0) + " months";
      out.n.textContent = N[st.stage][0] + " patients, " + N[st.stage][1] + " deaths";
      bars(); forest();
    }
    draw(); addEventListener("resize", () => { clearTimeout(sv._t); sv._t = setTimeout(draw, 150); });
  }

  /* ---------- 2. Leakage simulator (brain MRI official split) ---------- */
  const lk = $("#leak-demo");
  if (lk) {
    const TOTAL = 394, CLEAN_ACC = .40, LEAK_ACC = (Math.round(.7893 * TOTAL) - Math.round(.40 * 135)) / (TOTAL - 135); // 257 / 259
    const grid = $("#lk-grid"), range = $("#lk-p");
    for (let i = 0; i < TOTAL; i++) grid.appendChild(document.createElement("i"));
    function chart(p) {
      const box = $("#lk-chart"); box.innerHTML = "";
      const W = Math.max(320, box.clientWidth || 560), H = 260, L = 44, B = 34, T = 12, R = W - 14;
      const x = v => L + v * (R - L), y = v => T + (1 - v) * (H - T - B);
      const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Reported accuracy against share of leaked test images" }, box);
      [0, .25, .5, .75, 1].forEach(v => { svg("line", { x1: L, x2: R, y1: y(v), y2: y(v), stroke: css("--line") }, s); svg("text", { x: L - 8, y: y(v) + 4, "text-anchor": "end" }, s).textContent = v * 100 + "%"; });
      [0, .25, .5, .75, 1].forEach(v => { svg("text", { x: x(v), y: H - 10, "text-anchor": "middle" }, s).textContent = v * 100 + "%"; });
      const ref = (v, lab, col) => { svg("line", { x1: L, x2: R, y1: y(v), y2: y(v), stroke: col, "stroke-dasharray": "5 5" }, s); svg("text", { x: R, y: y(v) - 6, "text-anchor": "end", fill: col }, s).textContent = lab; };
      ref(.89, "Grouped CV 89%", css("--scan")); ref(.59, "Always predict glioma 59%", css("--muted"));
      svg("line", { x1: x(0), y1: y(CLEAN_ACC), x2: x(1), y2: y(LEAK_ACC), stroke: css("--amber"), "stroke-width": 2.5 }, s);
      const off = 259 / TOTAL; svg("circle", { cx: x(off), cy: y(.7893), r: 5, fill: css("--rose") }, s);
      svg("text", { x: x(off) - 8, y: y(.7893) + 18, "text-anchor": "end", fill: css("--rose") }, s).textContent = "Official split 79%";
      const acc = p * LEAK_ACC + (1 - p) * CLEAN_ACC;
      svg("circle", { cx: x(p), cy: y(acc), r: 7, fill: css("--amber"), stroke: css("--ink"), "stroke-width": 2 }, s);
    }
    function draw() {
      const p = +range.value / 100, k = Math.round(p * TOTAL), acc = p * LEAK_ACC + (1 - p) * CLEAN_ACC;
      grid.querySelectorAll("i").forEach((c, i) => c.className = i < k ? "leak" : "");
      $("#lk-p-o").textContent = (p * 100).toFixed(p * 100 % 1 ? 1 : 0) + "%";
      $("#lk-acc").textContent = (acc * 100).toFixed(0) + "%";
      $("#lk-leak").textContent = k; $("#lk-clean").textContent = TOTAL - k;
      chart(p);
    }
    range.addEventListener("input", draw); addEventListener("resize", () => { clearTimeout(lk._t); lk._t = setTimeout(draw, 150); });
    lk.querySelectorAll("[data-preset]").forEach(b => b.addEventListener("click", () => { range.value = b.dataset.preset; draw(); }));
    draw();
  }

  /* ---------- 3. Near-duplicate detector (the audit's own rule) ---------- */
  const dd = $("#dup-demo");
  if (dd) {
    const vecs = [null, null];
    const thr = $("#dd-thr");
    function toVec(img, i) {
      const c = dd.querySelectorAll(".dd-prev")[i], x = c.getContext("2d");
      c.width = 32; c.height = 32; x.drawImage(img, 0, 0, 32, 32);
      const d = x.getImageData(0, 0, 32, 32).data, v = new Float32Array(1024);
      for (let j = 0; j < 1024; j++) v[j] = .299 * d[j * 4] + .587 * d[j * 4 + 1] + .114 * d[j * 4 + 2];
      for (let j = 0; j < 1024; j++) { d[j * 4] = d[j * 4 + 1] = d[j * 4 + 2] = v[j]; }
      x.putImageData(new ImageData(d, 32, 32), 0, 0);
      vecs[i] = v; c.hidden = false; dd.querySelectorAll(".dd-hint")[i].hidden = true; compare();
    }
    function corr(a, b) {
      let ma = 0, mb = 0; for (let i = 0; i < a.length; i++) { ma += a[i]; mb += b[i]; } ma /= a.length; mb /= b.length;
      let sab = 0, sa = 0, sb = 0; for (let i = 0; i < a.length; i++) { const x = a[i] - ma, y = b[i] - mb; sab += x * y; sa += x * x; sb += y * y; }
      return sa && sb ? sab / Math.sqrt(sa * sb) : 0;
    }
    function compare() {
      $("#dd-thr-o").textContent = (+thr.value).toFixed(3);
      const v = $("#dd-verdict");
      if (!vecs[0] || !vecs[1]) { v.className = "verdict"; v.textContent = "Load two images to compare them."; $("#dd-r").textContent = "-"; return; }
      const r = corr(vecs[0], vecs[1]); $("#dd-r").textContent = r.toFixed(4);
      const dup = r >= +thr.value;
      v.className = "verdict " + (dup ? "dup" : "ok");
      v.textContent = dup ? "Near-duplicate: these two would leak across a train/test split." : "Distinct: safe to place in different splits.";
    }
    dd.querySelectorAll(".drop").forEach((z, i) => {
      const inp = z.querySelector("input");
      const load = f => { if (!f || !f.type.startsWith("image/")) return; const img = new Image(); img.onload = () => toVec(img, i); img.src = URL.createObjectURL(f); };
      z.addEventListener("click", () => inp.click());
      z.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inp.click(); } });
      inp.addEventListener("change", () => load(inp.files[0]));
      z.addEventListener("dragover", e => { e.preventDefault(); z.classList.add("over"); });
      z.addEventListener("dragleave", () => z.classList.remove("over"));
      z.addEventListener("drop", e => { e.preventDefault(); z.classList.remove("over"); load(e.dataTransfer.files[0]); });
    });
    thr.addEventListener("input", compare);
    // Synthetic examples so the demo works without uploads: one "slice", a shifted copy, and a different slice.
    function synth(seed, dx, lesion, gain = 1) {
      const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d");
      x.fillStyle = "#000"; x.fillRect(0, 0, 128, 128);
      const g = x.createRadialGradient(64 + dx, 62, 8, 64 + dx, 64, 56); g.addColorStop(0, "#bbb"); g.addColorStop(.7, "#666"); g.addColorStop(1, "#111");
      x.fillStyle = g; x.beginPath(); x.ellipse(64 + dx, 64, 46, 54, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = "#222"; x.fillRect(63 + dx, 16, 2, 96);
      let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(255,255,255,${r() * .25})`; x.fillRect(20 + r() * 88 + dx, 14 + r() * 100, 2, 2); }
      if (lesion) { x.fillStyle = "#eee"; x.beginPath(); x.arc(lesion[0] + dx, lesion[1], lesion[2], 0, Math.PI * 2); x.fill(); }
      if (gain !== 1) { const d = x.getImageData(0, 0, 128, 128); for (let i = 0; i < d.data.length; i += 4) for (let k = 0; k < 3; k++) d.data[i + k] = Math.min(255, d.data[i + k] * gain + 12); x.putImageData(d, 0, 0); }
      const img = new Image(); img.src = c.toDataURL(); return img;
    }
    const ex = {
      twin: [synth(11, 0, [82, 48, 9]), synth(11, 0, [82, 48, 9], .85)],
      different: [synth(11, 0, [82, 48, 9]), synth(29, 0, [44, 86, 14])]
    };
    dd.querySelectorAll("[data-ex]").forEach(b => b.addEventListener("click", () => {
      const [a, c] = ex[b.dataset.ex];
      const go = (img, i) => img.complete ? toVec(img, i) : (img.onload = () => toVec(img, i));
      go(a, 0); go(c, 1);
    }));
    compare();
  }

  /* ---------- 4. Chest X-ray classifier (runs once trained weights are published) ---------- */
  const xr = $("#xray-demo");
  if (xr) {
    const MODEL = xr.dataset.model;
    const stat = $("#xr-status"), drop = $("#xr-drop"), res = $("#xr-result");
    fetch(MODEL, { method: "HEAD" }).then(r => { if (!r.ok) throw 0; ready(); }).catch(() => { stat.hidden = false; drop.setAttribute("aria-disabled", "true"); drop.style.opacity = .5; });
    function ready() {
      stat.hidden = true; let session;
      const inp = drop.querySelector("input");
      drop.addEventListener("click", () => inp.click());
      inp.addEventListener("change", async () => {
        const f = inp.files[0]; if (!f) return;
        res.textContent = "Loading model...";
        if (!window.ort) await new Promise((ok, no) => { const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/onnxruntime-web/1.17.1/ort.min.js"; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
        session = session || await ort.InferenceSession.create(MODEL);
        const img = await new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.src = URL.createObjectURL(f); });
        const c = document.createElement("canvas"); c.width = c.height = 224; const x = c.getContext("2d"); x.drawImage(img, 0, 0, 224, 224);
        const d = x.getImageData(0, 0, 224, 224).data, t = new Float32Array(3 * 224 * 224), m = [.485, .456, .406], sd = [.229, .224, .225];
        for (let i = 0; i < 224 * 224; i++) for (let ch = 0; ch < 3; ch++) t[ch * 50176 + i] = (d[i * 4 + ch] / 255 - m[ch]) / sd[ch];
        const o = await session.run({ [session.inputNames[0]]: new ort.Tensor("float32", t, [1, 3, 224, 224]) });
        const z = o[session.outputNames[0]].data, e = Array.from(z).map(Math.exp), s = e.reduce((a, b) => a + b, 0), pn = e[e.length - 1] / s;
        res.innerHTML = `<b>${(pn * 100).toFixed(1)}%</b> probability of pneumonia <span class="muted">(research demo, not a diagnosis)</span>`;
      });
    }
  }
})();
