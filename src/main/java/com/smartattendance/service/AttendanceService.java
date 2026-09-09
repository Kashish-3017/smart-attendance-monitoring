package com.smartattendance.service;

import com.smartattendance.dto.AttendanceResultResponse;
import com.smartattendance.dto.MarkAttendanceRequest;
import com.smartattendance.dto.StartSessionRequest;
import com.smartattendance.model.*;
import com.smartattendance.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceSessionRepository sessionRepository;

    @Autowired
    private AttendanceRecordRepository recordRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private ClassroomRepository classroomRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private QRCodeService qrCodeService;

    /**
     * Haversine formula to calculate the distance between two GPS points in meters.
     */
    public static double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // Radius of the Earth in meters
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10.0) / 10.0; // Round to 1 decimal place
    }

    public Map<String, Object> startSession(StartSessionRequest request) {
        Optional<Teacher> teacherOpt = teacherRepository.findById(request.getTeacherId());
        Optional<Subject> subjectOpt = subjectRepository.findById(request.getSubjectId());
        Optional<Classroom> classroomOpt = classroomRepository.findById(request.getClassroomId());

        if (teacherOpt.isEmpty() || subjectOpt.isEmpty() || classroomOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid Teacher, Subject, or Classroom ID");
        }

        Teacher teacher = teacherOpt.get();
        Subject subject = subjectOpt.get();
        Classroom classroom = classroomOpt.get();

        // Expire any existing active sessions for this teacher
        List<AttendanceSession> activeSessions = sessionRepository.findByTeacherAndActiveTrue(teacher);
        for (AttendanceSession session : activeSessions) {
            session.setActive(false);
            session.setEndTime(LocalDateTime.now());
            sessionRepository.save(session);
        }

        String token = "ATT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase() + "-" + System.currentTimeMillis();

        Double targetLat = request.getLatitude() != null ? request.getLatitude() : classroom.getLatitude();
        Double targetLon = request.getLongitude() != null ? request.getLongitude() : classroom.getLongitude();
        Double targetRadius = request.getRadiusMeters() != null ? request.getRadiusMeters() : classroom.getDefaultRadiusMeters();
        Integer durationMins = request.getDurationMinutes() != null ? request.getDurationMinutes() : 10;

        AttendanceSession newSession = new AttendanceSession(
                token,
                subject,
                teacher,
                classroom,
                targetLat,
                targetLon,
                targetRadius,
                durationMins
        );

        newSession = sessionRepository.save(newSession);

        String qrCodeBase64 = qrCodeService.generateQRCodeBase64(token, 300, 300);

        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", newSession.getId());
        response.put("sessionToken", token);
        response.put("subjectName", subject.getSubjectName());
        response.put("subjectCode", subject.getSubjectCode());
        response.put("roomName", classroom.getRoomName());
        response.put("latitude", targetLat);
        response.put("longitude", targetLon);
        response.put("radiusMeters", targetRadius);
        response.put("durationMinutes", durationMins);
        response.put("qrCodeBase64", qrCodeBase64);
        response.put("startTime", newSession.getStartTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        response.put("endTime", newSession.getEndTime() != null ? newSession.getEndTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : "");

        return response;
    }

    public Map<String, Object> endSession(Long sessionId) {
        Optional<AttendanceSession> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) {
            throw new IllegalArgumentException("Session not found");
        }

        AttendanceSession session = sessionOpt.get();
        session.setActive(false);
        session.setEndTime(LocalDateTime.now());
        sessionRepository.save(session);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Attendance session ended successfully");
        response.put("sessionId", session.getId());
        return response;
    }

    public AttendanceResultResponse markAttendance(MarkAttendanceRequest request) {
        // 1. Validate Session Token
        Optional<AttendanceSession> sessionOpt = sessionRepository.findBySessionToken(request.getSessionToken());
        if (sessionOpt.isEmpty()) {
            return new AttendanceResultResponse(
                    false, "REJECTED", "Invalid or unknown QR code token.",
                    0.0, 0.0, "Unknown", "Unknown", getCurrentFormattedTime()
            );
        }

        AttendanceSession session = sessionOpt.get();
        if (!Boolean.TRUE.equals(session.getActive())) {
            return new AttendanceResultResponse(
                    false, "REJECTED", "This attendance session has been ended by the teacher or has expired.",
                    0.0, session.getRadiusMeters(), session.getSubject().getSubjectName(), session.getClassroom().getRoomName(), getCurrentFormattedTime()
            );
        }

        // 2. Validate Student
        Optional<Student> studentOpt = studentRepository.findById(request.getStudentId());
        if (studentOpt.isEmpty()) {
            return new AttendanceResultResponse(
                    false, "REJECTED", "Student record not found in system.",
                    0.0, session.getRadiusMeters(), session.getSubject().getSubjectName(), session.getClassroom().getRoomName(), getCurrentFormattedTime()
            );
        }
        Student student = studentOpt.get();

        // 3. Check for existing record for this session & student
        Optional<AttendanceRecord> existingOpt = recordRepository.findBySessionAndStudent(session, student);
        if (existingOpt.isPresent() && "PRESENT".equalsIgnoreCase(existingOpt.get().getStatus())) {
            return new AttendanceResultResponse(
                    false, "REJECTED", "Duplicate scan detected! You have already marked attendance for this session.",
                    0.0, session.getRadiusMeters(), session.getSubject().getSubjectName(), session.getClassroom().getRoomName(), getCurrentFormattedTime()
            );
        }

        // 4. Server-Side Geolocation Validation (Haversine Formula)
        double distanceMeters = calculateHaversineDistance(
                request.getLatitude(), request.getLongitude(),
                session.getLatitude(), session.getLongitude()
        );

        double allowedRadius = session.getRadiusMeters();

        if (distanceMeters > allowedRadius) {
            String message = String.format(
                    "Location Verification Failed! You are %.1fm away from %s (Allowed Radius: %.0fm). Please move inside the classroom.",
                    distanceMeters, session.getClassroom().getRoomName(), allowedRadius
            );

            // Log or update rejected attempt for audit
            AttendanceRecord record = existingOpt.orElseGet(() -> new AttendanceRecord(
                    session, student, "REJECTED", request.getLatitude(), request.getLongitude(), distanceMeters, message
            ));
            record.setStatus("REJECTED");
            record.setStudentLat(request.getLatitude());
            record.setStudentLon(request.getLongitude());
            record.setCalculatedDistanceMeters(distanceMeters);
            record.setStatusMessage(message);
            record.setTimestamp(LocalDateTime.now());
            recordRepository.save(record);

            return new AttendanceResultResponse(
                    false, "REJECTED", message,
                    distanceMeters, allowedRadius, session.getSubject().getSubjectName(), session.getClassroom().getRoomName(), getCurrentFormattedTime()
            );
        }

        // 5. Save or Update Valid Attendance Record as PRESENT
        String successMessage = String.format(
                "Attendance successfully verified and marked! (Distance to classroom: %.1fm)", distanceMeters
        );

        AttendanceRecord record = existingOpt.orElseGet(() -> new AttendanceRecord(
                session, student, "PRESENT", request.getLatitude(), request.getLongitude(), distanceMeters, successMessage
        ));
        record.setStatus("PRESENT");
        record.setStudentLat(request.getLatitude());
        record.setStudentLon(request.getLongitude());
        record.setCalculatedDistanceMeters(distanceMeters);
        record.setStatusMessage(successMessage);
        record.setTimestamp(LocalDateTime.now());
        recordRepository.save(record);

        return new AttendanceResultResponse(
                true, "PRESENT", successMessage,
                distanceMeters, allowedRadius, session.getSubject().getSubjectName(), session.getClassroom().getRoomName(), getCurrentFormattedTime()
        );
    }

    private String getCurrentFormattedTime() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }
}
