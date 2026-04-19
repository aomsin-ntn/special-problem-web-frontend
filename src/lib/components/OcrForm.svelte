<script lang="ts">
    import type { ProjectData, SpellErrorMap } from '$lib/types';
    import ProjectInfoFieldset     from './ProjectInfoFieldset.svelte';
    import AuthorsAdvisorsFieldset from './AuthorsAdvisorsFieldset.svelte';
    import AbstractFieldset        from './AbstractFieldset.svelte';

    interface Props {
        data: ProjectData;
        lang: 'th' | 'en';
        spellErrors?: SpellErrorMap;
    }

    let { data = $bindable(), lang, spellErrors = {} }: Props = $props();

    const errorsFor = (field: string) => spellErrors[field] ?? [];
    
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
</div>
