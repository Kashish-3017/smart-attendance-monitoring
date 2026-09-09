package com.smartattendance.model;

import jakarta.persistence.*;

@Entity
@Table(name = "subjects")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String subjectCode;

    @Column(nullable = false, length = 100)
    private String subjectName;

    @Column(nullable = false, length = 50)
    private String department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    public Subject() {}

    public Subject(String subjectCode, String subjectName, String department, Teacher teacher) {
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.department = department;
        this.teacher = teacher;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Teacher getTeacher() { return teacher; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }
}
