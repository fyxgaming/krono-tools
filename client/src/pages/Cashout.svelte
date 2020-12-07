<script lang="ts">
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  import {
    walletService,
    displayMode,
    loading,
    route,
    balance,
  } from "../services/stores";
  import Panel from "../components/Panel.svelte";
  import { get } from "svelte/store";
  import type { IAlert } from "../models/ialert";
  import WebCashier from "../components/WebCashier.svelte";

  export let visible: boolean = false;

  let isCashierShowing: boolean = false;
  let hidePanelActions: boolean = true;
  let controlPanel: Panel;
  let lastDisplayMode: string;
  let paymentAmount: number = 0.0;
  let webCashier: WebCashier;

  const cancel = async () => {
    lastDisplayMode = "";
    isCashierShowing = false;
    route.set("home");
  };

  const raiseDialogEvent = async (
    message: string,
    type: "ok" | "warn" = "warn"
  ) => {
    console.log(message);
    dispatch("dialog", {
      body: message,
      type: type,
    } as IAlert);
  };

  const cashOut = async () => {
    try {
      loading.set(true);
      const max = get(balance);
      if (paymentAmount <= 0 || paymentAmount > max) {
        throw new Error(`Amount must be greater than 0 and less than ${max}`);
      }
      displayMode.set("frameMode");
      lastDisplayMode = "frameMode";
      isCashierShowing = true;
      await webCashier.cashOut(paymentAmount);
    } catch (err) {
      console.log(err, err.stack);
      loading.set(false);
      raiseDialogEvent(err.message ?? `Could not cash out funds at this time.`);
    }
  };

  const onCashierComplete = async () => {
    displayMode.set("panelMode");
    isCashierShowing = false;
  };

  const onAmountChanged = async (event) => {
    let max = get(balance);
    if (event.target.value > max) {
      event.target.value = paymentAmount = max;
    }
  }

  function format(value) {
    let input = (value || 0).toString().replace(/[^0-9\.-]/g, "");
    let number = Number.parseFloat(input) || 0;
    let formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(number);
    return {
      value: number,
      formatted,
    };
  }

  const show = () => {
    visible = true;
    const mode = get(displayMode);
    lastDisplayMode = lastDisplayMode || "panelMode";
    displayMode.set(lastDisplayMode);
  };

  const hide = () => {
    visible = false;
  };

  route.subscribe((r) => {
    if (r === "cashout") {
      show();
    } else {
      hide();
    }
  });
</script>

<style>
  .balance {
    font-size: 150%;
    font-weight: bolder;
  }
  .balance-input {
    position: relative;
  }

  .balance-input input {
    padding-left: 35px;
  }
  .balance-input input:focus {
    outline-color: transparent;
  }
  .balance-input::before {
    content: "$";
    position: absolute;
    height: 100%;
    background: lightgray;
    width: 25px;
    top: 0px;
    padding: 12px 4px 4px 7px;
    border-radius: 5px 0px 0px 5px;
    font-weight: bold;
    line-height: 1em;
  }
</style>

{#if visible}
  <!--CASHIER-->
  <Panel hideDefaultActions={hidePanelActions} bind:this={controlPanel}>
    <div slot="prepend">
      {#if !isCashierShowing}
        <div>
          <p class="balance">Balance: {format($balance - paymentAmount).formatted}</p>
        </div>
        <div class="field">
          <label for="amount">
            <span class="field-label">Amount to cash out</span>
            <span class="field-hint">Enter amount to cash out.</span>
          </label>
          <div class="balance-input">
            <input
              id="amount"
              class="field-cntrl"
              bind:value={paymentAmount}
              on:input={onAmountChanged}
              required
              type="number"
              min="0.00"
              max={$balance}
              step="1.00"
              pattern="[0-9]?\.[0-9]{2}"
              placeholder="0.00" />
          </div>
        </div>
        <div class="actions">
          <button class="action" on:click|preventDefault={cashOut}>Next</button>
        </div>
      {/if}
    </div>
    <div slot="actions">
      <button class="action" on:click|preventDefault={cancel}>Cancel</button>
    </div>
  </Panel>

  <section class="frameBox">
    <div class="contentBox">
        <WebCashier bind:this={webCashier} on:dialog on:complete={onCashierComplete} />
    </div>
  </section>
{/if}
