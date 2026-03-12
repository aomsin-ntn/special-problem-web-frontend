<script lang="ts">
    import { goto } from '$app/navigation';

    function handleClick(): void {
        goto('/demo');
    }
</script>

<button
    onclick={handleClick}
    class="rounded-md bg-blue-600 px-5 py-2 text-base font-medium text-white transition-colors duration-300 hover:bg-blue-700 active:scale-95"
>
    link
</button>
