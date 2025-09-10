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

<h1>Users</h1>
<ul>
  {#each users as user}
    <li>{user.name} ({user.email})</li>
  {/each}
</ul>

<input bind:value={name} placeholder="Name" />
<input bind:value={email} placeholder="Email" />
<button on:click={addUser}>Add User</button>
