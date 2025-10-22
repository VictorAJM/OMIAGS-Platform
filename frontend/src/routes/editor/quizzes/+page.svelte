<script>
  import NavBar from "../../../lib/components/NavBar.svelte";
  import QuestionEditor from "../../../lib/components/QuestionEditor.svelte";

  let quizData = {
    title: "My Awesome Quiz",
    description: "A quiz about awesome things.",
    questions: [
      {
        _id: "q1",
        title: "What is 2 + 2?",
        type: "multiple-choice",
        options: ["3", "4", "5"],
        correctAnswer: "4",
      },
      {
        _id: "q2",
        title: "Svelte is a compiler.",
        type: "true-false",
        correctAnswer: "True",
      },
      {
        _id: "q3",
        title: "Which of these are frontend frameworks?",
        type: "multiple-answer",
        options: ["React", "Svelte", "Node.js"],
        correctAnswer: ["React", "Svelte"],
      },
    ],
  };

  let showAddQuestionModal = false;
  let dragStartIndex;
  let dropPosition = 'top'; // 'top' or 'bottom'
  let editorCardElement;

  function addQuestion(questionType) {
    const newQuestion = {
      _id: `q${Date.now()}`,
      title: "New Question",
      type: questionType,
      options: questionType === "multiple-choice" || questionType === "multiple-answer" || questionType === "complete-the-code" ? [] : undefined,
      code: questionType === "complete-the-code" ? "" : undefined,
      correctAnswer: questionType === "multiple-answer" ? [] : "",
    };
    quizData.questions = [...quizData.questions, newQuestion];
    showAddQuestionModal = false;
  }

  function removeQuestion(index) {
    quizData.questions.splice(index, 1);
    quizData.questions = quizData.questions;
  }

  function handleDragStart(e, index) {
    e.dataTransfer.effectAllowed = 'move';
    dragStartIndex = index;
  }

  function handleQuestionDragOver(e) {
    // Clear existing indicators to prevent flickering
    if(editorCardElement){
        editorCardElement.querySelectorAll('.draggable-question').forEach(el => {
            el.classList.remove('drop-indicator-top', 'drop-indicator-bottom');
        });
    }

    const targetRect = e.currentTarget.getBoundingClientRect();
    const midY = targetRect.top + targetRect.height / 2;
    if (e.clientY < midY) {
      dropPosition = 'top';
      e.currentTarget.classList.add('drop-indicator-top');
    } else {
      dropPosition = 'bottom';
      e.currentTarget.classList.add('drop-indicator-bottom');
    }
  }

  function handleGlobalDragOver(e) {
    const viewportHeight = window.innerHeight;
    const scrollThreshold = 80; // pixels from edge
    const scrollSpeed = 15;

    if (e.clientY < scrollThreshold) {
      window.scrollBy(0, -scrollSpeed);
    } else if (e.clientY > viewportHeight - scrollThreshold) {
      window.scrollBy(0, scrollSpeed);
    }
  }

  function move(arr, from, to) {
    const item = arr.splice(from, 1)[0];
    arr.splice(to, 0, item);
    return arr;
  }

  function handleDrop(e, dropIndex) {
    // Clear all indicators on drop
    if(editorCardElement){
        editorCardElement.querySelectorAll('.draggable-question').forEach(el => {
            el.classList.remove('drop-indicator-top', 'drop-indicator-bottom');
        });
    }

    let finalDropIndex = dropIndex;
    if (dropPosition === 'bottom') {
        finalDropIndex++;
    }

    if (dragStartIndex < finalDropIndex) {
        finalDropIndex--;
    }

    if (dragStartIndex === finalDropIndex) return; // No change

    quizData.questions = move(quizData.questions, dragStartIndex, finalDropIndex);
  }
</script>

