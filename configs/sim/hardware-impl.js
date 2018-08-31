const LogUtil = require("../../utils/log-util");

const logger = LogUtil.createLogger("SimHW");

class SimHardware {
    constructor(config) {
        logger.info("Sim Hardware Initialized");
    }
}

module.exports = SimHardware;