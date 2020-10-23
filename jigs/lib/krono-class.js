class KronoClass {
    static toObject(skipKeys = [], visited = new Set()) {
        if(visited.has(this)) return;
        visited.add(this);
        const clone = Object.entries(this).reduce((clone, [key, value]) => {
            if([...skipKeys, 'deps', 'presets'].includes(key)) return clone;
            clone[key] = KronoClass.deepClone(value, [], new Set(visited));
            return clone;
        }, {})
        return clone;
    }
    
    static deepClone(obj, skipKeys = [], visited = new Set()) {
        if (!obj || !['object', 'function'].includes(typeof obj)) return obj;
        if(visited.has(obj)) return;
        visited.add(obj);
        
        return obj.toObject ? 
            obj.toObject([], new Set(visited)) : 
            Object.entries(obj).reduce((clone, [key, value]) => {
                if([...skipKeys, 'deps', 'presets'].includes(key)) return clone;
                clone[key] = this.deepClone(value, [], new Set(visited));
                return clone;
            }, Array.isArray(obj) ? [] : {})
    }
}
KronoClass.sealed = false;
module.exports = KronoClass;
