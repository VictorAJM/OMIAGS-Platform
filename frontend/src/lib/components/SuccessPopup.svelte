<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { fade, scale } from "svelte/transition";

    export let message = "Success!";

    const dispatch = createEventDispatcher();

    function close() {
        dispatch("close");
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="backdrop" on:click={close} transition:fade={{ duration: 200 }}>
    <div
        class="popup-card"
        on:click|stopPropagation
        transition:scale={{ duration: 300, start: 0.9 }}
    >
        <div class="icon-container">
            <svg
                class="checkmark"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 52 52"
            >
                <circle
                    class="checkmark__circle"
                    cx="26"
                    cy="26"
                    r="25"
                    fill="none"
                />
                <path
                    class="checkmark__check"
                    fill="none"
                    d="M14.1 27.2l7.1 7.2 16.7-16.8"
                />
            </svg>
        </div>
        <h3 class="title">Success!</h3>
        <p class="message">{message}</p>
        <button class="close-btn" on:click={close}>Continue</button>
    </div>
</div>

<style>
    .backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(4px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .popup-card {
        background: white;
        padding: 2.5rem;
        border-radius: 24px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        width: 90%;
        max-width: 400px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .icon-container {
        margin-bottom: 0.5rem;
    }

    .title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #2d3748;
        margin: 0;
    }

    .message {
        color: #718096;
        margin: 0;
        font-size: 1rem;
        line-height: 1.5;
    }

    .close-btn {
        margin-top: 1rem;
        background-color: #1a73e8;
        color: white;
        border: none;
        border-radius: 12px;
        padding: 0.8rem 2rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition:
            transform 0.2s,
            background-color 0.2s;
        width: 100%;
    }

    .close-btn:hover {
        background-color: #1557b0;
        transform: translateY(-2px);
    }

    .close-btn:active {
        transform: translateY(0);
    }

    /* Checkmark Animation */
    .checkmark {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: block;
        stroke-width: 2;
        stroke: #4caf50;
        stroke-miterlimit: 10;
        box-shadow: inset 0px 0px 0px #4caf50;
        animation:
            fill 0.4s ease-in-out 0.4s forwards,
            scale 0.3s ease-in-out 0.9s both;
    }

    .checkmark__circle {
        stroke-dasharray: 166;
        stroke-dashoffset: 166;
        stroke-width: 2;
        stroke-miterlimit: 10;
        stroke: #4caf50;
        fill: none;
        animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
    }

    .checkmark__check {
        transform-origin: 50% 50%;
        stroke-dasharray: 48;
        stroke-dashoffset: 48;
        animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
    }

    @keyframes stroke {
        100% {
            stroke-dashoffset: 0;
        }
    }

    @keyframes scale {
        0%,
        100% {
            transform: none;
        }
        50% {
            transform: scale3d(1.1, 1.1, 1);
        }
    }

    @keyframes fill {
        100% {
            box-shadow: inset 0px 0px 0px 30px #e8f5e9;
        }
    }
</style>
