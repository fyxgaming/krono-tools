<script lang="ts">
    import { currentUser, loggedIn, loading } from "../services/stores";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    let showReg: boolean = false;
    let handle: string;
    let password: string;
    let email: string;

    const onStatusChanged = () => {
        const ws = window.walletService;
        loading.set(false);
        loggedIn.update(v => ws.authenticated);
        currentUser.update(v => ws.handle);
    };

    const register = async () => {
        console.log("register");
        loading.set(true);
        await window.walletService.register(handle, password, email);
        onStatusChanged();
    };

    const login = async () => {
        console.log("login");
        loading.set(true);
        await window.walletService.login(handle, password);
        onStatusChanged();
    };

    const logout = async () => {
        console.log("logout");
        loading.set(true);
        await window.walletService.logout();
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
        max-width: 320px;
        width: 100%;
    }
</style>

{#if ($loggedIn)}
    <section>
        <div class="actions">
            <button class="action" on:click|preventDefault={logout}>Logout</button>
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
                    class="field-cntrl"
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
                    class="field-cntrl"
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
                    class="field-cntrl"
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
