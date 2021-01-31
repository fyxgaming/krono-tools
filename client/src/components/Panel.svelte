<script lang="ts">
  import Login from "./Login.svelte";
  import { walletService, currentUser, loggedIn } from "../services/stores";
  import { get } from "svelte/store";

  export let hideDefaultActions: boolean = false;
  export let balance: number = 0;

  function format(value) {
    let input = (value || 0).toString().replace(/[^0-9\.-]/g, "");
    let number = Number.parseFloat(input) || 0;
    let currency = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(number);
    return {
      value: number,
      currency,
    };
  }

  const nav = (path) => {
    const ws = get(walletService);
    ws.show(path);
  };
</script>

<section class="panelBox">
  <div class="contentBox">
    <slot />

    {#if $loggedIn}
      <h1 class="small-caption username">{$currentUser}</h1>
      <p class="large-caption balance-caption">Your Balance</p>
      <p class="large-caption balance">{format(balance).currency}</p>
      <slot name="prepend" />
      <section class="wui-actions">
        {#if !hideDefaultActions}
          <button
            class="action icon ico-cashin"
            on:click|preventDefault={() => nav('cashier')}
          >Add Funds</button>
          <button
            class="action icon ico-cashout"
            on:click|preventDefault={() => nav('cashout')}
          >Withdrawal</button>
        {/if}
        <slot name="actions" />
      </section>
      <slot name="extend" />
    {/if}

    {#if !hideDefaultActions}
      <Login />
    {/if}
  </div>
</section>
