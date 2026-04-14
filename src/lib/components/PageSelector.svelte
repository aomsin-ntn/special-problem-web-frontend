<script lang="ts">
    import { FileCheckCorner } from 'lucide-svelte';
    import Abstract_th_page from '$lib/assets/Abstract_th_page.jpg';
    import Abstract_en_page from '$lib/assets/Abstract_en_page.jpg';
    import type { PageThumbnail } from '$lib/types';

    interface Props {
        pageThumbnails: PageThumbnail[];
        selectedPages: number[];
        onTogglePage: (pageId: number) => void;
        onPrev: () => void;
        onNext: () => void;
    }

    let { pageThumbnails, selectedPages, onTogglePage, onPrev, onNext }: Props = $props();
</script>

<section class="max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-300">
    <div class="bg-white border border-gray-500 shadow-lg rounded-2xl p-6 md:p-10">
        <h2 class="text-lg md:text-xl font-bold text-black text-center mb-8">
            ขั้นตอนที่ 2 : เลือกหน้าบทคัดย่อเพื่อทำการประมวลผล
        </h2>

        <!-- Example pages reference -->
        <div class="p-4 md:p-8 border border-orange-200 rounded-xl mb-10 bg-orange-50/50 shadow-inner">
            <h3 class="text-base md:text-lg font-bold text-center text-black mb-6">ตัวอย่างหน้าที่ต้องเลือก</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-10">
                <div class="flex flex-col items-center gap-3">
                    <p class="text-sm md:text-base font-semibold text-gray-800 bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
                        หน้าบทคัดย่อภาษาไทย
                    </p>
                    <img
                        src={Abstract_th_page}
                        alt="Thai Abstract"
                        class="aspect-3/4 w-full max-w-60 border-4 border-white shadow-md rounded-lg object-cover"
                    />
                </div>
                <div class="flex flex-col items-center gap-3">
                    <p class="text-sm md:text-base font-semibold text-gray-800 bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
                        หน้าบทคัดย่อภาษาอังกฤษ
                    </p>
                    <img
                        src={Abstract_en_page}
                        alt="English Abstract"
                        class="aspect-3/4 w-full max-w-60 border-4 border-white shadow-md rounded-lg object-cover"
                    />
                </div>
            </div>

            <div class="mt-8 bg-white p-4 rounded-lg border border-orange-100 shadow-sm">
                <p class="font-bold text-gray-800 mb-2 text-sm md:text-base">เงื่อนไขในการเลือกหน้า:</p>
                <ul class="list-disc list-inside flex flex-col gap-1.5 text-sm text-gray-700">
                    <li>หน้าที่เลือกต้องมีโครงสร้างข้อมูลตรงกับหน้าตัวอย่าง</li>
                    <li>
                        ต้องเลือก <strong>ทั้งหน้าภาษาไทย และหน้าภาษาอังกฤษ</strong> รวมเป็น 2 หน้า
                    </li>
                </ul>
            </div>
        </div>

        <!-- Page thumbnail grid -->
        <div class="text-center mb-6">
            <p class="text-base md:text-lg font-bold text-gray-800">
                คลิกเลือกหน้าจากไฟล์ของคุณ (เลือก 2 หน้า)
            </p>
        </div>

        <div class="border border-gray-200 rounded-xl bg-gray-50/50 p-4 md:p-8 h-125 overflow-y-auto shadow-inner">
            <div class="flex flex-wrap justify-center gap-4 md:gap-8">
                {#each pageThumbnails as { id, src }, index (index)}
                    <button
                        class="group relative flex flex-col items-center gap-3 w-28 md:w-36 transition-all duration-200 bg-transparent border-none cursor-pointer
                            {selectedPages.includes(id)
                                ? 'scale-105'
                                : 'hover:scale-105 hover:-translate-y-1'}"
                        onclick={() => onTogglePage(id)}
                    >
                        <div
                            class="relative w-full aspect-[1/1.414] bg-white shadow-sm transition-all duration-200 flex items-center justify-center overflow-hidden rounded-md
                                {selectedPages.includes(id)
                                    ? 'ring-4 ring-orange-500 ring-offset-2 shadow-lg'
                                    : 'border border-gray-200 group-hover:border-orange-300 group-hover:shadow-md'}"
                        >
                            <img {src} alt="Page {id}" class="w-full h-full object-cover" />
                            {#if selectedPages.includes(id)}
                                <div class="absolute inset-0 bg-orange-500/20 mix-blend-multiply"></div>
                            {/if}
                        </div>

                        <span
                            class="text-gray-700 font-bold text-sm bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100 group-hover:text-orange-600 transition-colors"
                        >
                            หน้า {id}
                        </span>

                        {#if selectedPages.includes(id)}
                            <div
                                class="absolute -top-3 -right-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md z-10 animate-in zoom-in duration-200"
                            >
                                <FileCheckCorner class="h-4 w-4" />
                            </div>
                        {/if}
                    </button>
                {/each}
            </div>
        </div>

        <!-- Selection summary -->
        <div class="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6 text-center font-medium shadow-sm">
            <p class="text-base md:text-lg text-blue-900">
                หน้าที่คุณเลือกไว้:
                <span class="text-blue-700 font-bold">
                    {selectedPages.length === 0 ? 'ยังไม่ได้เลือกหน้า' : selectedPages.join(', ')}
                </span>
            </p>
        </div>
    </div>

    <!-- Navigation buttons -->
    <div class="max-w-5xl mx-auto flex flex-col-reverse md:flex-row justify-between gap-4 md:gap-8 mt-8">
        <button
            class="btn btn-outline w-full md:w-1/2 text-lg h-14 border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded-xl bg-white shadow-sm"
            onclick={onPrev}
        >
            ย้อนกลับ
        </button>
        <button
            class="w-full md:w-1/2 text-lg md:text-xl h-14 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors duration-300 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
            onclick={onNext}
            disabled={selectedPages.length !== 2}
        >
            ถัดไป (เลือกแล้ว {selectedPages.length}/2)
        </button>
    </div>
</section>
