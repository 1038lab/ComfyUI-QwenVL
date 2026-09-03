// web/js/minimax-settings.js
import { app } from "/scripts/app.js";

// -- Dependencies & Styles --
const style = document.createElement("style");
style.textContent = `
    .minimax-settings-container {
        font-family: var(--font-family, sans-serif);
        font-size: 14px;
        color: var(--input-text, #ddd);
        background: var(--comfy-menu-bg, #222);
        padding: 0;
        width: 100%;
        min-width: 650px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .minimax-card {
        background: var(--comfy-input-bg, #111);
        border: 1px solid var(--border-color, #444);
        padding: 12px;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .minimax-provider-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255, 255, 255, 0.05);
        padding: 8px;
        border-radius: 4px;
    }
    .minimax-provider-row .info {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    .minimax-provider-row .info strong {
        font-size: 14px;
        color: var(--comfy-primary, #6c5ce7);
    }
    .minimax-provider-row .info small {
        font-size: 11px;
        color: #888;
    }
    .minimax-options-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
    }
    .minimax-btn {
        background: var(--comfy-button-bg, #333);
        border: 1px solid var(--border-color, #555);
        color: var(--input-text, #ccc);
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: 0.2s;
    }
    .minimax-btn:hover {
        background: var(--comfy-button-hover-bg, #444);
    }
    .minimax-btn.primary {
        background: var(--comfy-primary, #6c5ce7);
        border-color: #6c5ce7;
        color: white;
    }
    .minimax-input-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .minimax-input-group label {
        font-size: 12px;
        color: #aaa;
    }
    .minimax-input-group input, .minimax-input-group select {
        padding: 6px;
        background: var(--comfy-input-bg, #222);
        border: 1px solid var(--border-color, #555);
        color: var(--input-text, #ddd);
        border-radius: 4px;
        outline: none;
    }
    .minimax-inline-form {
        border-top: 1px dashed #444;
        padding-top: 12px;
        margin-top: 8px;
        animation: mm-fadein 0.3s ease;
    }
    @keyframes mm-fadein { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

    /* ComfyUI Native Toggle */
    .minimax-toggle {
        position: relative;
        display: inline-block;
        width: 32px;
        height: 18px;
        flex-shrink: 0;
    }
    .minimax-toggle input { display: none; }
    .minimax-toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: var(--border-color, #444);
        transition: .2s;
        border-radius: 18px;
    }
    .minimax-toggle-slider:before {
        position: absolute;
        content: "";
        height: 12px;
        width: 12px;
        left: 3px;
        bottom: 3px;
        background-color: var(--input-text, #ccc);
        transition: .2s;
        border-radius: 50%;
    }
    .minimax-toggle input:checked + .minimax-toggle-slider {
        background-color: #5599ff; /* ComfyUI standard blue override */
    }
    .minimax-toggle input:checked + .minimax-toggle-slider:before {
        transform: translateX(14px);
        background-color: #111;
    }
`;
document.head.appendChild(style);

async function fetchConfig() {
    try {
        const resp = await fetch("/minimax-h3/get_config");
        if (resp.ok) return await resp.json();
    } catch (e) { console.error("[MiniMax] Failed to fetch config", e); }
    return { providers: {}, defaults: {} };
}

async function saveConfig(cfg) {
    try {
        const resp = await fetch("/minimax-h3/save_config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cfg),
        });
        const res = await resp.json();
        if (res.status === "success") {
            return true;
        } else {
            alert("Error saving config: " + res.message);
        }
    } catch (e) {
        alert("Error saving config.");
    }
    return false;
}

function createSelect(options, currentVal, onChange) {
    const sel = document.createElement("select");
    options.forEach(o => {
        const opt = document.createElement("option");
        if (typeof o === "string") {
            opt.value = o;
            opt.textContent = o;
        } else {
            opt.value = o.value;
            opt.textContent = o.text;
        }
        if (currentVal === opt.value) opt.selected = true;
        sel.appendChild(opt);
    });
    sel.onchange = onChange;
    return sel;
}

