<script lang="ts">
	import Button from '$lib/components/api.svelte';
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
	<div class="bg-white rounded-lg shadow-lg p-8">
		<h1 class="mb-4 text-3xl font-bold text-gray-900">Button Demo Page</h1>
		<p class="mb-8 text-gray-600">Click the button to test the API:</p>
		<Button />
	</div>
</div>
