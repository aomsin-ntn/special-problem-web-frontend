<script lang="ts">
    import { page } from '$app/state';
    import { PUBLIC_API_URL } from '$env/static/public';
    import { onMount, untrack } from 'svelte';
    import SearchBar from "$lib/components/SearchBar.svelte";
    import FilterSideBar from "$lib/components/FilterSideBar.svelte";
    import CardProjectDetail from '$lib/components/CardProjectDetail.svelte';
    import { SlidersHorizontal } from 'lucide-svelte';

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

    interface ProjectItem {
        project: {
            project_id: string;
            academic_year: string;
            title_th: string;
            title_en: string;
            downloaded_count: number;
        };
        faculty: { faculty_name_th: string };
        department: { department_name_th: string };
        users: { user_name_th: string }[];
        advisors: { advisor_name_th: string }[];
        keywords: { keyword_text_th: string }[];
        project_file?: { thumbnail_path: string };
    }

    const searchTerm = $derived(page.url.searchParams.get('q') ?? '');
    
    let sortBy = $state<string>('downloaded_count-desc');
    let isDropdownOpen = $state<boolean>(false);
    let dropdownRef = $state<HTMLElement | null>(null);
    let currentPage = $state<number>(1);
    const itemsPerPage = 10;

    let selectedYears = $state<string[]>([]);
    let selectedDepartments = $state<string[]>([]);
    let faculties = $state<Faculty[]>([]);
    let projects = $state<ProjectItem[]>([]);
    let isLoading = $state<boolean>(true);

    let totalItems = $state<number>(0);
    let totalPages = $state<number>(1);

    let isMobileFilterOpen = $state<boolean>(false);

    const sortOptions: SortOption[] = [
        { label: 'เรียงตามดาวน์โหลดมากสุด > น้อยสุด', value: 'downloaded_count-desc' },
        { label: 'เรียงตามดาวน์โหลดน้อยสุด > มากสุด', value: 'downloaded_count-asc' },
        { label: 'เรียงตามอัปโหลดใหม่ > เก่า', value: 'created_at-desc' },
        { label: 'เรียงตามอัปโหลดเก่า > ใหม่', value: 'created_at-asc' },
    ];

    const selectedSortLabel = $derived(sortOptions.find(opt => opt.value === sortBy)?.label || sortBy);

    function toggleDropdown() {
        isDropdownOpen = !isDropdownOpen;
    }

    function handleSort(value: string) {
        sortBy = value;
        isDropdownOpen = false;
        currentPage = 1;
    }

    function handleClickOutside(event: MouseEvent) {
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
            isDropdownOpen = false;
        }
    }

    $effect(() => {
        searchTerm;
        selectedYears;
        selectedDepartments;
        untrack(() => {
            if (currentPage !== 1) currentPage = 1;
        });
    });

    function goToPage(pageNum: number) {
        if (pageNum >= 1 && pageNum <= totalPages) {
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
        // รีเซ็ตหน้าและดึงผลลัพธ์ใหม่เมื่อคำค้นหรือฟิลเตอร์เปลี่ยน
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
                    projects = responseData.data || []; 

                    totalItems = responseData.metadata?.total_items ?? 0;
                    totalPages = responseData.metadata?.total_pages ?? 1;
                    
                } else {
                    projects = [];
                    totalItems = 0;
                    totalPages = 1;
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
                projects = [];
                totalItems = 0;
                totalPages = 1;
            } finally {
                isLoading = false;
            }
        };

        fetchProjects();
    });
</script>

<svelte:window onclick={handleClickOutside} />

