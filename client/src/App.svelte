<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { currentUser, loggedIn, loading, route } from './services/stores';

	import { ApiService } from './services/api-service';
	import { WalletService } from './services/wallet-service';
	window.walletService = new WalletService();

	import Home from './components/Home.svelte';
	import Login from './components/Login.svelte';
	import Cashier from './components/Cashier.svelte';
	import Spinner from './components/Spinner.svelte';

	let defaultHandle = 'Cryptofights';
	let geo = 'unavailable';
	let visbility = 'none';

	onMount(async () => {
		geo = JSON.stringify(await ApiService.getGps(), null, 4);
		loading.set(true);
		loggedIn.set(false);
		currentUser.set(defaultHandle);
		var ws = window.walletService;
		try {
			await ws.init();
		} catch (err) {
			console.log(err);
		}
		loading.set(false);
		loggedIn.set(ws.authenticated);
		if (ws.authenticated) {
			currentUser.set(ws.handle || defaultHandle);
		} else {
			currentUser.set(defaultHandle);
		}
		visbility = 'block';
		console.log(`Authenticated: ${ws.authenticated} as ${ws.handle}`);
	});

	route.subscribe((r) => {
		if (r === '/Logout') {
			logout();
		}
	});

	loggedIn.subscribe((isLoggedIn) => {
		if (isLoggedIn && get(route) === '/Login') {
			route.set('/Home');
		}
		if (!isLoggedIn && get(route) !== '/Login') {
			route.set('/Login');
		}
	});

	const logout = async () => {
		let ws = window.walletService;
		loading.set(true);
		await ws.logout();
		loading.set(false);
		loggedIn.set(ws.authenticated);
		currentUser.set(defaultHandle);
		nav('/Home');
	};

	const nav = (path) => {
		route.set(path);
	};
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

	.geo {
		width: 340px;
		background-color: black;
		color: antiquewhite;
		font-family: "Courier New", Courier, monospace;
		font-size: 12px;
		font-weight: bold;
		padding: 15px;
		border-radius: 5px;
		position: absolute;
		bottom: 5px;
	}
</style>

<Spinner />
<main style="display:{visbility}">
	<h1>{$currentUser}</h1>

	{#if $route === '/Login'}
		<Login />
	{:else if $route === '/Cashier'}
		<Cashier />
	{:else}
		<Home />
	{/if}
</main>

<div class="geo">
	GEO:
	<pre>{geo}</pre>
</div>
