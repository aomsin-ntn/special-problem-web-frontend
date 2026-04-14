import type { Component } from 'svelte';

export interface AuthorAdvisor {
    studentId?: string;
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

export interface FileInfo {
    file_path: string;
    save_name: string;
    thumbnail_path: string;
}

export interface PageThumbnail {
    id: number;
    src: string;
}

export interface StepItem {
    name: string;
    icon: Component<any> | any; 
}

export interface SpellError {
    word: string;
    suggestions: string[];
}

/**
 * The `spell_errors` object keyed by field name, e.g.:
 * {
 *   "abstract_th": [{ word: "การ", suggestions: ["กา"] }],
 *   "title_th":    [{ word: "โปรเจค", suggestions: ["โปรเจกต์"] }]
 * }
 */

export type SpellErrorMap = Record<string, SpellError[]>;

/** Full OCR API response shape (Step 3). */
export interface OcrApiResponse {
    file_info: FileInfo;
    form_data: Record<string, any>;
    spell_errors: SpellErrorMap;
}