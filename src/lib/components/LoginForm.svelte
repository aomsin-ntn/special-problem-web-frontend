<script lang="ts">
	import Google_logo from '$lib/assets/Google_logo.png';
	import { authStore } from '$lib/stores/authStore';

	// Configuration for allowed organization email domains
	const ALLOWED_DOMAINS = [
		'ac.th', // Thai academic institutions
		'student.chula.ac.th',
		'chula.ac.th',
		// Add more organization domains as needed
	];

	let email = $state<string>('');
	let password = $state<string>('');
	let rememberMe = $state<boolean>(false);
	let isLoading = $state<boolean>(false);
	let errorMessage = $state<string>('');
	let googleLoading = $state<boolean>(false);

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
			console.log('🔐 [LoginForm] Sending login request...');
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password, rememberMe })
			});

			console.log('📨 [LoginForm] Response status:', response.status);

			if (!response.ok) {
				console.log('❌ [LoginForm] Response not OK, parsing error...');
				try {
					const error = await response.json();
					errorMessage = error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
				} catch {
					errorMessage = `Server Error (${response.status}): ${response.statusText}`;
				}
				return;
			}

			console.log('✅ [LoginForm] Response OK, parsing JSON...');
			const data = await response.json();
			console.log('✨ [LoginForm] Data received:', data);
			
			// Set cookie with token
			const maxAge = rememberMe ? 30 * 24 * 60 * 60 : undefined; // 30 days if remember me
			document.cookie = `authToken=${data.token}; path=/; ${maxAge ? `max-age=${maxAge}` : ''}`;
			document.cookie = `userId=${data.userId}; path=/; ${maxAge ? `max-age=${maxAge}` : ''}`;

			// Store in localStorage for persistence
			if (rememberMe) {
				localStorage.setItem('authToken', data.token);
				localStorage.setItem('userId', data.userId);
			}

			// Store user in auth store
			authStore.login({
				userId: data.userId,
				email: email,
				username: data.username || data.fullName || data.studentId || email,
				userType: data.userType
			});

			console.log('🎉 [LoginForm] Login successful! Redirecting...');
			// Navigate to home
			window.location.href = '/';
		} catch (error) {
			errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่';
			console.error('❌ [LoginForm] Catch error:', error);
		} finally {
			isLoading = false;
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleLogin();
		}
	}

	function isAddressAllowedDomain(emailAddress: string): boolean {
		const domain = emailAddress.split('@')[1]?.toLowerCase();
		if (!domain) return false;
		
		return ALLOWED_DOMAINS.some(allowedDomain => 
			domain === allowedDomain || domain.endsWith('.' + allowedDomain)
		);
	}

	async function handleGoogleLogin() {
		errorMessage = '';
		googleLoading = true;

		try {
			console.log('🔐 [LoginForm] Initiating Google OAuth login...');
			
			// Get Google OAuth configuration from backend
			const configResponse = await fetch('/api/auth/google-config');
			if (!configResponse.ok) {
				throw new Error('Failed to get Google OAuth configuration');
			}

			const config = await configResponse.json();
			const clientId = config.clientId;
			const redirectUri = config.redirectUri;

			// Generate state for CSRF protection
			const state = Math.random().toString(36).substring(7);
			sessionStorage.setItem('oauth_state', state);

			// Build Google OAuth URL
			const params = new URLSearchParams({
				client_id: clientId,
				redirect_uri: redirectUri,
				response_type: 'code',
				scope: 'openid email profile',
				state: state,
				hd: 'chula.ac.th' // Force organization domain (change as needed)
			});

			const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
			console.log('📍 [LoginForm] Redirecting to Google OAuth...');
			window.location.href = googleAuthUrl;
		} catch (error) {
			errorMessage = 'ไม่สามารถเชื่อมต่อกับ Google ได้ กรุณาลองใหม่';
			console.error('❌ [LoginForm] Google login error:', error);
		} finally {
			googleLoading = false;
		}
	}
</script>

<div class="space-y-6 rounded-lg bg-white p-8 shadow-lg">
	{#if errorMessage}
		<div class="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-800">
			<svg class="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
			</svg>
			<span>{errorMessage}</span>
		</div>
	{/if}

	<!-- Email Input -->
	<div class="space-y-2">
		<label for="email" class="block text-sm font-medium text-black">อีเมล</label>
		<input
			id="email"
			type="email"
			bind:value={email}
			onkeypress={handleKeyPress}
			placeholder="example@university.ac.th"
			class="w-full rounded-lg border-2 border-gray-300 px-4 py-2 placeholder-gray-400 transition focus:border-orange-500 focus:outline-none text-black"
			disabled={isLoading}
		/>
	</div>

	<!-- Password Input -->
	<div class="space-y-2">
		<div class="flex items-center justify-between">
			<label for="password" class="block text-sm font-medium text-black">รหัสผ่าน</label>
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
			class="w-full rounded-lg border-2 border-gray-300 px-4 py-2 placeholder-gray-400 transition focus:border-orange-500 focus:outline-none text-black"
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

	<!-- Organization Email Login Button -->
	<button
		onclick={handleGoogleLogin}
		disabled={googleLoading || isLoading}
		class="w-full rounded-lg bg-white border-2 border-red-600 px-4 py-2 font-semibold text-red-600 transition hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
	>
		{#if googleLoading}
			<svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
			</svg>
			<span>กำลังเข้าสู่ระบบ...</span>
		{:else}
			<img src={Google_logo} alt="Google Logo" class="h-5 w-5" />
			<span>เข้าสู่ระบบด้วย google</span>
		{/if}
	</button>

</div>
