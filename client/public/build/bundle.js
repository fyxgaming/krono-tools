
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
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
            const resp = await fetch(`${this.apiUrl}/api/accounts/${handle}@${this.domain}`, {
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
            const resp = await fetch(`${this.apiUrl}/api/accounts/${encodeURIComponent(paymail)}/recover`, {
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
            this.overrideConsole();
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
                    const resp = await fetch(config.errorLog, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(logs)
                    });
                    if (!resp.ok)
                        throw new Error(`${resp.status} - ${resp.statusText}`);
                }, 5000);
            }
            // this.emit('show', 'login');
            // console.log('SHOW LOGIN');
            if (this.agentDef.anonymous)
                return this.initializeWallet();
            if (!config.ephemeral && !this.keyPair)
                return this.clientEmit('NO_KEYS');
            try {
                await this.initializeUser();
            }
            catch (e) {
                console.error('Login Error:', e.message);
                this.clientEmit('NO_KEYS');
            }
        }
        async initializeWallet(owner, purse) {
            const cache = new Run.LocalCache({ maxSizeMB: 100 });
            const blockchain = new restBlockchain.RestBlockchain(fetch.bind(window), this.apiUrl, this.config.network, cache);
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
            this.initializeWallet(bip32.derive('m/1/0').privKey.toString(), bip32.derive('m/0/0').privKey.toString());
        }
        async login(handle, password) {
            this.keyPair = await this.auth.login(handle, password);
            await this.initializeUser(handle);
        }
        async register(handle, password, email) {
            this.keyPair = await this.auth.register(handle, password, email);
            await this.initializeUser(handle);
        }
        async logout() {
            window.localStorage.removeItem('WIF');
            window.localStorage.removeItem('HANDLE');
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
                if (e.message.includes('Not enough funds')) {
                    response.statusCode = 402;
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
                this.channel.parent.postMessage(message, this.channelScope);
            }
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
                if (this.config.emitLogs)
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
                if (this.config.emitLogs)
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

    /* src/components/Login.svelte generated by Svelte v3.29.0 */

    const { console: console_1 } = globals;
    const file = "src/components/Login.svelte";

    // (72:0) {:else}
    function create_else_block(ctx) {
    	let section0;
    	let h20;
    	let t1;
    	let form0;
    	let div0;
    	let label0;
    	let span0;
    	let t3;
    	let span1;
    	let t5;
    	let input0;
    	let t6;
    	let div1;
    	let label1;
    	let span2;
    	let t8;
    	let span3;
    	let t10;
    	let input1;
    	let t11;
    	let div2;
    	let label2;
    	let span4;
    	let t13;
    	let span5;
    	let t14;
    	let input2;
    	let t15;
    	let div3;
    	let button0;
    	let t17;
    	let p0;
    	let a0;
    	let section0_hidden_value;
    	let t19;
    	let section1;
    	let h21;
    	let t21;
    	let form1;
    	let div4;
    	let label3;
    	let span6;
    	let t23;
    	let span7;
    	let t25;
    	let input3;
    	let t26;
    	let div5;
    	let label4;
    	let span8;
    	let t28;
    	let span9;
    	let t30;
    	let input4;
    	let t31;
    	let div6;
    	let button1;
    	let t33;
    	let p1;
    	let a1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section0 = element("section");
    			h20 = element("h2");
    			h20.textContent = "Register";
    			t1 = space();
    			form0 = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			span0 = element("span");
    			span0.textContent = "Gamer Handle";
    			t3 = space();
    			span1 = element("span");
    			span1.textContent = "Must contain 4+ characters.";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			div1 = element("div");
    			label1 = element("label");
    			span2 = element("span");
    			span2.textContent = "Password";
    			t8 = space();
    			span3 = element("span");
    			span3.textContent = "Must contain 8+ characters with at\n                        least 1 number and 1 uppercase letter.";
    			t10 = space();
    			input1 = element("input");
    			t11 = space();
    			div2 = element("div");
    			label2 = element("label");
    			span4 = element("span");
    			span4.textContent = "Email";
    			t13 = space();
    			span5 = element("span");
    			t14 = space();
    			input2 = element("input");
    			t15 = space();
    			div3 = element("div");
    			button0 = element("button");
    			button0.textContent = "Register";
    			t17 = space();
    			p0 = element("p");
    			a0 = element("a");
    			a0.textContent = "Login";
    			t19 = space();
    			section1 = element("section");
    			h21 = element("h2");
    			h21.textContent = "Login";
    			t21 = space();
    			form1 = element("form");
    			div4 = element("div");
    			label3 = element("label");
    			span6 = element("span");
    			span6.textContent = "Gamer Handle";
    			t23 = space();
    			span7 = element("span");
    			span7.textContent = "Must contain 4+ characters.";
    			t25 = space();
    			input3 = element("input");
    			t26 = space();
    			div5 = element("div");
    			label4 = element("label");
    			span8 = element("span");
    			span8.textContent = "Password";
    			t28 = space();
    			span9 = element("span");
    			span9.textContent = "Must contain 8+ characters with at\n                        least 1 number and 1 uppercase letter.";
    			t30 = space();
    			input4 = element("input");
    			t31 = space();
    			div6 = element("div");
    			button1 = element("button");
    			button1.textContent = "Login";
    			t33 = space();
    			p1 = element("p");
    			a1 = element("a");
    			a1.textContent = "Register";
    			add_location(h20, file, 73, 8, 2245);
    			attr_dev(span0, "class", "field-label svelte-1b5hwl4");
    			add_location(span0, file, 77, 20, 2404);
    			attr_dev(span1, "class", "field-hint svelte-1b5hwl4");
    			add_location(span1, file, 78, 20, 2470);
    			attr_dev(label0, "for", "rhandle");
    			add_location(label0, file, 76, 16, 2362);
    			attr_dev(input0, "id", "rhandle");
    			attr_dev(input0, "class", "field-cntrl svelte-1b5hwl4");
    			attr_dev(input0, "placeholder", "enter your gamer handle");
    			add_location(input0, file, 80, 16, 2571);
    			attr_dev(div0, "class", "field svelte-1b5hwl4");
    			add_location(div0, file, 75, 12, 2326);
    			attr_dev(span2, "class", "field-label svelte-1b5hwl4");
    			add_location(span2, file, 89, 20, 2864);
    			attr_dev(span3, "class", "field-hint svelte-1b5hwl4");
    			add_location(span3, file, 90, 20, 2926);
    			attr_dev(label1, "for", "rpassword");
    			add_location(label1, file, 88, 16, 2820);
    			attr_dev(input1, "id", "rpassword");
    			attr_dev(input1, "class", "field svelte-1b5hwl4");
    			attr_dev(input1, "placeholder", "enter your password");
    			attr_dev(input1, "type", "password");
    			add_location(input1, file, 93, 16, 3097);
    			attr_dev(div1, "class", "field svelte-1b5hwl4");
    			add_location(div1, file, 87, 12, 2784);
    			attr_dev(span4, "class", "field-label svelte-1b5hwl4");
    			add_location(span4, file, 103, 20, 3417);
    			attr_dev(span5, "class", "field-hint svelte-1b5hwl4");
    			add_location(span5, file, 104, 20, 3476);
    			attr_dev(label2, "for", "remail");
    			add_location(label2, file, 102, 16, 3376);
    			attr_dev(input2, "id", "remail");
    			attr_dev(input2, "class", "field svelte-1b5hwl4");
    			attr_dev(input2, "placeholder", "enter your email");
    			attr_dev(input2, "type", "email");
    			add_location(input2, file, 106, 16, 3545);
    			attr_dev(div2, "class", "field svelte-1b5hwl4");
    			add_location(div2, file, 101, 12, 3340);
    			attr_dev(button0, "class", "action svelte-1b5hwl4");
    			attr_dev(button0, "type", "submit");
    			add_location(button0, file, 115, 16, 3814);
    			attr_dev(div3, "class", "actions");
    			add_location(div3, file, 114, 12, 3776);
    			add_location(form0, file, 74, 8, 2271);
    			attr_dev(a0, "href", "/");
    			add_location(a0, file, 118, 11, 3915);
    			add_location(p0, file, 118, 8, 3912);
    			section0.hidden = section0_hidden_value = !/*showReg*/ ctx[1];
    			add_location(section0, file, 72, 4, 2209);
    			add_location(h21, file, 122, 8, 4046);
    			attr_dev(span6, "class", "field-label svelte-1b5hwl4");
    			add_location(span6, file, 126, 20, 4198);
    			attr_dev(span7, "class", "field-hint svelte-1b5hwl4");
    			add_location(span7, file, 127, 20, 4264);
    			attr_dev(label3, "for", "handle");
    			add_location(label3, file, 125, 16, 4157);
    			attr_dev(input3, "id", "handle");
    			attr_dev(input3, "class", "field-cntrl svelte-1b5hwl4");
    			attr_dev(input3, "placeholder", "enter your gamer handle");
    			add_location(input3, file, 129, 16, 4365);
    			attr_dev(div4, "class", "field svelte-1b5hwl4");
    			add_location(div4, file, 124, 12, 4121);
    			attr_dev(span8, "class", "field-label svelte-1b5hwl4");
    			add_location(span8, file, 138, 20, 4656);
    			attr_dev(span9, "class", "field-hint svelte-1b5hwl4");
    			add_location(span9, file, 139, 20, 4718);
    			attr_dev(label4, "for", "password");
    			add_location(label4, file, 137, 16, 4613);
    			attr_dev(input4, "id", "password");
    			attr_dev(input4, "class", "field svelte-1b5hwl4");
    			attr_dev(input4, "placeholder", "enter your password");
    			attr_dev(input4, "type", "password");
    			add_location(input4, file, 142, 16, 4889);
    			attr_dev(div5, "class", "field svelte-1b5hwl4");
    			add_location(div5, file, 136, 12, 4577);
    			attr_dev(button1, "class", "action svelte-1b5hwl4");
    			attr_dev(button1, "type", "submit");
    			add_location(button1, file, 151, 16, 5169);
    			attr_dev(div6, "class", "actions");
    			add_location(div6, file, 150, 12, 5131);
    			add_location(form1, file, 123, 8, 4069);
    			attr_dev(a1, "href", "/");
    			add_location(a1, file, 154, 11, 5267);
    			add_location(p1, file, 154, 8, 5264);
    			section1.hidden = /*showReg*/ ctx[1];
    			add_location(section1, file, 121, 4, 4011);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);
    			append_dev(section0, h20);
    			append_dev(section0, t1);
    			append_dev(section0, form0);
    			append_dev(form0, div0);
    			append_dev(div0, label0);
    			append_dev(label0, span0);
    			append_dev(label0, t3);
    			append_dev(label0, span1);
    			append_dev(div0, t5);
    			append_dev(div0, input0);
    			set_input_value(input0, /*handle*/ ctx[2]);
    			append_dev(form0, t6);
    			append_dev(form0, div1);
    			append_dev(div1, label1);
    			append_dev(label1, span2);
    			append_dev(label1, t8);
    			append_dev(label1, span3);
    			append_dev(div1, t10);
    			append_dev(div1, input1);
    			set_input_value(input1, /*password*/ ctx[3]);
    			append_dev(form0, t11);
    			append_dev(form0, div2);
    			append_dev(div2, label2);
    			append_dev(label2, span4);
    			append_dev(label2, t13);
    			append_dev(label2, span5);
    			append_dev(div2, t14);
    			append_dev(div2, input2);
    			set_input_value(input2, /*email*/ ctx[4]);
    			append_dev(form0, t15);
    			append_dev(form0, div3);
    			append_dev(div3, button0);
    			append_dev(section0, t17);
    			append_dev(section0, p0);
    			append_dev(p0, a0);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, h21);
    			append_dev(section1, t21);
    			append_dev(section1, form1);
    			append_dev(form1, div4);
    			append_dev(div4, label3);
    			append_dev(label3, span6);
    			append_dev(label3, t23);
    			append_dev(label3, span7);
    			append_dev(div4, t25);
    			append_dev(div4, input3);
    			set_input_value(input3, /*handle*/ ctx[2]);
    			append_dev(form1, t26);
    			append_dev(form1, div5);
    			append_dev(div5, label4);
    			append_dev(label4, span8);
    			append_dev(label4, t28);
    			append_dev(label4, span9);
    			append_dev(div5, t30);
    			append_dev(div5, input4);
    			set_input_value(input4, /*password*/ ctx[3]);
    			append_dev(form1, t31);
    			append_dev(form1, div6);
    			append_dev(div6, button1);
    			append_dev(section1, t33);
    			append_dev(section1, p1);
    			append_dev(p1, a1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[8]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[9]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[10]),
    					listen_dev(form0, "submit", prevent_default(/*register*/ ctx[5]), false, true, false),
    					listen_dev(a0, "click", prevent_default(/*click_handler*/ ctx[11]), false, true, false),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[12]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[13]),
    					listen_dev(form1, "submit", prevent_default(/*login*/ ctx[6]), false, true, false),
    					listen_dev(a1, "click", prevent_default(/*click_handler_1*/ ctx[14]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*handle*/ 4 && input0.value !== /*handle*/ ctx[2]) {
    				set_input_value(input0, /*handle*/ ctx[2]);
    			}

    			if (dirty & /*password*/ 8 && input1.value !== /*password*/ ctx[3]) {
    				set_input_value(input1, /*password*/ ctx[3]);
    			}

    			if (dirty & /*email*/ 16 && input2.value !== /*email*/ ctx[4]) {
    				set_input_value(input2, /*email*/ ctx[4]);
    			}

    			if (dirty & /*showReg*/ 2 && section0_hidden_value !== (section0_hidden_value = !/*showReg*/ ctx[1])) {
    				prop_dev(section0, "hidden", section0_hidden_value);
    			}

    			if (dirty & /*handle*/ 4 && input3.value !== /*handle*/ ctx[2]) {
    				set_input_value(input3, /*handle*/ ctx[2]);
    			}

    			if (dirty & /*password*/ 8 && input4.value !== /*password*/ ctx[3]) {
    				set_input_value(input4, /*password*/ ctx[3]);
    			}

    			if (dirty & /*showReg*/ 2) {
    				prop_dev(section1, "hidden", /*showReg*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(section1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(72:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (66:0) {#if loggedIn}
    function create_if_block(ctx) {
    	let section;
    	let div;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			button = element("button");
    			button.textContent = "Logout";
    			add_location(button, file, 68, 12, 2125);
    			attr_dev(div, "class", "actions");
    			add_location(div, file, 67, 8, 2091);
    			add_location(section, file, 66, 4, 2073);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*logout*/ ctx[7], false, false, false);
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
    		id: create_if_block.name,
    		type: "if",
    		source: "(66:0) {#if loggedIn}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*loggedIn*/ ctx[0]) return create_if_block;
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
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
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
    	let { loggedIn } = $$props;
    	let showReg = false;
    	let handle;
    	let password;
    	let email;

    	const onStatusChanged = () => {
    		dispatch("statusChanged", { loggedIn });
    	};

    	const register = () => __awaiter(void 0, void 0, void 0, function* () {
    		console.log("register");
    		yield window.walletService.register(handle, password, email);

    		// window.walletService.wallet.buildMessage();
    		// window.walletService.blockchain.se
    		$$invalidate(0, loggedIn = true);

    		onStatusChanged();
    	});

    	const login = () => __awaiter(void 0, void 0, void 0, function* () {
    		console.log("login");
    		yield window.walletService.login(handle, password);
    		$$invalidate(0, loggedIn = true);
    		onStatusChanged();
    	});

    	const logout = () => {
    		console.log("logout");
    		window.walletService.logout();
    		$$invalidate(0, loggedIn = false);
    		onStatusChanged();
    	};

    	const writable_props = ["loggedIn"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		handle = this.value;
    		$$invalidate(2, handle);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate(3, password);
    	}

    	function input2_input_handler() {
    		email = this.value;
    		$$invalidate(4, email);
    	}

    	const click_handler = () => $$invalidate(1, showReg = false);

    	function input3_input_handler() {
    		handle = this.value;
    		$$invalidate(2, handle);
    	}

    	function input4_input_handler() {
    		password = this.value;
    		$$invalidate(3, password);
    	}

    	const click_handler_1 = () => $$invalidate(1, showReg = true);

    	$$self.$$set = $$props => {
    		if ("loggedIn" in $$props) $$invalidate(0, loggedIn = $$props.loggedIn);
    	};

    	$$self.$capture_state = () => ({
    		__awaiter,
    		createEventDispatcher,
    		dispatch,
    		loggedIn,
    		showReg,
    		handle,
    		password,
    		email,
    		onStatusChanged,
    		register,
    		login,
    		logout
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("loggedIn" in $$props) $$invalidate(0, loggedIn = $$props.loggedIn);
    		if ("showReg" in $$props) $$invalidate(1, showReg = $$props.showReg);
    		if ("handle" in $$props) $$invalidate(2, handle = $$props.handle);
    		if ("password" in $$props) $$invalidate(3, password = $$props.password);
    		if ("email" in $$props) $$invalidate(4, email = $$props.email);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		loggedIn,
    		showReg,
    		handle,
    		password,
    		email,
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
    		init(this, options, instance, create_fragment, safe_not_equal, { loggedIn: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*loggedIn*/ ctx[0] === undefined && !("loggedIn" in props)) {
    			console_1.warn("<Login> was created without expected prop 'loggedIn'");
    		}
    	}

    	get loggedIn() {
    		throw new Error("<Login>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loggedIn(value) {
    		throw new Error("<Login>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Cashier.svelte generated by Svelte v3.29.0 */

    const file$1 = "src/components/Cashier.svelte";

    // (29:0) {#if isActive && webCasherSessionScript}
    function create_if_block$1(ctx) {
    	let h2;
    	let t1;
    	let section;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Cashier";
    			t1 = space();
    			section = element("section");
    			add_location(h2, file$1, 29, 4, 1395);
    			attr_dev(section, "id", "webcashier");
    			add_location(section, file$1, 30, 4, 1416);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, section, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(29:0) {#if isActive && webCasherSessionScript}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*isActive*/ ctx[0] && /*webCasherSessionScript*/ ctx[1] && create_if_block$1(ctx);

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
    			if (/*isActive*/ ctx[0] && /*webCasherSessionScript*/ ctx[1]) {
    				if (if_block) ; else {
    					if_block = create_if_block$1(ctx);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Cashier", slots, []);
    	
    	const win = window;

    	win.gidxServiceSettings = function () {
    		win.gidxContainer = "#webcashier";
    		win.gidxBuildTimer = false;
    		win.gidxBuildSteps = false;
    	};

    	let webCasherSessionScript;
    	let { isActive = false } = $$props;

    	const showCashier = () => {
    		$$invalidate(0, isActive = true);
    		let script = "%3cdiv+data-gidx-script-loading%3d%27true%27%3eLoading...%3c%2fdiv%3e%3cscript+src%3d%27https%3a%2f%2fws.gidx-service.in%2fv3.0%2fWebSession%2fCashier%3fsessionid%3d_7Iq_Ux-h0eQ64L5b-ZYmg%27+data-tsevo-script-tag+data-gidx-session-id%3d%27_7Iq_Ux-h0eQ64L5b-ZYmg%27+type%3d%27text%2fjavascript%27%3e%3c%2fscript%3e";
    		$$invalidate(1, webCasherSessionScript = unescape(decodeURI(script)).replace(/\+/g, " "));

    		setTimeout(
    			() => {
    				setInnerHTML(document.getElementById("webcashier"), webCasherSessionScript);
    			},
    			500
    		);
    	};

    	const setInnerHTML = function (elm, html) {
    		elm.innerHTML = html;

    		Array.from(elm.querySelectorAll("script")).forEach(oldScript => {
    			const newScript = document.createElement("script");
    			Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
    			newScript.appendChild(document.createTextNode(oldScript.innerHTML));
    			oldScript.parentNode.replaceChild(newScript, oldScript);
    		});
    	};

    	const writable_props = ["isActive"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cashier> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("isActive" in $$props) $$invalidate(0, isActive = $$props.isActive);
    	};

    	$$self.$capture_state = () => ({
    		win,
    		webCasherSessionScript,
    		isActive,
    		showCashier,
    		setInnerHTML
    	});

    	$$self.$inject_state = $$props => {
    		if ("webCasherSessionScript" in $$props) $$invalidate(1, webCasherSessionScript = $$props.webCasherSessionScript);
    		if ("isActive" in $$props) $$invalidate(0, isActive = $$props.isActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isActive, webCasherSessionScript, showCashier];
    }

    class Cashier extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { isActive: 0, showCashier: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cashier",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get isActive() {
    		throw new Error("<Cashier>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isActive(value) {
    		throw new Error("<Cashier>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showCashier() {
    		return this.$$.ctx[2];
    	}

    	set showCashier(value) {
    		throw new Error("<Cashier>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.0 */

    const { console: console_1$1, window: window_1 } = globals;
    const file$2 = "src/App.svelte";

    // (39:1) {#if !cashierIsActive}
    function create_if_block_1(ctx) {
    	let login;
    	let t0;
    	let div;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	login = new Login({
    			props: { loggedIn: /*loggedIn*/ ctx[1] },
    			$$inline: true
    		});

    	login.$on("statusChanged:{changed}", /*statusChanged_changed_handler_1*/ ctx[8]);

    	const block = {
    		c: function create() {
    			create_component(login.$$.fragment);
    			t0 = space();
    			div = element("div");
    			button = element("button");
    			button.textContent = "Payment";
    			add_location(button, file$2, 41, 2, 1585);
    			div.hidden = /*loggedIn*/ ctx[1];
    			add_location(div, file$2, 40, 1, 1559);
    		},
    		m: function mount(target, anchor) {
    			mount_component(login, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*addFunds*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const login_changes = {};
    			if (dirty & /*loggedIn*/ 2) login_changes.loggedIn = /*loggedIn*/ ctx[1];
    			login.$set(login_changes);

    			if (!current || dirty & /*loggedIn*/ 2) {
    				prop_dev(div, "hidden", /*loggedIn*/ ctx[1]);
    			}
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
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(39:1) {#if !cashierIsActive}",
    		ctx
    	});

    	return block;
    }

    // (45:1) {#if showCashier}
    function create_if_block$2(ctx) {
    	let cashier_1;
    	let updating_isActive;
    	let current;

    	function cashier_1_isActive_binding(value) {
    		/*cashier_1_isActive_binding*/ ctx[10].call(null, value);
    	}

    	let cashier_1_props = {};

    	if (/*cashierIsActive*/ ctx[3] !== void 0) {
    		cashier_1_props.isActive = /*cashierIsActive*/ ctx[3];
    	}

    	cashier_1 = new Cashier({ props: cashier_1_props, $$inline: true });
    	/*cashier_1_binding*/ ctx[9](cashier_1);
    	binding_callbacks.push(() => bind(cashier_1, "isActive", cashier_1_isActive_binding));

    	const block = {
    		c: function create() {
    			create_component(cashier_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cashier_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const cashier_1_changes = {};

    			if (!updating_isActive && dirty & /*cashierIsActive*/ 8) {
    				updating_isActive = true;
    				cashier_1_changes.isActive = /*cashierIsActive*/ ctx[3];
    				add_flush_callback(() => updating_isActive = false);
    			}

    			cashier_1.$set(cashier_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cashier_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cashier_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*cashier_1_binding*/ ctx[9](null);
    			destroy_component(cashier_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(45:1) {#if showCashier}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let h1;
    	let t0;
    	let t1;
    	let login;
    	let t2;
    	let t3;
    	let current;
    	let mounted;
    	let dispose;

    	login = new Login({
    			props: { loggedIn: /*loggedIn*/ ctx[1] },
    			$$inline: true
    		});

    	login.$on("statusChanged:{changed}", /*statusChanged_changed_handler*/ ctx[7]);
    	let if_block0 = !/*cashierIsActive*/ ctx[3] && create_if_block_1(ctx);
    	let if_block1 = /*showCashier*/ ctx[2] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			create_component(login.$$.fragment);
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(h1, "class", "svelte-1ykrvfv");
    			add_location(h1, file$2, 34, 1, 1418);
    			attr_dev(main, "class", "svelte-1ykrvfv");
    			add_location(main, file$2, 33, 0, 1410);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(h1, t0);
    			append_dev(main, t1);
    			mount_component(login, main, null);
    			append_dev(main, t2);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t3);
    			if (if_block1) if_block1.m(main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1, "load", /*onWindowLoad*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);
    			const login_changes = {};
    			if (dirty & /*loggedIn*/ 2) login_changes.loggedIn = /*loggedIn*/ ctx[1];
    			login.$set(login_changes);

    			if (!/*cashierIsActive*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*cashierIsActive*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main, t3);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*showCashier*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*showCashier*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, null);
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
    			transition_in(login.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(login.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(login);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
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

    	const onWindowLoad = event => __awaiter(void 0, void 0, void 0, function* () {
    		window.walletService = new WalletService();
    		yield window.walletService.init();
    		$$invalidate(1, loggedIn = window.walletService.authenticated);
    	});

    	let { name } = $$props;
    	let loggedIn;

    	const changed = event => {
    		console.log("changed", event.detail);
    	};

    	let showCashier;
    	let cashierIsActive;
    	let cashier;

    	const addFunds = event => {
    		$$invalidate(2, showCashier = true);
    		cashier.showCashier();
    	};

    	const writable_props = ["name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function statusChanged_changed_handler(event) {
    		bubble($$self, event);
    	}

    	function statusChanged_changed_handler_1(event) {
    		bubble($$self, event);
    	}

    	function cashier_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			cashier = $$value;
    			$$invalidate(4, cashier);
    		});
    	}

    	function cashier_1_isActive_binding(value) {
    		cashierIsActive = value;
    		$$invalidate(3, cashierIsActive);
    	}

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		__awaiter,
    		WalletService,
    		onWindowLoad,
    		name,
    		Login,
    		loggedIn,
    		changed,
    		Cashier,
    		showCashier,
    		cashierIsActive,
    		cashier,
    		addFunds
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("loggedIn" in $$props) $$invalidate(1, loggedIn = $$props.loggedIn);
    		if ("showCashier" in $$props) $$invalidate(2, showCashier = $$props.showCashier);
    		if ("cashierIsActive" in $$props) $$invalidate(3, cashierIsActive = $$props.cashierIsActive);
    		if ("cashier" in $$props) $$invalidate(4, cashier = $$props.cashier);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		name,
    		loggedIn,
    		showCashier,
    		cashierIsActive,
    		cashier,
    		onWindowLoad,
    		addFunds,
    		statusChanged_changed_handler,
    		statusChanged_changed_handler_1,
    		cashier_1_binding,
    		cashier_1_isActive_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console_1$1.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: 'Cryptofights'
        }
    });

    return app;

}(bsvjs));
//# sourceMappingURL=bundle.js.map
