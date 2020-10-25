<script lang="ts">
	import { WalletService } from "./services/wallet-service";
	const onWindowLoad = async (event: Event) => {
		var ws = (window.walletService = new WalletService());
		await ws.init();
		loggedIn = ws.authenticated;
		name = ws.handle ? ws.handle : "Cryptofights";
	};

	export let name: string;

	import Login from "./components/Login.svelte";
	let loggedIn: boolean;
	const changed = (event: CustomEvent) => {
		console.log("changed", event.detail);
		if (event.detail.loggedIn) {
			name = window.walletService.handle;
		} else {
			name = "Cryptofights";
		}
		loggedIn = event.detail.loggedIn;
	};

	import Cashier from "./components/Cashier.svelte";
	let cashierIsActive: boolean;
	let cashier: Cashier;
	const addFunds = (event: any) => {
		cashier.showCashier();
	};
</script>

<style>
	main {
		padding: 1em;
		max-width: 440px;
	}

	.action {
		width: 100%;
		max-width: 320px;
	}

	h1 {
		color: darkslategray;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}
</style>

<svelte:window on:load={onWindowLoad} />

<main>
	<h1>{name}</h1>

	{#if !cashierIsActive}
		<Login {loggedIn} on:statusChanged={changed} />
		<div hidden={!loggedIn}>
			<button class="action" on:click={addFunds}>Payment</button>
		</div>
	{/if}
	
	<Cashier bind:this={cashier} bind:isActive={cashierIsActive} />
	
</main>
