<script lang="ts">
  import NavBar from "../../lib/components/NavBar.svelte";
  import StudentsGrid from "../../lib/components/StudentsGrid.svelte";
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";

  interface StudentRow {
    id: string;
    name: string;
    email: string;
    courses: string[];
    lessonProgress: number;
    quizAverage: number;
    totalCourses: number;
  }

  let username = "";
  let viewerType = "student";
  let students: StudentRow[] = [];
  let loading = true;

  // UI Variables
  let searchTerm = "";
  type SortOption = "name" | "progress" | "grades";
  let sortBy: SortOption = "name";
  let sortDirection: "asc" | "desc" = "asc";

  onMount(async () => {
    try {
      // 1. Auth
      const userRes = await fetch("http://localhost:5000/api/auth/me", { credentials: "include" });
      if (userRes.ok) {
        const userData = await userRes.json();
        username = userData.name;
        viewerType = userData.role;
      } else {
        throw new Error("Error auth");
      }

      // 2. Fetch Students directly from the new API endpoint
      // This endpoint (/my-students) now handles all the deep fetching and aggregation on the server
      const studentsRes = await fetch("http://localhost:5000/api/enrollments/my-students", { credentials: "include" });
      
      if (studentsRes.ok) {
        students = await studentsRes.json();
        console.log(students);
      } else {
        console.error("Error fetching students list");
        // Optional: Handle error UI here
      }

    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      loading = false;
    }
  });

  // --- UI Helpers ---
  function setSort(option: SortOption) {
    if (sortBy === option) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortBy = option;
      sortDirection = (option === "progress" || option === "grades") ? "desc" : "asc";
    }
  }

  $: filteredStudents = students
    .filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let valA, valB;
      if (sortBy === 'name') {
        return sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      if (sortBy === 'progress') { valA = a.lessonProgress; valB = b.lessonProgress; } 
      else { valA = a.quizAverage; valB = b.quizAverage; }
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });

  function exportToCSV() {
    const headers = "Nombre,Email,Lecciones (%),Quizzes (%),Cursos\n";
    const rows = filteredStudents.map(s => 
      `"${s.name}","${s.email}","${s.lessonProgress}%","${s.quizAverage}%","${s.courses.join(", ")}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "estudiantes_completo.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
</script>

<NavBar {viewerType} {username} />

<div class="page-container">
  <div class="content-wrapper">
    
    <header class="page-header">
      <div class="header-content">
        <div class="title-group">
          <h2>Monitor de Estudiantes</h2>
          {#if !loading}
            <div class="badge-counter" in:fade>{filteredStudents.length} alumnos</div>
          {/if}
        </div>
        <p class="subtitle">Visualiza el progreso académico y calificaciones detalladas.</p>
      </div>
      <button class="btn-export" on:click={exportToCSV} disabled={loading || students.length === 0}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span>Exportar CSV</span>
      </button>
    </header>

    <div class="controls-bar">
      <div class="search-container">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" placeholder="Buscar..." bind:value={searchTerm} />
      </div>
      <div class="sort-group">
        <span class="sort-label">Ordenar:</span>
        <div class="segmented-control">
          <button class="segment-btn" class:active={sortBy === 'name'} on:click={() => setSort('name')}>Nombre {#if sortBy === 'name'}<span class="arrow">{sortDirection === 'asc' ? '↓' : '↑'}</span>{/if}</button>
          <button class="segment-btn" class:active={sortBy === 'progress'} on:click={() => setSort('progress')}>Avance {#if sortBy === 'progress'}<span class="arrow">{sortDirection === 'desc' ? '↓' : '↑'}</span>{/if}</button>
          <button class="segment-btn" class:active={sortBy === 'grades'} on:click={() => setSort('grades')}>Notas {#if sortBy === 'grades'}<span class="arrow">{sortDirection === 'desc' ? '↓' : '↑'}</span>{/if}</button>
        </div>
      </div>
    </div>

    <div class="grid-container">
      {#if loading}
        <div class="loading-state" in:fade>
          <div class="spinner"></div>
          <p>Cargando datos...</p>
        </div>
      {:else}
        <div in:fly={{ y: 20, duration: 400 }}>
          <StudentsGrid students={filteredStudents} />
        </div>
      {/if}
    </div>

  </div>
</div>

<style>
  /* Estilos idénticos a la versión anterior para mantener la consistencia */
  .page-container { background-color: #f1f5f9; min-height: 100vh; padding: 2rem 1rem; font-family: 'Inter', sans-serif; }
  .content-wrapper { max-width: 1100px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 2.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
  .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; gap: 2rem; }
  .title-group { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
  h2 { margin: 0; font-size: 1.75rem; font-weight: 700; color: #0f172a; }
  .badge-counter { background-color: #f1f5f9; color: #475569; font-size: 0.8rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 999px; border: 1px solid #e2e8f0; }
  .subtitle { margin: 0; color: #64748b; font-size: 1rem; }
  .btn-export { display: flex; align-items: center; gap: 0.5rem; background-color: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 0.6rem 1rem; border-radius: 8px; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
  .btn-export:hover:not(:disabled) { background-color: #f8fafc; border-color: #94a3b8; transform: translateY(-1px); }
  .controls-bar { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1.5rem; margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid #f1f5f9; }
  .search-container { position: relative; flex: 1; min-width: 280px; max-width: 400px; }
  .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
  .search-container input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; font-size: 0.95rem; border: 1px solid #e2e8f0; border-radius: 10px; box-sizing: border-box; }
  .search-container input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
  .sort-group { display: flex; align-items: center; gap: 1rem; }
  .sort-label { font-size: 0.9rem; font-weight: 500; color: #64748b; }
  .segmented-control { display: flex; background-color: #f1f5f9; padding: 4px; border-radius: 10px; }
  .segment-btn { display: flex; align-items: center; gap: 6px; padding: 0.4rem 1rem; font-size: 0.85rem; font-weight: 500; color: #64748b; background: transparent; border: none; border-radius: 7px; cursor: pointer; transition: all 0.2s; }
  .segment-btn:hover:not(.active) { color: #334155; background: rgba(0,0,0,0.03); }
  .segment-btn.active { background-color: #ffffff; color: #0f172a; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .arrow { color: #3b82f6; font-weight: 800; font-size: 0.75em; }
  .grid-container { min-height: 300px; }
  .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; color: #64748b; gap: 1rem; }
  .loading-hint { font-size: 0.85rem; color: #94a3b8; }
  .spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (max-width: 768px) { .page-header { flex-direction: column; gap: 1.5rem; } .controls-bar { flex-direction: column; align-items: stretch; } .search-container { max-width: none; } .sort-group { justify-content: space-between; } .sort-label { display: none; } .segmented-control { flex: 1; justify-content: space-between; } .segment-btn { flex: 1; justify-content: center; } }
</style>  