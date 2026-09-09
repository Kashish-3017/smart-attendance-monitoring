package com.smartattendance.service;

import com.smartattendance.dto.LoginRequest;
import com.smartattendance.dto.LoginResponse;
import com.smartattendance.dto.RegisterRequest;
import com.smartattendance.model.Student;
import com.smartattendance.model.Teacher;
import com.smartattendance.model.User;
import com.smartattendance.repository.StudentRepository;
import com.smartattendance.repository.TeacherRepository;
import com.smartattendance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public BCryptPasswordEncoder getPasswordEncoder() {
        return passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty()) {
            return new LoginResponse(false, "Invalid username or password", null, null, null, null, null);
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())
                && !request.getPassword().equals(user.getPasswordHash())) {
            return new LoginResponse(false, "Invalid username or password", null, null, null, null, null);
        }

        Long roleEntityId = null;
        if ("STUDENT".equalsIgnoreCase(user.getRole())) {
            Optional<Student> studentOpt = studentRepository.findByUser(user);
            if (studentOpt.isPresent()) {
                roleEntityId = studentOpt.get().getId();
            }
        } else if ("TEACHER".equalsIgnoreCase(user.getRole())) {
            Optional<Teacher> teacherOpt = teacherRepository.findByUser(user);
            if (teacherOpt.isPresent()) {
                roleEntityId = teacherOpt.get().getId();
            }
        }

        return new LoginResponse(
                true,
                "Login successful",
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getRole(),
                roleEntityId
        );
    }

    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return new LoginResponse(false, "Username is already taken", null, null, null, null, null);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return new LoginResponse(false, "Email is already registered", null, null, null, null, null);
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        String role = request.getRole().toUpperCase();

        User user = new User(
                request.getUsername(),
                hashedPassword,
                request.getFullName(),
                request.getEmail(),
                role
        );
        user = userRepository.save(user);

        Long roleEntityId = null;
        if ("STUDENT".equalsIgnoreCase(role)) {
            if (studentRepository.existsByRollNumber(request.getRollNumber())) {
                userRepository.delete(user);
                return new LoginResponse(false, "Roll number already exists", null, null, null, null, null);
            }
            Student student = new Student(
                    user,
                    request.getRollNumber(),
                    request.getDepartment() != null ? request.getDepartment() : "Computer Science",
                    request.getSemester() != null ? request.getSemester() : "Sem 6",
                    request.getPhone()
            );
            student = studentRepository.save(student);
            roleEntityId = student.getId();
        } else if ("TEACHER".equalsIgnoreCase(role)) {
            if (teacherRepository.existsByEmployeeId(request.getEmployeeId())) {
                userRepository.delete(user);
                return new LoginResponse(false, "Employee ID already exists", null, null, null, null, null);
            }
            Teacher teacher = new Teacher(
                    user,
                    request.getEmployeeId(),
                    request.getDepartment() != null ? request.getDepartment() : "Computer Science",
                    request.getPhone()
            );
            teacher = teacherRepository.save(teacher);
            roleEntityId = teacher.getId();
        }

        return new LoginResponse(
                true,
                "Registration successful! You can now log in.",
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getRole(),
                roleEntityId
        );
    }
}
