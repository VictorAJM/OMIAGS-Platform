<script>
  import { createEventDispatcher } from 'svelte';
  import { scale } from 'svelte/transition';

  const dispatch = createEventDispatcher();
</script>

<div class="modal-backdrop" on:click={() => dispatch('close')}>
  <div class="modal" on:click|stopPropagation in:scale>
    <h3 class="modal-title">Crear Nuevo Curso</h3>

    <form class="form">
      <div class="form-group">
        <label>Nombre del curso</label>
        <input type="text" placeholder="Ej: Matemáticas Básicas" />
      </div>

      <div class="form-group">
        <label>Descripción</label>
        <textarea placeholder="Describe el contenido del curso..." rows="3"></textarea>
      </div>

      <div class="form-group">
        <label>Nivel</label>
        <select>
          <option value="secundaria">Secundaria</option>
          <option value="preparatoria">Preparatoria</option>
        </select>
      </div>

      <div class="form-actions">
        <button
          type="button"
          class="btn-secondary"
          on:click={() => dispatch('close')}
        >
          Cancelar
        </button>
        <button type="submit" class="btn-primary">Crear Curso</button>
      </div>
    </form>
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

  /* Modal container */
  .modal {
    background: #ffffff;
    border-radius: 16px;
    padding: 2rem;
    width: 90%;
    max-width: 480px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    animation: fadeIn 0.25s ease;
  }

  .modal-title {
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: #1f2937;
    text-align: center;
  }

  /* Form layout */
  .form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  label {
    font-size: 0.9rem;
    color: #374151;
    font-weight: 500;
  }

  input,
  textarea,
  select {
    padding: 0.75rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    font-size: 0.95rem;
    color: #111827;
    background: #f9fafb;
    transition: all 0.2s ease;
  }

  input:focus,
  textarea:focus,
  select:focus {
    border-color: #3182ce;
    background: white;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
    outline: none;
  }

  textarea {
    resize: none;
  }

  /* Actions */
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
  }

  .btn-primary {
    background: #3182ce;
    color: white;
    border: none;
    padding: 0.7rem 1.4rem;
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
    padding: 0.7rem 1.4rem;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .btn-secondary:hover {
    background: #d1d5db;
  }

  /* Animation */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(15px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
