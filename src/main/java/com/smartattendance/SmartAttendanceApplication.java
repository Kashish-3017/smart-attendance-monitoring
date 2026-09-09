package com.smartattendance;

import com.smartattendance.model.*;
import com.smartattendance.repository.*;
import com.smartattendance.service.AuthService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SmartAttendanceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartAttendanceApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedDemoData(
            UserRepository userRepository,
            StudentRepository studentRepository,
            TeacherRepository teacherRepository,
            ClassroomRepository classroomRepository,
            SubjectRepository subjectRepository,
            TimetableRepository timetableRepository,
            NoticeRepository noticeRepository,
            AuthService authService
    ) {
        return args -> {
            if (userRepository.count() == 0) {
                System.out.println("=== Seeding Initial Demo Data for Smart Attendance Monitoring ===");

                String hashedAdminPw = authService.getPasswordEncoder().encode("admin123");
                String hashedTeacherPw = authService.getPasswordEncoder().encode("teacher123");
                String hashedStudentPw = authService.getPasswordEncoder().encode("student123");

                // 1. Admin Account
                User adminUser = userRepository.save(new User("admin", hashedAdminPw, "Dr. Robert Admin", "admin@college.edu", "ADMIN"));

                // 2. Teachers
                User t1User = userRepository.save(new User("teacher1", hashedTeacherPw, "Prof. Sarah Connor", "sarah.connor@college.edu", "TEACHER"));
                Teacher t1 = teacherRepository.save(new Teacher(t1User, "EMP101", "Computer Science", "+91-9876543210"));

                User t2User = userRepository.save(new User("teacher2", hashedTeacherPw, "Prof. Alan Turing", "alan.turing@college.edu", "TEACHER"));
                Teacher t2 = teacherRepository.save(new Teacher(t2User, "EMP102", "Information Technology", "+91-9876543211"));

                // 3. Students
                User s1User = userRepository.save(new User("student1", hashedStudentPw, "Alex Mercer", "alex.mercer@student.edu", "STUDENT"));
                Student s1 = studentRepository.save(new Student(s1User, "CS2024001", "Computer Science", "Sem 6", "+91-9988776655"));

                User s2User = userRepository.save(new User("student2", hashedStudentPw, "Emma Watson", "emma.watson@student.edu", "STUDENT"));
                Student s2 = studentRepository.save(new Student(s2User, "CS2024002", "Computer Science", "Sem 6", "+91-9988776656"));

                // 4. Classrooms (Default latitude/longitude coordinates)
                Classroom room1 = classroomRepository.save(new Classroom("Lab 3 (CS Dept)", "Main Academic Block", 19.0760, 72.8777, 50.0));
                Classroom room2 = classroomRepository.save(new Classroom("Lecture Hall 101", "Science Wing", 19.0765, 72.8780, 40.0));
                Classroom room3 = classroomRepository.save(new Classroom("Seminar Room B", "IT Complex", 19.0755, 72.8770, 60.0));

                // 5. Subjects
                Subject sub1 = subjectRepository.save(new Subject("CS601", "Advanced Web Development", "Computer Science", t1));
                Subject sub2 = subjectRepository.save(new Subject("CS602", "Data Structures & Algorithms", "Computer Science", t1));
                Subject sub3 = subjectRepository.save(new Subject("IT603", "Database Management Systems", "Information Technology", t2));

                // 6. Timetable
                timetableRepository.save(new Timetable(sub1, room1, "Monday", "09:00 AM", "10:30 AM"));
                timetableRepository.save(new Timetable(sub2, room2, "Tuesday", "11:00 AM", "12:30 PM"));
                timetableRepository.save(new Timetable(sub3, room3, "Wednesday", "02:00 PM", "03:30 PM"));

                // 7. Notices
                noticeRepository.save(new Notice("Welcome to Smart QR Attendance System", "Students must enable GPS/Geolocation when scanning attendance QR codes inside permitted classrooms.", "Admin Office"));
                noticeRepository.save(new Notice("75% Attendance Requirement", "Kindly maintain a minimum of 75% attendance in all courses to qualify for semester examinations.", "Academic Cell"));

                System.out.println("=== Demo Data Seeded Successfully! ===");
                System.out.println("Admin Account  : admin / admin123");
                System.out.println("Teacher Account: teacher1 / teacher123");
                System.out.println("Student Account: student1 / student123");
            }
        };
    }
}
