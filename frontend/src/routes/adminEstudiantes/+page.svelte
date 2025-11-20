<script lang="ts">
  import StudentsGrid from '../../lib/components/StudentsGrid.svelte';
  import NavBar from "../../lib/components/NavBar.svelte";
  import { onMount } from "svelte";

  interface StudentRow {
    id: string;
    name: string;
    email: string;
    courses: string[];
    progress: number;
    totalCourses: number; // <--- Nuevo campo
  }

  let username = "";
  let viewerType = "student";
  let students: StudentRow[] = [];
  let loading = true;

  const token = () =>
    document.cookie.split('; ').find((row) => row.startsWith('session='))?.split('=')[1];

  onMount(async () => {
    const t = token();

    if (!t) {
      window.location.href = "/login";
      return;
    }
    try {
      const headers = { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${t}` 
      };

      const userRes = await fetch("http://localhost:5000/api/auth/me", { headers });
      if (!userRes.ok) throw new Error("Error auth");
      const userData = await userRes.json();
      
      username = userData.name;
      viewerType = userData.role;

      const myCoursesRes = await fetch("http://localhost:5000/api/courses", { headers });
      const myCourses = await myCoursesRes.json();
      
      const myCourseIds = new Set(myCourses.map((c: any) => c.id));

      const enrollmentsRes = await fetch("http://localhost:5000/api/enrollments/all", { headers });
      const allEnrollments = await enrollmentsRes.json();

      const studentsMap = new Map<string, {
        name: string;
        email: string;
        totalProgress: number;
        courseCount: number;
        coursesList: string[];
      }>();

      allEnrollments.forEach((enrollment: any) => {
        if (enrollment.course && myCourseIds.has(enrollment.course._id)) {
          
          const studentId = enrollment.student._id;
          const currentData = studentsMap.get(studentId);

          if (currentData) {
            currentData.totalProgress += enrollment.studentProgress;
            currentData.courseCount += 1;
            currentData.coursesList.push(enrollment.course.title);
          } else {
            studentsMap.set(studentId, {
              name: enrollment.student.name,
              email: enrollment.student.email,
              totalProgress: enrollment.studentProgress,
              courseCount: 1,
              coursesList: [enrollment.course.title]
            });
          }
        }
      });

      students = Array.from(studentsMap.entries()).map(([id, data]) => {
        return {
          id: id,
          name: data.name,
          email: data.email,
          progress: Math.round(data.totalProgress / data.courseCount),
          courses: data.coursesList.slice(0, 3), 
          totalCourses: data.courseCount // <--- Guardamos el total real aquí
        };
      });

      loading = false;

    } catch (err) {
      console.error(err);
      loading = false;
    }
  });

  let searchTerm = '';
  let sortBy = 'name';

  $: filteredStudents = students
    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => sortBy === 'name' ? a.name.localeCompare(b.name) : b.progress - a.progress);

  function exportToCSV() {
    const headers = "Nombre,Email,Progreso Promedio,Cursos\n";
    const rows = filteredStudents.map(s => 
      `"${s.name}","${s.email}","${s.progress}%","${s.courses.join(', ')}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "mis_estudiantes.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
</script>

<NavBar {viewerType} {username} />

<div class="estudiantes-page">
  <div class="page-header">
    <div class="header-info">
      <h2>Gestión de Estudiantes</h2>
      <p>Administra y visualiza el progreso de tus estudiantes</p>
    </div>
    <button class="btn-primary" on:click={exportToCSV}>📊 Exportar CSV</button>
  </div>

  <div class="controls">
    <input type="text" placeholder="🔍 Buscar estudiante..." bind:value={searchTerm} class="search-box" />
    <select bind:value={sortBy} class="sort-select">
      <option value="name">Ordenar por nombre</option>
      <option value="progress">Ordenar por progreso</option>
    </select>
  </div>

  {#if loading}
    <div class="loading-state">Cargando datos de estudiantes...</div>
  {:else if students.length === 0}
    <div class="empty-state">
      <p>No tienes estudiantes inscritos en tus cursos aún.</p>
    </div>
  {:else}
    <StudentsGrid students={filteredStudents} />
  {/if}
</div>

<style>
  .estudiantes-page { max-width: 1200px; margin: auto; padding: 1rem; }
  .page-header { display: flex; flex-direction: column; gap: 1rem; justify-content: space-between; margin-bottom: 2rem; }
  @media(min-width: 768px) { .page-header { flex-direction: row; align-items: center; } }
  .header-info h2 { margin: 0 0 0.25rem 0; font-size: 1.75rem; color: #2d3748; }
  .header-info p { margin: 0; font-size: 1rem; color: #718096; }
  .controls { display: flex; gap: 1rem; margin-bottom: 2rem; align-items: center; flex-wrap: wrap; }
  .search-box { flex: 1; padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem; }
  .search-box:focus { outline: none; border-color: #3182ce; box-shadow: 0 0 0 3px rgba(49,130,206,0.1); }
  .sort-select { padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; background: white; }
  .btn-primary { background: #3182ce; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 500; cursor: pointer; }
  .btn-primary:hover { background: #2c5282; }
  
  .loading-state, .empty-state {
    text-align: center;
    padding: 3rem;
    color: #718096;
    background: #f7fafc;
    border-radius: 12px;
    border: 2px dashed #e2e8f0;
  }
</style>