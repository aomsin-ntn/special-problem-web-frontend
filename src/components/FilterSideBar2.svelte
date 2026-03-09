<script lang="ts">
    import { onMount } from 'svelte';
    import { ChevronUp, ChevronDown } from 'lucide-svelte';

    // --- Types ---
    interface Major {
        id: string;
        label: string;
    }

    interface Faculty {
        id: string;
        label: string;
        majors: Major[];
    }

    // --- State ---
    let faculties = $state<Faculty[]>([]);
    let selectedYears = $state<string[]>([]);
    let selectedFaculties = $state<string[]>([]);
    let selectedMajors = $state<string[]>([]);
    
    let isYearOpen = $state(true);
    let isFacultyOpen = $state(true);
    let isMajorOpen = $state(true);

    // คำนวณสาขาที่ควรแสดงผล (เฉพาะคณะที่ถูกเลือก)
    let visibleMajors = $derived.by(() => {
        if (selectedFaculties.length === 0) return [];
        return faculties
            .filter(f => selectedFaculties.includes(f.id))
            .flatMap(f => f.majors);
    });

    // --- Functions ---
    onMount(async () => {
        try {
            const response = await fetch('http://localhost:8000/api/filters/faculties');
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            faculties = await response.json();
        } catch (error) {
            console.error("Failed to fetch filters:", error);
        }
    });

    const resetAll = () => {
        selectedYears = [];
        selectedFaculties = [];
        selectedMajors = [];
    };
</script>

<aside class="w-full bg-white h-screen overflow-y-auto ">
    <section class="container">
        <div class="flex justify-between items-center mb-4">
            <p class="text-black text-base md:text-lg lg:text-x font-medium">
                Filter
            </p>
            <button onclick={resetAll} class="text-orange-500 border border-orange-500 px-4 py-1 rounded hover:bg-orange-50 transition-colors cursor-pointer">
            Reset
            </button>
        </div>
        <hr class="mb-6 border-gray-300" />

        <section class="mb-8">
            <button onclick={() => isYearOpen = !isYearOpen} class="flex justify-between w-full text-black text-base md:text-lg lg:text-x font-medium mb-4 cursor-pointer">
                ปีการศึกษา 
                <span>
                    {#if isYearOpen}
                        <ChevronUp />
                    {:else}
                        <ChevronDown />
                    {/if}
                </span>
            </button>
            {#if isYearOpen}
            <div class="flex flex-col gap-4 pl-2">
                {#each ['2568', '2569', '2570', '2571'] as year (year)}
                <label class="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" value={year} bind:group={selectedYears} class="accent-black cursor-pointer" />
                    <span class="text-gray-700">{year}</span>
                </label>
                {/each}
            </div>
            {/if}
        </section>

        <hr class="mb-6 border-gray-200" />

        <section class="mb-8">
            <button onclick={() => isFacultyOpen = !isFacultyOpen} class="flex justify-between w-full text-black text-base md:text-lg lg:text-x font-medium mb-4 cursor-pointer">
                คณะ - สาขา 
                <span>
                    {#if isFacultyOpen}
                        <ChevronUp />
                    {:else}
                        <ChevronDown />
                    {/if}
                </span>
            </button>
            {#if isFacultyOpen}
            <div class="flex flex-col gap-4">
                {#each faculties as faculty (faculty.id)}
                <label class="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" value={faculty.id} bind:group={selectedFaculties} class="w-5 h-5 accent-black cursor-pointer" />
                    <span class="text-gray-700">{faculty.label}</span>
                </label>
                {/each}
            </div>
            {/if}
        </section>

        <hr class="mb-6 border-gray-200" />

        <section class="mb-8">
            <button onclick={() => isMajorOpen = !isMajorOpen} class="flex justify-between w-full text-black text-base md:text-lg lg:text-x font-medium mb-4 cursor-pointer">
                สาขา 
                <span>
                    {#if isMajorOpen}
                        <ChevronUp />
                    {:else}
                        <ChevronDown />
                    {/if}
                </span>
            </button>
            {#if isMajorOpen}
            <div class="flex flex-col gap-4">
                {#if visibleMajors.length === 0}
                <p class="text-gray-400 text-sm">กรุณาเลือกคณะก่อน</p>
                {:else}
                {#each visibleMajors as major (major.id)}
                    <label class="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" value={major.id} bind:group={selectedMajors} class="w-5 h-5 accent-black cursor-pointer" />
                    <span class="text-gray-700">{major.label}</span>
                    </label>
                {/each}
                {/if}
            </div>
            {/if}
        </section>
    </section>
    
</aside>