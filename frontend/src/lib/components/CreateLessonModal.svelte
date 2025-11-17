<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { scale, fade } from 'svelte/transition';

  export let courseId: string;

  const dispatch = createEventDispatcher();

  let title = '';
  let description = '';
  let loading = false;
  let error = '';
  
  // Gestión de contenidos dinámicos
  let contents: Array<{ type: string; data: string }> = [];

  function addContent() {
    contents = [...contents, { type: 'text', data: '' }];
  }

  function removeContent(index: number) {
    contents = contents.filter((_, i) => i !== index);
  }

  async function handleSubmit() {
    if (!title.trim()) {
      error = 'El título es obligatorio';
      return;
    }

    loading = true;
    error = '';

    try {
      const res = await fetch('http://localhost:5000/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          title,
          description,
          contents // Enviamos el array de contenidos
        })
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Error al crear la lección');
      }

      const newLesson = await res.json();
      dispatch('created', newLesson); // Avisamos al padre que se creó éxito
      dispatch('close');
      
    } catch (err: any) {
      console.error(err);
      error = err.message || 'Ocurrió un error inesperado';
    } finally {
      loading = false;
    }
  }
</script>

<div class="modal-backdrop" on:click={() => dispatch('close')} transition:fade={{ duration: 200 }}>
  <div class="modal" on:click|stopPropagation in:scale={{ start: 0.95 }}>
    
    <h3 class="modal-title">Nueva Lección</h3>

    {#if error}
      <div class="alert-error">{error}</div>
    {/if}

    <form on:submit|preventDefault={handleSubmit} class="lesson-form">
      <div class="form-group">
        <label for="title">Título de la lección</label>
        <input 
          id="title" 
          type="text" 
          bind:value={title} 
          placeholder="Ej. Introducción a React" 
          required
        />
      </div>

      <div class="form-group">
        <label for="desc">Descripción (Opcional)</label>
        <textarea 
          id="desc" 
          rows="3" 
          bind:value={description} 
          placeholder="Resumen de lo que aprenderán..."
        ></textarea>
      </div>

      <div class="contents-section">
        <div class="section-header">
          <label>Materiales / Contenido</label>
          <button type="button" class="btn-outline small" on:click={addContent}>
            + Agregar Material
          </button>
        </div>

        {#if contents.length === 0}
          <div class="empty-contents">Sin materiales agregados</div>
        {:else}
          <div class="contents-list">
            {#each contents as content, i}
              <div class="content-row" transition:scale|local>
                <select bind:value={content.type}>
                  <option value="text">📝 Texto</option>
                  <option value="video">🎥 Video (URL)</option>
                  <option value="pdf">📄 PDF (URL)</option>
                  <option value="quiz">❓ Cuestionario</option>
                </select>
                
                <input 
                  type="text" 
                  bind:value={content.data} 
                  placeholder={content.type === 'text' ? 'Contenido de texto...' : 'https://...'}
                  required
                />
                
                <button type="button" class="btn-icon delete" on:click={() => removeContent(i)} title="Eliminar">
                  ✕
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" on:click={() => dispatch('close')}>
          Cancelar
        </button>
        <button type="submit" class="btn-primary" disabled={loading}>
          {#if loading}Guardando...{:else}Crear Lección{/if}
        </button>
      </div>
    </form>

  </div>
</div>

<style>
  /* Reutilizamos estilos base para consistencia */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100; /* Un poco más alto que el listado por si se solapan */
  }

  .modal {
    background: #ffffff;
    border-radius: 16px;
    padding: 2rem;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .modal-title {
    font-size: 1.4rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
    text-align: center;
  }

  .lesson-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #4b5563;
  }

  input, textarea, select {
    width: 100%;
    padding: 0.7rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.95rem;
    background: #fff;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  /* Sección de Contenidos */
  .contents-section {
    border-top: 1px solid #f3f4f6;
    padding-top: 1rem;
    margin-top: 0.5rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.8rem;
  }

  .empty-contents {
    font-size: 0.85rem;
    color: #9ca3af;
    font-style: italic;
    text-align: center;
    padding: 0.5rem;
    background: #f9fafb;
    border-radius: 6px;
  }

  .contents-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
  }

  .content-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .content-row select {
    width: 35%;
    flex-shrink: 0;
  }

  .content-row input {
    flex-grow: 1;
  }

  .btn-icon.delete {
    background: none;
    border: none;
    color: #ef4444;
    font-weight: bold;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
  }
  .btn-icon.delete:hover {
    background: #fee2e2;
  }

  /* Botones Generales */
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.7rem 1.2rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-primary:hover { background: #2563eb; }
  .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

  .btn-secondary {
    background: #e5e7eb;
    color: #374151;
    border: none;
    padding: 0.7rem 1.2rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-secondary:hover { background: #d1d5db; }

  .btn-outline.small {
    background: transparent;
    color: #3b82f6;
    border: 1px solid #3b82f6;
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-outline.small:hover { background: #eff6ff; }

  /* Alerta de error */
  .alert-error {
    background: #fee2e2;
    color: #b91c1c;
    padding: 0.75rem;
    border-radius: 8px;
    font-size: 0.9rem;
    border: 1px solid #fecaca;
  }
</style>