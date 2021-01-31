<script lang="ts">
    import FyxNavItems from "./FyxNavItems.svelte";
    const linkRoot: string = "https://staging.fyxgaming.com/";
    let isOpen: boolean = false;

    const toggleMobileMenu = () => {
        isOpen = !isOpen;
    };
</script>

<div data-collapse="medium" class="left-navigation condensed w-nav">
    <a href={linkRoot} class="logo-link w-nav-brand">
        <img
            src="./images/fyx.svg"
            loading="lazy"
            width="168"
            alt=""
            class="image"
        />
        <h1 class="brand-text">Open Beta</h1>
    </a>
    <FyxNavItems {linkRoot} visible={true} mode="nav" />
    <div
        class="hamburger-button w-nav-button {isOpen ? 'w--open' : ''}"
        on:click|preventDefault={toggleMobileMenu}
    >
        <div class="w-icon-nav-menu" />
    </div>
    <div
        class="w-nav-overlay {isOpen ? 'w-nav-open' : ''}"
        id="w-nav-overlay-0"
        style="display: {isOpen ? 'block' : 'none'};"
    >
        <FyxNavItems {linkRoot} visible={true} mode="menu" />
    </div>
</div>

<style>
    .w-nav-open {
        height: 100vh;
        overflow: scroll;
    }
</style>
