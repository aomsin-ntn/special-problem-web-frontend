<script lang="ts">
    import type { ProjectData, SpellErrorMap } from '$lib/types';
    import ProjectInfoFieldset     from './ProjectInfoFieldset.svelte';
    import AuthorsAdvisorsFieldset from './AuthorsAdvisorsFieldset.svelte';
    import AbstractFieldset        from './AbstractFieldset.svelte';
    import KeywordsFieldset        from './KeywordsFieldset.svelte';

    interface Props {
        data: ProjectData;
        lang: 'th' | 'en';
        /**
         * The spell_errors map from the OCR API response, e.g.:
         *   { abstract_th: [...], title_th: [...] }
         * Pass the whole map – each fieldset extracts only what it needs.
         */
        spellErrors?: SpellErrorMap;
    }

    let { data = $bindable(), lang, spellErrors = {} }: Props = $props();

    /**
     * Helper: pick the spell error array for a given field name.
     * Falls back to an empty array so downstream components always get an array.
     */
    const errorsFor = (field: string) => spellErrors[field] ?? [];

    // ─── Field-name conventions match the backend's spell_errors keys ─────────
    // Thai:    title_th, abstract_th
    // English: title_en, abstract_en
    const titleField    = $derived(lang === 'th' ? 'title_th'    : 'title_en');
    const abstractField = $derived(lang === 'th' ? 'abstract_th' : 'abstract_en');
</script>

<div class="flex flex-col gap-6">
    <ProjectInfoFieldset
        bind:data
        {lang}
        titleSpellErrors={errorsFor(titleField)}
    />
    <AuthorsAdvisorsFieldset bind:data {lang} />
    <AbstractFieldset
        bind:data
        {lang}
        spellErrors={errorsFor(abstractField)}
    />
    <KeywordsFieldset bind:data {lang} />
</div>
