<script lang="ts">
    import type { ComponentType } from 'svelte';
    import { Facebook, Mail } from 'lucide-svelte';

    interface ContactInfo {
        label: string;
        value: string;
        icon: ComponentType;
        link?: string;
    }

    const universityNameTh: string = "สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง";
    const universityNameEn: string = "King Mongkut's Institute of Technology Ladkrabang";

    const contactDetails: ContactInfo[] = [
        { 
        label: "Facebook", 
        value: "KMITL", 
        icon: Facebook, 
        link: "https://www.facebook.com/kmitlofficial" 
        },
        { 
        label: "Email", 
        value: "saraban@kmitl.ac.th", 
        icon: Mail, 
        link: "mailto:saraban@kmitl.ac.th" 
        }
    ];

    const address: string = "1 Chalong Krung 1 Alley, Lat Krabang, Bangkok 10520, Thailand";
</script>

<footer class="bg-gray-300 text-white py-8 px-6 md:px-12 lg:px-20">
    <div class="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-12 text-center md:text-left">
        
        <div class="flex flex-col gap-2 max-w-md">
            <p class="text-sm md:text-base font-medium">{universityNameTh}</p>
            <p class="text-sm md:text-base font-light">{universityNameEn}</p>
        </div>

        <div class="flex flex-col gap-3 max-w-sm items-center md:items-start">
            <p class="text-base md:text-lg font-semibold mb-1">Contact us</p>
            {#each contactDetails as contact (contact.label)}
                {@const Icon = contact.icon}
                <div class="flex items-center gap-3">
                    <Icon size={20} strokeWidth={2} class="shrink-0" />
                    <a 
                        href={contact.link} 
                        class="hover:underline hover:text-orange-600 transition-all text-sm font-light">
                        {contact.value}
                    </a>
                </div>
            {/each}
            <p class="text-sm font-light leading-relaxed">
                {address}
            </p>
        </div>
    </div>
</footer>