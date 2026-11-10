
const $ = (id) => document.getElementById(id);
const getPatients = () => JSON.parse(localStorage.getItem("plmun_patients") || "[]");
const getVisits = () => JSON.parse(localStorage.getItem("plmun_visits") || "[]");
const savePatients = (data) => localStorage.setItem("plmun_patients", JSON.stringify(data));
const saveVisits = (data) => localStorage.setItem("plmun_visits", JSON.stringify(data));
let selectedPatientId = null;

function seedDemoData() {
  // Update the existing demo record if this browser was seeded by an earlier version.
  const existingPatients = getPatients();
  const oldDivineRecord = existingPatients.find(p => p.id === "p3" || p.fullName === "Dave Libanan" || p.fullName === "Divine Libanan");
  if (oldDivineRecord) {
    oldDivineRecord.fullName = "Divine Libanan";
    oldDivineRecord.course = "BSIT";
    oldDivineRecord.yearLevel = "2nd Year";
    savePatients(existingPatients);
  }
  if (localStorage.getItem("plmun_seeded")) return;
  const today = new Date().toISOString().slice(0, 10);
  const demo = [
    { id: "p1", fullName: "Juan Miguel Santos", birthdate: "2005-01-15", sex: "Male", studentNumber: "2023-00125", course: "BSIT", yearLevel: "3rd Year", bloodType: "O+", allergies: "None", conditions: "None", emergencyContact: "0917 123 4567", contactNumber: "", createdAt: today },
    { id: "p2", fullName: "Maria Angela Reyes", birthdate: "2004-07-21", sex: "Female", studentNumber: "2022-00418", course: "BSBA", yearLevel: "4th Year", bloodType: "A+", allergies: "None", conditions: "None", emergencyContact: "0918 234 5678", contactNumber: "", createdAt: today },
    { id: "p3", fullName: "Divine Libanan", birthdate: "2006-03-09", sex: "Female", studentNumber: "2023-00210", course: "BSIT", yearLevel: "2nd Year", bloodType: "B+", allergies: "None", conditions: "None", emergencyContact: "0919 345 6789", contactNumber: "", createdAt: today },
    { id: "p4", fullName: "Sophia Martinez", birthdate: "2003-11-02", sex: "Female", studentNumber: "2021-00876", course: "BSHM", yearLevel: "4th Year", bloodType: "AB+", allergies: "Seafood", conditions: "None", emergencyContact: "0920 456 7890", contactNumber: "", createdAt: today }
  ];
  savePatients(demo);
  saveVisits([
    { id: "v1", patientId: "p1", date: "2026-11-05", type: "General Checkup", complaint: "Routine checkup", assessment: "Healthy", treatment: "Vitamins", symptoms: "None", medication: "Multivitamins", remarks: "" },
    { id: "v2", patientId: "p2", date: "2026-10-15", type: "General Checkup", complaint: "Fever", assessment: "Viral Infection", treatment: "Paracetamol", symptoms: "Fever", medication: "Paracetamol", remarks: "" },
    { id: "v3", patientId: "p3", date: "2026-09-20", type: "General Checkup", complaint: "Cough", assessment: "Mild Cough", treatment: "Rest & Fluids", symptoms: "Cough", medication: "", remarks: "" }
  ]);
  localStorage.setItem("plmun_seeded", "yes");
}
function toast(message) { const el = $("toast"); el.textContent = message; el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 2600) }
function go(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  const target = $(page + "Page"); if (target) target.classList.remove("hidden");
  document.querySelectorAll(".nav-link").forEach(b => b.classList.toggle("active", b.dataset.page === page));
  const labels = { dashboard: "Dashboard", patients: "Patient Records", register: "Register New Patient", history: "Clinic Visit History", addVisit: "Add New Clinic Visit", reports: "Reports & Analytics", settings: "Settings", profile: "Patient Health Profile" };
  const icons = { dashboard: "fa-house", patients: "fa-users", register: "fa-user-plus", history: "fa-clipboard-list", addVisit: "fa-clipboard-medical", reports: "fa-chart-column", settings: "fa-gear", profile: "fa-user" };
  $("pageTitle").textContent = labels[page] || "Dashboard"; $("topIcon").className = "fa-solid " + (icons[page] || "fa-house");
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

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "same-origin",
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      // Offline fallback if server database is not ready
      const cleanUser = email.toLowerCase();
      if ((cleanUser === "admin" || cleanUser === "admin@example.test" || cleanUser === "admin@plmun.edu.ph") && password === "admin123") {
        $("loginPage").classList.add("hidden");
        $("app").classList.remove("hidden");
        $("password").value = "";
        seedDemoData();
        go("dashboard");
        toast("Logged in as Demo Administrator");
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
    console.warn("Backend server not reachable, trying demo login...", error);
    const cleanUser = email.toLowerCase();
    if ((cleanUser === "admin" || cleanUser === "admin@example.test" || cleanUser === "admin@plmun.edu.ph") && password === "admin123") {
      $("loginPage").classList.add("hidden");
      $("app").classList.remove("hidden");
      $("password").value = "";
      seedDemoData();
      go("dashboard");
      toast("Offline Mode: Logged in as Administrator");
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
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin"
    });

    if (!response.ok) {
      toast("Logout failed. Please try again.");
      return;
    }

    $("app").classList.add("hidden");
    $("loginPage").classList.remove("hidden");
    $("password").value = "";
    $("username").value = "";
    $("loginError").textContent = "";
  } catch (error) {
    console.error("Logout error:", error);
    toast("Cannot connect to the server.");
  }
});


