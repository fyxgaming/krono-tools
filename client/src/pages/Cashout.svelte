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
  let adjustedBalance: number;

  const cancel = async () => {
    paymentAmount = 0;
    adjustedBalance = get(balance);
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
    adjustedBalance = max - paymentAmount;
  };

  const show = () => {
    visible = true;
    const mode = get(displayMode);
    lastDisplayMode = lastDisplayMode || "panelMode";
    displayMode.set(lastDisplayMode);
  };

  const hide = () => {
    visible = false;
  };

  balance.subscribe((b) => {
    adjustedBalance = b - paymentAmount;
  });

  route.subscribe((r) => {
    if (r === "cashout") {
      show();
    } else {
      hide();
    }
  });
</script>

{#if visible}
  <!--CASHIER-->
  <Panel
    bind:this={controlPanel}
    balance={adjustedBalance}
    hideDefaultActions={hidePanelActions}
  >
    <div slot="prepend">
      {#if !isCashierShowing}
        <div class="wui-field">
          <label for="amount">
            <span class="field-label">Amount to withdrawal</span>
            <span class="field-hint">Enter amount to withdrawal.</span>
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
              placeholder="0.00"
            />
          </div>
        </div>
        <div class="small-caption fine-print">
          CAUTION: Clicking submit will transfer the game tokens.
        </div>
        <div class="wui-actions">
          <button
            class="action featured primary"
            disabled={$balance <= 0 || paymentAmount <= 0}
            on:click|preventDefault={cashOut}
          >Submit</button>
        </div>
      {/if}
    </div>
    <div slot="actions">
      <button
        class="action featured"
        on:click|preventDefault={cancel}
      >Back</button>
    </div>
  </Panel>

  <section class="frameBox">
    <div class="contentBox">
      <WebCashier
        bind:this={webCashier}
        on:dialog
        on:complete={onCashierComplete}
      />
    </div>
  </section>
{/if}

<style>
</style>
