<script lang="ts">
	import Google_logo from '$lib/assets/Google_logo.png';
	import { PUBLIC_API_URL } from '$env/static/public';

	let isLoading = $state(false);
</script>

<main class="relative flex flex-col items-center justify-center min-h-screen bg-linear-to-b from-orange-500 to-orange-100 px-4">

	<div class="w-full max-w-sm z-10">
		<div class="space-y-6 rounded-2xl bg-white p-8 shadow-lg">
			
			<div class="mb-8 text-center">
				<h1 class="mb-2 text-3xl font-bold text-gray-800">ยินดีต้อนรับ</h1>
				<p class="text-gray-500">เข้าสู่ระบบเพื่อค้นหาเล่มปัญหาพิเศษ</p>
			</div>

			<a
				href={`${PUBLIC_API_URL}/auth/login`}
				class="w-full rounded-lg bg-white border-2 border-red-600 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
			>
				{#if isLoading}
					<span class="loading loading-spinner loading-sm"></span>
					<span>กำลังพาไปยัง Google...</span>
				{:else}
					<img src={Google_logo} alt="Google Logo" class="h-5 w-5" />
					<span>เข้าสู่ระบบด้วย Google</span>
				{/if}
			</a>
			
		</div>
	</div>

	<div class="absolute bottom-6 w-full text-center text-xs text-orange-900/60 font-medium">
		<p>ระบบค้นหาเล่มปัญหาพิเศษ</p>
		<p class="mt-1">© 2568 KMITL</p>
	</div>

</main>