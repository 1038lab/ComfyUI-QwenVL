import { app } from "/scripts/app.js";

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
                <div style="margin-top: 8px; border-top: 1px dashed rgba(255, 255, 255, 0.15); padding-top: 6px; flex: 1; display: flex; flex-direction: column; min-height: 60px; overflow: hidden;">
                    <span style="color: #2ed573; font-weight: 700; font-size: 11.5px; flex-shrink: 0;">• Registered in custom_models.json [${escapeHtml(data.registration.section)}]:</span>
                    <pre style="margin: 4px 0 0 0; padding: 6px 8px; background: rgba(0, 0, 0, 0.5); border-radius: 6px; color: #7bed9f; font-family: Consolas, Monaco, 'Courier New', monospace; font-size: 10.5px; line-height: 1.4; white-space: pre-wrap; word-break: break-all; flex: 1; overflow-y: auto;">${escapeHtml(regSnippet)}</pre>
                </div>
            `;
        }

        return `
            <div class="ailab-download-card" style="box-sizing: border-box; width: 100%; height: 100%; min-height: 100%; display: flex; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11.5px; line-height: 1.5; color: #f1f2f6; background: rgba(18, 26, 33, 0.95); border: 1px solid rgba(0, 210, 211, 0.35); border-radius: 8px; padding: 10px 12px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4); overflow: hidden;">
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding-bottom: 6px; margin-bottom: 8px; flex-shrink: 0;">
                    <span style="font-weight: 700; color: #00d2d3; font-size: 12px; letter-spacing: 0.3px;">
                        📥 QwenVL Downloader Summary
                    </span>
                    <span style="background: rgba(46, 213, 115, 0.2); color: #2ed573; border: 1px solid rgba(46, 213, 115, 0.5); padding: 1px 7px; border-radius: 10px; font-weight: 700; font-size: 10.5px;">
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
            <div class="ailab-download-card" style="box-sizing: border-box; width: 100%; height: 100%; min-height: 100%; display: flex; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11.5px; line-height: 1.5; color: #ff6b81; background: rgba(40, 18, 24, 0.95); border: 1px solid rgba(255, 71, 87, 0.5); border-radius: 8px; padding: 10px 12px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4); overflow: hidden;">
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 71, 87, 0.3); padding-bottom: 6px; margin-bottom: 8px; flex-shrink: 0;">
                    <span style="font-weight: 700; color: #ff4757; font-size: 12px;">❌ Download Failed</span>
                    <span style="background: rgba(255, 71, 87, 0.2); color: #ff4757; border: 1px solid rgba(255, 71, 87, 0.5); padding: 1px 7px; border-radius: 10px; font-weight: 700; font-size: 10.5px;">Error</span>
                </div>
                <div style="margin-bottom: 4px; flex-shrink: 0;">
                    <span style="color: #ffd32a; font-weight: 700;">• Repository:</span>
                    <span style="color: #ffffff; margin-left: 4px;">${escapeHtml(data.repo_id || "")}</span>
                </div>
                <div style="margin-top: 6px; padding: 6px 8px; background: rgba(0, 0, 0, 0.3); border-radius: 4px; color: #ff7675; font-family: Consolas, monospace; font-size: 11px; white-space: pre-wrap; word-break: break-all; flex: 1; overflow-y: auto;">
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
            resultHtml += `<div style="margin-bottom: 4px; flex-shrink: 0;"><span style="color: #ffd32a; font-weight: 700;">• Status:</span> <span style="color: #2ed573; font-weight: 700; background: rgba(46, 213, 115, 0.15); padding: 1px 6px; border-radius: 4px;">✅ Completed Successfully</span></div>`;
        } else if (line.startsWith("• Repository:")) {
            resultHtml += `<div style="margin-bottom: 4px; flex-shrink: 0;"><span style="color: #ffd32a; font-weight: 700;">• Repository:</span> <span style="color: #ffffff; font-weight: 600; margin-left: 4px;">${escapeHtml(line.replace("• Repository:", "").trim())}</span></div>`;
        } else if (line.startsWith("• Save Location:")) {
            resultHtml += `<div style="margin-bottom: 4px; word-break: break-all; flex-shrink: 0;"><span style="color: #ffd32a; font-weight: 700;">• Save Location:</span> <span style="color: #70a1ff; font-family: Consolas, Monaco, monospace; font-size: 11px; margin-left: 4px;">${escapeHtml(line.replace("• Save Location:", "").trim())}</span></div>`;
        } else if (line.startsWith("• Downloaded Files:")) {
            resultHtml += `<div style="margin-bottom: 2px; flex-shrink: 0;"><span style="color: #ffd32a; font-weight: 700;">• Downloaded Files:</span></div>`;
        } else if (line.trim().startsWith("- ")) {
            resultHtml += `<div style="margin-left: 12px; color: #d2dae2; font-family: Consolas, Monaco, monospace; font-size: 11px; flex-shrink: 0;">${escapeHtml(line.trim())}</div>`;
        } else if (line.includes("Registered to custom_models.json")) {
            resultHtml += `<div style="margin-top: 6px; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 4px; flex-shrink: 0;"><span style="color: #2ed573; font-weight: 700; font-size: 11px;">${escapeHtml(line)}</span></div>`;
        } else {
            resultHtml += `<div style="color: #a4b0be; font-family: Consolas, monospace; font-size: 10.5px;">${escapeHtml(line)}</div>`;
        }
    }
    return `<div class="ailab-download-card" style="box-sizing: border-box; width: 100%; height: 100%; min-height: 100%; display: flex; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11.5px; line-height: 1.5; color: #f1f2f6; background: rgba(18, 26, 33, 0.95); border: 1px solid rgba(0, 210, 211, 0.35); border-radius: 8px; padding: 10px 12px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4); overflow: auto;">${resultHtml}</div>`;
}

