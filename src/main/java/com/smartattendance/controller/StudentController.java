package com.smartattendance.controller;

import com.smartattendance.dto.AttendanceResultResponse;
import com.smartattendance.dto.MarkAttendanceRequest;
import com.smartattendance.model.*;
import com.smartattendance.repository.*;
import com.smartattendance.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "*")
@SuppressWarnings("null")
public class StudentController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private AttendanceRecordRepository recordRepository;

    @Autowired
    private TimetableRepository timetableRepository;

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private TodoItemRepository todoItemRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/attendance/mark")
    public ResponseEntity<AttendanceResultResponse> markAttendance(@RequestBody MarkAttendanceRequest request) {
        AttendanceResultResponse response = attendanceService.markAttendance(request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/attendance/history/{studentId}")
    public ResponseEntity<List<AttendanceRecord>> getAttendanceHistory(@PathVariable Long studentId) {
        return ResponseEntity.ok(recordRepository.findByStudentIdOrderByTimestampDesc(studentId));
    }

    @GetMapping("/dashboard/{studentId}")
    public ResponseEntity<Map<String, Object>> getStudentDashboard(@PathVariable Long studentId) {
        List<AttendanceRecord> records = recordRepository.findByStudentIdOrderByTimestampDesc(studentId);
        long totalRecords = records.size();
        long presentCount = records.stream().filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus())).count();

        double percentage = totalRecords > 0
                ? (double) presentCount / totalRecords * 100.0
                : 100.0;

        // Subject-wise stats map
        Map<String, Map<String, Object>> subjectStatsMap = new HashMap<>();
        for (AttendanceRecord r : records) {
            if (r.getSession() != null && r.getSession().getSubject() != null) {
                Subject sub = r.getSession().getSubject();
                String key = sub.getSubjectCode() + " - " + sub.getSubjectName();
                Map<String, Object> subMap = subjectStatsMap.computeIfAbsent(key, k -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("subjectCode", sub.getSubjectCode());
                    m.put("subjectName", sub.getSubjectName());
                    m.put("total", 0L);
                    m.put("present", 0L);
                    return m;
                });
                subMap.put("total", (Long) subMap.get("total") + 1);
                if ("PRESENT".equalsIgnoreCase(r.getStatus())) {
                    subMap.put("present", (Long) subMap.get("present") + 1);
                }
            }
        }

        List<Map<String, Object>> subjectWiseList = new ArrayList<>();
        for (Map<String, Object> subMap : subjectStatsMap.values()) {
            long total = (Long) subMap.get("total");
            long present = (Long) subMap.get("present");
            double subPct = total > 0 ? (double) present / total * 100.0 : 100.0;
            subMap.put("percentage", Math.round(subPct * 10.0) / 10.0);
            subjectWiseList.add(subMap);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("totalClasses", totalRecords);
        data.put("attendedClasses", presentCount);
        data.put("attendancePercentage", Math.round(percentage * 10.0) / 10.0);
        data.put("subjectWise", subjectWiseList);
        data.put("recentRecords", records);
        data.put("notices", noticeRepository.findAllByOrderByCreatedAtDesc());

        return ResponseEntity.ok(data);
    }

    @GetMapping("/timetable")
    public ResponseEntity<List<Timetable>> getTimetable() {
        return ResponseEntity.ok(timetableRepository.findAll());
    }

    @GetMapping("/notices")
    public ResponseEntity<List<Notice>> getNotices() {
        return ResponseEntity.ok(noticeRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/todos/{userId}")
    public ResponseEntity<List<TodoItem>> getTodos(@PathVariable Long userId) {
        return ResponseEntity.ok(todoItemRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @PostMapping("/todos/{userId}")
    public ResponseEntity<TodoItem> addTodo(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().build();

        TodoItem item = new TodoItem(userOpt.get(), body.get("title"));
        return ResponseEntity.ok(todoItemRepository.save(item));
    }

    @PutMapping("/todos/{todoId}/toggle")
    public ResponseEntity<TodoItem> toggleTodo(@PathVariable Long todoId) {
        Optional<TodoItem> itemOpt = todoItemRepository.findById(todoId);
        if (itemOpt.isEmpty()) return ResponseEntity.notFound().build();

        TodoItem item = itemOpt.get();
        item.setCompleted(!item.getCompleted());
        return ResponseEntity.ok(todoItemRepository.save(item));
    }
}
