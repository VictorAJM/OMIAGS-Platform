<script lang="ts">
  import { goto } from "$app/navigation";

  let email = "";
  let password = "";
  let msg = "";
  let loading = false;

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  async function handleLogin(e: Event) {
    e.preventDefault();
    msg = "";
    loading = true;

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      await goto("/");
    } catch (err: any) {
      msg = err?.message ?? "Error al iniciar sesión";
    } finally {
      loading = false;
    }
  }
</script>

<div class="auth-wrapper">
  <div class="auth-card">
    <div class="auth-header">
      <h1>Iniciar sesión</h1>
      <p>Bienvenido de nuevo</p>
    </div>

    {#if msg}
      <div class="auth-error">{msg}</div>
    {/if}

    <form on:submit={handleLogin} novalidate>
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          bind:value={email}
          required
          placeholder="tucorreo@ejemplo.com"
        />
      </div>

      <div class="form-group">
        <label for="password">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          bind:value={password}
          required
          placeholder="••••••••"
        />
      </div>

      <button class="auth-button" disabled={loading}>
        {#if loading}Entrando...{:else}Entrar{/if}
      </button>
    </form>

    <p class="auth-footer">
      ¿No tienes cuenta?
      <a href="/register">Crear cuenta</a>
    </p>
  </div>
</div>

<style>
  /* Global styles consistent with Course Page */
  :global(body) {
    margin: 0;
    font-family: "Inter", system-ui, -apple-system, sans-serif;
    background-color: #f7fafc; /* Light background */
    color: #2d3748;
    min-height: 100vh;
  }

  .auth-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  .auth-card {
    width: 100%;
    max-width: 420px;
    background: white;
    border-radius: 16px; /* Matches course header radius */
    padding: 2.5rem;
    box-shadow:
      0 4px 6px rgba(0, 0, 0, 0.02),
      0 10px 15px rgba(0, 0, 0, 0.03);
    border: 1px solid #edf2f7;
  }

  .auth-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  h1 {
    margin: 0 0 0.5rem 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: #1a202c;
  }

  .auth-header p {
    margin: 0;
    color: #718096;
    font-size: 0.95rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-size: 0.9rem;
    color: #4a5568;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #2d3748;
    font-size: 0.95rem;
    box-sizing: border-box;
    transition: all 0.2s ease;
  }

  input:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.15);
  }

  /* Matching the .btn-primary from Course Page */
  .auth-button {
    margin-top: 0.5rem;
    width: 100%;
    padding: 0.85rem;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%);
    color: white;
    font-weight: 600;
    cursor: pointer;
    font-size: 1rem;
    box-shadow: 0 4px 6px rgba(49, 130, 206, 0.3);
    transition: transform 0.1s ease, box-shadow 0.15s ease;
  }

  .auth-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(49, 130, 206, 0.4);
  }

  .auth-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .auth-error {
    margin-bottom: 1.5rem;
    padding: 0.75rem;
    border-radius: 8px;
    background: #fff5f5;
    border: 1px solid #feb2b2;
    color: #c53030;
    font-size: 0.9rem;
    text-align: center;
  }

  .auth-footer {
    margin-top: 2rem;
    font-size: 0.9rem;
    color: #718096;
    text-align: center;
  }

  .auth-footer a {
    color: #3182ce; /* Blue accent */
    text-decoration: none;
    font-weight: 600;
    margin-left: 0.25rem;
  }

  .auth-footer a:hover {
    text-decoration: underline;
    color: #2c5282;
  }
</style>