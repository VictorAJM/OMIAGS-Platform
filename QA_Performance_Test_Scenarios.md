# OMIAGS Platform — Performance Test Scenarios (VuGen / LoadRunner)

## Scenario 1: Admin Course & Quiz Setup → Student Quiz Completion

**Business justification:** This end-to-end scenario validates the complete lifecycle — admin content creation followed by student consumption. It exercises both write-heavy admin operations (course, quiz, and lesson creation with embedded quiz content) and the most write-intensive student flow (sequential answer submissions triggering QuizAttempt creation, validation, and score recalculation). This combined flow reveals contention between admin writes and student writes on shared collections (Course, Lesson, Quiz, QuizAttempt).

**Transaction breakdown (VuGen) — 7 transactions:**

### T01_LOGIN_ADMIN

Admin opens the site, navigates to login, authenticates, and validates session.

| Step | Method | Endpoint / URL | Details |
|---|---|---|---|
| 1 | GET | `https://www.omiags.online/` | Load homepage |
| 2 | GET | `https://www.omiags.online/favicon.ico` | Resource load |
| 3 | GET | `https://www.omiags.online/login` | Navigate to login page |
| 4 | OPTIONS | `/api/auth/login` | CORS preflight |
| 5 | POST | `/api/auth/login` | Body: `{"email":"{adminEmail}","password":"{adminPassword}"}` — extract `token` cookie |
| 6 | GET | `/api/auth/me` | Validate `role == "admin"` |

### T02_CREAR_CURSO

Admin navigates to course management and creates a new course with the student in the access list.

| Step | Method | Endpoint / URL | Details |
|---|---|---|---|
| 1 | GET | `https://www.omiags.online/adminCursos` | Navigate to admin courses page |
| 2 | GET | `/api/courses` | Load existing courses |
| 3 | OPTIONS | `/api/courses` | CORS preflight |
| 4 | POST | `/api/courses` | Body: `{"title":"cursoQuiz","description":"cursoQuizDescripcion","category":"Secundaria","accessList":["{studentEmail}"]}` — **correlate `courseId`** (`web_reg_save_param` on `id":"`) |
| 5 | OPTIONS | `/api/enrollments/all` | CORS preflight |
| 6 | GET | `/api/enrollments/all` | Refresh enrollments view |

Think time: 1 second.

### T03_CREAR_QUIZ

Admin creates an empty quiz, updates it with 2 questions (multiple-choice + true-false), creates a lesson with the quiz attached, and links the quiz back to the lesson.

| Step | Method | Endpoint / URL | Details |
|---|---|---|---|
| 1 | GET | `/api/lessons/{courseId}/lessons` | Load lessons for the new course |
| 2 | OPTIONS | `/api/quizzes` | CORS preflight |
| 3 | POST | `/api/quizzes` | Body: `{"title":"QuizTitulo","description":"quizDescripcion","questions":[]}` — **correlate `quizId`** (`web_reg_save_param` on `_id":"`) |
| 4 | GET | `https://www.omiags.online/editor/quizzes/{quizId}` | Navigate to quiz editor page |
| 5 | GET | `/api/quizzes/{quizId}` | Load quiz details in editor |
| 6 | GET | `/api/quizzes/attempts?quizId={quizId}` | Load existing attempts |
| 7 | OPTIONS | `/api/quizzes/{quizId}` | CORS preflight |
| 8 | PUT | `/api/quizzes/{quizId}` | Update quiz with questions. Body: `{"id":"{quizId}","title":"QuizTitulo","description":"quizDescripcion","questions":[{"title":"pregunta1","type":"multiple-choice","options":["si","no"],"correctAnswer":"si","value":1},{"title":"pregunta 2","type":"true-false","correctAnswer":"True","value":1}],"deleteAttempts":false}` |
| 9 | OPTIONS | `/api/lessons` | CORS preflight |
| 10 | POST | `/api/lessons` | Body: `{"courseId":"{courseId}","title":"leccionQuiz","description":"","contents":[{"title":"QuizTitulo","type":"quiz","quizId":"{quizId}"}]}` — **correlate `lessonId`** (`web_reg_save_param` on `_id":"`) |
| 11 | OPTIONS | `/api/quizzes/{quizId}` | CORS preflight |
| 12 | PATCH | `/api/quizzes/{quizId}` | Link quiz to lesson. Body: `{"lessonId":"{lessonId}"}` |
| 13 | GET | `/api/courses` | Refresh courses list |
| 14 | GET | `/api/lessons/{courseId}/lessons` | Refresh lessons list |

