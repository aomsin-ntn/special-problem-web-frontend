<script lang="ts">
    import { FileText } from 'lucide-svelte';
    import type { ProjectData, SpellError } from '$lib/types';
    import SpellCheckTextarea from '$lib/components/SpellCheckTextarea.svelte';

    interface Props {
        data: ProjectData;
        lang: 'th' | 'en';
        /** Optional spell errors for the project title field. */
        titleSpellErrors?: SpellError[];
    }

    let { data = $bindable(), lang, titleSpellErrors = [] }: Props = $props();

    const labels = $derived({
        legend:       lang === 'th' ? 'ข้อมูลโปรเจกต์'  : 'Project Data',
        title:        lang === 'th' ? 'ชื่อโครงงาน'      : 'Project Title',
        faculty:      lang === 'th' ? 'คณะ'              : 'Faculty',
        department:   lang === 'th' ? 'สาขา'             : 'Department',
        degree:       lang === 'th' ? 'ปริญญา'            : 'Degree',
        academicYear: lang === 'th' ? 'ปีการศึกษา'        : 'Academic Year',
    });
</script>

<fieldset class="flex flex-col gap-4 border border-orange-500 rounded-lg p-4 md:p-6 bg-white">
    <legend class="text-base md:text-lg font-bold text-black flex items-center gap-2 px-2">
        <FileText class="w-5 h-5 text-orange-600" />
        {labels.legend}
    </legend>

    <!-- Title – spell-check enabled -->
    <label class="form-control w-full">
        <div class="label"><span class="label-text font-semibold">{labels.title}</span></div>
        <SpellCheckTextarea
            bind:value={data.title}
            spellErrors={titleSpellErrors}
            placeholder="{labels.title}..."
            inputClass="textarea textarea-bordered focus:border-orange-500 border-orange-500 focus:outline-orange-600 textarea-lg w-full min-h-[12rem] bg-white text-sm md:text-base leading-relaxed"
            rows={6}
        />
    </label>

    <!-- The remaining plain inputs are unchanged ─────────────────────────── -->
    <label class="form-control w-full">
        <div class="label"><span class="label-text font-semibold">{labels.faculty}</span></div>
        <input
            type="text"
            bind:value={data.faculty}
            class="input input-bordered focus:border-orange-500 border-orange-500 focus:outline-orange-600 w-full bg-white text-sm md:text-base"
        />
    </label>

    <label class="form-control w-full">
        <div class="label"><span class="label-text font-semibold">{labels.department}</span></div>
        <input
            type="text"
            bind:value={data.department}
            class="input input-bordered focus:border-orange-500 border-orange-500 focus:outline-orange-600 w-full bg-white text-sm md:text-base"
        />
    </label>

    <label class="form-control w-full">
        <div class="label"><span class="label-text font-semibold">{labels.degree}</span></div>
        <input
            type="text"
            bind:value={data.degree}
            class="input input-bordered focus:border-orange-500 border-orange-500 focus:outline-orange-600 w-full bg-white text-sm md:text-base"
        />
    </label>

    <label class="form-control w-full">
        <div class="label"><span class="label-text font-semibold">{labels.academicYear}</span></div>
        <input
            type="text"
            bind:value={data.academicYear}
            class="input input-bordered focus:border-orange-500 border-orange-500 focus:outline-orange-600 w-full bg-white text-sm md:text-base"
        />
    </label>
</fieldset>
