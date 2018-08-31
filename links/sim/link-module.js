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

}

module.exports = SimLink;