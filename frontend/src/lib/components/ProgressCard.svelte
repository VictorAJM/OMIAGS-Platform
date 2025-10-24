<script lang="ts">
  import type { CourseProgress } from "./types";

  export let course: CourseProgress;
</script>

<div class="progress-card">
  <div class="card-header">
    <h3>{course.title}</h3>
    <span class="progress-badge">{course.progress}%</span>
  </div>
  
  <div class="progress-bar">
    <div 
      class="progress-fill" 
      style="width: {course.progress}%"
    ></div>
  </div>
  
  <div class="progress-stats">
    <div class="stat">
      <span class="stat-value">{course.completedLessons}/{course.totalLessons}</span>
      <span class="stat-label">Lecciones</span>
    </div>
    <div class="stat">
      <span class="stat-value">{course.averageGrade}%</span>
      <span class="stat-label">Promedio</span>
    </div>
    <div class="stat">
      <span class="stat-value">{course.pendingLessons.length}</span>
      <span class="stat-label">Pendientes</span>
    </div>
  </div>
  
  <div class="card-footer">
    <button class="view-details-btn">Ver Detalles</button>
  </div>
</div>

<style>
  .progress-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
  }

  .progress-card:hover {
    transform: translateY(-2px);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .card-header h3 {
    margin: 0;
    color: #2d3748;
    font-size: 1.2rem;
  }

  .progress-badge {
    background: #4299e1;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    margin-bottom: 1rem;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #4299e1;
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .progress-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .stat {
    text-align: center;
  }

  .stat-value {
    display: block;
    font-size: 1.25rem;
    font-weight: 600;
    color: #2d3748;
  }

  .stat-label {
    font-size: 0.8rem;
    color: #718096;
  }

  .view-details-btn {
    width: 100%;
    background: #edf2f7;
    color: #2d3748;
    border: none;
    padding: 0.75rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .view-details-btn:hover {
    background: #4299e1;
    color: white;
  }
</style>