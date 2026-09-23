# Debre Markos University – Department of Geology Portal

## Version 1

This is a frontend prototype for the Department of Geology academic portal.

### Included
- University/department academic interface
- Responsive homepage
- About, academics, students, staff, research, activities, resources, and news pages
- 100 sample geology courses
- Course Active/Inactive toggle in Admin Dashboard
- Year 1–4 student organization
- Student portal showing active courses for the student's academic year
- Demo course materials modal
- Demo role login

### Important
This version is a **frontend prototype**. Course activation changes are held in browser memory and reset when the page is refreshed.

For production, connect:
- React/Next.js frontend
- Node.js/Express or Next.js API
- PostgreSQL database
- Secure authentication
- Institutional file storage
- University SSO if available

### Run

1. Install Node.js (LTS recommended).
2. Open this folder in VS Code.
3. Open Terminal.
4. Run:

```bash
npm install
npm run dev
```

5. Open the local address shown by Vite, usually `http://localhost:5173`.

### Demo Login
Click **Portal Login**:
- Student Portal: Year 1 demo student
- Administrator: course management dashboard

### Course visibility rule
A student sees a course when:
- course.active is true
- course.year equals student.year

For the production database, also enforce:
- program
- semester
- enrollment
- role permissions

### Production next step
Implement PostgreSQL tables for users, students, staff, courses, course_materials, publications, research_projects, news and events, then replace the in-memory arrays in `src/main.jsx` with API calls.