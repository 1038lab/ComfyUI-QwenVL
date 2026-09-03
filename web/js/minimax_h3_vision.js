import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

const NODE = "H3_Vision";
const WIDTH = 440;
const INITIAL_NODE_HEIGHT = 400;

// CSS Styles
const style = document.createElement("style");
style.textContent = `
    .mmv-box { border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 5px; margin: 0 0 6px; background: rgba(0, 0, 0, 0.15); box-sizing: border-box; width: 100%; }
    .mmv-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; width: 100%; }
    .mmv-drop { aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #08b4ed; cursor: pointer; border: 1px dashed rgba(255,255,255,0.15); border-radius: 6px; background: rgba(0, 0, 0, 0.4); padding: 4px; box-sizing: border-box; transition: background 0.2s, border-color 0.2s; }
    .mmv-drop:hover { border-color: #0aa4d6; background: rgba(0, 0, 0, 0.25); }
    .mmv-reference-empty { grid-column: 1 / -1; width: 100%; aspect-ratio: 5/1; align-items: center; justify-content: center; text-align: left; padding: 18px 24px; flex-direction: row; gap: 10px; }
    .mmv-drop-icon { font-size: 14px; margin: 0; color: #08b4ed; font-family: Arial, sans-serif; }
    .mmv-drop-title { font-size: 11px; color: #d9e8f2; }
    .mmv-card { min-width: 0; aspect-ratio: 1; border: 1px solid #30485c; border-radius: 6px; background: #1a2938; overflow: hidden; position: relative; cursor: grab; user-select: none; transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease; }
    .mmv-card:active { cursor: grabbing; }
    .mmv-card img, .mmv-card video { display: block; width: 100%; height: 100%; object-fit: contain; background: #071018; pointer-events: none; }
    .mmv-card:hover { border-color: #0aa4d6; box-shadow: 0 0 0 1px #0aa4d6; }
    .mmv-card.mmv-dragging { opacity: 0.35; transform: scale(0.95); border: 1px dashed #08b4ed; }
    .mmv-card.mmv-dragover { border-color: #0aa4d6; box-shadow: 0 0 0 2px #0aa4d6; transform: scale(1.05); }
    .mmv-card-linked { border-color: #2d6a4f; background: #1a2938; }
    .mmv-card-linked:hover { border-color: #40916c; box-shadow: 0 0 0 1px #40916c; }
    .mmv-card-tag { position: absolute; left: 4px; top: 4px; background: rgba(0, 0, 0, 0.55); padding: 2px 5px; border-radius: 4px; font-size: 8.5px; line-height: 1.2; color: #ffffff; pointer-events: none; z-index: 5; white-space: nowrap; user-select: none; text-shadow: 0 1px 2px rgba(0,0,0,0.8); display: inline-flex; align-items: center; gap: 3px; }
    .mmv-remove { position: absolute; right: 4px; top: 4px; border: 0; background: rgba(0,0,0,0.65); color: #fff; cursor: pointer; font-size: 12px; z-index: 6; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; padding: 0; opacity: 0; pointer-events: none; transition: opacity 0.15s ease, background 0.15s ease; }
    .mmv-card:hover .mmv-remove { opacity: 1; pointer-events: auto; }
    .mmv-remove:hover { background: #d47d8b; }
    .mmv-media-bar { position: absolute; left: 0; right: 0; bottom: 0; height: 22px; padding: 0 4px; display: flex; align-items: center; gap: 3px; background: linear-gradient(to top, rgba(0, 0, 0, 0.82) 0%, rgba(0, 0, 0, 0.45) 65%, transparent 100%); z-index: 5; pointer-events: auto; }
    .mmv-bar-btn { width: 18px; height: 18px; padding: 0; border: none; background: transparent; color: #f1f5f9; cursor: pointer; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease; opacity: 0.92; }
    .mmv-bar-btn:hover { background: rgba(0, 0, 0, 0.5); color: #08b4ed; opacity: 1; transform: scale(1.1); }
    .mmv-bar-btn.mmv-muted { color: #f87171; }
    .mmv-bar-btn.mmv-muted:hover { background: rgba(220, 38, 38, 0.4); color: #fca5a5; }
    .mmv-bar-time { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; font-size: 10px; font-weight: 500; color: #ffffff; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.95); letter-spacing: 0.2px; user-select: none; line-height: 1; margin-left: 2px; }
    .mmv-bar-spacer { flex: 1; }
    .mmv-status-bar { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; padding: 3px 6px; min-height: 18px; background: rgba(0,0,0,0.25); border-radius: 4px; margin-top: 4px; margin-bottom: 2px; }
    .mmv-limit-msg { font-size: 10px; color: #d47d8b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mmv-clear-all { display: inline-flex; align-items: center; gap: 4px; font-size: 9px; color: #a44; cursor: pointer; padding: 2px 6px; border: 1px solid #844; border-radius: 4px; background: rgba(100,0,0,0.2); }
    .mmv-clear-all:hover { background: rgba(255,0,0,0.3); color: #f66; border-color: #f66; }
    .mmv-prompt { flex: 1; display: block; width: 100%; min-height: 80px; resize: none; overflow: auto; box-sizing: border-box; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; background: rgba(0, 0, 0, 0.35); color: var(--input-text, #e1e9ef); padding: 5px; font: 12px/1.4 Arial, sans-serif; outline: none; user-select: text; scrollbar-width: thin; scrollbar-color: #1f3540 transparent; }
    .mmv-prompt::placeholder { color: #6f7d89; opacity: 1; }
`;
document.head.appendChild(style);

