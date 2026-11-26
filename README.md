# ✅ Taskly – Personal Task Manager & QA Portfolio

![Taskly application preview](banner.png)

[Open app ↗](https://webdevnikfull.github.io/nr._taskly./)

> Taskly is a browser-based task manager for planning work, keeping track of deadlines, and reviewing monthly progress. The project uses HTML, CSS, and vanilla JavaScript. Its QA documentation and automated tests cover task logic, storage, and translations.

## ✨ Core Features

- **Task management** – Create, edit, duplicate, complete, and delete tasks. Add notes, deadlines, and priorities. Undo recent changes.
- **Planning and focus** – Search and filter tasks, plan work in the monthly calendar, or complete the next priority task from the sidebar.
- **Monthly reports** – Review completion rates and priority breakdowns. Export PNG reports and JSON task backups, or print reports to PDF.
- **Local profiles** – Sign in to keep separate task lists in the same browser. Profiles and tasks stay on that device.
- **Accessible interface** – Switch between light and dark themes and seven languages (PL, EN, DE, ES, FR, UK, RU). Use keyboard shortcuts and system reduced-motion preferences.

## 🧪 QA Approach & Test Structure

- [**Task model tests**](tests/model.test.cjs) cover input validation, search, sorting, due dates, and saved data.
- [**Translation tests**](tests/i18n.test.cjs) check that all seven languages have matching labels and placeholders.
- [**Workspace tests**](tests/workspace.test.cjs) cover calendar dates, monthly reporting, and local profile isolation.
- [**QA notes**](QA-WORKSPACE.md) document manual checks for the calendar, reports, and profiles.

## 📂 Repository Structure

| Files | Purpose |
| --- | --- |
| `index.html` and CSS | Responsive interface, themes, and component styles |
| `app.js`, `workspace.js` | Task interactions, calendar, reporting, and browser storage |
| `model.js`, `workspace-model.js` | Task validation, filtering, calendar dates, and report totals |
| `profiles.js` | Local registration and sign-in |
| `translations.js`, `workspace-i18n.js`, `i18n.js` | Translations and language switching |

## 🚀 Run Locally

From the project folder, start a static server and open [localhost:8080](http://localhost:8080). Local sign-in uses Web Crypto and requires localhost or HTTPS.

```sh
python -m http.server 8080
```

With Node.js installed, run the automated tests from the same folder:

```sh
node --test tests/model.test.cjs tests/i18n.test.cjs tests/workspace.test.cjs
```
