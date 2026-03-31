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

    interface ApiProject {
        project_id: string;
        title_th: string;
        title_en: string;
        keywords?: { keyword_text_th: string }[];
    }

	let cardsPopular: ProjectCard[] = $state([]);
	let currentPage = $state(0);
	let touchStartX = 0;
	let touchEndX = 0;
	let isTransitioning = $state(false);

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
				const response = await fetch(`${PUBLIC_API_URL}/project/most_downloaded`);
				if (response.ok) {
					const data: ApiProject[] = await response.json();
                    cardsPopular = data.map((project) => ({
                        id: project.project_id,
                        titleThai: project.title_th,
                        titleEnglish: project.title_en,
                        keywords: project.keywords ? project.keywords.map((k) => k.keyword_text_th) : []
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

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
	}

	function handleTouchEnd(e: TouchEvent) {
		touchEndX = e.changedTouches[0].clientX;
		handleSwipe();
	}

	function handleSwipe() {
		const swipeThreshold = 50;
		const diff = touchStartX - touchEndX;

		if (Math.abs(diff) > swipeThreshold) {
			if (diff > 0) {
				// Swiped left - next page
				nextPage();
			} else {
				// Swiped right - previous page
				prevPage();
			}
		}
	}

	function nextPage() {
		const maxPage = Math.ceil(cardsPopular.length / 1) - 1;
		if (currentPage < maxPage) {
			isTransitioning = true;
			currentPage++;
			setTimeout(() => {
				isTransitioning = false;
			}, 300);
		}
	}

	function prevPage() {
		if (currentPage > 0) {
			isTransitioning = true;
			currentPage--;
			setTimeout(() => {
				isTransitioning = false;
			}, 300);
		}
	}

	function goToPage(page: number) {
		isTransitioning = true;
		currentPage = page;
		setTimeout(() => {
			isTransitioning = false;
		}, 300);
	}

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
			
			<!-- Carousel Container -->
			<div class="flex justify-center w-full relative flex-col items-center">
				<div class="w-full max-w-6xl py-2 px-4">
					<div 
						class="relative overflow-visible rounded-xl"
						role="region"
						aria-label="Popular projects carousel"
						ontouchstart={(e) => handleTouchStart(e as TouchEvent)}
						ontouchend={(e) => handleTouchEnd(e as TouchEvent)}
					>
						<div 
							class="flex transition-transform duration-300 ease-out"
							style="transform: translateX(-{currentPage * 100}%)"
						>
							{#if isLoading}
								{#each Array(5) as _, idx (idx)}
									<div class="w-full shrink-0 flex justify-center">
										<div class="w-full max-w-72 h-80 bg-white rounded-xl border border-gray-200 shadow-md px-5 py-4 flex flex-col gap-3 animate-pulse">
											<div class="h-4 bg-gray-300 rounded-md w-3/4"></div>
											<hr class="border-gray-500"/>
											<div class="h-6 bg-gray-200 rounded-md w-full"></div>
											<div class="h-4 bg-gray-200 rounded-md w-full"></div>
											<hr class="border-gray-500"/>
											<div class="flex flex-col gap-2">
												<div class="h-4 bg-gray-200 rounded-full w-16"></div>
												<div class="h-4 bg-gray-200 rounded-full w-24"></div>
											</div>
										</div>
									</div>
								{/each}
							{:else}
								{#each cardsPopular as cardPop (cardPop.id)}
									<div class="w-full shrink-0 flex justify-center">
										<div class="w-full max-w-72">
											<CardPopular 
												id={cardPop.id}
												titleThai={cardPop.titleThai}
												titleEnglish={cardPop.titleEnglish}
												keywords={cardPop.keywords}
											/>
										</div>
									</div>
								{/each}
							{/if}
						</div>
					</div>

					{#if cardsPopular.length > 1}
                        <div class="absolute top-[40%] -translate-y-1/2 w-full px-0 md:-px-4 pointer-events-none z-10">
                            
                            <button
                                onclick={prevPage}
                                disabled={currentPage === 0}
                                class="absolute left-0 md:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white border border-gray-200 text-orange-600 rounded-full shadow-lg disabled:opacity-0 disabled:cursor-not-allowed hover:bg-orange-50 hover:scale-110 transition-all pointer-events-auto"
                                aria-label="Previous slide"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                </svg>
                            </button>
                            
                            <button
                                onclick={nextPage}
                                disabled={currentPage === cardsPopular.length - 1}
                                class="absolute right-0 md:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white border border-gray-200 text-orange-600 rounded-full shadow-lg disabled:opacity-0 disabled:cursor-not-allowed hover:bg-orange-50 hover:scale-110 transition-all pointer-events-auto"
                                aria-label="Next slide"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>
                        </div>
                    {/if}

					<!-- Pagination Dots -->
					{#if !isLoading && cardsPopular.length > 0}
						<div class="flex justify-center gap-2 mt-8">
							{#each Array(cardsPopular.length) as _, index (index)}
								<button
									onclick={() => goToPage(index)}
									class="w-3 h-3 rounded-full transition-all duration-300 {index === currentPage ? 'bg-orange-500 w-8' : 'bg-gray-300 hover:bg-gray-400'}"
									aria-label="Go to slide {index + 1}"
								></button>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<section class="w-full bg-orange-700">
		<div class="py-12 px-10 md:px-20 lg:px-30 flex flex-col gap-10">
			<p class="text-white text-lg md:text-xl lg:text-2xl font-semibold">
				ค้นหาโดยคณะ
			</p>
			<div class="flex flex-wrap justify-between">
				{#each menuCategories as menuCategory (menuCategory.destination)}
					<MenuCategory 
						label={menuCategory.label} 
						destination={menuCategory.destination} />
				{/each}
			</div>
		</div>
	</section>
</main>
