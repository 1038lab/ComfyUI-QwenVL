/**
 * ComfyUI-Minimax-H3-Promptor
 * Shared Frontend Core: Styles, Highlighting Engine, Tag Parsing, and Common Utilities.
 */

// ─── SVG Icons ─────────────────────────────────────────────────────────────────
export const SVG_COPY = `<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5.5" y="2.5" width="8" height="11" rx="1.5"/><path d="M3.5 5.5H2.5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-1"/></svg>`;
export const SVG_CHECK = `<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5l3.5 3.5 7-7"/></svg>`;
export const SVG_SPARK = `<svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M8 0a.75.75 0 0 1 .75.75v1.636a6.002 6.002 0 0 1 4.864 4.864h1.636a.75.75 0 0 1 0 1.5h-1.636a6.002 6.002 0 0 1-4.864 4.864v1.636a.75.75 0 0 1-1.5 0v-1.636A6.002 6.002 0 0 1 2.386 8.75H.75a.75.75 0 0 1 0-1.5h1.636A6.002 6.002 0 0 1 7.25 2.386V.75A.75.75 0 0 1 8 0Zm0 3.75a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"/></svg>`;
export const SVG_TAG = `<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 8.5L8.5 2.5H13.5V7.5L7.5 13.5L2.5 8.5Z"/><circle cx="10.5" cy="5.5" r="1" fill="currentColor"/></svg>`;
export const SVG_TRASH = `<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5h10M6 4.5V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M4.5 4.5v8a1.5 1.5 0 0 0 1.5 1.5h4a1.5 1.5 0 0 0 1.5-1.5v-8"/></svg>`;
export const SVG_LOCK_OPEN = `<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V4.5a2.5 2.5 0 0 1 5 0V5"/></svg>`;
export const SVG_LOCK_CLOSED = `<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V4.5a2.5 2.5 0 0 1 5 0V7"/></svg>`;
export const SVG_RESTORE = `<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="2 5 2 9 6 9"/><path d="M3.5 13a6 6 0 1 0 1.2-6.5L2 9"/></svg>`;
export const SVG_APPLY = `<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13.5 4.5 6.5 11.5 2.5 7.5"/></svg>`;
export const SVG_RETRY = `<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2v4h-4M13.8 10a5.5 5.5 0 1 1-.4-5.5L14 6"/></svg>`;

