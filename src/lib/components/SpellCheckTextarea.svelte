<script lang="ts">
    import { X } from 'lucide-svelte';

    // ─── Public Types (re-exported so consumers can import from this file) ────
    export interface SpellError {
        word: string;
        suggestions: string[];
    }

    // ─── Internal Types ───────────────────────────────────────────────────────
    interface ErrorInstance {
        /** Stable ID: "{word}__{occurrenceIndex}" */
        id: string;
        word: string;
        /** Character offset in `value` – always fresh from latest scan */
        start: number;
        end: number;
        suggestions: string[];
    }

    interface TooltipState {
        instanceId: string;
        word: string;
        suggestions: string[];
        /** Viewport-relative X of the word's horizontal center */
        clientX: number;
        /** Viewport-relative Y of the word's bottom edge */
        clientY: number;
    }

    // ─── Props ────────────────────────────────────────────────────────────────
    interface Props {
        value: string;
        spellErrors?: SpellError[];
        placeholder?: string;
        /** Pass your existing Tailwind / DaisyUI textarea classes here */
        inputClass?: string;
        rows?: number;
        name?: string;
        id?: string;
    }

    let {
        value      = $bindable(''),
        spellErrors = [],
        placeholder = '',
        inputClass  = '',
        rows        = 6,
        name,
        id,
    }: Props = $props();

    // ─── Element refs ─────────────────────────────────────────────────────────
    let textareaEl = $state<HTMLTextAreaElement | null>(null);
    let mirrorEl   = $state<HTMLDivElement    | null>(null);
    let tooltipEl  = $state<HTMLDivElement    | null>(null);

    // ─── State ────────────────────────────────────────────────────────────────
    let ignoredIds = $state<Set<string>>(new Set());
    let tooltip    = $state<TooltipState | null>(null);

    /**
     * Reset ignored IDs whenever spellErrors are replaced
     * (i.e. a new OCR result arrived).
     */
    $effect(() => {
        void spellErrors; // explicit dependency tracking
        ignoredIds = new Set();
        tooltip    = null;
    });

    // ─── Derived: all active error instances ─────────────────────────────────
    /**
     * Scans `value` for every occurrence of every error word.
     * Each instance gets a stable ID: "{word}__{occurrenceIndex}" so that
     * "ignore" decisions survive minor edits that shift character positions.
     */
    const errorInstances: ErrorInstance[] = $derived.by(() => {
        if (!spellErrors?.length || !value) return [];

        const instances: ErrorInstance[] = [];

        for (const err of spellErrors) {
            if (!err.word) continue;

            let searchFrom = 0;
            let occ        = 0;

            while (searchFrom < value.length) {
                const idx = value.indexOf(err.word, searchFrom);
                if (idx === -1) break;

                const iid = `${err.word}__${occ}`;
                if (!ignoredIds.has(iid)) {
                    instances.push({
                        id:          iid,
                        word:        err.word,
                        start:       idx,
                        end:         idx + err.word.length,
                        suggestions: err.suggestions,
                    });
                }

                searchFrom = idx + err.word.length;
                occ++;
            }
        }

        // Must be sorted ascending so the HTML-building pass is O(n)
        return instances.sort((a, b) => a.start - b.start);
    });

    // ─── Derived: mirror HTML ─────────────────────────────────────────────────
    /**
     * Builds an HTML string where misspelled words are wrapped in
     * <mark class="spell-mark" data-id="…">. The trailing zero-width
     * space prevents the last line from collapsing in the div.
     */
    const mirrorHtml: string = $derived.by(() => {
        if (!errorInstances.length) return esc(value) + (value.endsWith('\n') ? '<br>' : '') + '\u200B';

        let html   = '';
        let cursor = 0;

        for (const inst of errorInstances) {
            if (inst.start > cursor) html += esc(value.slice(cursor, inst.start));
            html += `<mark class="spell-mark" data-id="${inst.id}">${esc(inst.word)}</mark>`;
            cursor = inst.end;
        }
        if (cursor < value.length) html += esc(value.slice(cursor));

        return html + (value.endsWith('\n') ? '<br>' : '') + '\u200B';
    });

    /** HTML-escape plain text and convert newlines to <br> for innerHTML. */
    function esc(s: string): string {
        return s
            .replace(/&/g,  '&amp;')
            .replace(/</g,  '&lt;')
            .replace(/>/g,  '&gt;')
            .replace(/\n/g, '<br>');
    }

    // ─── Effect: copy textarea computed styles → mirror ───────────────────────
    /**
     * Guarantees pixel-perfect text alignment between the mirror and the real
     * textarea by reading the textarea's computed styles after mount and after
     * any resize (handles responsive Tailwind breakpoints like `md:text-base`).
     */
    $effect(() => {
        const ta = textareaEl;
        const mi = mirrorEl;
        if (!ta || !mi) return;

        const PROPS_TO_COPY = [
            'font-family', 'font-size', 'font-weight', 'font-style',
            'letter-spacing', 'word-spacing', 'line-height',
            'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
            'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
            'box-sizing', 'text-indent', 'text-transform',
        ] as const;

        /** camelCase a kebab-case CSS property name */
        const toCamel = (s: string) => s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

        function syncStyles() {
            if (!ta || !mi) return;
            const cs = getComputedStyle(ta);
            for (const prop of PROPS_TO_COPY) {
                mi.style.setProperty(prop, cs.getPropertyValue(prop));
            }
        }

        syncStyles();

        const ro = new ResizeObserver(syncStyles);
        ro.observe(ta);
        return () => ro.disconnect();
    });

    // ─── Effect: scroll sync ──────────────────────────────────────────────────
    /**
     * Keeps the mirror scrolled to the same position as the textarea so
     * highlights stay aligned when the text is long.
     */
    $effect(() => {
        const ta = textareaEl;
        const mi = mirrorEl;
        if (!ta || !mi) return;

        const onScroll = () => { mi.scrollTop = ta.scrollTop; };
        ta.addEventListener('scroll', onScroll, { passive: true });
        return () => ta.removeEventListener('scroll', onScroll);
    });

    // ─── Hover detection via elementFromPoint ─────────────────────────────────
    /**
     * The textarea sits on top (z-index) and captures all pointer events.
     * To detect which <mark> the cursor is over, we temporarily set
     * pointer-events: none on the textarea, call elementFromPoint to pierce
     * through to the mirror below, then restore pointer-events.
     * This is a standard industry technique for overlay editors.
     */

    let hideTimeout: ReturnType<typeof setTimeout> | null = null;
    
    function getMarkBelow(e: MouseEvent): HTMLElement | null {
        const ta = textareaEl;
        if (!ta) return null;
        ta.style.pointerEvents = 'none';
        const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
        ta.style.pointerEvents = '';
        return (el?.closest('[data-id]') as HTMLElement | null) ?? null;
    }

    function handleMouseMove(e: MouseEvent) {
        const mark = getMarkBelow(e);

        if (!mark) {
            if (tooltip && !hideTimeout) {
                hideTimeout = setTimeout(() => {
                    if (tooltipEl && !tooltipEl.matches(':hover')) tooltip = null;
                    hideTimeout = null;
                }, 200);
            }
            return;
        }

        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }

        const iid = mark.dataset.id!;
        if (tooltip?.instanceId === iid) return; // already showing – skip re-render

        const inst = errorInstances.find(i => i.id === iid);
        if (!inst) return;

        const rect = mark.getBoundingClientRect();
        tooltip = {
            instanceId: iid,
            word:        inst.word,
            suggestions: inst.suggestions,
            clientX:     rect.left + rect.width  / 2,
            clientY:     rect.bottom + 1,
        };
    }

    function handleMouseLeave(e: MouseEvent) {
        const related = e.relatedTarget as HTMLElement | null;
        // Keep tooltip alive if the cursor moved into the tooltip itself
        if (related && tooltipEl && (tooltipEl === related || tooltipEl.contains(related))) return;

        if (tooltip && !hideTimeout) {
            hideTimeout = setTimeout(() => {
                if (tooltipEl && !tooltipEl.matches(':hover')) tooltip = null;
                hideTimeout = null;
            }, 200);
        }
    }

    function handleTooltipMouseLeave(e: MouseEvent) {
        const related = e.relatedTarget as HTMLElement | null;
        if (related === textareaEl || textareaEl?.contains(related)) return;
        tooltip = null;
    }

    // ─── Tooltip actions ──────────────────────────────────────────────────────

    /**
     * Replaces ONLY the specific instance at its exact character index.
     * Uses the `start`/`end` from the currently-derived instances – these are
     * always re-computed from the latest `value`, so they are always accurate.
     */
    function applySuggestion(suggestion: string) {
        if (!tooltip) return;
        const inst = errorInstances.find(i => i.id === tooltip!.instanceId);
        if (!inst) { tooltip = null; return; }

        value = value.slice(0, inst.start) + suggestion + value.slice(inst.end);
        tooltip = null;
    }

    function ignoreError() {
        if (!tooltip) return;
        ignoredIds = new Set([...ignoredIds, tooltip.instanceId]);
        tooltip = null;
    }

    // ─── Derived: tooltip position (viewport-clamped, fixed) ─────────────────
    interface TooltipLayout {
        style:       string;
        arrowOffset: number; // px from left edge of tooltip to arrow center
    }

    const tooltipLayout: TooltipLayout = $derived.by(() => {
        if (!tooltip || typeof window === 'undefined') {
            return { style: '', arrowOffset: 100 };
        }

        const W   = 200; // tooltip width (px) – matches CSS min-width
        const GAP =  10; // min gap from viewport edge
        const vw  = window.innerWidth;
        const vh  = window.innerHeight;

        // Horizontal: center on word, clamp to viewport
        let left  = tooltip.clientX - W / 2;
        left      = Math.max(GAP, Math.min(left, vw - W - GAP));

        // Arrow X = where the word center is relative to the tooltip's left edge
        const arrowOffset = Math.max(16, Math.min(tooltip.clientX - left, W - 16));

        // Vertical: below word by default; flip above if near bottom
        const estimatedH = 150;
        let   top        = tooltip.clientY;
        const showAbove  = top + estimatedH > vh - GAP;
        if (showAbove) top = tooltip.clientY - estimatedH - 16 - 8;

        const arrowClass = showAbove ? 'arrow-below' : 'arrow-above';

        return {
            style:       `left:${left}px; top:${top}px; --arrow-x:${arrowOffset}px;`,
            arrowOffset,
        };
    });
