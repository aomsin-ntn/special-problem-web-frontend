<script lang="ts">
	import Google_logo from '$lib/assets/Google_logo.png';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { PUBLIC_API_URL } from '$env/static/public';

	let isLoading = $state(false);

	//จัดการ login ครั้งแรก
	let isSetupMode = $state(false);
	let fullName = $state('');

	//จัดการ Search Dropdown Degree
	let degrees = $state<{ id: string, name: string }[]>([]);
	let searchDegree = $state('');
	let selectedDegreeId = $state('');
	let isDropdownOpen = $state(false);

	$effect(() => {
		isSetupMode = page.url.searchParams.get('setup') === 'true';
	});

	onMount(async () => {
		if (isSetupMode) {
			try {
				const res = await fetch(`${PUBLIC_API_URL}/api/degrees`);
				if (res.ok) {
					degrees = await res.json();
				} else {
					degrees = [
						{ id: '1', name: 'วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์)' },
						{ id: '2', name: 'วิทยาศาสตรบัณฑิต (เทคโนโลยีสารสนเทศ)' },
						{ id: '3', name: 'วิศวกรรมศาสตรบัณฑิต (วิศวกรรมคอมพิวเตอร์)' }
					];
				}
			} catch (error) {
				console.error("Fetch degrees error:", error);
			}
		}
	});

	const filteredDegrees = $derived(
		degrees.filter(d => d.name.toLowerCase().includes(searchDegree.toLowerCase()))
	);

	const selectDegree = (id: string, name: string) => {
		selectedDegreeId = id;
		searchDegree = name; 
		isDropdownOpen = false;
	};

	const handleGoogleLogin = () => {
		isLoading = true;
        
        window.location.href = `${PUBLIC_API_URL}/auth/login`;
	};

	const handleSetupSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		if (!selectedDegreeId) {
			alert('กรุณาเลือกหลักสูตรจากตัวเลือกที่มีให้');
			return;
		}

		isLoading = true;
		try {
			// ส่งข้อมูลไปอัปเดตที่ Backend
            // (ขั้นตอนนี้ Backend ควรจะมี Session Cookie ของ User คนนี้อยู่แล้วจากการล็อกอิน Google)
			const response = await fetch(`${PUBLIC_API_URL}/api/user/setup`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include', 
				body: JSON.stringify({
					name_th: fullName,
					degree_id: selectedDegreeId
				})
			});

			if (response.ok) {
				window.location.href = '/';
			} else {
				alert('เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้ใช้');
			}
		} catch (error) {
			console.error("Setup error:", error);
			alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
		} finally {
			isLoading = false;
		}
	};

</script>

<main class="flex flex-col items-center justify-center min-h-screen bg-linear-to-b from-orange-500 to-orange-100 px-4">

	<div class="w-full max-w-sm">
		<div class="space-y-6 rounded-2xl bg-white p-8 shadow-lg">
			
			{#if isSetupMode}
				<div class="mb-6 text-center">
					<h1 class="mb-2 text-2xl font-bold text-gray-800">ข้อมูลเพิ่มเติม</h1>
					<p class="text-sm text-gray-500">กรุณากรอกข้อมูลสำหรับการลงทะเบียนครั้งแรก</p>
				</div>

				<form onsubmit={handleSetupSubmit} class="flex flex-col gap-4">
					<label class="form-control w-full">
						<div class="label"><span class="label-text font-semibold text-gray-700">ชื่อ-นามสกุล</span></div>
						<input 
							type="text" 
							bind:value={fullName} 
							required 
							class="input input-bordered w-full bg-white text-gray-800" 
							placeholder="เช่น นายสมชาย ใจดี" 
						/>
					</label>

					<div class="form-control w-full relative">
						<div class="label"><span class="label-text font-semibold text-gray-700">หลักสูตร / สาขาวิชา</span></div>
						<input 
							type="text" 
							bind:value={searchDegree} 
							onfocus={() => isDropdownOpen = true}
							oninput={() => { isDropdownOpen = true; selectedDegreeId = ''; }}
							required
							class="input input-bordered w-full bg-white text-gray-800" 
							placeholder="พิมพ์เพื่อค้นหา..." 
						/>
						
						{#if isDropdownOpen && filteredDegrees.length > 0}
							<ul class="absolute top-[85px] z-50 menu p-2 shadow-lg bg-white rounded-box w-full max-h-48 overflow-y-auto border border-gray-200">
								{#each filteredDegrees as degree}
									<li>
										<button 
											type="button" 
											class="text-left text-gray-700 hover:bg-orange-100"
											onclick={() => selectDegree(degree.id, degree.name)}
										>
											{degree.name}
										</button>
									</li>
								{/each}
							</ul>
						{/if}
					</div>

					<button
						type="submit"
						disabled={isLoading || !selectedDegreeId || !fullName}
						class="mt-4 w-full rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					>
						{#if isLoading}
							<span class="loading loading-spinner loading-sm"></span>
							<span>กำลังบันทึก...</span>
						{:else}
							บันทึกข้อมูลและเข้าสู่ระบบ
						{/if}
					</button>
				</form>

			{:else}
				<div class="mb-8 text-center">
					<h1 class="mb-2 text-3xl font-bold text-gray-800">ยินดีต้อนรับ</h1>
					<p class="text-gray-500">เข้าสู่ระบบเพื่อค้นหาเล่มปัญหาพิเศษ</p>
				</div>

				<button
					onclick={handleGoogleLogin}
					disabled={isLoading}
					class="w-full rounded-lg bg-white border-2 border-red-600 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
				>
					{#if isLoading}
						<span class="loading loading-spinner loading-sm"></span>
						<span>กำลังพาไปยัง Google...</span>
					{:else}
						<img src={Google_logo} alt="Google Logo" class="h-5 w-5" />
						<span>เข้าสู่ระบบด้วย Google</span>
					{/if}
				</button>
			{/if}
			
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