// ─── Shared Theme & Syntax Highlighting CSS ────────────────────────────────────
export function injectH3CommonStyles() {
    let style = document.getElementById("h3-common-theme-styles");
    if (!style) {
        style = document.createElement("style");
        style.id = "h3-common-theme-styles";
        document.head.appendChild(style);
    }
    style.textContent = `
      /* ── 1. Major Section Headers (Level-1 Structural Anchor: Warm Amber Charcoal Banner) ── */
      .h3t-sec-header {
        display: inline-block;
        padding: 1px 5.5px;
        margin: 4px 0 2px 0;
        border-radius: 3.5px;
        background: rgba(45, 20, 8, 0.92);
        color: #fed7aa;
        border: 1px solid rgba(217, 119, 6, 0.45);
        font-weight: 500;
        letter-spacing: 0.15px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
      }

      /* ── 2. Shots (Level-2 Subordinate Marker: Muted Matte Sand Gold) ── */
      .h3t-shot {
        display: inline-block;
        padding: 0 4.5px;
        margin: 1.5px 0;
        border-radius: 3px;
        background: rgba(202, 138, 4, 0.15);
        color: #fef08a;
        border: 1px solid rgba(234, 179, 8, 0.30);
        font-weight: 500;
        letter-spacing: 0.1px;
      }

      /* ── 3. Reference Pictures (Muted Matte Ice Cyan) ── */
      .h3t-picture {
        display: inline-block;
        padding: 0 4.5px;
        margin: 1.5px 0;
        border-radius: 3px;
        background: rgba(2, 132, 199, 0.15);
        color: #bae6fd;
        border: 1px solid rgba(56, 189, 248, 0.30);
        font-weight: 500;
      }

      /* ── 4. Subjects / Characters (Muted Matte Lavender) ── */
      .h3t-subject {
        display: inline-block;
        padding: 0 4.5px;
        margin: 1.5px 0;
        border-radius: 3px;
        background: rgba(147, 51, 234, 0.15);
        color: #e9d5ff;
        border: 1px solid rgba(168, 85, 247, 0.30);
        font-weight: 500;
      }

      /* ── 5. Reference Videos (Muted Matte Sage Mint) ── */
      .h3t-video {
        display: inline-block;
        padding: 0 4.5px;
        margin: 1.5px 0;
        border-radius: 3px;
        background: rgba(5, 150, 105, 0.15);
        color: #a7f3d0;
        border: 1px solid rgba(52, 211, 153, 0.30);
        font-weight: 500;
      }

      /* ── 6. Reference Audios (Dark Slate Charcoal Grey) ── */
      .h3t-audio {
        display: inline-block;
        padding: 0 4.5px;
        margin: 1.5px 0;
        border-radius: 3px;
        background: rgba(51, 65, 85, 0.45);
        color: #cbd5e1;
        border: 1px solid rgba(148, 163, 184, 0.35);
        font-weight: 500;
      }

      /* ── 7. Cinematic Dialogue & Voice Acting (Unified Muted Rose Badge) ── */
      .h3t-dialogue {
        display: inline-block;
        padding: 0 4.5px;
        margin: 1.5px 0;
        border-radius: 3px;
        background: rgba(225, 29, 72, 0.15);
        color: #fecdd3;
        border: 1px solid rgba(244, 63, 94, 0.30);
        font-weight: 500;
      }

      /* ── 8. Subject Shorthand Codes (Muted Slate Grey) ── */
      .h3t-sref {
        display: inline-block;
        padding: 0 3.5px;
        margin: 1.5px 0;
        border-radius: 3px;
        background: rgba(63, 63, 70, 0.30);
        color: #cbd5e1;
        border: 1px solid rgba(113, 113, 122, 0.30);
        font-weight: 500;
      }

      /* ── 9. Timestamps & Special Directives ── */
      .h3t-ts {
        color: #fef08a;
        font-weight: 500;
        letter-spacing: 0.2px;
      }
      .h3t-kept {
        color: #86efac;
        font-weight: 500;
      }
      .h3t-weak {
        color: #fca5a5;
        font-style: italic;
      }

      /* ── Shared Refine Centered Modal Overlay ── */
      .h3-refine-overlay {
        position: absolute;
        inset: 0;
        z-index: 50;
        background: rgba(8, 10, 15, 0.78);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        display: none;
        align-items: center;
        justify-content: center;
        padding: 12px 10%;
        box-sizing: border-box;
        border-radius: 7px;
        overflow: hidden;
        animation: h3FadeIn 0.15s ease-out;
      }
      .h3-refine-overlay.open {
        display: flex;
      }
      @keyframes h3FadeIn {
        from { opacity: 0; transform: scale(0.96); }
        to { opacity: 1; transform: scale(1); }
      }
      .h3-refine-card {
        width: 100%;
        max-width: 600px;
        max-height: calc(100% - 16px);
        background: #141720;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(190, 117, 101, 0.2);
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 14px 16px;
        box-sizing: border-box;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #29292e transparent;
      }
      .h3-refine-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 5px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .h3-refine-title-wrap {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .h3-refine-title {
        font-size: 12px;
        font-weight: 600;
        color: #f1f5f9;
        letter-spacing: 0.2px;
      }
      .h3-refine-close-btn {
        cursor: pointer;
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 4px;
        background: transparent;
        color: #828e9e;
        font-size: 14px;
        line-height: 1;
        transition: background 0.15s, color 0.15s;
        padding: 0;
      }
      .h3-refine-close-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }
      .h3-refine-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .h3-refine-label {
        font-size: 10.5px;
        color: #94a3b8;
        font-weight: 500;
      }
      .h3-select {
        width: 100%;
        background-color: rgba(0, 0, 0, 0.40);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 5px;
        color: #e2e8f0;
        font-family: inherit;
        font-size: 11px;
        font-weight: 500;
        padding: 5px 26px 5px 9px;
        outline: none;
        cursor: pointer;
        box-sizing: border-box;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 12px;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .h3-select:focus {
        border-color: rgba(255, 255, 255, 0.30);
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.15);
      }
      .h3-select option {
        background-color: #18181b !important;
        color: #e2e8f0 !important;
        padding: 6px 8px;
      }
      .h3-refine-preview {
        font-family: ui-monospace, SFMono-Regular, monospace;
        font-size: 11px;
        line-height: 1.6;
        color: #cbd5e1;
        background: rgba(0, 0, 0, 0.48);
        border: 1px solid rgba(255, 255, 255, 0.09);
        border-radius: 5px;
        padding: 9px 11px;
        min-height: 52px;
        max-height: 380px;
        overflow-y: auto;
        white-space: pre-wrap;
        word-break: break-word;
        box-sizing: border-box;
        scrollbar-width: thin;
        scrollbar-color: #3b4252 transparent;
        user-select: text;
      }
      .h3-refine-textarea {
        width: 100%;
        min-height: 56px;
        resize: none;
        padding: 8px 10px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 5px;
        outline: none;
        background: #181c25;
        color: #dedee1;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 11.5px;
        line-height: 1.4;
        box-sizing: border-box;
        transition: border-color 0.15s, box-shadow 0.15s;
        scrollbar-width: thin;
        scrollbar-color: #29292e transparent;
      }
      .h3-refine-textarea:focus {
        border-color: rgba(190, 117, 101, 0.55);
        box-shadow: 0 0 0 1px rgba(190, 117, 101, 0.2);
      }
      .h3-refine-textarea::placeholder {
        color: #555e6d;
      }
      .h3-refine-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 4px;
        gap: 8px;
      }
      .h3-refine-model-wrap {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
        flex: 1 1 auto;
        max-width: 290px;
      }
      .h3-refine-model-label {
        font-size: 10px;
        color: #94a3b8;
        font-weight: 500;
        white-space: nowrap;
      }
      .h3-refine-model-select {
        flex: 1 1 auto;
        min-width: 0;
        max-width: 240px;
        height: 28px;
        padding: 2px 22px 2px 7px;
        font-size: 10.5px;
      }
      .h3-refine-btn-group {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
      .h3-refine-cancel, .h3-refine-submit, .h3-refine-apply, .h3-refine-retry {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        height: 28px;
        min-width: 74px;
        padding: 0 14px;
        border-radius: 4px;
        font-size: 11.5px;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        box-sizing: border-box;
        transition: border-color 0.15s, background 0.15s, color 0.15s;
      }
      .h3-refine-cancel {
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(255, 255, 255, 0.05);
        color: #cbd5e1;
      }
      .h3-refine-cancel:hover {
        border-color: rgba(255, 255, 255, 0.25);
        background: rgba(255, 255, 255, 0.10);
        color: #ffffff;
      }
      .h3-refine-submit {
        border: 1px solid rgba(190, 117, 101, 0.45);
        background: rgba(190, 117, 101, 0.22);
        color: #fce7e1;
      }
      .h3-refine-submit:hover {
        border-color: rgba(190, 117, 101, 0.75);
        background: rgba(190, 117, 101, 0.38);
        color: #ffffff;
      }
      .h3-refine-submit:disabled {
        opacity: 0.5;
        cursor: wait;
      }
      .h3-refine-apply {
        font-weight: 600;
        border: 1px solid rgba(74, 222, 128, 0.55);
        background: rgba(34, 197, 94, 0.24);
        color: #dcfce7;
      }
      .h3-refine-apply:hover {
        border-color: rgba(74, 222, 128, 0.85);
        background: rgba(34, 197, 94, 0.40);
        color: #ffffff;
      }
      .h3-refine-retry {
        display: none;
        border: 1px solid rgba(245, 158, 11, 0.45);
        background: rgba(245, 158, 11, 0.18);
        color: #fde68a;
      }
      .h3-refine-retry:hover {
        border-color: rgba(245, 158, 11, 0.80);
        background: rgba(245, 158, 11, 0.32);
        color: #ffffff;
      }
      .h3-refine-preview.is-refined {
        border-color: rgba(74, 222, 128, 0.45);
        background: rgba(20, 50, 30, 0.50);
        color: #f0fdf4;
      }
      .h3-refine-preview.h3-loading {
        opacity: 0.38;
        filter: blur(0.6px);
        pointer-events: none;
        transition: opacity 0.2s ease, filter 0.2s ease;
      }
      @keyframes h3FlashSuccess {
        0% { border-color: rgba(74, 222, 128, 1); box-shadow: 0 0 16px rgba(74, 222, 128, 0.55); }
        50% { border-color: rgba(74, 222, 128, 0.85); box-shadow: 0 0 8px rgba(74, 222, 128, 0.30); }
        100% { border-color: rgba(74, 222, 128, 0.45); box-shadow: none; }
      }
      .h3-refine-preview.h3-flash {
        animation: h3FlashSuccess 0.85s ease-out;
      }
      .h3-btn.restore {
        border-color: rgba(202, 138, 4, 0.40);
        background: rgba(202, 138, 4, 0.18);
        color: #fef08a;
      }
      .h3-btn.restore:hover {
        border-color: rgba(202, 138, 4, 0.75);
        background: rgba(202, 138, 4, 0.32);
        color: #ffffff;
      }
      .h3-btn.restore.is-original {
        border-color: rgba(255, 255, 255, 0.15);
        background: rgba(255, 255, 255, 0.06);
        color: #94a3b8;
      }
      .h3-btn.restore.is-original:hover {
        border-color: rgba(255, 255, 255, 0.28);
        background: rgba(255, 255, 255, 0.12);
        color: #e2e8f0;
      }
      .h3-refine-status {
        font-size: 10.5px;
        color: #82828c;
        display: none;
        margin-top: 1px;
      }
      .h3-refine-status.err  { color: #f87171; }
      .h3-refine-status.ok   { color: #4ade80; }
      .h3-refine-status.busy { color: #fbbf24; }

      /* ── Shared Buttons & Toolbar Utilities ── */
      .h3-btn {
        cursor: pointer;
        height: 22px;
        padding: 0 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.05);
        color: #cbd5e1;
        font-size: 10.5px;
        font-weight: 500;
        font-family: inherit;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        transition: background 0.15s, color 0.15s, border-color 0.15s;
        user-select: none;
        white-space: nowrap;
      }
      .h3-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.22);
      }
      .h3-btn.primary {
        border-color: rgba(190, 117, 101, 0.4);
        background: rgba(190, 117, 101, 0.18);
        color: #fce7e1;
      }
      .h3-btn.primary:hover {
        border-color: rgba(190, 117, 101, 0.7);
        background: rgba(190, 117, 101, 0.3);
        color: #ffffff;
      }
      .h3-float-btn {
        cursor: pointer;
        width: 24px;
        height: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 4px;
        background: rgba(18, 22, 28, 0.85);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        color: #708092;
        transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.1s;
        padding: 0;
        box-sizing: border-box;
        outline: none;
      }
      .h3-float-btn:hover {
        background: rgba(32, 38, 48, 0.95);
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.2);
      }
      .h3-float-btn.ok {
        color: #4ade80;
        border-color: rgba(74, 222, 128, 0.4);
        background: rgba(74, 222, 128, 0.14);
      }
      .h3-icon-btn {
        cursor: pointer;
        height: 22px;
        padding: 0 6px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.04);
        color: #717c8e;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s, color 0.15s, border-color 0.15s;
        outline: none;
      }
      .h3-icon-btn:hover {
        background: rgba(255, 255, 255, 0.09);
        color: #ffffff;
      }
      .h3-icon-btn.locked {
        color: #f87171;
        border-color: rgba(248, 113, 113, 0.35);
        background: rgba(248, 113, 113, 0.12);
      }
    `;
    document.head.appendChild(style);

    // Global shortcut and paste isolation: completely blocks LiteGraph from pasting/cloning nodes when focused inside H3 editors
    if (!window._h3GlobalIsolationInstalled) {
        window._h3GlobalIsolationInstalled = true;

        const isInsideH3Editor = (el) => {
            if (!el) return false;
            return !!(el.closest?.(".h3pc-view") ||
                      el.closest?.(".h3pe-view") ||
                      el.closest?.(".h3pa-view") ||
                      el.closest?.(".mmv-prompt") ||
                      el.closest?.(".h3-refine-overlay") ||
                      el.closest?.(".h3-refine-card") ||
                      (el.isContentEditable && el.closest?.(".h3pc-view-wrap, .h3pe-view-wrap, .h3pa-view-wrap")));
        };

        // Top-level capture phase interceptor for PASTE events
        window.addEventListener("paste", (e) => {
            const active = document.activeElement;
            const target = e.target;
            if (isInsideH3Editor(active) || isInsideH3Editor(target)) {
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }, true);

        // Top-level capture phase interceptor for KEYDOWN events (Ctrl+V, Ctrl+C, Ctrl+A, Delete, etc.)
        window.addEventListener("keydown", (e) => {
            const active = document.activeElement;
            const target = e.target;
            if (isInsideH3Editor(active) || isInsideH3Editor(target)) {
                if ((e.ctrlKey || e.metaKey) && /^[vca-xz]$/i.test(e.key)) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                } else if (e.key === "Delete" || e.key === "Backspace") {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }
            }
        }, true);
    }
}

