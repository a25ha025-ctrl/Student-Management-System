
const STORAGE_KEY = "edumanage_students";

const defaultStudents = [
  {
    id: "STU001",
    name: "Kasun Perera",
    email: "kasun@example.com",
    course: "Java Programming"
  },
  {
    id: "STU002",
    name: "Amaya Silva",
    email: "amaya@example.com",
    course: "Web Development"
  },
  {
    id: "STU003",
    name: "Nimal Fernando",
    email: "nimal@example.com",
    course: "Database Design"
  }
];

// Load students from localStorage
function loadStudents() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [...defaultStudents];
    }
  } catch (error) {
    console.error("Could not load student records:", error);
  }

  return [...defaultStudents];
}

let students = loadStudents();

// Get dashboard elements
const studentForm = document.getElementById("studentForm");
const studentTable = document.getElementById("studentTable");
const searchInput = document.getElementById("searchInput");
const formMessage = document.getElementById("formMessage");
const emptyMessage = document.getElementById("emptyMessage");

// Save students to localStorage
function saveStudents() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    return true;
  } catch (error) {
    console.error("Could not save student records:", error);
    alert("Unable to save data in this browser.");
    return false;
  }
}

// Escape text before displaying it as HTML
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

// Update dashboard statistics
function updateDashboard() {
  document.getElementById("totalStudents").textContent =
    students.length;

  document.getElementById("totalCourses").textContent =
    new Set(
      students.map(student => student.course.toLowerCase())
    ).size;

  document.getElementById("activeStudents").textContent =
    students.length;
}

// Display students in the table
function renderStudents() {
  const query = searchInput.value.trim().toLowerCase();

  const filteredStudents = students.filter(student =>
    [student.id, student.name, student.email, student.course]
      .some(value => String(value).toLowerCase().includes(query))
  );

  studentTable.innerHTML = filteredStudents.map(student => `
    <tr>
      <td>${escapeHTML(student.id)}</td>
      <td>${escapeHTML(student.name)}</td>
      <td>${escapeHTML(student.email)}</td>
      <td>${escapeHTML(student.course)}</td>
      <td><span class="status">Active</span></td>
      <td>
        <button
          class="delete-btn"
          data-id="${escapeHTML(student.id)}"
          type="button"
          aria-label="Delete ${escapeHTML(student.name)}"
        >Delete</button>
      </td>
    </tr>
  `).join("");

  emptyMessage.hidden = filteredStudents.length !== 0;

  if (query && filteredStudents.length === 0) {
    emptyMessage.textContent = "No matching students found.";
  } else {
    emptyMessage.textContent = "No students found.";
  }

  updateDashboard();
}

// Display today's date
document.getElementById("today").textContent =
  new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

// Open the admin Add Student form
document.getElementById("showFormBtn").addEventListener("click", () => {
  studentForm.hidden = false;
  formMessage.textContent = "";
  document.getElementById("studentId").focus();
});

// Cancel the admin Add Student form
document.getElementById("cancelBtn").addEventListener("click", () => {
  studentForm.reset();
  studentForm.hidden = true;
  formMessage.textContent = "";
});

// Admin adds a student
studentForm.addEventListener("submit", event => {
  event.preventDefault();

  const id = document.getElementById("studentId").value.trim();
  const name = document.getElementById("studentName").value.trim();
  const email = document.getElementById("studentEmail").value.trim();
  const course = document.getElementById("studentCourse").value.trim();

  if (!id || !name || !email || !course) {
    formMessage.textContent = "Please fill in all fields.";
    return;
  }

  const duplicate = students.some(
    student => student.id.toLowerCase() === id.toLowerCase()
  );

  if (duplicate) {
    formMessage.textContent = "This student ID already exists.";
    return;
  }

  const newStudent = { id, name, email, course };

  students.push(newStudent);

  if (!saveStudents()) {
    students.pop();
    return;
  }

  studentForm.reset();
  studentForm.hidden = true;
  formMessage.textContent = "";
  searchInput.value = "";

  renderStudents();
});

// Search students
searchInput.addEventListener("input", renderStudents);

// Delete a student
studentTable.addEventListener("click", event => {
  const button = event.target.closest(".delete-btn");

  if (!button) return;

  const studentId = button.dataset.id;
  const student = students.find(item => item.id === studentId);

  if (!student) return;

  const confirmed = confirm(
    `Are you sure you want to delete ${student.name}?`
  );

  if (!confirmed) return;

  const previousStudents = students;

  students = students.filter(item => item.id !== studentId);

  if (!saveStudents()) {
    students = previousStudents;
    return;
  }

  renderStudents();
});

// Update the table when another page changes localStorage
window.addEventListener("storage", event => {
  if (event.key === STORAGE_KEY || event.key === null) {
    students = loadStudents();
    renderStudents();
  }
});

// Initial dashboard display
renderStudents();