function createInput(type, currentVal, onChange) {
    const ipt = document.createElement("input");
    ipt.type = type;
    ipt.value = currentVal;
    ipt.onchange = onChange;
    return ipt;
}

async function performTestConnection({ type, api_base, api_key, model }, btnElement) {
    btnElement.innerHTML = "<i class='pi pi-spin pi-spinner'></i> Testing...";
    try {
        const resp = await fetch("/minimax-h3/test_connection", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, api_base, api_key, model })
        });
        const res = await resp.json();
        if (res.status === "success") {
            btnElement.innerHTML = "<i class='pi pi-check'></i> OK";
            btnElement.style.color = "#4ade80";
            btnElement.title = res.message || "Connection & Model Verified";
        } else {
            btnElement.innerHTML = "<i class='pi pi-times'></i> Fail";
            btnElement.style.color = "#f87171";
            btnElement.title = res.message || "Connection Failed";
            alert(res.message);
        }
    } catch (e) {
        btnElement.innerHTML = "<i class='pi pi-exclamation-triangle'></i> Error";
        btnElement.style.color = "#f87171";
    }
    setTimeout(() => {
        btnElement.innerHTML = "<i class='pi pi-sort-alt'></i> Test";
        btnElement.style.color = "";
        btnElement.title = "";
    }, 4000);
}

function buildDefaultsCard(nodeTitle, nodePrefix, config, container) {
    if (!config.defaults) config.defaults = {};
    const card = document.createElement("div");
    card.className = "minimax-card";

    const row = document.createElement("div");
    row.className = "minimax-provider-row";

    const currentProvKey = config.defaults[`${nodePrefix}_provider`];
    const currentProv = config.providers[currentProvKey];
    let currentProvName = currentProvKey;
    if (currentProv) {
        currentProvName = currentProv.name || currentProvKey;
        if (currentProv.model && !currentProvName.toLowerCase().includes(currentProv.model.toLowerCase())) {
            currentProvName += ` (${currentProv.model})`;
        }
    }

    row.innerHTML = `
        <div class="info">
            <strong>${nodeTitle}</strong>
            <small>Current: <span style="color:var(--input-text);">${currentProvName || 'None'}</span></small>
        </div>
    `;

    const actions = document.createElement("div");
    actions.className = "actions";
    const editBtn = document.createElement("button");
    editBtn.className = "minimax-btn";
    editBtn.innerHTML = "<i class='pi pi-pencil'></i> Edit";
    actions.appendChild(editBtn);
    row.appendChild(actions);
    card.appendChild(row);

    const grid = document.createElement("div");
    grid.className = "minimax-options-grid";
    grid.style.display = "none";
    grid.style.borderTop = "1px dashed var(--border-color, #444)";
    grid.style.paddingTop = "12px";
    grid.style.marginTop = "8px";
    card.appendChild(grid);

    editBtn.onclick = () => {
        grid.style.display = grid.style.display === "none" ? "grid" : "none";
    };

    const saveTrigger = async () => {
        if (await saveConfig(config)) renderSettingsPanel(container, config);
    };

    const provOptions = Object.keys(config.providers || {})
        .map(k => {
            const pcfg = config.providers[k];
            const rawName = pcfg.name || k;
            const model = pcfg.model || "";
            let cleanName = rawName;
            if (model && cleanName.toLowerCase().endsWith(`(${model.toLowerCase()})`)) {
                cleanName = cleanName.slice(0, -`(${model})`.length).trim();
            }
            const text = (model && !cleanName.toLowerCase().includes(model.toLowerCase()))
                ? `${cleanName} (${model})`
                : cleanName;
            return {
                value: k,
                text: text
            };
        })
        .sort((a, b) => a.text.localeCompare(b.text));

    // Provider
    const groupProv = document.createElement("div");
    groupProv.className = "minimax-input-group";
    groupProv.innerHTML = `<label>Provider</label>`;
    const selProv = createSelect(provOptions, config.defaults[`${nodePrefix}_provider`], (e) => {
        const selectedKey = e.target.value;
        config.defaults[`${nodePrefix}_provider`] = selectedKey;
        const selectedProv = config.providers[selectedKey];
        if (selectedProv && selectedProv.model) {
            config.defaults[`${nodePrefix}_model`] = selectedProv.model;
        }
        saveTrigger();
    });
    groupProv.appendChild(selProv);
    grid.appendChild(groupProv);

    // Max Tokens
    const groupTok = document.createElement("div");
    groupTok.className = "minimax-input-group";
    groupTok.innerHTML = `<label>Max Tokens</label>`;
    const iptTok = createInput("number", config.defaults[`${nodePrefix}_max_tokens`] || 4096, (e) => {
        config.defaults[`${nodePrefix}_max_tokens`] = parseInt(e.target.value) || 4096;
        saveTrigger();
    });
    groupTok.appendChild(iptTok);
    grid.appendChild(groupTok);

    // Temperature
    const groupTemp = document.createElement("div");
    groupTemp.className = "minimax-input-group";
    groupTemp.innerHTML = `<label>Temperature</label>`;
    const iptTemp = createInput("number", config.defaults[`${nodePrefix}_temperature`] || (nodePrefix === 'vision' ? 0.2 : 0.7), (e) => {
        config.defaults[`${nodePrefix}_temperature`] = parseFloat(e.target.value) || (nodePrefix === 'vision' ? 0.2 : 0.7);
        saveTrigger();
    });
    iptTemp.step = "0.05";
    iptTemp.min = "0";
    iptTemp.max = "1";
    groupTemp.appendChild(iptTemp);
    grid.appendChild(groupTemp);

    return card;
}

