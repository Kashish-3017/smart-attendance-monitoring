package com.smartattendance.controller;

import com.smartattendance.dto.AttendanceStatsDTO;
import com.smartattendance.model.*;
import com.smartattendance.repository.*;
import com.smartattendance.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private ClassroomRepository classroomRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private TimetableRepository timetableRepository;

    @GetMapping("/stats")
    public ResponseEntity<AttendanceStatsDTO> getStats() {
        return ResponseEntity.ok(adminService.getSystemStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentRepository.findAll());
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<Teacher>> getAllTeachers() {
        return ResponseEntity.ok(teacherRepository.findAll());
    }

    @DeleteMapping("/teachers/{id}")
    public ResponseEntity<Void> deleteTeacher(@PathVariable Long id) {
        teacherRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/classrooms")
    public ResponseEntity<List<Classroom>> getAllClassrooms() {
        return ResponseEntity.ok(classroomRepository.findAll());
    }

    @PostMapping("/classrooms")
    public ResponseEntity<Classroom> addClassroom(@RequestBody Classroom classroom) {
        Classroom saved = classroomRepository.save(classroom);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/classrooms/{id}")
    public ResponseEntity<Void> deleteClassroom(@PathVariable Long id) {
        classroomRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<Subject>> getAllSubjects() {
        return ResponseEntity.ok(subjectRepository.findAll());
    }

    @PostMapping("/subjects")
    public ResponseEntity<Subject> addSubject(@RequestBody Subject subject) {
        Subject saved = subjectRepository.save(subject);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        subjectRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/notices")
    public ResponseEntity<List<Notice>> getAllNotices() {
        return ResponseEntity.ok(noticeRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping("/notices")
    public ResponseEntity<Notice> addNotice(@RequestBody Notice notice) {
        Notice saved = noticeRepository.save(notice);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/notices/{id}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Long id) {
        noticeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
