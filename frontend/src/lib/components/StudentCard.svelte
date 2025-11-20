<script lang="ts">
  export let student;

  // Helper para obtener las iniciales
  const initials = student.name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Helper para determinar el estado (color)
  const getStatusColor = (p) => {
    if (p >= 80) return 'success';
    if (p >= 50) return 'warning';
    return 'danger';
  };

  const status = getStatusColor(student.progress);
  
  // Calculamos cuántos cursos quedan ocultos
  const remainingCourses = student.totalCourses - student.courses.length;
</script>

<div class="student-card">
  <div class="card-header">
    <div class="student-profile">
      <div class="avatar">
        {initials}
      </div>
      <div class="info">
        <h3>{student.name}</h3>
        <p>{student.email}</p>
      </div>
    </div>
    
    <div class="progress-badge {status}">
      {student.progress}%
    </div>
  </div>

  <div class="card-body">
    <div class="courses-section">
      <span class="section-label">Cursos Activos</span>
      <div class="tags-container">
        {#each student.courses as course}
          <span class="course-pill">{course}</span>
        {/each}
        
        {#if remainingCourses > 0}
          <span class="course-pill more" title="Ver lista completa">
            +{remainingCourses}
          </span>
        {/if}
      </div>
    </div>
  </div>

  <div class="card-footer">
    <div class="progress-info">
      <span class="label">Progreso General</span>
      <span class="value {status}">{student.progress}/100</span>
    </div>
    <div class="progress-track">
      <div 
        class="progress-fill {status}" 
        style="width: {student.progress}%"
      ></div>
    </div>
  </div>
</div>

<style>
  .student-card {
    background: white;
    border-radius: 16px;
    border: 1px solid #edf2f7;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    transition: all 0.2s ease-in-out;
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
  }

  .student-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border-color: #e2e8f0;
  }

  /* HEADER */
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
  }

  .student-profile {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .avatar {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 1rem;
    box-shadow: 0 2px 5px rgba(118, 75, 162, 0.3);
  }

  .info h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #1a202c;
    font-weight: 600;
    line-height: 1.2;
  }

  .info p {
    margin: 4px 0 0 0;
    color: #718096;
    font-size: 0.85rem;
  }

  .progress-badge {
    font-size: 0.85rem;
    font-weight: 700;
    padding: 0.35rem 0.75rem;
    border-radius: 20px;
  }

  /* BODY */
  .card-body {
    flex: 1;
    margin-bottom: 1.5rem;
  }

  .section-label {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #a0aec0;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .course-pill {
    background: #f7fafc;
    border: 1px solid #edf2f7;
    color: #4a5568;
    padding: 0.35rem 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 500;
    transition: background 0.2s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .course-pill.more {
    background-color: #e2e8f0;
    color: #2d3748;
    font-weight: 700;
    border-color: #cbd5e0;
  }

  .student-card:hover .course-pill {
    background: #edf2f7;
    border-color: #e2e8f0;
  }
  
  .student-card:hover .course-pill.more {
    background: #cbd5e0;
  }

  /* FOOTER */
  .card-footer {
    margin-top: auto;
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }

  .progress-info .label {
    color: #718096;
    font-weight: 500;
  }

  .progress-info .value {
    font-weight: 700;
  }

  .progress-track {
    width: 100%;
    height: 6px;
    background: #edf2f7;
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* COLORES DE ESTADO */
  .success { background-color: #c6f6d5; color: #22543d; }
  .progress-fill.success { background-color: #48bb78; }
  .value.success { color: #2f855a; background: transparent; }

  .warning { background-color: #feebcb; color: #744210; }
  .progress-fill.warning { background-color: #ed8936; }
  .value.warning { color: #c05621; background: transparent; }

  .danger { background-color: #fed7d7; color: #742a2a; }
  .progress-fill.danger { background-color: #f56565; }
  .value.danger { color: #c53030; background: transparent; }

</style>