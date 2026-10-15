
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

const studentForm = document.getElementById("studentForm");
const studentTable = document.getElementById("studentTable");
const searchInput = document.getElementById("searchInput");
const formMessage = document.getElementById("formMessage");
const emptyMessage = document.getElementById("emptyMessage");

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

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function updateDashboard() {
  document.getElementById("totalStudents").textContent =
    students.length;

  document.getElementById("totalCourses").textContent =
    new Set(students.map(student => student.course.toLowerCase())).size;

  // In this demo, every registered student is considered active.
  document.getElementById("activeStudents").textContent =
    students.length;
}

function renderStudents() {
  const query = searchInput.value.trim().toLowerCase();

  const filteredStudents = students.filter(student =>
    [student.id, student.name, student.email, student.course]
      .some(value => value.toLowerCase().includes(query))
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
  updateDashboard();
}

document.getElementById("today").textContent =
  new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

document.getElementById("showFormBtn").addEventListener("click", () => {
  studentForm.hidden = false;
  formMessage.textContent = "";
  document.getElementById("studentId").focus();
});

document.getElementById("cancelBtn").addEventListener("click", () => {
  studentForm.reset();
  studentForm.hidden = true;
  formMessage.textContent = "";
});

studentForm.addEventListener("submit", event => {
  event.preventDefault();

  const id = document.getElementById("studentId").value.trim();
  const name = document.getElementById("studentName").value.trim();
  const email = document.getElementById("studentEmail").value.trim();
  const course = document.getElementById("studentCourse").value.trim();

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

searchInput.addEventListener("input", renderStudents);

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

  const previousStudents = [...students];

  students = students.filter(item => item.id !== studentId);

  if (!saveStudents()) {
    students = previousStudents;
    return;
  }

  renderStudents();
});

renderStudents();
