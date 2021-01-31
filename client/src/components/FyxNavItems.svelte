<script lang="ts">
    export let linkRoot: string = "/";
    export let visible: boolean = false;
    export let mode: "menu" | "nav" = "nav";
</script>

{#if visible}
    <nav
        role="navigation"
        class="nav-menu w-nav-menu {mode === 'menu' ? 'w-mode-menu' : 'w-mode-nav'}"
        data-nav-menu-open={mode === 'menu' ? true : null}
    >
        <a href={linkRoot} class="nav-link featured condensed w-inline-block">
            <img
                src="images/icons8_star_96px.png"
                loading="lazy"
                alt=""
                class="nav-icon featured"
            />
            <div class="text-block condensed">Featured</div>
            <div class="badge empty">
                <div class="count">99+</div>
            </div>
        </a>
        <a href={linkRoot} class="nav-link condensed w-inline-block">
            <img
                src="images/icons8_game_controller_52px-1_1icons8_game_controller_52px-1.png"
                loading="lazy"
                alt=""
                class="nav-icon"
            />
            <div class="text-block condensed">All Games</div>
            <div class="badge condensed">
                <div class="count">99+</div>
            </div>
        </a>
        <a href={linkRoot} class="nav-link condensed w-inline-block">
            <img
                src="images/icons8_leaderboard_60px-1_1icons8_leaderboard_60px-1.png"
                loading="lazy"
                alt=""
                class="nav-icon stats"
            />
            <div class="text-block condensed">Global Stats</div>
            <div class="badge empty">
                <div class="count">99+</div>
            </div>
        </a>
        <a href={linkRoot} class="nav-link condensed w-inline-block">
            <img
                src="images/icons8_trophy_52px-1_1icons8_trophy_52px-1.png"
                loading="lazy"
                alt=""
                class="nav-icon tournaments"
            />
            <div class="text-block condensed">Tournaments</div>
            <div class="badge condensed">
                <div class="count">3</div>
            </div>
        </a>
        <a href={linkRoot} class="nav-link condensed w-inline-block">
            <img
                src="images/icons8_cinema_film_play_64px-1_1icons8_cinema_film_play_64px-1.png"
                loading="lazy"
                alt=""
                class="nav-icon matches"
            />
            <div class="text-block condensed">Live Matches</div>
            <div class="badge condensed">
                <div class="count">27</div>
            </div>
        </a>
        <a href={linkRoot} class="nav-link condensed w-inline-block">
            <img
                src="images/icons8_video_trimming_52px-1_1icons8_video_trimming_52px-1.png"
                loading="lazy"
                alt=""
                class="nav-icon highlights"
            />
            <div class="text-block condensed">Top Highlights</div>
            <div class="badge empty">
                <div class="count">99+</div>
            </div>
        </a>
        <a href={linkRoot} class="nav-link condensed w-inline-block">
            <img
                src="images/icons8_small_business_60px-1_1icons8_small_business_60px-1.png"
                loading="lazy"
                alt=""
                class="nav-icon marketplace"
            />
            <div class="text-block condensed">Marketplace</div>
            <div class="badge empty">
                <div class="count">99+</div>
            </div>
        </a>
        <a href={linkRoot} class="nav-link condensed w-inline-block">
            <img
                src="images/icons8_laurel_wreath_100px-1_1icons8_laurel_wreath_100px-1.png"
                loading="lazy"
                alt=""
                class="nav-icon achievements"
            />
            <div class="text-block condensed">Achievements</div>
            <div class="badge condensed">
                <div class="count">5</div>
            </div>
        </a>
        <a href={linkRoot} class="nav-link condensed w-inline-block">
            <img
                src="images/icons8_minecraft_sword_100px-1_1icons8_minecraft_sword_100px-1.png"
                loading="lazy"
                alt=""
                class="nav-icon items"
            />
            <div class="text-block condensed">My Items</div>
            <div class="badge condensed">
                <div class="count">17</div>
            </div>
        </a>
        <a href={linkRoot} class="nav-link condensed w-inline-block">
            <img
                src="images/icons8_data_60px-1_1icons8_data_60px-1.png"
                loading="lazy"
                alt=""
                class="nav-icon wallet"
            />
            <div class="text-block condensed">My Wallet</div>
            <div class="badge empty">
                <div class="count">99+</div>
            </div>
        </a>
        <a href={linkRoot} class="nav-link condensed w-inline-block">
            <img
                src="images/icons8_book_shelf_60px-1_1icons8_book_shelf_60px-1.png"
                loading="lazy"
                alt=""
                class="nav-icon activity"
            />
            <div class="text-block condensed">Activity Log</div>
            <div class="badge empty">
                <div class="count">99+</div>
            </div>
        </a>
        <a href={linkRoot} class="nav-link condensed w-inline-block">
            <img
                src="images/icons8_logout_rounded_left_48px-2_1icons8_logout_rounded_left_48px-2.png"
                loading="lazy"
                alt=""
                class="nav-icon exit"
            />
            <div class="text-block condensed">Log Out</div>
            <div class="badge empty">
                <div class="count">99+</div>
            </div>
        </a>
    </nav>
{/if}

<style>
    nav.w-mode-menu a .text-block.condensed {
        font-size: 13px;
    }
</style>
