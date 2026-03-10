<script lang="ts">
    import { onMount } from 'svelte';
    import SearchBar from "../../components/SearchBar.svelte";
    import FilterSideBar from "../../components/FilterSideBar.svelte";
    import { page } from '$app/state';

    interface Option {
        id: string;
        label: string;
    }

    interface Faculty extends Option {
        majors: Option[];
    }

    const searchTerm = $derived(page.url.searchParams.get('q') ?? '');

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
                    <FilterSideBar {faculties} />
                </div>

                <div class="w-4/5 flex flex-col gap-4 pl-4">

                    <div class="flex-1 bg-gray-100 rounded-lg">
                        <p class="text-gray-800 text-xl md:text-2xl lg:text-3xl font-semibold mb-4">
                            ผลการค้นหา
                        </p>
                        
                        <p class="text-black text-sm md:text-base lg:text-base font-medium">
                            แสดงผลการค้นหาสำหรับ: 
                            <span class="font-medium text-gray-900">
                                {searchTerm}
                            </span>
                        </p>
                    </div>

                    <div class="flex-1 bg-gray-100 rounded-lg">
                        <p class="text-gray-800 text-xl md:text-2xl lg:text-3xl font-semibold mb-4">
                            ผลการค้นหา
                        </p>
                        
                        <p class="text-black text-sm md:text-base lg:text-base font-medium">
                            แสดงผลการค้นหาสำหรับ: 
                            <span class="font-medium text-gray-900">
                                {searchTerm}
                            </span>
                        </p>
                    </div>

                    <div class="flex-1 bg-gray-100 rounded-lg">
                        <p class="text-gray-800 text-xl md:text-2xl lg:text-3xl font-semibold mb-4">
                            ผลการค้นหา
                        </p>
                        
                        <p class="text-black text-sm md:text-base lg:text-base font-medium">
                            แสดงผลการค้นหาสำหรับ: 
                            <span class="font-medium text-gray-900">
                                {searchTerm}
                            </span>
                        </p>
                    </div>

                    <div class="flex-1 bg-gray-100 rounded-lg">
                        <p class="text-gray-800 text-xl md:text-2xl lg:text-3xl font-semibold mb-4">
                            ผลการค้นหา
                        </p>
                        
                        <p class="text-black text-sm md:text-base lg:text-base font-medium">
                            แสดงผลการค้นหาสำหรับ: 
                            <span class="font-medium text-gray-900">
                                {searchTerm}
                            </span>
                        </p>
                    </div>

                    <div class="flex-1 bg-gray-100 rounded-lg">
                        <p class="text-gray-800 text-xl md:text-2xl lg:text-3xl font-semibold mb-4">
                            ผลการค้นหา
                        </p>
                        
                        <p class="text-black text-sm md:text-base lg:text-base font-medium">
                            แสดงผลการค้นหาสำหรับ: 
                            <span class="font-medium text-gray-900">
                                {searchTerm}
                            </span>
                        </p>
                    </div>

                    <div class="flex-1 bg-gray-100 rounded-lg">
                        <p class="text-gray-800 text-xl md:text-2xl lg:text-3xl font-semibold mb-4">
                            ผลการค้นหา
                        </p>
                        
                        <p class="text-black text-sm md:text-base lg:text-base font-medium">
                            แสดงผลการค้นหาสำหรับ: 
                            <span class="font-medium text-gray-900">
                                {searchTerm}
                            </span>
                        </p>
                    </div>

                    <div class="flex-1 bg-gray-100 rounded-lg">
                        <p class="text-gray-800 text-xl md:text-2xl lg:text-3xl font-semibold mb-4">
                            ผลการค้นหา
                        </p>
                        
                        <p class="text-black text-sm md:text-base lg:text-base font-medium">
                            แสดงผลการค้นหาสำหรับ: 
                            <span class="font-medium text-gray-900">
                                {searchTerm}
                            </span>
                        </p>
                    </div>

                    <div class="flex-1 bg-gray-100 rounded-lg">
                        <p class="text-gray-800 text-xl md:text-2xl lg:text-3xl font-semibold mb-4">
                            ผลการค้นหา
                        </p>
                        
                        <p class="text-black text-sm md:text-base lg:text-base font-medium">
                            แสดงผลการค้นหาสำหรับ: 
                            <span class="font-medium text-gray-900">
                                {searchTerm}
                            </span>
                        </p>
                    </div>

                    <div class="flex-1 bg-gray-100 rounded-lg">
                        <p class="text-gray-800 text-xl md:text-2xl lg:text-3xl font-semibold mb-4">
                            ผลการค้นหา
                        </p>
                        
                        <p class="text-black text-sm md:text-base lg:text-base font-medium">
                            แสดงผลการค้นหาสำหรับ: 
                            <span class="font-medium text-gray-900">
                                {searchTerm}
                            </span>
                        </p>
                    </div>

                    <div class="flex-1 bg-gray-100 rounded-lg">
                        <p class="text-gray-800 text-xl md:text-2xl lg:text-3xl font-semibold mb-4">
                            ผลการค้นหา
                        </p>
                        
                        <p class="text-black text-sm md:text-base lg:text-base font-medium">
                            แสดงผลการค้นหาสำหรับ: 
                            <span class="font-medium text-gray-900">
                                {searchTerm}
                            </span>
                        </p>
                    </div>

                    <div class="flex-1 bg-gray-100 rounded-lg">
                        <p class="text-gray-800 text-xl md:text-2xl lg:text-3xl font-semibold mb-4">
                            ผลการค้นหา
                        </p>
                        
                        <p class="text-black text-sm md:text-base lg:text-base font-medium">
                            แสดงผลการค้นหาสำหรับ: 
                            <span class="font-medium text-gray-900">
                                {searchTerm}
                            </span>
                        </p>
                    </div>

                </div>
            </div>
        </section>
        
    </section>

</main>
