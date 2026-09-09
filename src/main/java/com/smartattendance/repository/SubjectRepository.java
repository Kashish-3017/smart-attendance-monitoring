package com.smartattendance.repository;

import com.smartattendance.model.Subject;
import com.smartattendance.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findBySubjectCode(String subjectCode);
    List<Subject> findByTeacher(Teacher teacher);
    List<Subject> findByTeacherId(Long teacherId);
    boolean existsBySubjectCode(String subjectCode);
}
