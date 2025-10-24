<script lang="ts">
  export let username: string;
  export let email: string;

  let currentPassword = "";
  let newPassword = "";
  let confirmPassword = "";

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    alert("Cambio de contraseña solicitado (solo UI)");
  };
</script>


<!-- Cambiar contraseña -->
<section class="card">
  <div class="header">
    <h3 class="section-title">Cambiar contraseña</h3>
    <p class="section-subtitle text-gray-500 text-sm">
      Actualiza tu contraseña para mantener tu cuenta segura
    </p>
  </div>

  <div class="form-container">
    <div class="form-group">
      <label for="current">Contraseña actual</label>
      <input
        id="current"
        type="password"
        bind:value={currentPassword}
        class="input"
        placeholder="Ingresa tu contraseña actual"
      />
    </div>

    <div class="form-group">
      <label for="new">Nueva contraseña</label>
      <input
        id="new"
        type="password"
        bind:value={newPassword}
        class="input"
        placeholder="Ingresa tu nueva contraseña"
      />
    </div>

    <div class="form-group">
      <label for="confirm">Confirmar nueva contraseña</label>
      <input
        id="confirm"
        type="password"
        bind:value={confirmPassword}
        class="input"
        placeholder="Repite la nueva contraseña"
      />
    </div>

    <button class="save-btn" on:click={handlePasswordChange}>
      Guardar cambios
    </button>
  </div>
</section>

<style>
  /* ===== Card Layout (Shared) ===== */
  .card {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    margin-bottom: 2rem;
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }

  .header {
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #1f2937;
  }

  .section-subtitle {
    margin-top: 0.25rem;
    color: #6b7280;
    font-size: 0.9rem;
  }

  /* ===== Info Grid ===== */
  .info-grid {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .info-item {
    display: flex;
    flex-direction: column;
  }

  .label {
    font-size: 0.85rem;
    font-weight: 500;
    color: #6b7280;
    margin-bottom: 0.25rem;
  }

  .value {
    font-size: 1rem;
    color: #111827;
    background: #f9fafb;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
  }

  @media (min-width: 640px) {
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
  }

  /* ===== Form Section ===== */
  .form-container {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    max-width: 450px;
  }

  label {
    display: block;
    font-size: 0.9rem;
    color: #555;
    margin-bottom: 0.25rem;
  }

  .input {
    width: 100%;
    padding: 0.6rem 0.8rem;
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    outline: none;
    transition: border 0.2s;
    background-color: #f9fafb;
  }

  .input:focus {
    border-color: #b91c1c;
    background-color: #fff;
  }

  .save-btn {
    align-self: flex-start;
    background: #b91c1c;
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    margin-top: 0.5rem;
  }

  .save-btn:hover {
    background: #991b1b;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }
</style>