</script>

<!--
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  CSS-Grid wrapper: mirror + textarea share the same grid cell so they  │
  │  are perfectly overlapping without needing position: absolute on either │
  └─────────────────────────────────────────────────────────────────────────┘
-->
<div class="spell-wrapper">
    <!--
        Mirror: an exact visual clone of the textarea (same font, padding,
        border-box) but pointer-events: none and aria-hidden.
        Its innerHTML contains <mark> elements for the squiggly highlights.
    -->
    <div
        bind:this={mirrorEl}
        aria-hidden="true"
        class="spell-mirror"
    >
        {@html mirrorHtml}
    </div>

    <!--
        Real textarea: text color transparent (so the mirror shows through),
        caret-color preserved so the editing cursor is visible.
        All mouse events are handled here and forwarded to the mirror via
        the elementFromPoint technique.
    -->
    <textarea
        bind:this={textareaEl}
        bind:value
        {name}
        {id}
        {rows}
        {placeholder}
        class="spell-textarea {inputClass}"
        onmousemove={handleMouseMove}
        onmouseleave={handleMouseLeave}
    ></textarea>
</div>

<!--
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  Tooltip – uses position:fixed so it is never clipped by an ancestor's │
  │  overflow:hidden, regardless of where the component lives in the DOM.  │
  └─────────────────────────────────────────────────────────────────────────┘
