<script lang="ts">
    export let category: string = "ปัญหาพิเศษ";
    export let titleThai: string = "ชื่อโปรเจคภาษาไทย";
    export let titleEnglish: string = "ชื่อโปรเจคภาษาอังกฤษ";
    export let keywords: string[] = [];
</script>

<div class="w-full max-w-58 h-80 bg-white rounded-xl border border-gray-200 shadow-md px-5 py-4 flex flex-col gap-4 
            hover:scale-105 transition-transform duration-300 cursor-pointer">
    <div class="pb-3 border-b border-gray-500">
        <h5 class="text-black">
            {category}
        </h5>
    </div>

    <div class="w-full flex flex-col gap-2">
        <p class="text-black line-clamp-2 text-ellipsis">
            {titleThai}
        </p>
        <p class="text-black line-clamp-2 text-ellipsis">
            {titleEnglish}
        </p>
    </div>

    <hr class="border-gray-500" />

    <div class="flex flex-col gap-2">
        {#each keywords.slice(0, 3) as keyword}
            <h5 class="text-gray-800 truncate">
                {keyword}
            </h5>
        {/each}
    </div>

</div>