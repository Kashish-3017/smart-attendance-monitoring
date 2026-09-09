package com.smartattendance.model;

import jakarta.persistence.*;

@Entity
@Table(name = "classrooms")
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String roomName;

    @Column(nullable = false, length = 50)
    private String building;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private Double defaultRadiusMeters = 50.0;

    public Classroom() {}

    public Classroom(String roomName, String building, Double latitude, Double longitude, Double defaultRadiusMeters) {
        this.roomName = roomName;
        this.building = building;
        this.latitude = latitude;
        this.longitude = longitude;
        this.defaultRadiusMeters = defaultRadiusMeters;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoomName() { return roomName; }
    public void setRoomName(String roomName) { this.roomName = roomName; }

    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getDefaultRadiusMeters() { return defaultRadiusMeters; }
    public void setDefaultRadiusMeters(Double defaultRadiusMeters) { this.defaultRadiusMeters = defaultRadiusMeters; }
}
