-- MySQL Database DDL Script for Smart Attendance Monitoring System
-- Create database
CREATE DATABASE IF NOT EXISTS smart_attendance_db;
USE smart_attendance_db;

-- 1. Users Table (Admin, Teacher, Student credentials & roles)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL, -- 'ADMIN', 'TEACHER', 'STUDENT'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Students Table
CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    roll_number VARCHAR(30) NOT NULL UNIQUE,
    department VARCHAR(50) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    employee_id VARCHAR(30) NOT NULL UNIQUE,
    department VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Classrooms Table (Permitted GPS coordinates & radius)
CREATE TABLE IF NOT EXISTS classrooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_name VARCHAR(50) NOT NULL UNIQUE,
    building VARCHAR(50) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    default_radius_meters DOUBLE DEFAULT 50.0
);

-- 5. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(30) NOT NULL UNIQUE,
    subject_name VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    teacher_id BIGINT,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
);

-- 6. Attendance Sessions Table (Dynamic QR Code + Geolocation verification)
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_token VARCHAR(100) NOT NULL UNIQUE,
    subject_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    classroom_id BIGINT NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    radius_meters DOUBLE NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
);

-- 7. Attendance Records Table (Logs student scan attempts & location math results)
CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'PRESENT', 'REJECTED'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    student_lat DOUBLE NOT NULL,
    student_lon DOUBLE NOT NULL,
    calculated_distance_meters DOUBLE NOT NULL,
    status_message VARCHAR(255),
    UNIQUE KEY unique_session_student (session_id, student_id),
    FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 8. Timetable Table
CREATE TABLE IF NOT EXISTS timetables (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_id BIGINT NOT NULL,
    classroom_id BIGINT NOT NULL,
    day_of_week VARCHAR(15) NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
);

-- 9. Notices Table
CREATE TABLE IF NOT EXISTS notices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    posted_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. To-Do Items Table
CREATE TABLE IF NOT EXISTS todo_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