### T04_LOGOUT_ADMIN

Admin logs out, clearing the session cookie.

| Step | Method | Endpoint / URL | Details |
|---|---|---|---|
| 1 | POST | `/api/auth/logout` | Clears `token` cookie |

### T05_LOGIN_STUDENT

Student authenticates and validates session.

| Step | Method | Endpoint / URL | Details |
|---|---|---|---|
| 1 | OPTIONS | `/api/auth/login` | CORS preflight |
| 2 | POST | `/api/auth/login` | Body: `{"email":"{studentEmail}","password":"{adminPassword}"}` — extract `token` cookie |
| 3 | GET | `/api/auth/me` | Validate `role == "student"` |

Note: The script uses `{adminPassword}` for the student login — both accounts share the same password parameter.

### T06_NAVEGAR_CURSO

Student navigates to their courses and opens the course created by the admin.

| Step | Method | Endpoint / URL | Details |
|---|---|---|---|
| 1 | GET | `https://www.omiags.online/cursos` | Navigate to student courses page |
| 2 | GET | `/api/courses` | Load enrolled courses |
| 3 | GET | `/api/enrollments/status/{courseId}` | Check enrollment status for the course |
| 4 | GET | `/api/courses/{courseId}` | Load course detail |

### T07_CONTESTAR_QUIZ

Student loads the quiz, submits answers for both questions, and checks the final score.

| Step | Method | Endpoint / URL | Details |
|---|---|---|---|
| 1 | GET | `/api/quizzes/{quizId}` | Load quiz with questions |
| 2 | OPTIONS | `/api/quizzes/submit-answer` | CORS preflight |
| 3 | POST | `/api/quizzes/submit-answer` | Q1 (multiple-choice). Body: `{"quizId":"{quizId}","questionIndex":0,"answer":"si"}` |
| 4 | POST | `/api/quizzes/submit-answer` | Q2 (true-false). Body: `{"quizId":"{quizId}","questionIndex":1,"answer":"True"}` |
| 5 | GET | `/api/quizzes/quiz-score?quizId={quizId}` | Check final score |

---

**Correlations summary:**

| Parameter | Extracted at | Left boundary | Right boundary |
|---|---|---|---|
| `courseId` | T02 step 4 (POST `/api/courses`) | `id":"` | `"` |
| `quizId` | T03 step 3 (POST `/api/quizzes`) | `_id":"` | `"` |
| `lessonId` | T03 step 10 (POST `/api/lessons`) | `_id":"` | `"` |

**Validations:**
- T01: Login response contains `"message":"Login exitoso"`; `/me` returns `role == "admin"`
- T02: POST `/api/courses` returns HTTP 201 with course `id`
- T03: POST `/api/quizzes` returns HTTP 201 with `_id`; PUT updates quiz with `maxScore == 2`; POST `/api/lessons` returns HTTP 201
- T04: Logout response contains `"message":"Logout exitoso"`
- T05: Login response contains `"message":"Login exitoso"`; `/me` returns `role == "student"`
- T06: GET `/api/courses` returns non-empty array containing the created course
- T07: Each `submit-answer` returns HTTP 200 with `"correct"` (boolean) and `"answer"`; if HTTP 400 with `"Question not allowed"`, flag as failure. `quiz-score` returns HTTP 200 with `"status"` field.

**Test data required:**

| Parameter | Source | Details |
|---|---|---|
| `adminEmail` | CSV parameter file | Pool of 5-10 admin accounts |
| `adminPassword` | CSV parameter file | Shared password — used for both admin and student login |
| `studentEmail` | CSV parameter file | Pool of student accounts (unique per VUser — each user can only attempt a quiz once) |

