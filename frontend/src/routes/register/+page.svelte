<script>
  let name = "";
  let email = "";
  let password = "";
  let confirm = "";
  let msg = "";

  async function handleRegister(e) {
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
      console.log(json.token);
      // Guardar token como cookie (igual que en login)
      document.cookie = `session=${json.token}; path=/; SameSite=Lax`;

      // Redirige al inicio (o a /login si prefieres)
      window.location.href = "/";
    } catch (err) {
      msg = err.message;
    }
  }
</script>

<div style="max-width:420px;margin:40px auto;font-family:sans-serif">
  <h1>Crear cuenta</h1>
  {#if msg}<div style="color:#b00020;margin:8px 0">{msg}</div>{/if}

  <form on:submit={handleRegister} novalidate>
    <label for="name">Nombre</label>
    <input id="name" name="name" type="text" bind:value={name} required
           style="display:block;width:100%;padding:8px;margin:6px 0 12px;border:1px solid #ccc;border-radius:6px" />

    <label for="email">Email</label>
    <input id="email" name="email" type="email" bind:value={email} required
           style="display:block;width:100%;padding:8px;margin:6px 0 12px;border:1px solid #ccc;border-radius:6px" />

    <label for="password">Contraseña</label>
    <input id="password" name="password" type="password" bind:value={password} required minlength="8"
           style="display:block;width:100%;padding:8px;margin:6px 0 12px;border:1px solid #ccc;border-radius:6px" />

    <label for="confirm">Confirmar contraseña</label>
    <input id="confirm" name="confirm" type="password" bind:value={confirm} required minlength="8"
           style="display:block;width:100%;padding:8px;margin:6px 0 16px;border:1px solid #ccc;border-radius:6px" />

    <button style="width:100%;padding:10px;border:0;border-radius:8px;background:#111;color:#fff">
      Registrarme
    </button>
  </form>

  <p style="margin-top:12px">
    ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
  </p>
</div>
