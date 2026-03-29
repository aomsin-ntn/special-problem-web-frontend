<script lang="ts">
    interface Props {
        id?: string;
        titleThai?: string;
        titleEnglish?: string;
        keywords?: string[];
    }

    let {
        id = '1',
        titleThai = "ชื่อโปรเจคภาษาไทย",
        titleEnglish = "ชื่อโปรเจคภาษาอังกฤษ",
        keywords = []
    }: Props = $props();

    function handleClick() {
        window.location.href = `/project-detail?id=${id}`;
    }
</script>

<button
    onclick={handleClick}
    class="w-full max-w-58 h-80 bg-white rounded-xl border border-gray-200 shadow-md px-5 py-4 flex flex-col gap-3 
            hover:scale-105 transition-transform duration-300 cursor-pointer hover:shadow-lg "
>
    <div>
        <p class="text-black text-sm md:text-sm lg:text-sm font-light text-start">
            ปัญหาพิเศษ
        </p>
    </div>

    <hr class="border-gray-500"/>

    <div class="w-full flex flex-col gap-2 text-start">
        <p class="text-black line-clamp-2 text-ellipsis text-lg font-medium">
            {titleThai}
        </p>
        <p class="text-black line-clamp-2 text-ellipsis text-sm font-medium">
            {titleEnglish}
        </p>
    </div>

    <hr class="border-gray-500"/>

    <div class="flex flex-col gap-2 text-start">
        {#each keywords.slice(0, 3) as keyword, index (index)}
            <p class="text-gray-800 truncate text-sm md:text-sm lg:text-sm font-light">
                {keyword}
            </p>
        {/each}
    </div>

</button>