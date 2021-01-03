
function _loadWasmModule (sync, filepath, src, imports) {
        function _instantiateOrCompile(source, imports, stream) {
          var instantiateFunc = stream ? WebAssembly.instantiateStreaming : WebAssembly.instantiate;
          var compileFunc = stream ? WebAssembly.compileStreaming : WebAssembly.compile;
          
          if (imports) {
            return instantiateFunc(source, imports)
          } else {
            return compileFunc(source)
          }
        }

        var buf = null
        var isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null
        
        if (filepath && isNode) {
          var fs = eval('require("fs")')
          var path = eval('require("path")')

          return new Promise((resolve, reject) => {
            fs.readFile(path.resolve(__dirname, filepath), (error, buffer) => {
              if (error != null) {
                reject(error)
              }

              resolve(_instantiateOrCompile(buffer, imports, false))
            });
          });
        } else if (filepath) {
          return _instantiateOrCompile(fetch(filepath), imports, true)
        }
        
        if (isNode) {
          buf = Buffer.from(src, 'base64')
        } else {
          var raw = globalThis.atob(src)
          var rawLength = raw.length
          buf = new Uint8Array(new ArrayBuffer(rawLength))
          for(var i = 0; i < rawLength; i++) {
             buf[i] = raw.charCodeAt(i)
          }
        }

        if(sync) {
          var mod = new WebAssembly.Module(buf)
          return imports ? new WebAssembly.Instance(mod, imports) : mod
        } else {
          return _instantiateOrCompile(buf, imports, false)
        }
      }
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var wallet = (function (bsv_1) {
    'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var bsv_1__default = /*#__PURE__*/_interopDefaultLegacy(bsv_1);

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function fix_and_destroy_block(block, lookup) {
        block.f();
        destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function getAugmentedNamespace(n) {
    	if (n.__esModule) return n;
    	var a = Object.defineProperty({}, '__esModule', {value: true});
    	Object.keys(n).forEach(function (k) {
    		var d = Object.getOwnPropertyDescriptor(n, k);
    		Object.defineProperty(a, k, d.get ? d : {
    			enumerable: true,
    			get: function () {
    				return n[k];
    			}
    		});
    	});
    	return a;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var domain;

    // This constructor is used to store event handlers. Instantiating this is
    // faster than explicitly calling `Object.create(null)` to get a "clean" empty
    // object (tested with v8 v4.9).
    function EventHandlers() {}
    EventHandlers.prototype = Object.create(null);

    function EventEmitter() {
      EventEmitter.init.call(this);
    }

    // nodejs oddity
    // require('events') === require('events').EventEmitter
    EventEmitter.EventEmitter = EventEmitter;

    EventEmitter.usingDomains = false;

    EventEmitter.prototype.domain = undefined;
    EventEmitter.prototype._events = undefined;
    EventEmitter.prototype._maxListeners = undefined;

    // By default EventEmitters will print a warning if more than 10 listeners are
    // added to it. This is a useful default which helps finding memory leaks.
    EventEmitter.defaultMaxListeners = 10;

    EventEmitter.init = function() {
      this.domain = null;
      if (EventEmitter.usingDomains) {
        // if there is an active domain, then attach to it.
        if (domain.active ) ;
      }

      if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
        this._events = new EventHandlers();
        this._eventsCount = 0;
      }

      this._maxListeners = this._maxListeners || undefined;
    };

    // Obviously not all Emitters should be limited to 10. This function allows
    // that to be increased. Set to zero for unlimited.
    EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
      if (typeof n !== 'number' || n < 0 || isNaN(n))
        throw new TypeError('"n" argument must be a positive number');
      this._maxListeners = n;
      return this;
    };

    function $getMaxListeners(that) {
      if (that._maxListeners === undefined)
        return EventEmitter.defaultMaxListeners;
      return that._maxListeners;
    }

    EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
      return $getMaxListeners(this);
    };

    // These standalone emit* functions are used to optimize calling of event
    // handlers for fast cases because emit() itself often has a variable number of
    // arguments and can be deoptimized because of that. These functions always have
    // the same number of arguments and thus do not get deoptimized, so the code
    // inside them can execute faster.
    function emitNone(handler, isFn, self) {
      if (isFn)
        handler.call(self);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].call(self);
      }
    }
    function emitOne(handler, isFn, self, arg1) {
      if (isFn)
        handler.call(self, arg1);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].call(self, arg1);
      }
    }
    function emitTwo(handler, isFn, self, arg1, arg2) {
      if (isFn)
        handler.call(self, arg1, arg2);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].call(self, arg1, arg2);
      }
    }
    function emitThree(handler, isFn, self, arg1, arg2, arg3) {
      if (isFn)
        handler.call(self, arg1, arg2, arg3);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].call(self, arg1, arg2, arg3);
      }
    }

    function emitMany(handler, isFn, self, args) {
      if (isFn)
        handler.apply(self, args);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].apply(self, args);
      }
    }

    EventEmitter.prototype.emit = function emit(type) {
      var er, handler, len, args, i, events, domain;
      var doError = (type === 'error');

      events = this._events;
      if (events)
        doError = (doError && events.error == null);
      else if (!doError)
        return false;

      domain = this.domain;

      // If there is no 'error' event listener then throw.
      if (doError) {
        er = arguments[1];
        if (domain) {
          if (!er)
            er = new Error('Uncaught, unspecified "error" event');
          er.domainEmitter = this;
          er.domain = domain;
          er.domainThrown = false;
          domain.emit('error', er);
        } else if (er instanceof Error) {
          throw er; // Unhandled 'error' event
        } else {
          // At least give some kind of context to the user
          var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
          err.context = er;
          throw err;
        }
        return false;
      }

      handler = events[type];

      if (!handler)
        return false;

      var isFn = typeof handler === 'function';
      len = arguments.length;
      switch (len) {
        // fast cases
        case 1:
          emitNone(handler, isFn, this);
          break;
        case 2:
          emitOne(handler, isFn, this, arguments[1]);
          break;
        case 3:
          emitTwo(handler, isFn, this, arguments[1], arguments[2]);
          break;
        case 4:
          emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
          break;
        // slower
        default:
          args = new Array(len - 1);
          for (i = 1; i < len; i++)
            args[i - 1] = arguments[i];
          emitMany(handler, isFn, this, args);
      }

      return true;
    };

    function _addListener(target, type, listener, prepend) {
      var m;
      var events;
      var existing;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = target._events;
      if (!events) {
        events = target._events = new EventHandlers();
        target._eventsCount = 0;
      } else {
        // To avoid recursion in the case that type === "newListener"! Before
        // adding it to the listeners, first emit "newListener".
        if (events.newListener) {
          target.emit('newListener', type,
                      listener.listener ? listener.listener : listener);

          // Re-assign `events` because a newListener handler could have caused the
          // this._events to be assigned to a new object
          events = target._events;
        }
        existing = events[type];
      }

      if (!existing) {
        // Optimize the case of one listener. Don't need the extra array object.
        existing = events[type] = listener;
        ++target._eventsCount;
      } else {
        if (typeof existing === 'function') {
          // Adding the second element, need to change to array.
          existing = events[type] = prepend ? [listener, existing] :
                                              [existing, listener];
        } else {
          // If we've already got an array, just append.
          if (prepend) {
            existing.unshift(listener);
          } else {
            existing.push(listener);
          }
        }

        // Check for listener leak
        if (!existing.warned) {
          m = $getMaxListeners(target);
          if (m && m > 0 && existing.length > m) {
            existing.warned = true;
            var w = new Error('Possible EventEmitter memory leak detected. ' +
                                existing.length + ' ' + type + ' listeners added. ' +
                                'Use emitter.setMaxListeners() to increase limit');
            w.name = 'MaxListenersExceededWarning';
            w.emitter = target;
            w.type = type;
            w.count = existing.length;
            emitWarning(w);
          }
        }
      }

      return target;
    }
    function emitWarning(e) {
      typeof console.warn === 'function' ? console.warn(e) : console.log(e);
    }
    EventEmitter.prototype.addListener = function addListener(type, listener) {
      return _addListener(this, type, listener, false);
    };

    EventEmitter.prototype.on = EventEmitter.prototype.addListener;

    EventEmitter.prototype.prependListener =
        function prependListener(type, listener) {
          return _addListener(this, type, listener, true);
        };

    function _onceWrap(target, type, listener) {
      var fired = false;
      function g() {
        target.removeListener(type, g);
        if (!fired) {
          fired = true;
          listener.apply(target, arguments);
        }
      }
      g.listener = listener;
      return g;
    }

    EventEmitter.prototype.once = function once(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.on(type, _onceWrap(this, type, listener));
      return this;
    };

    EventEmitter.prototype.prependOnceListener =
        function prependOnceListener(type, listener) {
          if (typeof listener !== 'function')
            throw new TypeError('"listener" argument must be a function');
          this.prependListener(type, _onceWrap(this, type, listener));
          return this;
        };

    // emits a 'removeListener' event iff the listener was removed
    EventEmitter.prototype.removeListener =
        function removeListener(type, listener) {
          var list, events, position, i, originalListener;

          if (typeof listener !== 'function')
            throw new TypeError('"listener" argument must be a function');

          events = this._events;
          if (!events)
            return this;

          list = events[type];
          if (!list)
            return this;

          if (list === listener || (list.listener && list.listener === listener)) {
            if (--this._eventsCount === 0)
              this._events = new EventHandlers();
            else {
              delete events[type];
              if (events.removeListener)
                this.emit('removeListener', type, list.listener || listener);
            }
          } else if (typeof list !== 'function') {
            position = -1;

            for (i = list.length; i-- > 0;) {
              if (list[i] === listener ||
                  (list[i].listener && list[i].listener === listener)) {
                originalListener = list[i].listener;
                position = i;
                break;
              }
            }

            if (position < 0)
              return this;

            if (list.length === 1) {
              list[0] = undefined;
              if (--this._eventsCount === 0) {
                this._events = new EventHandlers();
                return this;
              } else {
                delete events[type];
              }
            } else {
              spliceOne(list, position);
            }

            if (events.removeListener)
              this.emit('removeListener', type, originalListener || listener);
          }

          return this;
        };

    EventEmitter.prototype.removeAllListeners =
        function removeAllListeners(type) {
          var listeners, events;

          events = this._events;
          if (!events)
            return this;

          // not listening for removeListener, no need to emit
          if (!events.removeListener) {
            if (arguments.length === 0) {
              this._events = new EventHandlers();
              this._eventsCount = 0;
            } else if (events[type]) {
              if (--this._eventsCount === 0)
                this._events = new EventHandlers();
              else
                delete events[type];
            }
            return this;
          }

          // emit removeListener for all listeners on all events
          if (arguments.length === 0) {
            var keys = Object.keys(events);
            for (var i = 0, key; i < keys.length; ++i) {
              key = keys[i];
              if (key === 'removeListener') continue;
              this.removeAllListeners(key);
            }
            this.removeAllListeners('removeListener');
            this._events = new EventHandlers();
            this._eventsCount = 0;
            return this;
          }

          listeners = events[type];

          if (typeof listeners === 'function') {
            this.removeListener(type, listeners);
          } else if (listeners) {
            // LIFO order
            do {
              this.removeListener(type, listeners[listeners.length - 1]);
            } while (listeners[0]);
          }

          return this;
        };

    EventEmitter.prototype.listeners = function listeners(type) {
      var evlistener;
      var ret;
      var events = this._events;

      if (!events)
        ret = [];
      else {
        evlistener = events[type];
        if (!evlistener)
          ret = [];
        else if (typeof evlistener === 'function')
          ret = [evlistener.listener || evlistener];
        else
          ret = unwrapListeners(evlistener);
      }

      return ret;
    };

    EventEmitter.listenerCount = function(emitter, type) {
      if (typeof emitter.listenerCount === 'function') {
        return emitter.listenerCount(type);
      } else {
        return listenerCount.call(emitter, type);
      }
    };

    EventEmitter.prototype.listenerCount = listenerCount;
    function listenerCount(type) {
      var events = this._events;

      if (events) {
        var evlistener = events[type];

        if (typeof evlistener === 'function') {
          return 1;
        } else if (evlistener) {
          return evlistener.length;
        }
      }

      return 0;
    }

    EventEmitter.prototype.eventNames = function eventNames() {
      return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
    };

    // About 1.5x faster than the two-arg version of Array#splice().
    function spliceOne(list, index) {
      for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
        list[i] = list[k];
      list.pop();
    }

    function arrayClone(arr, i) {
      var copy = new Array(i);
      while (i--)
        copy[i] = arr[i];
      return copy;
    }

    function unwrapListeners(arr) {
      var ret = new Array(arr.length);
      for (var i = 0; i < ret.length; ++i) {
        ret[i] = arr[i].listener || arr[i];
      }
      return ret;
    }

    var events = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': EventEmitter,
        EventEmitter: EventEmitter
    });

    var global$1 = (typeof global !== "undefined" ? global :
      typeof self !== "undefined" ? self :
      typeof window !== "undefined" ? window : {});

    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
    var inited = false;
    function init$1 () {
      inited = true;
      var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      for (var i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }

      revLookup['-'.charCodeAt(0)] = 62;
      revLookup['_'.charCodeAt(0)] = 63;
    }

    function toByteArray (b64) {
      if (!inited) {
        init$1();
      }
      var i, j, l, tmp, placeHolders, arr;
      var len = b64.length;

      if (len % 4 > 0) {
        throw new Error('Invalid string. Length must be a multiple of 4')
      }

      // the number of equal signs (place holders)
      // if there are two placeholders, than the two characters before it
      // represent one byte
      // if there is only one, then the three characters before it represent 2 bytes
      // this is just a cheap hack to not do indexOf twice
      placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

      // base64 is 4/3 + up to two characters of the original data
      arr = new Arr(len * 3 / 4 - placeHolders);

      // if there are placeholders, only get up to the last complete 4 chars
      l = placeHolders > 0 ? len - 4 : len;

      var L = 0;

      for (i = 0, j = 0; i < l; i += 4, j += 3) {
        tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
        arr[L++] = (tmp >> 16) & 0xFF;
        arr[L++] = (tmp >> 8) & 0xFF;
        arr[L++] = tmp & 0xFF;
      }

      if (placeHolders === 2) {
        tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
        arr[L++] = tmp & 0xFF;
      } else if (placeHolders === 1) {
        tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
        arr[L++] = (tmp >> 8) & 0xFF;
        arr[L++] = tmp & 0xFF;
      }

      return arr
    }

    function tripletToBase64 (num) {
      return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
    }

    function encodeChunk (uint8, start, end) {
      var tmp;
      var output = [];
      for (var i = start; i < end; i += 3) {
        tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
        output.push(tripletToBase64(tmp));
      }
      return output.join('')
    }

    function fromByteArray (uint8) {
      if (!inited) {
        init$1();
      }
      var tmp;
      var len = uint8.length;
      var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
      var output = '';
      var parts = [];
      var maxChunkLength = 16383; // must be multiple of 3

      // go through the array every three bytes, we'll deal with trailing stuff later
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
        parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
      }

      // pad the end with zeros, but make sure to not forget the extra bytes
      if (extraBytes === 1) {
        tmp = uint8[len - 1];
        output += lookup[tmp >> 2];
        output += lookup[(tmp << 4) & 0x3F];
        output += '==';
      } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
        output += lookup[tmp >> 10];
        output += lookup[(tmp >> 4) & 0x3F];
        output += lookup[(tmp << 2) & 0x3F];
        output += '=';
      }

      parts.push(output);

      return parts.join('')
    }

    function read (buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? (nBytes - 1) : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];

      i += d;

      e = s & ((1 << (-nBits)) - 1);
      s >>= (-nBits);
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

      m = e & ((1 << (-nBits)) - 1);
      e >>= (-nBits);
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : ((s ? -1 : 1) * Infinity)
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
    }

    function write (buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
      var i = isLE ? 0 : (nBytes - 1);
      var d = isLE ? 1 : -1;
      var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

      value = Math.abs(value);

      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }

        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }

      for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

      e = (e << mLen) | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

      buffer[offset + i - d] |= s * 128;
    }

    var toString = {}.toString;

    var isArray = Array.isArray || function (arr) {
      return toString.call(arr) == '[object Array]';
    };

    /*!
     * The buffer module from node.js, for the browser.
     *
     * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
     * @license  MIT
     */

    var INSPECT_MAX_BYTES = 50;

    /**
     * If `Buffer.TYPED_ARRAY_SUPPORT`:
     *   === true    Use Uint8Array implementation (fastest)
     *   === false   Use Object implementation (most compatible, even IE6)
     *
     * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
     * Opera 11.6+, iOS 4.2+.
     *
     * Due to various browser bugs, sometimes the Object implementation will be used even
     * when the browser supports typed arrays.
     *
     * Note:
     *
     *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
     *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
     *
     *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
     *
     *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
     *     incorrect length in some situations.

     * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
     * get the Object implementation, which is slower but behaves correctly.
     */
    Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
      ? global$1.TYPED_ARRAY_SUPPORT
      : true;

    /*
     * Export kMaxLength after typed array support is determined.
     */
    var _kMaxLength = kMaxLength();

    function kMaxLength () {
      return Buffer.TYPED_ARRAY_SUPPORT
        ? 0x7fffffff
        : 0x3fffffff
    }

    function createBuffer (that, length) {
      if (kMaxLength() < length) {
        throw new RangeError('Invalid typed array length')
      }
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        // Return an augmented `Uint8Array` instance, for best performance
        that = new Uint8Array(length);
        that.__proto__ = Buffer.prototype;
      } else {
        // Fallback: Return an object instance of the Buffer class
        if (that === null) {
          that = new Buffer(length);
        }
        that.length = length;
      }

      return that
    }

    /**
     * The Buffer constructor returns instances of `Uint8Array` that have their
     * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
     * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
     * and the `Uint8Array` methods. Square bracket notation works as expected -- it
     * returns a single octet.
     *
     * The `Uint8Array` prototype remains unmodified.
     */

    function Buffer (arg, encodingOrOffset, length) {
      if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
        return new Buffer(arg, encodingOrOffset, length)
      }

      // Common case.
      if (typeof arg === 'number') {
        if (typeof encodingOrOffset === 'string') {
          throw new Error(
            'If encoding is specified then the first argument must be a string'
          )
        }
        return allocUnsafe(this, arg)
      }
      return from(this, arg, encodingOrOffset, length)
    }

    Buffer.poolSize = 8192; // not used by this implementation

    // TODO: Legacy, not needed anymore. Remove in next major version.
    Buffer._augment = function (arr) {
      arr.__proto__ = Buffer.prototype;
      return arr
    };

    function from (that, value, encodingOrOffset, length) {
      if (typeof value === 'number') {
        throw new TypeError('"value" argument must not be a number')
      }

      if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
        return fromArrayBuffer(that, value, encodingOrOffset, length)
      }

      if (typeof value === 'string') {
        return fromString(that, value, encodingOrOffset)
      }

      return fromObject(that, value)
    }

    /**
     * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
     * if value is a number.
     * Buffer.from(str[, encoding])
     * Buffer.from(array)
     * Buffer.from(buffer)
     * Buffer.from(arrayBuffer[, byteOffset[, length]])
     **/
    Buffer.from = function (value, encodingOrOffset, length) {
      return from(null, value, encodingOrOffset, length)
    };

    if (Buffer.TYPED_ARRAY_SUPPORT) {
      Buffer.prototype.__proto__ = Uint8Array.prototype;
      Buffer.__proto__ = Uint8Array;
    }

    function assertSize (size) {
      if (typeof size !== 'number') {
        throw new TypeError('"size" argument must be a number')
      } else if (size < 0) {
        throw new RangeError('"size" argument must not be negative')
      }
    }

    function alloc (that, size, fill, encoding) {
      assertSize(size);
      if (size <= 0) {
        return createBuffer(that, size)
      }
      if (fill !== undefined) {
        // Only pay attention to encoding if it's a string. This
        // prevents accidentally sending in a number that would
        // be interpretted as a start offset.
        return typeof encoding === 'string'
          ? createBuffer(that, size).fill(fill, encoding)
          : createBuffer(that, size).fill(fill)
      }
      return createBuffer(that, size)
    }

    /**
     * Creates a new filled Buffer instance.
     * alloc(size[, fill[, encoding]])
     **/
    Buffer.alloc = function (size, fill, encoding) {
      return alloc(null, size, fill, encoding)
    };

    function allocUnsafe (that, size) {
      assertSize(size);
      that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
      if (!Buffer.TYPED_ARRAY_SUPPORT) {
        for (var i = 0; i < size; ++i) {
          that[i] = 0;
        }
      }
      return that
    }

    /**
     * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
     * */
    Buffer.allocUnsafe = function (size) {
      return allocUnsafe(null, size)
    };
    /**
     * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
     */
    Buffer.allocUnsafeSlow = function (size) {
      return allocUnsafe(null, size)
    };

    function fromString (that, string, encoding) {
      if (typeof encoding !== 'string' || encoding === '') {
        encoding = 'utf8';
      }

      if (!Buffer.isEncoding(encoding)) {
        throw new TypeError('"encoding" must be a valid string encoding')
      }

      var length = byteLength(string, encoding) | 0;
      that = createBuffer(that, length);

      var actual = that.write(string, encoding);

      if (actual !== length) {
        // Writing a hex string, for example, that contains invalid characters will
        // cause everything after the first invalid character to be ignored. (e.g.
        // 'abxxcd' will be treated as 'ab')
        that = that.slice(0, actual);
      }

      return that
    }

    function fromArrayLike (that, array) {
      var length = array.length < 0 ? 0 : checked(array.length) | 0;
      that = createBuffer(that, length);
      for (var i = 0; i < length; i += 1) {
        that[i] = array[i] & 255;
      }
      return that
    }

    function fromArrayBuffer (that, array, byteOffset, length) {
      array.byteLength; // this throws if `array` is not a valid ArrayBuffer

      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('\'offset\' is out of bounds')
      }

      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('\'length\' is out of bounds')
      }

      if (byteOffset === undefined && length === undefined) {
        array = new Uint8Array(array);
      } else if (length === undefined) {
        array = new Uint8Array(array, byteOffset);
      } else {
        array = new Uint8Array(array, byteOffset, length);
      }

      if (Buffer.TYPED_ARRAY_SUPPORT) {
        // Return an augmented `Uint8Array` instance, for best performance
        that = array;
        that.__proto__ = Buffer.prototype;
      } else {
        // Fallback: Return an object instance of the Buffer class
        that = fromArrayLike(that, array);
      }
      return that
    }

    function fromObject (that, obj) {
      if (internalIsBuffer(obj)) {
        var len = checked(obj.length) | 0;
        that = createBuffer(that, len);

        if (that.length === 0) {
          return that
        }

        obj.copy(that, 0, 0, len);
        return that
      }

      if (obj) {
        if ((typeof ArrayBuffer !== 'undefined' &&
            obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
          if (typeof obj.length !== 'number' || isnan(obj.length)) {
            return createBuffer(that, 0)
          }
          return fromArrayLike(that, obj)
        }

        if (obj.type === 'Buffer' && isArray(obj.data)) {
          return fromArrayLike(that, obj.data)
        }
      }

      throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
    }

    function checked (length) {
      // Note: cannot use `length < kMaxLength()` here because that fails when
      // length is NaN (which is otherwise coerced to zero.)
      if (length >= kMaxLength()) {
        throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                             'size: 0x' + kMaxLength().toString(16) + ' bytes')
      }
      return length | 0
    }

    function SlowBuffer (length) {
      if (+length != length) { // eslint-disable-line eqeqeq
        length = 0;
      }
      return Buffer.alloc(+length)
    }
    Buffer.isBuffer = isBuffer;
    function internalIsBuffer (b) {
      return !!(b != null && b._isBuffer)
    }

    Buffer.compare = function compare (a, b) {
      if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
        throw new TypeError('Arguments must be Buffers')
      }

      if (a === b) return 0

      var x = a.length;
      var y = b.length;

      for (var i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break
        }
      }

      if (x < y) return -1
      if (y < x) return 1
      return 0
    };

    Buffer.isEncoding = function isEncoding (encoding) {
      switch (String(encoding).toLowerCase()) {
        case 'hex':
        case 'utf8':
        case 'utf-8':
        case 'ascii':
        case 'latin1':
        case 'binary':
        case 'base64':
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return true
        default:
          return false
      }
    };

    Buffer.concat = function concat (list, length) {
      if (!isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers')
      }

      if (list.length === 0) {
        return Buffer.alloc(0)
      }

      var i;
      if (length === undefined) {
        length = 0;
        for (i = 0; i < list.length; ++i) {
          length += list[i].length;
        }
      }

      var buffer = Buffer.allocUnsafe(length);
      var pos = 0;
      for (i = 0; i < list.length; ++i) {
        var buf = list[i];
        if (!internalIsBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers')
        }
        buf.copy(buffer, pos);
        pos += buf.length;
      }
      return buffer
    };

    function byteLength (string, encoding) {
      if (internalIsBuffer(string)) {
        return string.length
      }
      if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
          (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
        return string.byteLength
      }
      if (typeof string !== 'string') {
        string = '' + string;
      }

      var len = string.length;
      if (len === 0) return 0

      // Use a for loop to avoid recursion
      var loweredCase = false;
      for (;;) {
        switch (encoding) {
          case 'ascii':
          case 'latin1':
          case 'binary':
            return len
          case 'utf8':
          case 'utf-8':
          case undefined:
            return utf8ToBytes(string).length
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return len * 2
          case 'hex':
            return len >>> 1
          case 'base64':
            return base64ToBytes(string).length
          default:
            if (loweredCase) return utf8ToBytes(string).length // assume utf8
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer.byteLength = byteLength;

    function slowToString (encoding, start, end) {
      var loweredCase = false;

      // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
      // property of a typed array.

      // This behaves neither like String nor Uint8Array in that we set start/end
      // to their upper/lower bounds if the value passed is out of range.
      // undefined is handled specially as per ECMA-262 6th Edition,
      // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
      if (start === undefined || start < 0) {
        start = 0;
      }
      // Return early if start > this.length. Done here to prevent potential uint32
      // coercion fail below.
      if (start > this.length) {
        return ''
      }

      if (end === undefined || end > this.length) {
        end = this.length;
      }

      if (end <= 0) {
        return ''
      }

      // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
      end >>>= 0;
      start >>>= 0;

      if (end <= start) {
        return ''
      }

      if (!encoding) encoding = 'utf8';

      while (true) {
        switch (encoding) {
          case 'hex':
            return hexSlice(this, start, end)

          case 'utf8':
          case 'utf-8':
            return utf8Slice(this, start, end)

          case 'ascii':
            return asciiSlice(this, start, end)

          case 'latin1':
          case 'binary':
            return latin1Slice(this, start, end)

          case 'base64':
            return base64Slice(this, start, end)

          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return utf16leSlice(this, start, end)

          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = (encoding + '').toLowerCase();
            loweredCase = true;
        }
      }
    }

    // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
    // Buffer instances.
    Buffer.prototype._isBuffer = true;

    function swap (b, n, m) {
      var i = b[n];
      b[n] = b[m];
      b[m] = i;
    }

    Buffer.prototype.swap16 = function swap16 () {
      var len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 16-bits')
      }
      for (var i = 0; i < len; i += 2) {
        swap(this, i, i + 1);
      }
      return this
    };

    Buffer.prototype.swap32 = function swap32 () {
      var len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 32-bits')
      }
      for (var i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
      }
      return this
    };

    Buffer.prototype.swap64 = function swap64 () {
      var len = this.length;
      if (len % 8 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 64-bits')
      }
      for (var i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
      }
      return this
    };

    Buffer.prototype.toString = function toString () {
      var length = this.length | 0;
      if (length === 0) return ''
      if (arguments.length === 0) return utf8Slice(this, 0, length)
      return slowToString.apply(this, arguments)
    };

    Buffer.prototype.equals = function equals (b) {
      if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
      if (this === b) return true
      return Buffer.compare(this, b) === 0
    };

    Buffer.prototype.inspect = function inspect () {
      var str = '';
      var max = INSPECT_MAX_BYTES;
      if (this.length > 0) {
        str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
        if (this.length > max) str += ' ... ';
      }
      return '<Buffer ' + str + '>'
    };

    Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
      if (!internalIsBuffer(target)) {
        throw new TypeError('Argument must be a Buffer')
      }

      if (start === undefined) {
        start = 0;
      }
      if (end === undefined) {
        end = target ? target.length : 0;
      }
      if (thisStart === undefined) {
        thisStart = 0;
      }
      if (thisEnd === undefined) {
        thisEnd = this.length;
      }

      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError('out of range index')
      }

      if (thisStart >= thisEnd && start >= end) {
        return 0
      }
      if (thisStart >= thisEnd) {
        return -1
      }
      if (start >= end) {
        return 1
      }

      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;

      if (this === target) return 0

      var x = thisEnd - thisStart;
      var y = end - start;
      var len = Math.min(x, y);

      var thisCopy = this.slice(thisStart, thisEnd);
      var targetCopy = target.slice(start, end);

      for (var i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break
        }
      }

      if (x < y) return -1
      if (y < x) return 1
      return 0
    };

    // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
    // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
    //
    // Arguments:
    // - buffer - a Buffer to search
    // - val - a string, Buffer, or number
    // - byteOffset - an index into `buffer`; will be clamped to an int32
    // - encoding - an optional encoding, relevant is val is a string
    // - dir - true for indexOf, false for lastIndexOf
    function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
      // Empty buffer means no match
      if (buffer.length === 0) return -1

      // Normalize byteOffset
      if (typeof byteOffset === 'string') {
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset > 0x7fffffff) {
        byteOffset = 0x7fffffff;
      } else if (byteOffset < -0x80000000) {
        byteOffset = -0x80000000;
      }
      byteOffset = +byteOffset;  // Coerce to Number.
      if (isNaN(byteOffset)) {
        // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
        byteOffset = dir ? 0 : (buffer.length - 1);
      }

      // Normalize byteOffset: negative offsets start from the end of the buffer
      if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
      if (byteOffset >= buffer.length) {
        if (dir) return -1
        else byteOffset = buffer.length - 1;
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1
      }

      // Normalize val
      if (typeof val === 'string') {
        val = Buffer.from(val, encoding);
      }

      // Finally, search either indexOf (if dir is true) or lastIndexOf
      if (internalIsBuffer(val)) {
        // Special case: looking for empty string/buffer always fails
        if (val.length === 0) {
          return -1
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
      } else if (typeof val === 'number') {
        val = val & 0xFF; // Search for a byte value [0-255]
        if (Buffer.TYPED_ARRAY_SUPPORT &&
            typeof Uint8Array.prototype.indexOf === 'function') {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
          }
        }
        return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
      }

      throw new TypeError('val must be string, number or Buffer')
    }

    function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
      var indexSize = 1;
      var arrLength = arr.length;
      var valLength = val.length;

      if (encoding !== undefined) {
        encoding = String(encoding).toLowerCase();
        if (encoding === 'ucs2' || encoding === 'ucs-2' ||
            encoding === 'utf16le' || encoding === 'utf-16le') {
          if (arr.length < 2 || val.length < 2) {
            return -1
          }
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }

      function read (buf, i) {
        if (indexSize === 1) {
          return buf[i]
        } else {
          return buf.readUInt16BE(i * indexSize)
        }
      }

      var i;
      if (dir) {
        var foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) {
          if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1) foundIndex = i;
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
          } else {
            if (foundIndex !== -1) i -= i - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for (i = byteOffset; i >= 0; i--) {
          var found = true;
          for (var j = 0; j < valLength; j++) {
            if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break
            }
          }
          if (found) return i
        }
      }

      return -1
    }

    Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1
    };

    Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
    };

    Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
    };

    function hexWrite (buf, string, offset, length) {
      offset = Number(offset) || 0;
      var remaining = buf.length - offset;
      if (!length) {
        length = remaining;
      } else {
        length = Number(length);
        if (length > remaining) {
          length = remaining;
        }
      }

      // must be an even number of digits
      var strLen = string.length;
      if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

      if (length > strLen / 2) {
        length = strLen / 2;
      }
      for (var i = 0; i < length; ++i) {
        var parsed = parseInt(string.substr(i * 2, 2), 16);
        if (isNaN(parsed)) return i
        buf[offset + i] = parsed;
      }
      return i
    }

    function utf8Write (buf, string, offset, length) {
      return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
    }

    function asciiWrite (buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length)
    }

    function latin1Write (buf, string, offset, length) {
      return asciiWrite(buf, string, offset, length)
    }

    function base64Write (buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length)
    }

    function ucs2Write (buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
    }

    Buffer.prototype.write = function write (string, offset, length, encoding) {
      // Buffer#write(string)
      if (offset === undefined) {
        encoding = 'utf8';
        length = this.length;
        offset = 0;
      // Buffer#write(string, encoding)
      } else if (length === undefined && typeof offset === 'string') {
        encoding = offset;
        length = this.length;
        offset = 0;
      // Buffer#write(string, offset[, length][, encoding])
      } else if (isFinite(offset)) {
        offset = offset | 0;
        if (isFinite(length)) {
          length = length | 0;
          if (encoding === undefined) encoding = 'utf8';
        } else {
          encoding = length;
          length = undefined;
        }
      // legacy write(string, encoding, offset, length) - remove in v0.13
      } else {
        throw new Error(
          'Buffer.write(string, encoding, offset[, length]) is no longer supported'
        )
      }

      var remaining = this.length - offset;
      if (length === undefined || length > remaining) length = remaining;

      if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
        throw new RangeError('Attempt to write outside buffer bounds')
      }

      if (!encoding) encoding = 'utf8';

      var loweredCase = false;
      for (;;) {
        switch (encoding) {
          case 'hex':
            return hexWrite(this, string, offset, length)

          case 'utf8':
          case 'utf-8':
            return utf8Write(this, string, offset, length)

          case 'ascii':
            return asciiWrite(this, string, offset, length)

          case 'latin1':
          case 'binary':
            return latin1Write(this, string, offset, length)

          case 'base64':
            // Warning: maxLength not taken into account in base64Write
            return base64Write(this, string, offset, length)

          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return ucs2Write(this, string, offset, length)

          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    };

    Buffer.prototype.toJSON = function toJSON () {
      return {
        type: 'Buffer',
        data: Array.prototype.slice.call(this._arr || this, 0)
      }
    };

    function base64Slice (buf, start, end) {
      if (start === 0 && end === buf.length) {
        return fromByteArray(buf)
      } else {
        return fromByteArray(buf.slice(start, end))
      }
    }

    function utf8Slice (buf, start, end) {
      end = Math.min(buf.length, end);
      var res = [];

      var i = start;
      while (i < end) {
        var firstByte = buf[i];
        var codePoint = null;
        var bytesPerSequence = (firstByte > 0xEF) ? 4
          : (firstByte > 0xDF) ? 3
          : (firstByte > 0xBF) ? 2
          : 1;

        if (i + bytesPerSequence <= end) {
          var secondByte, thirdByte, fourthByte, tempCodePoint;

          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 0x80) {
                codePoint = firstByte;
              }
              break
            case 2:
              secondByte = buf[i + 1];
              if ((secondByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
                if (tempCodePoint > 0x7F) {
                  codePoint = tempCodePoint;
                }
              }
              break
            case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
                if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                  codePoint = tempCodePoint;
                }
              }
              break
            case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
                if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                  codePoint = tempCodePoint;
                }
              }
          }
        }

        if (codePoint === null) {
          // we did not generate a valid codePoint so insert a
          // replacement char (U+FFFD) and advance only 1 byte
          codePoint = 0xFFFD;
          bytesPerSequence = 1;
        } else if (codePoint > 0xFFFF) {
          // encode to utf16 (surrogate pair dance)
          codePoint -= 0x10000;
          res.push(codePoint >>> 10 & 0x3FF | 0xD800);
          codePoint = 0xDC00 | codePoint & 0x3FF;
        }

        res.push(codePoint);
        i += bytesPerSequence;
      }

      return decodeCodePointsArray(res)
    }

    // Based on http://stackoverflow.com/a/22747272/680742, the browser with
    // the lowest limit is Chrome, with 0x10000 args.
    // We go 1 magnitude less, for safety
    var MAX_ARGUMENTS_LENGTH = 0x1000;

    function decodeCodePointsArray (codePoints) {
      var len = codePoints.length;
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
      }

      // Decode in chunks to avoid "call stack size exceeded".
      var res = '';
      var i = 0;
      while (i < len) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
        );
      }
      return res
    }

    function asciiSlice (buf, start, end) {
      var ret = '';
      end = Math.min(buf.length, end);

      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 0x7F);
      }
      return ret
    }

    function latin1Slice (buf, start, end) {
      var ret = '';
      end = Math.min(buf.length, end);

      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i]);
      }
      return ret
    }

    function hexSlice (buf, start, end) {
      var len = buf.length;

      if (!start || start < 0) start = 0;
      if (!end || end < 0 || end > len) end = len;

      var out = '';
      for (var i = start; i < end; ++i) {
        out += toHex(buf[i]);
      }
      return out
    }

    function utf16leSlice (buf, start, end) {
      var bytes = buf.slice(start, end);
      var res = '';
      for (var i = 0; i < bytes.length; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
      }
      return res
    }

    Buffer.prototype.slice = function slice (start, end) {
      var len = this.length;
      start = ~~start;
      end = end === undefined ? len : ~~end;

      if (start < 0) {
        start += len;
        if (start < 0) start = 0;
      } else if (start > len) {
        start = len;
      }

      if (end < 0) {
        end += len;
        if (end < 0) end = 0;
      } else if (end > len) {
        end = len;
      }

      if (end < start) end = start;

      var newBuf;
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        newBuf = this.subarray(start, end);
        newBuf.__proto__ = Buffer.prototype;
      } else {
        var sliceLen = end - start;
        newBuf = new Buffer(sliceLen, undefined);
        for (var i = 0; i < sliceLen; ++i) {
          newBuf[i] = this[i + start];
        }
      }

      return newBuf
    };

    /*
     * Need to make sure that buffer isn't trying to write out of bounds.
     */
    function checkOffset (offset, ext, length) {
      if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
      if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
    }

    Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul;
      }

      return val
    };

    Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        checkOffset(offset, byteLength, this.length);
      }

      var val = this[offset + --byteLength];
      var mul = 1;
      while (byteLength > 0 && (mul *= 0x100)) {
        val += this[offset + --byteLength] * mul;
      }

      return val
    };

    Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 1, this.length);
      return this[offset]
    };

    Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] | (this[offset + 1] << 8)
    };

    Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      return (this[offset] << 8) | this[offset + 1]
    };

    Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return ((this[offset]) |
          (this[offset + 1] << 8) |
          (this[offset + 2] << 16)) +
          (this[offset + 3] * 0x1000000)
    };

    Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset] * 0x1000000) +
        ((this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        this[offset + 3])
    };

    Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul;
      }
      mul *= 0x80;

      if (val >= mul) val -= Math.pow(2, 8 * byteLength);

      return val
    };

    Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var i = byteLength;
      var mul = 1;
      var val = this[offset + --i];
      while (i > 0 && (mul *= 0x100)) {
        val += this[offset + --i] * mul;
      }
      mul *= 0x80;

      if (val >= mul) val -= Math.pow(2, 8 * byteLength);

      return val
    };

    Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 1, this.length);
      if (!(this[offset] & 0x80)) return (this[offset])
      return ((0xff - this[offset] + 1) * -1)
    };

    Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset] | (this[offset + 1] << 8);
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    };

    Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset + 1] | (this[offset] << 8);
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    };

    Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset]) |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16) |
        (this[offset + 3] << 24)
    };

    Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset] << 24) |
        (this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        (this[offset + 3])
    };

    Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);
      return read(this, offset, true, 23, 4)
    };

    Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);
      return read(this, offset, false, 23, 4)
    };

    Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 8, this.length);
      return read(this, offset, true, 52, 8)
    };

    Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 8, this.length);
      return read(this, offset, false, 52, 8)
    };

    function checkInt (buf, value, offset, ext, max, min) {
      if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
      if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
    }

    Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
      }

      var mul = 1;
      var i = 0;
      this[offset] = value & 0xFF;
      while (++i < byteLength && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
      }

      var i = byteLength - 1;
      var mul = 1;
      this[offset + i] = value & 0xFF;
      while (--i >= 0 && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
      if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
      this[offset] = (value & 0xff);
      return offset + 1
    };

    function objectWriteUInt16 (buf, value, offset, littleEndian) {
      if (value < 0) value = 0xffff + value + 1;
      for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
        buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
          (littleEndian ? i : 1 - i) * 8;
      }
    }

    Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
      } else {
        objectWriteUInt16(this, value, offset, true);
      }
      return offset + 2
    };

    Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 8);
        this[offset + 1] = (value & 0xff);
      } else {
        objectWriteUInt16(this, value, offset, false);
      }
      return offset + 2
    };

    function objectWriteUInt32 (buf, value, offset, littleEndian) {
      if (value < 0) value = 0xffffffff + value + 1;
      for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
        buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
      }
    }

    Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset + 3] = (value >>> 24);
        this[offset + 2] = (value >>> 16);
        this[offset + 1] = (value >>> 8);
        this[offset] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, true);
      }
      return offset + 4
    };

    Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 24);
        this[offset + 1] = (value >>> 16);
        this[offset + 2] = (value >>> 8);
        this[offset + 3] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, false);
      }
      return offset + 4
    };

    Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);

        checkInt(this, value, offset, byteLength, limit - 1, -limit);
      }

      var i = 0;
      var mul = 1;
      var sub = 0;
      this[offset] = value & 0xFF;
      while (++i < byteLength && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);

        checkInt(this, value, offset, byteLength, limit - 1, -limit);
      }

      var i = byteLength - 1;
      var mul = 1;
      var sub = 0;
      this[offset + i] = value & 0xFF;
      while (--i >= 0 && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
      if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
      if (value < 0) value = 0xff + value + 1;
      this[offset] = (value & 0xff);
      return offset + 1
    };

    Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
      } else {
        objectWriteUInt16(this, value, offset, true);
      }
      return offset + 2
    };

    Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 8);
        this[offset + 1] = (value & 0xff);
      } else {
        objectWriteUInt16(this, value, offset, false);
      }
      return offset + 2
    };

    Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
        this[offset + 2] = (value >>> 16);
        this[offset + 3] = (value >>> 24);
      } else {
        objectWriteUInt32(this, value, offset, true);
      }
      return offset + 4
    };

    Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
      if (value < 0) value = 0xffffffff + value + 1;
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 24);
        this[offset + 1] = (value >>> 16);
        this[offset + 2] = (value >>> 8);
        this[offset + 3] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, false);
      }
      return offset + 4
    };

    function checkIEEE754 (buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
      if (offset < 0) throw new RangeError('Index out of range')
    }

    function writeFloat (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4);
      }
      write(buf, value, offset, littleEndian, 23, 4);
      return offset + 4
    }

    Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert)
    };

    Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert)
    };

    function writeDouble (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8);
      }
      write(buf, value, offset, littleEndian, 52, 8);
      return offset + 8
    }

    Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert)
    };

    Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert)
    };

    // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
    Buffer.prototype.copy = function copy (target, targetStart, start, end) {
      if (!start) start = 0;
      if (!end && end !== 0) end = this.length;
      if (targetStart >= target.length) targetStart = target.length;
      if (!targetStart) targetStart = 0;
      if (end > 0 && end < start) end = start;

      // Copy 0 bytes; we're done
      if (end === start) return 0
      if (target.length === 0 || this.length === 0) return 0

      // Fatal error conditions
      if (targetStart < 0) {
        throw new RangeError('targetStart out of bounds')
      }
      if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
      if (end < 0) throw new RangeError('sourceEnd out of bounds')

      // Are we oob?
      if (end > this.length) end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }

      var len = end - start;
      var i;

      if (this === target && start < targetStart && targetStart < end) {
        // descending copy from end
        for (i = len - 1; i >= 0; --i) {
          target[i + targetStart] = this[i + start];
        }
      } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
        // ascending copy from start
        for (i = 0; i < len; ++i) {
          target[i + targetStart] = this[i + start];
        }
      } else {
        Uint8Array.prototype.set.call(
          target,
          this.subarray(start, start + len),
          targetStart
        );
      }

      return len
    };

    // Usage:
    //    buffer.fill(number[, offset[, end]])
    //    buffer.fill(buffer[, offset[, end]])
    //    buffer.fill(string[, offset[, end]][, encoding])
    Buffer.prototype.fill = function fill (val, start, end, encoding) {
      // Handle string cases:
      if (typeof val === 'string') {
        if (typeof start === 'string') {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === 'string') {
          encoding = end;
          end = this.length;
        }
        if (val.length === 1) {
          var code = val.charCodeAt(0);
          if (code < 256) {
            val = code;
          }
        }
        if (encoding !== undefined && typeof encoding !== 'string') {
          throw new TypeError('encoding must be a string')
        }
        if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
          throw new TypeError('Unknown encoding: ' + encoding)
        }
      } else if (typeof val === 'number') {
        val = val & 255;
      }

      // Invalid ranges are not set to a default, so can range check early.
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError('Out of range index')
      }

      if (end <= start) {
        return this
      }

      start = start >>> 0;
      end = end === undefined ? this.length : end >>> 0;

      if (!val) val = 0;

      var i;
      if (typeof val === 'number') {
        for (i = start; i < end; ++i) {
          this[i] = val;
        }
      } else {
        var bytes = internalIsBuffer(val)
          ? val
          : utf8ToBytes(new Buffer(val, encoding).toString());
        var len = bytes.length;
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len];
        }
      }

      return this
    };

    // HELPER FUNCTIONS
    // ================

    var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

    function base64clean (str) {
      // Node strips out invalid characters like \n and \t from the string, base64-js does not
      str = stringtrim(str).replace(INVALID_BASE64_RE, '');
      // Node converts strings with length < 2 to ''
      if (str.length < 2) return ''
      // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
      while (str.length % 4 !== 0) {
        str = str + '=';
      }
      return str
    }

    function stringtrim (str) {
      if (str.trim) return str.trim()
      return str.replace(/^\s+|\s+$/g, '')
    }

    function toHex (n) {
      if (n < 16) return '0' + n.toString(16)
      return n.toString(16)
    }

    function utf8ToBytes (string, units) {
      units = units || Infinity;
      var codePoint;
      var length = string.length;
      var leadSurrogate = null;
      var bytes = [];

      for (var i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);

        // is surrogate component
        if (codePoint > 0xD7FF && codePoint < 0xE000) {
          // last char was a lead
          if (!leadSurrogate) {
            // no lead yet
            if (codePoint > 0xDBFF) {
              // unexpected trail
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              continue
            } else if (i + 1 === length) {
              // unpaired lead
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              continue
            }

            // valid lead
            leadSurrogate = codePoint;

            continue
          }

          // 2 leads in a row
          if (codePoint < 0xDC00) {
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            leadSurrogate = codePoint;
            continue
          }

          // valid surrogate pair
          codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
        } else if (leadSurrogate) {
          // valid bmp char, but last char was a lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        }

        leadSurrogate = null;

        // encode utf8
        if (codePoint < 0x80) {
          if ((units -= 1) < 0) break
          bytes.push(codePoint);
        } else if (codePoint < 0x800) {
          if ((units -= 2) < 0) break
          bytes.push(
            codePoint >> 0x6 | 0xC0,
            codePoint & 0x3F | 0x80
          );
        } else if (codePoint < 0x10000) {
          if ((units -= 3) < 0) break
          bytes.push(
            codePoint >> 0xC | 0xE0,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          );
        } else if (codePoint < 0x110000) {
          if ((units -= 4) < 0) break
          bytes.push(
            codePoint >> 0x12 | 0xF0,
            codePoint >> 0xC & 0x3F | 0x80,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          );
        } else {
          throw new Error('Invalid code point')
        }
      }

      return bytes
    }

    function asciiToBytes (str) {
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        // Node's code seems to be doing this and not & 0x7F..
        byteArray.push(str.charCodeAt(i) & 0xFF);
      }
      return byteArray
    }

    function utf16leToBytes (str, units) {
      var c, hi, lo;
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0) break

        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }

      return byteArray
    }


    function base64ToBytes (str) {
      return toByteArray(base64clean(str))
    }

    function blitBuffer (src, dst, offset, length) {
      for (var i = 0; i < length; ++i) {
        if ((i + offset >= dst.length) || (i >= src.length)) break
        dst[i + offset] = src[i];
      }
      return i
    }

    function isnan (val) {
      return val !== val // eslint-disable-line no-self-compare
    }


    // the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
    // The _isBuffer check is for Safari 5-7 support, because it's missing
    // Object.prototype.constructor. Remove this eventually
    function isBuffer(obj) {
      return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
    }

    function isFastBuffer (obj) {
      return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
    }

    // For Node v0.10 support. Remove this eventually.
    function isSlowBuffer (obj) {
      return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
    }

    var bufferEs6 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Buffer: Buffer,
        INSPECT_MAX_BYTES: INSPECT_MAX_BYTES,
        SlowBuffer: SlowBuffer,
        isBuffer: isBuffer,
        kMaxLength: _kMaxLength
    });

    var buffer_1 = /*@__PURE__*/getAugmentedNamespace(bufferEs6);

    var signedMessage = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SignedMessage = void 0;


    const MAGIC_BYTES = buffer_1.Buffer.from('Bitcoin Signed Message:\n');
    const MAGIC_BYTES_PREFIX = bsv_1__default['default'].Bw.varIntBufNum(MAGIC_BYTES.length);
    class SignedMessage {
        constructor(message) {
            this.from = '';
            this.to = [];
            this.reply = '';
            this.subject = '';
            this.context = [];
            this.payload = '';
            this.ts = Date.now();
            Object.assign(this, message);
        }
        get hash() {
            const payloadBuf = buffer_1.Buffer.concat([
                buffer_1.Buffer.from(this.to.join(':')),
                buffer_1.Buffer.from(this.reply || ''),
                buffer_1.Buffer.from(this.subject),
                buffer_1.Buffer.from(this.context.join(':')),
                bsv_1__default['default'].Bw.varIntBufNum(this.ts),
                buffer_1.Buffer.from(this.payload || '')
            ]);
            const messageBuf = buffer_1.Buffer.concat([
                MAGIC_BYTES_PREFIX,
                MAGIC_BYTES,
                bsv_1__default['default'].Bw.varIntBufNum(payloadBuf.length),
                payloadBuf
            ]);
            return bsv_1__default['default'].Hash.sha256Sha256(messageBuf);
        }
        get id() {
            return this.hash.toString('hex');
        }
        get payloadObj() {
            return this.payload && JSON.parse(this.payload);
        }
        sign(keyPair) {
            this.sig = bsv_1__default['default'].Ecdsa.sign(this.hash, keyPair).toString();
        }
        async verify() {
            return bsv_1__default['default'].Ecdsa.asyncVerify(this.hash, bsv_1__default['default'].Sig.fromString(this.sig), bsv_1__default['default'].PubKey.fromString(this.from));
        }
    }
    exports.SignedMessage = SignedMessage;

    });

    var events_1 = /*@__PURE__*/getAugmentedNamespace(events);

    var wallet = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Wallet = void 0;




    class Wallet extends events_1.EventEmitter {
        constructor(paymail, keyPair, run) {
            super();
            this.paymail = paymail;
            this.keyPair = keyPair;
            this.timeouts = new Map();
            this.blockchain = run.blockchain;
            this.ownerPair = bsv_1__default['default'].KeyPair.fromPrivKey(bsv_1__default['default'].PrivKey.fromString(run.owner.privkey));
            this.pursePair = bsv_1__default['default'].KeyPair.fromPrivKey(bsv_1__default['default'].PrivKey.fromString(run.purse.privkey));
            this.pubkey = keyPair.pubKey.toHex();
            this.purse = run.purse.address;
            this.address = run.owner.address;
            this.balance = run.purse.balance.bind(run.purse);
            this.load = run.load.bind(run);
            this.createTransaction = () => new run.constructor.Transaction();
            this.loadTransaction = (rawtx) => run.import(rawtx);
            this.getTxPayload = (rawtx) => run.payload(rawtx);
            console.log(`PAYMAIL: ${paymail}`);
            console.log(`PUBKEY: ${keyPair.pubKey.toString()}`);
            console.log(`ADDRESS: ${this.address}`);
            console.log(`PURSE: ${this.purse}`);
        }
        get now() {
            return Date.now();
        }
        async loadJigIndex() {
            return this.blockchain.jigIndex(this.address);
        }
        async loadJig(loc) {
            const jig = await this.load(loc).catch((e) => {
                if (e.message.match(/not a/i))
                    return;
                console.error('Load error:', loc, e.message);
                throw e;
            });
            return jig;
        }
        async loadJigs() {
            const jigIndex = await this.loadJigIndex();
            const jigs = await Promise.all(jigIndex.map(j => this.loadJig(j.location)));
            console.log('JIGS:', jigs.length);
            return jigs;
        }
        buildMessage(messageData, sign = true) {
            messageData.ts = Date.now();
            messageData.from = this.keyPair.pubKey.toString();
            const message = new signedMessage.SignedMessage(messageData);
            if (sign)
                message.sign(this.keyPair);
            return message;
        }
        async signTx(tx) {
            return Promise.all(tx.txIns.map(async (txIn, i) => {
                const txid = buffer_1.Buffer.from(txIn.txHashBuf).reverse().toString('hex');
                const outTx = bsv_1__default['default'].Tx.fromHex(await this.blockchain.fetch(txid));
                const txOut = outTx.txOuts[txIn.txOutNum];
                if (txOut.script.isPubKeyHashOut()) {
                    const address = bsv_1__default['default'].Address.fromTxOutScript(txOut.script).toString();
                    if (address === this.purse) {
                        const sig = await tx.asyncSign(this.pursePair, undefined, i, txOut.script, txOut.valueBn);
                        txIn.setScript(new bsv_1__default['default'].Script().writeBuffer(sig.toTxFormat()).writeBuffer(this.pursePair.pubKey.toBuffer()));
                    }
                    else if (address === this.address) {
                        const sig = await tx.asyncSign(this.ownerPair, undefined, i, txOut.script, txOut.valueBn);
                        txIn.setScript(new bsv_1__default['default'].Script().writeBuffer(sig.toTxFormat()).writeBuffer(this.ownerPair.pubKey.toBuffer()));
                    }
                }
                return txOut;
            }));
        }
        async encrypt(pubkey) {
        }
        async decrypt(value) {
        }
        async verifySig(sig, hash, pubkey) {
            const msgHash = await bsv_1__default['default'].Hash.asyncSha256(buffer_1.Buffer.from(hash));
            const verified = bsv_1__default['default'].Ecdsa.verify(msgHash, bsv_1__default['default'].Sig.fromString(sig), bsv_1__default['default'].PubKey.fromString(pubkey));
            console.log('SIG:', verified, sig, hash, pubkey);
            return verified;
        }
        randomInt(max) {
            return Math.floor(Math.random() * (max || Number.MAX_SAFE_INTEGER));
        }
        randomBytes(size) {
            return bsv_1__default['default'].Random.getRandomBuffer(size).toString('hex');
        }
        setTimeout(cb, ms) {
            const timeoutId = Date.now();
            this.timeouts.set(timeoutId, setTimeout(async () => cb().catch(e => console.error('Timeout Error', e)), ms));
            return timeoutId;
        }
        clearTimeout(timeoutId) {
            if (this.timeouts.has(timeoutId)) {
                clearTimeout(this.timeouts.get(timeoutId));
            }
        }
    }
    exports.Wallet = Wallet;

    });

    var httpError = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HttpError = void 0;
    class HttpError extends Error {
        constructor(status, ...args) {
            super(...args);
            this.status = status;
        }
    }
    exports.HttpError = HttpError;

    });

    var restBlockchain = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RestBlockchain = void 0;


    class RestBlockchain {
        constructor(fetchLib, apiUrl, network, cache = new Map(), debug = false) {
            this.fetchLib = fetchLib;
            this.apiUrl = apiUrl;
            this.network = network;
            this.cache = cache;
            this.debug = debug;
            this.requests = new Map();
        }
        get bsvNetwork() {
            switch (this.network) {
                case 'stn':
                    return 'stn';
                case 'main':
                    return 'mainnet';
                default:
                    return 'testnet';
            }
        }
        async broadcast(rawtx) {
            if (this.debug)
                console.log('BROADCAST:', rawtx);
            const resp = await this.fetchLib(`${this.apiUrl}/broadcast`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawtx })
            });
            if (!resp.ok)
                throw new httpError.HttpError(resp.status, await resp.text());
            const txid = await resp.text();
            this.debug && console.log('Broadcast:', txid);
            await this.cache.set(`tx://${txid}`, rawtx);
            return txid;
        }
        async populateInputs(tx) {
            await Promise.all(tx.inputs.map(async (input) => {
                const outTx = await this.fetch(input.prevTxId.toString('hex'));
                input.output = outTx.outputs[input.outputIndex];
            }));
        }
        async fetch(txid) {
            if (this.debug)
                console.log('FETCH:', txid);
            let rawtx = await this.cache.get(`tx://${txid}`);
            if (rawtx)
                return rawtx;
            if (!this.requests.has(txid)) {
                const request = Promise.resolve().then(async () => {
                    const resp = await this.fetchLib(`${this.apiUrl}/tx/${txid}`);
                    if (!resp.ok)
                        throw new httpError.HttpError(resp.status, await resp.text());
                    rawtx = await resp.text();
                    await this.cache.set(`tx://${txid}`, rawtx);
                    this.requests.delete(txid);
                    return rawtx;
                });
                this.requests.set(txid, request);
            }
            return this.requests.get(txid);
        }
        ;
        async time(txid) {
            return Date.now();
            // const resp = await this.fetchLib(`${this.apiUrl}/tx/${txid}`);
            // if (resp.ok) {
            //     const {time} = await resp.json();
            //     await this.cache.set(`tx://${txid}`, rawtx);
            //     break;
            // }
        }
        async spends(txid, vout) {
            if (this.debug)
                console.log('SPENDS:', txid, vout);
            const cacheKey = `spend://${txid}_${vout}`;
            let spend = await this.cache.get(cacheKey);
            if (spend)
                return spend;
            if (!this.requests.has(cacheKey)) {
                const request = (async () => {
                    const resp = await this.fetchLib(`${this.apiUrl}/spends/${txid}_o${vout}`);
                    if (!resp.ok)
                        throw new httpError.HttpError(resp.status, await resp.text());
                    spend = (await resp.text()) || null;
                    if (spend)
                        await this.cache.set(cacheKey, spend);
                    this.requests.delete(cacheKey);
                    return spend;
                })();
                this.requests.set(cacheKey, request);
            }
            return this.requests.get(cacheKey);
        }
        async utxos(script) {
            if (this.debug)
                console.log('UTXOS:', script);
            const resp = await this.fetchLib(`${this.apiUrl}/utxos/${script}`);
            if (!resp.ok)
                throw new Error(await resp.text());
            return resp.json();
        }
        ;
        async jigIndex(address) {
            const resp = await this.fetchLib(`${this.apiUrl}/jigs/address/${address}`);
            if (!resp.ok)
                throw new Error(`${resp.status} ${resp.statusText}`);
            return resp.json();
        }
        async loadJigData(loc, unspent) {
            const resp = await this.fetchLib(`${this.apiUrl}/jigs/${loc}${unspent && '?unspent'}`);
            if (!resp.ok)
                throw new Error(`${resp.status} ${resp.statusText}`);
            return resp.json();
        }
        async jigQuery(query, limit = 10) {
            const resp = await this.fetchLib(`${this.apiUrl}/jigs/search?limit=${limit}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(query)
            });
            if (!resp.ok)
                throw new httpError.HttpError(resp.status, await resp.text());
            return resp.json();
        }
        async fund(address, satoshis) {
            const resp = await this.fetchLib(`${this.apiUrl}/fund/${address}${satoshis ? `?satoshis=${satoshis}` : ''}`);
            if (!resp.ok)
                throw new httpError.HttpError(resp.status, await resp.text());
            return resp.text();
        }
        async loadMessage(messageId) {
            const resp = await this.fetchLib(`${this.apiUrl}/messages/${messageId}`);
            if (!resp.ok)
                throw new httpError.HttpError(resp.status, await resp.text());
            return new signedMessage.SignedMessage(await resp.json());
        }
        async sendMessage(message, postTo) {
            const url = postTo || `${this.apiUrl}/messages`;
            console.log('Post TO:', url);
            const resp = await this.fetchLib(url, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(message)
            });
            if (!resp.ok)
                throw new httpError.HttpError(resp.status, await resp.text());
            return resp.json();
        }
    }
    exports.RestBlockchain = RestBlockchain;

    });

    var restStateCache = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RestStateCache = void 0;

    class RestStateCache {
        constructor(fetch, apiUrl, cache = new Map(), debug = false) {
            this.fetch = fetch;
            this.apiUrl = apiUrl;
            this.cache = cache;
            this.debug = debug;
            this.requests = new Map();
        }
        async get(key) {
            if (this.debug)
                console.log('State:', key);
            let value = await this.cache.get(key);
            if (value) {
                if (this.debug)
                    console.log('Cache Hit:', key);
                return value;
            }
            if (!this.requests.has(key)) {
                const request = (async () => {
                    const resp = await this.fetch(`${this.apiUrl}/state/${encodeURIComponent(key)}`);
                    if (!resp.ok) {
                        if (resp.status === 404) {
                            if (this.debug)
                                console.log('Remote Miss:', key);
                            return;
                        }
                        throw new httpError.HttpError(resp.status, resp.statusText);
                    }
                    if (this.debug)
                        console.log('Remote Hit:', key);
                    value = await resp.json();
                    await this.cache.set(key, value);
                    this.requests.delete(key);
                    return value;
                })();
                this.requests.set(key, request);
            }
            return this.requests.get(key);
        }
        async set(key, value) {
            await this.cache.set(key, value);
        }
    }
    exports.RestStateCache = RestStateCache;

    });

    class AuthService {
        constructor(apiUrl, domain, network) {
            this.apiUrl = apiUrl;
            this.domain = domain;
            this.network = network;
        }
        async createKey(handle, password) {
            const salt = await bsv_1.Hash.asyncSha256(Buffer.from(`${this.domain}|${handle}`));
            const pass = await bsv_1.Hash.asyncSha256(Buffer.from(password.normalize('NFKC')));
            const { hash } = await argon2.hash({ pass, salt, time: 100, mem: 1024, hashLen: 32 });
            return Buffer.from(hash);
        }
        async register(handle, password, email) {
            handle = handle.toLowerCase().normalize('NFKC');
            const keyhash = await this.createKey(handle, password);
            const versionByteNum = this.network === 'main' ?
                bsv_1.Constants.Mainnet.PrivKey.versionByteNum :
                bsv_1.Constants.Testnet.PrivKey.versionByteNum;
            const keybuf = Buffer.concat([
                Buffer.from([versionByteNum]),
                keyhash,
                Buffer.from([1]) // compressed flag
            ]);
            const privKey = new bsv_1.PrivKey().fromBuffer(keybuf);
            const keyPair = bsv_1.KeyPair.fromPrivKey(privKey);
            const pubkey = bsv_1.PubKey.fromPrivKey(privKey);
            const bip32 = bsv_1.Bip32.fromRandom();
            const recoveryBuf = await bsv_1.Ecies.asyncBitcoreEncrypt(Buffer.from(bip32.toString()), pubkey, keyPair);
            const reg = {
                pubkey: pubkey.toString(),
                xpub: bip32.toPublic().toString(),
                recovery: recoveryBuf.toString('base64'),
                email
            };
            const msgBuf = Buffer.from(`${this.domain}|${handle}|${reg.xpub}|${reg.recovery}|${email}`);
            const msgHash = await bsv_1.Hash.asyncSha256(msgBuf);
            const sig = bsv_1.Ecdsa.sign(msgHash, keyPair);
            reg.sig = sig.toString();
            const url = `${this.apiUrl}/api/accounts/${handle}@${this.domain}`;
            console.log(url);
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(reg)
            });
            if (!resp.ok) {
                console.error(resp.status, resp.statusText);
                throw new Error('Registration Failed');
            }
            return keyPair;
        }
        async login(handle, password) {
            handle = handle.toLowerCase().normalize('NFKC');
            const keyhash = await this.createKey(handle, password);
            const versionByteNum = this.network === 'main' ?
                bsv_1.Constants.Mainnet.PrivKey.versionByteNum :
                bsv_1.Constants.Testnet.PrivKey.versionByteNum;
            const keybuf = Buffer.concat([
                Buffer.from([versionByteNum]),
                keyhash,
                Buffer.from([1]) // compressed flag
            ]);
            const privKey = new bsv_1.PrivKey().fromBuffer(keybuf);
            return bsv_1.KeyPair.fromPrivKey(privKey);
        }
        async recover(paymail, keyPair) {
            const message = new signedMessage.SignedMessage({
                from: keyPair.pubKey.toString()
            });
            message.sign(keyPair);
            const url = `${this.apiUrl}/api/accounts/${encodeURIComponent(paymail)}/recover`;
            console.log(url);
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(message)
            });
            if (!resp.ok)
                throw new Error(`${resp.status} - ${resp.statusText}`);
            const recovery = await resp.json();
            const recoveryBuf = bsv_1.Ecies.bitcoreDecrypt(Buffer.from(recovery, 'base64'), keyPair.privKey);
            return recoveryBuf.toString();
        }
        async isHandleAvailable(handle) {
            handle = handle.toLowerCase();
            const url = `${this.apiUrl}/api/bsvalias/id/${encodeURIComponent(handle)}@${this.domain}`;
            console.log('Requesting:', url);
            try {
                const resp = await fetch(url);
                return resp.status === 404;
            }
            catch (e) {
                console.error('Error Fetching', e.message);
                return false;
            }
        }
    }

    var wsClient = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WSClient = void 0;

    class WSClient extends events_1.EventEmitter {
        constructor(client, url, channels = []) {
            super();
            this.client = client;
            this.url = url;
            this.lastIds = new Map();
            this.channels = new Set(channels);
            this.socket = this.connect();
        }
        connect() {
            const socket = new this.client(this.url);
            socket.onopen = () => {
                socket.onmessage = (e) => {
                    const { id, channel, event, data } = JSON.parse(e.data);
                    const lastId = this.lastIds.get(channel) || 0;
                    if (id > lastId)
                        this.lastIds.set(channel, id);
                    this.emit(event, data, channel);
                };
                Array.from(this.channels).forEach(channel => this.subscribe(channel));
            };
            socket.onerror = console.error;
            socket.onclose = () => {
                this.socket = this.connect();
            };
            return socket;
        }
        subscribe(channelId, lastId) {
            this.channels.add(channelId);
            if (!this.socket || this.socket.readyState !== 1)
                return;
            this.socket.send(JSON.stringify({
                action: 'subscribe',
                channelId,
                lastId: lastId || this.lastIds.get(channelId) || null
            }));
        }
        unsubscribe(channelId) {
            this.channels.delete(channelId);
            if (!this.socket || this.socket.readyState !== 1)
                return;
            this.socket.send(JSON.stringify({
                action: 'unsubscribe',
                channelId
            }));
        }
        close() {
            this.socket.close();
        }
    }
    exports.WSClient = WSClient;

    });

    bsv_1__default['default'].Constants.Default = bsv_1.Constants.Default;
    class WalletService extends EventEmitter {
        constructor() {
            super();
            this.authenticated = false;
            this.printLog = console.log.bind(console);
            this.printError = console.error.bind(console);
            this.logId = 0;
            this.logs = [];
            this.sessionId = `${Date.now()}-${Math.random() * Number.MAX_SAFE_INTEGER}`;
            this.timeLabels = {};
            this.apiUrl = '';
            this.domain = document.location.hash.slice(1).split('@')[1];
        }
        get channel() {
            const v = window.vuplex;
            return (v) ? v : window;
        }
        get channelScope() {
            const ref = document.referrer;
            if (ref && !this.isInUnity) {
                return ref.match(/^.+:\/\/[^\/]+/)[0];
            }
            else {
                return null;
            }
        }
        get isInUnity() {
            return (window.vuplex) ? true : false;
        }
        get handle() {
            return window.localStorage.getItem('HANDLE') || '';
        }
        set handle(value) {
            window.localStorage.setItem('HANDLE', value);
        }
        get keyPair() {
            const wif = window.localStorage.getItem('WIF');
            if (!wif)
                return null;
            return bsv_1.KeyPair.fromPrivKey(bsv_1.PrivKey.fromString(wif));
        }
        set keyPair(keyPair) {
            window.localStorage.setItem('WIF', keyPair.privKey.toString());
        }
        get agentId() {
            return document.location.hash.slice(1).split('@')[0];
        }
        get paymail() {
            return `${this.handle}@${this.domain}`;
        }
        async init() {
            let resp = await fetch(`${this.apiUrl}/wallet/config`);
            const config = this.config = await resp.json();
            console.log('Config:', JSON.stringify(config));
            this.overrideConsole();
            console.log('Run:', Run.version);
            bsv_1.Constants.Default = config.network === 'main' ? bsv_1.Constants.Mainnet : bsv_1.Constants.Testnet;
            this.auth = new AuthService(this.apiUrl, this.domain, config.network);
            let initialized = false;
            while (config.ephemeral && !initialized) {
                await new Promise((resolve) => setTimeout(() => resolve(), 5000));
                resp = await fetch(`${this.apiUrl}/initialize`);
                initialized = resp.ok && await resp.json();
            }
            this.clientEmit('WALLET_READY');
            this.channel.addEventListener('message', this.onClientEvent.bind(this));
            console.log('BLOCKCHAIN:', this.apiUrl);
            const url = `${this.apiUrl}/agents/${this.domain}/${this.agentId}`;
            console.log('fetching:', url);
            resp = await fetch(url);
            if (!resp.ok)
                throw new Error(`${resp.status} - ${resp.statusText}`);
            this.agentDef = await resp.json();
            if (!this.agentDef)
                throw new Error('AGENT MISSING');
            if (config.errorLog) {
                setInterval(async () => {
                    const logs = this.logs;
                    this.logs = [];
                    if (!logs.length)
                        return;
                    const resp = await fetch('/log', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(logs)
                    });
                    if (!resp.ok)
                        throw new Error(`${resp.status} - ${resp.statusText}`);
                }, 5000);
            }
            // console.log('SHOW LOGIN');
            if (this.agentDef.anonymous)
                return this.initializeWallet();
            if (!config.ephemeral && !this.keyPair)
                return this.show('home');
            try {
                await this.initializeUser();
                this.show('menu');
            }
            catch (e) {
                console.error('Login Error:', e.message);
                this.show('home');
            }
        }
        async initializeWallet(owner, purse) {
            const cache = new Run.plugins.BrowserCache({ maxMemorySizeMB: 100 });
            const blockchain = this.blockchain = new restBlockchain.RestBlockchain(fetch.bind(window), this.apiUrl, this.config.network, cache);
            const run = new Run({
                network: this.config.network,
                owner,
                blockchain,
                purse,
                cache: new restStateCache.RestStateCache(fetch.bind(window), this.apiUrl, cache),
                app: this.config.app || 'kronoverse',
                trust: '*',
                timeout: 60000,
                logger: {
                    error: console.error
                }
            });
            const wallet$1 = this.wallet = new wallet.Wallet(this.paymail, this.keyPair, run);
            // const storage = new IORedisMock();
            const channels = [this.keyPair.pubKey.toString()];
            if (this.config.ephemeral) {
                console.log('Ephemeral. Listening to owner', run.owner.address);
                channels.push(run.owner.address);
            }
            let ws;
            if (this.config.sockets) {
                console.log('Sockets:', this.config.sockets);
                ws = new wsClient.WSClient(WebSocket, this.config.sockets, channels);
            }
            console.log('DOMAIN:', this.domain);
            console.log('AGENT_ID:', this.agentId);
            console.log('LOC:', this.agentDef.location);
            const Agent = await run.load(this.agentDef.location);
            const agent = this.agent = new Agent(wallet$1, blockchain, null, bsv_1__default['default'], { fetch, Buffer, ws, SignedMessage: signedMessage.SignedMessage });
            agent.on('client', this.clientEmit.bind(this));
            agent.on('subscribe', (channel, lastId) => {
                ws.subscribe(channel, lastId);
            });
            agent.on('unsubscribe', (channel) => {
                ws.unsubscribe(channel);
            });
            await agent.init();
            this.clientEmit('AGENT_LOADED');
            ws.on('jig', (jig, channel) => {
                console.log('JIG:', JSON.stringify(jig));
                agent.onJig(jig).catch(console.error);
            });
            ws.on('msg', (message, channel) => {
                console.log('MSG:', JSON.stringify(message));
                agent.onMessage(new signedMessage.SignedMessage(message)).catch(console.error);
            });
        }
        async initializeUser(handle) {
            console.log('Initializing User');
            if (handle)
                this.handle = handle;
            let bip32;
            if (this.config.ephemeral) {
                bip32 = bsv_1.Bip32.fromRandom();
                this.keyPair = bsv_1.KeyPair.fromPrivKey(bip32.privKey);
            }
            else {
                console.log('Recovering account');
                const xpriv = await this.auth.recover(this.paymail, this.keyPair);
                bip32 = bsv_1.Bip32.fromString(xpriv);
            }
            this.authenticated = true;
            this.initializeWallet(bip32.derive('m/1/0').privKey.toString(), bip32.derive('m/0/0').privKey.toString());
        }
        async login(handle, password) {
            this.keyPair = await this.auth.login(handle, password);
            await this.initializeUser(handle);
            this.show('menu');
        }
        async register(handle, password, email) {
            this.keyPair = await this.auth.register(handle, password, email);
            await this.initializeUser(handle);
            this.show('menu');
        }
        async logout() {
            this.authenticated = false;
            window.localStorage.removeItem('WIF');
            window.localStorage.removeItem('HANDLE');
        }
        async blockInput(x, y, width, height) {
            console.log(`BlockInput`, x, y, width, height);
            this.clientEmit('BlockInput', {
                x, y, width, height
            });
        }
        async getBalance() {
            if (!this.agent)
                return 0;
            const balance = await this.agent.getBalance();
            return Math.round(balance / 10000) / 100;
        }
        async show(viewName, message) {
            this.emit('show', {
                viewName,
                message
            });
        }
        async onClientEvent(event) {
            const message = {};
            if (!this.tryParseMessageData(event.data, message))
                return;
            if (['Register', 'Login'].includes(message.name)) {
                console.log(`WALLET RECEIVED EVENT:`, message.name);
            }
            else {
                console.log(`WALLET RECEIVED EVENT:`, JSON.stringify(message));
            }
            const response = {
                name: `On${message.name}`
            };
            try {
                const payload = message.payload && JSON.parse(message.payload);
                switch (message.name) {
                    case 'Register':
                        await this.register(payload.handle, payload.password, payload.email);
                        break;
                    case 'Login':
                        await this.login(payload.handle, payload.password);
                        break;
                    case 'Logout':
                        await this.logout();
                        break;
                    case 'Cashout':
                        if (!this.wallet)
                            throw new Error('Wallet not initialized');
                        // await this.wallet.cashout(payload);
                        this.clientEmit('BalanceUpdated', 0);
                        break;
                    case 'IsHandleAvailable':
                        response.payload = JSON.stringify(await this.auth.isHandleAvailable(payload));
                        break;
                    default:
                        if (!this.agent)
                            throw new Error('Agent not initialized');
                        const result = await this.agent.onEvent(message.name, payload);
                        response.payload = result && JSON.stringify(result);
                }
                response.success = true;
            }
            catch (e) {
                response.success = false;
                response.payload = JSON.stringify(e.message);
                if (e.status === 402) {
                    console.log('Showing Cashier');
                    this.show('cashier', { body: 'Insufficient Balance' });
                }
                else {
                    response.statusCode = e.status || 500;
                }
            }
            console.log(response.name, response.payload);
            this.postMessage(response);
            return;
        }
        tryParseMessageData(data, outByRef) {
            const message = (outByRef || {});
            if (typeof data === 'string') {
                Object.assign(message, JSON.parse(Buffer.from(data, 'base64').toString()));
            }
            else if (typeof data === 'object') {
                Object.assign(message, data);
            }
            return message && message.name;
        }
        clientEmit(name, payload) {
            // console.log('Emitting', name, payload && JSON.stringify(payload));
            const message = {
                name,
                payload: payload && JSON.stringify(payload),
                success: true
            };
            this.logs.push({
                idx: this.logId++,
                sessionId: this.sessionId,
                handle: this.handle,
                type: 'log',
                ts: Date.now(),
                message: {
                    name,
                    payload
                }
            });
            this.postMessage(message);
        }
        postMessage(message) {
            message.target = 'kronoverse';
            if (this.isInUnity) {
                this.channel.postMessage(message);
            }
            else if (this.channelScope) {
                if (this.channel !== this.channel.parent) {
                    this.channel.parent.postMessage(message, this.channelScope);
                }
            }
            if (!['Log', 'Error'].includes(message.name))
                this.postMessage({
                    name: 'Log',
                    payload: JSON.stringify(message),
                    success: true
                });
        }
        overrideConsole() {
            console.log = (...messages) => {
                messages.unshift(Date.now());
                const message = messages.join(' ');
                this.logs.push({
                    idx: this.logId++,
                    sessionId: this.sessionId,
                    paymail: this.paymail,
                    type: 'log',
                    ts: Date.now(),
                    message
                });
                this.clientEmit('Log', message);
                this.printLog(...messages);
            };
            console.error = (...messages) => {
                messages.unshift(Date.now());
                const message = messages.join(' ');
                this.logs.push({
                    idx: this.logId++,
                    sessionId: this.sessionId,
                    paymail: this.paymail,
                    type: 'error',
                    ts: Date.now(),
                    message
                });
                this.clientEmit('Error', message);
                this.printError(...messages);
            };
            console.time = (label) => {
                this.timeLabels[label] = Date.now();
            };
            console.timeEnd = (label) => {
                console.log(`${label}: ${Date.now() - this.timeLabels[label] || 0}ms`);
            };
        }
    }

    const route = writable('/');
    const currentUser = writable('Guest');
    const balance = writable(0);
    const loggedIn = writable(false);
    const loading = writable(false);
    const displayMode = writable('menuMode'); //menuMode, panelMode, frameMode
    let counter = 0;
    const walletService = readable(new WalletService(), (set) => {
        console.log(`Store Sub Count: ${counter++}`);
        /*initialize?*/
        /*set?*/
        return () => { };
    });

    function toInteger(dirtyNumber) {
      if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
        return NaN;
      }

      var number = Number(dirtyNumber);

      if (isNaN(number)) {
        return number;
      }

      return number < 0 ? Math.ceil(number) : Math.floor(number);
    }

    function requiredArgs(required, args) {
      if (args.length < required) {
        throw new TypeError(required + ' argument' + (required > 1 ? 's' : '') + ' required, but only ' + args.length + ' present');
      }
    }

    /**
     * @name toDate
     * @category Common Helpers
     * @summary Convert the given argument to an instance of Date.
     *
     * @description
     * Convert the given argument to an instance of Date.
     *
     * If the argument is an instance of Date, the function returns its clone.
     *
     * If the argument is a number, it is treated as a timestamp.
     *
     * If the argument is none of the above, the function returns Invalid Date.
     *
     * **Note**: *all* Date arguments passed to any *date-fns* function is processed by `toDate`.
     *
     * @param {Date|Number} argument - the value to convert
     * @returns {Date} the parsed date in the local time zone
     * @throws {TypeError} 1 argument required
     *
     * @example
     * // Clone the date:
     * const result = toDate(new Date(2014, 1, 11, 11, 30, 30))
     * //=> Tue Feb 11 2014 11:30:30
     *
     * @example
     * // Convert the timestamp to date:
     * const result = toDate(1392098430000)
     * //=> Tue Feb 11 2014 11:30:30
     */

    function toDate(argument) {
      requiredArgs(1, arguments);
      var argStr = Object.prototype.toString.call(argument); // Clone the date

      if (argument instanceof Date || typeof argument === 'object' && argStr === '[object Date]') {
        // Prevent the date to lose the milliseconds when passed to new Date() in IE10
        return new Date(argument.getTime());
      } else if (typeof argument === 'number' || argStr === '[object Number]') {
        return new Date(argument);
      } else {
        if ((typeof argument === 'string' || argStr === '[object String]') && typeof console !== 'undefined') {
          // eslint-disable-next-line no-console
          console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://git.io/fjule"); // eslint-disable-next-line no-console

          console.warn(new Error().stack);
        }

        return new Date(NaN);
      }
    }

    /**
     * @name addMilliseconds
     * @category Millisecond Helpers
     * @summary Add the specified number of milliseconds to the given date.
     *
     * @description
     * Add the specified number of milliseconds to the given date.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Date|Number} date - the date to be changed
     * @param {Number} amount - the amount of milliseconds to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @returns {Date} the new date with the milliseconds added
     * @throws {TypeError} 2 arguments required
     *
     * @example
     * // Add 750 milliseconds to 10 July 2014 12:45:30.000:
     * var result = addMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
     * //=> Thu Jul 10 2014 12:45:30.750
     */

    function addMilliseconds(dirtyDate, dirtyAmount) {
      requiredArgs(2, arguments);
      var timestamp = toDate(dirtyDate).getTime();
      var amount = toInteger(dirtyAmount);
      return new Date(timestamp + amount);
    }

    var MILLISECONDS_IN_MINUTE = 60000;

    function getDateMillisecondsPart(date) {
      return date.getTime() % MILLISECONDS_IN_MINUTE;
    }
    /**
     * Google Chrome as of 67.0.3396.87 introduced timezones with offset that includes seconds.
     * They usually appear for dates that denote time before the timezones were introduced
     * (e.g. for 'Europe/Prague' timezone the offset is GMT+00:57:44 before 1 October 1891
     * and GMT+01:00:00 after that date)
     *
     * Date#getTimezoneOffset returns the offset in minutes and would return 57 for the example above,
     * which would lead to incorrect calculations.
     *
     * This function returns the timezone offset in milliseconds that takes seconds in account.
     */


    function getTimezoneOffsetInMilliseconds(dirtyDate) {
      var date = new Date(dirtyDate.getTime());
      var baseTimezoneOffset = Math.ceil(date.getTimezoneOffset());
      date.setSeconds(0, 0);
      var hasNegativeUTCOffset = baseTimezoneOffset > 0;
      var millisecondsPartOfTimezoneOffset = hasNegativeUTCOffset ? (MILLISECONDS_IN_MINUTE + getDateMillisecondsPart(date)) % MILLISECONDS_IN_MINUTE : getDateMillisecondsPart(date);
      return baseTimezoneOffset * MILLISECONDS_IN_MINUTE + millisecondsPartOfTimezoneOffset;
    }

    /**
     * @name isValid
     * @category Common Helpers
     * @summary Is the given date valid?
     *
     * @description
     * Returns false if argument is Invalid Date and true otherwise.
     * Argument is converted to Date using `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
     * Invalid Date is a Date, whose time value is NaN.
     *
     * Time value of Date: http://es5.github.io/#x15.9.1.1
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * - Now `isValid` doesn't throw an exception
     *   if the first argument is not an instance of Date.
     *   Instead, argument is converted beforehand using `toDate`.
     *
     *   Examples:
     *
     *   | `isValid` argument        | Before v2.0.0 | v2.0.0 onward |
     *   |---------------------------|---------------|---------------|
     *   | `new Date()`              | `true`        | `true`        |
     *   | `new Date('2016-01-01')`  | `true`        | `true`        |
     *   | `new Date('')`            | `false`       | `false`       |
     *   | `new Date(1488370835081)` | `true`        | `true`        |
     *   | `new Date(NaN)`           | `false`       | `false`       |
     *   | `'2016-01-01'`            | `TypeError`   | `false`       |
     *   | `''`                      | `TypeError`   | `false`       |
     *   | `1488370835081`           | `TypeError`   | `true`        |
     *   | `NaN`                     | `TypeError`   | `false`       |
     *
     *   We introduce this change to make *date-fns* consistent with ECMAScript behavior
     *   that try to coerce arguments to the expected type
     *   (which is also the case with other *date-fns* functions).
     *
     * @param {*} date - the date to check
     * @returns {Boolean} the date is valid
     * @throws {TypeError} 1 argument required
     *
     * @example
     * // For the valid date:
     * var result = isValid(new Date(2014, 1, 31))
     * //=> true
     *
     * @example
     * // For the value, convertable into a date:
     * var result = isValid(1393804800000)
     * //=> true
     *
     * @example
     * // For the invalid date:
     * var result = isValid(new Date(''))
     * //=> false
     */

    function isValid(dirtyDate) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      return !isNaN(date);
    }

    var formatDistanceLocale = {
      lessThanXSeconds: {
        one: 'less than a second',
        other: 'less than {{count}} seconds'
      },
      xSeconds: {
        one: '1 second',
        other: '{{count}} seconds'
      },
      halfAMinute: 'half a minute',
      lessThanXMinutes: {
        one: 'less than a minute',
        other: 'less than {{count}} minutes'
      },
      xMinutes: {
        one: '1 minute',
        other: '{{count}} minutes'
      },
      aboutXHours: {
        one: 'about 1 hour',
        other: 'about {{count}} hours'
      },
      xHours: {
        one: '1 hour',
        other: '{{count}} hours'
      },
      xDays: {
        one: '1 day',
        other: '{{count}} days'
      },
      aboutXWeeks: {
        one: 'about 1 week',
        other: 'about {{count}} weeks'
      },
      xWeeks: {
        one: '1 week',
        other: '{{count}} weeks'
      },
      aboutXMonths: {
        one: 'about 1 month',
        other: 'about {{count}} months'
      },
      xMonths: {
        one: '1 month',
        other: '{{count}} months'
      },
      aboutXYears: {
        one: 'about 1 year',
        other: 'about {{count}} years'
      },
      xYears: {
        one: '1 year',
        other: '{{count}} years'
      },
      overXYears: {
        one: 'over 1 year',
        other: 'over {{count}} years'
      },
      almostXYears: {
        one: 'almost 1 year',
        other: 'almost {{count}} years'
      }
    };
    function formatDistance(token, count, options) {
      options = options || {};
      var result;

      if (typeof formatDistanceLocale[token] === 'string') {
        result = formatDistanceLocale[token];
      } else if (count === 1) {
        result = formatDistanceLocale[token].one;
      } else {
        result = formatDistanceLocale[token].other.replace('{{count}}', count);
      }

      if (options.addSuffix) {
        if (options.comparison > 0) {
          return 'in ' + result;
        } else {
          return result + ' ago';
        }
      }

      return result;
    }

    function buildFormatLongFn(args) {
      return function (dirtyOptions) {
        var options = dirtyOptions || {};
        var width = options.width ? String(options.width) : args.defaultWidth;
        var format = args.formats[width] || args.formats[args.defaultWidth];
        return format;
      };
    }

    var dateFormats = {
      full: 'EEEE, MMMM do, y',
      long: 'MMMM do, y',
      medium: 'MMM d, y',
      short: 'MM/dd/yyyy'
    };
    var timeFormats = {
      full: 'h:mm:ss a zzzz',
      long: 'h:mm:ss a z',
      medium: 'h:mm:ss a',
      short: 'h:mm a'
    };
    var dateTimeFormats = {
      full: "{{date}} 'at' {{time}}",
      long: "{{date}} 'at' {{time}}",
      medium: '{{date}}, {{time}}',
      short: '{{date}}, {{time}}'
    };
    var formatLong = {
      date: buildFormatLongFn({
        formats: dateFormats,
        defaultWidth: 'full'
      }),
      time: buildFormatLongFn({
        formats: timeFormats,
        defaultWidth: 'full'
      }),
      dateTime: buildFormatLongFn({
        formats: dateTimeFormats,
        defaultWidth: 'full'
      })
    };

    var formatRelativeLocale = {
      lastWeek: "'last' eeee 'at' p",
      yesterday: "'yesterday at' p",
      today: "'today at' p",
      tomorrow: "'tomorrow at' p",
      nextWeek: "eeee 'at' p",
      other: 'P'
    };
    function formatRelative(token, _date, _baseDate, _options) {
      return formatRelativeLocale[token];
    }

    function buildLocalizeFn(args) {
      return function (dirtyIndex, dirtyOptions) {
        var options = dirtyOptions || {};
        var context = options.context ? String(options.context) : 'standalone';
        var valuesArray;

        if (context === 'formatting' && args.formattingValues) {
          var defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
          var width = options.width ? String(options.width) : defaultWidth;
          valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
        } else {
          var _defaultWidth = args.defaultWidth;

          var _width = options.width ? String(options.width) : args.defaultWidth;

          valuesArray = args.values[_width] || args.values[_defaultWidth];
        }

        var index = args.argumentCallback ? args.argumentCallback(dirtyIndex) : dirtyIndex;
        return valuesArray[index];
      };
    }

    var eraValues = {
      narrow: ['B', 'A'],
      abbreviated: ['BC', 'AD'],
      wide: ['Before Christ', 'Anno Domini']
    };
    var quarterValues = {
      narrow: ['1', '2', '3', '4'],
      abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
      wide: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'] // Note: in English, the names of days of the week and months are capitalized.
      // If you are making a new locale based on this one, check if the same is true for the language you're working on.
      // Generally, formatted dates should look like they are in the middle of a sentence,
      // e.g. in Spanish language the weekdays and months should be in the lowercase.

    };
    var monthValues = {
      narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      abbreviated: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      wide: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    };
    var dayValues = {
      narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      abbreviated: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      wide: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    };
    var dayPeriodValues = {
      narrow: {
        am: 'a',
        pm: 'p',
        midnight: 'mi',
        noon: 'n',
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
        night: 'night'
      },
      abbreviated: {
        am: 'AM',
        pm: 'PM',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
        night: 'night'
      },
      wide: {
        am: 'a.m.',
        pm: 'p.m.',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
        night: 'night'
      }
    };
    var formattingDayPeriodValues = {
      narrow: {
        am: 'a',
        pm: 'p',
        midnight: 'mi',
        noon: 'n',
        morning: 'in the morning',
        afternoon: 'in the afternoon',
        evening: 'in the evening',
        night: 'at night'
      },
      abbreviated: {
        am: 'AM',
        pm: 'PM',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'in the morning',
        afternoon: 'in the afternoon',
        evening: 'in the evening',
        night: 'at night'
      },
      wide: {
        am: 'a.m.',
        pm: 'p.m.',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'in the morning',
        afternoon: 'in the afternoon',
        evening: 'in the evening',
        night: 'at night'
      }
    };

    function ordinalNumber(dirtyNumber, _dirtyOptions) {
      var number = Number(dirtyNumber); // If ordinal numbers depend on context, for example,
      // if they are different for different grammatical genders,
      // use `options.unit`:
      //
      //   var options = dirtyOptions || {}
      //   var unit = String(options.unit)
      //
      // where `unit` can be 'year', 'quarter', 'month', 'week', 'date', 'dayOfYear',
      // 'day', 'hour', 'minute', 'second'

      var rem100 = number % 100;

      if (rem100 > 20 || rem100 < 10) {
        switch (rem100 % 10) {
          case 1:
            return number + 'st';

          case 2:
            return number + 'nd';

          case 3:
            return number + 'rd';
        }
      }

      return number + 'th';
    }

    var localize = {
      ordinalNumber: ordinalNumber,
      era: buildLocalizeFn({
        values: eraValues,
        defaultWidth: 'wide'
      }),
      quarter: buildLocalizeFn({
        values: quarterValues,
        defaultWidth: 'wide',
        argumentCallback: function (quarter) {
          return Number(quarter) - 1;
        }
      }),
      month: buildLocalizeFn({
        values: monthValues,
        defaultWidth: 'wide'
      }),
      day: buildLocalizeFn({
        values: dayValues,
        defaultWidth: 'wide'
      }),
      dayPeriod: buildLocalizeFn({
        values: dayPeriodValues,
        defaultWidth: 'wide',
        formattingValues: formattingDayPeriodValues,
        defaultFormattingWidth: 'wide'
      })
    };

    function buildMatchPatternFn(args) {
      return function (dirtyString, dirtyOptions) {
        var string = String(dirtyString);
        var options = dirtyOptions || {};
        var matchResult = string.match(args.matchPattern);

        if (!matchResult) {
          return null;
        }

        var matchedString = matchResult[0];
        var parseResult = string.match(args.parsePattern);

        if (!parseResult) {
          return null;
        }

        var value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
        value = options.valueCallback ? options.valueCallback(value) : value;
        return {
          value: value,
          rest: string.slice(matchedString.length)
        };
      };
    }

    function buildMatchFn(args) {
      return function (dirtyString, dirtyOptions) {
        var string = String(dirtyString);
        var options = dirtyOptions || {};
        var width = options.width;
        var matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
        var matchResult = string.match(matchPattern);

        if (!matchResult) {
          return null;
        }

        var matchedString = matchResult[0];
        var parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
        var value;

        if (Object.prototype.toString.call(parsePatterns) === '[object Array]') {
          value = findIndex(parsePatterns, function (pattern) {
            return pattern.test(matchedString);
          });
        } else {
          value = findKey(parsePatterns, function (pattern) {
            return pattern.test(matchedString);
          });
        }

        value = args.valueCallback ? args.valueCallback(value) : value;
        value = options.valueCallback ? options.valueCallback(value) : value;
        return {
          value: value,
          rest: string.slice(matchedString.length)
        };
      };
    }

    function findKey(object, predicate) {
      for (var key in object) {
        if (object.hasOwnProperty(key) && predicate(object[key])) {
          return key;
        }
      }
    }

    function findIndex(array, predicate) {
      for (var key = 0; key < array.length; key++) {
        if (predicate(array[key])) {
          return key;
        }
      }
    }

    var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
    var parseOrdinalNumberPattern = /\d+/i;
    var matchEraPatterns = {
      narrow: /^(b|a)/i,
      abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
      wide: /^(before christ|before common era|anno domini|common era)/i
    };
    var parseEraPatterns = {
      any: [/^b/i, /^(a|c)/i]
    };
    var matchQuarterPatterns = {
      narrow: /^[1234]/i,
      abbreviated: /^q[1234]/i,
      wide: /^[1234](th|st|nd|rd)? quarter/i
    };
    var parseQuarterPatterns = {
      any: [/1/i, /2/i, /3/i, /4/i]
    };
    var matchMonthPatterns = {
      narrow: /^[jfmasond]/i,
      abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
      wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
    };
    var parseMonthPatterns = {
      narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
      any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^may/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
    };
    var matchDayPatterns = {
      narrow: /^[smtwf]/i,
      short: /^(su|mo|tu|we|th|fr|sa)/i,
      abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
      wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
    };
    var parseDayPatterns = {
      narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
      any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
    };
    var matchDayPeriodPatterns = {
      narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
      any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
    };
    var parseDayPeriodPatterns = {
      any: {
        am: /^a/i,
        pm: /^p/i,
        midnight: /^mi/i,
        noon: /^no/i,
        morning: /morning/i,
        afternoon: /afternoon/i,
        evening: /evening/i,
        night: /night/i
      }
    };
    var match = {
      ordinalNumber: buildMatchPatternFn({
        matchPattern: matchOrdinalNumberPattern,
        parsePattern: parseOrdinalNumberPattern,
        valueCallback: function (value) {
          return parseInt(value, 10);
        }
      }),
      era: buildMatchFn({
        matchPatterns: matchEraPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseEraPatterns,
        defaultParseWidth: 'any'
      }),
      quarter: buildMatchFn({
        matchPatterns: matchQuarterPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseQuarterPatterns,
        defaultParseWidth: 'any',
        valueCallback: function (index) {
          return index + 1;
        }
      }),
      month: buildMatchFn({
        matchPatterns: matchMonthPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseMonthPatterns,
        defaultParseWidth: 'any'
      }),
      day: buildMatchFn({
        matchPatterns: matchDayPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseDayPatterns,
        defaultParseWidth: 'any'
      }),
      dayPeriod: buildMatchFn({
        matchPatterns: matchDayPeriodPatterns,
        defaultMatchWidth: 'any',
        parsePatterns: parseDayPeriodPatterns,
        defaultParseWidth: 'any'
      })
    };

    /**
     * @type {Locale}
     * @category Locales
     * @summary English locale (United States).
     * @language English
     * @iso-639-2 eng
     * @author Sasha Koss [@kossnocorp]{@link https://github.com/kossnocorp}
     * @author Lesha Koss [@leshakoss]{@link https://github.com/leshakoss}
     */

    var locale = {
      code: 'en-US',
      formatDistance: formatDistance,
      formatLong: formatLong,
      formatRelative: formatRelative,
      localize: localize,
      match: match,
      options: {
        weekStartsOn: 0
        /* Sunday */
        ,
        firstWeekContainsDate: 1
      }
    };

    /**
     * @name subMilliseconds
     * @category Millisecond Helpers
     * @summary Subtract the specified number of milliseconds from the given date.
     *
     * @description
     * Subtract the specified number of milliseconds from the given date.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Date|Number} date - the date to be changed
     * @param {Number} amount - the amount of milliseconds to be subtracted. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @returns {Date} the new date with the milliseconds subtracted
     * @throws {TypeError} 2 arguments required
     *
     * @example
     * // Subtract 750 milliseconds from 10 July 2014 12:45:30.000:
     * var result = subMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
     * //=> Thu Jul 10 2014 12:45:29.250
     */

    function subMilliseconds(dirtyDate, dirtyAmount) {
      requiredArgs(2, arguments);
      var amount = toInteger(dirtyAmount);
      return addMilliseconds(dirtyDate, -amount);
    }

    function addLeadingZeros(number, targetLength) {
      var sign = number < 0 ? '-' : '';
      var output = Math.abs(number).toString();

      while (output.length < targetLength) {
        output = '0' + output;
      }

      return sign + output;
    }

    /*
     * |     | Unit                           |     | Unit                           |
     * |-----|--------------------------------|-----|--------------------------------|
     * |  a  | AM, PM                         |  A* |                                |
     * |  d  | Day of month                   |  D  |                                |
     * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
     * |  m  | Minute                         |  M  | Month                          |
     * |  s  | Second                         |  S  | Fraction of second             |
     * |  y  | Year (abs)                     |  Y  |                                |
     *
     * Letters marked by * are not implemented but reserved by Unicode standard.
     */

    var formatters = {
      // Year
      y: function (date, token) {
        // From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_tokens
        // | Year     |     y | yy |   yyy |  yyyy | yyyyy |
        // |----------|-------|----|-------|-------|-------|
        // | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
        // | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
        // | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
        // | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
        // | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |
        var signedYear = date.getUTCFullYear(); // Returns 1 for 1 BC (which is year 0 in JavaScript)

        var year = signedYear > 0 ? signedYear : 1 - signedYear;
        return addLeadingZeros(token === 'yy' ? year % 100 : year, token.length);
      },
      // Month
      M: function (date, token) {
        var month = date.getUTCMonth();
        return token === 'M' ? String(month + 1) : addLeadingZeros(month + 1, 2);
      },
      // Day of the month
      d: function (date, token) {
        return addLeadingZeros(date.getUTCDate(), token.length);
      },
      // AM or PM
      a: function (date, token) {
        var dayPeriodEnumValue = date.getUTCHours() / 12 >= 1 ? 'pm' : 'am';

        switch (token) {
          case 'a':
          case 'aa':
          case 'aaa':
            return dayPeriodEnumValue.toUpperCase();

          case 'aaaaa':
            return dayPeriodEnumValue[0];

          case 'aaaa':
          default:
            return dayPeriodEnumValue === 'am' ? 'a.m.' : 'p.m.';
        }
      },
      // Hour [1-12]
      h: function (date, token) {
        return addLeadingZeros(date.getUTCHours() % 12 || 12, token.length);
      },
      // Hour [0-23]
      H: function (date, token) {
        return addLeadingZeros(date.getUTCHours(), token.length);
      },
      // Minute
      m: function (date, token) {
        return addLeadingZeros(date.getUTCMinutes(), token.length);
      },
      // Second
      s: function (date, token) {
        return addLeadingZeros(date.getUTCSeconds(), token.length);
      },
      // Fraction of second
      S: function (date, token) {
        var numberOfDigits = token.length;
        var milliseconds = date.getUTCMilliseconds();
        var fractionalSeconds = Math.floor(milliseconds * Math.pow(10, numberOfDigits - 3));
        return addLeadingZeros(fractionalSeconds, token.length);
      }
    };

    var MILLISECONDS_IN_DAY = 86400000; // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCDayOfYear(dirtyDate) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      var timestamp = date.getTime();
      date.setUTCMonth(0, 1);
      date.setUTCHours(0, 0, 0, 0);
      var startOfYearTimestamp = date.getTime();
      var difference = timestamp - startOfYearTimestamp;
      return Math.floor(difference / MILLISECONDS_IN_DAY) + 1;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCISOWeek(dirtyDate) {
      requiredArgs(1, arguments);
      var weekStartsOn = 1;
      var date = toDate(dirtyDate);
      var day = date.getUTCDay();
      var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
      date.setUTCDate(date.getUTCDate() - diff);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCISOWeekYear(dirtyDate) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      var year = date.getUTCFullYear();
      var fourthOfJanuaryOfNextYear = new Date(0);
      fourthOfJanuaryOfNextYear.setUTCFullYear(year + 1, 0, 4);
      fourthOfJanuaryOfNextYear.setUTCHours(0, 0, 0, 0);
      var startOfNextYear = startOfUTCISOWeek(fourthOfJanuaryOfNextYear);
      var fourthOfJanuaryOfThisYear = new Date(0);
      fourthOfJanuaryOfThisYear.setUTCFullYear(year, 0, 4);
      fourthOfJanuaryOfThisYear.setUTCHours(0, 0, 0, 0);
      var startOfThisYear = startOfUTCISOWeek(fourthOfJanuaryOfThisYear);

      if (date.getTime() >= startOfNextYear.getTime()) {
        return year + 1;
      } else if (date.getTime() >= startOfThisYear.getTime()) {
        return year;
      } else {
        return year - 1;
      }
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCISOWeekYear(dirtyDate) {
      requiredArgs(1, arguments);
      var year = getUTCISOWeekYear(dirtyDate);
      var fourthOfJanuary = new Date(0);
      fourthOfJanuary.setUTCFullYear(year, 0, 4);
      fourthOfJanuary.setUTCHours(0, 0, 0, 0);
      var date = startOfUTCISOWeek(fourthOfJanuary);
      return date;
    }

    var MILLISECONDS_IN_WEEK = 604800000; // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCISOWeek(dirtyDate) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      var diff = startOfUTCISOWeek(date).getTime() - startOfUTCISOWeekYear(date).getTime(); // Round the number of days to the nearest integer
      // because the number of milliseconds in a week is not constant
      // (e.g. it's different in the week of the daylight saving time clock shift)

      return Math.round(diff / MILLISECONDS_IN_WEEK) + 1;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCWeek(dirtyDate, dirtyOptions) {
      requiredArgs(1, arguments);
      var options = dirtyOptions || {};
      var locale = options.locale;
      var localeWeekStartsOn = locale && locale.options && locale.options.weekStartsOn;
      var defaultWeekStartsOn = localeWeekStartsOn == null ? 0 : toInteger(localeWeekStartsOn);
      var weekStartsOn = options.weekStartsOn == null ? defaultWeekStartsOn : toInteger(options.weekStartsOn); // Test if weekStartsOn is between 0 and 6 _and_ is not NaN

      if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
        throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
      }

      var date = toDate(dirtyDate);
      var day = date.getUTCDay();
      var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
      date.setUTCDate(date.getUTCDate() - diff);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCWeekYear(dirtyDate, dirtyOptions) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate, dirtyOptions);
      var year = date.getUTCFullYear();
      var options = dirtyOptions || {};
      var locale = options.locale;
      var localeFirstWeekContainsDate = locale && locale.options && locale.options.firstWeekContainsDate;
      var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger(localeFirstWeekContainsDate);
      var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger(options.firstWeekContainsDate); // Test if weekStartsOn is between 1 and 7 _and_ is not NaN

      if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
        throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
      }

      var firstWeekOfNextYear = new Date(0);
      firstWeekOfNextYear.setUTCFullYear(year + 1, 0, firstWeekContainsDate);
      firstWeekOfNextYear.setUTCHours(0, 0, 0, 0);
      var startOfNextYear = startOfUTCWeek(firstWeekOfNextYear, dirtyOptions);
      var firstWeekOfThisYear = new Date(0);
      firstWeekOfThisYear.setUTCFullYear(year, 0, firstWeekContainsDate);
      firstWeekOfThisYear.setUTCHours(0, 0, 0, 0);
      var startOfThisYear = startOfUTCWeek(firstWeekOfThisYear, dirtyOptions);

      if (date.getTime() >= startOfNextYear.getTime()) {
        return year + 1;
      } else if (date.getTime() >= startOfThisYear.getTime()) {
        return year;
      } else {
        return year - 1;
      }
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCWeekYear(dirtyDate, dirtyOptions) {
      requiredArgs(1, arguments);
      var options = dirtyOptions || {};
      var locale = options.locale;
      var localeFirstWeekContainsDate = locale && locale.options && locale.options.firstWeekContainsDate;
      var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger(localeFirstWeekContainsDate);
      var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger(options.firstWeekContainsDate);
      var year = getUTCWeekYear(dirtyDate, dirtyOptions);
      var firstWeek = new Date(0);
      firstWeek.setUTCFullYear(year, 0, firstWeekContainsDate);
      firstWeek.setUTCHours(0, 0, 0, 0);
      var date = startOfUTCWeek(firstWeek, dirtyOptions);
      return date;
    }

    var MILLISECONDS_IN_WEEK$1 = 604800000; // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCWeek(dirtyDate, options) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      var diff = startOfUTCWeek(date, options).getTime() - startOfUTCWeekYear(date, options).getTime(); // Round the number of days to the nearest integer
      // because the number of milliseconds in a week is not constant
      // (e.g. it's different in the week of the daylight saving time clock shift)

      return Math.round(diff / MILLISECONDS_IN_WEEK$1) + 1;
    }

    var dayPeriodEnum = {
      am: 'am',
      pm: 'pm',
      midnight: 'midnight',
      noon: 'noon',
      morning: 'morning',
      afternoon: 'afternoon',
      evening: 'evening',
      night: 'night'
      /*
       * |     | Unit                           |     | Unit                           |
       * |-----|--------------------------------|-----|--------------------------------|
       * |  a  | AM, PM                         |  A* | Milliseconds in day            |
       * |  b  | AM, PM, noon, midnight         |  B  | Flexible day period            |
       * |  c  | Stand-alone local day of week  |  C* | Localized hour w/ day period   |
       * |  d  | Day of month                   |  D  | Day of year                    |
       * |  e  | Local day of week              |  E  | Day of week                    |
       * |  f  |                                |  F* | Day of week in month           |
       * |  g* | Modified Julian day            |  G  | Era                            |
       * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
       * |  i! | ISO day of week                |  I! | ISO week of year               |
       * |  j* | Localized hour w/ day period   |  J* | Localized hour w/o day period  |
       * |  k  | Hour [1-24]                    |  K  | Hour [0-11]                    |
       * |  l* | (deprecated)                   |  L  | Stand-alone month              |
       * |  m  | Minute                         |  M  | Month                          |
       * |  n  |                                |  N  |                                |
       * |  o! | Ordinal number modifier        |  O  | Timezone (GMT)                 |
       * |  p! | Long localized time            |  P! | Long localized date            |
       * |  q  | Stand-alone quarter            |  Q  | Quarter                        |
       * |  r* | Related Gregorian year         |  R! | ISO week-numbering year        |
       * |  s  | Second                         |  S  | Fraction of second             |
       * |  t! | Seconds timestamp              |  T! | Milliseconds timestamp         |
       * |  u  | Extended year                  |  U* | Cyclic year                    |
       * |  v* | Timezone (generic non-locat.)  |  V* | Timezone (location)            |
       * |  w  | Local week of year             |  W* | Week of month                  |
       * |  x  | Timezone (ISO-8601 w/o Z)      |  X  | Timezone (ISO-8601)            |
       * |  y  | Year (abs)                     |  Y  | Local week-numbering year      |
       * |  z  | Timezone (specific non-locat.) |  Z* | Timezone (aliases)             |
       *
       * Letters marked by * are not implemented but reserved by Unicode standard.
       *
       * Letters marked by ! are non-standard, but implemented by date-fns:
       * - `o` modifies the previous token to turn it into an ordinal (see `format` docs)
       * - `i` is ISO day of week. For `i` and `ii` is returns numeric ISO week days,
       *   i.e. 7 for Sunday, 1 for Monday, etc.
       * - `I` is ISO week of year, as opposed to `w` which is local week of year.
       * - `R` is ISO week-numbering year, as opposed to `Y` which is local week-numbering year.
       *   `R` is supposed to be used in conjunction with `I` and `i`
       *   for universal ISO week-numbering date, whereas
       *   `Y` is supposed to be used in conjunction with `w` and `e`
       *   for week-numbering date specific to the locale.
       * - `P` is long localized date format
       * - `p` is long localized time format
       */

    };
    var formatters$1 = {
      // Era
      G: function (date, token, localize) {
        var era = date.getUTCFullYear() > 0 ? 1 : 0;

        switch (token) {
          // AD, BC
          case 'G':
          case 'GG':
          case 'GGG':
            return localize.era(era, {
              width: 'abbreviated'
            });
          // A, B

          case 'GGGGG':
            return localize.era(era, {
              width: 'narrow'
            });
          // Anno Domini, Before Christ

          case 'GGGG':
          default:
            return localize.era(era, {
              width: 'wide'
            });
        }
      },
      // Year
      y: function (date, token, localize) {
        // Ordinal number
        if (token === 'yo') {
          var signedYear = date.getUTCFullYear(); // Returns 1 for 1 BC (which is year 0 in JavaScript)

          var year = signedYear > 0 ? signedYear : 1 - signedYear;
          return localize.ordinalNumber(year, {
            unit: 'year'
          });
        }

        return formatters.y(date, token);
      },
      // Local week-numbering year
      Y: function (date, token, localize, options) {
        var signedWeekYear = getUTCWeekYear(date, options); // Returns 1 for 1 BC (which is year 0 in JavaScript)

        var weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear; // Two digit year

        if (token === 'YY') {
          var twoDigitYear = weekYear % 100;
          return addLeadingZeros(twoDigitYear, 2);
        } // Ordinal number


        if (token === 'Yo') {
          return localize.ordinalNumber(weekYear, {
            unit: 'year'
          });
        } // Padding


        return addLeadingZeros(weekYear, token.length);
      },
      // ISO week-numbering year
      R: function (date, token) {
        var isoWeekYear = getUTCISOWeekYear(date); // Padding

        return addLeadingZeros(isoWeekYear, token.length);
      },
      // Extended year. This is a single number designating the year of this calendar system.
      // The main difference between `y` and `u` localizers are B.C. years:
      // | Year | `y` | `u` |
      // |------|-----|-----|
      // | AC 1 |   1 |   1 |
      // | BC 1 |   1 |   0 |
      // | BC 2 |   2 |  -1 |
      // Also `yy` always returns the last two digits of a year,
      // while `uu` pads single digit years to 2 characters and returns other years unchanged.
      u: function (date, token) {
        var year = date.getUTCFullYear();
        return addLeadingZeros(year, token.length);
      },
      // Quarter
      Q: function (date, token, localize) {
        var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);

        switch (token) {
          // 1, 2, 3, 4
          case 'Q':
            return String(quarter);
          // 01, 02, 03, 04

          case 'QQ':
            return addLeadingZeros(quarter, 2);
          // 1st, 2nd, 3rd, 4th

          case 'Qo':
            return localize.ordinalNumber(quarter, {
              unit: 'quarter'
            });
          // Q1, Q2, Q3, Q4

          case 'QQQ':
            return localize.quarter(quarter, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // 1, 2, 3, 4 (narrow quarter; could be not numerical)

          case 'QQQQQ':
            return localize.quarter(quarter, {
              width: 'narrow',
              context: 'formatting'
            });
          // 1st quarter, 2nd quarter, ...

          case 'QQQQ':
          default:
            return localize.quarter(quarter, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Stand-alone quarter
      q: function (date, token, localize) {
        var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);

        switch (token) {
          // 1, 2, 3, 4
          case 'q':
            return String(quarter);
          // 01, 02, 03, 04

          case 'qq':
            return addLeadingZeros(quarter, 2);
          // 1st, 2nd, 3rd, 4th

          case 'qo':
            return localize.ordinalNumber(quarter, {
              unit: 'quarter'
            });
          // Q1, Q2, Q3, Q4

          case 'qqq':
            return localize.quarter(quarter, {
              width: 'abbreviated',
              context: 'standalone'
            });
          // 1, 2, 3, 4 (narrow quarter; could be not numerical)

          case 'qqqqq':
            return localize.quarter(quarter, {
              width: 'narrow',
              context: 'standalone'
            });
          // 1st quarter, 2nd quarter, ...

          case 'qqqq':
          default:
            return localize.quarter(quarter, {
              width: 'wide',
              context: 'standalone'
            });
        }
      },
      // Month
      M: function (date, token, localize) {
        var month = date.getUTCMonth();

        switch (token) {
          case 'M':
          case 'MM':
            return formatters.M(date, token);
          // 1st, 2nd, ..., 12th

          case 'Mo':
            return localize.ordinalNumber(month + 1, {
              unit: 'month'
            });
          // Jan, Feb, ..., Dec

          case 'MMM':
            return localize.month(month, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // J, F, ..., D

          case 'MMMMM':
            return localize.month(month, {
              width: 'narrow',
              context: 'formatting'
            });
          // January, February, ..., December

          case 'MMMM':
          default:
            return localize.month(month, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Stand-alone month
      L: function (date, token, localize) {
        var month = date.getUTCMonth();

        switch (token) {
          // 1, 2, ..., 12
          case 'L':
            return String(month + 1);
          // 01, 02, ..., 12

          case 'LL':
            return addLeadingZeros(month + 1, 2);
          // 1st, 2nd, ..., 12th

          case 'Lo':
            return localize.ordinalNumber(month + 1, {
              unit: 'month'
            });
          // Jan, Feb, ..., Dec

          case 'LLL':
            return localize.month(month, {
              width: 'abbreviated',
              context: 'standalone'
            });
          // J, F, ..., D

          case 'LLLLL':
            return localize.month(month, {
              width: 'narrow',
              context: 'standalone'
            });
          // January, February, ..., December

          case 'LLLL':
          default:
            return localize.month(month, {
              width: 'wide',
              context: 'standalone'
            });
        }
      },
      // Local week of year
      w: function (date, token, localize, options) {
        var week = getUTCWeek(date, options);

        if (token === 'wo') {
          return localize.ordinalNumber(week, {
            unit: 'week'
          });
        }

        return addLeadingZeros(week, token.length);
      },
      // ISO week of year
      I: function (date, token, localize) {
        var isoWeek = getUTCISOWeek(date);

        if (token === 'Io') {
          return localize.ordinalNumber(isoWeek, {
            unit: 'week'
          });
        }

        return addLeadingZeros(isoWeek, token.length);
      },
      // Day of the month
      d: function (date, token, localize) {
        if (token === 'do') {
          return localize.ordinalNumber(date.getUTCDate(), {
            unit: 'date'
          });
        }

        return formatters.d(date, token);
      },
      // Day of year
      D: function (date, token, localize) {
        var dayOfYear = getUTCDayOfYear(date);

        if (token === 'Do') {
          return localize.ordinalNumber(dayOfYear, {
            unit: 'dayOfYear'
          });
        }

        return addLeadingZeros(dayOfYear, token.length);
      },
      // Day of week
      E: function (date, token, localize) {
        var dayOfWeek = date.getUTCDay();

        switch (token) {
          // Tue
          case 'E':
          case 'EE':
          case 'EEE':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // T

          case 'EEEEE':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'formatting'
            });
          // Tu

          case 'EEEEEE':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'formatting'
            });
          // Tuesday

          case 'EEEE':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Local day of week
      e: function (date, token, localize, options) {
        var dayOfWeek = date.getUTCDay();
        var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;

        switch (token) {
          // Numerical value (Nth day of week with current locale or weekStartsOn)
          case 'e':
            return String(localDayOfWeek);
          // Padded numerical value

          case 'ee':
            return addLeadingZeros(localDayOfWeek, 2);
          // 1st, 2nd, ..., 7th

          case 'eo':
            return localize.ordinalNumber(localDayOfWeek, {
              unit: 'day'
            });

          case 'eee':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // T

          case 'eeeee':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'formatting'
            });
          // Tu

          case 'eeeeee':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'formatting'
            });
          // Tuesday

          case 'eeee':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Stand-alone local day of week
      c: function (date, token, localize, options) {
        var dayOfWeek = date.getUTCDay();
        var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;

        switch (token) {
          // Numerical value (same as in `e`)
          case 'c':
            return String(localDayOfWeek);
          // Padded numerical value

          case 'cc':
            return addLeadingZeros(localDayOfWeek, token.length);
          // 1st, 2nd, ..., 7th

          case 'co':
            return localize.ordinalNumber(localDayOfWeek, {
              unit: 'day'
            });

          case 'ccc':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'standalone'
            });
          // T

          case 'ccccc':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'standalone'
            });
          // Tu

          case 'cccccc':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'standalone'
            });
          // Tuesday

          case 'cccc':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'standalone'
            });
        }
      },
      // ISO day of week
      i: function (date, token, localize) {
        var dayOfWeek = date.getUTCDay();
        var isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

        switch (token) {
          // 2
          case 'i':
            return String(isoDayOfWeek);
          // 02

          case 'ii':
            return addLeadingZeros(isoDayOfWeek, token.length);
          // 2nd

          case 'io':
            return localize.ordinalNumber(isoDayOfWeek, {
              unit: 'day'
            });
          // Tue

          case 'iii':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // T

          case 'iiiii':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'formatting'
            });
          // Tu

          case 'iiiiii':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'formatting'
            });
          // Tuesday

          case 'iiii':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // AM or PM
      a: function (date, token, localize) {
        var hours = date.getUTCHours();
        var dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';

        switch (token) {
          case 'a':
          case 'aa':
          case 'aaa':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            });

          case 'aaaaa':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'narrow',
              context: 'formatting'
            });

          case 'aaaa':
          default:
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // AM, PM, midnight, noon
      b: function (date, token, localize) {
        var hours = date.getUTCHours();
        var dayPeriodEnumValue;

        if (hours === 12) {
          dayPeriodEnumValue = dayPeriodEnum.noon;
        } else if (hours === 0) {
          dayPeriodEnumValue = dayPeriodEnum.midnight;
        } else {
          dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';
        }

        switch (token) {
          case 'b':
          case 'bb':
          case 'bbb':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            });

          case 'bbbbb':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'narrow',
              context: 'formatting'
            });

          case 'bbbb':
          default:
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // in the morning, in the afternoon, in the evening, at night
      B: function (date, token, localize) {
        var hours = date.getUTCHours();
        var dayPeriodEnumValue;

        if (hours >= 17) {
          dayPeriodEnumValue = dayPeriodEnum.evening;
        } else if (hours >= 12) {
          dayPeriodEnumValue = dayPeriodEnum.afternoon;
        } else if (hours >= 4) {
          dayPeriodEnumValue = dayPeriodEnum.morning;
        } else {
          dayPeriodEnumValue = dayPeriodEnum.night;
        }

        switch (token) {
          case 'B':
          case 'BB':
          case 'BBB':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            });

          case 'BBBBB':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'narrow',
              context: 'formatting'
            });

          case 'BBBB':
          default:
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Hour [1-12]
      h: function (date, token, localize) {
        if (token === 'ho') {
          var hours = date.getUTCHours() % 12;
          if (hours === 0) hours = 12;
          return localize.ordinalNumber(hours, {
            unit: 'hour'
          });
        }

        return formatters.h(date, token);
      },
      // Hour [0-23]
      H: function (date, token, localize) {
        if (token === 'Ho') {
          return localize.ordinalNumber(date.getUTCHours(), {
            unit: 'hour'
          });
        }

        return formatters.H(date, token);
      },
      // Hour [0-11]
      K: function (date, token, localize) {
        var hours = date.getUTCHours() % 12;

        if (token === 'Ko') {
          return localize.ordinalNumber(hours, {
            unit: 'hour'
          });
        }

        return addLeadingZeros(hours, token.length);
      },
      // Hour [1-24]
      k: function (date, token, localize) {
        var hours = date.getUTCHours();
        if (hours === 0) hours = 24;

        if (token === 'ko') {
          return localize.ordinalNumber(hours, {
            unit: 'hour'
          });
        }

        return addLeadingZeros(hours, token.length);
      },
      // Minute
      m: function (date, token, localize) {
        if (token === 'mo') {
          return localize.ordinalNumber(date.getUTCMinutes(), {
            unit: 'minute'
          });
        }

        return formatters.m(date, token);
      },
      // Second
      s: function (date, token, localize) {
        if (token === 'so') {
          return localize.ordinalNumber(date.getUTCSeconds(), {
            unit: 'second'
          });
        }

        return formatters.s(date, token);
      },
      // Fraction of second
      S: function (date, token) {
        return formatters.S(date, token);
      },
      // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
      X: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        if (timezoneOffset === 0) {
          return 'Z';
        }

        switch (token) {
          // Hours and optional minutes
          case 'X':
            return formatTimezoneWithOptionalMinutes(timezoneOffset);
          // Hours, minutes and optional seconds without `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `XX`

          case 'XXXX':
          case 'XX':
            // Hours and minutes without `:` delimiter
            return formatTimezone(timezoneOffset);
          // Hours, minutes and optional seconds with `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `XXX`

          case 'XXXXX':
          case 'XXX': // Hours and minutes with `:` delimiter

          default:
            return formatTimezone(timezoneOffset, ':');
        }
      },
      // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
      x: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        switch (token) {
          // Hours and optional minutes
          case 'x':
            return formatTimezoneWithOptionalMinutes(timezoneOffset);
          // Hours, minutes and optional seconds without `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `xx`

          case 'xxxx':
          case 'xx':
            // Hours and minutes without `:` delimiter
            return formatTimezone(timezoneOffset);
          // Hours, minutes and optional seconds with `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `xxx`

          case 'xxxxx':
          case 'xxx': // Hours and minutes with `:` delimiter

          default:
            return formatTimezone(timezoneOffset, ':');
        }
      },
      // Timezone (GMT)
      O: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        switch (token) {
          // Short
          case 'O':
          case 'OO':
          case 'OOO':
            return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
          // Long

          case 'OOOO':
          default:
            return 'GMT' + formatTimezone(timezoneOffset, ':');
        }
      },
      // Timezone (specific non-location)
      z: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        switch (token) {
          // Short
          case 'z':
          case 'zz':
          case 'zzz':
            return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
          // Long

          case 'zzzz':
          default:
            return 'GMT' + formatTimezone(timezoneOffset, ':');
        }
      },
      // Seconds timestamp
      t: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timestamp = Math.floor(originalDate.getTime() / 1000);
        return addLeadingZeros(timestamp, token.length);
      },
      // Milliseconds timestamp
      T: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timestamp = originalDate.getTime();
        return addLeadingZeros(timestamp, token.length);
      }
    };

    function formatTimezoneShort(offset, dirtyDelimiter) {
      var sign = offset > 0 ? '-' : '+';
      var absOffset = Math.abs(offset);
      var hours = Math.floor(absOffset / 60);
      var minutes = absOffset % 60;

      if (minutes === 0) {
        return sign + String(hours);
      }

      var delimiter = dirtyDelimiter || '';
      return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
    }

    function formatTimezoneWithOptionalMinutes(offset, dirtyDelimiter) {
      if (offset % 60 === 0) {
        var sign = offset > 0 ? '-' : '+';
        return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
      }

      return formatTimezone(offset, dirtyDelimiter);
    }

    function formatTimezone(offset, dirtyDelimiter) {
      var delimiter = dirtyDelimiter || '';
      var sign = offset > 0 ? '-' : '+';
      var absOffset = Math.abs(offset);
      var hours = addLeadingZeros(Math.floor(absOffset / 60), 2);
      var minutes = addLeadingZeros(absOffset % 60, 2);
      return sign + hours + delimiter + minutes;
    }

    function dateLongFormatter(pattern, formatLong) {
      switch (pattern) {
        case 'P':
          return formatLong.date({
            width: 'short'
          });

        case 'PP':
          return formatLong.date({
            width: 'medium'
          });

        case 'PPP':
          return formatLong.date({
            width: 'long'
          });

        case 'PPPP':
        default:
          return formatLong.date({
            width: 'full'
          });
      }
    }

    function timeLongFormatter(pattern, formatLong) {
      switch (pattern) {
        case 'p':
          return formatLong.time({
            width: 'short'
          });

        case 'pp':
          return formatLong.time({
            width: 'medium'
          });

        case 'ppp':
          return formatLong.time({
            width: 'long'
          });

        case 'pppp':
        default:
          return formatLong.time({
            width: 'full'
          });
      }
    }

    function dateTimeLongFormatter(pattern, formatLong) {
      var matchResult = pattern.match(/(P+)(p+)?/);
      var datePattern = matchResult[1];
      var timePattern = matchResult[2];

      if (!timePattern) {
        return dateLongFormatter(pattern, formatLong);
      }

      var dateTimeFormat;

      switch (datePattern) {
        case 'P':
          dateTimeFormat = formatLong.dateTime({
            width: 'short'
          });
          break;

        case 'PP':
          dateTimeFormat = formatLong.dateTime({
            width: 'medium'
          });
          break;

        case 'PPP':
          dateTimeFormat = formatLong.dateTime({
            width: 'long'
          });
          break;

        case 'PPPP':
        default:
          dateTimeFormat = formatLong.dateTime({
            width: 'full'
          });
          break;
      }

      return dateTimeFormat.replace('{{date}}', dateLongFormatter(datePattern, formatLong)).replace('{{time}}', timeLongFormatter(timePattern, formatLong));
    }

    var longFormatters = {
      p: timeLongFormatter,
      P: dateTimeLongFormatter
    };

    var protectedDayOfYearTokens = ['D', 'DD'];
    var protectedWeekYearTokens = ['YY', 'YYYY'];
    function isProtectedDayOfYearToken(token) {
      return protectedDayOfYearTokens.indexOf(token) !== -1;
    }
    function isProtectedWeekYearToken(token) {
      return protectedWeekYearTokens.indexOf(token) !== -1;
    }
    function throwProtectedError(token, format, input) {
      if (token === 'YYYY') {
        throw new RangeError("Use `yyyy` instead of `YYYY` (in `".concat(format, "`) for formatting years to the input `").concat(input, "`; see: https://git.io/fxCyr"));
      } else if (token === 'YY') {
        throw new RangeError("Use `yy` instead of `YY` (in `".concat(format, "`) for formatting years to the input `").concat(input, "`; see: https://git.io/fxCyr"));
      } else if (token === 'D') {
        throw new RangeError("Use `d` instead of `D` (in `".concat(format, "`) for formatting days of the month to the input `").concat(input, "`; see: https://git.io/fxCyr"));
      } else if (token === 'DD') {
        throw new RangeError("Use `dd` instead of `DD` (in `".concat(format, "`) for formatting days of the month to the input `").concat(input, "`; see: https://git.io/fxCyr"));
      }
    }

    // - [yYQqMLwIdDecihHKkms]o matches any available ordinal number token
    //   (one of the certain letters followed by `o`)
    // - (\w)\1* matches any sequences of the same letter
    // - '' matches two quote characters in a row
    // - '(''|[^'])+('|$) matches anything surrounded by two quote characters ('),
    //   except a single quote symbol, which ends the sequence.
    //   Two quote characters do not end the sequence.
    //   If there is no matching single quote
    //   then the sequence will continue until the end of the string.
    // - . matches any single character unmatched by previous parts of the RegExps

    var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g; // This RegExp catches symbols escaped by quotes, and also
    // sequences of symbols P, p, and the combinations like `PPPPPPPppppp`

    var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
    var escapedStringRegExp = /^'([^]*?)'?$/;
    var doubleQuoteRegExp = /''/g;
    var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
    /**
     * @name format
     * @category Common Helpers
     * @summary Format the date.
     *
     * @description
     * Return the formatted date string in the given format. The result may vary by locale.
     *
     * > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
     * > See: https://git.io/fxCyr
     *
     * The characters wrapped between two single quotes characters (') are escaped.
     * Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
     * (see the last example)
     *
     * Format of the string is based on Unicode Technical Standard #35:
     * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
     * with a few additions (see note 7 below the table).
     *
     * Accepted patterns:
     * | Unit                            | Pattern | Result examples                   | Notes |
     * |---------------------------------|---------|-----------------------------------|-------|
     * | Era                             | G..GGG  | AD, BC                            |       |
     * |                                 | GGGG    | Anno Domini, Before Christ        | 2     |
     * |                                 | GGGGG   | A, B                              |       |
     * | Calendar year                   | y       | 44, 1, 1900, 2017                 | 5     |
     * |                                 | yo      | 44th, 1st, 0th, 17th              | 5,7   |
     * |                                 | yy      | 44, 01, 00, 17                    | 5     |
     * |                                 | yyy     | 044, 001, 1900, 2017              | 5     |
     * |                                 | yyyy    | 0044, 0001, 1900, 2017            | 5     |
     * |                                 | yyyyy   | ...                               | 3,5   |
     * | Local week-numbering year       | Y       | 44, 1, 1900, 2017                 | 5     |
     * |                                 | Yo      | 44th, 1st, 1900th, 2017th         | 5,7   |
     * |                                 | YY      | 44, 01, 00, 17                    | 5,8   |
     * |                                 | YYY     | 044, 001, 1900, 2017              | 5     |
     * |                                 | YYYY    | 0044, 0001, 1900, 2017            | 5,8   |
     * |                                 | YYYYY   | ...                               | 3,5   |
     * | ISO week-numbering year         | R       | -43, 0, 1, 1900, 2017             | 5,7   |
     * |                                 | RR      | -43, 00, 01, 1900, 2017           | 5,7   |
     * |                                 | RRR     | -043, 000, 001, 1900, 2017        | 5,7   |
     * |                                 | RRRR    | -0043, 0000, 0001, 1900, 2017     | 5,7   |
     * |                                 | RRRRR   | ...                               | 3,5,7 |
     * | Extended year                   | u       | -43, 0, 1, 1900, 2017             | 5     |
     * |                                 | uu      | -43, 01, 1900, 2017               | 5     |
     * |                                 | uuu     | -043, 001, 1900, 2017             | 5     |
     * |                                 | uuuu    | -0043, 0001, 1900, 2017           | 5     |
     * |                                 | uuuuu   | ...                               | 3,5   |
     * | Quarter (formatting)            | Q       | 1, 2, 3, 4                        |       |
     * |                                 | Qo      | 1st, 2nd, 3rd, 4th                | 7     |
     * |                                 | QQ      | 01, 02, 03, 04                    |       |
     * |                                 | QQQ     | Q1, Q2, Q3, Q4                    |       |
     * |                                 | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
     * |                                 | QQQQQ   | 1, 2, 3, 4                        | 4     |
     * | Quarter (stand-alone)           | q       | 1, 2, 3, 4                        |       |
     * |                                 | qo      | 1st, 2nd, 3rd, 4th                | 7     |
     * |                                 | qq      | 01, 02, 03, 04                    |       |
     * |                                 | qqq     | Q1, Q2, Q3, Q4                    |       |
     * |                                 | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
     * |                                 | qqqqq   | 1, 2, 3, 4                        | 4     |
     * | Month (formatting)              | M       | 1, 2, ..., 12                     |       |
     * |                                 | Mo      | 1st, 2nd, ..., 12th               | 7     |
     * |                                 | MM      | 01, 02, ..., 12                   |       |
     * |                                 | MMM     | Jan, Feb, ..., Dec                |       |
     * |                                 | MMMM    | January, February, ..., December  | 2     |
     * |                                 | MMMMM   | J, F, ..., D                      |       |
     * | Month (stand-alone)             | L       | 1, 2, ..., 12                     |       |
     * |                                 | Lo      | 1st, 2nd, ..., 12th               | 7     |
     * |                                 | LL      | 01, 02, ..., 12                   |       |
     * |                                 | LLL     | Jan, Feb, ..., Dec                |       |
     * |                                 | LLLL    | January, February, ..., December  | 2     |
     * |                                 | LLLLL   | J, F, ..., D                      |       |
     * | Local week of year              | w       | 1, 2, ..., 53                     |       |
     * |                                 | wo      | 1st, 2nd, ..., 53th               | 7     |
     * |                                 | ww      | 01, 02, ..., 53                   |       |
     * | ISO week of year                | I       | 1, 2, ..., 53                     | 7     |
     * |                                 | Io      | 1st, 2nd, ..., 53th               | 7     |
     * |                                 | II      | 01, 02, ..., 53                   | 7     |
     * | Day of month                    | d       | 1, 2, ..., 31                     |       |
     * |                                 | do      | 1st, 2nd, ..., 31st               | 7     |
     * |                                 | dd      | 01, 02, ..., 31                   |       |
     * | Day of year                     | D       | 1, 2, ..., 365, 366               | 9     |
     * |                                 | Do      | 1st, 2nd, ..., 365th, 366th       | 7     |
     * |                                 | DD      | 01, 02, ..., 365, 366             | 9     |
     * |                                 | DDD     | 001, 002, ..., 365, 366           |       |
     * |                                 | DDDD    | ...                               | 3     |
     * | Day of week (formatting)        | E..EEE  | Mon, Tue, Wed, ..., Sun           |       |
     * |                                 | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
     * |                                 | EEEEE   | M, T, W, T, F, S, S               |       |
     * |                                 | EEEEEE  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
     * | ISO day of week (formatting)    | i       | 1, 2, 3, ..., 7                   | 7     |
     * |                                 | io      | 1st, 2nd, ..., 7th                | 7     |
     * |                                 | ii      | 01, 02, ..., 07                   | 7     |
     * |                                 | iii     | Mon, Tue, Wed, ..., Sun           | 7     |
     * |                                 | iiii    | Monday, Tuesday, ..., Sunday      | 2,7   |
     * |                                 | iiiii   | M, T, W, T, F, S, S               | 7     |
     * |                                 | iiiiii  | Mo, Tu, We, Th, Fr, Su, Sa        | 7     |
     * | Local day of week (formatting)  | e       | 2, 3, 4, ..., 1                   |       |
     * |                                 | eo      | 2nd, 3rd, ..., 1st                | 7     |
     * |                                 | ee      | 02, 03, ..., 01                   |       |
     * |                                 | eee     | Mon, Tue, Wed, ..., Sun           |       |
     * |                                 | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
     * |                                 | eeeee   | M, T, W, T, F, S, S               |       |
     * |                                 | eeeeee  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
     * | Local day of week (stand-alone) | c       | 2, 3, 4, ..., 1                   |       |
     * |                                 | co      | 2nd, 3rd, ..., 1st                | 7     |
     * |                                 | cc      | 02, 03, ..., 01                   |       |
     * |                                 | ccc     | Mon, Tue, Wed, ..., Sun           |       |
     * |                                 | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
     * |                                 | ccccc   | M, T, W, T, F, S, S               |       |
     * |                                 | cccccc  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
     * | AM, PM                          | a..aaa  | AM, PM                            |       |
     * |                                 | aaaa    | a.m., p.m.                        | 2     |
     * |                                 | aaaaa   | a, p                              |       |
     * | AM, PM, noon, midnight          | b..bbb  | AM, PM, noon, midnight            |       |
     * |                                 | bbbb    | a.m., p.m., noon, midnight        | 2     |
     * |                                 | bbbbb   | a, p, n, mi                       |       |
     * | Flexible day period             | B..BBB  | at night, in the morning, ...     |       |
     * |                                 | BBBB    | at night, in the morning, ...     | 2     |
     * |                                 | BBBBB   | at night, in the morning, ...     |       |
     * | Hour [1-12]                     | h       | 1, 2, ..., 11, 12                 |       |
     * |                                 | ho      | 1st, 2nd, ..., 11th, 12th         | 7     |
     * |                                 | hh      | 01, 02, ..., 11, 12               |       |
     * | Hour [0-23]                     | H       | 0, 1, 2, ..., 23                  |       |
     * |                                 | Ho      | 0th, 1st, 2nd, ..., 23rd          | 7     |
     * |                                 | HH      | 00, 01, 02, ..., 23               |       |
     * | Hour [0-11]                     | K       | 1, 2, ..., 11, 0                  |       |
     * |                                 | Ko      | 1st, 2nd, ..., 11th, 0th          | 7     |
     * |                                 | KK      | 01, 02, ..., 11, 00               |       |
     * | Hour [1-24]                     | k       | 24, 1, 2, ..., 23                 |       |
     * |                                 | ko      | 24th, 1st, 2nd, ..., 23rd         | 7     |
     * |                                 | kk      | 24, 01, 02, ..., 23               |       |
     * | Minute                          | m       | 0, 1, ..., 59                     |       |
     * |                                 | mo      | 0th, 1st, ..., 59th               | 7     |
     * |                                 | mm      | 00, 01, ..., 59                   |       |
     * | Second                          | s       | 0, 1, ..., 59                     |       |
     * |                                 | so      | 0th, 1st, ..., 59th               | 7     |
     * |                                 | ss      | 00, 01, ..., 59                   |       |
     * | Fraction of second              | S       | 0, 1, ..., 9                      |       |
     * |                                 | SS      | 00, 01, ..., 99                   |       |
     * |                                 | SSS     | 000, 0001, ..., 999               |       |
     * |                                 | SSSS    | ...                               | 3     |
     * | Timezone (ISO-8601 w/ Z)        | X       | -08, +0530, Z                     |       |
     * |                                 | XX      | -0800, +0530, Z                   |       |
     * |                                 | XXX     | -08:00, +05:30, Z                 |       |
     * |                                 | XXXX    | -0800, +0530, Z, +123456          | 2     |
     * |                                 | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
     * | Timezone (ISO-8601 w/o Z)       | x       | -08, +0530, +00                   |       |
     * |                                 | xx      | -0800, +0530, +0000               |       |
     * |                                 | xxx     | -08:00, +05:30, +00:00            | 2     |
     * |                                 | xxxx    | -0800, +0530, +0000, +123456      |       |
     * |                                 | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
     * | Timezone (GMT)                  | O...OOO | GMT-8, GMT+5:30, GMT+0            |       |
     * |                                 | OOOO    | GMT-08:00, GMT+05:30, GMT+00:00   | 2     |
     * | Timezone (specific non-locat.)  | z...zzz | GMT-8, GMT+5:30, GMT+0            | 6     |
     * |                                 | zzzz    | GMT-08:00, GMT+05:30, GMT+00:00   | 2,6   |
     * | Seconds timestamp               | t       | 512969520                         | 7     |
     * |                                 | tt      | ...                               | 3,7   |
     * | Milliseconds timestamp          | T       | 512969520900                      | 7     |
     * |                                 | TT      | ...                               | 3,7   |
     * | Long localized date             | P       | 05/29/1453                        | 7     |
     * |                                 | PP      | May 29, 1453                      | 7     |
     * |                                 | PPP     | May 29th, 1453                    | 7     |
     * |                                 | PPPP    | Sunday, May 29th, 1453            | 2,7   |
     * | Long localized time             | p       | 12:00 AM                          | 7     |
     * |                                 | pp      | 12:00:00 AM                       | 7     |
     * |                                 | ppp     | 12:00:00 AM GMT+2                 | 7     |
     * |                                 | pppp    | 12:00:00 AM GMT+02:00             | 2,7   |
     * | Combination of date and time    | Pp      | 05/29/1453, 12:00 AM              | 7     |
     * |                                 | PPpp    | May 29, 1453, 12:00:00 AM         | 7     |
     * |                                 | PPPppp  | May 29th, 1453 at ...             | 7     |
     * |                                 | PPPPpppp| Sunday, May 29th, 1453 at ...     | 2,7   |
     * Notes:
     * 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
     *    are the same as "stand-alone" units, but are different in some languages.
     *    "Formatting" units are declined according to the rules of the language
     *    in the context of a date. "Stand-alone" units are always nominative singular:
     *
     *    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
     *
     *    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
     *
     * 2. Any sequence of the identical letters is a pattern, unless it is escaped by
     *    the single quote characters (see below).
     *    If the sequence is longer than listed in table (e.g. `EEEEEEEEEEE`)
     *    the output will be the same as default pattern for this unit, usually
     *    the longest one (in case of ISO weekdays, `EEEE`). Default patterns for units
     *    are marked with "2" in the last column of the table.
     *
     *    `format(new Date(2017, 10, 6), 'MMM') //=> 'Nov'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMM') //=> 'November'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMMM') //=> 'N'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMMMM') //=> 'November'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMMMMM') //=> 'November'`
     *
     * 3. Some patterns could be unlimited length (such as `yyyyyyyy`).
     *    The output will be padded with zeros to match the length of the pattern.
     *
     *    `format(new Date(2017, 10, 6), 'yyyyyyyy') //=> '00002017'`
     *
     * 4. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
     *    These tokens represent the shortest form of the quarter.
     *
     * 5. The main difference between `y` and `u` patterns are B.C. years:
     *
     *    | Year | `y` | `u` |
     *    |------|-----|-----|
     *    | AC 1 |   1 |   1 |
     *    | BC 1 |   1 |   0 |
     *    | BC 2 |   2 |  -1 |
     *
     *    Also `yy` always returns the last two digits of a year,
     *    while `uu` pads single digit years to 2 characters and returns other years unchanged:
     *
     *    | Year | `yy` | `uu` |
     *    |------|------|------|
     *    | 1    |   01 |   01 |
     *    | 14   |   14 |   14 |
     *    | 376  |   76 |  376 |
     *    | 1453 |   53 | 1453 |
     *
     *    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
     *    except local week-numbering years are dependent on `options.weekStartsOn`
     *    and `options.firstWeekContainsDate` (compare [getISOWeekYear]{@link https://date-fns.org/docs/getISOWeekYear}
     *    and [getWeekYear]{@link https://date-fns.org/docs/getWeekYear}).
     *
     * 6. Specific non-location timezones are currently unavailable in `date-fns`,
     *    so right now these tokens fall back to GMT timezones.
     *
     * 7. These patterns are not in the Unicode Technical Standard #35:
     *    - `i`: ISO day of week
     *    - `I`: ISO week of year
     *    - `R`: ISO week-numbering year
     *    - `t`: seconds timestamp
     *    - `T`: milliseconds timestamp
     *    - `o`: ordinal number modifier
     *    - `P`: long localized date
     *    - `p`: long localized time
     *
     * 8. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
     *    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://git.io/fxCyr
     *
     * 9. `D` and `DD` tokens represent days of the year but they are ofthen confused with days of the month.
     *    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://git.io/fxCyr
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * - The second argument is now required for the sake of explicitness.
     *
     *   ```javascript
     *   // Before v2.0.0
     *   format(new Date(2016, 0, 1))
     *
     *   // v2.0.0 onward
     *   format(new Date(2016, 0, 1), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
     *   ```
     *
     * - New format string API for `format` function
     *   which is based on [Unicode Technical Standard #35](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table).
     *   See [this post](https://blog.date-fns.org/post/unicode-tokens-in-date-fns-v2-sreatyki91jg) for more details.
     *
     * - Characters are now escaped using single quote symbols (`'`) instead of square brackets.
     *
     * @param {Date|Number} date - the original date
     * @param {String} format - the string of tokens
     * @param {Object} [options] - an object with options.
     * @param {Locale} [options.locale=defaultLocale] - the locale object. See [Locale]{@link https://date-fns.org/docs/Locale}
     * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
     * @param {Number} [options.firstWeekContainsDate=1] - the day of January, which is
     * @param {Boolean} [options.useAdditionalWeekYearTokens=false] - if true, allows usage of the week-numbering year tokens `YY` and `YYYY`;
     *   see: https://git.io/fxCyr
     * @param {Boolean} [options.useAdditionalDayOfYearTokens=false] - if true, allows usage of the day of year tokens `D` and `DD`;
     *   see: https://git.io/fxCyr
     * @returns {String} the formatted date string
     * @throws {TypeError} 2 arguments required
     * @throws {RangeError} `date` must not be Invalid Date
     * @throws {RangeError} `options.locale` must contain `localize` property
     * @throws {RangeError} `options.locale` must contain `formatLong` property
     * @throws {RangeError} `options.weekStartsOn` must be between 0 and 6
     * @throws {RangeError} `options.firstWeekContainsDate` must be between 1 and 7
     * @throws {RangeError} use `yyyy` instead of `YYYY` for formatting years using [format provided] to the input [input provided]; see: https://git.io/fxCyr
     * @throws {RangeError} use `yy` instead of `YY` for formatting years using [format provided] to the input [input provided]; see: https://git.io/fxCyr
     * @throws {RangeError} use `d` instead of `D` for formatting days of the month using [format provided] to the input [input provided]; see: https://git.io/fxCyr
     * @throws {RangeError} use `dd` instead of `DD` for formatting days of the month using [format provided] to the input [input provided]; see: https://git.io/fxCyr
     * @throws {RangeError} format string contains an unescaped latin alphabet character
     *
     * @example
     * // Represent 11 February 2014 in middle-endian format:
     * var result = format(new Date(2014, 1, 11), 'MM/dd/yyyy')
     * //=> '02/11/2014'
     *
     * @example
     * // Represent 2 July 2014 in Esperanto:
     * import { eoLocale } from 'date-fns/locale/eo'
     * var result = format(new Date(2014, 6, 2), "do 'de' MMMM yyyy", {
     *   locale: eoLocale
     * })
     * //=> '2-a de julio 2014'
     *
     * @example
     * // Escape string by single quote characters:
     * var result = format(new Date(2014, 6, 2, 15), "h 'o''clock'")
     * //=> "3 o'clock"
     */

    function format(dirtyDate, dirtyFormatStr, dirtyOptions) {
      requiredArgs(2, arguments);
      var formatStr = String(dirtyFormatStr);
      var options = dirtyOptions || {};
      var locale$1 = options.locale || locale;
      var localeFirstWeekContainsDate = locale$1.options && locale$1.options.firstWeekContainsDate;
      var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger(localeFirstWeekContainsDate);
      var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger(options.firstWeekContainsDate); // Test if weekStartsOn is between 1 and 7 _and_ is not NaN

      if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
        throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
      }

      var localeWeekStartsOn = locale$1.options && locale$1.options.weekStartsOn;
      var defaultWeekStartsOn = localeWeekStartsOn == null ? 0 : toInteger(localeWeekStartsOn);
      var weekStartsOn = options.weekStartsOn == null ? defaultWeekStartsOn : toInteger(options.weekStartsOn); // Test if weekStartsOn is between 0 and 6 _and_ is not NaN

      if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
        throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
      }

      if (!locale$1.localize) {
        throw new RangeError('locale must contain localize property');
      }

      if (!locale$1.formatLong) {
        throw new RangeError('locale must contain formatLong property');
      }

      var originalDate = toDate(dirtyDate);

      if (!isValid(originalDate)) {
        throw new RangeError('Invalid time value');
      } // Convert the date in system timezone to the same date in UTC+00:00 timezone.
      // This ensures that when UTC functions will be implemented, locales will be compatible with them.
      // See an issue about UTC functions: https://github.com/date-fns/date-fns/issues/376


      var timezoneOffset = getTimezoneOffsetInMilliseconds(originalDate);
      var utcDate = subMilliseconds(originalDate, timezoneOffset);
      var formatterOptions = {
        firstWeekContainsDate: firstWeekContainsDate,
        weekStartsOn: weekStartsOn,
        locale: locale$1,
        _originalDate: originalDate
      };
      var result = formatStr.match(longFormattingTokensRegExp).map(function (substring) {
        var firstCharacter = substring[0];

        if (firstCharacter === 'p' || firstCharacter === 'P') {
          var longFormatter = longFormatters[firstCharacter];
          return longFormatter(substring, locale$1.formatLong, formatterOptions);
        }

        return substring;
      }).join('').match(formattingTokensRegExp).map(function (substring) {
        // Replace two single quote characters with one single quote character
        if (substring === "''") {
          return "'";
        }

        var firstCharacter = substring[0];

        if (firstCharacter === "'") {
          return cleanEscapedString(substring);
        }

        var formatter = formatters$1[firstCharacter];

        if (formatter) {
          if (!options.useAdditionalWeekYearTokens && isProtectedWeekYearToken(substring)) {
            throwProtectedError(substring, dirtyFormatStr, dirtyDate);
          }

          if (!options.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(substring)) {
            throwProtectedError(substring, dirtyFormatStr, dirtyDate);
          }

          return formatter(utcDate, substring, locale$1.localize, formatterOptions);
        }

        if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
          throw new RangeError('Format string contains an unescaped latin alphabet character `' + firstCharacter + '`');
        }

        return substring;
      }).join('');
      return result;
    }

    function cleanEscapedString(input) {
      return input.match(escapedStringRegExp)[1].replace(doubleQuoteRegExp, "'");
    }

    class ApiService {
        // async createCashier(wallet: Wallet, req: CashierRequest): Promise<CashierResponse> {
        //     console.log('createCashier:Start');
        //     console.log(`REQUEST: ${JSON.stringify(req)}`);
        //     const response: any = await fetch(`https://dev.aws.kronoverse.io/cashier/${domain}/${id}`, {
        //         method: 'POST',
        //         //headers: { api_key: API_KEY, 'Content-Type': 'application/json' },
        //         body: JSON.stringify(req)
        //     });
        //     console.log('createCashier:Response');
        //     console.log(`RESPONSE: ${JSON.stringify(response)}`);
        //     return <CashierResponse>response;
        // }
        // Collect IP address from service
        static async getIp() {
            const ip = await fetch('https://api.ipify.org/?format=json');
            return ip;
        }
        // Collect geo location from browser
        static async getGps() {
            var _a, _b, _c, _d, _e;
            const geoInfo = await this.getGeoInfo();
            const geoloc = {
                latitude: (_a = geoInfo.coords.latitude) !== null && _a !== void 0 ? _a : 0.0,
                longitude: (_b = geoInfo.coords.longitude) !== null && _b !== void 0 ? _b : 0.0,
                radius: (_c = geoInfo.coords.accuracy) !== null && _c !== void 0 ? _c : 0.0,
                altitude: (_d = geoInfo.coords.altitude) !== null && _d !== void 0 ? _d : 0.0,
                speed: (_e = geoInfo.coords.speed) !== null && _e !== void 0 ? _e : 0.0,
                dateTime: format(geoInfo.timestamp, 'MM-dd-yyyy ppp')
            };
            return geoloc;
        }
        static async getGeoInfo() {
            const p = new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition((data) => {
                    console.log('GPS:', data);
                    resolve(data);
                }, reject, {
                    maximumAge: 20 * 60 * 10000,
                    timeout: 20000,
                    enableHighAccuracy: true
                });
            });
            return p;
        }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function flip(node, animation, params) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const scaleX = animation.from.width / node.clientWidth;
        const scaleY = animation.from.height / node.clientHeight;
        const dx = (animation.from.left - animation.to.left) / scaleX;
        const dy = (animation.from.top - animation.to.top) / scaleY;
        const d = Math.sqrt(dx * dx + dy * dy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(d) : duration,
            easing,
            css: (_t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
        };
    }

    /* src/components/Alert.svelte generated by Svelte v3.29.4 */
    const file = "src/components/Alert.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (98:0) {#if alerts.length > 0}
    function create_if_block(ctx) {
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*alerts*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*alert*/ ctx[6];
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "alerts svelte-kqvbke");
    			add_location(ul, file, 98, 4, 2352);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*alerts, close*/ 3) {
    				const each_value = /*alerts*/ ctx[0];
    				validate_each_argument(each_value);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, fix_and_destroy_block, create_each_block, null, get_each_context);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(98:0) {#if alerts.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (100:8) {#each alerts as alert, index (alert)}
    function create_each_block(key_1, ctx) {
    	let li;
    	let span0;
    	let t0_value = (/*alert*/ ctx[6].type == "ok" ? "OK" : "Warning") + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2_value = /*alert*/ ctx[6].body + "";
    	let t2;
    	let t3;
    	let button;
    	let t5;
    	let li_class_value;
    	let rect;
    	let stop_animation = noop;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[4](/*alert*/ ctx[6], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			button = element("button");
    			button.textContent = "×";
    			t5 = space();
    			attr_dev(span0, "class", "alert-title svelte-kqvbke");
    			add_location(span0, file, 101, 16, 2494);
    			attr_dev(span1, "class", "alert-body svelte-kqvbke");
    			add_location(span1, file, 102, 16, 2577);
    			attr_dev(button, "class", "svelte-kqvbke");
    			add_location(button, file, 103, 16, 2638);
    			attr_dev(li, "class", li_class_value = "" + (null_to_empty(/*alert*/ ctx[6].type) + " svelte-kqvbke"));
    			add_location(li, file, 100, 12, 2431);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, span0);
    			append_dev(span0, t0);
    			append_dev(li, t1);
    			append_dev(li, span1);
    			append_dev(span1, t2);
    			append_dev(li, t3);
    			append_dev(li, button);
    			append_dev(li, t5);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*alerts*/ 1 && t0_value !== (t0_value = (/*alert*/ ctx[6].type == "ok" ? "OK" : "Warning") + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*alerts*/ 1 && t2_value !== (t2_value = /*alert*/ ctx[6].body + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*alerts*/ 1 && li_class_value !== (li_class_value = "" + (null_to_empty(/*alert*/ ctx[6].type) + " svelte-kqvbke"))) {
    				attr_dev(li, "class", li_class_value);
    			}
    		},
    		r: function measure() {
    			rect = li.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(li);
    			stop_animation();
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(li, rect, flip, /*options*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(100:8) {#each alerts as alert, index (alert)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let if_block_anchor;
    	let if_block = /*alerts*/ ctx[0].length > 0 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*alerts*/ ctx[0].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Alert", slots, []);
    	
    	let alerts = [];

    	const show = alert => {
    		var _a, _b, _c;

    		alert.dismissable = (_a = alert.dismissable) !== null && _a !== void 0
    		? _a
    		: true;

    		alert.type = (_b = alert.type) !== null && _b !== void 0
    		? _b
    		: "warn";

    		alert.duration = (_c = alert.duration) !== null && _c !== void 0
    		? _c
    		: 5000;

    		$$invalidate(0, alerts = [alert, ...alerts]);

    		if (alert.duration > 0) {
    			setTimeout(
    				() => {
    					close(alert);
    				},
    				alert.duration
    			);
    		}
    	};

    	const close = alert => {
    		const index = alerts.indexOf(alert);
    		$$invalidate(0, alerts = [...alerts.slice(0, index), ...alerts.slice(index + 1, alerts.length)]);
    	};

    	const options = {};
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Alert> was created with unknown prop '${key}'`);
    	});

    	const click_handler = alert => close(alert);

    	$$self.$capture_state = () => ({
    		flip,
    		alerts,
    		show,
    		close,
    		options,
    		count
    	});

    	$$self.$inject_state = $$props => {
    		if ("alerts" in $$props) $$invalidate(0, alerts = $$props.alerts);
    		if ("count" in $$props) count = $$props.count;
    	};

    	let count;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*alerts*/ 1) {
    			 count = alerts.length;
    		}
    	};

    	return [alerts, close, options, show, click_handler];
    }

    class Alert extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { show: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Alert",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get show() {
    		return this.$$.ctx[3];
    	}

    	set show(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Spinner.svelte generated by Svelte v3.29.4 */
    const file$1 = "src/components/Spinner.svelte";

    function create_fragment$1(ctx) {
    	let div13;
    	let div12;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let t2;
    	let div3;
    	let t3;
    	let div4;
    	let t4;
    	let div5;
    	let t5;
    	let div6;
    	let t6;
    	let div7;
    	let t7;
    	let div8;
    	let t8;
    	let div9;
    	let t9;
    	let div10;
    	let t10;
    	let div11;

    	const block = {
    		c: function create() {
    			div13 = element("div");
    			div12 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			t2 = space();
    			div3 = element("div");
    			t3 = space();
    			div4 = element("div");
    			t4 = space();
    			div5 = element("div");
    			t5 = space();
    			div6 = element("div");
    			t6 = space();
    			div7 = element("div");
    			t7 = space();
    			div8 = element("div");
    			t8 = space();
    			div9 = element("div");
    			t9 = space();
    			div10 = element("div");
    			t10 = space();
    			div11 = element("div");
    			attr_dev(div0, "class", "svelte-1oura5");
    			add_location(div0, file$1, 116, 4, 2614);
    			attr_dev(div1, "class", "svelte-1oura5");
    			add_location(div1, file$1, 117, 4, 2626);
    			attr_dev(div2, "class", "svelte-1oura5");
    			add_location(div2, file$1, 118, 4, 2638);
    			attr_dev(div3, "class", "svelte-1oura5");
    			add_location(div3, file$1, 119, 4, 2650);
    			attr_dev(div4, "class", "svelte-1oura5");
    			add_location(div4, file$1, 120, 4, 2662);
    			attr_dev(div5, "class", "svelte-1oura5");
    			add_location(div5, file$1, 121, 4, 2674);
    			attr_dev(div6, "class", "svelte-1oura5");
    			add_location(div6, file$1, 122, 4, 2686);
    			attr_dev(div7, "class", "svelte-1oura5");
    			add_location(div7, file$1, 123, 4, 2698);
    			attr_dev(div8, "class", "svelte-1oura5");
    			add_location(div8, file$1, 124, 4, 2710);
    			attr_dev(div9, "class", "svelte-1oura5");
    			add_location(div9, file$1, 125, 4, 2722);
    			attr_dev(div10, "class", "svelte-1oura5");
    			add_location(div10, file$1, 126, 4, 2734);
    			attr_dev(div11, "class", "svelte-1oura5");
    			add_location(div11, file$1, 127, 4, 2746);
    			attr_dev(div12, "class", "kv-spinner svelte-1oura5");
    			add_location(div12, file$1, 115, 2, 2585);
    			set_style(div13, "display", /*visible*/ ctx[0]);
    			attr_dev(div13, "class", "spinnerRoot svelte-1oura5");
    			add_location(div13, file$1, 114, 0, 2531);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div13, anchor);
    			append_dev(div13, div12);
    			append_dev(div12, div0);
    			append_dev(div12, t0);
    			append_dev(div12, div1);
    			append_dev(div12, t1);
    			append_dev(div12, div2);
    			append_dev(div12, t2);
    			append_dev(div12, div3);
    			append_dev(div12, t3);
    			append_dev(div12, div4);
    			append_dev(div12, t4);
    			append_dev(div12, div5);
    			append_dev(div12, t5);
    			append_dev(div12, div6);
    			append_dev(div12, t6);
    			append_dev(div12, div7);
    			append_dev(div12, t7);
    			append_dev(div12, div8);
    			append_dev(div12, t8);
    			append_dev(div12, div9);
    			append_dev(div12, t9);
    			append_dev(div12, div10);
    			append_dev(div12, t10);
    			append_dev(div12, div11);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*visible*/ 1) {
    				set_style(div13, "display", /*visible*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div13);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Spinner", slots, []);
    	let visible = "none";

    	const isVisible = () => {
    		return visible === "block";
    	};

    	const show = () => {
    		$$invalidate(0, visible = "block");
    	};

    	const hide = () => {
    		$$invalidate(0, visible = "none");
    	};

    	loading.subscribe(val => {
    		if (val) {
    			show();
    		} else {
    			hide();
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Spinner> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ loading, visible, isVisible, show, hide });

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [visible, isVisible, show, hide];
    }

    class Spinner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { isVisible: 1, show: 2, hide: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spinner",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get isVisible() {
    		return this.$$.ctx[1];
    	}

    	set isVisible(value) {
    		throw new Error("<Spinner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get show() {
    		return this.$$.ctx[2];
    	}

    	set show(value) {
    		throw new Error("<Spinner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hide() {
    		return this.$$.ctx[3];
    	}

    	set hide(value) {
    		throw new Error("<Spinner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Login.svelte generated by Svelte v3.29.4 */

    const { console: console_1 } = globals;
    const file$2 = "src/components/Login.svelte";

    // (83:0) {:else}
    function create_else_block(ctx) {
    	let h20;
    	let t0;
    	let h20_hidden_value;
    	let t1;
    	let h21;
    	let t2;
    	let t3;
    	let t4;
    	let section0;
    	let form0;
    	let div0;
    	let label0;
    	let span0;
    	let t6;
    	let span1;
    	let t8;
    	let input0;
    	let t9;
    	let div1;
    	let label1;
    	let span2;
    	let t11;
    	let span3;
    	let t13;
    	let input1;
    	let t14;
    	let div2;
    	let label2;
    	let span4;
    	let t16;
    	let span5;
    	let t17;
    	let br0;
    	let t18;
    	let t19;
    	let input2;
    	let input2_minlength_value;
    	let t20;
    	let div3;
    	let button0;
    	let t22;
    	let p0;
    	let a0;
    	let section0_hidden_value;
    	let t24;
    	let section1;
    	let form1;
    	let div4;
    	let label3;
    	let span6;
    	let t26;
    	let span7;
    	let t28;
    	let input3;
    	let t29;
    	let div5;
    	let label4;
    	let span8;
    	let t31;
    	let span9;
    	let t32;
    	let br1;
    	let t33;
    	let t34;
    	let input4;
    	let input4_minlength_value;
    	let t35;
    	let div6;
    	let button1;
    	let t37;
    	let p1;
    	let a1;
    	let mounted;
    	let dispose;
    	let if_block = /*errorText*/ ctx[4] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			h20 = element("h2");
    			t0 = text("Register");
    			t1 = space();
    			h21 = element("h2");
    			t2 = text("Login");
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			section0 = element("section");
    			form0 = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			span0 = element("span");
    			span0.textContent = "Email";
    			t6 = space();
    			span1 = element("span");
    			span1.textContent = "Must contain unique email address.";
    			t8 = space();
    			input0 = element("input");
    			t9 = space();
    			div1 = element("div");
    			label1 = element("label");
    			span2 = element("span");
    			span2.textContent = "Gamer Handle";
    			t11 = space();
    			span3 = element("span");
    			span3.textContent = "Must contain 4+ characters.";
    			t13 = space();
    			input1 = element("input");
    			t14 = space();
    			div2 = element("div");
    			label2 = element("label");
    			span4 = element("span");
    			span4.textContent = "Password";
    			t16 = space();
    			span5 = element("span");
    			t17 = text("Must contain 8+ characters with at least\n            ");
    			br0 = element("br");
    			t18 = text("1 number and 1 uppercase letter.");
    			t19 = space();
    			input2 = element("input");
    			t20 = space();
    			div3 = element("div");
    			button0 = element("button");
    			button0.textContent = "Register";
    			t22 = space();
    			p0 = element("p");
    			a0 = element("a");
    			a0.textContent = "Login";
    			t24 = space();
    			section1 = element("section");
    			form1 = element("form");
    			div4 = element("div");
    			label3 = element("label");
    			span6 = element("span");
    			span6.textContent = "Gamer Handle";
    			t26 = space();
    			span7 = element("span");
    			span7.textContent = "Must contain 4+ characters.";
    			t28 = space();
    			input3 = element("input");
    			t29 = space();
    			div5 = element("div");
    			label4 = element("label");
    			span8 = element("span");
    			span8.textContent = "Password";
    			t31 = space();
    			span9 = element("span");
    			t32 = text("Must contain 8+ characters with at least\n            ");
    			br1 = element("br");
    			t33 = text("1 number and 1 uppercase letter.");
    			t34 = space();
    			input4 = element("input");
    			t35 = space();
    			div6 = element("div");
    			button1 = element("button");
    			button1.textContent = "Login";
    			t37 = space();
    			p1 = element("p");
    			a1 = element("a");
    			a1.textContent = "Register";
    			h20.hidden = h20_hidden_value = !/*showReg*/ ctx[0];
    			attr_dev(h20, "class", "large-caption");
    			add_location(h20, file$2, 83, 0, 2594);
    			h21.hidden = /*showReg*/ ctx[0];
    			attr_dev(h21, "class", "large-caption");
    			add_location(h21, file$2, 84, 0, 2652);
    			attr_dev(span0, "class", "field-label");
    			add_location(span0, file$2, 94, 10, 2947);
    			attr_dev(span1, "class", "field-hint");
    			add_location(span1, file$2, 95, 10, 2996);
    			attr_dev(label0, "for", "remail");
    			add_location(label0, file$2, 93, 8, 2916);
    			attr_dev(input0, "id", "remail");
    			attr_dev(input0, "class", "field-cntrl");
    			input0.required = true;
    			attr_dev(input0, "placeholder", "enter your email");
    			attr_dev(input0, "type", "email");
    			add_location(input0, file$2, 97, 8, 3088);
    			attr_dev(div0, "class", "field");
    			add_location(div0, file$2, 92, 6, 2888);
    			attr_dev(span2, "class", "field-label");
    			add_location(span2, file$2, 108, 10, 3355);
    			attr_dev(span3, "class", "field-hint");
    			add_location(span3, file$2, 109, 10, 3411);
    			attr_dev(label1, "for", "rhandle");
    			add_location(label1, file$2, 107, 8, 3323);
    			attr_dev(input1, "id", "rhandle");
    			attr_dev(input1, "class", "field-cntrl");
    			input1.required = true;
    			attr_dev(input1, "pattern", /*handleRegExp*/ ctx[6]);
    			attr_dev(input1, "placeholder", "enter your gamer handle");
    			add_location(input1, file$2, 111, 8, 3496);
    			attr_dev(div1, "class", "field large-button");
    			add_location(div1, file$2, 106, 6, 3282);
    			attr_dev(span4, "class", "field-label");
    			add_location(span4, file$2, 122, 10, 3771);
    			add_location(br0, file$2, 124, 12, 3901);
    			attr_dev(span5, "class", "field-hint");
    			add_location(span5, file$2, 123, 10, 3823);
    			attr_dev(label2, "for", "rpassword");
    			add_location(label2, file$2, 121, 8, 3737);
    			attr_dev(input2, "id", "rpassword");
    			attr_dev(input2, "class", "field-cntrl");
    			input2.required = true;
    			attr_dev(input2, "minlength", input2_minlength_value = 8);
    			attr_dev(input2, "placeholder", "enter your password");
    			attr_dev(input2, "type", "password");
    			add_location(input2, file$2, 126, 8, 3972);
    			attr_dev(div2, "class", "field");
    			add_location(div2, file$2, 120, 6, 3709);
    			attr_dev(button0, "class", "action featured primary");
    			attr_dev(button0, "type", "submit");
    			add_location(button0, file$2, 137, 8, 4232);
    			attr_dev(div3, "class", "actions");
    			add_location(div3, file$2, 136, 6, 4202);
    			add_location(form0, file$2, 91, 4, 2839);
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$2, 141, 6, 4377);
    			attr_dev(p0, "class", "large-caption link-button");
    			add_location(p0, file$2, 140, 4, 4333);
    			section0.hidden = section0_hidden_value = !/*showReg*/ ctx[0];
    			add_location(section0, file$2, 90, 2, 2807);
    			attr_dev(span6, "class", "field-label");
    			add_location(span6, file$2, 149, 10, 4610);
    			attr_dev(span7, "class", "field-hint");
    			add_location(span7, file$2, 150, 10, 4666);
    			attr_dev(label3, "for", "handle");
    			add_location(label3, file$2, 148, 8, 4579);
    			attr_dev(input3, "id", "handle");
    			attr_dev(input3, "class", "field-cntrl");
    			input3.required = true;
    			attr_dev(input3, "pattern", /*handleRegExp*/ ctx[6]);
    			attr_dev(input3, "placeholder", "enter your gamer handle");
    			add_location(input3, file$2, 152, 8, 4751);
    			attr_dev(div4, "class", "field");
    			add_location(div4, file$2, 147, 6, 4551);
    			attr_dev(span8, "class", "field-label");
    			add_location(span8, file$2, 163, 10, 5024);
    			add_location(br1, file$2, 165, 12, 5154);
    			attr_dev(span9, "class", "field-hint");
    			add_location(span9, file$2, 164, 10, 5076);
    			attr_dev(label4, "for", "password");
    			add_location(label4, file$2, 162, 8, 4991);
    			attr_dev(input4, "id", "password");
    			attr_dev(input4, "class", "field-cntrl");
    			input4.required = true;
    			attr_dev(input4, "minlength", input4_minlength_value = 8);
    			attr_dev(input4, "placeholder", "enter your password");
    			attr_dev(input4, "type", "password");
    			add_location(input4, file$2, 167, 8, 5225);
    			attr_dev(div5, "class", "field");
    			add_location(div5, file$2, 161, 6, 4963);
    			attr_dev(button1, "class", "action featured primary");
    			attr_dev(button1, "type", "submit");
    			add_location(button1, file$2, 178, 8, 5484);
    			attr_dev(div6, "class", "actions");
    			add_location(div6, file$2, 177, 6, 5454);
    			add_location(form1, file$2, 146, 4, 4505);
    			attr_dev(a1, "href", "/");
    			add_location(a1, file$2, 182, 6, 5626);
    			attr_dev(p1, "class", "large-caption link-button");
    			add_location(p1, file$2, 181, 4, 5582);
    			section1.hidden = /*showReg*/ ctx[0];
    			add_location(section1, file$2, 145, 2, 4474);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h20, anchor);
    			append_dev(h20, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h21, anchor);
    			append_dev(h21, t2);
    			insert_dev(target, t3, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, section0, anchor);
    			append_dev(section0, form0);
    			append_dev(form0, div0);
    			append_dev(div0, label0);
    			append_dev(label0, span0);
    			append_dev(label0, t6);
    			append_dev(label0, span1);
    			append_dev(div0, t8);
    			append_dev(div0, input0);
    			set_input_value(input0, /*email*/ ctx[3]);
    			append_dev(form0, t9);
    			append_dev(form0, div1);
    			append_dev(div1, label1);
    			append_dev(label1, span2);
    			append_dev(label1, t11);
    			append_dev(label1, span3);
    			append_dev(div1, t13);
    			append_dev(div1, input1);
    			set_input_value(input1, /*handle*/ ctx[1]);
    			append_dev(form0, t14);
    			append_dev(form0, div2);
    			append_dev(div2, label2);
    			append_dev(label2, span4);
    			append_dev(label2, t16);
    			append_dev(label2, span5);
    			append_dev(span5, t17);
    			append_dev(span5, br0);
    			append_dev(span5, t18);
    			append_dev(div2, t19);
    			append_dev(div2, input2);
    			set_input_value(input2, /*password*/ ctx[2]);
    			append_dev(form0, t20);
    			append_dev(form0, div3);
    			append_dev(div3, button0);
    			append_dev(section0, t22);
    			append_dev(section0, p0);
    			append_dev(p0, a0);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, form1);
    			append_dev(form1, div4);
    			append_dev(div4, label3);
    			append_dev(label3, span6);
    			append_dev(label3, t26);
    			append_dev(label3, span7);
    			append_dev(div4, t28);
    			append_dev(div4, input3);
    			set_input_value(input3, /*handle*/ ctx[1]);
    			append_dev(form1, t29);
    			append_dev(form1, div5);
    			append_dev(div5, label4);
    			append_dev(label4, span8);
    			append_dev(label4, t31);
    			append_dev(label4, span9);
    			append_dev(span9, t32);
    			append_dev(span9, br1);
    			append_dev(span9, t33);
    			append_dev(div5, t34);
    			append_dev(div5, input4);
    			set_input_value(input4, /*password*/ ctx[2]);
    			append_dev(form1, t35);
    			append_dev(form1, div6);
    			append_dev(div6, button1);
    			append_dev(section1, t37);
    			append_dev(section1, p1);
    			append_dev(p1, a1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[10]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[11]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[12]),
    					listen_dev(form0, "submit", prevent_default(/*register*/ ctx[7]), false, true, false),
    					listen_dev(a0, "click", prevent_default(/*click_handler*/ ctx[13]), false, true, false),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[14]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[15]),
    					listen_dev(form1, "submit", prevent_default(/*login*/ ctx[8]), false, true, false),
    					listen_dev(a1, "click", prevent_default(/*click_handler_1*/ ctx[16]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*showReg*/ 1 && h20_hidden_value !== (h20_hidden_value = !/*showReg*/ ctx[0])) {
    				prop_dev(h20, "hidden", h20_hidden_value);
    			}

    			if (dirty & /*showReg*/ 1) {
    				prop_dev(h21, "hidden", /*showReg*/ ctx[0]);
    			}

    			if (/*errorText*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(t4.parentNode, t4);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*email*/ 8 && input0.value !== /*email*/ ctx[3]) {
    				set_input_value(input0, /*email*/ ctx[3]);
    			}

    			if (dirty & /*handle*/ 2 && input1.value !== /*handle*/ ctx[1]) {
    				set_input_value(input1, /*handle*/ ctx[1]);
    			}

    			if (dirty & /*password*/ 4 && input2.value !== /*password*/ ctx[2]) {
    				set_input_value(input2, /*password*/ ctx[2]);
    			}

    			if (dirty & /*showReg*/ 1 && section0_hidden_value !== (section0_hidden_value = !/*showReg*/ ctx[0])) {
    				prop_dev(section0, "hidden", section0_hidden_value);
    			}

    			if (dirty & /*handle*/ 2 && input3.value !== /*handle*/ ctx[1]) {
    				set_input_value(input3, /*handle*/ ctx[1]);
    			}

    			if (dirty & /*password*/ 4 && input4.value !== /*password*/ ctx[2]) {
    				set_input_value(input4, /*password*/ ctx[2]);
    			}

    			if (dirty & /*showReg*/ 1) {
    				prop_dev(section1, "hidden", /*showReg*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h20);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h21);
    			if (detaching) detach_dev(t3);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(section0);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(section1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(83:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (77:0) {#if $loggedIn}
    function create_if_block$1(ctx) {
    	let section;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			button = element("button");
    			button.textContent = "Logout";
    			attr_dev(button, "class", "action icon ico-signout");
    			add_location(button, file$2, 78, 4, 2472);
    			attr_dev(section, "class", "actions");
    			add_location(section, file$2, 77, 2, 2442);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*logout*/ ctx[9]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(77:0) {#if $loggedIn}",
    		ctx
    	});

    	return block;
    }

    // (86:2) {#if errorText}
    function create_if_block_1(ctx) {
    	let section;
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			section = element("section");
    			p = element("p");
    			t = text(/*errorText*/ ctx[4]);
    			add_location(p, file$2, 87, 6, 2763);
    			attr_dev(section, "class", "errorPanel");
    			add_location(section, file$2, 86, 4, 2728);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, p);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorText*/ 16) set_data_dev(t, /*errorText*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(86:2) {#if errorText}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*$loggedIn*/ ctx[5]) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $loggedIn;
    	validate_store(loggedIn, "loggedIn");
    	component_subscribe($$self, loggedIn, $$value => $$invalidate(5, $loggedIn = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Login", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	const dispatch = createEventDispatcher();
    	let showReg = false;
    	let handle;
    	let password;
    	let email;
    	let handleRegExp = "[a-zA-Z0-9]{4,25}";
    	let errorText;

    	const onStatusChanged = () => {
    		const ws = get_store_value(walletService);
    		loading.set(false);
    		loggedIn.update(v => ws.authenticated);
    		currentUser.update(v => ws.handle);
    	};

    	const register = () => __awaiter(void 0, void 0, void 0, function* () {
    		const ws = get_store_value(walletService);
    		console.log("register");
    		loading.set(true);

    		try {
    			yield ws.register(handle, password, email);
    		} catch(err) {
    			showError(`Registration failed`);
    			return;
    		}

    		onStatusChanged();
    	});

    	const login = () => __awaiter(void 0, void 0, void 0, function* () {
    		const ws = get_store_value(walletService);
    		console.log("login");
    		loading.set(true);

    		try {
    			yield ws.login(handle, password);
    		} catch(err) {
    			showError(`Login failed`);
    			return;
    		}

    		onStatusChanged();
    	});

    	const logout = () => __awaiter(void 0, void 0, void 0, function* () {
    		const ws = get_store_value(walletService);
    		console.log("logout");
    		loading.set(true);
    		yield ws.logout();
    		onStatusChanged();
    	});

    	const showError = msg => __awaiter(void 0, void 0, void 0, function* () {
    		console.log(msg);
    		loading.set(false);
    		$$invalidate(4, errorText = msg);

    		setTimeout(
    			() => {
    				$$invalidate(4, errorText = null);
    			},
    			5000
    		);
    	});

    	route.subscribe(r => {
    		if (r === "logout") {
    			logout();
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		email = this.value;
    		$$invalidate(3, email);
    	}

    	function input1_input_handler() {
    		handle = this.value;
    		$$invalidate(1, handle);
    	}

    	function input2_input_handler() {
    		password = this.value;
    		$$invalidate(2, password);
    	}

    	const click_handler = () => $$invalidate(0, showReg = false);

    	function input3_input_handler() {
    		handle = this.value;
    		$$invalidate(1, handle);
    	}

    	function input4_input_handler() {
    		password = this.value;
    		$$invalidate(2, password);
    	}

    	const click_handler_1 = () => $$invalidate(0, showReg = true);

    	$$self.$capture_state = () => ({
    		__awaiter,
    		walletService,
    		currentUser,
    		loggedIn,
    		loading,
    		route,
    		createEventDispatcher,
    		get: get_store_value,
    		dispatch,
    		showReg,
    		handle,
    		password,
    		email,
    		handleRegExp,
    		errorText,
    		onStatusChanged,
    		register,
    		login,
    		logout,
    		showError,
    		$loggedIn
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("showReg" in $$props) $$invalidate(0, showReg = $$props.showReg);
    		if ("handle" in $$props) $$invalidate(1, handle = $$props.handle);
    		if ("password" in $$props) $$invalidate(2, password = $$props.password);
    		if ("email" in $$props) $$invalidate(3, email = $$props.email);
    		if ("handleRegExp" in $$props) $$invalidate(6, handleRegExp = $$props.handleRegExp);
    		if ("errorText" in $$props) $$invalidate(4, errorText = $$props.errorText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		showReg,
    		handle,
    		password,
    		email,
    		errorText,
    		$loggedIn,
    		handleRegExp,
    		register,
    		login,
    		logout,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		click_handler,
    		input3_input_handler,
    		input4_input_handler,
    		click_handler_1
    	];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Panel.svelte generated by Svelte v3.29.4 */
    const file$3 = "src/components/Panel.svelte";
    const get_extend_slot_changes = dirty => ({});
    const get_extend_slot_context = ctx => ({});
    const get_actions_slot_changes = dirty => ({});
    const get_actions_slot_context = ctx => ({});
    const get_prepend_slot_changes = dirty => ({});
    const get_prepend_slot_context = ctx => ({});

    // (28:4) {#if $loggedIn}
    function create_if_block_1$1(ctx) {
    	let h1;
    	let t0;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t4_value = format$1(/*balance*/ ctx[1]).currency + "";
    	let t4;
    	let t5;
    	let t6;
    	let section;
    	let t7;
    	let t8;
    	let current;
    	const prepend_slot_template = /*#slots*/ ctx[6].prepend;
    	const prepend_slot = create_slot(prepend_slot_template, ctx, /*$$scope*/ ctx[5], get_prepend_slot_context);
    	let if_block = !/*hideDefaultActions*/ ctx[0] && create_if_block_2(ctx);
    	const actions_slot_template = /*#slots*/ ctx[6].actions;
    	const actions_slot = create_slot(actions_slot_template, ctx, /*$$scope*/ ctx[5], get_actions_slot_context);
    	const extend_slot_template = /*#slots*/ ctx[6].extend;
    	const extend_slot = create_slot(extend_slot_template, ctx, /*$$scope*/ ctx[5], get_extend_slot_context);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(/*$currentUser*/ ctx[3]);
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Your Balance";
    			t3 = space();
    			p1 = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			if (prepend_slot) prepend_slot.c();
    			t6 = space();
    			section = element("section");
    			if (if_block) if_block.c();
    			t7 = space();
    			if (actions_slot) actions_slot.c();
    			t8 = space();
    			if (extend_slot) extend_slot.c();
    			attr_dev(h1, "class", "small-caption username");
    			add_location(h1, file$3, 28, 6, 789);
    			attr_dev(p0, "class", "large-caption balance-caption");
    			add_location(p0, file$3, 29, 6, 850);
    			attr_dev(p1, "class", "large-caption balance");
    			add_location(p1, file$3, 30, 6, 914);
    			attr_dev(section, "class", "actions");
    			add_location(section, file$3, 32, 6, 1014);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t4);
    			insert_dev(target, t5, anchor);

    			if (prepend_slot) {
    				prepend_slot.m(target, anchor);
    			}

    			insert_dev(target, t6, anchor);
    			insert_dev(target, section, anchor);
    			if (if_block) if_block.m(section, null);
    			append_dev(section, t7);

    			if (actions_slot) {
    				actions_slot.m(section, null);
    			}

    			insert_dev(target, t8, anchor);

    			if (extend_slot) {
    				extend_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*$currentUser*/ 8) set_data_dev(t0, /*$currentUser*/ ctx[3]);
    			if ((!current || dirty & /*balance*/ 2) && t4_value !== (t4_value = format$1(/*balance*/ ctx[1]).currency + "")) set_data_dev(t4, t4_value);

    			if (prepend_slot) {
    				if (prepend_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(prepend_slot, prepend_slot_template, ctx, /*$$scope*/ ctx[5], dirty, get_prepend_slot_changes, get_prepend_slot_context);
    				}
    			}

    			if (!/*hideDefaultActions*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(section, t7);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (actions_slot) {
    				if (actions_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(actions_slot, actions_slot_template, ctx, /*$$scope*/ ctx[5], dirty, get_actions_slot_changes, get_actions_slot_context);
    				}
    			}

    			if (extend_slot) {
    				if (extend_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(extend_slot, extend_slot_template, ctx, /*$$scope*/ ctx[5], dirty, get_extend_slot_changes, get_extend_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_slot, local);
    			transition_in(actions_slot, local);
    			transition_in(extend_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_slot, local);
    			transition_out(actions_slot, local);
    			transition_out(extend_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t5);
    			if (prepend_slot) prepend_slot.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(section);
    			if (if_block) if_block.d();
    			if (actions_slot) actions_slot.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (extend_slot) extend_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(28:4) {#if $loggedIn}",
    		ctx
    	});

    	return block;
    }

    // (34:8) {#if !hideDefaultActions}
    function create_if_block_2(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "Add Funds";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Withdrawal";
    			attr_dev(button0, "class", "action icon ico-cashin");
    			add_location(button0, file$3, 34, 10, 1084);
    			attr_dev(button1, "class", "action icon ico-cashout");
    			add_location(button1, file$3, 37, 10, 1223);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", prevent_default(/*click_handler*/ ctx[7]), false, true, false),
    					listen_dev(button1, "click", prevent_default(/*click_handler_1*/ ctx[8]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(34:8) {#if !hideDefaultActions}",
    		ctx
    	});

    	return block;
    }

    // (47:4) {#if !hideDefaultActions}
    function create_if_block$2(ctx) {
    	let login;
    	let current;
    	login = new Login({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(login.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(login, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(login.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(login.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(login, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(47:4) {#if !hideDefaultActions}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let section;
    	let div;
    	let t0;
    	let t1;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	let if_block0 = /*$loggedIn*/ ctx[2] && create_if_block_1$1(ctx);
    	let if_block1 = !/*hideDefaultActions*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "contentBox");
    			add_location(div, file$3, 24, 2, 720);
    			attr_dev(section, "class", "panelBox");
    			add_location(section, file$3, 23, 0, 691);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(div, t0);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t1);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}

    			if (/*$loggedIn*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*$loggedIn*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*hideDefaultActions*/ ctx[0]) {
    				if (if_block1) {
    					if (dirty & /*hideDefaultActions*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot) default_slot.d(detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function format$1(value) {
    	let input = (value || 0).toString().replace(/[^0-9\.-]/g, "");
    	let number = Number.parseFloat(input) || 0;
    	let currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(number);
    	return { value: number, currency };
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $loggedIn;
    	let $currentUser;
    	validate_store(loggedIn, "loggedIn");
    	component_subscribe($$self, loggedIn, $$value => $$invalidate(2, $loggedIn = $$value));
    	validate_store(currentUser, "currentUser");
    	component_subscribe($$self, currentUser, $$value => $$invalidate(3, $currentUser = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Panel", slots, ['default','prepend','actions','extend']);
    	let { hideDefaultActions = false } = $$props;
    	let { balance = 0 } = $$props;

    	const nav = path => {
    		const ws = get_store_value(walletService);
    		ws.show(path);
    	};

    	const writable_props = ["hideDefaultActions", "balance"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Panel> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => nav("cashier");
    	const click_handler_1 = () => nav("cashout");

    	$$self.$$set = $$props => {
    		if ("hideDefaultActions" in $$props) $$invalidate(0, hideDefaultActions = $$props.hideDefaultActions);
    		if ("balance" in $$props) $$invalidate(1, balance = $$props.balance);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Login,
    		walletService,
    		currentUser,
    		loggedIn,
    		get: get_store_value,
    		hideDefaultActions,
    		balance,
    		format: format$1,
    		nav,
    		$loggedIn,
    		$currentUser
    	});

    	$$self.$inject_state = $$props => {
    		if ("hideDefaultActions" in $$props) $$invalidate(0, hideDefaultActions = $$props.hideDefaultActions);
    		if ("balance" in $$props) $$invalidate(1, balance = $$props.balance);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		hideDefaultActions,
    		balance,
    		$loggedIn,
    		$currentUser,
    		nav,
    		$$scope,
    		slots,
    		click_handler,
    		click_handler_1
    	];
    }

    class Panel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { hideDefaultActions: 0, balance: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Panel",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get hideDefaultActions() {
    		throw new Error("<Panel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideDefaultActions(value) {
    		throw new Error("<Panel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get balance() {
    		throw new Error("<Panel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set balance(value) {
    		throw new Error("<Panel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/Home.svelte generated by Svelte v3.29.4 */
    const file$4 = "src/pages/Home.svelte";

    // (24:0) {#if visible}
    function create_if_block$3(ctx) {
    	let panel;
    	let current;

    	panel = new Panel({
    			props: {
    				balance: /*$balance*/ ctx[1],
    				$$slots: { prepend: [create_prepend_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(panel.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(panel, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const panel_changes = {};
    			if (dirty & /*$balance*/ 2) panel_changes.balance = /*$balance*/ ctx[1];

    			if (dirty & /*$$scope*/ 8) {
    				panel_changes.$$scope = { dirty, ctx };
    			}

    			panel.$set(panel_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(panel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(panel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(panel, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(24:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (27:4) <div slot="prepend">
    function create_prepend_slot(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "slot", "prepend");
    			add_location(div, file$4, 26, 4, 520);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_slot.name,
    		type: "slot",
    		source: "(27:4) <div slot=\\\"prepend\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*visible*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*visible*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $balance;
    	validate_store(balance, "balance");
    	component_subscribe($$self, balance, $$value => $$invalidate(1, $balance = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, ['default']);
    	let { visible = false } = $$props;

    	const show = () => {
    		$$invalidate(0, visible = true);
    		displayMode.set("panelMode");
    	};

    	const hide = () => {
    		$$invalidate(0, visible = false);
    	};

    	route.subscribe(r => {
    		if (r === "home") {
    			show();
    		} else {
    			hide();
    		}
    	});

    	const writable_props = ["visible"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Panel,
    		displayMode,
    		route,
    		balance,
    		visible,
    		show,
    		hide,
    		$balance
    	});

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [visible, $balance, slots, $$scope];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { visible: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get visible() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    class CashierResponse {
    }

    /* src/components/WebCashier.svelte generated by Svelte v3.29.4 */

    const { Error: Error_1, console: console_1$1 } = globals;
    const file$5 = "src/components/WebCashier.svelte";

    function create_fragment$5(ctx) {
    	let section;

    	const block = {
    		c: function create() {
    			section = element("section");
    			attr_dev(section, "id", "webcashier");
    			add_location(section, file$5, 186, 0, 7260);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function setInnerHTML(elm, html) {
    	elm.innerHTML = html;

    	Array.from(elm.querySelectorAll("script")).forEach(oldScript => {
    		const newScript = document.createElement("script");
    		Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
    		newScript.appendChild(document.createTextNode(oldScript.innerHTML));
    		oldScript.parentNode.replaceChild(newScript, oldScript);
    	});
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("WebCashier", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	const dispatch = createEventDispatcher();
    	
    	const win = window;

    	win.gidxServiceSettings = function (data) {
    		console.log(`TRIGGERED: gidx.gidxServiceSettings: ${data}`);
    		win.gidxContainer = "#webcashier";
    		win.gidxBuildTimer = false;
    		win.gidxBuildSteps = false;
    	};

    	win.gidxServiceStatus = echoGidxEvent("gidxServiceStatus", (name, phase) => {
    		if (phase === "start") {
    			loading.set(false);
    		}

    		if (phase === "end") {
    			loading.set(true);
    		}
    	});

    	win.gidxErrorReport = echoGidxEvent("gidxErrorReport", () => {
    		raiseDialogEvent("Cashier unavailable at this time.");
    		loading.set(false);
    	});

    	win.gidxContainer = echoGidxEvent("gidxContainer");
    	win.gidxBuildTimer = echoGidxEvent("gidxBuildTimer");
    	win.gidxBuildSteps = echoGidxEvent("gidxBuildSteps");
    	win.gidxNextStep = echoGidxEvent("gidxNextStep", handleGidxNextStep);
    	let mode;
    	let webCasherSessionScript;

    	const raiseDialogEvent = (message, type = "warn") => __awaiter(void 0, void 0, void 0, function* () {
    		console.log(message);
    		dispatch("dialog", { body: message, type });
    	});

    	const cashOut = paymentAmount => __awaiter(void 0, void 0, void 0, function* () {
    		var _a;

    		try {
    			mode = "cashout";
    			loading.set(true);

    			//let geoAccess = navigator.permissions.query({name:'geolocation'});
    			//if (['granted','prompt'].indexOf(geoAccess.state) > -1) { console.log('might work'); }
    			const deviceGPS = yield ApiService.getGps();

    			if (deviceGPS.latitude < 1) {
    				throw new Error(`You must share your location to continue.`);
    			}

    			const ws = get_store_value(walletService);

    			const message = ws.wallet.buildMessage({
    				subject: ws.paymail,
    				payload: JSON.stringify({ deviceGPS, paymentAmount })
    			});

    			const response = yield ws.blockchain.sendMessage(message, "/cashout");
    			let sessionId = response.paymentId;
    			let script = response.cashierScript;

    			if (script) {
    				window.localStorage.setItem(sessionId, script);
    				renderCashier(script);
    				return;
    			} else if (sessionId) {
    				script = window.localStorage.getItem(sessionId);

    				if (script) {
    					renderCashier(script);
    					return;
    				}

    				throw new Error("Cashier session could not be restored.");
    			}
    		} catch(err) {
    			console.log(err, err.stack);
    			loading.set(false);

    			raiseDialogEvent((_a = err.message) !== null && _a !== void 0
    			? _a
    			: `Could not cash out funds at this time.`);
    		}
    	});

    	const cashIn = () => __awaiter(void 0, void 0, void 0, function* () {
    		var _b;

    		try {
    			mode = "cashin";
    			loading.set(true);

    			//let geoAccess = navigator.permissions.query({name:'geolocation'});
    			//if (['granted','prompt'].indexOf(geoAccess.state) > -1) { console.log('might work'); }
    			const deviceGPS = yield ApiService.getGps();

    			if (deviceGPS.latitude < 1) {
    				throw new Error(`You must share your location to continue.`);
    			}

    			const ws = get_store_value(walletService);

    			const message = ws.wallet.buildMessage({
    				subject: "CashInRequest",
    				payload: JSON.stringify({ deviceGPS, owner: ws.wallet.address })
    			});

    			const response = yield ws.blockchain.sendMessage(message, "/cashier");
    			let sessionId = response.paymentId;
    			let script = response.cashierScript;

    			if (script) {
    				window.localStorage.setItem(sessionId, script);
    				renderCashier(script);
    				return;
    			} else if (sessionId) {
    				script = window.localStorage.getItem(sessionId);

    				if (script) {
    					renderCashier(script);
    					return;
    				}

    				throw new Error("Cashier session could not be restored.");
    			}
    		} catch(err) {
    			console.log(err, err.stack);
    			loading.set(false);

    			raiseDialogEvent((_b = err.message) !== null && _b !== void 0
    			? _b
    			: `Could not add funds at this time.`);
    		}
    	});

    	function onCashierComplete() {
    		dispatch("complete", {});
    	}

    	function handleGidxNextStep() {
    		return __awaiter(this, void 0, void 0, function* () {
    			console.log(`WebCashier Completed`);
    			loading.set(true);

    			if (mode === "cashin") {
    				console.log(`GET SESSION STATUS`);
    				const ws = get_store_value(walletService);
    				const deviceGPS = yield ApiService.getGps();

    				const message = ws.wallet.buildMessage({
    					subject: ws.paymail,
    					payload: JSON.stringify({ deviceGPS })
    				});

    				try {
    					const response = yield ws.blockchain.sendMessage(message, "/payment/status");
    					console.log(response);
    					raiseDialogEvent(response.message, response.success ? "ok" : "warn");
    				} catch(err) {
    					raiseDialogEvent(err.message);
    				}
    			}

    			mode = undefined;
    			onCashierComplete();
    			loading.set(false);
    		});
    	}

    	function echoGidxEvent(name, func) {
    		return (data, phase, ...args) => __awaiter(this, void 0, void 0, function* () {
    			console.log(`TRIGGERED: ${name}: ${data} ${phase}`, args);

    			if (typeof func === "function") {
    				yield func(data, phase, ...args);
    			}
    		});
    	}

    	function renderCashier(script) {
    		webCasherSessionScript = unescape(decodeURI(script)).replace(/\+/g, " ");

    		setTimeout(
    			() => {
    				setInnerHTML(document.getElementById("webcashier"), webCasherSessionScript);
    			},
    			500
    		);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<WebCashier> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		__awaiter,
    		createEventDispatcher,
    		dispatch,
    		get: get_store_value,
    		ApiService,
    		CashierResponse,
    		walletService,
    		loading,
    		route,
    		win,
    		mode,
    		webCasherSessionScript,
    		raiseDialogEvent,
    		cashOut,
    		cashIn,
    		onCashierComplete,
    		handleGidxNextStep,
    		echoGidxEvent,
    		renderCashier,
    		setInnerHTML
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("mode" in $$props) mode = $$props.mode;
    		if ("webCasherSessionScript" in $$props) webCasherSessionScript = $$props.webCasherSessionScript;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cashOut, cashIn];
    }

    class WebCashier extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { cashOut: 0, cashIn: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WebCashier",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get cashOut() {
    		return this.$$.ctx[0];
    	}

    	set cashOut(value) {
    		throw new Error_1("<WebCashier>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cashIn() {
    		return this.$$.ctx[1];
    	}

    	set cashIn(value) {
    		throw new Error_1("<WebCashier>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/Cashier.svelte generated by Svelte v3.29.4 */

    const { console: console_1$2 } = globals;
    const file$6 = "src/pages/Cashier.svelte";

    // (104:0) {#if visible}
    function create_if_block$4(ctx) {
    	let panel;
    	let t;
    	let section;
    	let div;
    	let webcashier;
    	let current;

    	let panel_props = {
    		balance: /*$balance*/ ctx[6],
    		hideDefaultActions: /*hidePanelActions*/ ctx[7],
    		$$slots: {
    			default: [create_default_slot],
    			actions: [create_actions_slot],
    			prepend: [create_prepend_slot$1]
    		},
    		$$scope: { ctx }
    	};

    	panel = new Panel({ props: panel_props, $$inline: true });
    	/*panel_binding*/ ctx[14](panel);
    	let webcashier_props = {};
    	webcashier = new WebCashier({ props: webcashier_props, $$inline: true });
    	/*webcashier_binding*/ ctx[15](webcashier);
    	webcashier.$on("dialog", /*dialog_handler*/ ctx[16]);
    	webcashier.$on("complete", /*onCashierComplete*/ ctx[11]);

    	const block = {
    		c: function create() {
    			create_component(panel.$$.fragment);
    			t = space();
    			section = element("section");
    			div = element("div");
    			create_component(webcashier.$$.fragment);
    			attr_dev(div, "class", "contentBox");
    			add_location(div, file$6, 169, 4, 5022);
    			attr_dev(section, "class", "frameBox");
    			add_location(section, file$6, 168, 2, 4991);
    		},
    		m: function mount(target, anchor) {
    			mount_component(panel, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			mount_component(webcashier, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const panel_changes = {};
    			if (dirty & /*$balance*/ 64) panel_changes.balance = /*$balance*/ ctx[6];

    			if (dirty & /*$$scope, acceptedTerms, isCashierShowing, $balance, paymentAmount*/ 8388722) {
    				panel_changes.$$scope = { dirty, ctx };
    			}

    			panel.$set(panel_changes);
    			const webcashier_changes = {};
    			webcashier.$set(webcashier_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(panel.$$.fragment, local);
    			transition_in(webcashier.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(panel.$$.fragment, local);
    			transition_out(webcashier.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*panel_binding*/ ctx[14](null);
    			destroy_component(panel, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(section);
    			/*webcashier_binding*/ ctx[15](null);
    			destroy_component(webcashier);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(104:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (110:4) <div slot="prepend">
    function create_prepend_slot$1(ctx) {
    	let div0;
    	let p0;
    	let t1;
    	let div1;
    	let button0;
    	let t3;
    	let button1;
    	let t5;
    	let button2;
    	let t7;
    	let button3;
    	let t9;
    	let p1;
    	let t11;
    	let div2;
    	let input0;
    	let input0_pattern_value;
    	let t12;
    	let div3;
    	let input1;
    	let t13;
    	let span;
    	let t14;
    	let a0;
    	let t16;
    	let a1;
    	let t18;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Please select an amount:";
    			t1 = space();
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "$1";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "$5";
    			t5 = space();
    			button2 = element("button");
    			button2.textContent = "$15";
    			t7 = space();
    			button3 = element("button");
    			button3.textContent = "$50";
    			t9 = space();
    			p1 = element("p");
    			p1.textContent = "or enter a custom amount:";
    			t11 = space();
    			div2 = element("div");
    			input0 = element("input");
    			t12 = space();
    			div3 = element("div");
    			input1 = element("input");
    			t13 = space();
    			span = element("span");
    			t14 = text("I have read the\n          ");
    			a0 = element("a");
    			a0.textContent = "T&C";
    			t16 = text(" and\n          ");
    			a1 = element("a");
    			a1.textContent = "Privacy Policy";
    			t18 = text("\n          and approve this Transaction");
    			attr_dev(p0, "class", "small-caption");
    			add_location(p0, file$6, 110, 6, 3234);
    			attr_dev(button0, "class", "action");
    			button0.value = "1.00";
    			add_location(button0, file$6, 112, 8, 3334);
    			attr_dev(button1, "class", "action");
    			button1.value = "5.00";
    			add_location(button1, file$6, 116, 8, 3455);
    			attr_dev(button2, "class", "action");
    			button2.value = "15.00";
    			add_location(button2, file$6, 120, 8, 3576);
    			attr_dev(button3, "class", "action");
    			button3.value = "50.00";
    			add_location(button3, file$6, 124, 8, 3699);
    			attr_dev(div1, "class", "actions quick-set svelte-glmem3");
    			add_location(div1, file$6, 111, 6, 3294);
    			attr_dev(p1, "class", "small-caption");
    			add_location(p1, file$6, 129, 6, 3833);
    			attr_dev(input0, "id", "amount");
    			attr_dev(input0, "class", "field-cntrl");
    			input0.required = true;
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "min", "0.00");
    			attr_dev(input0, "max", /*$balance*/ ctx[6]);
    			attr_dev(input0, "step", "1.00");
    			attr_dev(input0, "pattern", input0_pattern_value = "[0-9]?\\.[0-9]" + 2);
    			attr_dev(input0, "placeholder", "0.00");
    			add_location(input0, file$6, 131, 8, 3930);
    			attr_dev(div2, "class", "balance-input");
    			add_location(div2, file$6, 130, 6, 3894);
    			attr_dev(input1, "type", "checkbox");
    			attr_dev(input1, "id", "checkbox");
    			attr_dev(input1, "name", "checkbox");
    			attr_dev(input1, "data-name", "Checkbox");
    			input1.required = true;
    			attr_dev(input1, "class", "svelte-glmem3");
    			add_location(input1, file$6, 144, 8, 4253);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "link");
    			add_location(a0, file$6, 152, 10, 4501);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "link");
    			add_location(a1, file$6, 153, 10, 4552);
    			attr_dev(span, "class", "small-caption fine-print svelte-glmem3");
    			add_location(span, file$6, 151, 8, 4436);
    			attr_dev(div3, "class", "terms svelte-glmem3");
    			add_location(div3, file$6, 143, 6, 4225);
    			attr_dev(div0, "slot", "prepend");
    			add_location(div0, file$6, 109, 4, 3207);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, p0);
    			append_dev(div0, t1);
    			append_dev(div0, div1);
    			append_dev(div1, button0);
    			append_dev(div1, t3);
    			append_dev(div1, button1);
    			append_dev(div1, t5);
    			append_dev(div1, button2);
    			append_dev(div1, t7);
    			append_dev(div1, button3);
    			append_dev(div0, t9);
    			append_dev(div0, p1);
    			append_dev(div0, t11);
    			append_dev(div0, div2);
    			append_dev(div2, input0);
    			set_input_value(input0, /*paymentAmount*/ ctx[4]);
    			append_dev(div0, t12);
    			append_dev(div0, div3);
    			append_dev(div3, input1);
    			input1.checked = /*acceptedTerms*/ ctx[5];
    			append_dev(div3, t13);
    			append_dev(div3, span);
    			append_dev(span, t14);
    			append_dev(span, a0);
    			append_dev(span, t16);
    			append_dev(span, a1);
    			append_dev(span, t18);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", prevent_default(/*setFunds*/ ctx[9]), false, true, false),
    					listen_dev(button1, "click", prevent_default(/*setFunds*/ ctx[9]), false, true, false),
    					listen_dev(button2, "click", prevent_default(/*setFunds*/ ctx[9]), false, true, false),
    					listen_dev(button3, "click", prevent_default(/*setFunds*/ ctx[9]), false, true, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[12]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[13])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$balance*/ 64) {
    				attr_dev(input0, "max", /*$balance*/ ctx[6]);
    			}

    			if (dirty & /*paymentAmount*/ 16 && to_number(input0.value) !== /*paymentAmount*/ ctx[4]) {
    				set_input_value(input0, /*paymentAmount*/ ctx[4]);
    			}

    			if (dirty & /*acceptedTerms*/ 32) {
    				input1.checked = /*acceptedTerms*/ ctx[5];
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_slot$1.name,
    		type: "slot",
    		source: "(110:4) <div slot=\\\"prepend\\\">",
    		ctx
    	});

    	return block;
    }

    // (159:6) {#if !isCashierShowing}
    function create_if_block_1$2(ctx) {
    	let button;
    	let t;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("Continue");
    			attr_dev(button, "class", "action featured primary");
    			button.disabled = button_disabled_value = !/*acceptedTerms*/ ctx[5];
    			add_location(button, file$6, 159, 8, 4729);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*addFunds*/ ctx[10]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*acceptedTerms*/ 32 && button_disabled_value !== (button_disabled_value = !/*acceptedTerms*/ ctx[5])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(159:6) {#if !isCashierShowing}",
    		ctx
    	});

    	return block;
    }

    // (158:4) <div slot="actions">
    function create_actions_slot(ctx) {
    	let div;
    	let t0;
    	let button;
    	let mounted;
    	let dispose;
    	let if_block = !/*isCashierShowing*/ ctx[1] && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			button = element("button");
    			button.textContent = "Back";
    			attr_dev(button, "class", "action");
    			add_location(button, file$6, 164, 6, 4896);
    			attr_dev(div, "slot", "actions");
    			add_location(div, file$6, 157, 4, 4670);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t0);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*cancel*/ ctx[8]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!/*isCashierShowing*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					if_block.m(div, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_actions_slot.name,
    		type: "slot",
    		source: "(158:4) <div slot=\\\"actions\\\">",
    		ctx
    	});

    	return block;
    }

    // (106:2) <Panel     bind:this={controlPanel}     balance={$balance}     hideDefaultActions={hidePanelActions}>
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(106:2) <Panel     bind:this={controlPanel}     balance={$balance}     hideDefaultActions={hidePanelActions}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*visible*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*visible*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $balance;
    	validate_store(balance, "balance");
    	component_subscribe($$self, balance, $$value => $$invalidate(6, $balance = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Cashier", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	const dispatch = createEventDispatcher();
    	
    	let { visible = false } = $$props;
    	let isCashierShowing = false;
    	let hidePanelActions = true;
    	let controlPanel;
    	let lastDisplayMode;
    	let webCashier;
    	let paymentAmount;
    	let acceptedTerms = false;

    	const cancel = () => __awaiter(void 0, void 0, void 0, function* () {
    		lastDisplayMode = "";
    		$$invalidate(1, isCashierShowing = false);
    		route.set("home");
    	});

    	const raiseDialogEvent = (message, type = "warn") => __awaiter(void 0, void 0, void 0, function* () {
    		console.log(message);
    		dispatch("dialog", { body: message, type });
    	});

    	const setFunds = event => {
    		console.log(event.target.value);
    		$$invalidate(4, paymentAmount = Number.parseFloat(event.target.value));
    	};

    	const addFunds = () => __awaiter(void 0, void 0, void 0, function* () {
    		var _a;

    		try {
    			loading.set(true);
    			displayMode.set("frameMode");
    			lastDisplayMode = "frameMode";
    			$$invalidate(1, isCashierShowing = true);
    			yield webCashier.cashIn();
    		} catch(err) {
    			console.log(err, err.stack);
    			loading.set(false);

    			raiseDialogEvent((_a = err.message) !== null && _a !== void 0
    			? _a
    			: `Could not add funds at this time.`);
    		}
    	});

    	const onCashierComplete = () => __awaiter(void 0, void 0, void 0, function* () {
    		displayMode.set("panelMode");
    		$$invalidate(1, isCashierShowing = false);
    	});

    	const show = () => {
    		$$invalidate(0, visible = true);
    		const mode = get_store_value(displayMode);
    		lastDisplayMode = lastDisplayMode || "panelMode";
    		displayMode.set(lastDisplayMode);
    	};

    	const hide = () => {
    		$$invalidate(0, visible = false);
    	};

    	route.subscribe(r => {
    		if (r === "cashier") {
    			show();
    		} else {
    			hide();
    		}
    	});

    	const writable_props = ["visible"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Cashier> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		paymentAmount = to_number(this.value);
    		$$invalidate(4, paymentAmount);
    	}

    	function input1_change_handler() {
    		acceptedTerms = this.checked;
    		$$invalidate(5, acceptedTerms);
    	}

    	function panel_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			controlPanel = $$value;
    			$$invalidate(2, controlPanel);
    		});
    	}

    	function webcashier_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			webCashier = $$value;
    			$$invalidate(3, webCashier);
    		});
    	}

    	function dialog_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    	};

    	$$self.$capture_state = () => ({
    		__awaiter,
    		createEventDispatcher,
    		dispatch,
    		walletService,
    		displayMode,
    		loading,
    		route,
    		balance,
    		Panel,
    		get: get_store_value,
    		WebCashier,
    		visible,
    		isCashierShowing,
    		hidePanelActions,
    		controlPanel,
    		lastDisplayMode,
    		webCashier,
    		paymentAmount,
    		acceptedTerms,
    		cancel,
    		raiseDialogEvent,
    		setFunds,
    		addFunds,
    		onCashierComplete,
    		show,
    		hide,
    		$balance
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("isCashierShowing" in $$props) $$invalidate(1, isCashierShowing = $$props.isCashierShowing);
    		if ("hidePanelActions" in $$props) $$invalidate(7, hidePanelActions = $$props.hidePanelActions);
    		if ("controlPanel" in $$props) $$invalidate(2, controlPanel = $$props.controlPanel);
    		if ("lastDisplayMode" in $$props) lastDisplayMode = $$props.lastDisplayMode;
    		if ("webCashier" in $$props) $$invalidate(3, webCashier = $$props.webCashier);
    		if ("paymentAmount" in $$props) $$invalidate(4, paymentAmount = $$props.paymentAmount);
    		if ("acceptedTerms" in $$props) $$invalidate(5, acceptedTerms = $$props.acceptedTerms);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		visible,
    		isCashierShowing,
    		controlPanel,
    		webCashier,
    		paymentAmount,
    		acceptedTerms,
    		$balance,
    		hidePanelActions,
    		cancel,
    		setFunds,
    		addFunds,
    		onCashierComplete,
    		input0_input_handler,
    		input1_change_handler,
    		panel_binding,
    		webcashier_binding,
    		dialog_handler
    	];
    }

    class Cashier extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { visible: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cashier",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get visible() {
    		throw new Error("<Cashier>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Cashier>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/Cashout.svelte generated by Svelte v3.29.4 */

    const { Error: Error_1$1, console: console_1$3 } = globals;
    const file$7 = "src/pages/Cashout.svelte";

    // (95:0) {#if visible}
    function create_if_block$5(ctx) {
    	let panel;
    	let t;
    	let section;
    	let div;
    	let webcashier;
    	let current;

    	let panel_props = {
    		balance: /*adjustedBalance*/ ctx[5],
    		hideDefaultActions: /*hidePanelActions*/ ctx[7],
    		$$slots: {
    			default: [create_default_slot$1],
    			actions: [create_actions_slot$1],
    			prepend: [create_prepend_slot$2]
    		},
    		$$scope: { ctx }
    	};

    	panel = new Panel({ props: panel_props, $$inline: true });
    	/*panel_binding*/ ctx[13](panel);
    	let webcashier_props = {};
    	webcashier = new WebCashier({ props: webcashier_props, $$inline: true });
    	/*webcashier_binding*/ ctx[14](webcashier);
    	webcashier.$on("dialog", /*dialog_handler*/ ctx[15]);
    	webcashier.$on("complete", /*onCashierComplete*/ ctx[10]);

    	const block = {
    		c: function create() {
    			create_component(panel.$$.fragment);
    			t = space();
    			section = element("section");
    			div = element("div");
    			create_component(webcashier.$$.fragment);
    			attr_dev(div, "class", "contentBox");
    			add_location(div, file$7, 139, 4, 4576);
    			attr_dev(section, "class", "frameBox");
    			add_location(section, file$7, 138, 2, 4545);
    		},
    		m: function mount(target, anchor) {
    			mount_component(panel, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			mount_component(webcashier, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const panel_changes = {};
    			if (dirty & /*adjustedBalance*/ 32) panel_changes.balance = /*adjustedBalance*/ ctx[5];

    			if (dirty & /*$$scope, $balance, paymentAmount, isCashierShowing*/ 4194378) {
    				panel_changes.$$scope = { dirty, ctx };
    			}

    			panel.$set(panel_changes);
    			const webcashier_changes = {};
    			webcashier.$set(webcashier_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(panel.$$.fragment, local);
    			transition_in(webcashier.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(panel.$$.fragment, local);
    			transition_out(webcashier.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*panel_binding*/ ctx[13](null);
    			destroy_component(panel, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(section);
    			/*webcashier_binding*/ ctx[14](null);
    			destroy_component(webcashier);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(95:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (102:6) {#if !isCashierShowing}
    function create_if_block_1$3(ctx) {
    	let div1;
    	let label;
    	let span0;
    	let t1;
    	let span1;
    	let t3;
    	let div0;
    	let input;
    	let input_pattern_value;
    	let t4;
    	let div2;
    	let t6;
    	let div3;
    	let button;
    	let t7;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			label = element("label");
    			span0 = element("span");
    			span0.textContent = "Amount to withdrawal";
    			t1 = space();
    			span1 = element("span");
    			span1.textContent = "Enter amount to withdrawal.";
    			t3 = space();
    			div0 = element("div");
    			input = element("input");
    			t4 = space();
    			div2 = element("div");
    			div2.textContent = "CAUTION: Clicking submit will transfer the game tokens.";
    			t6 = space();
    			div3 = element("div");
    			button = element("button");
    			t7 = text("Submit");
    			attr_dev(span0, "class", "field-label");
    			add_location(span0, file$7, 104, 12, 3453);
    			attr_dev(span1, "class", "field-hint");
    			add_location(span1, file$7, 105, 12, 3519);
    			attr_dev(label, "for", "amount");
    			add_location(label, file$7, 103, 10, 3420);
    			attr_dev(input, "id", "amount");
    			attr_dev(input, "class", "field-cntrl");
    			input.required = true;
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "0.00");
    			attr_dev(input, "max", /*$balance*/ ctx[6]);
    			attr_dev(input, "step", "1.00");
    			attr_dev(input, "pattern", input_pattern_value = "[0-9]?\\.[0-9]" + 2);
    			attr_dev(input, "placeholder", "0.00");
    			add_location(input, file$7, 108, 12, 3648);
    			attr_dev(div0, "class", "balance-input");
    			add_location(div0, file$7, 107, 10, 3608);
    			attr_dev(div1, "class", "field");
    			add_location(div1, file$7, 102, 8, 3390);
    			attr_dev(div2, "class", "small-caption fine-print");
    			add_location(div2, file$7, 122, 8, 4045);
    			attr_dev(button, "class", "action featured primary");
    			button.disabled = button_disabled_value = /*$balance*/ ctx[6] <= 0 || /*paymentAmount*/ ctx[3] <= 0;
    			add_location(button, file$7, 126, 10, 4205);
    			attr_dev(div3, "class", "actions");
    			add_location(div3, file$7, 125, 8, 4173);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, label);
    			append_dev(label, span0);
    			append_dev(label, t1);
    			append_dev(label, span1);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, input);
    			set_input_value(input, /*paymentAmount*/ ctx[3]);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, button);
    			append_dev(button, t7);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[12]),
    					listen_dev(input, "input", /*onAmountChanged*/ ctx[11], false, false, false),
    					listen_dev(button, "click", prevent_default(/*cashOut*/ ctx[9]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$balance*/ 64) {
    				attr_dev(input, "max", /*$balance*/ ctx[6]);
    			}

    			if (dirty & /*paymentAmount*/ 8 && to_number(input.value) !== /*paymentAmount*/ ctx[3]) {
    				set_input_value(input, /*paymentAmount*/ ctx[3]);
    			}

    			if (dirty & /*$balance, paymentAmount*/ 72 && button_disabled_value !== (button_disabled_value = /*$balance*/ ctx[6] <= 0 || /*paymentAmount*/ ctx[3] <= 0)) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(102:6) {#if !isCashierShowing}",
    		ctx
    	});

    	return block;
    }

    // (101:4) <div slot="prepend">
    function create_prepend_slot$2(ctx) {
    	let div;
    	let if_block = !/*isCashierShowing*/ ctx[1] && create_if_block_1$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "slot", "prepend");
    			add_location(div, file$7, 100, 4, 3331);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (!/*isCashierShowing*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$3(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_slot$2.name,
    		type: "slot",
    		source: "(101:4) <div slot=\\\"prepend\\\">",
    		ctx
    	});

    	return block;
    }

    // (134:4) <div slot="actions">
    function create_actions_slot$1(ctx) {
    	let div;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Back";
    			attr_dev(button, "class", "action featured");
    			add_location(button, file$7, 134, 6, 4441);
    			attr_dev(div, "slot", "actions");
    			add_location(div, file$7, 133, 4, 4414);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*cancel*/ ctx[8]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_actions_slot$1.name,
    		type: "slot",
    		source: "(134:4) <div slot=\\\"actions\\\">",
    		ctx
    	});

    	return block;
    }

    // (97:2) <Panel     bind:this={controlPanel}     balance={adjustedBalance}     hideDefaultActions={hidePanelActions}>
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(97:2) <Panel     bind:this={controlPanel}     balance={adjustedBalance}     hideDefaultActions={hidePanelActions}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*visible*/ ctx[0] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*visible*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $balance;
    	validate_store(balance, "balance");
    	component_subscribe($$self, balance, $$value => $$invalidate(6, $balance = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Cashout", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	const dispatch = createEventDispatcher();
    	
    	let { visible = false } = $$props;
    	let isCashierShowing = false;
    	let hidePanelActions = true;
    	let controlPanel;
    	let lastDisplayMode;
    	let paymentAmount = 0;
    	let webCashier;
    	let adjustedBalance;

    	const cancel = () => __awaiter(void 0, void 0, void 0, function* () {
    		$$invalidate(3, paymentAmount = 0);
    		$$invalidate(5, adjustedBalance = get_store_value(balance));
    		lastDisplayMode = "";
    		$$invalidate(1, isCashierShowing = false);
    		route.set("home");
    	});

    	const raiseDialogEvent = (message, type = "warn") => __awaiter(void 0, void 0, void 0, function* () {
    		console.log(message);
    		dispatch("dialog", { body: message, type });
    	});

    	const cashOut = () => __awaiter(void 0, void 0, void 0, function* () {
    		var _a;

    		try {
    			loading.set(true);
    			const max = get_store_value(balance);

    			if (paymentAmount <= 0 || paymentAmount > max) {
    				throw new Error(`Amount must be greater than 0 and less than ${max}`);
    			}

    			displayMode.set("frameMode");
    			lastDisplayMode = "frameMode";
    			$$invalidate(1, isCashierShowing = true);
    			yield webCashier.cashOut(paymentAmount);
    		} catch(err) {
    			console.log(err, err.stack);
    			loading.set(false);

    			raiseDialogEvent((_a = err.message) !== null && _a !== void 0
    			? _a
    			: `Could not cash out funds at this time.`);
    		}
    	});

    	const onCashierComplete = () => __awaiter(void 0, void 0, void 0, function* () {
    		displayMode.set("panelMode");
    		$$invalidate(1, isCashierShowing = false);
    	});

    	const onAmountChanged = event => __awaiter(void 0, void 0, void 0, function* () {
    		let max = get_store_value(balance);

    		if (event.target.value > max) {
    			event.target.value = $$invalidate(3, paymentAmount = max);
    		}

    		$$invalidate(5, adjustedBalance = max - paymentAmount);
    	});

    	const show = () => {
    		$$invalidate(0, visible = true);
    		const mode = get_store_value(displayMode);
    		lastDisplayMode = lastDisplayMode || "panelMode";
    		displayMode.set(lastDisplayMode);
    	};

    	const hide = () => {
    		$$invalidate(0, visible = false);
    	};

    	balance.subscribe(b => {
    		$$invalidate(5, adjustedBalance = b - paymentAmount);
    	});

    	route.subscribe(r => {
    		if (r === "cashout") {
    			show();
    		} else {
    			hide();
    		}
    	});

    	const writable_props = ["visible"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<Cashout> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		paymentAmount = to_number(this.value);
    		$$invalidate(3, paymentAmount);
    	}

    	function panel_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			controlPanel = $$value;
    			$$invalidate(2, controlPanel);
    		});
    	}

    	function webcashier_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			webCashier = $$value;
    			$$invalidate(4, webCashier);
    		});
    	}

    	function dialog_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    	};

    	$$self.$capture_state = () => ({
    		__awaiter,
    		createEventDispatcher,
    		dispatch,
    		walletService,
    		displayMode,
    		loading,
    		route,
    		balance,
    		Panel,
    		get: get_store_value,
    		WebCashier,
    		visible,
    		isCashierShowing,
    		hidePanelActions,
    		controlPanel,
    		lastDisplayMode,
    		paymentAmount,
    		webCashier,
    		adjustedBalance,
    		cancel,
    		raiseDialogEvent,
    		cashOut,
    		onCashierComplete,
    		onAmountChanged,
    		show,
    		hide,
    		$balance
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("isCashierShowing" in $$props) $$invalidate(1, isCashierShowing = $$props.isCashierShowing);
    		if ("hidePanelActions" in $$props) $$invalidate(7, hidePanelActions = $$props.hidePanelActions);
    		if ("controlPanel" in $$props) $$invalidate(2, controlPanel = $$props.controlPanel);
    		if ("lastDisplayMode" in $$props) lastDisplayMode = $$props.lastDisplayMode;
    		if ("paymentAmount" in $$props) $$invalidate(3, paymentAmount = $$props.paymentAmount);
    		if ("webCashier" in $$props) $$invalidate(4, webCashier = $$props.webCashier);
    		if ("adjustedBalance" in $$props) $$invalidate(5, adjustedBalance = $$props.adjustedBalance);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		visible,
    		isCashierShowing,
    		controlPanel,
    		paymentAmount,
    		webCashier,
    		adjustedBalance,
    		$balance,
    		hidePanelActions,
    		cancel,
    		cashOut,
    		onCashierComplete,
    		onAmountChanged,
    		input_input_handler,
    		panel_binding,
    		webcashier_binding,
    		dialog_handler
    	];
    }

    class Cashout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { visible: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cashout",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get visible() {
    		throw new Error_1$1("<Cashout>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error_1$1("<Cashout>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.4 */

    const { console: console_1$4 } = globals;
    const file$8 = "src/App.svelte";

    // (148:2) <Home>
    function create_default_slot$2(ctx) {
    	let div;
    	let t0;
    	let pre;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("GEO:\n      ");
    			pre = element("pre");
    			t1 = text(/*geo*/ ctx[1]);
    			add_location(pre, file$8, 150, 6, 4550);
    			attr_dev(div, "class", "geo svelte-1hqoobi");
    			set_style(div, "display", "none");
    			add_location(div, file$8, 148, 4, 4494);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, pre);
    			append_dev(pre, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*geo*/ 2) set_data_dev(t1, /*geo*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(148:2) <Home>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let alert;
    	let t0;
    	let spinner;
    	let t1;
    	let section;
    	let div1;
    	let div0;
    	let div1_class_value;
    	let t2;
    	let div2;
    	let span0;
    	let t4;
    	let img;
    	let img_src_value;
    	let t5;
    	let span1;
    	let t6_value = format$2(/*$balance*/ ctx[3]).currency.substr(1) + "";
    	let t6;
    	let t7;
    	let main;
    	let home;
    	let t8;
    	let cashier;
    	let t9;
    	let cashout;
    	let main_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let alert_props = {};
    	alert = new Alert({ props: alert_props, $$inline: true });
    	/*alert_binding*/ ctx[7](alert);
    	spinner = new Spinner({ $$inline: true });

    	home = new Home({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	cashier = new Cashier({ $$inline: true });
    	cashier.$on("dialog", /*onDialog*/ ctx[6]);
    	cashout = new Cashout({ $$inline: true });
    	cashout.$on("dialog", /*onDialog*/ ctx[6]);

    	const block = {
    		c: function create() {
    			create_component(alert.$$.fragment);
    			t0 = space();
    			create_component(spinner.$$.fragment);
    			t1 = space();
    			section = element("section");
    			div1 = element("div");
    			div0 = element("div");
    			t2 = space();
    			div2 = element("div");
    			span0 = element("span");
    			span0.textContent = "mintycoffee";
    			t4 = space();
    			img = element("img");
    			t5 = space();
    			span1 = element("span");
    			t6 = text(t6_value);
    			t7 = space();
    			main = element("main");
    			create_component(home.$$.fragment);
    			t8 = space();
    			create_component(cashier.$$.fragment);
    			t9 = space();
    			create_component(cashout.$$.fragment);
    			attr_dev(div0, "class", "menu-button_icon");
    			add_location(div0, file$8, 137, 4, 4154);
    			attr_dev(div1, "class", div1_class_value = "menu-button " + /*menuState*/ ctx[2] + " svelte-1hqoobi");
    			add_location(div1, file$8, 136, 2, 4089);
    			attr_dev(span0, "class", "small-caption");
    			add_location(span0, file$8, 140, 4, 4229);
    			attr_dev(img, "class", "ico-currency");
    			attr_dev(img, "alt", "dollar sign");
    			if (img.src !== (img_src_value = "images/ico-dollar.png")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$8, 141, 4, 4280);
    			attr_dev(span1, "class", "small-caption");
    			add_location(span1, file$8, 142, 4, 4359);
    			attr_dev(div2, "class", "menu-profile");
    			add_location(div2, file$8, 139, 2, 4198);
    			attr_dev(section, "class", "menuBox");
    			add_location(section, file$8, 135, 0, 4061);
    			attr_dev(main, "class", main_class_value = "" + (null_to_empty(/*$displayMode*/ ctx[4]) + " svelte-1hqoobi"));
    			add_location(main, file$8, 146, 0, 4453);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(alert, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(spinner, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, div0);
    			append_dev(section, t2);
    			append_dev(section, div2);
    			append_dev(div2, span0);
    			append_dev(div2, t4);
    			append_dev(div2, img);
    			append_dev(div2, t5);
    			append_dev(div2, span1);
    			append_dev(span1, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(home, main, null);
    			append_dev(main, t8);
    			mount_component(cashier, main, null);
    			append_dev(main, t9);
    			mount_component(cashout, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*toggleMenu*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const alert_changes = {};
    			alert.$set(alert_changes);

    			if (!current || dirty & /*menuState*/ 4 && div1_class_value !== (div1_class_value = "menu-button " + /*menuState*/ ctx[2] + " svelte-1hqoobi")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if ((!current || dirty & /*$balance*/ 8) && t6_value !== (t6_value = format$2(/*$balance*/ ctx[3]).currency.substr(1) + "")) set_data_dev(t6, t6_value);
    			const home_changes = {};

    			if (dirty & /*$$scope, geo*/ 4098) {
    				home_changes.$$scope = { dirty, ctx };
    			}

    			home.$set(home_changes);

    			if (!current || dirty & /*$displayMode*/ 16 && main_class_value !== (main_class_value = "" + (null_to_empty(/*$displayMode*/ ctx[4]) + " svelte-1hqoobi"))) {
    				attr_dev(main, "class", main_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(alert.$$.fragment, local);
    			transition_in(spinner.$$.fragment, local);
    			transition_in(home.$$.fragment, local);
    			transition_in(cashier.$$.fragment, local);
    			transition_in(cashout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(alert.$$.fragment, local);
    			transition_out(spinner.$$.fragment, local);
    			transition_out(home.$$.fragment, local);
    			transition_out(cashier.$$.fragment, local);
    			transition_out(cashout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*alert_binding*/ ctx[7](null);
    			destroy_component(alert, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(spinner, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(section);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(main);
    			destroy_component(home);
    			destroy_component(cashier);
    			destroy_component(cashout);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function format$2(value) {
    	let input = (value || 0).toString().replace(/[^0-9\.-]/g, "");
    	let number = Number.parseFloat(input) || 0;
    	let currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(number);
    	return { value: number, currency };
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $balance;
    	let $displayMode;
    	validate_store(balance, "balance");
    	component_subscribe($$self, balance, $$value => $$invalidate(3, $balance = $$value));
    	validate_store(displayMode, "displayMode");
    	component_subscribe($$self, displayMode, $$value => $$invalidate(4, $displayMode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	
    	
    	let alertDialog;
    	let defaultHandle = "Cryptofights";
    	let geo = "unavailable";
    	let menuState = "";
    	let lastRoute = "";

    	onMount(() => __awaiter(void 0, void 0, void 0, function* () {
    		ApiService.getGps().then(gps => $$invalidate(1, geo = JSON.stringify(gps, null, 4)));
    		displayMode.set("menuMode");
    		loading.set(true);
    		loggedIn.set(false);
    		currentUser.set(defaultHandle);
    		const ws = get_store_value(walletService);

    		try {
    			yield ws.init();
    		} catch(err) {
    			console.log(err);
    		}

    		loading.set(false);
    		loggedIn.set(ws.authenticated);

    		if (ws.authenticated) {
    			currentUser.set(ws.handle || defaultHandle);
    			balance.set(yield ws.getBalance());
    			balance.set(20);
    		} else {
    			currentUser.set(defaultHandle);
    		}

    		console.log(`WUI:Authenticated: ${ws.handle} as ${ws.authenticated}`);
    	}));

    	const toggleMenu = e => {
    		let currentRoute = get_store_value(route);

    		if (currentRoute === "menu") {
    			if (lastRoute === "/") lastRoute = "";
    			route.set(lastRoute || "home");
    		} else {
    			lastRoute = currentRoute;
    			route.set("menu");
    		}
    	};

    	const reserveSize = displayMode => {
    		const ws = get_store_value(walletService);

    		if (displayMode === "menuMode") {
    			ws.blockInput(0, 0, 100, 100);
    		} else {
    			ws.blockInput(0, 0, window.innerWidth, window.innerHeight);
    		}
    	};

    	walletService.subscribe(value => {
    		value.on("show", data => {
    			if (data.message) {
    				let dialog = data.message;
    				console.log(dialog.body);

    				alertDialog.show({
    					body: dialog.body,
    					dismissable: false,
    					duration: 5000,
    					type: dialog.theme === "success" ? "ok" : "warn"
    				});
    			}

    			route.set(data.viewName);
    		});
    	});

    	displayMode.subscribe(value => {
    		$$invalidate(2, menuState = value === "menuMode" ? "" : "open");
    		reserveSize(value);
    	});

    	route.subscribe(r => {
    		if (r === "menu") {
    			displayMode.set("menuMode");
    		} else {
    			console.log(lastRoute);
    			lastRoute = r;
    		}
    	});

    	const onDialog = event => {
    		alertDialog.show(event.detail);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function alert_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			alertDialog = $$value;
    			$$invalidate(0, alertDialog);
    		});
    	}

    	$$self.$capture_state = () => ({
    		__awaiter,
    		onMount,
    		get: get_store_value,
    		walletService,
    		currentUser,
    		loggedIn,
    		loading,
    		route,
    		displayMode,
    		balance,
    		ApiService,
    		Alert,
    		Spinner,
    		Home,
    		Cashier,
    		Cashout,
    		alertDialog,
    		defaultHandle,
    		geo,
    		menuState,
    		lastRoute,
    		toggleMenu,
    		reserveSize,
    		format: format$2,
    		onDialog,
    		$balance,
    		$displayMode
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("alertDialog" in $$props) $$invalidate(0, alertDialog = $$props.alertDialog);
    		if ("defaultHandle" in $$props) defaultHandle = $$props.defaultHandle;
    		if ("geo" in $$props) $$invalidate(1, geo = $$props.geo);
    		if ("menuState" in $$props) $$invalidate(2, menuState = $$props.menuState);
    		if ("lastRoute" in $$props) lastRoute = $$props.lastRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		alertDialog,
    		geo,
    		menuState,
    		$balance,
    		$displayMode,
    		toggleMenu,
    		onDialog,
    		alert_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    const app = new App({
        target: document.body
    });

    return app;

}(bsvjs));
//# sourceMappingURL=bundle.js.map
