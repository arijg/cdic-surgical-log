/* ============================================================
   Consent packet — reproduces the 9 pages of the "CDIC_Consent"
   tab from "Claude CPS V1.2.xlsm", with the same page breaks.
   Patient name + date are injected from the surgical-log form.
   ============================================================ */
(function () {
  "use strict";

  const ORG = "Ceramic Dental Implant Centre";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const BLANK = "______________________";

  const page = (inner) => `<section class="consent-page">${inner}</section>`;
  const header = (name, date) =>
    `<div class="cpage__header"><span>Patient Name:&nbsp; <b>${esc(name) || BLANK}</b></span>` +
    `<span>Date:&nbsp; <b>${esc(date) || "____________"}</b></span></div>`;
  const field = (label, val) => `<p class="cpage__field">${label}:&nbsp; <b>${esc(val) || BLANK}</b></p>`;
  const sig = (label, val) => `<div class="sig"><div class="sig__line">${esc(val) || ""}</div><div class="sig__lbl">${label}</div></div>`;
  const sigDate = (val) => `<div class="sig sig--date"><div class="sig__line">${esc(val) || ""}</div><div class="sig__lbl">Date</div></div>`;
  const row = (...blocks) => `<div class="sig-row">${blocks.join("")}</div>`;
  const num = (n, txt) => `<div class="cpage__numlist"><span class="n">${n})</span><span>${txt}</span></div>`;

  // ── Signature blocks: patient (left) and doctor (right), each with a Date line below.
  // The doctor's signature image is placed automatically.
  const DOCTOR_SIG = `<img class="sigcol__img" data-doctor-sig alt="Doctor signature" hidden>`;
  const patientLabel = (name) => (name ? "Patient - " + esc(name) : "Patient");
  const sigCol = (lineHtml, label, date) =>
    `<div class="sigcol">` +
      `<div class="sigcol__line">${lineHtml || ""}</div>` +
      `<div class="sigcol__lbl">${label}</div>` +
      `<div class="sigcol__date">${esc(date) || ""}</div>` +
      `<div class="sigcol__lbl">Date</div>` +
    `</div>`;
  // Patient on the left, Doctor (auto-signed) on the right.
  const sigPair = (name, date) =>
    `<div class="sig2row">${sigCol("", patientLabel(name), date)}${sigCol(DOCTOR_SIG, "Doctor", date)}</div>`;
  // Patient only (pages that have no doctor line).
  const sigPatient = (name, date) =>
    `<div class="sig2row">${sigCol("", patientLabel(name), date)}</div>`;

  /* ── Page 1 — Informed Consent (intro) ── */
  function page1(name, date) {
    return page(
      header(name, date) +
      `<div class="cpage__title">Informed Consent for Dental Implant and Dental Procedures and Treatment</div>` +
      `<div class="cpage__subtitle">${ORG}</div>` +
      `<p>You the patient have the right to accept or reject dental treatment recommended by your dentist. Prior to consenting to treatment, you should carefully consider the anticipated benefits and commonly known risks of the recommended procedure, alternative treatments, or the option of no treatment.</p>` +
      `<p>Do not consent to treatment unless and until you discuss potential benefits, risks, and complications with your dentist and all of your questions are answered. By consenting to treatment, you are acknowledging your willingness to accept known risks and complications, no matter how slight the probability of occurrence.</p>` +
      `<p>It is very important that you provide your dentist with accurate information before, during and after treatment. It is equally important that you follow your dentist's advice and recommendations regarding medication, pre and post treatment instructions, referrals to other dentists or specialist, and return for scheduled appointments. If you fail to follow the advice of your dentist, you may increase the chances of a poor outcome.</p>` +
      `<p>The patient is an important part of the treatment team. In addition to complying with the instructions given to you by this office, it is important to report any problems or complications you experience so they can be addressed by your dentist.</p>` +
      `<p>If you are a woman on oral birth control medication, you must consider the fact that antibiotics might make oral birth control less effective. Please consult with your physician before relying on oral birth control medication if your dentist prescribes, or if you are taking antibiotics.</p>` +
      sigPair(name, date)
    );
  }

  /* ── Page 2 — Consent for surgery (risks list) ── */
  function page2(name, date) {
    const risks = [
      "Pain, swelling, and discomfort after treatment",
      "Infection in need of medication, follow-up procedure or other treatment.",
      "Temporary, or on rare occasion, permanent numbness, pain, tingling or altered sensation of the lip, face, chin, gums, palate, and tongue along with possible loss of taste.",
      "Damage to adjacent teeth, restorations or gums",
      "Possible deterioration of your condition which may result in tooth loss",
      "The need for replacement of restorations, implants or other appliances in the future",
      "An altered bite in need of adjustment",
      "Possible injury to the jaw joint and related structures requiring follow-up care and treatment, or consultation by a dental specialist",
      "A root tip, bone fragment or a piece of dental instrument may be left in your body, and may have to be removed at a later time if symptoms develop.",
      "Jaw fracture",
      "If upper teeth are treated, there is a chance of a sinus infection or opening between the mouth and sinus cavity resulting in infection or the need for further treatment.",
      "Allergic reaction to anesthetic or medication",
      "Need for follow-up treatment, including surgery",
    ];
    return page(
      header(name, date) +
      `<div class="cpage__title">Consent For Dental Extractions, Implant Removal, Implant Placement, Bone Grafting and other dental surgery</div>` +
      `<p>As with all surgery, there are commonly known risks and potential complications associated with dental treatment. No one can guarantee the success of the recommended treatment, or that you will not experience a complication or less than optimal result. Even though many of these complications are rare, they can and do occur occasionally.</p>` +
      `<p>Some of the more commonly known risks and complications of treatment include, but are not limited to the following:</p>` +
      `<ol class="cpage__list">${risks.map((r) => `<li>${r}</li>`).join("")}</ol>` +
      `<p>The form is intended to provide you with an overview of potential risks and complications. Do not sign this form or agree to treatment until you have read, understood, and accepted each paragraph stated above. Please discuss the potential benefits, risks, and complications of recommended treatment with your dentist. Be certain all of your concerns have been addressed to your satisfaction by your dentist before commencing treatment.</p>` +
      sigPair(name, date)
    );
  }

  /* ── Page 3 — Responsibility & Arbitration ── */
  function page3(name, date) {
    return page(
      `<div class="cpage__org">${ORG}</div>` +
      `<div class="cpage__h">Responsibility and Consent Statement:</div>` +
      `<p>I hereby authorize and request the performance of dental services for myself.</p>` +
      `<p>I also give my consent to any advisable and necessary dental procedures, medications or anesthetics to be administered by the attending dentist for any diagnostic purpose or dental treatment.</p>` +
      `<p>I understand and acknowledge that I am financially responsible for services provided for myself regardless of insurance coverage.</p>` +
      `<p>I also understand that I am to provide my dentist with accurate information regarding my physical and dental health, as well as any problems or complications I may experience before, during and after treatment.</p>` +
      `<p>I further agree to follow my dentist's advice and recommendations regarding medication, pre and post treatment instructions, referrals to other dentists or specialists and to return to the dental office for scheduled appointments. Should I not follow the recommended advice of my dentist, it may increase the chances of a poor outcome.</p>` +
      `<div class="cpage__h">Agreement as to Resolutions of Concerns — Arbitration:</div>` +
      `<p>Arbitration is the resolution of a dispute by an impartial third person whose decision is binding on all the parties. We have found that resolving disputes by arbitration is a quick and efficient alternative to the court system. As a result, we request that all patients receiving services at ${ORG} sign this agreement. By signing below and consenting to treatment, ${ORG}, including all dentists, and yourself agree to the following:</p>` +
      `<p>Any controversy, claim or dispute arising out of or related to any dental services you received by any dentists, dental specialists, dental assistants or any employees associated with ${ORG}, including any claims of your spouse or heirs, shall be resolved exclusively and by binding arbitration except for (a) judicial review of the arbitration proceedings or (b) claims within jurisdictional limit of small claims court.</p>` +
      `<p>Any controversy, claim or dispute arising out of or related to the payment or non-payment of fees, regarding dental services received by any dentists, dental specialists, dental assistants or any employees associated with ${ORG}, shall be resolved exclusively and by binding arbitration except for (a) judicial review of the arbitration proceedings or (b) claims within jurisdictional limit of small claims court.</p>` +
      `<p>Arbitration will be settled and administered by the American Arbitration Association, under its Code of Procedure then in effect. Both parties will pay administrative fees and arbitrator compensation for the binding process.</p>` +
      `<p>If any provision of this Arbitration Agreement is held invalid or unenforceable, the remaining provisions remain in full force and effect and will not be affected by the invalidity of such provision.</p>` +
      `<p>The undersigned agrees that he/she waives his/her right to a trial in court for any future malpractice claim he/she may have against ${ORG}, your dentist and any other dental provider at the dental office.</p>` +
      sigPair(name, date)
    );
  }

  /* ── Page 4 — Affirmation of informed consent ── */
  function page4(name, date) {
    return page(
      field("Patient Name", name) +
      `<p>I am affirming that my Informed Consent for Dental Treatment, Extractions, Implant Surgery, and Prosthetic Treatment have been given to me in oral and written form and in a language that I understand.</p>` +
      `<p>The risks and alternatives to the treatment I am consenting to have been thoroughly discussed. I have had an opportunity to ask the doctor questions and review alternative treatments. I am comfortable proceeding with the treatment.</p>` +
      sigPatient(name, date)
    );
  }

  /* ── Prosthetic Treatment Consent, Page 1 ── */
  function page6(name, date) {
    return page(
      `<div class="cpage__title">Prosthetic Treatment Consent Form</div>` +
      `<div class="cpage__subtitle">Page 1</div>` +
      field("Patient's Name", name) +
      `<p>State law requires that you be given certain information and that we obtain your consent prior to beginning any treatment. What you are being asked to sign is a confirmation that we have discussed the nature and purpose of the treatment, the known risks associated with the treatment, and the feasible treatment alternatives; that you have been given the opportunity to ask questions; that all your questions have been answered in a satisfactory manner; and that all the spaces in these forms were filled in prior to your signing it.</p>` +
      num(1, "I hereby authorize and request the performance of dental services and prosthodontic procedures for the above named patient from Dr Goldschlag or staff and further authorize the performance of whatever procedure(s) in their judgment of the above named doctors may deem necessary. I also authorize the administration of such anesthetics or analgesics that the doctor may deem advisable. I further authorize any oral surgical procedure(s) that may necessary during my treatment.") +
      num(2, "I authorize the fabrication of the prosthesis that has been prescribed by Dr Goldschlag that has been indicated by the diagnostic studies and/or evaluations already performed.") +
      num(3, "Alternatives to the implant prosthesis(es) have been explained to me, including their risks. I have tried or considered these alternative treatment methods and their risks.") +
      num(4, "I am aware that the practice of dentistry and dental surgery is not an exact science and I acknowledge that no guarantees have been made to me concerning the success of my implant prosthesis(es) and the associated treatment and procedures. I am aware that the implant prosthesis(es) may fail, which may require further corrective actions and possible removal of said prosthesis(es).") +
      num(5, "As with any dental prosthesis(es), there are possible complications of which I have been made aware. These complications include but are not limited to the following: risk of improper fitting bridge work; risk of improper occlusion; disease develops due to improper home care or other reasons; loss of permanent teeth; loss of the prosthesis(es) and/or implant(s) if systemic disease develops, and wear or breakage of the implant component parts and/or prosthesis(es), and risk to the chewing surface material(s). This material(s) has tooth like hardness. However, just as with natural teeth, they run the risk of fracture or breakage. If damage to the material(s) occurs it may need to be repaired. The amount of damage to the prosthesis(es) will determine whether or not it may be repaired or remade. The cost to repair will vary depending on the extent of the damage. If a chip occurs it may only need to be polished. If the fracture is larger it may need resurfacing and may only last four to six months. Should the damage be excessive, it may require that the crown or the entire bridge be remade. There will be a fee to repair and/or replace the crown or bridge.") +
      num(6, "The teeth or implant(s) which support your prosthesis(es) can develop gum disease, and other dental problems, if proper care is NOT given to them. Professional preventive maintenance visits and professional cleanings, are mandatory every three to four months. Home care, brushing and flossing should be performed three times daily. It is your (the patient's) responsibility to complete home care and schedule regular maintenance visits with this office.") +
      sigPair(name, date)
    );
  }

  /* ── Page 7 — Prosthetic Treatment Consent, Page 2 ── */
  function page7(name, date) {
    return page(
      `<div class="cpage__title">Prosthetic Treatment Consent Form</div>` +
      `<div class="cpage__subtitle">Page 2</div>` +
      field("Patient's Name", name) +
      num(7, "Avoid eating or chewing sticky foods such as taffy and excessively hard objects or foods like hard candies, some nuts, ice, etc. This may loosen or damage the prosthesis(es). Fixed teeth rarely come loose. However, if this occurs it will put excessive force on the remaining implant(s)/teeth. Natural teeth may decay under loose restorations. This too may result in loss of the teeth or implants. Therefore, if the prosthesis(es) should become loose, or if any changes to the bite occur, please notify the office immediately.") +
      num(8, "I certify that I have read, have had explained to me, and fully understand this foregoing consent to implant prosthetic treatment and that it is my intention to have the foregoing treatment carried out as stated. I have been advised that this is a relatively new procedure and that the information concerning the longevity of the particular implant(s) and the prosthesis(es) to be used may be limited. However, I have discussed this, as well as the nature of the implant product to be used, and I consent to the procedure knowing its risks and limitations.") +
      `<div class="cpage__h">IN SUMMARY</div>` +
      num(9, "I understand that sometime after insertion the implant(s) will be uncovered and/or implant head(s) will be placed into the implant(s). The restoring dentist will restore the implant(s) using routine dental procedures and make a prosthesis(es) that will be attached to the implant(s). The problems with having or wearing this prosthesis(es) have been explained to me. I may lose the implant(s) once it has been placed or the prosthesis(es) may fracture, wear or parts may break and need to be replaced at my cost. In addition, it has been explained to me that the prosthesis(es) will either be cemented or placed in position by screws. These screws can come loose and/or break and may need to be replaced at any time. There will be a charge to remedy these situations. It has been further explained to me the need for meticulous home care. The tissue around the implant(s) may become irritated. I may need additional surgery to insure the health of the implant(s). Possible oral hygiene regimes have been explained to me and I have been told what type of dental care devices I may need. Preventive maintenance procedures have been explained to me and I know that I should come back to visit the dentist who has placed the restorations at least three times a year. As with all other dental procedures, no guarantee can be given as to the longevity of this procedure. It should be noted that I have read this, clearly understand this, and I have had all this information explained to me. I have had all my questions answered by the dentist and have no remaining substantive questions relative to this information or my treatment.") +
      field("Patient's Name", name) +
      sigPair(name, date)
    );
  }

  /* ── Page 8 — ICOI Implant Patient Information & Consent ── */
  function page8(name, date) {
    return page(
      `<div class="cpage__title">The International Congress of Oral Implantologists</div>` +
      `<div class="cpage__subtitle">IMPLANT PATIENT INFORMATION AND CONSENT FORM</div>` +
      num(1, "I have been informed and I understand the purpose and the nature of the implant surgery procedure. I understand what is necessary to accomplish the placement of the implant under the gum or in the bone.") +
      num(2, "My doctor has carefully examined my mouth. Alternatives to this treatment have been explained. I have tried or considered these methods, but I desire an implant to help secure the replaced missing teeth.") +
      num(3, "I have further been informed of the possible risks and complications involved with surgery, drugs, and anesthesia. Such complications include pain, swelling, infection, and discoloration. Numbness of the lip, tongue, chin, cheek, palate, and teeth may occur. The exact duration may not be determinable and may be irreversible. Also possible are inflammation of a vein, injury to teeth present, bone fractures, sinus penetration, delayed healing, allergic reactions to drugs or medications used, etc.") +
      num(4, "I understand that if nothing is done, any of the following could occur: bone disease, loss of bone, gum tissue inflammation, infection, sensitivity, looseness of teeth, followed by necessity of extraction. Also possible are temporomandibular joint (jaw) problems, headaches, referred pains to the back of the neck and facial muscles, and tired muscles when chewing.") +
      num(5, "My doctor has explained that there is no method to accurately predict the gum and the bone healing capabilities in each patient following the placement of the implant.") +
      num(6, "It has been explained that in some instances implants fail and must be removed. I have been informed and understand that the practice of dentistry is not an exact science; no guarantees or assurance as to the outcome or results of treatment or surgery can be made.") +
      num(7, "I understand that smoking, alcohol, or sugar may effect gum healing and may limit the success of the implant. I agree to follow my doctor's home care instructions. I agree to report to my doctor for regular examinations as instructed.") +
      num(8, "I agree to the type of anesthesia, depending on the choice of the doctor. I agree not to operate a motor vehicle or hazardous device for at least 24 hours or more until fully recovered from the effects of the anesthesia or drugs given for my care.") +
      num(9, "To my knowledge I have given an accurate report of my physical and mental health history. I have also reported any prior allergic or unusual reactions to drugs, food, insect bites, anesthetics, pollens, dust, blood or body diseases, gum or skin reactions, abnormal bleeding or any other conditions related to my health.") +
      num(10, "I consent to photography, filming, recording, and x-rays of the procedure to be performed for the advancement of implant dentistry, provided my identity is not revealed.") +
      num(11, "I request and authorize medical/dental services for me, including implants and other surgery. I fully understand that during, and following the contemplated procedure, surgery, or treatment, conditions may become apparent which warrant, in the judgment of the doctor, additional or alternative treatment pertinent to the success of comprehensive treatment. I also approve any modification in design, materials, or care, if it is felt this is for my best interest.") +
      field("Patient's Name", name) +
      sigPair(name, date)
    );
  }

  /* ── Page 9 — Post-operative instructions ── */
  function page9(name, date) {
    return page(
      header(name, date) +
      `<div class="cpage__title">Post Operative Instructions For Dental Implant Surgery</div>` +
      `<p>Do not disturb the wound. Avoid rinsing, spitting, or touching the wound on the day of surgery. There may be a metal healing abutment protruding through the gingival (gum) tissue.</p>` +
      `<div class="cpage__h">Bleeding</div>` +
      `<p>Some bleeding or redness in the saliva is normal for 24 hours. Excessive bleeding (your mouth fills up rapidly with blood) can be controlled by biting on a gauze pad placed directly on the bleeding wound for 30 minutes. If bleeding continues please call for further instructions.</p>` +
      `<div class="cpage__h">Swelling</div>` +
      `<p>Swelling is a normal occurrence after surgery. To minimize swelling, apply an ice bag, or a plastic bag, or towel filled with ice on the cheek in the area of surgery. Apply the ice ten minutes on and ten minutes off, as much as possible, for the first 24 hours.</p>` +
      `<div class="cpage__h">Diet</div>` +
      `<p>Drink plenty of fluids. Avoid hot liquids or food. Soft food and liquids should be eaten on the day of surgery. Return to a normal diet as soon as possible unless otherwise directed.</p>` +
      `<div class="cpage__h">Pain</div>` +
      `<p>You should begin taking pain medication as soon as you feel the local anesthetic wearing off. For moderate pain, 1 or 2 Tylenol or Extra Strength Tylenol may be taken every 3-4 hours. Ibuprofen (Advil or Motrin) may be taken instead of Tylenol. Ibuprofen, bought over the counter comes in 200 mg tablets: 2-3 tablets may be taken every 3-4 hours as needed for pain. For severe pain, the prescribed medication should be taken as directed. Do not take any of the above medication if you are allergic, or have been instructed by your doctor not to take it.</p>` +
      `<div class="cpage__h">Antibiotics</div>` +
      `<p>Be sure to take the prescribed antibiotics as directed to help prevent infection, until complete.</p>` +
      `<div class="cpage__h">Activity and Smoking</div>` +
      `<p>Keep physical activities to a minimum immediately following surgery. If you are considering exercise, throbbing or bleeding may occur. If this occurs, you should discontinue exercising. Keep in mind that you are probably not taking normal nourishment. This may weaken you and further limit your ability to exercise. Absolutely no smoking.</p>` +
      `<div class="cpage__h">Wearing your Prosthesis</div>` +
      `<p>Partial dentures, flippers, or full dentures should not be used immediately after surgery and for at least 10 days. This was discussed in the pre-operative consultation.</p>` +
      `<p>If there is any question or emergency during regular hours please call the Main Office 212-269-9500. After Hours call the emergency number on the message.</p>`
    );
  }

  window.buildConsentPacket = function (name, date) {
    return [page1, page2, page3, page4, page6, page7, page8, page9]
      .map((fn) => fn(name, date))
      .join("");
  };

  /* ── Doctor signature: AES-GCM decrypt in-browser, gated by a passphrase ── */
  const SIG_STORE = "cdic_doctor_sig_v1";
  let sigDataUrl = null;

  async function decryptSignature(passphrase) {
    if (!window.SIGNATURE_ENC) throw new Error("no encrypted signature");
    const raw = Uint8Array.from(atob(window.SIGNATURE_ENC), (c) => c.charCodeAt(0));
    const salt = raw.slice(0, 16), iv = raw.slice(16, 28), data = raw.slice(28);
    const km = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 250000, hash: "SHA-256" },
      km, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data); // throws on wrong passphrase
    let bin = ""; const bytes = new Uint8Array(plain), CH = 0x8000;
    for (let i = 0; i < bytes.length; i += CH) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
    return "data:image/jpeg;base64," + btoa(bin);
  }

  function applySignature() {
    if (!sigDataUrl) return;
    // Fill every doctor-signature slot — consent packet AND the surgical-log note.
    document.querySelectorAll("[data-doctor-sig]").forEach((img) => {
      img.src = sigDataUrl;
      img.hidden = false;
    });
  }
  // Silent apply (no passphrase prompt) — used when a document is re-rendered.
  window.applyDoctorSignatures = function () {
    if (!sigDataUrl) { try { const s = localStorage.getItem(SIG_STORE); if (s) sigDataUrl = s; } catch (e) {} }
    applySignature();
  };

  const byId = (id) => document.getElementById(id);
  function showUnlock() { const m = byId("sigUnlock"); if (m) { m.hidden = false; const p = byId("sigPass"); if (p) { p.value = ""; p.focus(); } } }
  function hideUnlock() { const m = byId("sigUnlock"); if (m) m.hidden = true; const e = byId("sigErr"); if (e) e.hidden = true; }

  // app.js calls this right after the consent packet is rendered.
  window.fillDoctorSignatures = function () {
    if (!sigDataUrl) { try { const s = localStorage.getItem(SIG_STORE); if (s) sigDataUrl = s; } catch (e) {} }
    if (sigDataUrl) { applySignature(); hideUnlock(); }
    else showUnlock();
  };
  window.closeSignatureUnlock = hideUnlock;

  function initSignatureUI() {
    const go = byId("sigGo"), skip = byId("sigSkip"), pass = byId("sigPass");
    if (!go) return;
    const attempt = async () => {
      try {
        sigDataUrl = await decryptSignature(pass.value);
        if (byId("sigRemember") && byId("sigRemember").checked) { try { localStorage.setItem(SIG_STORE, sigDataUrl); } catch (e) {} }
        applySignature();
        hideUnlock();
      } catch (e) { const err = byId("sigErr"); if (err) err.hidden = false; }
    };
    go.addEventListener("click", attempt);
    pass.addEventListener("keydown", (e) => { if (e.key === "Enter") attempt(); });
    skip.addEventListener("click", hideUnlock);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initSignatureUI);
  else initSignatureUI();
})();
