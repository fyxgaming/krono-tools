export function injectConfig(local: any): Function {
    if (typeof (local) === 'function') return local;

    function InjectedConfig() { }
    Object.keys(local).forEach(k => InjectedConfig[k] = local[k]);
    return InjectedConfig;
}
