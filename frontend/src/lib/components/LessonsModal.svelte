<script>
  import { createEventDispatcher } from 'svelte';
  import { scale } from 'svelte/transition';
  export let selectedCourse;
  const dispatch = createEventDispatcher();
</script>

<div class="modal-backdrop" on:click={() => dispatch('close')}>
  <div class="modal large" on:click|stopPropagation in:scale>
    <h3 class="modal-title">Lecciones - {selectedCourse.name}</h3>

    <div class="lessons-list">
      {#each [1, 2, 3] as lesson}
        <div class="lesson-item">
          <div class="lesson-header">
            <h4>Lección {lesson}: Título de la lección</h4>
            <button class="btn-icon">✏️</button>
          </div>
          <p class="lesson-desc">
            Descripción de la lección y sus objetivos de aprendizaje.
          </p>
          <div class="materials">
            <span class="material-tag">🎥 Video</span>
            <span class="material-tag">📄 PDF</span>
            <span class="material-tag">❓ Cuestionario</span>
          </div>
          <button class="btn-outline small">➕ Agregar Material</button>
        </div>
      {/each}
    </div>

    <div class="form-actions">
      <button class="btn-primary">➕ Nueva Lección</button>
      <button class="btn-secondary" on:click={() => dispatch('close')}>Cerrar</button>
    </div>
  </div>
</div>

<style>
  /* Backdrop */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  /* Modal */
  .modal {
    background: #ffffff;
    border-radius: 16px;
    padding: 2rem;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  .modal.large {
    max-width: 700px;
  }

  .modal-title {
    font-size: 1.4rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  /* Lessons List */
  .lessons-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 1.5rem;
    padding-right: 0.25rem;
  }

  .lessons-list::-webkit-scrollbar {
    width: 6px;
  }

  .lessons-list::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
  }

  .lesson-item {
    background: #f7fafc;
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .lesson-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .lesson-header h4 {
    font-size: 1rem;
    font-weight: 500;
    margin: 0;
    color: #2d3748;
  }

  .lesson-desc {
    font-size: 0.9rem;
    color: #4a5568;
    line-height: 1.4;
  }

  .materials {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .material-tag {
    background: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.8rem;
    border: 1px solid #e2e8f0;
    color: #374151;
  }

  /* Buttons */
  .btn-primary {
    background: #3182ce;
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .btn-primary:hover {
    background: #2563eb;
  }

  .btn-secondary {
    background: #e5e7eb;
    color: #374151;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .btn-secondary:hover {
    background: #cbd5e0;
  }

  .btn-outline {
    background: transparent;
    color: #3182ce;
    border: 1px solid #3182ce;
    padding: 0.4rem 0.8rem;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-outline:hover {
    background: #3182ce;
    color: white;
  }

  .btn-outline.small {
    padding: 0.25rem 0.75rem;
    font-size: 0.8rem;
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
    background: rgba(0, 0, 0, 0.1);
  }

  /* Form actions */
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
</style>
