<script>
  export let title;
  export let description;
  export let progress = 0;
  export let continueHref = "#"; // placeholder, later will link to last lesson
</script>

<div class="course-container">
  <div class="course-card">
    <div class="card-header">
      <h3>{title}</h3>
      <span class="progress-text">{progress}%</span>
    </div>

    <p class="description">{description}</p>

    <div class="progress-bar">
      <div class="progress" style="width: {progress}%"></div>
    </div>

    <a class="continue-btn" href={continueHref}>Continuar →</a>
  </div>
</div>

<style>
  /* Center container */
  .course-container {
    display: flex;
    justify-content: center;
    padding: 1rem;
  }

  .course-card {
    background: #fff;
    border-radius: 12px;
    padding: 1.2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    margin-bottom: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    transition: transform 0.15s ease-in-out;
    max-width: 400px; /* prevent the card from being too wide */
    width: 100%; /* responsive */
  }

  .course-card:hover {
    transform: translateY(-2px);
  }

  /* Header with title + % */
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h3 {
    margin: 0;
    color: #2e64d6;
    font-size: 1.2rem;
    font-weight: 600;
  }

  .progress-text {
    font-size: 0.9rem;
    font-weight: 500;
    color: #444;
  }

  /* Short description */
  .description {
    margin: 0;
    font-size: 0.95rem;
    color: #555;
    flex-grow: 1;
  }

  /* Progress bar */
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

  /* Continue button */
  .continue-btn {
    align-self: flex-start;
    background: #2e64d6;
    color: white;
    text-decoration: none;
    padding: 0.5rem 1.2rem;
    border-radius: 8px;
    font-weight: 500;
    font-size: 0.9rem;
    transition: background 0.2s ease-in-out, transform 0.1s;
  }

  .continue-btn:hover {
    background: #1d47a8;
    transform: scale(1.03);
  }
</style>
