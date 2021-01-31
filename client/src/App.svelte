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

  import Alert from "./components/Alert.svelte";
  import Spinner from "./components/Spinner.svelte";
  import FyxNav from "./components/FyxNav.svelte";
  import Home from "./pages/Home.svelte";
  import Cashier from "./pages/Cashier.svelte";
  import Cashout from "./pages/Cashout.svelte";
  import type { IDialog } from "./models/idialog";
  import type { IAlert } from "./models/ialert";
  import { ApiService } from "./services/api-service";

  let ANONYMOUS_HANDLE = "";
  let alertDialog: Alert;
  let geo = "unavailable";
  let lastRoute = "";

  onMount(async () => {
    loading.set(true);
    loggedIn.set(false);
    currentUser.set(ANONYMOUS_HANDLE);
    const ws = get(walletService);
    try {
      await ws.init();
    } catch (err) {
      console.error(err);
    }
    loading.set(false);
    loggedIn.set(ws.authenticated);
    if (ws.authenticated) {
      currentUser.set(ws.handle || ANONYMOUS_HANDLE);
      balance.set(await ws.getBalance());
      testGps();
    } else {
      currentUser.set(ANONYMOUS_HANDLE);
    }
    console.log(`WUI:Authenticated: ${ws.handle} as ${ws.authenticated}`);
  });

  const testGps = async () => {
    const ws = get(walletService);
    return ws.getGpsLocation()
      .then((data) => {
        geo = JSON.stringify(ApiService.convertUnityGpsData(data), null, 2);
      })
      .catch((data) => console.log(`GPS RESULTS:`, data));
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

  route.subscribe((r) => {
    if (r === "menu") {
      displayMode.set("menuMode");
    } else {
      console.log(lastRoute);
      lastRoute = r;
    }
  });

  const onDialog = (event: CustomEvent<IAlert>) => {
    alertDialog.show(event.detail);
  };
</script>

<Alert bind:this={alertDialog} />
<Spinner />
<FyxNav />

<div class="content">
  <div class="main games">
    <Home>
      <div class="geo" style="display:none">
        GEO:
        <pre>{geo}</pre>
      </div>
    </Home>

    <Cashier on:dialog={onDialog} />

    <Cashout on:dialog={onDialog} />
  </div>
</div>

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
