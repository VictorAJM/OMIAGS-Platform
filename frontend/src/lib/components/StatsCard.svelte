<script lang="ts">
  export let title = '';
  export let content;
</script>

<div class="stats-card">
  <h3>{title}</h3>
  <slot></slot>
</div>

<style>
.stats-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.stats-card h3 { margin: 0 0 1rem 0; color: #2d3748; }
</style>
