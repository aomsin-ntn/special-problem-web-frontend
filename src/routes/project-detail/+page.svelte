<script lang="ts">
    import ProjectHeader from '$lib/components/ProjectDetailHeader.svelte';
    import DetailSection from '$lib/components/DetailSection.svelte';
    import Sidebar from '$lib/components/Sidebar.svelte';
    import { authStore} from '$lib/stores/authStore';
    import { page } from '$app/state';

    interface ProjectData {
        titleTH: string;
        titleEN: string;
        faculty: string;
        department: string;
        degree: string;
        year: string;
        authorTH: string[];
        authorEN: string[];
        advisorTH: string[];
        advisorEN: string[];
        abstractTH: string;
        abstractEN: string;
        keywordTH: string[];
        keywordEN: string[];
        downloads: number;
    }

    interface Labels {
        TH: { authors: string; advisor: string; abstract: string; keywords: string; toc: string };
        EN: { authors: string; advisor: string; abstract: string; keywords: string; toc: string };
    }

    interface TocItem {
        id: string;
        label: string;
    }

    type Lang = 'TH' | 'EN';

    const labels: Labels = {
        TH: {
            authors: 'ผู้จัดทำ',
            advisor: 'ที่ปรึกษา',
            abstract: 'บทคัดย่อ',
            keywords: 'คำสำคัญ',
            toc: 'สารบัญ'
        },
        EN: {
            authors: 'Authors',
            advisor: 'Advisor',
            abstract: 'Abstract',
            keywords: 'Keywords',
            toc: 'Table of Contents'
        }
    };

    const projectsDatabase: Record<string, ProjectData> = {
        '1': {
            titleTH: "การพัฒนาระบบแนะนำหนังสือโดยใช้เทคนิคการเรียนรู้ของเครื่อง",
            titleEN: "Development of a Book Recommendation System Using Machine Learning Techniques",
            faculty: "คณะวิทยาศาสตร์",
            department: "สาขาวิทยาการคอมพิวเตอร์",
            degree: "วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์)",
            year: "2567",
            authorTH: ["น.ส.ณัฏฐนันท์ ศรีพันธวานุสรณ์", "นายภูมิพิรัฐ รักษากิจ"],
            authorEN: ["Ms. Natchanan Sripanthawan", "Mr. Phumipirart Rakchai"],
            advisorTH: ["ดร.สมชาย ใจดี", "ดร.นภาวรรณ แสงสว่าง"],
            advisorEN: ["Dr. Somchai Jaidee", "Dr. Napavarn Sangsawang"],
            abstractTH: "โครงการนี้พัฒนาระบบแนะนำหนังสือที่มีประสิทธิภาพสูง โดยใช้เทคนิคการเรียนรู้ของเครื่องและการประมวลผลภาษาธรรมชาติเพื่อวิเคราะห์ความต้องการของผู้อ่าน",
            abstractEN: "This project develops a high-performance book recommendation system using machine learning techniques and natural language processing to analyze reader preferences",
            keywordTH: ["ระบบแนะนำหนังสือ", "การเรียนรู้ของเครื่อง", "การประมวลผลภาษาธรรมชาติ"],
            keywordEN: ["Book Recommendation System", "Machine Learning", "Natural Language Processing"],
            downloads: 150
        },
        '2': {
            titleTH: "การวิเคราะห์ความรู้สึกในความคิดเห็นของลูกค้าเกี่ยวกับผลิตภัณฑ์บนโซเชียลมีเดีย",
            titleEN: "Sentiment Analysis of Customer Reviews on Social Media",
            faculty: "คณะบริหารธุรกิจ",
            department: "สาขาการตลาด",
            degree: "บริหารธุรกิจบัณฑิต (การตลาด)",
            year: "2568",
            authorTH: ["น.ส.ณัฏฐนันท์ ศรีพันธวานุสรณ์", "นายภูมิพิรัฐ รักษากิจ"],
            authorEN: ["Ms. Natchanan Sripanthawan", "Mr. Phumipirart Rakchai"],
            advisorTH: ["ดร.สมชาย ใจดี", "ดร.นภาวรรณ แสงสว่าง"],
            advisorEN: ["Dr. Somchai Jaidee", "Dr. Napavarn Sangsawang"],
            abstractTH: "ศึกษาการใช้ natural language processing เพื่อวิเคราะห์ความรู้สึกจากความเห็นของลูกค้าบนแพลตฟอร์มโซเชียลมีเดีย เพื่อให้องค์กรสามารถเข้าใจความพึงพอใจและข้อติเตียม",
            abstractEN: "Study of natural language processing for sentiment analysis of customer opinions on social media platforms to understand customer satisfaction and feedback",
            keywordTH: ["วิเคราะห์ความรู้สึก", "ความคิดเห็นของลูกค้า", "โซเชียลมีเดีย"],
            keywordEN: ["Sentiment Analysis", "Customer Reviews", "Social Media"],
            downloads: 200
        },
        '3': {
            titleTH: "ระบบตรวจจับความผิดปกติโดยใช้การเรียนรู้เชิงลึก",
            titleEN: "Anomaly Detection System Using Deep Learning",
            faculty: "คณะวิศวกรรมศาสตร์",
            department: "สาขาวิศวกรรมคอมพิวเตอร์",
            degree: "วิศวกรรมศาสตรบัณฑิต (วิศวกรรมคอมพิวเตอร์)",
            year: "2569",
            authorTH: ["น.ส.ณัฏฐนันท์ ศรีพันธวานุสรณ์", "นายภูมิพิรัฐ รักษากิจ"],
            authorEN: ["Ms. Natchanan Sripanthawan", "Mr. Phumipirart Rakchai"],
            advisorTH: ["ดร.สมชาย ใจดี", "ดร.นภาวรรณ แสงสว่าง"],
            advisorEN: ["Dr. Somchai Jaidee", "Dr. Napavarn Sangsawang"],
            abstractTH: "พัฒนาระบบตรวจจับความผิดปกติที่มีประสิทธิภาพสูงโดยใช้เครือข่าย Autoencoder และ Convolutional Neural Networks เพื่อบันทึกและวิเคราะห์ข้อมูลที่ผิดปกติในเวลาจริง",
            abstractEN: "Development of an efficient anomaly detection system using Autoencoder and Convolutional Neural Networks for real-time detection and analysis of abnormal data patterns",
            keywordTH: ["การตรวจจับความผิดปกติ", "เรียนรู้เชิงลึก", "โครงข่ายประสาทเทียม"],
            keywordEN: ["Anomaly Detection", "Deep Learning", "Neural Networks"],
            downloads: 120
        },
        '4': {
            titleTH: "การพยากรณ์ราคาหุ้นด้วยเครือข่ายประสาทเทียม",
            titleEN: "Stock Price Prediction Using Neural Networks",
            faculty: "คณะวิทยาศาสตร์",
            department: "สาขาวิทยาการคอมพิวเตอร์",
            degree: "วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์)",
            year: "2567",
            authorTH: ["น.ส.ณัฏฐนันท์ ศรีพันธวานุสรณ์", "นายภูมิพิรัฐ รักษากิจ"],
            authorEN: ["Ms. Natchanan Sripanthawan", "Mr. Phumipirart Rakchai"],
            advisorTH: ["ดร.สมชาย ใจดี", "ดร.นภาวรรณ แสงสว่าง"],
            advisorEN: ["Dr. Somchai Jaidee", "Dr. Napavarn Sangsawang"],
            abstractTH: "เสนอวิธีการพยากรณ์ราคาหุ้นโดยใช้เครือข่าย LSTM และ GRU เพื่อประมวลผลข้อมูลอนุกรมเวลา และให้ความสามารถในการทำนายแนวโน้มราคาหุ้นในอนาคต",
            abstractEN: "Propose a method for stock price prediction using LSTM and GRU networks to process time series data and predict future stock price trends",
            keywordTH: ["พยากรณ์ราคา", "เครือข่ายประสาทเทียม", "ตลาดหุ้น"],
            keywordEN: ["Stock Prediction", "Neural Networks", "Stock Market"],
            downloads: 300
        },
        '5': {
            titleTH: "ระบบจดจำรูปภาพใบหน้าขั้นสูง",
            titleEN: "Advanced Facial Recognition System",
            faculty: "คณะวิทยาศาสตร์",
            department: "สาขาวิทยาการคอมพิวเตอร์",
            degree: "วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์)",
            year: "2567",
            authorTH: ["น.ส.ณัฏฐนันท์ ศรีพันธวานุสรณ์", "นายภูมิพิรัฐ รักษากิจ"],
            authorEN: ["Ms. Natchanan Sripanthawan", "Mr. Phumipirart Rakchai"],
            advisorTH: ["ดร.สมชาย ใจดี", "ดร.นภาวรรณ แสงสว่าง"],
            advisorEN: ["Dr. Somchai Jaidee", "Dr. Napavarn Sangsawang"],
            abstractTH: "พัฒนาระบบจดจำใบหน้าที่มีความแม่นยำสูงโดยใช้เทคนิค Face Detection และ Face Recognition เพื่อใช้ประโยชน์ในด้านความปลอดภัย การสำเร็จตัวตนและการจัดการเข้าออก",
            abstractEN: "Development of an advanced facial recognition system using Face Detection and Face Recognition techniques for security, authentication, and access control applications",
            keywordTH: ["จดจำใบหน้า", "การประมวลผลภาพ", "การรักษาความปลอดภัย"],
            keywordEN: ["Facial Recognition", "Image Processing", "Security"],
            downloads: 85
        }
    };

    const projectId = $derived(page.url.searchParams.get('id') || '1');
    const projectData = $derived(projectsDatabase[projectId] || projectsDatabase['1']);

    let isEnglish = $state(false);
    
    let currentLang = $derived<Lang>(isEnglish ? 'EN' : 'TH');
    let currentLabels = $derived(labels[currentLang]);
    let currentAuthors = $derived(currentLang === 'TH' ? projectData.authorTH : projectData.authorEN);
    let currentAdvisors = $derived(currentLang === 'TH' ? projectData.advisorTH : projectData.advisorEN);
    let currentAbstract = $derived(currentLang === 'TH' ? projectData.abstractTH : projectData.abstractEN);
    let currentKeywords = $derived(currentLang === 'TH' ? projectData.keywordTH : projectData.keywordEN);

    let tocItems = $derived<TocItem[]>([
        { id: 'abstract', label: currentLabels.abstract },
        { id: 'keywords', label: currentLabels.keywords },
        { id: 'authors', label: currentLabels.authors },
        { id: 'advisor', label: currentLabels.advisor }
    ]);
