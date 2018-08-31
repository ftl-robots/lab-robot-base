// === INCLUDES ===
const LogUtil = require("./utils/log-util");
const commandLineArgs = require("command-line-args");
// === Constants ===

// === Command Line Option Definitions ===
const optionDefinitions = [
    {name: "config", alias: "c", type: String, defaultOption: true },
    {name: "link", alias: "l", type: String}
];

const logger = LogUtil.createLogger("main");

const options = commandLineArgs(optionDefinitions, {
    partial: true
});

var hardwareConfig = null;
var hwConfigName = null;
var LinkInterface = null;
var linkName = null;

if (options.config) {
    const configPathString = `./configs/${options.config}/config-info`;
    try {
        hardwareConfig = require(configPathString);
        hwConfigName = options.config;
    }
    catch(e) {
        logger.error(`Could not load configuration: "${options.config}". Falling back to simulation`);
    }
}
if (!hardwareConfig) {
    hardwareConfig = require("./configs/sim/config-info");
    hwConfigName = "sim";
}

if (options.link) {
    const linkPathString = `./links/${options.link}/link-module`;
    try {
        LinkInterface = require(linkPathString);
        linkName = options.link;
    }
    catch(e) {
        logger.error(`Could not load link interface: "${options.link}". Falling back to simulation`);
    }
}
if (!LinkInterface) {
    LinkInterface = require("./links/sim/link-module");
    linkName = "sim";
}

// Reference to the implementation
const HardwareImpl = hardwareConfig.implementation;

logger.info("===== Initializing Robot =====");
logger.info(`Hardware Configuration: ${hwConfigName}`);
logger.info(`Link Interface: ${linkName}`);

const linkInstance = new LinkInterface();
const robotInstance = new HardwareImpl(hardwareConfig);

// Start the linkInstance
linkInstance.start();