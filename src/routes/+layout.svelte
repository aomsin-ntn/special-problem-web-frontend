<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import { checkAuth } from '$lib/stores/authStore'; 
	import { page } from '$app/state';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import KmitlLogo from '$lib/assets/Kmitl-logo-navbar.png';

	let { children } = $props();

	onMount(() => {
        checkAuth(); 
    });

	const isLoginPage = $derived(page.url.pathname === '/login');
	const isFirstLoginPage = $derived(page.url.pathname.startsWith('/first-login/'));

</script>

<svelte:head>
	<link rel="icon" href={KmitlLogo} />
	<title>Special Problem Web App</title>
</svelte:head>

{#if !isLoginPage && !isFirstLoginPage}
	<Navbar />
{/if}


<div class="min-h-screen bg-white"> 
	{@render children()}
</div>

{#if !isLoginPage && !isFirstLoginPage}
	<Footer />
{/if}
