<script lang="ts">
    import { onMount } from 'svelte';
    import SearchBar from "$lib/components/SearchBar.svelte";
    import FilterSideBar from "$lib/components/FilterSideBar.svelte";
    import CardProjectDetail from '$lib/components/CardProjectDetail.svelte';
    import { page } from '$app/state';

    interface Option {
        id: string;
        label: string;
    }

    interface Faculty extends Option {
        majors: Option[];
    }

    interface SortOption {
        label: string;
        value: string;
    }

    const searchTerm = $derived(page.url.searchParams.get('q') ?? '');
    
    // Sorting state
    let sortBy = $state<string>('newest');
    let isDropdownOpen = $state<boolean>(false);
    let currentPage = $state<number>(1);
    const itemsPerPage = 10;
    let selectedYears = $state<string[]>([]);
    let selectedMajors = $state<string[]>([]);

    const sortOptions: SortOption[] = [
        { label: 'เรียงตามอัปโหลดใหม่ > เก่า', value: 'newest' },
        { label: 'เรียงตามอัปโหลดเก่า > ใหม่', value: 'oldest' },
        { label: 'เรียงตามดาวน์โหลดมากที่สุด', value: 'most-downloads' },
        { label: 'เรียงตามดาวน์โหลดน้อยที่สุด', value: 'least-downloads' },
    ];

    const mockProjects = [
        {
            id: '1',
            faculty: "คณะวิทยาศาสตร์",
            major: "สาขาวิทยาการคอมพิวเตอร์",
            author: ["น.ส.ณัฏฐนันท์ ศรีพันธวานุสรณ์", "นายภูมิพิรัฐ รักษากิจ"],
            advisor: ["ดร.สมชาย ใจดี", "ดร.นภาวรรณ แสงสว่าง"],
            semester: "ปีการศึกษา 2567",
            titleThai: "การพัฒนาระบบแนะนำหนังสือโดยใช้เทคนิคการเรียนรู้ของเครื่อง",
            titleEnglish: "Development of a Book Recommendation System Using Machine Learning Techniques",
            keywords: ["ระบบแนะนำหนังสือ", "การเรียนรู้ของเครื่อง", "การประมวลผลภาษาธรรมชาติ"],
            uploadDate: new Date('2024-01-15'),
            downloads: 150
        },
        {
            id: '2',
            faculty: "คณะบริหารธุรกิจ",
            major: "สาขาการตลาด",
            author: ["น.ส.ณัฏฐนันท์ ศรีพันธวานุสรณ์", "นายภูมิพิรัฐ รักษากิจ"],
            advisor: ["ดร.สมชาย ใจดี", "ดร.นภาวรรณ แสงสว่าง"],
            semester: "ปีการศึกษา 2568",
            titleThai: "การวิเคราะห์ความรู้สึกในความคิดเห็นของลูกค้าเกี่ยวกับผลิตภัณฑ์บนโซเชียลมีเดีย",
            titleEnglish: "Sentiment Analysis of Customer Reviews on Social Media",
            keywords: ["วิเคราะห์ความรู้สึก", "ความคิดเห็นของลูกค้า", "โซเชียลมีเดีย"],
            uploadDate: new Date('2024-02-20'),
            downloads: 200
        },
        {
            id: '3',
            faculty: "คณะวิศวกรรมศาสตร์",
            major: "สาขาวิศวกรรมคอมพิวเตอร์",
            author: ["น.ส.ณัฏฐนันท์ ศรีพันธวานุสรณ์", "นายภูมิพิรัฐ รักษากิจ"],
            advisor: ["ดร.สมชาย ใจดี", "ดร.นภาวรรณ แสงสว่าง"],
            semester: "ปีการศึกษา 2569",
            titleThai: "ระบบตรวจจับความผิดปกติโดยใช้การเรียนรู้เชิงลึก",
            titleEnglish: "Anomaly Detection System Using Deep Learning",
            keywords: ["การตรวจจับความผิดปกติ", "เรียนรู้เชิงลึก", "โครงข่ายประสาทเทียม"],
            uploadDate: new Date('2024-03-10'),
            downloads: 120
        },
        {
            id: '4',
            faculty: "คณะวิทยาศาสตร์",
            major: "สาขาวิทยาการคอมพิวเตอร์",
            author: ["น.ส.ณัฏฐนันท์ ศรีพันธวานุสรณ์", "นายภูมิพิรัฐ รักษากิจ"],
            advisor: ["ดร.สมชาย ใจดี", "ดร.นภาวรรณ แสงสว่าง"],
            semester: "ปีการศึกษา 2567",
            titleThai: "การพยากรณ์ราคาหุ้นด้วยเครือข่ายประสาทเทียม",
            titleEnglish: "Stock Price Prediction Using Neural Networks",
            keywords: ["พยากรณ์ราคา", "เครือข่ายประสาทเทียม", "ตลาดหุ้น"],
            uploadDate: new Date('2024-01-05'),
            downloads: 300
        },
        {
            id: '5',
            faculty: "คณะวิทยาศาสตร์",
            major: "สาขาวิทยาการคอมพิวเตอร์",
            author: ["น.ส.ณัฏฐนันท์ ศรีพันธวานุสรณ์", "นายภูมิพิรัฐ รักษากิจ"],
            advisor: ["ดร.สมชาย ใจดี", "ดร.นภาวรรณ แสงสว่าง"],
            semester: "ปีการศึกษา 2567",
            titleThai: "ระบบจดจำรูปภาพใบหน้าขั้นสูง",
            titleEnglish: "Advanced Facial Recognition System",
            keywords: ["จดจำใบหน้า", "การประมวลผลภาพ", "การรักษาความปลอดภัย"],
            uploadDate: new Date('2024-02-14'),
            downloads: 85
        },
    ];

    const mockFaculties: Faculty[] = [
        {
            id: 'eng',
            label: 'คณะวิศวกรรมศาสตร์',
            majors: [
                { id: 'eng-cs', label: 'วิศวกรรมคอมพิวเตอร์' },
                { id: 'eng-ee', label: 'วิศวกรรมไฟฟ้า' },
                { id: 'eng-me', label: 'วิศวกรรมเครื่องกล' },
                { id: 'eng-ce', label: 'วิศวกรรมโยธา' },
                { id: 'eng-ie', label: 'วิศวกรรมอุตสาหการ' },
            ],
        },
        {
            id: 'sci',
            label: 'คณะวิทยาศาสตร์',
            majors: [
                { id: 'sci-math', label: 'คณิตศาสตร์' },
                { id: 'sci-physics', label: 'ฟิสิกส์' },
                { id: 'sci-chem', label: 'เคมี' },
                { id: 'sci-bio', label: 'ชีววิทยา' },
                { id: 'sci-cs', label: 'วิทยาการคอมพิวเตอร์' },
            ],
        },
        {
            id: 'bus',
            label: 'คณะบริหารธุรกิจ',
            majors: [
                { id: 'bus-acc', label: 'การบัญชี' },
                { id: 'bus-fin', label: 'การเงิน' },
                { id: 'bus-mkt', label: 'การตลาด' },
                { id: 'bus-mgmt', label: 'การจัดการ' },
            ],
        },
        {
            id: 'arch',
            label: 'คณะสถาปัตยกรรมศาสตร์',
            majors: [
                { id: 'arch-arch', label: 'สถาปัตยกรรม' },
                { id: 'arch-id', label: 'การออกแบบภายใน' },
                { id: 'arch-ud', label: 'การผังเมือง' },
            ],
        },
    ];

    let faculties = $state<Faculty[]>([]);

    // Helper function to match project major with selected majors
    function matches(project: typeof mockProjects[0]): boolean {
        // Filter by year
        if (selectedYears.length > 0) {
            const projectYear = project.semester.match(/\d+/)?.[0];
            if (!projectYear || !selectedYears.includes(projectYear)) return false;
        }

        // Filter by major
        if (selectedMajors.length > 0) {
            const majorLabels = selectedMajors.map(id => 
                mockFaculties.flatMap(f => f.majors).find(m => m.id === id)?.label
            );
            if (!majorLabels.some(label => label && project.major.includes(label))) return false;
        }

        return true;
    }

    // Filter and sort projects
    const sortedProjects = $derived.by(() => {
        const filtered = mockProjects.filter(matches);
        
        const sorted = [...filtered];
        switch (sortBy) {
            case 'newest':
                return sorted.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime());
            case 'most-downloads':
                return sorted.sort((a, b) => b.downloads - a.downloads);
            case 'least-downloads':
                return sorted.sort((a, b) => a.downloads - b.downloads);
            default:
                return sorted;
        }
    });

    // Calculate pagination
    const totalPages = $derived(Math.ceil(sortedProjects.length / itemsPerPage));
    const paginatedProjects = $derived(sortedProjects.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    ));

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
        currentPage = 1; // Reset to first page when sorting changes
    }

    // Reset pagination when filters change
    $effect(() => {
        selectedYears;
        selectedMajors;
        currentPage = 1;
    });

    // Handle page change
    function goToPage(pageNum: number) {
        if (pageNum >= 1 && pageNum <= totalPages) {
            currentPage = pageNum;
        }
    }

    onMount(async () => {
        try {
            const response = await fetch('http://localhost:8000/api/filters/faculties');
            if (response.ok) {
                faculties = await response.json();
            } else {
                faculties = mockFaculties;
            }
        } catch (e) {
            console.warn('Backend unavailable, using mock data.');
            faculties = mockFaculties;
        }
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
                    <FilterSideBar {faculties} bind:selectedYears bind:selectedMajors/>
                </div>

                <div class="w-4/5 flex flex-col gap-4 pl-4">
                    <!-- Search Results Count and Sort Filter -->
                    <div class="flex justify-between items-center pb-2 pt-1 px-2">
                        <div>
                            <p class="text-black text-sm md:text-base">
                                ผลลัพธ์การค้นหา (<span class="font-semibold text-orange-500">{sortedProjects.length}</span> รายการ)
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
                        {#each paginatedProjects as project (project.id)}
                            <CardProjectDetail 
                                id={project.id}
                                faculty={project.faculty}
                                major={project.major}
                                author={project.author}
                                advisor={project.advisor}
                                semester={project.semester}
                                titleThai={project.titleThai}
                                titleEnglish={project.titleEnglish}
                                keywords={project.keywords}
                            />
                        {/each}
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
