<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { scale, fade } from "svelte/transition";
  import { onMount } from "svelte";

  export let course: any;

  const dispatch = createEventDispatcher();
  let loading = false;
  let msg = "";

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
    category = course.category || "Secundaria";

    // Handle different data shapes (strings vs objects)
    /*const rawStudents = course.students || course.accessList || [];
    students = rawStudents
      .map((s: any) => (typeof s === "string" ? s : s?.email))
      .filter((s: any) => s);*/
  }

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  async function loadStudentList() {
    const res = await fetch(`${API_BASE}/api/courses/${course.id}`, {
      credentials: "include",
    });

    const data = await res.json();
    students = data.students;
  }

  onMount(async () => {
    await loadStudentList();
  });

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

    // Scroll to bottom of list
    setTimeout(() => {
      const list = document.querySelector(".student-list-container");
      if (list) list.scrollTop = list.scrollHeight;
    }, 50);
  }

  function removeStudent(index: number) {
    students = students.filter((_, i) => i !== index);
  }

  async function handleUpdate() {
    loading = true;
    msg = "";

    try {
      const courseId = course.id || course._id;

      // Attempt to get token safely
      let token = "";
      try {
        const match = document.cookie.match(new RegExp("(^| )session=([^;]+)"));
        if (match) token = match[2];
      } catch (e) {
        /* ignore */
      }

      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          title,
          description,
          category,
          students,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al actualizar el curso");
      }

      dispatch("updated", data);
      dispatch("close");
    } catch (err: any) {
      msg = err.message || "No se pudo guardar los cambios";
    } finally {
      loading = false;
    }
  }
</script>

<div
  class="modal-backdrop"
  on:click|self={() => dispatch("close")}
  transition:fade={{ duration: 200 }}