<main class="flex flex-col items-center">

    <section class="w-full bg-white gap-6 px-4 md:px-10 lg:px-20 xl:px-30 pb-10 flex flex-col divide-y-2 divide-gray-600">

        <section>
            <!-- ส่วนหัวหน้าและช่องค้นหา -->
            <div class="flex flex-col items-center gap-6 py-12 px-4 sm:px-6 md:px-10">
                <p class="text-black text-lg md:text-xl lg:text-2xl font-semibold text-center">
                    ค้นหาเล่มปัญหาพิเศษที่คุณต้องการได้ที่นี่
                </p>
                <div class="w-full max-w-2xl">
                    <SearchBar value={searchTerm}/>
                </div>
            </div>
        </section>

        <section>
            <!-- ปุ่มเปิด/ปิดตัวกรองสำหรับหน้าจอมือถือ -->
            <button
                type="button"
                onclick={() => isMobileFilterOpen = !isMobileFilterOpen}
                class="lg:hidden w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-300 py-3 rounded-xl shadow-sm text-gray-700 font-semibold active:bg-gray-50 cursor-pointer mb-6"
            >
                <SlidersHorizontal class="w-5 h-5" />
                {isMobileFilterOpen ? 'ซ่อนตัวกรอง' : 'แสดงตัวกรอง'}
            </button>

            <div class="w-full flex flex-col lg:flex-row items-start lg:divide-x-2 divide-gray-600 px-0 lg:px-2 pt-0 lg:pt-6">
                
                <!-- แถบตัวกรองด้านซ้าย -->
                <div class="{isMobileFilterOpen ? 'block' : 'hidden'} lg:block w-full lg:w-1/5 lg:pr-2 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto mb-8 lg:mb-0 z-10">
                    <FilterSideBar {faculties} bind:selectedYears bind:selectedDepartments/>
                </div>

                <!-- พื้นที่แสดงผลลัพธ์และตัวเลือกเรียงลำดับ -->
                <div class="w-full lg:w-4/5 flex flex-col gap-4 lg:pl-4">
                    
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 pt-1 px-2">
                        <div>
                            <p class="text-black text-sm md:text-base">
                                ผลลัพธ์การค้นหา (<span class="font-semibold text-orange-500">{totalItems}</span> รายการ)
                            </p>
                        </div>
                        
                        <div class="relative w-full sm:w-auto" bind:this={dropdownRef}>
                            <button 
                                onclick={toggleDropdown}
                                class="w-full sm:w-auto flex justify-between items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                            >
                                <span class="text-sm md:text-base text-black">{selectedSortLabel}</span>
                                <svg 
                                    class="w-4 h-4 transition transform {isDropdownOpen ? 'rotate-180' : ''}" 
                                    fill="none" stroke="black" viewBox="0 0 24 24"
                                >
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </button>
                            
                            {#if isDropdownOpen}
                                <div class="absolute right-0 mt-2 w-full sm:w-64 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-20">
                                    {#each sortOptions as option (option.value)}
                                        <button 
                                            onclick={() => handleSort(option.value)}
                                            class="w-full text-left px-4 py-3 hover:bg-orange-200 transition cursor-pointer {sortBy === option.value ? 'bg-orange-700 font-semibold text-orange-100' : 'text-gray-700'}"
                                        >
                                            {option.label}
                                        </button>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    </div>

                    <div class="flex flex-col gap-4">
                        {#if isLoading}
                            <!-- แสดงการ์ดโหลดระหว่างรอข้อมูลจาก API -->
                            {#each Array(3) as _}
                                <div class="w-full bg-white rounded-xl border border-gray-200 shadow-md p-4 flex flex-col md:flex-row gap-6 animate-pulse">
                                    <div class="w-full md:w-41.25 h-65 bg-gray-200 rounded-lg shrink-0"></div>
                                    <div class="flex flex-col gap-4 grow py-2 justify-center">
                                        <div class="flex gap-2">
                                            <div class="w-20 h-6 bg-orange-100/50 rounded-full"></div>
                                            <div class="w-24 h-6 bg-orange-700/50 rounded-full"></div>
                                        </div>
                                        <div class="w-3/4 h-6 bg-gray-200 rounded mt-2"></div>
                                        <div class="w-full h-5 bg-gray-200 rounded"></div>
                                        <div class="w-1/2 h-5 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                            {/each}
                        {:else if projects.length === 0}
                            <!-- กรณีไม่พบข้อมูลที่ตรงกับเงื่อนไขค้นหา -->
                            <div class="py-20 text-center text-gray-500 font-medium text-lg">ไม่พบข้อมูลที่ค้นหา</div>
                        {:else}
                            <!-- วนแสดงรายการเล่มปัญหาพิเศษที่ค้นเจอ -->
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

                    {#if totalPages > 1 && !isLoading}
                        <!-- แถบเปลี่ยนหน้าผลลัพธ์ -->
                        <div class="flex justify-center items-center gap-2 py-6">
                            <button 
                                onclick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                class="p-2 rounded-lg border-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                                title="หน้าก่อนหน้า"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="black" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <div class="flex gap-1 overflow-x-auto hide-scrollbar max-w-full px-2">
                                {#each Array.from({ length: totalPages }, (_, i) => i + 1) as pageNum (pageNum)}
                                    <button 
                                        onclick={() => goToPage(pageNum)}
                                        class="min-w-10 h-10 rounded-lg border-2 transition cursor-pointer shrink-0 
                                        {currentPage === pageNum 
                                        ? 'bg-orange-500 text-white border-orange-500' 
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'}"
                                    >
                                        {pageNum}
                                    </button>
                                {/each}
                            </div>

                            <button 
                                onclick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                class="p-2 rounded-lg border-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
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