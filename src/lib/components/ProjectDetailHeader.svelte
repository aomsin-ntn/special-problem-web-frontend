<script lang="ts">
    import { Download } from 'lucide-svelte';

    interface Project {
        titleTH: string;
        titleEN: string;
        faculty: string;
        department: string;
        degree: string;
        year: string;
        downloads: number;
    }

    interface Props {
        project: Project;
        isLoggedIn?: boolean;
    }

    let { project, isLoggedIn = false }: Props = $props();

    function downloadProject(): void {
        alert(`ดาวน์โหลด: ${project.titleTH}`);
    }
</script>

<div class="w-full bg-linear-to-b from-orange-500 to-orange-700 text-black py-10 px-10 md:px-20 lg:px-30" >
    <div class="container mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 align-items-center">
            <div class="md:col-span-1">
                <img
                    src="https://placehold.co/300x400"
                    alt="Project Thumbnail"
                    class="h-full rounded-lg shadow-md object-cover"
                />
            </div>
            <div class="md:col-span-2 flex flex-col gap-2">
                <div>
                    <p class="text-sm text-gray-300 my-2">ชื่อเรื่องภาษาไทย</p>
                    <p class="text-xl md:text-2xl lg:text-3xl font-bold mb-4">{project.titleTH}</p>
                    <p class="text-sm text-gray-300 mb-2">ชื่อเรื่องภาษาอังกฤษ</p>
                    <p class="text-lg md:text-xl font-semibold">{project.titleEN}</p>
                </div>
                
                <ul class="my-6">
                    <li>คณะ{project.faculty} ภาควิชา{project.department}</li>
                    <li><strong>หลักสูตร</strong> {project.degree}</li>
                    <li><strong>ปีการศึกษา</strong> {project.year}</li>
                </ul>

                {#if !isLoggedIn}
                    <p class="warning">กรุณาเข้าสู่ระบบ เพื่อดาวน์โหลดไฟล์</p>
                {/if}
                
                <button 
                    class="flex justify-center gap-2 bg-orange-300 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-lg transition cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400" 
                    onclick={downloadProject} 
                    disabled={!isLoggedIn}
                >
                    <Download class="w-5 h-5" />
                    ดาวน์โหลด
                </button>
                <div class="flex items-center gap-2 text-white">
                    <Download class="w-4 h-4" />
                    <span class="text-sm font-medium">{project.downloads} ดาวน์โหลด</span>
                </div>

            </div>
        </div>
    </div>
</div>