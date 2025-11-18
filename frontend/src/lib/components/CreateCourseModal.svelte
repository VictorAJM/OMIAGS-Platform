<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { scale } from 'svelte/transition';
  import { slide } from 'svelte/transition';

  const dispatch = createEventDispatcher();
  
  let loading = false;
  let msg = '';

  // Variables para la creación del curso
  let title = "";
  let description = "";
  let category = "Secundaria";
  
  // Variables para la lista de estudiantes
  let students: string[] = [];
  let newStudentEmail = "";

  function addStudent() {
    const val = newStudentEmail.trim().toLowerCase(); // Normalizar email
    if (!val) return;

    if (students.includes(val)) {
      msg = "Este estudiante ya está agregado.";
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      msg = "Ingresa un correo válido.";
      return;
    }
    
    students = [...students, val];
    newStudentEmail = "";
    msg = "";
  }

  function removeStudent(index: number) {
    students = students.filter((_, i) => i !== index);
  }

  async function createCourse(e: Event) {
    e.preventDefault();
    loading = true;
    msg = '';

    try {
      const token = document.cookie.split("; ")
      .find((row) => row.startsWith("session="))
      ?.split("=")[1];
      
      const res = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({
          title,
          description,
          category,
          accessList: students, // 🔑 Envía la lista de emails de estudiantes
        })
      });

      const data = await res.json(); 

      if (!res.ok) {
        throw new Error(data.message || 'Error al crear el curso');
      }

      dispatch("created", data);
      dispatch("close");

    } catch (err: any) {
      msg = err.message || "No se pudo crear el curso";
      console.error("Request failed:", err);
    } finally {
      loading = false;
    }
  }
</script>

<div class="modal-backdrop" on:click|self={() => dispatch('close')}>
  <div class="modal" on:click|stopPropagation in:scale>
    <h3 class="modal-title">Crear Nuevo Curso</h3>

    <form class="form" on:submit={createCourse}>
      
      {#if msg}
        <div class="alert" transition:slide>{msg}</div>
      {/if}
      
      <div class="form-group">
        <label>Nombre del curso</label>
        <input
          type="text"
          placeholder="Ej: Matemáticas Básicas"
          bind:value={title}
          required
        />
      </div>

      <div class="form-group">
        <label>Nivel</label>
        <select bind:value={category}>
          <option value="Secundaria">Secundaria</option>
          <option value="Preparatoria">Preparatoria</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="student-input">Estudiantes a inscribir (Email)</label>
        <div class="add-student-row">
          <input 
            id="student-input" 
            type="email" 
            placeholder="correo@ejemplo.com" 
            bind:value={newStudentEmail} 
            on:keydown={(e) => e.key === 'Enter' && (e.preventDefault() || addStudent())}
          />
          <button type="button" class="add-btn" on:click={addStudent}>Agregar</button>
        </div>

        <div class="student-list">
          {#if students.length === 0}
            <p class="empty-text">Sin estudiantes inscritos.</p>
          {:else}
            {#each students as student, i}
              <div class="student-tag" transition:slide>
                <span>{student}</span>
                <button type="button" class="remove-btn" on:click={() => removeStudent(i)} title="Remover">&times;</button>
              </div>
            {/each}
          {/if}
        </div>
        <small style="color: #718096; font-size: 0.8rem;">* Los usuarios deben estar registrados previamente.</small>
      </div>
      <div class="form-group">
        <label>Descripción</label>
        <textarea
          placeholder="Describe el contenido del curso..."
          rows="3"
          bind:value={description}
          required
        ></textarea>
      </div>

      <div class="form-actions">
        <button
          type="button"
          class="btn-secondary"
          on:click={() => dispatch('close')}
          disabled={loading}
        >
          Cancelar
        </button>
        <button type="submit" class="btn-primary" disabled={loading}>
          {loading ? 'Creando...' : 'Crear Curso'}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  /* Aquí van los estilos CSS proporcionados para el modal de creación */
  /* Backdrop */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  /* Modal container */
  .modal {
    background: #ffffff;
    border-radius: 16px;
    padding: 2rem;
    width: 90%;
    max-width: 480px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  .modal-title {
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: #1f2937;
    text-align: center;
  }
  
  .alert { 
    background-color: #fff5f5;
    border-left: 4px solid #e53e3e;
    color: #c53030;
    padding: 0.75rem;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
    border-radius: 4px;
  }

  /* Form layout */
  .form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  label {
    font-size: 0.9rem;
    color: #374151;
    font-weight: 500;
  }

  input,
  textarea,
  select {
    padding: 0.75rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    font-size: 0.95rem;
    color: #111827;
    background: #f9fafb;
    transition: all 0.2s ease;
  }

  input:focus,
  textarea:focus,
  select:focus {
    border-color: #3182ce;
    background: white;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
    outline: none;
  }

  textarea {
    resize: none;
  }

  /* Add Student Styles */
  .add-student-row {
    display: flex;
    gap: 0.5rem;
  }
  
  .add-btn {
    background: #48bb78;
    color: white;
    border: none;
    border-radius: 0.5rem;
    padding: 0 1.2rem;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;
  }
  .add-btn:hover { background: #38a169; }

  .student-list {
    margin-top: 0.8rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    min-height: 40px;
    max-height: 120px;
    overflow-y: auto;
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    background: #f7fafc;
  }

  .empty-text {
    font-size: 0.85rem;
    color: #a0aec0;
    margin: auto;
    text-align: center;
  }

  .student-tag {
    display: flex;
    align-items: center;
    background: #edf2f7;
    padding: 0.35rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.85rem;
    color: #2d3748;
    border: 1px solid #cbd5e0;
  }

  .remove-btn {
    background: transparent;
    border: none;
    color: #e53e3e;
    font-weight: bold;
    margin-left: 0.5rem;
    cursor: pointer;
    font-size: 1.1rem;
    line-height: 1;
    padding: 0 2px;
    display: flex;
    align-items: center;
  }
  .remove-btn:hover { color: #c53030; }

  /* Actions */
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
  }

  .btn-primary {
    background: #3182ce;
    color: white;
    border: none;
    padding: 0.7rem 1.4rem;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .btn-primary:hover:not([disabled]) {
    background: #2563eb;
  }

  .btn-primary[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: #e5e7eb;
    color: #374151;
    border: none;
    padding: 0.7rem 1.4rem;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .btn-secondary:hover {
    background: #d1d5db;
  }
</style>