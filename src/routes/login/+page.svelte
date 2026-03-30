<script lang="ts">
	import Google_logo from '$lib/assets/Google_logo.png';
	import { PUBLIC_API_URL } from '$env/static/public';

	let isLoading = $state(false);

	const handleGoogleLogin = () => {
		isLoading = true;
        
        window.location.href = `${PUBLIC_API_URL}/auth/login`;
	};

</script>

<main class="flex flex-col items-center justify-center min-h-screen bg-linear-to-b from-orange-500 to-orange-100 px-4">

	<div class="w-full max-w-sm">
		<div class="space-y-6 rounded-2xl bg-white p-8 shadow-lg">
			
			<div class="mb-8 text-center">
				<h1 class="mb-2 text-3xl font-bold text-gray-200">ยินดีต้อนรับ</h1>
				<p class="text-gray-200">เข้าสู่ระบบเพื่อค้นหาเล่มปัญหาพิเศษ</p>
			</div>

			<button
				onclick={handleGoogleLogin}
				disabled={isLoading}
				class="w-full rounded-lg bg-white border-2 border-red-600 px-4 py-2 font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
			>
				{#if isLoading}
					<span class="loading loading-spinner loading-sm"></span>
					<span>กำลังพาไปยัง Google...</span>
				{:else}
					<img src={Google_logo} alt="Google Logo" class="h-5 w-5" />
					<span>เข้าสู่ระบบด้วย Google</span>
				{/if}
			</button>
			
			<!-- Remember Me 
			<div class="flex items-center">
				<input
					id="remember"
					type="checkbox"
					bind:checked={rememberMe}
					class="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
					disabled={isLoading}
				/>
				<label for="remember" class="ml-2 text-sm text-gray-700">จำข้อมูลของฉัน</label>
			</div>
			-->
		</div>
		<!-- Footer Info -->
		<div class=" mt-8 text-center text-xs text-gray-600">
			<p>ระบบค้นหาเล่มปัญหาพิเศษ</p>
			<p class="mt-1">© 2568 KMITL</p>
		</div>
	</div>
</main>
