# SMART ATTENDANCE MONITORING WEBSITE

A complete, production-ready B.Sc. IT mini-project for automated classroom attendance management using dynamic expiring **QR Codes** combined with **GPS Geolocation Radius Verification** using the **Haversine Formula**.

---

## 📌 Project Overview
In traditional college environments, attendance proxying and manual roll calls lead to proxy attendance and inefficiency. This web application enforces **physical classroom presence** before marking a student present.

When a teacher begins a lecture, the system generates a **unique, time-sensitive QR Code** bound to specified classroom GPS coordinates (Latitude & Longitude) and a permitted radius (e.g., 50 meters). When a student scans the QR code, their browser transmits their current GPS location to the Java Spring Boot backend. The server calculates the precise distance using the Haversine formula and accepts attendance **only** if the student is physically inside the designated classroom radius.

---

## 🎯 Key Features

### 👑 1. Admin Role
- **Secure Authentication:** Password hashing using BCrypt.
- **Classroom Management:** Add and manage classroom geofences with exact latitude, longitude, and allowed radius in meters.
- **Subject & Faculty Assignment:** Map courses to faculty members.
- **User Management:** Oversee student and teacher accounts.
- **System Analytics:** View aggregate statistics (Total Students, Teachers, Classrooms, Overall System Attendance Rate).

### 👨‍🏫 2. Teacher / Faculty Role
- **Start Attendance Session:** Select Subject and Classroom, preview/adjust permitted GPS coordinates and geofence radius.
- **Dynamic QR Code Generation:** Instant server-side generation of Base64 QR codes containing encrypted UUID session tokens.
- **Live Real-Time Attendance Stream:** Auto-refreshing monitor displaying scanning students, roll numbers, timestamp, and calculated GPS distance.
- **End Session Control:** Deactivates QR tokens immediately upon lecture conclusion.
- **Timetable & History:** View weekly schedules and previous class logs.

### 🎓 3. Student Role
- **Student Dashboard:** View overall attendance percentage gauge with warning alerts if attendance falls below 75%.
- **QR & Geolocation Scanner:**
  - Integrated HTML5 camera QR reader & manual token fallback.
  - Supports live browser GPS (`navigator.geolocation`).
  - **Viva Presentation Preset Switch:** Switch between live browser GPS, "Inside Lab 3" (0m), and "Outside Campus / Food Court" (1.2km away) for live viva testing!
- **Server Validation:** Server validates token status, active session, student identity, non-duplicate scan, and spatial geofence radius.
- **Student Tools:** Attendance history log, timetable view, department notices feed, and personal To-Do reminder list.

---

## 🛠️ Technology Stack
- **Backend Framework:** Java 17+ / Java 24 with Spring Boot 3.2.x
- **Persistence & ORM:** Spring Data JPA / Hibernate
- **Database:**
  - **Zero-Config Default:** Embedded H2 Database (In-Memory, zero setup required)
  - **Production Lab Option:** MySQL 8.x (`mysql-connector-j` driver included)
- **Frontend Stack:** Single Page Application (SPA) using HTML5, CSS3 (Glassmorphism design system), Vanilla JavaScript (ES6+), FontAwesome 6, Google Inter Fonts.
- **QR Libraries:** ZXing (Zebra Crossing 3.5.3) for Java QR rendering; HTML5-QRCode JS for camera scanning.
- **Security:** BCrypt Password Encoder for credential hashing.

---

## 📐 Mathematical Geolocation Verification (Haversine Formula)

The server calculates the Great-Circle distance $d$ between the student's browser GPS coordinates $(\phi_1, \lambda_1)$ and the classroom center $(\phi_2, \lambda_2)$ using the **Haversine Formula**:

$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1) \cdot \cos(\phi_2) \cdot \sin^2\left(\frac{\Delta \lambda}{2}\right)$$

$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$

$$d = R \cdot c$$

