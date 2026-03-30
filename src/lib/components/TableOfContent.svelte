<script lang="ts">
    interface Item {
        id: string;
        label: string;
    }

    interface Props {
        title?: string;
        items?: Item[];
    }

    let { title = "สารบัญ", items = [] }: Props = $props();
</script>

<aside class="sticky top-8 text-black">
    <h4 class="mb-4 border-b-2 border-black pb-2 text-lg font-bold">
        {title}
    </h4>
    
    <nav class="flex flex-col gap-2">
        {#each items as item}
            <a 
                href="#{item.id}" 
                class="text-sm no-underline transition-colors hover:text-[#ff9800] hover:bg-gray-50"
            >
                {item.label}
            </a>
        {/each}
    </nav>
</aside>