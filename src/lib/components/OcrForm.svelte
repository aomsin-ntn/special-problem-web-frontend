<script lang="ts">
    import type { ProjectData, AuthorAdvisor } from '$lib/stores/types';
    import { fly } from 'svelte/transition';

    let { data, lang = 'th' } = $props();

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

<div class="flex flex-col gap-6 font-sans">
    <fieldset class="flex flex-col gap-4 border border-orange-500 rounded-lg p-6 bg-white">
        <legend class="text-md font-bold text-black flex items-center gap-2 px-2"><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>{labels.projectData}</legend>
        
        <label class="form-control w-full">
            <div class="label"><span class="label-text font-semibold">{labels.title}</span></div>
            <input type="text" bind:value={data.title} class="input input-bordered input-primary w-full bg-white" />
        </label>
        
        <div class="grid grid-cols-2 gap-4">
            <label class="form-control w-full">
                <div class="label"><span class="label-text font-semibold">{labels.faculty}</span></div>
                <input type="text" bind:value={data.faculty} class="input input-bordered input-primary w-full bg-white" />
            </label>
            <label class="form-control w-full">
                <div class="label"><span class="label-text font-semibold">{labels.department}</span></div>
                <input type="text" bind:value={data.department} class="input input-bordered input-primary w-full bg-white" />
            </label>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
            <label class="form-control w-full">
                <div class="label"><span class="label-text font-semibold">{labels.degree}</span></div>
                <input type="text" bind:value={data.degree} class="input input-bordered input-primary w-full bg-white" />
            </label>
            <label class="form-control w-full">
                <div class="label"><span class="label-text font-semibold">{labels.academicYear}</span></div>
                <input type="text" bind:value={data.academicYear} class="input input-bordered input-primary w-full bg-white" />
            </label>
        </div>
    </fieldset>

    <fieldset class="flex flex-col gap-4 border border-orange-500 rounded-lg p-6 bg-white">
        <legend class="text-md font-bold text-black flex items-center gap-2 px-2"><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>{labels.authors}/{labels.advisors}</legend>
        
        <div class="author-advisor-list flex flex-col gap-3">
            <div class="label"><span class="label-text font-semibold">{labels.authors}</span></div>
            {#each data.authors as author, index (index)}
                <div class="input-add-remove flex items-center gap-2" transition:fly={{ y: -20 }}>
                    <input type="text" bind:value={author.name} class="input input-bordered input-primary grow bg-white" />
                    <button class="btn btn-outline btn-error h-12 w-12 p-0 rounded-full" onclick={() => removeAuthorAdvisor('authors', index)} disabled={data.authors.length === 1} aria-label="ลบผู้จัดทำ"><svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"></path></svg></button>
                </div>
            {/each}
            <button class="btn btn-outline btn-primary btn-sm max-w-xs self-start" onclick={() => addAuthorAdvisor('authors')}><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg> เพิ่มผู้จัดทำ</button>
        </div>
        
        <div class="author-advisor-list flex flex-col gap-3">
            <div class="label"><span class="label-text font-semibold">{labels.advisors}</span></div>
            {#each data.advisors as advisor, index (index)}
                <div class="input-add-remove flex items-center gap-2" transition:fly={{ y: -20 }}>
                    <input type="text" bind:value={advisor.name} class="input input-bordered input-primary grow bg-white" />
                    <button class="btn btn-outline btn-error h-12 w-12 p-0 rounded-full" onclick={() => removeAuthorAdvisor('advisors', index)} disabled={data.advisors.length === 1} aria-label="ลบอาจารย์ที่ปรึกษา"><svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"></path></svg></button>
                </div>
            {/each}
            <button class="btn btn-outline btn-primary btn-sm max-w-xs self-start" onclick={() => addAuthorAdvisor('advisors')}><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg> เพิ่มอาจารย์ที่ปรึกษา</button>
        </div>
    </fieldset>

    <fieldset class="flex flex-col gap-4 border border-orange-500 rounded-lg p-6 bg-white">
        <legend class="text-md font-bold text-black flex items-center gap-2 px-2"><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>{labels.abstractTitle}</legend>
        
        <label class="form-control w-full">
            <textarea bind:value={data.abstract} class="textarea textarea-bordered textarea-primary textarea-lg w-full h-48 bg-white" placeholder="{labels.abstract}..."></textarea>
        </label>
    </fieldset>
    
    <fieldset class="flex flex-col gap-4 border border-orange-500 rounded-lg p-6 bg-white">
        <legend class="text-md font-bold text-black flex items-center gap-2 px-2"><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h12c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm0 16H5V5h12v14zm-4-4H9v-2h4v2zm0-4H9V9h4v2z"></path></svg>{labels.keywords}</legend>
        
        <div class="flex flex-wrap gap-2 p-2 border border-orange-500 rounded bg-white shadow-inner">
            {#each data.keywords as keyword, index (index)}
                <div class="badge badge-primary badge-lg gap-1 rounded-full p-3 pr-1" transition:fly={{ y: -20, delay: index * 50 }}>
                    <span class="text-sm font-semibold">{keyword}</span>
                    <button class="btn btn-ghost btn-xs h-6 w-6 p-0 min-h-0 text-primary-content opacity-70 hover:opacity-100" onclick={() => removeKeyword(index)} aria-label="ลบคำสำคัญ"><svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg></button>
                </div>
            {/each}
        </div>
        <div class="flex items-center gap-2 mt-2">
            <input type="text" bind:value={newKeyword} class="input input-bordered input-primary grow input-sm bg-white" placeholder="เพิ่มคำสำคัญ..." onkeydown={(e) => e.key === 'Enter' && addKeyword()}>
            <button class="btn btn-outline btn-primary btn-sm" onclick={addKeyword}><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg> เพิ่ม</button>
        </div>
    </fieldset>

</div>

<style>
    legend {
        border-radius: theme('borderRadius.lg');
    }
</style>