function formatMediaTime(value) {
    const totalSec = Math.max(0, Math.floor(Number(value) || 0));
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${String(sec).padStart(2, "0")}`;
}

function playIcon(playing) {
    return playing
        ? '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
        : '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M6 4l15 8-15 8z"/></svg>';
}

function soundIcon(muted) {
    return muted
        ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>'
        : '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
}

function expandIcon() {
    return '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
}

function openMediaModal(title, elemSrc, isVideo = true) {
    const modal = make("div", {
        position: "fixed", left: "0", top: "0", width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.85)", zIndex: "99999", display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "20px", boxSizing: "border-box"
    });
    modal.onclick = () => modal.remove();
    
    const container = make("div", {
        maxWidth: "90vw", maxHeight: "85vh", position: "relative",
        background: "#111827", borderRadius: "8px", overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.15)"
    });
    container.onclick = e => e.stopPropagation();

    const header = make("div", {
        padding: "8px 12px", background: "#1f2937", color: "#f3f4f6",
        fontSize: "13px", fontWeight: "600", display: "flex", justifyContent: "space-between", alignItems: "center"
    }, title);
    const closeBtn = make("button", {
        border: "none", background: "transparent", color: "#9ca3af",
        fontSize: "16px", cursor: "pointer", padding: "0 4px"
    }, "✕");
    closeBtn.onclick = () => modal.remove();
    header.appendChild(closeBtn);
    container.appendChild(header);

    if (isVideo) {
        const v = document.createElement("video");
        v.src = elemSrc;
        v.controls = true;
        v.autoplay = true;
        Object.assign(v.style, { maxWidth: "85vw", maxHeight: "75vh", display: "block" });
        container.appendChild(v);
    } else {
        const img = document.createElement("img");
        img.src = elemSrc;
        Object.assign(img.style, { maxWidth: "85vw", maxHeight: "75vh", display: "block", objectFit: "contain" });
        container.appendChild(img);
    }
    modal.appendChild(container);
    document.body.appendChild(modal);
}

function make(tag, css = {}, text = "") {
    const el = document.createElement(tag);
    Object.assign(el.style, css);
    if (text) el.textContent = text;
    return el;
}

function kindOf(file) {
    if (file.type?.startsWith("image/") || /\.?(png|jpe?g|webp|bmp|gif)$/i.test(file.name)) return "image";
    if (file.type?.startsWith("video/") || /\.?(mp4|mov|webm|mkv|avi)$/i.test(file.name)) return "video";
    if (file.type?.startsWith("audio/") || /\.?(mp3|wav|flac|m4a|ogg|aac)$/i.test(file.name)) return "audio";
    return null;
}

function fileUrl(name) {
    if (!name) return "";
    if (/^https?:\/\//i.test(name) || name.startsWith("blob:") || name.startsWith("data:")) return name;
    const parts = String(name).replaceAll("\\", "/").split("/").filter(Boolean);
    const filename = parts.pop() || "";
    const params = new URLSearchParams({ filename, type: "input", subfolder: parts.join("/") });
    return `/view?${params.toString()}`;
}

async function uploadFile(file) {
    const body = new FormData();
    body.append("image", file, file.name);
    body.append("type", "input");
    const response = await api.fetchApi("/upload/image", { method: "POST", body });
    if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
    const result = await response.json();
    return [result.subfolder, result.name].filter(Boolean).join("/");
}

function hideWidget(w) {
    if (!w) return;
    w.hidden = true;
    w.options = w.options || {};
    w.options.hidden = true;
    w.computeSize = () => [0, -4];
    w.serialize = true;
}

function widget(node, name) {
    return node.widgets?.find(w => w.name === name);
}

/**
 * Detect connected Autogrow/Input connectors and resolve media previews from upstream nodes.
 */
function getLinkedMedia(node) {
    const linked = [];
    if (!node.inputs) return linked;
    const graph = app.graph || node.graph;

    for (let slotIdx = 0; slotIdx < node.inputs.length; slotIdx++) {
        const inp = node.inputs[slotIdx];
        if (inp.link == null) continue;

        const nameLower = (inp.name || "").toLowerCase();
        let kind = null;
        if (nameLower.includes("video") || inp.type === "VIDEO") {
            kind = "video";
        } else if (nameLower.includes("audio") || inp.type === "AUDIO") {
            kind = "audio";
        } else if (nameLower.includes("image") || inp.type === "IMAGE" || nameLower.startsWith("image_") || nameLower.startsWith("ref_image")) {
            kind = "image";
        }
        if (!kind) continue;

        const m = inp.name.match(/(\d+)/);
        const index = m ? parseInt(m[1], 10) : slotIdx;

        let originNode = null;
        let previewUrl = "";
        let fileName = "";
        let nodeTitle = "";

        const link = graph?.links ? graph.links[inp.link] : null;
        if (!link) {
            continue;
        }

        originNode = graph?.getNodeById(link.origin_id);
        if (!originNode) {
            continue;
        }

        nodeTitle = originNode.title || originNode.type || "";

        // Track changes on all media/path/url widgets on upstream node
        const relevantWidgets = originNode.widgets?.filter(w => {
            const wn = (w.name || "").toLowerCase();
            return wn.includes("image") || wn.includes("video") || wn.includes("audio") ||
                   wn.includes("file") || wn.includes("path") || wn.includes("url");
        }) || [];

        relevantWidgets.forEach(w => {
            if (!w._mmv_nodes) {
                w._mmv_nodes = new Set();
                const oldCb = w.callback;
                w.callback = function (...args) {
                    const ret = oldCb?.apply(this, args);
                    setTimeout(() => w._mmv_nodes?.forEach(n => n._mmv_refresh?.()), 0);
                    return ret;
                };
            }
            w._mmv_nodes.add(node);
        });

        // Hierarchy rule:
        // Priority 1: URL / Path widget if filled (e.g. RMBG's Image Path or URL has max priority)
        let mediaWidget = relevantWidgets.find(w => {
            const wn = (w.name || "").toLowerCase();
            return (wn.includes("url") || wn.includes("path")) && typeof w.value === "string" && w.value.trim() !== "";
        });

        // Priority 2: Primary media dropdown/file if non-empty (e.g. 11.jpg, mm.mp4)
        if (!mediaWidget) {
            mediaWidget = relevantWidgets.find(w => {
                const wn = (w.name || "").toLowerCase();
                const isPrimary = wn === "image" || wn === "video" || wn === "audio" || wn === "file" || wn === "filename";
                return isPrimary && typeof w.value === "string" && w.value.trim() !== "";
            });
        }

        // Priority 3: Fallback to any non-empty string widget
        if (!mediaWidget) {
            mediaWidget = relevantWidgets.find(w => typeof w.value === "string" && w.value.trim() !== "");
        }

        if (mediaWidget && typeof mediaWidget.value === "string" && mediaWidget.value.trim()) {
            fileName = mediaWidget.value.split("/").pop().split("\\").pop();
            previewUrl = fileUrl(mediaWidget.value);
        } else if (originNode.imgs && originNode.imgs.length > 0 && originNode.imgs[0]?.src) {
            previewUrl = originNode.imgs[0].src;
        }

        linked.push({
            name: inp.name,
            kind: kind,
            index: index,
            slotIdx: slotIdx,
            linkId: inp.link,
            previewUrl: previewUrl,
            fileName: fileName,
            nodeTitle: nodeTitle,
        });
    }

    linked.sort((a, b) => {
        const typeOrder = { image: 1, video: 2, audio: 3 };
        if (typeOrder[a.kind] !== typeOrder[b.kind]) return typeOrder[a.kind] - typeOrder[b.kind];
        return a.index - b.index;
    });

    return linked;
}

function createPanel(node) {
    if (typeof node.addDOMWidget !== "function") return false;

    // Hide standard widgets we are replacing with our DOM panel
    hideWidget(widget(node, "_media_state"));
    hideWidget(widget(node, "custom_prompt_override"));

    const root = make("div", {
        position: "relative",
        width: `100%`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        color: "#d7e3ef",
        fontFamily: "Arial,sans-serif",
        fontSize: "12px",
        userSelect: "none",
        padding: "3px 4px 6px 4px",
        overflow: "visible"
    });

    const syncNodeHeight = () => {
        if (!node.size) return;
        const required = node.computeSize([node.size[0], node.size[1]]);
        if (node.size[1] < required[1]) {
            node.setSize([node.size[0], required[1]]);
            node.setDirtyCanvas?.(true, true);
        }
    };

    const media = new Map();
    let slotCounter = 0;
    let uploadNotice = "";
    let noticeTimeout = null;
    let mediaOrder = []; // Array of keys: ["link:image_0", "upload:slot_1", ...]
    let linkedState = {}; // { [key: string]: { muted?: boolean } }

    let activePlayingMedia = null;
    const stopActivePlayingMedia = () => {
        if (!activePlayingMedia) return;
        try {
            activePlayingMedia.media.pause();
            activePlayingMedia.onStop?.();
        } catch {}
        activePlayingMedia = null;
    };
    const playMedia = (mediaElem, onStopCallback) => {
        if (activePlayingMedia && activePlayingMedia.media !== mediaElem) {
            stopActivePlayingMedia();
        }
        activePlayingMedia = { media: mediaElem, onStop: onStopCallback };
    };

    const setUploadNotice = (msg, timeout = 0) => {
        uploadNotice = msg;
        clearTimeout(noticeTimeout);
        let msgNode = root.querySelector(".mmv-limit-msg");
        if (msgNode) {
            msgNode.textContent = msg || "\u00A0";
        }
        if (timeout > 0) {
            noticeTimeout = setTimeout(() => { setUploadNotice(""); }, timeout);
        }
        requestAnimationFrame(syncNodeHeight);
    };

    let userReordered = false;

    // Attempt to load saved state
    const stateWidget = widget(node, "_media_state");
    if (stateWidget && stateWidget.value) {
        try {
            const data = JSON.parse(stateWidget.value);
            if (data.media) {
                data.media.forEach(entry => {
                    media.set(entry[0], entry[1]);
                    const num = parseInt(entry[0].replace("slot_", ""));
                    if (!isNaN(num) && num > slotCounter) slotCounter = num;
                });
            }
            if (Array.isArray(data.order)) {
                mediaOrder = data.order;
            }
            if (data.user_reordered) {
                userReordered = true;
            }
            if (data.linked_state && typeof data.linked_state === "object") {
                linkedState = data.linked_state;
            }
        } catch (e) {
            console.error("Failed to parse _media_state", e);
        }
    }

    const overrideWidget = widget(node, "custom_prompt_override");

    const persistState = () => {
        const stateStr = JSON.stringify({
            media: [...media.entries()],
            order: mediaOrder,
            user_reordered: userReordered,
            linked_state: linkedState
        });
        if (stateWidget) {
            stateWidget.value = stateStr;
            if (node.widgets_values && node.widgets) {
                const idx = node.widgets.indexOf(stateWidget);
                if (idx !== -1) {
                    node.widgets_values[idx] = stateStr;
                }
            }
            stateWidget.callback?.call(stateWidget, stateStr);
        }
        node.setDirtyCanvas?.(true, true);
        app.graph?.setDirtyCanvas?.(true, true);
    };

    /**
     * Get all current media items sorted according to mediaOrder.
     * Category partition is strictly enforced:
     *   1. All Images (Linked -> Uploaded by default, reorderable within images)
     *   2. All Videos (Linked -> Uploaded by default, reorderable within videos, ALWAYS after last image)
     *   3. All Audios (Linked -> Uploaded by default, reorderable within audios, ALWAYS after last video)
     */
    function getSortedMediaItems() {
        const linked = getLinkedMedia(node);
        const linkedMap = new Map(linked.map(l => [`link:${l.name}`, { isLinked: true, data: l, kind: l.kind }]));
        const uploadMap = new Map([...media.entries()].map(([s, e]) => [`upload:${s}`, { isLinked: false, slot: s, data: e, kind: e.kind }]));

        const allMap = new Map([...linkedMap, ...uploadMap]);
        const allKeys = new Set(allMap.keys());

        // Separate keys by media kind
        const imageKeys = [...allKeys].filter(k => allMap.get(k)?.kind === "image");
        const videoKeys = [...allKeys].filter(k => allMap.get(k)?.kind === "video");
        const audioKeys = [...allKeys].filter(k => allMap.get(k)?.kind === "audio");

        function sortKindKeys(keys) {
            if (userReordered && mediaOrder.length > 0) {
                const known = keys.filter(k => mediaOrder.includes(k)).sort((a, b) => mediaOrder.indexOf(a) - mediaOrder.indexOf(b));
                const unknown = keys.filter(k => !mediaOrder.includes(k)).sort((a, b) => {
                    const itemA = allMap.get(a);
                    const itemB = allMap.get(b);
                    if (itemA.isLinked !== itemB.isLinked) return itemA.isLinked ? -1 : 1;
                    return a.localeCompare(b, undefined, { numeric: true });
                });
                return [...known, ...unknown];
            } else {
                return keys.sort((a, b) => {
                    const itemA = allMap.get(a);
                    const itemB = allMap.get(b);
                    if (itemA.isLinked !== itemB.isLinked) return itemA.isLinked ? -1 : 1;
                    return a.localeCompare(b, undefined, { numeric: true });
                });
            }
        }

        const sortedImageKeys = sortKindKeys(imageKeys);
        const sortedVideoKeys = sortKindKeys(videoKeys);
        const sortedAudioKeys = sortKindKeys(audioKeys);

        // Strict category order: All Images -> All Videos -> All Audios (capped at MiniMax limits: 9 images, 3 videos, 3 audios)
        const newOrder = [
            ...sortedImageKeys.slice(0, 9),
            ...sortedVideoKeys.slice(0, 3),
            ...sortedAudioKeys.slice(0, 3)
        ];
        const isOrderChanged = newOrder.length !== mediaOrder.length || newOrder.some((k, i) => k !== mediaOrder[i]);
        mediaOrder = newOrder;
        if (isOrderChanged) {
            persistState();
        }

        let imgCount = 0;
        let vidCount = 0;
        let audCount = 0;

        const items = mediaOrder.map(k => {
            const itemObj = allMap.get(k);
            if (!itemObj) return null;
            const res = { key: k, ...itemObj };

            if (res.kind === "image") {
                res.ordinal = ++imgCount;
            } else if (res.kind === "video") {
                res.ordinal = ++vidCount;
            } else if (res.kind === "audio") {
                res.ordinal = ++audCount;
            }
            return res;
        }).filter(Boolean);

        let dynamicNotice = "";
        if (sortedImageKeys.length > 9) dynamicNotice = `Max 9 images allowed (showing 9 of ${sortedImageKeys.length}).`;
        else if (sortedVideoKeys.length > 3) dynamicNotice = `Max 3 videos allowed (showing 3 of ${sortedVideoKeys.length}).`;
        else if (sortedAudioKeys.length > 3) dynamicNotice = `Max 3 audios allowed (showing 3 of ${sortedAudioKeys.length}).`;

        return { items, dynamicNotice, totalImages: sortedImageKeys.length, totalVideos: sortedVideoKeys.length, totalAudios: sortedAudioKeys.length };
    }

    function insertTagIntoOverride(tagStr) {
        const textarea = promptTextarea;
        if (!textarea) return;

        let val = textarea.value;
        const tagTarget = tagStr.trim(); // e.g. "<Picture 1>:"

        // 1. Toggle Removal: If tag is already present in textarea, remove its line
        if (val.includes(tagTarget)) {
            const lines = val.split("\n").filter(line => !line.includes(tagTarget));
            textarea.value = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
            if (overrideWidget) {
                overrideWidget.value = textarea.value;
                if (node.widgets_values && node.widgets) {
                    const oIdx = node.widgets.indexOf(overrideWidget);
                    if (oIdx !== -1) node.widgets_values[oIdx] = textarea.value;
                }
                overrideWidget.callback?.call(overrideWidget, textarea.value);
                node.setDirtyCanvas?.(true, true);
                app.graph?.setDirtyCanvas?.(true, true);
            }
            return;
        }

        // 2. Otherwise insert and strictly sort by category: Picture (1000) -> Video (2000) -> Audio (3000)
        const prefix = val && !val.endsWith("\n") ? "\n" : "";
        const combined = (val + prefix + tagStr).trimEnd();

        const lines = combined.split("\n");
        const otherLines = [];
        const taggedLines = [];

        lines.forEach(line => {
            const m = line.match(/^<\s*(Picture|Video|Audio|Video Audio)\s+(\d+)\s*>:/i);
            if (m) {
                const type = m[1].toLowerCase(), num = parseInt(m[2], 10);
                const w = type.includes("picture") ? 1000 : type === "video" ? 2000 : 3000;
                taggedLines.push({ line, weight: w + num });
            } else {
                otherLines.push(line);
            }
        });

        taggedLines.sort((a, b) => a.weight - b.weight);
        textarea.value = [...otherLines, ...taggedLines.map(t => t.line)].join("\n");

        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = textarea.value.length;

        if (overrideWidget) {
            overrideWidget.value = textarea.value;
            if (node.widgets_values && node.widgets) {
                const oIdx = node.widgets.indexOf(overrideWidget);
                if (oIdx !== -1) node.widgets_values[oIdx] = textarea.value;
            }
            overrideWidget.callback?.call(overrideWidget, textarea.value);
            node.setDirtyCanvas?.(true, true);
            app.graph?.setDirtyCanvas?.(true, true);
        }
    }

    /**
     * Attach drag-and-drop reordering listeners to card elements.
     * Reordering is type-safe (images can only swap with images, videos with videos).
     */
    function attachDragReorderEvents(cardEl, itemKey, itemKind) {
        cardEl.setAttribute("draggable", "true");

        cardEl.ondragstart = e => {
            if (e.target.closest("button") || e.target.tagName === "BUTTON") {
                e.preventDefault();
                return;
            }
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/mmv-reorder-key", itemKey);
            e.dataTransfer.setData("text/mmv-reorder-kind", itemKind);
            cardEl.classList.add("mmv-dragging");
        };

        cardEl.ondragend = () => {
            cardEl.classList.remove("mmv-dragging");
            root.querySelectorAll(".mmv-dragover").forEach(el => el.classList.remove("mmv-dragover"));
        };

        cardEl.ondragover = e => {
            if (e.dataTransfer.types.includes("text/mmv-reorder-key")) {
                const srcKind = e.dataTransfer.getData("text/mmv-reorder-kind");
                if (!srcKind || srcKind === itemKind) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = "move";
                    cardEl.classList.add("mmv-dragover");
                }
            }
        };

        cardEl.ondragleave = () => {
            cardEl.classList.remove("mmv-dragover");
        };

        cardEl.ondrop = e => {
            if (!e.dataTransfer.types.includes("text/mmv-reorder-key")) return;
            e.preventDefault();
            e.stopPropagation();
            cardEl.classList.remove("mmv-dragover");

            const srcKey = e.dataTransfer.getData("text/mmv-reorder-key");
            const srcKind = e.dataTransfer.getData("text/mmv-reorder-kind");
            if (!srcKey || srcKey === itemKey) return;
            if (srcKind && srcKind !== itemKind) return;

            const fromIdx = mediaOrder.indexOf(srcKey);
            const toIdx = mediaOrder.indexOf(itemKey);
            if (fromIdx !== -1 && toIdx !== -1) {
                userReordered = true;
                const { items: oldItems } = getSortedMediaItems();
                const oldTagMap = new Map(oldItems.map(it => [it.key, `<${it.kind === "image" ? "Picture" : it.kind === "video" ? "Video" : "Audio"} ${it.ordinal}>`]));

                mediaOrder.splice(fromIdx, 1);
                mediaOrder.splice(toIdx, 0, srcKey);

                const { items: newItems } = getSortedMediaItems();
                const newTagMap = new Map(newItems.map(it => [it.key, `<${it.kind === "image" ? "Picture" : it.kind === "video" ? "Video" : "Audio"} ${it.ordinal}>`]));

                if (promptTextarea && promptTextarea.value) {
                    let val = promptTextarea.value;
                    const replacements = [];
                    for (const [k, oldTag] of oldTagMap.entries()) {
                        const newTag = newTagMap.get(k);
                        if (newTag && oldTag !== newTag && val.includes(oldTag)) {
                            replacements.push({ oldTag, newTag });
                        }
                    }
                    if (replacements.length > 0) {
                        replacements.forEach((r, idx) => {
                            val = val.replaceAll(r.oldTag, `__TEMP_TAG_${idx}__`);
                        });
                        replacements.forEach((r, idx) => {
                            val = val.replaceAll(`__TEMP_TAG_${idx}__`, r.newTag);
                        });
                        promptTextarea.value = val;
                        if (overrideWidget) {
                            overrideWidget.value = val;
                            if (node.widgets_values && node.widgets) {
                                const oIdx = node.widgets.indexOf(overrideWidget);
                                if (oIdx !== -1) node.widgets_values[oIdx] = val;
                            }
                            overrideWidget.callback?.call(overrideWidget, val);
                        }
                    }
                }

                persistState();
                render();
            }
        };
    }

    function createMediaCard(item) {
        const el = make("div");
        el.className = item.isLinked ? "mmv-card mmv-card-linked" : "mmv-card";

        const ordinal = item.ordinal;
        const labelTitle = item.kind === "image" ? "Picture" : item.kind === "video" ? "Video" : "Audio";

        let previewUrl = "";
        let displayName = "";
        let isMuted = false;

        if (item.isLinked) {
            const linkedData = item.data;
            previewUrl = linkedData.previewUrl || "";
            displayName = linkedData.fileName || linkedData.nodeTitle || linkedData.name || "";
            isMuted = !!linkedState[item.key]?.muted;
        } else {
            const entry = item.data;
            previewUrl = fileUrl(entry.name);
            displayName = entry.name.split("/").pop() || "";
            isMuted = !!entry.muted;
        }

        // 1. Media Content
        if (item.kind === "image") {
            if (previewUrl) {
                const img = make("img");
                img.src = previewUrl;
                el.appendChild(img);
            }
        } else if (item.kind === "video") {
            if (previewUrl) {
                const video = make("video");
                video.src = previewUrl;
                video.muted = isMuted;
                video.preload = "metadata";
                el.appendChild(video);
            }
        } else if (item.kind === "audio") {
            el.appendChild(make("div", {
                height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                color: "#8ea3b4", fontSize: "24px"
            }, "♫"));
        }

        // Placeholder fallback for linked media without immediate preview URL
        if (item.isLinked && !previewUrl && item.kind !== "audio") {
            const placeholder = make("div", {
                height: "100%", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                color: "#40916c", fontSize: "16px", gap: "3px",
                background: "rgba(13,40,24,0.6)", padding: "4px", textAlign: "center"
            });
            const kindIcon = item.kind === "image" ? "🖼" : "🎬";
            placeholder.innerHTML = `<span style="font-size:20px">${kindIcon}</span><span style="font-size:9px;color:#74c69d;font-weight:600;">${displayName}</span>`;
            el.appendChild(placeholder);
        }

        // 2. Unified Top-Left Tag (Picture X / Video X / Audio X, + "🔗" if linked)
        const tagText = `${labelTitle} ${ordinal}${item.isLinked ? " 🔗" : ""}`;
        const tag = make("div", {}, tagText);
        tag.className = "mmv-card-tag";
        el.appendChild(tag);

        // 3. Close / Disconnect Button (Top-right, hidden by default, shown on hover)
        const remove = make("button", {}, "×");
        remove.className = "mmv-remove";
        remove.title = item.isLinked ? "Disconnect input" : "Delete uploaded media";
        remove.onclick = e => {
            e.stopPropagation();
            if (item.isLinked) {
                const slotIdx = item.data?.slotIdx;
                if (slotIdx !== undefined && slotIdx !== null) {
                    node.disconnectInput?.(slotIdx);
                }
                mediaOrder = mediaOrder.filter(k => k !== item.key);
                persistState();
                scheduleSync();
            } else {
                media.delete(item.slot);
                mediaOrder = mediaOrder.filter(k => k !== item.key);
                persistState();
                render();
            }
        };
        el.appendChild(remove);

        // 4. Bottom Controls Bar (Play / Duration / Audio / Zoom)
        const bar = make("div");
        bar.className = "mmv-media-bar";

        if (item.kind === "video" || item.kind === "audio") {
            const mediaElem = item.kind === "video" ? el.querySelector("video") : (previewUrl ? new Audio(previewUrl) : null);
            if (mediaElem && item.kind === "audio") {
                mediaElem.preload = "metadata";
            }

            const playBtn = make("button");
            playBtn.className = "mmv-bar-btn";
            playBtn.innerHTML = playIcon(false);
            playBtn.title = "Play/Pause";

            const timeSpan = make("span", {}, "0:00");
            timeSpan.className = "mmv-bar-time";

            const spacer = make("div");
            spacer.className = "mmv-bar-spacer";

            let isPlaying = false;
            const setPlaying = playing => {
                isPlaying = playing;
                playBtn.innerHTML = playIcon(playing);
            };

            const refreshMedia = () => {
                if (!mediaElem) return;
                const dur = mediaElem.duration;
                if (!Number.isFinite(dur)) return;
                const rem = mediaElem.paused ? dur : Math.max(0, dur - mediaElem.currentTime);
                timeSpan.textContent = formatMediaTime(rem);
            };

            if (mediaElem) {
                mediaElem.addEventListener("loadedmetadata", refreshMedia);
                mediaElem.addEventListener("timeupdate", refreshMedia);
                mediaElem.addEventListener("ended", () => {
                    setPlaying(false);
                    refreshMedia();
                    if (activePlayingMedia?.media === mediaElem) activePlayingMedia = null;
                });
            }

            playBtn.onclick = e => {
                e.stopPropagation();
                if (!mediaElem) return;
                if (mediaElem.paused) {
                    playMedia(mediaElem, () => { setPlaying(false); refreshMedia(); });
                    if (item.kind === "video") mediaElem.muted = isMuted;
                    mediaElem.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
                } else {
                    mediaElem.pause();
                    setPlaying(false);
                    refreshMedia();
                }
            };

            bar.append(playBtn, timeSpan, spacer);

            if (item.kind === "video") {
                const soundBtn = make("button");
                soundBtn.className = isMuted ? "mmv-bar-btn mmv-muted" : "mmv-bar-btn";
                soundBtn.innerHTML = soundIcon(isMuted);
                soundBtn.title = isMuted ? "Unmute audio (include soundtrack in reference)" : "Mute audio (visual reference only)";
                soundBtn.onclick = e => {
                    e.stopPropagation();
                    if (item.isLinked) {
                        if (!linkedState[item.key]) linkedState[item.key] = {};
                        linkedState[item.key].muted = !isMuted;
                    } else {
                        item.data.muted = !isMuted;
                    }
                    if (mediaElem) mediaElem.muted = !isMuted;
                    persistState();
                    render();
                };

                const expandBtn = make("button");
                expandBtn.className = "mmv-bar-btn";
                expandBtn.innerHTML = expandIcon();
                expandBtn.title = "Expand full-size preview";
                expandBtn.onclick = e => {
                    e.stopPropagation();
                    openMediaModal(`[${labelTitle} ${ordinal}] ${displayName}`, previewUrl, true);
                };

                bar.append(soundBtn, expandBtn);
            }

            el.appendChild(bar);
        } else if (item.kind === "image") {
            const spacer = make("div");
            spacer.className = "mmv-bar-spacer";

            const expandBtn = make("button");
            expandBtn.className = "mmv-bar-btn";
            expandBtn.innerHTML = expandIcon();
            expandBtn.title = "Expand full-size preview";
            expandBtn.onclick = e => {
                e.stopPropagation();
                if (previewUrl) {
                    openMediaModal(`[${labelTitle} ${ordinal}] ${displayName}`, previewUrl, false);
                }
            };

            bar.append(spacer, expandBtn);
            el.appendChild(bar);
        }

        // 5. Pointer / Hover Status Bar Display & Tooltip
        el.title = item.kind === "video"
            ? `[${labelTitle} ${ordinal}] ${displayName}\n• Click: toggle insert/remove <Video ${ordinal}> tag\n• Double-click: toggle insert/remove <Video Audio ${ordinal}> tag\n• Drag to reorder`
            : `[${labelTitle} ${ordinal}] ${displayName}\n• Click: toggle insert/remove <${labelTitle} ${ordinal}> tag\n• Drag to reorder`;
        el.onpointerenter = () => setUploadNotice(`[${labelTitle} ${ordinal}] ${displayName}`);
        el.onpointerleave = () => setUploadNotice("");

        // 6. Click & Double-click tag insertion
        el.onclick = e => {
            if (e.target.closest("button")) return;
            e.stopPropagation();
            insertTagIntoOverride(`<${labelTitle} ${ordinal}>: `);
        };

        if (item.kind === "video") {
            el.ondblclick = e => {
                if (e.target.closest("button")) return;
                e.stopPropagation();
                if (isMuted) {
                    setUploadNotice(`[Video ${ordinal}] is muted (audio excluded)`, 2500);
                    return;
                }
                insertTagIntoOverride(`<Video Audio ${ordinal}>: `);
            };
        }

        attachDragReorderEvents(el, item.key, item.kind);
        return el;
    }

    function addDrop(isEmpty = false) {
        const d = make("div");
        d.className = isEmpty ? "mmv-drop mmv-reference-empty" : "mmv-drop";
        d.title = "Click to upload files, or drag & drop images, videos, and audios here";

        if (isEmpty) {
            const title = make("div");
            title.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;gap:6px;font-size:14px;font-weight:600;color:#fff;margin-bottom:6px;font-family:system-ui,sans-serif;letter-spacing:0.5px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0aa4d6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>Drag & Drop</div><div style="font-size:11px;color:#8ea3b4;text-align:center;font-family:system-ui,sans-serif;opacity:0.8;">or click to upload your media files</div>';
            d.append(title);
        } else {
            const icon = make("span");
            icon.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:0 auto 4px auto;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>';
            icon.className = "mmv-drop-icon";
            const title = make("span", {}, "+ Add");
            title.className = "mmv-drop-title";
            d.append(icon, title);
        }

        d.onclick = () => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = true;
            input.accept = "image/*,video/*,audio/*";
            input.onchange = () => accept(input.files);
            input.click();
        };

        d.ondragover = e => { e.preventDefault(); e.stopPropagation(); d.style.borderColor = "#0aa4d6"; };
        d.ondragleave = e => { e.preventDefault(); e.stopPropagation(); d.style.borderColor = ""; };
        d.ondrop = e => { e.preventDefault(); e.stopPropagation(); accept(e.dataTransfer.files); };
        return d;
    }

    async function accept(files) {
        setUploadNotice("");
        for (const file of files || []) {
            const kind = kindOf(file);
            if (!kind) continue;

            const linkedCount = getLinkedMedia(node).filter(e => e.kind === kind).length;
            const currentCount = [...media.values()].filter(e => e.kind === kind).length;
            const maxLimit = kind === "image" ? 9 : (kind === "video" ? 3 : 3);
            if (linkedCount + currentCount >= maxLimit) {
                setUploadNotice(`Up to ${maxLimit} ${kind}s allowed (Currently ${linkedCount} linked + ${currentCount} uploaded).`, 8000);
                continue;
            }

            try {
                document.body.style.cursor = "wait";
                const name = await uploadFile(file);
                slotCounter++;
                const newSlotKey = `slot_${slotCounter}`;
                media.set(newSlotKey, { name, kind });
                mediaOrder.push(`upload:${newSlotKey}`);
            } catch (e) {
                console.error("[MiniMax H3 Vision] Upload error:", e);
            } finally {
                document.body.style.cursor = "default";
            }
        }
        persistState();
        render();
    }

    const box = make("div"); box.className = "mmv-box";
    const promptTextarea = make("textarea");
    promptTextarea.className = "mmv-prompt";
    promptTextarea.title = "Custom Prompt Override: Single-click any media card above to insert its reference tag, or manually type customized tag descriptions (e.g., <Picture 1>: ...).";
    promptTextarea.placeholder = "Custom Prompt Override (Optional):\nLeave blank for auto-generation.\n- Drag & drop cards to reorder <Picture 1>, <Picture 2>, etc.\n- Single-click any media above to insert its reference tag\n- Double-click a video to insert its audio tag";
    promptTextarea.value = overrideWidget ? (overrideWidget.value || "") : "";

    promptTextarea.oninput = () => {
        if (overrideWidget) {
            overrideWidget.value = promptTextarea.value;
            overrideWidget.callback?.call(overrideWidget, promptTextarea.value);
        }
    };

    promptTextarea.addEventListener('wheel', (e) => { e.stopPropagation(); });
    promptTextarea.addEventListener('pointerdown', (e) => { e.stopPropagation(); });

    /**
     * Elegant Autogrow & Collapse:
     * - Autogrow: When all active ports are connected, safely add the next trailing port (e.g. video_0 connected -> add video_1).
     * - Collapse: When disconnected, cleanly remove trailing unused excess ports so only exactly ONE waiting port remains (e.g. video_0 disconnected -> remove video_1, leaving only video_0).
     * - Safety: Operates ONLY on trailing unlinked slots, NEVER touches connected slots, and is scheduled via requestAnimationFrame to avoid interrupting LiteGraph gestures.
     */
    function syncAutogrowSlots() {
        if (!node.inputs) return;

        const kinds = [
            { kind: "image", prefix: "image_", type: "IMAGE", max: 9 },
            { kind: "video", prefix: "video_", type: "VIDEO", max: 3 },
            { kind: "audio", prefix: "audio_", type: "AUDIO", max: 3 }
        ];

        for (const { kind, prefix, type, max } of kinds) {
            const slots = [];
            for (let i = 0; i < node.inputs.length; i++) {
                const inp = node.inputs[i];
                const nameLower = (inp.name || "").toLowerCase();
                const typeUpper = (inp.type || "").toUpperCase();
                if (typeUpper === type || nameLower.startsWith(prefix) || nameLower === kind || nameLower.startsWith("ref_" + kind)) {
                    const m = (inp.name || "").match(/_(\d+)$/);
                    const slotIdx = m ? parseInt(m[1], 10) : slots.length;
                    slots.push({ inputIndex: i, slotIdx, inp, isLinked: inp.link != null });
                }
            }

            const linkedSlots = slots.filter(s => s.isLinked);
            const linkedCount = linkedSlots.length;
            const uploadedCount = [...media.values()].filter(e => e.kind === kind).length;
            const totalCount = linkedCount + uploadedCount;

            if (totalCount >= max) {
                for (let i = slots.length - 1; i >= 0; i--) {
                    const s = slots[i];
                    if (!s.isLinked) {
                        node.removeInput(s.inputIndex);
                    }
                }
            } else if (linkedCount === 0) {
                const hasBase = slots.some(s => s.slotIdx === 0);
                if (!hasBase) {
                    node.addInput(`${prefix}0`, type);
                }
                for (let i = slots.length - 1; i >= 0; i--) {
                    const s = slots[i];
                    if (!s.isLinked && s.slotIdx > 0) {
                        node.removeInput(s.inputIndex);
                    }
                }
            } else {
                const maxLinkedIdx = Math.max(...linkedSlots.map(s => s.slotIdx));
                const nextSlotIdx = maxLinkedIdx + 1;

                if (nextSlotIdx < max) {
                    const hasNext = slots.some(s => s.slotIdx === nextSlotIdx);
                    if (!hasNext) {
                        node.addInput(`${prefix}${nextSlotIdx}`, type);
                    }
                }

                for (let i = slots.length - 1; i >= 0; i--) {
                    const s = slots[i];
                    if (!s.isLinked && s.slotIdx > nextSlotIdx) {
                        node.removeInput(s.inputIndex);
                    }
                }
            }
        }
    }

    let syncPending = false;
    const scheduleSync = () => {
        if (syncPending) return;
        syncPending = true;
        requestAnimationFrame(() => {
            syncPending = false;
            lastLinkedSignature = "";
            syncAutogrowSlots();
            render();
        });
    };

    function render() {
        stopActivePlayingMedia();
        box.innerHTML = "";

        const grid = make("div");
        grid.className = "mmv-grid";

        const { items: sortedItems, dynamicNotice, totalImages, totalVideos, totalAudios } = getSortedMediaItems();

        if (sortedItems.length === 0) {
            grid.appendChild(addDrop(true));
        } else {
            sortedItems.forEach(item => {
                grid.appendChild(createMediaCard(item));
            });
            // Show + Add button if any category has room
            if (totalImages < 9 || totalVideos < 3 || totalAudios < 3) {
                grid.appendChild(addDrop(false));
            }
        }

        const statusBar = make("div");
        statusBar.className = "mmv-status-bar";

        const msgNode = make("div", {}, uploadNotice || dynamicNotice || "\u00A0");
        msgNode.className = "mmv-limit-msg";
        statusBar.appendChild(msgNode);

        if (media.size > 0) {
            const clearBtn = make("div", {}, "✖ Clear Uploads");
            clearBtn.className = "mmv-clear-all";
            clearBtn.title = "Remove uploaded media files";
            clearBtn.onclick = e => {
                e.stopPropagation();
                media.clear();
                mediaOrder = mediaOrder.filter(k => k.startsWith("link:"));
                userReordered = false;
                uploadNotice = "";
                persistState();
                render();
            };
            statusBar.appendChild(clearBtn);
        } else if (!uploadNotice && !dynamicNotice && sortedItems.length === 0) {
            statusBar.style.display = "none";
        }

        grid.appendChild(statusBar);

        box.appendChild(grid);
        requestAnimationFrame(syncNodeHeight);
    }

    root.appendChild(box);
    root.appendChild(promptTextarea);

    const domWidget = node.addDOMWidget("gh_vision_panel", "gh_vision_panel", root, { serialize: false, hideOnZoom: false });
    domWidget.options = domWidget.options || {};
    domWidget.options.serialize = false;

    const getMinDomHeight = () => {
        let boxHeight = box ? box.offsetHeight : 0;
        const totalCards = mediaOrder.length;
        if (boxHeight === 0) {
            boxHeight = totalCards === 0 ? 100 : Math.ceil((totalCards + 1) / 4) * 110 + 30;
        }
        return boxHeight + 95;
    };

    domWidget.computeSize = function (width) {
        return [width ? Math.max(WIDTH, width) : WIDTH, getMinDomHeight()];
    };

    const baseComputeSize = node.computeSize.bind(node);
    node.computeSize = function (out) {
        let measured = baseComputeSize(out);
        if (measured[0] < WIDTH) measured[0] = WIDTH;
        return measured;
    };

    const previousOnResize = node.onResize;
    node.onResize = function (...args) {
        if (this.size?.[0] < WIDTH) this.size[0] = WIDTH;
        previousOnResize?.apply(this, args);
        requestAnimationFrame(syncNodeHeight);
    };

    let lastLinkedSignature = "";
    const checkAndSyncLinked = () => {
        const graph = app.graph || node.graph;
        const currentSignature = (node.inputs || []).map(i => {
            if (i.link == null) return `${i.name}:null`;
            const link = graph?.links?.[i.link];
            const originNode = link ? graph?.getNodeById(link.origin_id) : null;
            if (!link || !originNode) {
                return `${i.name}:unresolved`;
            }
            let activeWidget = originNode?.widgets?.find(w => /^(image|video|audio|file|filename)/i.test(w.name || "") && typeof w.value === "string" && w.value.trim() !== "");
            if (!activeWidget) {
                activeWidget = originNode?.widgets?.find(w => /^(image|video|audio|file|filename)/i.test(w.name || ""));
            }
            const wVal = activeWidget?.value || "";
            const imgVal = originNode?.imgs?.[0]?.src || "";
            return `${i.name}:${i.link}:${wVal}:${imgVal}`;
        }).join("|");

        if (currentSignature !== lastLinkedSignature) {
            lastLinkedSignature = currentSignature;
            render();
        }
    };

    const previousOnDrawBackground = node.onDrawBackground;
    node.onDrawBackground = function (ctx) {
        checkAndSyncLinked();
        if (root && this.size) {
            const targetWidth = (this.size[0] - 16) + "px";
            if (root.style.width !== targetWidth) {
                root.style.width = targetWidth;
            }

            if (domWidget && domWidget.last_y !== undefined) {
                const targetHeight = Math.max(getMinDomHeight(), this.size[1] - domWidget.last_y - 12) + "px";
                if (root.style.height !== targetHeight) {
                    root.style.height = targetHeight;
                }
            }
        }
        return previousOnDrawBackground?.apply(this, arguments);
    };

    node._mmv_refresh = () => {
        scheduleSync();
    };

    const previousOnConnectionsChange = node.onConnectionsChange;
    node.onConnectionsChange = function (...args) {
        previousOnConnectionsChange?.apply(this, args);
        scheduleSync();
    };

    const previousOnConfigure = node.onConfigure;
    node.onConfigure = function (...args) {
        previousOnConfigure?.apply(this, args);
        const sw = widget(node, "_media_state");
        if (sw && sw.value) {
            try {
                const data = typeof sw.value === "string" ? JSON.parse(sw.value) : sw.value;
                if (data && data.media) {
                    media.clear();
                    data.media.forEach(entry => {
                        media.set(entry[0], entry[1]);
                        const num = parseInt(entry[0].replace("slot_", ""));
                        if (!isNaN(num) && num > slotCounter) slotCounter = num;
                    });
                }
                if (data && Array.isArray(data.order)) {
                    mediaOrder = data.order;
                }
                if (data && data.linked_state && typeof data.linked_state === "object") {
                    linkedState = data.linked_state;
                }
            } catch (e) {}
        }
        setTimeout(() => {
            syncAutogrowSlots();
            lastLinkedSignature = "";
            render();
        }, 50);
    };

    const captureMaterialDrop = event => {
        const target = event.target instanceof Element ? event.target : null;
        const materialArea = target?.closest?.(".mmv-box");
        if (!materialArea || !root.contains(materialArea)) return;
        if (!event.dataTransfer?.types?.includes?.("Files")) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.type === "drop") accept(event.dataTransfer.files);
    };

    window.addEventListener("dragenter", captureMaterialDrop, true);
    window.addEventListener("dragover", captureMaterialDrop, true);
    window.addEventListener("drop", captureMaterialDrop, true);

    const oldRemoved = node.onRemoved;
    node.onRemoved = function (...args) {
        node._mmv_refresh = null;
        stopActivePlayingMedia();
        window.removeEventListener("dragenter", captureMaterialDrop, true);
        window.removeEventListener("dragover", captureMaterialDrop, true);
        window.removeEventListener("drop", captureMaterialDrop, true);
        return oldRemoved?.apply(this, args);
    };

    render();
    node.setSize([WIDTH, INITIAL_NODE_HEIGHT]);

    return true;
}

app.registerExtension({
    name: "AILab.MiniMaxH3.Vision",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name !== NODE) return;

        const previous = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const result = previous?.apply(this, arguments);
            if (!this._ghH3PanelReady && createPanel(this)) this._ghH3PanelReady = true;
            return result;
        };
    }
});
