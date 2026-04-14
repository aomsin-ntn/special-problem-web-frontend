<script lang="ts">
    import { Upload, Loader2 } from 'lucide-svelte';

    interface FileDetails {
        name: string;
        pages: number;
    }

    interface Props {
        fileDetails: FileDetails;
        isGeneratingThumbnails: boolean;
        isNextDisabled: boolean;
        onFileSelected: (file: File) => void;
        onNext: () => void;
    }

    let { fileDetails, isGeneratingThumbnails, isNextDisabled, onFileSelected, onNext }: Props = $props();

    let isDragging = $state(false);

    const validateAndEmit = (file: File | undefined) => {
        if (file?.type === 'application/pdf') {
            onFileSelected(file);
        } else {
            alert('กรุณาอัปโหลดไฟล์ PDF เท่านั้น');
        }
    };

    const handleFileDrop = (event: DragEvent) => {
        event.preventDefault();
        isDragging = false;
        validateAndEmit(event.dataTransfer?.files[0]);
    };

    const handleFileSelect = (event: Event) => {
        validateAndEmit((event.target as HTMLInputElement).files?.[0]);
    };

    const triggerFileInput = () => {
        document.getElementById('pdfFileInput')?.click();
    };
</script>

<section class="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
    <div class="bg-white border border-gray-500 shadow-lg rounded-2xl p-6 md:p-10">
        <h2 class="text-lg md:text-xl font-bold text-black text-center mb-8">
            ขั้นตอนที่ 1 : อัปโหลดไฟล์ PDF
        </h2>

        <div class="rounded-xl overflow-hidden">
            <div
                class="drop-zone h-64 md:h-72 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer gap-3 transition-all duration-300
                    {isDragging
                        ? 'bg-orange-100 border-orange-500 scale-[1.02]'
                        : 'bg-gray-50 hover:bg-orange-50 border-gray-300 hover:border-orange-400'}"
                role="button"
                tabindex="0"
                ondragover={(e) => { e.preventDefault(); isDragging = true; }}
                ondragleave={() => (isDragging = false)}
                ondrop={handleFileDrop}
                onclick={triggerFileInput}
                onkeydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        triggerFileInput();
                    }
                }}
            >
                <Upload
                    class="h-16 w-16 md:h-20 md:w-20 text-orange-500 opacity-60 mb-2 transition-transform
                        {isDragging ? 'scale-110' : ''}"
                />
                <p class="font-bold text-gray-700 text-base md:text-lg">คลิกที่นี่เพื่ออัปโหลด</p>
                <p class="text-sm text-gray-400">หรือลากไฟล์ PDF มาวางที่นี่</p>
                <input
                    type="file"
                    id="pdfFileInput"
                    accept="application/pdf"
                    class="hidden"
                    onchange={handleFileSelect}
                />
            </div>
        </div>

        {#if fileDetails.name}
            <div class="mt-8 bg-orange-50 border border-orange-200 rounded-xl p-6 flex flex-col gap-2 items-center text-center shadow-inner">
                <p class="text-base md:text-lg text-orange-800 font-bold">อัปโหลดไฟล์เรียบร้อย</p>
                <p class="text-gray-700 text-sm md:text-base break-all">
                    ไฟล์: <span class="text-orange-600 font-semibold">{fileDetails.name}</span>
                </p>
                <p class="text-gray-700 text-sm md:text-base">
                    จำนวน: <span class="text-orange-600 font-semibold">{fileDetails.pages}</span> หน้า
                </p>
            </div>
        {/if}
    </div>

    <div class="flex justify-center mt-8">
        <button
            class="w-full md:w-2/3 lg:w-1/2 text-lg md:text-xl h-14 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            onclick={onNext}
            disabled={isNextDisabled}
        >
            {#if isGeneratingThumbnails}
                <Loader2 class="h-5 w-5 animate-spin" />
                <span>กำลังสร้างภาพตัวอย่าง...</span>
            {:else}
                ถัดไป
            {/if}
        </button>
    </div>
</section>
