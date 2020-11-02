<script lang="ts">
    import { loading, route } from "../services/stores";
    import { ApiService } from "../services/api-service";
    import { CashierResponse } from "../services/models";

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
    win.gidxServiceStatus = echoGidxEvent("gidxServiceStatus", () =>
        loading.set(false)
    );
    win.gidxErrorReport = echoGidxEvent("gidxErrorReport");
    win.gidxContainer = echoGidxEvent("gidxContainer");
    win.gidxBuildTimer = echoGidxEvent("gidxBuildTimer");
    win.gidxBuildSteps = echoGidxEvent("gidxBuildSteps");
    win.gidxNextStep = echoGidxEvent("gidxNextStep", handleGidxNextStep);

    let webCasherSessionScript: string;
    let errorMessage: string;
    let successMessage: string;
    let isCashierShowing: boolean = false;

    const cancel = async () => {
        route.set("/Home");
    };

    const addFunds = async () => {
        try {
            loading.set(true);
            errorMessage = null;
            //let geoAccess = navigator.permissions.query({name:'geolocation'});
            //if (['granted','prompt'].indexOf(geoAccess.state) > -1) { console.log('might work'); }
            const deviceGPS = await ApiService.getGps();

            if (deviceGPS.latitude < 1) {
                errorMessage = `You must share your location to continue`;
                return;
            }

            const ws = window.walletService;
            const message = ws.wallet.buildMessage({
                subject: ws.paymail,
                payload: JSON.stringify({ deviceGPS }),
            });

            const response = ((await ws.blockchain.sendMessage(
                message,
                "/payment"
            )) as unknown) as CashierResponse;

            let paymentId = response.paymentId;
            let script = response.cashierScript;
            if (script) {
                window.localStorage.setItem(paymentId, script);
                renderCashier(script);
                return;
            } else if (paymentId) {
                script = window.localStorage.getItem(paymentId);
                if (script) {
                    renderCashier(script);
                    return;
                }
                throw new Error("Cashier script not in localStorage.");
            }
        } catch (err) {
            console.log(err, err.stack);
            loading.set(false);
            errorMessage = err.message ?? `Could not add funds at this time.`;
            return;
        }
    };

    async function handleGidxNextStep() {
        console.log(`GET SESSION STATUS`);
        loading.set(true);
        isCashierShowing = false;
        const deviceGPS = await ApiService.getGps();
        const ws = window.walletService;
        const message = ws.wallet.buildMessage({
            subject: ws.paymail,
            payload: JSON.stringify({ deviceGPS }),
        });

        try {
            const response = (await ws.blockchain.sendMessage(
                message,
                "/payment/status"
            ));

            console.log(response);
            successMessage = response.body;
        } catch (err) {
            errorMessage = err.message;
        }
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
        webCasherSessionScript = unescape(decodeURI(script)).replace(
            /\+/g,
            " "
        );
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
                newScript.appendChild(
                    document.createTextNode(oldScript.innerHTML)
                );
                oldScript.parentNode.replaceChild(newScript, oldScript);
            }
        );
    }
</script>

<h2>Payments</h2>
<slot />

{#if errorMessage}
    <section class="errorPanel">
        <p>{errorMessage}</p>
    </section>
{/if}

{#if successMessage}
    <section>
        <p>{successMessage}</p>
    </section>
{/if}

{#if isCashierShowing}
    <section id="webcashier" />
{:else}
    <section>
        <div class="actions">
            <button class="action" on:click|preventDefault={addFunds}>Add Funds</button>
            <button
                class="action"
                on:click|preventDefault={cancel}>Cancel</button>
        </div>
    </section>
{/if}

<!-- <div data-gidx-script-loading='true'>Loading...</div><script src='https://ws.gidx-service.in/v3.0/We`bSession/Cashier?sessionid=_7Iq_Ux-h0eQ64L5b-ZYmg' 
data-tsevo-script-tag data-gidx-session-id='_7Iq_Ux-h0eQ64L5b-ZYmg' type='text/javascript' ✂prettier:content✂="" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=">{}</script>-->
