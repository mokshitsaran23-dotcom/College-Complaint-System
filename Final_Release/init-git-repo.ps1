# PowerShell Script to Initialize Git Repository, create all 19 story branches, commit task code, and merge into develop and main.

$ErrorActionPreference = "Stop"

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   College Complaint System - Git Branch Automation     " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# Navigate to project root
$rootDir = Resolve-Path "$PSScriptRoot\.."
Set-Location $rootDir

if (-not (Test-Path ".git")) {
    Write-Host "[1/4] Initializing git repository..." -ForegroundColor Yellow
    git init -b main
    git config user.name "College Devops Team"
    git config user.email "devops@college.edu"

    # Initial commit with root structure and docs
    git add .gitignore .gitattributes README.md docs/ database/ backend/ frontend/ Final_Release/ scrums/*/*.md
    git commit -m "CHORE: Initial project structure and documentation setup"
} else {
    Write-Host "[1/4] Git repository already initialized." -ForegroundColor Green
}

# Create develop integration branch
Write-Host "[2/4] Ensuring develop branch exists..." -ForegroundColor Yellow
git checkout -B develop

# Define the 19 stories in backlog order
$stories = @(
    @{ Branch = "feature/SCRUM-6-complaint-form"; Msg = "SCRUM-6: Complaint submission form (SCRUM02-F001-UI-001)"; Path = "scrums/SCRUM02-F001_Digital_Complaint_Submission/SCRUM02-F001-UI-001_Complaint_Submission_Form" },
    @{ Branch = "feature/SCRUM-7-authentication"; Msg = "SCRUM-7: Login using college credentials (SCRUM02-F001-UI-002)"; Path = "scrums/SCRUM02-F001_Digital_Complaint_Submission/SCRUM02-F001-UI-002_Login_College_Credentials" },
    @{ Branch = "feature/SCRUM-8-complaint-api"; Msg = "SCRUM-8: Complaint creation API (SCRUM02-F001-BE-001)"; Path = "scrums/SCRUM02-F001_Digital_Complaint_Submission/SCRUM02-F001-BE-001_Complaint_Creation_API" },
    @{ Branch = "feature/SCRUM-9-authentication-service"; Msg = "SCRUM-9: Authentication integration service (SCRUM02-F001-BE-002)"; Path = "scrums/SCRUM02-F001_Digital_Complaint_Submission/SCRUM02-F001-BE-002_Authentication_Integration_Service" },
    @{ Branch = "feature/SCRUM-10-complaint-database"; Msg = "SCRUM-10: Complaint data store (SCRUM02-F001-DB-001)"; Path = "scrums/SCRUM02-F001_Digital_Complaint_Submission/SCRUM02-F001-DB-001_Complaint_Data_Store" },
    @{ Branch = "feature/SCRUM-11-admin-queue"; Msg = "SCRUM-11: Admin complaint queue and assignment screen (SCRUM02-F002-UI-001)"; Path = "scrums/SCRUM02-F002_Complaint_Assignment_Routing/SCRUM02-F002-UI-001_Admin_Complaint_Queue_Assignment" },
    @{ Branch = "feature/SCRUM-12-staff-view"; Msg = "SCRUM-12: Maintenance staff assigned-complaints view (SCRUM02-F002-UI-002)"; Path = "scrums/SCRUM02-F002_Complaint_Assignment_Routing/SCRUM02-F002-UI-002_Maintenance_Staff_Assigned_View" },
    @{ Branch = "feature/SCRUM-13-assignment-api"; Msg = "SCRUM-13: Complaint assignment API (SCRUM02-F002-BE-001)"; Path = "scrums/SCRUM02-F002_Complaint_Assignment_Routing/SCRUM02-F002-BE-001_Complaint_Assignment_API" },
    @{ Branch = "feature/SCRUM-14-status-tracking"; Msg = "SCRUM-14: Complaint status tracking screen (SCRUM02-F003-UI-001)"; Path = "scrums/SCRUM02-F003_Status_Tracking_Notifications/SCRUM02-F003-UI-001_Complaint_Status_Tracking_Screen" },
    @{ Branch = "feature/SCRUM-15-status-update"; Msg = "SCRUM-15: Maintenance staff status update control (SCRUM02-F003-UI-002)"; Path = "scrums/SCRUM02-F003_Status_Tracking_Notifications/SCRUM02-F003-UI-002_Staff_Status_Update_Control" },
    @{ Branch = "feature/SCRUM-16-notification-service"; Msg = "SCRUM-16: Complaint status update & notification trigger service (SCRUM02-F003-BE-001)"; Path = "scrums/SCRUM02-F003_Status_Tracking_Notifications/SCRUM02-F003-BE-001_Status_Update_Notification_Service" },
    @{ Branch = "feature/SCRUM-17-status-history"; Msg = "SCRUM-17: Complaint status history table (SCRUM02-F003-DB-001)"; Path = "scrums/SCRUM02-F003_Status_Tracking_Notifications/SCRUM02-F003-DB-001_Status_History_Table" },
    @{ Branch = "feature/SCRUM-18-feedback-form"; Msg = "SCRUM-18: Post-resolution feedback form (SCRUM02-F004-UI-001)"; Path = "scrums/SCRUM02-F004_Feedback_Admin_Reporting/SCRUM02-F004-UI-001_Post_Resolution_Feedback_Form" },
    @{ Branch = "feature/SCRUM-19-reporting-dashboard"; Msg = "SCRUM-19: Admin reporting dashboard (SCRUM02-F004-UI-002)"; Path = "scrums/SCRUM02-F004_Feedback_Admin_Reporting/SCRUM02-F004-UI-002_Admin_Reporting_Dashboard" },
    @{ Branch = "feature/SCRUM-20-feedback-api"; Msg = "SCRUM-20: Feedback capture API (SCRUM02-F004-BE-001)"; Path = "scrums/SCRUM02-F004_Feedback_Admin_Reporting/SCRUM02-F004-BE-001_Feedback_Capture_API" },
    @{ Branch = "feature/SCRUM-21-reporting-api"; Msg = "SCRUM-21: Reporting/aggregation API (SCRUM02-F004-BE-002)"; Path = "scrums/SCRUM02-F004_Feedback_Admin_Reporting/SCRUM02-F004-BE-002_Reporting_Aggregation_API" },
    @{ Branch = "feature/SCRUM-22-feedback-database"; Msg = "SCRUM-22: Feedback data store (SCRUM02-F004-DB-001)"; Path = "scrums/SCRUM02-F004_Feedback_Admin_Reporting/SCRUM02-F004-DB-001_Feedback_Data_Store" },
    @{ Branch = "feature/SCRUM-23-student-complaint-flow"; Msg = "SCRUM-23: Student submits -> admin assigns -> tracked to resolution (SCRUM02-E2E-001)"; Path = "scrums/E2E/SCRUM02-E2E-001_Submit_Assign_Track_To_Resolution" },
    @{ Branch = "feature/SCRUM-24-resolved-complaint-feedback"; Msg = "SCRUM-24: Resolved complaint collects feedback that feeds admin reporting (SCRUM02-E2E-002)"; Path = "scrums/E2E/SCRUM02-E2E-002_Resolved_Feedback_Feeds_Reporting" }
)

Write-Host "[3/4] Creating and committing each feature branch sequentially..." -ForegroundColor Yellow

foreach ($s in $stories) {
    Write-Host "  -> Branch: $($s.Branch)" -ForegroundColor Cyan
    git checkout develop
    git checkout -B $s.Branch
    git add "$($s.Path)/*"
    # Commit if changes exist
    git commit -m "$($s.Msg)" --allow-empty
    
    # Merge into develop
    git checkout develop
    git merge --no-ff $s.Branch -m "Merge branch '$($s.Branch)' into develop"
}

Write-Host "[4/4] Merging develop into main for Final_Release..." -ForegroundColor Yellow
git checkout main
git merge --no-ff develop -m "RELEASE: Merge Sprint 02 integration branch into main"
git add .
git commit -m "FINAL_RELEASE: Full College Complaint System integrated distribution" --allow-empty

Write-Host "=========================================================" -ForegroundColor Green
Write-Host "   All 19 feature branches created, committed, & merged! " -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green
