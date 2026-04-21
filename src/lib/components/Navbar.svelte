<script lang="ts">
    import kmitlLogo from '$lib/assets/Kmitl-logo-navbar.png';
    import { Menu, X, LogOut, User, FileText, Book } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    import { slide } from 'svelte/transition';
    import { authStore, logoutAuth } from '$lib/stores/authStore';

    let isMobileMenuOpen = $state(false);
    let isDropdownOpen = $state(false);
    let dropdownRef = $state<HTMLElement | null>(null);

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

<nav class="flex items-center justify-between px-4 sm:px-6 md:px-10 py-1 bg-orange-500 relative z-50">
    <div class="shrink-0">
        <a 
            href="/" 
            class="flex items-center gap-2">
            <img 
                src={kmitlLogo} 
                alt="KMITL Logo" 
                class="h-10 sm:h-12 md:h-15" />
        </a>
    </div>

    <ul class="hidden md:flex items-center space-x-4 md:space-x-5 text-white text-xs sm:text-sm md:text-base font-medium">
        {#each menus as menu (menu.href)}
            <li>
                <button 
                    type="button" onclick={() => handleNavigate(menu.href)} 
                    class="hover:text-yellow-300 transition-colors bg-transparent border-none cursor-pointer">
                    {menu.name}
                </button>
            </li>
            {#if menu !== menus[menus.length - 1]}
                <li class="h-5 w-px bg-white"></li>
            {/if}
        {/each}

        {#if $authStore.isLoggedIn && $authStore.user}
            <li class="h-5 w-px bg-white"></li>
            <li class="relative" bind:this={dropdownRef}>
                <button 
                    type="button" 
                    onclick={() => isDropdownOpen = !isDropdownOpen} 
                    class="flex items-center gap-2 hover:text-yellow-300 transition-colors bg-transparent border-none cursor-pointer">
                    <User size={18} />
                    <span class="hidden lg:inline">{$authStore.user?.email}</span>
                </button>
                
                {#if isDropdownOpen}
                    <div class="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg z-50 overflow-hidden" transition:slide={{ duration: 200 }}>
                        <button 
                            type="button" 
                            onclick={() => handleNavigate('/profile')} 
                            class="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-orange-50 transition-colors bg-transparent border-none cursor-pointer">
                            <User size={16} /> Profile
                        </button>
                        {#if $authStore.user.role === 'staff' || $authStore.user.role === 'professor'}
                            <button 
                                type="button" 
                                onclick={() => handleNavigate('/project-report')} 
                                class="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-orange-50 transition-colors bg-transparent border-none cursor-pointer">
                                <FileText size={16} /> Project report
                            </button>
                            <button 
                                type="button" 
                                onclick={() => handleNavigate('/dictionary-report')} 
                                class="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-orange-50 transition-colors bg-transparent border-none cursor-pointer">
                                <Book size={16} />Dictionary report
                            </button>
                        {/if}
                        <button 
                            type="button" 
                            onclick={handleLogout} 
                            class="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors bg-transparent border-none cursor-pointer">
                            <LogOut size={16} /> Log out
                        </button>
                    </div>
                {/if}
            </li>
        {:else}
            <li class="h-5 w-px bg-white"></li>
            <li>
                <button 
                    type="button" 
                    onclick={() => handleNavigate('/login')} 
                    class="hover:text-yellow-300 transition-colors bg-transparent border-none cursor-pointer">
                    Login
                </button>
            </li>
        {/if}
    </ul>

    <button 
        type="button" 
        onclick={() => isMobileMenuOpen = !isMobileMenuOpen} 
        class="md:hidden cursor-pointer p-2 rounded-lg hover:bg-orange-600 transition-colors bg-transparent border-none">
        {#if isMobileMenuOpen}
            <X size={24} color="white" />
        {:else}
            <Menu size={24} color="white" />
        {/if}
    </button>
</nav>

{#if isMobileMenuOpen}
    <div class="md:hidden bg-orange-700 shadow-md absolute w-full z-40" transition:slide={{ duration: 200 }}>
        <ul class="flex flex-col items-start px-4 py-3 space-y-2 text-white font-medium">
            {#each menus as menu (menu.href)}
                <li class="w-full">
                    <button 
                        type="button" 
                        onclick={() => handleNavigate(menu.href)} 
                        class="w-full text-left px-3 py-2 hover:bg-orange-600 rounded transition-colors bg-transparent border-none">
                        {menu.name}
                    </button>
                </li>
            {/each}

            {#if $authStore.isLoggedIn && $authStore.user}
                <li class="w-full border-t border-orange-500 mt-2 pt-2">
                    <button 
                        type="button" 
                        onclick={() => handleNavigate('/profile')} 
                        class="w-full text-left px-3 py-2 hover:bg-orange-600 rounded transition-colors flex items-center gap-2 bg-transparent border-none">
                        <User size={16} /> Profile
                    </button>
                </li>
                {#if $authStore.user.role === 'staff' || $authStore.user.role === 'professor'}
                    <li class="w-full">
                        <button 
                            type="button" 
                            onclick={() => handleNavigate('/project-report')} 
                            class="w-full text-left px-3 py-2 hover:bg-orange-600 rounded transition-colors flex items-center gap-2 bg-transparent border-none">
                            <FileText size={16} /> Project report
                        </button>
                    </li>
                    <li class="w-full">
                        <button 
                            type="button" 
                            onclick={() => handleNavigate('/dictionary-report')} 
                            class="w-full text-left px-3 py-2 hover:bg-orange-600 rounded transition-colors flex items-center gap-2 bg-transparent border-none">
                            <Book size={16} /> Dictionary report
                        </button>
                    </li>
                {/if}
                <li class="w-full">
                    <button 
                        type="button" 
                        onclick={handleLogout} 
                        class="w-full text-left px-3 py-2 hover:bg-red-600 rounded transition-colors flex items-center gap-2 bg-transparent border-none">
                        <LogOut size={16} /> Log out
                    </button>
                </li>
            {:else}
                <li class="w-full border-t border-orange-500 mt-2 pt-2">
                    <button 
                        type="button" 
                        onclick={() => handleNavigate('/login')} 
                        class="w-full text-left px-3 py-2 hover:bg-orange-600 rounded transition-colors bg-transparent border-none">
                        Login
                    </button>
                </li>
            {/if}
        </ul>
    </div>
{/if}