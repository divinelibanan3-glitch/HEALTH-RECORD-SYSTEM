// PLMun Health Portal - Front-end demonstration
// Demo credentials: admin / admin123
// Records are stored in this browser only. Use a secure backend for real deployment.
const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "admin123";
const $ = (id) => document.getElementById(id);
const getPatients = () => JSON.parse(localStorage.getItem("plmun_patients") || "[]");
const getVisits = () => JSON.parse(localStorage.getItem("plmun_visits") || "[]");
const savePatients = (data) => localStorage.setItem("plmun_patients", JSON.stringify(data));
const saveVisits = (data) => localStorage.setItem("plmun_visits", JSON.stringify(data));
let selectedPatientId = null;

function seedDemoData(){
  // Update the existing demo record if this browser was seeded by an earlier version.
  const existingPatients = getPatients();
  const oldDivineRecord = existingPatients.find(p => p.id === "p3" || p.fullName === "Dave Libanan" || p.fullName === "Divine Libanan");
  if (oldDivineRecord) {
    oldDivineRecord.fullName = "Divine Libanan";
    oldDivineRecord.course = "BSIT";
    oldDivineRecord.yearLevel = "2nd Year";
    savePatients(existingPatients);
  }
  if(localStorage.getItem("plmun_seeded")) return;
  const today = new Date().toISOString().slice(0,10);
  const demo = [
    {id:"p1",fullName:"Juan Miguel Santos",birthdate:"2005-01-15",sex:"Male",studentNumber:"2023-00125",course:"BSIT",yearLevel:"3rd Year",bloodType:"O+",allergies:"None",conditions:"None",emergencyContact:"0917 123 4567",contactNumber:"",createdAt:today},
    {id:"p2",fullName:"Maria Angela Reyes",birthdate:"2004-07-21",sex:"Female",studentNumber:"2022-00418",course:"BSBA",yearLevel:"4th Year",bloodType:"A+",allergies:"None",conditions:"None",emergencyContact:"0918 234 5678",contactNumber:"",createdAt:today},
    {id:"p3",fullName:"Divine Libanan",birthdate:"2006-03-09",sex:"Female",studentNumber:"2023-00210",course:"BSIT",yearLevel:"2nd Year",bloodType:"B+",allergies:"None",conditions:"None",emergencyContact:"0919 345 6789",contactNumber:"",createdAt:today},
    {id:"p4",fullName:"Sophia Martinez",birthdate:"2003-11-02",sex:"Female",studentNumber:"2021-00876",course:"BSHM",yearLevel:"4th Year",bloodType:"AB+",allergies:"Seafood",conditions:"None",emergencyContact:"0920 456 7890",contactNumber:"",createdAt:today}
  ];
  savePatients(demo);
  saveVisits([
    {id:"v1",patientId:"p1",date:"2026-11-05",type:"General Checkup",complaint:"Routine checkup",assessment:"Healthy",treatment:"Vitamins",symptoms:"None",medication:"Multivitamins",remarks:""},
    {id:"v2",patientId:"p2",date:"2026-10-15",type:"General Checkup",complaint:"Fever",assessment:"Viral Infection",treatment:"Paracetamol",symptoms:"Fever",medication:"Paracetamol",remarks:""},
    {id:"v3",patientId:"p3",date:"2026-09-20",type:"General Checkup",complaint:"Cough",assessment:"Mild Cough",treatment:"Rest & Fluids",symptoms:"Cough",medication:"",remarks:""}
  ]);
  localStorage.setItem("plmun_seeded","yes");
}
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2600)}
function go(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));
  const target=$(page+"Page"); if(target) target.classList.remove("hidden");
  document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  const labels={dashboard:"Dashboard",patients:"Patient Records",register:"Register New Patient",history:"Clinic Visit History",addVisit:"Add New Clinic Visit",reports:"Reports & Analytics",settings:"Settings",profile:"Patient Health Profile"};
  const icons={dashboard:"fa-house",patients:"fa-users",register:"fa-user-plus",history:"fa-clipboard-list",addVisit:"fa-clipboard-medical",reports:"fa-chart-column",settings:"fa-gear",profile:"fa-user"};
  $("pageTitle").textContent=labels[page]||"Dashboard"; $("topIcon").className="fa-solid "+(icons[page]||"fa-house");
  $("sidebar")?.classList.remove("open");
  if(page==="dashboard") renderDashboard();
  if(page==="patients") renderPatients();
  if(page==="history") renderVisits();
  if(page==="addVisit") populatePatientSelect();
  if(page==="reports") renderReports();
}
document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.page)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
$("mobileMenu").addEventListener("click",()=>$("sidebar")?.classList.toggle("open"));
$("loginForm").addEventListener("submit",e=>{e.preventDefault();if($("username").value.trim()===DEMO_USERNAME && $("password").value===DEMO_PASSWORD){$("loginPage").classList.add("hidden");$("app").classList.remove("hidden");$("loginError").textContent="";go("dashboard")}else{$("loginError").textContent="Incorrect username or password."}});
$("togglePassword").addEventListener("click",()=>{$("password").type=$("password").type==="password"?"text":"password"});
$("logoutBtn").addEventListener("click",()=>{$("app").classList.add("hidden");$("loginPage").classList.remove("hidden");$("password").value=""});

