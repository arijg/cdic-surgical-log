/* ============================================================
   Surgical Log — Ceramic Dental Implant Centre
   Vanilla JS. No build step, no network, no data leaves the page.
   ============================================================ */
(() => {
  "use strict";

  /* ---------- Option configuration ---------- */
  const GROUPS = {
    consent: {
      mode: "toggle",
      options: [{ value: "consent", label: "Verbal & written informed consent obtained" }],
      default: true,
    },
    smoking: {
      mode: "single",
      options: ["Smoking cessation discussed", "Not applicable"],
      default: "Smoking cessation discussed",
    },
    premed: {
      mode: "multi",
      options: ["Amoxil 500mg (1g)", "Amoxil 500mg (2g)", "Cleocin 300mg", "Motrin 600mg", "Tylenol 500mg", "None given", "Other"],
      default: ["Amoxil 500mg (1g)", "Motrin 600mg"],
    },
    lido:  { mode: "single", options: ["1 carpule", "2 carpules", "3 carpules", "Not used"], default: "2 carpules" },
    carbo: { mode: "single", options: ["1 carpule", "2 carpules", "3 carpules", "Not used"], default: "Not used" },
    load:  { mode: "single", options: ["Loaded", "Non-loaded"], default: null },
    prosth: {
      mode: "single",
      options: ["Immediate load — provisional cemented with temporary cement", "Removable partial denture", "Complete denture", "Not applicable"],
      default: null,
    },
    bonegraft: { mode: "single", options: ["Yes", "No"], default: "No" },
    graftMaterial: { mode: "multi", options: ["Allograft", "Alloplast", "Resorbable Membrane"], default: ["Alloplast"] },
    graftProcedures: { mode: "multi", options: ["PRF/PRP", "Internal Sinus Lift UR", "Internal Sinus Lift UL", "Ozone Therapy"], default: [] },
    postop: {
      mode: "multi",
      options: ["Post-op instructions reviewed with patient", "In written and oral form", "Emergency contact information given", "Soft diet instructions given"],
      default: ["Post-op instructions reviewed with patient", "In written and oral form", "Emergency contact information given", "Soft diet instructions given"],
    },
    rx: {
      mode: "multi",
      options: ["Amoxicillin 500mg — 21 caps, 1 TID, one refill", "Cleocin 150mg — 21 caps, 1 TID", "Tylenol #3 — 20 tabs, 1 q6h for pain", "Vicodin ES — 20 tabs, 1 q6h PRN pain"],
      default: ["Amoxicillin 500mg — 21 caps, 1 TID, one refill"],
    },
    analgesic: {
      mode: "single",
      options: ["Motrin 600mg — 1 QID for pain", "Motrin 800mg — 1 QID for pain", "Tylenol 500mg — 1 QID for pain", "Not prescribed"],
      default: "Motrin 600mg — 1 QID for pain",
    },
    nextvisit: {
      mode: "toggle",
      options: [{ value: "nextvisit", label: "Scheduled for post-op exam in two weeks or as needed prior" }],
      default: true,
    },
  };

  const IMPLANT_SYSTEMS = {
    "Ceramic SDS One Piece":       { d: [3.3, 3.8, 4.6, 5.4],    l: [8, 11, 14] },
    "Internal Hex 2.5 mm":         { d: [3.3, 3.75, 4.2, 5, 6],  l: [6, 8, 10, 11, 13, 16] },
    "Syn-Oct with 4.8 mm Collar":  { d: [3.75, 4.1, 4.8],        l: [8, 10, 12, 14, 16] },
  };

  /* ---------- State ---------- */
  const sel = {};            // group selections
  const extractionTeeth = new Set();
  const implantTeeth = new Set();
  const bonegraftTeeth = new Set();
  const implantData = {};    // tooth -> { system, diameter, length }

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Selection helpers ---------- */
  function isOn(group, value) {
    const cfg = GROUPS[group];
    if (cfg.mode === "toggle") return !!sel[group];
    if (cfg.mode === "single") return sel[group] === value;
    return sel[group].has(value);
  }

  function setDefaults() {
    for (const [name, cfg] of Object.entries(GROUPS)) {
      if (cfg.mode === "toggle") sel[name] = cfg.default;
      else if (cfg.mode === "single") sel[name] = cfg.default;
      else sel[name] = new Set(cfg.default);
    }
    extractionTeeth.clear();
    implantTeeth.clear();
    bonegraftTeeth.clear();
    for (const k of Object.keys(implantData)) delete implantData[k];
  }

  function toggleChip(group, value) {
    const cfg = GROUPS[group];
    if (cfg.mode === "toggle") sel[group] = !sel[group];
    else if (cfg.mode === "single") sel[group] = sel[group] === value ? null : value;
    else sel[group].has(value) ? sel[group].delete(value) : sel[group].add(value);
    refreshGroup(group);
    sideEffects(group);
  }

  function refreshGroup(group) {
    $$(`.chips[data-group="${group}"] .chip`).forEach((chip) => {
      chip.setAttribute("aria-pressed", isOn(group, chip.dataset.value));
    });
  }

  /* ---------- Conditional UI reactions ---------- */
  function sideEffects(group) {
    if (group === "premed") {
      const show = sel.premed.has("Other");
      const row = $("#premedOtherRow");
      row.hidden = !show;
      if (!show) $("#premedOther").value = "";
    }
    if (group === "bonegraft") {
      const yes = sel.bonegraft === "Yes";
      $("#bonegraftDetails").hidden = !yes;
      if (!yes) {
        bonegraftTeeth.clear();
        updateTeethSummary("#bonegraftSummary", bonegraftTeeth);
        renderTeeth($("#bonegraftTeeth"), bonegraftTeeth, "#bonegraftSummary");
      }
    }
    if (group === "load") {
      const loaded = sel.load === "Loaded";
      $("#prosthSection").hidden = !loaded;
      if (!loaded) { sel.prosth = null; refreshGroup("prosth"); $("#dentureNote").hidden = true; }
    }
    if (group === "prosth") {
      const denture = sel.prosth === "Removable partial denture" || sel.prosth === "Complete denture";
      $("#dentureNote").hidden = !denture;
    }
  }

  function updateLoadVisibility() {
    $("#loadControl").hidden = implantTeeth.size === 0;
    if (implantTeeth.size === 0) {
      sel.load = null; refreshGroup("load");
      $("#prosthSection").hidden = true;
    }
  }

  /* ---------- Render chip groups ---------- */
  function renderChips() {
    $$(".chips[data-group]").forEach((groupEl) => {
      const name = groupEl.dataset.group;
      const cfg = GROUPS[name];
      groupEl.innerHTML = "";
      cfg.options.forEach((opt) => {
        const value = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chip" + (label.length > 34 ? " chip--wide" : "");
        chip.textContent = label;
        chip.dataset.value = value;
        chip.setAttribute("aria-pressed", isOn(name, value));
        chip.addEventListener("click", () => toggleChip(name, value));
        groupEl.appendChild(chip);
      });
    });
  }

  /* ---------- Teeth selectors ---------- */
  function makeTooth(n, set, summarySel, onChange) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tooth";
    b.textContent = n;
    b.setAttribute("aria-pressed", set.has(n));
    b.addEventListener("click", () => {
      set.has(n) ? set.delete(n) : set.add(n);
      b.setAttribute("aria-pressed", set.has(n));
      updateTeethSummary(summarySel, set);
      if (onChange) onChange();
    });
    return b;
  }

  function renderTeeth(container, set, summarySel, onChange) {
    container.innerHTML = "";
    const arches = [
      { label: "Upper · 1–16", nums: Array.from({ length: 16 }, (_, i) => i + 1) },
      { label: "Lower · 17–32", nums: Array.from({ length: 16 }, (_, i) => 32 - i) },
    ];
    arches.forEach((arch) => {
      const wrap = document.createElement("div");
      wrap.className = "teeth__arch";
      const lab = document.createElement("div");
      lab.className = "teeth__arch-label";
      lab.textContent = arch.label;
      const row = document.createElement("div");
      row.className = "teeth__row";
      arch.nums.forEach((n) => row.appendChild(makeTooth(n, set, summarySel, onChange)));
      wrap.append(lab, row);
      container.appendChild(wrap);
    });
    updateTeethSummary(summarySel, set);
  }

  function sortedTeeth(set) { return Array.from(set).sort((a, b) => a - b); }

  function updateTeethSummary(summarySel, set) {
    const el = $(summarySel);
    if (set.size === 0) {
      el.textContent = "None selected";
      el.classList.remove("teeth__summary--active");
    } else {
      el.textContent = "Selected: " + sortedTeeth(set).map((n) => "#" + n).join(", ");
      el.classList.add("teeth__summary--active");
    }
  }

  /* ---------- Implant per-tooth details + size matrices ---------- */
  function renderImplantDetails() {
    const wrap = $("#implantDetails");
    wrap.innerHTML = "";
    // Drop stored data for any tooth no longer selected (keys are strings; the set holds numbers)
    for (const k of Object.keys(implantData)) {
      if (!implantTeeth.has(Number(k))) delete implantData[k];
    }
    sortedTeeth(implantTeeth).forEach((tooth) => {
      if (!implantData[tooth]) implantData[tooth] = { system: null, diameter: null, length: null };
      const data = implantData[tooth];

      const row = document.createElement("div");
      row.className = "implant-row";

      const head = document.createElement("div");
      head.className = "implant-row__head";
      const title = document.createElement("span");
      title.className = "implant-row__tooth";
      title.textContent = "Tooth #" + tooth;
      const size = document.createElement("span");
      size.className = "implant-row__size";
      size.textContent = sizeLabel(data);
      head.append(title, size);
      row.appendChild(head);

      const chips = document.createElement("div");
      chips.className = "chips";
      Object.keys(IMPLANT_SYSTEMS).forEach((system) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chip" + (system.length > 34 ? " chip--wide" : "");
        chip.textContent = system;
        chip.setAttribute("aria-pressed", data.system === system);
        chip.addEventListener("click", () => {
          if (data.system === system) { data.system = null; data.diameter = null; data.length = null; }
          else { data.system = system; data.diameter = null; data.length = null; }
          renderImplantDetails();
        });
        chips.appendChild(chip);
      });
      row.appendChild(chips);

      if (data.system) row.appendChild(buildMatrix(data, size));

      wrap.appendChild(row);
    });
  }

  function sizeLabel(data) {
    if (!data.system) return "";
    if (data.diameter && data.length) return `${data.system} — ${data.diameter} × ${data.length} mm`;
    return "";
  }

  function buildMatrix(data, sizeEl) {
    const spec = IMPLANT_SYSTEMS[data.system];
    const box = document.createElement("div");
    box.className = "matrix";

    const axisTop = document.createElement("div");
    axisTop.className = "matrix__axis";
    axisTop.textContent = "Diameter (mm) →   Length (mm) ↓";
    box.appendChild(axisTop);

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const htr = document.createElement("tr");
    const corner = document.createElement("th");
    corner.className = "matrix__corner";
    corner.textContent = "Ø / L";
    htr.appendChild(corner);
    spec.d.forEach((d) => {
      const th = document.createElement("th");
      th.textContent = d;
      htr.appendChild(th);
    });
    thead.appendChild(htr);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    spec.l.forEach((l) => {
      const tr = document.createElement("tr");
      const rh = document.createElement("th");
      rh.textContent = l;
      tr.appendChild(rh);
      spec.d.forEach((d) => {
        const td = document.createElement("td");
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "matrix__cell";
        cell.textContent = d + "×" + l;
        cell.dataset.d = d;
        cell.dataset.l = l;
        cell.setAttribute("aria-pressed", data.diameter === d && data.length === l);
        cell.addEventListener("click", () => {
          if (data.diameter === d && data.length === l) { data.diameter = null; data.length = null; }
          else { data.diameter = d; data.length = l; }
          sizeEl.textContent = sizeLabel(data);
          box.querySelectorAll(".matrix__cell").forEach((c) => {
            c.setAttribute("aria-pressed", data.diameter === Number(c.dataset.d) && data.length === Number(c.dataset.l));
          });
        });
        td.appendChild(cell);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    box.appendChild(table);
    return box;
  }

  /* ---------- Dates ---------- */
  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function fmtDate(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${m}/${d}/${y}`;
  }

  /* ---------- Note (operative-note PDF) generation ---------- */
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const teethStr = (set) => sortedTeeth(set).map((n) => "#" + n).join(", ");

  function buildNote() {
    const name = $("#patientName").value.trim();
    const surgDate = fmtDate($("#surgeryDate").value);
    const sig = $("#signature").value.trim() || "/s/ Dale Goldschlag";
    const sigDate = fmtDate($("#sigDate").value);

    const sections = [];
    const push = (h, body) => { if (body) sections.push(`<div class="note__section"><div class="note__h">${h}</div>${body}</div>`); };
    const p = (t) => `<p class="note__p">${t}</p>`;

    /* Clinical review */
    let clinical = "Medical history reviewed — no change (see attached). Current x-rays present / taken. "
      + "Soft tissue exam: WNL. Hard tissue exam: WNL.";
    if (sel.smoking === "Smoking cessation discussed") clinical += " Smoking cessation discussed.";
    clinical += " Patient instructed to see general dentist or prosthodontist for restorative care, "
      + "regular exams, periodontal evaluation, and recall as directed.";
    let clinicalBody = p(clinical);
    if (sel.consent) {
      clinicalBody += p(
        "Reviewed diagnosis and treatment plan with patient. Alternatives including no treatment discussed with patient. "
        + "Patient's questions answered and patient verbalized understanding. Verbal informed consent obtained after "
        + "discussion of procedure, risks, benefits, alternatives, and potential complications including but not limited to: "
        + "pain, swelling, bleeding, infection, dry socket, sinus and nerve involvement, delayed healing, and possible need "
        + "for additional treatment. Written consent separately reviewed and signed prior to procedure."
      );
    }
    push("Clinical review &amp; consent", clinicalBody);

    /* Premedication */
    const meds = Array.from(sel.premed).filter((v) => v !== "Other" && v !== "None given");
    const other = $("#premedOther").value.trim();
    if (sel.premed.has("Other") && other) meds.push(other);
    if (meds.length) push("Premedication", p("Premedicated in office with " + esc(meds.join(", ")) + "."));
    else if (sel.premed.has("None given")) push("Premedication", p("No premedication given in office."));

    /* Anesthetic */
    const anes = [];
    if (sel.lido && sel.lido !== "Not used") anes.push(`${sel.lido} of 2% lidocaine 1:100,000 epinephrine`);
    if (sel.carbo && sel.carbo !== "Not used") anes.push(`${sel.carbo} of 3% carbocaine`);
    if (anes.length) push("Anesthetic", p("Local anesthetic: " + anes.join(", ") + "."));

    /* Extractions */
    if (extractionTeeth.size) push("Extractions", p("Extractions (D7210) performed on tooth " + teethStr(extractionTeeth) + "."));

    /* Implants */
    if (implantTeeth.size) {
      const list = sortedTeeth(implantTeeth).map((t) => {
        const d = implantData[t];
        if (d && d.system) {
          const sz = d.diameter && d.length ? ` (${d.diameter} × ${d.length} mm)` : "";
          return `#${t} — ${esc(d.system)}${sz}`;
        }
        return `#${t}`;
      });
      let body = p("Implants placed: " + list.join("; ") + ".");
      if (sel.load) body += p("Implants " + sel.load.toLowerCase() + ".");
      push("Implants placed", body);
    }

    /* Prosthetics (only when loaded) */
    if (sel.load === "Loaded" && sel.prosth && sel.prosth !== "Not applicable") {
      let t;
      if (sel.prosth.startsWith("Immediate load")) t = "Immediate load: provisional cemented with temporary cement.";
      else t = sel.prosth + " delivered. Patient instructed not to wear for at least one week; "
        + "adjustments with general dentist or prosthodontist.";
      push("Prosthetics", p(esc(t)));
    }

    /* Bone graft */
    if (sel.bonegraft === "Yes") {
      let g = "Bone graft performed" + (bonegraftTeeth.size ? " on tooth " + teethStr(bonegraftTeeth) : "") + ".";
      if (sel.graftMaterial.size) g += " Graft material: " + esc(Array.from(sel.graftMaterial).join(", ")) + ".";
      if (sel.graftProcedures.size) g += " Additional procedures: " + esc(Array.from(sel.graftProcedures).join(", ")) + ".";
      push("Bone graft", p(g));
    }

    /* Post-op */
    const segs = [];
    const has = (v) => sel.postop.has(v);
    if (has("Post-op instructions reviewed with patient")) {
      segs.push("Post-op instructions reviewed with patient" + (has("In written and oral form") ? " in written and oral form" : ""));
    } else if (has("In written and oral form")) {
      segs.push("Post-op instructions provided in written and oral form");
    }
    if (has("Emergency contact information given")) segs.push("emergency contact information given");
    if (has("Soft diet instructions given")) segs.push("soft diet instructions given");
    if (segs.length) push("Post-operative", p(segs.join("; ") + "."));

    /* Prescriptions */
    const rx = Array.from(sel.rx);
    if (sel.analgesic && sel.analgesic !== "Not prescribed") rx.push(sel.analgesic);
    if (rx.length) push("Prescriptions", p("Prescribed: " + esc(rx.join("; ")) + "."));

    /* Next visit */
    if (sel.nextvisit) {
      let nv = "Next visit: patient scheduled for post-op exam in two weeks or as needed prior.";
      const notes = $("#nextVisitNotes").value.trim();
      if (notes) nv += " " + esc(notes) + (/[.!?]$/.test(notes) ? "" : ".");
      push("Next visit", p(nv));
    }

    const patientHtml = name ? esc(name) : `<span class="note__empty">—</span>`;
    const dateHtml = surgDate || `<span class="note__empty">—</span>`;

    $("#note").innerHTML = `
      <div class="note__header">
        <div class="note__title">Surgical Log</div>
        <div class="note__org">Ceramic Dental Implant Centre</div>
      </div>
      <div class="note__meta">
        <span><b>Patient:</b> ${patientHtml}</span>
        <span><b>Date of surgery:</b> ${dateHtml}</span>
      </div>
      ${sections.join("")}
      <div class="note__sig">
        <div class="note__sig-name">${esc(sig)}<small>Surgeon</small></div>
        <div class="note__sig-date">Date: ${sigDate || "—"}</div>
      </div>`;

    updateDocTitle(name, surgDate);
  }

  function updateDocTitle(name, date) {
    let t = "Surgical Log";
    if (name) t += " — " + name;
    if (date) t += " — " + date;
    document.title = t;
  }

  /* ---------- Fit the note onto a single Letter page ---------- */
  function fitNote() {
    const note = $("#note");
    note.style.zoom = "";
    const pageH = 11 * 96; // 1in = 96px in print
    const h = note.scrollHeight;
    if (h > pageH) note.style.zoom = Math.max(0.55, pageH / h);
  }

  /* ---------- Preview / export ---------- */
  function openPreview() {
    buildNote();
    const ov = $("#previewOverlay");
    ov.classList.remove("mode-consents");
    ov.classList.add("open");
    ov.setAttribute("aria-hidden", "false");
    $("#overlayTitle").textContent = "Surgical log — preview";
    fitNote();
    ov.querySelector(".overlay__scroll").scrollTop = 0;
  }
  function openConsents() {
    if (typeof window.buildConsentPacket !== "function") { alert("Consent forms failed to load."); return; }
    const name = $("#patientName").value.trim();
    const dateStr = fmtDate($("#surgeryDate").value);
    $("#consentDoc").innerHTML = window.buildConsentPacket(name, dateStr);
    const ov = $("#previewOverlay");
    ov.classList.add("mode-consents", "open");
    ov.setAttribute("aria-hidden", "false");
    $("#overlayTitle").textContent = "Consent forms — preview";
    fitConsentPages();
    ov.querySelector(".overlay__scroll").scrollTop = 0;
  }
  function fitConsentPages() {
    const pageH = 11 * 96;
    $$("#consentDoc .consent-page").forEach((pg) => {
      pg.style.zoom = "";
      const h = pg.scrollHeight;
      if (h > pageH) pg.style.zoom = Math.max(0.5, pageH / h);
    });
  }
  function closePreview() {
    const ov = $("#previewOverlay");
    ov.classList.remove("open", "mode-consents");
    ov.setAttribute("aria-hidden", "true");
  }
  function savePdf() {
    if ($("#previewOverlay").classList.contains("mode-consents")) {
      window.print();
    } else {
      buildNote();
      fitNote();
      window.print();
    }
  }

  /* ---------- Reset ---------- */
  function resetAll() {
    if (!confirm("Clear all entries and restore defaults?")) return;
    setDefaults();
    $("#patientName").value = "";
    $("#nextVisitNotes").value = "";
    $("#premedOther").value = "";
    $("#surgeryDate").value = todayISO();
    $("#sigDate").value = todayISO();
    $("#signature").value = "/s/ Dale Goldschlag";
    renderAll();
  }

  function renderAll() {
    renderChips();
    renderTeeth($("#extractionTeeth"), extractionTeeth, "#extractionSummary");
    renderTeeth($("#implantTeeth"), implantTeeth, "#implantSummary", () => { renderImplantDetails(); updateLoadVisibility(); });
    renderTeeth($("#bonegraftTeeth"), bonegraftTeeth, "#bonegraftSummary");
    renderImplantDetails();
    // sync conditional UI
    $("#premedOtherRow").hidden = !sel.premed.has("Other");
    $("#bonegraftDetails").hidden = sel.bonegraft !== "Yes";
    updateLoadVisibility();
    $("#prosthSection").hidden = sel.load !== "Loaded";
    $("#dentureNote").hidden = !(sel.prosth === "Removable partial denture" || sel.prosth === "Complete denture");
  }

  /* ---------- Init ---------- */
  function init() {
    setDefaults();
    $("#surgeryDate").value = todayISO();
    $("#sigDate").value = todayISO();
    $("#signature").value = "/s/ Dale Goldschlag";
    renderAll();

    $("#previewBtn").addEventListener("click", openPreview);
    $("#previewBtn2").addEventListener("click", openPreview);
    $("#printConsentsBtn").addEventListener("click", openConsents);
    $("#resetBtn").addEventListener("click", resetAll);
    $("#closePreview").addEventListener("click", closePreview);
    $("#savePdf").addEventListener("click", savePdf);

    $("#patientName").addEventListener("input", (e) => updateDocTitle(e.target.value.trim(), fmtDate($("#surgeryDate").value)));
    $("#surgeryDate").addEventListener("change", () => updateDocTitle($("#patientName").value.trim(), fmtDate($("#surgeryDate").value)));

    window.addEventListener("beforeprint", () => {
      if (!$("#previewOverlay").classList.contains("mode-consents")) buildNote();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePreview(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
