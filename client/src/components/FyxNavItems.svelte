<script lang="ts">
    import { onMount } from "svelte";

    export let linkRoot: string = "/";
    export let visible: boolean = false;
    export let mode: "menu" | "nav" = "nav";
    let modeClass: string = "condensed";

    onMount(async () => {
        modeClass = mode === "nav" ? "condensed" : "";
    });
</script>

{#if visible}
    <nav
        role="navigation"
        class="nav-menu w-nav-menu {mode === 'menu' ? 'w-mode-menu' : 'w-mode-nav'}"
        data-nav-menu-open={mode === 'menu' ? true : null}
    >
        <a href={linkRoot} class="nav-link featured {modeClass} w-inline-block">
            <img
                src="images/icons8_star_96px.png"
                loading="lazy"
                alt=""
                class="nav-icon featured"
            />
            <div class="text-block {modeClass}">Featured</div>
            <div class="badge empty">
                <div class="count">99+</div>
            </div>
        </a>
        <a href={linkRoot} class="nav-link {modeClass} w-inline-block">
            <img
                src="images/icons8_game_controller_52px-1_1icons8_game_controller_52px-1.png"
                loading="lazy"
                alt=""
                class="nav-icon"
            />
            <div class="text-block {modeClass}">All Games</div>
            <div class="badge {modeClass}">
                <div class="count">99+</div>
            </div>
        </a>
        <a href={linkRoot} class="nav-link {modeClass} w-inline-block">
            <img
                src="images/icons8_leaderboard_60px-1_1icons8_leaderboard_60px-1.png"
                loading="lazy"
                alt=""
                class="nav-icon stats"
            />
            <div class="text-block {modeClass}">Global Stats</div>
            <div class="badge empty">
                <div class="count">99+</div>
            </div>
        </a>
        <a href={linkRoot} class="nav-link {modeClass} w-inline-block">
            <img
                src="images/icons8_trophy_52px-1_1icons8_trophy_52px-1.png"
                loading="lazy"
                alt=""
                class="nav-icon tournaments"
            />
            <div class="text-block {modeClass}">Tournaments</div>
            <div class="badge {modeClass}">
                <div class="count">3</div>
            </div>
        </a>
        <a href={linkRoot} class="nav-link {modeClass} w-inline-block">
            <img
                src="images/icons8_cinema_film_play_64px-1_1icons8_cinema_film_play_64px-1.png"
                loading="lazy"
                alt=""
                class="nav-icon matches"
            />
            <div class="text-block {modeClass}">Live Matches</div>
            <div class="badge {modeClass}">
                <div class="count">27</div>
            </div>
        </a>
        <a href={linkRoot} class="nav-link {modeClass} w-inline-block">
            <img
                src="images/icons8_video_trimming_52px-1_1icons8_video_trimming_52px-1.png"
                loading="lazy"
                alt=""
                class="nav-icon highlights"
            />
            <div class="text-block {modeClass}">Top Highlights</div>
            <div class="badge empty">
                <div class="count">99+</div>
            </div>
        </a>
        <a href={linkRoot} class="nav-link {modeClass} w-inline-block">
            <img
                src="images/icons8_small_business_60px-1_1icons8_small_business_60px-1.png"
                loading="lazy"
                alt=""
                class="nav-icon marketplace"
            />
            <div class="text-block {modeClass}">Marketplace</div>
            <div class="badge empty">
                <div class="count">99+</div>
            </div>
        </a>
        <a href={linkRoot} class="nav-link {modeClass} w-inline-block">
            <img
                src="images/icons8_laurel_wreath_100px-1_1icons8_laurel_wreath_100px-1.png"
                loading="lazy"
                alt=""
                class="nav-icon achievements"
            />
            <div class="text-block {modeClass}">Achievements</div>
            <div class="badge {modeClass}">
                <div class="count">5</div>
            </div>
        </a>
        <a href={linkRoot} class="nav-link {modeClass} w-inline-block">
            <img
                src="images/icons8_minecraft_sword_100px-1_1icons8_minecraft_sword_100px-1.png"
                loading="lazy"
                alt=""
                class="nav-icon items"
            />
            <div class="text-block {modeClass}">My Items</div>
            <div class="badge {modeClass}">
                <div class="count">17</div>
            </div>
        </a>
        <a href={linkRoot} class="nav-link {modeClass} w-inline-block">
            <img
                src="images/icons8_data_60px-1_1icons8_data_60px-1.png"
                loading="lazy"
                alt=""
                class="nav-icon wallet"
            />
            <div class="text-block {modeClass}">My Wallet</div>
            <div class="badge empty">
                <div class="count">99+</div>
            </div>
        </a>
        <a href={linkRoot} class="nav-link {modeClass} w-inline-block">
            <img
                src="images/icons8_book_shelf_60px-1_1icons8_book_shelf_60px-1.png"
                loading="lazy"
                alt=""
                class="nav-icon activity"
            />
            <div class="text-block {modeClass}">Activity Log</div>
            <div class="badge empty">
                <div class="count">99+</div>
            </div>
        </a>
        <a href={linkRoot} class="nav-link {modeClass} w-inline-block">
            <img
                src="images/icons8_logout_rounded_left_48px-2_1icons8_logout_rounded_left_48px-2.png"
                loading="lazy"
                alt=""
                class="nav-icon exit"
            />
            <div class="text-block {modeClass}">Log Out</div>
            <div class="badge empty">
                <div class="count">99+</div>
            </div>
        </a>
    </nav>
{/if}

<style>
    nav.w-mode-menu a .text-block {
        font-size: 13px;
    }
</style>
