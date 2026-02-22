<script lang="ts">
	import './layout.css';
	import Navbar from '../components/Navbar.svelte';
	import Footer from '../components/Footer.svelte';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<Navbar />


<div class="bg-gray-50 min-h-screen w-full overflow-x-hidden">
	{@render children()}
</div>

<Footer />
