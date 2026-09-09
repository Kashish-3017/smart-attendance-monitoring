package com.smartattendance.dto;

public class AttendanceStatsDTO {
    private long totalStudents;
    private long totalTeachers;
    private long totalClassrooms;
    private long totalSubjects;
    private long totalSessions;
    private long totalRecords;
    private long presentCount;
    private long rejectedCount;
    private double attendancePercentage;

    public AttendanceStatsDTO() {}

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getTotalTeachers() { return totalTeachers; }
    public void setTotalTeachers(long totalTeachers) { this.totalTeachers = totalTeachers; }

    public long getTotalClassrooms() { return totalClassrooms; }
    public void setTotalClassrooms(long totalClassrooms) { this.totalClassrooms = totalClassrooms; }

    public long getTotalSubjects() { return totalSubjects; }
    public void setTotalSubjects(long totalSubjects) { this.totalSubjects = totalSubjects; }

    public long getTotalSessions() { return totalSessions; }
    public void setTotalSessions(long totalSessions) { this.totalSessions = totalSessions; }

    public long getTotalRecords() { return totalRecords; }
    public void setTotalRecords(long totalRecords) { this.totalRecords = totalRecords; }

    public long getPresentCount() { return presentCount; }
    public void setPresentCount(long presentCount) { this.presentCount = presentCount; }

    public long getRejectedCount() { return rejectedCount; }
    public void setRejectedCount(long rejectedCount) { this.rejectedCount = rejectedCount; }

    public double getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; }
}
