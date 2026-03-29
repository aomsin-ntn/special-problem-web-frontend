<script lang="ts">
	import LoginForm from '$lib/components/LoginForm.svelte';
</script>

<main class="flex flex-col items-center justify-center min-h-screen bg-linear-to-b from-orange-500 to-orange-100 px-4">
	<div class="w-full max-w-md">
		<!-- Header -->
		<div class="mb-8 text-center">
			<h1 class="mb-2 text-3xl font-bold text-white">ยินดีต้อนรับ</h1>
			<p class="text-white">เข้าสู่ระบบเพื่อค้นหาเล่มปัญหาพิเศษ</p>
		</div>

		<!-- Login Form Component -->
		<LoginForm />

		<!-- Footer Info -->
		<div class="mt-8 text-center text-xs text-gray-600">
			<p>ระบบค้นหาเล่มปัญหาพิเศษ</p>
			<p class="mt-1">© 2568 สถาบันเทคโนโลยี</p>
		</div>
	</div>
</main>
