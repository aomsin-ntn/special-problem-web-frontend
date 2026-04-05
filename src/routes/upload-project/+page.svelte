<svelte:head>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
</svelte:head>

<script lang="ts">
    import { Upload, FileCheckCorner, SquarePen, Form } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    import Abstract_th_page from '$lib/assets/Abstract_th_page.jpg';
    import Abstract_en_page from '$lib/assets/Abstract_en_page.jpg';
    import OcrForm from '$lib/components/OcrForm.svelte';
    import { PUBLIC_API_URL } from '$env/static/public';

    interface AuthorAdvisor {
        name: string;
    }

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

    //อัปโหลดไฟล์
    let uploadedFile = $state<File | null>(null);
    let fileDetails = $state({ name: '', pages: 0 });

    let pageThumbnails = $state<{ id: number; src: string }[]>([]);
	let isGeneratingThumbnails = $state(false);

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

	const handleFileDrop = (event: DragEvent) => {
		event.preventDefault();
		const file = event.dataTransfer?.files[0];
		if (file && file.type === 'application/pdf') {
			uploadedFile = file;
			processPdfForThumbnails(file);
		} else {
			alert('กรุณาอัปโหลดไฟล์ PDF เท่านั้น');
		}
	};

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
    let ocrDataThai = $state<ProjectData>({
        title: '', faculty: '', department: '', degree: '', academicYear: '', authors: [], advisors: [], abstract: '', keywords: []
    });
    let ocrDataEnglish = $state<ProjectData>({
        title: '', faculty: '', department: '', degree: '', academicYear: '', authors: [], advisors: [], abstract: '', keywords: []
    });

    /**
     * 
    
    const simulateOcrProcess = () => {
        isLoadingOcr = true;
        setTimeout(() => {
            ocrDataThai = {
                title: 'โครงงานการพัฒนาระบบอัปโหลดปัญหาพิเศษเพื่อการจัดเก็บแบบดิจิทัล',
                faculty: 'คณะเทคโนโลยีสารสนเทศและการสื่อสาร',
                department: 'วิทยาการคอมพิวเตอร์',
                degree: 'ปริญญาตรีวิทยาศาสตรบัณฑิต',
                academicYear: '2567',
                authors: [{ name: 'นายสมาน รักชาติ' }, { name: 'นางสาวสุขใจ ดีงาม' }],
                advisors: [{ name: 'อาจารย์พิชัย แก้วกล้า' }, { name: 'อาจารย์สุดา ผ่องใส' }],
                abstract: 'บทคัดย่อภาษาไทยที่สกัดได้จากหน้า PDF จะมาแสดงที่นี่...',
                keywords: ['ระบบจัดเก็บ', 'ดิจิทัล', 'ปัญหาพิเศษ', 'การประมวลผลเอกสาร', 'Svelte', 'Tailwind']
            };
            ocrDataEnglish = {
                title: 'Project Development of a Special Problem Upload System for Digital Archiving',
                faculty: 'School of Information and Communication Technology',
                department: 'Computer Science',
                degree: 'Bachelor of Science (Computer Science)',
                academicYear: '2024',
                authors: [{ name: 'Mr. Saman Rakchat' }, { name: 'Miss Sukjai Deengam' }],
                advisors: [{ name: 'Ajarn Pichai Kaewkla' }, { name: 'Ajarn Suda Phongsai' }],
                abstract: 'English abstract extracted from the PDF pages will appear here...',
                keywords: ['Archiving System', 'Digital', 'Special Problem', 'Document Processing', 'Svelte', 'Tailwind']
            };
            isLoadingOcr = false;
        }, 1500);
    };
    */

    let currentProjectID = $state<string>('');

    //ส่งไฟล์ให้ back ไปทำ OCR และบันทึก project ลง database
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
                body: formData
            });

            if (!response.ok) throw new Error('Server responded failed with status ' + response.status);

            const data = await response.json();

            currentProjectID = data.saved_as;

            const th = data['fields-th'] || {};
            ocrDataThai = {
                title: th.Title || '',
                faculty: th.Faculty || '',
                department: th.Department || '',
                degree: th.Degree || '',
                academicYear: th.AcademicYear || '',
                authors: th.Name ? [{ name: th.Name }] : [], 
                advisors: th.Advisor ? [{ name: th.Advisor }] : [],
                abstract: th.Abstract || '',
                keywords: th.Keywords ? th.Keywords.replace(/^:\s*/, '').split(',').map((k: string) => k.trim()).filter(Boolean) : []
            };

            const en = data['fields-en'] || {};
            ocrDataEnglish = {
                title: en.Title || '',
                faculty: en.Faculty || '',
                department: en.Department || '',
                degree: en.Degree || '',
                academicYear: en.AcademicYear || '',
                authors: en.Name ? [{ name: en.Name }] : [],
                advisors: en.Advisor ? [{ name: en.Advisor }] : [],
                abstract: en.Abstract || '',
                keywords: en.Keywords ? en.Keywords.replace(/^:\s*/, '').split(',').map((k: string) => k.trim()).filter(Boolean) : []
            };
        } catch (error) {
            console.error('OCR Error:', error);
            alert('OCR processing failed');
            currentStep = 2;
        } finally {
            isLoadingOcr = false;
        }
    }
    
    const nextStep = () => {
        if (currentStep < 3) currentStep++;
        if (currentStep === 3) extractOcrData();
    };

    const prevStep = () => {
        if (currentStep > 1) currentStep--;
    };

    const handleSubmit = async (event: SubmitEvent) => {
        event.preventDefault();
        isLoadingOcr = true;
        try {
            if (!currentProjectID) throw new Error('ไม่พบรหัสโปรเจกต์อ้างอิง');

            const projectPayload = {
                thai: ocrDataThai,
                english: ocrDataEnglish
            };

            const response = await fetch(`${PUBLIC_API_URL}/project/edit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectPayload)
            });

            if (!response.ok) throw new Error('Failed to save project data: ' + response.status);

            alert('บันทึกข้อมูลโปรเจกต์สำเร็จ');
            currentStep = 1;
            uploadedFile = null;
            selectedPages = [];
            currentProjectID = '';

            await goto('/Profile');

        } catch (error) {
            console.error('Save Error:', error);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
        } finally {
            isLoadingOcr = false;
        }
        
    };

</script>

<main class="min-h-screen bg-white px-8 py-12 pt-16 text-black">
    <header class="text-center mb-10">
        <h1 class="text-xl md:text-2xl lg:text-3xl font-semibold text-black">อัปโหลดปัญหาพิเศษ</h1>
    </header>

    <div class="flex justify-center mb-10">
        <ul class="steps w-full max-w-2xl justify-center item-center">
            {#each stepItems as { name, icon }, index (index)}
                {@const IconComponent = icon}
                <li class="step {currentStep > index ? 'step-primary' : ''} ">
                    <span class="step-icon flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300
                        {currentStep > index ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-500 bg-gray-500 text-white'} my-2">
                        <IconComponent class="h-5 w-5" />
                    </span>
                    {name}
                </li>
            {/each}
        </ul>
    </div>
        
    {#if currentStep === 1}
        <section class="max-w-6xl mx-auto">
            <div class="bg-white border-2 border-gray-500 shadow-lg rounded-xl p-8 pt-10">
                <h2 class="text-xl font-bold text-black text-center mb-8">ขั้นตอนที่ 1 : อัปโหลดไฟล์ PDF</h2>
                <div class="card shadow-none rounded-xl overflow-hidden">
                    <div 
                        class="drop-zone h-64 bg-orange-50 hover:bg-orange-200 flex flex-col items-center justify-center text-center cursor-pointer gap-2 transition-colors duration-300"
                        ondragover={(e) => e.preventDefault()}
                        ondrop={handleFileDrop}
                        onclick={() => document.getElementById('pdfFileInput')?.click()}
                        role="button"
                        tabindex="0"
                        onkeydown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                document.getElementById('pdfFileInput')?.click();
                            }
                        }}
                    >
                        <svg class="h-20 w-20 text-orange-700 opacity-50 mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        <p class="font-bold text-gray-300">คลิกที่นี่เพื่ออัปโหลด</p>
                        <p class="text-sm text-gray-300">หรือลากไฟล์มาวางที่นี่เพื่ออัปโหลด</p>
                        <input type="file" id="pdfFileInput" accept="application/pdf" class="hidden" onchange={handleFileSelect}>
                    </div>
                </div>

                {#if fileDetails.name}
                    <div class="mt-8 bg-white border border-orange-500 rounded-lg p-6 flex flex-col gap-2 items-center text-center font-semibold">
                        <p class="text-lg md:text-xl text-orange-700">อัปโหลดไฟล์เรียบร้อย</p>
                        <p class="text-gray-300">ไฟล์: <span class="text-orange-700 font-bold">{fileDetails.name}</span></p>
                        <p class="text-gray-300">จำนวน : <span class="text-orange-700 font-bold">{fileDetails.pages}</span> หน้า</p>
                    </div>
                {/if}
            </div>
            <div class="max-w-6xl mx-auto flex justify-center mt-10">
				<button
					class="w-full text-xl h-14 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors duration-300 cursor-pointer disabled:cursor-not-allowed disabled:hidden disabled:bg-gray-400 shadow-sm flex items-center justify-center gap-2"
					onclick={nextStep}
					disabled={!uploadedFile || isGeneratingThumbnails}
				>
					{#if isGeneratingThumbnails}
						<span class="loading loading-spinner loading-sm"></span> กำลังสร้างภาพตัวอย่าง...
					{:else}
						ถัดไป
					{/if}
				</button>
			</div>
        </section>
    {/if}

    {#if currentStep === 2}
        <section class="max-w-6xl mx-auto">
            <div class="bg-white border-2 border-gray-500 shadow-lg rounded-xl p-8 pt-10">
                <h2 class="text-xl font-bold text-center mb-10">ขั้นตอนที่ 2 : เลือกหน้าบทคัดย่อเพื่อทำการประมวลผลข้อมูลโปรเจกต์</h2>
                
                <div class="p-6 border-2 border-orange-200 rounded-xl mb-10 bg-orange-50">
                    <h3 class="text-lg font-bold text-center mb-6">ตัวอย่างหน้าที่ต้องเลือก</h3>
                    <div class="grid grid-cols-2 gap-8 px-10">
                        <div class="preview-item flex flex-col items-center gap-2">
                            <p class="text-sm font-semibold text-black">หน้าบทคัดย่อภาษาไทย</p>
                            <img src={Abstract_th_page} alt="Thai Abstract Placeholder" class="aspect-3/4 w-full max-w-xs border-2 border-orange-300 rounded bg-gray-100 shadow-md">
                        </div>
                        <div class="preview-item flex flex-col items-center gap-2">
                            <p class="text-sm font-semibold">หน้าบทคัดย่อภาษาอังกฤษ</p>
                            <img src={Abstract_en_page} alt="English Abstract Placeholder" class="aspect-3/4 w-full max-w-xs border-2 border-orange-300 rounded bg-gray-100 shadow-md">
                        </div>
                    </div>
                    <div class="mt-6 flex flex-col gap-2 text-sm text-left px-10">
                        <p class="font-bold">เงื่อนไขในการเลือกหน้า :</p>
                        <ul class="list-disc list-inside flex flex-col gap-1 pl-2">
                            <li>หน้าที่เลือกต้องมีข้อมูลตรงกับหน้าตัวอย่าง</li>
                            <li>ต้องเลือกทั้งหน้าภาษาไทย และหน้าภาษาอังกฤษ</li>
                        </ul>
                    </div>
                </div>

                <p class="text-center mb-2 font-semibold">เลือกหน้าจากไฟล์โปรเจกต์ของคุณเพื่อประมวลผลข้อมูลโปรเจกต์</p>
                <p class="text-center mb-6">จำนวน 2 หน้า</p>
                <div class="border-2 border-orange-200 rounded-xl bg-orange-50 p-6 h-125 md:h-150 overflow-y-auto">                    

					
                        <div class="flex flex-wrap justify-center gap-6 md:gap-8">
                            {#each pageThumbnails as { id, src }, index (index)}
                                
                                <button
                                    class="group relative flex flex-col items-center gap-3 w-28 md:w-36 transition-transform duration-200 
                                    {selectedPages.includes(id) ? 'scale-105' : 'hover:scale-105'}"
                                    onclick={() => togglePageSelection(id)}
                                >
                                    <div class="relative w-full aspect-[1/1.414] bg-white shadow-sm transition-all duration-200 flex items-center justify-center overflow-hidden
                                        {selectedPages.includes(id) ? 'border-4 border-orange-500 shadow-xl' : 'border border-gray-300 group-hover:border-orange-400 group-hover:shadow-md'}">
                                        
                                        <img {src} alt="Page {id}" class="w-full h-full object-cover" />
                                        
                                        {#if selectedPages.includes(id)}
                                            <div class="absolute inset-0 bg-orange-500 opacity-10"></div>
                                        {/if}
                                    </div>
                                    
                                    <span class="text-gray-700 font-semibold text-sm">หน้า {id}</span>

                                    {#if selectedPages.includes(id)}
                                        <div class="absolute -top-3 -right-3 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md z-10">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                            </svg>
                                        </div>
                                    {/if}
                                </button>
                            {/each}
                        </div>
				    </div>
                    <div class="mt-8 bg-blue-50 border-2 border-blue-300 rounded-lg p-6 text-center font-semibold shadow-inner">
                        <p class="text-lg text-blue-900">หน้าที่เลือก : <span class="text-blue-700">{selectedPages.length === 0 ? 'ยังไม่ได้เลือกหน้า' : selectedPages.join(', ')}</span></p>
                    </div>
                </div>

                <div class="max-w-6xl mx-auto flex justify-between gap-8 mt-10">
                    <button 
                        class="btn btn-outline w-full max-w-xl text-lg h-14 border-2 border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-600 rounded-xl" 
                        onclick={prevStep}>
                        ย้อนกลับ
                    </button>
                    <button 
                        class="w-full max-w-xl text-xl h-14 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors duration-300 cursor-pointer disabled:bg-gray-400 shadow-sm"
                        onclick={nextStep}
                        disabled={selectedPages.length !== 2}
                    >
                        ถัดไป (เลือกแล้ว {selectedPages.length}/2)
                    </button>
                </div>

        </section>
    {/if}

    {#if currentStep === 3}
        <section class="max-w-6xl mx-auto">
            <form onsubmit={handleSubmit}>
                <div class="bg-white border-2 border-gray-500 shadow-lg rounded-xl p-8 pt-10">
                    {#if isLoadingOcr}
                        <div class="flex flex-col items-center justify-center gap-4 text-orange-600 text-xl font-bold py-20">
                            <span class="loading loading-spinner loading-lg text-orange-600"></span>
                            <p>กำลังประมวลผล OCR...</p>
                        </div>
                    {:else}
                        <h2 class="text-xl md:text-2xl font-bold text-gray-900 text-center mb-10">ขั้นตอนที่ 3 : ตรวจสอบและแก้ไขข้อมูล OCR</h2>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div class="ocr-section border-2 border-orange-200 rounded-xl p-8 bg-orange-50">
                                <h3 class="text-lg font-bold text-gray-900 mb-8">3.1 ข้อมูลภาษาไทย</h3>
                                <OcrForm data={ocrDataThai} lang="th" />
                            </div>
                            
                            <div class="ocr-section border-2 border-orange-200 rounded-xl p-8 bg-orange-50">
                                <h3 class="text-lg font-bold text-gray-900 mb-8">3.2 ข้อมูลภาษาอังกฤษ</h3>
                                <OcrForm data={ocrDataEnglish} lang="en" />
                            </div>
                        </div>
                    {/if}
                </div>
                <div class="max-w-6xl mx-auto flex justify-between gap-8 mt-10">
                    <button 
                        type="button"
                        class="btn btn-outline w-full max-w-xl text-lg h-14 border-2 border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-600 rounded-xl" 
                        onclick={prevStep}>
                        ย้อนกลับ
                    </button>
                    <button 
                        type="submit"
                        class="w-full max-w-xl text-xl h-14 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors duration-300 cursor-pointer shadow-sm" 
                        disabled={isLoadingOcr}>
                        บันทึก
                    </button>
                </div>
            </form>
        </section>
    {/if}
</main>