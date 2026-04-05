<script lang="ts">
    import { fly } from 'svelte/transition';
    import { FileText, Users, FileEdit, Tags, Plus, Trash2, X } from 'lucide-svelte';

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

    let { data = $bindable(), lang = 'th' } = $props();

    const labels = $derived({
        title: lang === 'th' ? 'ชื่อโครงงาน' : 'Project Title',
        faculty: lang === 'th' ? 'คณะ' : 'Faculty',
        department: lang === 'th' ? 'สาขา' : 'Department',
        degree: lang === 'th' ? 'ปริญญา' : 'Degree',
        academicYear: lang === 'th' ? 'ปีการศึกษา' : 'Academic Year',
        authors: lang === 'th' ? 'ผู้จัดทำ' : 'Author(s)',
        advisors: lang === 'th' ? 'อาจารย์ที่ปรึกษา' : 'Advisor(s)',
        abstract: lang === 'th' ? 'บทคัดย่อ' : 'Abstract',
        keywords: lang === 'th' ? 'คำสำคัญ' : 'Keywords',
        projectData: lang === 'th' ? 'ข้อมูลโปรเจกต์' : 'Project Data',
        abstractTitle: lang === 'th' ? 'บทคัดย่อ' : 'Abstract'
    });

    const addAuthorAdvisor = (list: 'authors' | 'advisors') => {
        data[list] = [...data[list], { name: '' }];
    };

    const removeAuthorAdvisor = (list: 'authors' | 'advisors', index: number) => {
        data[list] = data[list].filter((_: AuthorAdvisor, i: number) => i !== index);
    };

    let newKeyword = $state('');
    const addKeyword = () => {
        if (newKeyword.trim()) {
            data.keywords = [...data.keywords, newKeyword.trim()];
            newKeyword = '';
        }
    };
    
    const removeKeyword = (index: number) => {
        data.keywords = data.keywords.filter((_: string, i: number) => i !== index);
    };
</script>

