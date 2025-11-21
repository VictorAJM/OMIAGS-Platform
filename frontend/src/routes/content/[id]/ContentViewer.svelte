<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import NavBar from "$lib/components/NavBar.svelte";

  let contentId = $page.params.id;

  let content = null;
  let loading = true;
  let error = "";
  let username = "";

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  function getYouTubeEmbedUrl(url) {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`
      : null;
  }

  async function loadContent() {
    try {
      // 1. Cargar usuario
      const userRes = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: "include",
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        username = userData.name;
      }

      // 2. Cargar contenido
      const res = await fetch(`${API_BASE}/api/lessons/content/${contentId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 404)
          throw new Error("El contenido no existe o fue eliminado.");
        throw new Error("Error al cargar el contenido.");
      }

      content = await res.json();
    } catch (err) {
      console.error(err);
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function goBack() {
    if (content && content.courseId) {
      goto(`/cursos/${content.courseId}`);
    } else {
      goto("/cursos");
    }
  }

  onMount(() => {
    loadContent();
  });
</script>

<NavBar viewerType="student" {username} />

<div class="viewer-layout">
  <div class="nav-header">
    <button class="back-btn" on:click={goBack}> ← Volver a la lección </button>
  </div>

  {#if loading}
    <div class="state-message">
      <div class="spinner"></div>
      <p>Cargando recurso...</p>
    </div>
  {:else if error}
    <div class="state-message error">
      <p>⚠️ {error}</p>
      <button class="btn-secondary" on:click={goBack}>Regresar</button>
    </div>
  {:else if content}
    <header class="content-header">
      <div class="meta-tags">
        <span class="type-badge {content.type}">
          {content.type === "video"
            ? "VIDEO"
            : content.type === "pdf"
              ? "DOCUMENTO"
              : content.type === "quiz"
                ? "EVALUACIÓN"
                : "LECTURA"}
        </span>
        {#if content.lessonTitle}
          <span class="lesson-badge">Lección: {content.lessonTitle}</span>
        {/if}
      </div>

      <h1>{content.title}</h1>
    </header>

    <main class="content-viewport">
      {#if content.type === "video"}
        {@const embedUrl = getYouTubeEmbedUrl(content.url)}

        {#if embedUrl}
          <div class="video-container">
            <iframe
              src={embedUrl}
              title={content.title}
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            >
            </iframe>
          </div>
        {:else}
          <div class="alert-box">
            <p>
              <strong>No se pudo cargar el video.</strong> La URL proporcionada no
              parece válida.
            </p>
            <a href={content.url} target="_blank" class="link-external"
              >Intentar abrir en YouTube ↗</a
            >
          </div>
        {/if}
      {:else if content.type === "pdf"}
        <div class="pdf-container">
          <div class="pdf-toolbar">
            <p>Visualizador de PDF</p>
            <a href={content.url} target="_blank" download class="btn-download">
              ⬇ Descargar / Abrir en ventana nueva
            </a>
          </div>
          <iframe
            src={content.url}
            title="Visor PDF"
            width="100%"
            height="100%"
          >
            <p>
              Tu navegador no soporta PDFs incrustados. <a href={content.url}
                >Descárgalo aquí</a
              >.
            </p>
          </iframe>
        </div>
      {:else if content.type === "text"}
        <div class="text-reader">
          <p>{content.textContent || "Sin contenido disponible."}</p>
        </div>
      {:else if content.type === "quiz"}
        <div class="quiz-card">
          <div class="quiz-icon">📝</div>
          <h2>Evaluación de conocimientos</h2>
          <p>Estás a punto de iniciar un cuestionario para esta lección.</p>

          <button
            class="btn-primary large"
            on:click={() => goto(`/quiz/${content.quizId}`)}
          >
            Comenzar Cuestionario
          </button>
        </div>
      {/if}
    </main>
  {/if}
</div>

<style>
  .viewer-layout {
    max-width: 1000px;
    margin: 0 auto;
    padding: 1.5rem;
    font-family: "Inter", sans-serif;
    min-height: 80vh;
  }

  .nav-header {
    margin-bottom: 1.5rem;
  }

  .back-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #64748b;
    font-weight: 600;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: color 0.2s;
  }
  .back-btn:hover {
    color: #1e293b;
    text-decoration: underline;
  }

  .content-header {
    margin-bottom: 2rem;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 1.5rem;
  }

  .meta-tags {
    display: flex;
    gap: 0.8rem;
    margin-bottom: 0.8rem;
    align-items: center;
  }

  .type-badge {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.25rem 0.6rem;
    border-radius: 4px;
    letter-spacing: 0.05em;
  }
  .type-badge.video {
    background: #fee2e2;
    color: #991b1b;
  }
  .type-badge.pdf {
    background: #fff7ed;
    color: #9a3412;
  }
  .type-badge.text {
    background: #f0f9ff;
    color: #075985;
  }
  .type-badge.quiz {
    background: #f3e8ff;
    color: #6b21a8;
  }

  .lesson-badge {
    font-size: 0.85rem;
    color: #64748b;
  }

  h1 {
    margin: 0;
    font-size: 1.8rem;
    color: #1f2937;
    line-height: 1.3;
  }

  .content-viewport {
    background: #ffffff;
    border-radius: 12px;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }

  .video-container {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    background: #000;
  }
  .video-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .pdf-container {
    height: 85vh;
    display: flex;
    flex-direction: column;
    background: #f8fafc;
  }
  .pdf-toolbar {
    padding: 0.8rem 1.5rem;
    background: #f1f5f9;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .pdf-toolbar p {
    margin: 0;
    font-weight: 600;
    color: #475569;
    font-size: 0.9rem;
  }

  .btn-download {
    text-decoration: none;
    background: white;
    border: 1px solid #cbd5e0;
    color: #334155;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.2s;
  }
  .btn-download:hover {
    background: #f8fafc;
    border-color: #94a3b8;
  }

  .text-reader {
    padding: 3rem;
    font-size: 1.1rem;
    line-height: 1.8;
    color: #374151;
    white-space: pre-wrap;
    background: #fff;
  }

  .quiz-card {
    padding: 4rem 2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }
  .quiz-icon {
    font-size: 4rem;
    margin-bottom: -1rem;
  }
  .quiz-card h2 {
    margin: 0;
    color: #1f2937;
  }
  .quiz-card p {
    color: #64748b;
    max-width: 400px;
    margin: 0;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  .btn-primary:hover {
    background: #2563eb;
  }
  .btn-primary.large {
    font-size: 1.1rem;
    padding: 1rem 2rem;
  }

  .btn-secondary {
    background: #e2e8f0;
    color: #475569;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }

  .state-message {
    text-align: center;
    padding: 4rem;
    color: #64748b;
  }
  .state-message.error {
    color: #ef4444;
  }
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem auto;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .alert-box {
    padding: 2rem;
    text-align: center;
    background: #fff5f5;
    color: #9b2c2c;
  }
  .link-external {
    color: #c53030;
    font-weight: bold;
  }
</style>
