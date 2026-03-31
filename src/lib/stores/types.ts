export interface AuthorAdvisor {
    name: string;
}

export interface ProjectData {
    title: string;
    faculty: string;
    department: string;
    degree: string;
    academicYear: string;
    authors: AuthorAdvisor[];
    advisors: AuthorAdvisor[];
    abstract: string;
    keywords: string[];
}