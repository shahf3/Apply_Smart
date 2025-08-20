# ApplySmart

A modern web application that helps job seekers organise applications, improve resumes, practise interviews, and act on job market insights in one focused workspace.

**Live app:** https://apply-smart-cyan.vercel.app/

---

## Overview
ApplySmart brings profile management, resume scoring, cover letters, mock interviews, job search, and market insights together. The frontend is built with React, Tailwind CSS, Framer Motion, and Lucide React icons. The backend is built with Node.js and Express, with PostgreSQL on Neon. Authentication supports local accounts and Google OAuth. The application integrates third party job boards and uses Google Gemini for coaching and ATS style feedback.

---

## Key features
* Quick Actions panel to guide the next step
* Profile management for personal information
* Resume upload, storage, and editing
* ATS resume scoring against a job description
* Job search and filtering across multiple sources
* Cover letter generation tailored to a role
* Mock interview practice with structured feedback
* Job market insights and coaching with AI
* Dashboard with recent activity and simple analytics

---

## Tech stack
* **Frontend:** React, Tailwind CSS, Framer Motion, Lucide React
* **Backend:** Node.js, Express, Helmet, Compression, CORS
* **Database:** PostgreSQL on Neon
* **Auth:** Local username and password, Google OAuth
* **AI:** Google Gemini for resume scoring, cover letters, interviews, and coaching
* **Job data and news:** Adzuna, Jooble, Y Combinator Jobs, Newsdata.io, and other providers as configured
* **Deployment:** Vercel for frontend, AWS Elastic Beanstalk for backend

---

## Architecture at a glance
* Browser → React app → API requests to Express server
* Express server → PostgreSQL on Neon for persistence
* Express server → External providers for jobs, news, and AI services

---

## Getting started

### Prerequisites
* Node.js LTS and npm
* PostgreSQL database. Neon is recommended
* Accounts and keys for Google OAuth and Google Gemini
* Provider keys for job and news sources if used

