<script lang="ts">
	import kmitlLogo from '$lib/assets/Kmitl-logo-navbar.png';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import CardPopular from '$lib/components/CardProjectPopular.svelte';
	import MenuCategory from '$lib/components/MenuCategory.svelte';
	import { PUBLIC_API_URL } from '$env/static/public';

	interface ProjectCard {
        id: string;
        titleThai: string;
        titleEnglish: string;
        keywords: string[];
    }

	interface MenuCategoryItem {
        label: string;
        destination: string;
    }

	let cardsPopular: ProjectCard[] = $state([]);

	const menuCategories: MenuCategoryItem[] = [
		{ label: "คณะวิศวกรรมศาสตร์", destination: "/faculty/engineering" },
		{ label: "คณะวิทยาศาสตร์", destination: "/faculty/science" },
		{ label: "คณะสถาปัตยกรรมศาสตร์", destination: "/faculty/architecture" },
		{ label: "คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี", destination: "/faculty/industrial-education" },
		{ label: "คณะเทคโนโลยีสารสนเทศ", destination: "/faculty/information-technology" },
		{ label: "คณะเทคโนโลยีการเกษตร", destination: "/faculty/agricultural-technology" },
		{ label: "คณะอุตสาหกรรมอาหาร", destination: "/faculty/food-industry" },
		{ label: "คณะบริหารธุรกิจ", destination: "/faculty/business" },
		{ label: "คณะศิลปศาสตร์", destination: "/faculty/liberal-arts" },
		{ label: "คณะแพทยศาสตร์", destination: "/faculty/medicine" },
		{ label: "คณะทันตแพทยศาสตร์", destination: "/faculty/dentistry" },
		{ label: "คณะพยาบาลศาสตร์", destination: "/faculty/Nursing" }
	];

	let isLoading = $state(true);

	$effect(() => {
		async function fetchPopularProjects() {
			try {
				const response = await fetch(`${PUBLIC_API_URL}/projects?sort=downloads&limit=5`);
				if (response.ok) {
					const data = await response.json();
					cardsPopular = data.map((project: any) => ({
						id: project.project_id,
						titleThai: project.title_th,
						titleEnglish: project.title_en,
						keywords: project.keywords || []
					}));
				} else {
					console.error('Failed to fetch popular projects:', response.status);
				}
			} catch (error) {
				console.error('Error fetching popular projects:', error);
			} finally {
				isLoading = false;
			}
		}
		fetchPopularProjects();
	});

</script>

<main class="flex flex-col items-center overflow-x-hidden">

	<section class="w-full bg-linear-to-b from-orange-500 to-orange-700">
		<div class="flex flex-col items-center justify-center gap-7 pt-8 pb-12 px-4 md:px-6 lg:px-10 ">
			<img src={kmitlLogo} alt="KMITL Logo" class="h-35 md:h-42 lg:h-50"/>
			<p class="text-white text-lg md:text-xl lg:text-2xl font-semibold">
				ค้นหาเล่มปัญหาพิเศษ
			</p>
			<SearchBar />
		</div>
	</section>

	<section class="w-full bg-white">
		<div class="flex flex-col gap-10 py-12 px-10 md:px-20 lg:px-30 ">
			<p class="text-black text-lg md:text-xl lg:text-2xl font-semibold">
				ปัญหาพิเศษยอดนิยม
			</p>
			<ul class="flex flex-wrap justify-between">
				{#if isLoading}
					{#each Array(5) as _}
						<div class="w-full max-w-58 h-80 bg-white rounded-xl border border-gray-200 shadow-md px-5 py-4 flex flex-col gap-3 hover:scale-105 transition-transform duration-300 cursor-pointer hover:shadow-lg animate-pulse">
							<div class="h-6 bg-gray-300 rounded-md w-3/4"></div>
							<hr class="border-gray-500"/>
							<div class="h-4 bg-gray-200 rounded-md w-full"></div>
							<div class="h-4 bg-gray-200 rounded-md w-full"></div>
							<hr class="border-gray-500"/>
							<div class="flex flex-col gap-2">
								<div class="h-6 bg-gray-200 rounded-full w-16"></div>
								<div class="h-6 bg-gray-200 rounded-full w-24"></div>
							</div>
						</div>
					{/each}
				{:else}
					{#each cardsPopular.slice(0, 5) as cardPop}
						<CardPopular 
							id={cardPop.id}
							titleThai={cardPop.titleThai}
							titleEnglish={cardPop.titleEnglish}
							keywords={cardPop.keywords}
						/>
					{/each}
				{/if}
			</ul>
		</div>
	</section>

	<section class="w-full bg-orange-700">
		<div class="py-12 px-10 md:px-20 lg:px-30 flex flex-col gap-10">
			<p class="text-white text-lg md:text-xl lg:text-2xl font-semibold">
				ค้นหาโดยคณะ
			</p>
			<div class="flex flex-wrap justify-between">
				{#each menuCategories as menuCategory}
					<MenuCategory 
						label={menuCategory.label} 
						destination={menuCategory.destination} />
				{/each}
			</div>
		</div>
	</section>
</main>
