<script lang="ts">
  export let course;
  import { createEventDispatcher } from 'svelte';
  import EditCourseModal from './EditCourseModal.svelte';

  const dispatch = createEventDispatcher();

  let showDeleteModal = false;
  let showEditModal = false;

  const categoryColors = {
    'Secundaria': '#38b2ac', // Teal
    'Preparatoria': '#5a67d8', // Indigo
    'default': '#718096'
  };

  $: currentColor = categoryColors[course.category] || categoryColors['default'];
  $: categoryClass = course.category ? course.category.toLowerCase() : 'default';

  function confirmDelete() {
    showDeleteModal = false;
    dispatch('deleteCourse');
  }

  function onCourseUpdated(event) {
    const updated = event.detail;
    course.title = updated.title;
    course.description = updated.description;
    course.category = updated.category;
    course.students = updated.students;
    dispatch('refresh');
  }
</script>

<div class="course-card">
  <div class="card-accent" style="background-color: {currentColor}"></div>

  <div class="course-header" style="background-color: {currentColor}10;">
    <div class="icon-wrapper">
      <span class="course-icon">
        {#if course.category === 'Secundaria'}
          🎒
        {:else if course.category === 'Preparatoria'}
          🎓
        {:else}
          📚
        {/if}
      </span>
    </div>
    
    <div class="course-actions">
      <button class="btn-action edit" title="Editar" on:click={() => showEditModal = true}>
        ✏️
      </button>
      <button class="btn-action delete" title="Eliminar" on:click={() => showDeleteModal = true}>
        🗑️
      </button>
    </div>
  </div>

  <div class="course-content">
    <div class="title-section">
      <h3>{course.title}</h3>
      <span class="badge {categoryClass}">{course.category}</span>
    </div>
    
    <p class="description">{course.description}</p>
    
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-icon">👥</span>
        <span class="stat-value">{(course.studentsCount || 0)}</span>
        <span class="stat-label">Estudiantes</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-icon">📑</span>
        <span class="stat-value">{course.lessons || 0}</span>
        <span class="stat-label">Lecciones</span>
      </div>
    </div>
  </div>

  <div class="course-footer">
    <button 
      class="btn-primary" 
      style="--btn-color: {currentColor}" 
      on:click={() => dispatch('openLessons')}
    >
      Gestionar Lecciones
      <span class="arrow">→</span>
    </button>
  </div>
</div>

{#if showDeleteModal}
  <div class="modal-backdrop">
    <div class="modal delete-modal">
      <div class="modal-icon warning">⚠️</div>
      <h2>¿Eliminar curso?</h2>
      <p>Esta acción eliminará <strong>{course.title}</strong> y todo su contenido. No se puede deshacer.</p>
      <div class="modal-actions">
        <button class="btn-cancel" on:click={() => showDeleteModal = false}>Cancelar</button>
        <button class="btn-delete" on:click={confirmDelete}>Sí, Eliminar</button>
      </div>
    </div>
  </div>
{/if}

{#if showEditModal}
  <EditCourseModal 
    {course} 
    on:close={() => showEditModal = false}
    on:updated={onCourseUpdated}
  />
{/if}

<style>
  /* --- Card Structure --- */
  .course-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    height: 100%;
    border: 1px solid #edf2f7;
    position: relative;
  }

  .course-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .card-accent {
    height: 4px;
    width: 100%;
  }

  /* --- Header --- */
  .course-header {
    padding: 1.25rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid rgba(0,0,0,0.03);
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
    background: white;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    font-size: 1.5rem;
  }

  .course-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-action {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    opacity: 0.7;
  }

  .btn-action:hover {
    opacity: 1;
    transform: scale(1.1);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }

  .btn-action.delete:hover { background: #fff5f5; color: #c53030; }
  .btn-action.edit:hover { background: #ebf8ff; color: #2b6cb0; }

  /* --- Content --- */
  .course-content {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .title-section {
    margin-bottom: 0.75rem;
  }

  .course-content h3 {
    margin: 0 0 0.5rem 0;
    color: #1a202c;
    font-size: 1.15rem;
    font-weight: 700;
    line-height: 1.3;
  }

  .description {
    margin: 0 0 1.5rem 0;
    color: #718096;
    font-size: 0.925rem;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* Limit to 2 lines */
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
  }

  .badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }
  
  .badge.secundaria { background: #e6fffa; color: #234e52; border: 1px solid #b2f5ea; }
  .badge.preparatoria { background: #ebf8ff; color: #2b6cb0; border: 1px solid #bee3f8; }
  .badge.default { background: #f7fafc; color: #4a5568; }

  /* --- Stats --- */
  .stats-grid {
    display: flex;
    align-items: center;
    background: #f7fafc;
    border-radius: 8px;
    padding: 0.75rem;
    border: 1px solid #edf2f7;
  }

  .stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1rem;
  }

  .stat-divider {
    width: 1px;
    height: 24px;
    background: #e2e8f0;
  }

  .stat-value { font-weight: 700; color: #2d3748; font-size: 1.1rem; }
  .stat-label { font-size: 0.7rem; color: #718096; text-transform: uppercase; letter-spacing: 0.05em; }

  /* --- Footer --- */
  .course-footer {
    padding: 1.25rem 1.5rem;
    border-top: 1px solid #f7fafc;
    background: #ffffff;
  }

  .btn-primary {
    width: 100%;
    background: white;
    color: var(--btn-color);
    border: 1px solid var(--btn-color);
    padding: 0.75rem 1rem;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
  }

  .btn-primary:hover {
    background: var(--btn-color);
    color: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transform: translateY(-1px);
  }

  .btn-primary .arrow { transition: transform 0.2s; }
  .btn-primary:hover .arrow { transform: translateX(4px); }

  /* --- Modals --- */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(26, 32, 44, 0.6);
    backdrop-filter: blur(2px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    animation: fadeIn 0.2s ease-out;
  }

  .modal {
    background: white;
    padding: 2rem;
    border-radius: 16px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    text-align: center;
  }

  .modal-icon.warning {
    font-size: 2rem;
    background: #fff5f5;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem auto;
  }

  .modal h2 { margin: 0 0 0.5rem 0; color: #1a202c; font-size: 1.25rem; }
  .modal p { color: #718096; margin-bottom: 1.5rem; line-height: 1.5; }

  .modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  
  .btn-cancel { 
    background: white; 
    border: 1px solid #e2e8f0; 
    color: #4a5568; 
    padding: 0.75rem; 
    border-radius: 8px; 
    font-weight: 600; 
    cursor: pointer;
  }
  .btn-cancel:hover { background: #f7fafc; }

  .btn-delete { 
    background: #e53e3e; 
    border: none; 
    color: white; 
    padding: 0.75rem; 
    border-radius: 8px; 
    font-weight: 600; 
    cursor: pointer; 
    box-shadow: 0 4px 6px -1px rgba(229, 62, 62, 0.3);
  }
  .btn-delete:hover { background: #c53030; }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>