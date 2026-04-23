<script lang="ts">
	import { goto } from '$app/navigation';
	import { Mail } from 'lucide-svelte';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { authStore } from '$lib/stores/authStore';
	import CardProjectDetail from '$lib/components/CardProjectDetail.svelte';
	import ProfileInfo from '$lib/components/ProfileInfo.svelte';
	
	interface StudentProfile {
		studentId: string | null;
		studentName: string;
		degree: string | null;
		faculty: string | null;
		department: string | null;
		email: string;
	}

	interface UserProject {
		projectId: string;
		titleThai: string;
		titleEnglish: string;
		facultyName: string;
		departmentName: string;
		authors: string[];
		advisors: string[];
		academicYear: string;
		keywords: string[];
		thumbnail?: string | null;
		downloadCount: number;
	}

	let profileData = $state<StudentProfile | null>(null);
	let userProjects = $state<UserProject[]>([]);
	let isLoading = $state(true);

	$effect(() => {

		if (!$authStore.user) return;
		
		// ดึงข้อมูลโปรไฟล์และรายการโปรเจกต์ของผู้ใช้เมื่อหน้าโหลด
		const fetchProfileAndProject = async () => {
			isLoading = true;
			try {
				const profileRes = await fetch(`${PUBLIC_API_URL}/auth/me`, {
					credentials: 'include' 
				});

				if (profileRes.ok) {
					const data = await profileRes.json();
					profileData = {
						...data,
						studentName: data.studentName || data.studentName
					};

					if (profileData?.studentId && $authStore.user?.role === 'student') {
						const projectRes = await fetch(`${PUBLIC_API_URL}/project/search?search=${profileData.studentId}&order=asc`, {
							credentials: 'include'
						});

						if (projectRes.ok) {
							const responseData = await projectRes.json();
							const data = responseData.data || [];

							userProjects = data.map((item: any) => ({
								projectId: item.project?.project_id,
								titleThai: item.project?.title_th ?? '-',
								titleEnglish: item.project?.title_en ?? '-',
								facultyName: item.faculty?.faculty_name_th ?? "-",
								departmentName: item.department?.department_name_th ?? "-",
								authors: item.users?.map((u: any) => u.user_name_th) ?? [],
								advisors: item.advisors?.map((a: any) => a.advisor_name_th) ?? [],
								academicYear: item.project?.academic_year_be ?? '-',
								keywords: item.keywords?.map((k: any) => k.keyword_text_th) ?? [],
								thumbnail: item.project_file?.thumbnail_path ?? null,
								downloadCount: item.project?.downloaded_count ?? 0
							}));
						}
					}
				} else {
					goto('/login');
				}
			} catch (error) {
				console.error('Error fetching profile data:', error);
			} finally {
				isLoading = false;
			}
		};

		fetchProfileAndProject();
	});

	const handleUpload = () => {
		// ไปยังหน้าสำหรับอัปโหลดโปรเจกต์ใหม่
		goto('/upload-project');
	};

	const handleEditProject = (projectId: string) => {
		goto(`/edit-project?id=${projectId}`);	
	};
</script>

