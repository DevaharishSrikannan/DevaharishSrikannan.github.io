document.documentElement.classList.add("js");
const GH = "https://github.com/DevaharishSrikannan/";

/* ---------- At a glance ---------- */
const glance = {
  degrees: [
    { t: "MSc Artificial Intelligence for Medicine and Medical Research", w: "09/2024 – 08/2025", o: "University College Dublin · Second Class Honours, Grade 1 (2H1)" },
    { t: "BTech Computer Science and Medical Engineering", w: "08/2020 – 06/2024", o: "Sri Ramachandra Institute of Higher Education and Research, Chennai · First Class (A)" }
  ],
  research: [
    { t: "Data Scientist (Specified Purpose Role)", w: "05/2025 – 06/2025", o: "SPHERE Research Group, School of Biomolecular and Biomedical Science, University College Dublin" },
    { t: "Project Intern, Coordinator", w: "02/2024 – 06/2024", o: "Centre for Toxicology and Development Research, Sri Ramachandra Institute, Chennai" },
    { t: "Research Intern (DST SERB)", w: "06/2023 – 07/2023", o: "Jawaharlal Institute of Postgraduate Medical Education and Research (JIPMER), Puducherry" },
    { t: "Research Intern, Image Analysis (LEAP Lab)", w: "11/2022 – 02/2023", o: "Indian Institute of Information Technology, Design and Manufacturing, Chennai" }
  ],
  corporate: [
    { t: "Trust and Safety Associate", w: "03/2026 – present", o: "Accenture UK & Ireland, Dublin · 100% quality accuracy since July 2026 on high-volume, complex case reviews; Excellence Award and Team Rockstar Award" }
  ],
  pubs: [
    { t: "Injectable Hydrogels for Biomedical Applications: A Review of the Current Clinical Landscape", w: "2026", o: "Biomedical Technologies (FBT), Vol 13 No 3" },
    { t: "Integrated Diagnosis, Treatment and Prognosis in Healthcare using Artificial Intelligence", w: "2024", o: "Indian Journal for Artificial Intelligence and Neural Networking" },
    { t: "Detecting Pneumonia using Artificial Intelligence: A View", w: "2023", o: "Book chapter, Annamalai University IQAC" },
    { t: "Artificial Intelligence in Healthcare Systems: An Overview", w: "2022", o: "Dogo Rangsang Research Journal" }
  ],
  awards: [
    { t: "Excellence Award", w: "10/2026", o: "Accenture Operations Town Hall, Accenture UK & Ireland, for outstanding performance in client operations", b: "Industry" },
    { t: "Team Rockstar Award", w: "06/2026", o: "Accenture Operations, Accenture UK & Ireland", b: "Industry" },
    { t: "UCD Advantage Award 2025", w: "02/2025", o: "University College Dublin, Careers Network", b: "University" },
    { t: "Young Researcher Award", w: "04/2024", o: "Global Iconic Education Award, ESN Publication", b: "Research" }
  ],
  certs: [
    { t: "OpenAI Academy: Agents and Workflows", w: "2026", o: "OpenAI Academy" },
    { t: "OpenAI Academy: Applied AI Foundations", w: "2026", o: "OpenAI Academy" },
    { t: "Applied Data Science Capstone", w: "", o: "IBM, Coursera" },
    { t: "AWS Cloud Technical Essentials", w: "", o: "Coursera" },
    { t: "Data Analyst Certification", w: "", o: "Oneroadmap" },
    { t: "Real-Time Applications of Machine Learning in Health Sciences", w: "", o: "SRM University" },
    { t: "Artificial Intelligence for IoT Services in Cloud: Techniques and Application", w: "", o: "National Institute of Technology, Jalandhar" }
  ]
};
const panel = document.getElementById("panel");
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
function showGlance(k) {
  document.querySelectorAll(".tile").forEach(t => t.setAttribute("aria-selected", t.dataset.k === k ? "true" : "false"));
  panel.innerHTML = "";
  const ul = el("ul");
  glance[k].forEach(i => {
    const li = el("li");
    const b = el("b", null, i.t);
    if (i.b) b.appendChild(el("span", "badge", i.b));
    li.append(b, el("span", "when", i.w), el("span", "where", i.o));
    ul.appendChild(li);
  });
  panel.appendChild(ul);
  panel.classList.remove("fade"); void panel.offsetWidth; panel.classList.add("fade");
}
document.querySelectorAll(".tile").forEach(t => t.addEventListener("click", () => showGlance(t.dataset.k)));
showGlance("degrees");

