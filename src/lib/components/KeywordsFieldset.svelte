<script lang="ts">
    import { fly } from 'svelte/transition';
    import { Tags, Plus, X } from 'lucide-svelte';
    import type { ProjectData } from '$lib/types';

    interface Props {
        data: ProjectData;
        lang: 'th' | 'en';
    }

    let { data = $bindable(), lang }: Props = $props();

    const labels = $derived({
        legend:      lang === 'th' ? 'คำสำคัญ'                      : 'Keywords',
        placeholder: lang === 'th' ? 'พิมพ์คำสำคัญแล้วกด Enter...' : 'Type a keyword and press Enter...',
        addBtn:      lang === 'th' ? 'เพิ่มคำสำคัญ'                  : 'Add Keyword',
    });

    let newKeyword = $state('');

    const addKeyword = () => {
        const trimmed = newKeyword.trim();
        if (trimmed) {
            data.keywords = [...data.keywords, trimmed];
            newKeyword = '';
        }
    };

    const removeKeyword = (index: number) => {
        data.keywords = data.keywords.filter((_: string, i: number) => i !== index);
    };
</script>

<fieldset class="flex flex-col gap-4 border border-orange-500 rounded-lg p-4 md:p-6 bg-white w-full min-w-0">
    <legend class="text-base md:text-lg font-bold text-black flex items-center gap-2 px-2">
        <Tags class="w-5 h-5 text-orange-600" />
        {labels.legend}
    </legend>

    <!-- Keyword chips -->
    <div class="flex flex-wrap gap-2 p-3 border border-orange-300 rounded-lg bg-orange-50/50 shadow-inner min-h-15 w-full min-w-0">
        {#each data.keywords as keyword, index (index)}
            <div
                class="flex w-fit max-w-full items-start gap-1 bg-orange-500 text-white pl-3 p-2 rounded-md shadow-sm"
                transition:fly={{ y: -20, delay: index * 50 }}
            >
                <span
                    class="text-xs md:text-sm font-medium text-left leading-snug min-w-0"
                    style="overflow-wrap: anywhere; word-break: break-word;"
                >
                    {keyword}
                </span>
                <button
                    type="button"
                    class="shrink-0 mt-0.5 flex items-center justify-center p-0.5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity bg-transparent border-none text-white"
                    onclick={() => removeKeyword(index)}
                    aria-label="ลบคำสำคัญ"
                >
                    <X class="w-3.5 h-3.5" />
                </button>
            </div>
        {/each}
    </div>

    <!-- Add keyword input -->
    <div class="flex flex-col sm:flex-row items-center gap-2 mt-2 w-full">
        <input
            type="text"
            bind:value={newKeyword}
            class="input input-bordered focus:border-orange-500 border-orange-500 focus:outline-orange-600 w-full grow bg-white text-sm min-w-0"
            placeholder={labels.placeholder}
            onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
        />
        <button
            type="button"
            class="btn border-none bg-orange-500 text-white hover:bg-orange-600 w-full sm:w-auto rounded-lg shrink-0"
            onclick={addKeyword}
        >
            <Plus class="w-5 h-5" /> {labels.addBtn}
        </button>
    </div>
</fieldset>
