<script lang="ts">
  export let student;
  export let rank = 1;
</script>

<div class="student-rank-item">
  <div class="rank">#{rank}</div>
  <div class="student-details">
    <strong>{student.name}</strong>
    <span>{student.completed} lecciones completadas</span>
  </div>
  <div class="student-progress">
    <div class="progress-circle">
      <svg width="40" height="40">
        <circle cx="20" cy="20" r="15" fill="none" stroke="#e2e8f0" stroke-width="3"/>
        <circle cx="20" cy="20" r="15" fill="none" stroke="#48bb78" stroke-width="3" 
          stroke-dasharray="{student.progress * 0.94}" 
          stroke-dashoffset="{94 - student.progress * 0.94}"
          transform="rotate(-90 20 20)"/>
      </svg>
      <span>{student.progress}%</span>
    </div>
  </div>
</div>

<style>
.student-rank-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  transition: background 0.2s ease;
}
.student-rank-item:hover { background: #f7fafc; }
.rank {
  background: #4299e1;
  color: white;
  width: 30px; height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
}
.student-details { flex: 1; }
.student-details strong { display: block; color: #2d3748; margin-bottom: 0.25rem; }
.student-details span { font-size: 0.8rem; color: #718096; }
.progress-circle { position: relative; width: 40px; height: 40px; }
.progress-circle span {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.7rem; font-weight: bold; color: #2d3748;
}
</style>
