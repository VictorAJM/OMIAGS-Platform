<script lang="ts">
  import StudentsGrid from '../../lib/components/StudentsGrid.svelte';
  import NavBar from "../../lib/components/NavBar.svelte";
  import { onMount } from "svelte";

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
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  });


  let students = [
    { id: 1, name: 'Ana García', email: 'ana.garcia@email.com', courses: ['Algoritmos y Estructuras de Datos', 'Programación Competitiva Avanzada'], progress: 75, lastActive: '2024-01-15' },
    { id: 2, name: 'Carlos Rodríguez', email: 'carlos.rodriguez@email.com', courses: ['Matemáticas Discretas'], progress: 45, lastActive: '2024-01-14' },
    { id: 3, name: 'María López', email: 'maria.lopez@email.com', courses: ['Algoritmos y Estructuras de Datos', 'Matemáticas Discretas', 'Programación Competitiva Avanzada'], progress: 92, lastActive: '2024-01-15' },
    { id: 4, name: 'Juan Martínez', email: 'juan.martinez@email.com', courses: ['Programación Competitiva Avanzada'], progress: 28, lastActive: '2024-01-10' }
  ];

  let searchTerm = '';
  let sortBy = 'name';

  $: filteredStudents = students
    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => sortBy === 'name' ? a.name.localeCompare(b.name) : b.progress - a.progress);

  function exportToCSV() {
    alert('Exportando lista de estudiantes...');
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

  <StudentsGrid students={filteredStudents} />
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
</style>