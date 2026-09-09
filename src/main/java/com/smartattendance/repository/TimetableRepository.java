package com.smartattendance.repository;

import com.smartattendance.model.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findByDayOfWeek(String dayOfWeek);
    List<Timetable> findBySubjectTeacherId(Long teacherId);
}
