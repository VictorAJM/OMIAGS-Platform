<script lang="ts">
  export let profile;
</script>

<div class="profile-card">
  <div class="card-header">
    <h3>Información Personal</h3>
  </div>

  <div class="profile-form">
    <div class="form-row">
      <div class="form-group">
        <label>Nombre completo</label>
        <input type="text" value={profile.name} disabled />
      </div>
      <div class="form-group">
        <label>Correo electrónico</label>
        <input type="email" value={profile.email} disabled />
      </div>
    </div>
  </div>
</div>

<style>
.profile-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.card-header {
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 1rem;
}
.card-header h3 {
  margin: 0;
  color: #2d3748;
}
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-group label {
  font-weight: 500;
  color: #4a5568;
}
.form-group input {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  background: #f7fafc;
  color: #4a5568;
}
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
