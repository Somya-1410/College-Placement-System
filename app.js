const STORAGE_KEY = "cps_data_v1";
const STATUS_OPTIONS = ["Applied", "Shortlisted", "Selected", "Rejected"];

let currentRole = "student";
let state;

function seedData() {
  return {
    student: {
      name: "Mohd Uvesh Shaikh",
      enroll: "EN23IT301042",
      cgpa: 8.6
    },
    drives: [
      {
        id: 1,
        company: "TCS",
        role: "Software Engineer",
        pkg: "7 LPA",
        cgpa: 6.5,
        last: "2026-12-20"
      },
      {
        id: 2,
        company: "Infosys",
        role: "Systems Engineer",
        pkg: "6.5 LPA",
        cgpa: 6.0,
        last: "2026-12-28"
      },
      {
        id: 3,
        company: "Product Startup",
        role: "Backend Developer",
        pkg: "12 LPA",
        cgpa: 8.5,
        last: "2027-01-10"
      }
    ],
    apps: []
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    state = raw ? JSON.parse(raw) : seedData();
  } catch (err) {
    state = seedData();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    // Ignore storage quota errors in restricted browser modes
  }
}

function showToast(message) {
  const el = document.getElementById("msg");
  if (!el) return;
  el.textContent = message;
  el.classList.add("is-visible");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    el.classList.remove("is-visible");
  }, 2500);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

function getValue(id) {
  const input = document.getElementById(id);
  return input ? input.value : "";
}

function findDrive(driveId) {
  return state.drives.find((d) => String(d.id) === String(driveId));
}

function hasApplied(driveId) {
  return state.apps.some(
    (a) => String(a.driveId) === String(driveId) && a.enroll === state.student.enroll
  );
}

function setRole(role) {
  currentRole = role === "admin" ? "admin" : "student";
  const studentTab = document.getElementById("tS");
  const adminTab = document.getElementById("tA");

  if (studentTab && adminTab) {
    const isStudent = currentRole === "student";
    studentTab.classList.toggle("is-active", isStudent);
    studentTab.setAttribute("aria-selected", String(isStudent));
    adminTab.classList.toggle("is-active", !isStudent);
    adminTab.setAttribute("aria-selected", String(!isStudent));
  }

  render();
}

function saveProfile() {
  const name = getValue("pn").trim();
  const enroll = getValue("pe").trim();
  const cgpa = parseFloat(getValue("pc"));

  if (!name || !enroll || Number.isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
    showToast("Enter valid name, enrollment no., and CGPA (0–10).");
    return;
  }

  state.student = { name, enroll, cgpa };
  saveState();
  showToast("Student profile saved.");
  render();
}

function applyToDrive(driveId) {
  const drive = findDrive(driveId);
  if (!drive) return;

  if (state.student.cgpa < drive.cgpa) {
    showToast(`Not eligible: minimum CGPA required is ${drive.cgpa}.`);
    return;
  }

  if (hasApplied(driveId)) {
    showToast("You have already applied to this drive.");
    return;
  }

  state.apps.push({
    id: Date.now(),
    driveId: drive.id,
    enroll: state.student.enroll,
    name: state.student.name,
    cgpa: state.student.cgpa,
    status: "Applied"
  });

  saveState();
  showToast(`Application submitted for ${drive.company}.`);
  render();
}

function addDrive() {
  const company = getValue("dc").trim();
  const role = getValue("dr").trim();
  const pkg = getValue("dp").trim();
  const cgpa = parseFloat(getValue("dg"));
  const last = getValue("dl");

  if (!company || !role || !pkg || Number.isNaN(cgpa) || cgpa < 0 || cgpa > 10 || !last) {
    showToast("Complete all drive fields with a valid CGPA (0–10).");
    return;
  }

  state.drives.push({
    id: Date.now(),
    company,
    role,
    pkg,
    cgpa,
    last
  });

  saveState();
  showToast("New placement drive posted.");
  render();
}

function deleteDrive(driveId) {
  state.drives = state.drives.filter((d) => String(d.id) !== String(driveId));
  state.apps = state.apps.filter((a) => String(a.driveId) !== String(driveId));
  saveState();
  showToast("Drive and related applications removed.");
  render();
}

