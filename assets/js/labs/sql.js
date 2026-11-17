/* SQL playground: real SQLite (sql.js / WebAssembly) running on the project databases in the browser. */
(() => {
  const root = document.getElementById("sql-lab"); if (!root) return;
  const $ = s => root.querySelector(s);
  const ed = $("#sql-editor"), out = $("#sql-out"), msg = $("#sql-msg"), runBtn = $("#sql-run");
  const VER = "1.10.3", CDN = `https://cdnjs.cloudflare.com/ajax/libs/sql.js/${VER}/`;
  const CH = [
    { q: "How many urban centres have no recorded hospital?", hint: "centres.has_hos is 1 or 0.",
      ref: "SELECT COUNT(*) FROM centres WHERE has_hos = 0", ordered: false },
    { q: "Share of centres with a recorded hospital, by income group, highest first (as a %, 1 decimal).", hint: "AVG of a 0/1 flag is a share. GROUP BY income.",
      ref: "SELECT income, ROUND(100.0 * AVG(has_hos), 1) AS pct FROM centres GROUP BY income ORDER BY pct DESC", ordered: true },
    { q: "Data-quality check: how many recorded hospital counts are odd numbers?", hint: "The source looks double-counted. Use CAST(hos_n AS INT) % 2.",
      ref: "SELECT COUNT(*) FROM centres WHERE hos_n IS NOT NULL AND CAST(hos_n AS INT) % 2 = 1", ordered: false },
    { q: "Window function: rank EU27 countries by health spending per person in 2023 and return the top 3 (country, spend, rank).", hint: "RANK() OVER (ORDER BY che_pc_usd DESC), and the eu27 table lists members.",
      ref: "SELECT country, ROUND(che_pc_usd), RANK() OVER (ORDER BY che_pc_usd DESC) AS r FROM panel WHERE year = 2023 AND iso3 IN (SELECT iso3 FROM eu27) ORDER BY r LIMIT 3", ordered: true },
    { q: "Ireland's out-of-pocket share in 2000 and 2023 (year, share rounded to 1 decimal).", hint: "Ireland's iso3 is IRL.",
      ref: "SELECT year, ROUND(oop_share, 1) FROM panel WHERE iso3 = 'IRL' AND year IN (2000, 2023) ORDER BY year", ordered: true }];
  const EXAMPLES = [
    ["Dublin's numbers", "SELECT centre, country, ROUND(pop) AS population, hos_per100k, pha_per100k\nFROM centres\nWHERE country = 'Ireland'\nORDER BY pop DESC;"],
    ["Biggest gaps", "-- Large cities with no recorded hospital\nSELECT centre, country, income, ROUND(pop) AS population\nFROM centres\nWHERE has_hos = 0\nORDER BY pop DESC\nLIMIT 10;"],
    ["Spending tiers", "SELECT tier, COUNT(*) AS countries, ROUND(MIN(pc_2019)) AS min_usd, ROUND(MAX(pc_2019)) AS max_usd\nFROM v_tier\nGROUP BY tier\nORDER BY tier;"],
    ["Year-on-year (LAG)", "SELECT country, year, ROUND(che_pc_usd) AS spend, ROUND(yoy_pct, 1) AS change_pct\nFROM v_yoy\nWHERE country = 'Ireland' AND year >= 2017\nORDER BY year;"]];
  let db, ch = 0;

  function table(res) {
    out.innerHTML = "";
    if (!res.length) { out.innerHTML = '<p class="muted">Query ran. No rows returned.</p>'; return; }
    const { columns, values } = res[res.length - 1];
    const t = document.createElement("table"), th = t.createTHead().insertRow();
    columns.forEach(c => { const h = document.createElement("th"); h.textContent = c; th.appendChild(h); });
    const tb = t.createTBody();
    values.slice(0, 200).forEach(r => { const tr = tb.insertRow(); r.forEach(v => { const td = tr.insertCell(); td.textContent = v === null ? "NULL" : typeof v === "number" && !Number.isInteger(v) ? v.toFixed(3) : v; if (typeof v === "number") td.className = "num"; }); });
    out.appendChild(t);
    if (values.length > 200) { const p = document.createElement("p"); p.className = "muted"; p.textContent = `Showing 200 of ${values.length} rows.`; out.appendChild(p); }
  }
  const norm = (res, ordered) => { if (!res.length) return "[]"; let rows = res[res.length - 1].values.map(r => r.map(v => typeof v === "number" ? Math.round(v * 10) / 10 : v).join("|")); if (!ordered) rows = rows.sort(); return rows.join("\n"); };

  function run() {
    if (!db) return;
    const sql = ed.value.trim(); if (!sql) return;
    const t0 = performance.now();
    try {
      const res = db.exec(sql); table(res);
      const ms = (performance.now() - t0).toFixed(1);
      const c = CH[ch];
      const ok = norm(res, c.ordered) === norm(db.exec(c.ref), c.ordered);
      msg.className = "verdict " + (ok ? "ok" : "");
      msg.textContent = ok ? `Correct. Challenge ${ch + 1} solved in ${ms} ms.` : `Ran in ${ms} ms. ${res.length ? "Not the expected answer for this challenge yet." : ""}`;
      if (ok) { root.querySelectorAll("[data-ch]")[ch].classList.add("done"); }
    } catch (e) { msg.className = "verdict dup"; msg.textContent = "SQL error: " + e.message; out.innerHTML = ""; }
  }
  function setCh(i) {
    ch = i;
    root.querySelectorAll("[data-ch]").forEach((b, j) => b.setAttribute("aria-pressed", String(j === i)));
    $("#sql-q").textContent = CH[i].q; $("#sql-hint").textContent = "Hint: " + CH[i].hint; $("#sql-hint").hidden = true;
  }
  $("#sql-show-hint").addEventListener("click", () => { $("#sql-hint").hidden = false; });
  $("#sql-answer").addEventListener("click", () => { ed.value = CH[ch].ref + ";"; run(); });
  root.querySelectorAll("[data-ch]").forEach((b, i) => b.addEventListener("click", () => setCh(i)));
  const exBox = $("#sql-examples");
  EXAMPLES.forEach(([n, q]) => { const b = document.createElement("button"); b.className = "btn"; b.textContent = n; b.addEventListener("click", () => { ed.value = q; run(); }); exBox.appendChild(b); });
  runBtn.addEventListener("click", run);
  ed.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); run(); } });
  setCh(0);

  msg.textContent = "Loading SQLite in your browser...";
  const s = document.createElement("script"); s.src = CDN + "sql-wasm.js";
  s.onload = async () => {
    try {
      const SQL = await initSqlJs({ locateFile: f => CDN + f });
      const buf = await fetch(root.dataset.db).then(r => { if (!r.ok) throw new Error("database file not found"); return r.arrayBuffer(); });
      db = new SQL.Database(new Uint8Array(buf));
      msg.className = "verdict ok"; msg.textContent = "Database loaded: 11,413 urban centres and 4,588 country-years. Press Run or Ctrl+Enter.";
      runBtn.disabled = false; ed.value = EXAMPLES[0][1]; run(); msg.className = "verdict"; msg.textContent = "Ready. Try the challenges on the left, or write your own query.";
    } catch (e) { msg.className = "verdict dup"; msg.textContent = "Could not start SQLite here (" + e.message + "). It runs on the live site."; }
  };
  s.onerror = () => { msg.className = "verdict dup"; msg.textContent = "Could not load the SQLite engine. It runs on the live site."; };
  document.head.appendChild(s);
})();
