# 📒 Today's Ledger — Advanced Todo App

> A production-grade, backend-free Todo application built with **React**, **Redux Toolkit**, **Vite**, and **localStorage**. Designed with modern UX principles, offline-first functionality, and powerful productivity features.

![Today's Ledger Demo]<img width="1890" height="903" alt="image" src="https://github.com/user-attachments/assets/935866f3-4f38-4d43-8c03-8360b2ce2185" />

<p align="center">
  <a href="https://makeittodo.netlify.app/" target="_blank">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-Visit_Now-success?style=for-the-badge" />
  </a>
  <a href="https://github.com/yourusername/todays-ledger">
    <img src="https://img.shields.io/github/stars/yourusername/todays-ledger?style=for-the-badge" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />
  </a>
</p>

---

# 📑 Table of Contents

- Overview
- Live Demo
- Features
- Screenshots
- Tech Stack
- Project Architecture
- Folder Structure
- Installation
- Running the Project
- Available Scripts
- Application Workflow
- State Management
- Undo / Redo System
- Local Storage Persistence
- Cross Tab Synchronization
- Drag & Drop
- Bulk Operations
- Import & Export
- Keyboard Shortcuts
- Theme Support
- 3D Statistics
- Accessibility
- Performance Optimizations
- Future Roadmap
- Contributing
- License
- Author

---

# 📖 Overview

Today's Ledger is a modern productivity application inspired by notebook-style task management.

Unlike traditional todo apps, it focuses on:

- Offline-first experience
- Undoable actions
- Keyboard-first productivity
- Responsive design
- Fast local performance
- Zero backend
- Zero authentication
- Modern user experience

Everything is stored locally inside the browser using **localStorage**, allowing the application to continue working without an internet connection after the first load.

---

# 🚀 Live Demo

🌐 **Website**

https://makeittodo.netlify.app/

---

# ✨ Features

## Core Features

- ✅ Create Tasks
- ✅ Edit Tasks
- ✅ Delete Tasks
- ✅ Undo Delete
- ✅ Priority Levels
- ✅ Due Dates
- ✅ Tags
- ✅ Subtasks
- ✅ Progress Counter

---

## Organization

- Filter Tasks
- Search Tasks
- Tag Filtering
- Priority Sorting
- Due Date Sorting
- Alphabetical Sorting
- Manual Drag Sorting

---

## Bulk Operations

- Multi Select
- Delete Selected
- Complete Selected
- Tag Selected
- Undo Bulk Actions

---

## Productivity

- Full Undo / Redo
- Keyboard Shortcuts
- Toast Notifications
- Dark Mode
- Light Mode
- Cross Tab Sync

---

## Data Management

- Export JSON
- Import JSON
- Local Storage
- Offline Support

---

## Advanced

- Drag & Drop
- Animated 3D Statistics
- Responsive Layout
- Accessibility Support

---

# 🛠 Tech Stack

## Frontend

- React
- Redux Toolkit
- React Hooks
- Vite

---

## Styling

- CSS3
- CSS Variables
- Responsive Design

---

## State Management

- Redux Toolkit

---

## Storage

- localStorage

---

## Drag & Drop

- @dnd-kit

---

## Charts

- React Three Fiber

---

## Notifications

- Custom Toast Context

---

# 🏗 Project Architecture

```
User

      │

      ▼

React Components

      │

      ▼

Redux Store

      │

      ▼

Undoable Reducer

      │

      ▼

Persist to localStorage

      │

      ▼

Cross Tab Synchronization

      │

      ▼

UI Update
```

---

# 📂 Folder Structure

```
src/

├── app/
│   ├── store.js
│   ├── undoable.js
│   └── ToastContext.jsx
│
├── components/
│   ├── AddForm.jsx
│   ├── Todo.jsx
│   ├── ConfirmDialog.jsx
│   └── ShortcutsHelp.jsx
│
├── features/
│   ├── todo/
│   │   └── todoSlice.js
│   │
│   └── ui/
│       └── uiSlice.js
│
├── App.jsx
├── main.jsx
├── App.css
└── index.css
```

---

# ⚙ Installation

Clone the repository

```bash
git clone (https://github.com/mannuDev/makeittodo.git)
```

Go inside project

```bash
cd todays-ledger
```

Install packages

```bash
npm install
```

---

# ▶ Running the Project

Development

```bash
npm run dev
```

Production Build

```bash
npm run build
```

Preview Build

```bash
npm run preview
```

---

# 📜 Available Scripts

```bash
npm run dev
```

Starts development server.

---

```bash
npm run build
```

Build production version.

---

```bash
npm run preview
```

Preview production build locally.

---

# 🔄 Application Workflow

```
Create Task

↓

Redux Action

↓

Reducer

↓

Undo History

↓

Save to localStorage

↓

Update UI

↓

Sync Other Tabs
```

---

# 🧠 State Management

Redux Toolkit manages:

- Tasks
- UI State
- Theme
- Filters
- History
- Import
- Export

---

# ⏪ Undo / Redo System

Supported Actions

- Add
- Edit
- Delete
- Complete
- Bulk Actions
- Import
- Clear Completed

Ignored Actions

- Search
- Sorting
- Filtering
- Theme Toggle

Keyboard

```
Ctrl + Z

Ctrl + Shift + Z
```

---

# 💾 Local Storage

Automatically stores

- Tasks
- Theme
- Preferences

Features

- Debounced Save
- Corruption Safe
- Offline First

---

# 🔄 Cross Tab Synchronization

If multiple browser tabs are open

```
Tab A

↓

Update

↓

localStorage Event

↓

Tab B

↓

Auto Refresh
```

---

# 🖱 Drag & Drop

Powered by

```
@dnd-kit
```

Available only in

- Manual Sort

Unavailable when

- Searching
- Filtering
- Automatic Sorting

---

# 📦 Bulk Operations

Selection Mode includes

- Complete
- Delete
- Tag
- Undo

---

# 📁 Import & Export

Export

```
ledger.json
```

Import

```
Choose JSON File

↓

Confirmation

↓

Replace Current Data

↓

Undo Supported
```

---

# ⌨ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| N | New Task |
| / | Search |
| Shift + A | Mark All |
| Ctrl + Z | Undo |
| Ctrl + Shift + Z | Redo |
| Esc | Cancel |
| ? | Help |

---

# 🌙 Theme Support

- Light Mode
- Dark Mode
- Auto Detect System Theme
- Remember User Preference

---

# 📊 3D Statistics

Built with

```
React Three Fiber
```

Displays

- Open Tasks
- Completed Tasks

Lazy Loaded

---

# ♿ Accessibility

- Keyboard Navigation
- Focus Indicators
- ARIA Labels
- Reduced Motion
- Screen Reader Friendly

---

# ⚡ Performance Optimizations

- Memoized Selectors
- Lazy Loading
- Debounced Storage
- Optimized Rendering
- Cross Tab Sync
- Minimal Bundle Size

---

# 🚀 Future Roadmap

- Calendar View
- Notifications
- PWA Support
- Cloud Sync
- Team Collaboration
- Mobile App
- Recurring Tasks
- Categories
- Analytics Dashboard

---

# 🤝 Contributing

Contributions are welcome.

1. Fork repository

2. Create branch

```
git checkout -b feature-name
```

3. Commit

```
git commit -m "Added new feature"
```

4. Push

```
git push origin feature-name
```

5. Open Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Mannu Kumar**

MCA Graduate • Full Stack Developer

### Connect with me

- GitHub: https://github.com/mannuDev
- LinkedIn: https://linkedin.com/in/mmannusharma
- Portfolio: https://portfolio-frontend-s0ee.onrender.com/

---

<p align="center">

⭐ If you found this project useful, please consider giving it a Star on GitHub!

Made with ❤️ by Mannu Kumar

</p>
