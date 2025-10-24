<script lang="ts">
  import NavBar from "../../lib/components/NavBar.svelte";
  import ProfileInfo from "../../lib/components/ProfileInfo.svelte";
  import ProfileSettings from "../../lib/components/ProfileSettings.svelte";
  import { onMount } from "svelte";

  let username = "";
  let viewerType = "student";
  let userId = "";
  let email = "";
  let password = "********";
  let notifications = true;

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
      email = userData.email;
      userId = userData.id;
      viewerType = userData.role || "student";
    } catch (err) {
      console.error("Failed to fetch user data", err);
    }
  });
</script>

<NavBar {viewerType} {username} />

<main class="profile-page">
  <h2 class="title">Perfil del Alumno</h2>
  <p class="subtitle text-gray-500 mb-6">ID: {userId}</p>

  <div class="grid gap-8 md:grid-cols-2">
    <ProfileInfo bind:username bind:email bind:password />
    <ProfileSettings bind:notifications />
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
</style>
