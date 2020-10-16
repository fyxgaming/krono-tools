<script lang="ts">
    import { GlobalService } from '../services/global-service';
    const gs = new GlobalService();
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let loggedIn: boolean;
    let showReg: boolean = false;
    let handle: string;
    let password: string;
    let email: string;

    const onStatusChanged = () => {
        dispatch("statusChanged", { loggedIn });
    };

    const register = async () => {
        console.log("register");
        await gs.wallet.register(handle, password, email);
        loggedIn = true;
        onStatusChanged();
    };

    const login = async () => {
        console.log("login");
        await gs.wallet.login(handle, password);
        loggedIn = true;
        onStatusChanged();
    };

    const logout = () => {
        console.log("logout");
        gs.wallet.logout();
        loggedIn = false;
        onStatusChanged();
    };
</script>

<style>
    .field {
        display: block;
        margin-bottom: 10px;
    }
    .field-label {
        display: block;
        font-weight: bold;
        font-size: 14px;
        color: darkslategray;
    }
    .field-hint {
        display: block;
        font-size: 10px;
        color: darkslategray;
    }
    .field-cntrl {
        display:block;
    }
    .action {
        display:block;
    }
</style>

{#if loggedIn}
    <section>
        <div class="actions">
            <button on:click={logout}>Logout</button>
        </div>
    </section>
{:else}
    <section hidden={!showReg}>
        <h2>Register</h2>
        <form on:submit|preventDefault={register}>
            <div class="field">
                <label for="rhandle">
                    <span class="field-label">Gamer Handle</span>
                    <span class="field-hint">Must contain 4+ characters.</span>
                </label>
                <input
                    id="rhandle"
                    class="field-cntrl"
                    bind:value={handle}
                    placeholder="enter your gamer handle" />
            </div>

            <div class="field">
                <label for="rpassword">
                    <span class="field-label">Password</span>
                    <span class="field-hint">Must contain 8+ characters with at
                        least 1 number and 1 uppercase letter.</span>
                </label>
                <input
                    id="rpassword"
                    class="field"
                    bind:value={password}
                    placeholder="enter your password"
                    type="password" />
            </div>

            <div class="field">
                <label for="remail">
                    <span class="field-label">Email</span>
                    <span class="field-hint" />
                </label>
                <input
                    id="remail"
                    class="field"
                    bind:value={email}
                    placeholder="enter your email"
                    type="email" />
            </div>

            <div class="actions">
                <button class="action" type="submit">Register</button>
            </div>
        </form>
        <p><a href="/" on:click|preventDefault={() => (showReg = false)}>Login</a></p>
    </section>

    <section hidden={showReg}>
        <h2>Login</h2>
        <form on:submit|preventDefault={login}>
            <div class="field">
                <label for="handle">
                    <span class="field-label">Gamer Handle</span>
                    <span class="field-hint">Must contain 4+ characters.</span>
                </label>
                <input
                    id="handle"
                    class="field-cntrl"
                    bind:value={handle}
                    placeholder="enter your gamer handle" />
            </div>

            <div class="field">
                <label for="password">
                    <span class="field-label">Password</span>
                    <span class="field-hint">Must contain 8+ characters with at
                        least 1 number and 1 uppercase letter.</span>
                </label>
                <input
                    id="password"
                    class="field"
                    bind:value={password}
                    placeholder="enter your password"
                    type="password" />
            </div>

            <div class="actions">
                <button class="action" type="submit">Login</button>
            </div>
        </form>
        <p><a href="/" on:click|preventDefault={() => (showReg = true)}>Register</a></p>
    </section>
{/if}
