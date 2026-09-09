# PowerShell REST API Automated Verification Script

$adminBody = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
$adminRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body $adminBody
Write-Host "1. Admin Login Success: $($adminRes.fullName) [$($adminRes.role)]"

$teacherBody = @{ username = "teacher1"; password = "teacher123" } | ConvertTo-Json
$teacherRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body $teacherBody
Write-Host "2. Teacher Login Success: $($teacherRes.fullName) [Teacher ID: $($teacherRes.roleEntityId)]"

$startBody = @{
    teacherId = $teacherRes.roleEntityId
    subjectId = 1
    classroomId = 1
    latitude = 19.0760
    longitude = 72.8777
    radiusMeters = 50.0
} | ConvertTo-Json

$sessionRes = Invoke-RestMethod -Uri "http://localhost:8080/api/teacher/session/start" -Method POST -ContentType "application/json" -Body $startBody
Write-Host "3. Session Started! Token: $($sessionRes.sessionToken) | Room: $($sessionRes.roomName)"

$studentBody = @{ username = "student1"; password = "student123" } | ConvertTo-Json
$studentRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body $studentBody
Write-Host "4. Student Login Success: $($studentRes.fullName) [Student ID: $($studentRes.roleEntityId)]"

# TEST A: Outside Geofence (1.2km away -> 19.0850, 72.8850)
Write-Host "`n--- TEST A: Scanning from Outside Geofence (1.2km away) ---"
$outsideBody = @{
    sessionToken = $sessionRes.sessionToken
    studentId = $studentRes.roleEntityId
    latitude = 19.0850
    longitude = 72.8850
} | ConvertTo-Json

try {
    $outRes = Invoke-RestMethod -Uri "http://localhost:8080/api/student/attendance/mark" -Method POST -ContentType "application/json" -Body $outsideBody
    Write-Host "Response:" $outRes.status "-" $outRes.message
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "Correctly Rejected Response:" $reader.ReadToEnd()
}

# TEST B: Inside Geofence (Lab 3 -> 19.0760, 72.8777)
Write-Host "`n--- TEST B: Scanning from Inside Geofence (Lab 3) ---"
$insideBody = @{
    sessionToken = $sessionRes.sessionToken
    studentId = $studentRes.roleEntityId
    latitude = 19.0760
    longitude = 72.8777
} | ConvertTo-Json

$inRes = Invoke-RestMethod -Uri "http://localhost:8080/api/student/attendance/mark" -Method POST -ContentType "application/json" -Body $insideBody
Write-Host "Status:" $inRes.status
Write-Host "Message:" $inRes.message
Write-Host "Calculated Distance:" $inRes.distanceMeters "meters"

# TEST C: Duplicate Scan Attempt
Write-Host "`n--- TEST C: Attempting Duplicate Scan for Same Session ---"
try {
    $dupRes = Invoke-RestMethod -Uri "http://localhost:8080/api/student/attendance/mark" -Method POST -ContentType "application/json" -Body $insideBody
    Write-Host "Response:" $dupRes.status "-" $dupRes.message
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "Duplicate Correctly Blocked:" $reader.ReadToEnd()
}
