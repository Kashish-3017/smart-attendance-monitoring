package com.smartattendance.model;

import jakarta.persistence.*;

@Entity
@Table(name = "timetables")
public class Timetable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    @Column(nullable = false, length = 15)
    private String dayOfWeek;

    @Column(nullable = false, length = 10)
    private String startTime;

    @Column(nullable = false, length = 10)
    private String endTime;

    public Timetable() {}

    public Timetable(Subject subject, Classroom classroom, String dayOfWeek, String startTime, String endTime) {
        this.subject = subject;
        this.classroom = classroom;
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    public Classroom getClassroom() { return classroom; }
    public void setClassroom(Classroom classroom) { this.classroom = classroom; }

    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
}
