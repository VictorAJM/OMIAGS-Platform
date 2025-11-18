<script>
  import { createEventDispatcher } from "svelte";
  /**
   * @type {{ options: any[]; type: string; correctAnswer: string | any[]; title: any; code: any; }}
   */
  export let question;
  export let index;

  const dispatch = createEventDispatcher();

  function addOption() {
    if (!question.options) {
      question.options = [];
    }
    question.options = [...question.options, "New option"];
  }

  /**
   * @param {number} optionIndex
   */
  function removeOption(optionIndex) {
    question.options.splice(optionIndex, 1);
    question.options = question.options;
  }

  /**
   * @param {string | any[]} option
   */
  function setCorrectAnswer(option) {
    if (question.type === "multiple-answer") {
      if (!question.correctAnswer) {
        question.correctAnswer = [];
      }
      const index = question.correctAnswer.indexOf(option);
      if (index > -1) {
        question.correctAnswer.splice(index, 1);
      } else {
        question.correctAnswer.push(option);
      }
      question.correctAnswer = question.correctAnswer;
    } else {
      question.correctAnswer = option;
    }
  }
  function resize(node) {
    const handleInput = () => {
      node.style.height = "auto";
      node.style.height = node.scrollHeight + "px";
    };
    node.addEventListener("input", handleInput);
    // Initial resize
    setTimeout(handleInput, 0);

    return {
      destroy() {
        node.removeEventListener("input", handleInput);
      },
    };
  }
</script>

