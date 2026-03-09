<script lang="ts">
    import SearchBar from "../../components/SearchBar.svelte";
    import FilterSideBar from "../../components/FilterSideBar2.svelte";
    import { page } from '$app/state';

    const searchTerm = $derived(page.url.searchParams.get('q') ?? '');
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
                    <FilterSideBar />
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
