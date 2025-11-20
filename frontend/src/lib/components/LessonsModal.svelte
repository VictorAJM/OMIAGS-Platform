<script lang="ts">
  import CreateLessonModal from "./CreateLessonModal.svelte";
  import EditLessonModal from "./EditLessonModal.svelte";
  import DeleteLessonModal from "./DeleteLessonModal.svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import { scale, fade } from "svelte/transition";

  export let selectedCourse: any;

  const dispatch = createEventDispatcher();

  let lessons: any[] = [];
  let loading = true;
  let error = "";

  let showCreateModal = false;
  let lessonToEdit: any = null;
  let lessonToDelete: any = null;

  function handleLessonCreated() {
    showCreateModal = false;
    fetchLessons();
    dispatch("lessonsUpdated");
  }

  function handleLessonUpdated() {
    lessonToEdit = null;
    fetchLessons();
    dispatch("lessonsUpdated");
  }

  function handleLessonDeleted() {
    lessonToDelete = null;
    fetchLessons();
    dispatch("lessonsUpdated");
  }

  $: courseId = selectedCourse._id || selectedCourse.id;

  onMount(async () => {
    if (!courseId) return;
    await fetchLessons();
  });

  async function fetchLessons() {
    loading = true;
    error = "";
    try {
      const res = await fetch(
        `http://localhost:5000/api/lessons/${courseId}/lessons`,
      );

      if (!res.ok) throw new Error("Error al cargar lecciones");

      lessons = await res.json();
    } catch (err) {
      console.error(err);
      error = "No se pudieron cargar las lecciones.";
    } finally {
      loading = false;
    }
  }

  function getContentIcon(type: string) {
    const icons: any = {
      video: "🎥 Video",
      pdf: "📄 PDF",
      quiz: "❓ Quiz",
      text: "📝 Texto"
    };
    return icons[type] || "📦 Material";
  }
</script>

<div
  class="modal-backdrop"
  on:click={() => dispatch("close")}
  transition:fade={{ duration: 200 }}
