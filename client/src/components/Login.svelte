<script lang="ts">
  import {
    walletService,
    currentUser,
    loggedIn,
    loading,
    route,
  } from "../services/stores";
  import { createEventDispatcher } from "svelte";
  import { get } from "svelte/store";

  const dispatch = createEventDispatcher();

  let showReg: boolean = false;
  let handle: string;
  let password: string;
  let email: string;
  let handleRegExp: string = "[a-zA-Z0-9]{4,25}";
  let errorText: string;

  const onStatusChanged = () => {
    const ws = get(walletService);
    loading.set(false);
    loggedIn.update((v) => ws.authenticated);
    currentUser.update((v) => ws.handle);
  };

  const register = async () => {
    const ws = get(walletService);
    console.log("register");
    loading.set(true);
    try {
      await ws.register(handle, password, email);
    } catch (err) {
      showError(`Registration failed`);
      return;
    }
    onStatusChanged();
  };

  const login = async () => {
    const ws = get(walletService);
    console.log("login");
    loading.set(true);
    try {
      await ws.login(handle, password);
    } catch (err) {
      showError(`Login failed`);
      return;
    }
    onStatusChanged();
  };

  const logout = async () => {
    const ws = get(walletService);
    console.log("logout");
    loading.set(true);
    await ws.logout();
    onStatusChanged();
  };

  const showError = async (msg) => {
    console.log(msg);
    loading.set(false);
    errorText = msg;
    setTimeout(() => {
      errorText = null;
    }, 5000);
  };

  route.subscribe((r) => {
    if (r === "logout") {
      logout();
    }
  });
</script>

<style>
</style>

{#if $loggedIn}
  <section class="actions">
    <button
      class="action icon ico-signout"
      on:click|preventDefault={logout}>Logout</button>
  </section>
{:else}
<h2 hidden={!showReg} class="large-caption">Register</h2>
<h2 hidden={showReg} class="large-caption">Login</h2>
  {#if errorText}
    <section class="errorPanel">
      <p>{errorText}</p>
    </section>
  {/if}
  <section hidden={!showReg}>
    <form on:submit|preventDefault={register}>
      <div class="field">
        <label for="remail">
          <span class="field-label">Email</span>
          <span class="field-hint">Must contain unique email address.</span>
        </label>
        <input
          id="remail"
          class="field-cntrl"
          bind:value={email}
          required
          placeholder="enter your email"
          type="email" />
      </div>

      <div class="field large-button">
        <label for="rhandle">
          <span class="field-label">Gamer Handle</span>
          <span class="field-hint">Must contain 4+ characters.</span>
        </label>
        <input
          id="rhandle"
          class="field-cntrl"
          bind:value={handle}
          required
          pattern={handleRegExp}
          placeholder="enter your gamer handle" />
      </div>

      <div class="field">
        <label for="rpassword">
          <span class="field-label">Password</span>
          <span class="field-hint">Must contain 8+ characters with at least
            <br />1 number and 1 uppercase letter.</span>
        </label>
        <input
          id="rpassword"
          class="field-cntrl"
          bind:value={password}
          required
          minlength={8}
          placeholder="enter your password"
          type="password" />
      </div>

      <div class="actions">
        <button class="action featured primary" type="submit">Register</button>
      </div>
    </form>
    <p class="large-caption link-button">
      <a href="/" on:click|preventDefault={() => (showReg = false)}>Login</a>
    </p>
  </section>

  <section hidden={showReg}>
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
          required
          pattern={handleRegExp}
          placeholder="enter your gamer handle" />
      </div>

      <div class="field">
        <label for="password">
          <span class="field-label">Password</span>
          <span class="field-hint">Must contain 8+ characters with at least
            <br />1 number and 1 uppercase letter.</span>
        </label>
        <input
          id="password"
          class="field-cntrl"
          bind:value={password}
          required
          minlength={8}
          placeholder="enter your password"
          type="password" />
      </div>

      <div class="actions">
        <button class="action featured primary" type="submit">Login</button>
      </div>
    </form>
    <p class="large-caption link-button">
      <a href="/" on:click|preventDefault={() => (showReg = true)}>Register</a>
    </p>
  </section>
{/if}
