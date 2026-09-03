import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";
import {
    injectH3CommonStyles,
    SVG_COPY,
    SVG_CHECK,
    SVG_SPARK,
    SVG_LOCK_OPEN,
    SVG_LOCK_CLOSED,
    SVG_RESTORE,
    SVG_APPLY,
    renderPrompt,
    extractTargetInfo,
    getCaretOffset,
    setCaretOffset,
    getPlainText,
    hideWidget,
    countWords,
    createH3RefineModal
} from "./prompt_common.js?v=1.6.8";

const NODE_NAMES = ["H3_PromptEditor", "H3_PromptPreviewEdit"];
const NODE_WIDTH = 540;
const NODE_MIN_WIDTH = 420;
const NODE_MIN_HEIGHT = 200;

// Ensure common styles are injected once
injectH3CommonStyles();

// Node-specific CSS rules
const _editorStyle = document.createElement("style");
_editorStyle.textContent = `
  .h3pe-root {
    width: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 11.5px;
    color: #dedee1;
    padding: 2px 4px 6px;
    gap: 4px;
  }
  .h3pe-view-wrap {
    position: relative;
    width: 100%;
    flex: 1 1 0;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }
  .h3pe-view {
    width: 100%;
    height: 100%;
    flex: 1 1 0;
    min-height: 80px;
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
  .h3pe-view:empty::before {
    content: "Connect upstream Promptor or compose prompt here…";
    color: #434c59;
    font-style: italic;
    pointer-events: none;
  }
  .h3pe-view:focus {
    border-color: rgba(190, 117, 101, 0.5);
    box-shadow: 0 0 0 1px rgba(190, 117, 101, 0.15);
  }
  .h3pe-view.locked {
    background: rgba(10, 12, 16, 0.72);
    border-color: rgba(248, 113, 113, 0.18);
    caret-color: transparent;
    cursor: default;
  }
  .h3pe-float-actions {
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
  .h3pe-view-wrap:hover .h3pe-float-actions,
  .h3pe-float-actions:focus-within {
    opacity: 1;
    pointer-events: auto;
    transform: scale(1);
  }
  .h3pe-toolbar {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 3px 2px 2px;
    flex-shrink: 0;
    width: 100%;
    box-sizing: border-box;
  }
  .h3pe-toolbar-left {
    justify-self: start;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .h3pe-toolbar-mid {
    justify-self: center;
    text-align: center;
    font-size: 11px;
    color: #717c8e;
    letter-spacing: 0.2px;
    white-space: nowrap;
    user-select: none;
    line-height: 1;
  }
  .h3pe-toolbar-mid.over {
    color: #f87171;
    font-weight: 600;
  }
  .h3pe-toolbar-right {
    justify-self: end;
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;
document.head.appendChild(_editorStyle);

function createPanel(node) {
    if (typeof node.addDOMWidget !== "function") return false;

    const root = document.createElement("div");
    root.className = "h3pe-root";

    // ── View Wrap ──
    const viewWrap = document.createElement("div");
    viewWrap.className = "h3pe-view-wrap";

    const view = document.createElement("div");
    view.className = "h3pe-view";
    view.contentEditable = "true";
    view.spellcheck = false;
    view.setAttribute("autocorrect", "off");
    view.setAttribute("data-gramm", "false");
    viewWrap.appendChild(view);

    // Floating Copy Button
    const floatActions = document.createElement("div");
    floatActions.className = "h3pe-float-actions";
    const copyBtn = document.createElement("button");
    copyBtn.className = "h3-float-btn";
    copyBtn.type = "button";
    copyBtn.title = "Copy prompt to clipboard";
    copyBtn.innerHTML = SVG_COPY;
    floatActions.appendChild(copyBtn);
    viewWrap.appendChild(floatActions);

    root.appendChild(viewWrap);

    // ── 3-part Bottom Toolbar ──
    const toolbar = document.createElement("div");
    toolbar.className = "h3pe-toolbar";

    const leftGroup = document.createElement("div");
    leftGroup.className = "h3pe-toolbar-left";
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
    statsEl.className = "h3pe-toolbar-mid";
    statsEl.textContent = "0 characters · 0 words";

    const rightGroup = document.createElement("div");
    rightGroup.className = "h3pe-toolbar-right";
    const lockBtn = document.createElement("button");
    lockBtn.className = "h3-icon-btn";
    lockBtn.type = "button";
    lockBtn.title = "Unlocked — Click to lock (protect from overwrites)";
    lockBtn.innerHTML = SVG_LOCK_OPEN;
    rightGroup.appendChild(lockBtn);

    toolbar.appendChild(leftGroup);
    toolbar.appendChild(statsEl);
    toolbar.appendChild(rightGroup);
    root.appendChild(toolbar);

    // ── State ──
    let plainText = "";
    let isLocked  = !!node.properties?.is_locked;
    let renderTimer = null;
    let restoreSnapshot = null;

    const storedWidget = () => node.widgets?.find(w => w.name === "_stored_prompt");

    function updateStats() {
        const ch = plainText.length;
        const wd = countWords(plainText);
        statsEl.textContent = `${ch.toLocaleString()} characters · ${wd.toLocaleString()} words`;
        statsEl.className = "h3pe-toolbar-mid" + (ch > 7000 ? " over" : "");
    }

    function renderView(restoreCaret = false) {
        const off = restoreCaret ? getCaretOffset(view) : -1;
        view.innerHTML = renderPrompt(plainText);
        if (restoreCaret && off >= 0) setCaretOffset(view, off);
        updateStats();
    }

    function applyLock() {
        view.contentEditable = !isLocked;
        lockBtn.innerHTML = isLocked ? SVG_LOCK_CLOSED : SVG_LOCK_OPEN;
        lockBtn.title = isLocked ? "Locked — Click to unlock" : "Unlocked — Click to lock";
        if (isLocked) view.classList.add("locked");
        else view.classList.remove("locked");
        refineBtn.disabled = isLocked;
    }

    function setLocked(locked) {
        isLocked = !!locked;
        node.properties = node.properties || {};
        node.properties.is_locked = isLocked;
        applyLock();
    }

    function syncWidget() {
        const w = storedWidget();
        if (w) {
            w.value = plainText;
            if (typeof w.callback === "function") w.callback(plainText);
        }
    }

    function setValue(text, fromExecution = false) {
        if (fromExecution && isLocked) return;
        plainText = (text == null) ? "" : String(text);
        renderView(false);
        syncWidget();
    }

    function syncLayout() {
        if (!node.size) return;
        const lastY = domWidget?.last_y || 36;
        const totalAvail = Math.max(140, node.size[1] - lastY - 8);
        const h = totalAvail + "px";
        if (root.style.height !== h) root.style.height = h;
    }

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

    // ── View Events ──
    view.addEventListener("keydown", (e) => {
        e.stopPropagation();
    });
    view.addEventListener("keyup", (e) => {
        e.stopPropagation();
    });
    view.addEventListener("input", () => {
        plainText = getPlainText(view);
        updateStats();
        syncWidget();
    });
    view.addEventListener("blur", () => {
        plainText = getPlainText(view);
        renderView(false);
        syncWidget();
    });
    view.addEventListener("paste", (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        const text = e.clipboardData?.getData("text/plain") || "";
        document.execCommand("insertText", false, text);
    }, true);

    // ── Toolbar Actions ──
    refineBtn.addEventListener("click", () => {
        if (!isLocked) {
            const sel = window.getSelection()?.toString() || "";
            refineModal.open(sel);
        }
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

    lockBtn.addEventListener("click", () => {
        setLocked(!isLocked);
    });

    copyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(plainText).then(() => {
            copyBtn.innerHTML = SVG_CHECK;
            copyBtn.classList.add("ok");
            setTimeout(() => {
                copyBtn.innerHTML = SVG_COPY;
                copyBtn.classList.remove("ok");
            }, 1400);
        }).catch(() => {});
    });

    // ── Register DOM Widget ──
    const domWidget = node.addDOMWidget("_preview_panel", "div", root, {
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
            if (w.name === "_stored_prompt") hideWidget(w);
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
        syncLayout();
        return _pd?.apply(this, arguments);
    };

    // ── Execution & Configure Hooks ──
    const _oe = node.onExecuted;
    node.onExecuted = function (message) {
        _oe?.apply(this, arguments);
        const text = message?.prompt?.[0] ?? message?.text?.[0] ?? "";
        if (text) setValue(text, true);
    };

    const _pc = node.onConfigure;
    node.onConfigure = function (info) {
        _pc?.apply(this, arguments);
        const sw = storedWidget();
        if (sw) hideWidget(sw);
        if (node.properties?.is_locked !== undefined) {
            setLocked(!!node.properties.is_locked);
        }
        if (sw?.value) {
            setValue(String(sw.value), false);
        } else if (info?.widgets_values?.length) {
            for (const val of info.widgets_values) {
                if (typeof val === "string" && val.trim().length > 0) {
                    setValue(val, false);
                    break;
                }
            }
        }
        requestAnimationFrame(() => {
            hideWidget(storedWidget());
            syncLayout();
        });
    };

    node.setSize([NODE_WIDTH, 420]);
    requestAnimationFrame(() => {
        applyLock();
        syncLayout();
    });
    return true;
}

app.registerExtension({
    name: "AILab.MiniMaxH3.PromptEditor",
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (!NODE_NAMES.includes(nodeData.name)) return;
        const prev = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const r = prev?.apply(this, arguments);
            if (!this._h3peReady && createPanel(this)) this._h3peReady = true;
            return r;
        };
    },
});
