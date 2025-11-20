<script lang="ts">
  import NavBar from "../../lib/components/NavBar.svelte";
  import ProgressCard from "../../lib/components/ProgressCard.svelte";
  import StatsCard from "../../lib/components/StatsCard.svelte";
  import Pagination from "../../lib/components/Pagination.svelte";
  import { onMount } from "svelte";

  interface GradeEntry {
    quizId: string;
    quiz: string;
    score: number;
    date: string;
    courseTitle: string;
    courseId: string;
    lessonId: string;
  }

  interface CourseProgress {
    id: string;
    title: string;
    completedLessons: number;
    totalLessons: number;
    progress: number;
    pendingLessons: { id: string; title: string }[];
    recentGrades: GradeEntry[];
    averageGrade: number;
  }

  let username = "";
  let viewerType = "student";
  let coursesProgress: CourseProgress[] = [];
  let loading = true;

  let currentPendingPage = 1;
  let currentGradesPage = 1;
  const itemsPerPage = 5;

  onMount(async () => {
    try {
      const userRes = await fetch("http://localhost:5000/api/auth/me", {
        credentials: "include",
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        username = userData.name;
        viewerType = userData.role;
      }

      const coursesRes = await fetch("http://localhost:5000/api/courses", {
        credentials: "include",
      });
      if (!coursesRes.ok) throw new Error("Error al obtener cursos");
      const coursesData = await coursesRes.json();

      const detailedCourses = await Promise.all(
        coursesData.map(async (course: any) => {
          const lessonsRes = await fetch(
            `http://localhost:5000/api/courses/${course.id}/lessons`,
            { credentials: "include" }
          );
          const lessonsData = await lessonsRes.json();

          const gradesPromises = lessonsData.map(async (lesson: any) => {
            try {
              const quizRes = await fetch(
                `http://localhost:5000/api/quizzes?lessonId=${lesson._id}`,
                { credentials: "include" }
              );
              
              if (!quizRes.ok) return null;
              const quizzes = await quizRes.json();

              if (quizzes && quizzes.length > 0) {
                const quiz = quizzes[0]; 
                
                const scoreRes = await fetch(
                  `http://localhost:5000/api/quizzes/quiz-score?quizId=${quiz._id}`,
                  { credentials: "include" }
                );
                
                if (!scoreRes.ok) return null;
                const scoreData = await scoreRes.json();
        
                return {
                  quizId: quiz._id,
                  quiz: quiz.title,
                  score: typeof scoreData.score === 'number' ? scoreData.score : 0,
                  date: new Date().toISOString(),
                  courseTitle: course.name,
                  courseId: course.id,
                  lessonId: lesson._id
                } as GradeEntry;
                
              }
              return null; 
            } catch (e) {
              return null;
            }
          });

          const results = await Promise.all(gradesPromises);
          const validGrades = results.filter((g): g is GradeEntry => g !== null && g !== undefined);

          const avgGrade = validGrades.length > 0
            ? parseFloat((validGrades.reduce((acc, curr) => acc + curr.score, 0) / validGrades.length).toFixed(2))
            : 0;

          const pending = lessonsData
            .filter((l: any) => !l.completed)
            .map((l: any) => ({ id: l._id, title: l.title }));

          const completedCount = lessonsData.filter((l: any) => l.completed).length;

          return {
            id: course.id,
            title: course.name,
            completedLessons: completedCount,
            totalLessons: lessonsData.length,
            progress: course.personalProgress || 0,
            pendingLessons: pending,
            recentGrades: validGrades,
            averageGrade: avgGrade,
          };
        })
      );

      coursesProgress = detailedCourses;
    } catch (error) {
      console.error(error);
    } finally {
      loading = false;
    }
  });

  $: globalAverage = (() => {
    const allGrades = coursesProgress.flatMap(c => c.recentGrades);
    if (allGrades.length === 0) return 0;
    const sum = allGrades.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(sum / allGrades.length);
  })();

  $: totalCompleted = coursesProgress.reduce((sum, c) => sum + c.completedLessons, 0);
  
  $: totalPendingLessons = coursesProgress.reduce((sum, c) => sum + c.pendingLessons.length, 0);
  
  $: paginatedPendingLessons = (() => {
    const all = coursesProgress.flatMap(c => 
      c.pendingLessons.map(l => ({...l, courseTitle: c.title, courseId: c.id}))
    );
    const start = (currentPendingPage - 1) * itemsPerPage;
    return all.slice(start, start + itemsPerPage);
  })();
  $: totalPendingPages = Math.ceil(totalPendingLessons / itemsPerPage) || 1;

  $: allRecentGrades = coursesProgress
      .flatMap(c => c.recentGrades)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  $: paginatedRecentGrades = (() => {
    const start = (currentGradesPage - 1) * itemsPerPage;
    return allRecentGrades.slice(start, start + itemsPerPage);
  })();

  $: totalRecentGrades = allRecentGrades.length;
  $: totalGradesPages = Math.ceil(totalRecentGrades / itemsPerPage) || 1;

  function handlePendingPageChange(page: number) { currentPendingPage = page; }
  function handleGradesPageChange(page: number) { currentGradesPage = page; }
  function continueLesson(courseId: string, lessonId: string) {
    window.location.href = `/cursos/${courseId}`;
  }
</script>

<NavBar {viewerType} {username} />

<div class="progress-page">
  <div class="page-header">
    <div class="header-info">
      <h2>Mi Progreso Académico</h2>
      <p>Revisa tu avance, calificaciones y desempeño.</p>
    </div>
  </div>

  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-icon">📚</div>
      <div class="metric-content">
        <h3>{coursesProgress.length}</h3>
        <p>Cursos Inscritos</p>
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-icon">✅</div>
      <div class="metric-content">
        <h3>{totalCompleted}</h3>
        <p>Lecciones Completadas</p>
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-icon">📝</div>
      <div class="metric-content">
        <h3>{totalRecentGrades}</h3>
        <p>Exámenes Realizados</p>
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-icon">🏆</div>
      <div class="metric-content">
        <h3>{globalAverage}%</h3>
        <p>Promedio General</p>
      </div>
    </div>
  </div>

  <div class="progress-grid">
    {#if loading}
      <p>Cargando progreso...</p>
    {:else}
      {#each coursesProgress as course}
        <ProgressCard {course} />
      {/each}
    {/if}
  </div>

  <div class="detailed-stats">
    
    <StatsCard title="Próximas Lecciones Pendientes">
      <div class="stats-content">
        <div class="pending-lessons-list">
          {#each paginatedPendingLessons as lesson}
            <div class="lesson-item">
              <span class="course-badge">{lesson.courseTitle}</span>
              <span class="lesson-title">{lesson.title}</span>
              <button
                class="resume-btn"
                on:click={() => continueLesson(lesson.courseId, lesson.id)}
              >
                Continuar
              </button>
            </div>
          {:else}
            <div class="no-items">
              <div class="no-items-icon">🎉</div>
              <p>¡Estás al día!</p>
              <small>No tienes lecciones pendientes</small>
            </div>
          {/each}
        </div>

        {#if totalPendingPages > 1}
          <div class="pagination-info">
            <span class="pagination-text">
              Página {currentPendingPage} de {totalPendingPages}
            </span>
            <Pagination
              currentPage={currentPendingPage}
              totalPages={totalPendingPages}
              onPageChange={handlePendingPageChange}
            />
          </div>
        {/if}
      </div>
    </StatsCard>

    <StatsCard title="Historial de Calificaciones">
      <div class="stats-content">
        <div class="grades-list">
          {#each paginatedRecentGrades as grade}
            <div class="grade-item">
              <div class="grade-info">
                <span class="quiz-name">{grade.quiz}</span>
                <span class="course-name">{grade.courseTitle}</span>
              </div>
              
              <div class="grade-score {
                  grade.score >= 90 ? 'excellent-score' : 
                  grade.score >= 80 ? 'high-score' : 
                  grade.score >= 70 ? 'medium-score' : 'low-score'
                }">
                {grade.score}%
              </div>
              
              <button
                class="review-btn"
                on:click={() => continueLesson(grade.courseId, grade.lessonId)}
              >
                Ver Quiz
              </button>

            </div>
          {:else}
            <div class="no-items">
              <div class="no-items-icon">📊</div>
              <p>Sin calificaciones aún</p>
              <small>Completa lecciones y quizzes para ver tu historial</small>
            </div>
          {/each}
        </div>

        {#if totalGradesPages > 1}
          <div class="pagination-info">
            <span class="pagination-text">
              Página {currentGradesPage} de {totalGradesPages}
            </span>
            <Pagination
              currentPage={currentGradesPage}
              totalPages={totalGradesPages}
              onPageChange={handleGradesPageChange}
            />
          </div>
        {/if}
      </div>
    </StatsCard>
  </div>
</div>

<style>
  .progress-page {
    max-width: 1200px;
    margin: auto;
    padding: 1rem;
    background: #f9fafb;
    min-height: calc(100vh - 60px);
  }

  .page-header {
    margin-bottom: 2rem;
    text-align: center;
  }

  .page-header h2 {
    font-size: 2rem;
    color: #2d3748;
    margin: 0;
    font-weight: 700;
  }

  .page-header p {
    font-size: 1.1rem;
    color: #718096;
    margin: 0.5rem 0 0 0;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2.5rem;
  }

  .metric-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s ease;
  }

  .metric-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }

  .metric-icon {
    font-size: 2.5rem;
  }

  .metric-content h3 {
    font-size: 2rem;
    color: #2d3748;
    margin: 0;
    font-weight: 700;
  }

  .metric-content p {
    color: #718096;
    margin: 0.25rem 0 0 0;
    font-size: 0.95rem;
  }

  .progress-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2.5rem;
  }

  .detailed-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .stats-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 400px;
  }

  @media (max-width: 968px) {
    .detailed-stats {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .progress-grid {
      grid-template-columns: 1fr;
    }

    .metrics-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    .metrics-grid {
      grid-template-columns: 1fr;
    }
  }

  .pending-lessons-list,
  .grades-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    flex: 1;
  }

  .lesson-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    gap: 1rem;
    transition: all 0.2s ease;
  }

  .lesson-item:hover {
    border-color: #4299e1;
    box-shadow: 0 2px 4px rgba(66, 153, 225, 0.1);
  }

  .course-badge {
    background: #4299e1;
    color: white;
    padding: 0.35rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .lesson-title {
    flex: 1;
    color: #2d3748;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .resume-btn {
    background: #48bb78;
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 600;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .resume-btn:hover {
    background: #38a169;
    transform: translateY(-1px);
  }

  .grade-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    gap: 1rem;
    transition: all 0.2s ease;
  }

  .grade-item:hover {
    border-color: #e2e8f0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .grade-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .quiz-name {
    font-weight: 600;
    color: #2d3748;
    font-size: 0.9rem;
  }

  .course-name {
    font-size: 0.8rem;
    color: #718096;
    margin-top: 0.25rem;
  }

  .grade-score {
    font-weight: bold;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.8rem;
    white-space: nowrap;
    min-width: 60px;
    text-align: center;
  }

  .excellent-score {
    background: #c6f6d5;
    color: #22543d;
  }

  .high-score {
    background: #bee3f8;
    color: #2a4365;
  }

  .medium-score {
    background: #fefcbf;
    color: #744210;
  }

  .low-score {
    background: #fed7d7;
    color: #742a2a;
  }

  .no-items {
    text-align: center;
    color: #718096;
    padding: 3rem 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .no-items-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.7;
  }

  .no-items p {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .no-items small {
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .pagination-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-top: auto;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }

  .pagination-text {
    font-size: 0.8rem;
    color: #718096;
    text-align: center;
  }

  .review-btn {
    background: #4299e1; /* Azul en lugar de verde */
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 600;
    transition: all 0.2s ease;
    white-space: nowrap;
    margin-left: 1rem;
  }

  .review-btn:hover {
    background: #3182ce;
    transform: translateY(-1px);
  }
</style>