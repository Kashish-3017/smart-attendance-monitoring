package com.smartattendance.repository;

import com.smartattendance.model.Teacher;
import com.smartattendance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByUser(User user);
    Optional<Teacher> findByUserId(Long userId);
    Optional<Teacher> findByEmployeeId(String employeeId);
    boolean existsByEmployeeId(String employeeId);
}
