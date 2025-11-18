<script lang="ts">
  import CreateLessonModal from './CreateLessonModal.svelte';
  import EditLessonModal from './EditLessonModal.svelte';
  import DeleteLessonModal from './DeleteLessonModal.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import { scale, fade } from 'svelte/transition';
  
  export let selectedCourse;
  
  const dispatch = createEventDispatcher();
  
  let lessons = [];
  let loading = true;
  let error = '';

  let showCreateModal = false;
  let lessonToEdit = null;
  let lessonToDelete = null;

  // Esta función se llama cuando el nuevo modal termina con éxito
  function handleLessonCreated() {
    showCreateModal = false;
    fetchLessons(); 
    dispatch("lessonsUpdated");
  }

  function handleLessonUpdated() {
    lessonToEdit = null; // Cerrar modal
    fetchLessons(); // Recargar lista
    dispatch("lessonsUpdated");
  }

  function handleLessonDeleted() {
    lessonToDelete = null;
    fetchLessons();
    dispatch("lessonsUpdated");
  }

  // Determinar el ID correcto (por si viene como _id o id)
  $: courseId = selectedCourse._id || selectedCourse.id;

  onMount(async () => {
    if (!courseId) return;
    await fetchLessons();
  });

  async function fetchLessons() {
    loading = true;
    error = '';
    try {
      // Asumiendo que tu backend corre en el puerto 5000
      // Endpoint basado en tu ruta: router.get("/:courseId/lessons"...)
      const res = await fetch(`http://localhost:5000/api/lessons/${courseId}/lessons`);
      
      if (!res.ok) throw new Error('Error al cargar lecciones');
      
      lessons = await res.json();
    } catch (err) {
      console.error(err);
      error = 'No se pudieron cargar las lecciones.';
    } finally {
      loading = false;
    }
  }

  // Helper para iconos de contenido (ajusta los tipos según tu schema real)
  function getContentIcon(type) {
    const icons = {
      video: '🎥 Video',
      pdf: '📄 PDF',
      quiz: '❓ Cuestionario',
    };
    return icons[type] || '📦 Material';
  }
</script>