/* ---------- Journey ---------- */
const journey = [
  { t: "Trust and Safety Associate", o: "Accenture UK & Ireland, Dublin", w: "03/2026 – present", k: "industry", n: "Review high-volume, complex cases against defined accuracy, safety and policy standards; spot anomalies and recurring risk patterns and escalate them with clear documentation. Hands-on experience of human-in-the-loop decisions and AI output quality evaluation." },
  { t: "MSc Artificial Intelligence for Medicine and Medical Research", o: "University College Dublin · 2H1", w: "09/2024 – 08/2025", k: "education", n: "Machine learning, deep learning, medical imaging, statistics and AI applied to clinical and biomedical data." },
  { t: "Data Scientist (Specified Purpose Role)", o: "SPHERE Research Group, UCD", w: "05/2025 – 06/2025", k: "research", n: "Analysed and preprocessed healthcare research datasets in Python and SQL; data validation, exploratory analysis and feature engineering; reported findings through visualisations and technical documentation." },
  { t: "EDI Student Ambassador and School of Medicine Representative", o: "UCD School of Medicine · UCD One Health Society", w: "09/2024 – 08/2025", k: "leadership" },
  { t: "Project Intern, Coordinator", o: "Centre for Toxicology and Development Research, Sri Ramachandra Institute", w: "02/2024 – 06/2024", k: "research", n: "Coordinated data collection, analysis and documentation across research workflows and reported findings to stakeholders." },
  { t: "BTech Computer Science and Medical Engineering", o: "Sri Ramachandra Institute of Higher Education and Research · First Class", w: "08/2020 – 06/2024", k: "education" },
  { t: "Cultural Secretary", o: "SRET, Sri Ramachandra Institute of Higher Education and Research, Chennai", w: "08/2023 – 04/2024", k: "leadership" },
  { t: "Chairperson, The Literary Club", o: "Sri Ramachandra Engineering and Technology, Chennai", w: "02/2023 – 04/2024", k: "leadership" },
  { t: "Research Intern (DST SERB)", o: "JIPMER, Puducherry", w: "06/2023 – 07/2023", k: "research", n: "Prepared and analysed biomedical research data using computational and statistical approaches." },
  { t: "Research Intern, Image Analysis (LEAP Lab)", o: "IIITDM, Chennai", w: "11/2022 – 02/2023", k: "research", n: "Image processing and machine learning on biomedical imaging data, with documented methods, results and limitations." },
  { t: "Vice President and President (In-Charge), The Agal Tamil Mandram", o: "Sri Ramachandra Institute of Higher Education and Research, Chennai", w: "09/2022 – 10/2023", k: "leadership" }
];
const startOf = w => { const m = w.match(/(?:(\d{2})\/)?(\d{4})/); return m ? +m[2] * 12 + (m[1] ? +m[1] : 1) : 0; };
journey.sort((a, b) => startOf(b.w) - startOf(a.w));
const kindLabel = { industry: "Industry", research: "Research", education: "Education", leadership: "Leadership" };
const tl = document.getElementById("timeline");
function renderJourney(f) {
  tl.innerHTML = "";
  journey.filter(j => f === "all" || j.k === f).forEach(j => {
    const li = el("li"); li.dataset.t = j.k;
    const top = el("span", "when", j.w); top.appendChild(el("span", "kind", kindLabel[j.k]));
    li.append(top, el("h3", null, j.t), el("span", "org", j.o));
    if (j.n) li.appendChild(el("p", "note", j.n));
    tl.appendChild(li);
  });
}
document.querySelectorAll("[data-j]").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll("[data-j]").forEach(x => x.classList.toggle("on", x === b));
  renderJourney(b.dataset.j);
}));
renderJourney("all");

