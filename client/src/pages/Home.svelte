<script lang="ts">
  import Panel from '../components/Panel.svelte';
  import { displayMode, route, balance } from '../services/stores';

  export let visible: boolean = false;

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
  <Panel balance={$balance}>
    <div slot="prepend">
      <slot />
    </div>
  </Panel>
{/if}
