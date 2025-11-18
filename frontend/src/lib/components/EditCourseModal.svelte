<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let course: any; 

  const dispatch = createEventDispatcher();
  let loading = false;
  let msg = '';

  // Local state variables
  let title = "";
  let description = "";
  let category = "Secundaria";
  let students: string[] = [];
  let newStudentEmail = "";

  // Reactivity: Update local state when the 'course' prop changes
  $: if (course) {
    title = course.title || course.name || "";
    description = course.description || "";
    category = course.category || 'Secundaria';
    
    // Handle different data shapes (strings vs objects)
    const rawStudents = course.students || course.accessList || [];
    students = rawStudents
      .map((s: any) => typeof s === 'string' ? s : s?.email)
      .filter((s: any) => s);

  }

  function addStudent() {
    const val = newStudentEmail.trim().toLowerCase(); // Normalize email
    if (!val) return;

    if (students.includes(val)) {
        msg = "Este estudiante ya está agregado.";
        return;
    }

    // Simple regex for basic email validation
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

  async function handleUpdate() {
    loading = true;
    msg = '';

    try {
      // Determine ID (handle _id vs id)
      const courseId = course.id || course._id;

      // Attempt to get token safely (fallback to empty string if strictly HttpOnly)
      let token = "";
      try {
        const match = document.cookie.match(new RegExp('(^| )session=([^;]+)'));
        if (match) token = match[2];
      } catch (e) { /* ignore cookie read errors */ }

      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 
            "Content-Type": "application/json", 
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: "include",
        body: JSON.stringify({ 
            title, 
            description, 
            category, 
            students
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar el curso');
      }
      
      dispatch('updated', data);
      dispatch('close');
      
    } catch (err: any) {
      msg = err.message || 'No se pudo guardar los cambios';
    } finally {
      loading = false;
    }
  }
</script>

<div class="modal-backdrop" on:click|self={() => dispatch('close')} role="dialog">
  <div class="modal">
    <h2>Editar Curso</h2>
    
    {#if msg}
      <div class="alert">{msg}</div>
    {/if}

    <form on:submit|preventDefault={handleUpdate}>
      <div class="form-group">
        <label for="title">Nombre del curso</label>
        <input id="title" type="text" bind:value={title} required />
      </div>

      <div class="form-group">
        <label for="category">Categoría</label>
        <select id="category" bind:value={category}>
          <option value="Secundaria">Secundaria</option>
          <option value="Preparatoria">Preparatoria</option>
        </select>
      </div>

      <div class="form-group">
        <label for="student-input">Estudiantes inscritos (Email)</label>
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
                    <div class="student-tag">
                        <span>{student}</span>
                        <button type="button" class="remove-btn" on:click={() => removeStudent(i)} title="Remover">&times;</button>
                    </div>
                {/each}
            {/if}
        </div>
        <small style="color: #718096; font-size: 0.8rem;">* Los usuarios deben estar registrados previamente.</small>
      </div>

      <div class="form-group">
        <label for="desc">Descripción</label>
        <textarea id="desc" rows="3" bind:value={description}></textarea>
      </div>

      <div class="modal-actions">
        <button type="button" class="cancel" on:click={() => dispatch('close')}>
          Cancelar
        </button>
        <button type="submit" class="save" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(2px);
  }

  .modal {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    width: 95%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  h2 { margin-top: 0; color: #1a202c; margin-bottom: 1.5rem; font-size: 1.5rem; }

  .form-group { margin-bottom: 1.2rem; }
  
  label { display: block; margin-bottom: 0.4rem; font-size: 0.9rem; color: #4a5568; font-weight: 600; }
  
  input, select, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #cbd5e0;
    border-radius: 6px;
    font-size: 0.95rem;
    box-sizing: border-box;
    transition: all 0.2s;
  }
  
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }

  .add-student-row {
    display: flex;
    gap: 0.5rem;
  }
  
  .add-btn {
    background: #48bb78;
    color: white;
    border: none;
    border-radius: 6px;
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
    border-radius: 6px;
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

  .modal-actions {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }

  .cancel {
    background: white;
    border: 1px solid #cbd5e0;
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    cursor: pointer;
    color: #4a5568;
    font-weight: 600;
    transition: all 0.2s;
  }
  .cancel:hover { background: #f7fafc; }

  .save {
    background: #3182ce;
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;
  }
  .save:hover { background: #2b6cb0; }
  
  .save:disabled { opacity: 0.6; cursor: not-allowed; }
  
  .alert { 
    background-color: #fff5f5;
    border-left: 4px solid #e53e3e;
    color: #c53030;
    padding: 0.75rem;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
    border-radius: 4px;
  }
</style>