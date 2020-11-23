<script lang="ts">
import { onMount } from "svelte";

import { get } from "svelte/store";

  import Panel from "../components/Panel.svelte";
  import { displayMode, route, walletService } from "../services/stores";

  export let visible: boolean = false;
  let mounted: boolean = false;
  let controlPanel: Panel;

  const reserveSize = () => {
    if (mounted) {
      const ws = get(walletService);
      if (get(displayMode) == "panelMode") {
        ws.blockInput(0, 0, controlPanel.width(), window.innerHeight);
      } else {
        ws.blockInput(0, 0, window.innerWidth, window.innerHeight);
      }
    }
  };

  onMount(() => {
    mounted = true;
    reserveSize();
  });
  
  const show = () => {
    visible = true;
    displayMode.set("panelMode");
  };

  const hide = () => {
    visible = false;
  };

  route.subscribe((r) => {
    if (r === "home") {
      show();
    } else {
      hide();
    }
  });
</script>

<style>
</style>

{#if visible}
  <!--HOME-->
  <Panel bind:this={controlPanel}>
    <div slot="extend">
      <slot />
    </div>
  </Panel>
{/if}
