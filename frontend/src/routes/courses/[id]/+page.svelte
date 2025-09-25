<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  let lessons = [];
  let loading = true;
  let error = "";

  let courseId = $page.params.id;

  onMount(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/lessons/${courseId}`);
      if (!res.ok) throw new Error("Failed to load lessons");
      lessons = await res.json();
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });

  function openLesson(lesson) {
    alert(`Abrir lección: ${lesson.title}`);
  }
</script>

<h2>Lecciones del curso</h2>

{#if loading}
  <p>Cargando lecciones...</p>
{:else if error}
  <p style="color:red">{error}</p>
{:else if lessons.length === 0}
  <p>No hay lecciones disponibles.</p>
{:else}
  <ul>
    {#each lessons as lesson}
      <li>
        <strong>{lesson.title}</strong> — {lesson.description}
        <button on:click={() => openLesson(lesson)}>Abrir</button>
      </li>
    {/each}
  </ul>
{/if}