**Pre-conditions:**
- Admin and student accounts must be pre-created. Both use the same password (`{adminPassword}`).
- Student emails are added to the course `accessList` during T02, which auto-creates the enrollment — no separate enrollment step needed.
- **Critical**: each VUser needs a unique student user because `submit-answer` enforces sequential `questionIndex` per user-quiz pair. Either use a fresh user pool per iteration or ensure QuizAttempt records are cleaned before each run.
- All 7 transactions must run sequentially within the same iteration — Part B (T05–T07) depends on the course, quiz, and lesson created in Part A (T01–T04).

---

## Scenario 2: Admin Dashboard & Student Metrics

**Business justification:** The `/api/enrollments/my-students` endpoint is the heaviest query in the system — it aggregates across 5 collections (Course, Enrollment, Lesson, Quiz, QuizAttempt) with multiple finds and in-memory joins. Even a small number of concurrent admin users could bottleneck the DB. This scenario validates backend scalability under admin workload.

**Transaction breakdown (VuGen):**

| # | Transaction Name | Method | Endpoint | Correlation needed |
|---|---|---|---|---|
| 1 | `T01_Login` | POST | `/api/auth/login` | Extract `token` cookie |
| 2 | `T02_GetMe` | GET | `/api/auth/me` | Validate `role == "admin"` |
| 3 | `T03_GetAdminCourses` | GET | `/api/courses` | Extract course `id` list |
| 4 | `T04_GetMyStudents` | GET | `/api/enrollments/my-students` | — (heaviest endpoint) |
| 5 | `T05_GetAllEnrollments` | GET | `/api/enrollments/all` | — |
| 6 | `T06_GetCourseDetail` | GET | `/api/courses/{courseId}` | Correlate from T03; response includes `students` email array |
| 7 | `T07_CreateCourse` | POST | `/api/courses` | Body: `{"title", "description", "category", "accessList"}` |

**Validations:**
- T02: `role` field equals `"admin"`
- T04: HTTP 200 + response is JSON array; each object has `name`, `email`, `lessonProgress`, `quizAverage`
- T05: HTTP 200 + response is JSON array
- T07: HTTP 201 + response contains new course `id`

**Test data required:**

| Parameter | Source | Details |
|---|---|---|
| `email` | CSV parameter file | Pool of 5-10 admin accounts (admins are fewer but hit heavy endpoints) |
| `password` | CSV parameter file | Corresponding passwords |
| `courseTitle` | CSV or random | Parameterized unique title for course creation (e.g., `"LoadTest_Course_{iteration}"`) |
| `category` | Fixed | Either `"Secundaria"` or `"Preparatoria"` |
| `accessList` | CSV | Array of existing student emails to enroll in the new course |

Pre-conditions: Admin users must own courses that have enrolled students with quiz attempts to make T04 produce meaningful load.

---

## Scenario 3: PDF Upload & Reading

**Business justification:** PDFs are the largest payloads in the system — the upload endpoint accepts files up to 500 MB, and every student in a course will download the same file. This creates a dual stress: write-heavy disk I/O + memory pressure during upload (multer buffers to disk), and read-heavy bandwidth + static-file serving under concurrent downloads. A single popular lesson PDF can saturate the server's network or disk throughput, making this the most data-intensive flow to validate.

**Transaction breakdown (VuGen):**

**Part A — Admin uploads a PDF and attaches it to a lesson**

| # | Transaction Name | Method | Endpoint | Correlation needed |
|---|---|---|---|---|
| 1 | `T01_Login_Admin` | POST | `/api/auth/login` | Extract `token` cookie |
| 2 | `T02_GetMe` | GET | `/api/auth/me` | Validate `role == "admin"` |
| 3 | `T03_UploadPDF` | POST | `/api/upload` | Multipart form-data, field name `file`; extract `url` from response |
| 4 | `T04_GetAdminCourses` | GET | `/api/courses` | Extract first `courseId` |
| 5 | `T05_GetCourseLessons` | GET | `/api/courses/{courseId}/lessons` | Extract first `lessonId` |
| 6 | `T06_UpdateLesson` | PUT | `/api/lessons/{lessonId}` | Correlate `lessonId` from T05; body adds a new pdf content item using `url` from T03 |