function renderSettingsPanel(container, config) {
    container.innerHTML = "";

    // Hack: Break out of ComfyUI's strict table columns
    setTimeout(() => {
        const tr = container.closest('tr');
        if (tr) {
            tr.style.display = 'flex';
            tr.style.width = '100%';
            tr.style.padding = '10px 0';
            const labelTd = tr.querySelector('td:first-child');
            if (labelTd) labelTd.style.display = 'none';
            const ourTd = tr.querySelector('td:last-child');
            if (ourTd) {
                ourTd.style.width = '100%';
                ourTd.style.textAlign = 'left';
            }
        }
    }, 10);

    // --- DEFAULTS ---
    const flexRow = document.createElement("div");
    flexRow.style.cssText = "display: flex; flex-direction: column; gap: 12px;";

    flexRow.appendChild(buildDefaultsCard("Vision Node Defaults", "vision", config, container));
    flexRow.appendChild(buildDefaultsCard("Promptor Node Defaults", "promptor", config, container));
    container.appendChild(flexRow);

    // --- PROVIDERS LIST CARD ---
    const provCard = document.createElement("div");
    provCard.className = "minimax-card";
    provCard.innerHTML = `<div style="font-weight:bold; margin-bottom: 8px;">LLM Providers</div>`;

    const provList = document.createElement("div");
    provList.style.display = "flex";
    provList.style.flexDirection = "column";
    provList.style.gap = "6px";

    // Sort providers alphabetically by display name (or name + model)
    const providers = Object.keys(config.providers || {}).sort((a, b) => {
        const pA = config.providers[a] || {};
        const pB = config.providers[b] || {};
        const nameA = (pA.name || a).toLowerCase();
        const nameB = (pB.name || b).toLowerCase();
        const modelA = (pA.model || '').toLowerCase();
        const modelB = (pB.model || '').toLowerCase();
        return nameA.localeCompare(nameB) || modelA.localeCompare(modelB);
    });

    providers.forEach(p => {
        const row = document.createElement("div");
        row.className = "minimax-provider-row";
        const data = config.providers[p];
        if (data.enabled === false) {
            row.style.opacity = "0.4";
            row.style.filter = "grayscale(100%)";
        }

        // Backward compatibility: If it doesn't have a name property, fallback to the key 'p'
        const displayName = data.name || p;

        row.innerHTML = `
            <div class="info" style="display:flex; flex-direction:row; align-items:center; gap:12px;">
                <label class="minimax-toggle" title="Enable/Disable Provider">
                    <input type="checkbox" class="minimax-quick-enable" ${data.enabled !== false ? 'checked' : ''} />
                    <span class="minimax-toggle-slider"></span>
                </label>
                <div style="display:flex; flex-direction:column; gap:2px;">
                    <strong>${displayName.toUpperCase()} <span style="font-size:10px; font-weight:normal; background:#444; padding:2px 4px; border-radius:3px;">${data.type || 'openai'}</span></strong>
                    <small>Model: ${data.model || data.default_model || ""}</small>
                </div>
            </div>
        `;

        const toggle = row.querySelector('.minimax-quick-enable');
        toggle.onchange = async (e) => {
            config.providers[p].enabled = e.target.checked;
            if (await saveConfig(config)) renderSettingsPanel(container, config);
        };

        const actions = document.createElement("div");
        actions.className = "minimax-actions";

        const testBtn = document.createElement("button");
        testBtn.className = "minimax-btn";
        testBtn.innerHTML = "<i class='pi pi-sort-alt'></i> Test";
        testBtn.onclick = () => performTestConnection({
            type: data.type || 'openai',
            api_base: data.api_base,
            api_key: data.api_key,
            model: data.model || data.default_model || ''
        }, testBtn);

        const editBtn = document.createElement("button");
        editBtn.className = "minimax-btn";
        editBtn.innerHTML = "<i class='pi pi-pencil'></i> Edit";
        editBtn.onclick = () => renderEditor(provCard, p, data, config, container);

        const delBtn = document.createElement("button");
        delBtn.className = "minimax-btn";
        delBtn.innerHTML = "<i class='pi pi-trash'></i> Delete";
        delBtn.onclick = async () => {
            if (confirm('Delete provider: ' + p + '?')) {
                delete config.providers[p];
                if (await saveConfig(config)) renderSettingsPanel(container, config);
            }
        };

        actions.appendChild(testBtn);
        actions.appendChild(editBtn);
        if (providers.length > 1) actions.appendChild(delBtn);
        row.appendChild(actions);
        provList.appendChild(row);
    });
    provCard.appendChild(provList);

    const addBtn = document.createElement("button");
    addBtn.className = "minimax-btn";
    addBtn.style.marginTop = "8px";
    addBtn.innerHTML = "<i class='pi pi-plus'></i> Add Custom Provider";
    addBtn.onclick = () => renderEditor(provCard, "", { api_base: "", api_key: "", model: "", type: "openai" }, config, container, true);
    provCard.appendChild(addBtn);

    container.appendChild(provCard);
}

