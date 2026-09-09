package com.smartattendance.dto;

public class StartSessionRequest {
    private Long subjectId;
    private Long teacherId;
    private Long classroomId;
    private Double latitude;
    private Double longitude;
    private Double radiusMeters;
    private Integer durationMinutes = 10;

    public StartSessionRequest() {}

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }

    public Long getClassroomId() { return classroomId; }
    public void setClassroomId(Long classroomId) { this.classroomId = classroomId; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getRadiusMeters() { return radiusMeters; }
    public void setRadiusMeters(Double radiusMeters) { this.radiusMeters = radiusMeters; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
}
