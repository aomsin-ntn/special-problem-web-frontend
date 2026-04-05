<script lang="ts">
    import ProjectHeader from '$lib/components/ProjectDetailHeader.svelte';
    import DetailSection from '$lib/components/DetailSection.svelte';
    import Sidebar from '$lib/components/TableOfContent.svelte';
    import { authStore } from '$lib/stores/authStore';
    import { page } from '$app/state';
    import { PUBLIC_API_URL } from '$env/static/public';

    interface ProjectData {
        id: string;
        titleTH: string;
        titleEN: string;
        faculty: string;
        department: string;
        degree: string;
        year: string;
        authorTH: string[];
        authorEN: string[];
        advisorTH: string[];
        advisorEN: string[];
        abstractTH: string;
        abstractEN: string;
        keywordTH: string[];
        keywordEN: string[];
        downloads: number;
        thumbnail: string;
    }

    interface Labels {
        TH: { authors: string; advisor: string; abstract: string; keywords: string; toc: string };
        EN: { authors: string; advisor: string; abstract: string; keywords: string; toc: string };
    }

    interface TocItem {
        id: string;
        label: string;
    }

    type Lang = 'TH' | 'EN';

    const labels: Labels = {
        TH: {
            authors: 'ผู้จัดทำ',
            advisor: 'ที่ปรึกษา',
            abstract: 'บทคัดย่อ',
            keywords: 'คำสำคัญ',
            toc: 'สารบัญ'
        },
        EN: {
            authors: 'Authors',
            advisor: 'Advisor',
            abstract: 'Abstract',
            keywords: 'Keywords',
            toc: 'Table of Contents'
        }
    };

    let projectData = $state<ProjectData | null>(null);
    let isLoading = $state(true);
    let isError = $state(false);

    const projectId = $derived(page.url.searchParams.get('id'));

    $effect(() => {
        // ดึงข้อมูลรายละเอียดของเล่มปัญหาพิเศษตาม id จาก URL
        const fetchProjectDetails = async () => {
            if (!projectId) {
                isError = true;
                isLoading = false;
                return;
            }

            isLoading = true;
            try {
                const response = await fetch(`${PUBLIC_API_URL}/project/details/${projectId}`);
                if (!response.ok) throw new Error(`Failed to fetch project details: ${response.statusText}`);

                const rawData = await response.json();
                const data = Array.isArray(rawData) ? rawData[0] : rawData;

                if (!data) {
                    isError = true;
                    return;
                }

                projectData = {
                    id: data.project_id ?? data.project?.project_id ?? '',
                    titleTH: data.title_th ?? data.project?.title_th ?? '-',
                    titleEN: data.title_en ?? data.project?.title_en ?? '-',
                    faculty: data.faculty?.faculty_name_th ?? '-',
                    department: data.department?.department_name_th ?? '-',
                    degree: data.degree?.degree_name_th ?? '-',
                    year: data.academic_year ?? data.project?.academic_year ?? '-',
                    
                    authorTH: (data.users ?? data.authors)?.map((a: any) => a.user_name_th) ?? [],
                    authorEN: (data.users ?? data.authors)?.map((a: any) => a.user_name_en) ?? [],
                    
                    advisorTH: data.advisors ? data.advisors.map((a: any) => a.advisor_name_th) : (data.advisor?.advisor_name_th ? [data.advisor.advisor_name_th] : []),
                    advisorEN: data.advisors ? data.advisors.map((a: any) => a.advisor_name_en) : (data.advisor?.advisor_name_en ? [data.advisor.advisor_name_en] : []),
                    
                    abstractTH: data.abstract_th ?? data.project?.abstract_th ?? 'ไม่มีข้อมูลบทคัดย่อภาษาไทย',
                    abstractEN: data.abstract_en ?? data.project?.abstract_en ?? 'No English abstract available',
                    
                    keywordTH: data.keywords?.map((k: any) => k.keyword_text_th) ?? [],
                    keywordEN: data.keywords?.map((k: any) => k.keyword_text_en) ?? [],
                    
                    downloads: data.downloaded_count ?? data.project?.downloaded_count ?? 0,
                    thumbnail: data.project_file?.thumbnail_path ?? null
                };
            } catch (error) {
                console.error('Error fetching:', error);
                isError = true;
            } finally {
                isLoading = false;
            }
        };
        fetchProjectDetails();
    }); 

    let isEnglish = $state(false);
    
    let currentLang = $derived<Lang>(isEnglish ? 'EN' : 'TH');
    let currentLabels = $derived(labels[currentLang]);
    let currentAuthors = $derived(currentLang === 'TH' ? (projectData?.authorTH || []) : (projectData?.authorEN || []));
    let currentAdvisors = $derived(currentLang === 'TH' ? (projectData?.advisorTH || []) : (projectData?.advisorEN || []));
    let currentAbstract = $derived(currentLang === 'TH' ? (projectData?.abstractTH || '') : (projectData?.abstractEN || ''));
    let currentKeywords = $derived(currentLang === 'TH' ? (projectData?.keywordTH || []) : (projectData?.keywordEN || []));
    
    const tocItems: TocItem[] = $derived([
        { id: 'abstract', label: currentLabels.abstract },
        { id: 'keywords', label: currentLabels.keywords },
        { id: 'authors', label: currentLabels.authors },
        { id: 'advisor', label: currentLabels.advisor }
    ]);