const BASE_INPUTS_HEIGHT = 184;
const INITIAL_NODE_HEIGHT = 188;

function syncContentSize(node, size) {
    const domWidget = node.widgets?.find((w) => w.name === "download_display");
    if (domWidget && domWidget.element) {
        const nodeH = size ? size[1] : (node.size ? node.size[1] : INITIAL_NODE_HEIGHT);
        const availableHeight = Math.max(120, Math.round(nodeH - BASE_INPUTS_HEIGHT));
        domWidget.element.style.height = `${availableHeight}px`;
    }
}

app.registerExtension({
    name: "AILab.HuggingFaceDownloader",

    nodeCreated(node) {
        if (node.comfyClass === "AILab_HuggingFaceDownloader") {
            requestAnimationFrame(() => {
                node.size = [Math.max(node.size?.[0] || 420, 420), INITIAL_NODE_HEIGHT];
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
                size[0] = Math.max(size[0], 360);
                size[1] = Math.max(size[1], INITIAL_NODE_HEIGHT);
                syncContentSize(this, size);
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
                        container.style.height = "100%";
                        container.style.margin = "0";
                        container.style.padding = "0 2px 4px 2px";
                        container.style.userSelect = "text";
                        container.style.cursor = "auto";
                        container.style.display = "flex";
                        container.style.flexDirection = "column";
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
                    }

                    if (domWidget && domWidget.element) {
                        domWidget.element.innerHTML = richHtml;

                        requestAnimationFrame(() => {
                            const card = domWidget.element.querySelector(".ailab-download-card") || domWidget.element;
                            const cardH = card ? (card.scrollHeight || card.offsetHeight) : 260;
                            const targetHeight = Math.ceil(BASE_INPUTS_HEIGHT + cardH + 10);
                            const targetWidth = Math.max(this.size ? this.size[0] : 420, 420);

                            this.size = [targetWidth, targetHeight];
                            syncContentSize(this, this.size);
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
