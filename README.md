# Surgical Log — Ceramic Dental Implant Centre

A clean, single-page web app for recording an implant/extraction surgical log and exporting it as a
tidy, **typed operative note PDF** — no boxes, chips, or "checked off" look.

- **Runs entirely in the browser.** No server, no database, no network calls. Nothing you type is
  uploaded or stored anywhere — close the tab and it's gone. Safe for use with patient information.
- **Two halves, on purpose.** You fill a fast, modern form; the app generates a separate, professionally
  typeset note for the PDF. That separation is what makes the export read like dictation instead of a form.
- **Works on iPhone.** Open in Safari and **Share → Add to Home Screen** to use it like an app.

## Using it

1. Fill in the form. Sensible defaults are pre-selected (premedication, anesthetic, post-op, Rx, etc.).
2. Tap **Preview & Export PDF** to see the finished note exactly as it will print.
3. Tap **Save as PDF** — this opens your browser/OS print dialog. Choose **Save as PDF** (desktop) or, on
   iPhone, the share sheet → **Save to Files** / **Mail**. The file is named after the patient and date.

The note auto-scales to stay on a single 8.5×11 sheet.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure |
| `assets/app.css` | Form UI + typeset note/print styling |
| `assets/app.js` | State, controls, note generation, PDF export |
| `manifest.webmanifest`, `favicon.svg` | Add-to-home-screen support |
| `.nojekyll` | Tells GitHub Pages to serve files as-is |
| `reference/` | The original surgical-log HTML and the build-history notes (not part of the app) |

## Editing the content

Almost everything clinical lives in **`assets/app.js`**:

- **Option lists** (premedication, anesthetic, Rx, etc.) → the `GROUPS` object near the top.
- **Implant systems and size matrices** → the `IMPLANT_SYSTEMS` object.
- **The wording of the printed note** → the `buildNote()` function.

Change a value, save, refresh. No build step.

## Hosting on GitHub Pages

This repo is already structured for Pages. After pushing:

1. Repo **Settings → Pages**.
2. **Build and deployment → Source: Deploy from a branch**.
3. Branch: `main`, folder: `/ (root)` → **Save**.
4. Wait ~1 minute; your site appears at `https://<username>.github.io/<repo>/`.
