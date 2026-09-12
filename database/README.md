# Database Module — College Complaint System

## Technology Stack
- **Database**: MongoDB 7.0
- **ODM**: Mongoose 8.x

## Collections & Schemas
- **`users`**: Institutional identity records, cached profiles, and role mappings (`student`, `staff`, `admin`).
- **`complaints`**: Core complaint records with unique tracking references (`CMP-YYYYMM-XXXX`), photographic references, categories, and department routing.
- **`statushistory`**: Immutable, append-only chronological log of all lifecycle transitions.
- **`feedbacks`**: Post-resolution satisfaction reviews with 1-5 star ratings and comments.

## Running Seed Script
\`\`\`bash
npm install
npm run seed
\`\`\`
Populates demo users (student, admin, technicians across Electrical, Plumbing, IT), sample complaints in each status, full history logs, and rating reviews.
