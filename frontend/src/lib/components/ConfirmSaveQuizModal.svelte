<script lang="ts">
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let attemptsCount = 0;

    const deleteAndSave = () => dispatch("deleteAndSave");
    const saveOnly = () => dispatch("saveOnly");
    const cancel = () => dispatch("cancel");
</script>

<div class="modal-backdrop">
    <div class="modal">
        <h3>Existing Attempts Found</h3>
        <p>
            This quiz has <strong>{attemptsCount}</strong> existing attempt{attemptsCount !==
            1
                ? "s"
                : ""}.
        </p>
        <p class="warning-text">
            Modifying the quiz might cause inconsistencies with these attempts.
        </p>
        <p>Do you want to delete all existing attempts before saving?</p>

        <div class="actions">
            <button class="btn-danger" on:click={deleteAndSave}>
                Delete Attempts & Save
            </button>
            <button class="btn-primary" on:click={saveOnly}>
                Save (Keep Attempts)
            </button>
            <button class="btn-secondary" on:click={cancel}> Cancel </button>
        </div>
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
    }

    .modal {
        background: white;
        padding: 2rem;
        border-radius: 16px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        text-align: center;
        width: 90%;
        max-width: 450px;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    h3 {
        margin: 0;
        color: #2d3748;
        font-size: 1.5rem;
    }

    p {
        margin: 0;
        color: #4a5568;
        line-height: 1.5;
    }

    .warning-text {
        color: #e53e3e;
        font-weight: 500;
    }

    .actions {
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    button {
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
    }

    .btn-danger {
        background-color: #e53e3e;
        color: white;
    }
    .btn-danger:hover {
        background-color: #c53030;
    }

    .btn-primary {
        background-color: #1a73e8;
        color: white;
    }
    .btn-primary:hover {
        background-color: #1557b0;
    }

    .btn-secondary {
        background-color: #edf2f7;
        color: #4a5568;
    }
    .btn-secondary:hover {
        background-color: #e2e8f0;
    }
</style>
