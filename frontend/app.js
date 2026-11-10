const $ = (id) => document.getElementById(id);
const getPatients = () => JSON.parse(localStorage.getItem("plmun_patients") || "[]");
const getVisits = () => JSON.parse(localStorage.getItem("plmun_visits") || "[]");
const savePatients = (data) => localStorage.setItem("plmun_patients", JSON.stringify(data));
const saveVisits = (data) => localStorage.setItem("plmun_visits", JSON.stringify(data));
let selectedPatientId = null;

function seedDemoData() {
  const existingPatients = getPatients();
  const oldRecord = existingPatients.find(p => p.id === "p3" || p.fullName === "Divine Libanan" || p.fullName === "Dave Libanan");
  if (oldRecord) {
    oldRecord.fullName = "Divine Libanan";
    oldRecord.course = "BSIT";
    oldRecord.yearLevel = "2nd Year";
    savePatients(existingPatients);
  }
  if (localStorage.getItem("plmun_seeded")) return;
  const today = new Date().toISOString().slice(0, 10);
  const demo = [
    { id: "p1", fullName: "Juan Miguel Santos", birthdate: "2005-01-15", sex: "Male", studentNumber: "24123456", course: "BSIT", yearLevel: "3rd Year", bloodType: "O+", allergies: "None", conditions: "None", emergencyContact: "0917 123 4567", contactNumber: "", createdAt: today },
    { id: "p2", fullName: "Maria Angela Reyes", birthdate: "2004-07-21", sex: "Female", studentNumber: "24184718", course: "BSBA", yearLevel: "4th Year", bloodType: "A+", allergies: "None", conditions: "None", emergencyContact: "0918 234 5678", contactNumber: "", createdAt: today },
    { id: "p3", fullName: "Divine Libanan", birthdate: "2006-03-09", sex: "Female", studentNumber: "24174787", course: "BSIT", yearLevel: "2nd Year", bloodType: "B+", allergies: "None", conditions: "None", emergencyContact: "0919 345 6789", contactNumber: "", createdAt: today },
    { id: "p4", fullName: "Sophia Martinez", birthdate: "2003-11-02", sex: "Female", studentNumber: "24190876", course: "BSHM", yearLevel: "4th Year", bloodType: "AB+", allergies: "Seafood", conditions: "None", emergencyContact: "0920 456 7890", contactNumber: "", createdAt: today }
  ];
  savePatients(demo);
  saveVisits([
    { id: "v1", patientId: "p1", date: "2026-11-05", type: "General Checkup", complaint: "Routine checkup", assessment: "Healthy", treatment: "Vitamins", symptoms: "None", medication: "Multivitamins", remarks: "" },
    { id: "v2", patientId: "p2", date: "2026-10-15", type: "General Checkup", complaint: "Fever", assessment: "Viral Infection", treatment: "Paracetamol", symptoms: "Fever", medication: "Paracetamol", remarks: "" },
    { id: "v3", patientId: "p3", date: "2026-09-20", type: "General Checkup", complaint: "Cough", assessment: "Mild Cough", treatment: "Rest & Fluids", symptoms: "Cough", medication: "", remarks: "" }
  ]);
  localStorage.setItem("plmun_seeded", "yes");
}

function toast(message) {
  const el = $("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2600);
}

function go(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  const target = $(page + "Page");
  if (target) target.classList.remove("hidden");
  document.querySelectorAll(".nav-link").forEach(b => b.classList.toggle("active", b.dataset.page === page));
  const labels = { dashboard: "Dashboard", patients: "Patient Records", register: "Register New Patient", history: "Clinic Visit History", addVisit: "Add New Clinic Visit", reports: "Reports & Analytics", settings: "Settings", profile: "Patient Health Profile" };
  const icons = { dashboard: "fa-house", patients: "fa-users", register: "fa-user-plus", history: "fa-clipboard-list", addVisit: "fa-clipboard-medical", reports: "fa-chart-column", settings: "fa-gear", profile: "fa-user" };
  $("pageTitle").textContent = labels[page] || "Dashboard";
  $("topIcon").className = "fa-solid " + (icons[page] || "fa-house");
  $("sidebar")?.classList.remove("open");
  if (page === "dashboard") renderDashboard();
  if (page === "patients") renderPatients();
  if (page === "history") renderVisits();
  if (page === "addVisit") populatePatientSelect();
  if (page === "reports") renderReports();
}

document.querySelectorAll("[data-page]").forEach(b => b.addEventListener("click", () => go(b.dataset.page)));
document.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => go(b.dataset.go)));
$("mobileMenu").addEventListener("click", () => $("sidebar")?.classList.toggle("open"));

