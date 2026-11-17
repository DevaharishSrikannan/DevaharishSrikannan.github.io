/* Clinical text de-identifier: a rule and dictionary pipeline that finds identifiers in free text,
   masks or replaces them, and scores itself against hand-labelled sample notes. All notes are fictional. */
(() => {
  const root = document.getElementById("deid-lab"); if (!root) return;
  const $ = s => root.querySelector(s);
  const NOTES = [
    { name: "ED discharge note", text: "Patient Aoife Brennan (DOB 14/03/1987, MRN 4471093) attended St Brigid's General Hospital on 2 March 2026 with right lower quadrant pain. Seen by Dr. Ciaran Walsh. PPSN 1234567TA. Lives at 12 Oak Lane, Galway H91 X2Y4. Contact 087 123 4567 or aoife.b@example.com. Follow up with GP Dr. Niamh Kelly in 2 weeks.",
      gold: [["Aoife Brennan", "NAME"], ["14/03/1987", "DATE"], ["4471093", "ID"], ["St Brigid's General Hospital", "ORG"], ["2 March 2026", "DATE"], ["Ciaran Walsh", "NAME"], ["1234567TA", "ID"], ["12 Oak Lane", "ADDRESS"], ["H91 X2Y4", "ADDRESS"], ["087 123 4567", "PHONE"], ["aoife.b@example.com", "EMAIL"], ["Niamh Kelly", "NAME"]] },
    { name: "Referral letter", text: "Dear Prof. Eamon Doyle, I am referring Mr. Liam O'Connor, aged 64, MRN 5520418, seen in clinic on 11/10/2026. Echo at Mercy University Hospital showed EF 35%. His daughter Siobhan can be reached on +353 86 555 0199. Address: 4 Harbour View, Cork T12 K8W2. Kind regards, Dr. Fiona Ryan.",
      gold: [["Eamon Doyle", "NAME"], ["Liam O'Connor", "NAME"], ["5520418", "ID"], ["11/10/2026", "DATE"], ["Mercy University Hospital", "ORG"], ["Siobhan", "NAME"], ["+353 86 555 0199", "PHONE"], ["4 Harbour View", "ADDRESS"], ["T12 K8W2", "ADDRESS"], ["Fiona Ryan", "NAME"]] },
    { name: "Nursing handover", text: "Bed 7: Ms. Grace Murphy, 82, admitted 30 Oct 2026 via ED. Falls risk. Son Declan visiting, phone (01) 555 2093. Bed 9: Mr. Tomasz Nowak, MRN 6612055, post-op day 2, pain controlled. Nurse Sarah Byrne on until 20:00.",
      gold: [["Grace Murphy", "NAME"], ["30 Oct 2026", "DATE"], ["Declan", "NAME"], ["(01) 555 2093", "PHONE"], ["Tomasz Nowak", "NAME"], ["6612055", "ID"], ["Sarah Byrne", "NAME"]] },
    { name: "Tricky cases (where rules fail)", text: "Chidi Okafor rang about his mother's results from the fifth of May. Kowalczyk family asked for the ward number. Spoke with Ahmed in pharmacy. Ref 77-3392-A on the old system.",
      gold: [["Chidi Okafor", "NAME"], ["fifth of May", "DATE"], ["Kowalczyk", "NAME"], ["Ahmed", "NAME"], ["77-3392-A", "ID"]] }];
  const FIRST = ["Aoife", "Siobhan", "Declan", "Niamh", "Ciaran", "Liam", "Grace", "Sarah", "Fiona", "Eamon", "Sean", "Mary", "John", "Patrick", "Aisling", "Conor", "Ciara", "Emma", "Jack", "Cian", "Orla", "Roisin", "Tomasz", "Anna", "Michael", "Sinead", "Darragh", "Eoin", "Saoirse", "Maeve"];
  const MON = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
  const CAP = "[A-Z][a-zA-Z'’-]+";
  const RULES = [
    ["EMAIL", /[\w.+-]+@[\w-]+\.[\w.]+/g],
    ["PHONE", /(?:\+353\s?\d{1,2}|\(0\d{1,2}\)|\b08\d)\s?\d{3}\s?\d{3,4}\b/g],
    ["ID", /\b\d{7}[A-W][A-IW]?\b/g],                                        // PPSN format
    ["ID", /(?<=\bMRN[:#\s]*)\d{6,8}\b/g],
    ["ADDRESS", /\b[AC-FHKNPRTV-Y]\d{2}\s?[AC-FHKNPRTV-Y0-9]{4}\b/g],         // Eircode
    ["ADDRESS", new RegExp(`\\b\\d{1,4}\\s(?:${CAP}\\s){0,2}(?:Lane|Road|Street|St|Avenue|Ave|View|Park|Drive|Close|Court|Terrace|Square)\\b`, "g")],
    ["DATE", new RegExp(`\\b\\d{1,2}[/.-]\\d{1,2}[/.-]\\d{2,4}\\b|\\b\\d{1,2}\\s${MON}\\s\\d{4}\\b|\\b${MON}\\s\\d{1,2},?\\s\\d{4}\\b`, "g")],
    ["ORG", new RegExp(`\\b(?:St\\.?\\s)?(?:${CAP}\\s){1,3}(?:General\\s|University\\s|Regional\\s)*(?:Hospital|Clinic|Infirmary)\\b`, "g")],
    ["NAME", new RegExp(`(?<=\\b(?:Mr|Mrs|Ms|Miss|Dr|Prof|Nurse|Patient)\\.?\\s)${CAP}(?:\\s${CAP})?`, "g")],
    ["NAME", new RegExp(`\\b(?:${FIRST.join("|")})(?:\\s${CAP})?\\b`, "g")]];
  const SUR = { NAME: ["Alex Morgan", "Sam Quinn", "Jordan Lee", "Robin Hayes", "Casey Moore"], DATE: ["01/01/2000", "15 June 2001"], ID: ["0000000XX"], PHONE: ["000 000 0000"], EMAIL: ["person@example.org"], ADDRESS: ["1 Sample Street", "A00 A000"], ORG: ["General Hospital"] };
  let mode = "tag", noteIx = 0;

  function detect(text, on) {
    const spans = [];
    RULES.forEach(([cat, re]) => { if (!on[cat]) return; re.lastIndex = 0; let m; while ((m = re.exec(text))) spans.push({ s: m.index, e: m.index + m[0].length, cat, t: m[0] }); });
    spans.sort((a, b) => a.s - b.s || b.e - a.e);
    const out = []; for (const sp of spans) { const last = out[out.length - 1]; if (last && sp.s < last.e) { if (sp.e > last.e) last.e = sp.e, last.t = text.slice(last.s, last.e); continue; } out.push(sp); }
    return out;
  }
  const esc = s => s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  function render() {
    const on = {}; root.querySelectorAll("[data-cat]").forEach(c => on[c.dataset.cat] = c.checked);
    const text = $("#de-in").value, spans = detect(text, on);
    let html = "", p = 0, map = {}, k = 0;
    spans.forEach(sp => {
      html += esc(text.slice(p, sp.s));
      let rep = `[${sp.cat}]`;
      if (mode === "surrogate") { const key = sp.cat + ":" + sp.t; map[key] ||= SUR[sp.cat][k++ % SUR[sp.cat].length]; rep = map[key]; }
      html += mode === "highlight" ? `<mark class="pii pii-${sp.cat}" title="${sp.cat}">${esc(sp.t)}</mark>` : `<mark class="pii pii-${sp.cat}" title="${sp.cat}: ${esc(sp.t)}">${esc(rep)}</mark>`;
      p = sp.e;
    });
    html += esc(text.slice(p));
    $("#de-out").innerHTML = html;
    // score against gold labels when the text is an unmodified sample note
    const note = NOTES.find(n => n.text === text);
    if (note) {
      const tp = note.gold.filter(([g]) => spans.some(sp => { const i = text.indexOf(g); return i >= 0 && sp.s <= i && sp.e >= i + g.length; })).length;
      const fp = spans.filter(sp => !note.gold.some(([g]) => { const i = text.indexOf(g); return i >= 0 && sp.s < i + g.length && sp.e > i; })).length;
      $("#de-rec").textContent = Math.round(tp / note.gold.length * 100) + "%";
      $("#de-prec").textContent = spans.length ? Math.round((spans.length - fp) / spans.length * 100) + "%" : "-";
      $("#de-miss").textContent = note.gold.filter(([g]) => !spans.some(sp => { const i = text.indexOf(g); return sp.s <= i && sp.e >= i + g.length; })).map(([g, c]) => `${g} (${c})`).join(", ") || "None";
    } else { $("#de-rec").textContent = $("#de-prec").textContent = "-"; $("#de-miss").textContent = "Scores need a labelled sample note. Your own text is masked but not scored."; }
    $("#de-found").textContent = spans.length;
  }
  const sel = $("#de-note");
  NOTES.forEach((n, i) => { const o = document.createElement("option"); o.value = i; o.textContent = n.name; sel.appendChild(o); });
  sel.addEventListener("change", () => { noteIx = +sel.value; $("#de-in").value = NOTES[noteIx].text; render(); });
  $("#de-in").addEventListener("input", render);
  root.querySelectorAll("[data-cat]").forEach(c => c.addEventListener("change", render));
  root.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => { mode = b.dataset.mode; root.querySelectorAll("[data-mode]").forEach(x => x.setAttribute("aria-pressed", String(x === b))); render(); }));
  $("#de-in").value = NOTES[0].text; render();
})();
