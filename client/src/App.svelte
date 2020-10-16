<script lang="ts">
	// import { WalletService } from "./services/wallet-service";
	// const walletService = new WalletService();
	// walletService.init();

	const ref = document.referrer;
	setTimeout(() => {
		window.parent.postMessage(
			{
				name: "WALLET_READY",
				success: true,
			},
			ref
		);
		window.parent.postMessage(
			{
				name: "AGENT_LOADED",
				success: true,
			},
			ref
		);
	}, 1000);
	export let name: string;
	import Login from "./components/Login.svelte";

	let loggedIn: boolean;
	// const changed = (event: CustomEvent) => {
	// 	console.log("changed", event.detail);
	// };
</script>

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

<main>
	<h1>Hello {name}!</h1>

	<Login {loggedIn} on:statusChanged:{changed} />
</main>
