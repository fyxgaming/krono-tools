<script lang="ts">
  import Login from "./Login.svelte";
  import {
    walletService,
    currentUser,
    route,
    loggedIn,
  } from "../services/stores";
  import { get } from "svelte/store";
  
  let panelElement: HTMLDivElement;

  export let hideDefaultActions: boolean = false;
  export const width = (): number => {
    return panelElement.clientWidth;
  }

  const nav = (path) => {
    const ws = get(walletService);
    ws.show(path);
  };
</script>

<section class="panelBox" bind:this={panelElement}>
  <div class="contentBox">
    <h1>{$currentUser}</h1>

    {#if !hideDefaultActions}
    <Login />
    {/if}

    <slot name="prepend" />

    {#if $loggedIn}
      <section class="actions">
        {#if !hideDefaultActions}
          <button
            class="action"
            on:click|preventDefault={() => nav('cashier')}>Enter Match</button>
          <button
            class="action"
            on:click|preventDefault={() => nav('cashout')}>Cash Out</button>
        {/if}
        <slot name="actions" />
      </section>
    {/if}

    <slot name="extend" />
  </div>
</section>
