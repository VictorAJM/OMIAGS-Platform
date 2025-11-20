<script>
  import { createNav } from "../navFactory.js";
  import { fade } from "svelte/transition";
  import ConfirmLogoutModal from "./ConfirmLogoutModal.svelte";
  import { onMount } from "svelte";

  export let viewerType = "student";
  export let username = "Guest";

  let navItems = [];
  let showModal = false;
  let isLoading = true;

  onMount(async () => {
    await fetchUserData();
  });

  const fetchUserData = async () => {
    try {
      const userRes = await fetch("http://localhost:5000/api/auth/me", {
        credentials: "include",
      });

      if (userRes.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!userRes.ok) {
        throw new Error(`HTTP error! status: ${userRes.status}`);
      }

      const userData = await userRes.json();
      username = userData.name || "User";
      viewerType = userData.role || "student";

      navItems = createNav(viewerType).map((item) => ({
        ...item,
        active: window.location.pathname === item.href,
      }));
    } catch (error) {
      console.error(error);
      window.location.href = "/login";
    } finally {
      isLoading = false;
    }
  };

  const logout = () => (showModal = true);

  const confirmLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/login";
    } catch (e) {
      console.error("Logout failed", e);
      window.location.href = "/login";
    }
  };

  const cancelLogout = () => (showModal = false);

  const selectNavItem = (index) => {
    navItems = navItems.map((item, i) => ({
      ...item,
      active: i === index,
    }));

    if (typeof window !== "undefined") {
      window.location.href = navItems[index].href;
    }
  };
</script>

{#if isLoading}
  <div class="navbar-skeleton">
    <div class="skeleton-logo"></div>
    <div class="skeleton-links"></div>
    <div class="skeleton-profile"></div>
  </div>
{:else}
  <nav class="navbar">
    <div class="nav-container">
      <div class="brand">
        <div class="logo-icon">📚</div>
        <span class="logo-text">OMIAGS Platform</span>
      </div>

      <ul class="nav-links">
        {#each navItems as item, i}
          <li>
            <a
              href={item.href}
              class:active={item.active}
              on:click|preventDefault={() => selectNavItem(i)}
            >
              {item.label}
            </a>
          </li>
        {/each}
      </ul>

      <div class="profile-section">
        <div class="user-info">
          <span class="username">{username}</span>
          <span class="role-badge {viewerType}">{viewerType}</span>
        </div>
        <div class="avatar">
          {username.charAt(0).toUpperCase()}
        </div>
        <button
          class="logout-btn"
          on:click|preventDefault={logout}
          title="Cerrar Sesión"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline
              points="16 17 21 12 16 7"
            ></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg
          >
        </button>
      </div>
    </div>
  </nav>

  {#if showModal}
    <div in:fade out:fade>
      <ConfirmLogoutModal on:confirm={confirmLogout} on:cancel={cancelLogout} />
    </div>
  {/if}
{/if}

<style>
  :global(body) {
    margin: 0;
    font-family:
      "Inter",
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    background-color: #f8fafc;
  }

  .navbar {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 50;
    height: 64px;
    display: flex;
    align-items: center;
  }

  .nav-container {
    max-width: 1280px;
    width: 100%;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-size: 1.1rem;
    color: #1e293b;
  }

  .logo-icon {
    font-size: 1.5rem;
  }

  .nav-links {
    display: flex;
    gap: 0.5rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav-links a {
    text-decoration: none;
    color: #64748b;
    font-weight: 500;
    font-size: 0.95rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .nav-links a:hover {
    color: #1e293b;
    background-color: #f1f5f9;
  }

  .nav-links a.active {
    color: #2563eb;
    background-color: #eff6ff;
  }

  .profile-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-left: 1.5rem;
    border-left: 1px solid #e2e8f0;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    line-height: 1.2;
  }

  .username {
    font-weight: 600;
    font-size: 0.9rem;
    color: #334155;
  }

  .role-badge {
    font-size: 0.7rem;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.05em;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .role-badge.student {
    background-color: #f0f9ff;
    color: #0369a1;
  }

  .role-badge.admin,
  .role-badge.teacher {
    background-color: #fdf2f8;
    color: #be185d;
  }

  .avatar {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1rem;
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
  }

  .logout-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .logout-btn:hover {
    color: #ef4444;
    background-color: #fef2f2;
  }

  .navbar-skeleton {
    height: 64px;
    background: white;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
  }

  .skeleton-logo {
    width: 120px;
    height: 24px;
    background: #f1f5f9;
    border-radius: 4px;
    animation: pulse 1.5s infinite;
  }
  .skeleton-links {
    width: 300px;
    height: 32px;
    background: #f1f5f9;
    border-radius: 6px;
    animation: pulse 1.5s infinite;
  }
  .skeleton-profile {
    width: 150px;
    height: 36px;
    background: #f1f5f9;
    border-radius: 18px;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    .nav-container {
      padding: 0 1rem;
    }
    .username,
    .role-badge {
      display: none;
    }
    .nav-links {
      gap: 0.25rem;
    }
    .nav-links a {
      padding: 0.5rem;
      font-size: 0.85rem;
    }
    .profile-section {
      padding-left: 0.5rem;
      gap: 0.5rem;
      border: none;
    }
  }
</style>