$("togglePassword")?.addEventListener("click", () => {
  const pwd = $("password");
  const eye = $("togglePassword").querySelector("i");
  if (!pwd) return;
  const isPassword = pwd.type === "password";
  pwd.type = isPassword ? "text" : "password";
  if (eye) {
    eye.className = isPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
  }
});

$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = $("username").value.trim();
  const password = $("password").value;
  const loginError = $("loginError");
  const submitButton = $("loginForm").querySelector('button[type="submit"]');

  loginError.textContent = "";
  submitButton.disabled = true;
  submitButton.textContent = "Signing in...";

  const allowDemoLogin = () => {
    $("loginPage").classList.add("hidden");
    $("app").classList.remove("hidden");
    $("password").value = "";
    seedDemoData();
    go("dashboard");
    toast("Welcome back, Administrator!");
  };

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      const cleanUser = email.toLowerCase();
      if ((cleanUser === "admin" || cleanUser === "admin@example.test" || cleanUser === "admin@plmun.edu.ph") && password === "admin123") {
        allowDemoLogin();
        return;
      }
      loginError.textContent = data.message || "Login failed.";
      return;
    }

    $("loginPage").classList.add("hidden");
    $("app").classList.remove("hidden");
    $("password").value = "";
    go("dashboard");
  } catch (error) {
    console.warn("Server unavailable, checking demo credentials...", error);
    const cleanUser = email.toLowerCase();
    if ((cleanUser === "admin" || cleanUser === "admin@example.test" || cleanUser === "admin@plmun.edu.ph") && password === "admin123") {
      allowDemoLogin();
      return;
    }
    loginError.textContent = "Cannot connect to the server. Use admin / admin123 for demo mode.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Sign In";
  }
});

$("logoutBtn").addEventListener("click", async () => {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
  } catch (err) {
    console.warn("Logout fetch skipped:", err);
  }
  $("app").classList.add("hidden");
  $("loginPage").classList.remove("hidden");
  $("password").value = "";
  $("username").value = "";
  $("loginError").textContent = "";
});

async function renderDashboard() {
  const recentPatientsElement = $("recentPatients");
  const recentActivityElement = $("recentActivity");

  recentPatientsElement.innerHTML = '<div class="empty-state">Loading recent patients...</div>';
  recentActivityElement.innerHTML = '<div class="empty-state">Loading clinic activity...</div>';

  try {
    const response = await fetch("/api/dashboard", { credentials: "same-origin" });

    if (response.status === 401) {
      $("app").classList.add("hidden");
      $("loginPage").classList.remove("hidden");
      $("loginError").textContent = "Please log in again.";
      return;
    }

    if (!response.ok) {
      throw new Error("API responded with error");
    }

    const data = await response.json();
    const stats = data.statistics || {};

    $("statPatients").textContent = stats.total_patients ?? 0;
    $("statToday").textContent = stats.visits_today ?? 0;
    $("statVisits").textContent = stats.total_visits ?? 0;
    $("statMonth").textContent = stats.total_patients ?? 0;

    const recentPatients = data.recent_patients || [];
    if (recentPatients.length) {
      recentPatientsElement.innerHTML = recentPatients.map((patient) => {
        const name = patient.full_name || "Unknown Patient";
        const studentNumber = patient.student_number || "—";
        const course = patient.course || "—";
        const registeredDate = formatDashboardDate(patient.created_at);
        return `
          <div class="recent-row">
            <div class="initials">${esc(initials(name))}</div>
            <div class="recent-main">
              <b>${esc(name)}</b>
              <small>${esc(course)} · ${esc(studentNumber)}</small>
            </div>
            <span class="recent-time">${esc(registeredDate)}</span>
          </div>
        `;
      }).join("");
    } else {
      renderLocalDashboardPatients();
    }

    const recentVisits = data.recent_visits || [];
    if (recentVisits.length) {
      recentActivityElement.innerHTML = recentVisits.map((visit) => {
        const name = visit.full_name || "Unknown Patient";
        const studentNumber = visit.student_number || "—";
        const checkupType = visit.checkup_type || "General Checkup";
        const assessment = visit.chief_complaint || "Routine Checkup";
        const visitDate = formatDashboardDate(visit.visit_date);
        return `
          <div class="activity-row">
            <div class="activity-icon"><i class="fa-solid fa-notes-medical"></i></div>
            <div class="activity-main">
              <b>${esc(name)}</b>
              <small>${esc(studentNumber)} · ${esc(checkupType)}</small>
            </div>
            <span class="status-pill">${esc(assessment)}</span>
            <span class="activity-time">${esc(visitDate)}</span>
          </div>
        `;
      }).join("");
    } else {
      renderLocalDashboardVisits();
    }
  } catch (error) {
    console.warn("Server unavailable, rendering local dashboard:", error);
    renderLocalDashboard();
  }
}

