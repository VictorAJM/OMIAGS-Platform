<script>
  export let title;
  export let description;
  export let progress = 0; // 0–100
</script>

<div class="course-card">
  <h2 class="course-title">{title}</h2>
  <p class="course-description">{description}</p>

  <div class="progress-container">
    <div class="progress-bar" style="width: {progress}%;"></div>
  </div>
  <p class="progress-text">Progreso: {progress}%</p>
</div>

<style>
  .course-card {
    background: #fff;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    border: 1px solid #eee;
  }

  .course-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #222;
  }

  .course-description {
    margin: 0.5rem 0 1rem;
    color: #555;
    font-size: 1rem;
  }

  .progress-container {
    width: 100%;
    background: #f1f1f1;
    border-radius: 8px;
    height: 10px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #4cafef, #0077cc);
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.9rem;
    color: #444;
    font-weight: 500;
  }
</style>
