package com.smartattendance.repository;

import com.smartattendance.model.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
    Optional<Classroom> findByRoomName(String roomName);
    boolean existsByRoomName(String roomName);
}