**Part B — Student reads the PDF content**

| # | Transaction Name | Method | Endpoint | Correlation needed |
|---|---|---|---|---|
| 1 | `T01_Login_Student` | POST | `/api/auth/login` | Extract `token` cookie |
| 2 | `T02_GetMe` | GET | `/api/auth/me` | Extract `id` |
| 3 | `T03_GetMyCourses` | GET | `/api/courses` | Extract first `courseId` |
| 4 | `T04_GetCourseLessons` | GET | `/api/courses/{courseId}/lessons` | Extract `contentId` from a content item where `type == "pdf"` |
| 5 | `T05_GetContentDetail` | GET | `/api/lessons/content/{contentId}` | Correlate `contentId` from T04; extract `url` from response |
| 6 | `T06_DownloadPDF` | GET | `/uploads/{filename}` | Correlate full URL from T05; this is a static file download — measure response time and bytes received |

**Validations:**
- T03 (upload): HTTP 200 + response contains `"url"` field ending in `.pdf`
- T06 (update lesson): HTTP 200 + response contains `"message":"Lesson updated"`
- T05 (content detail): HTTP 200 + `"type"` equals `"pdf"` and `"url"` is present
- T06 (download): HTTP 200 + `Content-Type` is `application/pdf` + `Content-Length` > 0

**Test data required:**

| Parameter | Source | Details |
|---|---|---|
| `admin_email` | CSV parameter file | Pool of 3-5 admin accounts (upload is admin-only) |
| `admin_password` | CSV parameter file | Corresponding passwords |
| `student_email` | CSV parameter file | Pool of 50+ student accounts enrolled in courses with PDF content |
| `student_password` | CSV parameter file | Corresponding passwords |
| `pdf_file` | Local test files | 3 tiers of pre-generated PDF files: **small** (~500 KB, typical handout), **medium** (~5 MB, problem set with diagrams), **large** (~50 MB, full textbook chapter). Parameterize the file path in VuGen to cycle through sizes. |

**Pre-conditions:**
- Admin users must own at least one course with at least one lesson.
- For Part B, courses must already contain at least one lesson with a `pdf`-type content item (either pre-seeded or created by Part A).
- The `backend/uploads/` directory must be writable and have sufficient disk space for concurrent uploads.
- If running Part A at scale, monitor disk space — 50 concurrent uploads of 50 MB files = ~2.5 GB written in a single ramp.

**Key metrics to watch:**
- **T03_UploadPDF**: Response time will be dominated by file size and disk I/O — set a higher timeout (e.g., 120s for large files) and track throughput (MB/s) rather than just response time.
- **T06_DownloadPDF**: Measure bytes/second per VUser. Under concurrency, watch for TCP connection queuing and static-file serving bottlenecks.
- **Server-side**: Monitor disk I/O utilization, memory usage (multer disk storage should not spike RAM, but verify), and network bandwidth saturation.

---

## Summary for Controller Execution

| Scenario | VUser % | Think Time | Pacing | Unique data? |
|---|---|---|---|---|
| 1 - Admin Setup + Student Quiz | ~50% | 3-5s (admin steps), 5-10s (student reading question) | Sequential | **Yes** — unique student per VUser (quiz attempt is one-time); admin can be shared. Clean QuizAttempt records between runs. |
| 2 - Admin Dashboard | ~20% | 3-5s | Random | No — reads are idempotent; only T07 creates data |
| 3A - PDF Upload (Admin) | ~10% | 5-10s (simulates selecting file) | Sequential | **Yes** — each upload creates a new file on disk; use unique filenames per iteration to avoid collisions |
| 3B - PDF Download (Student) | ~20% | 15-30s (simulates reading PDF) | Random | No — downloads are idempotent; multiple students can fetch the same PDF concurrently |

The main correlations across all scenarios will be the `token` cookie (set by login, sent automatically on subsequent requests) and the dynamic MongoDB `_id` values extracted from JSON responses for courseId, lessonId, contentId, and quizId.
