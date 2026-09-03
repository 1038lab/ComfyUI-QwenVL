import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";
import {
    injectH3CommonStyles,
    SVG_COPY,
    SVG_CHECK,
    SVG_SPARK,
    SVG_TAG,
    SVG_TRASH,
    SVG_RESTORE,
    SVG_APPLY,
    renderPrompt,
    extractTargetInfo,
    getCaretOffset,
    setCaretOffset,
    getPlainText,
    hideWidget,
    countWords,
    esc,
    createH3RefineModal
} from "./prompt_common.js?v=1.6.8";

const NODE_NAME = "H3_PromptComposer";
const NODE_WIDTH = 540;
const NODE_MIN_WIDTH = 420;
const NODE_MIN_HEIGHT = 240;

// Ensure common styles are injected once
injectH3CommonStyles();

// Standard MiniMax H3 Templates for each Mode
const TEMPLATES = {
    "T2VA (Text to Video & Audio)": `integrated_multimodal_description:
[Shot 1] Cinematic, live-action medium shot. A gentle morning breeze moves across the scene with soft, natural lighting.

[Shot 2] Slow tracking movement reveals detailed subject interactions with the surrounding environment.

overall_soundscape:
The ambient sounds of tranquil nature and quiet introspection, with subtle environmental rustles.

non_diegetic_music:
A gentle, cinematic acoustic score that complements the peaceful theme.`,

    "I2VA (Image to Video & Audio)": `For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description:
[Shot 1] The scene begins exactly matching the composition, lighting, and subject of <Picture 1>. Subtle character movement begins with natural breathing and gentle eye motion.

[Shot 2] The camera slowly pulls back, revealing broader environmental context while maintaining character continuity.

overall_soundscape:
Ambient environmental audio matching the scene setting with soft diegetic action details.

non_diegetic_music:
Subtle, atmospheric cinematic underscore.`,

    "FL2VA (First & Last Frame)": `How the reference pictures align with the target video — <Picture 1> (from [Shot 1]) aligns with the 0.00-second mark of the target video; <Picture 2> (from [Shot 2]) aligns with the 5.00-second mark of the target video.

integrated_multimodal_description:
[Shot 1] Begins from the exact composition of <Picture 1>, transitioning smoothly through continuous organic motion.

[Shot 2] Concludes by settling seamlessly into the precise framing and lighting of <Picture 2>.

overall_soundscape:
Continuous ambient sound design that bridges the motion progression smoothly.

non_diegetic_music:
Elevating cinematic background score.`,

    "Ref2VA (Omni / Reference)": `How the reference pictures align with the target video — <Picture 1> (from [Shot 1]) aligns with the 0.00-second mark of the target video.

integrated_multimodal_description:
[Shot 1] The character featuring the identity and clothing of <Picture 1> engages naturally with the environment under cinematic lighting.

[Shot 2] Dynamic camera motion frames the action, emphasizing emotional resonance.

overall_soundscape:
Rich environmental acoustics with realistic foley footsteps and wind.

non_diegetic_music:
Emotional, narrative-driven instrumental music.`,

    "V2VA (Video to Video)": `integrated_multimodal_description:
[Shot 1] Following the reference video timing, cinematic live-action motion is maintained with refined visual fidelity and expressive details.

overall_soundscape:
Synchronized diegetic sound effects matching the on-screen physical motions.

non_diegetic_music:
Rhythmic background score.`,

    "L2VA (Live Action / Extended)": `integrated_multimodal_description:
[Shot 1] Extended continuous long take establishing deep spatial atmosphere and slow, purposeful character interaction.

overall_soundscape:
Deep, immersive ambient nature soundscape.

non_diegetic_music:
Minimalist ambient soundtrack.`,

    "A2V (Audio to Video)": `integrated_multimodal_description:
[Shot 1] Visual choreography precisely synchronized to the rhythmic beats and vocal delivery of <Audio 1>.

overall_soundscape:
Preserves the master timing and vocal track of <Audio 1> with complementary environmental sound design.

non_diegetic_music:
Driven by <Audio 1>.`,

    "Custom / Blank": `integrated_multimodal_description:
[Shot 1] Write shot description here...

overall_soundscape:
[Ambience and sound effects]

non_diegetic_music:
[Background music description]`
};

