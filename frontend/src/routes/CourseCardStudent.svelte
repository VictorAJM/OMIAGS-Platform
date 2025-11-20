<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';

  export let course;

  const dispatch = createEventDispatcher();
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
  <div class="course-header" style="background-color: {course.color}20; border-left: 4px solid {course.color}">
    <div class="course-icon">{course.image}</div>
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
    <h3>{course.name}</h3>
    
    <div class="progress-container">
      <div class="progress-info">
        <span class="progress-text">
          <strong>{completed}</strong> de {total} lecciones
        </span>
        <span class="progress-percentage">{Math.round(percentage)}%</span>
      </div>
      
      <div class="progress-bar-bg">
        <div 
          class="progress-bar-fill" 
          style="width: {percentage}%; background-color: {course.color}"
        ></div>
      </div>
    </div>

    <div class="course-meta">
      <span class="badge {course.level}">{course.level}</span>
    </div>
  </div>

  <div class="course-footer">
    <button 
      class="btn-primary" 
      style="background-color: {course.color}; border-color: {course.color}"
      on:click={handleEnter}
    >
      {#if isCompleted}
        Repasar Curso
      {:else if percentage > 0}
        Continuar Lección
      {:else}
        Empezar Curso
      {/if}
    </button>
  </div>
</div>

<style>
  .course-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    display: flex;
    flex-direction: column;
    height: 100%;    
    width: 100%;       
    max-width: 420px;
    margin: 0 auto;    
  }

  .course-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.12);
  }

  .course-header {
    padding: 1.5rem; 
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .course-icon { font-size: 2rem; }

  .status-badge {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    letter-spacing: 0.05em;
  }
  .status-badge.completed { background: #def7ec; color: #03543f; }
  .status-badge.in-progress { background: #ebf8ff; color: #2c5282; }
  .status-badge.new { background: #fff5f5; color: #c53030; }

  .course-content { 
    padding: 1.5rem; 
    flex-grow: 1; 
  }
  
  .course-content h3 { 
    margin: 0 0 1rem 0; 
    color: #2d3748; 
    font-size: 1.25rem;
    line-height: 1.4;
  }

  .progress-container { margin-bottom: 1.2rem; }

  .progress-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
    color: #4a5568;
  }

  .progress-percentage { font-weight: 700; color: #2d3748; }

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
    transition: width 0.5s ease-out;
  }

  .course-meta { display: flex; gap: 0.5rem; }
  
  .badge { 
    padding: 0.25rem 0.75rem; 
    border-radius: 20px; 
    font-size: 0.8rem; 
    font-weight: 500; 
    background: #f7fafc; 
    color: #4a5568; 
    border: 1px solid #edf2f7; 
  }

  .course-footer { 
    padding: 1.5rem; 
    border-top: 1px solid #e2e8f0; 
    background-color: #fcfcfc;
  }

  .btn-primary {
    width: 100%;
    color: white;
    border: 1px solid transparent;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: filter 0.2s ease, transform 0.1s ease;
    text-align: center;
    font-size: 1rem;
  }

  .btn-primary:hover { filter: brightness(90%); }
  .btn-primary:active { transform: scale(0.98); }
</style>