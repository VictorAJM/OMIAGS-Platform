<script lang="ts">
  export let course = { name: '', progress: 0, students: 0 };
</script>

<div class="course-progress-item">
  <div class="course-info">
    <span class="course-name">{course.name}</span>
    <span class="course-stats">{course.progress}% • {course.students} estudiantes</span>
  </div>
  <div class="progress-bar">
    <div 
      class="progress-fill {course.progress > 70 ? 'high' : course.progress > 40 ? 'medium' : 'low'}" 
      style="width: {course.progress}%">
    </div>
  </div>
</div>

<style>
.course-progress-item { display: flex; flex-direction: column; gap: 0.5rem; }
.course-info { display: flex; justify-content: space-between; align-items: center; }
.course-name { font-weight: 500; color: #2d3748; }
.course-stats { font-size: 0.8rem; color: #718096; }
.progress-bar { width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease; }
.progress-fill.high { background: #48bb78; }
.progress-fill.medium { background: #ed8936; }
.progress-fill.low { background: #f56565; }
</style>
