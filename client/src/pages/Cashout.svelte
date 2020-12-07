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
  import { ApiService } from "../services/api-service";
  import { CashierResponse } from "../models/cashier-response";
  import Panel from "../components/Panel.svelte";
  import { get } from "svelte/store";
  import { onMount } from "svelte";
  import type { IAlert } from "../models/ialert";

  export let visible: boolean = false;

  interface GidxWindow extends Window {
    gidxServiceSettings;
    gidxServiceStatus;
    gidxErrorReport;
    gidxContainer;
    gidxBuildTimer;
    gidxBuildSteps;
    gidxNextStep;
  }
  const win = (window as unknown) as GidxWindow;

  win.gidxServiceSettings = function (data) {
    console.log(`TRIGGERED: gidx.gidxServiceSettings: ${data}`);
    win.gidxContainer = "#webcashier";
    win.gidxBuildTimer = false;
    win.gidxBuildSteps = false;
  };

  win.gidxServiceStatus = echoGidxEvent("gidxServiceStatus", (name, phase) => {
    if (phase === "start") {
      loading.set(false);
    }
    if (phase === "end") {
      loading.set(true);
    }
  });

  win.gidxErrorReport = echoGidxEvent("gidxErrorReport", () => {
    raiseDialogEvent("Cashier unavailable at this time.");
    loading.set(false);
  });
  win.gidxContainer = echoGidxEvent("gidxContainer");
  win.gidxBuildTimer = echoGidxEvent("gidxBuildTimer");
  win.gidxBuildSteps = echoGidxEvent("gidxBuildSteps");
  win.gidxNextStep = echoGidxEvent("gidxNextStep", handleGidxNextStep);

  let webCasherSessionScript: string;
  let isCashierShowing: boolean = false;
  let hidePanelActions: boolean = true;
  let controlPanel: Panel;
  let lastDisplayMode: string;
  let paymentAmount: number = 0.0;

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
      //let geoAccess = navigator.permissions.query({name:'geolocation'});
      //if (['granted','prompt'].indexOf(geoAccess.state) > -1) { console.log('might work'); }
      const deviceGPS = await ApiService.getGps();

      if (deviceGPS.latitude < 1) {
        throw new Error(`You must share your location to continue.`);
      }

      const ws = get(walletService);
      const message = ws.wallet.buildMessage({
        subject: ws.paymail,
        payload: JSON.stringify({
          deviceGPS,
          paymentAmount,
        }),
      });

      const response = ((await ws.blockchain.sendMessage(
        message,
        "/cashout"
      )) as unknown) as CashierResponse;

      let sessionId = response.paymentId;
      let script = response.cashierScript;
      if (script) {
        window.localStorage.setItem(sessionId, script);
        renderCashier(script);
        return;
      } else if (sessionId) {
        script = window.localStorage.getItem(sessionId);
        if (script) {
          renderCashier(script);
          return;
        }
        throw new Error("Cashier session could not be restored.");
      }
    } catch (err) {
      console.log(err, err.stack);
      loading.set(false);
      raiseDialogEvent(err.message ?? `Could not add funds at this time.`);
    }
  };

  async function handleGidxNextStep() {
    console.log(`GET SESSION STATUS`);
    loading.set(true);
    isCashierShowing = false;
    const ws = get(walletService);
    const deviceGPS = await ApiService.getGps();
    const message = ws.wallet.buildMessage({
      subject: ws.paymail,
      payload: JSON.stringify({ deviceGPS }),
    });

    try {
      const response = await ws.blockchain.sendMessage(
        message,
        "/payment/status"
      );
      console.log(response);
      raiseDialogEvent(response.message, response.success ? "ok" : "warn");
    } catch (err) {
      raiseDialogEvent(err.message);
    }
    loading.set(false);
  }

  function echoGidxEvent(name, func?: Function) {
    return async (data, phase, ...args) => {
      console.log(`TRIGGERED: ${name}: ${data} ${phase}`, args);
      if (typeof func === "function") {
        await func(data, phase, ...args);
      }
    };
  }

  function renderCashier(script) {
    webCasherSessionScript = unescape(decodeURI(script)).replace(/\+/g, " ");
    isCashierShowing = true;
    setTimeout(() => {
      setInnerHTML(
        document.getElementById("webcashier"),
        webCasherSessionScript
      );
    }, 500);
  }

  function setInnerHTML(elm, html) {
    elm.innerHTML = html;
    Array.from(elm.querySelectorAll("script")).forEach(
      (oldScript: HTMLElement) => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) =>
          newScript.setAttribute(attr.name, attr.value)
        );
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
      }
    );
  }

  function format(value) {
    let input = (value || 0).toString().replace(/[^0-9\.]/g, "");
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
          <p class="balance">Balance: {format($balance).formatted}</p>
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
      {#if isCashierShowing}
        <section id="webcashier" />
      {/if}
    </div>
  </section>
{/if}

<!-- <div data-gidx-script-loading='true'>Loading...</div><script src='https://ws.gidx-service.in/v3.0/We`bSession/Cashier?sessionid=_7Iq_Ux-h0eQ64L5b-ZYmg' 
data-tsevo-script-tag data-gidx-session-id='_7Iq_Ux-h0eQ64L5b-ZYmg' type='text/javascript' ✂prettier:content✂="" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=">{}</script>-->
