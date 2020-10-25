<script lang="ts">
    import ApiService from "../services/api-service";
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

    let webCasherSessionScript: string;
    let errorMessage: string;

    export let isActive: boolean = false;

    export const showCashier = async () => {
        try {
            isActive = true;
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
                throw new Error('Cashier script not in localStorage.');
            }
        } catch (err) {
            console.log(err, err.stack);
            errorMessage = `Could not continue payment activity.`;
            return;
        }
    };

    win.gidxServiceSettings = function (data) {
        console.log(`TRIGGERED: gidx.gidxServiceSettings: ${data}`);
        win.gidxContainer = "#webcashier";
        win.gidxBuildTimer = false;
        win.gidxBuildSteps = false;
    };

    function echoGidxEvent(name, func?: Function) {
        return (data) => {
            console.log(`TRIGGERED: gidx.${name}: ${data}`);
            if (typeof func === "function") {
                func(data);
            }
        };
    }

    win.gidxServiceStatus = echoGidxEvent("gidxServiceStatus");
    win.gidxErrorReport = echoGidxEvent("gidxErrorReport");
    win.gidxContainer = echoGidxEvent("gidxContainer");
    win.gidxBuildTimer = echoGidxEvent("gidxBuildTimer");
    win.gidxBuildSteps = echoGidxEvent("gidxBuildSteps");

    win.gidxNextStep = echoGidxEvent("gidxNextStep", () => { isActive = false; });

    const renderCashier = (script) => {
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
    };

    const setInnerHTML = (elm, html) => {
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
    };

    function generateScript(gidxSessionId): string {
        let script = `%3cdiv+data-gidx-script-loading%3d%27true%27%3eLoading...%3c%2fdiv%3e%3cscript+src%3d%27https%3a%2f%2fws.gidx-service.in%2fv3.0%2fWebSession%2fCashier%3fsessionid%3d${gidxSessionId}%27+data-tsevo-script-tag+data-gidx-session-id%3d%27${gidxSessionId}%27+type%3d%27text%2fjavascript%27%3e%3c%2fscript%3e`;
        return script;
    }
</script>

{#if isActive}
    <h2>Cashier</h2>
    <slot />
    {#if errorMessage}
        <section class="errorPanel">
            <h3>Error</h3>
            <p>{errorMessage}</p>
        </section>
    {/if}
    {#if webCasherSessionScript}
        <section id="webcashier" />
    {/if}
{/if}

<!-- <div data-gidx-script-loading='true'>Loading...</div><script src='https://ws.gidx-service.in/v3.0/We`bSession/Cashier?sessionid=_7Iq_Ux-h0eQ64L5b-ZYmg' 
data-tsevo-script-tag data-gidx-session-id='_7Iq_Ux-h0eQ64L5b-ZYmg' type='text/javascript' ✂prettier:content✂="" ✂prettier:content✂="e30=">{}</script>-->
