<script lang="ts">
    async function handleClick(): Promise<void> {
        try {
            const response = await fetch('/api');
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            const data: { message: string } = await response.json();
            console.log('API Response:', data);
            alert(`API Response: ${data.message}`);
        } catch (error) {
            console.error('Error fetching API:', error);
            alert('Error fetching API');
        }
    }
</script>

<button
    onclick={handleClick}
    class="rounded-md bg-blue-600 px-5 py-2 text-base font-medium text-white transition-colors duration-300 hover:bg-blue-700 active:scale-95"
>
    api test
</button>
