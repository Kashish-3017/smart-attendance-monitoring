package com.smartattendance.repository;

import com.smartattendance.model.AttendanceRecord;
import com.smartattendance.model.AttendanceSession;
import com.smartattendance.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findBySession(AttendanceSession session);
    List<AttendanceRecord> findBySessionId(Long sessionId);
    List<AttendanceRecord> findByStudent(Student student);
    List<AttendanceRecord> findByStudentIdOrderByTimestampDesc(Long studentId);
    Optional<AttendanceRecord> findBySessionAndStudent(AttendanceSession session, Student student);
    boolean existsBySessionIdAndStudentId(Long sessionId, Long studentId);
    boolean existsBySessionIdAndStudentIdAndStatus(Long sessionId, Long studentId, String status);
    long countByStudentIdAndStatus(Long studentId, String status);
    long countByStudentId(Long studentId);
}