function renderDashboard(){
  const patients=getPatients(),visits=getVisits(),today=new Date().toISOString().slice(0,10),month=today.slice(0,7);
  $("statPatients").textContent=patients.length;$("statToday").textContent=visits.filter(v=>v.date===today).length;$("statVisits").textContent=visits.length;$("statMonth").textContent=patients.filter(p=>(p.createdAt||"").startsWith(month)).length;
  $("recentPatients").innerHTML=patients.slice(-4).reverse().map(p=>`<div class="recent-row"><div class="initials">${initials(p.fullName)}</div><div class="recent-main"><b>${esc(p.fullName)}</b><small>${esc(p.course)} · ${esc(p.studentNumber)}</small></div><span class="recent-time">Recently added</span><span class="status-pill">New Visit</span></div>`).join("")||'<div class="empty-state">No patient records yet.</div>';
  $("recentActivity").innerHTML=visits.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4).map(v=>{const p=patients.find(x=>x.id===v.patientId);return `<div class="activity-row"><i class="activity-icon fa-solid fa-notes-medical"></i><div class="activity-main"><b>${p?esc(p.fullName):"Patient record"}</b><small>${esc(v.type)} · ${esc(v.assessment)}</small></div><span class="activity-time">${formatDate(v.date)}</span></div>`}).join("")||'<div class="empty-state">No clinic activity yet.</div>';
}
function initials(name){return name.split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function formatDate(d){if(!d)return "—";return new Date(d+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
function renderPatients(){
  const q=($("patientSearch").value||"").toLowerCase();
  const rows=getPatients().filter(p=>(p.fullName+" "+p.studentNumber+" "+p.course).toLowerCase().includes(q));
  $("patientTable").innerHTML=rows.map(p=>`<tr><td>${esc(p.fullName)}</td><td>${esc(p.studentNumber)}</td><td>${esc(p.course)}</td><td>${esc(p.yearLevel)}</td><td><button class="table-action" data-view="${p.id}">View</button></td></tr>`).join("");
  $("emptyPatients").classList.toggle("hidden",rows.length>0);
  document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>showProfile(b.dataset.view)));
}
$("patientSearch").addEventListener("input",renderPatients);
function resetPatientForm(){ $("patientForm").reset();$("patientId").value=""; }
$("patientForm").addEventListener("submit",e=>{
  e.preventDefault();const patients=getPatients(),id=$("patientId").value;
  const data={id:id||"p"+Date.now(),fullName:$("fullName").value.trim(),birthdate:$("birthdate").value,sex:$("sex").value,studentNumber:$("studentNumber").value.trim(),course:$("course").value,yearLevel:$("yearLevel").value,bloodType:$("bloodType").value,allergies:$("allergies").value.trim()||"None",conditions:$("conditions").value.trim()||"None",emergencyContact:$("emergencyContact").value.trim(),contactNumber:$("contactNumber").value.trim(),createdAt:id?(patients.find(p=>p.id===id)?.createdAt||new Date().toISOString().slice(0,10)):new Date().toISOString().slice(0,10)};
  if(patients.some(p=>p.studentNumber.toLowerCase()===data.studentNumber.toLowerCase()&&p.id!==id)){toast("Student number already exists.");return}
  if(id) savePatients(patients.map(p=>p.id===id?data:p));else savePatients([...patients,data]);
  resetPatientForm();toast(id?"Patient record updated.":"Patient successfully registered.");go("patients");
});
function showProfile(id){
  const p=getPatients().find(x=>x.id===id);if(!p)return;selectedPatientId=id;
  $("profileName").textContent=p.fullName;$("profileNumber").textContent=p.studentNumber;$("profileCourse").textContent=p.course+" · "+p.yearLevel;
  const fields=[["Birthdate",formatDate(p.birthdate)],["Sex",p.sex],["Blood Type",p.bloodType],["Allergies",p.allergies],["Medical Conditions",p.conditions],["Emergency Contact",p.emergencyContact||"—"],["Contact Number",p.contactNumber||"—"]];
  $("profileInfo").innerHTML=fields.map(([k,v])=>`<div class="info-item"><span>${k}</span><b>${esc(v)}</b></div>`).join("");
  const visits=getVisits().filter(v=>v.patientId===id).sort((a,b)=>b.date.localeCompare(a.date));
  $("profileVisits").innerHTML=visits.map(v=>`<tr><td>${formatDate(v.date)}</td><td>${esc(v.complaint)}</td><td>${esc(v.assessment)}</td><td>${esc(v.treatment)}</td></tr>`).join("")||'<tr><td colspan="4">No visits recorded.</td></tr>';
  go("profile");
}
$("editPatientBtn").addEventListener("click",()=>{
  const p=getPatients().find(x=>x.id===selectedPatientId);if(!p)return;go("register");
  Object.entries({patientId:"id",fullName:"fullName",birthdate:"birthdate",sex:"sex",studentNumber:"studentNumber",course:"course",yearLevel:"yearLevel",bloodType:"bloodType",allergies:"allergies",conditions:"conditions",emergencyContact:"emergencyContact",contactNumber:"contactNumber"}).forEach(([field,key])=>$(field).value=p[key]||"");
});
$("addVisitFromProfile").addEventListener("click",()=>{go("addVisit");$("visitPatient").value=selectedPatientId});
function populatePatientSelect(){
  const select=$("visitPatient"),current=select.value;
  select.innerHTML='<option value="">Select patient</option>'+getPatients().map(p=>`<option value="${p.id}">${esc(p.fullName)} — ${esc(p.studentNumber)}</option>`).join("");
  if(current)select.value=current;
  if(!current&&selectedPatientId)select.value=selectedPatientId;
  if(!$("visitDate").value)$("visitDate").value=new Date().toISOString().slice(0,10);
}
$("visitForm").addEventListener("submit",e=>{
  e.preventDefault();const visits=getVisits();
  visits.push({id:"v"+Date.now(),patientId:$("visitPatient").value,date:$("visitDate").value,type:$("visitType").value,assessment:$("assessment").value.trim(),complaint:$("complaint").value.trim(),treatment:$("treatment").value.trim(),symptoms:$("symptoms").value.trim(),medication:$("medication").value.trim(),remarks:$("remarks").value.trim()});
  saveVisits(visits);$("visitForm").reset();toast("Clinic visit successfully saved.");go("history");
});
function renderVisits(){
  const q=($("visitSearch").value||"").toLowerCase(),patients=getPatients();
  const rows=getVisits().map(v=>({...v,patient:patients.find(p=>p.id===v.patientId)})).filter(v=>((v.patient?.fullName||"")+" "+(v.patient?.studentNumber||"")+" "+v.complaint+" "+v.assessment).toLowerCase().includes(q)).sort((a,b)=>b.date.localeCompare(a.date));
  $("visitTable").innerHTML=rows.map(v=>`<tr><td>${formatDate(v.date)}</td><td>${esc(v.patient?.fullName||"Unknown")}</td><td>${esc(v.patient?.studentNumber||"—")}</td><td>${esc(v.complaint)}</td><td>${esc(v.assessment)}</td><td>${esc(v.treatment)}</td></tr>`).join("");
  $("emptyVisits").classList.toggle("hidden",rows.length>0);
}
$("visitSearch").addEventListener("input",renderVisits);
function renderReports(){
  const patients=getPatients();$("reportPatients").textContent=patients.length;$("reportVisits").textContent=getVisits().length;
  const counts={};patients.forEach(p=>counts[p.course]=(counts[p.course]||0)+1);
  $("courseBreakdown").innerHTML=Object.entries(counts).map(([course,count])=>`<div class="break-row"><b>${esc(course)}</b><span>${count} patient(s)</span></div>`).join("")||'<p class="muted">No records available.</p>';
}
$("clearDataBtn").addEventListener("click",()=>{if(confirm("Delete all patient and visit records stored in this browser? This cannot be undone.")){localStorage.removeItem("plmun_patients");localStorage.removeItem("plmun_visits");localStorage.removeItem("plmun_seeded");seedDemoData();renderDashboard();toast("Demo data reset.");go("dashboard")}});
seedDemoData();
