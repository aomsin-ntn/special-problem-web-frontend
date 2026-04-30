<script lang="ts">
    import { onMount, untrack } from 'svelte';
    import { goto } from '$app/navigation';
    import { PUBLIC_API_URL } from '$env/static/public';
    import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-svelte';
    import SearchableDropdown from '$lib/components/SearchableDropdown.svelte';
    import Swal from 'sweetalert2';

    let faculties = $state<any[]>([]);
    let projects = $state<any[]>([]);
    let isLoading = $state<boolean>(true);
    let errorMessage = $state<string | null>(null);

    // Filter States
    let selectedYear = $state<string>('');
    let selectedFaculty = $state<string>('');
    let selectedDepartment = $state<string>('');
    let sortBy = $state<string>('student_id-asc');

    let currentPage = $state<number>(1);
    const itemsPerPage = 20;

    let totalItems = $state<number>(0);
    let totalPages = $state<number>(1);

    //สร้างปีการศึกษา 8 ปีย้อนหลัง
    const currentBEYear = new Date().getFullYear() + 543;
    const recentYears = Array.from({ length: 8 }, (_, i) => String(currentBEYear - i));

    //Derived Rune: ดึงรายชื่อสาขาเมื่อมีการเลือกคณะ
    let availableDepartments = $derived(() => {
        if (!selectedFaculty) return [];
        const fac = faculties.find(f => f.id === selectedFaculty);
        return fac ? fac.departments : [];
    });

    function goToPage(pageNum: number) {
        if (pageNum >= 1 && pageNum <= totalPages) {
            currentPage = pageNum;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function formatDate(dateString: string) {
        if (!dateString) return "-";
        const date = new Date(dateString);
        
        const formatter = new Intl.DateTimeFormat('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // ใช้รูปแบบ 24 ชั่วโมง [cite: 12]
            timeZone: 'UTC' // บังคับ Timezone เป็น UTC อย่างเคร่งครัด
        });

        return `${formatter.format(date)} (UTC)`;
    }

    function handleSortColumn(column: string) {
        const [currentColumn, currentOrder] = sortBy.split('-');
        
        if (currentColumn === column) {
            // ถ้าคลิกคอลัมน์เดิม ให้สลับ asc -> desc -> asc
            sortBy = `${column}-${currentOrder === 'asc' ? 'desc' : 'asc'}`;
        } else {
            // ถ้าเปลี่ยนคอลัมน์ใหม่ ให้เริ่มที่ asc เสมอ
            sortBy = `${column}-asc`; 
        }
    }

    onMount(async () => {
        try {
            // โหลด Master Data ของคณะและสาขา
            const resFac = await fetch(`${PUBLIC_API_URL}/project/get_faculty`);
            if (resFac.ok) {
                const data = await resFac.json();
                faculties = data.map((item: any) => ({
                    id: item.faculty.faculty_id,
                    label: item.faculty.faculty_name_th,
                    departments: item.departments.map((d: any) => ({
                        id: d.department_id, label: d.department_name_th 
                    }))
                }));
            }
        } catch (e) {
            console.error(e);
        }
    });

    // Effect Rune: ดึงข้อมูลเมื่อ Filter หรือ Page เปลี่ยนแปลง
    $effect(() => {
        selectedYear;
        selectedFaculty;
        selectedDepartment;
        sortBy;
        
        untrack(() => {
            if (currentPage !== 1) currentPage = 1;
        });
    });

    $effect(() => {
        const fetchReport = async () => {
            isLoading = true;
            errorMessage = null;
            try {
                const queryParams = new URLSearchParams();
                queryParams.append('page', currentPage.toString());
                queryParams.append('limit', itemsPerPage.toString());
                
                if (selectedYear) queryParams.append('year', selectedYear);

                if (selectedDepartment) {
                    // 1. ถ้าเลือกสาขาเจาะจงแล้ว ให้ส่งแค่สาขานั้นไป
                    queryParams.append('department', selectedDepartment);
                } else if (selectedFaculty) {
                    // 2. ถ้าเลือกแค่คณะ (แต่ยังไม่เลือกสาขา) ให้ดึงสาขาทั้งหมดในคณะนั้นส่งไป
                    const depts = availableDepartments();
                    depts.forEach((dept: any) => queryParams.append('department', dept.id));
                }
                
                const [sorted_by, order] = sortBy.split('-');
                if (sorted_by && order) {
                    queryParams.append('sorted_by', sorted_by);
                    queryParams.append('order', order);
                }

                // เรียก API ไปที่ Endpoint /report ที่มีตัวล็อก RBAC
                const response = await fetch(`${PUBLIC_API_URL}/report/projects?${queryParams.toString()}`, {
                    credentials: 'include'
                });
                console.log('API Response:', response);

                if (response.status === 403 || response.status === 401) {
                    errorMessage = "คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะเจ้าหน้าที่และอาจารย์)";
                    projects = [];
                    return;
                } else if (response.status === 401) {
                    Swal.fire('ปฏิเสธการเข้าถึง', 'กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้านี้', 'error');
                    goto('/login');
                    return;
                }

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
                errorMessage = "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์";
                projects = [];
                totalItems = 0;
                totalPages = 1;
            } finally {
                isLoading = false;
            }
        };

        fetchReport();
    });
</script>

<main class="min-h-screen bg-white p-4 md:p-8">
    <div class="max-w-7xl mx-auto bg-white rounded-xl shadow-md border border-gray-600 overflow-hidden">
        
        <div class="bg-orange-500 p-6">
            <h1 class="text-2xl font-bold text-white">รายงานการอัปโหลดปัญหาพิเศษ</h1>
            <p class="text-orange-100 mt-1">ภาพรวมข้อมูลปัญหาพิเศษทั้งหมดในระบบ</p>
        </div>

        <div class="p-6 bg-gray-100">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div class="flex flex-col">
                    <label for="year-filter" class="text-sm font-semibold text-gray-700 mb-1">ปีการศึกษา</label>
                    <SearchableDropdown 
                        bind:value={selectedYear} 
                        placeholder="ปี..." defaultOptionText="ทั้งหมด" valueKey="id"
                        options={recentYears.map(y => ({ id: y, label: y }))}
                    />
                </div>

                <div class="flex flex-col">
                    <label for="faculty-filter" class="text-sm font-semibold text-gray-700 mb-1">คณะ</label>
                    <SearchableDropdown 
                        bind:value={selectedFaculty} 
                        onchange={() => selectedDepartment = ''}
                        placeholder="ค้นหาคณะ..." 
                        defaultOptionText="ทั้งหมด" 
                        valueKey="id"
                        options={faculties}
                    />
                </div>

                <div class="flex flex-col">
                    <label for="department-filter" class="text-sm font-semibold text-gray-700 mb-1">ภาควิชา</label>
                    <SearchableDropdown 
                        bind:value={selectedDepartment} 
                        disabled={!selectedFaculty}
                        placeholder="ค้นหาภาควิชา..." defaultOptionText="ทั้งหมด" valueKey="id"
                        options={availableDepartments()}
                    />
                </div>
            </div>
        </div>

        {#if !isLoading && !errorMessage && totalItems > 0}
            <div class="px-6 pb-3 bg-gray-100 flex justify-between items-center border-b border-gray-600">
                <p class="text-sm text-gray-700">
                    แสดง <span class="font-bold text-orange-500">{projects.length}</span> รายการ 
                    จากทั้งหมด <span class="font-bold text-orange-500">{totalItems}</span> รายการ
                </p>
            </div>
        {/if}

        <div class="p-0 overflow-x-auto">
            {#if errorMessage}
                <div class="p-10 text-center text-red-500 font-semibold bg-red-50">
                    <p class="text-xl">{errorMessage}</p>
                </div>
            {:else if isLoading}
                <div class="p-20 flex justify-center">
                    <span class="loading loading-spinner loading-lg text-orange-500"></span>
                </div>
            {:else if projects.length === 0}
                <div class="p-20 text-center text-gray-500 font-medium">ไม่พบข้อมูลที่ตรงกับเงื่อนไข</div>
            {:else}
                <table class="table w-full">
                    <thead class="bg-gray-600 text-gray-700">
                        <tr>
                            <th class="py-4 pl-6 text-sm font-bold cursor-pointer hover:bg-gray-400 transition-colors select-none" onclick={() => handleSortColumn('student_id')}>
                                <div class="flex items-center gap-1">
                                    รหัสนักศึกษา
                                    {@render sortIcon('student_id')}
                                </div>
                            </th>
                            
                            <th class="py-4 text-sm font-bold cursor-pointer hover:bg-gray-400 transition-colors select-none" onclick={() => handleSortColumn('user_name_th')}>
                                <div class="flex items-center gap-1">
                                    ชื่อนักศึกษา
                                    {@render sortIcon('user_name_th')}
                                </div>
                            </th>

                            <th class="py-4 text-sm font-bold w-1/3 cursor-pointer hover:bg-gray-400 transition-colors select-none" onclick={() => handleSortColumn('title_th')}>
                                <div class="flex items-center gap-1">
                                    ชื่อปัญหาพิเศษ (ไทย)
                                    {@render sortIcon('title_th')}
                                </div>
                            </th>

                            <th class="py-4 text-sm font-bold cursor-pointer hover:bg-gray-400 transition-colors select-none" onclick={() => handleSortColumn('academic_year')}>
                                <div class="flex items-center gap-1">
                                    ปีการศึกษา
                                    {@render sortIcon('academic_year')}
                                </div>
                            </th>

                            <th class="py-4 text-sm font-bold cursor-pointer hover:bg-gray-400 transition-colors select-none" onclick={() => handleSortColumn('created_at')}>
                                <div class="flex items-center gap-1">
                                    อัปโหลดเมื่อ
                                    {@render sortIcon('created_at')}
                                </div>
                            </th>

                            <th class="py-4 text-sm font-bold text-center cursor-pointer hover:bg-gray-400 transition-colors select-none" onclick={() => handleSortColumn('downloaded_count')}>
                                <div class="flex items-center justify-center gap-1">
                                    ดาวน์โหลด
                                    {@render sortIcon('downloaded_count')}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        {#each projects as item}
                            {@const hasTh = !!item.project.title_th}
                            <tr 
                                onclick={() => goto(`/project-detail?id=${item.project.project_id}`)}
                                class="hover:bg-orange-50 cursor-pointer transition-colors"
                            >
                                <td class="pl-6 py-4">
                                    {#each item.users as user}
                                        <div class="font-mono text-gray-700">{user.student_id}</div>
                                    {/each}
                                </td>
                                <td class="py-4">
                                    {#each item.users as user}
                                        <div class="text-sm text-gray-700">
                                            {hasTh ? user.user_name_th  : user.user_name_en}
                                        </div>
                                    {/each}
                                </td>
                                <td class="py-4">
                                    <div class="font-semibold text-gray-700 line-clamp-2">
                                        {hasTh ? item.project.title_th : item.project.title_en}
                                    </div>
                                    <div class="text-xs text-gray-700 mt-1 line-clamp-1">{item.department?.department_name_th}</div>
                                </td>
                                <td class="py-4 text-gray-700">{item.project.academic_year_be}</td>
                                <td class="py-4 text-gray-700 text-xs">{formatDate(item.project.created_at)}</td>
                                <td class="py-4 text-center">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {item.project.downloaded_count}
                                    </span>
                                </td>
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
    {#if sortBy === `${column}-asc`}
        <ArrowUp size={16} class="text-orange-500 font-bold" />
    {:else if sortBy === `${column}-desc`}
        <ArrowDown size={16} class="text-orange-500 font-bold" />
    {:else}
        <ArrowUpDown size={16} class="text-gray-300 opacity-50" />
    {/if}
{/snippet}