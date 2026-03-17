# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OMIAGS Platform — an educational LMS (Learning Management System) for math olympiad preparation, targeting "Secundaria" and "Preparatoria" students in Mexico. The UI is in Spanish.

## Architecture

Monorepo with three main parts:

- **frontend/** — SvelteKit 2 (Svelte 5) SPA using `adapter-static`. Builds to static files with SPA fallback. Vite proxies `/api` to the backend during development.
- **backend/** — Express.js REST API (ES modules) with MongoDB/Mongoose. JWT auth via httpOnly cookies. Serves uploaded files from `backend/uploads/`.
- **middleware/** — Shared Express middleware (currently `requireAuth` JWT guard).

The frontend is a client-rendered SPA (no SSR). All data fetching happens client-side via `fetch('/api/...')`.

## Development Commands

### Frontend (from `frontend/`)
```bash
npm run dev          # Vite dev server on :5173, proxies /api → :5000
npm run build        # Static build → frontend/build/
npm run check        # svelte-check TypeScript validation
```

### Backend (from `backend/`)
```bash
npm run dev          # nodemon server.js (auto-restart on changes)
npm run start        # node server.js
```

Requires a `.env` file with `MONGO_URI` and `JWT_SECRET` (and optionally `PORT`, defaults to 5000).

## Data Model

Mongoose models in `backend/models/`:

- **User** — name, email, password (bcrypt hashed via pre-save hook), role: `student | admin | teacher`
- **Course** — title, description, owner (User ref), category (`Secundaria | Preparatoria`), progress (auto-calculated average of enrolled students)
- **Lesson** — belongs to Course, embeds array of Content sub-documents
- **Content** — sub-schema (not a standalone collection): type is `video | pdf | text | quiz`, with conditional required fields (url for video/pdf, textContent for text, quizId for quiz)
- **Quiz** — belongs to Lesson, embeds Question sub-documents. Question types: `multiple-choice`, `true-false`, `fill-in-the-blank`, `multiple-answer`, `complete-the-code`. maxScore auto-calculated via pre-save hook.
- **QuizAttempt** — tracks a user's quiz submission. Answers array, auto-calculates currentScore and marks completed on save.
- **Enrollment** — links student to course, tracks completedLessons. Pre-save hook recalculates studentProgress %; post-save hook updates the Course's average progress.

## API Routes

All mounted under `/api` in `backend/server.js`:

| Prefix | Router file |
|---|---|
| `/api/auth` | `routes/auth/auth.js` — login, register, logout, /me, change-password |
| `/api/courses` | `routes/courses/courses.js` |
| `/api/lessons` | `routes/lessons/lessons.js` |
| `/api/quizzes` | `routes/quizzes/quizzes.js` |
| `/api/user` | `routes/user/user.js` |
| `/api/enrollments` | `routes/enrollments/enrollments.js` |
| `/api/upload` | `routes/upload/upload.js` — PDF upload via multer |

## Frontend Routing

Two role-based navigation flows defined in `src/lib/navFactory.js`:

- **Student**: `/cursos`, `/progreso`, `/perfil`
- **Admin**: `/adminCursos`, `/adminEstudiantes`, `/adminMetricas`, `/adminPerfil`

Other routes: `/login`, `/register`, `/content/[id]`, `/quiz/[id]`, `/quizzes`, `/editor/quizzes/[id]`, `/cursos/[id]`

## Auth Flow

- Login/register sets an httpOnly `token` cookie (JWT, 7-day expiry).
- Frontend calls `GET /api/auth/me` to check auth state and get user role.
- Protected backend routes use `requireAuth` middleware from `middleware/auth.js`.

## Utils

`utils/` contains Python scripts for seeding test data and interacting with the API (creating users, courses, quizzes, simulating progress). These are standalone dev/test helpers, not part of the application runtime.

## Key Conventions

- Backend uses ES modules (`"type": "module"` in package.json) — use `import`/`export`, not `require`.
- Production domain: `omiags.online`
- Code formatter: Prettier (configured via DeepSource).
