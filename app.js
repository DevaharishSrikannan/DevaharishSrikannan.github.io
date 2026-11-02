// Project data. "link" is set only for projects whose code is on GitHub.
const GH = "https://github.com/DevaharishSrikannan/";
const projects = [
  {
    title: "Brain Tumour MRI Classification and Dataset Audit",
    cat: ["imaging", "ml"],
    desc: "Classical feature pipeline (Gabor, LBP, HOG, wavelet energy) with SVM, Random Forest and Logistic Regression on 3,264 brain MRIs, plus an audit of the public train/test split.",
    result: "89% grouped cross-validated accuracy, but only 40% on test images with no near-duplicate in training (majority baseline 59%): 66% of the official test set has a twin in the training set.",
    tags: ["Python", "scikit-learn", "scikit-image", "OpenCV"],
    status: "Complete. CNN comparison planned.",
    link: GH + "brain-tumor-mri-classification"
  },
  {
    title: "Stomach Adenocarcinoma: Survival and Recurrence",
    cat: ["analysis", "ml"],
    desc: "Patient-level analysis of the TCGA-STAD cohort: Kaplan-Meier, multivariable Cox model and cross-validated recurrence prediction. Survival routines written from scratch and verified on simulated data.",
    result: "Stage IV hazard ratio 5.2; higher tumour mutation count associated with longer survival (HR 0.89 per doubling); recurrence was not predictable from clinical and genomic summaries (AUC about 0.5).",
    tags: ["Python", "Survival analysis", "Cox regression", "TCGA"],
    status: "Complete. Gene-level layers planned.",
    link: GH + "stomach-adenocarcinoma-survival"
  },
  {
    title: "Gene Expression Analysis in ERBB2-Amplified Breast Cancer",
    cat: ["analysis"],
    desc: "Differential expression, pathway enrichment and survival analysis of ERBB2-amplified versus non-amplified breast tumours, using TCGA RNA-seq, copy-number and clinical data. Written in R.",
    tags: ["R", "DESeq2", "clusterProfiler", "glmnet", "survminer"],
    status: "Complete",
    link: GH + "Gene-Expression-Analysis-and-Interpretation"
  },
  {
    title: "Audio Genre Classification",
    cat: "ml",
    desc: "End-to-end pipeline covering signal preprocessing, feature extraction, model training and comparison of deep learning and ensemble models.",
    tags: ["Python", "TensorFlow", "Scikit-learn"],
    status: "MSc project"
  }
];

const skills = {
  "Machine learning & deep learning": ["Supervised & unsupervised learning","CNNs","Transfer learning","Ensemble methods","Image classification & segmentation","Model evaluation"],
  "Generative AI & NLP": ["RAG","Embeddings","Semantic search","Agentic AI workflows","Hugging Face","LangChain","LLM output evaluation"],
  "Programming & data": ["Python","Pandas","NumPy","Scikit-learn","TensorFlow","PyTorch","SQL","ETL pipelines","API integration","Data validation"],
  "Analytics & visualisation": ["Statistical analysis","Survival analysis","EDA","Predictive modelling","Matplotlib","Seaborn","Power BI","DAX","Tableau","Advanced Excel"],
  "Data platforms": ["Data warehousing (academic)","Data lakes (academic)","AWS fundamentals"],
  "Professional": ["Technical reporting","Presenting findings","Independent & team work","Learning new tools quickly"]
};

const grid = document.getElementById("grid");
function renderProjects(f) {
  grid.innerHTML = "";
  projects.filter(p => f === "all" || [].concat(p.cat).includes(f)).forEach(p => {
    const el = document.createElement("article");
    el.className = "card";
    const h = document.createElement("h3"); h.textContent = p.title; el.appendChild(h);
    const d = document.createElement("p"); d.textContent = p.desc; el.appendChild(d);
    if (p.result) { const r = document.createElement("p"); r.className = "result"; r.textContent = p.result; el.appendChild(r); }
    const tg = document.createElement("div"); tg.className = "tags";
    p.tags.forEach(t => { const s = document.createElement("span"); s.textContent = t; tg.appendChild(s); });
    el.appendChild(tg);
    const st = document.createElement("span"); st.className = "status"; st.textContent = p.status; el.appendChild(st);
    if (p.link) { const a = document.createElement("a"); a.className = "code"; a.href = p.link; a.textContent = "View code and write-up on GitHub"; a.target = "_blank"; a.rel = "noopener"; el.appendChild(a); }
    grid.appendChild(el);
  });
}
document.querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".chip").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  renderProjects(b.dataset.f);
}));
renderProjects("all");

const sg = document.getElementById("skillGrid");
Object.entries(skills).forEach(([k, v]) => {
  const d = document.createElement("div");
  const h = document.createElement("h3"); h.textContent = k;
  const t = document.createElement("div"); t.className = "tags";
  v.forEach(x => { const s = document.createElement("span"); s.textContent = x; t.appendChild(s); });
  d.append(h, t); sg.appendChild(d);
});

const root = document.documentElement;
try { const s = localStorage.getItem("theme"); if (s) root.dataset.theme = s; } catch (e) {}
document.getElementById("theme").addEventListener("click", () => {
  const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = dark ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
});
document.getElementById("yr").textContent = new Date().getFullYear();
