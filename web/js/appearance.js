import { app } from "/scripts/app.js";

const COLOR_THEMES = {
    QwenVL: { nodeColor: "#28403f", nodeBgColor: "#374539", width: 340 },
    QwenVLGGUF: { nodeColor: "#474539", nodeBgColor: "#2c4045", width: 340 },
    Tools: { nodeColor: "#28403f", nodeBgColor: "#233238", width: 300 },
    Enhancer: { nodeColor: "#374445", nodeBgColor: "#474539", width: 340 },
};

const NODE_COLORS = {
    // QwenVL nodes
    "AILab_QwenVL": "QwenVL",
    "AILab_QwenVL_Advanced": "QwenVL",
    "AILab_QwenVL_PromptEnhancer": "Enhancer",
    "AILab_QwenVL_GGUF": "QwenVLGGUF",
    "AILab_QwenVL_GGUF_Advanced": "QwenVLGGUF",
    "AILab_QwenVL_GGUF_PromptEnhancer": "Enhancer",

    // Tools
    "AILab_QwenVL_PromptLibrary": "Tools",
};

function setNodeColors(node, theme) {
    if (!theme) { return; }
    if (theme.nodeColor) {
        node.color = theme.nodeColor;
    }
    if (theme.nodeBgColor) {
        node.bgcolor = theme.nodeBgColor;
    }
    if (theme.width) {
        node.size = node.size || [140, 80];
        node.size[0] = theme.width;
    }
}

const ext = {
    name: "QwenVL.appearance",

    nodeCreated(node) {
        const nclass = node.comfyClass;
        if (NODE_COLORS.hasOwnProperty(nclass)) {
            let colorKey = NODE_COLORS[nclass];
            const theme = COLOR_THEMES[colorKey];
            setNodeColors(node, theme);
        }
    }
};

app.registerExtension(ext);