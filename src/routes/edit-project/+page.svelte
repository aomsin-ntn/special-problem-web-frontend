<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { PUBLIC_API_URL } from '$env/static/public';
    import { FileText, RefreshCcw, Save, Plus, Trash2, Tag } from 'lucide-svelte';
    import SearchableDropdown from '$lib/components/SearchableDropdown.svelte';
    import Swal from 'sweetalert2';

    let projectId = $derived($page.url.searchParams.get('id'));

    let project = $state<any>(null);
    let isLoading = $state(true);
    let isSaving = $state(false);

    // --- State สำหรับ Master Data ---
    let masterFaculties = $state<any[]>([]);
    let masterDegrees = $state<any[]>([]);
    let masterAdvisors = $state<any[]>([]);

    // 1. กรองหลักสูตรไม่ให้ซ้ำกัน (ใช้เทคนิค IIFE เพื่อความชัวร์ใน Svelte 5)
    let uniqueDegrees = $derived((() => {
        if (!masterDegrees) return [];
        const unique = [];
        const map = new Map();
        for (const item of masterDegrees) {
            if (!map.has(item.degree_id)) {
                map.set(item.degree_id, true);
                unique.push(item);
            }
        }
        return unique;
    })());

    // 2. กรองคณะ (Faculty)
    let availableFaculties = $derived((() => {
        if (!masterFaculties || masterFaculties.length === 0) return [];
        // ถ้ายังไม่ได้เลือกหลักสูตร ให้แสดงคณะทั้งหมด
        if (!project?.degree?.degree_id) return masterFaculties;
        
        const linkedDeptIds = masterDegrees
            .filter(d => d.degree_id === project.degree.degree_id)
            .map(d => d.department_id);
            
        if (linkedDeptIds.length === 0) return masterFaculties;

        return masterFaculties.filter(item => 
            item.departments && item.departments.some((dept: any) => linkedDeptIds.includes(dept.department_id))
        );
    })());
    
    // 3. กรองภาควิชา (Department)
    let availableDepartments = $derived((() => {
        if (!masterFaculties || !project?.faculty?.faculty_id) return [];
        
        const selectedFaculty = masterFaculties.find(f => f?.faculty?.faculty_id === project.faculty.faculty_id);
        if (!selectedFaculty || !selectedFaculty.departments) return [];

        // ถ้าเลือกหลักสูตรแล้ว ให้กรองภาควิชาเฉพาะที่สอนหลักสูตรนี้ด้วย
        if (project?.degree?.degree_id) {
            const linkedDeptIds = masterDegrees
                .filter(d => d.degree_id === project.degree.degree_id)
                .map(d => d.department_id);
                
            if (linkedDeptIds.length > 0) {
                return selectedFaculty.departments.filter((dept: any) => 
                    linkedDeptIds.includes(dept.department_id)
                );
            }
        }
        return selectedFaculty.departments;
    })());

    $effect(() => {
        if (!projectId) {
            goto('/profile');
            return;
        }

        const fetchData = async () => {
            try {
                // ดึงข้อมูลโปรเจกต์ และ Master Data พร้อมกันเพื่อความรวดเร็ว
                const [projRes, facRes, degRes, advRes] = await Promise.all([
                    fetch(`${PUBLIC_API_URL}/project/edit_project/${projectId}`, { credentials: 'include' }),
                    fetch(`${PUBLIC_API_URL}/project/get_faculty`), // API ที่คุณมีอยู่แล้วสำหรับดึงคณะและภาควิชา
                    fetch(`${PUBLIC_API_URL}/master/degree`),      // สมมติ URL ต้องแก้ให้ตรงกับ Backend ของคุณ
                    fetch(`${PUBLIC_API_URL}/master/advisor`)      // สมมติ URL ต้องแก้ให้ตรงกับ Backend ของคุณ
                ]);

                if (!projRes.ok) {
                    if (projRes.status === 403 || projRes.status === 401) {
                        Swal.fire('ไม่มีสิทธิ์', 'คุณไม่มีสิทธิ์แก้ไขโปรเจกต์นี้', 'error');
                        goto('/profile');
                        return;
                    }
                    throw new Error('Failed to fetch project data');
                }

                const rawResponse = await projRes.json();
                const rawProject = rawResponse[0];
                
                // จัดเตรียมโครงสร้าง Data ให้พร้อม Binding กับ Form
                project = {
                    ...rawProject,
                    faculty: rawProject.faculty || { faculty_id: '' },
                    department: rawProject.department || { department_id: '' },
                    degree: rawProject.degree || { degree_id: '' },
                    authors: rawProject.authors || [],
                    advisors: rawProject.advisors || [],
                    keywords: rawProject.keywords || [],
                    abstract_th: rawProject.abstract_th || '',
                    abstract_en: rawProject.abstract_en || ''
                };

                // นำ Master Data ใส่ State (ถ้า API ไหนพัง ให้คืนค่า [] ไปก่อนป้องกันเว็บล่ม)
                masterFaculties = facRes.ok ? await facRes.json() : [];
                masterDegrees = degRes.ok ? await degRes.json() : [];
                masterAdvisors = advRes.ok ? await advRes.json() : [];

            } catch (error) {
                console.error("Error fetching data:", error);
                Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้', 'error');
                goto('/profile');
            } finally {
                isLoading = false;
            }
        };

        fetchData();
    });

    // ล้างค่าคณะและภาควิชา เมื่อผู้ใช้เปลี่ยนหลักสูตรใหม่
    const handleDegreeChange = () => {
        if (project) {
            project.faculty.faculty_id = '';
            project.department.department_id = '';
        }
    };

    // เมื่อคณะถูกเปลี่ยน ให้ล้างค่าภาควิชาเดิมทิ้ง
    const handleFacultyChange = () => {
        if (project) {
            project.department.department_id = '';
        }
    };

    const handleUpdate = async (e: Event) => {
        e.preventDefault();
        isSaving = true;

        try {

            if (!project.title_en || !project.degree.degree_id || !project.department.department_id || !project.faculty.faculty_id || project.advisors.length === 0) {
                Swal.fire({
                    title: 'ข้อมูลไม่ครบถ้วน', 
                    text: 'กรุณากรอกข้อมูลให้ครบถ้วน', 
                    icon: 'warning',
                    confirmButtonColor: '#f97316'
                });
                isSaving = false;
                return;
            }

            // 2. จัดระเบียบข้อมูลให้ตรงกับ Schema ของ Backend
            const payload = {
                title_th: project.title_th,
                title_en: project.title_en,
                abstract_th: project.abstract_th,
                abstract_en: project.abstract_en,
                academic_year_be: project.academic_year_be,
                academic_year_ce: project.academic_year_ce,
                
                degree: { 
                    degree_id: project.degree?.degree_id || null,
                    degree_name_th: project.degree?.degree_name_th || "",
                    degree_name_en: project.degree?.degree_name_en || ""
                },
                department: { 
                    department_id: project.department?.department_id || null,
                    department_name_th: project.department?.department_name_th || "",
                    department_name_en: project.department?.department_name_en || ""
                },
                faculty: { 
                    faculty_id: project.faculty?.faculty_id || null,
                    faculty_name_th: project.faculty?.faculty_name_th || "",
                    faculty_name_en: project.faculty?.faculty_name_en || ""
                },
                advisors: project.advisors.map((adv: any) => ({ 
                    advisor_id: adv.advisor_id || null,
                    advisor_name_th: adv.advisor_name_th || "",
                    advisor_name_en: adv.advisor_name_en || ""
                })),
                keywords: project.keywords.map((kw: any) => ({ 
                    keyword_id: kw.keyword_id || null,
                    keyword_text_th: kw.keyword_text_th || "", 
                    keyword_text_en: kw.keyword_text_en || "" 
                })),
                
                students: project.authors ? project.authors.map((author: any) => ({
                    student_id: author.student_id || "",
                    student_name_th: author.user_name_th || "",
                    student_name_en: author.user_name_en || ""
                })) : [],
                file_info: {
                    file_id: project.project_file?.file_id || "",
                    file_path: project.project_file?.file_path || "",
                    save_name: project.project_file?.file_name || "",
                    thumbnail_path: project.project_file?.thumbnail_path || ""
                }
            };
            console.log("Payload for Update:", payload);
            // 3. ส่งข้อมูลไปอัปเดตที่ FastAPI
            const res = await fetch(`${PUBLIC_API_URL}/project/update_project/${projectId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', 
                body: JSON.stringify(payload)
            });

            // 4. จัดการผลลัพธ์
            if (res.ok) {
                await Swal.fire({
                    title: 'บันทึกสำเร็จ!',
                    text: 'อัปเดตข้อมูลโครงงานเรียบร้อยแล้ว',
                    icon: 'success',
                    confirmButtonColor: '#f97316' // สีส้มให้เข้ากับธีม
                });
                goto('/profile'); // บันทึกเสร็จให้เด้งกลับไปหน้าโปรไฟล์
            } else {
                const errData = await res.json();
                // จัดการ Error กรณีไม่ใช่เจ้าของโปรเจกต์ หรือ Backend ฟ้อง Error 
                if (res.status === 403) {
                    Swal.fire('ปฏิเสธการเข้าถึง', 'คุณไม่มีสิทธิ์แก้ไขโครงงานนี้', 'error');
                } else {
                    Swal.fire('ข้อผิดพลาด', errData.detail || 'ไม่สามารถบันทึกข้อมูลได้', 'error');
                }
            }
        } catch (error) {
            console.error("Update Error:", error);
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้', 'error');
        } finally {
            isSaving = false;
        }
    };

    const handleChangeFile = async () => {
        const result = await Swal.fire({
            title: 'ต้องการเปลี่ยนไฟล์ใหม่หรือไม่?',
            text: "หากต้องการเปลี่ยนไฟล์ คุณต้องลบโปรเจกต์เดิมและสร้างใหม่เพื่อให้ระบบ OCR ทำงานอีกครั้ง",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'ลบ และสร้างใหม่',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            const confirmAgain = await Swal.fire({
                title: 'ยืนยันการลบอีกครั้ง?',
                text: "โปรเจคปัจจุบันจะหายไป และคุณจะเข้าสู่หน้าอัปโหลดไฟล์",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'แน่ใจ ลบเลย',
                cancelButtonText: 'ยกเลิก',
                reverseButtons: true
            });

            if (confirmAgain.isConfirmed) {
                try {
                    // เรียก API ลบโปรเจกต์ของ FastAPI
                    const res = await fetch(`${PUBLIC_API_URL}/project/delete?project_id=${project.project_id}`, {
                        method: 'PATCH',
                        credentials: 'include'
                    });

                    if (res.ok) {
                        goto('/upload-project');
                    } else {
                        throw new Error('Delete failed');
                    }
                } catch (error) {
                    Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบโปรเจกต์ได้', 'error');
                }
            }
        }
    };

    // --- ฟังก์ชันช่วยเหลือสำหรับ Dynamic Lists ---
    const addAdvisor = () => project.advisors.push({ advisor_id: '' });
    const removeAdvisor = (index: number) => project.advisors.splice(index, 1);

    const addKeyword = () => project.keywords.push({ keyword_text_th: '', keyword_text_en: '' });
    const removeKeyword = (index: number) => project.keywords.splice(index, 1);

        const handleTab = (e: KeyboardEvent, field: 'abstract_th' | 'abstract_en') => {
        if (e.key === 'Tab') {
            e.preventDefault(); // ป้องกันไม่ให้เคอร์เซอร์กระโดดไปช่องอื่น
            
            const target = e.target as HTMLTextAreaElement;
            const start = target.selectionStart;
            const end = target.selectionEnd;

            // แทรกตัวอักษร Tab (\t) ลงไปตรงตำแหน่งที่เคอร์เซอร์อยู่
            project[field] = project[field].substring(0, start) + '\t' + project[field].substring(end);

            // จัดการให้เคอร์เซอร์ขยับไปอยู่หลัง Tab ที่เพิ่งแทรก
            setTimeout(() => {
                target.selectionStart = target.selectionEnd = start + 1;
            }, 0);
        }
    };

</script>

<main class="min-h-screen bg-white py-10 px-4 text-black">
    <div class="max-w-6xl mx-auto">
        
        <div class="flex justify-between items-center mb-8 border-b border-gray-400 pb-4 md:pb-6">
            <h1 class="text-2xl md:text-3xl font-bold">แก้ไขข้อมูลโครงงาน</h1>
        </div>

        {#if isLoading}
            <div class="flex justify-center items-center h-64">
                <span class="loading loading-spinner loading-lg text-orange-500"></span>
            </div>
        {:else if project}
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                <div class="lg:col-span-1 flex flex-col gap-4">
                    <div class="bg-white p-4 rounded-2xl shadow-md border border-gray-600">
                        <p class="font-semibold text-gray-700 mb-3 border-b pb-2 border-gray-500">ไฟล์เอกสารปัจจุบัน</p>
                        <div class="bg-gray-100 rounded-xl p-2 mb-3 flex justify-center border border-gray-500">
                            <img 
                                src={project.project_file?.thumbnail_path ? `${PUBLIC_API_URL}/${project.project_file.thumbnail_path}` : "https://placehold.co/200x280"} 
                                alt="Thumbnail" 
                                class="w-full max-w-45 h-auto rounded-lg shadow-sm"
                            />
                        </div>
                        <div class="flex items-center gap-2 text-sm text-gray-300 bg-orange-50 p-2 rounded-lg border border-orange-100 mb-4">
                            <FileText class="w-4 h-4 shrink-0 text-orange-500" />
                            <span class="truncate" title={project.title_en}>{project.title_en || 'ไม่มีชื่อไฟล์'}</span>
                        </div>
                        <button type="button" onclick={handleChangeFile} class="btn btn-outline btn-error btn-sm w-full gap-2 rounded-lg">
                            <RefreshCcw class="w-4 h-4" /> เปลี่ยนไฟล์ใหม่
                        </button>
                    </div>
                </div>

                <div class="lg:col-span-3">
                    <form onsubmit={handleUpdate} class="flex flex-col gap-6 bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-600">
                        
                        <section>
                            <h2 class="text-lg font-bold text-orange-600 mb-4 flex items-center gap-2"><span class="w-2 h-6 bg-orange-500 rounded-full"></span> ข้อมูลทั่วไป</h2>
                            <div class="grid grid-cols-1 gap-4">
                                <div class="form-control">
                                    <label for="title_th" class="label"><span class="label-text font-bold">ชื่อโครงงาน (TH)</span></label>
                                    <input id="title_th" type="text" bind:value={project.title_th} class="input input-bordered w-full focus:ring-2 focus:ring-orange-200 bg-gray-600" />
                                </div>
                                <div class="form-control">
                                    <label for="title_en" class="label"><span class="label-text font-bold">ชื่อโครงงาน (EN)</span></label>
                                    <input id="title_en" type="text" bind:value={project.title_en} class="input input-bordered w-full focus:ring-2 focus:ring-orange-200 bg-gray-600" />
                                </div>
                                <div class="form-control w-1/3">
                                    <label for="academic_year_be" class="label"><span class="label-text font-bold">ปีการศึกษา (TH)</span></label>
                                    <input id="academic_year_be" type="text" bind:value={project.academic_year_be} class="input input-bordered w-full focus:ring-2 focus:ring-orange-200 bg-gray-600" />
                                </div>
                                <div class="form-control w-1/3">
                                    <label for="academic_year_ce" class="label"><span class="label-text font-bold">ปีการศึกษา (EN)</span></label>
                                    <input id="academic_year_ce" type="text" bind:value={project.academic_year_ce} class="input input-bordered w-full focus:ring-2 focus:ring-orange-200 bg-gray-600" />
                                </div>
                            </div>
                        </section>

                        <div class="divider my-0"></div>

                        <section>
                            <h2 class="text-lg font-bold text-orange-600 mb-4 flex items-center gap-2">
                                <span class="w-2 h-6 bg-orange-500 rounded-full"></span> หลักสูตร
                            </h2>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                <div class="form-control md:col-span-2">
                                    <label for="degree" class="label"><span class="label-text font-bold">หลักสูตร (Degree)</span></label>
                                    <SearchableDropdown 
                                        bind:value={project.degree.degree_id} 
                                        onchange={handleDegreeChange}
                                        placeholder="-- เลือกหลักสูตร --"
                                        labelKey="label"
                                        valueKey="id"
                                        defaultOptionText = "-- เลือกหลักสูตร --"
                                        options={masterDegrees.map(d => ({
                                            id: d.degree_id,
                                            label: `${d.degree_name_th} (${d.degree_name_en})`
                                        }))}
                                    />
                                </div>

                                <div class="form-control">
                                    <label for="faculty" class="label"><span class="label-text font-bold">คณะ (Faculty)</span></label>
                                    <SearchableDropdown 
                                        bind:value={project.faculty.faculty_id} 
                                        onchange={handleFacultyChange}
                                        placeholder="-- เลือกคณะ --"
                                        labelKey="label"
                                        valueKey="id"
                                        defaultOptionText = "-- เลือกคณะ --"
                                        options={availableFaculties.map(f => ({
                                            id: f.faculty.faculty_id,
                                            label: `${f.faculty.faculty_name_th} (${f.faculty.faculty_name_en})`
                                        }))}
                                        disabled={!project.degree?.degree_id}
                                    />
                                </div>

                                <div class="form-control">
                                    <label for="department" class="label"><span class="label-text font-bold">ภาควิชา (Department)</span></label>
                                    <SearchableDropdown 
                                        bind:value={project.department.department_id} 
                                        placeholder="-- เลือกภาควิชา --"
                                        labelKey="label"
                                        valueKey="id"
                                        defaultOptionText = "-- เลือกภาควิชา --"
                                        options={availableDepartments.map((d : any) => ({
                                            id: d.department_id,
                                            label: `${d.department_name_th} (${d.department_name_en})`
                                        }))}
                                        disabled={!project.faculty?.faculty_id}
                                    />
                                </div>
                            </div>
                        </section>

                        <div class="divider my-0"></div>

                        <section>
                            <div class="flex justify-between items-center mb-4">
                                <h2 class="text-lg font-bold text-orange-600 flex items-center gap-2"><span class="w-2 h-6 bg-orange-500 rounded-full"></span> อาจารย์ที่ปรึกษา</h2>
                                <button type="button" onclick={addAdvisor} class="btn btn-sm btn-outline btn-primary"><Plus class="w-4 h-4"/> เพิ่มอาจารย์</button>
                            </div>
                            <div class="flex flex-col gap-3">
                                {#each project.advisors as adv, index}
                                    <div class="flex items-center gap-2">
                                        <SearchableDropdown 
                                            bind:value={adv.advisor_id} 
                                            placeholder="-- เลือกอาจารย์ที่ปรึกษา --"
                                            labelKey="label"
                                            valueKey="id"
                                            options={masterAdvisors.map(a => ({
                                                id: a.advisor_id,
                                                label: `${a.advisor_name_th} (${a.advisor_name_en})`
                                            }))}
                                        />
                                        <button type="button" onclick={() => removeAdvisor(index)} class="btn btn-square btn-error btn-outline" aria-label="ลบ">
                                            <Trash2 class="w-4 h-4" />
                                        </button>
                                    </div>
                                {/each}
                            </div>
                        </section>

                        <div class="divider my-0"></div>

                        <section>
                            <h2 class="text-lg font-bold text-orange-600 mb-4 flex items-center gap-2"><span class="w-2 h-6 bg-orange-500 rounded-full"></span> บทคัดย่อ (Abstract)</h2>
                            <div class="grid grid-cols-1 gap-4">
                                <div class="form-control">
                                    <label for="abstract_th" class="label"><span class="label-text font-bold">บทคัดย่อ (TH)</span></label>
                                    <textarea id="abstract_th" bind:value={project.abstract_th} onkeydown={(e) => handleTab(e, 'abstract_th')} class="textarea textarea-bordered w-full h-32 bg-gray-600 focus:ring-2 focus:ring-orange-200 leading-relaxed"></textarea>
                                </div>
                                <div class="form-control">
                                    <label for="abstract_en" class="label"><span class="label-text font-bold">บทคัดย่อ (EN)</span></label>
                                    <textarea id="abstract_en" bind:value={project.abstract_en} onkeydown={(e) => handleTab(e, 'abstract_en')} class="textarea textarea-bordered w-full h-32 bg-gray-600 focus:ring-2 focus:ring-orange-200 leading-relaxed"></textarea>
                                </div>
                            </div>
                        </section>

                        <div class="divider my-2"></div>

                        <section>
                            <div class="flex justify-between items-center mb-4">
                                <h2 class="text-lg font-bold text-orange-600 flex items-center gap-2"><span class="w-2 h-6 bg-orange-500 rounded-full"></span> คำสำคัญ (Keywords)</h2>
                                <button type="button" onclick={addKeyword} class="btn btn-sm btn-outline btn-primary"><Plus class="w-4 h-4"/> เพิ่มคำสำคัญ</button>
                            </div>
                            <div class="flex flex-col gap-3">
                                {#each project.keywords as kw, index}
                                    <div class="flex items-center gap-2">
                                        <input type="text" bind:value={kw.keyword_text_th} placeholder="คำสำคัญ (TH)" class="input input-bordered w-full bg-gray-600 focus:ring-2 focus:ring-orange-200" />
                                        <input type="text" bind:value={kw.keyword_text_en} placeholder="Keyword (EN)" class="input input-bordered w-full bg-gray-600 focus:ring-2 focus:ring-orange-200" />
                                        <button type="button" onclick={() => removeKeyword(index)} class="btn btn-square btn-error btn-outline" aria-label="ลบ">
                                            <Trash2 class="w-4 h-4" />
                                        </button>
                                    </div>
                                {/each}
                            </div>
                        </section>

                        <div class="divider my-2"></div>

                        <div class="flex justify-end gap-3 mt-4">
                            <button type="button" onclick={() => history.back()} class="btn btn-ghost border border-gray-300 px-8">ยกเลิก</button>
                            <button type="submit" class="btn bg-orange-500 hover:bg-orange-600 text-white border-none px-8" disabled={isSaving}>
                                {#if isSaving}
                                    <span class="loading loading-spinner loading-xs"></span> บันทึก...
                                {:else}
                                    <Save class="w-4 h-4 mr-1" /> บันทึกการเปลี่ยนแปลง
                                {/if}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        {/if}
    </div>
</main>