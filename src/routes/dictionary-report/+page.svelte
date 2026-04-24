<script lang="ts">
    import { onMount, untrack } from 'svelte';
    import { PUBLIC_API_URL } from '$env/static/public';
    import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-svelte';

    let activeTab = $state<string>('incorrect'); // ค่าเริ่มต้นคือแท็บ Incorrect
    let dictData = $state<any[]>([]);
    let isLoading = $state<boolean>(true);
    let errorMessage = $state<string | null>(null);

    let currentPage = $state<number>(1);
    const itemsPerPage = 20;

    let totalItems = $state<number>(0);
    let totalPages = $state<number>(1);

    // Sorting State
    let sortBy = $state<string>('');
    let sortOrder = $state<string>('desc');

    // โครงสร้างของ Tabs
    const tabs = [
        { id: 'incorrect', label: 'รายการคำผิดที่พบ' },
        { id: 'correction', label: 'พจนานุกรมคำถูก-คำผิด' },
        { id: 'custom', label: 'พจนานุกรมกำหนดเอง' }
    ];

    function goToPage(pageNum: number) {
        if (pageNum >= 1 && pageNum <= totalPages) {
            currentPage = pageNum;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function formatDate(dateString: string) {
        if (!dateString) return "-";
        const date = new Date(dateString);
        
        // รูปแบบวันที่: 20 เม.ย. 2569
        const datePart = date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // รูปแบบเวลา: 17:30
        const timePart = date.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // ใช้รูปแบบ 24 ชั่วโมง
        });

        return `${datePart} ${timePart} น.`;
    }

    function handleSortColumn(column: string) {
        if (sortBy === column) {
            sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            sortBy = column;
            sortOrder = 'asc'; // เปลี่ยนคอลัมน์ใหม่ให้เริ่มที่ asc เสมอ
        }
    }

    // Effect จัดการตอนสลับ Tab (รีเซ็ตค่ากลับไปหน้าแรกเสมอ)
    $effect(() => {
        activeTab;
        untrack(() => {
            currentPage = 1;
            sortBy = ''; // ล้างค่าการจัดเรียงเมื่อสลับแท็บ
            sortOrder = 'desc';
        });
    });

    // Effect สำหรับการดึงข้อมูลจาก API
    $effect(() => {
        const fetchReport = async () => {
            isLoading = true;
            errorMessage = null;
            try {
                const queryParams = new URLSearchParams();
                queryParams.append('table_type', activeTab);
                queryParams.append('page', currentPage.toString());
                queryParams.append('limit', itemsPerPage.toString());
                
                if (sortBy) {
                    queryParams.append('sorted_by', sortBy);
                    queryParams.append('order', sortOrder);
                }

                const response = await fetch(`${PUBLIC_API_URL}/report/dictionary?${queryParams.toString()}`, {
                    credentials: 'include'
                });

                if (response.status === 403 || response.status === 401) {
                    errorMessage = "คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะเจ้าหน้าที่และอาจารย์)";
                    dictData = [];
                    return;
                }

                if (response.ok) {
                    const responseData = await response.json();
                    dictData = responseData.data || [];
                    totalItems = responseData.metadata?.total_items ?? 0;
                    totalPages = responseData.metadata?.total_pages ?? 1;
                } else {
                    dictData = [];
                    totalItems = 0;
                    totalPages = 1;
                }
            } catch (error) {
                errorMessage = "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์";
                dictData = [];
            } finally {
                isLoading = false;
            }
        };

        fetchReport();
    });
</script>

