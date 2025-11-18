<script lang="ts">
  import { onMount } from 'svelte';
  import NavBar from '$lib/components/NavBar.svelte';
  import CourseCard from '$lib/components/CourseCard.svelte';
  import CreateCourseModal from '$lib/components/CreateCourseModal.svelte';
  import LessonsModal from '$lib/components/LessonsModal.svelte';

  type Course = {
    id: number | string;
    name: string;
    description: string;
    level: string;
    students: string[];
    lessons: number;
    image?: string;
    color?: string;
  };

  let courses: Course[] = [];
  let showCreateModal = false;
  let showLessonsModal = false;
  let selectedCourse: Course | null = null;

  let username = '';
  let viewerType = 'student';

  const API_BASE = 'http://localhost:5000';

  const token = () =>
    document.cookie.split('; ').find((row) => row.startsWith('session='))?.split('=')[1];

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token()}`
  });

  const openCreateModal = () => (showCreateModal = true);
  const openLessonsModal = (course: Course) => {
    selectedCourse = course;
    showLessonsModal = true;
  };
  const closeModals = () => {
    showCreateModal = false;
    showLessonsModal = false;
    selectedCourse = null;
  };

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
        name: c.name,          // cambiar a title
        description: c.description || "",
        level: c.category,      // cambiar a category
        students: c.students,
        lessons: c.lessons,
        image: "📚",
        color: "#3182ce",
      }));
    }
  }

  async function handleCreated(e: CustomEvent<Course>) {
    const payload = e.detail;

    const res = await fetch(`${API_BASE}/api/courses`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      closeModals();
      await loadCourses();
    }
  }

  async function deleteCourse(id: number | string) {
    const res = await fetch(`${API_BASE}/api/courses/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (res.ok) {
      courses = courses.filter((c) => c.id !== id);
    }
  }

  onMount(async () => {
    await loadUser();
    await loadCourses();
  });
</script>

<NavBar {viewerType} {username} />

<div class="cursos-page">
  <div class="page-header">
    <div class="header-info">
      <h2>Gestión de Cursos</h2>
      <p>Crea y administra tus cursos de programación competitiva</p>
    </div>
    <button class="btn-primary" on:click={openCreateModal}>➕ Crear Nuevo Curso</button>
  </div>

  <div class="courses-grid">
    {#each courses as course (course.id)}
      <CourseCard
        {course}
        on:openLessons={() => openLessonsModal(course)}
        on:deleteCourse={() => deleteCourse(course.id)}
      />
    {/each}
  </div>

  {#if showCreateModal}
    <CreateCourseModal
      on:close={() => showCreateModal = false}
      on:created={(e) => {
        const newCourse = e.detail;
        courses = [...courses, newCourse]; // refrescar lista
      }}
    />
  {/if}

  {#if showLessonsModal && selectedCourse}
    <LessonsModal 
        {selectedCourse}
        on:close={closeModals}
        on:lessonsUpdated={() => {
            loadCourses();   // actualiza UI
        }}
    />
  {/if}
</div>

<style>
  .cursos-page {
    margin-top: 20px;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    padding: 0 1rem;
  }

  .page-header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
  }

  @media (min-width: 768px) {
    .page-header {
      flex-direction: row;
      align-items: center;
    }
  }

  .header-info h2 {
    margin: 0 0 0.25rem 0;
    font-size: 1.75rem;
    color: #2d3748;
  }

  .header-info p {
    margin: 0;
    font-size: 1rem;
    color: #718096;
  }

  .courses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .btn-primary {
    background: #3182ce;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .btn-primary:hover {
    background: #2c5282;
  }
</style>