</script>

<main class="flex w-full flex-col items-center justify-center overflow-x-hidden bg-white text-black min-h-screen">

    {#if isLoading}
        <!-- แสดงโครงร่างระหว่างรอข้อมูลจาก API -->
        <div class="w-full">
            <div class="w-full bg-linear-to-b from-orange-500 to-orange-700 py-10 px-6 md:px-12 lg:px-20 animate-pulse">
                <div class="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div class="w-48 md:w-64 lg:w-72 h-64 md:h-80 bg-white/20 rounded-xl shadow-lg border-2 border-white/20 shrink-0 mx-auto md:mx-0"></div>
                    <div class="flex flex-col gap-4 w-full">
                        <div class="h-4 w-32 bg-white/30 rounded"></div>
                        <div class="h-8 w-3/4 bg-white/30 rounded"></div>
                        <div class="h-4 w-40 bg-white/30 rounded mt-4"></div>
                        <div class="h-6 w-1/2 bg-white/30 rounded"></div>
                        <div class="h-24 w-full bg-black/10 rounded-lg mt-4"></div>
                        <div class="h-12 w-40 bg-white/30 rounded-full mt-2"></div>
                    </div>
                </div>
            </div>
            
            <div class="max-w-7xl mx-auto flex w-full flex-col gap-10 px-6 py-10 md:px-12 lg:flex-row lg:px-20 animate-pulse">
                <div class="flex-1 space-y-10">
                    <div class="h-10 w-48 bg-gray-200 rounded-full"></div>
                    <div>
                        <div class="h-8 w-40 bg-gray-200 rounded mb-4"></div>
                        <div class="h-4 w-full bg-gray-100 rounded mb-2"></div>
                        <div class="h-4 w-full bg-gray-100 rounded mb-2"></div>
                        <div class="h-4 w-5/6 bg-gray-100 rounded"></div>
                    </div>
                    <div>
                        <div class="h-8 w-32 bg-gray-200 rounded mb-4"></div>
                        <div class="flex gap-2">
                            <div class="h-10 w-24 bg-orange-100 rounded-full"></div>
                            <div class="h-10 w-32 bg-orange-100 rounded-full"></div>
                        </div>
                    </div>
                </div>
                <div class="w-full lg:w-1/4 shrink-0">
                    <div class="h-64 bg-gray-50 border border-gray-100 rounded-xl"></div>
                </div>
            </div>
        </div>
    
    {:else if isError || !projectData}
        <!-- กรณีไม่พบข้อมูลหรือเกิดข้อผิดพลาด -->
        <div class="flex flex-col h-full items-center justify-center gap-4 text-center py-32">
            <h2 class="text-2xl font-bold text-red-600">เกิดข้อผิดพลาด</h2>
            <p class="text-gray-500">ไม่พบข้อมูลปัญหาพิเศษที่คุณต้องการ หรือระบบอาจมีปัญหา</p>
            <a href="/" class="btn bg-orange-500 text-white hover:bg-orange-600 mt-4 border-none px-8 rounded-full">กลับหน้าแรก</a>
        </div>

    {:else}
        <!-- ส่วนหัวรายละเอียดของโปรเจกต์ -->
        <ProjectHeader project={projectData} isLoggedIn={$authStore.isLoggedIn} />
    
        <div class="mx-auto flex w-full max-w-7xl flex-col gap-14 px-6 py-10 md:px-12 lg:flex-row lg:px-20">
            
            <div class="flex-1 space-y-8">
                
                <!-- ปุ่มสลับภาษาไทย/อังกฤษของรายละเอียด -->
                <div class="flex justify-center lg:justify-start">
                    <label class="relative inline-flex h-12 w-56 cursor-pointer items-center rounded-full bg-gray-100 p-1 shadow-inner border border-gray-500">
                        <input type="checkbox" class="peer sr-only" bind:checked={isEnglish} />
                        
                        <div class="absolute left-1 top-1 h-10 w-[calc(50%-4px)] rounded-full bg-orange-500 transition-transform duration-300 peer-checked:translate-x-full shadow-md"></div>
                        
                        <div class="relative z-10 flex w-full font-bold">
                            <span class="flex-1 text-center text-sm transition-colors duration-300 {isEnglish ? 'text-gray-500' : 'text-white'}">
                                ภาษาไทย
                            </span>
                            <span class="flex-1 text-center text-sm transition-colors duration-300 {isEnglish ? 'text-white' : 'text-gray-500'}">
                                English
                            </span>
                        </div>
                    </label>
                </div>

                <!-- เนื้อหาหลักของรายละเอียดแต่ละหัวข้อ -->
                <div id="abstract" class="scroll-mt-24">
                    <DetailSection label={currentLabels.abstract} value={currentAbstract} />
                </div>

                <div id="keywords" class="scroll-mt-24">
                    <DetailSection label={currentLabels.keywords}>
                        <div class="mt-2 flex flex-wrap gap-2">
                            {#each currentKeywords as tag}
                                <span class="badge border-orange-200 bg-orange-50 text-orange-700 px-4 py-3 font-medium text-sm rounded-lg">{tag}</span>
                            {/each}
                        </div>
                    </DetailSection>
                </div>

                <div id="authors" class="scroll-mt-24">
                    <DetailSection label={currentLabels.authors}>
                        <div class="flex flex-col gap-2 text-gray-700">
                            {#each currentAuthors as author}
                                <p class="flex items-center gap-2"><span class="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>{author}</p>
                            {/each}
                        </div>
                    </DetailSection>
                </div>

                <div id="advisor" class="scroll-mt-24">
                    <DetailSection label={currentLabels.advisor}>
                        <div class="flex flex-col gap-2 text-gray-700">
                            {#each currentAdvisors as advisor}
                                <p class="flex items-center gap-2"><span class="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>{advisor}</p>
                            {/each}
                        </div>
                    </DetailSection>
                </div>
            </div>

            <!-- สารบัญด้านข้างสำหรับกระโดดไปยังหัวข้อสำคัญ -->
            <div class="w-full shrink-0 lg:w-1/4">
                <Sidebar title={currentLabels.toc} items={tocItems} />
            </div>
        </div>
    {/if}
</main>