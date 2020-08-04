class KronoError {
    constructor(status, message, attributes) {
        const error = new Error(message);
        error.status = status;
        error.attributes = attributes;

        return error;
    }
}

module.exports = KronoError;