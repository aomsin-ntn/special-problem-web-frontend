<script lang="ts">
	import { Mail } from 'lucide-svelte';


	let { profileData, role } = $props<{ 
		profileData: any, 
		role: string | undefined 
	}>();

	const formatValue = (value: string | null | undefined) => {
		return value ? value : '-';
	};
</script>

<div class="flex flex-col gap-4 border border-gray-200 bg-white rounded-3xl p-6 md:p-9 shadow-sm hover:shadow-md transition-shadow">
	{#if role === 'student'}
		<p class="text-xs md:text-sm font-medium text-black tracking-wide">{formatValue(profileData?.studentId)}</p>
		<h2 class="text-xl md:text-2xl font-bold text-black">{formatValue(profileData?.studentName)}</h2>
		<p class="text-sm md:text-base font-bold text-black">
			หลักสูตร <span class="font-medium text-gray-700">{formatValue(profileData?.degree)}</span>
		</p>

		<div class="flex flex-col sm:flex-row gap-y-2 gap-x-6 md:gap-x-16 mb-2 text-sm md:text-base font-bold text-gray-800">
			<div>คณะ <span class="font-medium text-black">{formatValue(profileData?.faculty)}</span></div>
			<div>ภาควิชา <span class="font-medium text-black">{formatValue(profileData?.department)}</span></div>
		</div>
	{:else}
        <h2 class="text-xl md:text-2xl font-bold text-black">{formatValue(profileData?.studentName)} </h2>
        
        <p class="text-sm md:text-base font-bold text-black">
			หลักสูตร <span class="font-medium text-gray-700">-</span>
		</p>

		<div class="flex flex-col sm:flex-row gap-y-2 gap-x-6 md:gap-x-16 mb-2 text-sm md:text-base font-bold text-gray-800">
			<div>คณะ <span class="font-medium text-black">-</span></div>
			<div>ภาควิชา <span class="font-medium text-black">-</span></div>
		</div>
	{/if}

	<hr class="border-t border-gray-500 my-2" />

	<div class="flex items-center gap-3 text-sm md:text-base text-gray-700">
		<Mail class="w-5 h-5 text-gray-400 shrink-0" />
		<p>{formatValue(profileData?.email)}</p>
	</div>
</div>