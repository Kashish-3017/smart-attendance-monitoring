package com.smartattendance.repository;

import com.smartattendance.model.Student;
import com.smartattendance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUser(User user);
    Optional<Student> findByUserId(Long userId);
    Optional<Student> findByRollNumber(String rollNumber);
    boolean existsByRollNumber(String rollNumber);
}