// ─── Syntax Highlighter Engine ────────────────────────────────────────────────
export const SEC_RULES = [
    { re: /^([a-z0-9_]+:)/i, cls: "h3t-sec-header" },
];

export const TOK_RULES = [
    { re: /(\[Shot\s+\d+\]|\bShot\s+\d+\b)/gi, cls: "h3t-shot" },
    { re: /(<Picture\s+\d+>)/gi,          cls: "h3t-picture"  },
    { re: /(<Subject\s+\d+>)/gi,          cls: "h3t-subject"  },
    { re: /(<Video\s+\d+>)/gi,            cls: "h3t-video"    },
    { re: /(<Audio\s+\d+>)/gi,            cls: "h3t-audio"    },
    { re: /(<d>\[[^\]]*\][\s\S]*?<\/d>|<d>[\s\S]*?<\/d>)/gi, cls: "h3t-dialogue" },
    { re: /(\(S(?:[1-9]|1\d|20)\))/gi,   cls: "h3t-sref"     },
    { re: /\b((?:At\s+)?\d{1,2}:\d{2}(?:\.\d{1,3})?)\b/gi, cls: "h3t-ts" },
    { re: /\b(fully_preserved|fully_referenced)\b/gi, cls: "h3t-kept" },
    { re: /\b(weak_reference)\b/gi,       cls: "h3t-weak"     },
];

