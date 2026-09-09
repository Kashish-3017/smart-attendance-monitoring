package com.smartattendance.dto;

public class LoginResponse {
    private boolean success;
    private String message;
    private Long userId;
    private String username;
    private String fullName;
    private String role;
    private Long roleEntityId; // studentId or teacherId

    public LoginResponse() {}

    public LoginResponse(boolean success, String message, Long userId, String username, String fullName, String role, Long roleEntityId) {
        this.success = success;
        this.message = message;
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.roleEntityId = roleEntityId;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Long getRoleEntityId() { return roleEntityId; }
    public void setRoleEntityId(Long roleEntityId) { this.roleEntityId = roleEntityId; }
}
