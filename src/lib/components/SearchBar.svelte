<script lang="ts">
    import { goto } from '$app/navigation';
    import {page} from '$app/state';

    interface Props {
        value?: string;
        placeholder?: string;
    }

    let {
        value = $bindable(""),
        placeholder = "ค้นหาชื่อปัญหาพิเศษ หรือรหัสนักศึกษาผู้จัดทำ.."
    }: Props = $props();

    $effect(() => {
        const q = page.url.searchParams.get('q');
        if (q !== null) {
            value = q;
        }
    });

    const handleSearch = (event: SubmitEvent) => {
        event.preventDefault();

        const trimmedQuery = value.trim();
        if (trimmedQuery) {
            goto(`search?q=${encodeURIComponent(trimmedQuery)}`);
        } else {
            value = '';
        }
    };

</script>

<form onsubmit={handleSearch} class="relative w-full max-w-2xl flex items-center gap-2 group ">

    <div class="relative flex-1">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400 group-focus-within:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>

        <input type="search"
        bind:value
        {placeholder}
        class="block w-full p-3 pl-10 text-sm text-gray-200 border border-gray-600 rounded-lg bg-gray-600 
                focus:ring-2 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all shadow-sm"
        />
    </div>
</form>
