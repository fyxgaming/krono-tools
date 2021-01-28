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

{#if alerts.length > 0}
    <ul class="alerts">
        {#each alerts as alert, index (alert)}
            <li class={alert.type} animate:flip={options}>
                <span
                    class="alert-title"
                >{alert.type == 'ok' ? 'OK' : 'Warning'}</span>
                <span class="alert-body">{alert.body}</span>
                <button on:click={() => close(alert)}>&times;</button>
            </li>
        {/each}
    </ul>
{/if}

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
        font-size: 1.25vw;
        border-radius: 8px;
        margin: auto 25%;
        position: relative;
        margin-bottom: 4px;
        box-sizing: border-box;
    }

    .alerts li button {
        position: absolute;
        top: 4px;
        right: 1vw;
        width: 18px;
        height: 24px;
        font-size: 200%;
        line-height: 1em;
        padding: 0;
        margin: 0;
        font-weight: bold;
        background-color: transparent;
        border: 0px;
        cursor: pointer;
        color: #395070;
    }

    .alerts li.warn {
        background-color: mistyrose;
        border: solid 1px red;
        color: red;
    }

    .alerts li.ok {
        background-color: rgb(92, 184, 92);
        border: solid 1px rgb(57, 114, 57);
        color: rgb(57, 114, 57);
    }
    .alert-title {
        font-family: "Open Sans", sans-serif;
        font-weight: 800;
        padding: 1vw;
        padding-right: 25px;
        min-height: 35px;
        display: block;
    }

    .alert-body {
        width: 100%;
        display: block;
        background-color: #fff;
        min-height: 10vh;
        padding: 1vw;
        color: #395070;
        border-radius: 0 0 8px 8px;
    }
</style>
