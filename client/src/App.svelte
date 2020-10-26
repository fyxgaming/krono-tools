<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser, loggedIn, loading } from "./services/stores";

	import { WalletService } from "./services/wallet-service";
	window.walletService = new WalletService();

	import Home from "./components/Home.svelte";
	import Login from "./components/Login.svelte";
	import Cashier from "./components/Cashier.svelte";
	import Spinner from "./components/Spinner.svelte";

	let component;

	onMount(async () => {
		loading.set(true);
		loggedIn.set(false);
		currentUser.set('Cryptofights');
		component = Home;
		var ws = window.walletService;
		await ws.init();
		loading.set(false);
		loggedIn.set(ws.authenticated);
		currentUser.set(ws.handle || 'Cryptofights');
		console.log(`${ws.authenticated}${ws.handle}`)
	});

	const logout = async () => {
		let ws = window.walletService;
		loading.set(true);
		await ws.logout();
		loading.set(false);
		loggedIn.set(ws.authenticated);
		currentUser.set(ws.handle || 'Cryptofights');
	};

	loggedIn.subscribe(v => {
		if (v && component === Login) {
			component = Home;
		}
	});

</script>

<style>
	main {
		position: relative;
		padding: 1em;
		max-width: 440px;
	}

	h1 {
		color: darkslategray;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}
</style>

<Spinner />
<main>
	<h1>{$currentUser}</h1>
	{#if component !== Home}
		<p>
			<a
				href="#home"
				on:click|preventDefault={() => (component = Home)}>&lt;back</a>
		</p>
	{:else}
		<section class="actions">
			{#if $loggedIn}
				<button
					class="action"
					on:click|preventDefault={logout}>Logout</button>
			{:else}
				<button
					class="action"
					on:click|preventDefault={() => (component = Login)}>Login</button>
			{/if}
			<button
				class="action"
				on:click|preventDefault={() => (component = Cashier)}>Cashier</button>
		</section>
	{/if}
	<svelte:component this={component} />
</main>
