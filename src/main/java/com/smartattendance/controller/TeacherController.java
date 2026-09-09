package com.smartattendance.controller;

import com.smartattendance.dto.StartSessionRequest;
import com.smartattendance.model.*;
import com.smartattendance.repository.*;
import com.smartattendance.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin(origins = "*")
public class TeacherController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private ClassroomRepository classroomRepository;

    @Autowired
    private AttendanceSessionRepository sessionRepository;

    @Autowired
    private AttendanceRecordRepository recordRepository;

    @Autowired
    private TimetableRepository timetableRepository;

    @GetMapping("/subjects/{teacherId}")
    public ResponseEntity<List<Subject>> getTeacherSubjects(@PathVariable Long teacherId) {
        return ResponseEntity.ok(subjectRepository.findByTeacherId(teacherId));
    }

    @GetMapping("/classrooms")
    public ResponseEntity<List<Classroom>> getClassrooms() {
        return ResponseEntity.ok(classroomRepository.findAll());
    }

    @PostMapping("/session/start")
    public ResponseEntity<Map<String, Object>> startSession(@RequestBody StartSessionRequest request) {
        try {
            Map<String, Object> session = attendanceService.startSession(request);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/session/{sessionId}/end")
    public ResponseEntity<Map<String, Object>> endSession(@PathVariable Long sessionId) {
        try {
            Map<String, Object> res = attendanceService.endSession(sessionId);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @GetMapping("/session/{sessionId}/live")
    public ResponseEntity<List<AttendanceRecord>> getLiveAttendance(@PathVariable Long sessionId) {
        return ResponseEntity.ok(recordRepository.findBySessionId(sessionId));
    }

    @GetMapping("/sessions/{teacherId}")
    public ResponseEntity<List<AttendanceSession>> getTeacherSessions(@PathVariable Long teacherId) {
        return ResponseEntity.ok(sessionRepository.findByTeacherIdOrderByStartTimeDesc(teacherId));
    }

    @GetMapping("/timetable/{teacherId}")
    public ResponseEntity<List<Timetable>> getTeacherTimetable(@PathVariable Long teacherId) {
        return ResponseEntity.ok(timetableRepository.findBySubjectTeacherId(teacherId));
    }
}
