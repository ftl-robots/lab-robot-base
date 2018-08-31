// Simulation configuration
const simHardware = require("./hardware-impl");

module.exports = Object.freeze({
    name: "simulation",
    inputs: {
        digital: [
            0, 1, 2, 3, 4, 5
        ],
        analog: [
            0, 1, 2, 3, 4
        ]
    },
    outputs: {
        digital: [
            6, 7, 8, 9
        ],
        pwm: [
            0, 1, 2, 3
        ]
    },
    implementation: simHardware
});