/* ---------- Projects ---------- */
const projects = [
  { title: "Who Pays for Health Care? Financing in 195 Countries", cat: ["analysis"],
    desc: "SQL pipeline over WHO health expenditure, World Bank population and life expectancy data from 2000 to 2023, with bootstrap intervals, financing-profile clustering and an Ireland versus EU27 comparison.",
    result: "Out-of-pocket share falls as compulsory financing rises (Spearman rho -0.84 across 191 countries). Spending per person was a median 10.5% higher in 2021 than 2019 (95% CI 7.6 to 13.0).",
    tags: ["Python", "SQL", "pandas", "SciPy", "scikit-learn"], link: GH + "global-health-financing", demo: "health-financing/" },
  { title: "Hospital and Pharmacy Access in 11,000 Urban Centres", cat: ["analysis"],
    desc: "Recorded hospitals and pharmacies per person across World Bank income groups, using Kruskal-Wallis with effect sizes, logistic regression with bootstrap intervals and Gini curves. Missing records are treated as a data-quality question, not as zeros.",
    result: "A hospital is recorded in 88% of high-income centres but 36% of low-income ones (adjusted odds ratio 14.9). Hospital and pharmacy rates are only loosely related (rho 0.33).",
    tags: ["Python", "SQL", "SciPy", "scikit-learn", "JavaScript"], link: GH + "urban-health-access", demo: "urban-health-access/" },
  { title: "Brain Tumour MRI Classification and Dataset Audit", cat: ["imaging", "ml"],
    desc: "Gabor, LBP, HOG and wavelet features with SVM, Random Forest and Logistic Regression on 3,264 brain MRIs, plus an audit of the public train/test split.",
    result: "89% grouped cross-validated accuracy, but only 40% on test images with no near-duplicate in training: 66% of the official test set has a twin in the training set.",
    tags: ["Python", "scikit-learn", "scikit-image", "OpenCV"], link: GH + "brain-tumor-mri-classification" },
  { title: "Stomach Adenocarcinoma: Survival and Recurrence", cat: ["analysis", "ml"],
    desc: "Patient-level analysis of the TCGA-STAD cohort: Kaplan-Meier, a multivariable Cox model and cross-validated recurrence prediction, with survival routines written from scratch and checked on simulated data.",
    result: "Stage IV hazard ratio 5.2; higher tumour mutation count associated with longer survival (HR 0.89 per doubling); recurrence was not predictable from the available features (AUC about 0.5).",
    tags: ["Python", "Survival analysis", "Cox regression", "TCGA"], link: GH + "stomach-adenocarcinoma-survival" },
  { title: "Gene Expression in ERBB2-Amplified Breast Cancer", cat: ["analysis"],
    desc: "Differential expression, pathway enrichment and survival analysis of ERBB2-amplified versus non-amplified breast tumours, using TCGA RNA-seq, copy-number and clinical data.",
    tags: ["R", "DESeq2", "clusterProfiler", "glmnet", "survminer"], link: GH + "Gene-Expression-Analysis-and-Interpretation" },
  { title: "Teeth Structure Segmentation in Dental X-rays", cat: ["imaging", "ml"],
    desc: "U-Net with image augmentation for segmenting teeth structures in radiological images, deployed in a Streamlit app for real-time upload and segmentation.",
    result: "F1 score of about 0.86 on held-out images.", tags: ["Python", "U-Net", "Deep learning", "Streamlit"] },
  { title: "Audio Genre Classification", cat: ["ml"],
    desc: "End-to-end pipeline covering signal preprocessing, feature extraction, model training and comparison of deep learning and ensemble models.",
    result: "Achieved an 85% module distinction.", tags: ["Python", "TensorFlow", "scikit-learn"] }
];
const catLabel = { analysis: "Health data", imaging: "Medical imaging", ml: "Machine learning" };
const grid = document.getElementById("grid");
function renderProjects(f) {
  grid.innerHTML = "";
  projects.filter(p => f === "all" || p.cat.includes(f)).forEach(p => {
    const c = el("article", "card");
    c.append(el("span", "cat", p.cat.map(x => catLabel[x]).join(" · ")), el("h3", null, p.title), el("p", null, p.desc));
    if (p.result) { const d = el("details"); d.append(el("summary", null, "What I found"), el("p", null, p.result)); c.appendChild(d); }
    const tg = el("div", "tags"); p.tags.forEach(t => tg.appendChild(el("span", null, t))); c.appendChild(tg);
    if (p.link || p.demo) {
      const l = el("div", "links");
      if (p.link) { const a = el("a", null, "Code and write-up"); a.href = p.link; a.target = "_blank"; a.rel = "noopener"; l.appendChild(a); }
      if (p.demo) { const a = el("a", null, "Interactive dashboard"); a.href = p.demo; l.appendChild(a); }
      c.appendChild(l);
    }
    grid.appendChild(c);
  });
}
document.querySelectorAll("[data-f]").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll("[data-f]").forEach(x => x.classList.toggle("on", x === b));
  renderProjects(b.dataset.f);
}));
renderProjects("all");

/* ---------- Toolkit ---------- */
const skills = {
  "Statistics and research methods": ["Hypothesis testing", "Regression", "Survival analysis", "Bootstrap intervals", "Effect sizes", "Experimental design", "Literature review"],
  "Machine learning and deep learning": ["Supervised and unsupervised learning", "CNNs", "U-Net", "Transfer learning", "Ensembles", "Cross-validation", "Leakage checks"],
  "Generative AI": ["RAG", "Embeddings", "Semantic search", "Agentic workflows", "Hugging Face", "LangChain", "LLM output evaluation"],
  "Programming and data": ["Python", "pandas", "NumPy", "scikit-learn", "TensorFlow", "PyTorch", "R", "SQL", "ETL", "Git"],
  "Visualisation and reporting": ["Matplotlib", "Seaborn", "Power BI", "DAX", "Tableau", "Excel", "Interactive HTML dashboards"],
  "Working style": ["Clear technical writing", "Presenting findings", "Accuracy under time pressure", "Independent and team work"]
};
const sg = document.getElementById("skillGrid");
Object.entries(skills).forEach(([k, v]) => {
  const d = el("div"); const t = el("div", "tags");
  v.forEach(x => t.appendChild(el("span", null, x)));
  d.append(el("h3", null, k), t); sg.appendChild(d);
});

