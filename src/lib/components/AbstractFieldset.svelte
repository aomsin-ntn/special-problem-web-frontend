<script lang="ts">
    import { FileEdit } from 'lucide-svelte';
    import type { ProjectData, SpellError } from '$lib/types';
    import SpellCheckTextarea from '$lib/components/SpellCheckTextarea.svelte';

    interface Props {
        data: ProjectData;
        lang: 'th' | 'en';
        /** Spell errors for this language's abstract field, passed down from the page. */
        spellErrors?: SpellError[];
    }

    let { data = $bindable(), lang, spellErrors = [] }: Props = $props();

    const legend = $derived(lang === 'th' ? 'บทคัดย่อ' : 'Abstract');
</script>

<fieldset class="flex flex-col gap-4 border border-orange-500 rounded-lg p-4 md:p-6 bg-white">
    <legend class="text-base md:text-lg font-bold text-black flex items-center gap-2 px-2">
        <FileEdit class="w-5 h-5 text-orange-600" />
        {legend}
    </legend>

    <label class="form-control w-full">
        <!--
            SpellCheckTextarea is a drop-in replacement for the plain <textarea>.
            • bind:value       – two-way binding works exactly as before
            • spellErrors      – array of { word, suggestions } from the OCR response
            • inputClass       – all your existing DaisyUI / Tailwind classes go here;
                                 the component copies computed styles to the mirror so
                                 font, padding and line-height stay in perfect sync.
        -->
        <SpellCheckTextarea
            bind:value={data.abstract}
            {spellErrors}
            placeholder="{legend}..."
            inputClass="textarea textarea-bordered focus:border-orange-500 border-orange-500 focus:outline-orange-600 textarea-lg w-full min-h-[12rem] bg-white text-sm md:text-base leading-relaxed"
            rows={6}
        />
    </label>
</fieldset>
