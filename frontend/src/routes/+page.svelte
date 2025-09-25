<script lang="ts">
  import NavBar from "./NavBar.svelte";
  import CourseCard from "./CourseCard.svelte";
  import { onMount } from "svelte";

  interface Course {
    title: string;
    description: string;
    progress: number;
    // Add other fields if needed
  }

  let courses: Course[] = [];
  onMount(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/courses");
      courses = await res.json();
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  });
</script>

<NavBar viewerType="student" username="Chaska" />

<main class="main-content">
  <h2>Mis Cursos</h2>
  <div class="course-list">
    {#each courses as course}
      <CourseCard
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
