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
        selectedDepartments?:string[];
    }

    let {
        faculties = [],
        selectedYears = $bindable([]),
        selectedDepartments = $bindable([])
    }: Props = $props(); 

    let openSections = $state<Record<string, boolean>>({
        year: true,
        facultyDepartment: true,
    });

    let openFaculties = $state<Record<string, boolean>>({});

    $effect(() => {
        openFaculties = Object.fromEntries(faculties.map(f => [f.id, false]));
    });

    const currentBEYear = new Date().getFullYear() + 543;
    const recentYears = Array.from({ length: 4 }, (_, i) => String(currentBEYear - i));

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
    <div class="sticky top-0 z-10 bg-white flex justify-between items-center mb-4 px-2 pb-4 -mx-2 border-b border-gray-600">
        <h2 class="text-black text-base md:text-lg lg:text-xl font-bold">ตัวกรอง</h2>
        <button 
            onclick={resetAll}
            class="flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors border border-orange-500 rounded px-2 py-1 hover:bg-orange-50 cursor-pointer"
        >
            <RotateCcw size={14} /> ล้างทั้งหมด
        </button>
    </div>

    <div class="space-y-4">
        <div class="filter-group">
            <button onclick={() => toggleSection('year')} class="section-trigger cursor-pointer">
                <span>ปีการศึกษา</span>
                {@render toggleIcon(openSections.year)}
            </button>

            {#if openSections.year}
                <div class="options-container">
                    {#each recentYears as year}
                        {@render yearCheckbox(year)}
                    {/each}
                </div>
            {/if}
        </div>

        <hr class="border-gray-600" />

        <div class="filter-group">
            <button onclick={() => toggleSection('facultyDepartment')} class="section-trigger cursor-pointer">
                <span>คณะ - สาขาวิชา</span>
                {@render toggleIcon(openSections.facultyDepartment)}
            </button>

            {#if openSections.facultyDepartment}
                <div class="space-y-1">
                    {#if faculties.length === 0}
                        <p class="text-sm text-gray-400 italic px-1">กำลังโหลด...</p>
                    {:else}
                        {#each faculties as faculty}
                            <div class="faculty-group">
                                <button onclick={() => toggleFaculty(faculty.id)} class="faculty-trigger">
                                    <span class="text-sm font-semibold text-gray-800">{faculty.label}</span>
                                    {@render toggleIcon(openFaculties[faculty.id] ?? false)}
                                </button>

                                {#if openFaculties[faculty.id]}
                                    <div class="options-container pl-4 mt-1 ">
                                        <label class="flex items-center gap-2 py-1 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={isAllDepartmentsSelected(faculty)}
                                                indeterminate={isSomeDepartmentsSelected(faculty)}
                                                onchange={(e) => toggleAllDepartments(faculty, e.currentTarget.checked)}
                                                class="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer"
                                            />
                                            <span class="text-gray-700 text-sm font-medium group-hover:text-black transition-colors">สาขาทั้งหมด</span>
                                        </label>
                                        {#each faculty.departments as department}
                                            <label class="flex items-center gap-2 py-1 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    value={department.id}
                                                    bind:group={selectedDepartments}
                                                    class="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer"
                                                />
                                                <span class="text-gray-700 text-sm group-hover:text-black transition-colors">{department.label}</span>
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
        <ChevronUp size={18} class="text-gray-400" />
    {:else}
        <ChevronDown size={18} class="text-gray-400" />
    {/if}
{/snippet}

{#snippet yearCheckbox(year: string)}
    <label class="flex items-center gap-2 py-1 cursor-pointer group">
        <input
            type="checkbox"
            value={year}
            bind:group={selectedYears}
            class="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer"
        />
        <span class="text-gray-700 text-base group-hover:text-black transition-colors">{year}</span>
    </label>
{/snippet}

<style>
    .section-trigger {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        text-align: left;
        font-weight: 600;
        color: black;
        margin-bottom: 0.75rem;
        transition: opacity 150ms;
    }

    .section-trigger:hover {
        opacity: 0.7;
    }

    .faculty-trigger {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        text-align: left;
        padding: 0.375rem 0.25rem;
        border-radius: 0.25rem;
        transition: background-color 150ms;
    }

    .faculty-trigger:hover {
        background-color: rgb(249 250 251);
    }

    .options-container {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding-left: 0.5rem;
    }
</style>