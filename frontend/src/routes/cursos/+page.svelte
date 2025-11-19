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

<main class="main-content">
  <h2>Mis Cursos</h2>
  <div class="course-list">
    {#each courses as course (course.id)}
      <CourseCardStudent
        {course}
      />
    {/each}
  </div>
</main>

<style>
  .main-content {
    padding: 2rem;
    background: #f9fafb;
    min-height: calc(100vh - 60px); /* leaves space for navbar */
  }

  h2 {
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    color: #333;
  }

  .course-list {
    max-height: calc(100vh - 140px);
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  /* Custom scrollbar */
  .course-list::-webkit-scrollbar {
    width: 8px;
  }
  .course-list::-webkit-scrollbar-thumb {
    background: #bbb;
    border-radius: 4px;
  }
  .course-list::-webkit-scrollbar-thumb:hover {
    background: #888;
  }
</style>
