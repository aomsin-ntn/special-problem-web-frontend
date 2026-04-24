<script lang="ts">
    interface Props {
        id?: string;
        departments?: string[];
        titleThai?: string;
        titleEnglish?: string;
        keywords?: string[];
    }

    let {
        id = '1',
        departments = [],
        titleThai = "ไม่มีชื่อโปรเจกต์",
        titleEnglish = "",
        keywords = []
    }: Props = $props();

    function handleClick() {
        window.location.href = `/project-detail?id=${id}`;
    }
</script>

<button
    type="button"
    onclick={handleClick}
    class="w-full max-w-60 h-85 bg-white rounded-xl border border-gray-600 shadow-sm px-5 py-5 flex flex-col gap-3 hover:-translate-y-2 transition-transform duration-300 cursor-pointer hover:shadow-lg text-left"
>
    <div class="flex flex-col gap-1.5  shrink-0">
        {#each departments as department (department)}
            <div class="badge badge-outline border-gray-600 bg-gray-600 text-gray-200 text-xs font-medium rounded-full ">
                {department}
            </div>
        {/each}
        
    </div>

    <hr class="border-gray-600 my-1"/>

    <div class="w-full flex flex-col gap-2 grow overflow-hidden">
        <h3 class="text-black line-clamp-3 text-ellipsis text-base font-semibold leading-snug">
            {titleThai}
        </h3>
        {#if titleEnglish}
            <p class="text-gray-400 line-clamp-3 text-ellipsis text-sm font-medium leading-snug">
                {titleEnglish}
            </p>
        {/if}
    </div>

    <hr class="border-gray-600 my-1"/>

    <div class="flex flex-col gap-1.5 shrink-0">
        {#each keywords.slice(0, 3) as keyword (keyword)}
            <p class="text-orange-600 truncate text-xs font-medium bg-orange-50 px-2 py-1 rounded">
                # {keyword}
            </p>
        {/each}
    </div>
</button>