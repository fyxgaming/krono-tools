<script lang="ts">
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    import { get } from "svelte/store";
    import { ApiService } from "../services/api-service";
    import { CashierResponse } from "../models/cashier-response";
    import { walletService, loading } from "../services/stores";
    import type { IAlert } from "../models/ialert";
    import { GpsDetails } from "../models/gps-details";

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

    win.gidxServiceStatus = echoGidxEvent(
        "gidxServiceStatus",
        (name, phase) => {
            if (phase === "start") {
                loading.set(false);
            }
            if (phase === "end") {
                loading.set(true);
            }
        }
    );

    win.gidxErrorReport = echoGidxEvent("gidxErrorReport", () => {
        raiseDialogEvent("Cashier unavailable at this time.");
        loading.set(false);
    });
    win.gidxContainer = echoGidxEvent("gidxContainer");
    win.gidxBuildTimer = echoGidxEvent("gidxBuildTimer");
    win.gidxBuildSteps = echoGidxEvent("gidxBuildSteps");
    win.gidxNextStep = echoGidxEvent("gidxNextStep", handleGidxNextStep);

    let mode: undefined | "cashin" | "cashout" | "wallet";
    let webCasherSessionScript: string;

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

    const getGps = async (): Promise<GpsDetails> => {
        const ws = get(walletService);
        try {
            const data = await ws.getGpsLocation();
            return ApiService.deriveGpsDetails(data);
        } catch (err) {
            raiseDialogEvent("Could not retrieve GPS information.");
        }
        return { latitude: 0 } as GpsDetails;
    };

    export const cashOut = async (paymentAmount: number) => {
        try {
            mode = "cashout";
            loading.set(true);
            //let geoAccess = navigator.permissions.query({name:'geolocation'});
            //if (['granted','prompt'].indexOf(geoAccess.state) > -1) { console.log('might work'); }
            const deviceGPS = await getGps();

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
            raiseDialogEvent(
                err.message ?? `Could not cash out funds at this time.`
            );
            onCashierComplete();
        }
    };

    export const cashIn = async (paymentAmount: number) => {
        try {
            mode = "cashin";
            loading.set(true);
            //let geoAccess = navigator.permissions.query({name:'geolocation'});
            //if (['granted','prompt'].indexOf(geoAccess.state) > -1) { console.log('might work'); }
            const deviceGPS = await getGps();

            if (deviceGPS.latitude < 1) {
                throw new Error(`You must share your location to continue.`);
            }

            const ws = get(walletService);
            const message = ws.wallet.buildMessage({
                subject: "CashInRequest",
                payload: JSON.stringify({
                    deviceGPS,
                    owner: ws.wallet.address,
                    paymentAmount,
                }),
            });
            const response = ((await ws.blockchain.sendMessage(
                message,
                "/cashier"
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
            raiseDialogEvent(
                err.message ?? `Could not add funds at this time.`
            );
            onCashierComplete();
        }
    };

    function onCashierComplete() {
        dispatch("complete", {});
    }

    async function handleGidxNextStep() {
        console.log(`WebCashier Completed`);
        loading.set(true);

        if (mode === "cashin") {
            console.log(`GET SESSION STATUS`);
            const ws = get(walletService);
            const deviceGPS = await getGps();
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
                raiseDialogEvent(
                    response.message,
                    response.success ? "ok" : "warn"
                );
            } catch (err) {
                raiseDialogEvent(err.message);
            }
        }

        mode = undefined;
        onCashierComplete();
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
        if (!script) {
            raiseDialogEvent("Cashier script not provided by service.");
        }
        webCasherSessionScript = unescape(decodeURI(script)).replace(
            /\+/g,
            " "
        );
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
                newScript.appendChild(
                    document.createTextNode(oldScript.innerHTML)
                );
                oldScript.parentNode.replaceChild(newScript, oldScript);
            }
        );
    }
</script>

<section id="webcashier" />

<!-- <div data-gidx-script-loading='true'>Loading...</div><script src='https://ws.gidx-service.in/v3.0/We`bSession/Cashier?sessionid=_7Iq_Ux-h0eQ64L5b-ZYmg' 
  data-tsevo-script-tag data-gidx-session-id='_7Iq_Ux-h0eQ64L5b-ZYmg' type='text/javascript' ✂prettier:content✂="" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=">{}</script>-->
