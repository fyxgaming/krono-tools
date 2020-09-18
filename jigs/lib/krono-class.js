class KronoClass {
    static toObject() {
        const clone = Array.isArray(this) ? [] : {};
        Object.keys(this)
            .filter(key => !['deps', 'presets'].includes(key))
            .forEach(key => clone[key] = this[key]);
        return clone;
    }

    static deepClone(obj, skipKeys = []) {
        if (!obj) return obj;
        if (typeof obj !== 'object') {
            return obj.toObject ? obj.toObject() : obj;
        }
        const clone = Array.isArray(obj) ? [] : {};
        Object.keys(obj)
            .filter(key => ![...skipKeys, 'deps', 'presets'].includes(key))
            .forEach(key => clone[key] = this.deepClone(obj[key]));
        return clone;
    }
}
KronoClass.sealed = false;
module.exports = KronoClass;
