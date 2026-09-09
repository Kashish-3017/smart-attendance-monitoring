package com.smartattendance.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_sessions")
public class AttendanceSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String sessionToken;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private Double radiusMeters;

    private Integer durationMinutes = 10;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Column(nullable = false)
    private Boolean active = true;

    public AttendanceSession() {
        this.startTime = LocalDateTime.now();
    }

    public AttendanceSession(String sessionToken, Subject subject, Teacher teacher, Classroom classroom, Double latitude, Double longitude, Double radiusMeters, Integer durationMinutes) {
        this.sessionToken = sessionToken;
        this.subject = subject;
        this.teacher = teacher;
        this.classroom = classroom;
        this.latitude = latitude;
        this.longitude = longitude;
        this.radiusMeters = radiusMeters;
        this.durationMinutes = (durationMinutes != null && durationMinutes > 0) ? durationMinutes : 10;
        this.startTime = LocalDateTime.now();
        this.endTime = this.startTime.plusMinutes(this.durationMinutes);
        this.active = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    public Teacher getTeacher() { return teacher; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }

    public Classroom getClassroom() { return classroom; }
    public void setClassroom(Classroom classroom) { this.classroom = classroom; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getRadiusMeters() { return radiusMeters; }
    public void setRadiusMeters(Double radiusMeters) { this.radiusMeters = radiusMeters; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public Boolean getActive() {
        if (active != null && active && endTime != null && LocalDateTime.now().isAfter(endTime)) {
            return false;
        }
        return active;
    }
    public void setActive(Boolean active) { this.active = active; }
}
