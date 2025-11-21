<script lang="ts">
  import MetricCard from "../../lib/components/MetricCard.svelte";
  import CourseProgressCard from "../../lib/components/CourseProgressCard.svelte";
  import TopStudentsCard from "../../lib/components/TopStudentsCard.svelte";
  import StatsCard from "../../lib/components/StatsCard.svelte";
  import NavBar from "../../lib/components/NavBar.svelte";
  import { onMount } from "svelte";

  let metrics = {
    totalStudents: 0,
    totalEnrollments: 0,
    completionRate: 0,
    averageProgress: 0,
  };

  let courseProgress = [];
  let topStudents = [];
  let username = "";
  let viewerType = "student";
  let loading = true;

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  onMount(async () => {
    try {
      const userRes = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: "include",
      });
      if (!userRes.ok) throw new Error("Auth Error");
      const userData = await userRes.json();
      username = userData.name;
      viewerType = userData.role;

      const coursesRes = await fetch(`${API_BASE}/api/courses`, {
        credentials: "include",
      });
      const myCourses = await coursesRes.json();
      const myCourseIds = new Set(myCourses.map((c: any) => c.id));

      const enrollmentsRes = await fetch(
        `${API_BASE}/api/enrollments/all`,
        { credentials: "include" },
      );
      const allEnrollments = await enrollmentsRes.json();

      const relevantEnrollments = allEnrollments.filter(
        (e: any) => e.course && myCourseIds.has(e.course._id),
      );

      // 1. Calcular Métricas Globales
      const uniqueStudents = new Set(
        relevantEnrollments.map((e: any) => e.student._id),
      );
      const completedCount = relevantEnrollments.filter(
        (e: any) => e.studentProgress === 100,
      ).length;
      const totalProgressSum = relevantEnrollments.reduce(
        (acc: number, curr: any) => acc + curr.studentProgress,
        0,
      );

      metrics = {
        totalStudents: uniqueStudents.size,
        totalEnrollments: relevantEnrollments.length,
        completionRate:
          relevantEnrollments.length > 0
            ? Math.round((completedCount / relevantEnrollments.length) * 100)
            : 0,
        averageProgress:
          relevantEnrollments.length > 0
            ? Math.round(totalProgressSum / relevantEnrollments.length)
            : 0,
      };

      // 2. Calcular Progreso por Curso
      const courseStatsMap = new Map();

      // Inicializar mapa con mis cursos
      myCourses.forEach((c: any) => {
        courseStatsMap.set(c.id, {
          name: c.name,
          totalProgress: 0,
          students: 0,
        });
      });

      relevantEnrollments.forEach((e: any) => {
        const cStats = courseStatsMap.get(e.course._id);
        if (cStats) {
          cStats.totalProgress += e.studentProgress;
          cStats.students += 1;
        }
      });

      courseProgress = Array.from(courseStatsMap.values())
        .map((c: any) => ({
          name: c.name,
          students: c.students,
          progress:
            c.students > 0 ? Math.round(c.totalProgress / c.students) : 0,
        }))
        .sort((a, b) => b.progress - a.progress); // Ordenar por mejor desempeño

      // 3. Calcular Top Estudiantes
      const studentStatsMap = new Map();

      relevantEnrollments.forEach((e: any) => {
        const sId = e.student._id;
        const current = studentStatsMap.get(sId);
        const lessonsCompleted = e.completedLessons
          ? e.completedLessons.length
          : 0;

        if (current) {
          current.totalProgress += e.studentProgress;
          current.totalLessons += lessonsCompleted;
          current.courseCount += 1;
        } else {
          studentStatsMap.set(sId, {
            name: e.student.name,
            totalProgress: e.studentProgress,
            totalLessons: lessonsCompleted,
            courseCount: 1,
          });
        }
      });

      topStudents = Array.from(studentStatsMap.values())
        .map((s: any) => ({
          name: s.name,
          completed: s.totalLessons, // Total de lecciones completadas en todos mis cursos
          progress: Math.round(s.totalProgress / s.courseCount),
        }))
        .sort((a, b) => b.progress - a.progress) // Ordenar por progreso
        .slice(0, 5); // Top 5

      loading = false;
    } catch (err) {
      console.error(err);
      loading = false;
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

  {#if loading}
    <div class="loading-container">Cargando análisis...</div>
  {:else}
    <div class="metrics-grid">
      <MetricCard
        icon="👥"
        value={metrics.totalStudents}
        title="Estudiantes Únicos"
        color="#4299e1"
      />
      <MetricCard
        icon="📝"
        value={metrics.totalEnrollments}
        title="Inscripciones Totales"
        color="#48bb78"
      />
      <MetricCard
        icon="✅"
        value={metrics.completionRate + "%"}
        title="Tasa de finalización"
        color="#ed8936"
      />
      <MetricCard
        icon="📈"
        value={metrics.averageProgress + "%"}
        title="Progreso promedio"
        color="#9f7aea"
      />
    </div>

    <div class="charts-grid">
      <StatsCard title="Desempeño por Curso">
        {#if courseProgress.length === 0}
          <p class="empty-text">No hay cursos con actividad.</p>
        {:else}
          {#each courseProgress as course}
            <CourseProgressCard {course} />
          {/each}
        {/if}
      </StatsCard>

      <StatsCard title="Estudiantes Destacados">
        {#if topStudents.length === 0}
          <p class="empty-text">No hay estudiantes para mostrar.</p>
        {:else}
          {#each topStudents as student, index}
            <TopStudentsCard {student} rank={index + 1} />
          {/each}
        {/if}
      </StatsCard>
    </div>
  {/if}
</div>

<style>
  .metricas-page {
    max-width: 1200px;
    margin: auto;
    padding: 1rem;
  }
  .page-header {
    margin-bottom: 2rem;
  }
  .page-header h2 {
    font-size: 1.75rem;
    color: #2d3748;
    margin: 0;
  }
  .page-header p {
    font-size: 1rem;
    color: #718096;
    margin-top: 0.5rem;
  }

  .metrics-grid,
  .charts-grid {
    display: grid;
    gap: 1.5rem;
  }
  .metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    margin-bottom: 2rem;
  }

  .charts-grid {
    grid-template-columns: 1fr 1fr;
  }

  .loading-container {
    text-align: center;
    padding: 3rem;
    color: #718096;
    font-size: 1.2rem;
  }
  .empty-text {
    color: #a0aec0;
    text-align: center;
    padding: 2rem;
    font-style: italic;
  }

  @media (max-width: 900px) {
    .charts-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