<main class="min-h-screen bg-gray-50 p-4 md:p-8">
    <div class="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-600 overflow-hidden">
        
        <div class="bg-orange-500 p-6">
            <h1 class="text-2xl font-bold text-white">รายงานพจนานุกรมระบบ (Dictionary Report)</h1>
            <p class="text-orange-100 mt-1">ภาพรวมข้อมูลคำผิดและการจัดการพจนานุกรมในระบบ</p>
        </div>

        <div class="bg-gray-100 px-6 pt-4 flex gap-2 overflow-x-auto">
            {#each tabs as tab}
                <button 
                    onclick={() => activeTab = tab.id}
                    class="px-6 py-3 font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap
                    {activeTab === tab.id ? 'bg-white text-orange-500 border-t border-l border-r border-gray-500' : 'bg-transparent text-gray-300 hover:bg-gray-400 hover:text-gray-900'}"
                >
                    {tab.label}
                </button>
            {/each}
        </div>

        {#if !isLoading && !errorMessage && totalItems > 0}
            <div class="px-6 py-3 bg-gray-100 flex justify-between items-center border-b border-gray-600">
                <p class="text-sm text-gray-700">
                    แสดง <span class="font-bold text-orange-500">{dictData.length}</span> รายการ 
                    จากทั้งหมด <span class="font-bold text-orange-500">{totalItems}</span> รายการ
                </p>
            </div>
        {/if}

        <div class="p-0 overflow-x-auto bg-white">
            {#if errorMessage}
                <div class="p-10 text-center text-red-500 font-semibold bg-red-50 border-t border-red-200">
                    <p class="text-xl">{errorMessage}</p>
                </div>
            {:else if isLoading}
                <div class="p-20 flex justify-center">
                    <span class="loading loading-spinner loading-lg text-orange-500"></span>
                </div>
            {:else if dictData.length === 0}
                <div class="p-20 text-center text-gray-500 font-medium text-lg">ไม่พบข้อมูลในตารางนี้</div>
            {:else}
                <table class="table w-full">
                    <thead class="bg-gray-600 text-gray-700">
                        <tr>
                            {#if activeTab === 'incorrect'}
                                <th class="py-4 pl-6 text-sm font-bold cursor-pointer hover:bg-gray-400 select-none w-1/3" onclick={() => handleSortColumn('incorrect_word')}>
                                    <div class="flex items-center gap-1">คำผิด {@render sortIcon('incorrect_word')}</div>
                                </th>
                                <th class="py-4 text-sm font-bold cursor-pointer hover:bg-gray-400 select-none w-1/3" onclick={() => handleSortColumn('correct_word')}>
                                    <div class="flex items-center gap-1">คำที่ถูกแก้ไข {@render sortIcon('correct_word')}</div>
                                </th>
                                <th class="py-4 text-sm font-bold cursor-pointer hover:bg-gray-400 select-none text-center" onclick={() => handleSortColumn('count')}>
                                    <div class="flex items-center justify-center gap-1">จำนวนครั้งที่ถูกแก้ไข {@render sortIcon('count')}</div>
                                </th>

                            {:else if activeTab === 'correction'}
                                <th class="py-4 pl-6 text-sm font-bold cursor-pointer hover:bg-gray-400 select-none" onclick={() => handleSortColumn('incorrect_word')}>
                                    <div class="flex items-center gap-1">คำผิด {@render sortIcon('incorrect_word')}</div>
                                </th>
                                <th class="py-4 text-sm font-bold">
                                    <div class="flex items-center gap-1">รายการคำถูกต้องที่เป็นไปได้</div>
                                </th>
                                <th class="py-4 text-sm font-bold cursor-pointer hover:bg-gray-400 select-none text-center" onclick={() => handleSortColumn('count')}>
                                    <div class="flex items-center justify-center gap-1">จำนวนครั้งที่ถูกแก้ไข {@render sortIcon('count')}</div>
                                </th>
                                
                                <th class="py-4 text-sm font-bold cursor-pointer hover:bg-gray-400 select-none" onclick={() => handleSortColumn('created_at')}>
                                    <div class="flex items-center gap-1">สร้างเมื่อ {@render sortIcon('created_at')}</div>
                                </th>
                                <th class="py-4 text-sm font-bold cursor-pointer hover:bg-gray-400 select-none" onclick={() => handleSortColumn('updated_at')}>
                                    <div class="flex items-center gap-1">แก้ไขล่าสุด {@render sortIcon('updated_at')}</div>
                                </th>

                            {:else if activeTab === 'custom'}
                                <th class="py-4 pl-6 text-sm font-bold cursor-pointer hover:bg-gray-400 select-none" onclick={() => handleSortColumn('cus_word')}>
                                    <div class="flex items-center gap-1">คำศัพท์ที่เพิ่มในระบบ {@render sortIcon('cus_word')}</div>
                                </th>
                            {/if}
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        {#each dictData as item}
                            <tr class="hover:bg-orange-50 transition-colors">
                                {#if activeTab === 'incorrect'}
                                    <td class="pl-6 py-4 font-medium text-red-600">{item.incorrect_word}</td>
                                    <td class="py-4 font-medium text-green-700">{item.correct_word}</td>
                                    <td class="py-4 text-center">
                                        <span class="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white">{item.count}</span>
                                    </td>
                                {:else if activeTab === 'correction'}
                                    <td class="pl-6 py-4 font-medium text-red-600">{item.incorrect_word}</td>
                                    <td class="py-4">
                                        <div class="flex flex-wrap gap-1">
                                            {#each item.correct_word_list || [] as cw}
                                                <span class="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-md">{cw}</span>
                                            {/each}
                                        </div>
                                    </td>
                                    <td class="py-4 text-center">
                                        <span class="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white">{item.count}</span>
                                    </td>

                                    <td class="py-4 text-gray-700 text-xs">{formatDate(item.created_at)}</td>
                                    <td class="py-4 text-gray-700 text-xs">{formatDate(item.updated_at)}</td>
                                {:else if activeTab === 'custom'}
                                    <td class="pl-6 py-4 font-medium text-gray-800">{item.cus_word}</td>
                                {/if}
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        </div>

        {#if totalPages > 1 && !isLoading}
            <div class="flex justify-center items-center gap-2 py-6 border-t border-gray-600 bg-white">
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
</main>

{#snippet sortIcon(column: string)}
    {#if sortBy === column}
        {#if sortOrder === 'asc'}
            <ArrowUp size={16} class="text-orange-500 font-bold" />
        {:else}
            <ArrowDown size={16} class="text-orange-500 font-bold" />
        {/if}
    {:else}
        <ArrowUpDown size={16} class="text-gray-300 opacity-50" />
    {/if}
{/snippet}