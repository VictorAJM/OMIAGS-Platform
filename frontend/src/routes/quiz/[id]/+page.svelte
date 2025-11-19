<script>
  import NavBar from "../../../lib/components/NavBar.svelte";
  import ScoreCircle from "../../../lib/components/ScoreCircle.svelte";
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

  let answerState = "idle"; // 'idle', 'checking', 'checked'
  let lastSubmission = null; // { isCorrect: boolean, correctAnswer: any } | null

  let correctAnswers = 0;
  let auth_token;

  // --- Reactive Derived State ---
  $: quizId = $page.params.id;
  $: currentQuestion = quizData
    ? quizData.questions[currentQuestionIndex]
    : null;
  $: progress = quizData
    ? ((currentQuestionIndex + (answerState === "checked" ? 1 : 0)) /
        quizData.questions.length) *
      100
    : 0;

  // Reset selectedAnswer when the question changes
  $: {
    if (currentQuestion) {
      if (currentQuestion.type === "multiple-answer") {
        selectedAnswer = [];
      } else {
        selectedAnswer = null;
      }
    }
  }

  onMount(async () => {
    auth_token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("session="))
      ?.split("=")[1];

    if (!auth_token) {
      window.location.href = "/login";
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/quizzes/${quizId}`, {
        headers: { Authorization: `Bearer ${auth_token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to load the quiz.");
      }
      quizData = await res.json();
      console.log(quizData);
      const totalQuestions = quizData.questions.length;
      const questionsAnswered = quizData.currentQuestion;

      if (questionsAnswered > 0 && questionsAnswered < totalQuestions) {
        currentQuestionIndex = questionsAnswered;
        correctAnswers = quizData.currentScore;
      } else if (questionsAnswered === totalQuestions && totalQuestions > 0) {
        quizStarted = true;
        quizFinished = true;
        correctAnswers = quizData.currentScore;
      }
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
    if (answerState !== "idle") return; // Don't allow changes after submission

    if (currentQuestion.type === "multiple-answer") {
      const currentSelection = selectedAnswer || [];
      const index = currentSelection.indexOf(option);
      if (index > -1) {
        selectedAnswer = currentSelection.filter((item) => item !== option);
      } else {
        selectedAnswer = [...currentSelection, option];
      }
    } else {
      selectedAnswer = option;
    }
  }

  async function handleSubmit() {
    if (answerState === "checking") return;
    answerState = "checking";

    const answerPayload = {
      quizId: quizData.id,
      questionIndex: currentQuestionIndex,
      answer: selectedAnswer,
    };

    try {
      const response = await fetch(
        "http://localhost:5000/api/quizzes/submit-answer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
          body: JSON.stringify(answerPayload),
        },
      );

      if (response.ok) {
        const responseData = await response.json();
        lastSubmission = {
          isCorrect: responseData.correct,
          correctAnswer: responseData.answer,
        };

        if (lastSubmission.isCorrect) {
          correctAnswers++;
        }

        answerState = "checked";
      } else {
        const errorData = await response.json();
        error = errorData.message || "Failed to submit answer.";
        answerState = "idle";
      }
    } catch (err) {
      error = err.message;
      answerState = "idle";
    }
  }

  function handleNext() {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      currentQuestionIndex++;
    } else {
      quizFinished = true;
    }
    // Reset for the next question
    answerState = "idle";
    lastSubmission = null;
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
        <p class="description">
          {quizData.description || "Ready to test your knowledge?"}
        </p>
        <button class="start-button" on:click={startQuiz}>
          {#if quizData.currentQuestion > 0 && quizData.currentQuestion < quizData.questions.length}
            Continue Quiz
          {:else}
            Start Quiz
          {/if}
        </button>
      </div>
    {:else if quizFinished}
      <div class="quiz-card completion-card">
        <h2>Quiz Results</h2>
        <ScoreCircle
          score={Math.round((correctAnswers / quizData.questions.length) * 100)}
          class="centered-score-circle"
        />
        <p>
          You answered {correctAnswers} out of {quizData.questions.length} questions
          correctly.
        </p>
        <a href="/" class="back-button">Back to Home</a>
      </div>
    {:else if currentQuestion}
      <div class="quiz-card">
        <!-- Progress Bar -->
        <div class="progress-container">
          <div class="progress-info">
            <span class="progress-text"
              >Question {currentQuestionIndex + 1} of {quizData.questions
                .length}</span
            >
            <span class="points-text">{currentQuestion.value || 1} pts</span>
          </div>
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
          {#if currentQuestion.type === "multiple-choice"}
            {#each currentQuestion.options as option}
              <button
                class="answer-option"
                class:selected={selectedAnswer === option}
                on:click={() => handleSelectOption(option)}
                disabled={answerState !== "idle"}
              >
                {option}
              </button>
            {/each}
          {:else if currentQuestion.type === "true-false"}
            <button
              class="answer-option"
              class:selected={selectedAnswer === "True"}
              on:click={() => handleSelectOption("True")}
              disabled={answerState !== "idle"}
            >
              True
            </button>
            <button
              class="answer-option"
              class:selected={selectedAnswer === "False"}
              on:click={() => handleSelectOption("False")}
              disabled={answerState !== "idle"}
            >
              False
            </button>
          {:else if currentQuestion.type === "multiple-answer"}
            {#each currentQuestion.options as option}
              <button
                class="answer-option"
                class:selected={selectedAnswer?.includes(option)}
                on:click={() => handleSelectOption(option)}
                disabled={answerState !== "idle"}
              >
                {option}
              </button>
            {/each}
          {:else if currentQuestion.type === "fill-in-the-blank"}
            <input
              type="text"
              class="fill-in-blank-input"
              placeholder="Type your answer here..."
              bind:value={selectedAnswer}
              disabled={answerState !== "idle"}
            />
          {:else if currentQuestion.type === "complete-the-code"}
            {@const codeParts = currentQuestion.code.split("[blank]")}
            <div class="code-question-container">
              <div class="code-block">
                <pre><code
                    >{codeParts[0]}<span class="code-blank"
                      >{selectedAnswer || "..."}</span
                    >{codeParts[1]}</code
                  ></pre>
              </div>
            </div>

            {#each currentQuestion.options as option}
              <button
                class="answer-option"
                class:selected={selectedAnswer === option}
                on:click={() => handleSelectOption(option)}
                disabled={answerState !== "idle"}
              >
                {option}
              </button>
            {/each}
          {/if}
        </div>

        <!-- Navigation -->
        <div class="navigation-area">
          {#if answerState !== "checked"}
            <button
              on:click={handleSubmit}
              disabled={!selectedAnswer ||
                (Array.isArray(selectedAnswer) &&
                  selectedAnswer.length === 0) ||
                answerState === "checking"}
            >
              {#if answerState === "checking"}
                Checking...
              {:else}
                Submit
              {/if}
            </button>
          {/if}
        </div>
      </div>

      <!-- Feedback Panel -->
      {#if answerState === "checked" && lastSubmission}
        <div
          class="feedback-container"
          class:correct={lastSubmission.isCorrect}
          class:incorrect={!lastSubmission.isCorrect}
        >
          <div class="feedback-content">
            <div class="feedback-header">
              {#if lastSubmission.isCorrect}
                <span class="feedback-icon">✅</span>
                <h2>Correct!</h2>
              {:else}
                <span class="feedback-icon">❌</span>
                <div>
                  <h2>Wrong Answer!</h2>
                  {#if !lastSubmission.isCorrect}
                    <p class="correct-answer-info">
                      The correct answer is: <strong
                        >{Array.isArray(lastSubmission.correctAnswer)
                          ? lastSubmission.correctAnswer.join(", ")
                          : lastSubmission.correctAnswer}</strong
                      >
                    </p>
                  {/if}
                </div>
              {/if}
            </div>
            <button
              on:click={handleNext}
              class="feedback-continue-btn {lastSubmission.isCorrect
                ? 'correct'
                : 'incorrect'}"
            >
              {currentQuestionIndex === quizData.questions.length - 1
                ? "Finish Quiz"
                : "Continue"}
            </button>
          </div>
        </div>
      {/if}
    {/if}
  {/if}
</div>

<style>
  .quiz-page-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: calc(100vh - 80px); /* Adjust based on NavBar height */
    padding: 2rem 1rem 150px; /* Add padding to the bottom for feedback panel */
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
    align-items: center; /* Added to center items horizontally */
  }

  .error-message {
    color: #d93025;
    font-weight: 500;
  }

  /* --- Progress --- */
  .progress-container {
    width: 100%;
  }
  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  .progress-text {
    font-size: 0.9rem;
    color: #5f6368;
  }
  .points-text {
    font-size: 0.9rem;
    color: #5f6368;
    font-weight: 500;
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
    width: 100%;
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
    justify-self: center;
    box-sizing: border-box;
  }
  .answer-option:hover:not(:disabled) {
    background-color: #f8f9fa;
    border-color: #cdd1d5;
  }
  .answer-option.selected {
    background-color: #e8f0fe; /* Light Blue */
    border-color: #1a73e8; /* Blue Accent */
    color: #1967d2; /* Darker Blue */
    font-weight: 500;
  }
  .answer-option:disabled {
    cursor: not-allowed;
    opacity: 0.7;
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
  .fill-in-blank-input:disabled {
    background-color: #f1f3f4;
  }

  /* --- Code Question --- */
  .code-question-container {
    width: 100%;
    margin-bottom: 2.25rem;
  }
  .code-block {
    background-color: #2d2d2d;
    color: #f8f8f2;
    padding: 1rem;
    border-radius: 8px;
    width: 95%;
    margin: -1rem auto 0;
    box-sizing: border-box;
    font-family: "Fira Code", "Courier New", Courier, monospace;
    white-space: pre-wrap;
    text-align: left;
  }
  .code-block pre {
    margin: 0;
  }
  .code-blank {
    display: inline-block;
    background-color: #44475a;
    color: #e2b3ff;
    padding: 0.2em 0.6em;
    border-radius: 4px;
    width: 80%;
    text-align: left;
  }

  /* --- Navigation --- */
  .navigation-area {
    margin-top: 1rem;
    text-align: center;
    min-height: 50px; /* Reserve space to prevent layout shift */
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
  .start-card,
  .completion-card {
    text-align: center;
    gap: 1.5rem;
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
    background-color: #e53e3e;
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
    background-color: #c53030;
  }
  .completion-card h2 {
    font-size: 2rem;
    color: #2d3748;
    margin-bottom: 1rem;
  }
  .back-button {
    display: inline-block;
    margin-top: 1.5rem;
    text-decoration: none;
    color: #fff;
    background-color: #e53e3e;
    padding: 0.8rem 2.5rem;
    border-radius: 8px;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  .back-button:hover {
    background-color: #c53030;
  }

  /* --- Feedback Panel --- */
  .feedback-container {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #fff;
    border-top: 2px solid;
    padding: 1rem 2rem;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
    animation: slideUp 0.3s ease-out;
    z-index: 100;
  }
  .feedback-container.correct {
    border-color: #1e8e3e;
  }
  .feedback-container.incorrect {
    border-color: #d93025;
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  .feedback-content {
    max-width: 640px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }

  .feedback-header {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .feedback-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }
  .feedback-container.correct .feedback-header h2 {
    color: #1e8e3e;
  }
  .feedback-container.incorrect .feedback-header h2 {
    color: #d93025;
  }
  .feedback-icon {
    font-size: 1.5rem;
  }

  .correct-answer-info {
    margin: 0;
    font-size: 1rem;
    color: #5f6368;
  }
  .correct-answer-info strong {
    color: #202124;
  }

  .feedback-continue-btn {
    border: none;
    border-radius: 8px;
    padding: 0.8rem 2.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    color: #fff;
    flex-shrink: 0;
    transition: background-color 0.2s;
  }
  .feedback-continue-btn.correct {
    background-color: #1e8e3e;
  }
  .feedback-continue-btn.correct:hover {
    background-color: #1a7a34;
  }
  .feedback-continue-btn.incorrect {
    background-color: #d93025;
  }
  .feedback-continue-btn.incorrect:hover {
    background-color: #b5281f;
  }
</style>
