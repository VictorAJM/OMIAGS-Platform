<script lang="ts">
  import NavBar from "../lib/components/NavBar.svelte";
  import CourseCard from "./CourseCard.svelte";
  import { onMount } from "svelte";

  interface Course {
    id: string;
    title: string;
    description: string;
    progress: number;
    // Add other fields if needed
  }

  let courses: Course[] = [];
  let username = "";
  let viewerType = "student";

  onMount(async () => {
    const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("session="))
    ?.split("=")[1];

    if (!token) {
      window.location.href = "/login"; // redirect if not logged in
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

      const courseRes = await fetch("http://localhost:5000/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      courses = await courseRes.json();
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  });
</script>

<NavBar {viewerType} {username} />

<main class="main-content">
  <h2>Mis Cursos</h2>
  <div class="course-list">
    {#each courses as course}
      <CourseCard
        id={course.id}
        title={course.title}
        description={course.description}
        progress={course.progress}
      />
    {/each}
  </div>
</main>

<style>
  .main-content {
    padding: 2rem;
    background: #f9fafb;
    min-height: calc(100vh - 60px); /* leaves space for navbar */
  }

  h2 {
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    color: #333;
  }

  .course-list {
    max-height: calc(100vh - 140px);
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  /* Custom scrollbar */
  .course-list::-webkit-scrollbar {
    width: 8px;
  }
  .course-list::-webkit-scrollbar-thumb {
    background: #bbb;
    border-radius: 4px;
  }
  .course-list::-webkit-scrollbar-thumb:hover {
    background: #888;
  }
</style>
