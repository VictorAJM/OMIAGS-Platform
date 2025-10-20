<script lang="ts">
  import NavBar from "../../lib/components/NavBar.svelte";
  import { onMount } from "svelte";

  interface CourseProgress {
    id: string;
    title: string;
    completedLessons: number;
    totalLessons: number;
    pendingLessons: { id: string; title: string }[];
    recentGrades: { quiz: string; score: number; date: string }[];
  }

  let username = "";
  let viewerType = "student";
  
  onMount(async () => {
    const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("session="))
    ?.split("=")[1];

    if (!token) {
      window.location.href = "/login"; // redirect if not logged in
      return;
    }
    try {
      const userRes = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (userRes.status === 401) {
        document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/login";
        return;
      }

      const userData = await userRes.json();
      username = userData.name;
      viewerType = userData.role || "student";
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  });

  let coursesProgress: CourseProgress[] = [
    {
      id: "course1",
      title: "Matemáticas",
      completedLessons: 5,
      totalLessons: 10,
      pendingLessons: [
        { id: "l6", title: "Álgebra avanzada" },
        { id: "l7", title: "Trigonometría" }
      ],
      recentGrades: [
        { quiz: "Quiz 1", score: 80, date: "2025-10-20" },
        { quiz: "Quiz 2", score: 90, date: "2025-10-21" }
      ]
    },
    {
      id: "course2",
      title: "Física",
      completedLessons: 3,
      totalLessons: 8,
      pendingLessons: [
        { id: "l4", title: "Dinámica" },
        { id: "l5", title: "Óptica" }
      ],
      recentGrades: [
        { quiz: "Quiz 1", score: 70, date: "2025-10-18" },
        { quiz: "Quiz 2", score: 95, date: "2025-10-19" }
      ]
    }
  ];
</script>

<NavBar {viewerType} {username} />

<main class="main-content">
  <h2>Mi Progreso</h2>

  {#each coursesProgress as course}
    <section class="course-progress">
      <h3>{course.title}</h3>
      <p>
        Lecciones completadas: {course.completedLessons} / {course.totalLessons}
      </p>

      <div class="tables-container">
        <!-- Pending Lessons -->
        <div class="table-wrapper">
          <h4>Lecciones pendientes</h4>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
              </tr>
            </thead>
            <tbody>
              {#each course.pendingLessons as lesson}
                <tr>
                  <td>{lesson.id}</td>
                  <td>{lesson.title}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <!-- Recent Grades -->
        <div class="table-wrapper">
          <h4>Calificaciones recientes</h4>
          <table>
            <thead>
              <tr>
                <th>Quiz</th>
                <th>Score</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {#each course.recentGrades as grade}
                <tr>
                  <td>{grade.quiz}</td>
                  <td>{grade.score}%</td>
                  <td>{grade.date}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  {/each}
</main>

<style>
  .main-content {
    padding: 2rem;
    background: #f9fafb;
    min-height: calc(100vh - 60px);
  }

  h2 {
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    color: #333;
  }

  .course-progress {
    margin-bottom: 2rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 5px rgba(0,0,0,0.1);
  }

  .tables-container {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  .table-wrapper {
    flex: 1;
    min-width: 250px;
    max-height: 300px;
    overflow-y: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    border: 1px solid #ddd;
    padding: 0.5rem;
    text-align: left;
  }

  th {
    background: #f0f0f0;
  }

  tbody tr:nth-child(even) {
    background: #fafafa;
  }

  h4 {
    margin-bottom: 0.5rem;
  }
</style>
