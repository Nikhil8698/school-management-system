
const loginForm = document.getElementById("loginForm");

if(loginForm){
loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const loginId = document.getElementById("login_id").value;
    const password = document.getElementById("password").value;
    const selectedRole = document.getElementById("role").value;
    const message = document.getElementById("message");

    const formData = new URLSearchParams();

    formData.append("username", loginId);
    formData.append("password", password);

    try {

        const response = await fetch("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Login failed");
        }

        if (data.role !== selectedRole) {
            throw new Error("Selected role does not match this account");
        }

        sessionStorage.setItem("access_token", data.access_token);
        sessionStorage.setItem("user_role", data.role);
	
        message.style.color = "green";
        message.textContent = "Login successful! Welcome " + data.role;
	if (data.role === "admin") {
   		 window.location.href = "/admin";
	}

    } catch (error) {

        message.style.color = "red";
        message.textContent = error.message;

    }

});
}
function logout() {
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("user_role");
        window.location.href = "/";

}

const API = "";

function getToken() {
    return sessionStorage.getItem("access_token");
}

async function apiRequest(url, options = {}) {
    const response = await fetch(API + url, {
        ...options,
        headers: {
            "Authorization": "Bearer " + getToken(),
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Request failed");
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

function showStudents() {
    const content = document.getElementById("dashboard-content");

    content.innerHTML = `
        <h2>Student Management</h2>

        <h3>Add Student</h3>

        <form id="studentForm">
            <input id="studentLogin" placeholder="Login ID" required>
            <input id="studentPassword" type="password"
                   placeholder="Password (minimum 8 characters)" required>
            <input id="studentName" placeholder="Full Name" required>

            <select id="studentClass">
                ${Array.from({length: 10}, (_, i) =>
                    `<option value="${i + 1}">Class ${i + 1}</option>`
                ).join("")}
            </select>

            <input id="studentSection" placeholder="Section">

            <button type="submit">Add Student</button>
        </form>

        <hr>

        <h3>Search Students</h3>
        <input id="searchStudent" placeholder="Search by name">
        <button onclick="searchStudents()">Search</button>
        <button onclick="loadStudents()">Show All</button>

        <div id="studentList"></div>
    `;

    document.getElementById("studentForm")
        .addEventListener("submit", addStudent);

    loadStudents();
}

async function addStudent(event) {
    event.preventDefault();

    const student = {
        login_id: document.getElementById("studentLogin").value,
        password: document.getElementById("studentPassword").value,
        full_name: document.getElementById("studentName").value,
        class_number: Number(document.getElementById("studentClass").value),
        section: document.getElementById("studentSection").value || null
    };

    try {
        await apiRequest("/admin/students", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(student)
        });

        alert("Student added successfully!");
        event.target.reset();
        loadStudents();

    } catch (error) {
        alert(error.message);
    }
}

async function loadStudents() {
    try {
        const students = await apiRequest("/admin/students");
        displayStudents(students);
    } catch (error) {
        alert(error.message);
    }
}

async function searchStudents() {
    const query = document.getElementById("searchStudent").value;

    try {
        const students = await apiRequest(
            "/admin/students?q=" + encodeURIComponent(query)
        );

        displayStudents(students);
    } catch (error) {
        alert(error.message);
    }
}

function displayStudents(students) {
    const list = document.getElementById("studentList");

    list.innerHTML = "";

    students.forEach(student => {
        const card = document.createElement("div");
        card.className = "student-card";

        const details = document.createElement("p");
        details.textContent =
            `${student.full_name} | Class ${student.class_number} | ` +
            `Section ${student.section || "-"} | ID ${student.id}`;

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.onclick = () => editStudent(student);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteStudent(student.id);

        card.append(details, editButton, deleteButton);
        list.appendChild(card);
    });
}

async function editStudent(student) {
    const name = prompt("Enter student name:", student.full_name);
    if (name === null) return;

    const classNumber = prompt(
        "Enter class number (1-10):",
        student.class_number
    );
    if (classNumber === null) return;

    const section = prompt("Enter section:", student.section || "");
    if (section === null) return;

    const classValue = Number(classNumber);

    if (!name.trim() || !Number.isInteger(classValue) ||
        classValue < 1 || classValue > 10) {
        alert("Enter a valid name and class number from 1 to 10.");
        return;
    }

    try {
        await apiRequest(`/admin/students/${student.id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                full_name: name.trim(),
                class_number: classValue,
                section: section || null
            })
        });

        alert("Student updated successfully!");
        loadStudents();

    } catch (error) {
        alert(error.message);
    }
}

async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student?")) {
        return;
    }

    try {
        await apiRequest(`/admin/students/${id}`, {
            method: "DELETE"
        });

        alert("Student deleted successfully!");
        loadStudents();

    } catch (error) {
        alert(error.message);
    }
}


function displayTeachers(teachers) {
    const list = document.getElementById("teacherList");

    list.innerHTML = "";

    if (teachers.length === 0) {
        list.textContent = "No teachers found.";
        return;
    }

    teachers.forEach(teacher => {
        const card = document.createElement("div");
        card.className = "student-card";

        const details = document.createElement("p");

        details.textContent =
            `${teacher.full_name} | Subject: ${teacher.subject || "-"} | ` +
            `Login ID: ${teacher.login_id} | ID: ${teacher.id}`;

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.onclick = () => editTeacher(teacher);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteTeacher(teacher.id);

        card.append(details, editButton, deleteButton);
        list.appendChild(card);
    });
}

async function addTeacher(event) {
    event.preventDefault();

    const teacher = {
        login_id: document.getElementById("teacherLogin").value,
        password: document.getElementById("teacherPassword").value,
        full_name: document.getElementById("teacherName").value,
        subject: document.getElementById("teacherSubject").value || null
    };

    try {
        await apiRequest("/admin/teachers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(teacher)
        });

        alert("Teacher added successfully!");

        event.target.reset();

        loadTeachers();

    } catch (error) {
        alert(error.message);
    }
}

async function loadTeachers() {
    try {
        const teachers = await apiRequest("/admin/teachers");
        displayTeachers(teachers);
    } catch (error) {
        alert(error.message);
    }
}

async function searchTeachers() {
    const query = document.getElementById("searchTeacher").value;

    try {
        const teachers = await apiRequest(
            "/admin/teachers?q=" + encodeURIComponent(query)
        );

        displayTeachers(teachers);
    } catch (error) {
        alert(error.message);
    }
}

async function editTeacher(teacher) {
    const name = prompt("Enter teacher name:", teacher.full_name);

    if (name === null) return;

    const subject = prompt("Enter subject:", teacher.subject || "");

    if (subject === null) return;

    if (!name.trim()) {
        alert("Teacher name cannot be empty.");
        return;
    }

    try {
        await apiRequest(`/admin/teachers/${teacher.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                full_name: name.trim(),
                subject: subject.trim() || null
            })
        });

        alert("Teacher updated successfully!");

        loadTeachers();

    } catch (error) {
        alert(error.message);
    }
}
function showTeachers() {
    const content = document.getElementById("dashboard-content");

    content.innerHTML = `
        <h2>Teacher Management</h2>

        <h3>Add Teacher</h3>

        <form id="teacherForm">
            <input id="teacherLogin" placeholder="Login ID" required>

            <input
                id="teacherPassword"
                type="password"
                placeholder="Password (minimum 8 characters)"
                required
            >

            <input id="teacherName" placeholder="Full Name" required>

            <input id="teacherSubject" placeholder="Subject">

            <button type="submit">Add Teacher</button>
        </form>

        <hr>

        <h3>Search Teachers</h3>

        <input id="searchTeacher" placeholder="Search by teacher name">

        <button onclick="searchTeachers()">Search</button>
        <button onclick="loadTeachers()">Show All</button>

        <div id="teacherList"></div>
    `;

    document.getElementById("teacherForm")
        .addEventListener("submit", addTeacher);

    loadTeachers();
}
async function deleteTeacher(id) {
    if (!confirm("Are you sure you want to delete this teacher?")) {
        return;
    }

    try {
        await apiRequest(`/admin/teachers/${id}`, {
            method: "DELETE"
        });

        alert("Teacher deleted successfully!");

        loadTeachers();

    } catch (error) {
        alert(error.message);
    }
}
