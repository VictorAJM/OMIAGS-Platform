<script lang="ts">
  export let currentPage: number;
  export let totalPages: number;
  export let onPageChange: (page: number) => void;
  
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  }

  function getVisiblePages(): number[] {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    // Ajustar el inicio si estamos cerca del final
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
</script>

<div class="pagination">
  <button
    class="pagination-btn {currentPage === 1 ? 'disabled' : ''}"
    on:click={() => goToPage(currentPage - 1)}
    disabled={currentPage === 1}
  >
    ‹
  </button>
  
  {#if getVisiblePages()[0] > 1}
    <button class="pagination-btn" on:click={() => goToPage(1)}>1</button>
    {#if getVisiblePages()[0] > 2}
      <span class="pagination-ellipsis">...</span>
    {/if}
  {/if}
  
  {#each getVisiblePages() as page}
    <button
      class="pagination-btn {currentPage === page ? 'active' : ''}"
      on:click={() => goToPage(page)}
    >
      {page}
    </button>
  {/each}
  
  {#if getVisiblePages()[getVisiblePages().length - 1] < totalPages}
    {#if getVisiblePages()[getVisiblePages().length - 1] < totalPages - 1}
      <span class="pagination-ellipsis">...</span>
    {/if}
    <button class="pagination-btn" on:click={() => goToPage(totalPages)}>
      {totalPages}
    </button>
  {/if}
  
  <button
    class="pagination-btn {currentPage === totalPages ? 'disabled' : ''}"
    on:click={() => goToPage(currentPage + 1)}
    disabled={currentPage === totalPages}
  >
    ›
  </button>
</div>

<style>
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .pagination-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 2rem;
    height: 2rem;
    padding: 0 0.5rem;
    border: 1px solid #e2e8f0;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }

  .pagination-btn:hover:not(.disabled) {
    background: #f7fafc;
    border-color: #cbd5e0;
  }

  .pagination-btn.active {
    background: #4299e1;
    color: white;
    border-color: #4299e1;
  }

  .pagination-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pagination-ellipsis {
    padding: 0 0.5rem;
    color: #718096;
  }
</style>