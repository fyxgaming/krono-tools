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
  } from "./services/stores";

  import { ApiService } from "./services/api-service";

  import Home from "./pages/Home.svelte";
  import Cashier from "./pages/Cashier.svelte";
  import Spinner from "./components/Spinner.svelte";
  import Cashout from "./pages/Cashout.svelte";

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
        console.log(data.message.body);
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

  <Cashout />
</main>
