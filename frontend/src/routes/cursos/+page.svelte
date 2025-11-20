<script lang="ts">
  import NavBar from "$lib/components/NavBar.svelte";
  import CourseCardStudent from "../CourseCardStudent.svelte"; // Asegúrate de la ruta correcta
  import { onMount } from "svelte";

  // Interfaz actualizada
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
  let username = '';
  let viewerType = 'student';
  let loading = true;

  const API_BASE = 'http://localhost:5000';

  const token = () =>
    document.cookie.split('; ').find((row) => row.startsWith('session='))?.split('=')[1];

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token()}`
  });

  async function loadUser() {
    const t = token();
    if (!t) {
      window.location.href = '/login';
      return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { headers: authHeaders() });
        if (res.status === 401) {
          document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          window.location.href = '/login';
          return;
        }
        const data = await res.json();
        username = data.name;
        viewerType = data.role || 'student';
    } catch (e) {
        console.error("Auth error", e);
    }
  }

  async function fetchCourseProgress(courseId: string): Promise<ProgressData> {
    try {
      const res = await fetch(`${API_BASE}/api/enrollments/status/${courseId}`, { 
        headers: authHeaders() 
      });
      
      if (res.ok) {
        const data = await res.json();
        // Devolvemos ambos datos de la API
        return {
            personalProgress: data.studentProgress || 0,
            completedLessons: data.completedLessons || []
        };
      }
      // Retorno por defecto si la respuesta no es OK
      return { personalProgress: 0, completedLessons: [] };
    } catch (error) {
      console.error(`Error cargando progreso para curso ${courseId}`, error);
      return { personalProgress: 0, completedLessons: [] };
    }
  }

  async function loadCourses() {
    try {
      const res = await fetch(`${API_BASE}/api/courses`, { headers: authHeaders() });
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

<div class="dashboard-container">
  <header class="dashboard-header">
    <h1>Mis Cursos</h1>
    {#if viewerType === 'student'}
        <p class="subtitle">Continúa donde lo dejaste</p>
    {/if}
  </header>
  
  {#if loading}
    <div class="loading">Cargando tus cursos...</div>
  {:else if courses.length === 0}
    <div class="empty-state">
        <p>Aún no estás inscrito en ningún curso.</p>
    </div>
  {:else}
    <div class="courses-grid">
      {#each courses as course}
        <div class="grid-item"> 
             <CourseCardStudent {course} />
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .dashboard-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
    font-family: 'Inter', sans-serif;
  }

  .dashboard-header {
      margin-bottom: 2rem;
      text-align: center;
  }

  h1 { color: #2d3748; margin-bottom: 0.5rem; }
  .subtitle { color: #718096; }

  .loading, .empty-state {
      text-align: center;
      padding: 3rem;
      color: #718096;
      font-size: 1.1rem;
  }

  .courses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    justify-items: center;
  }

  .grid-item {
    width: 100%;
    display: flex;
    justify-content: center;
  }
</style>