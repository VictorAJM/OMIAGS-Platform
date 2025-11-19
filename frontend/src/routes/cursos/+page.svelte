<script lang="ts">
  import NavBar from "../../lib/components/NavBar.svelte";
  import CourseCardStudent from "../CourseCardStudent.svelte";
  import { onMount } from "svelte";

  interface Course {
    id: number | string;
    name: string;
    description: string;
    level: string;
    students: string[];
    lessons: number;
    image?: string;
    color?: string;
  }

  let courses: Course[] = [];
  let username = '';
  let viewerType = 'student';

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

    const res = await fetch(`${API_BASE}/api/auth/me`, { headers: authHeaders() });
    if (res.status === 401) {
      document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.href = '/login';
      return;
    }
    const data = await res.json();
    username = data.name;
    viewerType = data.role || 'student';
  }

  async function loadCourses() {
    const res = await fetch(`${API_BASE}/api/courses`, { headers: authHeaders() });
    if (res.ok) {
      const list = await res.json();
      // Normaliza campos mínimos que usa la UI
      courses = list.map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description || "",
        level: c.category,
        students: c.students,
        lessons: c.lessons,
        image: "📚",
        color: "#3182ce",
      }));
    }
  }

  onMount(async () => {
    await loadUser();
    await loadCourses();
  });
</script>

<NavBar {viewerType} {username} />

<div class="dashboard-container">
  <h1>Mis Cursos</h1>
  
  <div class="courses-grid">
    {#each courses as course}
      <div class="grid-item"> <CourseCardStudent {course} />
      </div>
    {/each}
  </div>
</div>

<style>
  .dashboard-container {
    max-width: 1000px; /* Ancho máximo del contenedor general */
    margin: 0 auto;
    padding: 2rem;
  }

  .courses-grid {
    display: grid;
    /* ESTA ES LA CLAVE: 2 columnas de igual tamaño */
    grid-template-columns: 1fr 1fr; 
    gap: 2rem; /* Espacio entre tarjetas */
    justify-items: center; /* Centra las tarjetas en su columna */
  }

  .grid-item {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  /* RESPONSIVE: En celulares (menos de 768px) pasa a 1 sola fila */
  @media (max-width: 768px) {
    .courses-grid {
      grid-template-columns: 1fr;
    }
  }
</style>