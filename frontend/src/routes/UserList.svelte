<script>
  import { onMount } from "svelte";
  let users = [];
  let name = "";
  let email = "";

  onMount(async () => {
    const res = await fetch("http://localhost:5000/api/users");
    users = await res.json();
  });

  async function addUser() {
    const res = await fetch("http://localhost:5000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email })
    });
    const newUser = await res.json();
    users = [...users, newUser];
    name = "";
    email = "";
  }
</script>

<div class="user-container">
  <h2>Users</h2>
  <div class="scroll-list">
    {#each users as user}
      <div class="user-card">
        <strong>{user.name}</strong> <br />
        <span>{user.email}</span>
      </div>
    {/each}
  </div>

  <div class="form">
    <input bind:value={name} placeholder="Name" />
    <input bind:value={email} placeholder="Email" />
    <button on:click={addUser}>Add User</button>
  </div>
</div>

<style>
  .user-container {
    padding: 1rem;
  }
  .scroll-list {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #ddd;
    padding: 1rem;
    margin-bottom: 1rem;
  }
  .user-card {
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
  }
  .form {
    display: flex;
    gap: 0.5rem;
  }
  input {
    padding: 0.4rem;
  }
  button {
    background: #2e64d6;
    color: white;
    border: none;
    padding: 0.4rem 0.8rem;
    cursor: pointer;
    border-radius: 5px;
  }
</style>
