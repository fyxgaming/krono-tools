<script lang="ts">
    interface GidxWindow extends Window { 
        gidxServiceSettings, 
        gidxContainer,
        gidxBuildTimer,
        gidxBuildSteps
    };
    const win = window as unknown as GidxWindow;

    win.gidxServiceSettings = function () {
        win.gidxContainer = "#webcashier";
        win.gidxBuildTimer = false;
        win.gidxBuildSteps = false;
    };

    let webCasherSessionScript: string;

    export let isActive: boolean = false;
    export const showCashier = () => {
        isActive = true;
        let script =
            "%3cdiv+data-gidx-script-loading%3d%27true%27%3eLoading...%3c%2fdiv%3e%3cscript+src%3d%27https%3a%2f%2fws.gidx-service.in%2fv3.0%2fWebSession%2fCashier%3fsessionid%3d_7Iq_Ux-h0eQ64L5b-ZYmg%27+data-tsevo-script-tag+data-gidx-session-id%3d%27_7Iq_Ux-h0eQ64L5b-ZYmg%27+type%3d%27text%2fjavascript%27%3e%3c%2fscript%3e";
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

    const setInnerHTML = function (elm, html) {
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

    
</script>

{#if isActive && webCasherSessionScript}
    <h2>Cashier</h2>
    <section id="webcashier" />
{/if}
