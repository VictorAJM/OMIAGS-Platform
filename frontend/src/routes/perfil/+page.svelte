<script lang="ts">
  import NavBar from "../../lib/components/NavBar.svelte";
  import ProfileInfo from "../../lib/components/ProfileInfo.svelte";
  import ProfileSettings from "../../lib/components/ProfileSettings.svelte";
  import SecurityCard from "../../lib/components/PasswordChangeCard.svelte";
  import { onMount } from "svelte";

  let username = "";
  let viewerType = "student";
  let userId = "";

  let profile = {
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  export let showPasswordForm = false;
  let saveMessage = "";

  // Utilidad para obtener token JWT de la cookie "session"

  onMount(async () => {
    try {
      const userRes = await fetch("http://localhost:5000/api/auth/me", {
        credentials: "include",
      });

      if (userRes.status === 401) {
        window.location.href = "/login";
        return;
      }

      const userData = await userRes.json();
      profile.name = userData.name;
      profile.email = userData.email;
      userId = userData.id;
      viewerType = userData.role || "student";
    } catch (err) {
      console.error("Failed to fetch user data", err);
    }
  });

  async function changePassword() {
    if (
      !profile.currentPassword ||
      !profile.newPassword ||
      profile.newPassword !== profile.confirmPassword
    ) {
      saveMessage = "❌ Verifica las contraseñas";
      setTimeout(() => (saveMessage = ""), 3000);
      return;
    }

    try {
      // Obtener ID del usuario usando /api/auth/me
      const me = await fetch("http://localhost:5000/api/auth/me", {
        credentials: "include",
      });

      if (!me.ok) throw new Error("No se pudo validar token");
      const user = await me.json();

      // Llamar endpoint real para cambiar contraseña
      const res = await fetch(
        `http://localhost:5000/api/auth/change-password`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oldPassword: profile.currentPassword,
            newPassword: profile.newPassword,
          }),
        },
      );

      if (!res.ok) throw new Error(await res.text());

      saveMessage = "✅ Contraseña actualizada";

      profile.currentPassword = "";
      profile.newPassword = "";
      profile.confirmPassword = "";
      showPasswordForm = false;

      setTimeout(() => (saveMessage = ""), 3000);
    } catch (e) {
      console.error(e);
      saveMessage = "❌ Error al actualizar contraseña";
      setTimeout(() => (saveMessage = ""), 3000);
    }
  }
</script>

<NavBar {viewerType} {username} />

<main class="profile-page">
  <div class="page-header">
    <h2 class="title">Perfil del Alumno</h2>
    <p class="subtitle text-gray-500 mb-6">ID: {userId}</p>
    {#if saveMessage}<div class="flash">{saveMessage}</div>{/if}
  </div>

  <div class="grid gap-8 md:grid-cols-2">
    <ProfileInfo bind:profile />
    <SecurityCard
      {profile}
      {showPasswordForm}
      toggleForm={() => (showPasswordForm = !showPasswordForm)}
      on:submitPassword={changePassword}
      on:changePassword={changePassword}
    />
  </div>
</main>

<style>
  .profile-page {
    padding: 2rem;
    background: #f9fafb;
    min-height: calc(100vh - 60px);
  }

  .title {
    font-size: 1.8rem;
    font-weight: 600;
    color: #333;
  }

  .subtitle {
    font-size: 0.9rem;
  }

  /* Header */
  .page-header {
    margin-bottom: 2.5rem;
    text-align: center;
  }
  .page-header h2 {
    font-size: 2rem;
    font-weight: 600;
    color: #202020;
    margin-bottom: 0.5rem;
  }
  .page-header p {
    font-size: 1rem;
    color: #424242;
  }

  /* Flash message */
  .flash {
    margin-top: 0.75rem;
    display: inline-block;
    background: rgba(202, 203, 223, 0.11);
    border: 1px solid rgba(132, 133, 196, 0.144);
    color: #000000;
    padding: 0.5rem 0.75rem;
    border-radius: 10px;
  }
</style>