// Autocomplete items with standard syntax and automatic newlines/scaffolding
const TAG_SUGGESTIONS = [
    { label: "<Picture 1>", insert: "<Picture 1>" },
    { label: "<Picture 2>", insert: "<Picture 2>" },
    { label: "<Picture 3>", insert: "<Picture 3>" },
    { label: "<Picture 4>", insert: "<Picture 4>" },
    { label: "[Shot 1]", insert: "[Shot 1] " },
    { label: "[Shot 2]", insert: "[Shot 2] " },
    { label: "[Shot 3]", insert: "[Shot 3] " },
    { label: "[Shot 4]", insert: "[Shot 4] " },
    { label: "<Subject 1>", insert: "<Subject 1>" },
    { label: "<Subject 2>", insert: "<Subject 2>" },
    { label: "<Video 1>", insert: "<Video 1>" },
    { label: "<Audio 1>", insert: "<Audio 1>" },
    { 
        label: "integrated_multimodal_description:", 
        type: "section",
        insert: "integrated_multimodal_description:\n[Shot 1] Cinematic, live-action shot with natural lighting." 
    },
    { 
        label: "overall_soundscape:", 
        type: "section",
        insert: "overall_soundscape:\nThe ambient sounds of tranquil nature and subtle environmental rustles." 
    },
    { 
        label: "non_diegetic_music:", 
        type: "section",
        insert: "non_diegetic_music:\nA gentle, traditional score that complements the peaceful, historical, and elegant theme." 
    },
    { 
        label: "subject_definitions:", 
        type: "section",
        insert: "subject_definitions:\n<Subject 1> is the character in <Picture 1>." 
    },
    { label: "(S1)", insert: "(S1)" },
    { label: "(S2)", insert: "(S2)" },
    { label: '<d>[EN] "..."</d>', insert: '<d>[EN] "..."</d>' },
];

