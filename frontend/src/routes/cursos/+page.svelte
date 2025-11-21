<script lang="ts">
  import NavBar from "$lib/components/NavBar.svelte";
  import CourseCardStudent from "../CourseCardStudent.svelte";
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";

  interface Course {
    id: string;
    name: string;
    description: string;
    level: string;
    students: string[];
    lessons: number;
    personalProgress: number;
    completedLessons: string[];
    image?: string;
    color?: string;
  }

  type ProgressData = {
    personalProgress: number;
    completedLessons: string[];
  };

  let courses: Course[] = [];
  let username = "";
  let viewerType = "student";
  let loading = true;

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  async function loadUser() {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: "include",
      });
      if (res.status === 401) {
        document.cookie =
          "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      username = data.name;
      viewerType = data.role || "student";
    } catch (e) {
      console.error("Auth error", e);
    }
  }

  async function fetchCourseProgress(courseId: string): Promise<ProgressData> {
    try {
      const res = await fetch(
        `${API_BASE}/api/enrollments/status/${courseId}`,
        {
          credentials: "include",
        },
      );

      if (res.ok) {
        const data = await res.json();
        return {
          personalProgress: data.studentProgress || 0,
          completedLessons: data.completedLessons || [],
        };
      }
      return { personalProgress: 0, completedLessons: [] };
    } catch (error) {
      console.error(`Error cargando progreso para curso ${courseId}`, error);
      return { personalProgress: 0, completedLessons: [] };
    }
  }

  async function loadCourses() {
    try {
      const res = await fetch(`${API_BASE}/api/courses`, {
        credentials: "include",
      });
      if (res.ok) {
        const list = await res.json();
        const coursesPromises = list.map(async (c: any) => {
          const progressData = await fetchCourseProgress(c.id);
          return {
            id: c.id,
            name: c.name,
            description: c.description || "Sin descripción",
            level: c.category,
            students: c.students || [],
            lessons: c.lessons || 0,
            personalProgress: progressData.personalProgress,
            completedLessons: progressData.completedLessons,
            image: "📚",
            color: "#3182ce",
          };
        });
        courses = await Promise.all(coursesPromises);
      }
    } catch (error) {
      console.error("Error cargando cursos:", error);
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    await loadUser();
    await loadCourses();
  });
</script>

<NavBar {viewerType} {username} />

<main class="main-content">
  <div class="dashboard-container">
    <header class="dashboard-header">
      <div class="header-text">
        <h1>Hola, {username || "Estudiante"} 👋</h1>
        <p class="subtitle">Bienvenido a tu panel de aprendizaje</p>
      </div>

      {#if !loading && courses.length > 0}
        <div class="header-stats" in:fade>
          <span class="stat-pill">
            <strong>{courses.length}</strong> Cursos en curso
          </span>
        </div>
      {/if}
    </header>

    {#if loading}
      <div class="loading-container" in:fade>
        <div class="spinner"></div>
        <p>Sincronizando tus cursos...</p>
      </div>
    {:else if courses.length === 0}
      <div class="empty-state" in:fade>
        <div class="empty-icon">🎓</div>
        <h3>Aún no tienes cursos</h3>
        <p>Parece que no estás inscrito en ninguna clase todavía.</p>
      </div>
    {:else}
      <div class="courses-grid">
        {#each courses as course (course.id)}
          <div class="grid-item" in:fly={{ y: 20, duration: 400 }}>
            <CourseCardStudent {course} />
          </div>
        {/each}
      </div>
    {/if}
  </div>
</main>

<style>
  :global(body) {
    background-color: #f8fafc;
  }

  .main-content {
    min-height: calc(100vh - 64px);
    padding: 2rem 1rem;
  }

  .dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Header */
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 2.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .header-text h1 {
    color: #1e293b;
    margin: 0 0 0.5rem 0;
    font-size: 1.8rem;
    font-weight: 700;
  }

  .subtitle {
    color: #64748b;
    margin: 0;
    font-size: 1rem;
  }

  .stat-pill {
    background: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    color: #334155;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
  }

  /* Grid */
  .courses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 2rem;
  }

  .grid-item {
    height: 100%;
  }

  /* Loading */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 0;
    color: #64748b;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    border: 1px dashed #cbd5e1;
    max-width: 500px;
    margin: 2rem auto;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.8;
  }

  .empty-state h3 {
    color: #334155;
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
  }

  .empty-state p {
    color: #94a3b8;
    margin: 0;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .courses-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