function renderLocalDashboardPatients() {
  const patients = getPatients();
  $("recentPatients").innerHTML = patients.slice(-4).reverse().map(p => `
    <div class="recent-row">
      <div class="initials">${initials(p.fullName)}</div>
      <div class="recent-main">
        <b>${esc(p.fullName)}</b>
        <small>${esc(p.course)} · ${esc(p.studentNumber)}</small>
      </div>
      <span class="recent-time">Recently added</span>
      <span class="status-pill">Active</span>
    </div>
  `).join("") || '<div class="empty-state">No patient records yet.</div>';
}

function renderLocalDashboardVisits() {
  const patients = getPatients();
  const visits = getVisits();
  $("recentActivity").innerHTML = visits.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4).map(v => {
    const p = patients.find(x => x.id === v.patientId);
    return `
      <div class="activity-row">
        <div class="activity-icon"><i class="fa-solid fa-notes-medical"></i></div>
        <div class="activity-main">
          <b>${p ? esc(p.fullName) : "Patient record"}</b>
          <small>${esc(v.type || "Checkup")} · ${esc(v.assessment || "Normal")}</small>
        </div>
        <span class="activity-time">${formatDate(v.date)}</span>
      </div>
    `;
  }).join("") || '<div class="empty-state">No clinic activity yet.</div>';
}

function renderLocalDashboard() {
  const patients = getPatients();
  const visits = getVisits();
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  $("statPatients").textContent = patients.length;
  $("statToday").textContent = visits.filter(v => v.date === today).length;
  $("statVisits").textContent = visits.length;
  $("statMonth").textContent = patients.filter(p => (p.createdAt || "").startsWith(month)).length || patients.length;

  renderLocalDashboardPatients();
  renderLocalDashboardVisits();
}

function initials(name) { return String(name || "").split(/\s+/).slice(0, 2).map(x => x[0]).join("").toUpperCase() }
function esc(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])) }
function formatDate(d) { if (!d) return "—"; return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }
function formatDashboardDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

let patientSearchTimer;
let patientRequestId = 0;

