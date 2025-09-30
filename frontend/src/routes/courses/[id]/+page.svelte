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
  let expandedLesson = null; // controlar qué lección está expandida

  onMount(async () => {
    try {
      // Fetch course details
      const courseRes = await fetch(`http://localhost:5000/api/courses/${courseId}`);
      if (!courseRes.ok) throw new Error("Failed to load course");
      course = await courseRes.json();

      // Fetch lessons
      const lessonRes = await fetch(`http://localhost:5000/api/lessons/${courseId}/lessons`);
      if (!lessonRes.ok) throw new Error("Failed to load lessons");
      lessons = await lessonRes.json();

    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });

  function toggleLesson(lessonId) {
    expandedLesson = expandedLesson === lessonId ? null : lessonId;
  }

  function openContent(content) {
    // Aquí decides a dónde redirigir
    window.location.href = `/content/${content._id}`;
  }

  async function toggleCompleted(lesson) {
    try {
      const newStatus = !lesson.completed;
      const res = await fetch(`http://localhost:5000/api/lessons/${lesson._id}/completed`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newStatus })
      });

      if (!res.ok) throw new Error("Failed to update lesson");

      const updatedLesson = await res.json();

      // Update local lessons state
      lessons = lessons.map(l => 
        l._id === updatedLesson._id ? { ...l, completed: updatedLesson.completed } : l
      );
    } catch (err) {
      console.error("Error updating completed:", err);
    }
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
          <div class="lesson-card">
            <!-- Lesson header -->
            <div class="lesson-header" on:click={() => toggleLesson(lesson._id)}>
              
              <!-- Number -->
              <span class="lesson-number">{i + 1}</span>

              <!-- Title & description -->
              <div class="lesson-content">
                <h3>{lesson.title}</h3>
                <p>{lesson.description}</p>
              </div>

              <!-- Actions -->
              <div class="lesson-actions" on:click|stopPropagation>
                <label class="completed-toggle">
                  <input
                    type="checkbox"
                    checked={lesson.completed}
                    on:change={() => toggleCompleted(lesson)}
                  />
                  <span>{lesson.completed ? "Completo" : "Incompleto"}</span>
                </label>
                <span class="expand-icon">
                  {expandedLesson === lesson._id ? "−" : "+"}
                </span>
              </div>
            </div>

            <!-- Expanded contents -->
            {#if expandedLesson === lesson._id}
              <ul class="contents-list">
                {#each lesson.contents as content}
                  <li class="content-item" on:click={() => openContent(content)}>
                    <span class="content-type">{content.type.toUpperCase()}</span>
                    <span class="content-title">{content.title}</span>
                  </li>
                {/each}
              </ul>
            {/if}
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
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }

  .lesson-header {
    display: flex;
    align-items: center;
    padding: 1rem 1.25rem;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .lesson-header:hover {
    background: #f7fbff;
  }

  .lesson-number {
    font-weight: bold;
    font-size: 1.2rem;
    color: #0077cc;
    margin-right: 1.25rem;
    flex-shrink: 0;
  }

  .lesson-content {
    flex-grow: 1;
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

  .lesson-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .completed-toggle {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.85rem;
    color: #444;
    cursor: pointer;
  }

  .completed-toggle input {
    cursor: pointer;
  }

  .expand-icon {
    font-size: 1.5rem;
    color: #777;
  }

  .contents-list {
    list-style: none;
    margin: 0;
    padding: 0.5rem 1rem 1rem 3rem;
    background: #fafafa;
  }

  .content-item {
    padding: 0.5rem 0;
    cursor: pointer;
    display: flex;
    gap: 1rem;
    align-items: center;
    border-bottom: 1px solid #eee;
  }

  .content-item:last-child {
    border-bottom: none;
  }

  .content-item:hover {
    background: #eef6ff;
  }

  .content-type {
    font-size: 0.75rem;
    font-weight: bold;
    color: #0077cc;
    text-transform: uppercase;
  }

  .content-title {
    font-size: 0.9rem;
    color: #333;
  }
</style>