export function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function applyInline(text) {
    const spans = [];
    for (const rule of TOK_RULES) {
        rule.re.lastIndex = 0;
        let m;
        while ((m = rule.re.exec(text)) !== null) {
            const html = rule.render ? rule.render(m) : `<span class="${rule.cls}">${esc(m[0])}</span>`;
            spans.push({ start: m.index, end: m.index + m[0].length, html });
        }
    }
    if (!spans.length) return esc(text);
    spans.sort((a, b) => a.start - b.start);
    const used = []; let cur = 0;
    for (const sp of spans) { if (sp.start >= cur) { used.push(sp); cur = sp.end; } }
    let out = "", pos = 0;
    for (const { start, end, html } of used) {
        if (start > pos) out += esc(text.slice(pos, start));
        out += html;
        pos = end;
    }
    return out + esc(text.slice(pos));
}

export function renderPrompt(text) {
    if (!text) return "";
    const lines = text.split("\n");
    const renderedLines = lines.map(line => {
        for (const { re, cls } of SEC_RULES) {
            const m = line.match(re);
            if (m) return `<span class="${cls}">${esc(m[1])}</span>${applyInline(line.slice(m[1].length))}`;
        }
        return applyInline(line);
    });
    let html = renderedLines.join("\n");
    if (text.endsWith("\n")) {
        html += "<br>";
    }
    return html;
}