-->
{#if tooltip}
    <div
        bind:this={tooltipEl}
        role="dialog"
        aria-label="Spell check suggestions"
        tabindex="-1"
        class="spell-tooltip"
        style={tooltipLayout.style}
        onmouseleave={handleTooltipMouseLeave}
    >
        <!-- Upward-pointing arrow aligned to the misspelled word -->
        <div class="spell-arrow" aria-hidden="true"></div>

        <!-- ── Header ── -->
        <div class="spell-header">แก้คำสะกดผิด</div>

        <!-- ── Suggestions ── -->
        {#each tooltip.suggestions as suggestion (suggestion)}
            <button
                type="button"
                class="spell-suggestion"
                onclick={() => applySuggestion(suggestion)}
            >
                {suggestion}
            </button>
        {/each}

        <!-- ── Ignore ── -->
        <div class="spell-sep" role="separator"></div>
        <button
            type="button"
            class="spell-ignore"
            onclick={ignoreError}
        >
            <X class="w-3.5 h-3.5 shrink-0" />
            <span>ไม่สนใจ</span>
        </button>
    </div>
{/if}

<style>
    /* ── Grid wrapper ─────────────────────────────────────────────────────── */
    .spell-wrapper {
        display: grid;
        grid-template-areas: 'field';
        width: 100%;
        height: auto;
        min-width: 0;
    }
    .spell-wrapper > * {
        grid-area: field;
        min-width: 0;
    }

    /* ── Mirror div ───────────────────────────────────────────────────────── */
    .spell-mirror {
        /* JS copies font/padding/border-width from textarea at runtime */
        color:          inherit;
        background:     transparent;
        pointer-events: none;
        user-select:    none;
        overflow:       hidden; /* must NOT scroll independently */
        white-space:    pre-wrap;
        word-wrap:      break-word;
        overflow-wrap:  break-word;
        word-break:     break-word;
        /* Prevent collapsing height when text is empty */
        min-height:     1em;
        height:         auto;

        border-style: solid;
        border-color: transparent;
        box-sizing: border-box;
    }

    /* ── Textarea ─────────────────────────────────────────────────────────── */
    .spell-textarea {
        position:   relative; /* above the mirror in stacking order */
        /* Text is invisible so the mirror's coloured text shows through */
        color:      transparent !important;
        /* Caret stays visible for normal editing experience */
        caret-color: #111827 !important; /* Tailwind gray-900 */
        background: transparent !important;
        white-space: pre-wrap;
        word-wrap:   break-word;
        overflow-wrap: break-word;
        word-break:  break-word;
        resize:      none !important; 
        overflow:    hidden !important;
        width:       100% !important;
        height:      100% !important;
    }

    /* ── Squiggly underline on marked words ───────────────────────────────── */
    /*
     * Using :global() because the <mark> is injected via @html and Svelte's
     * scoped hash is NOT added to innerHTML elements.
     */
    :global(.spell-mark) {
        background:                  transparent;
        color:                       inherit;
        text-decoration:             underline;
        text-decoration-style:       wavy;
        text-decoration-color:       #ef4444; /* red-500 */
        text-decoration-skip-ink:    none;
        border-radius:               1px;
        /* Increase hit target area slightly for the elementFromPoint check */
        padding-bottom:              1px;

        pointer-events:              auto;
    }

    /* ── Tooltip container ────────────────────────────────────────────────── */
    .spell-tooltip {
        position:      fixed;
        z-index:       9999;
        width:         180px;
        border-radius: 10px;
        background:    #ffffff;
        border:        1px solid #e5e7eb;
        box-shadow:    0 10px 30px rgba(0,0,0,.13), 0 2px 8px rgba(0,0,0,.07);
        overflow:      hidden;
    }

    /* Arrow: upward-pointing triangle aligned to the misspelled word center */
    .spell-arrow {
        position:    absolute;
        top:         -7px;
        left:        var(--arrow-x, 50%);
        transform:   translateX(-50%);
        width:        14px;
        height:        8px;
        overflow:     hidden;
        pointer-events: none;
    }
    .spell-arrow::before {
        content:      '';
        position:     absolute;
        width:         10px;
        height:        10px;
        background:   #ffffff;
        border:       1px solid #e5e7eb;
        top:           3px;
        left:          2px;
        transform:    rotate(45deg);
        border-radius: 2px;
    }

    /* Header strip */
    .spell-header {
        padding:        8px 14px 6px;
        font-size:      14px;
        font-weight:    300;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color:          #6b7280; /* gray-400 */
        background:     #f9fafb;
        border-bottom:  1px solid #f3f4f6;
    }

    /* Suggestion buttons */
    .spell-suggestion {
        display:     block;
        width:       100%;
        text-align:  left;
        padding:     9px 14px;
        font-size:   16px;
        font-weight: 500;
        color:       #111827;
        background:  transparent;
        border:      none;
        cursor:      pointer;
        transition:  background 0.1s, color 0.1s;
        border-bottom: 1px solid #f9fafb;
    }
    .spell-suggestion:hover {
        background: #fff7ed; /* orange-50 */
        color:      #c2410c; /* orange-700 */
    }
    .spell-suggestion:last-of-type {
        border-bottom: none;
    }

    .spell-sep {
        height:     1px;
        background: #e5e7eb;
    }

    /* Ignore button */
    .spell-ignore {
        display:     flex;
        align-items: center;
        gap:         7px;
        width:       100%;
        padding:     8px 14px;
        font-size:   14px;
        color:       #6b7280; /* gray-500 */
        background:  transparent;
        border:      none;
        cursor:      pointer;
        transition:  background 0.1s, color 0.1s;
    }
    .spell-ignore:hover {
        background: #fef2f2; /* red-50 */
        color:      #dc2626; /* red-600 */
    }
</style>
