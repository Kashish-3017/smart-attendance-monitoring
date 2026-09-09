package com.smartattendance.service;

import com.smartattendance.dto.AttendanceStatsDTO;
import com.smartattendance.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private ClassroomRepository classroomRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private AttendanceSessionRepository sessionRepository;

    @Autowired
    private AttendanceRecordRepository recordRepository;

    public AttendanceStatsDTO getSystemStats() {
        AttendanceStatsDTO stats = new AttendanceStatsDTO();
        stats.setTotalStudents(studentRepository.count());
        stats.setTotalTeachers(teacherRepository.count());
        stats.setTotalClassrooms(classroomRepository.count());
        stats.setTotalSubjects(subjectRepository.count());
        stats.setTotalSessions(sessionRepository.count());
        stats.setTotalRecords(recordRepository.count());

        long presentCount = recordRepository.findAll().stream()
                .filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus()))
                .count();
        stats.setPresentCount(presentCount);
        stats.setRejectedCount(stats.getTotalRecords() - presentCount);

        double pct = stats.getTotalRecords() > 0
                ? (double) presentCount / stats.getTotalRecords() * 100.0
                : 100.0;
        stats.setAttendancePercentage(Math.round(pct * 10.0) / 10.0);

        return stats;
    }
}
