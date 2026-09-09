package com.smartattendance.repository;

import com.smartattendance.model.TodoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TodoItemRepository extends JpaRepository<TodoItem, Long> {
    List<TodoItem> findByUserIdOrderByCreatedAtDesc(Long userId);
}
