<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { scale, fade } from 'svelte/transition';
  import FileDropZone from './FileDropZone.svelte';

  export let lesson: any;

  const dispatch = createEventDispatcher();

  interface ContentFormItem {
    _id?: string;
    type: 'video' | 'pdf' | 'text' | 'quiz';
    title: string;
    url?: string;
    textContent?: string;
    quizId?: string;
  }

  let title = lesson.title;
  let description = lesson.description || '';
  let loading = false;
  let error = '';
  
  let uploadingIndex: number | null = null;

  let contents: ContentFormItem[] = (lesson.contents || []).map((c: any) => ({
    _id: c._id,
    type: c.type,
    title: c.title || '',
    url: c.url || '',
    textContent: c.textContent || '',
    quizId: c.quizId || ''
  }));

  function addContent() {
    contents = [...contents, { type: 'text', title: '', textContent: '', url: '', quizId: '' }];
  }

  function removeContent(index: number) {
    contents = contents.filter((_, i) => i !== index);
  }

  async function handleFileUpload(file: File, index: number) {
    uploadingIndex = index;
    error = '';

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      
      contents[index].url = data.url;
      contents[index].title = contents[index].title || file.name;

    } catch (err: any) {
      console.error(err);
      error = 'Error al subir el archivo. Intente nuevamente.';
    } finally {
      uploadingIndex = null;
    }
  }

  function removeFile(index: number) {
    contents[index].url = '';
  }

  async function handleUpdate() {
    if (!title.trim()) {
      error = 'El título de la lección es obligatorio';
      return;
    }

    for (const c of contents) {
      if (!c.title.trim()) {
        error = 'Todos los materiales deben tener un título.';
        return;
      }
      if ((c.type === 'pdf' || c.type === 'video') && !c.url) {
        error = `El material "${c.title}" requiere un archivo o URL.`;
        return;
      }
    }

    loading = true;
    error = '';

    try {
      const formattedContents = contents.map(c => {
        const base: any = { title: c.title, type: c.type };
        
        if (c._id) base._id = c._id;

        if (c.type === 'text') base.textContent = c.textContent;
        else if (c.type === 'quiz') base.quizId = c.quizId;
        else base.url = c.url;

        return base;
      });

      const res = await fetch(`http://localhost:5000/api/lessons/${lesson._id || lesson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          contents: formattedContents
        })
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Error al actualizar la lección');
      }

      const updatedLesson = await res.json();
      
      dispatch('updated', updatedLesson);
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
      
      <div class="main-fields">
        <div class="form-group">
          <label for="title">Título</label>
          <input 
            id="title" type="text" bind:value={title} required
          />
        </div>

        <div class="form-group">
          <label for="desc">Descripción</label>
          <textarea 
            id="desc" rows="2" bind:value={description}
          ></textarea>
        </div>
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
              <div class="content-card" transition:scale|local>
                
                <div class="card-header">
                  <select bind:value={content.type} class="type-select">
                    <option value="text">📝 Texto</option>
                    <option value="video">🎥 Video</option>
                    <option value="pdf">📄 PDF</option>
                    <option value="quiz">❓ Quiz</option>
                  </select>
                  
                  <button type="button" class="btn-icon delete" on:click={() => removeContent(i)} title="Eliminar">
                    ✕
                  </button>
                </div>

                <div class="card-body">
                   <input 
                    type="text" 
                    class="input-title"
                    bind:value={content.title} 
                    placeholder="Título del material" 
                    required 
                  />

                  {#if content.type === 'text'}
                    <textarea 
                      rows="2" 
                      bind:value={content.textContent} 
                      placeholder="Contenido de texto..."
                      required
                    ></textarea>
                  
                  {:else if content.type === 'quiz'}
                    <input 
                      type="text" 
                      bind:value={content.quizId} 
                      placeholder="ID del Quiz" 
                      required 
                    />
                  
                  {:else if content.type === 'pdf'}
                    {#if content.url}
                      <div class="file-preview">
                        <span class="file-link">📄 PDF Cargado</span>
                        <a href={content.url} target="_blank" class="view-link">Ver</a>
                        <button type="button" class="btn-text-danger" on:click={() => removeFile(i)}>Cambiar</button>
                      </div>
                    {:else}
                      <FileDropZone 
                        accept="application/pdf" 
                        label="Arrastra tu PDF aquí"
                        uploading={uploadingIndex === i}
                        on:fileDropped={(e) => handleFileUpload(e.detail, i)}
                      />
                    {/if}

                  {:else}
                    <input 
                      type="url" 
                      bind:value={content.url} 
                      placeholder="URL del Video (YouTube, etc)" 
                      required 
                    />
                  {/if}
                </div>

              </div>
            {/each}
          </div>
        {/if}
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" on:click={() => dispatch('close')}>
          Cancelar
        </button>
        <button type="submit" class="btn-primary" disabled={loading || uploadingIndex !== null}>
          {#if loading}Guardando...{:else}Guardar Cambios{/if}
        </button>
      </div>
    </form>

  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 1100;
  }

  .modal {
    background: #ffffff; border-radius: 16px; padding: 1.5rem;
    width: 90%; max-width: 550px; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    display: flex; flex-direction: column; gap: 1rem; max-height: 90vh;
  }

  .modal-title { font-size: 1.3rem; font-weight: 600; color: #1f2937; margin: 0; text-align: center; }

  .lesson-form { display: flex; flex-direction: column; flex: 1; overflow: hidden; }

  .main-fields { display: flex; flex-direction: column; gap: 0.8rem; margin-bottom: 0.5rem; }
  
  .contents-list { overflow-y: auto; padding-right: 5px; display: flex; flex-direction: column; gap: 0.8rem; margin-bottom: 1rem; }
  .contents-list::-webkit-scrollbar { width: 5px; }
  .contents-list::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 4px; }

  .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
  label { font-size: 0.85rem; font-weight: 600; color: #4b5563; }

  input, textarea, select {
    width: 100%; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 8px;
    font-size: 0.9rem; background: #fff; box-sizing: border-box;
  }
  input:focus, textarea:focus, select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

  .contents-section { border-top: 1px solid #f3f4f6; padding-top: 1rem; flex: 1; display: flex; flex-direction: column; min-height: 200px; }
  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; }

  .content-card {
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.8rem;
    display: flex; flex-direction: column; gap: 0.5rem;
  }

  .card-header { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
  .type-select { width: auto; min-width: 120px; font-weight: 500; }
  
  .card-body { display: flex; flex-direction: column; gap: 0.5rem; }
  .input-title { font-weight: 600; color: #1f2937; }

  .empty-contents { text-align: center; color: #9ca3af; font-style: italic; padding: 1rem; background: #f9fafb; border-radius: 6px; }

  .btn-icon.delete { background: none; border: none; color: #ef4444; font-weight: bold; cursor: pointer; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 1rem; }
  .btn-icon.delete:hover { background: #fee2e2; }

  .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid #f3f4f6; }
  
  .btn-primary { background: #3b82f6; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
  .btn-primary:hover { background: #2563eb; }
  .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

  .btn-secondary { background: #e5e7eb; color: #374151; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
  .btn-secondary:hover { background: #d1d5db; }

  .btn-outline.small { background: transparent; color: #3b82f6; border: 1px solid #3b82f6; padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
  .btn-outline.small:hover { background: #eff6ff; }

  .alert-error { background: #fee2e2; color: #b91c1c; padding: 0.75rem; border-radius: 8px; font-size: 0.9rem; border: 1px solid #fecaca; margin-bottom: 1rem; }

  .file-preview {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    font-size: 0.9rem;
  }
  .file-link { font-weight: 600; color: #1e40af; flex: 1; }
  .view-link { color: #3b82f6; text-decoration: underline; }
  .btn-text-danger { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.85rem; text-decoration: underline;}
</style>