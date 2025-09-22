<script>
  import NavBar from "./NavBar.svelte";
  import CourseCard from "./CourseCard.svelte";

  // Temporary mock data – later replace with API fetch
  let courses = [
    { id: 1, title: "Programación en C++", description: "Aprende los fundamentos del C++ con ejercicios prácticos.", progress: 45, continueHref: "/courses/cpp/lesson-1" },
    { id: 2, title: "Algoritmos Avanzados", description: "Estructuras de datos y técnicas de programación competitiva.", progress: 20, continueHref: "/courses/cpp/lesson-2" },
    { id: 3, title: "Machine Learning", description: "Introducción al aprendizaje automático con Python.", progress: 70, continueHref: "/courses/cpp/lesson-3" },
  ];
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
