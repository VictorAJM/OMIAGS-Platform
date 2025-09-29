<script>
  import NavBar from "../../../lib/components/NavBar.svelte";
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  let lessons = [];
  let loading = true;
  let error = "";

  let courseId = $page.params.id;

  onMount(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/lessons/${courseId}`);
      if (!res.ok) throw new Error("❌ Error al cargar las lecciones");

      let data = await res.json();

      // 🔹 Ensure lessons are sorted by "order" or fallback to title
      lessons = data.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return a.title.localeCompare(b.title);
      });
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });

  function openLesson(lesson) {
    alert(`📖 Abrir lección: ${lesson.title}`);
  }
</script>

<style>
  .page {
    max-width: 900px;
    margin: 2rem auto;
    padding: 1rem;
    font-family: system-ui, sans-serif;
  }

  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    font-weight: 600;
    text-align: center;
    color: #2c3e50;
  }

  .loading,
  .error,
  .empty {
    text-align: center;
    margin-top: 2rem;
    font-size: 1.1rem;
  }

  .error {
    color: #e74c3c;
    font-weight: bold;
  }

  .lessons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    padding: 1.2rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  .info {
    flex-grow: 1;
    margin-right: 1rem;
  }

  .order {
    font-weight: bold;
    color: #2980b9;
    margin-right: 0.5rem;
  }

  .title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.3rem;
    color: #34495e;
  }

  .description {
    font-size: 0.95rem;
    color: #555;
  }

  button {
    background: #3498db;
    border: none;
    color: white;
    padding: 0.6rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s ease;
    white-space: nowrap;
  }

  button:hover {
    background: #2980b9;
  }
</style>

<NavBar viewerType="student" username="Chaska" />

<div class="page">
  <h2>📚 Lecciones del curso</h2>

  {#if loading}
    <p class="loading">⏳ Cargando lecciones...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if lessons.length === 0}
    <p class="empty">⚠️ No hay lecciones disponibles.</p>
  {:else}
    <div class="lessons">
      {#each lessons as lesson, i}
        <div class="card">
          <div class="info">
            <div class="title">
              <span class="order">{i + 1}.</span> {lesson.title}
            </div>
            <div class="description">{lesson.description}</div>
          </div>
          <button on:click={() => openLesson(lesson)}>Abrir →</button>
        </div>
      {/each}
    </div>
  {/if}
</div>
