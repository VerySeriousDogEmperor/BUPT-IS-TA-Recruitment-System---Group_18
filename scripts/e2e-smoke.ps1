param(
    [string]$BaseUrl = "http://localhost:9191"
)

$ErrorActionPreference = "Stop"

function Invoke-Json {
    param(
        [Microsoft.PowerShell.Commands.WebRequestSession]$Session,
        [string]$Method = "GET",
        [string]$Path,
        [object]$Body = $null,
        [int[]]$AllowedCodes = @(200)
    )

    $params = @{
        UseBasicParsing = $true
        Method = $Method
        Uri = "$BaseUrl$Path"
        ContentType = "application/json"
    }
    if ($Session) {
        $params.WebSession = $Session
        if ($Session.Headers.ContainsKey("X-CSRF-Token")) {
            $params.Headers = @{ "X-CSRF-Token" = $Session.Headers["X-CSRF-Token"] }
        }
    }
    if ($null -ne $Body) {
        $params.Body = ($Body | ConvertTo-Json -Compress)
    }

    try {
        $response = Invoke-WebRequest @params
    } catch {
        $response = $_.Exception.Response
        if ($null -eq $response) { throw }
        $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
        $content = $reader.ReadToEnd()
        $statusCode = [int]$response.StatusCode
        if ($AllowedCodes -notcontains $statusCode) {
            throw "Unexpected HTTP $statusCode for $Path`: $content"
        }
        return $content | ConvertFrom-Json
    }

    $json = $response.Content | ConvertFrom-Json
    if ($AllowedCodes -notcontains $json.code) {
        throw "Unexpected API code $($json.code) for $Path`: $($response.Content)"
    }
    if ($Session -and $json.data -and $json.data.csrfToken) {
        $Session.Headers["X-CSRF-Token"] = [string]$json.data.csrfToken
    }
    return $json
}

function Login-As {
    param(
        [string]$Email,
        [string]$Password,
        [string]$Role
    )
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    Invoke-Json -Session $session -Method "POST" -Path "/api/auth/login" -Body @{
        email = $Email
        password = $Password
        role = $Role
    } | Out-Null
    return $session
}

Write-Host "Running TA recruitment smoke checks against $BaseUrl"

$admin = Login-As -Email "admin@bupt.edu.cn" -Password "123456" -Role "admin"
$adminNotifications = Invoke-Json -Session $admin -Path "/api/notifications"
$dashboard = Invoke-Json -Session $admin -Path "/api/admin/dashboard"
$recruitment = Invoke-Json -Session $admin -Path "/api/admin/recruitment"
if ($dashboard.data.totalJobs -lt 1) { throw "Admin dashboard returned no jobs" }
if ($null -eq $recruitment.data.jobs) { throw "Admin recruitment payload missing jobs" }
Write-Host "Admin: notifications=$($adminNotifications.data.unreadCount), jobs=$($dashboard.data.totalJobs)"

$mo = Login-As -Email "mo@bupt.edu.cn" -Password "123456" -Role "mo"
$moNotifications = Invoke-Json -Session $mo -Path "/api/notifications"
$moJobs = Invoke-Json -Session $mo -Path "/api/mo/jobs"
if ($null -eq $moJobs.data.items) { throw "MO jobs payload missing items" }
$moJobCount = @($moJobs.data.items).Count
Write-Host "MO: notifications=$($moNotifications.data.unreadCount), jobs=$moJobCount"

$student = Login-As -Email "student@bupt.edu.cn" -Password "123456" -Role "student"
$studentNotifications = Invoke-Json -Session $student -Path "/api/notifications"
$applications = Invoke-Json -Session $student -Path "/api/student/applications"
if ($null -eq $applications.data.items) { throw "Student applications payload missing items" }
Write-Host "Student: notifications=$($studentNotifications.data.unreadCount), applications=$($applications.data.total)"

$conflict = Invoke-Json -Session $student -Method "POST" -Path "/api/student/applications" -Body @{
    jobId = "JOB002"
    coverLetter = "Smoke test should be blocked by schedule conflict."
} -AllowedCodes @(409)
if ($conflict.message -notmatch "Schedule conflict|already") {
    throw "Expected duplicate or schedule conflict guard, got: $($conflict.message)"
}
Write-Host "Application guard: blocked unsafe application ($($conflict.message))"

Write-Host "Smoke checks passed."
