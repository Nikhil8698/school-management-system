
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
	else if (data.role === "student") {
   	window.location.href = "/student";
	}
	else if (data.role === "teacher") {
    	window.location.href = "/teacher";
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
        `Classes: ${(teacher.classes || []).join(", ") || "-"} | ` +
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
async function loadTeachers() {
    try {
        const teachers = await apiRequest("/admin/teachers");
        displayTeachers(teachers);
    } catch (error) {
        alert(error.message);
    }
}
async function addTeacher(event) {
    event.preventDefault();

    const selectedClasses = Array.from(
        document.querySelectorAll('input[name="teacherClass"]:checked')
    ).map(input => Number(input.value));

    const teacher = {
        login_id: document.getElementById("teacherLogin").value,
        password: document.getElementById("teacherPassword").value,
        full_name: document.getElementById("teacherName").value,
        subject: document.getElementById("teacherSubject").value || null,
        classes: selectedClasses
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

    const currentClasses = (teacher.classes || []).join(",");

    const classesInput = prompt(
        "Enter classes separated by commas (example: 6,7,8):",
        currentClasses
    );

    if (classesInput === null) return;

    if (!name.trim()) {
        alert("Teacher name cannot be empty.");
        return;
    }

    const classes = classesInput.trim() === ""
        ? []
        : classesInput.split(",").map(value => Number(value.trim()));

    if (
        classes.some(value => !Number.isInteger(value) || value < 1 || value > 10) ||
        new Set(classes).size !== classes.length
    ) {
        alert("Enter unique class numbers between 1 and 10.");
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
                subject: subject.trim() || null,
                classes: classes
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
            <h3>Select Classes Teaching</h3>

		<div id="teacherClasses">
   		 ${Array.from({length: 10}, (_, i) => `
       		 <label style="display: inline-block; margin: 8px;">
           	 <input type="checkbox" name="teacherClass" value="${i + 1}">
            	Class ${i + 1}
        	</label>
   		 `).join("")}
		</div>
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

async function loadStudentProfile() {
    const details = document.getElementById("studentDetails");
    const welcome = document.getElementById("welcomeMessage");

    if (!getToken()) {
        window.location.href = "/";
        return;
    }

    try {
        const student = await apiRequest("/auth/me");

        if (student.role !== "student") {
            window.location.href = "/";
            return;
        }

        welcome.textContent = "Welcome, " + student.name;

        details.innerHTML = "";

        const fields = [
            ["Full Name", student.name],
            ["Login ID", student.login_id],
            ["Class", student.class],
            ["Section", student.section || "-"]
        ];

        fields.forEach(([label, value]) => {
            const paragraph = document.createElement("p");
            paragraph.textContent = label + ": " + value;
            details.appendChild(paragraph);
        });

    } catch (error) {
        alert(error.message);
        logout();
    }
}

if (document.getElementById("studentDetails")) {
    loadStudentProfile();
}
async function loadTeacherProfile() {
    const details = document.getElementById("teacherDetails");
    const welcome = document.getElementById("welcomeMessage");

    if (!getToken()) {
        window.location.href = "/";
        return;
    }

    try {
        const teacher = await apiRequest("/auth/me");

        if (teacher.role !== "teacher") {
            window.location.href = "/";
            return;
        }

        welcome.textContent = "Welcome, " + teacher.name;

        details.innerHTML = "";

        const fields = [
            ["Full Name", teacher.name],
            ["Login ID", teacher.login_id],
            ["Subject", teacher.subject || "-"],
	    ["Classes Teaching", (teacher.classes || []).join(", ") || "Not assigned"]
        ];

        fields.forEach(([label, value]) => {
            const paragraph = document.createElement("p");
            paragraph.textContent = label + ": " + value;
            details.appendChild(paragraph);
        });

    } catch (error) {
        details.textContent = "Error loading teacher details: " + error.message;
    }
}

if (document.getElementById("teacherDetails")) {
    loadTeacherProfile();
}
