<script lang="ts">
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { PUBLIC_API_URL } from '$env/static/public';
    import { onMount } from 'svelte';
    import SearchBar from "$lib/components/SearchBar.svelte";
    import FilterSideBar from "$lib/components/FilterSideBar.svelte";
    import CardProjectDetail from '$lib/components/CardProjectDetail.svelte';
    

    interface Option {
        id: string;
        label: string;
    }

    interface Faculty extends Option {
        departments: Option[];
    }

    interface SortOption {
        label: string;
        value: string;
    }

    const searchTerm = $derived(page.url.searchParams.get('q') ?? '');
    
    // Sorting state
    let sortBy = $state<string>('downloaded_count-desc');
    let isDropdownOpen = $state<boolean>(false);
    let currentPage = $state<number>(1);
    const itemsPerPage = 10;

    let selectedYears = $state<string[]>([]);
    let selectedDepartments = $state<string[]>([]);

    let faculties = $state<Faculty[]>([]);
    let projects = $state<any[]>([]);
    let isLoading = $state<boolean>(false);

    let totalItems = $state<number>(0);
    let totalPages = $state<number>(1);

    // Filter and sort projects
    const sortOptions: SortOption[] = [
        { label: 'เรียงตามดาวน์โหลดมากที่สุด', value: 'downloaded_count-desc' },
        { label: 'เรียงตามดาวน์โหลดน้อยที่สุด', value: 'downloaded_count-asc' },
        { label: 'เรียงตามอัปโหลดใหม่ > เก่า', value: 'created_at-asc' },
        { label: 'เรียงตามอัปโหลดเก่า > ใหม่', value: 'created_at-desc' },
    ];

    // Get selected sort label
    const selectedSortLabel = $derived(sortOptions.find(opt => opt.value === sortBy)?.label || sortBy);

    // Toggle dropdown
    function toggleDropdown() {
        isDropdownOpen = !isDropdownOpen;
    }

    // Handle sort selection
    function handleSort(value: string) {
        sortBy = value;
        isDropdownOpen = false;
        currentPage = 1;
    }

    // Reset pagination when filters change
    $effect(() => {
        selectedYears;
        selectedDepartments;
        currentPage = 1;
    });

    // Handle page change
    function goToPage(pageNum: number) {
        if (pageNum >= 1) {
            currentPage = pageNum;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    onMount(async () => {
        try {
            const response = await fetch(`${PUBLIC_API_URL}/project/get_faculty`);
            if (response.ok) {
                const data = await response.json();
                faculties = data.map((item: any) => ({
                    id: item.faculty.faculty_id,
                    label: item.faculty.faculty_name_th,
                    departments: item.departments.map((d: any) => ({
                        id: d.department_id, 
                        label: d.department_name_th 
                    }))
                }));

                const initialFacultyId = page.url.searchParams.get('faculty');
                if (initialFacultyId) {
                    const targetFaculty = faculties.find(f => f.id === initialFacultyId);
                    if (targetFaculty) {
                        selectedDepartments = targetFaculty.departments.map(d => d.id);
                    }
                }
            }
        } catch (e) {
            console.error('Failed to fetch faculties from backend', e);
        }
    });

    $effect(() => {
        const fetchProjects = async () => {
            isLoading = true;
            try {
                const queryParams = new URLSearchParams();
                
                selectedDepartments.forEach(dept => queryParams.append('department', dept));
                queryParams.append('page', currentPage.toString());
                queryParams.append('limit', itemsPerPage.toString());
                if (searchTerm) queryParams.append('search', searchTerm);
                selectedYears.forEach(year => queryParams.append('year', year));
                
                const [sorted_by, order] = sortBy.split('-');
                if (sorted_by && order) {
                    queryParams.append('sorted_by', sorted_by);
                    queryParams.append('order', order);
                }

                const response = await fetch(`${PUBLIC_API_URL}/project/?${queryParams.toString()}`);
                if (response.ok) {
                    const responseData = await response.json();
                    projects = await responseData.data || [];
                    totalItems = responseData.total_items || 0;
                    totalPages = responseData.total_pages || 1;
                } else {
                    projects = [];
                    totalPages = 1;
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
                projects = [];
                totalPages = 1;
            } finally {
                isLoading = false;
            }
        };

        fetchProjects();
    });
</script>

<main class="flex flex-col items-center">

    <section class="w-full bg-white gap-6 px-10 md:px-20 lg:px-30 pb-10 flex flex-col divide-y-2 divide-gray-600">

        <section>
            <div class="flex flex-col items-center gap-6 py-12 px-4 sm:px-6 md:px-10">
                <p class="text-black text-lg md:text-xl lg:text-2xl font-semibold">
                    ค้นหาเล่มปัญหาพิเศษที่คุณต้องการได้ที่นี่
                </p>
                <SearchBar value={searchTerm}/>
            </div>
        </section>

        <section> 
            <div class="w-full flex items-start divide-x-2 divide-gray-600 px-2">
                <div class="w-1/5 pr-2 sticky top-0 h-screen overflow-y-auto">
                    <FilterSideBar {faculties} bind:selectedYears bind:selectedDepartments/>
                </div>

                <div class="w-4/5 flex flex-col gap-4 pl-4">
                    <!-- Search Results Count and Sort Filter -->
                    <div class="flex justify-between items-center pb-2 pt-1 px-2">
                        <div>
                            <p class="text-black text-sm md:text-base">
                                ผลลัพธ์การค้นหา (<span class="font-semibold text-orange-500">{projects.length}</span> รายการ)
                            </p>
                        </div>
                        
                        <!-- Sorting Dropdown -->
                        <div class="relative">
                            <button 
                                onclick={toggleDropdown}
                                class="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                <span class="text-sm md:text-base text-black">{selectedSortLabel}</span>
                                <svg 
                                    class="w-4 h-4 transition transform {isDropdownOpen ? 'rotate-180' : ''}" 
                                    fill="none" 
                                    stroke="black" 
                                    viewBox="0 0 24 24"
                                >
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </button>
                            
                            {#if isDropdownOpen}
                                <div class="absolute right-0 mt-2 w-64 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-10">
                                    {#each sortOptions as option (option.value)}
                                        <button 
                                            onclick={() => handleSort(option.value)}
                                            class="w-full text-left px-4 py-3 hover:bg-orange-200 transition {sortBy === option.value ? 'bg-orange-700 font-semibold text-orange-800' : 'text-gray-700'}"
                                        >
                                            {option.label}
                                        </button>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    </div>

                    <!-- Project Cards -->
                    <div class="flex flex-col gap-4">
                        {#if isLoading}
                            <div class="py-10 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
                        {:else if projects.length === 0}
                            <div class="py-10 text-center text-gray-500">ไม่พบข้อมูลที่ค้นหา</div>
                        {:else}
                            {#each projects as item (item.project.project_id)}
                                <CardProjectDetail 
                                    id={item.project.project_id}
                                    faculty={item.faculty?.faculty_name_th || "-"}
                                    department={item.department?.department_name_th || "-"}
                                    author={item.users?.map((u: any) => u.user_name_th)}
                                    advisor={item.advisors?.map((a: any) => a.advisor_name_th)}
                                    semester={item.project.academic_year}
                                    titleThai={item.project.title_th}
                                    titleEnglish={item.project.title_en}
                                    keywords={item.keywords?.map((k: any) => k.keyword_text_th)}
                                    thumbnail={item.project_file?.thumbnail_path || null}
                                    downloadCount={item.project.downloaded_count}
                                />
                            {/each}
                        {/if}
                    </div>

                    <!-- Pagination -->
                    {#if totalPages > 1}
                        <div class="flex justify-center items-center gap-2 py-6">
                            <!-- Previous Button -->
                            <button 
                                onclick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                class="p-2 rounded-lg border-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                title="หน้าก่อนหน้า"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="black" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <!-- Page Numbers -->
                            {#each Array.from({ length: totalPages }, (_, i) => i + 1) as pageNum (pageNum)}
                                <button 
                                    onclick={() => goToPage(pageNum)}
                                    class="w-10 h-10 rounded-lg border-2 transition {currentPage === pageNum 
                                        ? 'bg-orange-500 text-white border-orange-500' 
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'}"
                                >
                                    {pageNum}
                                </button>
                            {/each}

                            <!-- Next Button -->
                            <button 
                                onclick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                class="p-2 rounded-lg border-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                title="หน้าถัดไป"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="black" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    {/if}
                </div>
            </div>
        </section>
    </section>
</main>