<NavBar viewerType="student" username="Chaska" />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="editor-page-container" on:dragover|preventDefault={handleGlobalDragOver}>
  <div class="quiz-editor-card" bind:this={editorCardElement}>
    <div class="quiz-header-editor">
      <input type="text" bind:value={quizData.title} class="quiz-title-input" placeholder="Quiz Title" />
      <textarea bind:value={quizData.description} class="quiz-description-input" placeholder="Quiz Description"></textarea>
    </div>

    {#each quizData.questions as question, i (question._id)}
      <div
        class="draggable-question"
        draggable="true"
        on:dragstart={(e) => handleDragStart(e, i)}
        on:dragover|preventDefault={handleQuestionDragOver}
        on:drop|preventDefault={(e) => handleDrop(e, i)}
      >
        <QuestionEditor question={question} index={i} on:remove={() => removeQuestion(i)} />
      </div>
    {/each}

    <div class="add-question-controls">
        <button on:click={() => showAddQuestionModal = true} class="add-question-btn">Add Question</button>
    </div>
    

    <div class="save-changes-area">
        <button class="save-changes-btn">Save Changes</button>
    </div>
  </div>
</div>

{#if showAddQuestionModal}
<div class="modal-backdrop" on:click={() => showAddQuestionModal = false}>
    <div class="modal-content" on:click|stopPropagation>
        <h2>Select Question Type</h2>
        <ul class="question-type-list">
            <li on:click={() => addQuestion('multiple-choice')}>Multiple Choice</li>
            <li on:click={() => addQuestion('true-false')}>True/False</li>
            <li on:click={() => addQuestion('fill-in-the-blank')}>Fill in the Blank</li>
            <li on:click={() => addQuestion('multiple-answer')}>Multiple Answer</li>
            <li on:click={() => addQuestion('complete-the-code')}>Complete the Code</li>
        </ul>
    </div>
</div>
{/if}

<style>
  .editor-page-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: calc(100vh - 80px);
    padding: 2rem 1rem;
    background-color: #f0f2f5;
  }

  .quiz-editor-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 800px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .quiz-header-editor {
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 1.5rem;
  }

  .quiz-title-input {
    width: 100%;
    border: none;
    font-size: 2rem;
    font-weight: bold;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .quiz-description-input {
    width: 100%;
    border: 1px solid #dadce0;
    border-radius: 8px;
    padding: 1rem;
    font-size: 1rem;
    min-height: 100px;
    line-height: 1.5;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .quiz-description-input:focus {
    outline: none;
    border-color: #1a73e8; /* Blue Accent */
    box-shadow: 0 0 0 2px #d2e3fc; /* Lighter Blue */
  }

  .add-question-controls {
    display: flex;
    justify-content: center;
    padding: 1rem;
    border-top: 1px solid #e0e0e0;
  }

  .add-question-btn {
    background-color: #e53e3e;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    cursor: pointer;
  }

  .save-changes-area {
      margin-top: 2rem;
      text-align: right;
  }

  .save-changes-btn {
      background-color: #1a73e8;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.8rem 2.5rem;
      font-size: 1.1rem;
      font-weight: 500;
      cursor: pointer;
  }

  .draggable-question {
    cursor: move;
    position: relative;
  }

  .drop-indicator-top::before,
  .drop-indicator-bottom::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      height: 4px;
      background-color: #1a73e8;
      border-radius: 2px;
  }

  .drop-indicator-top::before {
      top: -8px; /* Half of the gap */
  }

  .drop-indicator-bottom::after {
      bottom: -8px; /* Half of the gap */
  }

  /* Modal Styles */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
  }

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    width: 90%;
    max-width: 500px;
  }

  .modal-content h2 {
    margin-top: 0;
    text-align: center;
    color: #2d3748;
  }

  .question-type-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .question-type-list li {
    padding: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin-bottom: 0.75rem;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.2s;
    text-align: center;
    font-weight: 500;
  }

  .question-type-list li:hover {
    background-color: #f0f2f5;
    transform: translateY(-2px);
  }
</style>