// ─── Refine Extraction & Paragraph Spacing Replacement ────────────────────────
export function extractTargetInfo(text, targetKey, lastSelection = "") {
    if (!text) return null;
    const isSelection = targetKey === "__selection__";
    const isFull = targetKey === "__all__";
    const isShot = targetKey.startsWith("[Shot");
    const isSubject = /^<Subject\s+\d+>/i.test(targetKey);

    if (isSelection) {
        if (!lastSelection || !text.includes(lastSelection)) return null;
        return {
            content: lastSelection,
            preview: lastSelection,
            replace: (refined) => text.replace(lastSelection, refined)
        };
    }

    if (isFull) {
        return {
            content: text.trim(),
            preview: text.trim(),
            replace: (refined) => refined.trim()
        };
    }

    if (isSubject) {
        const subjNum = targetKey.match(/\d+/)?.[0] || "";
        const lines = text.split("\n");
        let targetLineIdx = -1;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (new RegExp(`^<Subject\\s+${subjNum}>`, "i").test(line)) {
                targetLineIdx = i;
                break;
            }
        }
        if (targetLineIdx === -1) {
            for (let i = 0; i < lines.length; i++) {
                if (new RegExp(`<Subject\\s+${subjNum}>`, "i").test(lines[i])) {
                    targetLineIdx = i;
                    break;
                }
            }
        }
        if (targetLineIdx === -1) return null;

        let endLineIdx = targetLineIdx + 1;
        while (endLineIdx < lines.length) {
            const nextL = lines[endLineIdx].trim();
            if (!nextL || /^<Subject\s+\d+>/i.test(nextL) || /^[a-z0-9_]+:/i.test(nextL) || /^\[?Shot\s+\d+/i.test(nextL)) {
                break;
            }
            endLineIdx++;
        }

        const rawBlock = lines.slice(targetLineIdx, endLineIdx).join("\n").trim();
        const m = rawBlock.match(/^(<Subject\s+\d+>(?:\s+is\s+|:\s*|\s*-\s*|\s*))([\s\S]*)$/i);
        const prefix = m ? m[1] : `<Subject ${subjNum}> is `;
        const content = m ? m[2].trim() : rawBlock;

        return {
            content: content,
            preview: content,
            replace: (refined) => {
                const before = lines.slice(0, targetLineIdx).join("\n").trimEnd();
                const afterLines = lines.slice(endLineIdx).join("\n").replace(/^\n+/, "");
                const newBlock = prefix + refined.trim();
                return (before ? before + "\n" : "") + newBlock + (afterLines ? "\n" + afterLines : "");
            }
        };
    }

    if (isShot) {
        const shotNum = targetKey.match(/\d+/)?.[0] || "";
        const lines = text.split("\n");
        let startLine = -1;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (new RegExp(`^\\[?Shot\\s+${shotNum}\\b`, "i").test(line)) {
                startLine = i;
                break;
            }
        }
        if (startLine === -1) return null;

        let endLine = lines.length;
        for (let i = startLine + 1; i < lines.length; i++) {
            const l = lines[i].trim();
            if (/^\[?Shot\s+\d+/i.test(l) || /^[a-z0-9_]+:/i.test(l)) {
                endLine = i;
                break;
            }
        }

        const shotFullText = lines.slice(startLine, endLine).join("\n").trim();
        let content = shotFullText;
        let prefix = `[Shot ${shotNum}] `;

        // Freeze and isolate complete shot headers (e.g. "[Shot 1: 00:00.000 – 00:02.800] ", "[Shot 1]: ")
        const shotHeaderMatch = shotFullText.match(/^(\[Shot\s+\d+(?::\s*[^\]]+)?\]\s*:?\s*|Shot\s+\d+[^:\n]*:\s*)/i);
        if (shotHeaderMatch) {
            prefix = shotHeaderMatch[1];
            content = shotFullText.slice(prefix.length).trim();
        }

        return {
            content: content,
            preview: content,
            replace: (refined) => {
                const before = lines.slice(0, startLine).join("\n").trimEnd();
                const afterLines = lines.slice(endLine).join("\n").replace(/^\n+/, "");
                const newShotBlock = prefix + refined.trim();
                const beforeSep = (before && /:$/.test(before)) ? "\n" : "\n\n";
                const afterSep = afterLines ? "\n\n" : "";
                return (before ? before + beforeSep : "") + newShotBlock + afterSep + afterLines;
            }
        };
    }

    // Named section (e.g. overall_soundscape, etc.)
    const lines = text.split("\n");
    let sStart = -1, sEnd = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().toLowerCase().startsWith(targetKey.toLowerCase() + ":")) {
            sStart = i;
            continue;
        }
        if (sStart >= 0 && i > sStart && /^[a-z0-9_]+:/i.test(lines[i].trim())) {
            sEnd = i;
            break;
        }
    }
    if (sStart === -1) return null;
    if (sEnd === -1) sEnd = lines.length;

    const sectionContent = lines.slice(sStart + 1, sEnd).join("\n").trim();
    return {
        content: sectionContent,
        preview: sectionContent,
        replace: (refined) => {
            const before = lines.slice(0, sStart + 1).join("\n").trimEnd();
            const afterLines = lines.slice(sEnd).join("\n").replace(/^\n+/, "");
            const afterSep = afterLines ? "\n\n" : "";
            return before + "\n" + refined.trim() + afterSep + afterLines;
        }
    };
}

