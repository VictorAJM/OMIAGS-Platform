<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { onMount } from 'svelte';
  import NavBar from '$lib/components/NavBar.svelte';
  import CourseCard from '../../lib/components/CourseCard.svelte';
  import CreateCourseModal from '../../lib/components/CreateCourseModal.svelte';
  import LessonsModal from '../../lib/components/LessonsModal.svelte';

  let courses = [
    { id: 1, name: 'Algoritmos y Estructuras de Datos', description: 'Aprende los fundamentos de algoritmos y estructuras de datos para competencias.', level: 'preparatoria', students: 50, lessons: 15, image: '📚', color: '#f59e0b' },
    { id: 2, name: 'Programación Competitiva Avanzada', description: 'Problemas desafiantes y técnicas avanzadas de programación.', level: 'preparatoria', students: 35, lessons: 12, image: '💻', color: '#10b981' },
    { id: 3, name: 'Matemáticas Discretas', description: 'Teoría de números, combinatoria y lógica para competencias de programación.', level: 'secundaria', students: 40, lessons: 10, image: '🧮', color: '#3b82f6' }
  ];

  let showCreateModal = false;
  let showLessonsModal = false;
  let selectedCourse = null;

  let username = '';
  let viewerType = 'student';

  const openCreateModal = () => (showCreateModal = true);
  const openLessonsModal = (course) => { selectedCourse = course; showLessonsModal = true; };
  const closeModals = () => { showCreateModal = false; showLessonsModal = false; selectedCourse = null; };
  const deleteCourse = (id: number) => (courses = courses.filter((c) => c.id !== id));

  onMount(async () => {
    const token = document.cookie.split('; ').find((row) => row.startsWith('session='))?.split('=')[1];
    if (!token) return (window.location.href = '/login');

    try {
      const res = await fetch('http://localhost:5000/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) {
        document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      username = data.name;
      viewerType = data.role || 'student';
    } catch (err) {
      console.error('Failed to fetch user', err);
    }
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
    <CreateCourseModal on:close={closeModals} />
  {/if}

  {#if showLessonsModal && selectedCourse}
    <LessonsModal {selectedCourse} on:close={closeModals} />
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

  @media(min-width: 768px) {
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