<div class="question-editor-card">
  <div class="question-header">
    <span class="question-number">Question {index + 1}</span>
    <button class="remove-question-btn" on:click={() => dispatch("remove")}
      >Remove</button
    >
  </div>

  <textarea
    use:resize
    bind:value={question.title}
    placeholder="Question Title"
    class="question-title-input"
    rows="1"
    draggable="false"
    on:mousedown|stopPropagation
  ></textarea>

  <div class="answer-area">
    {#if question.type === "multiple-choice"}
      {#each question.options as option, i}
        <div class="option-editor">
          <label class="custom-radio">
            <input
              type="radio"
              name="correct-answer-{index}"
              checked={question.correctAnswer === option}
              on:change={() => setCorrectAnswer(option)}
            />
            <span class="radio-checkmark"></span>
          </label>
          <input
            type="text"
            bind:value={question.options[i]}
            class="option-input"
          />
          <button on:click={() => removeOption(i)} class="remove-option-btn"
            >X</button
          >
        </div>
      {/each}
      <button on:click={addOption} class="add-option-btn">Add Option</button>
    {:else if question.type === "true-false"}
      <div class="option-editor">
        <label class="custom-radio">
          <input
            type="radio"
            name="correct-answer-{index}"
            value="True"
            checked={question.correctAnswer === "True"}
            on:change={() => setCorrectAnswer("True")}
          />
          <span class="radio-checkmark"></span>
          True
        </label>
      </div>
      <div class="option-editor">
        <label class="custom-radio">
          <input
            type="radio"
            name="correct-answer-{index}"
            value="False"
            checked={question.correctAnswer === "False"}
            on:change={() => setCorrectAnswer("False")}
          />
          <span class="radio-checkmark"></span>
          False
        </label>
      </div>
    {:else if question.type === "multiple-answer"}
      {#each question.options as option, i}
        <div class="option-editor">
          <label class="custom-checkbox">
            <input
              type="checkbox"
              checked={question.correctAnswer?.includes(option)}
              on:change={() => setCorrectAnswer(option)}
            />
            <span class="checkbox-checkmark"></span>
          </label>
          <input
            type="text"
            bind:value={question.options[i]}
            class="option-input"
          />
          <button on:click={() => removeOption(i)} class="remove-option-btn"
            >X</button
          >
        </div>
      {/each}
      <button on:click={addOption} class="add-option-btn">Add Option</button>
    {:else if question.type === "fill-in-the-blank"}
      <input
        type="text"
        bind:value={question.correctAnswer}
        placeholder="Correct Answer"
        class="fill-in-blank-input"
      />
    {:else if question.type === "complete-the-code"}
      <textarea
        bind:value={question.code}
        class="code-input"
        placeholder="Enter code with [blank] for the blank space"
      ></textarea>
      {#each question.options as option, i}
        <div class="option-editor">
          <label class="custom-radio">
            <input
              type="radio"
              name="correct-answer-{index}"
              checked={question.correctAnswer === option}
              on:change={() => setCorrectAnswer(option)}
            />
            <span class="radio-checkmark"></span>
          </label>
          <input
            type="text"
            bind:value={question.options[i]}
            class="option-input"
          />
          <button on:click={() => removeOption(i)} class="remove-option-btn"
            >X</button
          >
        </div>
      {/each}
      <button on:click={addOption} class="add-option-btn">Add Option</button>
    {/if}
  </div>
</div>

<style>
  .question-editor-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border: 1px solid #e0e0e0;
  }
  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  .question-number {
    font-weight: 500;
    color: #e53e3e;
  }
  .remove-question-btn {
    background: none;
    border: 1px solid #e53e3e;
    color: #e53e3e;
    border-radius: 5px;
    cursor: pointer;
  }
  .question-title-input {
    width: 100%;
    padding: 0.5rem;
    font-size: 1.2rem;
    border: none;
    border-bottom: 2px solid #ddd;
    margin-bottom: 1rem;
    resize: none; /* Handled by JS */
    font-family: inherit;
    overflow: hidden;
    display: block;
    box-sizing: border-box;
  }
  .question-title-input:focus {
    outline: none;
    border-color: #1a73e8;
  }
  .option-editor {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .option-input {
    flex-grow: 1;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  .remove-option-btn {
    background: none;
    border: 1px solid #ccc;
    border-radius: 50%;
    cursor: pointer;
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    padding: 0;
  }
  .add-option-btn {
    margin-top: 0.5rem;
    background: none;
    border: 1px dashed #ccc;
    color: #555;
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-radius: 5px;
  }
  .fill-in-blank-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  .code-input {
    box-sizing: border-box;
    min-height: 120px;
    width: 100%;
    background-color: #2d2d2d;
    color: #f8f8f2;
    padding: 1rem;
    border-radius: 8px;
    border: 2px solid #44475a;
    font-family: "Fira Code", "Courier New", Courier, monospace;
    font-size: 0.95rem;
    line-height: 1.6;
    transition: border-color 0.2s;
    resize: vertical;
  }

  .code-input:focus {
    outline: none;
    border-color: #6272a4;
  }

  /* Custom Checkbox and Radio Styles */
  .custom-radio,
  .custom-checkbox {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 1rem;
    gap: 0.5rem;
  }

  .custom-radio input,
  .custom-checkbox input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .radio-checkmark,
  .checkbox-checkmark {
    position: relative;
    height: 22px;
    width: 22px;
    background-color: #fff;
    border: 2px solid #ccc;
    transition: all 0.2s;
  }

  .radio-checkmark {
    border-radius: 50%;
  }

  .checkbox-checkmark {
    border-radius: 4px;
  }

  .custom-radio:hover input ~ .radio-checkmark,
  .custom-checkbox:hover input ~ .checkbox-checkmark {
    border-color: #4caf50; /* Green */
  }

  .custom-radio input:checked ~ .radio-checkmark,
  .custom-checkbox input:checked ~ .checkbox-checkmark {
    background-color: #4caf50;
    border-color: #4caf50;
  }

  .radio-checkmark:after,
  .checkbox-checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }

  .custom-radio input:checked ~ .radio-checkmark:after,
  .custom-checkbox input:checked ~ .checkbox-checkmark:after {
    display: block;
  }

  /* Style for radio checkmark */
  .custom-radio .radio-checkmark:after {
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: white;
    transform: translate(-46%, -46%);
  }

  /* Style for checkbox checkmark */
  .custom-checkbox .checkbox-checkmark:after {
    left: 7px;
    top: 3px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
  }
</style>
