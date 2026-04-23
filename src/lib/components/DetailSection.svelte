<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        label: string;
        value?: string;
        children?: Snippet;
    }

    let { label, value, children }: Props = $props();
</script>

<section class="mb-8 text-black">
    
    <h3 class="mb-3 text-lg md:text-xl lg:text-2xl font-semibold">
        {label}
    </h3>
    
    <div class="leading-relaxed border-t border-gray-500 pt-4">
        {#if children}
            {@render children()}
        {:else if value}
            <p class="whitespace-pre-wrap text-sm md:text-base lg:text-base">{value}</p>
        {/if}
    </div>
    
</section>