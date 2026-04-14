<script lang="ts">
    import { fly } from 'svelte/transition';
    import { Users, Plus, Trash2 } from 'lucide-svelte';
    import type { AuthorAdvisor, ProjectData } from '$lib/types';

    interface Props {
        data: ProjectData;
        lang: 'th' | 'en';
    }

    let { data = $bindable(), lang }: Props = $props();

    const labels = $derived({
        legend:   lang === 'th' ? 'ผู้จัดทำ / อาจารย์ที่ปรึกษา' : 'Authors / Advisors',
        authors:  lang === 'th' ? 'ผู้จัดทำ'                      : 'Author(s)',
        advisors: lang === 'th' ? 'อาจารย์ที่ปรึกษา'               : 'Advisor(s)',
        studentId:lang === 'th' ? 'รหัสนักศึกษา'                   : 'Student ID',
        addAuthor:  lang === 'th' ? 'เพิ่มผู้จัดทำ'                : 'Add Author',
        addAdvisor: lang === 'th' ? 'เพิ่มอาจารย์ที่ปรึกษา'        : 'Add Advisor',
    });

    const addItem = (list: 'authors' | 'advisors') => {
        data[list] = [...data[list], { name: '', studentId: '' }];
    };

    const removeItem = (list: 'authors' | 'advisors', index: number) => {
        data[list] = data[list].filter((_: AuthorAdvisor, i: number) => i !== index);
    };
</script>

<fieldset class="flex flex-col gap-6 border border-orange-500 rounded-lg p-4 md:p-6 bg-white">
    <legend class="text-base md:text-lg font-bold text-black flex items-center gap-2 px-2">
        <Users class="w-5 h-5 text-orange-600" />
        {labels.legend}
    </legend>

    <!-- Authors -->
    <div class="flex flex-col gap-3">
        <div class="label"><span class="label-text font-semibold">{labels.authors}</span></div>
        {#each data.authors as author, index (index)}
            <div class="flex flex-col sm:flex-row items-center gap-2 w-full" transition:fly={{ y: -20 }}>
                <input
                    type="text"
                    bind:value={author.name}
                    class="input input-bordered focus:border-orange-500 border-orange-500 focus:outline-orange-600 w-full grow bg-white text-sm md:text-base"
                />
                <input
                    type="text"
                    bind:value={author.studentId}
                    placeholder={labels.studentId}
                    class="input input-bordered border-orange-500 focus:border-orange-500 focus:outline-orange-600 w-full sm:w-1/3 bg-white text-sm md:text-base"
                />
                <button
                    type="button"
                    class="btn btn-outline btn-error h-11 w-11 p-0 rounded-xl shrink-0"
                    onclick={() => removeItem('authors', index)}
                    disabled={data.authors.length === 1}
                    aria-label="ลบผู้จัดทำ"
                >
                    <Trash2 class="w-5 h-5" />
                </button>
            </div>
        {/each}
        <button
            type="button"
            class="btn btn-outline border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white btn-sm max-w-50 self-start mt-1 rounded-lg"
            onclick={() => addItem('authors')}
        >
            <Plus class="w-4 h-4" /> {labels.addAuthor}
        </button>
    </div>

    <!-- Advisors -->
    <div class="flex flex-col gap-3">
        <div class="label"><span class="label-text font-semibold">{labels.advisors}</span></div>
        {#each data.advisors as advisor, index (index)}
            <div class="flex items-center gap-2 w-full" transition:fly={{ y: -20 }}>
                <input
                    type="text"
                    bind:value={advisor.name}
                    class="input input-bordered focus:border-orange-500 border-orange-500 focus:outline-orange-600 w-full grow bg-white text-sm md:text-base"
                />
                <button
                    type="button"
                    class="btn btn-outline btn-error h-11 w-11 p-0 rounded-xl shrink-0"
                    onclick={() => removeItem('advisors', index)}
                    disabled={data.advisors.length === 1}
                    aria-label="ลบอาจารย์ที่ปรึกษา"
                >
                    <Trash2 class="w-5 h-5" />
                </button>
            </div>
        {/each}
        <button
            type="button"
            class="btn btn-outline border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white btn-sm max-w-50 self-start mt-1 rounded-lg"
            onclick={() => addItem('advisors')}
        >
            <Plus class="w-4 h-4" /> {labels.addAdvisor}
        </button>
    </div>
</fieldset>
