<script>
  import { createNav } from "../navFactory.js";
  import { fade } from "svelte/transition";
  import ConfirmLogoutModal from "./ConfirmLogoutModal.svelte";
  import { onMount } from "svelte";

  // Remove the props since we'll fetch the user data
  export let viewerType = "student"; // This will be overridden by the API call
  export let username = "Guest"; // Default value, will be updated

  let navItems = [];
  let showModal = false;
  let isLoading = true;

  // Function to get cookie value
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  // Fetch user data on component mount
  onMount(async () => {
    await fetchUserData();
  });

  const fetchUserData = async () => {
    try {
      const token = getCookie('session');
      
      if (!token) {
        // No token found, redirect to login
        window.location.href = "/login";
        return;
      }

      const userRes = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (userRes.status === 401) {
        // Invalid token, clear cookie and redirect
        document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/login";
        return;
      }

      if (!userRes.ok) {
        throw new Error(`HTTP error! status: ${userRes.status}`);
      }

      const userData = await userRes.json();
      username = userData.name || "User";
      viewerType = userData.role || "student";

      // Initialize navigation with the correct viewer type
      navItems = createNav(viewerType).map((item) => ({
        ...item,
        active: window.location.pathname === item.href
      }));

    } catch (error) {
      console.error("Error fetching user data:", error);
      // On error, redirect to login for safety
      document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = "/login";
    } finally {
      isLoading = false;
    }
  };

  const logout = () => (showModal = true);
  
  const confirmLogout = () => {
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/login";
  };
  
  const cancelLogout = () => (showModal = false);

  const selectNavItem = (index) => {
    navItems = navItems.map((item, i) => ({
      ...item,
      active: i === index
    }));
    
    // Only navigate if in browser
    if (typeof window !== "undefined") {
      window.location.href = navItems[index].href;
    }
  };
</script>

{#if isLoading}
  <div class="navbar-loading">
    <div class="loading-spinner">Loading...</div>
  </div>
{:else}
  <nav class="navbar">
    <ul class="nav-links">
      {#each navItems as item, i}
        <li class:item-active={item.active}>
          <a href={item.href} on:click|preventDefault={() => selectNavItem(i)}>
            {item.label}
          </a>
        </li>
      {/each}
    </ul>

    <div class="profile">
      <span class="username">{username}</span>
      <span class="role-badge">({viewerType})</span>
      <a href="#" class="logout" on:click|preventDefault={logout}>Cerrar sesión</a>
    </div>
  </nav>

  {#if showModal}
    <div in:fade out:fade>
      <ConfirmLogoutModal
        on:confirm={confirmLogout}
        on:cancel={cancelLogout}
      />
    </div>
  {/if}
{/if}

<style>
  :global(body) {
    font-family: 'Inter', system-ui, sans-serif;
    margin: 0;
  }

  .navbar-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(90deg, #2e64d6, #5a8dee);
    padding: 1rem 2rem;
    color: white;
  }

  .loading-spinner {
    font-weight: 500;
  }

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

  .profile {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .username {
    font-weight: 500;
  }

  .role-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-size: 0.8rem;
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