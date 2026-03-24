<script lang="ts">
    interface Props {
        label?: string;
        destination?: string;
    }

    let { label = "คณะ", destination = "/faculty" }: Props = $props();
</script>

<div class="w-100 hover:bg-orange-500 py-5 border-t
            inline-block text-white tracking-wide 
            cursor-pointer transition-all duration-300 ease-in-out
            active:scale-95">
            
    <a href={destination} class="">
        <p class="text-sm md:text-base lg:text-base font-medium"> 
            {label}
        </p>
    </a>
</div>