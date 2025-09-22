<script>
  import { createNav } from "../lib/navFactory.js";

  export let viewerType = "teacher"; // or "teacher"
  export let username = "Chaska";

  let navItems = createNav(viewerType);
</script>

<nav class="navbar">
  <ul class="nav-links">
    {#each navItems as item}
      <li class:item-active={item.active}>
        <a href={item.href}>{item.label}</a>
      </li>
    {/each}
  </ul>
  <div class="profile">
    <span>{username}</span>
  </div>
</nav>

<style>
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #2e64d6;
    padding: 0.75rem 1.5rem;
    color: white;
  }
  .nav-links {
    display: flex;
    gap: 1rem;
    list-style: none;
  }
  .nav-links a {
    text-decoration: none;
    color: white;
    font-weight: 500;
  }
  .item-active a {
    font-weight: bold;
    border-bottom: 2px solid #fff;
  }
  .profile {
    font-weight: 500;
  }
</style>