async function renderPatients() {
  const requestId = ++patientRequestId;
  const search = $("patientSearch").value.trim();
  const patientTable = $("patientTable");
  const emptyPatients = $("emptyPatients");

  patientTable.innerHTML = '<tr><td colspan="5">Loading patient records...</td></tr>';
  emptyPatients.classList.add("hidden");

  try {
    const params = new URLSearchParams({ search });
    const response = await fetch(`/api/patients?${params.toString()}`, { credentials: "same-origin" });

    if (requestId !== patientRequestId) return;

    if (response.status === 401) {
      $("app").classList.add("hidden");
      $("loginPage").classList.remove("hidden");
      $("loginError").textContent = "Please log in again.";
      return;
    }

    const data = await response.json();

    if (!response.ok || !Array.isArray(data.patients) || data.patients.length === 0) {
      renderLocalPatients();
      return;
    }

    const patients = data.patients;
    patientTable.innerHTML = patients.map((patient) => `
      <tr>
        <td>${esc(patient.full_name || "Unknown Patient")}</td>
        <td>${esc(patient.student_number || "—")}</td>
        <td>${esc(patient.course || "—")}</td>
        <td>${esc(patient.year_level || "—")}</td>
        <td><button class="table-action" data-view="${esc(patient.student_number)}">View</button></td>
      </tr>
    `).join("");

    emptyPatients.classList.toggle("hidden", patients.length > 0);
    document.querySelectorAll("#patientTable [data-view]").forEach((button) => {
      button.addEventListener("click", () => showProfile(button.dataset.view));
    });
  } catch (error) {
    if (requestId !== patientRequestId) return;
    renderLocalPatients();
  }
}

function renderLocalPatients() {
  const q = ($("patientSearch").value || "").trim().toLowerCase();
  const rows = getPatients().filter(p => (p.fullName + " " + p.studentNumber + " " + p.course).toLowerCase().includes(q));
  $("patientTable").innerHTML = rows.map(p => `
    <tr>
      <td>${esc(p.fullName)}</td>
      <td>${esc(p.studentNumber)}</td>
      <td>${esc(p.course)}</td>
      <td>${esc(p.yearLevel)}</td>
      <td><button class="table-action" data-view="${p.id}">View</button></td>
    </tr>
  `).join("");
  $("emptyPatients").classList.toggle("hidden", rows.length > 0);
  document.querySelectorAll("#patientTable [data-view]").forEach(b => {
    b.addEventListener("click", () => showProfile(b.dataset.view));
  });
}

$("patientSearch").addEventListener("input", () => {
  clearTimeout(patientSearchTimer);
  patientSearchTimer = setTimeout(renderPatients, 300);
});

function resetPatientForm() { $("patientForm").reset(); $("patientId").value = ""; }

$("patientForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = $("patientForm");
  const submitButton = form.querySelector('button[type="submit"]');
  const studentNumber = $("studentNumber").value.trim();
  const fullName = $("fullName").value.trim();
  const patientIdInput = $("patientId").value; // Sinusuri kung mayroon nang ID (ibig sabihin edit mode)

  if (!studentNumber || !fullName) {
    toast("Student number and full name are required.");
    return;
  }

  const isEditing = Boolean(patientIdInput);

  const patient = {
    id: patientIdInput || "p" + Date.now(),
    studentNumber: studentNumber,
    fullName: fullName,
    birthdate: $("birthdate").value,
    sex: $("sex").value,
    course: $("course").value,
    yearLevel: $("yearLevel").value,
    bloodType: $("bloodType").value,
    allergies: $("allergies").value.trim() || "None",
    conditions: $("conditions").value.trim() || "None",
    emergencyContact: $("emergencyContact").value.trim() || "—",
    contactNumber: $("contactNumber").value.trim() || "—",
    createdAt: new Date().toISOString().slice(0, 10)
  };

  submitButton.disabled = true;
  submitButton.textContent = "Saving...";

  try {
    const response = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        student_number: patient.studentNumber,
        full_name: patient.fullName,
        birthdate: patient.birthdate,
        sex: patient.sex,
        course: patient.course,
        year_level: patient.yearLevel,
        blood_type: patient.bloodType,
        allergies: patient.allergies,
        medical_conditions: patient.conditions,
        emergency_contact: patient.emergencyContact,
        contact_number: patient.contactNumber
      })
    });

    if (response.ok) {
      if (isEditing) {
        toast("Save changes successfully.");
      } else {
        toast("New patient record added successfully.");
      }
    } else {
      throw new Error("Server save failed");
    }
  } catch (err) {
    console.warn("Saved to local storage fallback:", err);
    const existing = getPatients();
    savePatients([...existing.filter(p => p.id !== patient.id), patient]);
    
    if (isEditing) {
      toast("Save changes successfully.");
    } else {
      toast("New patient record added successfully.");
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Save Record";
    resetPatientForm();
    await renderDashboard();
    go("patients");
  }
});

