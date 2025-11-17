<script lang="ts">
  export let profile;
  export let showPasswordForm = false;
  export let toggleForm = () => {};
</script>

<div class="profile-card">
  <div class="card-header">
    <h3>Seguridad</h3>
  </div>

  {#if !showPasswordForm}
    <div class="security-info">
      <p>🔒 Tu contraseña se actualizó por última vez hace 30 días</p>
      <button class="btn-primary" on:click={toggleForm}>🔑 THIS SHIT DOES NOT WORK (RIGHT NOW)</button>
    </div>
  {:else}
    <div class="password-form">
      <div class="form-group">
        <label>Contraseña actual</label>
        <input type="password" bind:value={profile.currentPassword} placeholder="Introduce tu contraseña actual" />
      </div>
      <div class="form-group">
        <label>Nueva contraseña</label>
        <input type="password" bind:value={profile.newPassword} placeholder="Introduce la nueva contraseña" />
      </div>
      <div class="form-group">
        <label>Confirmar nueva contraseña</label>
        <input type="password" bind:value={profile.confirmPassword} placeholder="Confirma la nueva contraseña" />
      </div>
      <div class="form-actions">
        <button class="btn-secondary" on:click={toggleForm}>Cancelar</button>
        <button class="btn-primary" on:click={() => {
          if(profile.newPassword !== profile.confirmPassword) return alert('Las contraseñas no coinciden');
          alert('Contraseña cambiada exitosamente');
          profile.currentPassword = '';
          profile.newPassword = '';
          profile.confirmPassword = '';
          toggleForm();
        }}>Actualizar Contraseña</button>
      </div>
    </div>
  {/if}
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

.security-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.security-info p {
  margin: 0;
  color: #718096;
  font-size: 0.95rem;
}

.password-form {
  display: flex;
  flex-direction: column;
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
  font-size: 0.95rem;
}
.form-group input {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
}
.form-group input:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49,130,206,0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-primary, .btn-secondary {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-primary {
  background-color: #3182ce;
  color: white;
  border: none;
}
.btn-primary:hover {
  background-color: #2b6cb0;
}
.btn-secondary {
  background-color: #edf2f7;
  color: #2d3748;
  border: none;
}
.btn-secondary:hover {
  background-color: #e2e8f0;
}

@media (max-width: 768px) {
  .security-info {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
