<script lang="ts">
	import { goto } from '$app/navigation';
	import { Mail } from 'lucide-svelte';
	import { PUBLIC_API_URL } from '$env/static/public';
	import CardProjectDetail from '$lib/components/CardProjectDetail.svelte';

	const formatValue = (value: string | null | undefined) => {
		return value ? value : '-';
	};
	
	interface StudentProfile {
		studentId: string;
		studentName: string;
		degree: string;
		faculty: string;
		department: string;
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
	}

	let profileData = $state<StudentProfile | null>(null);
	let userProjects: UserProject[] = $state([]);
	let isLoading = $state(true);

	$effect(() => {
		const fetchProfileAndProject = async () => {
			isLoading = true;
			try {
				const profileRes = await fetch(`${PUBLIC_API_URL}/auth/me`, {
					credentials: 'include' 
				});
				if (profileRes.ok) {
					profileData = await profileRes.json();
				}

				if (profileData?.studentId) {
					const projectRes = await fetch(`${PUBLIC_API_URL}/project/?search=${profileData?.studentId}&order=asc`, {
						credentials: 'include'
					});

					if (projectRes.ok) {
						const responseData = await projectRes.json();
						const data = responseData.data || [];

						userProjects = data.map((item: any) => ({
							projectId: item.project.project_id,
							titleThai: item.project.title_th,
							titleEnglish: item.project.title_en,
							facultyName: item.faculty?.faculty_name_th || "-",
							departmentName: item.department?.department_name_th || "-",
							authors: item.users?.map((u: any) => u.user_name_th) || [],
							advisors: item.advisors?.map((a: any) => a.advisor_name_th) || [],
							academicYear: item.project.academic_year,
							keywords: item.keywords?.map((k: any) => k.keyword_text_th) || [],
							thumbnail: item.project.thumbnail || null
						}));
						console.log(userProjects);
					}
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
		goto('/upload-project');
	};

</script>

<div class="bg-white min-h-screen text-black">
	<div class="container mx-auto py-12 max-w-6xl">
		
		<section class="mb-16">
			<div class="border-b border-black pb-6 mb-8">
				<p class="text-xl md:text-2xl lg:text-3xl font-semibold">My Profile</p>
			</div>

			{#if isLoading}
				<div class="flex flex-col gap-4 mb-8 border-2 border-gray-200 bg-gray-50 rounded-3xl p-9 animate-pulse h-48"></div>
			{:else}
				<div class="flex flex-col gap-4 mb-8 border-2 border-black bg-white rounded-3xl p-9 shadow-sm">
					<p class="text-sm md:text-sm lg:text-sm font-light">{formatValue(profileData?.studentId)}</p>
					<p class="text-base md:text-lg lg:text-xl font-semibold">{formatValue(profileData?.studentName)}</p>
					<p class="text-sm md:text-base lg:text-base font-semibold">หลักสูตร <span class="font-normal">{formatValue(profileData?.degree)}</span></p>

					<div class="flex flex-wrap gap-x-16 gap-y-2 mb-4 text-sm md:text-base lg:text-base font-semibold">
						<div>คณะ <span class="font-normal">{formatValue(profileData?.faculty)}</span></div>
						<div>ภาควิชา <span class="font-normal">{formatValue(profileData?.department)}</span></div>
					</div>

					<hr class="border-t border-black " />

					<div class="flex items-center gap-4 text-sm md:text-base lg:text-base font-normal">
						<Mail class="w-5 h-5" />
						<p>{formatValue(profileData?.email)}</p>
					</div>
				</div>
			{/if}
		</section>

		<section>
			<div class="flex items-center justify-between border-b border-black pb-6 mb-8">
				<p class="text-xl md:text-2xl lg:text-3xl font-semibold">My Project</p>
				<button 
					onclick={handleUpload}
					class="btn btn-md bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full px-8 shadow-sm border-none cursor-pointer">
					Upload
				</button>
			</div>

			{#if isLoading}
				<div class="flex justify-center items-center py-20">
					<span class="loading loading-spinner loading-lg text-orange-500"></span>
				</div>
			{:else if userProjects.length}
				{#each userProjects as userProject (userProject.projectId)}
					<div class="w-full shrink-0 flex flex-col justify-center mb-6">
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
						/>
					</div>
				{/each}
			{:else}
				<div class="bg-white">
					<p class="text-center text-gray-400 p-12 italic text-lg md:text-xl font-semibold">
						ไม่มีโปรเจคในขณะนี้ กดปุ่ม Upload เพื่อเพิ่มโปรเจคของคุณ.
					</p>
				</div>
			{/if}
		</section>
		
	</div>
</div>