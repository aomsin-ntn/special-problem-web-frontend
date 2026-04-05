<script lang="ts">
    import ProjectHeader from '$lib/components/ProjectDetailHeader.svelte';
    import DetailSection from '$lib/components/DetailSection.svelte';
    import Sidebar from '$lib/components/TableOfContent.svelte';
    import { authStore} from '$lib/stores/authStore';
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
        const fetchProjectDetails = async () => {
            if (!projectId) {
                isError = true;
                isLoading = false;
                return;
            }

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
                    id: data.project_id || '',
                    titleTH: data.title_th || '-',
                    titleEN: data.title_en || '-',
                    faculty: data.faculty?.faculty_name_th || '-',
                    department: data.department?.department_name_th || '-',
                    degree: data.degree?.degree_name_th || '-',
                    year: data.academic_year || '-',
                    authorTH: data.authors ? data.authors.map((a: any) => a.user_name_th) : [],
                    authorEN: data.authors ? data.authors.map((a: any) => a.user_name_en) : [],
                    advisorTH: data.advisor?.advisor_name_th ? [data.advisor.advisor_name_th] : [],
                    advisorEN: data.advisor?.advisor_name_en ? [data.advisor.advisor_name_en] : [],
                    abstractTH: data.abstract_th || 'ไม่มีข้อมูลบทคัดย่อภาษาไทย',
                    abstractEN: data.abstract_en || 'No English abstract available',
                    keywordTH: data.keywords ? data.keywords.map((k: any) => k.keyword_text_th) : [],
                    keywordEN: data.keywords ? data.keywords.map((k: any) => k.keyword_text_en) : [],
                    downloads: data.downloaded_count || 0,
                    thumbnail: data.project_file?.thumbnail_path || null
                };
            } catch (error) {
                console.error('Error fetching:', error);
                isError = true;
            } finally {
                isLoading = false;
            }
        };
        fetchProjectDetails();
    })

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

<main class="flex w-full flex-col justify-center overflow-x-hidden bg-white text-black">

    {#if isLoading}
        <div class="flex flex-col h-screen items-center justify-center gap-4">
            <span class="loading loading-spinner loading-lg text-orange-500"></span>
            <p class="text-lg font-semibold text-gray-600">กำลังโหลดข้อมูลปัญหาพิเศษ...</p>
        </div>
    
    {:else if isError || !projectData}
        <div class="flex flex-col h-screen items-center justify-center gap-4 text-center">
            <h2 class="text-2xl font-bold text-red-600">เกิดข้อผิดพลาด</h2>
            <p class="text-gray-400">ไม่พบข้อมูลปัญหาพิเศษที่คุณต้องการ หรือระบบอาจมีปัญหา</p>
            <a href="/" class="btn bg-orange-500 text-white hover:bg-orange-600 mt-4 border-none">กลับหน้าแรก</a>
        </div>

    {:else}
        <ProjectHeader project={projectData} isLoggedIn={$authStore.isLoggedIn} />
    
        <div class="mx-auto flex w-full max-w-7xl flex-col gap-14 px-6 py-10 md:px-10 lg:flex-row lg:px-20">
            
            <div class="flex-1 space-y-8">
                
                <div class="flex justify-center lg:justify-start">
                    <label class="relative inline-flex h-10 w-48 cursor-pointer items-center rounded-full bg-gray-500 p-1 shadow-inner">
                        <input type="checkbox" class="peer sr-only" bind:checked={isEnglish} />
                        
                        <div class="absolute left-1 top-1 h-8 w-[calc(50%-4px)] rounded-full bg-orange-500 transition-transform duration-300 peer-checked:translate-x-full"></div>
                        
                        <div class="relative z-10 flex w-full font-bold">
                            <span class="flex-1 text-center text-sm transition-colors duration-300 {isEnglish ? 'text-base-100' : 'text-white'}">
                                ภาษาไทย
                            </span>
                            <span class="flex-1 text-center text-sm transition-colors duration-300 {isEnglish ? 'text-white' : 'text-base-100'}">
                                English
                            </span>
                        </div>
                    </label>
                </div>

                <div id="abstract">
                    <DetailSection label={currentLabels.abstract} value={currentAbstract} />
                </div>

                <DetailSection label={currentLabels.keywords}>
                    <div class="mt-2 flex flex-wrap gap-2">
                        {#each currentKeywords as tag}
                            <span class="badge border-orange-200 bg-orange-200 p-3 text-orange-800">{tag}</span>
                        {/each}
                    </div>
                </DetailSection>

                <div id="authors">
                    <DetailSection label={currentLabels.authors}>
                        {#each currentAuthors as author}
                            <p>{author}</p>
                        {/each}
                    </DetailSection>
                </div>

                <div id="advisor">
                    <DetailSection label={currentLabels.advisor}>
                        {#each currentAdvisors as advisor}
                            <p>{advisor}</p>
                        {/each}
                    </DetailSection>
                </div>
            </div>

            <div class="w-full shrink-0 lg:w-1/4">
                <Sidebar title={currentLabels.toc} items={tocItems} />
            </div>
        </div>
    {/if}
</main>