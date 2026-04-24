<script lang="ts">
    import { ChevronDown } from 'lucide-svelte';
    
    // รับค่า Props ด้วย Svelte 5 Syntax และอนุญาตให้ bind:value กลับไปยัง Parent ได้
    let {
        value = $bindable(),
        options = [],
        placeholder = "ค้นหา...",
        defaultOptionText = "-- เลือก --",
        labelKey = "label",
        valueKey = "value",
        onchange = undefined,
        disabled = false
    } = $props();

    // จัดการ State ของช่องค้นหาและการเปิด/ปิด Dropdown
    let searchQuery = $state('');
    let isOpen = $state(false);

    // Effect เพื่ออัปเดตช่องค้นหาให้แสดงข้อความที่เลือกไว้
    $effect(() => {
        if (!isOpen) {
            if (value) {
                const selectedOpt = options.find(opt => opt[valueKey] === value);
                searchQuery = selectedOpt ? selectedOpt[labelKey] : '';
            } else {
                searchQuery = ''; 
            }
        }
    });

    //การเรียงตัวอักษร (Sort) การกรองข้อมูล (Filter) แบบอัตโนมัติ
    let filteredAndSortedOptions = $derived((() => {
        //เรียงลำดับตัวอักษร
        const sorted = [...options].sort((a, b) => {
            const textA = String(a[labelKey] || '');
            const textB = String(b[labelKey] || '');
            return textA.localeCompare(textB, 'th');
        });

        //ถ้าไม่ได้พิมพ์ค้นหา หรือ ข้อความในช่องค้นหาตรงกับค่าที่เลือกไปแล้ว ให้แสดงลิสต์ที่เรียงแล้วทั้งหมด
        if (!searchQuery || (value && options.find(opt => opt[valueKey] === value)?.[labelKey] === searchQuery)) {
            return sorted;
        }

        //กรองข้อมูลตามคำที่พิมพ์ (Case-insensitive)
        return sorted.filter(opt => {
            const text = String(opt[labelKey] || '').toLowerCase();
            return text.includes(searchQuery.toLowerCase());
        });
    })());

    // ฟังก์ชันเมื่อผู้ใช้คลิกเลือก Option
    const handleSelect = (selectedValue: any, selectedLabel: string) => {
        const isChanged = value !== selectedValue;
        value = selectedValue;
        searchQuery = selectedLabel; 
        isOpen = false;         
        if (isChanged && onchange) onchange();   
    };

    const handleClear = () => {
        const isChanged = value !== '';
        value = '';
        searchQuery = '';
        isOpen = false;
        
        if (isChanged && onchange) onchange();
    };

    // ฟังก์ชันเมื่อผู้ใช้คลิกออกจากช่อง Inputล
    const handleBlur = () => {
        setTimeout(() => {
            isOpen = false;
            // หากพิมพ์ค้างไว้แล้วไม่ได้กดเลือกใคร ให้คืนค่า Input กลับเป็น Label ของค่าที่เลือกไว้เดิม
            const selectedOpt = options.find(opt => opt[valueKey] === value);
            searchQuery = selectedOpt ? selectedOpt[labelKey] : '';
        }, 200);
    };
</script>

<div class="relative w-full">
    <input
        type="text"
        bind:value={searchQuery}
        onfocus={() => isOpen = true}
        onblur={handleBlur}
        oninput={() => { if (!disabled) { isOpen = true; value = ''; } }}
        class="input input-bordered w-full bg-gray-600 text-gray-200 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-200 {disabled ? 'opacity-50 cursor-not-allowed bg-gray-700 text-gray-600' : ''}"
        {placeholder}
        {disabled}
    />

    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-700">
        <ChevronDown class="w-5 h-5 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" />
    </div>
    
    {#if isOpen}
        <ul class="absolute z-50 w-full mt-1 max-h-56 overflow-y-auto bg-gray-600  rounded-xl shadow-2xl custom-scrollbar">

            <li class="bg-gray-100 px-4 py-2.5 text-sm text-gray-400 border-b border-gray-600/50 last:border-b-0">
                <button type="button" onclick={handleClear} class="cursor-pointer hover:text-orange-500 transition-colors block w-full text-left">
                    {defaultOptionText}
                </button>
            </li>
            
            {#each filteredAndSortedOptions as opt}
                <li class="border-b border-gray-600/90 last:border-b-0">
                    <button
                        type="button"
                        onclick={() => handleSelect(opt[valueKey], opt[labelKey])}
                        class="w-full bg-white text-left px-4 py-2.5 text-sm cursor-pointer hover:bg-orange-500 hover:text-white text-gray-200 transition-colors block"
                    >
                        {opt[labelKey]}
                    </button>
                </li>
            {/each}
            
            {#if filteredAndSortedOptions.length === 0}
                <li class="px-4 py-3 text-center text-sm text-gray-400">
                    ไม่พบข้อมูลที่ค้นหา
                </li>
            {/if}
        </ul>
    {/if}
</div>

<style>
    /* ซ่อน Scrollbar ที่ไม่จำเป็นแต่ยัง Scroll ได้ เพื่อความสวยงาม */
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #4b5563; border-radius: 10px; }
</style>