function updateStatus(appId, nextStatus) {
  const app = state.apps.find((a) => String(a.id) === String(appId));
  if (!app || !STATUS_OPTIONS.includes(nextStatus)) return;
  app.status = nextStatus;
  saveState();
  showToast(`Status updated to ${nextStatus}.`);
  render();
}

function updateStats() {
  document.getElementById("sD").textContent = String(state.drives.length);
  document.getElementById("sA").textContent = String(state.apps.length);

  const placedStudents = new Set(
    state.apps.filter((a) => a.status === "Selected").map((a) => a.enroll)
  );
  document.getElementById("sP").textContent = String(placedStudents.size);
}

function renderStudentView() {
  const s = state.student;
  const myApps = state.apps.filter((a) => a.enroll === s.enroll);

  let drivesHtml = "";
  if (!state.drives.length) {
    drivesHtml = '<p class="empty-state">No open drives right now. Check back soon.</p>';
  } else {
    drivesHtml = `<div class="drive-list">${state.drives
      .map((d) => {
        const eligible = s.cgpa >= d.cgpa;
        const alreadyApplied = hasApplied(d.id);
        const disabled = !eligible || alreadyApplied;
        const btnLabel = alreadyApplied
          ? "Applied"
          : eligible
            ? "Apply Now"
            : "Not Eligible";

        return `
          <article class="drive-item">
            <div>
              <h3 class="drive-title">
                <span class="drive-company">${escapeHtml(d.company)}</span> — ${escapeHtml(d.role)}
              </h3>
              <div class="meta-row">
                <span>Package: <strong class="meta-chip">${escapeHtml(d.pkg)}</strong></span>
                <span>Min CGPA: <strong class="meta-chip">${escapeHtml(d.cgpa)}</strong></span>
                <span>Apply by: <strong class="meta-chip">${escapeHtml(d.last)}</strong></span>
              </div>
            </div>
            <button
              class="btn btn-accent"
              ${disabled ? "disabled" : ""}
              onclick="applyToDrive(${d.id})"
            >
              ${btnLabel}
            </button>
          </article>
        `;
      })
      .join("")}</div>`;
  }

  let appsHtml = "";
  if (!myApps.length) {
    appsHtml = '<p class="empty-state">You have not applied to any drives yet.</p>';
  } else {
    appsHtml = `<div class="drive-list">${myApps
      .map((a) => {
        const drive = findDrive(a.driveId);
        const title = drive
          ? `${escapeHtml(drive.company)} — ${escapeHtml(drive.role)}`
          : "Removed Drive";
        const safeStatus = STATUS_OPTIONS.includes(a.status) ? a.status : "Applied";

        return `
          <div class="applicant-row">
            <div>
              <strong>${title}</strong>
              <div class="meta-row">
                <span>Enrollment: <strong class="meta-chip">${escapeHtml(a.enroll)}</strong></span>
                <span>CGPA at Apply: <strong class="meta-chip">${escapeHtml(a.cgpa)}</strong></span>
              </div>
            </div>
            <span class="status-badge ${safeStatus}">${safeStatus}</span>
          </div>
        `;
      })
      .join("")}</div>`;
  }

  return `
    <section class="card">
      <div class="card-header">
        <h2>Student Profile</h2>
        <span class="pill-count">Current CGPA: ${escapeHtml(s.cgpa)}</span>
      </div>
      <div class="form-grid">
        <div class="field">
          <label for="pn">Full Name</label>
          <input id="pn" type="text" value="${escapeHtml(s.name)}" />
        </div>
        <div class="field">
          <label for="pe">Enrollment Number</label>
          <input id="pe" type="text" value="${escapeHtml(s.enroll)}" />
        </div>
      </div>
      <div class="field" style="margin-top: 14px; max-width: 260px;">
        <label for="pc">CGPA (0.0 – 10.0)</label>
        <input id="pc" type="number" step="0.1" min="0" max="10" value="${escapeHtml(s.cgpa)}" />
      </div>
      <button class="btn" onclick="saveProfile()">Save Profile</button>
    </section>

    <section class="card">
      <div class="card-header">
        <h2>Open Campus Drives</h2>
        <span class="pill-count">${state.drives.length} Drive(s)</span>
      </div>
      ${drivesHtml}
    </section>

    <section class="card">
      <div class="card-header">
        <h2>My Applications</h2>
        <span class="pill-count">${myApps.length} Submitted</span>
      </div>
      ${appsHtml}
    </section>
  `;
}

