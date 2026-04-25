<script lang="ts">
    import { ChevronUp, ChevronDown, RotateCcw } from 'lucide-svelte';

    interface Option { 
        id: string; 
        label: string;
    }
    interface Faculty extends Option { 
        departments: Option[]; 
    }
    interface Props {
        faculties?: Faculty[];
        selectedYears?: string[];
        selectedDepartments?: string[];
    }

    let { faculties = [], selectedYears = $bindable([]), selectedDepartments = $bindable([]) }: Props = $props(); 

    let openSections = $state<Record<string, boolean>>({ year: true, facultyDepartment: true });
    
    let openFaculties = $state<Record<string, boolean>>({});

    const currentBEYear = new Date().getFullYear() + 543;
    const recentYears = Array.from({ length: 7 }, (_, i) => String(currentBEYear - i));

    function toggleSection(section: string) { 
        openSections[section] = !openSections[section]; 
    }
    function toggleFaculty(facultyId: string) { 
        openFaculties[facultyId] = !openFaculties[facultyId]; 
    }

    function isAllDepartmentsSelected(faculty: Faculty): boolean {
        return faculty.departments.length > 0 && faculty.departments.every(d => selectedDepartments.includes(d.id));
    }

    function isSomeDepartmentsSelected(faculty: Faculty): boolean {
        const count = faculty.departments.filter(d => selectedDepartments.includes(d.id)).length;
        return count > 0 && count < faculty.departments.length;
    }

    function toggleAllDepartments(faculty: Faculty, checked: boolean) {
        const departmentIds = faculty.departments.map(d => d.id);
        if (checked) {
            selectedDepartments = [...new Set([...selectedDepartments, ...departmentIds])];
        } else {
            selectedDepartments = selectedDepartments.filter(id => !departmentIds.includes(id));
        }
    }

    function resetAll() {
        selectedYears = [];
        selectedDepartments = [];
    }
</script>

<aside class="w-full bg-white h-full pt-4 pr-2">
    <div class="sticky top-0 z-10 bg-white flex justify-between items-center mb-4 px-2 pb-4 border-b border-gray-600">
        <h2 class="text-black text-base md:text-lg font-bold">ตัวกรอง</h2>
        <button 
            type="button" 
            onclick={resetAll} 
            class="flex items-center gap-1 text-xs md:text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors border border-orange-500 rounded px-2 py-1 hover:bg-orange-50 bg-transparent cursor-pointer">
            <RotateCcw size={14} /> ล้างทั้งหมด
        </button>
    </div>

    <div class="space-y-4">
        <div class="flex flex-col">
            <button 
                type="button" 
                onclick={() => toggleSection('year')} 
                class="flex justify-between items-center w-full text-left font-semibold text-black mb-2 hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer">
                <span>ปีการศึกษา</span>
                {@render toggleIcon(openSections.year)}
            </button>
            {#if openSections.year}
                <div class="flex flex-col gap-1 pl-2">
                    {#each recentYears as year}
                        {@render yearCheckbox(year)}
                    {/each}
                </div>
            {/if}
        </div>

        <hr class="border-gray-600" />

        <div class="flex flex-col">
            <button 
                type="button" 
                onclick={() => toggleSection('facultyDepartment')} 
                class="flex justify-between items-center w-full text-left font-semibold text-black mb-2 hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer">
                <span>คณะ - ภาควิชา</span>
                {@render toggleIcon(openSections.facultyDepartment)}
            </button>

            {#if openSections.facultyDepartment}
                <div class="space-y-2">
                    {#if faculties.length === 0}
                        <p class="text-sm text-gray-400 italic px-2">กำลังโหลด...</p>
                    {:else}
                        {#each faculties as faculty}
                            <div class="flex flex-col">
                                <button 
                                    type="button" 
                                    onclick={() => toggleFaculty(faculty.id)} 
                                    class="flex justify-between items-center w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 transition-colors bg-transparent border-none cursor-pointer">
                                    <span class="text-sm font-semibold text-gray-800 leading-tight">{faculty.label}</span>
                                    {@render toggleIcon(openFaculties[faculty.id] ?? false)}
                                </button>

                                {#if openFaculties[faculty.id]}
                                    <div class="flex flex-col gap-1 pl-6 mt-1 mb-2">
                                        <label class="flex items-center gap-2 py-1 cursor-pointer group">
                                            <input type="checkbox" checked={isAllDepartmentsSelected(faculty)} indeterminate={isSomeDepartmentsSelected(faculty)} onchange={(e) => toggleAllDepartments(faculty, e.currentTarget.checked)} class="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer" />
                                            <span class="text-gray-700 text-sm font-medium group-hover:text-black transition-colors">ภาควิชาทั้งหมด</span>
                                        </label>
                                        {#each faculty.departments as department}
                                            <label class="flex items-center gap-2 py-1 cursor-pointer group">
                                                <input type="checkbox" value={department.id} bind:group={selectedDepartments} class="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer" />
                                                <span class="text-gray-700 text-sm group-hover:text-black transition-colors leading-tight">{department.label}</span>
                                            </label>
                                        {/each}
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    {/if}
                </div>
            {/if}
        </div>
    </div>
</aside>

{#snippet toggleIcon(isOpen: boolean)}
    {#if isOpen}
        <ChevronUp size={18} class="text-gray-400 shrink-0" />
    {:else}
        <ChevronDown size={18} class="text-gray-400 shrink-0" />
    {/if}
{/snippet}

{#snippet yearCheckbox(year: string)}
    <label class="flex items-center gap-2 py-1 cursor-pointer group">
        <input type="checkbox" value={year} bind:group={selectedYears} class="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer" />
        <span class="text-gray-700 text-sm md:text-base group-hover:text-black transition-colors">{year}</span>
    </label>
{/snippet}