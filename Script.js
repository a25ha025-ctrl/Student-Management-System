
const STORAGE_KEY = "edumanage_students";

// Default students
const defaultStudents = [
  {
    id: "STU001",
    name: "Kasun Perera",
    email: "kasun@example.com",
    course: "Java Programming",
    status: "Active"
  },
  {
    id: "STU002",
    name: "Amaya Silva",
    email: "amaya@example.com",
    course: "Web Development",
    status: "Active"
  },
  {
    id: "STU003",
    name: "Nimal Fernando",
    email: "nimal@example.com",
    course: "Database Design",
    status: "Active"
  }
];

// Load students from localStorage
function loadStudents() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);

      return Array.isArray(parsed) ? parsed : [];
    }

    // First-time setup
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaultStudents)
    );

    return [...defaultStudents];

  } catch (error) {
    console.error("Error loading students:", error);
    return [];
  }
}

let students = loadStudents();

// Get HTML elements
const studentForm = document.getElementById("studentForm");
const studentTable = document.getElementById("studentTable");
const searchInput = document.getElementById("searchInput");
const formMessage = document.getElementById("formMessage");
const emptyMessage = document.getElementById("emptyMessage");


// Save students
function saveStudents() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(students)
    );

    return true;

  } catch (error) {
    console.error("Error saving students:", error);
    alert("Unable to save student data.");
    return false;
  }
}


// Prevent HTML injection
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}


// Update dashboard statistics
function updateDashboard() {

  // Total Students
  document.getElementById("totalStudents").textContent =
    students.length;


  // Total Courses (unique courses)
  const courses = new Set(
    students.map(student =>
      String(student.course || "").trim().toLowerCase()
    ).filter(Boolean)
  );

  document.getElementById("totalCourses").textContent =
    courses.size;


  // Active Students
  const activeCount = students.filter(student =>
    String(student.status || "Active").toLowerCase() === "active"
  ).length;

  document.getElementById("activeStudents").textContent =
    activeCount;
}


// Display students in table
function renderStudents() {

  const query = searchInput.value.trim().toLowerCase();

  const filteredStudents = students.filter(student => {

    return [
      student.id,
      student.name,
      student.email,
      student.course
    ].some(value =>
      String(value || "").toLowerCase().includes(query)
    );

  });


  studentTable.innerHTML = filteredStudents.map(student => {

    const status = student.status || "Active";

    return `
      <tr>
        <td>${escapeHTML(student.id)}</td>

        <td>${escapeHTML(student.name)}</td>

        <td>${escapeHTML(student.email)}</td>

        <td>${escapeHTML(student.course)}</td>

        <td>
          <span class="status">
            ${escapeHTML(status)}
          </span>
        </td>

        <td>
          <button
            class="delete-btn"
            data-id="${escapeHTML(student.id)}"
            type="button"
          >
            Delete
          </button>
        </td>
      </tr>
    `;

  }).join("");


  // Empty message
  emptyMessage.hidden = filteredStudents.length !== 0;

  emptyMessage.textContent = query
    ? "No matching students found."
    : "No students found.";


  // Update statistics
  updateDashboard();
}


// Display today's date
document.getElementById("today").textContent =
  new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });


// Open Add Student form
document.getElementById("showFormBtn").addEventListener("click", () => {

  studentForm.hidden = false;

  formMessage.textContent = "";

  document.getElementById("studentId").focus();

});


// Cancel form
document.getElementById("cancelBtn").addEventListener("click", () => {

  studentForm.reset();

  studentForm.hidden = true;

  formMessage.textContent = "";

});


// Add new student
studentForm.addEventListener("submit", event => {

  event.preventDefault();

  const id = document.getElementById("studentId").value.trim();
  const name = document.getElementById("studentName").value.trim();
  const email = document.getElementById("studentEmail").value.trim();
  const course = document.getElementById("studentCourse").value.trim();


  // Validate fields
  if (!id || !name || !email || !course) {

    formMessage.textContent = "Please fill in all fields.";

    return;
  }


  // Check duplicate ID
  const duplicate = students.some(student =>
    String(student.id).toLowerCase() === id.toLowerCase()
  );

  if (duplicate) {

    formMessage.textContent =
      "This student ID already exists.";

    return;
  }


  // Create student
  const newStudent = {
    id: id,
    name: name,
    email: email,
    course: course,
    status: "Active"
  };


  students.push(newStudent);


  // Save student
  if (!saveStudents()) {

    students.pop();

    return;
  }


  // Clear form
  studentForm.reset();

  studentForm.hidden = true;

  formMessage.textContent = "";

  searchInput.value = "";


  // Refresh dashboard
  renderStudents();

});


// Search students
searchInput.addEventListener("input", renderStudents);


// Delete student
studentTable.addEventListener("click", event => {

  const button = event.target.closest(".delete-btn");

  if (!button) return;

  const studentId = button.dataset.id;

  const student = students.find(item =>
    String(item.id) === studentId
  );

  if (!student) return;


  const confirmed = confirm(
    `Are you sure you want to delete ${student.name}?`
  );

  if (!confirmed) return;


  const previousStudents = students;

  students = students.filter(item =>
    String(item.id) !== studentId
  );


  if (!saveStudents()) {

    students = previousStudents;

    return;
  }


  // Refresh dashboard
  renderStudents();

});


// Listen for changes from registration page or another tab
window.addEventListener("storage", event => {

  if (event.key === STORAGE_KEY || event.key === null) {

    students = loadStudents();

    renderStudents();

  }

});


// Refresh when returning to dashboard
window.addEventListener("pageshow", () => {

  students = loadStudents();

  renderStudents();

});


// Initial dashboard display
renderStudents();
