<script lang="ts">
    interface Props {
        label?: string;
        destination?: string;
    }

    let { label = "คณะ", destination = "/faculty" }: Props = $props();
</script>

<a 
    href={destination} 
    class="block w-full py-4 border-t border-white/40 text-white tracking-wide transition-all duration-300 ease-in-out hover:bg-white hover:text-orange-700 active:scale-95 px-4 rounded-lg group no-underline"
>
    <p class="text-sm md:text-base lg:text-lg font-medium text-center md:text-left group-hover:font-semibold"> 
        {label}
    </p>
</a>