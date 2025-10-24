<script lang="ts">
  import StudentCard from './StudentCard.svelte';
  export let students = [];
</script>

<div class="students-grid">
  {#each students as student (student.id)}
    <StudentCard {student} />
  {/each}
  {#if students.length === 0}
    <div class="empty-state">
      <div class="empty-icon">👥</div>
      <h3>No se encontraron estudiantes</h3>
      <p>Intenta ajustar los términos de búsqueda</p>
    </div>
  {/if}
</div>

<style>
  .students-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
  }
  .empty-state { text-align: center; padding: 4rem 2rem; color: #718096; }
  .empty-icon { font-size: 4rem; margin-bottom: 1rem; }
  .empty-state h3 { margin: 0 0 0.5rem 0; color: #4a5568; }
</style>
