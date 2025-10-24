<script lang="ts">
  export let id: string;
  export let title: string;
  export let description: string;
  export let studentCount: number;
  export let isPublished: boolean;
  
  function editCourse() {
    // Navigate to course edit page
    window.location.href = `/admin/courses/${id}/edit`;
  }
  
  function viewAnalytics() {
    // Navigate to course analytics
    window.location.href = `/admin/courses/${id}/analytics`;
  }
  
  function togglePublish() {
    // Toggle course published status
    console.log('Toggle publish for course:', id);
  }
</script>

<div class="admin-course-card">
  <div class="card-header">
    <h3>{title}</h3>
    <div class="status-badge {isPublished ? 'published' : 'draft'}">
      {isPublished ? '📢 Publicado' : '📝 Borrador'}
    </div>
  </div>
  
  <p class="description">{description}</p>
  
  <div class="course-stats">
    <span class="stat">👥 {studentCount} estudiantes</span>
    <span class="stat">📊 75% progreso promedio</span> <!-- Hardcoded for now -->
  </div>
  
  <div class="card-actions">
    <button class="btn-outline" on:click={editCourse}>✏️ Editar</button>
    <button class="btn-outline" on:click={viewAnalytics}>📊 Métricas</button>
    <button class="btn-outline {isPublished ? 'unpublish' : 'publish'}" on:click={togglePublish}>
      {isPublished ? '⏸️ Pausar' : '🚀 Publicar'}
    </button>
  </div>
</div>

<style>
  .admin-course-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    transition: box-shadow 0.2s ease;
  }

  .admin-course-card:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .card-header h3 {
    margin: 0;
    color: #2d3748;
    font-size: 1.2rem;
  }

  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .status-badge.published {
    background: #c6f6d5;
    color: #22543d;
  }

  .status-badge.draft {
    background: #fed7d7;
    color: #742a2a;
  }

  .description {
    color: #718096;
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .course-stats {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .stat {
    font-size: 0.9rem;
    color: #4a5568;
  }

  .card-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-outline {
    background: transparent;
    border: 1px solid #e2e8f0;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }

  .btn-outline:hover {
    background: #f7fafc;
    border-color: #cbd5e0;
  }

  .btn-outline.publish:hover {
    background: #c6f6d5;
    border-color: #48bb78;
  }

  .btn-outline.unpublish:hover {
    background: #fed7d7;
    border-color: #f56565;
  }
</style>