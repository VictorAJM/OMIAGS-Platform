<script lang="ts">
  import ProfileCard from '../../lib/components/AdminProfileCard.svelte';
  import SecurityCard from '../../lib/components/AdminSecurityCard.svelte';
  import AccountInfoCard from '../../lib/components/AdminAccountInfoCard.svelte';
  import NavBar from "../../lib/components/NavBar.svelte";
  import { onMount } from "svelte";


  let username = "";
  let viewerType = "student";

  onMount(async () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("session="))
      ?.split("=")[1];

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const userRes = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (userRes.status === 401) {
        document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/login";
        return;
      }

      const userData = await userRes.json();
      username = userData.name;
      viewerType = userData.role || "student";
    } catch (err) {
      console.error("Failed to fetch user data", err);
    }
  });


  let profile = {
    name: 'Chaska',
    email: 'tallerista@ejemplo.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  let isEditing = false;
  let showPasswordForm = false;
  let saveMessage = '';

  function toggleEdit() { isEditing = !isEditing; }
  function saveProfile() {
    saveMessage = '✅ Perfil actualizado correctamente';
    setTimeout(() => saveMessage = '', 3000);
    isEditing = false;
  }

  const accountInfo = [
    { label: 'Rol', value: 'Tallerista' },
    { label: 'Fecha de registro', value: '15 Enero, 2024' },
    { label: 'Cursos activos', value: '3 cursos' },
    { label: 'Estudiantes totales', value: '145 estudiantes' }
  ];
</script>

<NavBar {viewerType} {username} />

<div class="configuracion-page">
  <div class="page-header">
    <h2>Configuración de Perfil</h2>
    <p>Gestiona tu información personal y seguridad</p>
  </div>

  <div class="profile-content">
    <ProfileCard {profile}/>
    <AccountInfoCard info={accountInfo}/>
    <SecurityCard {profile} showPasswordForm={showPasswordForm} toggleForm={() => showPasswordForm = !showPasswordForm}/>
  </div>
</div>

<style>
.configuracion-page {
  max-width: 900px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: 'Inter', sans-serif;
}

.page-header {
  margin-bottom: 2.5rem;
  text-align: center;
}
.page-header h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}
.page-header p {
  font-size: 1rem;
  color: #718096;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Optional: add subtle animations when cards appear */
.profile-content > * {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.profile-content > *:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .configuracion-page {
    padding: 0.5rem;
  }
}
</style>
