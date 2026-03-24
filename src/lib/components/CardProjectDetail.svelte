<script lang="ts">
    import { UserRound, CalendarDays } from 'lucide-svelte';

    interface Props {
        faculty?: string;
        major?: string;
        titleThai?: string;
        titleEnglish?: string;
        author?: string[];
        advisor?: string[];
        semester?: string;
        keywords?: string[];
    }

    let {
        faculty = "คณะวิทยาศาสตร์",
        major = "คณิตศาสตร์",
        titleThai = "ชื่อโปรเจคภาษาไทย",
        titleEnglish = "ชื่อโปรเจคภาษาอังกฤษ",
        author = [],
        advisor = [],
        semester = "ปีการศึกษา 2567",
        keywords = []
    }: Props = $props();
    
</script>

<div class="w-full bg-white rounded-xl border border-gray-200 shadow-md p-4 flex flex-wrap gap-6 
            hover:scale-101 transition-transform duration-300 cursor-pointer">

    <img src="https://placehold.co/165x250" alt="Project Thumbnail"/>

    <div class="flex flex-col gap-4">
        <div class="flex gap-2">
            <div class="badge badge-outline border-orange-100 text-orange-100">{faculty}</div>
            <div class="badge badge-outline border-orange-700 text-orange-700">{major}</div>
        </div>

        <p class="text-black line-clamp-2 text-ellipsis text-sm md:text-base lg:text-base font-medium">
            {titleThai}
        </p>
        <p class="text-black line-clamp-2 text-ellipsis text-sm md:text-base lg:text-base font-medium">
            {titleEnglish}
        </p>

        <div class="w-full flex flex-wrap gap-20">
            <div class="flex flex-col gap-4">
                {#each author as authorName, index (index)}
                    <p class="text-black truncate text-sm md:text-sm lg:text-sm font-light flex items-center gap-2">
                        <UserRound class="w-4 h-4" /><span>{authorName}</span>
                    </p>
                {/each}
            </div>

            <div class="flex flex-col gap-2">
                {#each advisor as advisorName, index (index)}
                    <p class="text-black truncate text-sm md:text-sm lg:text-sm font-light flex items-center gap-2">
                        <UserRound class="w-4 h-4" /><span>{advisorName}</span>
                    </p>
                {/each}
            </div>
        </div>

        <p class="text-black truncate text-sm md:text-sm lg:text-sm font-light flex items-center gap-2">
            <CalendarDays class="w-4 h-4" /><span>{semester}</span>
        </p>
        
        <div class="flex flex-wrap gap-4">
            {#each keywords as keyword, index (index)}
                <div class="badge bg-pink-100 border-pink-100 text-pink-500">{keyword}</div>
            {/each}
        </div>
    </div>
    
</div>