async function renderDashboard() {
  const recentPatientsElement = $("recentPatients");
  const recentActivityElement = $("recentActivity");

  recentPatientsElement.innerHTML = '<div class="empty-state">Loading recent patients...</div>';
  recentActivityElement.innerHTML = '<div class="empty-state">Loading clinic activity...</div>';

  try {
    const response = await fetch("/api/dashboard", {
      credentials: "same-origin"
    });

    if (response.status === 401) {
      $("app").classList.add("hidden");
      $("loginPage").classList.remove("hidden");
      $("loginError").textContent = "Please log in again.";
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to load dashboard");
    }

    const data = await response.json();
    const stats = data.statistics || {};

    $("statPatients").textContent = stats.total_patients ?? 0;
    $("statToday").textContent = stats.visits_today ?? 0;
    $("statVisits").textContent = stats.total_visits ?? 0;


    $("statMonth").textContent = "—";

    const recentPatients = data.recent_patients || [];

    recentPatientsElement.innerHTML = recentPatients.length
      ? recentPatients.map((patient) => {
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
      }).join("")
      : '<div class="empty-state">No recent patients found.</div>';

    const recentVisits = data.recent_visits || [];

    recentActivityElement.innerHTML = recentVisits.length
      ? recentVisits.map((visit) => {
        const name = visit.full_name || "Unknown Patient";
        const studentNumber = visit.student_number || "—";
        const checkupType = visit.checkup_type || "Unspecified checkup";
        const assessment = visit.assessment || "No assessment";
        const visitDate = formatDashboardDate(visit.visit_date);

        return `
            <div class="activity-row">
              <div class="activity-icon"><i class="fa-solid fa-stethoscope"></i></div>

              <div class="activity-main">
                <b>${esc(name)}</b>
                <small>${esc(studentNumber)} · ${esc(checkupType)}</small>
              </div>

              <span class="status-pill">${esc(assessment)}</span>
              <span class="activity-time">${esc(visitDate)}</span>
            </div>
          `;
      }).join("")
      : '<div class="empty-state">No recent clinic activity found.</div>';

    console.log("Dashboard loaded:", data);
  } catch (error) {
    console.error("Dashboard error:", error);
    recentPatientsElement.innerHTML = '<div class="empty-state">Unable to load recent patients.</div>';
    recentActivityElement.innerHTML = '<div class="empty-state">Unable to load clinic activity.</div>';
    toast("Unable to load dashboard data.");
  }
}


