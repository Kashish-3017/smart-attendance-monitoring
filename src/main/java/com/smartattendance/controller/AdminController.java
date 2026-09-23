package com.smartattendance.controller;

import com.smartattendance.dto.AttendanceStatsDTO;
import com.smartattendance.dto.SubjectRequest;
import com.smartattendance.model.*;
import com.smartattendance.repository.*;
import com.smartattendance.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@SuppressWarnings("null")
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
    public ResponseEntity<Subject> addSubject(@RequestBody SubjectRequest request) {
        Teacher teacher = null;
        if (request.getTeacherId() != null && request.getTeacherId() > 0) {
            teacher = teacherRepository.findById(request.getTeacherId())
                    .orElseGet(() -> teacherRepository.findByUserId(request.getTeacherId()).orElse(null));
        }
        Subject subject = new Subject(
                request.getSubjectCode(),
                request.getSubjectName(),
                request.getDepartment(),
                teacher
        );
        Subject saved = subjectRepository.save(subject);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/subjects/{id}")
    public ResponseEntity<Subject> updateSubject(@PathVariable Long id, @RequestBody SubjectRequest request) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found with id " + id));
        subject.setSubjectCode(request.getSubjectCode());
        subject.setSubjectName(request.getSubjectName());
        subject.setDepartment(request.getDepartment());

        if (request.getTeacherId() != null && request.getTeacherId() > 0) {
            Teacher teacher = teacherRepository.findById(request.getTeacherId())
                    .orElseGet(() -> teacherRepository.findByUserId(request.getTeacherId()).orElse(null));
            subject.setTeacher(teacher);
        } else {
            subject.setTeacher(null);
        }

        Subject updated = subjectRepository.save(subject);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/assign")
    public ResponseEntity<Subject> assignSubjectToTeacher(
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long teacherId,
            @RequestBody(required = false) java.util.Map<String, Object> body) {
        Long sId = subjectId;
        Long tId = teacherId;
        if (body != null) {
            if (sId == null && body.get("subjectId") != null) {
                try { sId = Long.valueOf(body.get("subjectId").toString()); } catch (Exception ignored) {}
            }
            if (tId == null && body.get("teacherId") != null) {
                try { tId = Long.valueOf(body.get("teacherId").toString()); } catch (Exception ignored) {}
            }
        }
        if (sId == null) {
            return ResponseEntity.badRequest().build();
        }
        final Long finalSubId = sId;
        Subject subject = subjectRepository.findById(finalSubId)
                .orElseThrow(() -> new RuntimeException("Subject not found with id " + finalSubId));
        if (tId != null && tId > 0) {
            final Long finalTeachId = tId;
            Teacher teacher = teacherRepository.findById(finalTeachId)
                    .orElseGet(() -> teacherRepository.findByUserId(finalTeachId).orElse(null));
            subject.setTeacher(teacher);
        } else {
            subject.setTeacher(null);
        }
        Subject saved = subjectRepository.save(subject);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/subjects/{subjectId}/assign/{teacherId}")
    public ResponseEntity<Subject> assignTeacherPath(
            @PathVariable Long subjectId,
            @PathVariable Long teacherId) {
        final Long finalSubId = subjectId;
        Subject subject = subjectRepository.findById(finalSubId)
                .orElseThrow(() -> new RuntimeException("Subject not found with id " + finalSubId));
        final Long finalTeachId = teacherId;
        Teacher teacher = (finalTeachId > 0) ? teacherRepository.findById(finalTeachId)
                .orElseGet(() -> teacherRepository.findByUserId(finalTeachId).orElse(null)) : null;
        subject.setTeacher(teacher);
        return ResponseEntity.ok(subjectRepository.save(subject));
    }

    @PostMapping("/teachers/{teacherId}/assign-subjects")
    public ResponseEntity<List<Subject>> assignSubjectsToTeacher(
            @PathVariable Long teacherId,
            @RequestBody(required = false) Object rawBody) {
        final Long finalTeachId = teacherId;
        Teacher teacher = teacherRepository.findById(finalTeachId)
                .orElseGet(() -> teacherRepository.findByUserId(finalTeachId)
                        .orElseThrow(() -> new RuntimeException("Teacher not found with id " + finalTeachId)));

        List<Long> subjectIds = new ArrayList<>();
        if (rawBody instanceof List<?> list) {
            for (Object item : list) {
                if (item instanceof Number num) {
                    subjectIds.add(num.longValue());
                } else if (item != null) {
                    try { subjectIds.add(Long.valueOf(item.toString())); } catch (Exception ignored) {}
                }
            }
        } else if (rawBody instanceof java.util.Map<?, ?> map) {
            Object idsObj = map.get("subjectIds");
            if (idsObj instanceof List<?> list) {
                for (Object item : list) {
                    if (item instanceof Number num) {
                        subjectIds.add(num.longValue());
                    } else if (item != null) {
                        try { subjectIds.add(Long.valueOf(item.toString())); } catch (Exception ignored) {}
                    }
                }
            }
        }

        List<Subject> currentSubjects = subjectRepository.findByTeacherId(teacher.getId());
        for (Subject sub : currentSubjects) {
            if (!subjectIds.contains(sub.getId())) {
                sub.setTeacher(null);
                subjectRepository.save(sub);
            }
        }

        List<Subject> updatedList = new ArrayList<>();
        for (Long sId : subjectIds) {
            Subject sub = subjectRepository.findById(sId).orElse(null);
            if (sub != null) {
                sub.setTeacher(teacher);
                updatedList.add(subjectRepository.save(sub));
            }
        }
        return ResponseEntity.ok(updatedList);
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