<div class="bg-white min-h-screen text-black">
    <div class="container mx-auto py-10 md:py-12 px-4 md:px-8 max-w-6xl">
		
		<section class="mb-12 md:mb-16">
			<div class="border-b border-gray-400 pb-4 md:pb-6 mb-6 md:mb-8">
				<p class="text-xl md:text-2xl lg:text-3xl font-semibold">My Profile</p>
			</div>

			{#if isLoading}
				<div class="flex flex-col gap-4 border border-gray-200 bg-white rounded-3xl p-6 md:p-9 shadow-sm animate-pulse">
                    <div class="h-4 w-24 bg-gray-200 rounded"></div>
                    <div class="h-8 w-48 md:w-64 bg-gray-200 rounded"></div>
                    <div class="h-5 w-40 md:w-56 bg-gray-200 rounded"></div>
                    
                    <div class="flex flex-col sm:flex-row gap-4 sm:gap-16 mt-2">
                        <div class="h-5 w-32 bg-gray-200 rounded"></div>
                        <div class="h-5 w-40 bg-gray-200 rounded"></div>
                    </div>
                    
                    <hr class="border-t border-gray-100 my-2" />
                    
                    <div class="flex gap-3 items-center">
                        <div class="w-5 h-5 bg-gray-200 rounded-full"></div>
                        <div class="h-5 w-48 bg-gray-200 rounded"></div>
                    </div>
                </div>
			{:else}
				<ProfileInfo {profileData} role={$authStore.user?.role} />
			{/if}
		</section>

		{#if $authStore.user?.role === 'student'}
			<section>
				<!-- ส่วนแสดงโปรเจกต์ของผู้ใช้ -->
				<div class="flex items-center justify-between border-b border-gray-400 pb-4 md:pb-6 mb-6 md:mb-8">
					<p class="text-xl md:text-2xl lg:text-3xl font-semibold">My Project</p>
					<button 
						onclick={handleUpload}
						class="btn btn-sm md:btn-md bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full px-6 md:px-8 shadow-sm border-none cursor-pointer transition-transform active:scale-95"
					>
						Upload
					</button>
				</div>

				{#if isLoading}
					<!-- โครงร่างระหว่างรอข้อมูลโปรเจกต์ -->
					<div class="flex flex-col gap-6">
						{#each Array(2) as _}
							<div class="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row gap-6 animate-pulse">
								<div class="w-full md:w-32 lg:w-40 h-48 md:h-auto bg-gray-200 rounded-lg shrink-0"></div>
								<div class="flex flex-col gap-3 grow py-2 justify-center w-full">
									<div class="flex flex-wrap gap-2">
										<div class="w-16 h-5 bg-orange-100/50 rounded-full"></div>
										<div class="w-20 h-5 bg-orange-100/50 rounded-full"></div>
									</div>
									<div class="w-full md:w-3/4 h-5 bg-gray-200 rounded mt-1"></div>
									<div class="w-1/2 h-4 bg-gray-200 rounded"></div>
									<div class="w-full h-px bg-gray-100 my-2"></div>
									<div class="w-1/3 h-4 bg-gray-200 rounded"></div>
								</div>
							</div>
						{/each}
					</div>
				{:else if userProjects.length}
					<!-- วนแสดงรายการโปรเจกต์ของผู้ใช้ -->
					<div class="flex flex-col gap-6">
						{#each userProjects as userProject (userProject.projectId)}
							<div class="w-full shrink-0">
								<CardProjectDetail 
									id={userProject.projectId}
									faculty={userProject.facultyName}
									department={userProject.departmentName}
									titleThai={userProject.titleThai}
									titleEnglish={userProject.titleEnglish}
									author={userProject.authors}
									advisor={userProject.advisors}
									semester={userProject.academicYear}
									keywords={userProject.keywords}
									thumbnail={userProject.thumbnail}
									downloadCount={userProject.downloadCount}
									showEdit={true}
									onEdit={handleEditProject}
								/>
							</div>
						{/each}
					</div>
				{:else}
					<!-- กรณีผู้ใช้ยังไม่มีโปรเจกต์ในระบบ -->
					<div class="bg-white border border-gray-200 rounded-2xl shadow-sm">
						<p class="text-center text-gray-400 p-12 lg:p-20 text-base md:text-lg font-medium flex flex-col items-center gap-3">
							<svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
							</svg>
							ไม่มีโปรเจกต์ในขณะนี้<br/>
							<span class="text-sm font-normal text-gray-400 mt-1">กดปุ่ม Upload ด้านบนเพื่อเพิ่มโปรเจกต์ของคุณเข้าสู่ระบบ</span>
						</p>
					</div>
				{/if}
			</section>
		{/if}
	</div>
</div>