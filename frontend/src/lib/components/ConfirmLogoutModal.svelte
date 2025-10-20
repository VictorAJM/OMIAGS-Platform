<script lang="ts">
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let message = "Tu sesión se cerrará y deberás volver a iniciar sesión.";

  const confirm = () => dispatch("confirm");
  const cancel = () => dispatch("cancel");
</script>

<div class="modal-backdrop">
  <div class="modal">
    <h3>¿Cerrar sesión?</h3>
    <p>Tu sesión se cerrará y deberás volver a iniciar sesión.</p>
    <div class="actions">
      <button class="confirm" on:click={confirm}>Sí</button>
      <button class="cancel" on:click={cancel}>No</button>
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
    z-index: 50;
  }

  .modal {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    text-align: center;
    width: 300px;
  }

  .actions {
    margin-top: 1rem;
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .confirm {
    background: #ff5a5a;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
  }

  .cancel {
    background: #ddd;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
  }
</style>
