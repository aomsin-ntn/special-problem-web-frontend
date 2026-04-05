<script lang="ts">
    import { Download, Loader2 } from 'lucide-svelte';
    import { PUBLIC_API_URL } from '$env/static/public';

    interface Project {
        id: string;
        titleTH: string;
        titleEN: string;
        faculty: string;
        department: string;
        degree: string;
        year: string;
        downloads: number;
        thumbnail?: string;
    }

    interface Props {
        project: Project;
        isLoggedIn?: boolean;
    }

    let { project, isLoggedIn = false }: Props = $props();
    let isDownloading = $state(false);

    async function downloadProject(): Promise<void> {
        if (!isLoggedIn) return;
        isDownloading = true;
        try {
            const response = await fetch(`${PUBLIC_API_URL}/project/download/${project.id}`, {
                method: 'GET',
                credentials: 'include'
            });
            if (!response.ok) throw new Error('ไม่สามารถดาวน์โหลดไฟล์ได้');
            
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);

            const contentDisposition = response.headers.get('Content-Disposition');
            let fileName = `${project.titleEN || 'project_document'}.pdf`;
            if (contentDisposition && contentDisposition.includes('filename=')) {
                fileName = contentDisposition.split('filename=')[1].replace(/"/g, '');
            }

            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = downloadUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download Error:', error);
            alert('เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์ โปรดลองอีกครั้ง');
        } finally {
            isDownloading = false;
        }
    }
</script>

<div class="w-full bg-linear-to-b from-orange-500 to-orange-700 text-black py-8 md:py-12 px-6 md:px-12 lg:px-20" >
    <div class="container mx-auto max-w-7xl">
        <div class="flex flex-col md:flex-row gap-8 items-start md:items-center">
            
            <div class="w-full md:w-1/3 lg:w-1/4 flex justify-center md:justify-start shrink-0">
                <img
                    src={project.thumbnail ? `${PUBLIC_API_URL}/${project.thumbnail}` : "https://placehold.co/300x400"}
                    alt="Project Thumbnail"
                    class="w-48 md:w-full max-w-xs object-cover rounded-xl shadow-lg border-2 border-white/20"
                />
            </div>

            <div class="flex flex-col gap-4 w-full text-black">
                <div>
                    <p class="text-xs md:text-sm text-gray-300 mb-1">ชื่อเรื่องภาษาไทย</p>
                    <h1 class="text-xl md:text-2xl lg:text-3xl font-bold mb-4 leading-tight">{project.titleTH}</h1>
                    <p class="text-xs md:text-sm text-gray-300 mb-1">ชื่อเรื่องภาษาอังกฤษ</p>
                    <h2 class="text-lg md:text-xl font-semibold leading-tight ">{project.titleEN}</h2>
                </div>
                
                <ul class="flex flex-col gap-2 text-sm md:text-base rounded-lg py-4 mb-2">
                    <li><span class="font-semibold">คณะ:</span> {project.faculty}</li>
                    <li><span class="font-semibold">ภาควิชา:</span> {project.department}</li>
                    <li><span class="font-semibold">หลักสูตร:</span> {project.degree}</li>
                    <li><span class="font-semibold">ปีการศึกษา:</span> {project.year}</li>
                </ul>

                {#if !isLoggedIn}
                    <p class="text-sm text-gray-300 font-base mt-1">กรุณา <a href="/login" class="font-bold underline" > เข้าสู่ระบบ </a> เพื่อดาวน์โหลดไฟล์</p>
                {/if}

                <div class="flex flex-col sm:flex-row items-center gap-4">
                    <button 
                        type="button" 
                        class="w-full sm:w-auto flex justify-center items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 font-bold px-8 py-3.5 rounded-3xl transition-all cursor-pointer shadow-md disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-500 border-none" 
                        onclick={downloadProject} 
                        disabled={!isLoggedIn || isDownloading}>
                        {#if isDownloading}
                            <Loader2 class="w-5 h-5 animate-spin" /> กำลังเตรียมไฟล์...
                        {:else}
                            <Download class="w-5 h-5" /> ดาวน์โหลดเอกสาร
                        {/if}
                    </button>
                    
                    <div class="flex items-center gap-2 text-white/90">
                        <Download class="w-4 h-4" />
                        <span class="text-sm font-medium">{project.downloads} ครั้ง</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>