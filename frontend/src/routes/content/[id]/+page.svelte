<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from '$app/navigation';
  import NavBar from "$lib/components/NavBar.svelte";

  let contentId = $page.params.id;
  let content = null;
  let loading = true;
  let error = "";
  
  // Si necesitas el usuario en este componente simple:
  let username = ''; 

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  function getYouTubeEmbedUrl(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`
      : null;
  }

  async function loadContent() {
    try {
      // Carga opcional de usuario si NavBar lo requiere
      const userRes = await fetch(`${API_BASE}/api/auth/me`); 
      if (userRes.ok) {
         const userData = await userRes.json();
         username = userData.name;
      }

      const res = await fetch(`${API_BASE}/api/lessons/content/${contentId}`);
      if (!res.ok) throw new Error("No se pudo cargar el contenido");
      
      content = await res.json();

    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function goBack() {
    if (content && content.courseId) {
        goto(`/cursos/${content.courseId}`);
    } else {
        goto('/cursos');
    }
  }

  onMount(() => {
    loadContent();
  });
</script>

<NavBar viewerType="student" {username} />

<div class="viewer-container">
  
  <button class="back-btn" on:click={goBack}>
    ← Volver a la lección
  </button>

  {#if loading}
    <div class="loading">Cargando recurso...</div>
  {:else if error}
    <div class="error">⚠️ {error}</div>
  {:else if content}
    
    <div class="content-header">
      <span class="type-badge">{content.type.toUpperCase()}</span>
      <h1>{content.title}</h1>
      {#if content.lessonTitle}
        <p class="context">Lección: {content.lessonTitle}</p>
      {/if}
    </div>

    <div class="content-display">
      
      {#if content.type === 'video'}
        {@const embedUrl = getYouTubeEmbedUrl(content.url)}
        {#if embedUrl}
          <div class="video-wrapper">
            <iframe 
              src={embedUrl} 
              title={content.title} 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
            </iframe>
          </div>
        {:else}
          <div class="alert">URL de video inválida: <a href={content.url} target="_blank">{content.url}</a></div>
        {/if}

      {:else if content.type === 'pdf'}
        <div class="pdf-wrapper">
          <iframe src={content.url} title="Visor PDF" width="100%" height="100%"></iframe>
        </div>
        <div class="pdf-actions">
             <a href={content.url} target="_blank" class="btn-download">⬇ Descargar / Abrir Externamente</a>
        </div>

      {:else if content.type === 'text'}
        <div class="text-reader">
          <p>{content.textContent}</p>
        </div>

      {:else if content.type === 'quiz'}
         <div class="quiz-placeholder">
            <h3>Cuestionario</h3>
            <button class="btn-primary" on:click={() => goto(`/quiz/${content.quizId}`)}>Iniciar Quiz</button>
         </div>
      {/if}

    </div>

  {/if}
</div>

<style>
  .viewer-container { max-width: 900px; margin: 2rem auto; padding: 0 1rem; font-family: 'Inter', sans-serif; }
  
  .back-btn {
    background: none; border: none; cursor: pointer; color: #64748b; font-weight: 600;
    margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;
  }
  .back-btn:hover { color: #1e293b; }

  .loading, .error { text-align: center; padding: 3rem; font-size: 1.1rem; color: #666; }
  .error { color: #e53e3e; }

  .content-header { margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; }
  .type-badge { background: #ebf8ff; color: #3182ce; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; letter-spacing: 0.05em; }
  h1 { margin: 0.5rem 0 0.2rem 0; color: #2d3748; }
  .context { color: #718096; font-size: 0.9rem; margin: 0; }

  /* Video Styles */
  .video-wrapper {
    position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;
    border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); background: black;
  }
  .video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }

  /* PDF Styles */
  .pdf-wrapper { height: 80vh; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; background: #f7fafc; }
  .pdf-actions { margin-top: 1rem; text-align: right; }
  
  /* Text Styles */
  .text-reader { background: white; padding: 2rem; border-radius: 8px; border: 1px solid #e2e8f0; line-height: 1.8; color: #2d3748; white-space: pre-wrap; }

  /* Botones */
  .btn-download { 
    display: inline-block; background: #4a5568; color: white; padding: 0.6rem 1.2rem; 
    border-radius: 6px; text-decoration: none; font-size: 0.9rem; 
  }
  .btn-download:hover { background: #2d3748; }
  
  .btn-primary { 
    background: #3182ce; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer;
  }
  
  .alert { padding: 1rem; background: #fff5f5; color: #c53030; }
  
  .quiz-placeholder {
    text-align: center; padding: 2rem; border: 2px dashed #cbd5e0; border-radius: 8px;
  }
</style>