</script>

<main class="flex w-full flex-col justify-center overflow-x-hidden bg-white text-black">
    
    <ProjectHeader project={projectData} isLoggedIn={$authStore.isLoggedIn} />
    
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-14 px-6 py-10 md:px-10 lg:flex-row lg:px-20">
        
        <div class="flex-1 space-y-8">
            
            <div class="flex justify-center lg:justify-start">
                <label class="relative inline-flex h-10 w-48 cursor-pointer items-center rounded-full bg-gray-500 p-1 shadow-inner">
                    <input type="checkbox" class="peer sr-only" bind:checked={isEnglish} />
                    
                    <div class="absolute left-1 top-1 h-8 w-[calc(50%-4px)] rounded-full bg-orange-500 transition-transform duration-300 peer-checked:translate-x-full"></div>
                    
                    <div class="relative z-10 flex w-full font-bold">
                        <span class="flex-1 text-center text-sm transition-colors duration-300 {isEnglish ? 'text-base-100' : 'text-white'}">
                            ภาษาไทย
                        </span>
                        <span class="flex-1 text-center text-sm transition-colors duration-300 {isEnglish ? 'text-white' : 'text-base-100'}">
                            English
                        </span>
                    </div>
                </label>
            </div>

            <div id="abstract">
                <DetailSection label={currentLabels.abstract} value={currentAbstract} />
            </div>

            <DetailSection label={currentLabels.keywords}>
                <div class="mt-2 flex flex-wrap gap-2">
                    {#each currentKeywords as tag}
                        <span class="badge border-orange-200 bg-orange-200 p-3 text-orange-800">{tag}</span>
                    {/each}
                </div>
            </DetailSection>

            <div id="authors">
                <DetailSection label={currentLabels.authors}>
                    {#each currentAuthors as author}
                        <p>{author}</p>
                    {/each}
                </DetailSection>
            </div>

            <div id="advisor">
                <DetailSection label={currentLabels.advisor}>
                    {#each currentAdvisors as advisor}
                        <p>{advisor}</p>
                    {/each}
                </DetailSection>
            </div>
        </div>

        <div class="w-full shrink-0 lg:w-1/4">
            <Sidebar title={currentLabels.toc} items={tocItems} />
        </div>

    </div>
</main>