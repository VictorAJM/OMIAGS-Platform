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
</script>

<h2 class="text-xl font-bold mb-4">Lecciones</h2>

{#if loading}
  <p>Cargando lecciones...</p>
{:else if error}
  <p class="text-red-500">{error}</p>
{:else if lessons.length === 0}
  <p>No hay lecciones disponibles.</p>
{:else}
  <ul class="space-y-4">
    {#each lessons as lesson}
      <li class="p-4 bg-white rounded shadow">
        <h3 class="text-lg font-semibold">{lesson.title}</h3>
        <p class="text-gray-600">{lesson.description}</p>
        <button
          class="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
          on:click={() => openLesson(lesson)}
        >
          Abrir
        </button>
      </li>
    {/each}
  </ul>
{/if}

<script>
  function openLesson(lesson) {
    // Later: route to /lessons/[id]
    alert(`Abrir lección: ${lesson.title}`);
  }
</script>
