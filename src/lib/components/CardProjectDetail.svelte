<script lang="ts">
    import { UserRound, CalendarDays, Trash, Download } from 'lucide-svelte';
    import { PUBLIC_API_URL } from '$env/static/public';

    interface Props {
        id?: string;
        faculty?: string;
        department?: string;
        titleThai?: string;
        titleEnglish?: string;
        author?: string[];
        advisor?: string[];
        semester?: string;
        keywords?: string[];
        thumbnail?: string | null;
        downloadCount?: number;
        showDelete?: boolean;
        onDelete?: (id: string) => void;
    }

    let {
        id = '1',
        faculty = "-",
        department = "-",
        titleThai = "ไม่มีชื่อโครงงาน",
        titleEnglish = "No Title",
        author = [],
        advisor = [],
        semester = "-",
        keywords = [],
        thumbnail = null,
        downloadCount = 0,
        showDelete = false,
        onDelete
    }: Props = $props();

    const handleDelete = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // 🚀 สำคัญมาก: ป้องกันไม่ให้ทะลุไปคลิก <a>
        if (onDelete && id) {
            onDelete(id);
        }
    };
</script>

<a 
    href={`/project-detail?id=${id}`} 
    class="relative group w-full bg-white rounded-xl border border-gray-500 shadow-md p-4 flex flex-col md:flex-row gap-4 md:gap-6 hover:-translate-y-1 transition-transform duration-300 cursor-pointer hover:shadow-lg no-underline">

    <div class="w-full md:w-32 lg:w-40 shrink-0 h-48 md:h-full">
        <img 
            src={thumbnail ? `${PUBLIC_API_URL}/${thumbnail}` : "https://placehold.co/165x260"} 
            alt="Project Thumbnail" 
            class="w-full h-full object-cover rounded-lg border border-gray-100" />
    </div>

    <div class="flex flex-col gap-3 justify-center items-start w-full py-1">
        <div class="flex flex-wrap gap-2">
            <span class="badge badge-outline border-orange-500 text-orange-500 bg-white text-xs">คณะ{faculty}</span>
            <span class="badge badge-outline border-orange-600 text-orange-600 bg-white text-xs">ภาควิชา{department}</span>
        </div>

        <div>
            <p class="text-black line-clamp-2 text-base md:text-lg font-semibold mb-1">{titleThai}</p>
            <p class="text-gray-700 line-clamp-2 text-xs md:text-sm font-medium">{titleEnglish}</p>
        </div>

        <div class="w-full flex flex-col sm:flex-row gap-4 sm:gap-8 mt-2">
            <div class="flex flex-col gap-1.5">
                {#each author as authorName (authorName)}
                    <p class="text-gray-700 truncate text-xs md:text-sm flex items-center gap-1.5">
                        <UserRound class="w-3.5 h-3.5 text-gray-700" /><span>{authorName}</span>
                    </p>
                {/each}
            </div>

            <div class="flex flex-col gap-1.5">
                {#each advisor as advisorName (advisorName)}
                    <p class="text-gray-700 truncate text-xs md:text-sm flex items-center gap-1.5">
                        <UserRound class="w-3.5 h-3.5 text-gray-700" /><span>{advisorName}</span>
                    </p>
                {/each}
            </div>
        </div>

        <div class="flex flex-wrap gap-4 mt-2 border-t border-gray-600 pt-3 w-full">
            <p class="text-gray-700 text-xs md:text-sm flex items-center gap-1.5">
                <CalendarDays class="w-3.5 h-3.5" /><span>ปีการศึกษา {semester}</span>
            </p>
            <p class="text-gray-700 text-xs md:text-sm flex items-center gap-1.5">
                <Download class="w-3.5 h-3.5" /><span>ดาวน์โหลด {downloadCount} ครั้ง</span>
            </p>
        </div>
        
        {#if keywords.length > 0}
            <div class="flex flex-wrap gap-2 mt-1">
                {#each keywords as keyword (keyword)}
                    <span class="badge badge-outline border-orange-200 bg-orange-200 text-orange-800 text-xs">{keyword}</span>
                {/each}
            </div>
        {/if}
    </div>
    
    {#if showDelete}
        <button 
            type="button" 
            onclick={handleDelete} 
            class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-lg p-2 transition-all duration-300 md:opacity-0 group-hover:opacity-100 z-10 shadow-sm border-none cursor-pointer" aria-label="Delete project">
            <Trash class="w-4 h-4 md:w-5 md:h-5" />
        </button>
    {/if}
</a>