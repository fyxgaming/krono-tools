class KronoClass {
    static toObject(skipKeys = [], visited = new Set()) {
        if(visited.has(this)) return;
        visited.add(this);
        return this.cloneChildren(this, skipKeys, visited);
    }
    
    static deepClone(obj, skipKeys = [], visited = new Set()) {
        if (!obj || !['object', 'function'].includes(typeof obj)) return obj;
        if(visited.has(obj)) return;
        if(obj.toObject) return obj.toObject([], new Set(visited));
        visited.add(obj);
        return this.cloneChildren(obj, skipKeys, visited);   
    }

    static cloneChildren(obj, skipKeys, visited) {
        return Object.entries(obj).reduce((clone, [key, value]) => {
            if([...skipKeys, 'deps', 'presets'].includes(key)) return clone;
            clone[key] = this.deepClone(value, [], new Set(visited));
            return clone;
        }, Array.isArray(obj) ? [] : {})
    }
}
KronoClass.sealed = false;
module.exports = KronoClass;
