<script lang="ts">
  let name = "";
  let email = "";
  let password = "";
  let confirm = "";
  let msg = "";

  async function handleRegister(e: Event) {
    e.preventDefault();
    msg = "";

    if (password !== confirm) {
      msg = "Las contraseñas no coinciden";
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "No se pudo registrar");
      }

      if (json?.token) {
        document.cookie = `session=${json.token}; path=/; SameSite=Lax`;
      }

      window.location.href = "/";
    } catch (err: any) {
      msg = err.message ?? "Error inesperado";
    }
  }
</script>

<div class="auth-wrapper">
  <div class="auth-card">
    <h1>Crear cuenta</h1>

    {#if msg}
      <div class="auth-error">{msg}</div>
    {/if}

    <form on:submit|preventDefault={handleRegister} novalidate>
      <label for="name">Nombre</label>
      <input
        id="name"
        name="name"
        type="text"
        bind:value={name}
        required
      />

      <label for="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        bind:value={email}
        required
      />

      <label for="password">Contraseña</label>
      <input
        id="password"
        name="password"
        type="password"
        bind:value={password}
        minlength="8"
        required
      />

      <label for="confirm">Confirmar contraseña</label>
      <input
        id="confirm"
        name="confirm"
        type="password"
        bind:value={confirm}
        minlength="8"
        required
      />

      <button class="auth-button">
        Registrarme
      </button>
    </form>

    <p class="auth-footer">
      ¿Ya tienes cuenta?
      <a href="/login">Inicia sesión</a>
    </p>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: radial-gradient(circle at top, #1f2937 0, #020617 45%, #000 100%);
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
    margin-bottom: -4px;
  }

  input {
    width: 100%;
    padding: 0.7rem 0.85rem;
    border-radius: 0.6rem;
    border: 1px solid #4b5563;
    background: #020617;
    color: #e5e7eb;
    font-size: 0.95rem;
    box-sizing: border-box;
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
    transition: transform 0.1s ease, box-shadow 0.15s ease, filter 0.15s ease;
  }

  .auth-button:hover {
    filter: brightness(1.05);
    box-shadow: 0 12px 30px rgba(99, 102, 241, 0.4);
    transform: translateY(-1px);
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