>
  <div class="modal" on:click|stopPropagation in:scale={{ start: 0.96, duration: 200 }}>
    
    <div class="modal-header">
      <div class="header-content">
        <h3 class="modal-title">Lecciones del Curso</h3>
        <p class="modal-subtitle">{selectedCourse.title || selectedCourse.name}</p>
      </div>
      <button type="button" class="btn-close" on:click={() => dispatch("close")}>✕</button>
    </div>

    <div class="modal-body-scroll">
      {#if loading}
        <div class="state-message">
          <div class="spinner"></div>
          <p>Cargando contenido...</p>
        </div>

      {:else if error}
        <div class="state-message error">
          <div class="error-icon">⚠️</div>
          <p>{error}</p>
          <button class="btn-outline small" on:click={fetchLessons}>Reintentar</button>
        </div>

      {:else if lessons.length === 0}
        <div class="state-message empty">
          <div class="empty-icon">📚</div>
          <h3>Sin lecciones aún</h3>
          <p>Comienza agregando la primera lección para tus alumnos.</p>
          <button class="btn-link" on:click={() => (showCreateModal = true)}>
            Crear primera lección
          </button>
        </div>

      {:else}
        <div class="lessons-list">
          {#each lessons as lesson, index (lesson._id)}
            <div class="lesson-card" transition:scale|local={{duration: 200}}>
              
              <div class="card-main">
                <div class="lesson-info-header">
                  <div class="index-badge">#{index + 1}</div>
                  <h4 class="lesson-title">{lesson.title}</h4>
                  {#if lesson.completed}
                     <span class="status-badge">Completado</span>
                  {/if}
                </div>

                {#if lesson.description}
                  <p class="lesson-desc">{lesson.description}</p>
                {/if}

                <div class="materials-row">
                  {#if lesson.contents && lesson.contents.length > 0}
                    {#each lesson.contents as content}
                      <span class="material-tag {content.type}">
                        {getContentIcon(content.type)}
                      </span>
                    {/each}
                  {:else}
                    <span class="no-materials">Sin contenido adjunto</span>
                  {/if}
                </div>
              </div>

              <div class="card-actions">
                <button
                  class="btn-icon edit"
                  title="Editar lección"
                  on:click={() => (lessonToEdit = lesson)}
                >
                  ✏️
                </button>
                <button
                  class="btn-icon delete"
                  title="Eliminar lección"
                  on:click={() => (lessonToDelete = lesson)}
                >
                  🗑️
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div class="modal-footer">
      <button class="btn-ghost" on:click={() => dispatch("close")}>Cerrar</button>
      <button class="btn-primary" on:click={() => (showCreateModal = true)}>
        <span class="icon">➕</span> Nueva Lección
      </button>
    </div>
  </div>
</div>

{#if showCreateModal}
  <CreateLessonModal
    {courseId}
    on:close={() => (showCreateModal = false)}
    on:created={handleLessonCreated}
  />
{/if}

{#if lessonToEdit}
  <EditLessonModal
    lesson={lessonToEdit}
    {courseId}
    on:close={() => (lessonToEdit = null)}
    on:updated={handleLessonUpdated}
  />
{/if}

{#if lessonToDelete}
  <DeleteLessonModal
    lesson={lessonToDelete}
    on:close={() => (lessonToDelete = null)}
    on:deleted={handleLessonDeleted}
  />
{/if}

<style>
  /* --- Layout & Backdrop --- */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal {
    background: #ffffff;
    border-radius: 16px;
    width: 100%;
    max-width: 750px; /* Slightly wider for the list */
    height: 85vh;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* --- Header --- */
  .modal-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    background: #fff;
  }
  .header-content { display: flex; flex-direction: column; gap: 0.25rem; }
  .modal-title { font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0; }
  .modal-subtitle { font-size: 0.9rem; color: #64748b; margin: 0; font-weight: 500; }

  .btn-close {
    background: transparent; border: none; color: #94a3b8; font-size: 1.25rem;
    cursor: pointer; padding: 0.25rem; border-radius: 6px; line-height: 1; transition: all 0.2s;
  }
  .btn-close:hover { background: #f1f5f9; color: #475569; }

  /* --- Scrollable Body --- */
  .modal-body-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    background: #f8fafc; /* Light gray bg */
  }
  .modal-body-scroll::-webkit-scrollbar { width: 6px; }
  .modal-body-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

  /* --- States (Loading, Error, Empty) --- */
  .state-message {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 100%; text-align: center; color: #64748b; gap: 1rem; padding: 2rem;
  }
  .state-message.error { color: #b91c1c; }
  .error-icon { font-size: 2rem; background: #fee2e2; padding: 1rem; border-radius: 50%; }
  
  .state-message.empty h3 { margin: 0; color: #1e293b; font-weight: 600; }
  .empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; opacity: 0.7; }
  
  .btn-link {
    background: none; border: none; color: #3b82f6; text-decoration: underline;
    cursor: pointer; font-weight: 600; font-size: 0.95rem;
  }

  .spinner {
    width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #3b82f6;
    border-radius: 50%; animation: spin 1s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* --- Lesson Cards --- */
  .lessons-list {
    display: flex; flex-direction: column; gap: 1rem;
  }

  .lesson-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 0; /* Padding handled by children */
    display: flex;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  .lesson-card:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
    border-color: #cbd5e1;
  }

  .card-main {
    flex: 1;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .lesson-info-header {
    display: flex; align-items: center; gap: 0.75rem;
  }
  .index-badge {
    background: #eff6ff; color: #3b82f6; font-size: 0.75rem; font-weight: 700;
    padding: 0.25rem 0.5rem; border-radius: 6px;
  }
  .lesson-title {
    font-size: 1.05rem; font-weight: 600; color: #1e293b; margin: 0; flex: 1;
  }
  .status-badge {
    font-size: 0.75rem; background: #dcfce7; color: #166534;
    padding: 2px 8px; border-radius: 12px; font-weight: 600;
  }

  .lesson-desc {
    font-size: 0.925rem; color: #64748b; margin: 0; line-height: 1.5;
  }

  /* Materials Tags */
  .materials-row {
    display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.25rem;
  }
  .material-tag {
    background: #f1f5f9; padding: 0.25rem 0.6rem; border-radius: 6px;
    font-size: 0.75rem; font-weight: 600; border: 1px solid #e2e8f0; color: #475569;
    display: inline-flex; align-items: center;
  }
  /* Optional subtle coloring per type */
  .material-tag.video { color: #991b1b; background: #fef2f2; border-color: #fecaca; }
  .material-tag.pdf { color: #854d0e; background: #fefce8; border-color: #fde047; }
  .material-tag.quiz { color: #065f46; background: #ecfdf5; border-color: #a7f3d0; }

  .no-materials {
    font-size: 0.8rem; color: #94a3b8; font-style: italic;
  }

  /* Card Side Actions */
  .card-actions {
    border-left: 1px solid #f1f5f9;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: #f8fafc;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
  }

  .btn-icon {
    background: #ffffff; border: 1px solid #e2e8f0; cursor: pointer; font-size: 1.1rem;
    padding: 0.5rem; border-radius: 8px; transition: all 0.2s; color: #64748b;
    display: flex; align-items: center; justify-content: center;
  }
  .btn-icon.edit:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
  .btn-icon.delete:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

  /* --- Footer --- */
  .modal-footer {
    padding: 1.25rem 1.5rem; border-top: 1px solid #e2e8f0; background: #fff;
    display: flex; justify-content: flex-end; gap: 0.75rem;
  }

  .btn-ghost {
    background: transparent; color: #64748b; border: 1px solid transparent; padding: 0.6rem 1.25rem;
    border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;
  }
  .btn-ghost:hover { background: #f1f5f9; color: #1e293b; }

  .btn-primary {
    background: #2563eb; color: white; border: none; padding: 0.6rem 1.25rem; border-radius: 8px;
    font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
    display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s;
  }
  .btn-primary:hover { background: #1d4ed8; }
  
  .btn-outline.small {
    background: white; border: 1px solid #cbd5e1; color: #475569;
    padding: 0.4rem 0.8rem; font-size: 0.85rem; border-radius: 6px; cursor: pointer;
  }
  .btn-outline.small:hover { border-color: #94a3b8; background: #f8fafc; }
</style>