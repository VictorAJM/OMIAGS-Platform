<script lang="ts">
  import { onMount } from "svelte";

  let username = "";
  let viewerType = "student";
  let isLoading = true;

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
