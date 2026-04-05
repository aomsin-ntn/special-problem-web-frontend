<script lang="ts">
	import { goto } from '$app/navigation';
	import { Mail } from 'lucide-svelte';
	import { PUBLIC_API_URL } from '$env/static/public';
	import CardProjectDetail from '$lib/components/CardProjectDetail.svelte';
	import Swal from 'sweetalert2';

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
		downloadCount: number;
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
							thumbnail: item.project_file?.thumbnail_path || null,
							downloadCount: item.project.downloaded_count || 0
						}));
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

	const handleDeleteProject = async (projectId: string) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบโปรเจกต์?',
            text: "ข้อมูลโปรเจกต์นี้จะถูกลบและไม่สามารถกู้คืนได้",
            icon: 'warning',
            showCancelButton: true,
			cancelButtonColor: '#3085d6',
            confirmButtonColor: '#d33',
			cancelButtonText: 'ยกเลิก',
            confirmButtonText: 'ยืนยันลบ',
			reverseButtons: true
        });
        if (result.isConfirmed) {
            try {
                const response = await fetch(`${PUBLIC_API_URL}/project/delete?project_id=${projectId}`, {
                    method: 'PATCH',
    				credentials: 'include'
				});

                if (!response.ok) throw new Error('Failed to delete project');

                userProjects = userProjects.filter(p => p.projectId !== projectId);

                Swal.fire({
                    title: 'ลบสำเร็จ',
                    text: 'โปรเจกต์ของคุณถูกลบออกจากระบบแล้ว',
                    icon: 'success',
                    confirmButtonColor: '#FF8D00'
                });

            } catch (error) {
                console.error('Error deleting project:', error);
                Swal.fire({
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถลบโปรเจกต์ได้ในขณะนี้',
                    icon: 'error',
                    confirmButtonColor: '#FF8D00'
                });
            }
        }
    };

</script>

<div class="bg-white min-h-screen text-black">
	<div class="container mx-auto py-12 max-w-6xl">
		
		<section class="mb-16">
			<div class="border-b border-gray-400 pb-6 mb-8">
				<p class="text-xl md:text-2xl lg:text-3xl font-semibold">My Profile</p>
			</div>

			{#if isLoading}
                <div class="flex flex-col gap-4 mb-8 border-2 border-gray-200 bg-gray-50 rounded-3xl p-5 md:p-9 animate-pulse h-48"></div>
			{:else}
				<div class="flex flex-col gap-4 mb-8 border border-gray-200 bg-white rounded-3xl p-5 md:p-9 shadow-sm">
					<p class="text-xs md:text-sm font-medium text-black">{formatValue(profileData?.studentId)}</p>
					<h2 class="text-xl md:text-2xl font-bold text-black">{formatValue(profileData?.studentName)}</h2>
					<p class="text-sm md:text-base font-bold text-gray-200">หลักสูตร <span class="font-medium text-gray-300">{formatValue(profileData?.degree)}</span></p>

                    <div class="flex flex-col sm:flex-row gap-y-2 gap-x-6 md:gap-x-16 mb-2 text-sm md:text-base font-bold text-gray-200">
						<div>คณะ <span class="font-medium text-gray-300">{formatValue(profileData?.faculty)}</span></div>
						<div>ภาควิชา <span class="font-medium text-gray-300">{formatValue(profileData?.department)}</span></div>
					</div>

					<hr class="border-t border-gray-100 my-2" />

					<div class="flex items-center gap-3 text-sm md:text-base text-gray-200">
						<Mail class="w-5 h-5 text-gray-200 shrink-0" />
						<p>{formatValue(profileData?.email)}</p>
					</div>
				</div>
			{/if}
		</section>

		<section>
			<div class="flex items-center justify-between border-b border-gray-400 pb-6 mb-8">
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
							downloadCount={userProject.downloadCount}
							showDelete={true}
							onDelete={handleDeleteProject}
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