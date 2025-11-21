<script lang="ts">
  import ProfileCard from "../../lib/components/AdminProfileCard.svelte";
  import SecurityCard from "../../lib/components/PasswordChangeCard.svelte";
  import AccountInfoCard from "../../lib/components/AdminAccountInfoCard.svelte";
  import NavBar from "../../lib/components/NavBar.svelte";
  import { onMount } from "svelte";

  // --- Estado de sesión/usuario UI ---
  let username = "";
  let viewerType = "student";

  // --- Perfil editable (se rellena desde API) ---
  let profile = {
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  // --- Info de cuenta (se arma con datos del backend) ---
  let accountInfo: Array<{ label: string; value: string }> = [];

  let isEditing = false;
  let showPasswordForm = false;
  let saveMessage = "";

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Utilidad para obtener token JWT de la cookie "session"

  // Cargar usuario y poblar tarjetas
  onMount(async () => {
    try {
      // Datos mínimos de sesión/rol
      const meRes = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: "include",
      });

      if (meRes.status === 401) {
        window.location.href = "/login";
        return;
      }

      const me = await meRes.json();
      username = me.name;
      viewerType = me.role || "student";

      profile.name = me.name ?? "";
      profile.email = me.email ?? "";
      accountInfo = [
        { label: "Rol", value: me.role || "Usuario" },
        {
          label: "Fecha de registro",
          value: me.createdAt
            ? new Date(me.createdAt).toLocaleDateString()
            : "—",
        },
        { label: "Cursos activos", value: "—" },
        { label: "Estudiantes totales", value: "—" },
      ];
    } catch (err) {
      console.error("Failed to fetch user data", err);
    }
  });

  // Guardar nombre/email
  async function saveProfile() {
    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: profile.name, email: profile.email }),
      });

      if (!res.ok) throw new Error(await res.text());
      saveMessage = "✅ Perfil actualizado correctamente";
      isEditing = false;
      setTimeout(() => (saveMessage = ""), 3000);
    } catch (e) {
      console.error(e);
      saveMessage = "❌ Error al actualizar el perfil";
      setTimeout(() => (saveMessage = ""), 3000);
    }
  }

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
      const me = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: "include",
      });

      if (!me.ok) throw new Error("No se pudo validar token");
      const user = await me.json();

      // Llamar endpoint real para cambiar contraseña
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: profile.currentPassword,
          newPassword: profile.newPassword,
        }),
      });

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

  function toggleEdit() {
    isEditing = !isEditing;
  }
</script>

<NavBar {viewerType} {username} />

<div class="configuracion-page">
  <div class="page-header">
    <h2>Configuración de Perfil</h2>
    <p>Gestiona tu información personal y seguridad</p>
    {#if saveMessage}<div class="flash">{saveMessage}</div>{/if}
  </div>

  <div class="profile-content">
    <!-- Asumiendo que ProfileCard permite bind y callbacks simples -->
    <ProfileCard
      {profile}
      {isEditing}
      on:toggleEdit={toggleEdit}
      on:saveProfile={saveProfile}
    />

    <AccountInfoCard info={accountInfo} />

    <!-- Pasamos funciones para que el componente pueda invocarlas -->
    <SecurityCard
      {profile}
      {showPasswordForm}
      toggleForm={() => (showPasswordForm = !showPasswordForm)}
      on:submitPassword={changePassword}
      on:changePassword={changePassword}
    />
  </div>
</div>

<style>
  /* --- Modo oscuro consistente --- */
  :global(body) {
    background: #f9fafb;
    color: #1a1a1b;
  }

  /* Contenedor */
  .configuracion-page {
    max-width: 900px;
    margin: 2rem auto;
    padding: 1rem;
    font-family:
      Inter,
      system-ui,
      -apple-system,
      Segoe UI,
      Roboto,
      Ubuntu,
      Cantarell,
      Noto Sans,
      Helvetica Neue,
      Arial,
      "Apple Color Emoji",
      "Segoe UI Emoji";
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

  /* Layout de tarjetas */
  .profile-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .profile-content > * {
    background: #121935;
    border: 1px solid #253056;
    border-radius: 16px;
    padding: 1rem;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      border-color 0.2s ease;
  }
  .profile-content > *:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
    border-color: #2f3b6a;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .configuracion-page {
      padding: 0.5rem;
    }
  }
</style>
