const winston = require("winston");

function createLogger(moduleId) {
    var moduleIdentifier = "";
    if (moduleId) {
        moduleIdentifier = "[" + moduleId + "] ";
    }

    const newLogger = winston.createLogger({
        level: "info", // <-- TODO: Make this variable
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(info => {
                return `${info.timestamp} ${info.level}: ${moduleIdentifier}${info.message}`;
            })
        ),
        transports: [new winston.transports.Console()]
    });

    return newLogger;
}

module.exports = {
    createLogger
};