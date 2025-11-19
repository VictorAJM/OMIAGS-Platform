<script>
  export let title;
  export let description;
  export let progress = 0;
  export let totalLessons = 0;
  export let completedLessons = 0;
</script>

<div class="details-card">
  <div class="header-top">
    <h1>{title}</h1>
    <div class="progress-badge">
      {progress}% Completado
    </div>
  </div>
  
  <p class="description">{description}</p>

  <div class="progress-section">
    <div class="progress-bar-bg">
      <div class="progress-bar-fill" style="width: {progress}%"></div>
    </div>
    <div class="stats-text">
      Has completado <strong>{completedLessons}</strong> de {totalLessons} lecciones
    </div>
  </div>
</div>

<style>
  .details-card {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    border: 1px solid #eef2f6;
    margin-bottom: 2rem;
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    gap: 1rem;
  }

  h1 {
    margin: 0;
    color: #1a202c;
    font-size: 1.8rem;
    line-height: 1.2;
  }

  .description {
    color: #4a5568;
    line-height: 1.6;
    margin-bottom: 1.5rem;
    max-width: 90%;
  }

  .progress-badge {
    background: #ebf8ff;
    color: #2b6cb0;
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    white-space: nowrap;
  }

  .progress-bar-bg {
    height: 10px;
    background: #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #4299e1 0%, #3182ce 100%);
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .stats-text {
    font-size: 0.85rem;
    color: #718096;
    text-align: right;
  }
  
  strong { color: #2d3748; }

  @media (max-width: 600px) {
    .header-top { flex-direction: column; }
    .progress-badge { align-self: flex-start; }
  }
</style>