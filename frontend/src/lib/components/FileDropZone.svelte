<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';

  export let accept = "application/pdf";
  export let label = "Arrastra tu PDF aquí o haz click";
  export let uploading = false;

  const dispatch = createEventDispatcher();
  let isDragging = false;
  let fileInput: HTMLInputElement;

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function handleDragLeave() {
    isDragging = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      processFile(target.files[0]);
    }
  }

  function processFile(file: File) {
    dispatch('fileDropped', file);
  }
</script>

<div 
  class="dropzone {isDragging ? 'dragging' : ''} {uploading ? 'uploading' : ''}"
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  on:click={() => !uploading && fileInput.click()}
>
  <input 
    type="file" 
    bind:this={fileInput} 
    on:change={handleChange} 
    style="display: none;" 
    {accept}
  />

  <div class="content">
    {#if uploading}
      <div class="spinner"></div>
      <p>Subiendo archivo...</p>
    {:else}
      <span class="icon">📄</span>
      <p>{label}</p>
    {/if}
  </div>
</div>

<style>
  .dropzone {
    border: 2px dashed #cbd5e0;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #f8fafc;
    position: relative;
    overflow: hidden;
  }

  .dropzone:hover, .dropzone.dragging {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .content {
    pointer-events: none; /* Let clicks pass through to container */
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;
  }

  .icon { font-size: 2rem; }

  .spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>