<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { scale, fade } from "svelte/transition";

    export let lessonId: string;

    const dispatch = createEventDispatcher();

    let title = "";
    let description = "";
    let loading = false;
    let error = "";

    async function handleCreate() {
        if (!title.trim()) {
            error = "El título es obligatorio";
            return;
        }

        loading = true;
        error = "";

        try {
            const res = await fetch("http://localhost:5000/api/quizzes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    lessonId,
                    questions: [],
                }),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.message || "Error al crear el quiz");
            }

            const newQuiz = await res.json();
            dispatch("created", newQuiz);
            dispatch("close");
        } catch (err: any) {
            console.error(err);
            error = err.message || "Error inesperado";
        } finally {
            loading = false;
        }
    }
</script>

<div
    class="modal-backdrop"
    on:click={() => dispatch("close")}
    transition:fade={{ duration: 200 }}
>
    <div class="modal" on:click|stopPropagation in:scale={{ start: 0.95 }}>
        <h3 class="modal-title">Crear Nuevo Quiz</h3>

        {#if error}
            <div class="alert-error">{error}</div>
        {/if}

        <form on:submit|preventDefault={handleCreate}>
            <div class="form-group">
                <label for="q-title">Título del Quiz</label>
                <input
                    id="q-title"
                    type="text"
                    bind:value={title}
                    required
                    placeholder="Ej. Examen Parcial 1"
                />
            </div>

            <div class="form-group">
                <label for="q-desc">Descripción</label>
                <textarea
                    id="q-desc"
                    rows="3"
                    bind:value={description}
                    placeholder="Breve descripción..."
                ></textarea>
            </div>

            <div class="form-actions">
                <button
                    type="button"
                    class="btn-secondary"
                    on:click={() => dispatch("close")}>Cancelar</button
                >
                <button type="submit" class="btn-primary" disabled={loading}>
                    {loading ? "Creando..." : "Crear Quiz"}
                </button>
            </div>
        </form>
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(3px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1200;
    }

    .modal {
        background: #ffffff;
        border-radius: 16px;
        padding: 1.5rem;
        width: 90%;
        max-width: 450px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .modal-title {
        font-size: 1.3rem;
        font-weight: 600;
        color: #1f2937;
        margin: 0;
        text-align: center;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        margin-bottom: 1rem;
    }
    label {
        font-size: 0.85rem;
        font-weight: 600;
        color: #4b5563;
    }

    input,
    textarea {
        width: 100%;
        padding: 0.6rem;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 0.9rem;
        background: #fff;
        box-sizing: border-box;
    }
    input:focus,
    textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 0.5rem;
    }

    .btn-primary {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.6rem 1.2rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
    }
    .btn-primary:hover {
        background: #2563eb;
    }
    .btn-primary:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .btn-secondary {
        background: #e5e7eb;
        color: #374151;
        border: none;
        padding: 0.6rem 1.2rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
    }
    .btn-secondary:hover {
        background: #d1d5db;
    }

    .alert-error {
        background: #fee2e2;
        color: #b91c1c;
        padding: 0.75rem;
        border-radius: 8px;
        font-size: 0.9rem;
        border: 1px solid #fecaca;
        margin-bottom: 1rem;
    }
</style>
