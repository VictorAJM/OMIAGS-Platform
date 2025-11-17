<script lang="ts">
  export let course;
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  let showModal = false;

  function confirmDelete() {
    showModal = false;
    dispatch('deleteCourse');
  }
</script>

<div class="course-card">
  <div class="course-header" style="background-color: {course.color}20; border-left: 4px solid {course.color}">
    <div class="course-icon">{course.image}</div>
    <div class="course-actions">
      <button class="btn-icon" title="Editar">✏️</button>
      <button class="btn-icon" title="Eliminar" on:click={() => showModal = true}>🗑️</button>
    </div>
  </div>

  <div class="course-content">
    <h3>{course.name}</h3>
    <p>{course.description}</p>
    <div class="course-meta">
      <span class="badge {course.level}">{course.level}</span>
      <div class="stats">
        <span>👥 {course.students} estudiantes</span>
        <span>📚 {course.lessons} lecciones</span>
      </div>
    </div>
  </div>

  <div class="course-footer">
    <button class="btn-outline" on:click={() => dispatch('openLessons')}>Gestionar Lecciones</button>
  </div>
</div>

{#if showModal}
  <div class="modal-backdrop">
    <div class="modal">
      <h2>¿Eliminar curso?</h2>
      <p>Esta acción no se puede deshacer. ¿Seguro que quieres eliminar <strong>{course.name}</strong>?</p>

      <div class="modal-actions">
        <button class="cancel" on:click={() => showModal = false}>Cancelar</button>
        <button class="delete" on:click={confirmDelete}>Eliminar</button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* --- EXISTENTE --- */
  .course-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .course-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  }

  .course-header {
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .course-icon {
    font-size: 2rem;
  }

  .course-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-icon {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: background 0.2s ease;
  }

  .btn-icon:hover {
    background: rgba(0,0,0,0.1);
  }

  .course-content {
    padding: 1.5rem;
  }

  .course-content h3 {
    margin: 0 0 0.5rem 0;
    color: #2d3748;
  }

  .course-content p {
    margin: 0 0 1rem 0;
    color: #718096;
    line-height: 1.5;
  }

  .course-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stats {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
    color: #718096;
  }

  .badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .badge.secundaria {
    background: #e6fffa;
    color: #234e52;
  }

  .badge.preparatoria {
    background: #ebf8ff;
    color: #1a365d;
  }

  .course-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #e2e8f0;
  }

  .btn-outline {
    background: transparent;
    color: #3182ce;
    border: 1px solid #3182ce;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-outline:hover {
    background: #3182ce;
    color: white;
  }

  /* --- MODAL --- */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 50;
  }

  .modal {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    width: 95%;
    max-width: 380px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  }

  .modal h2 {
    margin-top: 0;
    font-size: 1.4rem;
    color: #2d3748;
  }

  .modal p {
    color: #4a5568;
    margin: 1rem 0;
  }

  .modal-actions {
    margin-top: 1.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .cancel {
    background: #e2e8f0;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
  }

  .cancel:hover {
    background: #cbd5e0;
  }

  .delete {
    background: #e53e3e;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
  }

  .delete:hover {
    background: #c53030;
  }
</style>