async function showProfile(identifier) {
  selectedPatientId = identifier;
  go("profile");
  $("profileName").textContent = "Loading patient...";
  $("profileNumber").textContent = identifier;
  $("profileCourse").textContent = "—";
  $("profileInfo").innerHTML = '<div class="empty-state">Loading profile...</div>';
  $("profileVisits").innerHTML = '<tr><td colspan="4">Loading visit history...</td></tr>';

  try {
    const encoded = encodeURIComponent(identifier);
    const [profileResponse, visitsResponse] = await Promise.all([
      fetch(`/api/patients/${encoded}`, { credentials: "same-origin" }),
      fetch(`/api/patients/${encoded}/visits`, { credentials: "same-origin" })
    ]);

    if (!profileResponse.ok) throw new Error("Local profile fallback");

    const profileData = await profileResponse.json();
    const visitsData = await visitsResponse.json();
    const patient = profileData.patient;

    $("profileName").textContent = patient.full_name || "Unknown Patient";
    $("profileNumber").textContent = patient.student_number || "—";
    $("profileCourse").textContent = `${patient.course || "—"} · ${patient.year_level || "—"}`;

    const fields = [
      ["Birthdate", formatDashboardDate(patient.birthdate)],
      ["Sex", patient.sex || "—"],
      ["Blood Type", patient.blood_type || "—"],
      ["Allergies", patient.allergies || "None"],
      ["Medical Conditions", patient.medical_conditions || "None"],
      ["Emergency Contact", patient.emergency_contact || "—"],
      ["Contact Number", patient.contact_number || "—"],
      ["Registered", formatDashboardDate(patient.created_at)]
    ];
    $("profileInfo").innerHTML = fields.map(([label, value]) => `<div class="info-item"><span>${esc(label)}</span><b>${esc(value)}</b></div>`).join("");

    const visits = visitsData.visits || [];
    $("profileVisits").innerHTML = visits.map((visit) => `
      <tr>
        <td>${esc(formatDashboardDate(visit.visit_date))}</td>
        <td>${esc(visit.chief_complaint || "—")}</td>
        <td>${esc(visit.medical_assessment || "—")}</td>
        <td>${esc(visit.treatment_given || "—")}</td>
      </tr>
    `).join("") || '<tr><td colspan="4">No visits recorded.</td></tr>';
  } catch (error) {
    showLocalProfile(identifier);
  }
}

function showLocalProfile(identifier) {
  const p = getPatients().find(x => x.id === identifier || x.studentNumber === identifier);
  if (!p) {
    $("profileName").textContent = "Patient not found";
    $("profileInfo").innerHTML = '<div class="empty-state">No record found.</div>';
    $("profileVisits").innerHTML = '<tr><td colspan="4">No visits recorded.</td></tr>';
    return;
  }
  selectedPatientId = p.id;
  $("profileName").textContent = p.fullName;
  $("profileNumber").textContent = p.studentNumber;
  $("profileCourse").textContent = `${p.course} · ${p.yearLevel}`;
  const fields = [
    ["Birthdate", formatDate(p.birthdate)],
    ["Sex", p.sex],
    ["Blood Type", p.bloodType || "—"],
    ["Allergies", p.allergies || "None"],
    ["Medical Conditions", p.conditions || "None"],
    ["Emergency Contact", p.emergencyContact || "—"],
    ["Contact Number", p.contactNumber || "—"],
    ["Registered", formatDate(p.createdAt)]
  ];
  $("profileInfo").innerHTML = fields.map(([label, value]) => `<div class="info-item"><span>${esc(label)}</span><b>${esc(value)}</b></div>`).join("");
  const visits = getVisits().filter(v => v.patientId === p.id).sort((a, b) => b.date.localeCompare(a.date));
  $("profileVisits").innerHTML = visits.map(v => `
    <tr>
      <td>${esc(formatDate(v.date))}</td>
      <td>${esc(v.complaint || "—")}</td>
      <td>${esc(v.assessment || "—")}</td>
      <td>${esc(v.treatment || "—")}</td>
    </tr>
  `).join("") || '<tr><td colspan="4">No visits recorded.</td></tr>';
}

