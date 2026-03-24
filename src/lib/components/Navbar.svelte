<script lang="ts">
    import kmitlLogo from '$lib/assets/Kmitl-logo-navbar.png';
    import { Menu, X } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    import { slide } from 'svelte/transition';

    let isMobileMenuOpen = $state(false);

    const menus = [
        { name: 'Home', href: '/' },
        { name: 'Login', href: '/login' }
    ] as const;

    function handleNavigate(href: string): void {
        isMobileMenuOpen = false;
        goto(href);
    }
</script>

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
        </ul>
    </div>
{/if}