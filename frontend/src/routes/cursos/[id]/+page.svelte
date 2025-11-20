<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from '$app/navigation'; 
  import NavBar from "$lib/components/NavBar.svelte"; 
  import CourseDetails from "$lib/components/CourseDetails.svelte";
  import { slide } from 'svelte/transition'; 

  let course = null;
  let lessons = [];
  let completedLessonIds = []; 
  let loading = true;
  let error = "";
  let courseId = $page.params.id;
  let expandedLesson = null;

  // Reactividad: Calcula progreso automáticamente cuando completedLessonIds cambia
  $: totalLessons = lessons.length;
  $: completedCount = completedLessonIds.length;
  $: currentProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  let username = '';
  let userId = null;
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
    userId = data._id || data.id; 
    viewerType = data.role || 'student';
  }

  async function loadEnrollmentStatus() {
    try {
      const res = await fetch(`${API_BASE}/api/enrollments/status/${courseId}`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        // Aseguramos que sean strings para que .includes() funcione bien
        completedLessonIds = (data.completedLessons || []).map(id => id.toString());
      }
    } catch (err) {
      console.warn("No se pudo cargar el estado inicial de la inscripción", err);
    }
  }

  function openContent(content) {
    if (content.type === 'quiz') {
       goto(`/quiz/${content.quizId}`); 
    } else {
       goto(`/content/${content._id}`);
    }
  }

  onMount(async () => {
    await loadUser();

    try {
      const courseRes = await fetch(`${API_BASE}/api/courses/${courseId}`, { method: 'GET', headers: authHeaders() });
      if (!courseRes.ok) throw new Error("Error al cargar el curso");
      course = await courseRes.json();

      const lessonRes = await fetch(`${API_BASE}/api/lessons/${courseId}/lessons`, { headers: authHeaders() });
      if (!lessonRes.ok) throw new Error("Error al cargar lecciones");
      lessons = await lessonRes.json();

      if (userId) {
        await loadEnrollmentStatus();
      }

    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });

  function toggleLesson(lessonId) {
    expandedLesson = expandedLesson === lessonId ? null : lessonId;
  }

  function goBack() {
    goto('/cursos');
  }

  async function toggleCompleted(lesson) {
    if (!userId) return alert("Debes iniciar sesión para guardar tu progreso.");

    const isCompleted = completedLessonIds.includes(lesson._id);
    const newStatus = !isCompleted; 
    
    // 1. Actualización Optimista (UI inmediata)
    if (newStatus) {
      completedLessonIds = [...completedLessonIds, lesson._id];
    } else {
      completedLessonIds = completedLessonIds.filter(id => id !== lesson._id);
    }

    try {
      const res = await fetch(`${API_BASE}/api/lessons/${lesson._id}/toggle-completion`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ 
          userId: userId, 
          completed: newStatus 
        })
      });

      if (!res.ok) throw new Error("Fallo al guardar");

      // 2. [CORRECCIÓN] Sincronización con el servidor
      // Es importante usar la respuesta del servidor para confirmar el estado real
      const data = await res.json(); 
      if (data.completedLessons) {
          completedLessonIds = data.completedLessons.map(id => id.toString());
      }

    } catch (err) {
      console.error("Error updating completed:", err);
      
      // 3. Rollback en caso de error (Revertir UI)
      if (!newStatus) {
        // Si intentamos borrar y falló, lo volvemos a poner
        completedLessonIds = [...completedLessonIds, lesson._id];
      } else {
        // Si intentamos poner y falló, lo quitamos
        completedLessonIds = completedLessonIds.filter(id => id !== lesson._id);
      }
      alert("No se pudo guardar el progreso. Verifica tu conexión.");
    }
  }

  function getYouTubeEmbedUrl(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
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
      <!-- El componente CourseDetails se actualizará automáticamente gracias a la reactividad de currentProgress -->
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
          <!-- Verificación visual usando el array local de IDs -->
          {@const isCompleted = completedLessonIds.includes(lesson._id)}
          
          <div class="lesson-card {isCompleted ? 'is-completed' : ''}">
            
            <div class="lesson-header" on:click={() => toggleLesson(lesson._id)}>
              <span class="lesson-number">
                {#if isCompleted}✓{:else}{i + 1}{/if}
              </span>

              <div class="lesson-info">
                <h3>{lesson.title}</h3>
                {#if lesson.description}
                  <p class="lesson-desc">{lesson.description}</p>
                {/if}
              </div>

              <div class="lesson-actions" on:click|stopPropagation>
                <label class="checkbox-container" title={isCompleted ? "Marcar como pendiente" : "Marcar como completa"}>
                  <input
                    type="checkbox"
                    checked={isCompleted}
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
                  <div class="contents-list">
                    {#each lesson.contents as content}
                      
                      <button class="content-card" on:click={() => openContent(content)}>
                        
                        <div class="card-icon {content.type}">
                          {#if content.type === 'video'}
                            🎥
                          {:else if content.type === 'pdf'}
                            📄
                          {:else if content.type === 'quiz'}
                            📝
                          {:else}
                            📖
                          {/if}
                        </div>

                        <div class="card-info">
                          <span class="type-label">
                            {content.type === 'video' ? 'Video' : content.type === 'pdf' ? 'Documento PDF' : content.type === 'quiz' ? 'Quiz' : 'Lectura'}
                          </span>
                          <h4>{content.title}</h4>
                        </div>

                        <div class="card-action">
                          →
                        </div>

                      </button>

                    {/each}
                  </div>
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

<style>
  .course-page { max-width: 800px; margin: 2rem auto; padding: 0 1rem; font-family: 'Inter', sans-serif; }
  
  .back-btn {
    background: none; border: none; cursor: pointer; color: #64748b; font-weight: 600;
    display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; padding: 0;
    font-size: 0.95rem; transition: color 0.2s, transform 0.2s;
  }
  .back-btn:hover { color: #1e293b; transform: translateX(-3px); }

  /* Estados generales */
  .loading-state, .error-state, .empty-state { text-align: center; padding: 3rem; color: #666; }
  .error-state { color: #e53e3e; }
  
  /* Estructura de lecciones */
  .lessons-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem; }

  .lesson-card {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;
    transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  .lesson-card:hover { border-color: #cbd5e0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .lesson-card.is-completed { background-color: #f8fff9; border-color: #c6f6d5; }

  /* Header */
  .lesson-header { display: flex; align-items: center; padding: 1.25rem; cursor: pointer; gap: 1rem; }

  .lesson-number {
    display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
    background: #edf2f7; color: #4a5568; border-radius: 50%; font-weight: bold; font-size: 0.9rem; flex-shrink: 0;
  }
  .is-completed .lesson-number { background: #48bb78; color: white; }

  .lesson-info { flex-grow: 1; }
  .lesson-info h3 { margin: 0; font-size: 1.05rem; color: #2d3748; font-weight: 600; }
  .lesson-desc { margin: 0.25rem 0 0; font-size: 0.85rem; color: #718096; }

  .lesson-actions { display: flex; align-items: center; gap: 1rem; }

  /* Checkbox */
  .checkbox-container { position: relative; display: inline-block; width: 24px; height: 24px; cursor: pointer; }
  .checkbox-container input { opacity: 0; width: 0; height: 0; }
  .checkmark {
    position: absolute; top: 0; left: 0; height: 24px; width: 24px;
    background-color: #fff; border: 2px solid #cbd5e0; border-radius: 6px; transition: all 0.2s;
  }
  .checkbox-container:hover input ~ .checkmark { border-color: #a0aec0; }
  .checkbox-container input:checked ~ .checkmark { background-color: #48bb78; border-color: #48bb78; }
  .checkmark:after {
    content: ""; position: absolute; display: none; left: 8px; top: 4px; width: 5px; height: 10px;
    border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg);
  }
  .checkbox-container input:checked ~ .checkmark:after { display: block; }

  .expand-btn { background: none; border: none; font-size: 1.5rem; color: #a0aec0; cursor: pointer; width: 24px; display:flex; justify-content:center;}

  /* --- ESTILOS DEL CONTENIDO INTERIOR --- */
  .lesson-body { border-top: 1px solid #edf2f7; background: #fcfcfc; padding: 1.5rem; }
  .contents-list { display: flex; flex-direction: column; gap: 0.8rem; padding: 0.5rem 0; }
  .no-content { text-align: center; color: #a0aec0; font-style: italic; }

  .content-card {
    display: flex; align-items: center; gap: 1rem;
    width: 100%; background: white; border: 1px solid #e2e8f0; border-radius: 8px;
    padding: 1rem; text-align: left; cursor: pointer; transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }

  .content-card:hover {
    border-color: #3b82f6;
    transform: translateX(4px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  }

  /* Iconos con fondo de color */
  .card-icon {
    width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
    border-radius: 8px; font-size: 1.2rem; flex-shrink: 0;
  }
  .card-icon.video { background: #fee2e2; color: #991b1b; }
  .card-icon.pdf { background: #fff7ed; color: #9a3412; }
  .card-icon.text { background: #f0f9ff; color: #075985; }
  .card-icon.quiz { background: #f3e8ff; color: #6b21a8; }

  .card-info { flex-grow: 1; display: flex; flex-direction: column; gap: 0.2rem; }
  
  .type-label { font-size: 0.7rem; text-transform: uppercase; color: #94a3b8; font-weight: 600; letter-spacing: 0.05em; }
  
  .card-info h4 { margin: 0; font-size: 0.95rem; color: #334155; font-weight: 600; }

  .card-action { font-size: 1.2rem; color: #cbd5e0; font-weight: bold; }
  .content-card:hover .card-action { color: #3b82f6; }
</style>