async function fetchLocalModels() {
    try {
        const resp = await fetch("/minimax-h3/local_models");
        if (resp.ok) return await resp.json();
    } catch (e) {
        console.error("[MiniMax] Failed to fetch local models", e);
    }
    return { status: "error", installed: false, models: [] };
}

function renderEditor(parentCard, pName, pData, config, mainContainer, isNew = false) {
    const existing = parentCard.querySelector(".minimax-inline-form");
    if (existing) existing.remove();

    const form = document.createElement("div");
    form.className = "minimax-inline-form";

    // For backward compatibility, if it's not new and has no name, we default to showing the key pName
    const displayValue = pData.name || (isNew ? '' : pName);
    const isLocal = (pData.type === 'local_llm' || pData.type === 'qwenvl');

    form.innerHTML = `
        <div class="minimax-options-grid">
            <div class="minimax-input-group">
                <label>Display Name <small>(Multiple identical names allowed)</small></label>
                <input type="text" id="mm-f-name" value="${displayValue}" placeholder="e.g. openrouter" />
            </div>
            <div class="minimax-input-group">
                <label>Provider Type <small>(Internal logic format)</small></label>
                <select id="mm-f-type">
                    <option value="openai" ${pData.type === 'openai' ? 'selected' : ''}>openai</option>
                    <option value="ollama" ${pData.type === 'ollama' ? 'selected' : ''}>ollama</option>
                    <option value="gemini" ${pData.type === 'gemini' ? 'selected' : ''}>gemini</option>
                    <option value="anthropic" ${(pData.type === 'claude' || pData.type === 'anthropic') ? 'selected' : ''}>anthropic</option>
                    <option value="qwenvl" ${isLocal ? 'selected' : ''}>ComfyUI-QwenVL (Local / GGUF)</option>
                </select>
            </div>
        </div>

        <!-- Cloud credentials (Hidden for local_llm) -->
        <div id="mm-cloud-fields" style="display:${isLocal ? 'none' : 'block'};">
            <div class="minimax-input-group" style="margin-top:8px;">
                <label>API Base URL</label>
                <input type="text" id="mm-f-base" value="${pData.api_base || ''}" placeholder="http://localhost:5000/v1" />
            </div>
            <div class="minimax-input-group" style="margin-top:8px;">
                <label>API Key</label>
                <input type="password" id="mm-f-key" value="${pData.api_key || ''}" placeholder="sk-..." />
            </div>
            <div class="minimax-input-group" style="margin-top:8px;">
                <label>Model ID</label>
                <input type="text" id="mm-f-model" value="${pData.model || pData.default_model || ''}" placeholder="e.g. gpt-4" />
            </div>
        </div>

        <!-- Local engine section (Shown for local_llm) -->
        <div id="mm-local-fields" style="display:${isLocal ? 'block' : 'none'}; margin-top:8px; padding:10px; background:rgba(0,0,0,0.25); border-radius:6px; border:1px solid #444;">
            <div id="mm-engine-status" style="font-size:12px; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                <i class="pi pi-spin pi-spinner"></i> Checking local engine...
            </div>
            <div class="minimax-input-group">
                <label>Select Local Model <small>(Loaded from ComfyUI-QwenVL custom_models.json, gguf_models.json & hf_models.json)</small></label>
                <select id="mm-f-local-model-select" style="padding:6px; background:var(--comfy-input-bg, #222); color:#ddd; border:1px solid #555; border-radius:4px; width:100%;">
                    <option value="">Loading models...</option>
                </select>
            </div>
        </div>

        <div class="minimax-options-grid" style="margin-top:8px;">
            <div class="minimax-input-group" title="Max images sent per API call. 1 = Sequential mode. 4+ = Batch mode (ideal for APIs).">
                <label>Max Batch Images</label>
                <input type="number" id="mm-f-batch-size" value="${pData.batch_size !== undefined ? pData.batch_size : (pData.batch_vision === false ? 1 : 4)}" min="1" max="50" style="padding: 6px;" />
            </div>
        </div>
        <div style="margin-top:12px; display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
            <div style="display:flex; align-items:center; gap:6px;">
                <label class="minimax-toggle">
                    <input type="checkbox" id="mm-f-enabled" ${pData.enabled !== false ? 'checked' : ''} />
                    <span class="minimax-toggle-slider"></span>
                </label>
                <label style="margin:0; font-weight:bold; font-size:13px; color:var(--input-text);">Enabled</label>
            </div>
            <div id="mm-thinking-container" style="display:${(pData.type === 'ollama' || isLocal) ? 'none' : 'flex'}; align-items:center; gap:6px;" title="Disables deep thinking/reasoning mode on compatible models (e.g. SiliconFlow, DeepSeek, Qwen3, Gemini) to prevent token waste and timeouts.">
                <label class="minimax-toggle">
                    <input type="checkbox" id="mm-f-disable-thinking" ${pData.disable_thinking !== false ? 'checked' : ''} />
                    <span class="minimax-toggle-slider"></span>
                </label>
                <label style="margin:0; font-weight:bold; font-size:13px; color:var(--input-text);">Disable Thinking (Fast)</label>
            </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top: 12px;">
            <button type="button" class="minimax-btn" id="mm-btn-test-edit"><i class='pi pi-sort-alt'></i> Test Connection</button>
            <button type="button" class="minimax-btn" id="mm-btn-cancel">Cancel</button>
            <button type="button" class="minimax-btn primary" id="mm-btn-save"><i class='pi pi-save'></i> Save & Apply</button>
        </div>
    `;

    parentCard.appendChild(form);

    async function loadLocalModels() {
        const statusEl = document.getElementById("mm-engine-status");
        const selectEl = document.getElementById("mm-f-local-model-select");
        if (!statusEl || !selectEl) return;

        statusEl.innerHTML = "<i class='pi pi-spin pi-spinner'></i> Scanning ComfyUI-QwenVL models...";
        const data = await fetchLocalModels();
        if (data.installed) {
            const count = data.models ? data.models.length : 0;
            const downloadedCount = data.downloaded_count || (data.models ? data.models.filter(m => m.downloaded).length : 0);
            statusEl.innerHTML = `<span style="color:#4ade80;"><i class="pi pi-check-circle"></i> ComfyUI-QwenVL Engine Detected (${count} models in catalog, <strong>${downloadedCount} downloaded & ready</strong>)</span>`;
        } else {
            statusEl.innerHTML = `<span style="color:#f87171;"><i class="pi pi-exclamation-triangle"></i> ComfyUI-QwenVL custom node not found. Please install ComfyUI-QwenVL from ComfyUI Manager.</span>`;
        }

        selectEl.innerHTML = "";
        const savedModel = (pData.model || pData.default_model || "").trim();

        if (data.models && data.models.length > 0) {
            data.models.forEach((m, idx) => {
                const opt = document.createElement("option");
                const mId = m.id || m.name || m.file;
                const isReady = m.downloaded === true;
                const sizeInfo = m.size_mb ? ` (${m.size_mb} MB)` : "";
                const formatTag = m.format ? ` [${m.format.toUpperCase()}]` : "";
                const typeTag = m.type ? ` [${m.type.toUpperCase()}]` : "";

                if (isReady) {
                    opt.textContent = `🟢 [Ready] ${m.name}${sizeInfo}${formatTag}${typeTag}`;
                    opt.style.color = "#4ade80";
                    opt.style.fontWeight = "600";
                } else {
                    opt.textContent = `⬇️ [Not Downloaded] ${m.name}${formatTag}${typeTag}`;
                    opt.style.color = "#9ca3af";
                }

                opt.value = mId;
                if (mId === savedModel || (!savedModel && idx === 0)) {
                    opt.selected = true;
                    if (isNew && idx === 0) {
                        const nameInput = document.getElementById("mm-f-name");
                        if (nameInput && !nameInput.value) {
                            nameInput.value = mId.replace(/\.gguf$/i, "").toLowerCase();
                        }
                    }
                }
                selectEl.appendChild(opt);
            });

            selectEl.onchange = (e) => {
                const selectedOpt = selectEl.options[selectEl.selectedIndex];
                if (!selectedOpt || !selectedOpt.value) return;
                const modelName = selectedOpt.value.replace(/\.gguf$/i, "").toLowerCase();
                const nameInput = document.getElementById("mm-f-name");
                if (nameInput) {
                    nameInput.value = modelName;
                }
            };
        } else {
            const opt = document.createElement("option");
            opt.value = "";
            opt.disabled = true;
            opt.selected = true;
            opt.textContent = data.installed 
                ? "No models found in custom_models.json / gguf_models.json" 
                : "ComfyUI-QwenVL not installed";
            selectEl.appendChild(opt);
        }
    }

    if (isLocal) {
        loadLocalModels();
    }

    const typeSelect = document.getElementById("mm-f-type");
    if (typeSelect) {
        typeSelect.onchange = (e) => {
            const localMode = e.target.value === "local_llm" || e.target.value === "qwenvl";
            const thinkingCont = document.getElementById("mm-thinking-container");
            const cloudFields = document.getElementById("mm-cloud-fields");
            const localFields = document.getElementById("mm-local-fields");
            
            if (thinkingCont) {
                thinkingCont.style.display = (e.target.value === "ollama" || localMode) ? "none" : "flex";
            }
            if (cloudFields) cloudFields.style.display = localMode ? "none" : "block";
            if (localFields) localFields.style.display = localMode ? "block" : "none";

            if (localMode) {
                loadLocalModels();
            }
        };
    }

    const cloudModelInput = document.getElementById("mm-f-model");
    if (cloudModelInput) {
        cloudModelInput.oninput = (e) => {
            const nameInput = document.getElementById("mm-f-name");
            if (nameInput && isNew) {
                nameInput.value = e.target.value.trim().toLowerCase();
            }
        };
    }

    document.getElementById("mm-btn-test-edit").onclick = () => {
        const testBtn = document.getElementById("mm-btn-test-edit");
        const curType = document.getElementById("mm-f-type").value;
        const curIsLocal = curType === "local_llm" || curType === "qwenvl";
        const curModel = curIsLocal 
            ? (document.getElementById("mm-f-local-model-select") ? document.getElementById("mm-f-local-model-select").value : "")
            : document.getElementById("mm-f-model").value.trim();

        performTestConnection({
            type: curType,
            api_base: curIsLocal ? "" : document.getElementById("mm-f-base").value.trim(),
            api_key: curIsLocal ? "" : document.getElementById("mm-f-key").value.trim(),
            model: curModel
        }, testBtn);
    };

    document.getElementById("mm-btn-cancel").onclick = () => form.remove();
    document.getElementById("mm-btn-save").onclick = async () => {
        const title = document.getElementById("mm-f-name").value.trim().toLowerCase();
        if (!title) return alert("Display name is required");

        const curType = document.getElementById("mm-f-type").value;
        const curIsLocal = curType === "local_llm" || curType === "qwenvl";
        const curModel = curIsLocal 
            ? (document.getElementById("mm-f-local-model-select") ? document.getElementById("mm-f-local-model-select").value : "")
            : document.getElementById("mm-f-model").value.trim();

        let pId = pName;
        // Generate UUID if it's a completely new provider
        if (isNew) {
            pId = "prov_" + Date.now();
        }

        config.providers[pId] = {
            name: title,
            type: curType,
            api_base: curIsLocal ? "" : document.getElementById("mm-f-base").value.trim(),
            api_key: curIsLocal ? "" : document.getElementById("mm-f-key").value.trim(),
            model: curModel,
            enabled: document.getElementById("mm-f-enabled").checked,
            disable_thinking: document.getElementById("mm-f-disable-thinking").checked,
            batch_size: parseInt(document.getElementById("mm-f-batch-size").value, 10) || 4
        };

        if (await saveConfig(config)) {
            renderSettingsPanel(mainContainer, config);
        }
    };
}

const minimaxSettings = [
    {
        id: "MiniMaxH3.ApiManagement",
        name: " ", // Hides the original left-col name
        category: ["🎞️ MiniMax H3", "MiniMax H3 Prtomptor API Settings"],
        type: () => {
            const container = document.createElement("div");
            container.className = "minimax-settings-container";
            container.textContent = "Loading configuration...";

            fetchConfig().then(cfg => {
                if (!cfg.providers) cfg.providers = {};
                if (!cfg.defaults) cfg.defaults = {};
                renderSettingsPanel(container, cfg);
            });

            return container;
        },
    },
];

app.registerExtension({
    name: "MiniMaxH3.Settings",
    settings: minimaxSettings,
    setup() {
        if (app.ui?.settings?.addSetting) {
            minimaxSettings.forEach(s => app.ui.settings.addSetting(s));
        }
    },
});
