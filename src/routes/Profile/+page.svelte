<script lang="ts">
	import { goto } from '$app/navigation';
	import { Mail } from 'lucide-svelte';
	
	interface StudentProfile {
		studentIdText: string;
		studentName: string;
		programText: string;
		faculty: string;
		department: string;
		email: string;
	}

	let profileData = $state<StudentProfile>({
		studentIdText: '65050702',
		studentName: 'ภูมิพิรัฐ รักษากิจ', 
		programText: 'วิทยาศาสตร์บัณฑิต (วิทยาการคอมพิวเตอร์)', 
		faculty: 'วิทยาศาสตร์', 
		department: 'วิทยาการคอมพิวเตอร์', 
		email: '65050702@kmitl.ac.th',
	});

	const handleUpload = () => {
		goto('/upload-project');
	};
</script>

<div class="bg-white min-h-screen">
	<div class="container mx-auto py-12 max-w-6xl">
		
		<section class="mb-16">
			<div class="border-b border-black pb-6 mb-8">
				<p class="text-xl md:text-2xl lg:text-3xl font-semibold text-black">My Profile</p>
			</div>

			<div class="flex flex-col gap-4 mb-8 border-2 border-black bg-white rounded-3xl p-9">
				<p class="text-sm md:text-sm lg:text-sm font-light text-black">{profileData.studentIdText}</p>
				<p class="text-base md:text-lg lg:text-xl font-semibold text-black">{profileData.studentName}</p>
				<p class="text-sm md:text-base lg:text-base font-normal text-black">หลักสูตร <span>{profileData.programText}</span></p>

				<div class="flex gap-x-16 mb-4 text-sm md:text-base lg:text-base font-normal text-black">
					<div>คณะ <span class="font-normal">{profileData.faculty}</span></div>
					<div>ภาควิชา <span class="font-normal">{profileData.department}</span></div>
				</div>

				<hr class="border-t border-black " />

				<div class="flex items-center gap-4 text-sm md:text-base lg:text-base font-normal text-black">
					<Mail class="w-5 h-5" />
					<p>{profileData.email}</p>
				</div>
			</div>
		</section>

		<section>
			<div class="flex items-center justify-between border-b border-black pb-6 mb-8">
				<p class="text-xl md:text-2xl lg:text-3xl font-semibold text-black">My Project</p>
				<button 
					onclick={handleUpload}
					class="btn btn-md bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full px-8 shadow-sm border-none">
					Upload
				</button>
			</div>

			
			<div>
				<p class="text-center text-gray-300 p-12 italic text-lg md:text-xl lg:text-2xl font-semibold">
					ไม่มีโปรเจคในขณะนี้ กดปุ่ม Upload เพื่อเพิ่มโปรเจคของคุณ.
				</p>
			</div>
		</section>
		
	</div>
</div>