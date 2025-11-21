<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import NavBar from "$lib/components/NavBar.svelte";
  import CourseCard from "$lib/components/CourseCard.svelte";
  import CreateCourseModal from "$lib/components/CreateCourseModal.svelte";
  import LessonsModal from "$lib/components/LessonsModal.svelte";

  type Course = {
    id: string;
    title: string;
    description: string;
    category: string;
    students: string[];
    studentsCount?: number;
    lessons: number;
    image?: string;
    color?: string;
  };

  let courses: Course[] = [];
  let showCreateModal = false;
  let showLessonsModal = false;
  let selectedCourse: Course | null = null;
  let isLoading = true; // New loading state

  let username = "";
  let viewerType = "student";

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
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
    } catch (error) {
      console.error("Auth error:", error);
    }
  }

  async function loadCourses() {
    isLoading = true;
    try {
      const res = await fetch(`${API_BASE}/api/courses`, {
        credentials: "include",
      });
      if (res.ok) {
        const list = await res.json();
        courses = list.map((c: any) => ({
          id: c.id,
          title: c.name || c.title,
          description: c.description || "",
          category: c.category,
          students: new Array(c.studentsCount || 0).fill("student"),
          studentsCount: c.studentsCount || 0,
          lessons: c.lessons || 0,
          image: "📚",
          color: "#3182ce",
        }));
      }
    } catch (err) {
      console.error("Error loading courses:", err);
    } finally {
      isLoading = false;
    }
  }

  function handleCreated(e: CustomEvent<any>) {
    const newCourseData = e.detail;
    const newCourse: Course = {
      id: newCourseData.id,
      title: newCourseData.title,
      description: newCourseData.description,
      category: newCourseData.category,
      students: newCourseData.students || [],
      studentsCount: (newCourseData.students || []).length,
      lessons: 0,
      image: "📚",
      color: "#3182ce",
    };

    courses = [...courses, newCourse];
    closeModals();
  }

  async function deleteCourse(id: string) {
    if (!confirm("¿Estás seguro de eliminar este curso?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/courses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        courses = courses.filter((c) => c.id !== id);
      }
    } catch (error) {
      console.error("Error deleting course:", error);
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
    <div class="header-content">
      <div class="header-text">
        <h2>Gestión de Cursos</h2>
        <p>Administra tu catálogo educativo</p>
      </div>

      {#if !isLoading}
        <div class="header-stats" in:fade>
          <span class="stat-pill">
            <strong>{courses.length}</strong> Cursos activos
          </span>
        </div>
      {/if}
    </div>

    <div class="header-actions">
      <button class="btn-primary" on:click={openCreateModal}>
        <span class="icon">➕</span> Crear Nuevo Curso
      </button>
    </div>
  </div>

  <div class="content-area">
    {#if isLoading}
      <div class="loading-container" in:fade>
        <div class="spinner"></div>
        <p>Cargando cursos...</p>
      </div>
    {:else if courses.length === 0}
      <div class="empty-state" in:fade>
        <div class="empty-icon">📭</div>
        <h3>No hay cursos creados</h3>
        <p>Comienza creando tu primer curso para tus estudiantes.</p>
        <button class="btn-outline" on:click={openCreateModal}>
          Crear mi primer curso
        </button>
      </div>
    {:else}
      <div class="courses-grid">
        {#each courses as course (course.id)}
          <div transition:fly={{ y: 20, duration: 300 }}>
            <CourseCard
              {course}
              on:openLessons={() => openLessonsModal(course)}
              on:deleteCourse={() => deleteCourse(course.id)}
              on:refresh={loadCourses}
            />
          </div>
        {/each}
      </div>
    {/if}
  </div>

  {#if showCreateModal}
    <CreateCourseModal
      on:close={() => (showCreateModal = false)}
      on:created={handleCreated}
    />
  {/if}

  {#if showLessonsModal && selectedCourse}
    <LessonsModal
      {selectedCourse}
      on:close={closeModals}
      on:lessonsUpdated={loadCourses}
    />
  {/if}
</div>

<style>
  :global(body) {
    background-color: #f7fafc; /* Light background for the whole page */
  }

  .cursos-page {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1.5rem;
    font-family:
      "Inter",
      system-ui,
      -apple-system,
      sans-serif;
  }

  /* --- Header Styling --- */
  .page-header {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2.5rem;
    background: white;
    padding: 1.5rem;
    border-radius: 16px;
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.02),
      0 1px 2px rgba(0, 0, 0, 0.03);
    border: 1px solid #edf2f7;
  }

  @media (min-width: 768px) {
    .page-header {
      flex-direction: row;
      align-items: center;
    }
  }

  .header-text h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.75rem;
    color: #1a202c;
    font-weight: 700;
  }

  .header-text p {
    margin: 0;
    font-size: 1rem;
    color: #718096;
  }

  .header-stats {
    margin-top: 0.5rem;
  }

  .stat-pill {
    display: inline-block;
    background: #ebf8ff;
    color: #2b6cb0;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.875rem;
    border: 1px solid #bee3f8;
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
  }

  /* --- Buttons --- */
  .btn-primary {
    background: linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 4px 6px rgba(49, 130, 206, 0.3);
    transition: all 0.2s ease;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(49, 130, 206, 0.4);
  }

  .btn-secondary {
    background: white;
    border: 1px solid #e2e8f0;
    color: #4a5568;
    padding: 0.75rem;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-secondary:hover {
    background: #f7fafc;
    border-color: #cbd5e0;
    transform: rotate(180deg);
  }

  .btn-outline {
    background: transparent;
    border: 2px solid #3182ce;
    color: #3182ce;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 1rem;
    transition: all 0.2s;
  }

  .btn-outline:hover {
    background: #ebf8ff;
  }

  /* --- Content & Grid --- */
  .courses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 2rem;
  }

  /* --- Loading State --- */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    color: #718096;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #3182ce;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* --- Empty State --- */
  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 16px;
    border: 2px dashed #e2e8f0;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.8;
  }

  .empty-state h3 {
    margin: 0 0 0.5rem 0;
    color: #2d3748;
    font-size: 1.25rem;
  }

  .empty-state p {
    color: #718096;
    margin-bottom: 1.5rem;
  }
</style>
