<script>
  export let title;
  export let description;
  export let progress = 0;
</script>

<div class="course-card">
  <h3>{title}</h3>
  <p>{description}</p>
  <div class="progress-bar">
    <div class="progress" style="width: {progress}%"></div>
  </div>
</div>

<style>
  .course-card {
    background: #fff;
    border-radius: 10px;
    padding: 1rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
    transition: transform 0.15s ease-in-out;
  }

  .course-card:hover {
    transform: translateY(-2px);
  }

  h3 {
    margin: 0 0 0.5rem 0;
    color: #2e64d6;
    font-size: 1.2rem;
  }

  p {
    margin: 0 0 1rem 0;
    font-size: 0.95rem;
    color: #444;
  }

  .progress-bar {
    background: #e5e7eb;
    border-radius: 6px;
    height: 8px;
    overflow: hidden;
  }

  .progress {
    background: #2e64d6;
    height: 100%;
    transition: width 0.3s ease-in-out;
  }
</style>
