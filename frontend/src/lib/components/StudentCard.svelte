<script lang="ts">
  export let student;
</script>

<div class="student-card">
  <div class="student-header">
    <div class="student-avatar">
      {student.name.split(' ').map(n => n[0]).join('')}
    </div>
    <div class="student-info">
      <h3>{student.name}</h3>
      <p>{student.email}</p>
    </div>
    <div class="progress-badge {student.progress > 70 ? 'high' : student.progress > 40 ? 'medium' : 'low'}">
      {student.progress}%
    </div>
  </div>

  <div class="student-courses">
    <strong>Cursos inscritos:</strong>
    <div class="course-tags">
      {#each student.courses as course}
        <span class="course-tag">{course}</span>
      {/each}
    </div>
  </div>

  <div class="progress-section">
    <div class="progress-bar">
      <div 
        class="progress-fill {student.progress > 70 ? 'high' : student.progress > 40 ? 'medium' : 'low'}" 
        style="width: {student.progress}%"
      ></div>
    </div>
    <span class="progress-text">Progreso general</span>
  </div>

  <div class="student-footer">
    <span class="last-active">Última actividad: {student.lastActive}</span>
    <button class="btn-outline small">Ver detalles</button>
  </div>
</div>

<style>
  .student-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: transform 0.2s ease;
  }
  .student-card:hover { transform: translateY(-2px); }

  .student-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
  .student-avatar {
    width: 50px; height: 50px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    color: white; font-weight: bold; font-size: 1.1rem;
  }
  .student-info h3 { margin: 0 0 0.25rem 0; color: #2d3748; }
  .student-info p { margin: 0; color: #718096; font-size: 0.9rem; }

  .progress-badge { padding: 0.5rem 0.75rem; border-radius: 20px; font-weight: 600; font-size: 0.9rem; }
  .progress-badge.high { background: #c6f6d5; color: #22543d; }
  .progress-badge.medium { background: #fed7d7; color: #742a2a; }
  .progress-badge.low { background: #feebcb; color: #744210; }

  .student-courses strong { display: block; margin-bottom: 0.5rem; color: #4a5568; }
  .course-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .course-tag { background: #edf2f7; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.8rem; color: #4a5568; }

  .progress-section { margin-bottom: 1rem; }
  .progress-bar { width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem; }
  .progress-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease; }
  .progress-fill.high { background: #48bb78; }
  .progress-fill.medium { background: #ed8936; }
  .progress-fill.low { background: #f56565; }
  .progress-text { font-size: 0.8rem; color: #718096; }

  .student-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
  .last-active { font-size: 0.8rem; color: #a0aec0; }
  .btn-outline { background: transparent; color: #3182ce; border: 1px solid #3182ce; border-radius: 6px; padding: 0.5rem 1rem; cursor: pointer; }
  .btn-outline.small { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
</style>
