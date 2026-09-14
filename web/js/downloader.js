import { app } from "/scripts/app.js";

const COPY_ICON_SVG = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
const CHECK_ICON_SVG = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#38b26e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function buildRichSummaryHTML(data, rawText) {
    if (data && data.status === "success") {
        const filesListHtml = (data.files || [])
            .map((f) => `<div style="margin: 2px 0 2px 6px; color: #d2dae2; font-family: Consolas, Monaco, monospace; font-size: 11px;">• ${escapeHtml(f)}</div>`)
            .join("");

        let regHtml = "";
        if (data.registration && data.registration.entry) {
            const regSnippet = JSON.stringify({ [data.registration.key]: data.registration.entry }, null, 2);
            regHtml = `
                <div style="margin-top: 8px; border-top: 1px dashed rgba(255, 255, 255, 0.15); padding-top: 6px; flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; flex-shrink: 0;">
                        <span style="color: #38b26e; font-weight: 700; font-size: 11.5px;">• Registered in custom_models.json [${escapeHtml(data.registration.section)}]:</span>
                        <button type="button" class="ailab-copy-json-btn" title="Copy JSON configuration" style="box-sizing: border-box; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; color: #38b26e; background: rgba(46, 125, 50, 0.15); border: 1px solid rgba(56, 178, 110, 0.35); border-radius: 4px; cursor: pointer; transition: all 0.2s ease; outline: none; padding: 0;">
                            ${COPY_ICON_SVG}
                        </button>
                    </div>
                    <pre class="ailab-download-json-pre" style="margin: 0; padding: 8px 10px; background: rgba(0, 0, 0, 0.5); border-radius: 6px; color: #68d391; font-family: Consolas, Monaco, 'Courier New', monospace; font-size: 10.5px; line-height: 1.45; white-space: pre-wrap; word-break: break-all; flex: 1; min-height: 0; overflow-y: auto;">${escapeHtml(regSnippet)}</pre>
                </div>
            `;
        }

        return `
            <div class="ailab-download-card" style="box-sizing: border-box; width: 100%; height: 100%; display: flex; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11.5px; line-height: 1.5; color: #f1f2f6; background: rgba(18, 26, 33, 0.95); border: 1px solid rgba(0, 210, 211, 0.35); border-radius: 8px; padding: 10px 12px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4); overflow: hidden;">
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding-bottom: 6px; margin-bottom: 8px; flex-shrink: 0;">
                    <span style="font-weight: 700; color: #00d2d3; font-size: 12px; letter-spacing: 0.3px;">
                        📥 QwenVL Downloader Summary
                    </span>
                    <span style="background: rgba(46, 125, 50, 0.2); color: #38b26e; border: 1px solid rgba(56, 178, 110, 0.35); padding: 1px 8px; border-radius: 10px; font-weight: 700; font-size: 10.5px;">
                        ✅ Completed
                    </span>
                </div>
                <div style="margin-bottom: 4px; flex-shrink: 0;">
                    <span style="color: #ffd32a; font-weight: 700;">• Repository:</span>
                    <span style="color: #ffffff; font-weight: 600; margin-left: 4px;">${escapeHtml(data.repo_id)}</span>
                </div>
                <div style="margin-bottom: 4px; word-break: break-all; flex-shrink: 0;">
                    <span style="color: #ffd32a; font-weight: 700;">• Save Location:</span>
                    <span style="color: #70a1ff; font-family: Consolas, Monaco, monospace; font-size: 11px; margin-left: 4px;">${escapeHtml(data.save_folder)}</span>
                </div>
                <div style="margin-bottom: 4px; flex-shrink: 0;">
                    <span style="color: #ffd32a; font-weight: 700;">• Downloaded Files:</span>
                    <div style="margin-top: 2px;">${filesListHtml}</div>
                </div>
                ${regHtml}
            </div>
        `;
    } else if (data && data.status === "error") {
        return `
            <div class="ailab-download-card" style="box-sizing: border-box; width: 100%; height: 100%; display: flex; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11.5px; line-height: 1.5; color: #ff6b81; background: rgba(40, 18, 24, 0.95); border: 1px solid rgba(255, 71, 87, 0.5); border-radius: 8px; padding: 10px 12px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4); overflow: hidden;">
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 71, 87, 0.3); padding-bottom: 6px; margin-bottom: 8px; flex-shrink: 0;">
                    <span style="font-weight: 700; color: #ff4757; font-size: 12px;">❌ Download Failed</span>
                    <span style="background: rgba(255, 71, 87, 0.2); color: #ff4757; border: 1px solid rgba(255, 71, 87, 0.5); padding: 1px 7px; border-radius: 10px; font-weight: 700; font-size: 10.5px;">Error</span>
                </div>
                <div style="margin-bottom: 4px; flex-shrink: 0;">
                    <span style="color: #ffd32a; font-weight: 700;">• Repository:</span>
                    <span style="color: #ffffff; margin-left: 4px;">${escapeHtml(data.repo_id || "")}</span>
                </div>
                <div style="margin-top: 6px; padding: 6px 8px; background: rgba(0, 0, 0, 0.3); border-radius: 4px; color: #ff7675; font-family: Consolas, monospace; font-size: 11px; white-space: pre-wrap; word-break: break-all; flex: 1; min-height: 0; overflow-y: auto;">
                    ${escapeHtml(data.error || "Unknown error occurred")}
                </div>
            </div>
        `;
    }

    // Fallback: parse raw text with highlighting
    const lines = (rawText || "").split("\n");
    let resultHtml = "";
    for (let line of lines) {
        if (line.startsWith("==")) continue;
        if (line.includes("Download Summary")) {
            resultHtml += `<div style="font-weight: 700; color: #00d2d3; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 4px; margin-bottom: 6px; flex-shrink: 0;">${escapeHtml(line)}</div>`;
        } else if (line.includes("Status:") && line.includes("Completed")) {
            resultHtml += `<div style="margin-bottom: 4px; flex-shrink: 0;"><span style="color: #ffd32a; font-weight: 700;">• Status:</span> <span style="color: #38b26e; font-weight: 700; background: rgba(46, 125, 50, 0.2); padding: 1px 6px; border-radius: 4px;">✅ Completed Successfully</span></div>`;
        } else if (line.startsWith("• Repository:")) {
            resultHtml += `<div style="margin-bottom: 4px; flex-shrink: 0;"><span style="color: #ffd32a; font-weight: 700;">• Repository:</span> <span style="color: #ffffff; font-weight: 600; margin-left: 4px;">${escapeHtml(line.replace("• Repository:", "").trim())}</span></div>`;
        } else if (line.startsWith("• Save Location:")) {
            resultHtml += `<div style="margin-bottom: 4px; word-break: break-all; flex-shrink: 0;"><span style="color: #ffd32a; font-weight: 700;">• Save Location:</span> <span style="color: #70a1ff; font-family: Consolas, Monaco, monospace; font-size: 11px; margin-left: 4px;">${escapeHtml(line.replace("• Save Location:", "").trim())}</span></div>`;
        } else if (line.startsWith("• Downloaded Files:")) {
            resultHtml += `<div style="margin-bottom: 2px; flex-shrink: 0;"><span style="color: #ffd32a; font-weight: 700;">• Downloaded Files:</span></div>`;
        } else if (line.trim().startsWith("- ")) {
            resultHtml += `<div style="margin-left: 12px; color: #d2dae2; font-family: Consolas, Monaco, monospace; font-size: 11px; flex-shrink: 0;">${escapeHtml(line.trim())}</div>`;
        } else if (line.includes("Registered to custom_models.json")) {
            resultHtml += `<div style="margin-top: 6px; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 4px; flex-shrink: 0;"><span style="color: #38b26e; font-weight: 700; font-size: 11px;">${escapeHtml(line)}</span></div>`;
        } else {
            resultHtml += `<div style="color: #a4b0be; font-family: Consolas, monospace; font-size: 10.5px;">${escapeHtml(line)}</div>`;
        }
    }
    return `<div class="ailab-download-card" style="box-sizing: border-box; width: 100%; height: 100%; display: flex; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11.5px; line-height: 1.5; color: #f1f2f6; background: rgba(18, 26, 33, 0.95); border: 1px solid rgba(0, 210, 211, 0.35); border-radius: 8px; padding: 10px 12px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4); overflow: auto;">${resultHtml}</div>`;
}

