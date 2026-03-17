# OMIAGS Platform — Performance Test Scenarios (VuGen / LoadRunner)

## Scenario 1: Student Course Navigation & Content Consumption

**Business justification:** This is the highest-frequency flow — every student session starts here. It's read-heavy with aggregation queries (lesson counts, enrollment lookups) that hit MongoDB hardest under concurrency.

**Transaction breakdown (VuGen):**

| # | Transaction Name | Method | Endpoint | Correlation needed |
|---|---|---|---|---|
| 1 | `T01_Login` | POST | `/api/auth/login` | Extract `token` cookie |
| 2 | `T02_GetMe` | GET | `/api/auth/me` | Extract `role`, `id` |
| 3 | `T03_GetMyCourses` | GET | `/api/courses` | Extract `id` from first course in response array |
| 4 | `T04_GetCourseDetail` | GET | `/api/courses/{courseId}` | Correlate `courseId` from T03 |
| 5 | `T05_GetCourseLessons` | GET | `/api/courses/{courseId}/lessons` | Extract `_id` and `contents[0]._id` from first lesson |
| 6 | `T06_GetContent` | GET | `/api/lessons/content/{contentId}` | Correlate `contentId` from T05 |
| 7 | `T07_MarkLessonComplete` | PUT | `/api/lessons/{lessonId}/toggle-completion` | Correlate `lessonId` from T05; body: `{"completed": true}` |

**Validations:**
- T01: HTTP 200 + response contains `"message":"Login exitoso"`
- T03: HTTP 200 + response is a non-empty JSON array
- T05: HTTP 200 + each lesson has `_id` and `title`
- T07: HTTP 200 + `"message":"Marked complete"`

**Test data required:**

| Parameter | Source | Details |
|---|---|---|
| `email` | CSV parameter file | Pool of 50+ pre-created student accounts |
| `password` | CSV parameter file | Corresponding passwords |

Pre-conditions: Each student user must be enrolled in at least one course that has at least one lesson with content. All dynamic IDs (`courseId`, `lessonId`, `contentId`) come from correlations — not from the data file.

---

## Scenario 2: Student Quiz Taking

**Business justification:** The most write-intensive student flow. Each answer submission triggers a QuizAttempt find-or-create, answer validation logic, score recalculation, and a save. This is where DB write contention will surface under load.

**Transaction breakdown (VuGen):**

| # | Transaction Name | Method | Endpoint | Correlation needed |
|---|---|---|---|---|
| 1 | `T01_Login` | POST | `/api/auth/login` | Extract `token` cookie |
| 2 | `T02_GetMe` | GET | `/api/auth/me` | — |
| 3 | `T03_GetMyCourses` | GET | `/api/courses` | Extract first `courseId` |
| 4 | `T04_GetCourseLessons` | GET | `/api/courses/{courseId}/lessons` | Extract `quizId` from a content item where `type == "quiz"` |
| 5 | `T05_LoadQuiz` | GET | `/api/quizzes/{quizId}` | Extract `questions` array length, each question's `type` and `options` |
| 6 | `T06_SubmitAnswer_Q1..Qn` | POST (loop) | `/api/quizzes/submit-answer` | Increment `questionIndex` from 0 to n-1; body: `{"quizId", "questionIndex", "answer"}` |
| 7 | `T07_CheckScore` | GET | `/api/quizzes/quiz-score?quizId={quizId}` | — |

**Validations:**
- T05: HTTP 200 + response contains `"questions"` array with length > 0
- T06 (each iteration): HTTP 200 + response contains `"correct"` (boolean) and `"answer"`
- T06 (check for error): If HTTP 400 with `"Question not allowed"`, the sequence is broken — flag as failure
- T07: HTTP 200 + `"status"` is `"Started"` (note: there's a bug in the source where completed/started labels are swapped, but validate what the API actually returns)

**Test data required:**

| Parameter | Source | Details |
|---|---|---|
| `email` | CSV parameter file | Pool of student accounts (different pool or unique rows per VUser — each user can only attempt a quiz once) |
| `password` | CSV parameter file | Corresponding passwords |
| `answer` values | Parameterized in script | For `multiple-choice`: pick `options[0]`; for `true-false`: `true`/`false`; for `fill-in-the-blank`: any string. Correctness doesn't matter for load testing — what matters is the write path. |

Pre-conditions: Students must be enrolled in a course that has a lesson with quiz-type content. **Critical**: each VUser needs a unique user because `submit-answer` enforces sequential `questionIndex` per user-quiz pair. Either use a fresh user pool per iteration or ensure QuizAttempt records are cleaned before each run.

---

## Scenario 3: Admin Dashboard & Student Metrics

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

## Scenario 4: PDF Upload & Reading

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
| 1 - Student Navigation | ~60% | 3-5s between transactions | Random | No — students can re-read courses |
| 2 - Student Quiz | ~15% | 5-10s (simulates reading question) | Sequential | **Yes** — unique user per VUser, or clean QuizAttempt between iterations |
| 3 - Admin Dashboard | ~10% | 3-5s | Random | No — reads are idempotent; only T07 creates data |
| 4A - PDF Upload (Admin) | ~5% | 5-10s (simulates selecting file) | Sequential | **Yes** — each upload creates a new file on disk; use unique filenames per iteration to avoid collisions |
| 4B - PDF Download (Student) | ~10% | 15-30s (simulates reading PDF) | Random | No — downloads are idempotent; multiple students can fetch the same PDF concurrently |

The main correlations across all scenarios will be the `token` cookie (set by login, sent automatically on subsequent requests) and the dynamic MongoDB `_id` values extracted from JSON responses for courseId, lessonId, contentId, and quizId.