// ─── DOM & Caret Helpers ───────────────────────────────────────────────────────
export function getCaretOffset(el) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return 0;
    const r = sel.getRangeAt(0).cloneRange();
    r.selectNodeContents(el);
    r.setEnd(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset);
    return r.toString().length;
}

export function setCaretOffset(el, offset) {
    const sel = window.getSelection();
    const range = document.createRange();
    let rem = offset, found = false;
    function walk(node) {
        if (found) return;
        if (node.nodeType === 3) {
            if (rem <= node.length) { range.setStart(node, rem); range.collapse(true); found = true; }
            else rem -= node.length;
        } else for (const c of node.childNodes) walk(c);
    }
    walk(el);
    if (!found) { range.selectNodeContents(el); range.collapse(false); }
    sel.removeAllRanges(); sel.addRange(range);
}

export function getPlainText(el) {
    return (el ? el.innerText : "").replace(/\r\n/g, "\n");
}

export function hideWidget(w) {
    if (!w) return;
    w.hidden = true;
    w.type = "hidden";
    w.options = w.options || {};
    w.options.hidden = true;
    w.computeSize = () => [0, -4];
    w.draw = () => {};
}

export function countWords(str) {
    return String(str || "").trim().match(/\S+/gu)?.length || 0;
}

// ─── Reusable Refine Modal Controller ─────────────────────────────────────────
export function createH3RefineModal({ parentEl, getPlainText, onApply }) {
    const refineOverlay = document.createElement("div");
    refineOverlay.className = "h3-refine-overlay";

    const refineCard = document.createElement("div");
    refineCard.className = "h3-refine-card";

    // Header
    const refineHeader = document.createElement("div");
    refineHeader.className = "h3-refine-header";
    const refineTitleWrap = document.createElement("div");
    refineTitleWrap.className = "h3-refine-title-wrap";
    refineTitleWrap.innerHTML = `${SVG_SPARK} <span class="h3-refine-title">Refine Prompt with AI</span>`;
    const closeBtn = document.createElement("button");
    closeBtn.className = "h3-refine-close-btn";
    closeBtn.type = "button";
    closeBtn.title = "Close (Esc)";
    closeBtn.innerHTML = "✕";
    refineHeader.appendChild(refineTitleWrap);
    refineHeader.appendChild(closeBtn);
    refineCard.appendChild(refineHeader);

    // Section selector row
    const scopeRow = document.createElement("div");
    scopeRow.className = "h3-refine-row";
    const scopeLabel = document.createElement("span");
    scopeLabel.className = "h3-refine-label";
    scopeLabel.textContent = "Target Section or Selection:";
    const sectionSel = document.createElement("select");
    sectionSel.className = "h3-select";
    scopeRow.appendChild(scopeLabel);
    scopeRow.appendChild(sectionSel);
    refineCard.appendChild(scopeRow);

    // Preview
    const previewBox = document.createElement("div");
    previewBox.className = "h3-refine-preview";
    previewBox.title = "Preview of the content to be refined";
    refineCard.appendChild(previewBox);

    // Instructions row
    const instrRow = document.createElement("div");
    instrRow.className = "h3-refine-row";
    const instrLabel = document.createElement("span");
    instrLabel.className = "h3-refine-label";
    instrLabel.textContent = "Refinement Instructions:";
    const instrArea = document.createElement("textarea");
    instrArea.className = "h3-refine-textarea";
    instrArea.placeholder = "Describe desired adjustments (e.g., slow cinematic pan, warmer sunset lighting, add atmospheric sounds)...";
    instrArea.rows = 2;
    instrRow.appendChild(instrLabel);
    instrRow.appendChild(instrArea);
    refineCard.appendChild(instrRow);

    // Status
    const refineStatus = document.createElement("div");
    refineStatus.className = "h3-refine-status";
    refineCard.appendChild(refineStatus);

    // Actions
    const refineActions = document.createElement("div");
    refineActions.className = "h3-refine-actions";

    const modelWrap = document.createElement("div");
    modelWrap.className = "h3-refine-model-wrap";
    const modelLabel = document.createElement("span");
    modelLabel.className = "h3-refine-model-label";
    modelLabel.textContent = "Model:";
    const modelSelect = document.createElement("select");
    modelSelect.className = "h3-select h3-refine-model-select";
    modelSelect.title = "Select LLM Provider for prompt refinement";
    modelWrap.appendChild(modelLabel);
    modelWrap.appendChild(modelSelect);

    const btnGroup = document.createElement("div");
    btnGroup.className = "h3-refine-btn-group";
    const cancelBtn = document.createElement("button");
    cancelBtn.className = "h3-refine-cancel";
    cancelBtn.type = "button";
    cancelBtn.textContent = "Cancel";
    const retryBtn = document.createElement("button");
    retryBtn.className = "h3-refine-retry";
    retryBtn.type = "button";
    retryBtn.title = "Refine again with current instruction";
    retryBtn.innerHTML = `${SVG_RETRY} Retry`;
    const submitBtn = document.createElement("button");
    submitBtn.className = "h3-refine-submit";
    submitBtn.type = "button";
    submitBtn.innerHTML = `${SVG_SPARK} Refine`;

    btnGroup.appendChild(cancelBtn);
    btnGroup.appendChild(retryBtn);
    btnGroup.appendChild(submitBtn);
    refineActions.appendChild(modelWrap);
    refineActions.appendChild(btnGroup);
    refineCard.appendChild(refineActions);

    refineOverlay.appendChild(refineCard);
    parentEl.appendChild(refineOverlay);

    let lastSelectedText = "";
    let lastRefinedResult = null;
    let lastTargetInfo = null;

    function updatePreviewSnippet() {
        const plainText = getPlainText();
        const targetKey = sectionSel.value;
        const targetInfo = extractTargetInfo(plainText, targetKey, lastSelectedText);
        if (targetInfo && targetInfo.preview) {
            previewBox.textContent = targetInfo.preview;
        } else if (targetKey === "__selection__") {
            previewBox.textContent = lastSelectedText || "(No selection)";
        } else {
            previewBox.textContent = `(${targetKey} content not found)`;
        }
    }

    function populateSectionOptions() {
        const plainText = getPlainText();
        sectionSel.innerHTML = "";
        const options = [];

        if (lastSelectedText && lastSelectedText.trim().length > 3) {
            const preview = lastSelectedText.trim().slice(0, 20).replace(/\n/g, " ");
            options.push({
                key: "__selection__",
                label: `📝 Current Selection ("${preview}…")`
            });
        }

        options.push({
            key: "__all__",
            label: "🌟 Entire Prompt"
        });

        const subjMatches = plainText.match(/<Subject\s+\d+>/gi);
        if (subjMatches) {
            const uniqueSubjs = [...new Set(subjMatches.map(s => s.trim()))];
            for (const subjTag of uniqueSubjs) {
                options.push({
                    key: subjTag,
                    label: `👤 ${subjTag}`
                });
            }
        }

        const shotMatches = plainText.match(/(?:^|\n)\s*\[?Shot\s+\d+/gi);
        if (shotMatches) {
            const shotNums = shotMatches.map(s => s.match(/\d+/)?.[0]).filter(Boolean);
            const uniqueShots = [...new Set(shotNums)].map(n => `[Shot ${n}]`);
            for (const shotTag of uniqueShots) {
                options.push({
                    key: shotTag,
                    label: `🎬 ${shotTag}`
                });
            }
        }

        const lines = plainText.split("\n");
        const foundHeaders = new Set();
        for (const line of lines) {
            const m = line.trim().match(/^([a-z0-9_]+):/i);
            if (m) {
                const headerKey = m[1].toLowerCase();
                if (headerKey === "subject_definitions") continue;
                if (!foundHeaders.has(headerKey)) {
                    foundHeaders.add(headerKey);
                    options.push({
                        key: headerKey,
                        label: `📑 ${m[1]}`
                    });
                }
            }
        }

        options.forEach(opt => {
            const el = document.createElement("option");
            el.value = opt.key;
            el.textContent = opt.label;
            sectionSel.appendChild(el);
        });

        if (lastSelectedText && lastSelectedText.trim().length > 3) {
            sectionSel.value = "__selection__";
        } else if (foundHeaders.has("integrated_multimodal_description")) {
            sectionSel.value = "integrated_multimodal_description";
        } else if (options.length > 1) {
            sectionSel.value = options[1].key;
        } else {
            sectionSel.value = "__all__";
        }

        updatePreviewSnippet();
    }

    sectionSel.addEventListener("change", resetRefineModalUI);

    async function populateModelOptions() {
        modelSelect.innerHTML = "";
        try {
            const resp = await fetch(`/minimax-h3/get_config?t=${Date.now()}`, { cache: "no-store" });
            if (resp.ok) {
                const config = await resp.json();
                const def = config.defaults?.promptor_provider || "";
                const providers = config.providers || {};
                let foundDefault = false;

                for (const [key, p] of Object.entries(providers)) {
                    if (p && p.enabled !== false) {
                        const opt = document.createElement("option");
                        opt.value = key;
                        const pName = p.name || p.type || key;
                        const pModel = p.model ? ` (${p.model})` : "";
                        opt.textContent = `${pName}${pModel}`;
                        if (key === def) {
                            opt.selected = true;
                            foundDefault = true;
                        }
                        modelSelect.appendChild(opt);
                    }
                }
                if (!foundDefault && modelSelect.options.length > 0) {
                    modelSelect.selectedIndex = 0;
                }
            }
        } catch (e) {
            console.error("[H3 Refine] Failed to load models:", e);
        }
        if (modelSelect.children.length === 0) {
            const opt = document.createElement("option");
            opt.value = "";
            opt.textContent = "No enabled models";
            modelSelect.appendChild(opt);
        }
    }

    function resetRefineModalUI() {
        lastRefinedResult = null;
        lastTargetInfo = null;
        previewBox.classList.remove("is-refined");
        updatePreviewSnippet();
        cancelBtn.textContent = "Cancel";
        retryBtn.style.display = "none";
        submitBtn.className = "h3-refine-submit";
        submitBtn.innerHTML = `${SVG_SPARK} Refine`;
        submitBtn.disabled = false;
        refineStatus.style.display = "none";
        refineStatus.textContent = "";
    }

    function open(selectionText = "") {
        lastSelectedText = (selectionText || "").trim();
        refineOverlay.classList.add("open");
        refineStatus.textContent = "";
        refineStatus.style.display = "none";
        populateSectionOptions();
        populateModelOptions();
        resetRefineModalUI();
        instrArea.focus();
    }

    function close() {
        refineOverlay.classList.remove("open");
        refineStatus.textContent = "";
        refineStatus.style.display = "none";
        lastSelectedText = "";
        resetRefineModalUI();
    }

    closeBtn.addEventListener("click", close);

    cancelBtn.addEventListener("click", () => {
        if (lastRefinedResult !== null) {
            resetRefineModalUI();
            refineStatus.style.display = "block";
            refineStatus.className = "h3-refine-status";
            refineStatus.textContent = "Restored original preview text.";
            setTimeout(() => {
                if (refineStatus.textContent === "Restored original preview text.") {
                    refineStatus.style.display = "none";
                }
            }, 1800);
        } else {
            close();
        }
    });
    retryBtn.addEventListener("click", () => {
        executeRefine(true);
    });

    instrArea.addEventListener("input", () => {
        if (submitBtn.classList.contains("h3-refine-apply")) {
            submitBtn.className = "h3-refine-submit";
            submitBtn.innerHTML = `${SVG_SPARK} Refine`;
            cancelBtn.textContent = "Cancel";
            retryBtn.style.display = "none";
        }
    });

    function applyRefinedResult() {
        if (lastRefinedResult && lastTargetInfo) {
            const plainText = getPlainText();
            const prevSnapshot = plainText;
            const newText = lastTargetInfo.replace(lastRefinedResult);
            if (typeof onApply === "function") {
                onApply(newText, prevSnapshot);
            }
            close();
        }
    }

    async function executeRefine(isRetry = false) {
        const plainText = getPlainText();
        const targetKey = sectionSel.value;
        const targetInfo = extractTargetInfo(plainText, targetKey, lastSelectedText);

        if (!targetInfo || !targetInfo.content) {
            refineStatus.style.display = "block";
            refineStatus.className = "h3-refine-status err";
            refineStatus.textContent = "Selected section/shot content not found.";
            return;
        }

        refineStatus.style.display = "block";
        refineStatus.className = "h3-refine-status busy";
        refineStatus.textContent = isRetry ? "Regenerating fresh variation with AI…" : "Refining prompt with AI…";
        submitBtn.disabled = true;
        retryBtn.disabled = true;
        if (isRetry) {
            retryBtn.innerHTML = `${SVG_SPARK} Retrying...`;
        }
        previewBox.classList.add("h3-loading");

        try {
            const resp = await fetch("/minimax-h3/refine_section", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    section_name: targetKey === "__all__" ? "entire_prompt" : targetKey,
                    section_content: targetInfo.content,
                    instruction: instrArea.value.trim(),
                    provider_key: modelSelect.value || "",
                    is_retry: isRetry,
                    timestamp: Date.now()
                }),
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            if (data.status === "success" && data.refined) {
                lastRefinedResult = data.refined;
                lastTargetInfo = targetInfo;
                previewBox.textContent = data.refined;
                previewBox.classList.remove("h3-loading");
                previewBox.classList.add("is-refined");
                previewBox.classList.add("h3-flash");
                setTimeout(() => previewBox.classList.remove("h3-flash"), 900);
                refineStatus.className = "h3-refine-status ok";
                refineStatus.textContent = "✓ Previewing refined result. Click Apply to write to node, Retry to try again, or Discard.";
                cancelBtn.textContent = "Discard";
                retryBtn.style.display = "inline-flex";
                retryBtn.innerHTML = `${SVG_RETRY} Retry`;
                submitBtn.className = "h3-refine-apply";
                submitBtn.innerHTML = `${SVG_APPLY} Apply`;
            } else {
                throw new Error(data.message || "Unknown refinement error");
            }
        } catch (err) {
            previewBox.classList.remove("h3-loading");
            refineStatus.style.display = "block";
            refineStatus.className = "h3-refine-status err";
            refineStatus.textContent = `Error: ${err.message}`;
            retryBtn.innerHTML = `${SVG_RETRY} Retry`;
        } finally {
            submitBtn.disabled = false;
            retryBtn.disabled = false;
        }
    }

    submitBtn.addEventListener("click", () => {
        if (submitBtn.classList.contains("h3-refine-apply")) {
            applyRefinedResult();
        } else {
            executeRefine();
        }
    });

    refineOverlay.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            if (submitBtn.classList.contains("h3-refine-apply")) {
                applyRefinedResult();
            } else {
                executeRefine();
            }
        } else if (e.key === "Escape") {
            e.preventDefault();
            close();
        }
    });

    return {
        open,
        close,
        overlayEl: refineOverlay
    };
}

