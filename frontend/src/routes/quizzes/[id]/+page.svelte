<script>
  import NavBar from "../../../lib/components/NavBar.svelte";
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  // --- State Management ---
  let quizData = null;
  let loading = true;
  let error = "";
  let currentQuestionIndex = 0;
  let quizStarted = false;
  let selectedAnswer = null;
  let quizFinished = false;

  // --- Reactive Derived State ---
  $: quizId = $page.params.id;
  $: currentQuestion = quizData ? quizData.questions[currentQuestionIndex] : null;
  $: progress = quizData ? (currentQuestionIndex / quizData.questions.length) * 100 : 0;

  onMount(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/quizzes/${quizId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to load the quiz.");
      }
      quizData = await res.json();
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });

  function startQuiz() {
    quizStarted = true;
  }

  function handleSelectOption(option) {
    selectedAnswer = option;
  }

  function handleSubmit() {
    if (!selectedAnswer) return;

    // Logic to check answer would go here

    if (currentQuestionIndex < quizData.questions.length - 1) {
      // Move to the next question
      currentQuestionIndex++;
      selectedAnswer = null; // Reset selection
    } else {
      // End of the quiz
      quizFinished = true;
    }
  }
</script>

<NavBar viewerType="student" username="Chaska" />

<div class="quiz-page-container">
  {#if loading}
    <p>Loading Quiz...</p>
  {:else if error}
    <p class="error-message">{error}</p>
  {:else if quizData}
    {#if !quizStarted}
      <div class="quiz-card start-card">
        <h2>{quizData.title}</h2>
        <p class="description">{quizData.description || "Ready to test your knowledge?"}</p>
        <button class="start-button" on:click={startQuiz}>Start Quiz</button>
      </div>
    {:else if quizFinished}
      <div class="quiz-card completion-card">
        <h2>Quiz Complete!</h2>
        <p>Thank you for your participation.</p>
        <a href="/" class="back-button">Back to Home</a>
      </div>
    {:else if currentQuestion}
      <div class="quiz-card">
        <!-- Progress Bar -->
        <div class="progress-container">
          <span class="progress-text">Question {currentQuestionIndex + 1} of {quizData.questions.length}</span>
          <div class="progress-bar">
            <div class="progress-bar-fill" style="width: {progress}%" />
          </div>
        </div>

        <!-- Question -->
        <div class="question-area">
          <h2>{currentQuestion.title}</h2>
        </div>

        <!-- Answers -->
        <div class="answer-area">
          {#if currentQuestion.type === 'multiple-choice'}
            {#each currentQuestion.options as option}
              <button
                class="answer-option"
                class:selected={selectedAnswer === option}
                on:click={() => handleSelectOption(option)}
              >
                {option}
              </button>
            {/each}
          {:else if currentQuestion.type === 'fill-in-the-blank'}
            <input
              type="text"
              class="fill-in-blank-input"
              placeholder="Type your answer here..."
              bind:value={selectedAnswer}
            />
          {/if}
        </div>

        <!-- Navigation -->
        <div class="navigation-area">
          <button on:click={handleSubmit} disabled={!selectedAnswer}>
            {currentQuestionIndex === quizData.questions.length - 1 ? 'Finish Quiz' : 'Submit & Next'}
          </button>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .quiz-page-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: calc(100vh - 80px); /* Adjust based on NavBar height */
    padding: 2rem 1rem;
    background-color: #f0f2f5;
  }

  .quiz-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 640px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .error-message {
    color: #d93025;
    font-weight: 500;
  }

  /* --- Progress --- */
  .progress-container {
    width: 100%;
  }
  .progress-text {
    font-size: 0.9rem;
    color: #5f6368;
    margin-bottom: 0.5rem;
    text-align: center;
  }
  .progress-bar {
    width: 100%;
    height: 8px;
    background-color: #e8eaed;
    border-radius: 4px;
    overflow: hidden;
  }
  .progress-bar-fill {
    height: 100%;
    background-color: #e53e3e; /* Red Accent */
    border-radius: 4px;
    transition: width 0.4s ease-in-out;
  }

  /* --- Question & Answer --- */
  .question-area {
    text-align: center;
    margin: 1rem 0;
  }
  .question-area h2 {
    font-size: 1.5rem;
    font-weight: 500;
    color: #202124;
    line-height: 1.4;
  }
  .answer-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .answer-option {
    width: 90%;
    padding: 1rem;
    font-size: 1rem;
    font-family: inherit;
    text-align: center;
    background-color: #fff;
    border: 1px solid #dadce0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .answer-option:hover {
    background-color: #f8f9fa;
    border-color: #cdd1d5;
  }
  .answer-option.selected {
    background-color: #e8f0fe; /* Light Blue */
    border-color: #1a73e8; /* Blue Accent */
    color: #1967d2; /* Darker Blue */
    font-weight: 500;
  }

  .fill-in-blank-input {
    width: 90%;
    padding: 1rem;
    font-size: 1rem;
    font-family: inherit;
    text-align: center;
    border: 1px solid #dadce0;
    border-radius: 8px;
  }
  .fill-in-blank-input:focus {
    outline: none;
    border-color: #1a73e8; /* Blue Accent */
    box-shadow: 0 0 0 2px #d2e3fc; /* Lighter Blue */
  }

  /* --- Navigation --- */
  .navigation-area {
    margin-top: 1rem;
    text-align: center;
  }
  .navigation-area button {
    background-color: #e53e3e; /* Red Accent */
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.8rem 2.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  .navigation-area button:hover:not(:disabled) {
    background-color: #c53030; /* Darker Red */
  }
  .navigation-area button:disabled {
    background-color: #f1f3f4;
    color: #a1a5a9;
    cursor: not-allowed;
  }

  /* --- Start & Completion States --- */
  .start-card {
    text-align: center;
    gap: 1rem;
  }
  .start-card h2 {
    font-size: 2rem;
    color: #2d3748;
  }
  .start-card .description {
    font-size: 1.1rem;
    color: #4a5568;
    max-width: 80%;
    margin: 0 auto;
  }
  .start-button {
    background-color: #e53e3e; /* Red Accent */
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.8rem 2.5rem;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
    margin-top: 1rem;
  }
  .start-button:hover {
    background-color: #c53030; /* Darker Red */
  }

  .completion-card {
    text-align: center;
  }
  .completion-card h2 {
    font-size: 1.75rem;
    color: #1e8e3e;
  }
  .back-button {
    display: inline-block;
    margin-top: 1rem;
    text-decoration: none;
    color: #c53030; /* Darker Red */
    font-weight: 500;
  }
</style>
