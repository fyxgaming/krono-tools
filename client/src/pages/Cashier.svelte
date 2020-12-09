<script lang="ts">
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  import {
    walletService,
    displayMode,
    loading,
    route,
  } from '../services/stores';
  import { ApiService } from '../services/api-service';
  import { CashierResponse } from '../models/cashier-response';
  import Panel from '../components/Panel.svelte';
  import { get } from 'svelte/store';
  import type { IAlert } from "../models/ialert";
  import WebCashier from "../components/WebCashier.svelte";

  export let visible: boolean = false;

  let isCashierShowing: boolean = false;
  let hidePanelActions: boolean = true;
  let controlPanel: Panel;
  let lastDisplayMode: string;
  let webCashier: WebCashier;

  const cancel = async () => {
    lastDisplayMode = '';
    isCashierShowing = false;
    route.set('home');
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

  const addFunds = async () => {
    try {
      loading.set(true);
      displayMode.set('frameMode');
      lastDisplayMode = 'frameMode';
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
    lastDisplayMode = (lastDisplayMode || 'panelMode');
    displayMode.set(lastDisplayMode);
  };

  const hide = () => {
    visible = false;
  };

  route.subscribe((r) => {
    if (r === 'cashier') {
      show();
    } else {
      hide();
    }
  });
</script>

{#if visible}
  <!--CASHIER-->
  <Panel hideDefaultActions={hidePanelActions} bind:this={controlPanel}>
    <div slot="actions">
      {#if !isCashierShowing}
        <button class="action" on:click|preventDefault={addFunds}>Add Funds</button>
      {/if}
      <button class="action" on:click|preventDefault={cancel}>Cancel</button>
    </div>
  </Panel>

  <section class="frameBox">
    <div class="contentBox">
        <WebCashier bind:this={webCashier} on:dialog on:complete={onCashierComplete} />
    </div>
  </section>
{/if}

<!-- <div data-gidx-script-loading='true'>Loading...</div><script src='https://ws.gidx-service.in/v3.0/We`bSession/Cashier?sessionid=_7Iq_Ux-h0eQ64L5b-ZYmg' 
data-tsevo-script-tag data-gidx-session-id='_7Iq_Ux-h0eQ64L5b-ZYmg' type='text/javascript' ✂prettier:content✂="" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=">{}</script>-->
