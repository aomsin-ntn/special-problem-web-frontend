

<script lang="ts">
    import SearchBar from "../../components/SearchBar.svelte";
    import { onMount } from 'svelte';
    import FilterSideBar from "../../components/FilterSideBar3.svelte";
    import type { Faculty } from "../../components/FilterSideBar3.svelte";
    import { page } from '$app/state';

    const searchTerm = $derived(page.url.searchParams.get('q') ?? '');

/*
    let facultiesData = $state<Faculty[]>([]);
    let currentFilters = $state({ years: [] as string[], majors: [] as string[] });

    onMount(async () => {
        try {
            const response = await fetch('http://localhost:8000/api/filters/faculties');
            if (response.ok) {
                facultiesData = await response.json();
            }
        } catch (e) {
            console.error("Fetch error:", e);
        }
    });

    function handleFilterChange(filters: { years: string[], majors: string[] }) {
        currentFilters = filters;
        console.log("ตัวกรองที่เลือกตอนนี้:", currentFilters);
    }
*/

// 1. สร้างข้อมูลจำลอง (Mock Data) แทนการเรียก API
    const mockFaculties: Faculty[] = [
        {
            id: "sci",
            label: "คณะวิทยาศาสตร์",
            majors: [
                { id: "cs", label: "วิทยาการคอมพิวเตอร์" },
                { id: "it", label: "เทคโนโลยีสารสนเทศ" },
                { id: "math", label: "คณิตศาสตร์" },
                { id: "stat", label: "สถิติ" }
            ]
        },
        {
            id: "eng",
            label: "คณะวิศวกรรมศาสตร์",
            majors: [
                { id: "cpe", label: "วิศวกรรมคอมพิวเตอร์" },
                { id: "se", label: "วิศวกรรมซอฟต์แวร์" },
                { id: "ie", label: "วิศวกรรมอุตสาหการ" }
            ]
        },
        {
            id: "biz",
            label: "คณะบริหารธุรกิจ",
            majors: [
                { id: "acc", label: "บัญชี" },
                { id: "mkt", label: "การตลาด" },
                { id: "mgt", label: "การจัดการ" }
            ]
        }
    ];

    // 2. กำหนดค่าเริ่มต้นเป็นข้อมูลจำลองได้เลย (ไม่ต้องรอ onMount)
    let facultiesData = $state<Faculty[]>(mockFaculties);
    
    let currentFilters = $state({ years: [] as string[], majors: [] as string[] });

    function handleFilterChange(filters: { years: string[], majors: string[] }) {
        currentFilters = filters;
        console.log("ตัวกรองที่เลือกตอนนี้:", currentFilters);
    }

</script>

<main class="flex flex-col items-center overflow-x-hidden">

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
                <div class="w-1/5 pr-4">
                    <FilterSideBar 
                        faculties={facultiesData} 
                        onFilterChange={handleFilterChange} 
                    />
                </div>

                <div class="w-4/5 flex flex-col gap-4 pl-4">

                    <div class="flex-1 bg-gray-100 rounded-lg p-6">
                        <p class="text-gray-800 text-xl md:text-2xl lg:text-3xl font-semibold mb-4">
                            ผลการค้นหา
                        </p>
                        
                        <p class="text-black text-sm md:text-base lg:text-base font-medium">
                            แสดงผลการค้นหาสำหรับ: 
                            <span class="font-medium text-gray-900">
                                {searchTerm ? `"${searchTerm}"` : 'ทั้งหมด'}
                            </span>
                        </p>

                        <div class="mt-4 text-sm text-gray-600">
                            <p><strong>ปีที่กรอง:</strong> {currentFilters.years.length > 0 ? currentFilters.years.join(', ') : 'ไม่ได้เลือก'}</p>
                            <p><strong>สาขาที่กรอง:</strong> {currentFilters.majors.length > 0 ? currentFilters.majors.join(', ') : 'ไม่ได้เลือก'}</p>
                        </div>

                        </div>

                </div>
            </div>
        </section>
        
    </section>

</main>

