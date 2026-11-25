# College Placement System — Medi-Caps University

A responsive, client-side web application built to streamline campus recruitment for the **Training & Placement Cell, Medi-Caps University**[cite: 1, 2]. It centralizes placement drives, automates CGPA eligibility validation, prevents duplicate applications, and provides separate workflows for **Students** and **Placement Officers**—running completely in the browser with `localStorage` persistence.

---

## Live Demo

- **GitHub Pages:** `https://somya-1410.github.io/College-Placement-System/`[cite: 4]

---

## Key Features

### Student View
- **Profile Management:** Save and update student details (Full Name, Enrollment Number, and CGPA on a `0.0 – 10.0` scale)[cite: 1, 2].
- **Automated Eligibility Check:** Automatically compares the student's CGPA against each drive's minimum CGPA requirement (`CGPA >= min_cgpa`) before enabling the **Apply Now** button[cite: 1, 2].
- **One-Click Application & Duplicate Prevention:** Submit applications in a single click while blocking repeat submissions for the same drive.
- **Live Status Tracking:** Track application outcomes in real time (`Applied`, `Shortlisted`, `Selected`, or `Rejected`).

### Placement Officer View
- **Post Campus Drives:** Publish new recruitment drives with Company Name, Job Role, Package (CTC), Minimum CGPA cutoff, and Application Deadline[cite: 1, 2].
- **Applicant Management:** View all applicants per drive along with their enrollment numbers and CGPA[cite: 1, 2].
- **Status Updates & Drive Cleanup:** Update candidate selection stages (`Applied` → `Shortlisted` → `Selected` / `Rejected`) or remove closed drives[cite: 1, 2].

### Interface & Dashboard
- **Real-Time Summary Metrics:** Live counters for **Open Drives**, **Applications**, and **Students Placed**[cite: 1, 2].
- **Light & Dark Mode:** Built-in theme toggle that remembers the user's preference across sessions.
- **Zero-Backend Persistence:** Stores profiles, drives, and applications in browser `localStorage` so data persists across page refreshes.

---

## Tech Stack

- **Frontend:** HTML5, CSS3 (Custom Properties, CSS Grid & Flexbox), Vanilla JavaScript (ES6+)
- **Storage:** Browser `localStorage` (JSON)
- **Hosting:** GitHub Pages

---

## Project Structure

```text
College-Placement-System/
├── index.html          # Main application layout and top navigation bar
├── styles.css          # Responsive styling, status badges, and Light/Dark theme variables
├── app.js              # State management, eligibility checks, and role-based rendering
├── medicaps-logo.png   # University branding logo displayed in the header
└── README.md           # Project documentation