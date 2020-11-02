<script lang="ts">
    import { currentUser, loggedIn, loading, route } from "../services/stores";

	const nav = (path) => {
		route.set(path);
	};
</script>

<style>

</style>

<section class="actions">
    {#if $loggedIn}
        <button
            class="action"
            on:click|preventDefault={() => nav('/Logout')}>Logout</button>
        <button
            class="action"
            on:click|preventDefault={() => nav('/Cashier')}>Enter Match</button>
    {:else}
        <button
            class="action"
            on:click|preventDefault={() => nav('/Login')}>Login</button>
    {/if}
</section>