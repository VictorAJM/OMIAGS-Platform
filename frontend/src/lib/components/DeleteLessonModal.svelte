<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { scale, fade } from 'svelte/transition';

  export let lesson: any;

  const dispatch = createEventDispatcher();
  let loading = false;
  let error = '';

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  async function handleDelete() {
    loading = true;
    error = '';

    try {
      // Endpoint DELETE /api/lessons/:id
      const res = await fetch(`${API_BASE}/api/lessons/${lesson._id || lesson.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Error al eliminar');
      }

      dispatch('deleted'); // Éxito
      dispatch('close');
      dispatch("lessonsUpdated");
      
    } catch (err: any) {
      console.error(err);
      error = err.message || 'Error inesperado';
    } finally {
      loading = false;
    }
  }
</script>

<div class="modal-backdrop" on:click={() => dispatch('close')} transition:fade={{ duration: 200 }}>
  <div class="modal" on:click|stopPropagation in:scale={{ start: 0.95 }}>
    
    <h3 class="modal-title">¿Eliminar lección?</h3>

    <div class="content">
      <p>Estás a punto de eliminar la lección: <br><strong>{lesson.title}</strong>.</p>
      <p class="warning">Esta acción no se puede deshacer.</p>
    
      {#if error}
        <div class="alert-error">{error}</div>
      {/if}
    </div>

    <div class="form-actions">
      <button class="btn-secondary" on:click={() => dispatch('close')} disabled={loading}>
        Cancelar
      </button>
      <button class="btn-danger" on:click={handleDelete} disabled={loading}>
        {#if loading}Eliminando...{:else}Eliminar{/if}
      </button>
    </div>

  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1200; /* Mayor que los otros modales */
  }

  .modal {
    background: #ffffff;
    border-radius: 16px;
    padding: 2rem;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    text-align: center;
  }

  .modal-title {
    margin: 0 0 1rem 0;
    color: #1f2937;
    font-size: 1.3rem;
  }

  .content {
    margin-bottom: 1.5rem;
    color: #4b5563;
    line-height: 1.5;
  }

  .warning {
    font-size: 0.9rem;
    color: #dc2626;
    margin-top: 0.5rem;
    font-weight: 500;
  }

  .form-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .btn-secondary {
    background: #e5e7eb;
    color: #374151;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-danger {
    background: #dc2626;
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-danger:hover { background: #b91c1c; }
  .btn-danger:disabled { opacity: 0.7; cursor: not-allowed; }

  .alert-error {
    background: #fee2e2;
    color: #b91c1c;
    padding: 0.5rem;
    border-radius: 6px;
    font-size: 0.85rem;
    margin-top: 1rem;
  }
</style>