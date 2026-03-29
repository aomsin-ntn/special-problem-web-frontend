<script lang="ts">
    import type { ProjectData } from '$lib/stores/types';
    import OcrForm from '$lib/components/OcrForm.svelte';
    import { Upload, FileCheckCorner, SquarePen } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    let currentStep = $state(1);
    const stepItems = [
        { name: 'อัปโหลดไฟล์', icon : Upload },
        { name: 'เลือกหน้า', icon: FileCheckCorner },
        { name: 'ตรวจสอบและแก้ไข', icon: SquarePen }
    ];

    //อัปโหลดไฟล์
    let uploadedFile = $state<File | null>(null);
    let fileDetails = $state({ name: '', pages: 0 });

    const handleFileDrop = (event: DragEvent) => {
        event.preventDefault();
        const file = event.dataTransfer?.files[0];
        if (file && file.type === 'application/pdf') {
            uploadedFile = file;
            simulateFileUpload(file);
        } else {
            alert('กรุณาอัปโหลดไฟล์ PDF เท่านั้น');
        }
    };

    const handleFileSelect = (event: Event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file && file.type === 'application/pdf') {
            uploadedFile = file;
            simulateFileUpload(file);
        } else {
            alert('กรุณาอัปโหลดไฟล์ PDF เท่านั้น');
        }
    };

    const simulateFileUpload = (file: File) => {
        setTimeout(() => {
            fileDetails = { name: file.name, pages: Math.floor(Math.random() * 50) + 1 };
        }, 500);
    };

    let selectedPages = $state<number[]>([]);
    const totalPages = $derived(fileDetails.pages);
    let currentPaginationPage = $state(0);
    let windowWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);
    
    const itemsPerPage = $derived(windowWidth < 768 ? 4 : 8);

    const pageThumbnails = $derived(Array.from({ length: totalPages }, (_, i) => ({ id: i + 1, src: '/path/to/placeholder.jpg' })));
    
    const paginatedThumbnails = $derived(pageThumbnails.slice(
        currentPaginationPage * itemsPerPage,
        (currentPaginationPage + 1) * itemsPerPage
    ));
    
    const totalPaginationPages = $derived(Math.ceil(totalPages / itemsPerPage));

    const goToPreviousPage = () => {
        if (currentPaginationPage > 0) currentPaginationPage--;
    };

    const goToNextPage = () => {
        if (currentPaginationPage < totalPaginationPages - 1) currentPaginationPage++;
    };

    const paginationIndices = $derived(Array.from({ length: totalPaginationPages }, (_, i) => i));

    onMount(() => {
        const handleResize = () => {
            const newWidth = window.innerWidth;
            const oldItemsPerPage = windowWidth < 768 ? 4 : 8;
            const newItemsPerPage = newWidth < 768 ? 4 : 8;
            
            windowWidth = newWidth;
            
            // Reset pagination ถ้า itemsPerPage เปลี่ยน
            if (oldItemsPerPage !== newItemsPerPage) {
                currentPaginationPage = 0;
            }
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    });

    const togglePageSelection = (pageNumber: number) => {
        if (selectedPages.includes(pageNumber)) {
            selectedPages = selectedPages.filter(p => p !== pageNumber);
        } else if (selectedPages.length < 2) {
            selectedPages = [...selectedPages, pageNumber];
        } else {
            alert('คุณสามารถเลือกได้สูงสุด 2 หน้า');
        }
    };

    let isLoadingOcr = $state(false);
    let ocrDataThai = $state<ProjectData>({
        title: '', faculty: '', department: '', degree: '', academicYear: '', authors: [], advisors: [], abstract: '', keywords: []
    });
    let ocrDataEnglish = $state<ProjectData>({
        title: '', faculty: '', department: '', degree: '', academicYear: '', authors: [], advisors: [], abstract: '', keywords: []
    });

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

    const nextStep = () => {
        if (currentStep < 3) {
            currentStep++;
            currentPaginationPage = 0; 
        }
        if (currentStep === 3) simulateOcrProcess();
    };
    const prevStep = () => {
        if (currentStep > 1) currentStep--;
    };

    const handleSubmit = async (event: SubmitEvent) => {
        event.preventDefault();
        
        try {
            const payload = {
                selectedPages: selectedPages
            };

            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const projectData = {
                    fileName: fileDetails.name,
                    selectedPages: selectedPages,
                    thai: ocrDataThai,
                    english: ocrDataEnglish,
                    uploadedAt: new Date().toISOString()
                };
                
                localStorage.setItem('lastUploadedProject', JSON.stringify(projectData));
                
                alert('บันทึกข้อมูลสำเร็จ');
                
                currentStep = 1;
                currentPaginationPage = 0;
                uploadedFile = null;
                fileDetails = { name: '', pages: 0 };
                selectedPages = [];
                ocrDataThai = {
                    title: '', faculty: '', department: '', degree: '', academicYear: '', authors: [], advisors: [], abstract: '', keywords: []
                };
                ocrDataEnglish = {
                    title: '', faculty: '', department: '', degree: '', academicYear: '', authors: [], advisors: [], abstract: '', keywords: []
                };
    
                await goto('/Profile');
            } else {
                alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
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
                    class="w-full text-xl h-14 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors duration-300 cursor-pointer disabled:cursor-not-allowed disabled:hidden disabled:bg-gray-400 shadow-sm" 
                    onclick={nextStep} 
                    disabled={!uploadedFile}>
                    ถัดไป
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
                            <img src="/path/to/thai-abstract-placeholder.jpg" alt="Thai Abstract Placeholder" class="aspect-3/4 w-full max-w-xs border-2 border-orange-300 rounded bg-gray-100 shadow-md">
                        </div>
                        <div class="preview-item flex flex-col items-center gap-2">
                            <p class="text-sm font-semibold">หน้าบทคัดย่อภาษาอังกฤษ</p>
                            <img src="/path/to/english-abstract-placeholder.jpg" alt="English Abstract Placeholder" class="aspect-3/4 w-full max-w-xs border-2 border-orange-300 rounded bg-gray-100 shadow-md">
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

                <div class="p-6 border-2 border-orange-200 rounded-xl bg-orange-50">
                    <p class="text-center mb-2 font-semibold">เลือกหน้าจากไฟล์โปรเจกต์ของคุณเพื่อประมวลผลข้อมูลโปรเจกต์</p>
                    <p class="text-center mb-6">จำนวน 2 หน้า</p>
                    
                    <div class="flex items-center justify-between gap-4">
                        <button 
                            class="btn btn-sm btn-circle bg-orange-500 hover:bg-orange-600 text-white border-none disabled:bg-gray-300"
                            onclick={goToPreviousPage}
                            disabled={currentPaginationPage === 0}>
                            ❮
                        </button>

                        <div class="grid gap-4 flex-1 sm:grid-cols-2 md:grid-cols-4">
                            {#each paginatedThumbnails as { id }, index (index)}
                                <button 
                                    class="thumbnail-item flex flex-col items-center gap-2 relative border-2 rounded p-2 transition-all duration-300 font-semibold
                                        {selectedPages.includes(id) ? 'border-orange-500 bg-orange-700 shadow-lg scale-105' : 'border-orange-200 bg-white hover:border-orange-400'}"
                                    onclick={() => togglePageSelection(id)}
                                >
                                    <img src="/path/to/placeholder.jpg" alt="Page {id}" class="aspect-3/4 w-full border border-orange-300 rounded bg-gray-100">
                                    <span class="text-gray-700">หน้า {id}</span>
                                    {#if selectedPages.includes(id)}
                                        <div class="absolute inset-0 bg-orange-400 opacity-20 rounded"></div>
                                        <div class="absolute -top-3 -right-3 h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center text-white border-2 border-white font-bold">✓</div>
                                    {/if}
                                </button>
                            {/each}
                        </div>

                        <button 
                            class="btn btn-sm btn-circle bg-orange-500 hover:bg-orange-600 text-white border-none disabled:bg-gray-300"
                            onclick={goToNextPage}
                            disabled={currentPaginationPage === totalPaginationPages - 1}>
                            ❯
                        </button>
                    </div>

                    <div class="flex justify-center gap-2 mt-6">
                        {#each paginationIndices as pageIndex (pageIndex)}
                            <button
                                class="w-2.5 h-2.5 rounded-full transition-all duration-300 {currentPaginationPage === pageIndex ? 'bg-orange-500 w-6' : 'bg-gray-300 hover:bg-gray-400'}"
                                onclick={() => currentPaginationPage = pageIndex}
                                aria-label="ไปยังหน้า {pageIndex + 1}">
                            </button>
                        {/each}
                    </div>
                </div>

                <div class="mt-8 bg-blue-50 border-2 border-blue-300 rounded-lg p-6 text-center font-semibold shadow-inner">
                    <p class="text-lg text-blue-900">หน้าตัวเลือก : <span class="text-blue-700">{selectedPages.length === 0 ? 'ยังไม่ได้เลือกหน้า' : selectedPages.join(', ')}</span></p>
                </div>
            </div>
                <div class="max-w-6xl mx-auto flex justify-between gap-8 mt-10">
                    <button 
                        class="btn btn-outline w-full max-w-xl text-lg h-14 border-2 border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-600 rounded-xl" 
                        onclick={prevStep}>
                        ย้อนกลับ
                    </button>
                    <button 
                        class="w-full max-w-xl text-xl h-14 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors duration-300 cursor-pointer disabled:cursor-not-allowed disabled:hidden disabled:bg-gray-400 shadow-sm" 
                        onclick={nextStep} 
                        disabled={selectedPages.length !== 2}>
                        ถัดไป
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