<script lang="ts">
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import {
    walletService,
    currentUser,
    loggedIn,
    loading,
    route,
    displayMode,
balance,
  } from "./services/stores";

  import { ApiService } from "./services/api-service";

  import Alert from "./components/Alert.svelte";
  import Spinner from "./components/Spinner.svelte";
  import Home from "./pages/Home.svelte";
  import Cashier from "./pages/Cashier.svelte";
  import Cashout from "./pages/Cashout.svelte";
  import type { IDialog } from "./models/idialog";
  import type { IAlert } from "./models/ialert";

  let alertDialog: Alert;
  let defaultHandle = "Cryptofights";
  let geo = "unavailable";
  let menuState = "";
  let lastRoute = "";

  onMount(async () => {
    ApiService.getGps().then((gps) => (geo = JSON.stringify(gps, null, 4)));
    displayMode.set("menuMode");
    loading.set(true);
    loggedIn.set(false);
    currentUser.set(defaultHandle);
    const ws = get(walletService);
    try {
      await ws.init();
    } catch (err) {
      console.log(err);
    }
    loading.set(false);
    loggedIn.set(ws.authenticated);
    if (ws.authenticated) {
      currentUser.set(ws.handle || defaultHandle);
      balance.set(await ws.getBalance());
    } else {
      currentUser.set(defaultHandle);
    }
    console.log(`WUI:Authenticated: ${ws.handle} as ${ws.authenticated}`);
  });

  const toggleMenu = (e) => {
    let currentRoute = get(route);
    if (currentRoute === "menu") {
      route.set(lastRoute || "home");
    } else {
      lastRoute = currentRoute;
      route.set("menu");
    }
  };

  const reserveSize = (displayMode: string) => {
    const ws = get(walletService);
    if (displayMode === "menuMode") {
      ws.blockInput(0, 0, 100, 100);
    } else {
      ws.blockInput(0, 0, window.innerWidth, window.innerHeight);
    }
  };

  walletService.subscribe((value) => {
    value.on("show", (data) => {
      if (data.message) {
        let dialog = data.message as IDialog;
        console.log(dialog.body);
        alertDialog.show({
          body: dialog.body,
          dismissable: false,
          duration: 5000,
          type: dialog.theme === "success" ? "ok" : "warn",
        });
      }
      route.set(data.viewName);
    });
  });

  displayMode.subscribe((value) => {
    menuState = value === "menuMode" ? "" : "open";
    reserveSize(value);
  });

  route.subscribe((r) => {
    if (r === "menu") {
      displayMode.set("menuMode");
    }
  });

  const onDialog = (event: CustomEvent<IAlert>) => {
    alertDialog.show(event.detail);
  };
</script>

<style>
  .geo {
    width: 340px;
    background-color: black;
    color: antiquewhite;
    font-family: "Courier New", Courier, monospace;
    font-size: 12px;
    font-weight: bold;
    padding: 15px;
    border-radius: 5px;
    position: absolute;
    bottom: 5px;
  }
</style>

<Alert bind:this={alertDialog} />

<Spinner />

<section class="menuBox">
  <div class="menu-button {menuState}" on:click={toggleMenu}>
    <div class="menu-button_icon" on:click={toggleMenu} />
  </div>
</section>

<main class={$displayMode}>
  <Home>
    <div class="geo" style="display:none">
      GEO:
      <pre>{geo}</pre>
    </div>
  </Home>

  <Cashier />

  <Cashout on:dialog={onDialog} />
</main>
