<script lang="ts">
	import kmitlLogo from '$lib/assets/Kmitl-logo-navbar.png';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import CardPopular from '$lib/components/CardProjectPopular.svelte';
	import MenuCategory from '$lib/components/MenuCategory.svelte';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	interface ProjectCard {
        id: string;
		departments?: string[];
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
		departments?: { department_name_th: string }[];
        title_th: string;
        title_en: string;
        keywords?: { keyword_text_th: string }[];
    }

	let cardsPopular = $state<ProjectCard[]>([]);
	let menuCategories = $state<MenuCategoryItem[]>([]);
	let isLoadingPopular = $state(true);
	let isLoadingCategories = $state(true);

	let scrollContainer = $state<HTMLElement | null>(null);

	let isAtStart = $state(true);
	let isAtEnd = $state(false);

	$effect(() => {
		// ดึงข้อมูลปัญหาพิเศษยอดนิยมและรายชื่อคณะเมื่อหน้าโหลด
		async function fetchPopularProjects() {
			try {
				const response = await fetch(`${PUBLIC_API_URL}/project/most_downloaded`);
				if (response.ok) {
					const data: ApiProject[] = await response.json();
                    cardsPopular = data.map((project) => ({
                        id: project.project_id,
                        titleThai: project.title_th,
                        titleEnglish: project.title_en,
                        keywords: project.keywords ? project.keywords.map((k) => k.keyword_text_th) : [],
						departments: project.departments ? project.departments.map((d) => d.department_name_th) : []
					}));
				} else {
					console.error('Failed to fetch popular projects:', response.status);
				}
			} catch (error) {
				console.error('Error fetching popular projects:', error);
			} finally {
				isLoadingPopular = false;
			}
		}

		async function fetchMenuCategories() {
			try {
				const response = await fetch(`${PUBLIC_API_URL}/master/faculty`);
				if (response.ok) {
					const data = await response.json();
					menuCategories = data.map((item: any) => ({
						label: item.faculty_name_th,
						destination: `search?faculty=${item.faculty_id}`
					}));
				} else {
					console.error('Failed to fetch menu categories:', response.status);
				}
			} catch (error) {
				console.error('Error fetching menu categories:', error);
			} finally {
				isLoadingCategories = false;
			}
		}
		fetchPopularProjects();
		fetchMenuCategories();
	});

	$effect(() => {
		if (scrollContainer && !isLoadingPopular && cardsPopular.length > 0) {
			// ตรวจสถานะปุ่มเลื่อนหลังจากรายการพร้อมแสดงผล
			setTimeout(handleScroll, 100); 
		}
	});

	function handleScroll() {
		if (scrollContainer) {
			const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
			isAtStart = scrollLeft <= 2; 
			isAtEnd = scrollLeft + clientWidth >= scrollWidth - 2; 
		}
	}

	function scrollLeft() {
		if (scrollContainer) {
			// เลื่อนรายการไปทางซ้ายตามขนาดหน้าจอ
            const scrollAmount = window.innerWidth < 768 ? 280 : 320;
			scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
		}
	}

	function scrollRight() {
		if (scrollContainer) {
			// เลื่อนรายการไปทางขวาตามขนาดหน้าจอ
            const scrollAmount = window.innerWidth < 768 ? 280 : 320;
			scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
		}
	}
</script>

<svelte:window onresize={handleScroll} />

