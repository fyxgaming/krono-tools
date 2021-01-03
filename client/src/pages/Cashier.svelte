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
  let webCashier: WebCashier;
  let paymentAmount: number;
  let acceptedTerms: boolean = false;

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

  const setFunds = (event) => {
    console.log(event.target.value);
    paymentAmount = Number.parseFloat(event.target.value);
  };

  const addFunds = async () => {
    try {
      loading.set(true);
      displayMode.set("frameMode");
      lastDisplayMode = "frameMode";
      isCashierShowing = true;
      await webCashier.cashIn();
    } catch (err) {
      console.log(err, err.stack);
      loading.set(false);
      raiseDialogEvent(err.message ?? `Could not add funds at this time.`);
    }
  };

  const onCashierComplete = async () => {
    displayMode.set("panelMode");
    isCashierShowing = false;
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

  route.subscribe((r) => {
    if (r === "cashier") {
      show();
    } else {
      hide();
    }
  });
</script>

<style>
  .quick-set {
    display: grid;
    grid-template-columns: 48% 48%;
    column-gap: 4%;
  }

  .terms {
    position: relative;
    margin-top: 1vw;
    margin-bottom: 1vw;
  }

  .terms input {
    position: absolute;
  }

  .terms .small-caption {
    display: block;
    float: left;
    padding-left: 23px;
    text-align: left;
  }
</style>

{#if visible}
  <!--CASHIER-->
  <Panel
    bind:this={controlPanel}
    balance={$balance}
    hideDefaultActions={hidePanelActions}>
    <div slot="prepend">
      <p class="small-caption">Please select an amount:</p>
      <div class="actions quick-set">
        <button
          class="action"
          value="1.00"
          on:click|preventDefault={setFunds}>$1</button>
        <button
          class="action"
          value="5.00"
          on:click|preventDefault={setFunds}>$5</button>
        <button
          class="action"
          value="15.00"
          on:click|preventDefault={setFunds}>$15</button>
        <button
          class="action"
          value="50.00"
          on:click|preventDefault={setFunds}>$50</button>
      </div>
      <p class="small-caption">or enter a custom amount:</p>
      <div class="balance-input">
        <input
          id="amount"
          class="field-cntrl"
          bind:value={paymentAmount}
          required
          type="number"
          min="0.00"
          max={$balance}
          step="1.00"
          pattern="[0-9]?\.[0-9]{2}"
          placeholder="0.00" />
      </div>
      <div class="terms">
        <input
          bind:checked={acceptedTerms}
          type="checkbox"
          id="checkbox"
          name="checkbox"
          data-name="Checkbox"
          required />
        <span class="small-caption fine-print">I have read the
          <a href="#" class="link">T&amp;C</a> and
          <a href="#" class="link">Privacy Policy</a>
          and approve this Transaction</span>
      </div>
    </div>
    <div slot="actions">
      {#if !isCashierShowing}
        <button
          class="action featured primary"
          disabled={!acceptedTerms}
          on:click|preventDefault={addFunds}>Continue</button>
      {/if}
      <button class="action" on:click|preventDefault={cancel}>Back</button>
    </div>
  </Panel>

  <section class="frameBox">
    <div class="contentBox">
      <WebCashier
        bind:this={webCashier}
        on:dialog
        on:complete={onCashierComplete} />
    </div>
  </section>
{/if}

<!-- <div data-gidx-script-loading='true'>Loading...</div><script src='https://ws.gidx-service.in/v3.0/We`bSession/Cashier?sessionid=_7Iq_Ux-h0eQ64L5b-ZYmg' 
data-tsevo-script-tag data-gidx-session-id='_7Iq_Ux-h0eQ64L5b-ZYmg' type='text/javascript' ✂prettier:content✂="" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=">{}</script>-->
