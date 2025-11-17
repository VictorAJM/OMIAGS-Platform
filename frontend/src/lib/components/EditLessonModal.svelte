<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { scale, fade } from 'svelte/transition';

  // Recibimos la lección completa para editar
  export let lesson: any;

  const dispatch = createEventDispatcher();

  // Inicializamos los valores con los datos de la lección
  // Usamos JSON.parse/stringify para hacer una copia profunda de contents y no mutar el prop original
  let title = lesson.title;
  let description = lesson.description || '';
  let contents = lesson.contents ? JSON.parse(JSON.stringify(lesson.contents)) : [];
  
  let loading = false;
  let error = '';

  function addContent() {
    contents = [...contents, { type: 'text', data: '' }];
  }

  function removeContent(index: number) {
    contents = contents.filter((_, i) => i !== index);
  }

  async function handleUpdate() {
    if (!title.trim()) {
      error = 'El título es obligatorio';
      return;
    }

    loading = true;
    error = '';

    try {
      // Endpoint PUT definido en tu API anterior: /api/lessons/:id
      const res = await fetch(`http://localhost:5000/api/lessons/${lesson._id || lesson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          contents
        })
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Error al actualizar la lección');
      }

      const updatedLesson = await res.json();
      
      dispatch('updated', updatedLesson); // Avisamos al padre para refrescar
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
    
    <h3 class="modal-title">Editar Lección</h3>

    {#if error}
      <div class="alert-error">{error}</div>
    {/if}

    <form on:submit|preventDefault={handleUpdate} class="lesson-form">
      <div class="form-group">
        <label for="title">Título</label>
        <input 
          id="title" 
          type="text" 
          bind:value={title} 
          required
        />
      </div>

      <div class="form-group">
        <label for="desc">Descripción</label>
        <textarea 
          id="desc" 
          rows="3" 
          bind:value={description}
        ></textarea>
      </div>

      <div class="contents-section">
        <div class="section-header">
          <label>Materiales</label>
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
                  <option value="video">🎥 Video</option>
                  <option value="pdf">📄 PDF</option>
                  <option value="quiz">❓ Quiz</option>
                </select>
                
                <input 
                  type="text" 
                  bind:value={content.data} 
                  placeholder="Contenido o URL..."
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
          {#if loading}Guardando...{:else}Guardar Cambios{/if}
        </button>
      </div>
    </form>

  </div>
</div>

<style>
  /* Estilos copiados para consistencia visual */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
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
  }

  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .contents-section {
    border-top: 1px solid #f3f4f6;
    padding-top: 1rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.8rem;
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

  .content-row select { width: 35%; flex-shrink: 0; }
  .content-row input { flex-grow: 1; }

  .btn-icon.delete {
    background: none;
    border: none;
    color: #ef4444;
    font-weight: bold;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
  }
  .btn-icon.delete:hover { background: #fee2e2; }

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

  .alert-error {
    background: #fee2e2;
    color: #b91c1c;
    padding: 0.75rem;
    border-radius: 8px;
    font-size: 0.9rem;
    border: 1px solid #fecaca;
  }
</style>