<main class="flex flex-col items-center overflow-x-hidden">

	<section class="w-full bg-linear-to-b from-orange-500 to-orange-700">
		<!-- ส่วนแบนเนอร์หลักและช่องค้นหาด้านบน -->
		<div class="flex flex-col items-center justify-center gap-6 pt-10 pb-16 px-4 md:px-6 lg:px-10">
			<img src={kmitlLogo} alt="KMITL Logo" class="h-28 sm:h-36 md:h-44 lg:h-52 object-contain" />
			<h1 class="text-white text-xl md:text-2xl lg:text-3xl font-bold text-center tracking-wide">
				ค้นหาเล่มปัญหาพิเศษ
			</h1>
            <div class="w-full max-w-2xl mt-2">
			    <SearchBar />
            </div>
		</div>
	</section>

	<section class="w-full bg-white py-12 md:py-16">
		<!-- ส่วนแสดงปัญหาพิเศษยอดนิยมแบบเลื่อนซ้ายขวา -->
		<div class="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 flex flex-col gap-8">
            
            <div class="flex justify-between items-end">
                <h2 class="text-black text-xl md:text-2xl lg:text-3xl font-bold">
                    ปัญหาพิเศษยอดนิยม
                </h2>
                
                {#if !isLoadingPopular && cardsPopular.length > 0}
                    <div class="hidden md:flex gap-3">
						<button type="button" onclick={scrollLeft} disabled={isAtStart} class="p-2 rounded-full border-2 border-gray-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-colors bg-transparent disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer" aria-label="เลื่อนซ้าย">
                            <ChevronLeft class="w-6 h-6" />
                        </button>
                        <button type="button" onclick={scrollRight} disabled={isAtEnd} class="p-2 rounded-full border-2 border-gray-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-colors bg-transparent disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer" aria-label="เลื่อนขวา">
                            <ChevronRight class="w-6 h-6" />
                        </button>
                    </div>
                {/if}
            </div>
			
			<div class="relative w-full -mx-6 px-6 md:mx-0 md:px-0">
                
                {#if !isLoadingPopular && cardsPopular.length > 0}
                    <div class="md:hidden absolute left-0 top-0 bottom-0 w-20 bg-linear-to-r from-white via-white/80 to-transparent z-10 pointer-events-none flex items-center justify-start transition-opacity duration-300 pb-4 {isAtStart ? 'opacity-0' : 'opacity-100'}">
                        <button 
                            type="button"
                            onclick={scrollLeft} 
							disabled={isAtStart}
                            class="pointer-events-auto ml-2 bg-white text-orange-500 rounded-full p-2 shadow-md border border-gray-100 active:bg-orange-50 active:scale-95 transition-all flex items-center justify-center {isAtStart ? 'cursor-default' : 'cursor-pointer'}"
                            aria-label="เลื่อนซ้าย"
                        >
                            <ChevronLeft class="w-5 h-5"/>
                        </button>
                    </div>

                    <div class="md:hidden absolute right-0 top-0 bottom-0 w-20 bg-linear-to-l from-white via-white/80 to-transparent z-10 pointer-events-none flex items-center justify-end transition-opacity duration-300 pb-4 {isAtEnd ? 'opacity-0' : 'opacity-100'}">
                        <button 
                            type="button"
                            onclick={scrollRight} 
							disabled={isAtEnd}
                            class="pointer-events-auto mr-2 bg-white text-orange-500 rounded-full p-2 shadow-md border border-gray-100 active:bg-orange-50 active:scale-95 transition-all flex items-center justify-center {isAtEnd ? 'cursor-default' : 'cursor-pointer'}"
                            aria-label="เลื่อนขวา"
                        >
                            <ChevronRight class="w-5 h-5"/>
                        </button>
                    </div>
                {/if}

				<div 
                    bind:this={scrollContainer}
					onscroll={handleScroll}
                    class="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-6 pt-2"
                    style="scrollbar-width: none; -ms-overflow-style: none;"
                >
                    {#if isLoadingPopular}
                        {#each Array(4) as _}
                            <div class="snap-start shrink-0 w-65 md:w-70 lg:w-75 h-85 bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-5 flex flex-col gap-4 animate-pulse">
                                <div class="w-20 h-6 bg-gray-200 rounded-full"></div>
                                <div class="w-full h-px bg-gray-100"></div>
                                <div class="flex flex-col gap-2 grow">
                                    <div class="w-full h-5 bg-gray-200 rounded"></div>
                                    <div class="w-4/5 h-5 bg-gray-200 rounded"></div>
                                    <div class="w-full h-4 bg-gray-100 rounded mt-2"></div>
                                    <div class="w-3/4 h-4 bg-gray-100 rounded"></div>
                                </div>
                                <div class="flex flex-col gap-2">
                                    <div class="w-24 h-5 bg-orange-100 rounded"></div>
                                    <div class="w-32 h-5 bg-orange-100 rounded"></div>
                                </div>
                            </div>
                        {/each}
                    {:else if cardsPopular.length === 0}
                        <div class="w-full text-center py-10 text-gray-500 font-medium">
                            ไม่พบข้อมูลปัญหาพิเศษยอดนิยม
                        </div>
                    {:else}
                        {#each cardsPopular as cardPop (cardPop.id)}
                            <div class="snap-start shrink-0 w-65 md:w-70 lg:w-75">
                                <CardPopular 
                                    id={cardPop.id}
									departments={cardPop.departments}
                                    titleThai={cardPop.titleThai}
                                    titleEnglish={cardPop.titleEnglish}
                                    keywords={cardPop.keywords}
                                />
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>

		</div>
	</section>

	<section class="w-full bg-orange-700">
		<!-- ส่วนเลือกค้นหาตามคณะ -->
		<div class="max-w-7xl mx-auto py-12 px-6 md:px-12 lg:px-20 flex flex-col gap-8">
			<h2 class="text-white text-xl md:text-2xl lg:text-3xl font-bold text-center md:text-left">
				ค้นหาโดยคณะ
			</h2>
            
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each menuCategories as menuCategory (menuCategory.destination)}
					<MenuCategory 
						label={menuCategory.label} 
						destination={menuCategory.destination} />
				{/each}
			</div>
		</div>
	</section>
</main>