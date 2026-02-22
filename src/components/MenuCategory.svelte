<script lang="ts">
    export let label: string = "คณะ";
    export let destination: string = "/faculty";

    const handleClick = (event: MouseEvent): void => {
        console.log(`Navigating to ${destination}`);
    };

</script>

<div class="w-100 hover:bg-orange-500 py-5 border-t
            inline-block text-white tracking-wide 
            cursor-pointer transition-all duration-300 ease-in-out
            active:scale-95">
            
    <a 
        href={destination}
        on:click={handleClick}
        class="">
        <p> {label} </p>
    </a>
</div>