Where:
- $R = 6,371,000$ meters (Earth's mean radius).
- $\Delta \phi = \text{radians}(\phi_2 - \phi_1)$
- $\Delta \lambda = \text{radians}(\lambda_2 - \lambda_1)$

If $d \le \text{Allowed Radius}$ (e.g. $50\text{m}$), attendance is marked **PRESENT**. Otherwise, it is **REJECTED** with the exact distance difference returned to the user.

---

## 🔑 Default Demo Credentials

The application automatically seeds the database with the following demo credentials on first boot:

| Role | Username | Password | Notes / Identifier |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | System Administrator |
| **Teacher 1** | `teacher1` | `teacher123` | Prof. Sarah Connor (CS Dept) |
| **Teacher 2** | `teacher2` | `teacher23` | Prof. Alan Turing (IT Dept) |
| **Student 1** | `student1` | `student123` | Alex Mercer (Roll: CS2024001) |
| **Student 2** | `student2` | `student123` | Emma Watson (Roll: CS2024002) |

---

## 🚀 How to Run the Project

### Option A: Running Out-of-the-Box (H2 Embedded - Zero Setup)
1. Open terminal inside the project directory:
   ```bash
   cd C:\Users\Admin\.gemini\antigravity-ide\scratch\smart-attendance-monitoring
   ```
2. Build the project JAR:
   ```bash
   mvn package -DskipTests
   ```
3. Run the Spring Boot Application:
   ```bash
   java -jar target/smart-attendance-monitoring-1.0.0.jar
   ```
4. Open your browser and navigate to:
   ```text
   http://localhost:8080
   ```

### Option B: Deploying with MySQL Database
1. Open MySQL Workbench or MySQL CLI and run the included DDL script:
   ```sql
   SOURCE src/main/resources/mysql_schema.sql;
   ```
2. Edit `src/main/resources/application.properties` to switch from H2 to MySQL:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/smart_attendance_db?useSSL=false&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
   spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
   ```
3. Package and run: `mvn package -DskipTests` && `java -jar target/smart-attendance-monitoring-1.0.0.jar`.

---

## 📁 Project Folder Structure

```text
smart-attendance-monitoring/
├── pom.xml
├── README.md
├── test-api.ps1
└── src/
    ├── main/
    │   ├── java/
    │   │   └── com/
    │   │       └── smartattendance/
    │   │           ├── SmartAttendanceApplication.java
    │   │           ├── controller/
    │   │           │   ├── AdminController.java
    │   │           │   ├── AuthController.java
    │   │           │   ├── StudentController.java
    │   │           │   └── TeacherController.java
    │   │           ├── dto/
    │   │           │   ├── AttendanceResultResponse.java
    │   │           │   ├── AttendanceStatsDTO.java
    │   │           │   ├── LoginRequest.java
    │   │           │   ├── LoginResponse.java
    │   │           │   ├── MarkAttendanceRequest.java
    │   │           │   ├── RegisterRequest.java
    │   │           │   └── StartSessionRequest.java
    │   │           ├── model/
    │   │           │   ├── AttendanceRecord.java
    │   │           │   ├── AttendanceSession.java
    │   │           │   ├── Classroom.java
    │   │           │   ├── Notice.java
    │   │           │   ├── Student.java
    │   │           │   ├── Subject.java
    │   │           │   ├── Teacher.java
    │   │           │   ├── Timetable.java
    │   │           │   ├── TodoItem.java
    │   │           │   └── User.java
    │   │           ├── repository/
    │   │           │   ├── AttendanceRecordRepository.java
    │   │           │   ├── AttendanceSessionRepository.java
    │   │           │   ├── ClassroomRepository.java
    │   │           │   ├── NoticeRepository.java
    │   │           │   ├── StudentRepository.java
    │   │           │   ├── SubjectRepository.java
    │   │           │   ├── TeacherRepository.java
    │   │           │   ├── TimetableRepository.java
    │   │           │   ├── TodoItemRepository.java
    │   │           │   └── UserRepository.java
    │   │           └── service/
    │   │               ├── AdminService.java
    │   │               ├── AttendanceService.java
    │   │               ├── AuthService.java
    │   │               └── QRCodeService.java
    │   └── resources/
    │       ├── application.properties
    │       ├── mysql_schema.sql
    │       └── static/
    │           ├── css/
    │           │   └── style.css
    │           ├── js/
    │           │   ├── admin.js
    │           │   ├── app.js
    │           │   ├── auth.js
    │           │   ├── location-helper.js
    │           │   ├── student.js
    │           │   └── teacher.js
    │           └── index.html
```

---

## 🎓 College Viva / Defense Questions & Answers

### Q1: Why combine QR Code with Geolocation?
**Answer:** A simple static QR code can be photographed and shared on WhatsApp to mark proxy attendance from home. Combining a **time-sensitive dynamic QR session token** with **server-side Haversine GPS radius verification** guarantees that the student is physically present inside the permitted classroom when scanning.

### Q2: How does the server prevent duplicate attendance?
**Answer:** The database enforces a `findBySessionAndStudent` check before recording attendance. If a student attempts to scan the active session token again after already receiving a `PRESENT` status, the server returns an explicit duplicate scan rejection.

### Q3: Why is distance calculated on the backend instead of the frontend?
**Answer:** Frontend JavaScript can be tampered with using browser DevTools or proxy tools. By enforcing calculation on the Java backend using the Haversine formula, the server remains the single source of truth for validation.
