const STORAGE_KEY = "skillnexis_week4_students";

let students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const studentTableBody = document.getElementById("studentTableBody");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const courseFilter = document.getElementById("courseFilter");
const statusFilter = document.getElementById("statusFilter");

const studentModal = document.getElementById("studentModal");
const studentForm = document.getElementById("studentForm");
const modalTitle = document.getElementById("modalTitle");
const editIndex = document.getElementById("editIndex");

const studentName = document.getElementById("studentName");
const studentId = document.getElementById("studentId");
const studentCourse = document.getElementById("studentCourse");
const studentYear = document.getElementById("studentYear");
const studentEmail = document.getElementById("studentEmail");
const studentStatus = document.getElementById("studentStatus");

const toast = document.getElementById("toast");

function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function updateStats() {
    const active = students.filter(student => student.status === "Active").length;
    const inactive = students.filter(student => student.status === "Inactive").length;

    document.getElementById("totalStudents").textContent = students.length;
    document.getElementById("activeStudents").textContent = active;
    document.getElementById("inactiveStudents").textContent = inactive;
}

function getFilteredStudents() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCourse = courseFilter.value;
    const selectedStatus = statusFilter.value;

    return students.filter(student => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchTerm) ||
            student.id.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm);

        const matchesCourse =
            selectedCourse === "all" || student.course === selectedCourse;

        const matchesStatus =
            selectedStatus === "all" || student.status === selectedStatus;

        return matchesSearch && matchesCourse && matchesStatus;
    });
}

function renderStudents() {
    const filteredStudents = getFilteredStudents();

    studentTableBody.innerHTML = "";

    if (filteredStudents.length === 0) {
        emptyState.style.display = "block";
    } else {
        emptyState.style.display = "none";
    }

    filteredStudents.forEach(student => {
        const originalIndex = students.indexOf(student);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <div class="student-name">${escapeHTML(student.name)}</div>
            </td>
            <td>${escapeHTML(student.id)}</td>
            <td>${escapeHTML(student.course)}</td>
            <td>${escapeHTML(student.year)}</td>
            <td>
                <span class="student-email">${escapeHTML(student.email)}</span>
            </td>
            <td>
                <span class="status ${student.status.toLowerCase()}">
                    ${escapeHTML(student.status)}
                </span>
            </td>
            <td>
                <div class="action-group">
                    <button class="icon-btn" onclick="editStudent(${originalIndex})">
                        Edit
                    </button>
                    <button class="icon-btn delete" onclick="deleteStudent(${originalIndex})">
                        Delete
                    </button>
                </div>
            </td>
        `;

        studentTableBody.appendChild(row);
    });

    updateStats();
}

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function openModal(index = null) {
    studentForm.reset();

    if (index === null) {
        modalTitle.textContent = "Add Student";
        editIndex.value = "";
        studentStatus.value = "Active";
    } else {
        const student = students[index];

        modalTitle.textContent = "Edit Student";
        editIndex.value = index;

        studentName.value = student.name;
        studentId.value = student.id;
        studentCourse.value = student.course;
        studentYear.value = student.year;
        studentEmail.value = student.email;
        studentStatus.value = student.status;
    }

    studentModal.classList.remove("hidden");
    studentModal.setAttribute("aria-hidden", "false");
    studentName.focus();
}

function closeModal() {
    studentModal.classList.add("hidden");
    studentModal.setAttribute("aria-hidden", "true");
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

studentForm.addEventListener("submit", event => {
    event.preventDefault();

    const newStudent = {
        name: studentName.value.trim(),
        id: studentId.value.trim(),
        course: studentCourse.value,
        year: studentYear.value,
        email: studentEmail.value.trim(),
        status: studentStatus.value
    };

    const index = editIndex.value;

    if (index === "") {
        const duplicateId = students.some(student => student.id.toLowerCase() === newStudent.id.toLowerCase());

        if (duplicateId) {
            alert("A student with this ID already exists.");
            return;
        }

        students.push(newStudent);
        showToast("Student added successfully.");
    } else {
        const duplicateId = students.some(
            (student, studentIndex) =>
                studentIndex !== Number(index) &&
                student.id.toLowerCase() === newStudent.id.toLowerCase()
        );

        if (duplicateId) {
            alert("A student with this ID already exists.");
            return;
        }

        students[Number(index)] = newStudent;
        showToast("Student updated successfully.");
    }

    saveToLocalStorage();
    renderStudents();
    closeModal();
});

function editStudent(index) {
    openModal(index);
}

function deleteStudent(index) {
    const student = students[index];

    const confirmed = confirm(`Delete ${student.name}'s record?`);

    if (!confirmed) {
        return;
    }

    students.splice(index, 1);
    saveToLocalStorage();
    renderStudents();
    showToast("Student deleted successfully.");
}

document.getElementById("addStudentBtn").addEventListener("click", () => {
    openModal();
});

document.getElementById("closeModalBtn").addEventListener("click", closeModal);
document.getElementById("cancelBtn").addEventListener("click", closeModal);

studentModal.addEventListener("click", event => {
    if (event.target === studentModal) {
        closeModal();
    }
});

searchInput.addEventListener("input", renderStudents);
courseFilter.addEventListener("change", renderStudents);
statusFilter.addEventListener("change", renderStudents);

renderStudents();
