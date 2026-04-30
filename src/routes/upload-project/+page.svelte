<svelte:head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
</svelte:head>

<script lang="ts">
    import { Upload, FileCheckCorner, SquarePen, Plus, Trash2 } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    import { PUBLIC_API_URL } from '$env/static/public';
    import { authStore } from '$lib/stores/authStore';
    import type { ProjectData, FileInfo, PageThumbnail, SpellErrorMap } from '$lib/types';
    import StepIndicator  from '$lib/components/StepIndicator.svelte';
    import FileUploadZone from '$lib/components/FileUploadZone.svelte';
    import PageSelector   from '$lib/components/PageSelector.svelte';
    import OcrForm        from '$lib/components/OcrForm.svelte';
    import SpellCheckTextarea from '$lib/components/SpellCheckTextarea.svelte';
    import SearchableDropdown from '$lib/components/SearchableDropdown.svelte';
    import Swal from 'sweetalert2';

    let isAccessDenied = $derived(($authStore.user && $authStore.user.role !== 'student') || !$authStore.user);

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
            Swal.fire('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการอ่านไฟล์ PDF', 'error');
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
        } else if (selectedPages.length < 4) {
            selectedPages = [...selectedPages, pageId];
        } else {
            Swal.fire('ข้อผิดพลาด', 'คุณสามารถเลือกได้สูงสุด 4 หน้า เท่านั้น', 'error');
        }
    };

    // ─── Step 3: OCR & review ────────────────────────────────────────────────
    let isLoadingOcr = $state(false);
    let isSaving     = $state(false);
    let fileInfo     = $state<FileInfo | null>(null);
    let degreeId     = $state<string | null>(null);
    let advisorId    = $state<string | null>(null);

    let masterFaculties = $state<any[]>([]);
    let masterDegrees = $state<any[]>([]);
    let masterAdvisors = $state<any[]>([]);

    let selectedDegreeId = $state<string>('');
    let selectedFacultyId = $state<string>('');
    let selectedDepartmentId = $state<string>('');
    let selectedAdvisors = $state<{advisor_id: string}[]>([{ advisor_id: '' }]);

    let originalOcrPayload = $state<any>(null);

    const addAdvisor = () => selectedAdvisors.push({ advisor_id: '' });
    const removeAdvisor = (index: number) => selectedAdvisors.splice(index, 1);

    let uniqueDegrees = $derived((() => {
        if (!masterDegrees) return [];
        const unique = [];
        const map = new Map();
        for (const item of masterDegrees) {
            if (!map.has(item.degree_id)) {
                map.set(item.degree_id, true);
                unique.push(item);
            }
        }
        return unique;
    })());

    let availableFaculties = $derived((() => {
        if (!masterFaculties || masterFaculties.length === 0) return [];
        if (!selectedDegreeId) return masterFaculties;
        
        const linkedDeptIds = masterDegrees
            .filter(d => d.degree_id === selectedDegreeId)
            .map(d => d.department_id);
            
        if (linkedDeptIds.length === 0) return masterFaculties;

        return masterFaculties.filter(item => 
            item.departments && item.departments.some((dept: any) => linkedDeptIds.includes(dept.department_id))
        );
    })());
    
    let availableDepartments = $derived((() => {
        if (!masterFaculties || !selectedFacultyId) return [];
        const selectedFaculty = masterFaculties.find(f => f?.faculty?.faculty_id === selectedFacultyId);
        if (!selectedFaculty || !selectedFaculty.departments) return [];

        if (selectedDegreeId) {
            const linkedDeptIds = masterDegrees
                .filter(d => d.degree_id === selectedDegreeId)
                .map(d => d.department_id);
            if (linkedDeptIds.length > 0) {
                return selectedFaculty.departments.filter((dept: any) => 
                    linkedDeptIds.includes(dept.department_id)
                );
            }
        }
        return selectedFaculty.departments;
    })());

    const handleDegreeChange = () => { selectedFacultyId = ''; selectedDepartmentId = ''; };
    const handleFacultyChange = () => { selectedDepartmentId = ''; };

    const emptyProjectData = (): ProjectData => ({
        title: '', faculty: '', department: '', degree: '',
        academicYear: '', authors: [], advisors: [], abstract: '', keywords: [],
    });

    let ocrDataThai    = $state<ProjectData>(emptyProjectData());
    let ocrDataEnglish = $state<ProjectData>(emptyProjectData());

    let spellErrors = $state<SpellErrorMap>({});

    let pairedKeywords = $state<{th: string, en: string}[]>([]);

    const addKeyword = () => pairedKeywords.push({ th: '', en: '' });
    const removeKeyword = (index: number) => pairedKeywords.splice(index, 1);

    const extractOcrData = async () => {
        isLoadingOcr = true;
        try {
            const sortedPages = [...selectedPages].sort((a, b) => a - b);
            const queryParams = new URLSearchParams();
            sortedPages.forEach((page) => queryParams.append('pages', page.toString()));

            const formData = new FormData();
            formData.append('file', uploadedFile as File);

            const [ocrRes, facRes, degRes, advRes] = await Promise.all([
                fetch(`${PUBLIC_API_URL}/project/upload?${queryParams}`, { method: 'POST', body: formData, credentials: 'include' }),
                fetch(`${PUBLIC_API_URL}/project/get_faculty`),
                fetch(`${PUBLIC_API_URL}/master/degree`),
                fetch(`${PUBLIC_API_URL}/master/advisor`)
            ]);
            
            if (!ocrRes.ok) {
                const errorData = await ocrRes.json();
                
                throw new Error(errorData.detail || errorData.error || `เกิดข้อผิดพลาด: ${ocrRes.status}`);
            }

            const data  = await ocrRes.json();
            masterFaculties = await facRes.json();
            masterDegrees = await degRes.json();
            masterAdvisors = await advRes.json();

            const newSpellErrors: SpellErrorMap = {};
            if (Array.isArray(data.spell_errors)) {
                data.spell_errors.forEach((err: any) => {
                    newSpellErrors[err.field] = err.stats?.wrong_words || [];
                });
            }
            spellErrors = newSpellErrors;

            fileInfo    = data.file_info   ?? null;
            const form  = data.form_data   ?? {};
            degreeId    = form.degree?.degree_id   ?? null;
            advisorId   = form.advisor?.advisor_id ?? null;

            pairedKeywords = (form.keywords || []).map((kw: any) => ({
                th: kw.keyword_text_th || '',
                en: kw.keyword_text_en || ''
            }));

            selectedDegreeId = form.degree?.degree_id || '';
            selectedFacultyId = form.faculty?.faculty_id || '';
            selectedDepartmentId = form.department?.department_id || '';
            
            if (form.advisors && form.advisors.length > 0) {
                selectedAdvisors = form.advisors.map((a: any) => ({ advisor_id: a.advisor_id || '' }));
            } else {
                selectedAdvisors = [{ advisor_id: '' }];
            }

            if (form.title_th) {
                ocrDataThai = {
                    title:        form.title_th                  ?? '',
                    faculty:      form.faculty?.faculty_name_th  ?? '',
                    department:   form.department?.department_name_th ?? '',
                    degree:       form.degree?.degree_name_th    ?? '',
                    academicYear: form.academic_year_be          ?? '',
                    authors:  (form.students ?? []).map((s: any) => ({ name: s.student_name_th    ?? '', studentId: s.student_id ?? '' })),
                    advisors: (form.advisors ?? []).map((a: any) => ({ name: a.advisor_name_th ?? '' })),
                    abstract: form.abstract_th ?? '',
                    keywords: (form.keywords ?? []).map((k: any) => k.th ?? ''),
                };
            }
            

            ocrDataEnglish = {
                title:        form.title_en                  ?? '',
                faculty:      form.faculty?.faculty_name_en  ?? '',
                department:   form.department?.department_name_en ?? '',
                degree:       form.degree?.degree_name_en    ?? '',
                academicYear: form.academic_year_ce          ?? '',
                authors:  (form.students ?? []).map((s: any) => ({ name: s.student_name_en    ?? '', studentId: s.student_id ?? '' })),
                advisors: (form.advisors ?? []).map((a: any) => ({ name: a.advisor_name_en ?? '' })),
                abstract: form.abstract_en ?? '',
                keywords: (form.keywords ?? []).map((k: any) => k.en ?? ''),
            };

            const currentPayload = buildPayload();
            originalOcrPayload = JSON.parse(JSON.stringify(currentPayload));

        } catch (error) {
            console.error('OCR Error:', error);
            
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุในการประมวลผล OCR';

            Swal.fire({
                title: 'ไม่สามารถอัปโหลดได้',
                text: errorMessage,
                icon: 'error',
            });
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

        const degObj = masterDegrees.find((d: any) => d.degree_id === selectedDegreeId) || {};
        const facObj = availableFaculties.find((f: any) => f.faculty?.faculty_id === selectedFacultyId)?.faculty || {};
        const deptObj = availableDepartments.find((d: any) => d.department_id === selectedDepartmentId) || {};

        const projectData = {
            title_th:      ocrDataThai.title,
            title_en:      ocrDataEnglish.title,
            abstract_th:   ocrDataThai.abstract,
            abstract_en:   ocrDataEnglish.abstract,
            academic_year_be: ocrDataThai.academicYear,
            academic_year_ce: ocrDataEnglish.academicYear,
            degree: {
                degree_id: selectedDegreeId || null,
                degree_name_th: degObj.degree_name_th || '',
                degree_name_en: degObj.degree_name_en || '',
            },
            department: {
                department_id: selectedDepartmentId || null,
                department_name_th: deptObj.department_name_th || '',
                department_name_en: deptObj.department_name_en || '',
            },
            faculty: {
                faculty_id: selectedFacultyId || null,
                faculty_name_th: facObj.faculty_name_th || '',
                faculty_name_en: facObj.faculty_name_en || '',
            },
            students: mergeList(ocrDataThai.authors, ocrDataEnglish.authors, (th, en) => ({
                student_id:      th.studentId || en.studentId || '',
                student_name_th: th.name,
                student_name_en: en.name,
            })),
            advisors: selectedAdvisors.map(adv => {
                const advObj = masterAdvisors.find(a => a.advisor_id === adv.advisor_id) || {};
                return {
                    advisor_id: adv.advisor_id || null,
                    advisor_name_th: advObj.advisor_name_th || '',
                    advisor_name_en: advObj.advisor_name_en || ''
                };
            }),
            keywords: pairedKeywords.map(kw => ({
                keyword_text_th: kw.th,
                keyword_text_en: kw.en
            })),
            file_info: fileInfo,
        };

        return {
            data: projectData,
            old_data: originalOcrPayload ? originalOcrPayload.data : null 
        };
    };

    const handleSubmit = async (event: SubmitEvent) => {
        event.preventDefault();
        if (!fileInfo) { 
            Swal.fire('ข้อผิดพลาด', 'ไม่พบข้อมูลไฟล์อ้างอิง', 'error'); 
            return; 
        }

        const getBackendErrorMessage = async (response: Response, fallback: string) => {
            try {
                const errorData = await response.json();
                return errorData?.detail || errorData?.error || errorData?.message || fallback;
            } catch {
                return fallback;
            }
        };

        // 1. ตรวจสอบข้อมูลภาษาอังกฤษ (บังคับทุกกรณี)
        const isEngMissingText = ocrDataEnglish.title.trim() === '' || ocrDataEnglish.abstract.trim() === '' || ocrDataEnglish.academicYear.trim() === '';
        
        const isEngAuthorMissing = ocrDataEnglish.authors.length === 0 || ocrDataEnglish.authors.some(a => a.name.trim() === '' || !a.studentId || a.studentId.trim() === '');
        
        const isEngKeywordMissing = pairedKeywords.length === 0 || 
                                    pairedKeywords.some(kw => kw.en.trim() === '');

        if (isEngMissingText || isEngAuthorMissing || isEngKeywordMissing) {
            Swal.fire('ข้อผิดพลาด', 'กรุณากรอกข้อมูลภาษาอังกฤษ (ชื่อ, บทคัดย่อ, ปีการศึกษา, ผู้จัดทำพร้อมรหัส, คำสำคัญ) ให้ครบถ้วน', 'error');
            return;
        }

        // 2. ตรวจสอบ Master Data (ต้องมีข้อมูล)
        if (!selectedDegreeId || !selectedFacultyId || !selectedDepartmentId) {
            Swal.fire('ข้อผิดพลาด', 'กรุณาเลือกหลักสูตร คณะ และภาควิชาให้ครบถ้วน', 'error');
            return;
        }

        // 3. ตรวจสอบ Master Data (ความสอดคล้องกัน)
        const isFacultyValid = availableFaculties.some(f => f?.faculty?.faculty_id === selectedFacultyId);
        const isDepartmentValid = availableDepartments.some((d : any) => d.department_id === selectedDepartmentId);
        
        if (!isFacultyValid || !isDepartmentValid) {
            Swal.fire('ข้อผิดพลาด', 'หลักสูตร คณะ หรือภาควิชาที่เลือกไม่สอดคล้องกัน กรุณาเลือกใหม่', 'error');
            return;
        }

        // 4. ตรวจสอบ Advisor (ต้องมีข้อมูล)
        if (selectedAdvisors.length === 0 || selectedAdvisors.some(adv => !adv.advisor_id)) {
            Swal.fire('ข้อผิดพลาด', 'กรุณาเลือกอาจารย์ที่ปรึกษา', 'error');
            return;
        }

        // 5. ตรวจสอบเงื่อนไขข้อมูลภาษาไทย (บังคับครบ ถ้ามีการกรอกมาบางส่วน)
        const hasSomeThaiData = 
            ocrDataThai.title.trim() !== '' || 
            ocrDataThai.abstract.trim() !== '' || 
            ocrDataThai.authors.some(a => a.name.trim() !== '' || (a.studentId && a.studentId.trim() !== ''));

        if (hasSomeThaiData) {
            const isThaiTitleIncomplete = ocrDataThai.title.trim() === '';
            const isThaiAbstractIncomplete = ocrDataThai.abstract.trim() === '';
            const isThaiAuthorIncomplete = ocrDataThai.authors.length === 0 || ocrDataThai.authors.some(a => a.name.trim() === '' || !a.studentId || a.studentId.trim() === '');
            const isThaiKeywordIncomplete = pairedKeywords.length === 0 || 
                                            pairedKeywords.some(kw => kw.th.trim() === '');

            if (isThaiTitleIncomplete || isThaiAbstractIncomplete || isThaiAuthorIncomplete || isThaiKeywordIncomplete) {
                Swal.fire('ข้อผิดพลาด', 'คุณมีการระบุข้อมูลภาษาไทย กรุณากรอกข้อมูลภาษาไทยที่จำเป็น (ชื่อ, บทคัดย่อ, ผู้จัดทำพร้อมรหัส, คำสำคัญ) ให้ครบถ้วน', 'error');
                return;
            }
        }

        isSaving = true;
        try {
            const response = await fetch(`${PUBLIC_API_URL}/project/save`, {
                method:      'POST',
                headers:     { 'Content-Type': 'application/json' },
                body:        JSON.stringify(buildPayload()),
                credentials: 'include',
            });
            if (!response.ok) {
                const message = await getBackendErrorMessage(response, `Failed to save: ${response.status}`);
                throw new Error(message);
            }

            Swal.fire({
                    title: 'บันทึกสำเร็จ!',
                    text: 'บันทึกข้อมูลโปรเจกต์สำเร็จ',
                    icon: 'success',
                    confirmButtonColor: '#f97316'
                });

            currentStep   = 1;
            uploadedFile  = null;
            selectedPages = [];
            fileInfo      = null;
            await goto('/profile');
        } catch (error) {
            console.error('Save Error:', error);
            Swal.fire(
                'ข้อผิดพลาด',
                error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
                'error'
            );
        } finally {
            isSaving = false;
        }
    };
</script>

<main class="min-h-screen bg-white px-4 md:px-8 py-10 md:py-16 text-black">

    {#if isAccessDenied}
        <header class="text-center mb-8 md:mb-12">
            <h1 class="text-2xl md:text-3xl font-bold text-black">อัปโหลดปัญหาพิเศษ</h1>
        </header>
        <div class="max-w-3xl mx-auto bg-white p-10 rounded-xl shadow-md border border-red-200 text-center">
            <div class="text-red-500 mb-4">
                <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</h1>
            <p class="text-gray-600 mb-6">เฉพาะนักศึกษาเท่านั้นที่สามารถอัปโหลดปัญหาพิเศษได้</p>
            <button 
                onclick={() => goto('/')}
                class="btn btn-primary"
            >
                กลับสู่หน้าหลัก
            </button>
        </div>
    {:else}
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

                            <div class="mt-8 border border-orange-200 rounded-xl p-4 md:p-6 lg:p-8 bg-orange-50/30 shadow-sm w-full">
                                <h3 class="text-base md:text-lg font-bold text-orange-800 border-b border-orange-200 pb-3 mb-6">
                                    3.3 ข้อมูลอ้างอิง (Master Data)
                                </h3>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div class="form-control md:col-span-2">
                                        <label for="degreeSelect" class="label"><span class="label-text font-bold text-gray-700">หลักสูตร (Degree)</span></label>
                                        <SearchableDropdown 
                                            bind:value={selectedDegreeId} 
                                            onchange={handleDegreeChange}
                                            placeholder="-- ค้นหาหลักสูตร --"
                                            defaultOptionText="-- เลือกหลักสูตร --"
                                            valueKey="id"
                                            options={uniqueDegrees.map(d => ({ id: d.degree_id, label: `${d.degree_name_th} (${d.degree_name_en})` }))}
                                        />
                                    </div>

                                    <div class="form-control">
                                        <label for="facultySelect" class="label"><span class="label-text font-bold text-gray-700">คณะ (Faculty)</span></label>
                                        <SearchableDropdown 
                                            bind:value={selectedFacultyId} 
                                            onchange={handleFacultyChange}
                                            disabled={!selectedDegreeId}
                                            placeholder="-- ค้นหาคณะ --"
                                            defaultOptionText="-- เลือกคณะ --"
                                            valueKey="id"
                                            options={availableFaculties.map(item => ({ id: item.faculty.faculty_id, label: `${item.faculty.faculty_name_th} (${item.faculty.faculty_name_en})` }))}
                                        />
                                    </div>

                                    <div class="form-control">
                                        <label for="deptSelect" class="label"><span class="label-text font-bold text-gray-700">ภาควิชา (Department)</span></label>
                                        <SearchableDropdown 
                                            bind:value={selectedDepartmentId} 
                                            disabled={!selectedFacultyId}
                                            placeholder="-- ค้นหาภาควิชา --"
                                            defaultOptionText="-- เลือกภาควิชา --"
                                            valueKey="id"
                                            options={availableDepartments.map((dept: any) => ({ id: dept.department_id, label: `${dept.department_name_th} (${dept.department_name_en})` }))}
                                        />
                                    </div>
                                </div>

                                <div class="divider my-6"></div>

                                <div class="flex justify-between items-center mb-4">
                                    <span class="label-text font-bold text-gray-700">อาจารย์ที่ปรึกษา (Advisors)</span>
                                    <button type="button" class="btn btn-sm btn-outline border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white" onclick={addAdvisor}>
                                        <Plus class="w-4 h-4"/> เพิ่มอาจารย์
                                    </button>
                                </div>
                                <div class="flex flex-col gap-3">
                                    {#each selectedAdvisors as advisor, index}
                                        <div class="flex items-center gap-2 w-full">
                                            <SearchableDropdown 
                                                bind:value={advisor.advisor_id}
                                                placeholder="-- ค้นหาอาจารย์ --"
                                                defaultOptionText="-- เลือกอาจารย์ --"
                                                valueKey="id"
                                                options={masterAdvisors.map(a => ({ id: a.advisor_id, label: `${a.advisor_name_th} (${a.advisor_name_en})` }))}
                                            />
                                            <button type="button" class="btn btn-square btn-error btn-outline" onclick={() => removeAdvisor(index)} disabled={selectedAdvisors.length === 1}>
                                                <Trash2 class="w-5 h-5" />
                                            </button>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                                
                            <div class="mt-8 border border-orange-200 rounded-xl p-4 md:p-6 lg:p-8 bg-orange-50/30 shadow-sm w-full">
                                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-orange-200 pb-3 mb-6 gap-3">
                                    <h3 class="text-base md:text-lg font-bold text-orange-800">
                                        3.4 คำสำคัญ (Keywords)
                                    </h3>
                                    <button type="button" onclick={addKeyword} class="btn btn-sm btn-outline btn-primary bg-white">
                                        <Plus class="w-4 h-4"/> เพิ่มคำสำคัญ
                                    </button>
                                </div>
                                
                                <div class="flex flex-col gap-4">
                                    {#each pairedKeywords as kw, index}
                                        <div class="flex flex-col md:flex-row gap-4 items-start md:items-center p-4 ">
                                            <div class="flex-1 w-full">
                                                <label for="keyword-th-{index}" class="label py-1"><span class="label-text font-bold text-gray-700">คำสำคัญ (TH)</span></label>
                                                <SpellCheckTextarea 
                                                    bind:value={kw.th} 
                                                    rows={1}
                                                    inputClass="textarea textarea-bordered focus:border-orange-500 border-orange-300 focus:outline-orange-600 w-full bg-white text-sm md:text-base min-h-0 h-11 py-2.5" 
                                                />
                                            </div>
                                            <div class="flex-1 w-full">
                                                <label for="keyword-en-{index}" class="label py-1"><span class="label-text font-bold text-gray-700">Keyword (EN)</span></label>
                                                <SpellCheckTextarea 
                                                    bind:value={kw.en} 
                                                    rows={1}
                                                    inputClass="textarea textarea-bordered focus:border-orange-500 border-orange-300 focus:outline-orange-600 w-full bg-white text-sm md:text-base min-h-0 h-11 py-2.5" 
                                                />
                                            </div>
                                            <button type="button" class="btn btn-square btn-error btn-outline md:mt-7 shrink-0" onclick={() => removeKeyword(index)}>
                                                <Trash2 class="w-5 h-5" />
                                            </button>
                                        </div>
                                    {/each}

                                    {#if pairedKeywords.length === 0}
                                        <p class="text-center text-gray-500 py-4">ยังไม่มีคำสำคัญ</p>
                                    {/if}
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
    {/if}
</main>