function initials(name) { return name.split(/\s+/).slice(0, 2).map(x => x[0]).join("").toUpperCase() }
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
    const response = await fetch(`/api/patients?${params.toString()}`, {
      credentials: "same-origin"
    });

    if (requestId !== patientRequestId) return;

    if (response.status === 401) {
      $("app").classList.add("hidden");
      $("loginPage").classList.remove("hidden");
      $("loginError").textContent = "Please log in again.";
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load patient records");
    }

    if (!Array.isArray(data.patients)) {
      throw new Error("Invalid patient data received from the server");
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

    emptyPatients.textContent = search
      ? "No patients match your search."
      : "No patient records found. Register a patient to get started.";
    emptyPatients.classList.toggle("hidden", patients.length > 0);

    document.querySelectorAll("#patientTable [data-view]").forEach((button) => {
      button.addEventListener("click", () => showProfile(button.dataset.view));
    });
  } catch (error) {
    if (requestId !== patientRequestId) return;
    console.error("Patient records error:", error);
    patientTable.innerHTML = "";
    emptyPatients.textContent = error.message || "Unable to load patient records.";
    emptyPatients.classList.remove("hidden");
  }
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

  if (!/^\d{8}$/.test(studentNumber)) {
    toast("Student number must be exactly 8 digits.");
    $("studentNumber").focus();
    return;
  }

  const patient = {
    student_number: studentNumber,
    full_name: $("fullName").value.trim(),
    birthdate: $("birthdate").value,
    sex: $("sex").value,
    course: $("course").value,
    year_level: $("yearLevel").value,
    blood_type: $("bloodType").value,
    allergies: $("allergies").value.trim(),
    medical_conditions: $("conditions").value.trim(),
    emergency_contact: $("emergencyContact").value.trim(),
    contact_number: $("contactNumber").value.trim()
  };

  submitButton.disabled = true;
  submitButton.textContent = "Saving...";

  try {
    const response = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(patient)
    });

    if (response.status === 401) {
      $("app").classList.add("hidden");
      $("loginPage").classList.remove("hidden");
      $("loginError").textContent = "Please log in again.";
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error("That student number is already registered.");
      }
      throw new Error(data.message || "Unable to register patient.");
    }

    resetPatientForm();
    $("patientSearch").value = "";
    await renderDashboard();
    go("patients");
    toast("Patient successfully registered.");
  } catch (error) {
    console.error("Patient registration error:", error);
    toast(error.message || "Unable to register patient.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Save Record";
  }
});
async function showProfile(studentNumber) {
  if (!/^\d{8}$/.test(studentNumber)) {
    toast("Student number must be exactly 8 numeric digits.");
    return;
  }

  selectedPatientId = studentNumber;
  go("profile");
  $("profileName").textContent = "Loading patient...";
  $("profileNumber").textContent = studentNumber;
  $("profileCourse").textContent = "—";
  $("profileInfo").innerHTML = '<div class="empty-state">Loading profile...</div>';
  $("profileVisits").innerHTML = '<tr><td colspan="4">Loading visit history...</td></tr>';

  try {
    const encodedStudentNumber = encodeURIComponent(studentNumber);
    const [profileResponse, visitsResponse] = await Promise.all([
      fetch(`/api/patients/${encodedStudentNumber}`, { credentials: "same-origin" }),
      fetch(`/api/patients/${encodedStudentNumber}/visits`, { credentials: "same-origin" })
    ]);

    if (profileResponse.status === 401 || visitsResponse.status === 401) {
      $("app").classList.add("hidden");
      $("loginPage").classList.remove("hidden");
      $("loginError").textContent = "Please log in again.";
      return;
    }

    const profileData = await profileResponse.json();
    const visitsData = await visitsResponse.json();

    if (!profileResponse.ok) throw new Error(profileData.message || "Failed to load patient profile");
    if (!visitsResponse.ok) throw new Error(visitsData.message || "Failed to load visit history");

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
    $("profileVisits").innerHTML = visits.map((visit) => `<tr><td>${esc(formatDashboardDate(visit.visit_date))}</td><td>${esc(visit.chief_complaint || "—")}</td><td>${esc(visit.medical_assessment || "—")}</td><td>${esc(visit.treatment_given || "—")}</td></tr>`).join("") || '<tr><td colspan="4">No visits recorded.</td></tr>';
  } catch (error) {
    console.error("Patient profile error:", error);
    $("profileName").textContent = "Unable to load patient";
    $("profileInfo").innerHTML = `<div class="empty-state">${esc(error.message || "Unable to load patient profile.")}</div>`;
    $("profileVisits").innerHTML = '<tr><td colspan="4">Unable to load visit history.</td></tr>';
    toast("Unable to load patient profile.");
  }
}
$("editPatientBtn").addEventListener("click", () => {
  const p = getPatients().find(x => x.id === selectedPatientId); if (!p) return; go("register");
  Object.entries({ patientId: "id", fullName: "fullName", birthdate: "birthdate", sex: "sex", studentNumber: "studentNumber", course: "course", yearLevel: "yearLevel", bloodType: "bloodType", allergies: "allergies", conditions: "conditions", emergencyContact: "emergencyContact", contactNumber: "contactNumber" }).forEach(([field, key]) => $(field).value = p[key] || "");
});
$("addVisitFromProfile").addEventListener("click", () => { go("addVisit"); $("visitPatient").value = selectedPatientId });
function populatePatientSelect() {
  const select = $("visitPatient"), current = select.value;
  select.innerHTML = '<option value="">Select patient</option>' + getPatients().map(p => `<option value="${p.id}">${esc(p.fullName)} — ${esc(p.studentNumber)}</option>`).join("");
  if (current) select.value = current;
  if (!current && selectedPatientId) select.value = selectedPatientId;
  if (!$("visitDate").value) $("visitDate").value = new Date().toISOString().slice(0, 10);
}
$("visitForm").addEventListener("submit", e => {
  e.preventDefault(); const visits = getVisits();
  visits.push({ id: "v" + Date.now(), patientId: $("visitPatient").value, date: $("visitDate").value, type: $("visitType").value, assessment: $("assessment").value.trim(), complaint: $("complaint").value.trim(), treatment: $("treatment").value.trim(), symptoms: $("symptoms").value.trim(), medication: $("medication").value.trim(), remarks: $("remarks").value.trim() });
  saveVisits(visits); $("visitForm").reset(); toast("Clinic visit successfully saved."); go("history");
});
function renderVisits() {
  const q = ($("visitSearch").value || "").toLowerCase(), patients = getPatients();
  const rows = getVisits().map(v => ({ ...v, patient: patients.find(p => p.id === v.patientId) })).filter(v => ((v.patient?.fullName || "") + " " + (v.patient?.studentNumber || "") + " " + v.complaint + " " + v.assessment).toLowerCase().includes(q)).sort((a, b) => b.date.localeCompare(a.date));
  $("visitTable").innerHTML = rows.map(v => `<tr><td>${formatDate(v.date)}</td><td>${esc(v.patient?.fullName || "Unknown")}</td><td>${esc(v.patient?.studentNumber || "—")}</td><td>${esc(v.complaint)}</td><td>${esc(v.assessment)}</td><td>${esc(v.treatment)}</td></tr>`).join("");
  $("emptyVisits").classList.toggle("hidden", rows.length > 0);
}
$("visitSearch").addEventListener("input", renderVisits);
function renderReports() {
  const patients = getPatients(); $("reportPatients").textContent = patients.length; $("reportVisits").textContent = getVisits().length;
  const counts = {}; patients.forEach(p => counts[p.course] = (counts[p.course] || 0) + 1);
  $("courseBreakdown").innerHTML = Object.entries(counts).map(([course, count]) => `<div class="break-row"><b>${esc(course)}</b><span>${count} patient(s)</span></div>`).join("") || '<p class="muted">No records available.</p>';
}
$("clearDataBtn").addEventListener("click", () => { if (confirm("Delete all patient and visit records stored in this browser? This cannot be undone.")) { localStorage.removeItem("plmun_patients"); localStorage.removeItem("plmun_visits"); localStorage.removeItem("plmun_seeded"); seedDemoData(); renderDashboard(); toast("Demo data reset."); go("dashboard") } });
seedDemoData();
