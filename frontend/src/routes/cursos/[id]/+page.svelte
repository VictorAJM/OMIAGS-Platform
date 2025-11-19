<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from '$app/navigation'; 
  import NavBar from "$lib/components/NavBar.svelte"; 
  import CourseDetails from "$lib/components/CourseDetails.svelte";

  let course = null;
  let lessons = [];
  let loading = true;
  let error = "";

  let courseId = $page.params.id;
  let expandedLesson = null;

  // Cálculo reactivo del progreso
  $: totalLessons = lessons.length;
  $: completedCount = lessons.filter(l => l.completed).length;
  $: currentProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

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

  onMount(async () => {
    await loadUser(); // Aseguramos cargar usuario primero

    try {
      const courseRes = await fetch(`http://localhost:5000/api/courses/${courseId}`, { method: 'GET', headers: authHeaders() });
      if (!courseRes.ok) throw new Error("Error al cargar el curso");
      course = await courseRes.json();

      const lessonRes = await fetch(`http://localhost:5000/api/lessons/${courseId}/lessons`, { headers: authHeaders() }); // Agregué headers aquí también por seguridad
      if (!lessonRes.ok) throw new Error("Error al cargar lecciones");
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

  function openContent(contentId) {
    goto(`/content/${contentId}`);
  }
  
  // Función para volver
  function goBack() {
    goto('/cursos');
  }

  async function toggleCompleted(lesson) {
    const oldStatus = lesson.completed;
    const newStatus = !oldStatus;
    
    lessons = lessons.map(l => 
      l._id === lesson._id ? { ...l, completed: newStatus } : l
    );

    try {
      const res = await fetch(`http://localhost:5000/api/lessons/${lesson._id}/completed`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() }, // Importante: headers con auth
        body: JSON.stringify({ completed: newStatus })
      });

      if (!res.ok) throw new Error("Fallo al guardar");
    } catch (err) {
      console.error("Error updating completed:", err);
      lessons = lessons.map(l => 
        l._id === lesson._id ? { ...l, completed: oldStatus } : l
      );
      alert("No se pudo guardar el progreso.");
    }
  }
</script>

<NavBar viewerType="student" username={username} />

<div class="course-page">
  <button class="back-btn" on:click={goBack}>
    ← Volver a mis cursos
  </button>

  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Cargando tu aprendizaje...</p>
    </div>
  {:else if error}
    <div class="error-state">
      <p>⚠️ {error}</p>
      <button on:click={() => window.location.reload()}>Reintentar</button>
    </div>
  {:else}
    {#if course}
      <CourseDetails
        title={course.title || course.name}
        description={course.description}
        progress={currentProgress} 
        totalLessons={totalLessons}
        completedLessons={completedCount}
      />
    {/if}

    {#if lessons.length === 0}
      <div class="empty-state">No hay lecciones disponibles aún.</div>
    {:else}
      <div class="lessons-list">
        {#each lessons as lesson, i}
          <div class="lesson-card {lesson.completed ? 'is-completed' : ''}">
            
            <div class="lesson-header" on:click={() => toggleLesson(lesson._id)}>
              <span class="lesson-number">
                {#if lesson.completed}✓{:else}{i + 1}{/if}
              </span>

              <div class="lesson-info">
                <h3>{lesson.title}</h3>
                {#if lesson.description}
                  <p class="lesson-desc">{lesson.description}</p>
                {/if}
              </div>

              <div class="lesson-actions" on:click|stopPropagation>
                <label class="checkbox-container" title="Marcar como completa">
                  <input
                    type="checkbox"
                    checked={lesson.completed}
                    on:change={() => toggleCompleted(lesson)}
                  />
                  <span class="checkmark"></span>
                </label>
                
                <button class="expand-btn">
                  {expandedLesson === lesson._id ? "−" : "+"}
                </button>
              </div>
            </div>

            {#if expandedLesson === lesson._id}
              <div class="lesson-body" transition:slide|local={{ duration: 200 }}>
                {#if lesson.contents && lesson.contents.length > 0}
                  <ul class="contents-list">
                    {#each lesson.contents as content}
                      <li class="content-item" on:click={() => openContent(content._id)}>
                        <span class="icon-type {content.type}">
                          {content.type === 'video' ? '🎥' : content.type === 'quiz' ? '📝' : '📄'}
                        </span>
                        <span class="content-title">{content.title}</span>
                        <span class="arrow">→</span>
                      </li>
                    {/each}
                  </ul>
                {:else}
                  <p class="no-content">Esta lección aún no tiene contenido.</p>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<script context="module">
    import { slide } from 'svelte/transition';
</script>

<style>
  .course-page { max-width: 800px; margin: 2rem auto; padding: 0 1rem; font-family: 'Inter', sans-serif; }
  
  /* ESTILOS DEL BOTÓN VOLVER */
  .back-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #64748b;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    padding: 0;
    font-size: 0.95rem;
    transition: color 0.2s, transform 0.2s;
  }

  .back-btn:hover {
    color: #1e293b;
    transform: translateX(-3px); /* Efecto visual de movimiento a la izquierda */
  }

  /* Estados de carga y error */
  .loading-state, .error-state, .empty-state { text-align: center; padding: 3rem; color: #666; }
  .error-state { color: #e53e3e; }
  
  /* Lista de lecciones */
  .lessons-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem; }

  .lesson-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  
  .lesson-card:hover { border-color: #cbd5e0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .lesson-card.is-completed { background-color: #f8fff9; border-color: #c6f6d5; }

  /* Header de la lección */
  .lesson-header {
    display: flex;
    align-items: center;
    padding: 1.25rem;
    cursor: pointer;
    gap: 1rem;
  }

  .lesson-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: #edf2f7;
    color: #4a5568;
    border-radius: 50%;
    font-weight: bold;
    font-size: 0.9rem;
    flex-shrink: 0;
  }
  .is-completed .lesson-number { background: #48bb78; color: white; }

  .lesson-info { flex-grow: 1; }
  .lesson-info h3 { margin: 0; font-size: 1.05rem; color: #2d3748; font-weight: 600; }
  .lesson-desc { margin: 0.25rem 0 0; font-size: 0.85rem; color: #718096; }

  .lesson-actions { display: flex; align-items: center; gap: 1rem; }

  /* Checkbox personalizado */
  .checkbox-container { position: relative; display: inline-block; width: 24px; height: 24px; cursor: pointer; }
  .checkbox-container input { opacity: 0; width: 0; height: 0; }
  .checkmark {
    position: absolute; top: 0; left: 0; height: 24px; width: 24px;
    background-color: #fff; border: 2px solid #cbd5e0; border-radius: 6px; transition: all 0.2s;
  }
  .checkbox-container:hover input ~ .checkmark { border-color: #a0aec0; }
  .checkbox-container input:checked ~ .checkmark { background-color: #48bb78; border-color: #48bb78; }
  .checkmark:after {
    content: ""; position: absolute; display: none;
    left: 8px; top: 4px; width: 5px; height: 10px;
    border: solid white; border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  .checkbox-container input:checked ~ .checkmark:after { display: block; }

  .expand-btn { background: none; border: none; font-size: 1.5rem; color: #a0aec0; cursor: pointer; width: 24px; display:flex; justify-content:center;}

  /* Contenido Interior */
  .lesson-body { border-top: 1px solid #edf2f7; background: #fcfcfc; }
  
  .contents-list { list-style: none; margin: 0; padding: 0; }
  
  .content-item {
    padding: 1rem 1.25rem 1rem 3.5rem;
    display: flex; align-items: center; gap: 0.75rem;
    cursor: pointer; border-bottom: 1px solid #edf2f7; transition: background 0.1s;
  }
  .content-item:last-child { border-bottom: none; }
  .content-item:hover { background: #f0f4f8; }

  .icon-type { font-size: 1.1rem; width: 24px; text-align: center;}
  .content-title { flex-grow: 1; font-size: 0.95rem; color: #4a5568; }
  .arrow { color: #cbd5e0; font-weight: bold; }
  .no-content { padding: 1.5rem; text-align: center; color: #a0aec0; font-style: italic; font-size: 0.9rem;}
</style>