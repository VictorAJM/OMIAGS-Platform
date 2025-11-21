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
    <h1>Iniciar sesión</h1>

    {#if msg}
      <div class="auth-error">{msg}</div>
    {/if}

    <form on:submit={handleLogin} novalidate>
      <label for="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        bind:value={email}
        required
        placeholder="tucorreo@ejemplo.com"
      />

      <label for="password">Contraseña</label>
      <input
        id="password"
        name="password"
        type="password"
        bind:value={password}
        required
        placeholder="••••••••"
      />

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
  /* Estilos globales para asegurar el fondo oscuro en toda la página */
  :global(body) {
    margin: 0;
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
    background: radial-gradient(
      circle at top,
      #1f2937 0,
      #020617 45%,
      #000 100%
    );
    color: #e5e7eb;
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
    background: rgba(15, 23, 42, 0.95);
    border-radius: 1rem;
    padding: 2rem 2.25rem;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(148, 163, 184, 0.4);
    backdrop-filter: blur(18px);
  }

  h1 {
    margin: 0 0 1.5rem 0;
    font-size: 1.75rem;
    font-weight: 600;
    text-align: center;
    color: #f9fafb;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  label {
    font-size: 0.9rem;
    color: #cbd5f5;
    margin-bottom: -4px; /* Ajuste visual */
  }

  input {
    width: 100%;
    padding: 0.7rem 0.85rem;
    border-radius: 0.6rem;
    border: 1px solid #4b5563;
    background: #020617;
    color: #e5e7eb;
    font-size: 0.95rem;
    box-sizing: border-box; /* Importante para padding */
  }

  input:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.7);
  }

  .auth-button {
    margin-top: 0.75rem;
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.75rem;
    border: none;
    background: linear-gradient(135deg, #6366f1, #ec4899);
    color: white;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.95rem;
    transition:
      transform 0.1s ease,
      box-shadow 0.15s ease,
      filter 0.15s ease;
  }

  .auth-button:hover:not(:disabled) {
    filter: brightness(1.05);
    box-shadow: 0 12px 30px rgba(99, 102, 241, 0.4);
    transform: translateY(-1px);
  }

  .auth-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    filter: grayscale(0.4);
  }

  .auth-error {
    margin-bottom: 1rem;
    padding: 0.6rem 0.8rem;
    border-radius: 0.6rem;
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(248, 113, 113, 0.5);
    color: #fecaca;
    font-size: 0.85rem;
    text-align: center;
  }

  .auth-footer {
    margin-top: 1.25rem;
    font-size: 0.85rem;
    color: #9ca3af;
    text-align: center;
  }

  .auth-footer a {
    color: #a855f7;
    text-decoration: none;
    font-weight: 600;
  }

  .auth-footer a:hover {
    text-decoration: underline;
  }
</style>
