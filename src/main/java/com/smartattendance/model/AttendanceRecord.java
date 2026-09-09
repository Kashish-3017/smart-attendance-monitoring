package com.smartattendance.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_records", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"session_id", "student_id"})
})
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "session_id", nullable = false)
    private AttendanceSession session;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false, length = 20)
    private String status; // "PRESENT", "REJECTED"

    private LocalDateTime timestamp;

    @Column(nullable = false)
    private Double studentLat;

    @Column(nullable = false)
    private Double studentLon;

    @Column(nullable = false)
    private Double calculatedDistanceMeters;

    private String statusMessage;

    public AttendanceRecord() {
        this.timestamp = LocalDateTime.now();
    }

    public AttendanceRecord(AttendanceSession session, Student student, String status, Double studentLat, Double studentLon, Double calculatedDistanceMeters, String statusMessage) {
        this.session = session;
        this.student = student;
        this.status = status;
        this.timestamp = LocalDateTime.now();
        this.studentLat = studentLat;
        this.studentLon = studentLon;
        this.calculatedDistanceMeters = calculatedDistanceMeters;
        this.statusMessage = statusMessage;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AttendanceSession getSession() { return session; }
    public void setSession(AttendanceSession session) { this.session = session; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public Double getStudentLat() { return studentLat; }
    public void setStudentLat(Double studentLat) { this.studentLat = studentLat; }

    public Double getStudentLon() { return studentLon; }
    public void setStudentLon(Double studentLon) { this.studentLon = studentLon; }

    public Double getCalculatedDistanceMeters() { return calculatedDistanceMeters; }
    public void setCalculatedDistanceMeters(Double calculatedDistanceMeters) { this.calculatedDistanceMeters = calculatedDistanceMeters; }

    public String getStatusMessage() { return statusMessage; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }
}
