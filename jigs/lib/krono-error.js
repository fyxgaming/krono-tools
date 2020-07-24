class KronoError extends Error {
    constructor(status, message, attributes) {
        super(message);
        this.status = status;
        this.attributes = attributes;
    }
}

module.exports = KronoError;