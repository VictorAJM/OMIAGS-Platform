<script>
  import { createNav } from "../lib/navFactory.js";

  export let viewerType = "student"; // or "teacher"
  export let username = "Chaska";

  let navItems = createNav(viewerType);
</script>

<nav class="navbar">
  <!-- Menú central -->
  <ul class="nav-links">
    {#each navItems as item}
      <li class:item-active={item.active}>
        <a href={item.href}>{item.label}</a>
      </li>
    {/each}
  </ul>

  <!-- Perfil -->
  <div class="profile">
    <span class="username">{username}</span>
    <a href="#logout" class="logout">Cerrar sesión</a>
  </div>
</nav>

<style>
  /* ===== GLOBAL FONT ===== */
  :global(body) {
    font-family: 'Inter', system-ui, sans-serif;
    margin: 0;
  }

  /* ===== NAVBAR BASE ===== */
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(90deg, #2e64d6, #5a8dee);
    padding: 0.8rem 2rem;
    color: white;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  /* ===== NAV LINKS ===== */
  .nav-links {
    display: flex;
    gap: 2rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav-links a {
    text-decoration: none;
    color: white;
    font-weight: 500;
    position: relative;
    transition: color 0.2s ease-in-out;
  }

  .nav-links a:hover {
    color: #ffd966;
  }

  /* Indicador de sección activa */
  .item-active a::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -6px;
    width: 100%;
    height: 3px;
    background-color: #ffd966;
    border-radius: 2px;
  }

  /* ===== PERFIL ===== */
  .profile {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .username {
    font-weight: 500;
  }

  .logout {
    background: #ff5a5a;
    padding: 0.45rem 0.9rem;
    border-radius: 20px;
    cursor: pointer;
    color: white;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    transition: background 0.2s ease-in-out, transform 0.1s;
  }

  .logout:hover {
    background: #e04a4a;
    transform: scale(1.05);
  }
</style>