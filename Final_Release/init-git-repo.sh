#!/usr/bin/env bash
# Bash Script to Initialize Git Repository, create all 19 story branches, commit task code, and merge into develop and main.

set -e

echo "========================================================="
echo "   College Complaint System - Git Branch Automation     "
echo "========================================================="

# Navigate to project root
cd "$(dirname "$0")/.."

if [ ! -d ".git" ]; then
    echo "[1/4] Initializing git repository..."
    git init -b main
    git config user.name "College Devops Team"
    git config user.email "devops@college.edu"

    # Initial commit with root structure and docs
    git add .gitignore .gitattributes README.md docs/ database/ backend/ frontend/ Final_Release/ scrums/*/*.md
    git commit -m "CHORE: Initial project structure and documentation setup"
else
    echo "[1/4] Git repository already initialized."
fi

# Create develop integration branch
echo "[2/4] Ensuring develop branch exists..."
git checkout -B develop

# Define the 19 stories in backlog order
declare -a branches=(
    "feature/SCRUM-6-complaint-form"
    "feature/SCRUM-7-authentication"
    "feature/SCRUM-8-complaint-api"
    "feature/SCRUM-9-authentication-service"
    "feature/SCRUM-10-complaint-database"
    "feature/SCRUM-11-admin-queue"
    "feature/SCRUM-12-staff-view"
    "feature/SCRUM-13-assignment-api"
    "feature/SCRUM-14-status-tracking"
    "feature/SCRUM-15-status-update"
    "feature/SCRUM-16-notification-service"
    "feature/SCRUM-17-status-history"
    "feature/SCRUM-18-feedback-form"
    "feature/SCRUM-19-reporting-dashboard"
    "feature/SCRUM-20-feedback-api"
    "feature/SCRUM-21-reporting-api"
    "feature/SCRUM-22-feedback-database"
    "feature/SCRUM-23-student-complaint-flow"
    "feature/SCRUM-24-resolved-complaint-feedback"
)

declare -a messages=(
    "SCRUM-6: Complaint submission form (SCRUM02-F001-UI-001)"
    "SCRUM-7: Login using college credentials (SCRUM02-F001-UI-002)"
    "SCRUM-8: Complaint creation API (SCRUM02-F001-BE-001)"
    "SCRUM-9: Authentication integration service (SCRUM02-F001-BE-002)"
    "SCRUM-10: Complaint data store (SCRUM02-F001-DB-001)"
    "SCRUM-11: Admin complaint queue and assignment screen (SCRUM02-F002-UI-001)"
    "SCRUM-12: Maintenance staff assigned-complaints view (SCRUM02-F002-UI-002)"
    "SCRUM-13: Complaint assignment API (SCRUM02-F002-BE-001)"
    "SCRUM-14: Complaint status tracking screen (SCRUM02-F003-UI-001)"
    "SCRUM-15: Maintenance staff status update control (SCRUM02-F003-UI-002)"
    "SCRUM-16: Complaint status update & notification trigger service (SCRUM02-F003-BE-001)"
    "SCRUM-17: Complaint status history table (SCRUM02-F003-DB-001)"
    "SCRUM-18: Post-resolution feedback form (SCRUM02-F004-UI-001)"
    "SCRUM-19: Admin reporting dashboard (SCRUM02-F004-UI-002)"
    "SCRUM-20: Feedback capture API (SCRUM02-F004-BE-001)"
    "SCRUM-21: Reporting/aggregation API (SCRUM02-F004-BE-002)"
    "SCRUM-22: Feedback data store (SCRUM02-F004-DB-001)"
    "SCRUM-23: Student submits -> admin assigns -> tracked to resolution (SCRUM02-E2E-001)"
    "SCRUM-24: Resolved complaint collects feedback that feeds admin reporting (SCRUM02-E2E-002)"
)

declare -a paths=(
    "scrums/SCRUM02-F001_Digital_Complaint_Submission/SCRUM02-F001-UI-001_Complaint_Submission_Form"
    "scrums/SCRUM02-F001_Digital_Complaint_Submission/SCRUM02-F001-UI-002_Login_College_Credentials"
    "scrums/SCRUM02-F001_Digital_Complaint_Submission/SCRUM02-F001-BE-001_Complaint_Creation_API"
    "scrums/SCRUM02-F001_Digital_Complaint_Submission/SCRUM02-F001-BE-002_Authentication_Integration_Service"
    "scrums/SCRUM02-F001_Digital_Complaint_Submission/SCRUM02-F001-DB-001_Complaint_Data_Store"
    "scrums/SCRUM02-F002_Complaint_Assignment_Routing/SCRUM02-F002-UI-001_Admin_Complaint_Queue_Assignment"
    "scrums/SCRUM02-F002_Complaint_Assignment_Routing/SCRUM02-F002-UI-002_Maintenance_Staff_Assigned_View"
    "scrums/SCRUM02-F002_Complaint_Assignment_Routing/SCRUM02-F002-BE-001_Complaint_Assignment_API"
    "scrums/SCRUM02-F003_Status_Tracking_Notifications/SCRUM02-F003-UI-001_Complaint_Status_Tracking_Screen"
    "scrums/SCRUM02-F003_Status_Tracking_Notifications/SCRUM02-F003-UI-002_Staff_Status_Update_Control"
    "scrums/SCRUM02-F003_Status_Tracking_Notifications/SCRUM02-F003-BE-001_Status_Update_Notification_Service"
    "scrums/SCRUM02-F003_Status_Tracking_Notifications/SCRUM02-F003-DB-001_Status_History_Table"
    "scrums/SCRUM02-F004_Feedback_Admin_Reporting/SCRUM02-F004-UI-001_Post_Resolution_Feedback_Form"
    "scrums/SCRUM02-F004_Feedback_Admin_Reporting/SCRUM02-F004-UI-002_Admin_Reporting_Dashboard"
    "scrums/SCRUM02-F004_Feedback_Admin_Reporting/SCRUM02-F004-BE-001_Feedback_Capture_API"
    "scrums/SCRUM02-F004_Feedback_Admin_Reporting/SCRUM02-F004-BE-002_Reporting_Aggregation_API"
    "scrums/SCRUM02-F004_Feedback_Admin_Reporting/SCRUM02-F004-DB-001_Feedback_Data_Store"
    "scrums/E2E/SCRUM02-E2E-001_Submit_Assign_Track_To_Resolution"
    "scrums/E2E/SCRUM02-E2E-002_Resolved_Feedback_Feeds_Reporting"
)

echo "[3/4] Creating and committing each feature branch sequentially..."

for i in "${!branches[@]}"; do
    branch="${branches[$i]}"
    msg="${messages[$i]}"
    p="${paths[$i]}"

    echo "  -> Branch: $branch"
    git checkout develop
    git checkout -B "$branch"
    git add "$p"/*
    git commit -m "$msg" --allow-empty

    # Merge into develop
    git checkout develop
    git merge --no-ff "$branch" -m "Merge branch '$branch' into develop"
done

echo "[4/4] Merging develop into main for Final_Release..."
git checkout main
git merge --no-ff develop -m "RELEASE: Merge Sprint 02 integration branch into main"
git add .
git commit -m "FINAL_RELEASE: Full College Complaint System integrated distribution" --allow-empty

echo "========================================================="
echo "   All 19 feature branches created, committed, & merged! "
echo "========================================================="
