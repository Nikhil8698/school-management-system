# School Management System

A web-based School Management System built using **Python FastAPI** for the backend and **HTML, CSS, and JavaScript** for the frontend.

The application provides separate login access for Admin, Students, and Teachers. Administrators can manage student and teacher records through a dashboard.

## Features

### 1. Authentication
- Separate login for Admin, Students, and Teachers.
- Login using a unique Login ID and password.
- JWT-based authentication.
- Role-based access control.
- Logout functionality.

### 2. Admin Dashboard
Administrators can:
- Add students.
- View all students.
- Search students.
- Edit student details.
- Delete student records.
- Add teachers.
- View teacher records.
- Search teachers.
- Edit teacher details.
- Delete teacher records.

### 3. Student Management
- Each student has a unique Login ID.
- Students are classified into Classes 1–10.
- Student details include name, class number, and section.
- Admin can perform CRUD operations on student records.

### 4. Teacher Management
- Each teacher has a unique Login ID.
- Teachers can log in using their credentials.
- Admin can manage teacher records.

## Technologies Used

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| FastAPI | REST API development |
| SQLAlchemy | Database ORM |
| SQLite | Database |
| HTML | Frontend structure |
| CSS | Frontend styling |
| JavaScript | Frontend functionality |
| JWT | Authentication |
| Uvicorn | ASGI server |

## Project Structure

```text
school_backend/
│
├── app/
│   └── main.py
│
├── frontend/
│   ├── index.html
│   ├── admin.html
│   ├── style.css
│   └── app.js
│
├── venv/
│
├── requirements.txt
├── README.md
└── school.db
```

The SQLite database file is created by the application if it does not already exist.

## Installation and Setup

### Prerequisites

- Python 3
- Ubuntu Linux
- pip
- Virtual environment support

### Step 1: Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd school_backend
```

### Step 2: Create a Virtual Environment

```bash
python3 -m venv venv
```

### Step 3: Activate the Virtual Environment

```bash
source venv/bin/activate
```

### Step 4: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 5: Run the Backend Server

```bash
uvicorn app.main:app --reload
```

The application will run at:

```text
http://127.0.0.1:8000
```

## Access the Application

| Page | URL |
|---|---|
| Login Page | http://127.0.0.1:8000/ |
| Admin Dashboard | http://127.0.0.1:8000/admin |
| API Documentation | http://127.0.0.1:8000/docs |
| Health Check | http://127.0.0.1:8000/api/health |

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Get current user |

### Student Management

| Method | Endpoint | Description |
|---|---|---|
| POST | `/admin/students` | Add student |
| GET | `/admin/students` | View/search students |
| PUT | `/admin/students/{student_id}` | Update student |
| DELETE | `/admin/students/{student_id}` | Delete student |

### Teacher Management

| Method | Endpoint | Description |
|---|---|---|
| POST | `/admin/teachers` | Add teacher |
| GET | `/admin/teachers` | View/search teachers |
| PUT | `/admin/teachers/{teacher_id}` | Update teacher |
| DELETE | `/admin/teachers/{teacher_id}` | Delete teacher |

## Authentication Flow

1. User opens the login page.
2. User selects a role: Admin, Student, or Teacher.
3. User enters their Login ID and password.
4. Frontend sends credentials to the FastAPI backend.
5. Backend validates the credentials.
6. Backend generates a JWT access token.
7. Frontend stores the token in session storage.
8. Authenticated requests send the token in the Authorization header.

## Database

The application uses SQLite with SQLAlchemy ORM.

Database responsibilities include:
- Storing user login credentials.
- Managing student records.
- Managing teacher records.
- Connecting student and teacher profiles with their user accounts.

## Security

- Password hashing using Passlib.
- JWT-based authentication.
- Role-based authorization.
- Protected admin API endpoints.
- Input validation using Pydantic.

**Note:** This project is intended as a learning and development project. Production deployment should include HTTPS, secure token handling, environment-based secrets, database backups, and additional security testing.

## Future Enhancements

- Student dashboard.
- Teacher dashboard.
- Attendance management.
- Fee management.
- Examination and marks management.
- Timetable management.
- Parent login.
- Reports and analytics.

## Author

**Burri Nikhil**

School Management System — Python Backend Development Project.
