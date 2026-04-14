<svelte:head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
</svelte:head>

<script lang="ts">
    import { Upload, FileCheckCorner, SquarePen } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    import { PUBLIC_API_URL } from '$env/static/public';

    import type { ProjectData, FileInfo, PageThumbnail, SpellErrorMap } from '$lib/types';
    import StepIndicator  from '$lib/components/StepIndicator.svelte';
    import FileUploadZone from '$lib/components/FileUploadZone.svelte';
    import PageSelector   from '$lib/components/PageSelector.svelte';
    import OcrForm        from '$lib/components/OcrForm.svelte';

    // ─── Step state ───────────────────────────────────────────────────────────
    let currentStep = $state(1);

    const stepItems = [
        { name: 'อัปโหลดไฟล์',       icon: Upload },
        { name: 'เลือกหน้า',          icon: FileCheckCorner },
        { name: 'ตรวจสอบและแก้ไข',   icon: SquarePen },
    ];

    // ─── Step 1: File upload ──────────────────────────────────────────────────
    let uploadedFile          = $state<File | null>(null);
    let fileDetails           = $state({ name: '', pages: 0 });
    let pageThumbnails        = $state<PageThumbnail[]>([]);
    let isGeneratingThumbnails = $state(false);

    const processPdfForThumbnails = async (file: File) => {
        isGeneratingThumbnails = true;
        pageThumbnails = [];

        try {
            const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
            pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            fileDetails = { name: file.name, pages: pdf.numPages };

            const tempThumbnails: PageThumbnail[] = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page     = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.4 });
                const canvas   = document.createElement('canvas');
                const context  = canvas.getContext('2d');
                if (!context) throw new Error('Canvas not supported');

                canvas.height = viewport.height;
                canvas.width  = viewport.width;
                await page.render({ canvasContext: context, viewport }).promise;
                tempThumbnails.push({ id: i, src: canvas.toDataURL('image/jpeg', 0.8) });
            }

            pageThumbnails = tempThumbnails;
        } catch (error) {
            console.error('PDF Error:', error);
            alert('เกิดข้อผิดพลาดในการอ่านไฟล์ PDF');
            uploadedFile = null;
        } finally {
            isGeneratingThumbnails = false;
        }
    };

    const handleFileSelected = (file: File) => {
        uploadedFile = file;
        processPdfForThumbnails(file);
    };

    // ─── Step 2: Page selection ───────────────────────────────────────────────
    let selectedPages = $state<number[]>([]);

    const togglePageSelection = (pageId: number) => {
        if (selectedPages.includes(pageId)) {
            selectedPages = selectedPages.filter((p) => p !== pageId);
        } else if (selectedPages.length < 2) {
            selectedPages = [...selectedPages, pageId];
        } else {
            alert('คุณสามารถเลือกได้สูงสุด 2 หน้า เท่านั้น');
        }
    };

    // ─── Step 3: OCR & review ────────────────────────────────────────────────
    let isLoadingOcr = $state(false);
    let isSaving     = $state(false);
    let fileInfo     = $state<FileInfo | null>(null);
    let degreeId     = $state<string | null>(null);
    let advisorId    = $state<string | null>(null);

    const emptyProjectData = (): ProjectData => ({
        title: '', faculty: '', department: '', degree: '',
        academicYear: '', authors: [], advisors: [], abstract: '', keywords: [],
    });

    let ocrDataThai    = $state<ProjectData>(emptyProjectData());
    let ocrDataEnglish = $state<ProjectData>(emptyProjectData());

    let spellErrors = $state<SpellErrorMap>({});

    const extractOcrData = async () => {
        isLoadingOcr = true;
        try {
            const sortedPages = [...selectedPages].sort((a, b) => a - b);
            const queryParams = new URLSearchParams();
            sortedPages.forEach((page) => queryParams.append('pages', page.toString()));

            const formData = new FormData();
            formData.append('file', uploadedFile as File);

            const response = await fetch(
                `${PUBLIC_API_URL}/project/upload?${queryParams}`,
                { method: 'POST', body: formData, credentials: 'include' },
            );
            if (!response.ok) throw new Error('Server error: ' + response.status);

            const data  = await response.json();
            const errArray = Array.isArray(data.spell_errors) ? data.spell_errors : [];
            spellErrors = {
                title_th: errArray,
                title_en: errArray,
                abstract_th: errArray,
                abstract_en: errArray
            };
            fileInfo    = data.file_info   ?? null;
            const form  = data.form_data   ?? {};
            degreeId    = form.degree?.degree_id   ?? null;
            advisorId   = form.advisor?.advisor_id ?? null;

            ocrDataThai = {
                title:        form.title_th                  ?? '',
                faculty:      form.faculty?.faculty_name_th  ?? '',
                department:   form.department?.department_name_th ?? '',
                degree:       form.degree?.degree_name_th    ?? '',
                academicYear: form.academic_year             ?? '',
                authors:  (form.students ?? []).map((s: any) => ({ name: s.name_th    ?? '', studentId: s.student_id ?? '' })),
                advisors: (form.advisors ?? []).map((a: any) => ({ name: a.advisor_name_th ?? '' })),
                abstract: form.abstract_th ?? '',
                keywords: (form.keywords ?? []).map((k: any) => k.th ?? ''),
            };

            ocrDataEnglish = {
                title:        form.title_en                  ?? '',
                faculty:      form.faculty?.faculty_name_en  ?? '',
                department:   form.department?.department_name_en ?? '',
                degree:       form.degree?.degree_name_en    ?? '',
                academicYear: form.academic_year             ?? '',
                authors:  (form.students ?? []).map((s: any) => ({ name: s.name_en    ?? '', studentId: s.student_id ?? '' })),
                advisors: (form.advisors ?? []).map((a: any) => ({ name: a.advisor_name_en ?? '' })),
                abstract: form.abstract_en ?? '',
                keywords: (form.keywords ?? []).map((k: any) => k.en ?? ''),
            };
        } catch (error) {
            console.error('OCR Error:', error);
            alert('OCR processing failed');
            currentStep = 2;
        } finally {
            isLoadingOcr = false;
        }
    };

    // ─── Navigation ──────────────────────────────────────────────────────────
    const nextStep = () => {
        if (currentStep < 3) currentStep++;
        if (currentStep === 3) extractOcrData();
    };

    const prevStep = () => {
        if (currentStep > 1) currentStep--;
    };

    // ─── Submit ───────────────────────────────────────────────────────────────
    const buildPayload = () => {
        const mergeList = <T extends { name: string; studentId?: string }>(
            thList: T[],
            enList: T[],
            mapFn: (th: T, en: T, i: number) => object,
        ) => Array.from({ length: Math.max(thList.length, enList.length) }, (_, i) =>
            mapFn(thList[i] ?? ({ name: '', studentId: '' } as T), enList[i] ?? ({ name: '' } as T), i));

        return {
            title_th:      ocrDataThai.title,
            title_en:      ocrDataEnglish.title,
            abstract_th:   ocrDataThai.abstract,
            abstract_en:   ocrDataEnglish.abstract,
            academic_year: ocrDataThai.academicYear,
            degree: {
                degree_id:      degreeId,
                degree_name_th: ocrDataThai.degree,
                degree_name_en: ocrDataEnglish.degree,
            },
            department: {
                department_id:      null,
                department_name_th: ocrDataThai.department,
                department_name_en: ocrDataEnglish.department,
            },
            faculty: {
                faculty_id:      null,
                faculty_name_th: ocrDataThai.faculty,
                faculty_name_en: ocrDataEnglish.faculty,
            },
            students: mergeList(ocrDataThai.authors, ocrDataEnglish.authors, (th, en) => ({
                student_id:      th.studentId || en.studentId || '',
                student_name_th: th.name,
                student_name_en: en.name,
            })),
            advisors: mergeList(ocrDataThai.advisors, ocrDataEnglish.advisors, (th, en) => ({
                advisor_id:      advisorId,
                advisor_name_th: th.name,
                advisor_name_en: en.name,
            })),
            keywords: Array.from(
                { length: Math.max(ocrDataThai.keywords.length, ocrDataEnglish.keywords.length) },
                (_, i) => ({
                    keyword_text_th: ocrDataThai.keywords[i]    ?? '',
                    keyword_text_en: ocrDataEnglish.keywords[i] ?? '',
                }),
            ),
            file_info: fileInfo,
        };
    };

    const handleSubmit = async (event: SubmitEvent) => {
        event.preventDefault();
        if (!fileInfo) { alert('ไม่พบข้อมูลไฟล์อ้างอิง'); return; }
        isSaving = true;
        try {
            const response = await fetch(`${PUBLIC_API_URL}/project/save`, {
                method:      'POST',
                headers:     { 'Content-Type': 'application/json' },
                body:        JSON.stringify(buildPayload()),
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to save: ' + response.status);

            alert('บันทึกข้อมูลโปรเจกต์สำเร็จ');
            currentStep   = 1;
            uploadedFile  = null;
            selectedPages = [];
            fileInfo      = null;
            await goto('/profile');
        } catch (error) {
            console.error('Save Error:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            isSaving = false;
        }
    };
</script>

<main class="min-h-screen bg-white px-4 md:px-8 py-10 md:py-16 text-black">

    <!-- Page header -->
    <header class="text-center mb-8 md:mb-12">
        <h1 class="text-2xl md:text-3xl font-bold text-black">อัปโหลดปัญหาพิเศษ</h1>
    </header>

    <!-- Step progress bar -->
    <StepIndicator {currentStep} {stepItems} />

    <!-- ── Step 1: Upload ─────────────────────────────────────────────────── -->
    {#if currentStep === 1}
        <FileUploadZone
            {fileDetails}
            {isGeneratingThumbnails}
            isNextDisabled={!uploadedFile || isGeneratingThumbnails}
            onFileSelected={handleFileSelected}
            onNext={nextStep}
        />
    {/if}

    <!-- ── Step 2: Page selection ─────────────────────────────────────────── -->
    {#if currentStep === 2}
        <PageSelector
            {pageThumbnails}
            {selectedPages}
            onTogglePage={togglePageSelection}
            onPrev={prevStep}
            onNext={nextStep}
        />
    {/if}

    <!-- ── Step 3: OCR review & submit ───────────────────────────────────── -->
    {#if currentStep === 3}

        <!-- Saving overlay -->
        {#if isSaving}
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all duration-300">
                <div class="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95">
                    <span class="loading loading-spinner loading-lg text-orange-500"></span>
                    <p class="text-xl font-bold text-gray-800 animate-pulse">กำลังบันทึกข้อมูล...</p>
                    <p class="text-sm text-gray-500">กรุณารอสักครู่ ห้ามปิดหรือรีเฟรชหน้าต่างนี้</p>
                </div>
            </div>
        {/if}

        <section class="max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <form onsubmit={handleSubmit}>
                <div class="bg-white border border-gray-500 shadow-sm rounded-2xl p-6 md:p-10">
                    <h2 class="text-lg md:text-xl lg:text-2xl font-bold text-black text-center mb-10">
                        ขั้นตอนที่ 3 : ตรวจสอบและแก้ไขข้อมูล OCR
                    </h2>

                    {#if isLoadingOcr}
                        <!-- Skeleton loader -->
                        <div class="flex flex-col items-center gap-4 mb-8">
                            <span class="loading loading-spinner loading-lg text-orange-500"></span>
                            <p class="text-orange-600 font-bold animate-pulse">ระบบกำลังอ่านและสกัดข้อมูลจาก PDF...</p>
                        </div>
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {#each Array(2) as _}
                                <div class="border border-gray-200 rounded-xl p-6 bg-gray-50 animate-pulse">
                                    <div class="h-6 w-48 bg-gray-300 rounded mb-8"></div>
                                    <div class="space-y-6">
                                        <div class="h-14 bg-white border border-gray-200 rounded-lg w-full"></div>
                                        <div class="grid grid-cols-2 gap-4">
                                            <div class="h-12 bg-white border border-gray-200 rounded-lg w-full"></div>
                                            <div class="h-12 bg-white border border-gray-200 rounded-lg w-full"></div>
                                        </div>
                                        <div class="h-32 bg-white border border-gray-200 rounded-lg w-full"></div>
                                        <div class="h-16 bg-white border border-gray-200 rounded-lg w-full"></div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                            <div class="border border-orange-200 rounded-xl p-4 md:p-6 lg:p-8 bg-orange-50/30 shadow-sm">
                                <h3 class="text-base md:text-lg font-bold text-orange-800 border-b border-orange-200 pb-3 mb-6">
                                    3.1 ข้อมูลภาษาไทย
                                </h3>
                                <OcrForm bind:data={ocrDataThai} lang="th" {spellErrors} />
                            </div>
                            <div class="border border-orange-200 rounded-xl p-4 md:p-6 lg:p-8 bg-orange-50/30 shadow-sm">
                                <h3 class="text-base md:text-lg font-bold text-orange-800 border-b border-orange-200 pb-3 mb-6">
                                    3.2 ข้อมูลภาษาอังกฤษ
                                </h3>
                                <OcrForm bind:data={ocrDataEnglish} lang="en" {spellErrors} />
                            </div>
                        </div>
                    {/if}
                </div>

                <!-- Navigation buttons -->
                <div class="max-w-7xl mx-auto flex flex-col-reverse md:flex-row justify-between gap-4 md:gap-8 mt-8">
                    <button
                        type="button"
                        class="btn btn-outline w-full md:w-1/3 text-lg h-14 border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded-xl bg-white shadow-sm"
                        onclick={prevStep}
                        disabled={isLoadingOcr || isSaving}
                    >
                        ย้อนกลับ
                    </button>
                    <button
                        type="submit"
                        class="w-full md:w-2/3 text-lg md:text-xl h-14 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors duration-300 cursor-pointer disabled:bg-gray-400 shadow-md flex items-center justify-center gap-2"
                        disabled={isLoadingOcr || isSaving}
                    >
                        {#if isLoadingOcr}
                            <span class="loading loading-spinner loading-sm"></span> กำลังอ่านข้อมูล...
                        {:else if isSaving}
                            <span class="loading loading-spinner loading-sm"></span> กำลังบันทึก...
                        {:else}
                            <FileCheckCorner class="h-5 w-5" /> บันทึกข้อมูล
                        {/if}
                    </button>
                </div>
            </form>
        </section>
    {/if}
</main>
