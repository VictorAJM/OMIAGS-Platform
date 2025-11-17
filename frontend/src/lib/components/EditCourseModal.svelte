<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // Recibimos el objeto 'course' tal como lo tiene el frontend
  export let course: any; 

  const dispatch = createEventDispatcher();
  let loading = false;
  let msg = '';

  // Mapeamos los datos iniciales. 
  // Nota: La API usa 'title' y 'category', tu frontend usa 'name' y 'level'.
  let title = course.name || course.title;
  let description = course.description;
  let category = course.category || 'Secundaria';

  async function handleUpdate() {
    loading = true;
    msg = '';

    try {

      const token = document.cookie.split("; ")
      .find((row) => row.startsWith("session="))
      ?.split("=")[1];

      const res = await fetch(`http://localhost:5000/api/courses/${course.id || course._id}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ title, description, category })
      });

      if (!res.ok) throw new Error('Error al actualizar');
      
      const updatedData = await res.json();
      
      // Avisamos al padre que se actualizó y enviamos los datos nuevos
      dispatch('updated', updatedData);
      dispatch('close');
      
    } catch (err) {
      msg = 'No se pudo guardar los cambios';
    } finally {
      loading = false;
    }
  }
</script>

<div class="modal-backdrop" on:click|self={() => dispatch('close')}>
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
  /* Reutilizamos estilos base de tu modal original */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }

  .modal {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    width: 95%;
    max-width: 420px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  }

  h2 { margin-top: 0; color: #2d3748; margin-bottom: 1.5rem; }

  .form-group { margin-bottom: 1rem; }
  
  label { display: block; margin-bottom: 0.4rem; font-size: 0.9rem; color: #4a5568; font-weight: 500; }
  
  input, select, textarea {
    width: 100%;
    padding: 0.6rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 0.95rem;
    box-sizing: border-box;
  }
  
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }

  .modal-actions {
    margin-top: 1.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .cancel {
    background: #e2e8f0;
    border: none;
    padding: 0.6rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    color: #4a5568;
    font-weight: 500;
  }

  .save {
    background: #3182ce;
    color: white;
    border: none;
    padding: 0.6rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
  }
  
  .save:disabled { opacity: 0.7; cursor: not-allowed; }
  .alert { color: #e53e3e; font-size: 0.9rem; margin-bottom: 1rem; }
</style>