function renderAdminView() {
  let drivesAdminHtml = "";
  if (!state.drives.length) {
    drivesAdminHtml = '<p class="empty-state">No drives posted yet. Use the form above to add one.</p>';
  } else {
    drivesAdminHtml = `<div class="drive-list">${state.drives
      .map((d) => {
        const applicants = state.apps.filter((a) => String(a.driveId) === String(d.id));
        const applicantsMarkup = applicants.length
          ? `<div class="applicant-box">${applicants
              .map((a) => {
                const safeStatus = STATUS_OPTIONS.includes(a.status) ? a.status : "Applied";
                const optionsHtml = STATUS_OPTIONS.map(
                  (opt) =>
                    `<option value="${opt}" ${opt === safeStatus ? "selected" : ""}>${opt}</option>`
                ).join("");

                return `
                  <div class="applicant-row">
                    <div>
                      <strong>${escapeHtml(a.name)}</strong>
                      <div class="meta-row">
                        <span>Enroll: <strong class="meta-chip">${escapeHtml(a.enroll)}</strong></span>
                        <span>CGPA: <strong class="meta-chip">${escapeHtml(a.cgpa)}</strong></span>
                      </div>
                    </div>
                    <div class="applicant-controls">
                      <span class="status-badge ${safeStatus}">${safeStatus}</span>
                      <select
                        aria-label="Update status for ${escapeHtml(a.name)}"
                        onchange="updateStatus(${a.id}, this.value)"
                      >
                        ${optionsHtml}
                      </select>
                    </div>
                  </div>
                `;
              })
              .join("")}</div>`
          : '<p class="empty-state" style="margin-top: 12px; padding: 10px;">No applicants for this drive yet.</p>';

        return `
          <article class="drive-item" style="display: block;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap;">
              <div>
                <h3 class="drive-title">
                  <span class="drive-company">${escapeHtml(d.company)}</span> — ${escapeHtml(d.role)}
                </h3>
                <div class="meta-row">
                  <span>Package: <strong class="meta-chip">${escapeHtml(d.pkg)}</strong></span>
                  <span>Min CGPA: <strong class="meta-chip">${escapeHtml(d.cgpa)}</strong></span>
                  <span>Deadline: <strong class="meta-chip">${escapeHtml(d.last)}</strong></span>
                  <span>Applicants: <strong class="meta-chip">${applicants.length}</strong></span>
                </div>
              </div>
              <button class="btn btn-danger" style="margin-top: 0;" onclick="deleteDrive(${d.id})">
                Remove Drive
              </button>
            </div>
            ${applicantsMarkup}
          </article>
        `;
      })
      .join("")}</div>`;
  }

  return `
    <section class="card">
      <div class="card-header">
        <h2>Post a New Drive</h2>
        <span class="pill-count">Placement Officer</span>
      </div>
      <div class="form-grid">
        <div class="field">
          <label for="dc">Company Name</label>
          <input id="dc" type="text" placeholder="e.g., Capgemini" />
        </div>
        <div class="field">
          <label for="dr">Job Role</label>
          <input id="dr" type="text" placeholder="e.g., Analyst / Developer" />
        </div>
        <div class="field">
          <label for="dp">Package (CTC)</label>
          <input id="dp" type="text" placeholder="e.g., 7.5 LPA" />
        </div>
        <div class="field">
          <label for="dg">Minimum CGPA</label>
          <input id="dg" type="number" step="0.1" min="0" max="10" placeholder="e.g., 7.0" />
        </div>
      </div>
      <div class="field" style="margin-top: 14px; max-width: 260px;">
        <label for="dl">Last Date to Apply</label>
        <input id="dl" type="date" />
      </div>
      <button class="btn" onclick="addDrive()">Post Drive</button>
    </section>

    <section class="card">
      <div class="card-header">
        <h2>Drives &amp; Applicants</h2>
        <span class="pill-count">${state.drives.length} Active Drive(s)</span>
      </div>
      ${drivesAdminHtml}
    </section>
  `;
}

function render() {
  updateStats();
  const appRoot = document.getElementById("app");
  if (!appRoot) return;
  appRoot.innerHTML = currentRole === "student" ? renderStudentView() : renderAdminView();
}

loadState();
render();