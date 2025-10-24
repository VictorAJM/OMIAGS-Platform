<script lang="ts">
  import MetricCard from '../../lib/components/MetricCard.svelte';
  import CourseProgressCard from '../../lib/components/CourseProgressCard.svelte';
  import TopStudentsCard from '../../lib/components/TopStudentsCard.svelte';
  import StatsCard from '../../lib/components/StatsCard.svelte';
  import NavBar from "../../lib/components/NavBar.svelte";
  import { onMount } from "svelte";

  let metrics = { totalStudents: 145, activeThisWeek: 89, completionRate: 68, averageProgress: 72 };
  let courseProgress = [
    { name: 'Algoritmos y Estructuras de Datos', progress: 75, students: 45 },
    { name: 'Programación Competitiva Avanzada', progress: 60, students: 32 },
    { name: 'Matemáticas Discretas', progress: 12, students: 28 }
  ];
  let topStudents = [
    { name: 'María López', completed: 25, progress: 92 },
    { name: 'Ana García', completed: 18, progress: 75 },
    { name: 'Pedro Sánchez', completed: 16, progress: 88 },
    { name: 'Laura Fernández', completed: 14, progress: 79 }
  ];

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

<div class="metricas-page">
  <div class="page-header">
    <div class="header-info">
      <h2>Métricas y Análisis</h2>
      <p>Visualiza el desempeño y progreso de tus cursos</p>
    </div>
  </div>

  <div class="metrics-grid">
    <MetricCard icon="👥" value={metrics.totalStudents} title="Total Estudiantes" color="#4299e1"/>
    <MetricCard icon="✅" value={metrics.completionRate + '%'} title="Tasa de finalización" color="#ed8936"/>
    <MetricCard icon="📈" value={metrics.averageProgress + '%'} title="Progreso promedio" color="#9f7aea"/>
  </div>

  <div class="charts-grid">
    <StatsCard title="Progreso por Curso">
      {#each courseProgress as course}
        <CourseProgressCard {course}/>
      {/each}
    </StatsCard>

    <StatsCard title="Top Estudiantes">
      {#each topStudents as student, index}
        <TopStudentsCard {student} rank={index + 1}/>
      {/each}
    </StatsCard>
  </div>

  <!-- Aquí podrías agregar más StatsCard para actividad semanal, distribución por nivel, etc. -->
</div>

<style>
.metricas-page { max-width: 1200px; margin: auto; padding: 1rem; }
.page-header { margin-bottom: 2rem; }
.page-header h2 { font-size: 1.75rem; color: #2d3748; }
.page-header p { font-size: 1rem; color: #718096; }
.metrics-grid, .charts-grid { display: grid; gap: 1.5rem; }
.metrics-grid { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 2rem; }
.charts-grid { grid-template-columns: 1fr 1fr; }
@media(max-width: 768px) { .charts-grid { grid-template-columns: 1fr; } }
</style>
