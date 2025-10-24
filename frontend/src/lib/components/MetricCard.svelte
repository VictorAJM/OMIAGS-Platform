<script lang="ts">
  export let icon = '📊';
  export let title = '';
  export let value = '';
  export let color = '#3182ce';
</script>

<div class="metric-card">
  <div class="metric-icon" style="background: {color}">{icon}</div>
  <div class="metric-info">
    <h3>{value}</h3>
    <p>{title}</p>
  </div>
</div>

<style>
.metric-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease;
}
.metric-card:hover { transform: translateY(-2px); }
.metric-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
.metric-info h3 { margin: 0 0 0.25rem 0; font-size: 2rem; color: #2d3748; }
.metric-info p { margin: 0; color: #718096; font-weight: 500; }
</style>