<div class="flex flex-col gap-6">
    
    <fieldset class="flex flex-col gap-4 border border-orange-500 rounded-lg p-4 md:p-6 bg-white">
        <legend class="text-base md:text-lg font-bold text-black flex items-center gap-2 px-2">
            <FileText class="w-5 h-5 text-orange-600" />
            {labels.projectData}
        </legend>
        
        <label class="form-control w-full">
            <div class="label"><span class="label-text font-semibold">{labels.title}</span></div>
            <textarea bind:value={data.title} class="textarea textarea-bordered focus:border-orange-500 border-orange-500 focus:outline-orange-600 textarea-lg w-full h-48 bg-white text-sm md:text-base leading-relaxed" placeholder="{labels.title}..."></textarea>
        </label>

        <label class="form-control w-full">
            <div class="label"><span class="label-text font-semibold">{labels.faculty}</span></div>
            <input type="text" bind:value={data.faculty} class="input input-bordered focus:border-orange-500 border-orange-500 focus:outline-orange-600 w-full bg-white text-sm md:text-base" />
        </label>

        <label class="form-control w-full">
            <div class="label"><span class="label-text font-semibold">{labels.department}</span></div>
            <input type="text" bind:value={data.department} class="input input-bordered focus:border-orange-500 border-orange-500 focus:outline-orange-600 w-full bg-white text-sm md:text-base" />
        </label>
        
        <label class="form-control w-full">
            <div class="label"><span class="label-text font-semibold">{labels.degree}</span></div>
            <input type="text" bind:value={data.degree} class="input input-bordered focus:border-orange-500 border-orange-500 focus:outline-orange-600 w-full bg-white text-sm md:text-base" />
        </label>

        <label class="form-control w-full">
            <div class="label"><span class="label-text font-semibold">{labels.academicYear}</span></div>
            <input type="text" bind:value={data.academicYear} class="input input-bordered focus:border-orange-500 border-orange-500 focus:outline-orange-600 w-full bg-white text-sm md:text-base" />
        </label>
    </fieldset>

    <fieldset class="flex flex-col gap-6 border border-orange-500 rounded-lg p-4 md:p-6 bg-white">
        <legend class="text-base md:text-lg font-bold text-black flex items-center gap-2 px-2">
            <Users class="w-5 h-5 text-orange-600" />
            {labels.authors} / {labels.advisors}
        </legend>
        
        <div class="flex flex-col gap-3">
            <div class="label"><span class="label-text font-semibold">{labels.authors}</span></div>
            {#each data.authors as author, index (index)}
                <div class="flex items-center gap-2 w-full" transition:fly={{ y: -20 }}>
                    <input type="text" bind:value={author.name} class="input input-bordered focus:border-orange-500 border-orange-500 focus:outline-orange-600 w-full grow bg-white text-sm md:text-base" />
                    <button type="button" class="btn btn-outline btn-error h-11 w-11 p-0 rounded-xl shrink-0" onclick={() => removeAuthorAdvisor('authors', index)} disabled={data.authors.length === 1} aria-label="ลบผู้จัดทำ">
                        <Trash2 class="w-5 h-5" />
                    </button>
                </div>
            {/each}
            <button type="button" class="btn btn-outline border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white btn-sm max-w-50 self-start mt-1 rounded-lg" onclick={() => addAuthorAdvisor('authors')}>
                <Plus class="w-4 h-4" /> เพิ่มผู้จัดทำ
            </button>
        </div>
        
        <div class="flex flex-col gap-3">
            <div class="label"><span class="label-text font-semibold">{labels.advisors}</span></div>
            {#each data.advisors as advisor, index (index)}
                <div class="flex items-center gap-2 w-full" transition:fly={{ y: -20 }}>
                    <input type="text" bind:value={advisor.name} class="input input-bordered focus:border-orange-500 border-orange-500 focus:outline-orange-600 w-full grow bg-white text-sm md:text-base" />
                    <button type="button" class="btn btn-outline btn-error h-11 w-11 p-0 rounded-xl shrink-0" onclick={() => removeAuthorAdvisor('advisors', index)} disabled={data.advisors.length === 1} aria-label="ลบอาจารย์ที่ปรึกษา">
                        <Trash2 class="w-5 h-5" />
                    </button>
                </div>
            {/each}
            <button type="button" class="btn btn-outline border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white btn-sm max-w-50 self-start mt-1 rounded-lg" onclick={() => addAuthorAdvisor('advisors')}>
                <Plus class="w-4 h-4" /> เพิ่มอาจารย์ที่ปรึกษา
            </button>
        </div>
    </fieldset>

    <fieldset class="flex flex-col gap-4 border border-orange-500 rounded-lg p-4 md:p-6 bg-white">
        <legend class="text-base md:text-lg font-bold text-black flex items-center gap-2 px-2">
            <FileEdit class="w-5 h-5 text-orange-600" />
            {labels.abstractTitle}
        </legend>
        
        <label class="form-control w-full">
            <textarea bind:value={data.abstract} class="textarea textarea-bordered focus:border-orange-500 border-orange-500 focus:outline-orange-600 textarea-lg w-full h-48 bg-white text-sm md:text-base leading-relaxed" placeholder="{labels.abstract}..."></textarea>
        </label>
    </fieldset>

    <fieldset class="flex flex-col gap-4 border border-orange-500 rounded-lg p-4 md:p-6 bg-white w-full min-w-0">
        <legend class="text-base md:text-lg font-bold text-black flex items-center gap-2 px-2">
            <Tags class="w-5 h-5 text-orange-600" />
            {labels.keywords}
        </legend>
        
        <div class="flex flex-wrap gap-2 p-3 border border-orange-300 rounded-lg bg-orange-50/50 shadow-inner min-h-15 w-full min-w-0">
            {#each data.keywords as keyword, index (index)}
                
                <div class="flex w-fit max-w-full items-start gap-1 bg-orange-500 text-white pl-3 p-2 rounded-md shadow-sm" transition:fly={{ y: -20, delay: index * 50 }}>
                    
                    <span 
                        class="text-xs md:text-sm font-medium text-left leading-snug min-w-0" 
                        style="overflow-wrap: anywhere; word-break: break-word;">
                        {keyword}
                    </span>
                    
                    <button 
                        type="button" 
                        class="shrink-0 mt-0.5 flex items-center justify-center p-0.5 cursor-pointer opacity-70 hover:opacity-100 hover:text-white transition-opacity bg-transparent border-none text-white" 
                        onclick={() => removeKeyword(index)} 
                        aria-label="ลบคำสำคัญ">
                        <X class="w-3.5 h-3.5" />
                    </button>
                    
                </div>
                
            {/each}
        </div>

        <div class="flex flex-col sm:flex-row items-center gap-2 mt-2 w-full">
            <input 
                type="text" bind:value={newKeyword} 
                class="input input-bordered focus:border-orange-500 border-orange-500 focus:outline-orange-600 w-full grow bg-white text-sm min-w-0" 
                placeholder="พิมพ์คำสำคัญแล้วกด Enter..." 
                onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}>
            <button 
                type="button" 
                class="btn border-none bg-orange-500 text-white hover:bg-orange-600 w-full sm:w-auto rounded-lg shrink-0" 
                onclick={addKeyword}>
                <Plus class="w-5 h-5" /> เพิ่มคำสำคัญ
            </button>
        </div>
    </fieldset>
</div>