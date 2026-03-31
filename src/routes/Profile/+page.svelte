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
	}

	interface ApiUserProject {
		projectId: string;
		titleThai: string;
		titleEnglish: string;
		facultyName: string;
		departmentName: string;
		authors?: { author_name_th: string }[];
		advisors?: { advisor_name_th: string }[];
		academicYear: string;
		keywords?: { keyword_text_th: string }[];
	}

	let profileData = $state<StudentProfile | null>(null);
	let userProjects: UserProject[] = $state([]);
	let isLoading = $state(true);
/*
	let profileData = $state<StudentProfile>({
		studentIdText: '65050702',
		studentName: 'ภูมิพิรัฐ รักษากิจ', 
		programText: 'วิทยาศาสตร์บัณฑิต (วิทยาการคอมพิวเตอร์)', 
		faculty: 'วิทยาศาสตร์', 
		department: 'วิทยาการคอมพิวเตอร์', 
		email: '65050702@kmitl.ac.th',
	});
*/
	$effect(() => {
		const fetchProfileAndProject = async () => {
			isLoading = true;
			try {
				const profileRes = await fetch(`${PUBLIC_API_URL}/api/users`, {
					credentials: 'include' 
				});
				if (profileRes.ok) {
					profileData = await profileRes.json();
				}

				const projectRes = await fetch(`${PUBLIC_API_URL}/api/users/project`, {
					credentials: 'include'
				});
				if (projectRes.ok) {
					//userProject = await projectRes.json();
					const data: ApiUserProject[] = await projectRes.json();
                    userProjects = data.map((project) => ({
                        projectId: project.projectId,
                        titleThai: project.titleThai,
                        titleEnglish: project.titleEnglish,
                        facultyName: project.facultyName,
                        departmentName: project.departmentName,
                        authors: project.authors ? project.authors.map((a) => a.author_name_th) : [],
                        advisors: project.advisors ? project.advisors.map((a) => a.advisor_name_th) : [],
						academicYear: project.academicYear,
                        keywords: project.keywords ? project.keywords.map((k) => k.keyword_text_th) : []
					}));
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

<div class="bg-white min-h-screen">
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
					<p class="text-sm md:text-base lg:text-base font-normal">หลักสูตร <span class="font-semibold">{formatValue(profileData?.degree)}</span></p>

					<div class="flex flex-wrap gap-x-16 gap-y-2 mb-4 text-sm md:text-base lg:text-base font-normal">
						<div>คณะ <span class="font-semibold">{formatValue(profileData?.faculty)}</span></div>
						<div>ภาควิชา <span class="font-semibold">{formatValue(profileData?.department)}</span></div>
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
				{#if !userProjects.length}
					<button 
						onclick={handleUpload}
						class="btn btn-md bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full px-8 shadow-sm border-none cursor-pointer">
						Upload
					</button>
				{/if}
			</div>

			{#if isLoading}
				<div class="flex justify-center items-center py-20">
					<span class="loading loading-spinner loading-lg text-orange-500"></span>
				</div>
			{:else if userProjects.length}
				{#each userProjects as userProject (userProject.projectId)}
					<div class="w-full shrink-0 flex flex-col justify-center">
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
						/>
					</div>
				{/each}
			{:else}
				<div class="bg-gray-50 border border-gray-200 rounded-2xl">
					<p class="text-center text-gray-400 p-12 italic text-lg md:text-xl font-semibold">
						ไม่มีโปรเจคในขณะนี้ กดปุ่ม Upload เพื่อเพิ่มโปรเจคของคุณ.
					</p>
				</div>
			{/if}
		</section>
		
	</div>
</div>