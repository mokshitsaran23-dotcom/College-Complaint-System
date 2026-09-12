# SCRUM02-F001-UI-001: Complaint Submission Form

## Overview
Provides a responsive, accessible React form allowing students and campus staff to submit complaints regarding campus infrastructure, facilities, IT, or dormitories. Validates required fields, checks image format (PNG/JPG), and generates a user confirmation with a tracking reference ID.

## Standalone Setup & Testing
```bash
npm test
```

## Assumptions Made
1. **Photo Upload Support**: Accepts JPG and PNG file types under 10MB; displays an immediate visual thumbnail preview.
2. **Preset Categories**: Pre-populated with standard campus departments: `Electrical`, `Plumbing`, `IT Support`, `Carpentry`, `Sanitation`.
3. **Location Selector**: Combines common campus building presets with a specific room/detail text input.
