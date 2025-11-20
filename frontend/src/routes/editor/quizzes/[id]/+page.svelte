<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { page } from "$app/stores";
  import NavBar from "../../../../lib/components/NavBar.svelte";
  import QuestionEditor from "../../../../lib/components/QuestionEditor.svelte";

  import SuccessPopup from "../../../../lib/components/SuccessPopup.svelte";
  import ConfirmSaveQuizModal from "../../../../lib/components/ConfirmSaveQuizModal.svelte";

  /**
   * @type {{ title: string; description: string; questions: any[]; courseId?: string; currentAttempts?: number; }}
   */
  let quizData = {
    title: "",
    description: "",
    questions: [],
    currentAttempts: 0,
  };

  let showAddQuestionModal = false;
  let showSuccessPopup = false;
  let showConfirmSaveModal = false;
  /**
   * @type {number}
   */
  let dragStartIndex;
  let dropPosition = "top"; // 'top' or 'bottom'
  /**
   * @type {HTMLDivElement}
   */
  let editorCardElement;

  /**
   * @type {string | undefined}
   */
  let auth_token;
  onMount(async () => {
    auth_token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("session="))
      ?.split("=")[1];

    if (!auth_token) {
      window.location.href = "/login";
      return;
    }

    await fetchQuiz();
  });

  async function fetchQuiz() {
    try {
      const response = await fetch(
        `http://localhost:5000/api/quizzes/${$page.params.id}`,
        {
          headers: {
            Authorization: `Bearer ${auth_token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      quizData = data;
    } catch (error) {
      console.error("Error fetching quiz:", error);
    }
  }

  /**
   * @param {string} questionType
   */
  function addQuestion(questionType) {
    const newQuestion = {
      _id: `q${Date.now()}`,
      title: "New Question",
      type: questionType,
      options:
        questionType === "multiple-choice" ||
        questionType === "multiple-answer" ||
        questionType === "complete-the-code"
          ? []
          : undefined,
      code: questionType === "complete-the-code" ? "" : undefined,
      correctAnswer: questionType === "multiple-answer" ? [] : "",
      value: 1,
    };
    quizData.questions = [...quizData.questions, newQuestion];
    showAddQuestionModal = false;
  }

  /**
   * @param {number} index
   */
  function removeQuestion(index) {
    quizData.questions.splice(index, 1);
    quizData.questions = quizData.questions;
  }

  /**
   * @param {DragEvent & { currentTarget: EventTarget & HTMLDivElement; }} e
   * @param {number} index
   */
  function handleDragStart(e, index) {
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      dragStartIndex = index;
    }
  }

  /**
   * @param {{ currentTarget: { getBoundingClientRect: () => any; classList: { add: (arg0: string) => void; remove: (arg0: string) => void; }; }; clientY: number; }} e
   */
  function handleQuestionDragOver(e) {
    // Clear existing indicators to prevent flickering
    if (editorCardElement) {
      editorCardElement
        .querySelectorAll(".draggable-question")
        .forEach((el) => {
          el.classList.remove("drop-indicator-top", "drop-indicator-bottom");
        });
    }

    const targetRect = e.currentTarget.getBoundingClientRect();
    const midY = targetRect.top + targetRect.height / 2;
    if (e.clientY < midY) {
      dropPosition = "top";
      e.currentTarget.classList.add("drop-indicator-top");
    } else {
      dropPosition = "bottom";
      e.currentTarget.classList.add("drop-indicator-bottom");
    }
  }

  /**
   * @param {{ clientY: number; }} e
   */
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

  /**
   * @param {any[]} arr
   * @param {number} from
   * @param {any} to
   */
  function move(arr, from, to) {
    const item = arr.splice(from, 1)[0];
    arr.splice(to, 0, item);
    return arr;
  }

  /**
   * @param {DragEvent & { currentTarget: EventTarget & HTMLDivElement; }} e
   * @param {number} dropIndex
   */
  function handleDrop(e, dropIndex) {
    // Clear all indicators on drop
    if (editorCardElement) {
      editorCardElement
        .querySelectorAll(".draggable-question")
        .forEach((el) => {
          el.classList.remove("drop-indicator-top", "drop-indicator-bottom");
        });
    }

    let finalDropIndex = dropIndex;
    if (dropPosition === "bottom") {
      finalDropIndex++;
    }

    if (dragStartIndex < finalDropIndex) {
      finalDropIndex--;
    }

    if (dragStartIndex === finalDropIndex) return; // No change

    quizData.questions = move(
      quizData.questions,
      dragStartIndex,
      finalDropIndex,
    );
  }

  /**
   * @param {{ key: string; }} e
   */
  function handleKeydown(e) {
    if (e.key === "Escape" && showAddQuestionModal) {
      showAddQuestionModal = false;
    }
  }

  async function handleSaveChanges() {
    const validationError = validateQuiz();
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/quizzes/attempts?quizId=${$page.params.id}`,
        {
          headers: {
            Authorization: `Bearer ${auth_token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attempt count");
      }

      const data = await response.json();
      quizData.currentAttempts = data.attemptCount;

      if (quizData.currentAttempts > 0) {
        showConfirmSaveModal = true;
      } else {
        await performSave(false);
      }
    } catch (error) {
      console.error("Error checking attempts:", error);
      showToast("Error verifying quiz attempts. Please try again.", "error");
    }
  }

  function validateQuiz() {
    if (!quizData.questions || quizData.questions.length === 0) {
      return "Please add at least one question.";
    }

    console.log(quizData);

    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];

      // Check if title is empty
      if (!q.title || q.title.trim() === "") {
        return `Question ${i + 1} must have a title.`;
      }

      // Check if correct answer is selected/provided
      if (q.type === "multiple-answer") {
        if (
          !q.correctAnswer ||
          !Array.isArray(q.correctAnswer) ||
          q.correctAnswer.length === 0
        ) {
          return `Question ${i + 1} must have at least one correct answer selected. 1`;
        }
      } else {
        if (
          !q.correctAnswer ||
          (typeof q.correctAnswer === "string" && q.correctAnswer.trim() === "")
        ) {
          return `Question ${i + 1} must have a correct answer selected.`;
        }
      }

      // specific checks for options
      if (
        ["multiple-choice", "multiple-answer", "complete-the-code"].includes(
          q.type,
        )
      ) {
        if (!q.options || q.options.length < 2) {
          return `Question ${i + 1} must have at least two options. 3`;
        }
        // Check for empty options
        if (
          q.options.some(
            (/** @type {string} */ opt) => !opt || opt.trim() === "",
          )
        ) {
          return `Question ${i + 1} has empty options. Please fill or remove them. 4`;
        }
      }
    }
    return null;
  }

  let toastMessage = "";
  let toastType = "info"; // 'info', 'success', 'error'
  let showToastVisible = false;
  /** @type {any} */
  let toastTimeout;

  /**
   * @param {string} message
   * @param {string} type
   */
  function showToast(message, type = "info") {
    toastMessage = message;
    toastType = type;
    showToastVisible = true;

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      showToastVisible = false;
    }, 4000);
  }

  /**
   * @param {boolean} deleteAttempts
   */
  async function performSave(deleteAttempts) {
    const quizPayload = JSON.parse(JSON.stringify(quizData));

    quizPayload.courseId = "60d5ecb4b7c5a53da8d6f123";
    quizPayload.deleteAttempts = deleteAttempts;

    quizPayload.questions.forEach(
      (/** @type {{ _id: any; value: any; }} */ q) => {
        delete q._id; // Remove client-side ID
        q.value = q.value || 1; // Add default value if not present
      },
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/quizzes/${$page.params.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
          body: JSON.stringify(quizPayload),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Quiz updated successfully:", responseData);
      showSuccessPopup = true;
      showConfirmSaveModal = false;

      // Update local state to reflect that attempts might have been deleted
      if (deleteAttempts) {
        quizData.currentAttempts = 0;
      }
    } catch (error) {
      console.error("Error updating quiz:", error);
      showToast("Error saving quiz. Please try again.", "error");
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<NavBar viewerType="student" username="Chaska" />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="editor-page-container"
  on:dragover|preventDefault={handleGlobalDragOver}
>
  <div class="quiz-editor-card" bind:this={editorCardElement}>
    <div class="quiz-header-editor">
      <input
        type="text"
        bind:value={quizData.title}
        class="quiz-title-input"
        placeholder="Quiz Title"
      />
      <textarea
        bind:value={quizData.description}
        class="quiz-description-input"
        placeholder="Quiz Description"
      ></textarea>
    </div>

    {#each quizData.questions as question, i (question._id)}
      <div
        class="draggable-question"
        draggable="true"
        on:dragstart={(e) => handleDragStart(e, i)}
        on:dragover|preventDefault={handleQuestionDragOver}
        on:drop|preventDefault={(e) => handleDrop(e, i)}
      >
        <QuestionEditor
          {question}
          index={i}
          on:remove={() => removeQuestion(i)}
        />
      </div>
    {/each}

    <div class="add-question-controls">
      <button
        on:click={() => (showAddQuestionModal = true)}
        class="add-question-btn">Add Question</button
      >
    </div>

    <div class="save-changes-area">
      <button class="save-changes-btn" on:click={handleSaveChanges}
        >Save Changes</button
      >
    </div>
  </div>
</div>

{#if showAddQuestionModal}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="modal-backdrop" on:click={() => (showAddQuestionModal = false)}>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-content" on:click|stopPropagation>
      <h2>Select Question Type</h2>
      <div class="question-type-list">
        <button type="button" on:click={() => addQuestion("multiple-choice")}
          >Multiple Choice</button
        >
        <button type="button" on:click={() => addQuestion("true-false")}
          >True/False</button
        >
        <button type="button" on:click={() => addQuestion("fill-in-the-blank")}
          >Fill in the Blank</button
        >
        <button type="button" on:click={() => addQuestion("multiple-answer")}
          >Multiple Answer</button
        >
        <button type="button" on:click={() => addQuestion("complete-the-code")}
          >Complete the Code</button
        >
      </div>
    </div>
  </div>
{/if}

{#if showSuccessPopup}
  <SuccessPopup
    message="Quiz saved successfully!"
    on:close={() => (showSuccessPopup = false)}
  />
{/if}

{#if showConfirmSaveModal}
  <ConfirmSaveQuizModal
    attemptsCount={quizData.currentAttempts || 0}
    on:deleteAndSave={() => performSave(true)}
    on:saveOnly={() => performSave(false)}
    on:cancel={() => (showConfirmSaveModal = false)}
  />
{/if}

{#if showToastVisible}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="toast-notification {toastType}"
    on:click={() => (showToastVisible = false)}
    transition:fade
  >
    <span class="toast-icon">
      {#if toastType === "error"}
        ⚠️
      {:else if toastType === "success"}
        ✅
      {:else}
        ℹ️
      {/if}
    </span>
    <span class="toast-message">{toastMessage}</span>
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
    box-sizing: border-box;
    width: 100%;
    border: 1px solid #dadce0;
    border-radius: 8px;
    padding: 1rem;
    font-size: 1rem;
    min-height: 100px;
    line-height: 1.5;
    transition:
      border-color 0.2s,
      box-shadow 0.2s;
    resize: vertical;
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

  :global(.drop-indicator-top::before),
  :global(.drop-indicator-bottom::after) {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 4px;
    background-color: #1a73e8;
    border-radius: 2px;
    z-index: 100;
  }

  :global(.drop-indicator-top::before) {
    top: -8px; /* Half of the gap */
  }

  :global(.drop-indicator-bottom::after) {
    bottom: -8px; /* Half of the gap */
  }

  /* Modal Styles */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
  }

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 500px;
  }

  .modal-content h2 {
    margin-top: 0;
    text-align: center;
    color: #2d3748;
  }

  .question-type-list {
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
  }

  .question-type-list button {
    width: 100%;
    background: transparent;
    border: 1px solid #e0e0e0;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 0.75rem;
    cursor: pointer;
    transition:
      background-color 0.2s,
      transform 0.2s;
    text-align: center;
    font-weight: 500;
    font-size: inherit;
    font-family: inherit;
    color: inherit;
  }

  .question-type-list button:hover {
    background-color: #f0f2f5;
    transform: translateY(-2px);
  }

  .question-type-list button:last-child {
    margin-bottom: 0;
  }

  /* Toast Styles */
  .toast-notification {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: white;
    padding: 1rem 2rem;
    border-radius: 50px;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 2000;
    cursor: pointer;
    min-width: 300px;
    max-width: 90%;
  }

  .toast-notification.error {
    background-color: #e53e3e;
  }

  .toast-notification.success {
    background-color: #38a169;
  }

  .toast-notification.info {
    background-color: #3182ce;
  }

  .toast-icon {
    font-size: 1.2rem;
  }

  .toast-message {
    font-weight: 500;
    font-size: 1rem;
  }
</style>
