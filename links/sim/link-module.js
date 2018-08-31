const EventEmitter = require("events");
const LogUtil = require("../../utils/log-util");

const logger = LogUtil.createLogger("SIMLink");

class SimLink extends EventEmitter {
    constructor() {
        super();
    }

    get isReady() {
        return true;
    }

    get lastReceivedDigitalOutMessage() {
        return null;
    }

    get lastReceivedPWMOutMessage() {
        return null;
    }

    get lastReceivedRobotModeMessage() {
        return null;
    }

    start() {
        logger.info("Link Started");
    }

    advertiseInputsChanged(type, changeSet) {
        logger.info(`Advertising "${type}" change:`, changeSet);
    }
}

module.exports = SimLink;