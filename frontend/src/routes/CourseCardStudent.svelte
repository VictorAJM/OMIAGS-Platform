<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';

  export let course;

  const dispatch = createEventDispatcher();

  // Lógica de Colores según el nivel educativo
  const themeColors = {
    'Secundaria': '#319795', // Teal 500
    'Preparatoria': '#5a67d8', // Indigo 500
    'default': '#718096' // Gray 600
  };

  // Detectamos el nivel (normalizamos a string para evitar errores)
  $: level = course.level || course.category || 'General';
  
  // Asignamos color: Prioridad al mapa de niveles, sino usa el del curso, sino default
  $: themeColor = themeColors[level] || course.color || themeColors['default'];
  
  // Icono por defecto según nivel si no viene imagen
  $: defaultIcon = level === 'Secundaria' ? '🎒' : (level === 'Preparatoria' ? '🎓' : '📚');
  
  // Cálculos de progreso
  $: total = course.lessons || 0;
  $: completed = course.completedLessons ? course.completedLessons.length : 0;
  $: percentage = course.personalProgress || 0;
  $: isCompleted = percentage === 100;

  function handleEnter() {
    const courseId = course._id || course.id;
    if (courseId) {
      goto(`/cursos/${courseId}`);
    } else {
      console.error("Error: El curso no tiene ID");
    }
  }
</script>

<div class="course-card">
  <div 
    class="course-header" 
    style="background-color: {themeColor}15; border-left: 4px solid {themeColor}"
  >
    <div class="course-icon">
      {course.image || defaultIcon}
    </div>
    
    <div class="course-badge">
      {#if isCompleted}
        <span class="status-badge completed">¡Completado! 🏆</span>
      {:else if percentage > 0}
        <span class="status-badge in-progress">En curso</span>
      {:else}
        <span class="status-badge new">Nuevo</span>
      {/if}
    </div>
  </div>

  <div class="course-content">
    <h3 title={course.name}>{course.name}</h3>
    
    <div class="progress-container">
      <div class="progress-info">
        <span class="progress-text">
          <strong>{completed}</strong> de {total} lecciones
        </span>
        <span class="progress-percentage" style="color: {themeColor}">
          {Math.round(percentage)}%
        </span>
      </div>
      
      <div class="progress-bar-bg">
        <div 
          class="progress-bar-fill" 
          style="width: {percentage}%; background-color: {themeColor}; box-shadow: 0 0 10px {themeColor}60;"
        ></div>
      </div>
    </div>

    <div class="course-meta">
      <span class="badge {level.toLowerCase()}">
        {level}
      </span>
    </div>
  </div>

  <div class="course-footer">
    <button 
      class="btn-primary" 
      style="background-color: {themeColor}; border-color: {themeColor}; box-shadow: 0 4px 14px {themeColor}40;"
      on:click={handleEnter}
    >
      {#if isCompleted}
        Repasar Curso ↺
      {:else if percentage > 0}
        Continuar Lección →
      {:else}
        Empezar Curso ▶
      {/if}
    </button>
  </div>
</div>

<style>
  .course-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    height: 100%;    
    width: 100%;       
    max-width: 400px;
    margin: 0 auto;    
    border: 1px solid #edf2f7;
  }

  .course-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  /* HEADER */
  .course-header {
    padding: 1.25rem 1.5rem; 
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .course-icon { 
    font-size: 2rem; 
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  }

  .status-badge {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 0.35rem 0.75rem;
    border-radius: 99px;
    letter-spacing: 0.05em;
  }
  .status-badge.completed { background: #f0fff4; color: #276749; border: 1px solid #c6f6d5; }
  .status-badge.in-progress { background: #ebf8ff; color: #2c5282; border: 1px solid #bee3f8; }
  .status-badge.new { background: #fff5f5; color: #c53030; border: 1px solid #fed7d7; }

  /* CONTENT */
  .course-content { 
    padding: 1.5rem; 
    flex-grow: 1; 
    display: flex;
    flex-direction: column;
  }
  
  .course-content h3 { 
    margin: 0 0 1.25rem 0; 
    color: #1a202c; 
    font-size: 1.2rem;
    font-weight: 700;
    line-height: 1.4;
    /* Limitar a 2 líneas */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* PROGRESS */
  .progress-container { margin-bottom: auto; } /* Empuja el meta hacia abajo */

  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
    color: #718096;
  }

  .progress-text strong { color: #2d3748; }

  .progress-percentage { font-weight: 800; font-size: 1rem; }

  .progress-bar-bg {
    width: 100%;
    height: 8px;
    background-color: #edf2f7;
    border-radius: 99px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* META / BADGES DE NIVEL */
  .course-meta { 
    margin-top: 1.5rem;
    display: flex; 
    gap: 0.5rem; 
  }
  
  .badge { 
    padding: 0.25rem 0.75rem; 
    border-radius: 6px; 
    font-size: 0.75rem; 
    font-weight: 700; 
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  /* Estilos específicos por nivel */
  .badge.secundaria { 
    background: #e6fffa; 
    color: #285e61; 
    border: 1px solid #81e6d9; 
  }

  .badge.preparatoria { 
    background: #ebf8ff; 
    color: #2c5282; 
    border: 1px solid #90cdf4; 
  }
  
  .badge { /* Fallback */
    background: #f7fafc; 
    color: #4a5568; 
    border: 1px solid #e2e8f0; 
  }

  /* FOOTER */
  .course-footer { 
    padding: 1.25rem 1.5rem; 
    border-top: 1px solid #f7fafc; 
    background-color: white;
  }

  .btn-primary {
    width: 100%;
    color: white;
    border: 1px solid transparent;
    padding: 0.8rem 1rem;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    font-size: 0.95rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-primary:hover { 
    transform: translateY(-2px);
    filter: brightness(110%);
  }
  
  .btn-primary:active { 
    transform: scale(0.98); 
  }
</style>