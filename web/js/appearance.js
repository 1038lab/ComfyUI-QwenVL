import { app } from "/scripts/app.js";

const COLOR_THEMES = {
    H3promptor: { nodeColor: "#221f33ff", nodeBgColor: "#3b3850ff" },
    H3Sampler: { nodeColor: "#2c3145ff", nodeBgColor: "#2c3145ff", width: 340 },
};

const NODE_COLORS = {
    "H3_Promptor": "H3promptor",
    "H3_Vision": "H3promptor",
    "H3_Model_Loader": "H3Sampler",
    "H3_Video_Sampler": "H3Sampler",
    "AILab_MinimaxAllInOne": "H3Sampler",
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
    name: "H3.appearance",

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