// Node-specific CSS rules
const _composerStyle = document.createElement("style");
_composerStyle.textContent = `
  .h3pc-root {
    width: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 11.5px;
    color: #dedee1;
    padding: 2px 4px 6px;
    gap: 5px;
  }
  .h3pc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding: 2px 2px 4px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    flex-shrink: 0;
  }
  .h3pc-header-left {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
  .h3pc-header-right {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
  .h3pc-mode-label {
    font-size: 10.5px;
    color: #94a3b8;
    font-weight: 500;
    white-space: nowrap;
  }
  .h3pc-mode-select {
    max-width: 250px;
    text-overflow: ellipsis;
  }
  .h3pc-view-wrap {
    position: relative;
    width: 100%;
    flex: 1 1 0;
    min-height: 90px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }
  .h3pc-view {
    width: 100%;
    height: 100%;
    flex: 1 1 0;
    min-height: 90px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 7px;
    background: rgba(0, 0, 0, 0.58);
    box-sizing: border-box;
    padding: 10px 12px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #29292e transparent;
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
    font-size: 11.5px;
    line-height: 1.85;
    white-space: pre-wrap;
    word-break: break-word;
    outline: none;
    caret-color: #f1f5f9;
    user-select: text;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .h3pc-view:empty::before {
    content: "Type @, <, or [ to insert tags, or select a mode above…";
    color: #434c59;
    font-style: italic;
    pointer-events: none;
  }
  .h3pc-view:focus {
    border-color: rgba(190, 117, 101, 0.5);
    box-shadow: 0 0 0 1px rgba(190, 117, 101, 0.15);
  }
  .h3pc-float-actions {
    position: absolute;
    top: 8px;
    right: 14px;
    display: flex;
    align-items: center;
    gap: 4px;
    z-index: 10;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.18s ease, transform 0.18s ease;
    transform: scale(0.92);
  }
  .h3pc-view-wrap:hover .h3pc-float-actions,
  .h3pc-float-actions:focus-within {
    opacity: 1;
    pointer-events: auto;
    transform: scale(1);
  }
  .h3pc-autocomplete-popup {
    position: absolute;
    z-index: 60;
    background: #141720;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(190, 117, 101, 0.25);
    width: 280px;
    max-height: 190px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #3b4252 transparent;
    display: none;
    flex-direction: column;
    padding: 4px;
    box-sizing: border-box;
  }
  .h3pc-autocomplete-popup.open {
    display: flex;
  }
  .h3pc-autocomplete-item {
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 5px 8px;
    border-radius: 4px;
    font-size: 11px;
    color: #e2e8f0;
    transition: background 0.1s, color 0.1s;
    user-select: none;
  }
  .h3pc-autocomplete-item:hover,
  .h3pc-autocomplete-item.active {
    background: rgba(190, 117, 101, 0.25);
    color: #ffffff;
  }
  .h3pc-ac-label {
    font-weight: 500;
    font-family: ui-monospace, SFMono-Regular, monospace;
    color: #fce7e1;
    word-break: break-all;
  }
  .h3pc-toolbar {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 3px 2px 2px;
    flex-shrink: 0;
    width: 100%;
    box-sizing: border-box;
  }
  .h3pc-toolbar-left {
    justify-self: start;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .h3pc-toolbar-mid {
    justify-self: center;
    text-align: center;
    font-size: 11px;
    color: #717c8e;
    letter-spacing: 0.2px;
    white-space: nowrap;
    user-select: none;
    line-height: 1;
  }
  .h3pc-toolbar-mid.over {
    color: #f87171;
    font-weight: 600;
  }
  .h3pc-toolbar-right {
    justify-self: end;
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;
document.head.appendChild(_composerStyle);

function createComposerPanel(node) {
    if (typeof node.addDOMWidget !== "function") return false;

    const root = document.createElement("div");
    root.className = "h3pc-root";

    // ── 1. Header Controls ──
    const header = document.createElement("div");
    header.className = "h3pc-header";

    const headerLeft = document.createElement("div");
    headerLeft.className = "h3pc-header-left";
    const modeLbl = document.createElement("span");
    modeLbl.className = "h3pc-mode-label";
    modeLbl.textContent = "Mode:";
    const modeSel = document.createElement("select");
    modeSel.className = "h3-select h3pc-mode-select";

    const modes = [
        { key: "T2VA (Text to Video & Audio)", label: "T2V / T2VA (Text to Video)" },
        { key: "I2VA (Image to Video & Audio)", label: "I2V / I2VA (Image to Video)" },
        { key: "FL2VA (First & Last Frame)", label: "FL2VA (First & Last Frame)" },
        { key: "Ref2VA (Omni / Reference)", label: "Ref2VA (Omni / Reference)" },
        { key: "V2VA (Video to Video)", label: "V2V / V2VA (Video to Video)" },
        { key: "L2VA (Live Action / Extended)", label: "L2VA (Live Action / Extended)" },
        { key: "A2V (Audio to Video)", label: "A2V (Audio to Video)" },
        { key: "Custom / Blank", label: "Custom / Blank" },
    ];
    modes.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.key;
        opt.textContent = m.label;
        modeSel.appendChild(opt);
    });

    headerLeft.appendChild(modeLbl);
    headerLeft.appendChild(modeSel);

    const headerRight = document.createElement("div");
    headerRight.className = "h3pc-header-right";

    const tagBtn = document.createElement("button");
    tagBtn.className = "h3-btn";
    tagBtn.type = "button";
    tagBtn.title = "Insert Reference Tag or Section Header at cursor";
    tagBtn.innerHTML = `${SVG_TAG} +Tag`;

    headerRight.appendChild(tagBtn);
    header.appendChild(headerLeft);
    header.appendChild(headerRight);
    root.appendChild(header);

    // ── 2. View Wrap (Editor + Floating Actions + Autocomplete + Refine Modal) ──
    const viewWrap = document.createElement("div");
    viewWrap.className = "h3pc-view-wrap";

    const view = document.createElement("div");
    view.className = "h3pc-view";
    view.contentEditable = "true";
    view.spellcheck = false;
    view.setAttribute("autocorrect", "off");
    view.setAttribute("data-gramm", "false");
    viewWrap.appendChild(view);

    // Floating Copy Button
    const floatActions = document.createElement("div");
    floatActions.className = "h3pc-float-actions";
    const copyBtn = document.createElement("button");
    copyBtn.className = "h3-float-btn";
    copyBtn.type = "button";
    copyBtn.title = "Copy prompt to clipboard";
    copyBtn.innerHTML = SVG_COPY;
    floatActions.appendChild(copyBtn);
    viewWrap.appendChild(floatActions);

    // Smart Autocomplete Popup
    const acPopup = document.createElement("div");
    acPopup.className = "h3pc-autocomplete-popup";
    viewWrap.appendChild(acPopup);

    root.appendChild(viewWrap);

    // ── 3. Bottom Toolbar ──
    const toolbar = document.createElement("div");
    toolbar.className = "h3pc-toolbar";

    const leftGroup = document.createElement("div");
    leftGroup.className = "h3pc-toolbar-left";
    const refineBtn = document.createElement("button");
    refineBtn.className = "h3-btn primary";
    refineBtn.type = "button";
    refineBtn.title = "Refine prompt with AI";
    refineBtn.innerHTML = `${SVG_SPARK} Refine`;
    leftGroup.appendChild(refineBtn);

    const restoreBtn = document.createElement("button");
    restoreBtn.className = "h3-btn restore";
    restoreBtn.type = "button";
    restoreBtn.style.display = "none";
    leftGroup.appendChild(restoreBtn);

    const statsEl = document.createElement("div");
    statsEl.className = "h3pc-toolbar-mid";
    statsEl.textContent = "0 characters · 0 words";

    const rightGroup = document.createElement("div");
    rightGroup.className = "h3pc-toolbar-right";
    const clearBtn = document.createElement("button");
    clearBtn.className = "h3-btn";
    clearBtn.type = "button";
    clearBtn.title = "Clear prompt editor";
    clearBtn.innerHTML = `${SVG_TRASH} Clear`;
    rightGroup.appendChild(clearBtn);

    toolbar.appendChild(leftGroup);
    toolbar.appendChild(statsEl);
    toolbar.appendChild(rightGroup);
    root.appendChild(toolbar);

    // ── State ──
    let plainText = "";
    let acActiveIdx = 0;
    let acFilteredList = [];
    let acTriggerPos = -1;
    let lastCaretPos = 0;
    let restoreSnapshot = null;

    const storedWidget = () => node.widgets?.find(w => w.name === "_composer_prompt");
    const modeWidget = () => node.widgets?.find(w => w.name === "mode");

    function updateStats() {
        const ch = plainText.length;
        const wd = countWords(plainText);
        statsEl.textContent = `${ch.toLocaleString()} characters · ${wd.toLocaleString()} words`;
        statsEl.className = "h3pc-toolbar-mid" + (ch > 7000 ? " over" : "");
    }

    function renderView(restoreCaret = false) {
        const off = restoreCaret ? getCaretOffset(view) : -1;
        view.innerHTML = renderPrompt(plainText);
        if (restoreCaret && off >= 0) {
            lastCaretPos = off;
            setCaretOffset(view, off);
        }
        updateStats();
    }

    function syncWidget() {
        const w = storedWidget();
        if (w) {
            w.value = plainText;
            if (typeof w.callback === "function") w.callback(plainText);
        }
    }

    function setValue(text) {
        plainText = (text == null) ? "" : String(text);
        renderView(false);
        syncWidget();
    }

    function syncLayout() {
        if (!node.size) return;
        const lastY = domWidget?.last_y || 36;
        const totalAvail = Math.max(160, node.size[1] - lastY - 8);
        const h = totalAvail + "px";
        if (root.style.height !== h) root.style.height = h;
    }

    function updateCaretPos() {
        lastCaretPos = getCaretOffset(view);
    }

    // ── Autocomplete Logic ──
    acPopup.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    function showAutocomplete(filter = "", x = 14, y = 30) {
        const query = filter.toLowerCase().replace(/^[@<\[]/, "").trim();
        acFilteredList = TAG_SUGGESTIONS.filter(item =>
            !query ||
            item.label.toLowerCase().includes(query)
        );

        if (!acFilteredList.length) {
            hideAutocomplete();
            return;
        }

        acPopup.innerHTML = "";
        acActiveIdx = 0;

        acFilteredList.forEach((item, idx) => {
            const el = document.createElement("div");
            el.className = "h3pc-autocomplete-item" + (idx === 0 ? " active" : "");
            el.innerHTML = `<span class="h3pc-ac-label">${esc(item.label)}</span>`;
            el.addEventListener("mousedown", (e) => {
                e.preventDefault();
                e.stopPropagation();
                insertAutocompleteTag(item);
            });
            acPopup.appendChild(el);
        });

        acPopup.style.left = `${Math.min(x, 240)}px`;
        acPopup.style.top = `${Math.min(y, 140)}px`;
        acPopup.classList.add("open");
    }

    function hideAutocomplete() {
        acPopup.classList.remove("open");
        acTriggerPos = -1;
    }

    function insertAutocompleteTag(item) {
        const isSection = (typeof item === "object" && item.type === "section");
        const insertText = (typeof item === "object") ? item.insert : String(item);

        let startPos = lastCaretPos;
        let endPos = lastCaretPos;

        if (acTriggerPos >= 0 && acTriggerPos <= lastCaretPos) {
            startPos = acTriggerPos;
            endPos = lastCaretPos;
        }

        const before = plainText.slice(0, startPos);
        const after = plainText.slice(endPos);

        let finalInsert = insertText;

        if (isSection) {
            let prefix = "";
            if (before.length > 0) {
                if (before.endsWith("\n\n")) prefix = "";
                else if (before.endsWith("\n")) prefix = "\n";
                else prefix = "\n\n";
            }
            let suffix = "";
            if (after.length > 0) {
                if (after.startsWith("\n\n")) suffix = "";
                else if (after.startsWith("\n")) suffix = "\n";
                else suffix = "\n\n";
            } else {
                suffix = "\n\n";
            }
            finalInsert = prefix + insertText + suffix;
        }

        plainText = before + finalInsert + after;
        renderView(false);
        const newPos = before.length + finalInsert.length;
        lastCaretPos = newPos;
        setCaretOffset(view, newPos);
        syncWidget();
        hideAutocomplete();
        view.focus();
    }

    document.addEventListener("mousedown", (e) => {
        if (!acPopup.contains(e.target) && e.target !== view && !tagBtn.contains(e.target)) {
            hideAutocomplete();
        }
    });

    // ── Editor Events ──
    view.addEventListener("keyup", (e) => {
        e.stopPropagation();
        updateCaretPos();
    });
    view.addEventListener("paste", (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        const text = e.clipboardData?.getData("text/plain") || "";
        document.execCommand("insertText", false, text);
    }, true);
    view.addEventListener("mouseup", updateCaretPos);
    view.addEventListener("touchend", updateCaretPos);

    view.addEventListener("input", () => {
        plainText = getPlainText(view);
        updateCaretPos();
        updateStats();
        syncWidget();

        const caret = lastCaretPos;
        const textBeforeCaret = plainText.slice(0, caret);
        const atMatch = textBeforeCaret.match(/([@<\[])([a-zA-Z0-9_ -]*)$/);

        if (atMatch) {
            acTriggerPos = caret - atMatch[0].length;
            showAutocomplete(atMatch[0], 16, 26);
        } else {
            hideAutocomplete();
        }
    });

    view.addEventListener("keydown", (e) => {
        e.stopPropagation();
        if (acPopup.classList.contains("open")) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                acActiveIdx = (acActiveIdx + 1) % acFilteredList.length;
                updateAcActiveItem();
                return;
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                acActiveIdx = (acActiveIdx - 1 + acFilteredList.length) % acFilteredList.length;
                updateAcActiveItem();
                return;
            } else if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                if (acFilteredList[acActiveIdx]) {
                    insertAutocompleteTag(acFilteredList[acActiveIdx]);
                }
                return;
            } else if (e.key === "Escape") {
                e.preventDefault();
                hideAutocomplete();
                return;
            }
        }

        // Unify Enter with Shift+Enter behavior: insert clean line break so caret and autocomplete offsets stay 100% aligned
        if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            const ok = document.execCommand("insertLineBreak");
            if (!ok) {
                const sel = window.getSelection();
                if (sel && sel.rangeCount) {
                    const range = sel.getRangeAt(0);
                    range.deleteContents();
                    const br = document.createElement("br");
                    range.insertNode(br);
                    range.setStartAfter(br);
                    range.setEndAfter(br);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
            view.dispatchEvent(new Event("input", { bubbles: true }));
            return;
        }
    });

    function updateAcActiveItem() {
        const items = acPopup.querySelectorAll(".h3pc-autocomplete-item");
        items.forEach((item, idx) => {
            item.classList.toggle("active", idx === acActiveIdx);
            if (idx === acActiveIdx) item.scrollIntoView({ block: "nearest" });
        });
    }

    view.addEventListener("blur", () => {
        plainText = getPlainText(view);
        renderView(false);
        syncWidget();
    });

    view.addEventListener("paste", (e) => {
        e.preventDefault();
        document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
    });

    // ── Automatic Mode Template Loading ──
    modeSel.addEventListener("change", () => {
        const key = modeSel.value;
        const mw = modeWidget();
        if (mw) {
            mw.value = key;
            if (typeof mw.callback === "function") mw.callback(mw.value);
        }
        const tpl = TEMPLATES[key] || TEMPLATES["T2VA (Text to Video & Audio)"];
        setValue(tpl);
    });

    tagBtn.addEventListener("click", () => {
        acTriggerPos = lastCaretPos;
        showAutocomplete("", 16, 26);
        view.focus();
        setCaretOffset(view, lastCaretPos);
    });

    clearBtn.addEventListener("click", () => {
        setValue("");
        view.focus();
    });

    copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(plainText).then(() => {
            copyBtn.innerHTML = SVG_CHECK;
            copyBtn.classList.add("ok");
            setTimeout(() => {
                copyBtn.innerHTML = SVG_COPY;
                copyBtn.classList.remove("ok");
            }, 1400);
        }).catch(() => {});
    });

    function updateRestoreButton(isViewingRefined) {
        if (restoreSnapshot === null) {
            restoreBtn.style.display = "none";
            return;
        }
        restoreBtn.style.display = "inline-flex";
        if (isViewingRefined) {
            restoreBtn.className = "h3-btn restore";
            restoreBtn.title = "Current: AI Refined — Click to Restore Original Prompt";
            restoreBtn.innerHTML = `${SVG_RESTORE} Restore Original`;
        } else {
            restoreBtn.className = "h3-btn restore is-original";
            restoreBtn.title = "Current: Original Restored — Click to Switch Back to AI Refined";
            restoreBtn.innerHTML = `${SVG_RESTORE} View Refined`;
        }
    }

    // ── Refine Modal Controller ──
    const refineModal = createH3RefineModal({
        parentEl: viewWrap,
        getPlainText: () => plainText,
        onApply: (newText, prevSnapshot) => {
            restoreSnapshot = prevSnapshot;
            plainText = newText;
            renderView(false);
            syncWidget();
            updateStats();
            updateRestoreButton(true);
        }
    });

    refineBtn.addEventListener("click", () => {
        const sel = window.getSelection()?.toString() || "";
        refineModal.open(sel);
    });

    restoreBtn.addEventListener("click", () => {
        if (restoreSnapshot !== null) {
            const current = plainText;
            const isCurrentlyRefined = !restoreBtn.classList.contains("is-original");
            plainText = restoreSnapshot;
            restoreSnapshot = current;
            renderView(false);
            syncWidget();
            updateStats();
            updateRestoreButton(!isCurrentlyRefined);
        }
    });

    // ── Register DOM Widget ──
    const domWidget = node.addDOMWidget("_composer_panel", "div", root, {
        serialize: false,
        getValue() { return plainText; },
        setValue(v) { setValue(v == null ? "" : String(v)); },
    });

    domWidget.computeSize = function (width) {
        return [width ? Math.max(NODE_WIDTH, width) : NODE_WIDTH, 20];
    };

    hideWidget(storedWidget());
    if (node.widgets) {
        for (const w of node.widgets) {
            if (w.name === "_composer_prompt") hideWidget(w);
            if (w.name === "mode") hideWidget(w);
        }
    }
    requestAnimationFrame(() => hideWidget(storedWidget()));

    // ── Node Sizing ──
    node.min_width = NODE_MIN_WIDTH;
    node.min_height = NODE_MIN_HEIGHT;
    node.flags = node.flags || {};
    node.flags.min_width = NODE_MIN_WIDTH;
    node.flags.min_height = NODE_MIN_HEIGHT;

    const _ss = node.setSize?.bind(node);
    if (_ss) {
        node.setSize = function (size) {
            if (Array.isArray(size)) {
                size[0] = Math.max(NODE_MIN_WIDTH, size[0]);
                size[1] = Math.max(NODE_MIN_HEIGHT, size[1]);
            }
            const r = _ss(size);
            syncLayout();
            return r;
        };
    }

    const _bc = node.computeSize.bind(node);
    node.computeSize = function (out) {
        const m = _bc(out);
        if (m[0] < NODE_MIN_WIDTH) m[0] = NODE_MIN_WIDTH;
        if (m[1] < NODE_MIN_HEIGHT) m[1] = NODE_MIN_HEIGHT;
        return m;
    };
    const _pr = node.onResize;
    node.onResize = function (...a) {
        if (this.size?.[0] < NODE_MIN_WIDTH) this.size[0] = NODE_MIN_WIDTH;
        if (this.size?.[1] < NODE_MIN_HEIGHT) this.size[1] = NODE_MIN_HEIGHT;
        _pr?.apply(this, a);
        syncLayout();
    };
    const _pd = node.onDrawBackground;
    node.onDrawBackground = function (ctx) {
        const sw = storedWidget();
        if (sw && (!sw.hidden || sw.type !== "hidden")) hideWidget(sw);
        const mw = modeWidget();
        if (mw && (!mw.hidden || mw.type !== "hidden")) hideWidget(mw);
        syncLayout();
        return _pd?.apply(this, arguments);
    };

    // ── Configure & Execution Hooks ──
    const _pc = node.onConfigure;
    node.onConfigure = function (info) {
        _pc?.apply(this, arguments);
        const sw = storedWidget();
        if (sw) hideWidget(sw);
        const mw = modeWidget();
        if (mw) {
            hideWidget(mw);
            if (mw.value && modeSel.value !== mw.value) {
                modeSel.value = mw.value;
            }
        }
        if (sw?.value) {
            setValue(String(sw.value));
        } else if (info?.widgets_values?.length) {
            for (const val of info.widgets_values) {
                if (typeof val === "string" && val.trim().length > 0) {
                    setValue(val);
                    break;
                }
            }
        }
        requestAnimationFrame(() => {
            hideWidget(storedWidget());
            hideWidget(modeWidget());
            syncLayout();
        });
    };

    // Initial default template load if empty
    if (!plainText) {
        setValue(TEMPLATES["T2VA (Text to Video & Audio)"]);
    }
    node.setSize([NODE_WIDTH, 420]);
    requestAnimationFrame(syncLayout);
    return true;
}

app.registerExtension({
    name: "AILab.MiniMaxH3.PromptComposer",
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== NODE_NAME) return;
        const prev = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const r = prev?.apply(this, arguments);
            if (!this._h3pcReady && createComposerPanel(this)) this._h3pcReady = true;
            return r;
        };
    },
});
