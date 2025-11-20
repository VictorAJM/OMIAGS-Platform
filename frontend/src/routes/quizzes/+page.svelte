<script>
  import NavBar from "../../lib/components/NavBar.svelte";
  import { onMount } from "svelte";

  let quizzes = [];
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/quizzes/list`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to load quizzes.");
      }
      quizzes = await res.json();
    } catch (err) {
      console.error(err);
    } finally {
      loading = false;
    }
  });
</script>

<NavBar />

<div class="page-container">
  <div class="header">
    <h1>Quizzes Disponibles</h1>
    <p>Selecciona un quiz para empezar.</p>
  </div>

  {#if loading}
    <p>Cargando quizzes...</p>
  {:else}
    <div class="quizzes-grid">
      {#each quizzes as quiz (quiz._id)}
        <a href={`/quiz/${quiz._id}`} class="quiz-card-item">
          <div class="card-content">
            <h3>{quiz.title}</h3>
            <p>{quiz.description}</p>
          </div>
          <div class="card-footer">
            <span>Empezar Quiz &rarr;</span>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  .page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: "Inter", sans-serif;
  }

  .header {
    text-align: center;
    margin-bottom: 2.5rem;
  }

  .header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }

  .header p {
    font-size: 1.1rem;
    color: #6b7280;
  }

  .quizzes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .quiz-card-item {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
    border: 1px solid #e5e7eb;
  }

  .quiz-card-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }

  .card-content {
    padding: 1.5rem;
  }

  .card-content h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
  }

  .card-content p {
    font-size: 0.95rem;
    color: #6b7280;
    line-height: 1.5;
    margin: 0;
  }

  .card-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #e5e7eb;
    text-align: right;
    font-weight: 500;
    color: #3182ce;
    transition: color 0.2s ease;
  }

  .quiz-card-item:hover .card-footer {
    color: #2563eb;
  }
</style>