/* ---------- Hero curve: an illustrative Kaplan-Meier style plot ---------- */
(function () {
  const c = document.getElementById("curve"); if (!c) return;
  const ctx = c.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = 520, H = 360; c.width = W * dpr; c.height = H * dpr; ctx.scale(dpr, dpr);
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  // two fixed illustrative groups (not real data)
  const g1 = [[0,1],[4,.96],[9,.9],[14,.85],[20,.79],[27,.74],[33,.7],[41,.67],[50,.64],[60,.62]];
  const g2 = [[0,1],[3,.9],[6,.78],[10,.65],[15,.52],[21,.42],[28,.35],[36,.3],[46,.27],[60,.25]];
  const pad = { l: 46, r: 16, t: 18, b: 40 };
  const x = t => pad.l + (t / 60) * (W - pad.l - pad.r);
  const y = s => pad.t + (1 - s) * (H - pad.t - pad.b);
  function steps(g, upto) {
    const pts = [];
    for (let i = 0; i < g.length; i++) {
      const [t, s] = g[i]; if (t > upto) { pts.push([upto, g[i - 1][1]]); break; }
      if (i) pts.push([t, g[i - 1][1]]); pts.push([t, s]);
      if (i === g.length - 1) pts.push([Math.min(upto, 60), s]);
    }
    return pts;
  }
  function draw(p) {
    const ink = css("--ink"), muted = css("--muted"), line = css("--line"), a = css("--accent"), w = css("--warm");
    ctx.clearRect(0, 0, W, H);
    ctx.font = "11px JetBrains Mono, monospace"; ctx.fillStyle = muted; ctx.strokeStyle = line; ctx.lineWidth = 1;
    [0, .25, .5, .75, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(pad.l, y(s)); ctx.lineTo(W - pad.r, y(s)); ctx.stroke(); ctx.fillText(s.toFixed(2), 8, y(s) + 4); });
    [0, 12, 24, 36, 48, 60].forEach(t => ctx.fillText(String(t), x(t) - 6, H - pad.b + 18));
    ctx.fillText("months", W - pad.r - 44, H - 6);
    [[g1, a, "Stage I–II"], [g2, w, "Stage III–IV"]].forEach(([g, col, lab], i) => {
      const pts = steps(g, 60 * p); if (pts.length < 2) return;
      ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x(pts[0][0]), y(pts[0][1]));
      pts.forEach(([t, s]) => ctx.lineTo(x(t), y(s))); ctx.stroke();
      ctx.fillStyle = col; ctx.font = "12px Bricolage Grotesque, sans-serif";
      const ly = y(0.16) + i * 20;
      ctx.fillRect(pad.l + 14, ly - 4, 16, 3); ctx.fillStyle = ink; ctx.fillText(lab, pad.l + 38, ly);
    });
  }
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { draw(1); } else {
    let start = null;
    const tick = ts => { if (!start) start = ts; const p = Math.min(1, (ts - start) / 1800); draw(p); if (p < 1) requestAnimationFrame(tick); };
    draw(0.02); requestAnimationFrame(tick);
  }
  new MutationObserver(() => draw(1)).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => draw(1));
})();

/* ---------- Active nav link ---------- */
const navLinks = [...document.querySelectorAll(".nav nav a")];
if ("IntersectionObserver" in window) {
  const nio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle("here", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach(s => nio.observe(s));
}

/* ---------- Copy email, theme, year ---------- */
document.getElementById("copy").addEventListener("click", e => {
  const b = e.currentTarget, addr = "devaharishsrikannan@gmail.com";
  const done = () => { b.textContent = "Copied"; setTimeout(() => (b.textContent = "Copy email"), 1600); };
  if (navigator.clipboard) navigator.clipboard.writeText(addr).then(done).catch(() => (b.textContent = addr)); else b.textContent = addr;
});
const root = document.documentElement;
try { const s = localStorage.getItem("theme"); if (s) root.dataset.theme = s; } catch (e) {}
document.getElementById("theme").addEventListener("click", () => {
  const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = dark ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
});
document.getElementById("yr").textContent = new Date().getFullYear();