$("editPatientBtn").addEventListener("click", () => {
  const p = getPatients().find(x => x.id === selectedPatientId || x.studentNumber === selectedPatientId);
  if (!p) return;
  go("register");
  Object.entries({
    patientId: "id", fullName: "fullName", birthdate: "birthdate", sex: "sex",
    studentNumber: "studentNumber", course: "course", yearLevel: "yearLevel",
    bloodType: "bloodType", allergies: "allergies", conditions: "conditions",
    emergencyContact: "emergencyContact", contactNumber: "contactNumber"
  }).forEach(([field, key]) => { if ($(field)) $(field).value = p[key] || ""; });
});

$("addVisitFromProfile").addEventListener("click", () => {
  go("addVisit");
  $("visitPatient").value = selectedPatientId;
});

function populatePatientSelect() {
  const select = $("visitPatient");
  if (!select) return;
  const current = select.value;
  select.innerHTML = '<option value="">Select patient</option>' + getPatients().map(p => `<option value="${p.id}">${esc(p.fullName)} — ${esc(p.studentNumber)}</option>`).join("");
  if (current) select.value = current;
  if (!current && selectedPatientId) select.value = selectedPatientId;
  if (!$("visitDate").value) $("visitDate").value = new Date().toISOString().slice(0, 10);
}

$("visitForm").addEventListener("submit", e => {
  e.preventDefault();
  const visits = getVisits();
  visits.push({
    id: "v" + Date.now(),
    patientId: $("visitPatient").value,
    date: $("visitDate").value,
    type: $("visitType").value,
    assessment: $("assessment").value.trim(),
    complaint: $("complaint").value.trim(),
    treatment: $("treatment").value.trim(),
    symptoms: $("symptoms").value.trim(),
    medication: $("medication").value.trim(),
    remarks: $("remarks").value.trim()
  });
  saveVisits(visits);
  $("visitForm").reset();
  toast("Clinic visit successfully saved.");
  go("history");
});

function renderVisits() {
  const q = ($("visitSearch").value || "").toLowerCase();
  const patients = getPatients();
  const rows = getVisits().map(v => ({ ...v, patient: patients.find(p => p.id === v.patientId) })).filter(v => ((v.patient?.fullName || "") + " " + (v.patient?.studentNumber || "") + " " + v.complaint + " " + v.assessment).toLowerCase().includes(q)).sort((a, b) => b.date.localeCompare(a.date));
  $("visitTable").innerHTML = rows.map(v => `
    <tr>
      <td>${formatDate(v.date)}</td>
      <td>${esc(v.patient?.fullName || "Unknown")}</td>
      <td>${esc(v.patient?.studentNumber || "—")}</td>
      <td>${esc(v.complaint)}</td>
      <td>${esc(v.assessment)}</td>
      <td>${esc(v.treatment)}</td>
    </tr>
  `).join("");
  $("emptyVisits").classList.toggle("hidden", rows.length > 0);
}

$("visitSearch").addEventListener("input", renderVisits);

function renderReports() {
  const patients = getPatients();
  $("reportPatients").textContent = patients.length;
  $("reportVisits").textContent = getVisits().length;
  const counts = {};
  patients.forEach(p => counts[p.course] = (counts[p.course] || 0) + 1);
  $("courseBreakdown").innerHTML = Object.entries(counts).map(([course, count]) => `<div class="break-row"><b>${esc(course)}</b><span>${count} patient(s)</span></div>`).join("") || '<p class="muted">No records available.</p>';
}

$("clearDataBtn").addEventListener("click", () => {
  if (confirm("Delete all patient and visit records stored in this browser? This cannot be undone.")) {
    localStorage.removeItem("plmun_patients");
    localStorage.removeItem("plmun_visits");
    localStorage.removeItem("plmun_seeded");
    seedDemoData();
    renderDashboard();
    toast("Demo data reset.");
    go("dashboard");
  }
});

seedDemoData();