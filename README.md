# Task Manager - Glassmorphic Workspace

A clean, modern, responsive **Task Management Application (To-Do App)** designed and built with **semantic HTML5, modern CSS3, and modular vanilla ES6 JavaScript**.

This client-side application utilizes high-contrast glassmorphic panels and dark-blue gradient layers to create a premium SaaS workspace. It persists your tasks locally using **Browser Local Storage** and manages status states seamlessly with delightful visual interactions and slide-in toast feedback.

---

## 🚀 Key Features

### 📊 Interactive Dashboard Analytics
* **Total Tasks Metric**: Dynamically aggregates the sum of all stored schedules.
* **Completed / Pending Counters**: Tracks progress live as you toggle checkbox actions.
* **Progress Bar Indicator**: Animated gradient track calculating your overall completion rate percentage.
* **Time-of-day Greetings**: Personalized greeting cards changing automatically (e.g. *Good morning*, *Good afternoon*, *Good evening*) paired with real-time localized dates.

### 📝 Comprehensive Task Scheduler
* **Create & Edit Mode**: Smoothly transitions into edit states, auto-populating fields and updating tags.
* **Rich Metadata Attributes**: Each card defines Titles, Descriptions, Priority tags, Categorizations, and calendar Due Dates.
* **Overdue Warnings**: Automatically colors and tags tasks overdue relative to today's local midnight date.

### 🔍 Precision Search & Filters Panel
* **Live Search filter**: Instantly query matches against titles and descriptions.
* **Multiple Category Filters**: Narrow down schedules by category (Work, Personal, Study, Other).
* **Priorities Sorting**: Query items according to Low, Medium, or High priority thresholds.
* **Sorting Capabilities**: Arrange list items ascending/descending by due date, alphabetically (A-Z/Z-A), or by creation date.

### 🌟 High-End UI & Micro-interactions
* **Glassmorphism Design**: High-contrast, semi-transparent frosted cards styled with negative space.
* **Responsive Layout**: Mobile-first fluid structures translating smoothly from phone screens up to large displays.
* **Dynamic Toasts**: Non-intrusive alert prompts with slide-in animations following successful creations, updates, completions, or deletions.
* **Custom Confirm Modals**: Fully blurred confirm dialog preventing accidental deletion of important data.

---

## 🛠️ Technology Stack
* **HTML5**: Structured with descriptive semantic sections.
* **CSS3**: Built using CSS Custom Variables, modern layouts (Flexbox/Grid), glass blur filters, and custom entry transitions.
* **Vanilla JavaScript (ES6)**: Organized into modern ES6 classes using modular `import`/`export` actions without any bulky external frameworks.
* **Local Storage API**: Secure client-side persistence loading, updating, and saving tasks on refresh.

---

## 📂 Project Structure

```text
TaskManager/
│
├── index.html        # Semantic HTML entry point loading modular scripts and styles
├── css/
│   └── style.css     # CSS variable definitions, glassmorphism templates, and animations
│
├── js/
│   ├── app.js        # Core controller initializing events, handling business logic, and seeding sample data
│   ├── storage.js    # Local Storage wrapper handling CRUD database operations
│   ├── ui.js         # DOM cache queries, toast triggers, modal actions, and dynamic card rendering
│   └── validation.js # Title, description, date rules rendering targeted field warnings
│
└── README.md         # Professional documentation guide
```

---

## ⚡ Installation Steps

1. **Clone or Download the Workspace**:
   Retrieve the folder structure onto your local development machine.

2. **Verify Port & File Structure**:
   Ensure all relative directories are preserved: `/css/style.css`, `/js/storage.js`, etc.

---

## 🏃 How to Run

Since the application uses standard ES6 JavaScript Modules (`type="module"`), browser security prevents loading them directly via the `file://` protocol. 

To open and run the application locally, please spin up a standard local development server:

### Option A: Using Node.js / Vite (Included in dev environment)
1. Run `npm install` to load dev utilities.
2. Launch the server using `npm run dev`.
3. Open `http://localhost:3000` in your browser.

### Option B: Using Python
If you have Python installed, navigate to the folder root in your terminal and run:
```bash
# Python 3+
python -m http.server 8000
```
Then visit `http://localhost:8000`.

### Option C: VS Code Live Server
Right-click on `index.html` inside VS Code and select **"Open with Live Server"**.

---

## 📸 Screenshots
*(Include layout mockups and screens here in production Github repo)*
* Desktop Dashboard Grid View
* Sidebar Responsive Scheduler
* Multi-select Filters and Sort row
* High-Contrast Glassmorphic Delete Dialog

---

## 🔮 Future Improvements
* **Sub-task Checklists**: Support checking off sub-items inside a parent task.
* **Visual Statistics Graphs**: Integrate light D3/Recharts curves displaying productivity rates.
* **Sound Alerts**: Play short audio cues on successful task checkoffs.
* **Color Themes Customizer**: Allow selecting alternative neon accents for backgrounds.

---

## 👤 Author
* **AI Coding Agent** — Designed in AI Studio Build workspace.

---

## 📄 License
This project is licensed under the Apache-2.0 License - see the `LICENSE` files for details.
