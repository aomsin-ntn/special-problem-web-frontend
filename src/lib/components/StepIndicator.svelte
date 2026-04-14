<script lang="ts">
    import type { StepItem } from '$lib/types';

    interface Props {
        currentStep: number;
        stepItems: StepItem[];
    }

    let { currentStep, stepItems }: Props = $props();
</script>

<div class="flex justify-center mb-10 overflow-x-auto hide-scrollbar">
    <ul class="steps w-full max-w-3xl justify-center items-center text-xs md:text-sm font-medium">
        {#each stepItems as { name, icon }, index (index)}
            {@const IconComponent = icon}
            <li class="step {currentStep > index ? 'step-primary' : ''}">
                <span class="step-icon flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full transition-all duration-300 shadow-sm my-2 md:my-3
                    {currentStep > index
                        ? 'border-orange-500 bg-orange-500 text-white'
                        : 'border-gray-400 bg-gray-400 text-white'}">
                    <IconComponent class="h-4 w-4 md:h-5 md:w-5" />
                </span>
                <span class="mt-1 md:mt-2 text-[10px] md:text-base px-1">{name}</span>
            </li>
        {/each}
    </ul>
</div>
