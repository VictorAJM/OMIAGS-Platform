<script lang="ts">
  import { onMount } from "svelte";


  let username = "";
  let viewerType = "student";
  let isLoading = true;

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

    // Redirige según el tipo de usuario
    if (viewerType === "admin") {
      window.location.href = "/adminCursos";
    } else {
      window.location.href = "/cursos";
    }

  } catch (err) {
    console.error("Failed to fetch user info", err);
    window.location.href = "/login";
  }
});

</script>