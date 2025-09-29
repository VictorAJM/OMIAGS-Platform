<script>
  import NavBar from "../../../lib/components/NavBar.svelte";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import CourseDetails from "../../../lib/components/CourseDetails.svelte";

  let course = null;
  let lessons = [];
  let loading = true;
  let error = "";

  let courseId = $page.params.id;

  onMount(async () => {
    try {
      // Fetch course details
      const courseRes = await fetch(`http://localhost:5000/api/courses/${courseId}`);
      if (!courseRes.ok) throw new Error("Failed to load course");
      course = await courseRes.json();

      // Fetch lessons
      const lessonRes = await fetch(`http://localhost:5000/api/lessons/${courseId}`);
      if (!lessonRes.ok) throw new Error("Failed to load lessons");
      lessons = await lessonRes.json();

      // Ensure lessons are ordered
      lessons = lessons.sort((a, b) => a.order - b.order);

    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });

  function openLesson(lesson) {
    alert(`Abrir lección: ${lesson.title}`);
  }
</script>

<NavBar viewerType="student" username="Chaska" />

<div class="course-page">
  {#if loading}
    <p>Cargando curso...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else}
    {#if course}
      <CourseDetails
        title={course.title}
        description={course.description}
        progress={course.progress}
      />
    {/if}

    {#if lessons.length === 0}
      <p>No hay lecciones disponibles.</p>
    {:else}
      <div class="lessons-list">
        {#each lessons as lesson, i}
          <div class="lesson-card" on:click={() => openLesson(lesson)}>
            <span class="lesson-number">{i + 1}</span>
            <div class="lesson-content">
              <h3>{lesson.title}</h3>
              <p>{lesson.description}</p>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .course-page {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
  }

  .error {
    color: red;
    font-weight: bold;
  }

  .lessons-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .lesson-card {
    display: flex;
    align-items: center;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    padding: 1rem 1.25rem;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  }

  .lesson-card:hover {
    background: #f7fbff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .lesson-number {
    font-weight: bold;
    font-size: 1.2rem;
    color: #0077cc;
    margin-right: 1.25rem;
    flex-shrink: 0;
  }

  .lesson-content h3 {
    margin: 0;
    font-size: 1.05rem;
    color: #222;
  }

  .lesson-content p {
    margin: 0.25rem 0 0;
    font-size: 0.9rem;
    color: #555;
  }
</style>
