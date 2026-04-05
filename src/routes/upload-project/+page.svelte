<svelte:head>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
</svelte:head>

<script lang="ts">
    import { Upload, FileCheckCorner, SquarePen, Loader2 } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    import { PUBLIC_API_URL } from '$env/static/public';
    import Abstract_th_page from '$lib/assets/Abstract_th_page.jpg';
    import Abstract_en_page from '$lib/assets/Abstract_en_page.jpg';
    import OcrForm from '$lib/components/OcrForm.svelte';

    // โครงสร้างข้อมูลชื่อบุคคล (ผู้จัดทำ/อาจารย์ที่ปรึกษา)
    interface AuthorAdvisor {
        studentId?: string;
        name: string;
    }

    // โครงสร้างข้อมูลโปรเจกต์ที่ใช้แสดงและแก้ไขผล OCR
    interface ProjectData {
        title: string;
        faculty: string;
        department: string;
        degree: string;
        academicYear: string;
        authors: AuthorAdvisor[];
        advisors: AuthorAdvisor[];
        abstract: string;
        keywords: string[];
    }

    let currentStep = $state(1);
    const stepItems = [
        { name: 'อัปโหลดไฟล์', icon : Upload },
        { name: 'เลือกหน้า', icon: FileCheckCorner },
        { name: 'ตรวจสอบและแก้ไข', icon: SquarePen }
    ];

    let uploadedFile = $state<File | null>(null);
    let fileDetails = $state({ name: '', pages: 0 });
    let pageThumbnails = $state<{ id: number; src: string }[]>([]);
	let isGeneratingThumbnails = $state(false);
    
    let isDragging = $state(false);

    // อ่านไฟล์ PDF และสร้างภาพตัวอย่างทุกหน้า
    const processPdfForThumbnails = async (file: File) => {
		isGeneratingThumbnails = true;
		pageThumbnails = [];

		try {
			const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
			pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

			const arrayBuffer = await file.arrayBuffer();
			const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

			const totalPages = pdf.numPages;
			fileDetails = { name: file.name, pages: totalPages };

			let tempThumbnails = [];
			for (let i = 1; i <= totalPages; i++) {
				const page = await pdf.getPage(i);
				const viewport = page.getViewport({ scale: 0.4 }); 

				const canvas = document.createElement('canvas');
				const context = canvas.getContext('2d');
				if (!context) throw new Error('Canvas not supported');

				canvas.height = viewport.height;
				canvas.width = viewport.width;

				await page.render({ canvasContext: context, viewport: viewport }).promise;
				tempThumbnails.push({
					id: i,
					src: canvas.toDataURL('image/jpeg', 0.8)
				});
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

    // รองรับการอัปโหลดแบบลากไฟล์มาวาง
    const handleFileDrop = (event: DragEvent) => {
		event.preventDefault();
        isDragging = false; 
		const file = event.dataTransfer?.files[0];
		if (file && file.type === 'application/pdf') {
			uploadedFile = file;
			processPdfForThumbnails(file);
		} else {
			alert('กรุณาอัปโหลดไฟล์ PDF เท่านั้น');
		}
	};

    // รองรับการอัปโหลดผ่าน input file
    const handleFileSelect = (event: Event) => {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (file && file.type === 'application/pdf') {
			uploadedFile = file;
			processPdfForThumbnails(file);
		} else {
			alert('กรุณาอัปโหลดไฟล์ PDF เท่านั้น');
		}
	};

    let selectedPages = $state<number[]>([]);
    // เลือกได้สูงสุด 2 หน้า (ไทย/อังกฤษ)
	const togglePageSelection = (pageNumber: number) => {
		if (selectedPages.includes(pageNumber)) {
			selectedPages = selectedPages.filter((p) => p !== pageNumber);
		} else if (selectedPages.length < 2) {
			selectedPages = [...selectedPages, pageNumber];
		} else {
			alert('คุณสามารถเลือกได้สูงสุด 2 หน้า เท่านั้น');
		}
	};

	let isLoadingOcr = $state(false);
    let isSaving = $state(false);
    let fileInfo = $state<{ file_path: string; save_name: string; thumbnail_path: string } | null>(null);
    let degreeId = $state<string | null>(null);
    let advisorId = $state<string | null>(null);

    let ocrDataThai = $state<ProjectData>({
        title: '', faculty: '', department: '', degree: '', academicYear: '', authors: [], advisors: [], abstract: '', keywords: []
    });
    let ocrDataEnglish = $state<ProjectData>({
        title: '', faculty: '', department: '', degree: '', academicYear: '', authors: [], advisors: [], abstract: '', keywords: []
    });

    // ส่งไฟล์และเลขหน้าที่เลือกไป OCR แล้ว map ผลลัพธ์เข้าฟอร์ม
    const extractOcrData = async () => {
        isLoadingOcr = true;
        try {
            const sortedPages = [...selectedPages].sort((a, b) => a - b);
            const queryParams = new URLSearchParams();
            sortedPages.forEach((page) => queryParams.append('pages', page.toString()));
            const url = `${PUBLIC_API_URL}/project/upload?${queryParams.toString()}`;

            const formData = new FormData();
            formData.append('file', uploadedFile as File);

            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Server responded failed with status ' + response.status);

            const data = await response.json();
            
            // เก็บ Metadata เผื่อนำไปใช้ตอน Save
            fileInfo = data.file_info || null;
            const form = data.form_data || {};
            
            degreeId = form.degree?.degree_id || null;
            advisorId = form.advisor?.advisor_id || null;

            // Map ใส่ฟอร์มภาษาไทย
            ocrDataThai = {
                title: form.title_th || '',
                faculty: form.faculty?.faculty_name_th || '',
                department: form.department?.department_name_th || '',
                degree: form.degree?.degree_name_th || '',
                academicYear: form.academic_year || '',
                authors: (form.students || []).map((s: any) => ({ name: s.name_th || '', studentId: s.student_id || '' })),
                advisors: (form.advisors || []).map((a: any) => ({ name: a.advisor_name_th || ''})),
                abstract: form.abstract_th || '',
                keywords: (form.keywords || []).map((k: any) => k.th || '')
            };

            // Map ใส่ฟอร์มภาษาอังกฤษ
            ocrDataEnglish = {
                title: form.title_en || '',
                faculty: form.faculty?.faculty_name_en || '',
                department: form.department?.department_name_en || '',
                degree: form.degree?.degree_name_en || '',
                academicYear: form.academic_year || '',
                authors: (form.students || []).map((s: any) => ({ name: s.name_en || '', studentId: s.student_id || '' })),
                advisors: (form.advisors || []).map((a: any) => ({ name: a.advisor_name_en || ''})),
                abstract: form.abstract_en || '',
                keywords: (form.keywords || []).map((k: any) => k.en || '')
            };

        } catch (error) {
            console.error('OCR Error:', error);
            alert('OCR processing failed');
            currentStep = 2; 
        } finally {
            isLoadingOcr = false;
        }
    }
    
    // ไปขั้นตอนถัดไป และเริ่ม OCR เมื่อเข้าสู่ขั้นตอนที่ 3
    const nextStep = () => {
        if (currentStep < 3) currentStep++;
        if (currentStep === 3) extractOcrData();
    };

    // ย้อนกลับไปขั้นตอนก่อนหน้า
    const prevStep = () => {
        if (currentStep > 1) currentStep--;
    };

    // บันทึกข้อมูลที่แก้ไขแล้วไปยังเซิร์ฟเวอร์
    const handleSubmit = async (event: SubmitEvent) => {
        event.preventDefault();
        isSaving = true;
        try {
            if (!fileInfo) throw new Error('ไม่พบข้อมูลไฟล์อ้างอิง');

            // รวมข้อมูลนักศึกษาเข้าด้วยกัน (ป้องกันกรณีผู้ใช้เผลอลบรายชื่อในฟอร์มภาษาใดภาษาหนึ่ง)
            const studentsPayload = [];
            const maxAuthors = Math.max(ocrDataThai.authors.length, ocrDataEnglish.authors.length);
            for(let i = 0; i < maxAuthors; i++) {
                const thA = ocrDataThai.authors[i] || { name: '', studentId: '' };
                const enA = ocrDataEnglish.authors[i] || { name: '', studentId: '' };
                studentsPayload.push({
                    student_id: thA.studentId || enA.studentId || '',
                    student_name_th: thA.name,
                    student_name_en: enA.name
                });
            }

            const advisorsPayload = [];
            const maxAdvisors = Math.max(ocrDataThai.advisors.length, ocrDataEnglish.advisors.length);
            for(let i = 0; i < maxAdvisors; i++) {
                const thA = ocrDataThai.advisors[i] || { name: ''};
                const enA = ocrDataEnglish.advisors[i] || { name: ''};
                advisorsPayload.push({
                    advisor_id: advisorId,
                    advisor_name_th: thA.name,
                    advisor_name_en: enA.name
                });
            }

            // รวม Keywords เข้าด้วยกัน
            const keywordsPayload = [];
            const maxKeywords = Math.max(ocrDataThai.keywords.length, ocrDataEnglish.keywords.length);
            for(let i = 0; i < maxKeywords; i++) {
                keywordsPayload.push({
                    keyword_text_th: ocrDataThai.keywords[i] || '',
                    keyword_text_en: ocrDataEnglish.keywords[i] || ''
                });
            }

            // จัด Schema ตามที่ Backend คาดหวัง
            const projectPayload = {
                title_th: ocrDataThai.title,
                title_en: ocrDataEnglish.title,
                abstract_th: ocrDataThai.abstract,
                abstract_en: ocrDataEnglish.abstract,
                academic_year: ocrDataThai.academicYear,
                degree: {
                    degree_id: degreeId,
                    degree_name_th: ocrDataThai.degree,
                    degree_name_en: ocrDataEnglish.degree
                },
                department: {
                    department_id: null,
                    department_name_th: ocrDataThai.department,
                    department_name_en: ocrDataEnglish.department
                },
                faculty: {
                    faculty_id: null,
                    faculty_name_th: ocrDataThai.faculty,
                    faculty_name_en: ocrDataEnglish.faculty
                },
                advisors: advisorsPayload,
                students: studentsPayload,
                keywords: keywordsPayload,
                file_info: fileInfo
            };

            // เรียกเส้น /project/save
            const response = await fetch(`${PUBLIC_API_URL}/project/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectPayload),
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to save project data: ' + response.status);

            alert('บันทึกข้อมูลโปรเจกต์สำเร็จ');
            currentStep = 1;
            uploadedFile = null;
            selectedPages = [];
            fileInfo = null;

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
    <!-- ส่วนหัวของหน้าสำหรับอัปโหลดปัญหาพิเศษ -->
    <header class="text-center mb-8 md:mb-12">
        <h1 class="text-2xl md:text-3xl font-bold text-black">อัปโหลดปัญหาพิเศษ</h1>
    </header>

    <!-- แถบแสดงสถานะของขั้นตอนการทำงาน -->
    <div class="flex justify-center mb-10 overflow-x-auto hide-scrollbar">
        <ul class="steps w-full max-w-3xl justify-center items-center text-xs md:text-sm font-medium">
            {#each stepItems as { name, icon }, index (index)}
                {@const IconComponent = icon}
                <li class="step {currentStep > index ? 'step-primary' : ''}">
                    <span class="step-icon flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full transition-all duration-300 shadow-sm
                        {currentStep > index ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-400 bg-gray-400 text-white'} my-2 md:my-3">
                        <IconComponent class="h-4 w-4 md:h-5 md:w-5" />
                    </span>
                    <span class="mt-1 md:mt-2 text-[10px] md:text-base px-1">{name}</span>
                </li>
            {/each}
        </ul>
    </div>
        
    {#if currentStep === 1}
        <!-- ขั้นตอนที่ 1: อัปโหลดไฟล์ PDF -->
        <section class="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <div class="bg-white border border-gray-500 shadow-lg rounded-2xl p-6 md:p-10">
                <h2 class="text-lg md:text-xl font-bold text-black text-center mb-8">ขั้นตอนที่ 1 : อัปโหลดไฟล์ PDF</h2>
                
                <div class="rounded-xl overflow-hidden">
                    <div 
                        class="drop-zone h-64 md:h-72 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer gap-3 transition-all duration-300 
                            {isDragging ? 'bg-orange-100 border-orange-500 scale-[1.02]' : 'bg-gray-50 hover:bg-orange-50 border-gray-300 hover:border-orange-400'}"
                        ondragover={(e) => { e.preventDefault(); isDragging = true; }}
                        ondragleave={() => isDragging = false}
                        ondrop={handleFileDrop}
                        onclick={() => document.getElementById('pdfFileInput')?.click()}
                        role="button"
                        tabindex="0"
                        onkeydown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                document.getElementById('pdfFileInput')?.click();
                            }
                        }}
                    >
                        <Upload class="h-16 w-16 md:h-20 md:w-20 text-orange-500 opacity-60 mb-2 transition-transform {isDragging ? 'scale-110' : ''}" />
                        <p class="font-bold text-gray-700 text-base md:text-lg">คลิกที่นี่เพื่ออัปโหลด</p>
                        <p class="text-sm text-gray-400">หรือลากไฟล์ PDF มาวางที่นี่</p>
                        <input type="file" id="pdfFileInput" accept="application/pdf" class="hidden" onchange={handleFileSelect}>
                    </div>
                </div>

                {#if fileDetails.name}
                    <div class="mt-8 bg-orange-50 border border-orange-200 rounded-xl p-6 flex flex-col gap-2 items-center text-center shadow-inner">
                        <p class="text-base md:text-lg text-orange-800 font-bold">อัปโหลดไฟล์เรียบร้อย</p>
                        <p class="text-gray-700 text-sm md:text-base break-all">ไฟล์: <span class="text-orange-600 font-semibold">{fileDetails.name}</span></p>
                        <p class="text-gray-700 text-sm md:text-base">จำนวน: <span class="text-orange-600 font-semibold">{fileDetails.pages}</span> หน้า</p>
                    </div>
                {/if}
            </div>

            <div class="flex justify-center mt-8">
				<button
					class="w-full md:w-2/3 lg:w-1/2 text-lg md:text-xl h-14 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
					onclick={nextStep}
					disabled={!uploadedFile || isGeneratingThumbnails}
				>
					{#if isGeneratingThumbnails}
						<Loader2 class="h-5 w-5 animate-spin" /> <span>กำลังสร้างภาพตัวอย่าง...</span>
					{:else}
						ถัดไป
					{/if}
				</button>
			</div>
        </section>
    {/if}

    {#if currentStep === 2}
        <!-- ขั้นตอนที่ 2: เลือกหน้าบทคัดย่อภาษาไทยและภาษาอังกฤษ -->
        <section class="max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <div class="bg-white border border-gray-500 shadow-lg rounded-2xl p-6 md:p-10">
                <h2 class="text-lg md:text-xl font-bold text-black text-center mb-8">ขั้นตอนที่ 2 : เลือกหน้าบทคัดย่อเพื่อทำการประมวลผล</h2>
                
                <div class="p-4 md:p-8 border border-orange-200 rounded-xl mb-10 bg-orange-50/50 shadow-inner">
                    <h3 class="text-base md:text-lg font-bold text-center text-black mb-6">ตัวอย่างหน้าที่ต้องเลือก</h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-10">
                        <div class="flex flex-col items-center gap-3">
                            <p class="text-sm md:text-base font-semibold text-gray-800 bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100">หน้าบทคัดย่อภาษาไทย</p>
                            <img src={Abstract_th_page} alt="Thai Abstract" class="aspect-3/4 w-full max-w-60 border-4 border-white shadow-md rounded-lg object-cover">
                        </div>
                        <div class="flex flex-col items-center gap-3">
                            <p class="text-sm md:text-base font-semibold text-gray-800 bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100">หน้าบทคัดย่อภาษาอังกฤษ</p>
                            <img src={Abstract_en_page} alt="English Abstract" class="aspect-3/4 w-full max-w-60 border-4 border-white shadow-md rounded-lg object-cover">
                        </div>
                    </div>
                    
                    <div class="mt-8 bg-white p-4 rounded-lg border border-orange-100 shadow-sm">
                        <p class="font-bold text-gray-800 mb-2 text-sm md:text-base">เงื่อนไขในการเลือกหน้า:</p>
                        <ul class="list-disc list-inside flex flex-col gap-1.5 text-sm text-gray-700">
                            <li>หน้าที่เลือกต้องมีโครงสร้างข้อมูลตรงกับหน้าตัวอย่าง</li>
                            <li>ต้องเลือก <strong>ทั้งหน้าภาษาไทย และหน้าภาษาอังกฤษ</strong> รวมเป็น 2 หน้า</li>
                        </ul>
                    </div>
                </div>

                <div class="text-center mb-6">
                    <p class="text-base md:text-lg font-bold text-gray-800">คลิกเลือกหน้าจากไฟล์ของคุณ (เลือก 2 หน้า)</p>
                </div>
                
                <div class="border border-gray-200 rounded-xl bg-gray-50/50 p-4 md:p-8 h-125 overflow-y-auto shadow-inner">        
                    <div class="flex flex-wrap justify-center gap-4 md:gap-8">
                        {#each pageThumbnails as { id, src }, index (index)}
                            <button
                                class="group relative flex flex-col items-center gap-3 w-28 md:w-36 transition-all duration-200 bg-transparent border-none cursor-pointer {selectedPages.includes(id) ? 'scale-105' : 'hover:scale-105 hover:-translate-y-1'}"
                                onclick={() => togglePageSelection(id)}
                            >
                                <div class="relative w-full aspect-[1/1.414] bg-white shadow-sm transition-all duration-200 flex items-center justify-center overflow-hidden rounded-md
                                    {selectedPages.includes(id) ? 'ring-4 ring-orange-500 ring-offset-2 shadow-lg' : 'border border-gray-200 group-hover:border-orange-300 group-hover:shadow-md'}">
                                    
                                    <img {src} alt="Page {id}" class="w-full h-full object-cover" />
                                    
                                    {#if selectedPages.includes(id)}
                                        <div class="absolute inset-0 bg-orange-500/20 mix-blend-multiply"></div>
                                    {/if}
                                </div>
                                
                                <span class="text-gray-700 font-bold text-sm bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100 group-hover:text-orange-600 transition-colors">หน้า {id}</span>

                                {#if selectedPages.includes(id)}
                                    <div class="absolute -top-3 -right-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md z-10 animate-in zoom-in duration-200">
                                        <FileCheckCorner class="h-4 w-4" />
                                    </div>
                                {/if}
                            </button>
                        {/each}
                    </div>
                </div>

                <div class="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6 text-center font-medium shadow-sm">
                    <p class="text-base md:text-lg text-blue-900">หน้าที่คุณเลือกไว้: <span class="text-blue-700 font-bold">{selectedPages.length === 0 ? 'ยังไม่ได้เลือกหน้า' : selectedPages.join(', ')}</span></p>
                </div>
            </div>

            <div class="max-w-5xl mx-auto flex flex-col-reverse md:flex-row justify-between gap-4 md:gap-8 mt-8">
                <button 
                    class="btn btn-outline w-full md:w-1/2 text-lg h-14 border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded-xl bg-white shadow-sm" 
                    onclick={prevStep}>
                    ย้อนกลับ
                </button>
                <button 
                    class="w-full md:w-1/2 text-lg md:text-xl h-14 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors duration-300 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
                    onclick={nextStep}
                    disabled={selectedPages.length !== 2}
                >
                    ถัดไป (เลือกแล้ว {selectedPages.length}/2)
                </button>
            </div>
        </section>
    {/if}

    {#if currentStep === 3}
        <section class="max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <form onsubmit={handleSubmit}>
                <div class="bg-white border border-gray-500 shadow-sm rounded-2xl p-6 md:p-10">
                    <h2 class="text-lg md:text-xl lg:text-2xl font-bold text-black text-center mb-10">ขั้นตอนที่ 3 : ตรวจสอบและแก้ไขข้อมูล OCR</h2>
                        
                    {#if isLoadingOcr}
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
                                <h3 class="text-base md:text-lg font-bold text-orange-800 border-b border-orange-200 pb-3 mb-6">3.1 ข้อมูลภาษาไทย</h3>
                                <OcrForm bind:data={ocrDataThai} lang="th" />
                            </div>
                            
                            <div class="border border-orange-200 rounded-xl p-4 md:p-6 lg:p-8 bg-orange-50/30 shadow-sm">
                                <h3 class="text-base md:text-lg font-bold text-orange-800 border-b border-orange-200 pb-3 mb-6">3.2 ข้อมูลภาษาอังกฤษ</h3>
                                <OcrForm bind:data={ocrDataEnglish} lang="en" />
                            </div>
                        </div>
                    {/if}
                </div>

                <div class="max-w-7xl mx-auto flex flex-col-reverse md:flex-row justify-between gap-4 md:gap-8 mt-8">
                    <button 
                        type="button"
                        class="btn btn-outline w-full md:w-1/3 text-lg h-14 border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded-xl bg-white shadow-sm" 
                        onclick={prevStep}
                        disabled={isLoadingOcr || isSaving}>
                        ย้อนกลับ
                    </button>
                    
                    <button 
                        type="submit"
                        class="w-full md:w-2/3 text-lg md:text-xl h-14 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors duration-300 cursor-pointer disabled:bg-gray-400 shadow-md flex items-center justify-center gap-2" 
                        disabled={isLoadingOcr || isSaving}>
                        
                        {#if isLoadingOcr}
                            <span class="loading loading-spinner loading-sm"></span> กำลังอ่านข้อมูล...
                        {:else if isSaving}
                            <span class="loading loading-spinner loading-sm"></span> กำลังบันทึก...
                        {:else}
                            <FileCheckCorner class="h-5 w-5"/> บันทึกข้อมูล
                        {/if}
                        
                    </button>
                </div>
            </form>
        </section>
    {/if}
</main>