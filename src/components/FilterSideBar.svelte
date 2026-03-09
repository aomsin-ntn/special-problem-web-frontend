<script lang="ts">
    import { ChevronUp, ChevronDown } from 'lucide-svelte';

    interface FilterOption {
        id: string;
        label: string;
    }

    interface FilterCategory {
        title: string;
        isOpen: boolean;
        options: FilterOption[];
        selected: string[]; 
    }

    let categories = $state<FilterCategory[]>([
        {
        title: "ปีการศึกษา",
        isOpen: true,
        selected: [],
        options: [
            { id: "2568", label: "2568" },
            { id: "2569", label: "2569" },
            { id: "2570", label: "2570" },
            { id: "2571", label: "2571" }
        ]
        },
        {
        title: "คณะ",
        isOpen: true,
        selected: ["science"], 
        options: [
            { id: "science", label: "วิทยาศาสตร์" },
            { id: "eng", label: "วิศวกรรมศาสตร์" },
            { id: "edu", label: "ครุศาสตร์" },
            { id: "agri", label: "เทคโนโลยีการเกษตร" }
        ]
        },
        {
        title: "สาขา",
        isOpen: true,
        selected: [],
        options: [
            { id: "cs", label: "ภาควิชาวิทยาการคอมพิวเตอร์" },
            { id: "chem", label: "ภาควิชาเคมี" },
            { id: "bio", label: "ภาควิชาชีววิทยา" },
            { id: "phys", label: "ภาควิชาฟิสิกส์" }
        ]
        }
    ]);

    const resetFilters = () => {
        categories.forEach(cat => cat.selected = []);
    };

    const toggleCategory = (index: number) => {
        categories[index].isOpen = !categories[index].isOpen;
    };
</script>

<aside class="w-full max-w-[320px] bg-white p-4 h-screen overflow-y-auto">
    <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-medium text-gray-800">Filter</h2>
        <button 
        onclick={resetFilters}
        class="border border-orange-500 text-orange-600 px-3 py-1 rounded text-sm font-semibold hover:bg-orange-50 transition-colors"
        >
        Reset
        </button>
    </div>

    <hr class="border-gray-300 mb-6" />

    <div class="space-y-8">
        {#each categories as category, i}
        <div class="filter-group">
            <button 
            onclick={() => toggleCategory(i)}
            class="flex justify-between items-center w-full mb-4 text-left group"
            >
            <span class="text-lg font-bold text-gray-900">{category.title}</span>
            {#if category.isOpen}
                <ChevronUp size={20} class="text-gray-900" />
            {:else}
                <ChevronDown size={20} class="text-gray-900" />
            {/if}
            </button>

            {#if category.isOpen}
            <div class="flex flex-col gap-4 pl-1">
                {#each category.options as option}
                <label class="flex items-center gap-3 cursor-pointer group">
                    <input 
                    type="checkbox" 
                    value={option.id}
                    bind:group={category.selected}
                    class="w-5 h-5 border-2 border-gray-400 rounded accent-black cursor-pointer"
                    />
                    <span class="text-lg text-gray-800 group-hover:text-black">
                    {option.label}
                    </span>
                </label>
                {/each}
            </div>
            {/if}
            
            <hr class="border-gray-200 mt-6" />
        </div>
        {/each}
    </div>
</aside>

<style>
    /* ปรับแต่ง Checkbox ให้ดูใกล้เคียงกับภาพ (Optional) */
    input[type="checkbox"] {
        appearance: none;
        -webkit-appearance: none;
        display: grid;
        place-content: center;
        background-color: #fff;
        margin: 0;
    }

    input[type="checkbox"]::before {
        content: "";
        width: 0.65em;
        height: 0.65em;
        transform: scale(0);
        transition: 120ms transform ease-in-out;
        box-shadow: inset 1em 1em black;
        clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
    }

    input[type="checkbox"]:checked::before {
        transform: scale(1);
    }

    input[type="checkbox"]:checked {
        border-color: black;
    }
</style>