function getInputsBottom(node) {
    if (!node.widgets || node.widgets.length === 0) return 210;
    let maxBottom = 0;
    for (const w of node.widgets) {
        if (w.name === "download_display") continue;
        if (typeof w.last_y === "number") {
            const h = (typeof w.computeSize === "function" ? w.computeSize(node.size[0])[1] : w.height) || 26;
            maxBottom = Math.max(maxBottom, w.last_y + h);
        }
    }
    return maxBottom > 50 ? maxBottom + 10 : 210;
}

const INITIAL_NODE_HEIGHT = 214;

app.registerExtension({
    name: "AILab.HuggingFaceDownloader",

    nodeCreated(node) {
        if (node.comfyClass === "AILab_HuggingFaceDownloader") {
            requestAnimationFrame(() => {
                node.size = [Math.max(node.size?.[0] || 440, 440), INITIAL_NODE_HEIGHT];
                if (typeof node.setSize === "function") {
                    node.setSize(node.size);
                }
                app.graph?.setDirtyCanvas(true, true);
            });
        }
    },

    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "AILab_HuggingFaceDownloader") {
            const origOnResize = nodeType.prototype.onResize;
            nodeType.prototype.onResize = function (size) {
                origOnResize?.apply(this, arguments);
                size[0] = Math.max(size[0], 380);
                const inputsBottom = getInputsBottom(this);
                const domWidget = this.widgets?.find((w) => w.name === "download_display");

                if (domWidget && domWidget.element) {
                    const minH = inputsBottom + 160;
                    size[1] = Math.max(size[1], minH);
                    const availH = Math.max(size[1] - inputsBottom - 16, 120);
                    domWidget.element.style.height = `${availH}px`;
                } else {
                    size[1] = Math.max(size[1], INITIAL_NODE_HEIGHT);
                }
            };

            const onExecuted = nodeType.prototype.onExecuted;
            nodeType.prototype.onExecuted = function (message) {
                onExecuted?.apply(this, arguments);

                const rawText = Array.isArray(message?.text) ? message.text.join("\n") : (message?.text || "");
                const summaryData = Array.isArray(message?.summary) ? message.summary[0] : message?.summary;

                if (rawText || summaryData) {
                    const richHtml = buildRichSummaryHTML(summaryData, rawText);

                    let domWidget = this.widgets?.find((w) => w.name === "download_display");

                    if (!domWidget) {
                        const container = document.createElement("div");
                        container.className = "ailab-download-display-container";
                        container.style.boxSizing = "border-box";
                        container.style.width = "100%";
                        container.style.margin = "0";
                        container.style.padding = "0 2px 4px 2px";
                        container.style.userSelect = "text";
                        container.style.cursor = "auto";
                        container.style.overflow = "hidden";

                        domWidget = this.addDOMWidget("download_display", "display_element", container, {
                            getValue() {
                                return container.innerHTML;
                            },
                            setValue(val) {
                                container.innerHTML = val;
                            },
                        });
                        domWidget.element = container;
                        domWidget.serialize = false;
                        if (domWidget.options) {
                            domWidget.options.serialize = false;
                        }

                        domWidget.computeSize = function (width) {
                            return [width, 160];
                        };
                    }

                    if (domWidget && domWidget.element) {
                        domWidget.element.innerHTML = richHtml;

                        // Wire up the muted green copy JSON button (symmetrical with Completed badge)
                        const copyBtn = domWidget.element.querySelector(".ailab-copy-json-btn");
                        if (copyBtn && summaryData?.registration?.entry) {
                            const regSnippet = JSON.stringify({ [summaryData.registration.key]: summaryData.registration.entry }, null, 2);
                            copyBtn.onclick = async (e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                try {
                                    if (navigator.clipboard && navigator.clipboard.writeText) {
                                        await navigator.clipboard.writeText(regSnippet);
                                    } else {
                                        const ta = document.createElement("textarea");
                                        ta.value = regSnippet;
                                        ta.style.position = "fixed";
                                        ta.style.opacity = "0";
                                        document.body.appendChild(ta);
                                        ta.select();
                                        document.execCommand("copy");
                                        document.body.removeChild(ta);
                                    }

                                    // Smooth icon and color transition: green checkmark, zero layout jitter
                                    copyBtn.innerHTML = CHECK_ICON_SVG;
                                    copyBtn.style.color = "#38b26e";
                                    copyBtn.style.borderColor = "rgba(56, 178, 110, 0.6)";
                                    copyBtn.style.background = "rgba(46, 125, 50, 0.25)";

                                    setTimeout(() => {
                                        copyBtn.innerHTML = COPY_ICON_SVG;
                                        copyBtn.style.color = "#38b26e";
                                        copyBtn.style.borderColor = "rgba(56, 178, 110, 0.35)";
                                        copyBtn.style.background = "rgba(46, 125, 50, 0.15)";
                                    }, 1200);
                                } catch (err) {
                                    console.error("[QwenVL Downloader] Copy failed:", err);
                                }
                            };
                            copyBtn.onmouseenter = () => {
                                if (!copyBtn.innerHTML.includes("polyline")) {
                                    copyBtn.style.color = "#4cd98a";
                                    copyBtn.style.background = "rgba(46, 125, 50, 0.28)";
                                    copyBtn.style.borderColor = "rgba(76, 217, 138, 0.5)";
                                }
                            };
                            copyBtn.onmouseleave = () => {
                                if (!copyBtn.innerHTML.includes("polyline")) {
                                    copyBtn.style.color = "#38b26e";
                                    copyBtn.style.background = "rgba(46, 125, 50, 0.15)";
                                    copyBtn.style.borderColor = "rgba(56, 178, 110, 0.35)";
                                }
                            };
                        }

                        requestAnimationFrame(() => {
                            const inputsBottom = getInputsBottom(this);

                            // Calculate deterministic height directly from content to avoid DOM scrollHeight feedback loop
                            let neededCardHeight = 365;
                            if (summaryData?.registration?.entry) {
                                const jsonSnippet = JSON.stringify({ [summaryData.registration.key]: summaryData.registration.entry }, null, 2);
                                const lines = jsonSnippet.split("\n").length;
                                const fileCount = (summaryData.files || []).length || 1;
                                neededCardHeight = Math.max(155 + (fileCount * 18) + (lines * 16.5) + 30, 385);
                            } else {
                                const card = domWidget.element.querySelector(".ailab-download-card");
                                neededCardHeight = card ? Math.max(card.scrollHeight, 240) : 260;
                            }

                            const targetHeight = Math.ceil(inputsBottom + neededCardHeight + 16);
                            const targetWidth = Math.max(this.size ? this.size[0] : 440, 440);

                            domWidget.element.style.height = `${neededCardHeight}px`;

                            this.size = [targetWidth, targetHeight];
                            if (typeof this.setSize === "function") {
                                this.setSize([targetWidth, targetHeight]);
                            }
                            this.setDirtyCanvas?.(true, true);
                            app.graph?.setDirtyCanvas(true, true);
                        });
                    }
                }
            };
        }
    },
});
