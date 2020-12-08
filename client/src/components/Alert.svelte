<script lang="ts">
    import { flip } from "svelte/animate";
    import type { IAlert } from "../models/ialert";

    let alerts: IAlert[] = [];
    $: count = alerts.length;

    export const show = (alert: IAlert) => {
        alert.dismissable = alert.dismissable ?? true;
        alert.type = alert.type ?? "warn";
        alert.duration = alert.duration ?? 5000;

        alerts = [alert, ...alerts];
        if (alert.duration > 0) {
            setTimeout(() => {
                close(alert);
            }, alert.duration);
        }
    };

    const close = (alert) => {
        const index = alerts.indexOf(alert);
        alerts = [
            ...alerts.slice(0, index),
            ...alerts.slice(index + 1, alerts.length),
        ];
    };
    const options = {};
</script>

<style>
    .alerts {
        display: block;
        z-index: 1001;
        position: absolute;
        box-sizing: border-box;
        top: 0px;
        left: 0px;
        width: 100vw;
        align-content: center;
        list-style-type: none;
    }
    
    .alerts li {
        width: 50%;
        font-weight: bold;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        font-size: 48px;
        border-radius: 4px;
        margin: auto 25%;
        position: relative;
        padding: 10px;
        padding-right: 25px;
        margin-bottom: 4px;
        box-sizing: border-box;
    }

    .alerts li button {
        position: absolute;
        top: 4px;
        right: 9px;
        width: 18px;
        height: 24px;
        font-size: 200%;
        line-height: 1;
        padding: 0;
        margin: 0;
        font-weight: bold;
        background-color: transparent;
        border: 0px;
        cursor: pointer;
        color: inherit;
    }

    .alerts li.warn {
        background-color: mistyrose;
        border: solid 2px red;
        color: red;
    }

    .alerts li.ok {
        background-color: rgb(134, 185, 233);
        border: solid 2px rgb(7, 40, 71);
        color: rgb(7, 40, 71);
    }
</style>

{#if alerts.length > 0}
    <ul class="alerts">
        {#each alerts as alert, index (alert)}
            <li class={alert.type} animate:flip={options}>
                <span>{alert.body}</span>
                <button on:click={() => close(alert)}>&times;</button>
            </li>
        {/each}
    </ul>
{/if}
