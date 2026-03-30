<script lang="ts">
    import kmitlLogo from '$lib/assets/Kmitl-logo-navbar.png';
    import { Menu, X, LogOut, User } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    import { slide } from 'svelte/transition';
    import { authStore, logoutAuth } from '$lib/stores/authStore';

    let isMobileMenuOpen = $state(false);
    let isDropdownOpen = $state(false);
    let dropdownRef = $state<HTMLElement | null>(null);

    let auth = $state({ isLoggedIn: false, user: null as any});

    const unsubscribe = authStore.subscribe((value) => {
        auth = value;
    });

    function handleNavigate(href: string): void {
        isMobileMenuOpen = false;
        isDropdownOpen = false;
        goto(href);
    }

    async function handleLogout() {
        isDropdownOpen = false;
        isMobileMenuOpen = false;

        await logoutAuth();

        window.location.href = '/';
    }

    function handleClickOutside(event: MouseEvent): void {
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
            isDropdownOpen = false;
        }
    }

    const menus = [
        { name: 'Home', href: '/' }
    ] as const;
</script>

<svelte:window onclick={handleClickOutside} />

<nav class="flex items-center justify-between px-4 sm:px-6 md:px-10 py-1 bg-orange-500 shadow-sm">
    <div class="shrink-0">
        <a 
            href="/" 
            class="flex items-center gap-2"
        >
            <img 
                src={kmitlLogo} 
                alt="KMITL Logo" 
                class="h-10 sm:h-12 md:h-15"
            />
        </a>
    </div>

    <!-- Desktop Menu -->
    <ul class="hidden md:flex items-center space-x-4 md:space-x-5 text-white text-xs sm:text-sm md:text-base font-medium">
        {#each menus as menu (menu.href)}
            <li>
                <button 
                    onclick={() => handleNavigate(menu.href)}
                    class="hover:text-yellow-300 transition-colors cursor-pointer bg-none border-none p-0"
                >
                    {menu.name}
                </button>
            </li>
            {#if menu !== menus[menus.length - 1]}
                <li class="h-5 w-px bg-white"></li>
            {/if}
        {/each}

        {#if auth.isLoggedIn && auth.user}
            <li class="h-5 w-px bg-white"></li>
            <li class="relative" bind:this={dropdownRef}>
                <button
                    onclick={() => isDropdownOpen = !isDropdownOpen}
                    class="flex items-center gap-2 hover:text-yellow-300 transition-colors cursor-pointer bg-none border-none p-0"
                >
                    <User size={18} />
                    <span>{auth.user?.email}</span>
                </button>
                
                {#if isDropdownOpen}
                    <div class="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg z-50" transition:slide={{ duration: 200 }}>
                        <button
                            onclick={() => handleNavigate('/Profile')}
                            class="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-orange-50 rounded-t-lg transition-colors border-none bg-none cursor-pointer"
                        >
                            <User size={16} />
                            Profile
                        </button>
                        <button
                            onclick={handleLogout}
                            class="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-lg transition-colors border-none bg-none cursor-pointer"
                        >
                            <LogOut size={16} />
                            Log out
                        </button>
                    </div>
                {/if}
            </li>
        {:else}
            <li class="h-5 w-px bg-white"></li>
            <li>
                <button 
                    onclick={() => handleNavigate('/login')}
                    class="hover:text-yellow-300 transition-colors cursor-pointer bg-none border-none p-0"
                >
                    Login
                </button>
            </li>
        {/if}
    </ul>

    <!-- Mobile Menu Button -->
    <button 
        onclick={() => isMobileMenuOpen = !isMobileMenuOpen}
        class="md:hidden cursor-pointer p-2 rounded-lg hover:bg-orange-300 transition"
        aria-label="Toggle menu"
    >
        {#if isMobileMenuOpen}
            <X size={24} color="white" strokeWidth={2} />
        {:else}
            <Menu size={24} color="white" strokeWidth={2} />
        {/if}
    </button>
</nav>

<!-- Mobile Menu -->
{#if isMobileMenuOpen}
    <div class="md:hidden bg-orange-700 shadow-md" transition:slide={{ duration: 300 }}>
        <ul class="flex flex-col items-start px-4 py-3 space-y-2 text-white font-medium">
            {#each menus as menu (menu.href)}
                <li class="w-full">
                    <button 
                        onclick={() => handleNavigate(menu.href)}
                        class="w-full text-left px-3 py-2 hover:bg-orange-300 rounded transition-colors cursor-pointer bg-none border-none"
                    >
                        {menu.name}
                    </button>
                </li>
            {/each}

            {#if auth.isLoggedIn && auth.user}
                <li class="w-full border-t border-orange-500 mt-2 pt-2">
                    <button 
                        onclick={() => handleNavigate('/Profile')}
                        class="w-full text-left px-3 py-2 hover:bg-orange-300 rounded transition-colors cursor-pointer bg-none border-none flex items-center gap-2"
                    >
                        <User size={16} />
                        Profile
                    </button>
                </li>
                <li class="w-full">
                    <button 
                        onclick={handleLogout}
                        class="w-full text-left px-3 py-2 hover:bg-red-600 rounded transition-colors cursor-pointer bg-none border-none flex items-center gap-2"
                    >
                        <LogOut size={16} />
                        Log out
                    </button>
                </li>
            {:else}
                <li class="w-full">
                    <button 
                        onclick={() => handleNavigate('/login')}
                        class="w-full text-left px-3 py-2 hover:bg-orange-300 rounded transition-colors cursor-pointer bg-none border-none"
                    >
                        Login
                    </button>
                </li>
            {/if}
        </ul>
    </div>
{/if}