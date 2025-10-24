<script lang="ts">
  export let username: string;
  export let email: string;
  export let password: string;
</script>

<section class="card">
  <div class="header">
    <h3 class="section-title">Datos personales</h3>
    <p class="section-subtitle text-gray-500 text-sm">
      Información básica del alumno
    </p>
  </div>

  <div class="info-grid">
    <div class="info-item">
      <span class="label">Nombre</span>
      <span class="value">{username}</span>
    </div>

    <div class="info-item">
      <span class="label">Correo electrónico</span>
      <span class="value">{email}</span>
    </div>

  </div>
</section>

<style>
  .card {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    margin-bottom: 5px;
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
  }

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
      grid-template-columns: 1fr 1fr;
      display: grid;
      gap: 1.5rem;
    }
  }
</style>