>
  <div class="modal" in:scale={{ start: 0.96, duration: 200 }}>
    <div class="modal-header">
      <div class="header-content">
        <h3 class="modal-title">Editar Curso</h3>
        <p class="modal-subtitle">
          Actualiza la información general y el acceso.
        </p>
      </div>
      <button type="button" class="btn-close" on:click={() => dispatch("close")}
        >✕</button
      >
    </div>

    <div class="modal-body-scroll">
      {#if msg}
        <div class="alert-error" transition:scale>
          <span class="alert-icon">⚠️</span>
          <span>{msg}</span>
        </div>
      {/if}

      <form class="course-form" on:submit|preventDefault={handleUpdate}>
        <div class="main-fields">
          <div class="form-group">
            <label for="title">Nombre del curso</label>
            <input
              id="title"
              type="text"
              bind:value={title}
              placeholder="Ej. Matemáticas Avanzadas"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label for="category">Categoría / Nivel</label>
              <div class="select-wrapper">
                <select id="category" bind:value={category}>
                  <option value="Secundaria">🏫 Secundaria</option>
                  <option value="Preparatoria">🎓 Preparatoria</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="desc">Descripción</label>
            <textarea
              id="desc"
              rows="3"
              bind:value={description}
              placeholder="Describe los objetivos del curso..."
            ></textarea>
          </div>
        </div>

        <div class="divider"></div>

        <div class="students-section">
          <div class="section-header">
            <label for="student-input">Control de Acceso</label>
            <span class="badge">{students.length} alumnos</span>
          </div>

          <p class="help-text">
            Agrega los correos electrónicos de los estudiantes autorizados.
          </p>

          <div class="input-group">
            <div class="input-wrapper">
              <span class="input-icon">📧</span>
              <input
                id="student-input"
                type="email"
                placeholder="correo@ejemplo.com"
                bind:value={newStudentEmail}
                on:keydown={(e) =>
                  e.key === "Enter" && (e.preventDefault() || addStudent())}
              />
            </div>
            <button type="button" class="btn-add" on:click={addStudent}
              >Agregar</button
            >
          </div>

          <div class="student-list-container">
            {#if students.length === 0}
              <div class="empty-list">
                <span>👥</span>
                <p>Sin estudiantes inscritos aún.</p>
              </div>
            {:else}
              <div class="tags-grid">
                {#each students as student, i}
                  <div class="student-tag" transition:scale|local>
                    <span class="tag-text">{student}</span>
                    <button
                      type="button"
                      class="tag-remove"
                      on:click={() => removeStudent(i)}
                      title="Remover"
                    >
                      &times;
                    </button>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </form>
    </div>

    <div class="modal-footer">
      <button
        type="button"
        class="btn-ghost"
        on:click={() => dispatch("close")}
      >
        Cancelar
      </button>
      <button
        type="button"
        class="btn-primary"
        on:click={handleUpdate}
        disabled={loading}
      >
        {#if loading}
          <span class="loader"></span> Guardando...
        {:else}
          Guardar Cambios
        {/if}
      </button>
    </div>
  </div>
</div>

<style>
  /* --- Layout & Backdrop --- */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
    padding: 1rem;
  }

  .modal {
    background: #ffffff;
    border-radius: 16px;
    width: 100%;
    max-width: 550px;
    height: 85vh;
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* --- Header --- */
  .modal-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    background: #fff;
  }
  .header-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    line-height: 1.2;
  }
  .modal-subtitle {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0;
  }

  .btn-close {
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 6px;
    line-height: 1;
    transition: all 0.2s;
  }
  .btn-close:hover {
    background: #f1f5f9;
    color: #475569;
  }

  /* --- Scrollable Body --- */
  .modal-body-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    background: #f8fafc;
  }
  .modal-body-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .modal-body-scroll::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
  }

  /* --- Form Elements --- */
  .form-group {
    margin-bottom: 1.25rem;
  }
  .form-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }
  .form-group.half {
    flex: 1;
    margin-bottom: 0;
  }

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: 0.5rem;
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.625rem 0.875rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.925rem;
    color: #1e293b;
    background: #fff;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }
  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  textarea {
    resize: vertical;
  }

  .divider {
    height: 1px;
    background: #e2e8f0;
    margin: 1.5rem 0;
  }

  /* --- Student Section --- */
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.25rem;
  }
  .badge {
    background: #e2e8f0;
    color: #475569;
    font-size: 0.75rem;
    padding: 0.15rem 0.6rem;
    border-radius: 12px;
    font-weight: 600;
  }
  .help-text {
    font-size: 0.8rem;
    color: #64748b;
    margin: 0 0 1rem 0;
  }

  /* Input Group with Button */
  .input-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  .input-wrapper {
    position: relative;
    flex: 1;
  }
  .input-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1rem;
    pointer-events: none;
  }
  .input-wrapper input {
    padding-left: 2.2rem;
  }

  .btn-add {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0 1.2rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.2s;
  }
  .btn-add:hover {
    background: #2563eb;
  }

  /* Tag List */
  .student-list-container {
    min-height: 100px;
    max-height: 200px;
    overflow-y: auto;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 0.75rem;
  }
  .tags-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .student-tag {
    display: inline-flex;
    align-items: center;
    background: #eff6ff;
    color: #1e40af;
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    border: 1px solid #bfdbfe;
    font-size: 0.85rem;
    font-weight: 500;
  }
  .tag-remove {
    background: transparent;
    border: none;
    color: #60a5fa;
    margin-left: 0.5rem;
    font-size: 1.1rem;
    line-height: 1;
    cursor: pointer;
    padding: 0 2px;
    display: flex;
    align-items: center;
  }
  .tag-remove:hover {
    color: #ef4444;
  }

  .empty-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #94a3b8;
    font-size: 0.9rem;
    gap: 0.5rem;
    padding: 1rem 0;
  }
  .empty-list span {
    font-size: 1.5rem;
    opacity: 0.5;
  }

  /* --- Alerts & Footer --- */
  .alert-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #b91c1c;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .modal-footer {
    padding: 1.25rem 1.5rem;
    border-top: 1px solid #e2e8f0;
    background: #fff;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .btn-ghost {
    background: transparent;
    color: #64748b;
    border: 1px solid transparent;
    padding: 0.625rem 1.25rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-ghost:hover {
    background: #f1f5f9;
    color: #334155;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
    border: none;
    padding: 0.625rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background 0.2s;
  }
  .btn-primary:hover {
    background: #1d4ed8;
  }
  .btn-primary:disabled {
    background: #93c5fd;
    cursor: not-allowed;
  }

  .loader {
    width: 14px;
    height: 14px;
    border: 2px solid #fff;
    border-bottom-color: transparent;
    border-radius: 50%;
    animation: rotation 1s linear infinite;
  }
  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
