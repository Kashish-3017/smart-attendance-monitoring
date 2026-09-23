package com.smartattendance.dto;

public class SubjectRequest {
    private String subjectCode;
    private String subjectName;
    private String department;
    private Long teacherId;

    public SubjectRequest() {}

    public SubjectRequest(String subjectCode, String subjectName, String department, Long teacherId) {
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.department = department;
        this.teacherId = teacherId;
    }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }
}
