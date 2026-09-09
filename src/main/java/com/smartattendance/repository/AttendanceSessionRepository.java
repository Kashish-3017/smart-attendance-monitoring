package com.smartattendance.repository;

import com.smartattendance.model.AttendanceSession;
import com.smartattendance.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    Optional<AttendanceSession> findBySessionToken(String sessionToken);
    Optional<AttendanceSession> findBySessionTokenAndActiveTrue(String sessionToken);
    List<AttendanceSession> findByTeacherAndActiveTrue(Teacher teacher);
    List<AttendanceSession> findByTeacherIdOrderByStartTimeDesc(Long teacherId);
    List<AttendanceSession> findBySubjectIdOrderByStartTimeDesc(Long subjectId);
}
