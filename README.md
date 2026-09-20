# 🎯 Taskly - Modern To-Do App & QA Portfolio

![Taskly App Interface]()

> **About the project:** Taskly is an intuitive web application for task management, designed with a focus on a clean user interface (UI) and reliable business logic. This repository is a key component of my QA portfolio, demonstrating both the structure of modern frontend code and a professional approach to quality assurance (Shift-Left QA) through unit testing and comprehensive test documentation. In the latest release, the application has been enhanced with a multi-language (i18n) architecture.

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Unit Testing](https://img.shields.io/badge/Unit_Testing-C21325?style=for-the-badge&logo=jest&logoColor=white)

## ✨ Core Features

The application is designed to maximize productivity and provide full control over your daily schedule:
* **Multi-language support (i18n):** Built-in translation system with seamless interface language switching.
* **Task management:** Smoothly add, edit, and delete daily tasks.
* **Categorization and views:** Organize work using built-in lists: All, Today, Scheduled, and Completed.
* **Prioritization:** Easily assign priority levels to tasks (High, Medium, Low).
* **Progress tracking:** Visualize the task completion rate with a dynamic percentage chart.
* **Advanced filtering:** Search for specific tasks and filter them by priority and creation date.

## 🧪 QA Approach & Test Structure

As a QA Engineer, I paid special attention to code reliability and business logic verification in this project:

* **QA Documentation:** Identified edge cases, test scenarios (positive and negative), and bug reports are documented in detail in the `QA-REPORT.md` file.
* **Unit Tests:** Data operations and state management logic are rigorously verified in the `tests/model.test.cjs` file. Additionally, the new multi-language mechanism has a dedicated set of unit tests in the `tests/i18n.test.cjs` file.
* **Logic Separation:** The project architecture consciously divides the application into a data/services layer (`model.js`, `i18n.js`) and a presentation layer (`app.js`), which facilitates isolated automated testing (Testability).

## 📂 Repository Architecture

* `index.html` / `styles.css` – Semantic structure and styling of the modern user interface.
* `app.js` – Main view controller, DOM interaction logic, and event listeners.
* `model.js` – Data model responsible for CRUD operations on tasks.
* `i18n.js` / `translations.js` – Module handling internationalization logic and the translation dictionaries file.
* `tests/model.test.cjs` – A set of test scripts automating the verification of task logic.
* `tests/i18n.test.cjs` – Tests verifying the correct rendering of language keys.
* `QA-REPORT.md` – A summary of manual testing results, exploratory testing, and requirements verification.

## 🚀 Running the Local Environment

To run the application and the test suite in your local environment, follow these steps:

### 1. Running the UI application
The application uses Vanilla JS. Simply clone the repository and open the `index.html` file in any modern browser (using the *Live Server* extension in your code editor is recommended for the best experience).

### 2. Running automated tests
Ensure you have Node.js installed. Open your terminal in the project's root directory and run the following commands:
```bash
npm install
npm test
