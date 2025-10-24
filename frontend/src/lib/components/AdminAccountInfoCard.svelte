<script lang="ts">
  export let info = [];
</script>

<div class="profile-card">
  <div class="card-header">
    <h3>Información de la Cuenta</h3>
  </div>

  <div class="account-info">
    {#each info as item}
      <div class="info-item">
        <span class="label">{item.label}</span>
        <span class="value">{item.value}</span>
      </div>
    {/each}
  </div>
</div>

<style>
.profile-card {
  background: white;
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.profile-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.card-header {
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.75rem;
}
.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: #f7fafc;
  transition: background 0.2s ease;
}
.info-item:hover {
  background: #edf2f7;
}

.label {
  color: #718096;
  font-weight: 500;
  font-size: 0.95rem;
}

.value {
  color: #2d3748;
  font-weight: 600;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  .value { font-size: 0.95rem; }
}
</style>
