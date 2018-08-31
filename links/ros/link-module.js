// === INCLUDES ===
const EventEmitter = require("events");
const rosnodejs = require("rosnodejs");
const LogUtil = require("../../utils/log-util");

// === ROSNodeJS Includes ===
const DiagnosticMsgs = rosnodejs.require("diagnostic_msgs");

// === ROS Message Types ===
const DiagnosticStatus = DiagnosticMsgs.msg.DiagnosticStatus;
const KeyValue = DiagnosticMsgs.msg.KeyValue;

// === Constants ===
const MSG_OUTPUT_PWM = "pwmOut";
const MSG_OUTPUT_DIGITAL = "digitalOut";
const MSG_SYS_ROBOT_MODE = "robotMode";

const PUBLISH_INTERVAL_MS = 50;

const logger = LogUtil.createLogger("ROSLink");

class ROSLink extends EventEmitter {
    constructor() {
        super();
        this.d_nodeHandle = null;
        this.d_systemMsgSubscriber = null;
        this.d_outputSubscriber = null;
        this.d_inputPublisher = null;

        this.d_lastReceivedMessageMap = {};

        this.d_publishQueueIntervalToken = null;
        this.d_publishQueue = [];
    }

    get isReady() {
        return this.d_nodeHandle !== null;
    }

    get lastReceivedDigitalOutMessage() {
        return this.d_lastReceivedMessageMap[MSG_OUTPUT_DIGITAL];
    }

    get lastReceivedPWMOutMessage() {
        return this.d_lastReceivedMessageMap[MSG_OUTPUT_PWM];
    }

    get lastReceivedRobotModeMessage() {
        return this.d_lastReceivedMessageMap[MSG_SYS_ROBOT_MODE];
    }

    start() {
        rosnodejs.initNode("lab_robot_base")
            .then(() => {
                logger.info("ROS Node lab_robot_base initialized");
                this.d_nodeHandle = rosnodejs.nh;
                return this.d_nodeHandle;
            })
            .then(nodeHandle => {
                this.d_outputSubscriber =
                    nodeHandle.subscribe("ftl_hardware_outputs", DiagnosticStatus,
                                                    this._handleHardwareOutputsMsg.bind(this));

                this.d_systemMsgSubscriber =
                    nodeHandle.subscribe("ftl_sys_message", DiagnosticStatus,
                                                    this._handleSystemMsg.bind(this));

                this.d_inputPublisher = nodeHandle.advertise("ftl_hardware_inputs", DiagnosticStatus);

                // Set up the sending interval
                setInterval(this._onPublishInterval.bind(this), PUBLISH_INTERVAL_MS);
            });
    }

    advertiseInputsChanged(type, changeSet) {
        if (type !== "analog" || type !== "digital") {
            return;
        }

        if (!this.isReady()) {
            logger.warn(`Link is not ready. Dropping update of type ${type}`);
            return;
            // We could potentially add this to a queue?
        }

        // Generate the DiagnosticStatus message and queue it
        var msg = new DiagnosticStatus();
        msg.name = type;

        switch (type) {
            case "analog": {
                Object.keys(changeSet).forEach(port => {
                    var kv = new KeyValue();
                    kv.key = port.toString();
                    kv.value = changeSet[port].toString();
                    msg.values.push(kv);
                });
            } break;
            case "digital": {
                Object.keys(changeSet).forEach(port => {
                    var kv = new KeyValue();
                    kv.key = port.toString();
                    kv.value = changeSet[port] ? "1" : "0";
                    msg.values.push(kv);
                });
            } break;
        }
        this.d_publishQueue.push(msg);
    }

    _handleHardwareOutputsMsg(msg) {
        var validMsg = false;
        var outputEvent = {};

        switch (msg.name) {
            case "pwmOut": {
                outputEvent.type = "pwm";
                var pwmValueMap = {};
                msg.values.forEach(elt => {
                    const port = parseInt(elt.key, 10);
                    const value = parseFloat(elt.value);
                    pwmValueMap[port] = value;
                });
                outputEvent.values = pwmValueMap;
                validMsg = true;

                this.d_lastReceivedMessageMap[MSG_OUTPUT_PWM] = {
                    timestamp: Date.now(),
                    event: outputEvent,
                    rawMessage: msg
                };
            } break;
            case "digitalOut": {
                outputEvent.type = "digital";
                var digitalValueMap = {};
                msg.values.forEach(elt => {
                    const port = parseInt(elt.key, 10);
                    const value = (elt.value === "true") || (elt.value === "1");
                    digitalValueMap[port] = value;
                });
                outputEvent.values = pwmValueMap;
                validMsg = true;

                this.d_lastReceivedMessageMap[MSG_OUTPUT_DIGITAL] = {
                    timestamp: Date.now(),
                    event: outputEvent,
                    rawMessage: msg
                };
            } break;
        }

        if (validMsg) {
            this.emit("outputsChanged", outputEvent);
        }
    }

    _handleSystemMsg(msg) {
        var validMsg = false;
        var outputEvent = {};

        switch (msg.name) {
            case "ftl-robot-mode": {
                outputEvent.type = "ftl-robot-mode";
                var valueMap = {};
                msg.values.forEach(elt => {
                    valueMap[elt.key] = elt.value;
                });
                outputEvent.values = valueMap;
                validMsg = true;

                this.d_lastReceivedMessageMap[MSG_SYS_ROBOT_MODE] = {
                    timestamp: Date.now(),
                    event: outputEvent,
                    rawMessage: msg
                };
            } break;
        }

        if (validMsg) {
            this.emit("sysMessageReceived", outputEvent);
        }
    }

    _onPublishInterval() {
        if (this.d_publishQueue.length > 0) {
            this.d_publishQueue.forEach(msg => {
                this.d_inputPublisher.publish(msg);
            });

            this.d_publishQueue = [];
        }
    }
}

module.exports = ROSLink;