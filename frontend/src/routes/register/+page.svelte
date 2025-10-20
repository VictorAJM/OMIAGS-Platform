<script>
  let email = "";
  let password = "";
  let msg = "";

  async function handleLogin(e) {
    e.preventDefault();
    msg = "";

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Error al iniciar sesión");
      }

      // Guardar token como cookie (si el backend no la genera)
      if (json?.token) {
        document.cookie = `session=${json.token}; path=/; SameSite=Lax`;
      }

      // Redirige al inicio o dashboard
      window.location.href = "/";
    } catch (err) {
      msg = err.message;
    }
  }
</script>

<div style="max-width:420px;margin:40px auto;font-family:sans-serif">
  <h1>Iniciar sesión</h1>
  {#if msg}<div style="color:#b00020;margin:8px 0">{msg}</div>{/if}

  <form on:submit={handleLogin} novalidate>
    <label for="email">Email</label>
    <input
      id="email"
      name="email"
      type="email"
      bind:value={email}
      required
      style="display:block;width:100%;padding:8px;margin:6px 0 12px;border:1px solid #ccc;border-radius:6px"
    />

    <label for="password">Contraseña</label>
    <input
      id="password"
      name="password"
      type="password"
      bind:value={password}
      required
      style="display:block;width:100%;padding:8px;margin:6px 0 16px;border:1px solid #ccc;border-radius:6px"
    />

    <button
      style="width:100%;padding:10px;border:0;border-radius:8px;background:#111;color:#fff">
      Entrar
    </button>
  </form>

  <p style="margin-top:12px">
    ¿No tienes cuenta?
    <a href="/register" style="color:#6c2bd9;text-decoration:none;font-weight:bold">
      Crear cuenta
    </a>
  </p>
</div>