<div class="modal-backdrop" on:click={() => dispatch('close')} transition:fade={{ duration: 200 }}>
  <div class="modal large" on:click|stopPropagation in:scale={{ start: 0.95 }}>
    
    <h3 class="modal-title">
      Lecciones - <span style="color: #4a5568; font-weight:400">{selectedCourse.title || selectedCourse.name}</span>
    </h3>

    <div class="lessons-container">
      {#if loading}
        <div class="state-message">
          <div class="spinner"></div>
          <p>Cargando lecciones...</p>
        </div>
      {:else if error}
        <div class="state-message error">
          <p>{error}</p>
          <button class="btn-outline small" on:click={fetchLessons}>Reintentar</button>
        </div>
      {:else if lessons.length === 0}
        <div class="state-message empty">
          <p>Este curso aún no tiene lecciones.</p>
          <p style="font-size: 0.85rem; color: #a0aec0;">¡Agrega la primera abajo!</p>
        </div>
      {:else}
        <div class="lessons-list">
          {#each lessons as lesson, index (lesson._id)}
            <div class="lesson-item">
              <div class="lesson-header">
                <div class="title-group">
                  <span class="status-indicator" class:completed={lesson.completed}>
                    {lesson.completed ? '✅' : '○'}
                  </span>
                  <h4>Lección {index + 1}: {lesson.title}</h4>
                </div>
                
                <div class="actions">
                  <button class="btn-icon" title="Editar lección" on:click={() => lessonToEdit = lesson}>
                    ✏️
                  </button>
                  <button class="btn-icon delete" title="Eliminar lección" on:click={() => lessonToDelete = lesson}>
                    🗑️
                  </button>
                </div>
              </div>

              {#if lesson.description}<p class="lesson-desc">{lesson.description}</p>{/if}

              {#if lesson.contents && lesson.contents.length > 0}
                <div class="materials">
                  {#each lesson.contents as content}
                    <span class="material-tag">{getContentIcon(content.type)}</span>
                  {/each}
                </div>
              {:else}
                <div class="no-materials">Sin materiales adjuntos</div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div class="form-actions">
      <button class="btn-primary" on:click={() => showCreateModal = true}>
        ➕ Nueva Lección
      </button>
      <button class="btn-secondary" on:click={() => dispatch('close')}>Cerrar</button>
    </div>
  </div>

  {#if showCreateModal}
    <CreateLessonModal 
      {courseId} 
      on:close={() => showCreateModal = false}
      on:created={handleLessonCreated}
    />
  {/if}

  {#if lessonToEdit}
    <EditLessonModal 
      lesson={lessonToEdit}
      on:close={() => lessonToEdit = null}
      on:updated={handleLessonUpdated}
    />
  {/if}

  {#if lessonToDelete}
    <DeleteLessonModal 
      lesson={lessonToDelete}
      on:close={() => lessonToDelete = null}
      on:deleted={handleLessonDeleted}
    />
  {/if}
</div>

<style>
  /* Estilos existentes (sin cambios importantes, solo añadí .delete) */
  
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: #ffffff;
    border-radius: 16px;
    padding: 2rem;
    width: 90%;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
  .modal.large { max-width: 700px; }

  .modal-title {
    font-size: 1.4rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 1.5rem 0;
    text-align: center;
    flex-shrink: 0;
  }

  .lessons-container {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 1.5rem;
    padding-right: 0.5rem;
    min-height: 200px;
  }
  .lessons-container::-webkit-scrollbar { width: 6px; }
  .lessons-container::-webkit-scrollbar-track { background: transparent; }
  .lessons-container::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 3px; }

  .lessons-list { display: flex; flex-direction: column; gap: 1rem; }

  .lesson-item {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: border-color 0.2s;
  }
  .lesson-item:hover { border-color: #cbd5e0; }

  .lesson-header { display: flex; justify-content: space-between; align-items: center; }
  .title-group { display: flex; align-items: center; gap: 0.75rem; }
  
  .status-indicator { font-size: 1.1rem; color: #cbd5e0; cursor: default; }
  .status-indicator.completed { color: #10b981; }

  .lesson-header h4 {
    font-size: 1.05rem;
    font-weight: 600;
    margin: 0;
    color: #2d3748;
  }

  .lesson-desc { font-size: 0.95rem; color: #64748b; line-height: 1.5; margin: 0; }

  .materials { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.25rem; }
  .no-materials { font-size: 0.85rem; color: #a0aec0; font-style: italic; }
  .material-tag {
    background: white;
    padding: 0.3rem 0.6rem;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 500;
    border: 1px solid #e2e8f0;
    color: #475569;
    display: inline-flex;
    align-items: center;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.7rem 1.4rem;
    border-radius: 0.6rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  .btn-primary:hover { background: #2563eb; }

  .btn-secondary {
    background: #f1f5f9;
    color: #475569;
    border: none;
    padding: 0.7rem 1.4rem;
    border-radius: 0.6rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  .btn-secondary:hover { background: #e2e8f0; }

  .btn-outline {
    background: transparent;
    color: #3b82f6;
    border: 1px solid #3b82f6;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-outline.small { padding: 0.35rem 0.85rem; font-size: 0.8rem; }

  .btn-icon {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.1rem;
    padding: 6px;
    border-radius: 6px;
    opacity: 0.6;
    transition: all 0.2s;
  }
  .btn-icon:hover { opacity: 1; background: #f1f5f9; }
  
  /* Estilo específico para el botón de borrar */
  .btn-icon.delete:hover {
    background: #fee2e2;
    color: #dc2626;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #f1f5f9;
    flex-shrink: 0;
  }

  .state-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #64748b;
    gap: 1rem;
    padding: 2rem 0;
  }
  .state-message.error { color: #ef4444; }
  
  .spinner {
    width: 30px;
    height: 30px;
    border: 3px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>