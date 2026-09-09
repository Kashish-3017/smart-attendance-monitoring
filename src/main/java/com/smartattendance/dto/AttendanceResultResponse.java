package com.smartattendance.dto;

public class AttendanceResultResponse {
    private boolean success;
    private String status; // PRESENT, REJECTED
    private String message;
    private Double distanceMeters;
    private Double allowedRadiusMeters;
    private String subjectName;
    private String classroomName;
    private String timestamp;

    public AttendanceResultResponse() {}

    public AttendanceResultResponse(boolean success, String status, String message, Double distanceMeters, Double allowedRadiusMeters, String subjectName, String classroomName, String timestamp) {
        this.success = success;
        this.status = status;
        this.message = message;
        this.distanceMeters = distanceMeters;
        this.allowedRadiusMeters = allowedRadiusMeters;
        this.subjectName = subjectName;
        this.classroomName = classroomName;
        this.timestamp = timestamp;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Double getDistanceMeters() { return distanceMeters; }
    public void setDistanceMeters(Double distanceMeters) { this.distanceMeters = distanceMeters; }

    public Double getAllowedRadiusMeters() { return allowedRadiusMeters; }
    public void setAllowedRadiusMeters(Double allowedRadiusMeters) { this.allowedRadiusMeters = allowedRadiusMeters; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getClassroomName() { return classroomName; }
    public void setClassroomName(String classroomName) { this.classroomName = classroomName; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
