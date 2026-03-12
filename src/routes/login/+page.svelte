<script lang="ts">
	let email = $state<string>('');
	let password = $state<string>('');
	let rememberMe = $state<boolean>(false);
	let isLoading = $state<boolean>(false);
	let errorMessage = $state<string>('');

	async function handleLogin() {
		// Reset error message
		errorMessage = '';

		// Validation
		if (!email.trim()) {
			errorMessage = 'กรุณากรอกอีเมล';
			return;
		}

		if (!password.trim()) {
			errorMessage = 'กรุณากรอกรหัสผ่าน';
			return;
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
			return;
		}

		// Password length validation
		if (password.length < 6) {
			errorMessage = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
			return;
		}

		isLoading = true;

		try {
			// TODO: Replace with actual login API call
			// const response = await fetch('http://localhost:8000/api/auth/login', {
			// 	method: 'POST',
			// 	headers: { 'Content-Type': 'application/json' },
			// 	body: JSON.stringify({ email, password, rememberMe })
			// });

			// Simulated delay
			await new Promise(resolve => setTimeout(resolve, 1000));

			// On success, navigate to home
			window.location.href = '/';
		} catch (error) {
			errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่';
			console.error('Login error:', error);
		} finally {
			isLoading = false;
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleLogin();
		}
	}
</script>

<main class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 px-4">
	<div class="w-full max-w-md">
		<!-- Header -->
		<div class="mb-8 text-center">
			<div class="mb-6 flex justify-center">
				<div class="rounded-full bg-orange-500 p-4">
					<svg class="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
					</svg>
				</div>
			</div>
			<h1 class="mb-2 text-3xl font-bold text-gray-900">ยินดีต้อนรับ</h1>
			<p class="text-gray-600">เข้าสู่ระบบเพื่อค้นหาเล่มปัญหาพิเศษ</p>
		</div>

		<!-- Login Form Card -->
		<div class="space-y-6 rounded-lg bg-white p-8 shadow-lg">
			{#if errorMessage}
				<div class="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-800">
					<svg class="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
					</svg>
					<span>{errorMessage}</span>
				</div>
			{/if}

			<!-- Email Input -->
			<div class="space-y-2">
				<label for="email" class="block text-sm font-medium text-gray-700">อีเมล</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					onkeypress={handleKeyPress}
					placeholder="example@university.ac.th"
					class="w-full rounded-lg border-2 border-gray-300 px-4 py-2 placeholder-gray-400 transition focus:border-orange-500 focus:outline-none"
					disabled={isLoading}
				/>
			</div>

			<!-- Password Input -->
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<label for="password" class="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
					<button
						onclick={() => window.location.href = '/forgot-password'}
						class="text-sm text-orange-600 hover:text-orange-700 bg-transparent border-none cursor-pointer"
					>
						ลืมรหัสผ่าน?
					</button>
				</div>
				<input
					id="password"
					type="password"
					bind:value={password}
					onkeypress={handleKeyPress}
					placeholder="••••••••"
					class="w-full rounded-lg border-2 border-gray-300 px-4 py-2 placeholder-gray-400 transition focus:border-orange-500 focus:outline-none"
					disabled={isLoading}
				/>
			</div>

			<!-- Remember Me -->
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

			<!-- Login Button -->
			<button
				onclick={handleLogin}
				disabled={isLoading}
				class="w-full rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if isLoading}
					<span class="flex items-center justify-center gap-2">
						<svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
						</svg>
						กำลังเข้าสู่ระบบ...
					</span>
				{:else}
					เข้าสู่ระบบ
				{/if}
			</button>

			<!-- Divider -->
			<div class="relative">
				<div class="absolute inset-0 flex items-center">
				<div class="w-full border-t-2 border-gray-300"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="bg-white px-2 text-gray-500">หรือ</span>
				</div>
			</div>

			<!-- Sign Up Link -->
			<p class="text-center text-sm text-gray-600">
				ยังไม่มีบัญชี?
				<button
					onclick={() => window.location.href = '/register'}
					class="font-semibold text-orange-600 hover:text-orange-700 bg-transparent border-none cursor-pointer"
				>
					สมัครสมาชิก
				</button>
			</p>
		</div>

		<!-- Footer Info -->
		<div class="mt-8 text-center text-xs text-gray-600">
			<p>ระบบค้นหาเล่มปัญหาพิเศษ</p>
			<p class="mt-1">© 2567 สถาบันเทคโนโลยี</p>
		</div>
	</div>
</main>
