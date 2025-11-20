<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { scale, fade } from 'svelte/transition';
  import FileDropZone from './FileDropZone.svelte'; 

  export let courseId: string;
  const dispatch = createEventDispatcher();

  let title = '';
  let description = '';
  let loading = false;
  let error = '';
  
  // Track uploading state per item to show spinners individually
  let uploadingIndex: number | null = null;

  interface ContentFormItem {
    type: 'video' | 'pdf' | 'text' | 'quiz';
    title: string;
    url?: string;
    textContent?: string;
    quizId?: string;
  }

  let contents: ContentFormItem[] = [];

  function addContent() {
    contents = [...contents, { type: 'text', title: '', textContent: '', url: '', quizId: '' }];
    
    // UX: Scroll to bottom when adding new item
    setTimeout(() => {
      const list = document.querySelector('.modal-body-scroll');
      if(list) list.scrollTop = list.scrollHeight;
    }, 50);
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

    } catch (err) {
      console.error(err);
      error = 'Error al subir el archivo. Intente nuevamente.';
    } finally {
      uploadingIndex = null;
    }
  }

  function removeFile(index: number) {
    contents[index].url = '';
  }

 async function handleSubmit() {
    if (!title.trim()) {
      error = 'El título de la lección es obligatorio';
      return;
    }

    // Validar que los contenidos tengan título
    for (const c of contents) {
      if (!c.title.trim()) {
        error = 'Todos los materiales deben tener un título.';
        return;
      }
    }

    loading = true;
    error = '';

    try {
      // Preparamos la data para que coincida EXACTAMENTE con el Schema de Mongoose
      const formattedContents = contents.map(c => {
        const base = { title: c.title, type: c.type };
        
        if (c.type === 'text') return { ...base, textContent: c.textContent };
        if (c.type === 'quiz') return { ...base, quizId: c.quizId };
        return { ...base, url: c.url }; // video o pdf
      });

      const res = await fetch('http://localhost:5000/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          title,
          description,
          contents: formattedContents
        })
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Error al crear la lección');
      }

      const newLesson = await res.json();
      dispatch('created', newLesson);
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
  <div class="modal" on:click|stopPropagation in:scale={{ start: 0.96, duration: 200 }}>
    
    <div class="modal-header">
        <div class="header-content">
            <h3 class="modal-title">Nueva Lección</h3>
            <p class="modal-subtitle">Crea contenido educativo para tu curso.</p>
        </div>
        <button type="button" class="btn-close" on:click={() => dispatch('close')}>✕</button>
    </div>

    <div class="modal-body-scroll">
        {#if error}
            <div class="alert-error" transition:scale>
                <span class="alert-icon">⚠️</span>
                <span>{error}</span>
            </div>
        {/if}

        <form class="lesson-form">
            <div class="main-fields">
                <div class="form-group">
                    <label for="title">Título de la lección</label>
                    <input 
                        id="title" type="text" bind:value={title} 
                        placeholder="Ej. Introducción a React" required
                    />
                </div>

                <div class="form-group">
                    <label for="desc">Descripción <span class="optional">(Opcional)</span></label>
                    <textarea 
                        id="desc" rows="2" bind:value={description} 
                        placeholder="Resumen de lo que aprenderán..."
                    ></textarea>
                </div>
            </div>

            <div class="contents-section">
                <div class="section-header">
                    <div class="section-title">
                        <label>Materiales / Contenido</label>
                        <span class="badge">{contents.length} items</span>
                    </div>
                    <button type="button" class="btn-add" on:click={addContent}>
                        <span class="plus-icon">+</span> Nuevo Material
                    </button>
                </div>

                {#if contents.length === 0}
                    <div class="empty-state">
                        <div class="empty-icon">📂</div>
                        <p>La lección está vacía.</p>
                        <button type="button" class="btn-link" on:click={addContent}>Agregar primer material</button>
                    </div>
                {:else}
                    <div class="contents-list">
                        {#each contents as content, i}
                            <div class="content-card" transition:scale|local={{duration: 200}}>
                            
                                <div class="card-header">
                                    <div class="type-badge-wrapper">
                                        <select bind:value={content.type} class="type-select type-{content.type}">
                                            <option value="text">📝 Texto</option>
                                            <option value="video">🎥 Video</option>
                                            <option value="pdf">📄 PDF</option>
                                            <option value="quiz">❓ Quiz</option>
                                        </select>
                                    </div>
                                    <button type="button" class="btn-icon-delete" on:click={() => removeContent(i)} title="Eliminar">✕</button>
                                </div>

                                <div class="card-body">
                                    <input type="text" class="input-content-title" bind:value={content.title} placeholder="Título del material" required />

                                    <div class="content-input-area">
                                        {#if content.type === 'text'}
                                            <textarea 
                                                rows="3" 
                                                bind:value={content.textContent} 
                                                placeholder="Escribe el contenido aquí..."
                                                class="text-content-area"
                                            ></textarea>
                                        
                                        {:else if content.type === 'quiz'}
                                            <div class="input-with-icon">
                                                <span class="input-icon">#</span>
                                                <input type="text" bind:value={content.quizId} placeholder="ID del Quiz (MongoDB ID)" />
                                            </div>
                                        
                                        {:else if content.type === 'pdf'}
                                            {#if content.url}
                                                <div class="file-preview-card">
                                                    <div class="file-icon">📄</div>
                                                    <div class="file-info">
                                                        <span class="file-name">{content.title || "Documento PDF"}</span>
                                                        <a href={content.url} target="_blank" class="file-link">Ver archivo</a>
                                                    </div>
                                                    <button type="button" class="btn-change-file" on:click={() => removeFile(i)}>Cambiar</button>
                                                </div>
                                            {:else}
                                                <div class="dropzone-wrapper">
                                                    <FileDropZone 
                                                        accept="application/pdf" 
                                                        label="Arrastra tu PDF aquí"
                                                        uploading={uploadingIndex === i}
                                                        on:fileDropped={(e) => handleFileUpload(e.detail, i)}
                                                    />
                                                </div>
                                            {/if}
                                        {:else}
                                            <div class="input-with-icon">
                                                <span class="input-icon">🔗</span>
                                                <input type="url" bind:value={content.url} placeholder="https://youtube.com/..." />
                                            </div>
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </form>
    </div>

    <div class="modal-footer">
        <button type="button" class="btn-ghost" on:click={() => dispatch('close')}>
            Cancelar
        </button>
        <button type="button" class="btn-primary" disabled={loading || uploadingIndex !== null} on:click={handleSubmit}>
            {#if loading}
                <span class="loader"></span> Creando...
            {:else}
                Crear Lección
            {/if}
        </button>
    </div>
  </div>
</div>

<style>
  /* --- Layout & Container --- */
  .modal-backdrop {
    position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1100;
    padding: 1rem;
  }

  .modal {
    background: #ffffff; border-radius: 16px; width: 100%; max-width: 600px; height: 85vh;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    display: flex; flex-direction: column; overflow: hidden; animation: slideIn 0.2s ease-out;
  }

  /* --- Header --- */
  .modal-header {
    padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0;
    display: flex; justify-content: space-between; align-items: flex-start; background: #fff;
  }
  .header-content { display: flex; flex-direction: column; gap: 0.25rem; }
  .modal-title { font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0; line-height: 1.2; }
  .modal-subtitle { font-size: 0.875rem; color: #64748b; margin: 0; }

  .btn-close {
    background: transparent; border: none; color: #94a3b8; font-size: 1.25rem; cursor: pointer;
    padding: 0.25rem; border-radius: 6px; line-height: 1; transition: all 0.2s;
  }
  .btn-close:hover { background: #f1f5f9; color: #475569; }

  /* --- Scrollable Body --- */
  .modal-body-scroll {
    flex: 1; overflow-y: auto; padding: 1.5rem; background: #f8fafc;
  }
  .modal-body-scroll::-webkit-scrollbar { width: 6px; }
  .modal-body-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

  /* --- Forms --- */
  .form-group { margin-bottom: 1.25rem; }
  label { display: block; font-size: 0.875rem; font-weight: 600; color: #334155; margin-bottom: 0.5rem; }
  .optional { font-weight: 400; color: #94a3b8; font-size: 0.8rem; }

  input, textarea, select {
    width: 100%; padding: 0.625rem 0.875rem; border: 1px solid #e2e8f0; border-radius: 8px;
    font-size: 0.925rem; color: #1e293b; background: #fff; transition: all 0.2s ease; box-sizing: border-box;
  }
  input:focus, textarea:focus, select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
  textarea { resize: vertical; }

  .alert-error {
    background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 0.75rem 1rem;
    border-radius: 8px; font-size: 0.875rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;
  }

  /* --- Contents Section --- */
  .contents-section { margin-top: 2rem; }
  .section-header {
    display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1rem;
    padding-bottom: 0.5rem; border-bottom: 2px solid #e2e8f0;
  }
  .section-title label { margin: 0; font-size: 0.95rem; color: #0f172a; }
  .badge { background: #e2e8f0; color: #475569; font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 12px; margin-left: 0.5rem; font-weight: 600; }

  .btn-add {
    background: transparent; color: #2563eb; border: none; font-size: 0.875rem; font-weight: 600;
    cursor: pointer; padding: 0.4rem 0.8rem; border-radius: 6px; transition: background 0.2s;
  }
  .btn-add:hover { background: #eff6ff; }

  .empty-state { text-align: center; padding: 3rem 1rem; border: 2px dashed #cbd5e1; border-radius: 12px; color: #64748b; }
  .empty-icon { font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5; }
  .btn-link { background: none; border: none; color: #3b82f6; text-decoration: underline; cursor: pointer; font-weight: 500; }

  /* --- Content Cards --- */
  .contents-list { display: flex; flex-direction: column; gap: 1rem; }

  .content-card {
    background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    overflow: hidden; transition: transform 0.2s, box-shadow 0.2s;
  }
  .content-card:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); transform: translateY(-1px); }

  .card-header {
    padding: 0.75rem 1rem; background: #f8fafc; border-bottom: 1px solid #f1f5f9;
    display: flex; justify-content: space-between; align-items: center;
  }

  .type-select {
    width: auto; padding: 0.3rem 0.6rem; font-size: 0.8rem; font-weight: 600;
    border-radius: 6px; border: 1px solid #cbd5e1; cursor: pointer; background-color: #fff;
  }
  /* Contextual colors */
  .type-quiz { color: #059669; border-color: #a7f3d0; background: #ecfdf5; }
  .type-video { color: #b91c1c; border-color: #fecaca; background: #fef2f2; }
  .type-pdf { color: #ca8a04; border-color: #fde047; background: #fefce8; }
  .type-text { color: #2563eb; border-color: #bfdbfe; background: #eff6ff; }

  .btn-icon-delete {
    background: transparent; border: none; color: #94a3b8; font-size: 1rem; cursor: pointer;
    padding: 0.3rem; border-radius: 4px; transition: all 0.2s;
  }
  .btn-icon-delete:hover { background: #fee2e2; color: #ef4444; }

  .card-body { padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }

  .input-content-title {
    border: none; border-bottom: 1px solid #e2e8f0; border-radius: 0; padding-left: 0; padding-right: 0;
    font-weight: 600; font-size: 1rem;
  }
  .input-content-title:focus { box-shadow: none; border-color: #3b82f6; }

  /* Input Icons */
  .input-with-icon { position: relative; display: flex; align-items: center; }
  .input-icon { position: absolute; left: 10px; color: #94a3b8; pointer-events: none; font-size: 0.9rem; }
  .input-with-icon input { padding-left: 2.2rem; }

  /* File Preview */
  .file-preview-card {
    display: flex; align-items: center; padding: 0.75rem; background: #eff6ff;
    border: 1px solid #bfdbfe; border-radius: 8px; gap: 0.75rem;
  }
  .file-icon { font-size: 1.25rem; }
  .file-info { flex: 1; display: flex; flex-direction: column; }
  .file-name { font-size: 0.85rem; font-weight: 600; color: #1e3a8a; }
  .file-link { font-size: 0.75rem; color: #3b82f6; text-decoration: none; }
  .file-link:hover { text-decoration: underline; }
  .btn-change-file {
    font-size: 0.75rem; color: #64748b; background: #fff; border: 1px solid #cbd5e1;
    padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer;
  }

  /* --- Footer --- */
  .modal-footer {
    padding: 1.25rem 1.5rem; border-top: 1px solid #e2e8f0; background: #fff;
    display: flex; justify-content: flex-end; gap: 0.75rem;
  }

  .btn-ghost {
    background: transparent; color: #64748b; border: 1px solid transparent; padding: 0.625rem 1.25rem;
    border-radius: 8px; font-weight: 600; cursor: pointer;
  }
  .btn-ghost:hover { background: #f1f5f9; color: #334155; }

  .btn-primary {
    background: #2563eb; color: white; border: none; padding: 0.625rem 1.5rem; border-radius: 8px;
    font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
    display: flex; align-items: center; gap: 0.5rem;
  }
  .btn-primary:hover { background: #1d4ed8; }
  .btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }

  .loader {
    width: 14px; height: 14px; border: 2px solid #fff; border-bottom-color: transparent;
    border-radius: 50%; animation: rotation 1s linear infinite;
  }
  @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>