<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { onMount } from 'svelte';
	import { checkAuth } from '$lib/stores/authStore';
	import SearchableDropdown from '$lib/components/SearchableDropdown.svelte';
	import Swal from 'sweetalert2';
	
	// ดึง Role จาก Dynamic Route (/first-login/student หรือ /staff)
	let role = $derived($page.params.role || ''); 
	// ดึง Token จาก URL Query Parameter (?token=...)
	let token = $derived($page.url.searchParams.get('token'));

	// Svelte 5 State Management
	let isLoading = $state(true);
	let isSubmitting = $state(false);
	
	let formData = $state({
		user_name_th: '',
		user_name_en: '',
		student_id: '', 
		degree_id: ''
	});

	let degrees = $state<any[]>([]);

	onMount(async () => {

		if (!token) {
			Swal.fire('ปฏิเสธการเข้าถึง', 'ไม่พบ Token สำหรับการลงทะเบียน', 'error');
			goto('/login');
			return;
		}

		try {
			// 1. ยิง API ดึงข้อมูล User เบื้องต้น
			const userRes = await fetch(`${PUBLIC_API_URL}/auth/first-login/me?token=${token}`);
			if (!userRes.ok) throw new Error('Token ไม่ถูกต้องหรือหมดอายุ');
			const userData = await userRes.json();
			const requestedRole = role.toLowerCase();
			const actualRole = String(userData.role || '').toLowerCase();

			if (actualRole !== requestedRole) {
				Swal.fire('ปฏิเสธการเข้าถึง', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้', 'error');
				goto('/login');
				return;
			}
			
			formData.user_name_th = userData.user_name_th || '';
			formData.user_name_en = userData.user_name_en || '';
			formData.student_id = userData.student_id || '';
			formData.degree_id = userData.degree_id || '';

			// 2. โหลดข้อมูล Degree เฉพาะกรณีที่เป็น Student
			if (actualRole === 'student') {
				const degRes = await fetch(`${PUBLIC_API_URL}/master/degree`);
				if (degRes.ok) {
					degrees = await degRes.json();
				}
			}
		} catch (error) {
			console.error(error);
			alert('เกิดข้อผิดพลาดในการโหลดข้อมูลส่วนตัว กรุณาล็อกอินใหม่อีกครั้ง');
			goto('/');
		} finally {
			isLoading = false;
		}
	});

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		isSubmitting = true;

		// จัดเตรียม Payload ตาม Auth Schema ของ Backend
		const payload = {
			token,
			user_name_th: formData.user_name_th,
			user_name_en: formData.user_name_en,
			...(role === 'student' && { 
                degree_id: formData.degree_id, 
                student_id: formData.student_id 
            })
		};

		try {
			// 3. ส่งข้อมูลกลับไปบันทึกที่ Backend
			const res = await fetch(`${PUBLIC_API_URL}/auth/first-login/complete`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(payload)
			});

			if (!res.ok) throw new Error('บันทึกข้อมูลไม่สำเร็จ');

			await checkAuth();
			Swal.fire({
                    title: 'บันทึกสำเร็จ!',
                    text: 'บันทึกข้อมูลผู้ใช้งาน และเข้าสู่ระบบสำเร็จแล้ว',
                    icon: 'success',
                    confirmButtonColor: '#f97316' // สีส้มให้เข้ากับธีม
                });
			goto('/'); // กลับไปหน้าแรกเมื่อเสร็จสิ้น
		} catch (error) {
			console.error(error);
			Swal.fire('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้ใช้ กรุณาลองใหม่อีกครั้ง', 'error');
		} finally {
			isSubmitting = false;
		}
	};
</script>

<main class="relative flex flex-col items-center justify-center min-h-screen bg-linear-to-b from-orange-500 to-orange-100 px-4">

	<div class="w-full max-w-sm z-10">
		<div class="space-y-6 rounded-2xl bg-white p-8 shadow-lg">
			
			<div class="mb-8 text-center">
				<h1 class="mb-2 text-3xl font-bold text-gray-800">ยินดีต้อนรับ</h1>
				<p class="text-gray-400">กรุณากรอกข้อมูลสำหรับการเข้าสู่ระบบครั้งแรก</p>
			</div>

			{#if isLoading}
				<div class="flex flex-col items-center justify-center gap-4 py-6">
					<span class="loading loading-spinner loading-lg text-orange-500"></span>
					<p class="text-gray-400 font-medium text-sm">กำลังโหลดข้อมูลผู้ใช้งาน...</p>
				</div>
			{:else}
				<form onsubmit={handleSubmit} class="space-y-4">
					<div class="space-y-1">
						<label for="name_th" class="text-sm font-bold text-gray-700 ">ชื่อ-สกุล (ภาษาไทย)</label>
						<input 
							id="name_th" 
							type="text" 
							bind:value={formData.user_name_th} 
							required 
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" 
							placeholder="เช่น สมหญิง รักเรียน"
						/>
					</div>

					<div class="space-y-1">
						<label for="name_en" class="text-sm font-bold text-gray-700">ชื่อ-สกุล (ภาษาอังกฤษ)</label>
						<input 
							id="name_en" 
							type="text" 
							bind:value={formData.user_name_en} 
							required 
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" 
							placeholder="e.g. Somying Rakrian"
						/>
					</div>

					{#if role === 'student'}
						<div class="space-y-1">
							<label for="degree" class="text-sm font-bold text-gray-700">ระดับปริญญา</label>
							<SearchableDropdown 
								bind:value={formData.degree_id} 
								placeholder="-- ค้นหาหลักสูตร --"
								defaultOptionText="-- เลือกหลักสูตร --"
								valueKey="id"
								options={degrees.map(d => ({ id: d.degree_id, label: d.degree_name_th }))}
							/>
						</div>
					{/if}

					<button
						type="submit"
						disabled={isSubmitting}
						class="mt-12 w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					>
						{#if isSubmitting}
							<span class="loading loading-spinner loading-sm"></span>
							<span>กำลังบันทึกข้อมูล...</span>
						{:else}
							<span>บันทึกข้อมูล และเข้าสู่ระบบ</span>
						{/if}
					</button>
				</form>
			{/if}
			
		</div>
	</div>

	<div class="absolute bottom-6 w-full text-center text-xs text-orange-900/60 font-medium">
		<p>ระบบค้นหาเล่มปัญหาพิเศษ</p>
		<p class="mt-1">© 2568 KMITL</p>
	</div>

</main>