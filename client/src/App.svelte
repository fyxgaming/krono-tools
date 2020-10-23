<script lang="ts">
	import { WalletService } from "./services/wallet-service";
	const onWindowLoad = async (event: Event) => {
		window.walletService = new WalletService();
		await window.walletService.init();
		loggedIn = window.walletService.authenticated;
	};

	export let name: string;

	import Login from "./components/Login.svelte";
	let loggedIn: boolean;
	const changed = (event: CustomEvent) => {
		console.log("changed", event.detail);
	};

	import Cashier from "./components/Cashier.svelte";
	let showCashier: boolean;
	let cashierIsActive: boolean;
	let cashier: Cashier;
	const addFunds = (event: any) => {
		showCashier = true;
		cashier.showCashier();
	};
</script>

<svelte:window on:load={onWindowLoad} />

<main>
	<h1>{name}</h1>

	<Login {loggedIn} on:statusChanged:{changed} />

	{#if !cashierIsActive}
	<Login {loggedIn} on:statusChanged:{changed} />
	<div hidden={loggedIn}>
		<button on:click={addFunds}>Payment</button>
	</div>
	{/if}
	{#if showCashier}
	<Cashier bind:this={cashier} bind:isActive={cashierIsActive}  />
	{/if}
</main>

<style>
	main {
		max-width: 640px;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: darkslategray;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}
</style>