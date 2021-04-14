
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
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
            throw new Error('Function called outside component initialization');
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
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
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
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
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
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

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
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
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
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
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

    function routeInfo(hash) {
      const path = hash.substr(2);
      const mcomp = path.match(/^component\/(.*)$/);
      const msettings = path.match(/^settings$/);
      return {
        component_id:       mcomp ? `component-${mcomp[1]}` : null,
        component_selector: mcomp ? `#component-${mcomp[1]}` : null,
        component_path:     mcomp ? mcomp[1] : null,
        settings:           !!msettings,
        root:               path == '',
      }
    }

    // Take a callback. The callback is given as argument the routeInfo and should
    // return a list of elements that are target for the current route or none if
    // there is no target.
    function routeDeclare(cb) {
      let previousTargets = [];

      function onHashChange(){
        if(previousTargets) for(let t of previousTargets) if(t) {
          console.log('route away', t);
          t.classList.remove('target');
        }
        previousTargets = cb(routeInfo(window.location.hash));
        if(previousTargets) for(let t of previousTargets) if(t) {
          t.classList.add('target');
          console.log('route to', t);
        }
      }

      window.addEventListener("hashchange", onHashChange, false);
      window.addEventListener("load", onHashChange, false);
      return onHashChange;
    }

    function cleanObject(src){
      return Object.keys(src)
        .filter(k => (src[k] !== null && src[k] !== undefined))
        .reduce((m, k) => (m[k] = src[k], m), {})
    }

    function pipeline(data, ...operations){
      let res = data;
      for(let i = 0; i < operations.length; i++) {
        res = operations[i](res);
      }
      return res
    }

    function nextId(list) {
      return list.reduce((id, item) => Math.max(id, item.id+1), list.length)
    }

    function reduceToObject(id, idval) {
      return (obj, item) => {
        if(!obj) obj = {};
        obj[item[id || 0]] = (id == null || idval) ? item[idval || 1] : item;
        return obj
      }
    }

    /* src/controls/InputNumber.svelte generated by Svelte v3.31.2 */

    const file = "src/controls/InputNumber.svelte";

    function create_fragment(ctx) {
    	let input;
    	let input_placeholder_value;
    	let input_min_value;
    	let input_max_value;
    	let input_step_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_style(input, "width", /*size*/ ctx[1] + 1 + "em");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "placeholder", input_placeholder_value = /*ui*/ ctx[2].placeholder);
    			attr_dev(input, "min", input_min_value = /*ui*/ ctx[2].min);
    			attr_dev(input, "max", input_max_value = /*ui*/ ctx[2].max);
    			attr_dev(input, "step", input_step_value = /*ui*/ ctx[2].step);
    			add_location(input, file, 22, 0, 394);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*size*/ 2) {
    				set_style(input, "width", /*size*/ ctx[1] + 1 + "em");
    			}

    			if (dirty & /*ui*/ 4 && input_placeholder_value !== (input_placeholder_value = /*ui*/ ctx[2].placeholder)) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*ui*/ 4 && input_min_value !== (input_min_value = /*ui*/ ctx[2].min)) {
    				attr_dev(input, "min", input_min_value);
    			}

    			if (dirty & /*ui*/ 4 && input_max_value !== (input_max_value = /*ui*/ ctx[2].max)) {
    				attr_dev(input, "max", input_max_value);
    			}

    			if (dirty & /*ui*/ 4 && input_step_value !== (input_step_value = /*ui*/ ctx[2].step)) {
    				attr_dev(input, "step", input_step_value);
    			}

    			if (dirty & /*value*/ 1 && to_number(input.value) !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
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
    	let ui;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InputNumber", slots, []);
    	let { value = null } = $$props;
    	let { def = null } = $$props;
    	let { force = false } = $$props;
    	let { min = null } = $$props;
    	let { max = null } = $$props;
    	let { step = null } = $$props;
    	let { size = 5 } = $$props;
    	const writable_props = ["value", "def", "force", "min", "max", "step", "size"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InputNumber> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = to_number(this.value);
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("def" in $$props) $$invalidate(3, def = $$props.def);
    		if ("force" in $$props) $$invalidate(4, force = $$props.force);
    		if ("min" in $$props) $$invalidate(5, min = $$props.min);
    		if ("max" in $$props) $$invalidate(6, max = $$props.max);
    		if ("step" in $$props) $$invalidate(7, step = $$props.step);
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    	};

    	$$self.$capture_state = () => ({
    		value,
    		def,
    		force,
    		min,
    		max,
    		step,
    		size,
    		ui
    	});

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("def" in $$props) $$invalidate(3, def = $$props.def);
    		if ("force" in $$props) $$invalidate(4, force = $$props.force);
    		if ("min" in $$props) $$invalidate(5, min = $$props.min);
    		if ("max" in $$props) $$invalidate(6, max = $$props.max);
    		if ("step" in $$props) $$invalidate(7, step = $$props.step);
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    		if ("ui" in $$props) $$invalidate(2, ui = $$props.ui);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*def, force, min, max, step*/ 248) {
    			 $$invalidate(2, ui = {
    				placeholder: def,
    				min: force ? def : min,
    				max: force ? def : max,
    				step: step || "any"
    			});
    		}
    	};

    	return [value, size, ui, def, force, min, max, step, input_input_handler];
    }

    class InputNumber extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			value: 0,
    			def: 3,
    			force: 4,
    			min: 5,
    			max: 6,
    			step: 7,
    			size: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputNumber",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get value() {
    		throw new Error("<InputNumber>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<InputNumber>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get def() {
    		throw new Error("<InputNumber>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set def(value) {
    		throw new Error("<InputNumber>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get force() {
    		throw new Error("<InputNumber>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set force(value) {
    		throw new Error("<InputNumber>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get min() {
    		throw new Error("<InputNumber>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set min(value) {
    		throw new Error("<InputNumber>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<InputNumber>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<InputNumber>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get step() {
    		throw new Error("<InputNumber>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set step(value) {
    		throw new Error("<InputNumber>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<InputNumber>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<InputNumber>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/controls/InputDurationMin.svelte generated by Svelte v3.31.2 */

    const file$1 = "src/controls/InputDurationMin.svelte";

    function create_fragment$1(ctx) {
    	let input;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t = text(" min");
    			set_style(input, "width", /*size*/ ctx[2] + 1 + "em");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "placeholder", /*def*/ ctx[1]);
    			attr_dev(input, "step", /*step*/ ctx[3]);
    			attr_dev(input, "title", /*title*/ ctx[4]);
    			add_location(input, file$1, 10, 0, 145);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);
    			insert_dev(target, t, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*size*/ 4) {
    				set_style(input, "width", /*size*/ ctx[2] + 1 + "em");
    			}

    			if (dirty & /*def*/ 2) {
    				attr_dev(input, "placeholder", /*def*/ ctx[1]);
    			}

    			if (dirty & /*step*/ 8) {
    				attr_dev(input, "step", /*step*/ ctx[3]);
    			}

    			if (dirty & /*title*/ 16) {
    				attr_dev(input, "title", /*title*/ ctx[4]);
    			}

    			if (dirty & /*value*/ 1 && to_number(input.value) !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t);
    			mounted = false;
    			dispose();
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
    	validate_slots("InputDurationMin", slots, []);
    	let { value = null } = $$props;
    	let { def = null } = $$props;
    	let { size = 5 } = $$props;
    	let { step = "any" } = $$props;
    	let { title = "" } = $$props;
    	const writable_props = ["value", "def", "size", "step", "title"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InputDurationMin> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = to_number(this.value);
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("def" in $$props) $$invalidate(1, def = $$props.def);
    		if ("size" in $$props) $$invalidate(2, size = $$props.size);
    		if ("step" in $$props) $$invalidate(3, step = $$props.step);
    		if ("title" in $$props) $$invalidate(4, title = $$props.title);
    	};

    	$$self.$capture_state = () => ({ value, def, size, step, title });

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("def" in $$props) $$invalidate(1, def = $$props.def);
    		if ("size" in $$props) $$invalidate(2, size = $$props.size);
    		if ("step" in $$props) $$invalidate(3, step = $$props.step);
    		if ("title" in $$props) $$invalidate(4, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, def, size, step, title, input_input_handler];
    }

    class InputDurationMin extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			value: 0,
    			def: 1,
    			size: 2,
    			step: 3,
    			title: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputDurationMin",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get value() {
    		throw new Error("<InputDurationMin>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<InputDurationMin>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get def() {
    		throw new Error("<InputDurationMin>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set def(value) {
    		throw new Error("<InputDurationMin>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<InputDurationMin>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<InputDurationMin>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get step() {
    		throw new Error("<InputDurationMin>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set step(value) {
    		throw new Error("<InputDurationMin>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<InputDurationMin>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<InputDurationMin>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/controls/InputCheckbox.svelte generated by Svelte v3.31.2 */

    const file$2 = "src/controls/InputCheckbox.svelte";

    function create_fragment$2(ctx) {
    	let input;
    	let input_checked_value;
    	let input_readonly_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "data-def", /*def*/ ctx[1]);
    			attr_dev(input, "data-force", /*force*/ ctx[2]);
    			attr_dev(input, "data-checked", /*checked*/ ctx[0]);

    			input.checked = input_checked_value = !/*checked*/ ctx[0] && /*checked*/ ctx[0] !== false
    			? /*def*/ ctx[1]
    			: /*checked*/ ctx[0];

    			input.readOnly = input_readonly_value = /*tristate*/ ctx[3]
    			? !/*checked*/ ctx[0] && /*checked*/ ctx[0] !== false
    			: /*force*/ ctx[2];

    			input.disabled = /*force*/ ctx[2];
    			add_location(input, file$2, 23, 0, 420);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*change*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*def*/ 2) {
    				attr_dev(input, "data-def", /*def*/ ctx[1]);
    			}

    			if (dirty & /*force*/ 4) {
    				attr_dev(input, "data-force", /*force*/ ctx[2]);
    			}

    			if (dirty & /*checked*/ 1) {
    				attr_dev(input, "data-checked", /*checked*/ ctx[0]);
    			}

    			if (dirty & /*checked, def*/ 3 && input_checked_value !== (input_checked_value = !/*checked*/ ctx[0] && /*checked*/ ctx[0] !== false
    			? /*def*/ ctx[1]
    			: /*checked*/ ctx[0])) {
    				prop_dev(input, "checked", input_checked_value);
    			}

    			if (dirty & /*tristate, checked, force*/ 13 && input_readonly_value !== (input_readonly_value = /*tristate*/ ctx[3]
    			? !/*checked*/ ctx[0] && /*checked*/ ctx[0] !== false
    			: /*force*/ ctx[2])) {
    				prop_dev(input, "readOnly", input_readonly_value);
    			}

    			if (dirty & /*force*/ 4) {
    				prop_dev(input, "disabled", /*force*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
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
    	validate_slots("InputCheckbox", slots, []);
    	let { checked = null } = $$props;
    	let { def = null } = $$props;
    	let { force = false } = $$props;
    	let { tristate = true } = $$props;

    	function change(e) {
    		let prev = !e.target.checked;
    		let curr = e.target.checked;

    		if (e.target.readOnly) {
    			$$invalidate(0, checked = curr);
    		} else if (prev == def && tristate && def !== null) {
    			$$invalidate(0, checked = null);
    			e.target.checked = prev;
    		} else {
    			$$invalidate(0, checked = curr);
    		}
    	}

    	const writable_props = ["checked", "def", "force", "tristate"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InputCheckbox> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("def" in $$props) $$invalidate(1, def = $$props.def);
    		if ("force" in $$props) $$invalidate(2, force = $$props.force);
    		if ("tristate" in $$props) $$invalidate(3, tristate = $$props.tristate);
    	};

    	$$self.$capture_state = () => ({ checked, def, force, tristate, change });

    	$$self.$inject_state = $$props => {
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("def" in $$props) $$invalidate(1, def = $$props.def);
    		if ("force" in $$props) $$invalidate(2, force = $$props.force);
    		if ("tristate" in $$props) $$invalidate(3, tristate = $$props.tristate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [checked, def, force, tristate, change];
    }

    class InputCheckbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			checked: 0,
    			def: 1,
    			force: 2,
    			tristate: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputCheckbox",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get checked() {
    		throw new Error("<InputCheckbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<InputCheckbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get def() {
    		throw new Error("<InputCheckbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set def(value) {
    		throw new Error("<InputCheckbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get force() {
    		throw new Error("<InputCheckbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set force(value) {
    		throw new Error("<InputCheckbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tristate() {
    		throw new Error("<InputCheckbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tristate(value) {
    		throw new Error("<InputCheckbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Settings.svelte generated by Svelte v3.31.2 */

    const { Object: Object_1, console: console_1 } = globals;
    const file$3 = "src/Settings.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	child_ctx[24] = list;
    	child_ctx[25] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	child_ctx[27] = list;
    	child_ctx[28] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	return child_ctx;
    }

    // (113:6) {#each componentNames as comp}
    function create_each_block_2(ctx) {
    	let th;
    	let t_value = /*comp*/ ctx[26] + "";
    	let t;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t = text(t_value);
    			add_location(th, file$3, 113, 8, 2972);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(113:6) {#each componentNames as comp}",
    		ctx
    	});

    	return block;
    }

    // (160:8) {#each componentNames as comp}
    function create_each_block_1(ctx) {
    	let td;
    	let label;
    	let inputcheckbox;
    	let updating_checked;
    	let t0;
    	let t1_value = /*comp*/ ctx[26].substr(0, 2) + "";
    	let t1;
    	let current;

    	function inputcheckbox_checked_binding(value) {
    		/*inputcheckbox_checked_binding*/ ctx[19].call(null, value, /*idx*/ ctx[25], /*comp*/ ctx[26]);
    	}

    	let inputcheckbox_props = { title: /*comp*/ ctx[26] };

    	if (/*ui*/ ctx[0].postes_estimations[/*idx*/ ctx[25]].components[/*comp*/ ctx[26]] !== void 0) {
    		inputcheckbox_props.checked = /*ui*/ ctx[0].postes_estimations[/*idx*/ ctx[25]].components[/*comp*/ ctx[26]];
    	}

    	inputcheckbox = new InputCheckbox({
    			props: inputcheckbox_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputcheckbox, "checked", inputcheckbox_checked_binding));

    	const block = {
    		c: function create() {
    			td = element("td");
    			label = element("label");
    			create_component(inputcheckbox.$$.fragment);
    			t0 = space();
    			t1 = text(t1_value);
    			attr_dev(label, "class", "svelte-x24czq");
    			add_location(label, file$3, 161, 12, 5850);
    			add_location(td, file$3, 160, 10, 5833);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, label);
    			mount_component(inputcheckbox, label, null);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const inputcheckbox_changes = {};

    			if (!updating_checked && dirty & /*ui, componentNames*/ 9) {
    				updating_checked = true;
    				inputcheckbox_changes.checked = /*ui*/ ctx[0].postes_estimations[/*idx*/ ctx[25]].components[/*comp*/ ctx[26]];
    				add_flush_callback(() => updating_checked = false);
    			}

    			inputcheckbox.$set(inputcheckbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputcheckbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputcheckbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			destroy_component(inputcheckbox);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(160:8) {#each componentNames as comp}",
    		ctx
    	});

    	return block;
    }

    // (117:4) {#each merged.postes_estimations as estim, idx}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*estim*/ ctx[23].name + "";
    	let t0;
    	let t1;
    	let t2;
    	let td1;
    	let inputdurationmin;
    	let updating_value;
    	let t3;
    	let td2;
    	let select;
    	let option0;
    	let optgroup0;
    	let option1;
    	let option2;
    	let t6;
    	let t7_value = /*availableComp*/ ctx[8](/*ui*/ ctx[0], /*idx*/ ctx[25]).join(", ") + "";
    	let t7;
    	let t8;
    	let option3;
    	let option4;
    	let optgroup1;
    	let option5;
    	let option6;
    	let option7;
    	let option8;
    	let option9;
    	let option10;
    	let option11;
    	let option12;
    	let option13;
    	let option14;
    	let option15;
    	let option16;
    	let option17;
    	let option18;
    	let option19;
    	let option20;
    	let optgroup2;
    	let option21;
    	let option22;
    	let option23;
    	let option24;
    	let t31;
    	let td3;
    	let button0;
    	let t33;
    	let button1;
    	let t35;
    	let current;
    	let mounted;
    	let dispose;

    	function inputdurationmin_value_binding(value) {
    		/*inputdurationmin_value_binding*/ ctx[15].call(null, value, /*idx*/ ctx[25]);
    	}

    	let inputdurationmin_props = {};

    	if (/*ui*/ ctx[0].postes_estimations[/*idx*/ ctx[25]].value !== void 0) {
    		inputdurationmin_props.value = /*ui*/ ctx[0].postes_estimations[/*idx*/ ctx[25]].value;
    	}

    	inputdurationmin = new InputDurationMin({
    			props: inputdurationmin_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputdurationmin, "value", inputdurationmin_value_binding));

    	function select_change_handler() {
    		/*select_change_handler*/ ctx[16].call(select, /*idx*/ ctx[25]);
    	}

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[17](/*idx*/ ctx[25], ...args);
    	}

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[18](/*idx*/ ctx[25], ...args);
    	}

    	let each_value_1 = /*componentNames*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = text(" :");
    			t2 = space();
    			td1 = element("td");
    			create_component(inputdurationmin.$$.fragment);
    			t3 = space();
    			td2 = element("td");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "(désactivé)";
    			optgroup0 = element("optgroup");
    			option1 = element("option");
    			option1.textContent = "une fois pour toutes";
    			option2 = element("option");
    			t6 = text("par élément (");
    			t7 = text(t7_value);
    			t8 = text(")");
    			option3 = element("option");
    			option3.textContent = "par ferrage de charnières";
    			option4 = element("option");
    			option4.textContent = "par tenon";
    			optgroup1 = element("optgroup");
    			option5 = element("option");
    			option5.textContent = "par m² de montants ou traverses à contre-profil";
    			option6 = element("option");
    			option6.textContent = "par m² de montants ou traverses (sauf contre-profil)";
    			option7 = element("option");
    			option7.textContent = "par m² de montants ou traverses (tous)";
    			option8 = element("option");
    			option8.textContent = "par m² de panneaux montés en rainure";
    			option9 = element("option");
    			option9.textContent = "par m² de panneaux libres";
    			option10 = element("option");
    			option10.textContent = "par m² de panneaux (tous)";
    			option11 = element("option");
    			option11.textContent = "par m² de côtés de tiroir";
    			option12 = element("option");
    			option12.textContent = "par m² (toutes pièces)";
    			option13 = element("option");
    			option13.textContent = "par nombre de montants ou traverses à contre-profil";
    			option14 = element("option");
    			option14.textContent = "par nombre de montants ou traverses (sauf contre-profil)";
    			option15 = element("option");
    			option15.textContent = "par nombre de montants ou traverses (tous)";
    			option16 = element("option");
    			option16.textContent = "par nombre de panneaux montés en rainure";
    			option17 = element("option");
    			option17.textContent = "par nombre de panneaux libres";
    			option18 = element("option");
    			option18.textContent = "par nombre de panneaux (tous)";
    			option19 = element("option");
    			option19.textContent = "par nombre de côtés de tiroir";
    			option20 = element("option");
    			option20.textContent = "par nombre total de pièces";
    			optgroup2 = element("optgroup");
    			option21 = element("option");
    			option21.textContent = "par m² de panneau (ep ⩽ 20)";
    			option22 = element("option");
    			option22.textContent = "par m² de pièces (ep > 20)";
    			option23 = element("option");
    			option23.textContent = "par panneau (ep ⩽ 20)";
    			option24 = element("option");
    			option24.textContent = "par nombre de pièces (ep > 20)";
    			t31 = space();
    			td3 = element("td");
    			button0 = element("button");
    			button0.textContent = "🗑";
    			t33 = space();
    			button1 = element("button");
    			button1.textContent = "✎";
    			t35 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(td0, file$3, 118, 8, 3083);
    			add_location(td1, file$3, 119, 8, 3115);
    			option0.__value = "";
    			option0.value = option0.__value;
    			add_location(option0, file$3, 122, 12, 3282);
    			option1.__value = "constant";
    			option1.value = option1.__value;
    			add_location(option1, file$3, 124, 14, 3382);
    			option2.__value = "per_component";
    			option2.value = option2.__value;
    			add_location(option2, file$3, 125, 14, 3451);
    			option3.__value = "per_ferrage_charniere";
    			option3.value = option3.__value;
    			add_location(option3, file$3, 126, 14, 3554);
    			option4.__value = "tenon";
    			option4.value = option4.__value;
    			add_location(option4, file$3, 127, 14, 3641);
    			attr_dev(optgroup0, "label", "par opération...");
    			add_location(optgroup0, file$3, 123, 12, 3332);
    			option5.__value = "m2_trav_mont_cp";
    			option5.value = option5.__value;
    			add_location(option5, file$3, 130, 14, 3772);
    			option6.__value = "m2_trav_mont_ncp";
    			option6.value = option6.__value;
    			add_location(option6, file$3, 131, 14, 3875);
    			option7.__value = "m2_trav_mont";
    			option7.value = option7.__value;
    			add_location(option7, file$3, 132, 14, 3984);
    			option8.__value = "m2_panneau";
    			option8.value = option8.__value;
    			add_location(option8, file$3, 133, 14, 4075);
    			option9.__value = "m2_panneau_seul";
    			option9.value = option9.__value;
    			add_location(option9, file$3, 134, 14, 4162);
    			option10.__value = "m2_panneau_tous";
    			option10.value = option10.__value;
    			add_location(option10, file$3, 135, 14, 4243);
    			option11.__value = "m2_cote";
    			option11.value = option11.__value;
    			add_location(option11, file$3, 136, 14, 4324);
    			option12.__value = "m2_plateau";
    			option12.value = option12.__value;
    			add_location(option12, file$3, 137, 14, 4397);
    			option13.__value = "nb_trav_mont_cp";
    			option13.value = option13.__value;
    			add_location(option13, file$3, 138, 14, 4470);
    			option14.__value = "nb_trav_mont_ncp";
    			option14.value = option14.__value;
    			add_location(option14, file$3, 139, 14, 4577);
    			option15.__value = "nb_trav_mont";
    			option15.value = option15.__value;
    			add_location(option15, file$3, 140, 14, 4690);
    			option16.__value = "nb_panneau";
    			option16.value = option16.__value;
    			add_location(option16, file$3, 141, 14, 4785);
    			option17.__value = "nb_panneau_seul";
    			option17.value = option17.__value;
    			add_location(option17, file$3, 142, 14, 4876);
    			option18.__value = "nb_panneau_tous";
    			option18.value = option18.__value;
    			add_location(option18, file$3, 143, 14, 4961);
    			option19.__value = "nb_cote";
    			option19.value = option19.__value;
    			add_location(option19, file$3, 144, 14, 5046);
    			option20.__value = "nb_plateau";
    			option20.value = option20.__value;
    			add_location(option20, file$3, 145, 14, 5123);
    			attr_dev(optgroup1, "label", "par type de pièce...");
    			add_location(optgroup1, file$3, 129, 12, 3718);
    			option21.__value = "m2_ep0_20";
    			option21.value = option21.__value;
    			add_location(option21, file$3, 148, 14, 5272);
    			option22.__value = "m2_ep20_plus";
    			option22.value = option22.__value;
    			add_location(option22, file$3, 149, 14, 5349);
    			option23.__value = "nb_ep0_20";
    			option23.value = option23.__value;
    			add_location(option23, file$3, 150, 14, 5431);
    			option24.__value = "nb_ep20_plus";
    			option24.value = option24.__value;
    			add_location(option24, file$3, 151, 14, 5502);
    			attr_dev(optgroup2, "label", "par épaisseur...");
    			add_location(optgroup2, file$3, 147, 12, 5222);
    			if (/*ui*/ ctx[0].postes_estimations[/*idx*/ ctx[25]].indice === void 0) add_render_callback(select_change_handler);
    			add_location(select, file$3, 121, 10, 3214);
    			add_location(td2, file$3, 120, 8, 3199);
    			add_location(button0, file$3, 156, 10, 5655);
    			add_location(button1, file$3, 157, 10, 5718);
    			add_location(td3, file$3, 155, 8, 5640);
    			add_location(tr, file$3, 117, 6, 3070);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(td0, t1);
    			append_dev(tr, t2);
    			append_dev(tr, td1);
    			mount_component(inputdurationmin, td1, null);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, select);
    			append_dev(select, option0);
    			append_dev(select, optgroup0);
    			append_dev(optgroup0, option1);
    			append_dev(optgroup0, option2);
    			append_dev(option2, t6);
    			append_dev(option2, t7);
    			append_dev(option2, t8);
    			append_dev(optgroup0, option3);
    			append_dev(optgroup0, option4);
    			append_dev(select, optgroup1);
    			append_dev(optgroup1, option5);
    			append_dev(optgroup1, option6);
    			append_dev(optgroup1, option7);
    			append_dev(optgroup1, option8);
    			append_dev(optgroup1, option9);
    			append_dev(optgroup1, option10);
    			append_dev(optgroup1, option11);
    			append_dev(optgroup1, option12);
    			append_dev(optgroup1, option13);
    			append_dev(optgroup1, option14);
    			append_dev(optgroup1, option15);
    			append_dev(optgroup1, option16);
    			append_dev(optgroup1, option17);
    			append_dev(optgroup1, option18);
    			append_dev(optgroup1, option19);
    			append_dev(optgroup1, option20);
    			append_dev(select, optgroup2);
    			append_dev(optgroup2, option21);
    			append_dev(optgroup2, option22);
    			append_dev(optgroup2, option23);
    			append_dev(optgroup2, option24);
    			select_option(select, /*ui*/ ctx[0].postes_estimations[/*idx*/ ctx[25]].indice);
    			append_dev(tr, t31);
    			append_dev(tr, td3);
    			append_dev(td3, button0);
    			append_dev(td3, t33);
    			append_dev(td3, button1);
    			append_dev(tr, t35);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", select_change_handler),
    					listen_dev(button0, "click", click_handler_1, false, false, false),
    					listen_dev(button1, "click", click_handler_2, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*merged*/ 2) && t0_value !== (t0_value = /*estim*/ ctx[23].name + "")) set_data_dev(t0, t0_value);
    			const inputdurationmin_changes = {};

    			if (!updating_value && dirty & /*ui*/ 1) {
    				updating_value = true;
    				inputdurationmin_changes.value = /*ui*/ ctx[0].postes_estimations[/*idx*/ ctx[25]].value;
    				add_flush_callback(() => updating_value = false);
    			}

    			inputdurationmin.$set(inputdurationmin_changes);
    			if ((!current || dirty & /*ui*/ 1) && t7_value !== (t7_value = /*availableComp*/ ctx[8](/*ui*/ ctx[0], /*idx*/ ctx[25]).join(", ") + "")) set_data_dev(t7, t7_value);

    			if (dirty & /*ui*/ 1) {
    				select_option(select, /*ui*/ ctx[0].postes_estimations[/*idx*/ ctx[25]].indice);
    			}

    			if (dirty & /*componentNames, ui*/ 9) {
    				each_value_1 = /*componentNames*/ ctx[3];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tr, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputdurationmin.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputdurationmin.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(inputdurationmin);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(117:4) {#each merged.postes_estimations as estim, idx}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let button0;
    	let t1;
    	let hr0;
    	let t2;
    	let label0;
    	let span0;
    	let inputnumber0;
    	let updating_value;
    	let t4;
    	let t5;
    	let label1;
    	let span1;
    	let inputnumber1;
    	let updating_value_1;
    	let t7;
    	let t8;
    	let h2;
    	let t10;
    	let table;
    	let tr;
    	let th0;
    	let t12;
    	let th1;
    	let t14;
    	let th2;
    	let t16;
    	let th3;
    	let t18;
    	let t19;
    	let t20;
    	let li;
    	let button1;
    	let t22;
    	let hr1;
    	let t23;
    	let button2;
    	let t25;
    	let button3;
    	let t27;
    	let details;
    	let summary;
    	let t29;
    	let pre;
    	let t30_value = JSON.stringify(/*merged*/ ctx[1], null, 2) + "";
    	let t30;
    	let current;
    	let mounted;
    	let dispose;

    	function inputnumber0_value_binding(value) {
    		/*inputnumber0_value_binding*/ ctx[13].call(null, value);
    	}

    	let inputnumber0_props = { def: /*def*/ ctx[4].cubeprice, min: "0" };

    	if (/*ui*/ ctx[0].cubeprice !== void 0) {
    		inputnumber0_props.value = /*ui*/ ctx[0].cubeprice;
    	}

    	inputnumber0 = new InputNumber({
    			props: inputnumber0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber0, "value", inputnumber0_value_binding));

    	function inputnumber1_value_binding(value) {
    		/*inputnumber1_value_binding*/ ctx[14].call(null, value);
    	}

    	let inputnumber1_props = { def: /*def*/ ctx[4].cubemargin, min: "0" };

    	if (/*ui*/ ctx[0].cubemargin !== void 0) {
    		inputnumber1_props.value = /*ui*/ ctx[0].cubemargin;
    	}

    	inputnumber1 = new InputNumber({
    			props: inputnumber1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber1, "value", inputnumber1_value_binding));
    	let each_value_2 = /*componentNames*/ ctx[3];
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value = /*merged*/ ctx[1].postes_estimations;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "Fermer";
    			t1 = space();
    			hr0 = element("hr");
    			t2 = space();
    			label0 = element("label");
    			span0 = element("span");
    			span0.textContent = "Prix du bois : ";
    			create_component(inputnumber0.$$.fragment);
    			t4 = text(" €");
    			t5 = space();
    			label1 = element("label");
    			span1 = element("span");
    			span1.textContent = "Marge de cubage : ";
    			create_component(inputnumber1.$$.fragment);
    			t7 = text(" %");
    			t8 = space();
    			h2 = element("h2");
    			h2.textContent = "Postes";
    			t10 = space();
    			table = element("table");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Nom";
    			t12 = space();
    			th1 = element("th");
    			th1.textContent = "Temps (min)";
    			t14 = space();
    			th2 = element("th");
    			th2.textContent = "Indice";
    			t16 = space();
    			th3 = element("th");
    			th3.textContent = " ";
    			t18 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t19 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t20 = space();
    			li = element("li");
    			button1 = element("button");
    			button1.textContent = "Ajouter un poste";
    			t22 = space();
    			hr1 = element("hr");
    			t23 = space();
    			button2 = element("button");
    			button2.textContent = "Fermer";
    			t25 = space();
    			button3 = element("button");
    			button3.textContent = "Ouvrir...";
    			t27 = space();
    			details = element("details");
    			summary = element("summary");
    			summary.textContent = "Contenu des préférences";
    			t29 = space();
    			pre = element("pre");
    			t30 = text(t30_value);
    			add_location(button0, file$3, 99, 2, 2473);
    			add_location(hr0, file$3, 100, 2, 2545);
    			add_location(span0, file$3, 102, 9, 2561);
    			add_location(label0, file$3, 102, 2, 2554);
    			add_location(span1, file$3, 103, 9, 2675);
    			add_location(label1, file$3, 103, 2, 2668);
    			add_location(h2, file$3, 105, 2, 2788);
    			add_location(th0, file$3, 108, 6, 2843);
    			add_location(th1, file$3, 109, 6, 2862);
    			add_location(th2, file$3, 110, 6, 2889);
    			add_location(th3, file$3, 111, 6, 2911);
    			add_location(tr, file$3, 107, 4, 2832);
    			add_location(button1, file$3, 169, 8, 6079);
    			add_location(li, file$3, 169, 4, 6075);
    			attr_dev(table, "class", "estim svelte-x24czq");
    			add_location(table, file$3, 106, 2, 2806);
    			add_location(hr1, file$3, 172, 2, 6159);
    			add_location(button2, file$3, 173, 2, 6167);
    			add_location(button3, file$3, 174, 2, 6239);
    			add_location(summary, file$3, 176, 4, 6298);
    			add_location(pre, file$3, 177, 4, 6345);
    			add_location(details, file$3, 175, 2, 6284);
    			attr_dev(div, "class", "routable");
    			add_location(div, file$3, 98, 0, 2423);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t1);
    			append_dev(div, hr0);
    			append_dev(div, t2);
    			append_dev(div, label0);
    			append_dev(label0, span0);
    			mount_component(inputnumber0, label0, null);
    			append_dev(label0, t4);
    			append_dev(div, t5);
    			append_dev(div, label1);
    			append_dev(label1, span1);
    			mount_component(inputnumber1, label1, null);
    			append_dev(label1, t7);
    			append_dev(div, t8);
    			append_dev(div, h2);
    			append_dev(div, t10);
    			append_dev(div, table);
    			append_dev(table, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t12);
    			append_dev(tr, th1);
    			append_dev(tr, t14);
    			append_dev(tr, th2);
    			append_dev(tr, t16);
    			append_dev(tr, th3);
    			append_dev(tr, t18);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr, null);
    			}

    			append_dev(table, t19);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			append_dev(table, t20);
    			append_dev(table, li);
    			append_dev(li, button1);
    			append_dev(div, t22);
    			append_dev(div, hr1);
    			append_dev(div, t23);
    			append_dev(div, button2);
    			append_dev(div, t25);
    			append_dev(div, button3);
    			append_dev(div, t27);
    			append_dev(div, details);
    			append_dev(details, summary);
    			append_dev(details, t29);
    			append_dev(details, pre);
    			append_dev(pre, t30);
    			/*div_binding*/ ctx[22](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[12], false, false, false),
    					listen_dev(button1, "click", /*click_handler_3*/ ctx[20], false, false, false),
    					listen_dev(button2, "click", /*click_handler_4*/ ctx[21], false, false, false),
    					listen_dev(button3, "click", /*open*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const inputnumber0_changes = {};

    			if (!updating_value && dirty & /*ui*/ 1) {
    				updating_value = true;
    				inputnumber0_changes.value = /*ui*/ ctx[0].cubeprice;
    				add_flush_callback(() => updating_value = false);
    			}

    			inputnumber0.$set(inputnumber0_changes);
    			const inputnumber1_changes = {};

    			if (!updating_value_1 && dirty & /*ui*/ 1) {
    				updating_value_1 = true;
    				inputnumber1_changes.value = /*ui*/ ctx[0].cubemargin;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			inputnumber1.$set(inputnumber1_changes);

    			if (dirty & /*componentNames*/ 8) {
    				each_value_2 = /*componentNames*/ ctx[3];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty & /*componentNames, ui, renameEstim, removeEstim, availableComp, merged*/ 459) {
    				each_value = /*merged*/ ctx[1].postes_estimations;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(table, t20);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if ((!current || dirty & /*merged*/ 2) && t30_value !== (t30_value = JSON.stringify(/*merged*/ ctx[1], null, 2) + "")) set_data_dev(t30, t30_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputnumber0.$$.fragment, local);
    			transition_in(inputnumber1.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputnumber0.$$.fragment, local);
    			transition_out(inputnumber1.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(inputnumber0);
    			destroy_component(inputnumber1);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			/*div_binding*/ ctx[22](null);
    			mounted = false;
    			run_all(dispose);
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

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Settings", slots, []);
    	let { settings } = $$props;
    	let { settings_opened = false } = $$props;
    	let componentNames = Object.keys(getContext("App-components"));

    	let def = {
    		cubeprice: 1440,
    		cubemargin: 135,
    		postes_estimations: []
    	};

    	let ui = {};

    	settings.subscribe(settings => {
    		$$invalidate(0, ui = settings);
    	});

    	let merged = {};
    	let root_element;

    	routeDeclare(route => {
    		$$invalidate(10, settings_opened = route.settings);
    		return route.settings ? [root_element] : [];
    	});

    	function addEstim() {
    		let estimName = prompt("Quel nom donner à l'estimation :");

    		if (estimName) $$invalidate(
    			0,
    			ui.postes_estimations = [
    				...ui.postes_estimations,
    				{
    					name: estimName,
    					value: 0,
    					indice: "constant",
    					components: componentNames.reduce((h, c) => (h[c] = true, h), {})
    				}
    			],
    			ui
    		);

    		console.log(ui.postes_estimations);
    	}

    	function removeEstim(idx) {
    		ui.postes_estimations.splice(idx, 1);
    		$$invalidate(0, ui);
    	}

    	function renameEstim(idx) {
    		let poste = ui.postes_estimations[idx];
    		let newName = prompt(`Renommer la phase "${poste.name}" en :`, poste.name);
    		if (!newName) return;
    		$$invalidate(0, ui.postes_estimations[idx].name = newName, ui);
    	}

    	function availableComp(ui, idx) {
    		return componentNames.filter(c => ui.postes_estimations[idx].components[c]);
    	}

    	function open() {
    		let input = document.createElement("input");
    		input.style.display = "none";
    		input.setAttribute("type", "file");

    		input.addEventListener(
    			"change",
    			e => {
    				let file = e.target.files[0];
    				if (!file) return;
    				let reader = new FileReader();

    				reader.onload = e => {
    					let data = JSON.parse(e.target.result);
    					if (data.settings) settings.set(data.settings);
    				};

    				reader.readAsText(file);
    			},
    			false
    		);

    		document.body.appendChild(input);
    		input.click();
    		document.body.removeChild(input);
    	}

    	const writable_props = ["settings", "settings_opened"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	const click_handler = e => window.location.hash = "#/";

    	function inputnumber0_value_binding(value) {
    		ui.cubeprice = value;
    		$$invalidate(0, ui);
    	}

    	function inputnumber1_value_binding(value) {
    		ui.cubemargin = value;
    		$$invalidate(0, ui);
    	}

    	function inputdurationmin_value_binding(value, idx) {
    		ui.postes_estimations[idx].value = value;
    		$$invalidate(0, ui);
    	}

    	function select_change_handler(idx) {
    		ui.postes_estimations[idx].indice = select_value(this);
    		$$invalidate(0, ui);
    	}

    	const click_handler_1 = (idx, e) => removeEstim(idx);
    	const click_handler_2 = (idx, e) => renameEstim(idx);

    	function inputcheckbox_checked_binding(value, idx, comp) {
    		ui.postes_estimations[idx].components[comp] = value;
    		$$invalidate(0, ui);
    	}

    	const click_handler_3 = e => addEstim();
    	const click_handler_4 = e => window.location.hash = "#/";

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			root_element = $$value;
    			$$invalidate(2, root_element);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("settings" in $$props) $$invalidate(11, settings = $$props.settings);
    		if ("settings_opened" in $$props) $$invalidate(10, settings_opened = $$props.settings_opened);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		get: get_store_value,
    		cleanObject,
    		reduceToObject,
    		routeDeclare,
    		InputNumber,
    		InputDurationMin,
    		InputCheckbox,
    		settings,
    		settings_opened,
    		componentNames,
    		def,
    		ui,
    		merged,
    		root_element,
    		addEstim,
    		removeEstim,
    		renameEstim,
    		availableComp,
    		open
    	});

    	$$self.$inject_state = $$props => {
    		if ("settings" in $$props) $$invalidate(11, settings = $$props.settings);
    		if ("settings_opened" in $$props) $$invalidate(10, settings_opened = $$props.settings_opened);
    		if ("componentNames" in $$props) $$invalidate(3, componentNames = $$props.componentNames);
    		if ("def" in $$props) $$invalidate(4, def = $$props.def);
    		if ("ui" in $$props) $$invalidate(0, ui = $$props.ui);
    		if ("merged" in $$props) $$invalidate(1, merged = $$props.merged);
    		if ("root_element" in $$props) $$invalidate(2, root_element = $$props.root_element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*ui*/ 1) {
    			 $$invalidate(0, ui = { postes_estimations: [], ...ui });
    		}

    		if ($$self.$$.dirty & /*ui*/ 1) {
    			 $$invalidate(1, merged = { ...def, ...cleanObject(ui) });
    		}

    		if ($$self.$$.dirty & /*settings, merged*/ 2050) {
    			 settings.set(merged);
    		}
    	};

    	return [
    		ui,
    		merged,
    		root_element,
    		componentNames,
    		def,
    		addEstim,
    		removeEstim,
    		renameEstim,
    		availableComp,
    		open,
    		settings_opened,
    		settings,
    		click_handler,
    		inputnumber0_value_binding,
    		inputnumber1_value_binding,
    		inputdurationmin_value_binding,
    		select_change_handler,
    		click_handler_1,
    		click_handler_2,
    		inputcheckbox_checked_binding,
    		click_handler_3,
    		click_handler_4,
    		div_binding
    	];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { settings: 11, settings_opened: 10 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*settings*/ ctx[11] === undefined && !("settings" in props)) {
    			console_1.warn("<Settings> was created without expected prop 'settings'");
    		}
    	}

    	get settings() {
    		throw new Error("<Settings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set settings(value) {
    		throw new Error("<Settings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get settings_opened() {
    		throw new Error("<Settings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set settings_opened(value) {
    		throw new Error("<Settings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/TreeItem.svelte generated by Svelte v3.31.2 */
    const file$4 = "src/TreeItem.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (25:0) {#if data.children}
    function create_if_block(ctx) {
    	let ul;
    	let current;
    	let each_value = /*data*/ ctx[0].children;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(ul, file$4, 25, 0, 566);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*path, data*/ 3) {
    				each_value = /*data*/ ctx[0].children;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(25:0) {#if data.children}",
    		ctx
    	});

    	return block;
    }

    // (28:2) {#if child.type}
    function create_if_block_1(ctx) {
    	let li;
    	let treeitem;
    	let t;
    	let current;

    	treeitem = new TreeItem({
    			props: {
    				path: "" + (/*path*/ ctx[1] + "-" + /*child*/ ctx[4].id),
    				data: /*child*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(treeitem.$$.fragment);
    			t = space();
    			add_location(li, file$4, 28, 2, 625);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(treeitem, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const treeitem_changes = {};
    			if (dirty & /*path, data*/ 3) treeitem_changes.path = "" + (/*path*/ ctx[1] + "-" + /*child*/ ctx[4].id);
    			if (dirty & /*data*/ 1) treeitem_changes.data = /*child*/ ctx[4];
    			treeitem.$set(treeitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(treeitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(treeitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(treeitem);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(28:2) {#if child.type}",
    		ctx
    	});

    	return block;
    }

    // (27:2) {#each data.children as child}
    function create_each_block$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*child*/ ctx[4].type && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*child*/ ctx[4].type) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*data*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(27:2) {#each data.children as child}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let a;
    	let t0_value = /*data*/ ctx[0].type + "";
    	let t0;
    	let t1;
    	let t2_value = /*data*/ ctx[0].name + "";
    	let t2;
    	let a_href_value;
    	let t3;
    	let if_block_anchor;
    	let current;
    	let if_block = /*data*/ ctx[0].children && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(a, "href", a_href_value = "#/component/" + /*path*/ ctx[1]);
    			attr_dev(a, "class", "svelte-99m9qk");
    			toggle_class(a, "selected", /*selected*/ ctx[2]);
    			add_location(a, file$4, 23, 0, 463);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			append_dev(a, t1);
    			append_dev(a, t2);
    			insert_dev(target, t3, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*data*/ 1) && t0_value !== (t0_value = /*data*/ ctx[0].type + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*data*/ 1) && t2_value !== (t2_value = /*data*/ ctx[0].name + "")) set_data_dev(t2, t2_value);

    			if (!current || dirty & /*path*/ 2 && a_href_value !== (a_href_value = "#/component/" + /*path*/ ctx[1])) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*selected*/ 4) {
    				toggle_class(a, "selected", /*selected*/ ctx[2]);
    			}

    			if (/*data*/ ctx[0].children) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*data*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
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
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t3);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TreeItem", slots, []);
    	let { data = {} } = $$props;
    	let { path = "0" } = $$props;
    	let selected = false;

    	function onHashChange() {
    		const route = routeInfo(window.location.hash);
    		$$invalidate(2, selected = route.component_selector === `#component-${path}`);
    	}

    	window.addEventListener("hashchange", onHashChange, false);
    	window.addEventListener("load", onHashChange, false);
    	const writable_props = ["data", "path"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TreeItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("path" in $$props) $$invalidate(1, path = $$props.path);
    	};

    	$$self.$capture_state = () => ({
    		routeInfo,
    		data,
    		path,
    		selected,
    		onHashChange
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("path" in $$props) $$invalidate(1, path = $$props.path);
    		if ("selected" in $$props) $$invalidate(2, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, path, selected];
    }

    class TreeItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { data: 0, path: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TreeItem",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get data() {
    		throw new Error("<TreeItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<TreeItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<TreeItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<TreeItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/TreeItemOption.svelte generated by Svelte v3.31.2 */
    const file$5 = "src/TreeItemOption.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (22:0) {#if data.children}
    function create_if_block$1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*data*/ ctx[0].children;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*path, data, prefix, indent*/ 15) {
    				each_value = /*data*/ ctx[0].children;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(22:0) {#if data.children}",
    		ctx
    	});

    	return block;
    }

    // (24:2) {#if child.type}
    function create_if_block_1$1(ctx) {
    	let treeitemoption;
    	let current;

    	treeitemoption = new TreeItemOption({
    			props: {
    				path: "" + (/*path*/ ctx[1] + "-" + /*child*/ ctx[6].id),
    				data: /*child*/ ctx[6],
    				prefix: /*prefix*/ ctx[2] + /*indent*/ ctx[3],
    				indent: /*indent*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(treeitemoption.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(treeitemoption, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const treeitemoption_changes = {};
    			if (dirty & /*path, data*/ 3) treeitemoption_changes.path = "" + (/*path*/ ctx[1] + "-" + /*child*/ ctx[6].id);
    			if (dirty & /*data*/ 1) treeitemoption_changes.data = /*child*/ ctx[6];
    			if (dirty & /*prefix, indent*/ 12) treeitemoption_changes.prefix = /*prefix*/ ctx[2] + /*indent*/ ctx[3];
    			if (dirty & /*indent*/ 8) treeitemoption_changes.indent = /*indent*/ ctx[3];
    			treeitemoption.$set(treeitemoption_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(treeitemoption.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(treeitemoption.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(treeitemoption, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(24:2) {#if child.type}",
    		ctx
    	});

    	return block;
    }

    // (23:2) {#each data.children as child}
    function create_each_block$2(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*child*/ ctx[6].type && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*child*/ ctx[6].type) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*data*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
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
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(23:2) {#each data.children as child}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let option;
    	let t0;
    	let t1_value = /*data*/ ctx[0].type + "";
    	let t1;
    	let t2;
    	let t3_value = /*data*/ ctx[0].name + "";
    	let t3;
    	let option_value_value;
    	let option_selected_value;
    	let t4;
    	let if_block_anchor;
    	let current;
    	let if_block = /*data*/ ctx[0].children && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(/*prefix*/ ctx[2]);
    			t1 = text(t1_value);
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			option.__value = option_value_value = "#/component/" + /*path*/ ctx[1];
    			option.value = option.__value;
    			option.selected = option_selected_value = /*selected*/ ctx[4] ? "selected" : "";
    			toggle_class(option, "selected", /*selected*/ ctx[4]);
    			add_location(option, file$5, 19, 0, 472);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    			append_dev(option, t2);
    			append_dev(option, t3);
    			insert_dev(target, t4, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*prefix*/ 4) set_data_dev(t0, /*prefix*/ ctx[2]);
    			if ((!current || dirty & /*data*/ 1) && t1_value !== (t1_value = /*data*/ ctx[0].type + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*data*/ 1) && t3_value !== (t3_value = /*data*/ ctx[0].name + "")) set_data_dev(t3, t3_value);

    			if (!current || dirty & /*path*/ 2 && option_value_value !== (option_value_value = "#/component/" + /*path*/ ctx[1])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}

    			if (!current || dirty & /*selected*/ 16 && option_selected_value !== (option_selected_value = /*selected*/ ctx[4] ? "selected" : "")) {
    				prop_dev(option, "selected", option_selected_value);
    			}

    			if (dirty & /*selected*/ 16) {
    				toggle_class(option, "selected", /*selected*/ ctx[4]);
    			}

    			if (/*data*/ ctx[0].children) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*data*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
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
    			if (detaching) detach_dev(option);
    			if (detaching) detach_dev(t4);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TreeItemOption", slots, []);
    	let { data = {} } = $$props;
    	let { path = "0" } = $$props;
    	let { prefix = "" } = $$props;
    	let { indent = " " } = $$props; // &emsp;
    	let selected = false;

    	function onHashChange() {
    		const route = routeInfo(window.location.hash);
    		$$invalidate(4, selected = route.component_selector === `#component-${path}`);
    	}

    	window.addEventListener("hashchange", onHashChange, false);
    	window.addEventListener("load", onHashChange, false);
    	const writable_props = ["data", "path", "prefix", "indent"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TreeItemOption> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("path" in $$props) $$invalidate(1, path = $$props.path);
    		if ("prefix" in $$props) $$invalidate(2, prefix = $$props.prefix);
    		if ("indent" in $$props) $$invalidate(3, indent = $$props.indent);
    	};

    	$$self.$capture_state = () => ({
    		routeInfo,
    		data,
    		path,
    		prefix,
    		indent,
    		selected,
    		onHashChange
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("path" in $$props) $$invalidate(1, path = $$props.path);
    		if ("prefix" in $$props) $$invalidate(2, prefix = $$props.prefix);
    		if ("indent" in $$props) $$invalidate(3, indent = $$props.indent);
    		if ("selected" in $$props) $$invalidate(4, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, path, prefix, indent, selected];
    }

    class TreeItemOption extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { data: 0, path: 1, prefix: 2, indent: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TreeItemOption",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get data() {
    		throw new Error("<TreeItemOption>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<TreeItemOption>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<TreeItemOption>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<TreeItemOption>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error("<TreeItemOption>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error("<TreeItemOption>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indent() {
    		throw new Error("<TreeItemOption>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indent(value) {
    		throw new Error("<TreeItemOption>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pieces/SVGPiece.svelte generated by Svelte v3.31.2 */

    const file$6 = "src/pieces/SVGPiece.svelte";

    function create_fragment$6(ctx) {
    	let polyline_1;
    	let polyline_1_data_name_value;

    	const block = {
    		c: function create() {
    			polyline_1 = svg_element("polyline");
    			attr_dev(polyline_1, "class", "outline");
    			attr_dev(polyline_1, "points", /*polyline*/ ctx[1]);
    			attr_dev(polyline_1, "fill", "none");
    			attr_dev(polyline_1, "stroke", "black");
    			attr_dev(polyline_1, "data-name", polyline_1_data_name_value = /*piece*/ ctx[0].name);
    			add_location(polyline_1, file$6, 17, 0, 289);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, polyline_1, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*polyline*/ 2) {
    				attr_dev(polyline_1, "points", /*polyline*/ ctx[1]);
    			}

    			if (dirty & /*piece*/ 1 && polyline_1_data_name_value !== (polyline_1_data_name_value = /*piece*/ ctx[0].name)) {
    				attr_dev(polyline_1, "data-name", polyline_1_data_name_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(polyline_1);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SVGPiece", slots, []);
    	let { piece } = $$props;
    	let { pos } = $$props;
    	let polyline;
    	const writable_props = ["piece", "pos"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SVGPiece> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("piece" in $$props) $$invalidate(0, piece = $$props.piece);
    		if ("pos" in $$props) $$invalidate(2, pos = $$props.pos);
    	};

    	$$self.$capture_state = () => ({ piece, pos, polyline });

    	$$self.$inject_state = $$props => {
    		if ("piece" in $$props) $$invalidate(0, piece = $$props.piece);
    		if ("pos" in $$props) $$invalidate(2, pos = $$props.pos);
    		if ("polyline" in $$props) $$invalidate(1, polyline = $$props.polyline);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*piece, pos*/ 5) {
    			 $$invalidate(1, polyline = piece.projection_polyline(pos).map(co => co.join(",")).join(" "));
    		}
    	};

    	return [piece, polyline, pos];
    }

    class SVGPiece extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { piece: 0, pos: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SVGPiece",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*piece*/ ctx[0] === undefined && !("piece" in props)) {
    			console.warn("<SVGPiece> was created without expected prop 'piece'");
    		}

    		if (/*pos*/ ctx[2] === undefined && !("pos" in props)) {
    			console.warn("<SVGPiece> was created without expected prop 'pos'");
    		}
    	}

    	get piece() {
    		throw new Error("<SVGPiece>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set piece(value) {
    		throw new Error("<SVGPiece>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pos() {
    		throw new Error("<SVGPiece>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pos(value) {
    		throw new Error("<SVGPiece>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pieces/SVGItem.svelte generated by Svelte v3.31.2 */

    const { console: console_1$1 } = globals;
    const file$7 = "src/pieces/SVGItem.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (16:0) {:else}
    function create_else_block(ctx) {
    	let t_value = console.warn("Unknown item.type for", /*item*/ ctx[0]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*item*/ 1 && t_value !== (t_value = console.warn("Unknown item.type for", /*item*/ ctx[0]) + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(16:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (10:32) 
    function create_if_block_1$2(ctx) {
    	let g;
    	let g_transform_value;
    	let g_data_name_value;
    	let current;
    	let each_value = /*item*/ ctx[0].pieces;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g, "transform", g_transform_value = "translate(" + /*item*/ ctx[0].projection_position(/*pos*/ ctx[1])[0] + ", " + /*item*/ ctx[0].projection_position(/*pos*/ ctx[1])[1] + ")");
    			attr_dev(g, "data-name", g_data_name_value = /*item*/ ctx[0].name);
    			add_location(g, file$7, 10, 2, 211);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*item, pos*/ 3) {
    				each_value = /*item*/ ctx[0].pieces;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(g, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*item, pos*/ 3 && g_transform_value !== (g_transform_value = "translate(" + /*item*/ ctx[0].projection_position(/*pos*/ ctx[1])[0] + ", " + /*item*/ ctx[0].projection_position(/*pos*/ ctx[1])[1] + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}

    			if (!current || dirty & /*item*/ 1 && g_data_name_value !== (g_data_name_value = /*item*/ ctx[0].name)) {
    				attr_dev(g, "data-name", g_data_name_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(10:32) ",
    		ctx
    	});

    	return block;
    }

    // (8:0) {#if item.type == 'Piece' }
    function create_if_block$2(ctx) {
    	let svgpiece;
    	let current;

    	svgpiece = new SVGPiece({
    			props: {
    				piece: /*item*/ ctx[0],
    				pos: /*pos*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(svgpiece.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(svgpiece, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const svgpiece_changes = {};
    			if (dirty & /*item*/ 1) svgpiece_changes.piece = /*item*/ ctx[0];
    			if (dirty & /*pos*/ 2) svgpiece_changes.pos = /*pos*/ ctx[1];
    			svgpiece.$set(svgpiece_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgpiece.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgpiece.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(svgpiece, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(8:0) {#if item.type == 'Piece' }",
    		ctx
    	});

    	return block;
    }

    // (12:2) {#each item.pieces as p}
    function create_each_block$3(ctx) {
    	let svgitem;
    	let current;

    	svgitem = new SVGItem({
    			props: { item: /*p*/ ctx[2], pos: /*pos*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(svgitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(svgitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const svgitem_changes = {};
    			if (dirty & /*item*/ 1) svgitem_changes.item = /*p*/ ctx[2];
    			if (dirty & /*pos*/ 2) svgitem_changes.pos = /*pos*/ ctx[1];
    			svgitem.$set(svgitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(svgitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(12:2) {#each item.pieces as p}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_if_block_1$2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[0].type == "Piece") return 0;
    		if (/*item*/ ctx[0].type == "Group") return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if_blocks[current_block_type_index].d(detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SVGItem", slots, []);
    	let { item } = $$props;
    	let { pos } = $$props;
    	const writable_props = ["item", "pos"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<SVGItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    		if ("pos" in $$props) $$invalidate(1, pos = $$props.pos);
    	};

    	$$self.$capture_state = () => ({ SVGPiece, item, pos });

    	$$self.$inject_state = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    		if ("pos" in $$props) $$invalidate(1, pos = $$props.pos);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [item, pos];
    }

    class SVGItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { item: 0, pos: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SVGItem",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*item*/ ctx[0] === undefined && !("item" in props)) {
    			console_1$1.warn("<SVGItem> was created without expected prop 'item'");
    		}

    		if (/*pos*/ ctx[1] === undefined && !("pos" in props)) {
    			console_1$1.warn("<SVGItem> was created without expected prop 'pos'");
    		}
    	}

    	get item() {
    		throw new Error("<SVGItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<SVGItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pos() {
    		throw new Error("<SVGItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pos(value) {
    		throw new Error("<SVGItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pieces/SVGDrawing.svelte generated by Svelte v3.31.2 */
    const file$8 = "src/pieces/SVGDrawing.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (51:0) {#if mode == '3d'}
    function create_if_block_1$3(ctx) {
    	let p;
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			a = element("a");
    			a.textContent = "2D";
    			attr_dev(a, "href", "javascript:void(0)");
    			add_location(a, file$8, 52, 2, 1226);
    			add_location(p, file$8, 51, 0, 1220);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, a);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(51:0) {#if mode == '3d'}",
    		ctx
    	});

    	return block;
    }

    // (58:0) {#if mode == '2d'}
    function create_if_block$3(ctx) {
    	let p;
    	let a0;
    	let br0;
    	let t1;
    	let input;
    	let t2;
    	let t3_value = /*zoom*/ ctx[0] * 100 + "";
    	let t3;
    	let t4;
    	let br1;
    	let t5;
    	let a1;
    	let t7;
    	let svg;
    	let g0;
    	let g0_transform_value;
    	let g1;
    	let g1_transform_value;
    	let g2;
    	let g2_transform_value;
    	let svg_data_count_value;
    	let svg_width_value;
    	let svg_height_value;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*pieces_list*/ ctx[2];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks_2[i], 1, 1, () => {
    		each_blocks_2[i] = null;
    	});

    	let each_value_1 = /*pieces_list*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const out_1 = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*pieces_list*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out_2 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			p = element("p");
    			a0 = element("a");
    			a0.textContent = "3D";
    			br0 = element("br");
    			t1 = text("\n  Zoom : ");
    			input = element("input");
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = text(" %\n  ");
    			br1 = element("br");
    			t5 = space();
    			a1 = element("a");
    			a1.textContent = "Enregistrer image";
    			t7 = space();
    			svg = svg_element("svg");
    			g0 = svg_element("g");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			g1 = svg_element("g");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			g2 = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(a0, "href", "javascript:void(0)");
    			add_location(a0, file$8, 59, 2, 1367);
    			add_location(br0, file$8, 59, 67, 1432);
    			attr_dev(input, "type", "range");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "max", "1");
    			attr_dev(input, "step", ".05");
    			add_location(input, file$8, 60, 9, 1447);
    			add_location(br1, file$8, 61, 2, 1520);
    			attr_dev(a1, "href", "javascript:void(0)");
    			add_location(a1, file$8, 62, 2, 1528);
    			add_location(p, file$8, 58, 0, 1361);
    			attr_dev(g0, "transform", g0_transform_value = "translate(5, " + (5 + /*zoom*/ ctx[0] * /*ymax*/ ctx[6]) + ") scale(" + /*zoom*/ ctx[0] + " " + /*zoom*/ ctx[0] + ")");
    			add_location(g0, file$8, 69, 2, 1768);
    			attr_dev(g1, "transform", g1_transform_value = "translate(" + (5 + /*zoom*/ ctx[0] * /*xmax*/ ctx[5] + 10) + ", " + (5 + /*zoom*/ ctx[0] * /*ymax*/ ctx[6]) + ") scale(" + /*zoom*/ ctx[0] + " " + /*zoom*/ ctx[0] + ")");
    			add_location(g1, file$8, 74, 2, 1929);
    			attr_dev(g2, "transform", g2_transform_value = "translate(5, " + (5 + /*zoom*/ ctx[0] * /*ymax*/ ctx[6] + 5) + ") scale(" + /*zoom*/ ctx[0] + " " + /*zoom*/ ctx[0] + ")");
    			add_location(g2, file$8, 79, 2, 2109);
    			attr_dev(svg, "data-count", svg_data_count_value = /*pieces_list*/ ctx[2].length);
    			attr_dev(svg, "width", svg_width_value = 5 + /*zoom*/ ctx[0] * /*xmax*/ ctx[5] + 5 + /*zoom*/ ctx[0] * /*zmax*/ ctx[7] + 5);
    			attr_dev(svg, "height", svg_height_value = 5 + /*zoom*/ ctx[0] * /*ymax*/ ctx[6] + 5 + /*zoom*/ ctx[0] * /*zmax*/ ctx[7] + 5);
    			add_location(svg, file$8, 64, 0, 1600);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, a0);
    			append_dev(p, br0);
    			append_dev(p, t1);
    			append_dev(p, input);
    			set_input_value(input, /*zoom*/ ctx[0]);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, br1);
    			append_dev(p, t5);
    			append_dev(p, a1);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(g0, null);
    			}

    			append_dev(svg, g1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(g1, null);
    			}

    			append_dev(svg, g2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g2, null);
    			}

    			/*svg_binding*/ ctx[14](svg);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler_1*/ ctx[12], false, false, false),
    					listen_dev(input, "change", /*input_change_input_handler*/ ctx[13]),
    					listen_dev(input, "input", /*input_change_input_handler*/ ctx[13]),
    					listen_dev(a1, "click", /*save*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*zoom*/ 1) {
    				set_input_value(input, /*zoom*/ ctx[0]);
    			}

    			if ((!current || dirty & /*zoom*/ 1) && t3_value !== (t3_value = /*zoom*/ ctx[0] * 100 + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*pieces_list*/ 4) {
    				each_value_2 = /*pieces_list*/ ctx[2];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    						transition_in(each_blocks_2[i], 1);
    					} else {
    						each_blocks_2[i] = create_each_block_2$1(child_ctx);
    						each_blocks_2[i].c();
    						transition_in(each_blocks_2[i], 1);
    						each_blocks_2[i].m(g0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks_2.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*zoom, ymax*/ 65 && g0_transform_value !== (g0_transform_value = "translate(5, " + (5 + /*zoom*/ ctx[0] * /*ymax*/ ctx[6]) + ") scale(" + /*zoom*/ ctx[0] + " " + /*zoom*/ ctx[0] + ")")) {
    				attr_dev(g0, "transform", g0_transform_value);
    			}

    			if (dirty & /*pieces_list*/ 4) {
    				each_value_1 = /*pieces_list*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(g1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*zoom, xmax, ymax*/ 97 && g1_transform_value !== (g1_transform_value = "translate(" + (5 + /*zoom*/ ctx[0] * /*xmax*/ ctx[5] + 10) + ", " + (5 + /*zoom*/ ctx[0] * /*ymax*/ ctx[6]) + ") scale(" + /*zoom*/ ctx[0] + " " + /*zoom*/ ctx[0] + ")")) {
    				attr_dev(g1, "transform", g1_transform_value);
    			}

    			if (dirty & /*pieces_list*/ 4) {
    				each_value = /*pieces_list*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(g2, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_2(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*zoom, ymax*/ 65 && g2_transform_value !== (g2_transform_value = "translate(5, " + (5 + /*zoom*/ ctx[0] * /*ymax*/ ctx[6] + 5) + ") scale(" + /*zoom*/ ctx[0] + " " + /*zoom*/ ctx[0] + ")")) {
    				attr_dev(g2, "transform", g2_transform_value);
    			}

    			if (!current || dirty & /*pieces_list*/ 4 && svg_data_count_value !== (svg_data_count_value = /*pieces_list*/ ctx[2].length)) {
    				attr_dev(svg, "data-count", svg_data_count_value);
    			}

    			if (!current || dirty & /*zoom, xmax, zmax*/ 161 && svg_width_value !== (svg_width_value = 5 + /*zoom*/ ctx[0] * /*xmax*/ ctx[5] + 5 + /*zoom*/ ctx[0] * /*zmax*/ ctx[7] + 5)) {
    				attr_dev(svg, "width", svg_width_value);
    			}

    			if (!current || dirty & /*zoom, ymax, zmax*/ 193 && svg_height_value !== (svg_height_value = 5 + /*zoom*/ ctx[0] * /*ymax*/ ctx[6] + 5 + /*zoom*/ ctx[0] * /*zmax*/ ctx[7] + 5)) {
    				attr_dev(svg, "height", svg_height_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_2[i]);
    			}

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_2 = each_blocks_2.filter(Boolean);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				transition_out(each_blocks_2[i]);
    			}

    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(svg);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			/*svg_binding*/ ctx[14](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(58:0) {#if mode == '2d'}",
    		ctx
    	});

    	return block;
    }

    // (71:4) {#each pieces_list as piece}
    function create_each_block_2$1(ctx) {
    	let svgitem;
    	let current;

    	svgitem = new SVGItem({
    			props: { item: /*piece*/ ctx[15], pos: "xy" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(svgitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(svgitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const svgitem_changes = {};
    			if (dirty & /*pieces_list*/ 4) svgitem_changes.item = /*piece*/ ctx[15];
    			svgitem.$set(svgitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(svgitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(71:4) {#each pieces_list as piece}",
    		ctx
    	});

    	return block;
    }

    // (76:4) {#each pieces_list as piece}
    function create_each_block_1$1(ctx) {
    	let svgitem;
    	let current;

    	svgitem = new SVGItem({
    			props: { item: /*piece*/ ctx[15], pos: "zy" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(svgitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(svgitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const svgitem_changes = {};
    			if (dirty & /*pieces_list*/ 4) svgitem_changes.item = /*piece*/ ctx[15];
    			svgitem.$set(svgitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(svgitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(76:4) {#each pieces_list as piece}",
    		ctx
    	});

    	return block;
    }

    // (81:4) {#each pieces_list as piece}
    function create_each_block$4(ctx) {
    	let svgitem;
    	let current;

    	svgitem = new SVGItem({
    			props: { item: /*piece*/ ctx[15], pos: "xZ" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(svgitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(svgitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const svgitem_changes = {};
    			if (dirty & /*pieces_list*/ 4) svgitem_changes.item = /*piece*/ ctx[15];
    			svgitem.$set(svgitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(svgitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(81:4) {#each pieces_list as piece}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let h3;
    	let t0;
    	let t1;
    	let t2;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*mode*/ ctx[3] == "3d" && create_if_block_1$3(ctx);
    	let if_block1 = /*mode*/ ctx[3] == "2d" && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text(/*name*/ ctx[1]);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			add_location(h3, file$8, 48, 0, 1184);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			insert_dev(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 2) set_data_dev(t0, /*name*/ ctx[1]);

    			if (/*mode*/ ctx[3] == "3d") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*mode*/ ctx[3] == "2d") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*mode*/ 8) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
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
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
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

    function instance$8($$self, $$props, $$invalidate) {
    	let pieces_list;
    	let xmax;
    	let ymax;
    	let zmax;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SVGDrawing", slots, []);
    	let { pieces } = $$props;
    	let { zoom = 0.25 } = $$props;
    	let { name = pieces.name || "Dessin" } = $$props;
    	let mode = "2d";

    	function setMode(m) {
    		$$invalidate(3, mode = m);
    	}

    	let svgElement;

    	function save() {
    		let markup = svgElement.outerHTML;

    		// TODO: detect filename
    		let filename = (prompt("Nom du fichier :", name) || "dessin") + ".svg";

    		let file = new window.File([markup], filename, { type: "image/svg+xml" });
    		let url = URL.createObjectURL(file);

    		try {
    			let a = document.createElement("a");
    			a.href = url;
    			a.style.display = "none";
    			a.setAttribute("download", filename);
    			document.body.appendChild(a);
    			a.click();
    			document.body.removeChild(a);
    		} finally {
    			URL.revokeObjectURL(url);
    		}
    	}

    	const writable_props = ["pieces", "zoom", "name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SVGDrawing> was created with unknown prop '${key}'`);
    	});

    	const click_handler = e => setMode("2d");
    	const click_handler_1 = e => setMode("3d");

    	function input_change_input_handler() {
    		zoom = to_number(this.value);
    		$$invalidate(0, zoom);
    	}

    	function svg_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			svgElement = $$value;
    			$$invalidate(4, svgElement);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("pieces" in $$props) $$invalidate(10, pieces = $$props.pieces);
    		if ("zoom" in $$props) $$invalidate(0, zoom = $$props.zoom);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		SVGItem,
    		pieces,
    		zoom,
    		name,
    		mode,
    		setMode,
    		svgElement,
    		save,
    		pieces_list,
    		xmax,
    		ymax,
    		zmax
    	});

    	$$self.$inject_state = $$props => {
    		if ("pieces" in $$props) $$invalidate(10, pieces = $$props.pieces);
    		if ("zoom" in $$props) $$invalidate(0, zoom = $$props.zoom);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("mode" in $$props) $$invalidate(3, mode = $$props.mode);
    		if ("svgElement" in $$props) $$invalidate(4, svgElement = $$props.svgElement);
    		if ("pieces_list" in $$props) $$invalidate(2, pieces_list = $$props.pieces_list);
    		if ("xmax" in $$props) $$invalidate(5, xmax = $$props.xmax);
    		if ("ymax" in $$props) $$invalidate(6, ymax = $$props.ymax);
    		if ("zmax" in $$props) $$invalidate(7, zmax = $$props.zmax);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*pieces*/ 1024) {
    			 $$invalidate(2, pieces_list = pieces instanceof Array ? pieces : pieces.individual());
    		}

    		if ($$self.$$.dirty & /*pieces_list*/ 4) {
    			 $$invalidate(5, [xmax, ymax, zmax] = pieces_list.map(p => p.bounding_box()).map(b => [b.xmax, b.ymax, b.zmax]).reduce((b0, b1) => [Math.max(b0[0], b1[0]), Math.max(b0[1], b1[1]), Math.max(b0[2], b1[2])], [0, 0, 0]), xmax, (($$invalidate(6, ymax), $$invalidate(2, pieces_list)), $$invalidate(10, pieces)), (($$invalidate(7, zmax), $$invalidate(2, pieces_list)), $$invalidate(10, pieces)));
    		}
    	};

    	return [
    		zoom,
    		name,
    		pieces_list,
    		mode,
    		svgElement,
    		xmax,
    		ymax,
    		zmax,
    		setMode,
    		save,
    		pieces,
    		click_handler,
    		click_handler_1,
    		input_change_input_handler,
    		svg_binding
    	];
    }

    class SVGDrawing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { pieces: 10, zoom: 0, name: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SVGDrawing",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pieces*/ ctx[10] === undefined && !("pieces" in props)) {
    			console.warn("<SVGDrawing> was created without expected prop 'pieces'");
    		}
    	}

    	get pieces() {
    		throw new Error("<SVGDrawing>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pieces(value) {
    		throw new Error("<SVGDrawing>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zoom() {
    		throw new Error("<SVGDrawing>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zoom(value) {
    		throw new Error("<SVGDrawing>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<SVGDrawing>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<SVGDrawing>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function get_position(pos){
      switch(pos){
        case 'left':   case 'l': case 'gauche':  case 'ga': case 'zy': case 'x': return 'zy';
        case 'right':  case 'r': case 'droite':  case 'dr': case 'Zy': case 'X': return 'Zy';
        case 'top':    case 't': case 'haut':    case 'h':  case 'xZ': case 'y': return 'xZ';
        case 'bottom': case 'b': case 'bas':                case 'xz': case 'Y': return 'xz';
        case 'front':  case 'F': case 'avant':   case 'av': case 'xy': case 'z': return 'xy';
        case 'back':   case 'B': case 'arrière': case 'ar': case 'Xy': case 'Z': return 'Xy';
        default: throw `Unknown position ${pos}`
      }
    }

    function get_orient(orient){
      switch(orient){
        case 'xyz': case 'xzy':
        case 'yxz': case 'yzx':
        case 'zxy': case 'zyx':
          return orient
        default:
          throw `Unknown orient ${orient}`
      }
    }

    class Group {

      constructor(pieces, name, component_type) {
        this.component_type = component_type;
        this.type   = 'Group';
        this.pieces = pieces || [];
        this.name   = name;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.features = [];
      }

      individual() {
        return this.pieces.reduce((res, p) => res.concat(p.individual().map(p => p.prefix_name(this.name))), [])
      }

      shallow(){
        return this.update({ pieces: this.pieces.filter(p => !(p instanceof Group)) })
      }

      flat_groups(nameprefix, total) {
        let groups = [];
        let pieces = [];
        for(let p of this.pieces) {
          if(p instanceof Group) {
            groups = groups.concat(p.flat_groups(`${nameprefix || ''}${this.name} `));
          } else {
            pieces.push(p);
          }
        }
        groups = [
          this.update({
            pieces: pieces,
            name: `${nameprefix || ''}${this.name}`}),
        ].concat(groups);

        if (total) {
          groups.push(this.update({
            pieces: this.individual(),
            name: `${nameprefix || ''}Total ${this.name}`}));
        }

        return groups
      }

      surface() {
        return this.pieces.reduce((s,p) => s + p.surface(), 0)
      }

      get nombre_tenons(){
        return this.pieces.reduce((n, p) => n + p.nombre_tenons, 0)
      }

      update(props) {
        return this.update_new({...this, ...props})
      }

      update_new(props) {
        return Object.assign(Object.create(Group.prototype), props)
      }

      add_pieces(pieces) {
        return this.update({pieces: [...this.pieces, ...pieces]})
      }

      position(x, y, z){
        return this.update({
          'x': (x || x == 0) ? x : this.x,
          'y': (y || y == 0) ? y : this.y,
          'z': (z || z == 0) ? z : this.z,
        })
      }

      get largeur() {
        let bb = this.bounding_box();
        return bb.xmax - bb.xmin
      }

      get hauteur() {
        let bb = this.bounding_box();
        return bb.ymax - bb.ymin
      }

      get profondeur() {
        let bb = this.bounding_box();
        return bb.zmax - bb.zmin
      }

      bounding_box(){
        let keys = {
          xmin: Math.min,
          ymin: Math.min,
          zmin: Math.min,
          xmax: Math.max,
          ymax: Math.max,
          zmax: Math.max,
        };
        let res = this.pieces
          .map(p => p.bounding_box())
          .reduce((bounds, piece) => bounds === null ? piece : (
            Object.keys(keys).reduce((res, key) => ({...res, [key]: keys[key](bounds[key], piece[key])}), {})
          ), null) || {};
        return {
          xmin: this.x + (res.xmin || 0),
          xmax: this.x + (res.xmax || 0),
          ymin: this.y + (res.ymin || 0),
          ymax: this.y + (res.ymax || 0),
          zmin: this.z + (res.zmin || 0),
          zmax: this.z + (res.zmax || 0),
        }
      }

      // axis := 'x' | 'y' | 'z' | 'X' | 'Y' | 'Z'
      // returns [translation] (negated if axis is uppercase)
      dim(axis){
        let sign = (axis == axis.toLowerCase()) ? 1 : -1;
        axis = axis.toLowerCase();
        return [sign * this[axis]]
      }

      projection_position(pos){
        pos = get_position(pos);
        return [this.dim(pos[0]), -this.dim(pos[1])]
      }

      // add features to the piece if they do not exist yet
      // example: group.add_features("porte-facade")
      add_features() {
        return this.update({
          features: [...this.features, ...Array.from(arguments, x => x && !this.features.includes(x))],
        })
      }

      count_features() {
        return this.pieces
          .map(piece => piece.count_features(...arguments))
          .reduce((res,counts) => {
            for(let feat in counts) {
              res[feat] = (res[feat] || 0) + counts[feat];
            }
            return res;
          }, this.features)
      }
    }

    /* src/Component.svelte generated by Svelte v3.31.2 */

    const { console: console_1$2 } = globals;
    const file$9 = "src/Component.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[32] = list[i];
    	child_ctx[34] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[32] = list[i];
    	child_ctx[34] = i;
    	return child_ctx;
    }

    const get_children_slot_changes = dirty => ({});
    const get_children_slot_context = ctx => ({});
    const get_tables_slot_changes = dirty => ({});
    const get_tables_slot_context = ctx => ({});
    const get_dim_slot_changes = dirty => ({});
    const get_dim_slot_context = ctx => ({});
    const get_plan_slot_changes = dirty => ({});
    const get_plan_slot_context = ctx => ({});

    // (239:6) {#if data.children && data.children.length}
    function create_if_block_1$4(ctx) {
    	let ul;
    	let each_value_1 = /*data*/ ctx[0].children;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(ul, file$9, 239, 6, 7238);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*deleteChild, renameChild, path, data*/ 99) {
    				each_value_1 = /*data*/ ctx[0].children;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(239:6) {#if data.children && data.children.length}",
    		ctx
    	});

    	return block;
    }

    // (242:8) {#if child.type}
    function create_if_block_2(ctx) {
    	let li;
    	let a0;
    	let t0_value = /*child*/ ctx[32].type + "";
    	let t0;
    	let t1;
    	let t2_value = /*child*/ ctx[32].name + "";
    	let t2;
    	let a0_href_value;
    	let t3;
    	let a1;
    	let t5;
    	let a2;
    	let t7;
    	let mounted;
    	let dispose;

    	function click_handler_12(...args) {
    		return /*click_handler_12*/ ctx[27](/*i*/ ctx[34], ...args);
    	}

    	function click_handler_13(...args) {
    		return /*click_handler_13*/ ctx[28](/*i*/ ctx[34], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			a0 = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			a1 = element("a");
    			a1.textContent = "✎";
    			t5 = space();
    			a2 = element("a");
    			a2.textContent = "🗑";
    			t7 = space();
    			attr_dev(a0, "href", a0_href_value = "#/component/" + /*path*/ ctx[1] + "-" + /*child*/ ctx[32].id);
    			add_location(a0, file$9, 243, 10, 7331);
    			attr_dev(a1, "href", "@");
    			add_location(a1, file$9, 244, 10, 7411);
    			attr_dev(a2, "href", "@");
    			add_location(a2, file$9, 245, 10, 7485);
    			add_location(li, file$9, 242, 8, 7316);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a0);
    			append_dev(a0, t0);
    			append_dev(a0, t1);
    			append_dev(a0, t2);
    			append_dev(li, t3);
    			append_dev(li, a1);
    			append_dev(li, t5);
    			append_dev(li, a2);
    			append_dev(li, t7);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a1, "click", prevent_default(click_handler_12), false, true, false),
    					listen_dev(a2, "click", prevent_default(click_handler_13), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*data*/ 1 && t0_value !== (t0_value = /*child*/ ctx[32].type + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*data*/ 1 && t2_value !== (t2_value = /*child*/ ctx[32].name + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*path, data*/ 3 && a0_href_value !== (a0_href_value = "#/component/" + /*path*/ ctx[1] + "-" + /*child*/ ctx[32].id)) {
    				attr_dev(a0, "href", a0_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(242:8) {#if child.type}",
    		ctx
    	});

    	return block;
    }

    // (241:6) {#each data.children as child, i}
    function create_each_block_1$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*child*/ ctx[32].type && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*child*/ ctx[32].type) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(241:6) {#each data.children as child, i}",
    		ctx
    	});

    	return block;
    }

    // (263:0) {#if data.children && data.children.length}
    function create_if_block$4(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*data*/ ctx[0].children;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*components, data, path, onDataChange*/ 147) {
    				each_value = /*data*/ ctx[0].children;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(263:0) {#if data.children && data.children.length}",
    		ctx
    	});

    	return block;
    }

    // (264:0) {#each data.children as child, i}
    function create_each_block$5(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	function datachange_handler(...args) {
    		return /*datachange_handler*/ ctx[29](/*i*/ ctx[34], ...args);
    	}

    	var switch_value = /*components*/ ctx[4][/*child*/ ctx[32].type];

    	function switch_props(ctx) {
    		return {
    			props: {
    				initdata: /*child*/ ctx[32],
    				path: "" + (/*path*/ ctx[1] + "-" + /*child*/ ctx[32].id)
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("datachange", datachange_handler);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const switch_instance_changes = {};
    			if (dirty[0] & /*data*/ 1) switch_instance_changes.initdata = /*child*/ ctx[32];
    			if (dirty[0] & /*path, data*/ 3) switch_instance_changes.path = "" + (/*path*/ ctx[1] + "-" + /*child*/ ctx[32].id);

    			if (switch_value !== (switch_value = /*components*/ ctx[4][/*child*/ ctx[32].type])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					switch_instance.$on("datachange", datachange_handler);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(264:0) {#each data.children as child, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div6;
    	let ul;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;
    	let t3;
    	let li2;
    	let a2;
    	let t5;
    	let li3;
    	let a3;
    	let t7;
    	let li4;
    	let a4;
    	let t9;
    	let li5;
    	let a5;
    	let t11;
    	let div5;
    	let div0;
    	let t12;
    	let div1;
    	let t13;
    	let div2;
    	let t14;
    	let div3;
    	let t15;
    	let div4;
    	let t16;
    	let button0;
    	let t18;
    	let button1;
    	let t20;
    	let button2;
    	let t22;
    	let button3;
    	let t24;
    	let button4;
    	let t26;
    	let button5;
    	let t28;
    	let div6_class_value;
    	let div6_id_value;
    	let t29;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	const plan_slot_template = /*#slots*/ ctx[14].plan;
    	const plan_slot = create_slot(plan_slot_template, ctx, /*$$scope*/ ctx[13], get_plan_slot_context);
    	const dim_slot_template = /*#slots*/ ctx[14].dim;
    	const dim_slot = create_slot(dim_slot_template, ctx, /*$$scope*/ ctx[13], get_dim_slot_context);
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);
    	const tables_slot_template = /*#slots*/ ctx[14].tables;
    	const tables_slot = create_slot(tables_slot_template, ctx, /*$$scope*/ ctx[13], get_tables_slot_context);
    	const children_slot_template = /*#slots*/ ctx[14].children;
    	const children_slot = create_slot(children_slot_template, ctx, /*$$scope*/ ctx[13], get_children_slot_context);
    	let if_block0 = /*data*/ ctx[0].children && /*data*/ ctx[0].children.length && create_if_block_1$4(ctx);
    	let if_block1 = /*data*/ ctx[0].children && /*data*/ ctx[0].children.length && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Tout";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Plan";
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Plan + Dimensions";
    			t5 = space();
    			li3 = element("li");
    			a3 = element("a");
    			a3.textContent = "Dimensions";
    			t7 = space();
    			li4 = element("li");
    			a4 = element("a");
    			a4.textContent = "Tableaux";
    			t9 = space();
    			li5 = element("li");
    			a5 = element("a");
    			a5.textContent = "Sous-éléments";
    			t11 = space();
    			div5 = element("div");
    			div0 = element("div");
    			if (plan_slot) plan_slot.c();
    			t12 = space();
    			div1 = element("div");
    			if (dim_slot) dim_slot.c();
    			t13 = space();
    			div2 = element("div");
    			if (default_slot) default_slot.c();
    			t14 = space();
    			div3 = element("div");
    			if (tables_slot) tables_slot.c();
    			t15 = space();
    			div4 = element("div");
    			if (children_slot) children_slot.c();
    			t16 = space();
    			button0 = element("button");
    			button0.textContent = "Nouvelle porte";
    			t18 = space();
    			button1 = element("button");
    			button1.textContent = "Nouveau caisson";
    			t20 = space();
    			button2 = element("button");
    			button2.textContent = "Nouvelle étagère";
    			t22 = space();
    			button3 = element("button");
    			button3.textContent = "Nouvelle façade";
    			t24 = space();
    			button4 = element("button");
    			button4.textContent = "Nouveau tiroir";
    			t26 = space();
    			button5 = element("button");
    			button5.textContent = "Nouveau sous-ensemble";
    			t28 = space();
    			if (if_block0) if_block0.c();
    			t29 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(a0, "href", "@");
    			attr_dev(a0, "class", "svelte-6quuq");
    			toggle_class(a0, "active", /*layout*/ ctx[2] == "all");
    			add_location(a0, file$9, 207, 8, 5634);
    			attr_dev(li0, "class", "svelte-6quuq");
    			add_location(li0, file$9, 207, 4, 5630);
    			attr_dev(a1, "href", "@");
    			attr_dev(a1, "class", "svelte-6quuq");
    			toggle_class(a1, "active", /*layout*/ ctx[2] == "plan");
    			add_location(a1, file$9, 208, 8, 5738);
    			attr_dev(li1, "class", "svelte-6quuq");
    			add_location(li1, file$9, 208, 4, 5734);
    			attr_dev(a2, "href", "@");
    			attr_dev(a2, "class", "svelte-6quuq");
    			toggle_class(a2, "active", /*layout*/ ctx[2] == "plan-dim");
    			add_location(a2, file$9, 209, 8, 5843);
    			attr_dev(li2, "class", "svelte-6quuq");
    			add_location(li2, file$9, 209, 4, 5839);
    			attr_dev(a3, "href", "@");
    			attr_dev(a3, "class", "svelte-6quuq");
    			toggle_class(a3, "active", /*layout*/ ctx[2] == "dim");
    			add_location(a3, file$9, 210, 8, 5965);
    			attr_dev(li3, "class", "svelte-6quuq");
    			add_location(li3, file$9, 210, 4, 5961);
    			attr_dev(a4, "href", "@");
    			attr_dev(a4, "class", "svelte-6quuq");
    			toggle_class(a4, "active", /*layout*/ ctx[2] == "tables");
    			add_location(a4, file$9, 211, 8, 6075);
    			attr_dev(li4, "class", "svelte-6quuq");
    			add_location(li4, file$9, 211, 4, 6071);
    			attr_dev(a5, "href", "@");
    			attr_dev(a5, "class", "svelte-6quuq");
    			toggle_class(a5, "active", /*layout*/ ctx[2] == "children");
    			add_location(a5, file$9, 212, 8, 6186);
    			attr_dev(li5, "class", "svelte-6quuq");
    			add_location(li5, file$9, 212, 4, 6182);
    			attr_dev(ul, "class", "tabs svelte-6quuq");
    			add_location(ul, file$9, 206, 2, 5608);
    			attr_dev(div0, "class", "component-grid-plan svelte-6quuq");
    			add_location(div0, file$9, 215, 4, 6339);
    			attr_dev(div1, "class", "component-grid-dim svelte-6quuq");
    			add_location(div1, file$9, 218, 4, 6420);
    			attr_dev(div2, "class", "component-grid-main svelte-6quuq");
    			add_location(div2, file$9, 221, 4, 6499);
    			attr_dev(div3, "class", "component-grid-tables svelte-6quuq");
    			add_location(div3, file$9, 224, 4, 6568);
    			add_location(button0, file$9, 231, 6, 6735);
    			add_location(button1, file$9, 232, 6, 6807);
    			add_location(button2, file$9, 233, 6, 6882);
    			add_location(button3, file$9, 234, 6, 6958);
    			add_location(button4, file$9, 235, 6, 7032);
    			add_location(button5, file$9, 236, 6, 7105);
    			attr_dev(div4, "class", "component-grid-children svelte-6quuq");
    			add_location(div4, file$9, 228, 4, 6654);
    			attr_dev(div5, "class", "component-grid svelte-6quuq");
    			add_location(div5, file$9, 214, 2, 6306);
    			attr_dev(div6, "class", div6_class_value = "routable component layout-" + /*layout*/ ctx[2] + " svelte-6quuq");
    			attr_dev(div6, "id", div6_id_value = "component-" + /*path*/ ctx[1]);
    			toggle_class(div6, "target", /*target*/ ctx[3]);
    			add_location(div6, file$9, 205, 0, 5513);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(ul, t5);
    			append_dev(ul, li3);
    			append_dev(li3, a3);
    			append_dev(ul, t7);
    			append_dev(ul, li4);
    			append_dev(li4, a4);
    			append_dev(ul, t9);
    			append_dev(ul, li5);
    			append_dev(li5, a5);
    			append_dev(div6, t11);
    			append_dev(div6, div5);
    			append_dev(div5, div0);

    			if (plan_slot) {
    				plan_slot.m(div0, null);
    			}

    			append_dev(div5, t12);
    			append_dev(div5, div1);

    			if (dim_slot) {
    				dim_slot.m(div1, null);
    			}

    			append_dev(div5, t13);
    			append_dev(div5, div2);

    			if (default_slot) {
    				default_slot.m(div2, null);
    			}

    			append_dev(div5, t14);
    			append_dev(div5, div3);

    			if (tables_slot) {
    				tables_slot.m(div3, null);
    			}

    			append_dev(div5, t15);
    			append_dev(div5, div4);

    			if (children_slot) {
    				children_slot.m(div4, null);
    			}

    			append_dev(div4, t16);
    			append_dev(div4, button0);
    			append_dev(div4, t18);
    			append_dev(div4, button1);
    			append_dev(div4, t20);
    			append_dev(div4, button2);
    			append_dev(div4, t22);
    			append_dev(div4, button3);
    			append_dev(div4, t24);
    			append_dev(div4, button4);
    			append_dev(div4, t26);
    			append_dev(div4, button5);
    			append_dev(div4, t28);
    			if (if_block0) if_block0.m(div4, null);
    			insert_dev(target, t29, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler*/ ctx[15], false, false, false),
    					listen_dev(a1, "click", /*click_handler_1*/ ctx[16], false, false, false),
    					listen_dev(a2, "click", /*click_handler_2*/ ctx[17], false, false, false),
    					listen_dev(a3, "click", /*click_handler_3*/ ctx[18], false, false, false),
    					listen_dev(a4, "click", /*click_handler_4*/ ctx[19], false, false, false),
    					listen_dev(a5, "click", /*click_handler_5*/ ctx[20], false, false, false),
    					listen_dev(button0, "click", /*click_handler_6*/ ctx[21], false, false, false),
    					listen_dev(button1, "click", /*click_handler_7*/ ctx[22], false, false, false),
    					listen_dev(button2, "click", /*click_handler_8*/ ctx[23], false, false, false),
    					listen_dev(button3, "click", /*click_handler_9*/ ctx[24], false, false, false),
    					listen_dev(button4, "click", /*click_handler_10*/ ctx[25], false, false, false),
    					listen_dev(button5, "click", /*click_handler_11*/ ctx[26], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*layout*/ 4) {
    				toggle_class(a0, "active", /*layout*/ ctx[2] == "all");
    			}

    			if (dirty[0] & /*layout*/ 4) {
    				toggle_class(a1, "active", /*layout*/ ctx[2] == "plan");
    			}

    			if (dirty[0] & /*layout*/ 4) {
    				toggle_class(a2, "active", /*layout*/ ctx[2] == "plan-dim");
    			}

    			if (dirty[0] & /*layout*/ 4) {
    				toggle_class(a3, "active", /*layout*/ ctx[2] == "dim");
    			}

    			if (dirty[0] & /*layout*/ 4) {
    				toggle_class(a4, "active", /*layout*/ ctx[2] == "tables");
    			}

    			if (dirty[0] & /*layout*/ 4) {
    				toggle_class(a5, "active", /*layout*/ ctx[2] == "children");
    			}

    			if (plan_slot) {
    				if (plan_slot.p && dirty[0] & /*$$scope*/ 8192) {
    					update_slot(plan_slot, plan_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_plan_slot_changes, get_plan_slot_context);
    				}
    			}

    			if (dim_slot) {
    				if (dim_slot.p && dirty[0] & /*$$scope*/ 8192) {
    					update_slot(dim_slot, dim_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_dim_slot_changes, get_dim_slot_context);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty[0] & /*$$scope*/ 8192) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[13], dirty, null, null);
    				}
    			}

    			if (tables_slot) {
    				if (tables_slot.p && dirty[0] & /*$$scope*/ 8192) {
    					update_slot(tables_slot, tables_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_tables_slot_changes, get_tables_slot_context);
    				}
    			}

    			if (children_slot) {
    				if (children_slot.p && dirty[0] & /*$$scope*/ 8192) {
    					update_slot(children_slot, children_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_children_slot_changes, get_children_slot_context);
    				}
    			}

    			if (/*data*/ ctx[0].children && /*data*/ ctx[0].children.length) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$4(ctx);
    					if_block0.c();
    					if_block0.m(div4, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!current || dirty[0] & /*layout*/ 4 && div6_class_value !== (div6_class_value = "routable component layout-" + /*layout*/ ctx[2] + " svelte-6quuq")) {
    				attr_dev(div6, "class", div6_class_value);
    			}

    			if (!current || dirty[0] & /*path*/ 2 && div6_id_value !== (div6_id_value = "component-" + /*path*/ ctx[1])) {
    				attr_dev(div6, "id", div6_id_value);
    			}

    			if (dirty[0] & /*layout, target*/ 12) {
    				toggle_class(div6, "target", /*target*/ ctx[3]);
    			}

    			if (/*data*/ ctx[0].children && /*data*/ ctx[0].children.length) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*data*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
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
    			transition_in(plan_slot, local);
    			transition_in(dim_slot, local);
    			transition_in(default_slot, local);
    			transition_in(tables_slot, local);
    			transition_in(children_slot, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(plan_slot, local);
    			transition_out(dim_slot, local);
    			transition_out(default_slot, local);
    			transition_out(tables_slot, local);
    			transition_out(children_slot, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			if (plan_slot) plan_slot.d(detaching);
    			if (dim_slot) dim_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (tables_slot) tables_slot.d(detaching);
    			if (children_slot) children_slot.d(detaching);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t29);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Component", slots, ['plan','dim','default','tables','children']);
    	const dispatch = createEventDispatcher();
    	let components = getContext("App-components");
    	let layout = "all";

    	getContext("settings").subscribe(settings => {
    		$$invalidate(2, layout = settings.component_layout);
    	});

    	let { data } = $$props;
    	let { state = {} } = $$props;
    	let { childrenState = [] } = $$props;
    	let { children = data.children || [] } = $$props;
    	let { path = `${getContext("Component-path")}-${data.id}` } = $$props;

    	/*
    $: console.log(`Component ${data.type}(${path}) data =`, data)
    $: console.log(`Component ${data.type}(${path}) state =`, state)
    $: console.log(`Component ${data.type}(${path}) childrenState =`, childrenState)
    $: console.log(`Component ${data.type}(${path}) children =`, children)
    $: console.log(`Component ${data.type}(${path}) path =`, path)
    */
    	setContext("Component-path", path);

    	dispatch("datachange", { data, state });

    	function dispatchDatachange(state, data) {
    		//console.log(`${data.type}(${path}) datachange!`)
    		dispatch("datachange", { state, data });
    	}

    	function renameChild(i) {
    		let name = prompt(`Renommer "${children[i].name}" en :`, children[i].name) || children[i].name;
    		$$invalidate(11, children[i].name = name, children);
    	}

    	function deleteChild(i) {
    		if (!confirm(`Supprimer ${children[i].name} ?`)) return;
    		let children2 = [...children];
    		children2.splice(i, 1);
    		console.log("delete", i, children, children2);
    		$$invalidate(11, children = children2);
    	}

    	function onDataChange(e, i) {
    		//console.log(`${data.type}(${path}).children[${i}] datachange{${Object.keys(e.detail).join()}} = %o`, e.detail);
    		if (e.detail.data) $$invalidate(11, children[i] = e.detail.data, children);

    		if (e.detail.state) $$invalidate(10, childrenState[i] = e.detail.state, childrenState);
    	}

    	// manually set target class because when svelte modified an element class
    	// list, it removes any manually set classes with the classList API.
    	let target = false;

    	routeDeclare(route => {
    		$$invalidate(3, target = route.component_path == path);
    	});

    	function setLayout(e, name) {
    		if (e) e.preventDefault();
    		$$invalidate(2, layout = name);
    		getContext("settings").update(settings => ({ ...settings, component_layout: layout }));
    	}

    	function addChild(type) {
    		let id = nextId(children);
    		let name = prompt("Nom du sous-ensemble :", `${path}-${id}`) || `${path}-${id}`;
    		$$invalidate(11, children = [...children, { type, name, id }]);
    	}

    	const writable_props = ["data", "state", "childrenState", "children", "path"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Component> was created with unknown prop '${key}'`);
    	});

    	const click_handler = e => setLayout(e, "all");
    	const click_handler_1 = e => setLayout(e, "plan");
    	const click_handler_2 = e => setLayout(e, "plan-dim");
    	const click_handler_3 = e => setLayout(e, "dim");
    	const click_handler_4 = e => setLayout(e, "tables");
    	const click_handler_5 = e => setLayout(e, "children");
    	const click_handler_6 = e => addChild("Porte");
    	const click_handler_7 = e => addChild("Caisson");
    	const click_handler_8 = e => addChild("Etagere");
    	const click_handler_9 = e => addChild("Facade");
    	const click_handler_10 = e => addChild("Tiroir");
    	const click_handler_11 = e => addChild("Ensemble");
    	const click_handler_12 = (i, e) => renameChild(i);
    	const click_handler_13 = (i, e) => deleteChild(i);
    	const datachange_handler = (i, e) => onDataChange(e, i);

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("state" in $$props) $$invalidate(12, state = $$props.state);
    		if ("childrenState" in $$props) $$invalidate(10, childrenState = $$props.childrenState);
    		if ("children" in $$props) $$invalidate(11, children = $$props.children);
    		if ("path" in $$props) $$invalidate(1, path = $$props.path);
    		if ("$$scope" in $$props) $$invalidate(13, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		createEventDispatcher,
    		routeDeclare,
    		nextId,
    		dispatch,
    		components,
    		layout,
    		data,
    		state,
    		childrenState,
    		children,
    		path,
    		dispatchDatachange,
    		renameChild,
    		deleteChild,
    		onDataChange,
    		target,
    		setLayout,
    		addChild
    	});

    	$$self.$inject_state = $$props => {
    		if ("components" in $$props) $$invalidate(4, components = $$props.components);
    		if ("layout" in $$props) $$invalidate(2, layout = $$props.layout);
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("state" in $$props) $$invalidate(12, state = $$props.state);
    		if ("childrenState" in $$props) $$invalidate(10, childrenState = $$props.childrenState);
    		if ("children" in $$props) $$invalidate(11, children = $$props.children);
    		if ("path" in $$props) $$invalidate(1, path = $$props.path);
    		if ("target" in $$props) $$invalidate(3, target = $$props.target);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*state, data*/ 4097) {
    			//$: dispatch('datachange', {data})
    			//$: dispatch('datachange', {state})
    			//$: console.log(`${data.type}(${path}) datachange!`), dispatch('datachange', {state, data})
    			 dispatchDatachange(state, data);
    		}
    	};

    	return [
    		data,
    		path,
    		layout,
    		target,
    		components,
    		renameChild,
    		deleteChild,
    		onDataChange,
    		setLayout,
    		addChild,
    		childrenState,
    		children,
    		state,
    		$$scope,
    		slots,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		click_handler_9,
    		click_handler_10,
    		click_handler_11,
    		click_handler_12,
    		click_handler_13,
    		datachange_handler
    	];
    }

    class Component extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$9,
    			create_fragment$9,
    			safe_not_equal,
    			{
    				data: 0,
    				state: 12,
    				childrenState: 10,
    				children: 11,
    				path: 1
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Component",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console_1$2.warn("<Component> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<Component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get childrenState() {
    		throw new Error("<Component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set childrenState(value) {
    		throw new Error("<Component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get children() {
    		throw new Error("<Component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set children(value) {
    		throw new Error("<Component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<Component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ChildrenPositions.svelte generated by Svelte v3.31.2 */

    const { console: console_1$3 } = globals;
    const file$a = "src/ChildrenPositions.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[14] = list;
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (61:0) {#if children.length > 0 }
    function create_if_block$5(ctx) {
    	let table;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let t4;
    	let th2;
    	let t6;
    	let th3;
    	let t8;
    	let th4;
    	let t10;
    	let td;
    	let t11;
    	let current;
    	let if_block = /*drawings*/ ctx[4] && create_if_block_3(ctx);
    	let each_value = /*children*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			table = element("table");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Éléments";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "dimensions (L x h x p)";
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			th2 = element("th");
    			th2.textContent = "de la gauche";
    			t6 = space();
    			th3 = element("th");
    			th3.textContent = "du bas";
    			t8 = space();
    			th4 = element("th");
    			th4.textContent = "du mur";
    			t10 = space();
    			td = element("td");
    			t11 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_style(th0, "text-align", "left");
    			add_location(th0, file$a, 63, 4, 1906);
    			set_style(th1, "text-align", "right");
    			add_location(th1, file$a, 64, 4, 1953);
    			set_style(th2, "text-align", "right");
    			add_location(th2, file$a, 68, 4, 2125);
    			set_style(th3, "text-align", "right");
    			add_location(th3, file$a, 69, 4, 2177);
    			set_style(th4, "text-align", "right");
    			add_location(th4, file$a, 70, 4, 2223);
    			add_location(td, file$a, 71, 4, 2269);
    			add_location(tr, file$a, 62, 2, 1897);
    			add_location(table, file$a, 61, 0, 1887);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			if (if_block) if_block.m(tr, null);
    			append_dev(tr, t4);
    			append_dev(tr, th2);
    			append_dev(tr, t6);
    			append_dev(tr, th3);
    			append_dev(tr, t8);
    			append_dev(tr, th4);
    			append_dev(tr, t10);
    			append_dev(tr, td);
    			append_dev(table, t11);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*drawings*/ ctx[4]) {
    				if (if_block) ; else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(tr, t4);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*defaultChildrenPos, childrenPos, drawings, pieces, children*/ 31) {
    				each_value = /*children*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(table, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(61:0) {#if children.length > 0 }",
    		ctx
    	});

    	return block;
    }

    // (66:4) {#if drawings}
    function create_if_block_3(ctx) {
    	let th;

    	const block = {
    		c: function create() {
    			th = element("th");
    			th.textContent = "n° dessin";
    			set_style(th, "text-align", "right");
    			attr_dev(th, "colspan", "2");
    			add_location(th, file$a, 66, 4, 2054);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(66:4) {#if drawings}",
    		ctx
    	});

    	return block;
    }

    // (75:2) {#if child.type}
    function create_if_block_1$5(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*child*/ ctx[13].type + "";
    	let t0;
    	let t1;
    	let t2_value = /*child*/ ctx[13].name + "";
    	let t2;
    	let t3;
    	let td1;
    	let t4_value = (/*pieces*/ ctx[0][/*i*/ ctx[15]] || {}).largeur + "";
    	let t4;
    	let t5;
    	let t6_value = (/*pieces*/ ctx[0][/*i*/ ctx[15]] || {}).hauteur + "";
    	let t6;
    	let t7;
    	let t8_value = (/*pieces*/ ctx[0][/*i*/ ctx[15]] || {}).profondeur + "";
    	let t8;
    	let t9;
    	let t10;
    	let td2;
    	let inputnumber0;
    	let updating_value;
    	let t11;
    	let td3;
    	let inputnumber1;
    	let updating_value_1;
    	let t12;
    	let td4;
    	let inputnumber2;
    	let updating_value_2;
    	let t13;
    	let td5;
    	let t15;
    	let current;
    	let if_block = /*drawings*/ ctx[4] && create_if_block_2$1(ctx);

    	function inputnumber0_value_binding(value) {
    		/*inputnumber0_value_binding*/ ctx[9].call(null, value, /*i*/ ctx[15]);
    	}

    	let inputnumber0_props = {
    		def: (/*defaultChildrenPos*/ ctx[3][/*i*/ ctx[15]] || {}).x || 0
    	};

    	if (/*childrenPos*/ ctx[1][/*i*/ ctx[15]].x !== void 0) {
    		inputnumber0_props.value = /*childrenPos*/ ctx[1][/*i*/ ctx[15]].x;
    	}

    	inputnumber0 = new InputNumber({
    			props: inputnumber0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber0, "value", inputnumber0_value_binding));

    	function inputnumber1_value_binding(value) {
    		/*inputnumber1_value_binding*/ ctx[10].call(null, value, /*i*/ ctx[15]);
    	}

    	let inputnumber1_props = {
    		def: (/*defaultChildrenPos*/ ctx[3][/*i*/ ctx[15]] || {}).y || 0
    	};

    	if (/*childrenPos*/ ctx[1][/*i*/ ctx[15]].y !== void 0) {
    		inputnumber1_props.value = /*childrenPos*/ ctx[1][/*i*/ ctx[15]].y;
    	}

    	inputnumber1 = new InputNumber({
    			props: inputnumber1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber1, "value", inputnumber1_value_binding));

    	function inputnumber2_value_binding(value) {
    		/*inputnumber2_value_binding*/ ctx[11].call(null, value, /*i*/ ctx[15]);
    	}

    	let inputnumber2_props = {
    		def: (/*defaultChildrenPos*/ ctx[3][/*i*/ ctx[15]] || {}).z || 0
    	};

    	if (/*childrenPos*/ ctx[1][/*i*/ ctx[15]].z !== void 0) {
    		inputnumber2_props.value = /*childrenPos*/ ctx[1][/*i*/ ctx[15]].z;
    	}

    	inputnumber2 = new InputNumber({
    			props: inputnumber2_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber2, "value", inputnumber2_value_binding));

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			td1 = element("td");
    			t4 = text(t4_value);
    			t5 = text("x");
    			t6 = text(t6_value);
    			t7 = text("x");
    			t8 = text(t8_value);
    			t9 = space();
    			if (if_block) if_block.c();
    			t10 = space();
    			td2 = element("td");
    			create_component(inputnumber0.$$.fragment);
    			t11 = space();
    			td3 = element("td");
    			create_component(inputnumber1.$$.fragment);
    			t12 = space();
    			td4 = element("td");
    			create_component(inputnumber2.$$.fragment);
    			t13 = space();
    			td5 = element("td");
    			td5.textContent = "mm";
    			t15 = space();
    			add_location(td0, file$a, 76, 4, 2346);
    			set_style(td1, "text-align", "right");
    			add_location(td1, file$a, 77, 4, 2385);
    			add_location(td2, file$a, 82, 4, 2725);
    			add_location(td3, file$a, 83, 4, 2825);
    			add_location(td4, file$a, 84, 4, 2925);
    			add_location(td5, file$a, 85, 4, 3025);
    			add_location(tr, file$a, 75, 2, 2337);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(td0, t1);
    			append_dev(td0, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td1);
    			append_dev(td1, t4);
    			append_dev(td1, t5);
    			append_dev(td1, t6);
    			append_dev(td1, t7);
    			append_dev(td1, t8);
    			append_dev(tr, t9);
    			if (if_block) if_block.m(tr, null);
    			append_dev(tr, t10);
    			append_dev(tr, td2);
    			mount_component(inputnumber0, td2, null);
    			append_dev(tr, t11);
    			append_dev(tr, td3);
    			mount_component(inputnumber1, td3, null);
    			append_dev(tr, t12);
    			append_dev(tr, td4);
    			mount_component(inputnumber2, td4, null);
    			append_dev(tr, t13);
    			append_dev(tr, td5);
    			append_dev(tr, t15);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*children*/ 4) && t0_value !== (t0_value = /*child*/ ctx[13].type + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*children*/ 4) && t2_value !== (t2_value = /*child*/ ctx[13].name + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*pieces*/ 1) && t4_value !== (t4_value = (/*pieces*/ ctx[0][/*i*/ ctx[15]] || {}).largeur + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*pieces*/ 1) && t6_value !== (t6_value = (/*pieces*/ ctx[0][/*i*/ ctx[15]] || {}).hauteur + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty & /*pieces*/ 1) && t8_value !== (t8_value = (/*pieces*/ ctx[0][/*i*/ ctx[15]] || {}).profondeur + "")) set_data_dev(t8, t8_value);

    			if (/*drawings*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*drawings*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(tr, t10);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const inputnumber0_changes = {};
    			if (dirty & /*defaultChildrenPos*/ 8) inputnumber0_changes.def = (/*defaultChildrenPos*/ ctx[3][/*i*/ ctx[15]] || {}).x || 0;

    			if (!updating_value && dirty & /*childrenPos*/ 2) {
    				updating_value = true;
    				inputnumber0_changes.value = /*childrenPos*/ ctx[1][/*i*/ ctx[15]].x;
    				add_flush_callback(() => updating_value = false);
    			}

    			inputnumber0.$set(inputnumber0_changes);
    			const inputnumber1_changes = {};
    			if (dirty & /*defaultChildrenPos*/ 8) inputnumber1_changes.def = (/*defaultChildrenPos*/ ctx[3][/*i*/ ctx[15]] || {}).y || 0;

    			if (!updating_value_1 && dirty & /*childrenPos*/ 2) {
    				updating_value_1 = true;
    				inputnumber1_changes.value = /*childrenPos*/ ctx[1][/*i*/ ctx[15]].y;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			inputnumber1.$set(inputnumber1_changes);
    			const inputnumber2_changes = {};
    			if (dirty & /*defaultChildrenPos*/ 8) inputnumber2_changes.def = (/*defaultChildrenPos*/ ctx[3][/*i*/ ctx[15]] || {}).z || 0;

    			if (!updating_value_2 && dirty & /*childrenPos*/ 2) {
    				updating_value_2 = true;
    				inputnumber2_changes.value = /*childrenPos*/ ctx[1][/*i*/ ctx[15]].z;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			inputnumber2.$set(inputnumber2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(inputnumber0.$$.fragment, local);
    			transition_in(inputnumber1.$$.fragment, local);
    			transition_in(inputnumber2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(inputnumber0.$$.fragment, local);
    			transition_out(inputnumber1.$$.fragment, local);
    			transition_out(inputnumber2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if (if_block) if_block.d();
    			destroy_component(inputnumber0);
    			destroy_component(inputnumber1);
    			destroy_component(inputnumber2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(75:2) {#if child.type}",
    		ctx
    	});

    	return block;
    }

    // (79:4) {#if drawings}
    function create_if_block_2$1(ctx) {
    	let td0;
    	let inputcheckbox;
    	let updating_checked;
    	let t;
    	let td1;
    	let inputnumber;
    	let updating_value;
    	let current;

    	function inputcheckbox_checked_binding(value) {
    		/*inputcheckbox_checked_binding*/ ctx[7].call(null, value, /*i*/ ctx[15]);
    	}

    	let inputcheckbox_props = { tristate: false };

    	if (/*childrenPos*/ ctx[1][/*i*/ ctx[15]].show !== void 0) {
    		inputcheckbox_props.checked = /*childrenPos*/ ctx[1][/*i*/ ctx[15]].show;
    	}

    	inputcheckbox = new InputCheckbox({
    			props: inputcheckbox_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputcheckbox, "checked", inputcheckbox_checked_binding));

    	function inputnumber_value_binding(value) {
    		/*inputnumber_value_binding*/ ctx[8].call(null, value, /*i*/ ctx[15]);
    	}

    	let inputnumber_props = {
    		def: (/*defaultChildrenPos*/ ctx[3][/*i*/ ctx[15]] || {}).d || 1,
    		min: 1
    	};

    	if (/*childrenPos*/ ctx[1][/*i*/ ctx[15]].d !== void 0) {
    		inputnumber_props.value = /*childrenPos*/ ctx[1][/*i*/ ctx[15]].d;
    	}

    	inputnumber = new InputNumber({ props: inputnumber_props, $$inline: true });
    	binding_callbacks.push(() => bind(inputnumber, "value", inputnumber_value_binding));

    	const block = {
    		c: function create() {
    			td0 = element("td");
    			create_component(inputcheckbox.$$.fragment);
    			t = space();
    			td1 = element("td");
    			create_component(inputnumber.$$.fragment);
    			add_location(td0, file$a, 79, 4, 2524);
    			add_location(td1, file$a, 80, 4, 2607);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td0, anchor);
    			mount_component(inputcheckbox, td0, null);
    			insert_dev(target, t, anchor);
    			insert_dev(target, td1, anchor);
    			mount_component(inputnumber, td1, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const inputcheckbox_changes = {};

    			if (!updating_checked && dirty & /*childrenPos*/ 2) {
    				updating_checked = true;
    				inputcheckbox_changes.checked = /*childrenPos*/ ctx[1][/*i*/ ctx[15]].show;
    				add_flush_callback(() => updating_checked = false);
    			}

    			inputcheckbox.$set(inputcheckbox_changes);
    			const inputnumber_changes = {};
    			if (dirty & /*defaultChildrenPos*/ 8) inputnumber_changes.def = (/*defaultChildrenPos*/ ctx[3][/*i*/ ctx[15]] || {}).d || 1;

    			if (!updating_value && dirty & /*childrenPos*/ 2) {
    				updating_value = true;
    				inputnumber_changes.value = /*childrenPos*/ ctx[1][/*i*/ ctx[15]].d;
    				add_flush_callback(() => updating_value = false);
    			}

    			inputnumber.$set(inputnumber_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputcheckbox.$$.fragment, local);
    			transition_in(inputnumber.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputcheckbox.$$.fragment, local);
    			transition_out(inputnumber.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td0);
    			destroy_component(inputcheckbox);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(td1);
    			destroy_component(inputnumber);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(79:4) {#if drawings}",
    		ctx
    	});

    	return block;
    }

    // (74:0) {#each children as child, i}
    function create_each_block$6(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*child*/ ctx[13].type && create_if_block_1$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*child*/ ctx[13].type) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*children*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$5(ctx);
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
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(74:0) {#each children as child, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*children*/ ctx[2].length > 0 && create_if_block$5(ctx);

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
    			if (/*children*/ ctx[2].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*children*/ 4) {
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ChildrenPositions", slots, []);
    	let { children = [] } = $$props;
    	let { childrenState = [] } = $$props;
    	let { pieces = [] } = $$props;
    	let { pieces_drawings = [] } = $$props;
    	let { childrenPos } = $$props;
    	let { defaultChildrenPos = [] } = $$props;
    	let { drawings = false } = $$props;

    	function resizeChildrenPos(children) {
    		console.log("resize childrenPos");
    		return children.map((_, i) => cleanObject(childrenPos[i] || {}));
    	}

    	const writable_props = [
    		"children",
    		"childrenState",
    		"pieces",
    		"pieces_drawings",
    		"childrenPos",
    		"defaultChildrenPos",
    		"drawings"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<ChildrenPositions> was created with unknown prop '${key}'`);
    	});

    	function inputcheckbox_checked_binding(value, i) {
    		childrenPos[i].show = value;
    		($$invalidate(1, childrenPos), $$invalidate(2, children));
    	}

    	function inputnumber_value_binding(value, i) {
    		childrenPos[i].d = value;
    		($$invalidate(1, childrenPos), $$invalidate(2, children));
    	}

    	function inputnumber0_value_binding(value, i) {
    		childrenPos[i].x = value;
    		($$invalidate(1, childrenPos), $$invalidate(2, children));
    	}

    	function inputnumber1_value_binding(value, i) {
    		childrenPos[i].y = value;
    		($$invalidate(1, childrenPos), $$invalidate(2, children));
    	}

    	function inputnumber2_value_binding(value, i) {
    		childrenPos[i].z = value;
    		($$invalidate(1, childrenPos), $$invalidate(2, children));
    	}

    	$$self.$$set = $$props => {
    		if ("children" in $$props) $$invalidate(2, children = $$props.children);
    		if ("childrenState" in $$props) $$invalidate(6, childrenState = $$props.childrenState);
    		if ("pieces" in $$props) $$invalidate(0, pieces = $$props.pieces);
    		if ("pieces_drawings" in $$props) $$invalidate(5, pieces_drawings = $$props.pieces_drawings);
    		if ("childrenPos" in $$props) $$invalidate(1, childrenPos = $$props.childrenPos);
    		if ("defaultChildrenPos" in $$props) $$invalidate(3, defaultChildrenPos = $$props.defaultChildrenPos);
    		if ("drawings" in $$props) $$invalidate(4, drawings = $$props.drawings);
    	};

    	$$self.$capture_state = () => ({
    		cleanObject,
    		InputNumber,
    		InputCheckbox,
    		Group,
    		children,
    		childrenState,
    		pieces,
    		pieces_drawings,
    		childrenPos,
    		defaultChildrenPos,
    		drawings,
    		resizeChildrenPos
    	});

    	$$self.$inject_state = $$props => {
    		if ("children" in $$props) $$invalidate(2, children = $$props.children);
    		if ("childrenState" in $$props) $$invalidate(6, childrenState = $$props.childrenState);
    		if ("pieces" in $$props) $$invalidate(0, pieces = $$props.pieces);
    		if ("pieces_drawings" in $$props) $$invalidate(5, pieces_drawings = $$props.pieces_drawings);
    		if ("childrenPos" in $$props) $$invalidate(1, childrenPos = $$props.childrenPos);
    		if ("defaultChildrenPos" in $$props) $$invalidate(3, defaultChildrenPos = $$props.defaultChildrenPos);
    		if ("drawings" in $$props) $$invalidate(4, drawings = $$props.drawings);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*children*/ 4) {
    			//*
    			 console.log("ChildrenPositions children = ", children);
    		}

    		if ($$self.$$.dirty & /*childrenState*/ 64) {
    			 console.log("ChildrenPositions childrenState = ", childrenState);
    		}

    		if ($$self.$$.dirty & /*children*/ 4) {
    			//*/
    			 $$invalidate(1, childrenPos = resizeChildrenPos(children));
    		}

    		if ($$self.$$.dirty & /*children, childrenState, defaultChildrenPos, childrenPos*/ 78) {
    			 $$invalidate(0, pieces = children.map((c, i) => {
    				const state = childrenState[i] || {};
    				return state.pieces_group || new Group(state.pieces || [], `${c.type} ${c.name}`, c.type);
    			}).map((g, i) => {
    				let { x, y, z } = {
    					x: 0,
    					y: 0,
    					z: 0,
    					...defaultChildrenPos[i] || {},
    					...cleanObject(childrenPos[i] || {})
    				};

    				return g.position(x, y, z);
    			}));
    		}

    		if ($$self.$$.dirty & /*pieces*/ 1) {
    			 console.log("ChildrenPositions pieces = ", pieces);
    		}

    		if ($$self.$$.dirty & /*pieces, defaultChildrenPos, childrenPos*/ 11) {
    			 $$invalidate(5, pieces_drawings = pieces.reduce(
    				(res, p, i) => {
    					let pos = {
    						d: 1,
    						show: true,
    						...defaultChildrenPos[i] || {},
    						...cleanObject(childrenPos[i] || {})
    					};

    					let d = pos.d || 1;
    					if (pos.show) res[d - 1] = [...res[d - 1] || [], p];
    					return res;
    				},
    				[]
    			));
    		}

    		if ($$self.$$.dirty & /*pieces_drawings*/ 32) {
    			 console.log("ChildrenPositions pieces_drawings = ", pieces_drawings);
    		}

    		if ($$self.$$.dirty & /*childrenPos*/ 2) {
    			 console.log("ChildrenPositions childrenPos = ", JSON.stringify(childrenPos, null, 2));
    		}

    		if ($$self.$$.dirty & /*defaultChildrenPos*/ 8) {
    			 console.log("ChildrenPositions defaultChildrenPos = ", defaultChildrenPos);
    		}

    		if ($$self.$$.dirty & /*drawings*/ 16) {
    			 console.log("ChildrenPositions drawings = ", drawings);
    		}
    	};

    	return [
    		pieces,
    		childrenPos,
    		children,
    		defaultChildrenPos,
    		drawings,
    		pieces_drawings,
    		childrenState,
    		inputcheckbox_checked_binding,
    		inputnumber_value_binding,
    		inputnumber0_value_binding,
    		inputnumber1_value_binding,
    		inputnumber2_value_binding
    	];
    }

    class ChildrenPositions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			children: 2,
    			childrenState: 6,
    			pieces: 0,
    			pieces_drawings: 5,
    			childrenPos: 1,
    			defaultChildrenPos: 3,
    			drawings: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChildrenPositions",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*childrenPos*/ ctx[1] === undefined && !("childrenPos" in props)) {
    			console_1$3.warn("<ChildrenPositions> was created without expected prop 'childrenPos'");
    		}
    	}

    	get children() {
    		throw new Error("<ChildrenPositions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set children(value) {
    		throw new Error("<ChildrenPositions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get childrenState() {
    		throw new Error("<ChildrenPositions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set childrenState(value) {
    		throw new Error("<ChildrenPositions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pieces() {
    		throw new Error("<ChildrenPositions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pieces(value) {
    		throw new Error("<ChildrenPositions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pieces_drawings() {
    		throw new Error("<ChildrenPositions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pieces_drawings(value) {
    		throw new Error("<ChildrenPositions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get childrenPos() {
    		throw new Error("<ChildrenPositions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set childrenPos(value) {
    		throw new Error("<ChildrenPositions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get defaultChildrenPos() {
    		throw new Error("<ChildrenPositions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultChildrenPos(value) {
    		throw new Error("<ChildrenPositions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get drawings() {
    		throw new Error("<ChildrenPositions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set drawings(value) {
    		throw new Error("<ChildrenPositions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function calculEstimations(settings, pieceg) {
      let constants = {};
      let components = pieceg.flat_groups('', false)
        .map(group => calculShallowGroupEstimations(settings, group, constants));
      let total = components.reduce((tot, poste) => tot + poste.total, 0);
      return {components, total}
    }

    function calculShallowGroupEstimations(settings, group, constants) {
      let type = group.component_type;
      let postes = (settings.postes_estimations || [])
        .filter(estim => estim.components[type])
        .map(estim => ({
          ...estim,
          type,
          ...calculEstimation(estim, group, constants, type),
        }))
        .map(estim => ({
          computed: estim.value * estim.base_value,
          ...estim
        }))
        .filter(estim => estim.computed != 0);
      let total = postes.reduce((tot, poste) => tot + poste.computed, 0);
      return {type, name: group.name, postes, total}
    }

    function calculEstimation(estim, pieceg, constants, type){
      switch(estim.indice) {
        case 'm2_ep0_20':
          return {
            base_value: pieceg.pieces
              .filter(p => p.epaisseur <= 20)
              .reduce((s,p) => s + p.surface(), 0),
            base_unit: "m²",
          }
        case 'm2_ep20_plus':
          return {
            base_value: pieceg.pieces
              .filter(p => p.epaisseur > 20)
              .reduce((s,p) => s + p.surface(), 0),
            base_unit: "m²",
          }
        case 'm2_panneau':
          return {
            base_value: pieceg.pieces
              .filter(p => p.features.includes('panneau'))
              .reduce((s,p) => s + p.surface(), 0),
            base_unit: "m²",
          }
        case 'm2_panneau_seul':
          return {
            base_value: pieceg.pieces
              .filter(p => p.features.includes('panneau-seul'))
              .reduce((s,p) => s + p.surface(), 0),
            base_unit: "m²",
          }
        case 'm2_panneau_tous':
          return {
            base_value: pieceg.pieces
              .filter(p => p.features.includes('panneau') || p.features.includes('panneau-seul'))
              .reduce((s,p) => s + p.surface(), 0),
            base_unit: "m²",
          }
        case 'm2_trav_mont_ncp':
          return {
            base_value: pieceg.pieces
              .filter(p => p.features.includes('traverse') || p.features.includes('montant'))
              .reduce((s,p) => s + p.surface(), 0),
            base_unit: "m²",
          }
        case 'm2_trav_mont_cp':
          return {
            base_value: pieceg.pieces
              .filter(p => p.features.includes('traverse-cp') || p.features.includes('montant-cp'))
              .reduce((s,p) => s + p.surface(), 0),
            base_unit: "m²",
          }
        case 'm2_trav_mont':
          return {
            base_value: pieceg.pieces
              .filter(p => p.features.includes('traverse') || p.features.includes('montant') || p.features.includes('traverse-cp') || p.features.includes('montant-cp'))
              .reduce((s,p) => s + p.surface(), 0),
            base_unit: "m²",
          }
        case 'm2_cote':
          return {
            base_value: pieceg.pieces
              .filter(p => p.features.includes('cote'))
              .reduce((s,p) => s + p.surface(), 0),
            base_unit: "m²",
          }
        case 'm2_plateau':
          return {
            base_value: pieceg.surface(),
            base_unit: "m²",
          }
        case 'nb_ep0_20':
          return {
            base_value: pieceg.pieces.filter(p => p.epaisseur <= 20).length,
            base_unit: "pièces",
          }
        case 'nb_ep20_plus':
          return {
            base_value: pieceg.pieces.filter(p => p.epaisseur > 20).length,
            base_unit: "pièces",
          }
        case 'nb_panneau':
          return {
            base_value: pieceg.pieces
              .filter(p => p.features.includes('panneau'))
              .length,
            base_unit: "panneaux",
          }
        case 'nb_panneau_seul':
          return {
            base_value: pieceg.pieces
              .filter(p => p.features.includes('panneau-seul'))
              .length,
            base_unit: "panneaux",
          }
        case 'nb_panneau_tous':
          return {
            base_value: pieceg.pieces
              .filter(p => p.features.includes('panneau') || p.features.includes('panneau-seul'))
              .length,
            base_unit: "panneaux",
          }
        case 'nb_trav_mont_ncp':
          return {
            base_value: pieceg.pieces
              .filter(p => p.features.includes('traverse') || p.features.includes('montant'))
              .length,
            base_unit: "pièces",
          }
        case 'nb_trav_mont_cp':
          return {
            base_value: pieceg.pieces
              .filter(p => p.features.includes('traverse-cp') || p.features.includes('montant-cp'))
              .length,
            base_unit: "pièces",
          }
        case 'nb_trav_mont':
          return {
            base_value: pieceg.pieces
              .filter(p => p.features.includes('traverse') || p.features.includes('montant') || p.features.includes('traverse-cp') || p.features.includes('montant-cp'))
              .length,
            base_unit: "pièces",
          }
        case 'nb_cote':
          return {
            base_value: pieceg.pieces
              .filter(p => p.features.includes('cote'))
              .length,
            base_unit: "côté",
          }
        case 'nb_plateau':
          return {
            base_value: pieceg.pieces.length,
            base_unit: "pièces",
          }
        case 'tenon':
          return {
            base_value: pieceg.nombre_tenons,
            base_unit: "tenons",
          }
        case 'constant':
          let cst_key = `${type}/${estim.name}`;
          let val = constants[cst_key] ? 0 : 1;
          constants[cst_key] = true;
          return {
            base_value: val,
            base_unit: "fois",
          }
        case 'per_component':
          return {
            base_value: 1,
            base_unit: type,
          }
        case 'per_ferrage_charniere':
          return {
            base_value: pieceg.features.includes('ferrage-charniere') ? 1 : 0,
            base_unit: type,
          }
        default:
          return {
            base_value: 0,
            base_unit: '',
          }
      }
    }

    /* src/Estimation.svelte generated by Svelte v3.31.2 */
    const file$b = "src/Estimation.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (33:4) {#each estim_comp.postes as estim}
    function create_each_block_1$3(ctx) {
    	let tr;
    	let td0;
    	let t0;
    	let td1;
    	let t1_value = /*estim*/ ctx[8].name + "";
    	let t1;
    	let t2;
    	let td2;
    	let t3_value = /*estim*/ ctx[8].base_value.toFixed(4) + "";
    	let t3;
    	let t4;
    	let t5_value = /*estim*/ ctx[8].base_unit + "";
    	let t5;
    	let t6;
    	let td3;
    	let t7_value = temps(/*estim*/ ctx[8].value, /*onlyMins*/ ctx[2]) + "";
    	let t7;
    	let t8;
    	let t9_value = /*estim*/ ctx[8].base_unit + "";
    	let t9;
    	let t10;
    	let td4;
    	let t11_value = temps(/*estim*/ ctx[8].computed, /*onlyMins*/ ctx[2]) + "";
    	let t11;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = space();
    			td1 = element("td");
    			t1 = text(t1_value);
    			t2 = space();
    			td2 = element("td");
    			t3 = text(t3_value);
    			t4 = space();
    			t5 = text(t5_value);
    			t6 = space();
    			td3 = element("td");
    			t7 = text(t7_value);
    			t8 = text(" / ");
    			t9 = text(t9_value);
    			t10 = space();
    			td4 = element("td");
    			t11 = text(t11_value);
    			add_location(td0, file$b, 34, 8, 1026);
    			add_location(td1, file$b, 35, 8, 1044);
    			add_location(td2, file$b, 36, 8, 1074);
    			add_location(td3, file$b, 37, 8, 1139);
    			add_location(td4, file$b, 38, 8, 1207);
    			add_location(tr, file$b, 33, 6, 1013);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(tr, t0);
    			append_dev(tr, td1);
    			append_dev(td1, t1);
    			append_dev(tr, t2);
    			append_dev(tr, td2);
    			append_dev(td2, t3);
    			append_dev(td2, t4);
    			append_dev(td2, t5);
    			append_dev(tr, t6);
    			append_dev(tr, td3);
    			append_dev(td3, t7);
    			append_dev(td3, t8);
    			append_dev(td3, t9);
    			append_dev(tr, t10);
    			append_dev(tr, td4);
    			append_dev(td4, t11);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*estimations*/ 1 && t1_value !== (t1_value = /*estim*/ ctx[8].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*estimations*/ 1 && t3_value !== (t3_value = /*estim*/ ctx[8].base_value.toFixed(4) + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*estimations*/ 1 && t5_value !== (t5_value = /*estim*/ ctx[8].base_unit + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*estimations, onlyMins*/ 5 && t7_value !== (t7_value = temps(/*estim*/ ctx[8].value, /*onlyMins*/ ctx[2]) + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*estimations*/ 1 && t9_value !== (t9_value = /*estim*/ ctx[8].base_unit + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*estimations, onlyMins*/ 5 && t11_value !== (t11_value = temps(/*estim*/ ctx[8].computed, /*onlyMins*/ ctx[2]) + "")) set_data_dev(t11, t11_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(33:4) {#each estim_comp.postes as estim}",
    		ctx
    	});

    	return block;
    }

    // (27:2) {#each estimations.components as estim_comp}
    function create_each_block$7(ctx) {
    	let tr;
    	let th0;
    	let t0_value = /*estim_comp*/ ctx[5].type + "";
    	let t0;
    	let t1;
    	let th1;
    	let t2_value = /*estim_comp*/ ctx[5].name + "";
    	let t2;
    	let t3;
    	let td;
    	let em;
    	let t4_value = temps(/*estim_comp*/ ctx[5].total, /*onlyMins*/ ctx[2]) + "";
    	let t4;
    	let t5;
    	let each_1_anchor;
    	let each_value_1 = /*estim_comp*/ ctx[5].postes;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			th0 = element("th");
    			t0 = text(t0_value);
    			t1 = space();
    			th1 = element("th");
    			t2 = text(t2_value);
    			t3 = space();
    			td = element("td");
    			em = element("em");
    			t4 = text(t4_value);
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			add_location(th0, file$b, 28, 6, 828);
    			attr_dev(th1, "colspan", "3");
    			add_location(th1, file$b, 29, 6, 861);
    			add_location(em, file$b, 30, 10, 908);
    			add_location(td, file$b, 30, 6, 904);
    			add_location(tr, file$b, 27, 4, 817);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, th0);
    			append_dev(th0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(th1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td);
    			append_dev(td, em);
    			append_dev(em, t4);
    			insert_dev(target, t5, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*estimations*/ 1 && t0_value !== (t0_value = /*estim_comp*/ ctx[5].type + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*estimations*/ 1 && t2_value !== (t2_value = /*estim_comp*/ ctx[5].name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*estimations, onlyMins*/ 5 && t4_value !== (t4_value = temps(/*estim_comp*/ ctx[5].total, /*onlyMins*/ ctx[2]) + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*temps, estimations, onlyMins*/ 5) {
    				each_value_1 = /*estim_comp*/ ctx[5].postes;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if (detaching) detach_dev(t5);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(27:2) {#each estimations.components as estim_comp}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let table;
    	let caption;
    	let t0;
    	let t1_value = /*pieces*/ ctx[1].name + "";
    	let t1;
    	let t2;
    	let label;
    	let input;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let tr;
    	let th;
    	let t8;
    	let td;
    	let t9_value = temps(/*estimations*/ ctx[0].total, /*onlyMins*/ ctx[2]) + "";
    	let t9;
    	let mounted;
    	let dispose;
    	let each_value = /*estimations*/ ctx[0].components;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			caption = element("caption");
    			t0 = text("Estimations pour ");
    			t1 = text(t1_value);
    			t2 = text(" (afficher ");
    			label = element("label");
    			input = element("input");
    			t3 = text(" les minutes seulement");
    			t4 = text(")");
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			tr = element("tr");
    			th = element("th");
    			th.textContent = "Total";
    			t8 = space();
    			td = element("td");
    			t9 = text(t9_value);
    			attr_dev(input, "type", "checkbox");
    			add_location(input, file$b, 25, 83, 677);
    			set_style(label, "display", "inline");
    			add_location(label, file$b, 25, 52, 646);
    			add_location(caption, file$b, 25, 2, 596);
    			attr_dev(th, "colspan", "4");
    			add_location(th, file$b, 43, 4, 1295);
    			add_location(td, file$b, 44, 4, 1324);
    			add_location(tr, file$b, 42, 2, 1286);
    			attr_dev(table, "class", "large styled");
    			add_location(table, file$b, 24, 0, 565);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, caption);
    			append_dev(caption, t0);
    			append_dev(caption, t1);
    			append_dev(caption, t2);
    			append_dev(caption, label);
    			append_dev(label, input);
    			input.checked = /*onlyMins*/ ctx[2];
    			append_dev(label, t3);
    			append_dev(caption, t4);
    			append_dev(table, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			append_dev(table, t6);
    			append_dev(table, tr);
    			append_dev(tr, th);
    			append_dev(tr, t8);
    			append_dev(tr, td);
    			append_dev(td, t9);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pieces*/ 2 && t1_value !== (t1_value = /*pieces*/ ctx[1].name + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*onlyMins*/ 4) {
    				input.checked = /*onlyMins*/ ctx[2];
    			}

    			if (dirty & /*estimations, temps, onlyMins*/ 5) {
    				each_value = /*estimations*/ ctx[0].components;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, t6);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*estimations, onlyMins*/ 5 && t9_value !== (t9_value = temps(/*estimations*/ ctx[0].total, /*onlyMins*/ ctx[2]) + "")) set_data_dev(t9, t9_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function temps(all_mins, onlyMins) {
    	if (onlyMins) {
    		return `${all_mins.toFixed()} min`;
    	} else {
    		let mins = all_mins % 60;
    		let h = (all_mins - mins) / 60;
    		return `${h.toFixed()} h ${mins.toFixed()} min`;
    	}
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Estimation", slots, []);
    	let { pieces } = $$props;
    	let { estimations } = $$props;
    	let onlyMins = false;
    	let settings;

    	getContext("settings").subscribe(data => {
    		$$invalidate(3, settings = data);
    	});

    	const writable_props = ["pieces", "estimations"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Estimation> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		onlyMins = this.checked;
    		$$invalidate(2, onlyMins);
    	}

    	$$self.$$set = $$props => {
    		if ("pieces" in $$props) $$invalidate(1, pieces = $$props.pieces);
    		if ("estimations" in $$props) $$invalidate(0, estimations = $$props.estimations);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		calculEstimations,
    		pieces,
    		estimations,
    		onlyMins,
    		settings,
    		temps
    	});

    	$$self.$inject_state = $$props => {
    		if ("pieces" in $$props) $$invalidate(1, pieces = $$props.pieces);
    		if ("estimations" in $$props) $$invalidate(0, estimations = $$props.estimations);
    		if ("onlyMins" in $$props) $$invalidate(2, onlyMins = $$props.onlyMins);
    		if ("settings" in $$props) $$invalidate(3, settings = $$props.settings);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*settings, pieces*/ 10) {
    			 $$invalidate(0, estimations = calculEstimations(settings, pieces));
    		}
    	};

    	return [estimations, pieces, onlyMins, settings, input_change_handler];
    }

    class Estimation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { pieces: 1, estimations: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Estimation",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pieces*/ ctx[1] === undefined && !("pieces" in props)) {
    			console.warn("<Estimation> was created without expected prop 'pieces'");
    		}

    		if (/*estimations*/ ctx[0] === undefined && !("estimations" in props)) {
    			console.warn("<Estimation> was created without expected prop 'estimations'");
    		}
    	}

    	get pieces() {
    		throw new Error("<Estimation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pieces(value) {
    		throw new Error("<Estimation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get estimations() {
    		throw new Error("<Estimation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set estimations(value) {
    		throw new Error("<Estimation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ListeDebit.svelte generated by Svelte v3.31.2 */

    const { Object: Object_1$1 } = globals;
    const file$c = "src/ListeDebit.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	child_ctx[30] = i;
    	return child_ctx;
    }

    function get_each_context_2$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	return child_ctx;
    }

    // (173:4) {#if par_epaiss}
    function create_if_block_8(ctx) {
    	let each_1_anchor;
    	let each_value_5 = /*statistics_epaisseurs*/ ctx[12];
    	validate_each_argument(each_value_5);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*statistics_epaisseurs*/ 4096) {
    				each_value_5 = /*statistics_epaisseurs*/ ctx[12];
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_5.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(173:4) {#if par_epaiss}",
    		ctx
    	});

    	return block;
    }

    // (174:6) {#each statistics_epaisseurs as ep}
    function create_each_block_5(ctx) {
    	let th;
    	let t0;
    	let t1_value = /*ep*/ ctx[34] + "";
    	let t1;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t0 = text("Pièces ép=");
    			t1 = text(t1_value);
    			attr_dev(th, "colspan", "2");
    			add_location(th, file$c, 174, 8, 6063);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t0);
    			append_dev(th, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*statistics_epaisseurs*/ 4096 && t1_value !== (t1_value = /*ep*/ ctx[34] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(174:6) {#each statistics_epaisseurs as ep}",
    		ctx
    	});

    	return block;
    }

    // (178:4) {#if par_type}
    function create_if_block_7(ctx) {
    	let th;

    	const block = {
    		c: function create() {
    			th = element("th");
    			th.textContent = "Panneaux";
    			attr_dev(th, "colspan", "2");
    			add_location(th, file$c, 178, 6, 6146);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(178:4) {#if par_type}",
    		ctx
    	});

    	return block;
    }

    // (182:2) {#if par_epaiss || par_type}
    function create_if_block_4(ctx) {
    	let tr;
    	let t;
    	let if_block0 = /*par_epaiss*/ ctx[8] && create_if_block_6(ctx);
    	let if_block1 = /*par_type*/ ctx[9] && create_if_block_5(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			add_location(tr, file$c, 182, 2, 6225);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			if (if_block0) if_block0.m(tr, null);
    			append_dev(tr, t);
    			if (if_block1) if_block1.m(tr, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*par_epaiss*/ ctx[8]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					if_block0.m(tr, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*par_type*/ ctx[9]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_5(ctx);
    					if_block1.c();
    					if_block1.m(tr, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(182:2) {#if par_epaiss || par_type}",
    		ctx
    	});

    	return block;
    }

    // (184:4) {#if par_epaiss}
    function create_if_block_6(ctx) {
    	let each_1_anchor;
    	let each_value_4 = /*statistics_epaisseurs*/ ctx[12];
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*statistics_epaisseurs*/ 4096) {
    				const old_length = each_value_4.length;
    				each_value_4 = /*statistics_epaisseurs*/ ctx[12];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = old_length; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (!each_blocks[i]) {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (i = each_value_4.length; i < old_length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(184:4) {#if par_epaiss}",
    		ctx
    	});

    	return block;
    }

    // (185:6) {#each statistics_epaisseurs as ep}
    function create_each_block_4(ctx) {
    	let th0;
    	let t1;
    	let th1;

    	const block = {
    		c: function create() {
    			th0 = element("th");
    			th0.textContent = "Nbre";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "m²";
    			add_location(th0, file$c, 185, 8, 6301);
    			add_location(th1, file$c, 186, 8, 6323);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, th1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(th1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(185:6) {#each statistics_epaisseurs as ep}",
    		ctx
    	});

    	return block;
    }

    // (190:4) {#if par_type}
    function create_if_block_5(ctx) {
    	let th0;
    	let t1;
    	let th1;

    	const block = {
    		c: function create() {
    			th0 = element("th");
    			th0.textContent = "Nbre";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "m²";
    			add_location(th0, file$c, 190, 6, 6384);
    			add_location(th1, file$c, 191, 6, 6404);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, th1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(th1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(190:4) {#if par_type}",
    		ctx
    	});

    	return block;
    }

    // (203:6) {#if par_epaiss}
    function create_if_block_3$1(ctx) {
    	let each_1_anchor;
    	let each_value_3 = /*statistics_epaisseurs*/ ctx[12];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*statistics, statistics_epaisseurs*/ 4128) {
    				each_value_3 = /*statistics_epaisseurs*/ ctx[12];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(203:6) {#if par_epaiss}",
    		ctx
    	});

    	return block;
    }

    // (204:6) {#each statistics_epaisseurs as ep}
    function create_each_block_3(ctx) {
    	let td0;
    	let t0_value = ((/*stat*/ ctx[31].epaisseurs.find(func) || {}).nb_pieces || 0) + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = ((/*stat*/ ctx[31].epaisseurs.find(func_1) || {}).surface || 0).toFixed(6) + "";
    	let t2;

    	function func(...args) {
    		return /*func*/ ctx[19](/*ep*/ ctx[34], ...args);
    	}

    	function func_1(...args) {
    		return /*func_1*/ ctx[20](/*ep*/ ctx[34], ...args);
    	}

    	const block = {
    		c: function create() {
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			add_location(td0, file$c, 204, 8, 6761);
    			add_location(td1, file$c, 205, 8, 6846);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td0, anchor);
    			append_dev(td0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, td1, anchor);
    			append_dev(td1, t2);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*statistics, statistics_epaisseurs*/ 4128 && t0_value !== (t0_value = ((/*stat*/ ctx[31].epaisseurs.find(func) || {}).nb_pieces || 0) + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*statistics, statistics_epaisseurs*/ 4128 && t2_value !== (t2_value = ((/*stat*/ ctx[31].epaisseurs.find(func_1) || {}).surface || 0).toFixed(6) + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(td1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(204:6) {#each statistics_epaisseurs as ep}",
    		ctx
    	});

    	return block;
    }

    // (209:6) {#if par_type}
    function create_if_block_2$2(ctx) {
    	let td0;
    	let t0_value = /*stat*/ ctx[31].nb_panneaux + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*stat*/ ctx[31].m2_panneaux.toFixed(6) + "";
    	let t2;

    	const block = {
    		c: function create() {
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			add_location(td0, file$c, 209, 8, 6989);
    			add_location(td1, file$c, 210, 8, 7025);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td0, anchor);
    			append_dev(td0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, td1, anchor);
    			append_dev(td1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*statistics*/ 32 && t0_value !== (t0_value = /*stat*/ ctx[31].nb_panneaux + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*statistics*/ 32 && t2_value !== (t2_value = /*stat*/ ctx[31].m2_panneaux.toFixed(6) + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(td1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(209:6) {#if par_type}",
    		ctx
    	});

    	return block;
    }

    // (196:2) {#each statistics as stat}
    function create_each_block_2$2(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*stat*/ ctx[31].name + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*stat*/ ctx[31].dimension_x + "";
    	let t2;
    	let t3;
    	let t4_value = /*stat*/ ctx[31].dimension_y + "";
    	let t4;
    	let t5;
    	let t6_value = /*stat*/ ctx[31].dimension_z + "";
    	let t6;
    	let t7;
    	let td2;
    	let t8_value = /*stat*/ ctx[31].nb_pieces + "";
    	let t8;
    	let t9;
    	let td3;
    	let t10_value = /*stat*/ ctx[31].nb_tenons + "";
    	let t10;
    	let t11;
    	let td4;
    	let t12_value = /*stat*/ ctx[31].surface.toFixed(6) + "";
    	let t12;
    	let t13;
    	let t14;
    	let t15;
    	let if_block0 = /*par_epaiss*/ ctx[8] && create_if_block_3$1(ctx);
    	let if_block1 = /*par_type*/ ctx[9] && create_if_block_2$2(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = text(" x ");
    			t4 = text(t4_value);
    			t5 = text(" x ");
    			t6 = text(t6_value);
    			t7 = space();
    			td2 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			td3 = element("td");
    			t10 = text(t10_value);
    			t11 = space();
    			td4 = element("td");
    			t12 = text(t12_value);
    			t13 = space();
    			if (if_block0) if_block0.c();
    			t14 = space();
    			if (if_block1) if_block1.c();
    			t15 = space();
    			add_location(td0, file$c, 197, 6, 6486);
    			add_location(td1, file$c, 198, 6, 6513);
    			add_location(td2, file$c, 199, 6, 6589);
    			add_location(td3, file$c, 200, 6, 6621);
    			add_location(td4, file$c, 201, 6, 6653);
    			add_location(tr, file$c, 196, 4, 6475);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(td1, t3);
    			append_dev(td1, t4);
    			append_dev(td1, t5);
    			append_dev(td1, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td2);
    			append_dev(td2, t8);
    			append_dev(tr, t9);
    			append_dev(tr, td3);
    			append_dev(td3, t10);
    			append_dev(tr, t11);
    			append_dev(tr, td4);
    			append_dev(td4, t12);
    			append_dev(tr, t13);
    			if (if_block0) if_block0.m(tr, null);
    			append_dev(tr, t14);
    			if (if_block1) if_block1.m(tr, null);
    			append_dev(tr, t15);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*statistics*/ 32 && t0_value !== (t0_value = /*stat*/ ctx[31].name + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*statistics*/ 32 && t2_value !== (t2_value = /*stat*/ ctx[31].dimension_x + "")) set_data_dev(t2, t2_value);
    			if (dirty[0] & /*statistics*/ 32 && t4_value !== (t4_value = /*stat*/ ctx[31].dimension_y + "")) set_data_dev(t4, t4_value);
    			if (dirty[0] & /*statistics*/ 32 && t6_value !== (t6_value = /*stat*/ ctx[31].dimension_z + "")) set_data_dev(t6, t6_value);
    			if (dirty[0] & /*statistics*/ 32 && t8_value !== (t8_value = /*stat*/ ctx[31].nb_pieces + "")) set_data_dev(t8, t8_value);
    			if (dirty[0] & /*statistics*/ 32 && t10_value !== (t10_value = /*stat*/ ctx[31].nb_tenons + "")) set_data_dev(t10, t10_value);
    			if (dirty[0] & /*statistics*/ 32 && t12_value !== (t12_value = /*stat*/ ctx[31].surface.toFixed(6) + "")) set_data_dev(t12, t12_value);

    			if (/*par_epaiss*/ ctx[8]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					if_block0.m(tr, t14);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*par_type*/ ctx[9]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$2(ctx);
    					if_block1.c();
    					if_block1.m(tr, t15);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$2.name,
    		type: "each",
    		source: "(196:2) {#each statistics as stat}",
    		ctx
    	});

    	return block;
    }

    // (239:6) {:else}
    function create_else_block$1(ctx) {
    	let t_value = /*piece*/ ctx[25].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*pieces3*/ 64 && t_value !== (t_value = /*piece*/ ctx[25].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(239:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (234:6) {#if separer}
    function create_if_block$6(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*piece*/ ctx[25].name_list;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$4(get_each_context_1$4(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*pieces3*/ 64) {
    				each_value_1 = /*piece*/ ctx[25].name_list;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$4(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(234:6) {#if separer}",
    		ctx
    	});

    	return block;
    }

    // (236:10) {#if i != 0}
    function create_if_block_1$6(ctx) {
    	let br;

    	const block = {
    		c: function create() {
    			br = element("br");
    			add_location(br, file$c, 235, 22, 7818);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(236:10) {#if i != 0}",
    		ctx
    	});

    	return block;
    }

    // (235:8) {#each piece.name_list as name, i}
    function create_each_block_1$4(ctx) {
    	let t0;
    	let t1_value = /*name*/ ctx[28] + "";
    	let t1;
    	let if_block = /*i*/ ctx[30] != 0 && create_if_block_1$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			t1 = text(t1_value);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*pieces3*/ 64 && t1_value !== (t1_value = /*name*/ ctx[28] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$4.name,
    		type: "each",
    		source: "(235:8) {#each piece.name_list as name, i}",
    		ctx
    	});

    	return block;
    }

    // (231:2) {#each pieces3 as piece}
    function create_each_block$8(ctx) {
    	let tr;
    	let td0;
    	let t0;
    	let td1;
    	let t1_value = (/*piece*/ ctx[25].que || 1) + "";
    	let t1;
    	let t2;
    	let td2;
    	let t3_value = /*piece*/ ctx[25].string_dimentions() + "";
    	let t3;
    	let t4;
    	let td3;
    	let t5_value = /*piece*/ ctx[25].string_arrasement() + "";
    	let t5;
    	let t6;
    	let td4;
    	let t7_value = /*piece*/ ctx[25].largeur * /*piece*/ ctx[25].longueur / 1000000 + "";
    	let t7;
    	let t8;
    	let td5;
    	let t9_value = /*piece*/ ctx[25].epaisseur_plateau + "";
    	let t9;
    	let t10;
    	let td6;
    	let t11_value = /*piece*/ ctx[25].que * /*piece*/ ctx[25].cubage(/*cubemargin*/ ctx[4] / 100).toFixed(9) + "";
    	let t11;
    	let t12;
    	let td7;
    	let t13_value = /*piece*/ ctx[25].que * /*piece*/ ctx[25].prix(/*cubeprice*/ ctx[3], /*cubemargin*/ ctx[4] / 100).toFixed(2) + "";
    	let t13;

    	function select_block_type(ctx, dirty) {
    		if (/*separer*/ ctx[7]) return create_if_block$6;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			if_block.c();
    			t0 = space();
    			td1 = element("td");
    			t1 = text(t1_value);
    			t2 = space();
    			td2 = element("td");
    			t3 = text(t3_value);
    			t4 = space();
    			td3 = element("td");
    			t5 = text(t5_value);
    			t6 = space();
    			td4 = element("td");
    			t7 = text(t7_value);
    			t8 = space();
    			td5 = element("td");
    			t9 = text(t9_value);
    			t10 = space();
    			td6 = element("td");
    			t11 = text(t11_value);
    			t12 = space();
    			td7 = element("td");
    			t13 = text(t13_value);
    			add_location(td0, file$c, 232, 4, 7728);
    			add_location(td1, file$c, 242, 4, 7923);
    			add_location(td2, file$c, 243, 4, 7953);
    			add_location(td3, file$c, 244, 4, 7994);
    			add_location(td4, file$c, 245, 4, 8035);
    			add_location(td5, file$c, 246, 4, 8087);
    			add_location(td6, file$c, 247, 4, 8126);
    			add_location(td7, file$c, 248, 4, 8193);
    			add_location(tr, file$c, 231, 2, 7719);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			if_block.m(td0, null);
    			append_dev(tr, t0);
    			append_dev(tr, td1);
    			append_dev(td1, t1);
    			append_dev(tr, t2);
    			append_dev(tr, td2);
    			append_dev(td2, t3);
    			append_dev(tr, t4);
    			append_dev(tr, td3);
    			append_dev(td3, t5);
    			append_dev(tr, t6);
    			append_dev(tr, td4);
    			append_dev(td4, t7);
    			append_dev(tr, t8);
    			append_dev(tr, td5);
    			append_dev(td5, t9);
    			append_dev(tr, t10);
    			append_dev(tr, td6);
    			append_dev(td6, t11);
    			append_dev(tr, t12);
    			append_dev(tr, td7);
    			append_dev(td7, t13);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(td0, null);
    				}
    			}

    			if (dirty[0] & /*pieces3*/ 64 && t1_value !== (t1_value = (/*piece*/ ctx[25].que || 1) + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*pieces3*/ 64 && t3_value !== (t3_value = /*piece*/ ctx[25].string_dimentions() + "")) set_data_dev(t3, t3_value);
    			if (dirty[0] & /*pieces3*/ 64 && t5_value !== (t5_value = /*piece*/ ctx[25].string_arrasement() + "")) set_data_dev(t5, t5_value);
    			if (dirty[0] & /*pieces3*/ 64 && t7_value !== (t7_value = /*piece*/ ctx[25].largeur * /*piece*/ ctx[25].longueur / 1000000 + "")) set_data_dev(t7, t7_value);
    			if (dirty[0] & /*pieces3*/ 64 && t9_value !== (t9_value = /*piece*/ ctx[25].epaisseur_plateau + "")) set_data_dev(t9, t9_value);
    			if (dirty[0] & /*pieces3, cubemargin*/ 80 && t11_value !== (t11_value = /*piece*/ ctx[25].que * /*piece*/ ctx[25].cubage(/*cubemargin*/ ctx[4] / 100).toFixed(9) + "")) set_data_dev(t11, t11_value);
    			if (dirty[0] & /*pieces3, cubeprice, cubemargin*/ 88 && t13_value !== (t13_value = /*piece*/ ctx[25].que * /*piece*/ ctx[25].prix(/*cubeprice*/ ctx[3], /*cubemargin*/ ctx[4] / 100).toFixed(2) + "")) set_data_dev(t13, t13_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(231:2) {#each pieces3 as piece}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let table0;
    	let caption0;
    	let t0;
    	let t1_value = /*pieces*/ ctx[1].name + "";
    	let t1;
    	let t2;
    	let label0;
    	let input0;
    	let t3;
    	let t4;
    	let label1;
    	let input1;
    	let t5;
    	let t6;
    	let label2;
    	let input2;
    	let t7;
    	let t8;
    	let t9;
    	let tr0;
    	let th0;
    	let t10;
    	let th0_rowspan_value;
    	let t11;
    	let th1;
    	let t12;
    	let th1_rowspan_value;
    	let t13;
    	let th2;
    	let t14;
    	let th2_rowspan_value;
    	let t15;
    	let th3;
    	let t16;
    	let th3_rowspan_value;
    	let t17;
    	let th4;
    	let t18;
    	let th4_rowspan_value;
    	let t19;
    	let t20;
    	let t21;
    	let t22;
    	let t23;
    	let hr0;
    	let t24;
    	let table1;
    	let caption1;
    	let t25;
    	let a;
    	let t27;
    	let t28;
    	let tr1;
    	let th5;
    	let t29;
    	let label3;
    	let input3;
    	let t30;
    	let t31;
    	let t32;
    	let th6;
    	let t34;
    	let th7;
    	let t36;
    	let th8;
    	let t38;
    	let th9;
    	let t40;
    	let th10;
    	let t42;
    	let th11;
    	let t43;
    	let br0;
    	let t44;
    	let input4;
    	let t45;
    	let t46;
    	let th12;
    	let t47;
    	let br1;
    	let input5;
    	let t48;
    	let t49;
    	let tr2;
    	let td0;
    	let t51;
    	let td1;
    	let t52;
    	let td2;
    	let t53;
    	let td3;
    	let t54;
    	let td4;
    	let t55;
    	let td5;
    	let t56;
    	let td6;
    	let t57_value = /*total_cube*/ ctx[10].toFixed(9) + "";
    	let t57;
    	let t58;
    	let td7;
    	let t59_value = /*total_prix*/ ctx[11].toFixed(2) + "";
    	let t59;
    	let t60;
    	let hr1;
    	let t61;
    	let estimation;
    	let updating_estimations;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*par_epaiss*/ ctx[8] && create_if_block_8(ctx);
    	let if_block1 = /*par_type*/ ctx[9] && create_if_block_7(ctx);
    	let if_block2 = (/*par_epaiss*/ ctx[8] || /*par_type*/ ctx[9]) && create_if_block_4(ctx);
    	let each_value_2 = /*statistics*/ ctx[5];
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2$2(get_each_context_2$2(ctx, each_value_2, i));
    	}

    	let each_value = /*pieces3*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
    	}

    	function estimation_estimations_binding(value) {
    		/*estimation_estimations_binding*/ ctx[24].call(null, value);
    	}

    	let estimation_props = { pieces: /*pieces*/ ctx[1] };

    	if (/*estimations*/ ctx[0] !== void 0) {
    		estimation_props.estimations = /*estimations*/ ctx[0];
    	}

    	estimation = new Estimation({ props: estimation_props, $$inline: true });
    	binding_callbacks.push(() => bind(estimation, "estimations", estimation_estimations_binding));

    	const block = {
    		c: function create() {
    			table0 = element("table");
    			caption0 = element("caption");
    			t0 = text("Statistiques pour ");
    			t1 = text(t1_value);
    			t2 = text(" (afficher ");
    			label0 = element("label");
    			input0 = element("input");
    			t3 = text(" totaux");
    			t4 = text(", ");
    			label1 = element("label");
    			input1 = element("input");
    			t5 = text(" par épaisseur");
    			t6 = text(", ");
    			label2 = element("label");
    			input2 = element("input");
    			t7 = text(" par type");
    			t8 = text(")");
    			t9 = space();
    			tr0 = element("tr");
    			th0 = element("th");
    			t10 = text("Ensemble");
    			t11 = space();
    			th1 = element("th");
    			t12 = text("Dimensions");
    			t13 = space();
    			th2 = element("th");
    			t14 = text("Nombre de pièces");
    			t15 = space();
    			th3 = element("th");
    			t16 = text("Nombre de tenons");
    			t17 = space();
    			th4 = element("th");
    			t18 = text("Surface des pièces");
    			t19 = space();
    			if (if_block0) if_block0.c();
    			t20 = space();
    			if (if_block1) if_block1.c();
    			t21 = space();
    			if (if_block2) if_block2.c();
    			t22 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t23 = space();
    			hr0 = element("hr");
    			t24 = space();
    			table1 = element("table");
    			caption1 = element("caption");
    			t25 = text("Liste de débit (");
    			a = element("a");
    			a.textContent = "ouvrir dans un tableur";
    			t27 = text(")");
    			t28 = space();
    			tr1 = element("tr");
    			th5 = element("th");
    			t29 = text("Pièce (");
    			label3 = element("label");
    			input3 = element("input");
    			t30 = text(" séparer");
    			t31 = text(")");
    			t32 = space();
    			th6 = element("th");
    			th6.textContent = "Qué";
    			t34 = space();
    			th7 = element("th");
    			th7.textContent = "L x l x e";
    			t36 = space();
    			th8 = element("th");
    			th8.textContent = "Arrasement";
    			t38 = space();
    			th9 = element("th");
    			th9.textContent = "Surface (m²)";
    			t40 = space();
    			th10 = element("th");
    			th10.textContent = "epaisseur plateau (mm)";
    			t42 = space();
    			th11 = element("th");
    			t43 = text("Cubage");
    			br0 = element("br");
    			t44 = text("(x");
    			input4 = element("input");
    			t45 = text("%)");
    			t46 = space();
    			th12 = element("th");
    			t47 = text("Prix au m³");
    			br1 = element("br");
    			input5 = element("input");
    			t48 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t49 = space();
    			tr2 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Total";
    			t51 = space();
    			td1 = element("td");
    			t52 = space();
    			td2 = element("td");
    			t53 = space();
    			td3 = element("td");
    			t54 = space();
    			td4 = element("td");
    			t55 = space();
    			td5 = element("td");
    			t56 = space();
    			td6 = element("td");
    			t57 = text(t57_value);
    			t58 = space();
    			td7 = element("td");
    			t59 = text(t59_value);
    			t60 = space();
    			hr1 = element("hr");
    			t61 = space();
    			create_component(estimation.$$.fragment);
    			attr_dev(input0, "type", "checkbox");
    			add_location(input0, file$c, 165, 84, 5369);
    			set_style(label0, "display", "inline");
    			add_location(label0, file$c, 165, 53, 5338);
    			attr_dev(input1, "type", "checkbox");
    			add_location(input1, file$c, 165, 177, 5462);
    			set_style(label1, "display", "inline");
    			add_location(label1, file$c, 165, 146, 5431);
    			attr_dev(input2, "type", "checkbox");
    			add_location(input2, file$c, 165, 281, 5566);
    			set_style(label2, "display", "inline");
    			add_location(label2, file$c, 165, 250, 5535);
    			add_location(caption0, file$c, 165, 2, 5287);
    			attr_dev(th0, "rowspan", th0_rowspan_value = /*par_epaiss*/ ctx[8] || /*par_type*/ ctx[9] ? 2 : 1);
    			add_location(th0, file$c, 167, 4, 5653);
    			attr_dev(th1, "rowspan", th1_rowspan_value = /*par_epaiss*/ ctx[8] || /*par_type*/ ctx[9] ? 2 : 1);
    			add_location(th1, file$c, 168, 4, 5716);
    			attr_dev(th2, "rowspan", th2_rowspan_value = /*par_epaiss*/ ctx[8] || /*par_type*/ ctx[9] ? 2 : 1);
    			add_location(th2, file$c, 169, 4, 5781);
    			attr_dev(th3, "rowspan", th3_rowspan_value = /*par_epaiss*/ ctx[8] || /*par_type*/ ctx[9] ? 2 : 1);
    			add_location(th3, file$c, 170, 4, 5852);
    			attr_dev(th4, "rowspan", th4_rowspan_value = /*par_epaiss*/ ctx[8] || /*par_type*/ ctx[9] ? 2 : 1);
    			add_location(th4, file$c, 171, 4, 5923);
    			add_location(tr0, file$c, 166, 2, 5644);
    			attr_dev(table0, "class", "large styled");
    			add_location(table0, file$c, 164, 0, 5256);
    			add_location(hr0, file$c, 216, 0, 7106);
    			attr_dev(a, "href", "javascript:void(0)");
    			add_location(a, file$c, 219, 27, 7169);
    			add_location(caption1, file$c, 219, 2, 7144);
    			attr_dev(input3, "type", "checkbox");
    			add_location(input3, file$c, 221, 46, 7305);
    			set_style(label3, "display", "inline");
    			add_location(label3, file$c, 221, 15, 7274);
    			add_location(th5, file$c, 221, 4, 7263);
    			add_location(th6, file$c, 222, 4, 7378);
    			add_location(th7, file$c, 223, 4, 7395);
    			add_location(th8, file$c, 224, 4, 7418);
    			add_location(th9, file$c, 225, 4, 7442);
    			add_location(th10, file$c, 226, 4, 7468);
    			add_location(br0, file$c, 227, 14, 7514);
    			attr_dev(input4, "type", "number");
    			attr_dev(input4, "size", "3");
    			attr_dev(input4, "min", "100");
    			attr_dev(input4, "step", "5");
    			attr_dev(input4, "class", "svelte-fy3499");
    			add_location(input4, file$c, 227, 21, 7521);
    			add_location(th11, file$c, 227, 4, 7504);
    			add_location(br1, file$c, 228, 18, 7613);
    			attr_dev(input5, "type", "number");
    			attr_dev(input5, "size", "5");
    			attr_dev(input5, "step", "10");
    			attr_dev(input5, "class", "svelte-fy3499");
    			add_location(input5, file$c, 228, 23, 7618);
    			add_location(th12, file$c, 228, 4, 7599);
    			add_location(tr1, file$c, 220, 2, 7254);
    			add_location(td0, file$c, 252, 4, 8294);
    			add_location(td1, file$c, 253, 4, 8313);
    			add_location(td2, file$c, 254, 4, 8327);
    			add_location(td3, file$c, 255, 4, 8341);
    			add_location(td4, file$c, 256, 4, 8355);
    			add_location(td5, file$c, 257, 4, 8369);
    			add_location(td6, file$c, 258, 4, 8383);
    			add_location(td7, file$c, 259, 4, 8420);
    			add_location(tr2, file$c, 251, 2, 8285);
    			attr_dev(table1, "class", "large styled");
    			add_location(table1, file$c, 218, 0, 7113);
    			add_location(hr1, file$c, 263, 0, 8471);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table0, anchor);
    			append_dev(table0, caption0);
    			append_dev(caption0, t0);
    			append_dev(caption0, t1);
    			append_dev(caption0, t2);
    			append_dev(caption0, label0);
    			append_dev(label0, input0);
    			input0.checked = /*totaux*/ ctx[2];
    			append_dev(label0, t3);
    			append_dev(caption0, t4);
    			append_dev(caption0, label1);
    			append_dev(label1, input1);
    			input1.checked = /*par_epaiss*/ ctx[8];
    			append_dev(label1, t5);
    			append_dev(caption0, t6);
    			append_dev(caption0, label2);
    			append_dev(label2, input2);
    			input2.checked = /*par_type*/ ctx[9];
    			append_dev(label2, t7);
    			append_dev(caption0, t8);
    			append_dev(table0, t9);
    			append_dev(table0, tr0);
    			append_dev(tr0, th0);
    			append_dev(th0, t10);
    			append_dev(tr0, t11);
    			append_dev(tr0, th1);
    			append_dev(th1, t12);
    			append_dev(tr0, t13);
    			append_dev(tr0, th2);
    			append_dev(th2, t14);
    			append_dev(tr0, t15);
    			append_dev(tr0, th3);
    			append_dev(th3, t16);
    			append_dev(tr0, t17);
    			append_dev(tr0, th4);
    			append_dev(th4, t18);
    			append_dev(tr0, t19);
    			if (if_block0) if_block0.m(tr0, null);
    			append_dev(tr0, t20);
    			if (if_block1) if_block1.m(tr0, null);
    			append_dev(table0, t21);
    			if (if_block2) if_block2.m(table0, null);
    			append_dev(table0, t22);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(table0, null);
    			}

    			insert_dev(target, t23, anchor);
    			insert_dev(target, hr0, anchor);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, table1, anchor);
    			append_dev(table1, caption1);
    			append_dev(caption1, t25);
    			append_dev(caption1, a);
    			append_dev(caption1, t27);
    			append_dev(table1, t28);
    			append_dev(table1, tr1);
    			append_dev(tr1, th5);
    			append_dev(th5, t29);
    			append_dev(th5, label3);
    			append_dev(label3, input3);
    			input3.checked = /*separer*/ ctx[7];
    			append_dev(label3, t30);
    			append_dev(th5, t31);
    			append_dev(tr1, t32);
    			append_dev(tr1, th6);
    			append_dev(tr1, t34);
    			append_dev(tr1, th7);
    			append_dev(tr1, t36);
    			append_dev(tr1, th8);
    			append_dev(tr1, t38);
    			append_dev(tr1, th9);
    			append_dev(tr1, t40);
    			append_dev(tr1, th10);
    			append_dev(tr1, t42);
    			append_dev(tr1, th11);
    			append_dev(th11, t43);
    			append_dev(th11, br0);
    			append_dev(th11, t44);
    			append_dev(th11, input4);
    			set_input_value(input4, /*cubemargin*/ ctx[4]);
    			append_dev(th11, t45);
    			append_dev(tr1, t46);
    			append_dev(tr1, th12);
    			append_dev(th12, t47);
    			append_dev(th12, br1);
    			append_dev(th12, input5);
    			set_input_value(input5, /*cubeprice*/ ctx[3]);
    			append_dev(table1, t48);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table1, null);
    			}

    			append_dev(table1, t49);
    			append_dev(table1, tr2);
    			append_dev(tr2, td0);
    			append_dev(tr2, t51);
    			append_dev(tr2, td1);
    			append_dev(tr2, t52);
    			append_dev(tr2, td2);
    			append_dev(tr2, t53);
    			append_dev(tr2, td3);
    			append_dev(tr2, t54);
    			append_dev(tr2, td4);
    			append_dev(tr2, t55);
    			append_dev(tr2, td5);
    			append_dev(tr2, t56);
    			append_dev(tr2, td6);
    			append_dev(td6, t57);
    			append_dev(tr2, t58);
    			append_dev(tr2, td7);
    			append_dev(td7, t59);
    			insert_dev(target, t60, anchor);
    			insert_dev(target, hr1, anchor);
    			insert_dev(target, t61, anchor);
    			mount_component(estimation, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[16]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[17]),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[18]),
    					listen_dev(a, "click", /*save*/ ctx[13], false, false, false),
    					listen_dev(input3, "change", /*input3_change_handler*/ ctx[21]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[22]),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[23])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*pieces*/ 2) && t1_value !== (t1_value = /*pieces*/ ctx[1].name + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*totaux*/ 4) {
    				input0.checked = /*totaux*/ ctx[2];
    			}

    			if (dirty[0] & /*par_epaiss*/ 256) {
    				input1.checked = /*par_epaiss*/ ctx[8];
    			}

    			if (dirty[0] & /*par_type*/ 512) {
    				input2.checked = /*par_type*/ ctx[9];
    			}

    			if (!current || dirty[0] & /*par_epaiss, par_type*/ 768 && th0_rowspan_value !== (th0_rowspan_value = /*par_epaiss*/ ctx[8] || /*par_type*/ ctx[9] ? 2 : 1)) {
    				attr_dev(th0, "rowspan", th0_rowspan_value);
    			}

    			if (!current || dirty[0] & /*par_epaiss, par_type*/ 768 && th1_rowspan_value !== (th1_rowspan_value = /*par_epaiss*/ ctx[8] || /*par_type*/ ctx[9] ? 2 : 1)) {
    				attr_dev(th1, "rowspan", th1_rowspan_value);
    			}

    			if (!current || dirty[0] & /*par_epaiss, par_type*/ 768 && th2_rowspan_value !== (th2_rowspan_value = /*par_epaiss*/ ctx[8] || /*par_type*/ ctx[9] ? 2 : 1)) {
    				attr_dev(th2, "rowspan", th2_rowspan_value);
    			}

    			if (!current || dirty[0] & /*par_epaiss, par_type*/ 768 && th3_rowspan_value !== (th3_rowspan_value = /*par_epaiss*/ ctx[8] || /*par_type*/ ctx[9] ? 2 : 1)) {
    				attr_dev(th3, "rowspan", th3_rowspan_value);
    			}

    			if (!current || dirty[0] & /*par_epaiss, par_type*/ 768 && th4_rowspan_value !== (th4_rowspan_value = /*par_epaiss*/ ctx[8] || /*par_type*/ ctx[9] ? 2 : 1)) {
    				attr_dev(th4, "rowspan", th4_rowspan_value);
    			}

    			if (/*par_epaiss*/ ctx[8]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_8(ctx);
    					if_block0.c();
    					if_block0.m(tr0, t20);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*par_type*/ ctx[9]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_7(ctx);
    					if_block1.c();
    					if_block1.m(tr0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*par_epaiss*/ ctx[8] || /*par_type*/ ctx[9]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_4(ctx);
    					if_block2.c();
    					if_block2.m(table0, t22);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty[0] & /*statistics, par_type, statistics_epaisseurs, par_epaiss*/ 4896) {
    				each_value_2 = /*statistics*/ ctx[5];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2$2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(table0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty[0] & /*separer*/ 128) {
    				input3.checked = /*separer*/ ctx[7];
    			}

    			if (dirty[0] & /*cubemargin*/ 16 && to_number(input4.value) !== /*cubemargin*/ ctx[4]) {
    				set_input_value(input4, /*cubemargin*/ ctx[4]);
    			}

    			if (dirty[0] & /*cubeprice*/ 8 && to_number(input5.value) !== /*cubeprice*/ ctx[3]) {
    				set_input_value(input5, /*cubeprice*/ ctx[3]);
    			}

    			if (dirty[0] & /*pieces3, cubeprice, cubemargin, separer*/ 216) {
    				each_value = /*pieces3*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table1, t49);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if ((!current || dirty[0] & /*total_cube*/ 1024) && t57_value !== (t57_value = /*total_cube*/ ctx[10].toFixed(9) + "")) set_data_dev(t57, t57_value);
    			if ((!current || dirty[0] & /*total_prix*/ 2048) && t59_value !== (t59_value = /*total_prix*/ ctx[11].toFixed(2) + "")) set_data_dev(t59, t59_value);
    			const estimation_changes = {};
    			if (dirty[0] & /*pieces*/ 2) estimation_changes.pieces = /*pieces*/ ctx[1];

    			if (!updating_estimations && dirty[0] & /*estimations*/ 1) {
    				updating_estimations = true;
    				estimation_changes.estimations = /*estimations*/ ctx[0];
    				add_flush_callback(() => updating_estimations = false);
    			}

    			estimation.$set(estimation_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(estimation.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(estimation.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table0);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(hr0);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(table1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t60);
    			if (detaching) detach_dev(hr1);
    			if (detaching) detach_dev(t61);
    			destroy_component(estimation, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function comparePieces(p1, p2) {
    	return p1.epaisseur < p2.epaisseur
    	? 1
    	: p1.epaisseur > p2.epaisseur
    		? -1
    		: p1.longueur < p2.longueur
    			? 1
    			: p1.longueur > p2.longueur
    				? -1
    				: p1.largeur < p2.largeur
    					? 1
    					: p1.largeur > p2.largeur ? -1 : 0;
    }

    function calculStatistics(total_group, totaux) {
    	//console.log("calculStatistics!!!!", total_group.individual().map(p => p.features))
    	return total_group.flat_groups("", totaux).map(group => {
    		const pieces_par_epaisseur = group.pieces.reduce(
    			(h, p) => ({
    				...h,
    				[p.epaisseur]: [...h[p.epaisseur] || [], p]
    			}),
    			{}
    		);

    		const stats_epaisseur = Object.keys(pieces_par_epaisseur).map(epaisseur => ({
    			epaisseur,
    			nb_pieces: pieces_par_epaisseur[epaisseur].length,
    			surface: pieces_par_epaisseur[epaisseur].reduce((s, p) => s + p.surface(), 0)
    		}));

    		const { xmin, xmax, ymin, ymax, zmin, zmax } = group.bounding_box();
    		const panneaux = group.pieces.filter(p => p.features.includes("panneau") || p.features.includes("panneau-seul"));

    		//console.log(group.name, JSON.stringify(group.pieces.map(p => p.features)))
    		return {
    			name: group.name,
    			dimension_x: xmax - xmin,
    			dimension_y: ymax - ymin,
    			dimension_z: zmax - zmin,
    			nb_tenons: group.pieces.reduce((n, p) => n + p.nombre_tenons, 0),
    			nb_pieces: group.pieces.length,
    			surface: group.surface(),
    			epaisseurs: stats_epaisseur,
    			nb_panneaux: panneaux.length,
    			m2_panneaux: panneaux.reduce((s, p) => s + p.surface(), 0)
    		};
    	}).filter(stat => stat.nb_pieces > 0);
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let pieces2;
    	let pieces3;
    	let total_cube;
    	let total_prix;
    	let statistics_epaisseurs;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ListeDebit", slots, []);
    	let { pieces = [] } = $$props;
    	let { merge = true } = $$props;
    	let { estimations } = $$props;
    	let separer = true;
    	let totaux = true;
    	let par_epaiss = false;
    	let par_type = true;
    	let cubeprice;
    	let cubemargin;

    	getContext("settings").subscribe(settings => {
    		$$invalidate(3, cubeprice = settings.cubeprice);
    		$$invalidate(4, cubemargin = settings.cubemargin);
    	});

    	let statistics = [];

    	function save() {
    		let lines = [
    			[
    				"Pièce",
    				"Qué",
    				"long",
    				"larg",
    				"ep",
    				"Arrasement",
    				"Surface (m²)",
    				"epaisseur plateau",
    				`Cubage (x${cubemargin}%)`,
    				`Prix au m³ (${cubeprice})`
    			].map(x => `"${x}"`).join(",")
    		];

    		if (separer) lines.push("");

    		for (let piece of pieces3) {
    			let data = [
    				piece.longueur,
    				piece.largeur,
    				piece.epaisseur,
    				piece.string_arrasement(),
    				piece.largeur * piece.longueur / 1000000,
    				piece.epaisseur_plateau,
    				((separer ? 1 : piece.que) * piece.cubage(cubemargin / 100)).toFixed(9),
    				((separer ? 1 : piece.que) * piece.prix(cubeprice, cubemargin / 100)).toFixed(2)
    			];

    			if (separer) {
    				var que = piece.que || 1;

    				for (name of piece.name_list) {
    					lines.push([name, que].concat(data).map(x => `"${x}"`).join(","));
    					que = "";
    				}

    				lines.push("");
    			} else {
    				lines.push([piece.name, piece.que || 1].concat(data).map(x => `"${x}"`).join(","));
    			}
    		}

    		lines.push([
    			"Total",
    			"",
    			"",
    			"",
    			"",
    			"",
    			"",
    			"",
    			total_cube.toFixed(9),
    			total_prix.toFixed(2)
    		].map(x => `"${x}"`).join(","));

    		let csv = "﻿" + lines.join("\n");
    		let filename = (prompt("Nom du fichier :", `débit - ${name}`) || "liste de débit") + ".csv";
    		let file = new window.File([csv], filename, { type: "text/csv" });
    		let url = URL.createObjectURL(file);

    		try {
    			let a = document.createElement("a");
    			a.href = url;
    			a.style.display = "none";
    			a.setAttribute("download", filename);
    			document.body.appendChild(a);
    			a.click();
    			document.body.removeChild(a);
    		} finally {
    			URL.revokeObjectURL(url);
    		}
    	}

    	const writable_props = ["pieces", "merge", "estimations"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ListeDebit> was created with unknown prop '${key}'`);
    	});

    	function input0_change_handler() {
    		totaux = this.checked;
    		$$invalidate(2, totaux);
    	}

    	function input1_change_handler() {
    		par_epaiss = this.checked;
    		$$invalidate(8, par_epaiss);
    	}

    	function input2_change_handler() {
    		par_type = this.checked;
    		$$invalidate(9, par_type);
    	}

    	const func = (ep, e) => e.epaisseur == ep;
    	const func_1 = (ep, e) => e.epaisseur == ep;

    	function input3_change_handler() {
    		separer = this.checked;
    		$$invalidate(7, separer);
    	}

    	function input4_input_handler() {
    		cubemargin = to_number(this.value);
    		$$invalidate(4, cubemargin);
    	}

    	function input5_input_handler() {
    		cubeprice = to_number(this.value);
    		$$invalidate(3, cubeprice);
    	}

    	function estimation_estimations_binding(value) {
    		estimations = value;
    		$$invalidate(0, estimations);
    	}

    	$$self.$$set = $$props => {
    		if ("pieces" in $$props) $$invalidate(1, pieces = $$props.pieces);
    		if ("merge" in $$props) $$invalidate(14, merge = $$props.merge);
    		if ("estimations" in $$props) $$invalidate(0, estimations = $$props.estimations);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		reduceToObject,
    		Group,
    		Estimation,
    		pieces,
    		merge,
    		estimations,
    		separer,
    		totaux,
    		par_epaiss,
    		par_type,
    		comparePieces,
    		cubeprice,
    		cubemargin,
    		statistics,
    		calculStatistics,
    		save,
    		pieces2,
    		pieces3,
    		total_cube,
    		total_prix,
    		statistics_epaisseurs
    	});

    	$$self.$inject_state = $$props => {
    		if ("pieces" in $$props) $$invalidate(1, pieces = $$props.pieces);
    		if ("merge" in $$props) $$invalidate(14, merge = $$props.merge);
    		if ("estimations" in $$props) $$invalidate(0, estimations = $$props.estimations);
    		if ("separer" in $$props) $$invalidate(7, separer = $$props.separer);
    		if ("totaux" in $$props) $$invalidate(2, totaux = $$props.totaux);
    		if ("par_epaiss" in $$props) $$invalidate(8, par_epaiss = $$props.par_epaiss);
    		if ("par_type" in $$props) $$invalidate(9, par_type = $$props.par_type);
    		if ("cubeprice" in $$props) $$invalidate(3, cubeprice = $$props.cubeprice);
    		if ("cubemargin" in $$props) $$invalidate(4, cubemargin = $$props.cubemargin);
    		if ("statistics" in $$props) $$invalidate(5, statistics = $$props.statistics);
    		if ("pieces2" in $$props) $$invalidate(15, pieces2 = $$props.pieces2);
    		if ("pieces3" in $$props) $$invalidate(6, pieces3 = $$props.pieces3);
    		if ("total_cube" in $$props) $$invalidate(10, total_cube = $$props.total_cube);
    		if ("total_prix" in $$props) $$invalidate(11, total_prix = $$props.total_prix);
    		if ("statistics_epaisseurs" in $$props) $$invalidate(12, statistics_epaisseurs = $$props.statistics_epaisseurs);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*pieces*/ 2) {
    			// Pièces, tableau non fusionné
    			 $$invalidate(15, pieces2 = pieces.pieces.reduce((res, p) => res.concat(p.individual()), []).map(p => !p.piece
    			? p
    			: p.piece.update_new({
    					...p.piece,
    					names: p.nom ? p.nom.split(" ") : p.piece.names,
    					que: quantite * (p.que || p.piece.que || 1)
    				})).sort(comparePieces));
    		}

    		if ($$self.$$.dirty[0] & /*merge, pieces2*/ 49152) {
    			// Pièces, tableau fusionné si merge == true
    			 $$invalidate(6, pieces3 = !merge
    			? pieces2
    			: Object.values(pieces2.reduce((map, p) => (map[p.signature()] = [...map[p.signature()] || [], p], map), {})).map(family => family.reduce((a, b) => a == null ? b : a.merge(b), null)).sort(comparePieces));
    		}

    		if ($$self.$$.dirty[0] & /*pieces3, cubemargin*/ 80) {
    			 $$invalidate(10, total_cube = pieces3.map(p => p.que * p.cubage(cubemargin / 100)).reduce((a, b) => a + b, 0));
    		}

    		if ($$self.$$.dirty[0] & /*pieces3, cubeprice, cubemargin*/ 88) {
    			 $$invalidate(11, total_prix = pieces3.map(p => p.que * p.prix(cubeprice, cubemargin / 100)).reduce((a, b) => a + b, 0));
    		}

    		if ($$self.$$.dirty[0] & /*pieces, totaux*/ 6) {
    			 $$invalidate(5, statistics = calculStatistics(pieces, totaux));
    		}

    		if ($$self.$$.dirty[0] & /*statistics*/ 32) {
    			 $$invalidate(12, statistics_epaisseurs = Object.keys(statistics.reduce(
    				(h, x) => {
    					x.epaisseurs.forEach(ep => h[ep.epaisseur] = true);
    					return h;
    				},
    				{}
    			)));
    		}
    	};

    	return [
    		estimations,
    		pieces,
    		totaux,
    		cubeprice,
    		cubemargin,
    		statistics,
    		pieces3,
    		separer,
    		par_epaiss,
    		par_type,
    		total_cube,
    		total_prix,
    		statistics_epaisseurs,
    		save,
    		merge,
    		pieces2,
    		input0_change_handler,
    		input1_change_handler,
    		input2_change_handler,
    		func,
    		func_1,
    		input3_change_handler,
    		input4_input_handler,
    		input5_input_handler,
    		estimation_estimations_binding
    	];
    }

    class ListeDebit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { pieces: 1, merge: 14, estimations: 0 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListeDebit",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*estimations*/ ctx[0] === undefined && !("estimations" in props)) {
    			console.warn("<ListeDebit> was created without expected prop 'estimations'");
    		}
    	}

    	get pieces() {
    		throw new Error("<ListeDebit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pieces(value) {
    		throw new Error("<ListeDebit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get merge() {
    		throw new Error("<ListeDebit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set merge(value) {
    		throw new Error("<ListeDebit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get estimations() {
    		throw new Error("<ListeDebit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set estimations(value) {
    		throw new Error("<ListeDebit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ensembles/Ensemble.svelte generated by Svelte v3.31.2 */

    const { console: console_1$4 } = globals;
    const file$d = "src/ensembles/Ensemble.svelte";

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	child_ctx[25] = i;
    	return child_ctx;
    }

    // (83:4) {#each pieces_drawings as pieces_d, i}
    function create_each_block$9(ctx) {
    	let div;
    	let svgdrawing;
    	let updating_zoom;
    	let t;
    	let div_data_count_value;
    	let current;

    	function svgdrawing_zoom_binding(value) {
    		/*svgdrawing_zoom_binding*/ ctx[12].call(null, value);
    	}

    	let svgdrawing_props = {
    		pieces: /*pieces_d*/ ctx[23] || [],
    		name: `Dessin ${/*i*/ ctx[25] + 1}`
    	};

    	if (/*zoom*/ ctx[8] !== void 0) {
    		svgdrawing_props.zoom = /*zoom*/ ctx[8];
    	}

    	svgdrawing = new SVGDrawing({ props: svgdrawing_props, $$inline: true });
    	binding_callbacks.push(() => bind(svgdrawing, "zoom", svgdrawing_zoom_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(svgdrawing.$$.fragment);
    			t = space();
    			attr_dev(div, "data-count", div_data_count_value = /*pieces*/ ctx[6].length);
    			add_location(div, file$d, 83, 6, 2291);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(svgdrawing, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const svgdrawing_changes = {};
    			if (dirty & /*pieces_drawings*/ 128) svgdrawing_changes.pieces = /*pieces_d*/ ctx[23] || [];

    			if (!updating_zoom && dirty & /*zoom*/ 256) {
    				updating_zoom = true;
    				svgdrawing_changes.zoom = /*zoom*/ ctx[8];
    				add_flush_callback(() => updating_zoom = false);
    			}

    			svgdrawing.$set(svgdrawing_changes);

    			if (!current || dirty & /*pieces*/ 64 && div_data_count_value !== (div_data_count_value = /*pieces*/ ctx[6].length)) {
    				attr_dev(div, "data-count", div_data_count_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgdrawing.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgdrawing.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(svgdrawing);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$9.name,
    		type: "each",
    		source: "(83:4) {#each pieces_drawings as pieces_d, i}",
    		ctx
    	});

    	return block;
    }

    // (81:2) <div slot="plan">
    function create_plan_slot(ctx) {
    	let div;
    	let h2;
    	let t0_value = /*data*/ ctx[5].name + "";
    	let t0;
    	let t1;
    	let a;
    	let t3;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*pieces_drawings*/ ctx[7];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$9(get_each_context$9(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			a = element("a");
    			a.textContent = "✎";
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(a, "href", "@");
    			add_location(a, file$d, 81, 20, 2186);
    			add_location(h2, file$d, 81, 4, 2170);
    			attr_dev(div, "slot", "plan");
    			add_location(div, file$d, 80, 2, 2148);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    			append_dev(h2, a);
    			append_dev(div, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*rename*/ ctx[9]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*data*/ 32) && t0_value !== (t0_value = /*data*/ ctx[5].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*pieces, pieces_drawings, zoom*/ 448) {
    				each_value = /*pieces_drawings*/ ctx[7];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$9(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$9(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_plan_slot.name,
    		type: "slot",
    		source: "(81:2) <div slot=\\\"plan\\\">",
    		ctx
    	});

    	return block;
    }

    // (90:2) <div slot="children">
    function create_children_slot(ctx) {
    	let div;
    	let childrenpositions;
    	let updating_childrenPos;
    	let updating_pieces;
    	let updating_pieces_drawings;
    	let current;

    	function childrenpositions_childrenPos_binding(value) {
    		/*childrenpositions_childrenPos_binding*/ ctx[13].call(null, value);
    	}

    	function childrenpositions_pieces_binding(value) {
    		/*childrenpositions_pieces_binding*/ ctx[14].call(null, value);
    	}

    	function childrenpositions_pieces_drawings_binding(value) {
    		/*childrenpositions_pieces_drawings_binding*/ ctx[15].call(null, value);
    	}

    	let childrenpositions_props = {
    		children: /*children*/ ctx[2],
    		childrenState: /*childrenState*/ ctx[4],
    		drawings: true
    	};

    	if (/*childrenPos*/ ctx[3] !== void 0) {
    		childrenpositions_props.childrenPos = /*childrenPos*/ ctx[3];
    	}

    	if (/*pieces*/ ctx[6] !== void 0) {
    		childrenpositions_props.pieces = /*pieces*/ ctx[6];
    	}

    	if (/*pieces_drawings*/ ctx[7] !== void 0) {
    		childrenpositions_props.pieces_drawings = /*pieces_drawings*/ ctx[7];
    	}

    	childrenpositions = new ChildrenPositions({
    			props: childrenpositions_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(childrenpositions, "childrenPos", childrenpositions_childrenPos_binding));
    	binding_callbacks.push(() => bind(childrenpositions, "pieces", childrenpositions_pieces_binding));
    	binding_callbacks.push(() => bind(childrenpositions, "pieces_drawings", childrenpositions_pieces_drawings_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(childrenpositions.$$.fragment);
    			attr_dev(div, "slot", "children");
    			add_location(div, file$d, 89, 2, 2448);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(childrenpositions, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const childrenpositions_changes = {};
    			if (dirty & /*children*/ 4) childrenpositions_changes.children = /*children*/ ctx[2];
    			if (dirty & /*childrenState*/ 16) childrenpositions_changes.childrenState = /*childrenState*/ ctx[4];

    			if (!updating_childrenPos && dirty & /*childrenPos*/ 8) {
    				updating_childrenPos = true;
    				childrenpositions_changes.childrenPos = /*childrenPos*/ ctx[3];
    				add_flush_callback(() => updating_childrenPos = false);
    			}

    			if (!updating_pieces && dirty & /*pieces*/ 64) {
    				updating_pieces = true;
    				childrenpositions_changes.pieces = /*pieces*/ ctx[6];
    				add_flush_callback(() => updating_pieces = false);
    			}

    			if (!updating_pieces_drawings && dirty & /*pieces_drawings*/ 128) {
    				updating_pieces_drawings = true;
    				childrenpositions_changes.pieces_drawings = /*pieces_drawings*/ ctx[7];
    				add_flush_callback(() => updating_pieces_drawings = false);
    			}

    			childrenpositions.$set(childrenpositions_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(childrenpositions.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(childrenpositions.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(childrenpositions);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_children_slot.name,
    		type: "slot",
    		source: "(90:2) <div slot=\\\"children\\\">",
    		ctx
    	});

    	return block;
    }

    // (100:2) <div slot="tables">
    function create_tables_slot(ctx) {
    	let div;
    	let listedebit;
    	let current;

    	listedebit = new ListeDebit({
    			props: {
    				pieces: new Group(/*pieces*/ ctx[6], `Ensemble ${/*data*/ ctx[5].name}`, "Ensemble")
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(listedebit.$$.fragment);
    			attr_dev(div, "slot", "tables");
    			add_location(div, file$d, 99, 2, 2701);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(listedebit, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listedebit_changes = {};
    			if (dirty & /*pieces, data*/ 96) listedebit_changes.pieces = new Group(/*pieces*/ ctx[6], `Ensemble ${/*data*/ ctx[5].name}`, "Ensemble");
    			listedebit.$set(listedebit_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listedebit.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listedebit.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(listedebit);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_tables_slot.name,
    		type: "slot",
    		source: "(100:2) <div slot=\\\"tables\\\">",
    		ctx
    	});

    	return block;
    }

    // (80:0) <Component bind:data={data} state={state} bind:children={children} bind:childrenState={childrenState} path={path} on:datachange>
    function create_default_slot(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(80:0) <Component bind:data={data} state={state} bind:children={children} bind:childrenState={childrenState} path={path} on:datachange>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let component;
    	let updating_data;
    	let updating_children;
    	let updating_childrenState;
    	let current;

    	function component_data_binding(value) {
    		/*component_data_binding*/ ctx[16].call(null, value);
    	}

    	function component_children_binding(value) {
    		/*component_children_binding*/ ctx[17].call(null, value);
    	}

    	function component_childrenState_binding(value) {
    		/*component_childrenState_binding*/ ctx[18].call(null, value);
    	}

    	let component_props = {
    		state: /*state*/ ctx[1],
    		path: /*path*/ ctx[0],
    		$$slots: {
    			default: [create_default_slot],
    			tables: [create_tables_slot],
    			children: [create_children_slot],
    			plan: [create_plan_slot]
    		},
    		$$scope: { ctx }
    	};

    	if (/*data*/ ctx[5] !== void 0) {
    		component_props.data = /*data*/ ctx[5];
    	}

    	if (/*children*/ ctx[2] !== void 0) {
    		component_props.children = /*children*/ ctx[2];
    	}

    	if (/*childrenState*/ ctx[4] !== void 0) {
    		component_props.childrenState = /*childrenState*/ ctx[4];
    	}

    	component = new Component({ props: component_props, $$inline: true });
    	binding_callbacks.push(() => bind(component, "data", component_data_binding));
    	binding_callbacks.push(() => bind(component, "children", component_children_binding));
    	binding_callbacks.push(() => bind(component, "childrenState", component_childrenState_binding));
    	component.$on("datachange", /*datachange_handler*/ ctx[19]);

    	const block = {
    		c: function create() {
    			create_component(component.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(component, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const component_changes = {};
    			if (dirty & /*state*/ 2) component_changes.state = /*state*/ ctx[1];
    			if (dirty & /*path*/ 1) component_changes.path = /*path*/ ctx[0];

    			if (dirty & /*$$scope, pieces, data, children, childrenState, childrenPos, pieces_drawings, zoom*/ 67109372) {
    				component_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_data && dirty & /*data*/ 32) {
    				updating_data = true;
    				component_changes.data = /*data*/ ctx[5];
    				add_flush_callback(() => updating_data = false);
    			}

    			if (!updating_children && dirty & /*children*/ 4) {
    				updating_children = true;
    				component_changes.children = /*children*/ ctx[2];
    				add_flush_callback(() => updating_children = false);
    			}

    			if (!updating_childrenState && dirty & /*childrenState*/ 16) {
    				updating_childrenState = true;
    				component_changes.childrenState = /*childrenState*/ ctx[4];
    				add_flush_callback(() => updating_childrenState = false);
    			}

    			component.$set(component_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(component.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(component.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(component, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Ensemble", slots, []);
    	let { name = null } = $$props;
    	let { path = "0" } = $$props;
    	let { initdata = {} } = $$props;
    	let { state = {} } = $$props;
    	let childrenState = [];

    	let defaults = {
    		children: [],
    		childrenPos: [],
    		type: "Ensemble",
    		id: 0
    	};

    	let children = initdata.children;
    	let childrenPos = initdata.childrenPos;

    	function initdataChanged(initdata) {
    		console.log("initdata changed");
    		$$invalidate(3, childrenPos = initdata.childrenPos);
    		$$invalidate(2, children = initdata.children);
    	}

    	let data;

    	function updateData(defaults, name, initdata, childrenPos, children) {
    		$$invalidate(5, data = {
    			...defaults,
    			name,
    			...initdata,
    			childrenPos,
    			children
    		});
    	}

    	let pieces = [];
    	let pieces_drawings = [];
    	let zoom = 0.5;

    	//$: console.log(pieces_drawings)
    	function rename() {
    		$$invalidate(5, data.name = prompt(`Renommer "${data.name}" en :`, data.name) || data.name, data);
    	}

    	const writable_props = ["name", "path", "initdata", "state"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<Ensemble> was created with unknown prop '${key}'`);
    	});

    	function svgdrawing_zoom_binding(value) {
    		zoom = value;
    		$$invalidate(8, zoom);
    	}

    	function childrenpositions_childrenPos_binding(value) {
    		childrenPos = value;
    		$$invalidate(3, childrenPos);
    	}

    	function childrenpositions_pieces_binding(value) {
    		pieces = value;
    		$$invalidate(6, pieces);
    	}

    	function childrenpositions_pieces_drawings_binding(value) {
    		pieces_drawings = value;
    		$$invalidate(7, pieces_drawings);
    	}

    	function component_data_binding(value) {
    		data = value;
    		$$invalidate(5, data);
    	}

    	function component_children_binding(value) {
    		children = value;
    		$$invalidate(2, children);
    	}

    	function component_childrenState_binding(value) {
    		childrenState = value;
    		$$invalidate(4, childrenState);
    	}

    	function datachange_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(10, name = $$props.name);
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("initdata" in $$props) $$invalidate(11, initdata = $$props.initdata);
    		if ("state" in $$props) $$invalidate(1, state = $$props.state);
    	};

    	$$self.$capture_state = () => ({
    		SVGDrawing,
    		Group,
    		Component,
    		ChildrenPositions,
    		ListeDebit,
    		InputNumber,
    		InputCheckbox,
    		name,
    		path,
    		initdata,
    		state,
    		childrenState,
    		defaults,
    		children,
    		childrenPos,
    		initdataChanged,
    		data,
    		updateData,
    		pieces,
    		pieces_drawings,
    		zoom,
    		rename
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(10, name = $$props.name);
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("initdata" in $$props) $$invalidate(11, initdata = $$props.initdata);
    		if ("state" in $$props) $$invalidate(1, state = $$props.state);
    		if ("childrenState" in $$props) $$invalidate(4, childrenState = $$props.childrenState);
    		if ("defaults" in $$props) $$invalidate(20, defaults = $$props.defaults);
    		if ("children" in $$props) $$invalidate(2, children = $$props.children);
    		if ("childrenPos" in $$props) $$invalidate(3, childrenPos = $$props.childrenPos);
    		if ("data" in $$props) $$invalidate(5, data = $$props.data);
    		if ("pieces" in $$props) $$invalidate(6, pieces = $$props.pieces);
    		if ("pieces_drawings" in $$props) $$invalidate(7, pieces_drawings = $$props.pieces_drawings);
    		if ("zoom" in $$props) $$invalidate(8, zoom = $$props.zoom);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*initdata*/ 2048) {
    			// These two lines are causing an infinite loop (especially the childrenPos
    			// one). When the ChildrenPositions component below modifies the childrenPos
    			// property through its binding, both childrenPos and defaults are
    			// invalidated, although defaults was never modified. The solution is to hide
    			// to svelte the relationship between those two properties in a function.
    			//$: childrenPos = initdata.childrenPos
    			//$: children = initdata.children
    			 initdataChanged(initdata);
    		}

    		if ($$self.$$.dirty & /*name, initdata, childrenPos, children*/ 3084) {
    			//$: data = {
    			//  ...defaults,
    			//  name,
    			//  ...initdata,
    			//  childrenPos,
    			//  children,
    			//}
    			// Use updateData else svelte wrongly invalidates initdata (and others) when
    			// data is set.
    			 updateData(defaults, name, initdata, childrenPos, children);
    		}
    	};

    	return [
    		path,
    		state,
    		children,
    		childrenPos,
    		childrenState,
    		data,
    		pieces,
    		pieces_drawings,
    		zoom,
    		rename,
    		name,
    		initdata,
    		svgdrawing_zoom_binding,
    		childrenpositions_childrenPos_binding,
    		childrenpositions_pieces_binding,
    		childrenpositions_pieces_drawings_binding,
    		component_data_binding,
    		component_children_binding,
    		component_childrenState_binding,
    		datachange_handler
    	];
    }

    class Ensemble extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			name: 10,
    			path: 0,
    			initdata: 11,
    			state: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ensemble",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get name() {
    		throw new Error("<Ensemble>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Ensemble>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<Ensemble>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Ensemble>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get initdata() {
    		throw new Error("<Ensemble>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set initdata(value) {
    		throw new Error("<Ensemble>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Ensemble>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Ensemble>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/controls/InputSelect.svelte generated by Svelte v3.31.2 */

    const file$e = "src/controls/InputSelect.svelte";

    // (36:2) {#if def != null}
    function create_if_block$7(ctx) {
    	let option;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(/*defname*/ ctx[3]);
    			t1 = text(" (par défaut)");
    			option.__value = /*default_value_id*/ ctx[5];
    			option.value = option.__value;
    			add_location(option, file$e, 36, 2, 986);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*defname*/ 8) set_data_dev(t0, /*defname*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(36:2) {#if def != null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let select_1;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*def*/ ctx[0] != null && create_if_block$7(ctx);
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

    	const block = {
    		c: function create() {
    			select_1 = element("select");
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			if (default_slot) default_slot.c();
    			attr_dev(select_1, "class", "svelte-if5jk6");
    			if (/*inner_val*/ ctx[2] === void 0) add_render_callback(() => /*select_1_change_handler*/ ctx[11].call(select_1));
    			toggle_class(select_1, "error", /*error*/ ctx[4]);
    			add_location(select_1, file$e, 34, 0, 893);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select_1, anchor);
    			if (if_block) if_block.m(select_1, null);
    			append_dev(select_1, if_block_anchor);

    			if (default_slot) {
    				default_slot.m(select_1, null);
    			}

    			select_option(select_1, /*inner_val*/ ctx[2]);
    			/*select_1_binding*/ ctx[12](select_1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select_1, "change", /*select_1_change_handler*/ ctx[11]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*def*/ ctx[0] != null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(select_1, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 512) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, null, null);
    				}
    			}

    			if (dirty & /*inner_val*/ 4) {
    				select_option(select_1, /*inner_val*/ ctx[2]);
    			}

    			if (dirty & /*error*/ 16) {
    				toggle_class(select_1, "error", /*error*/ ctx[4]);
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
    			if (detaching) detach_dev(select_1);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			/*select_1_binding*/ ctx[12](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let error;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InputSelect", slots, ['default']);
    	let { value = null } = $$props;
    	let { def = null } = $$props;
    	let { force = false } = $$props;
    	let { init = null } = $$props;
    	if (init != null && value == null) value = init;
    	let defname = def;
    	let select;
    	let default_value_id = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    	let inner_val = def != null && value == null ? default_value_id : value;

    	function findDefName(select) {
    		if (!select) return;
    		let option = Array.from(select.options).find(op => op.value == def);
    		if (option) $$invalidate(3, defname = option.textContent);
    	}

    	const writable_props = ["value", "def", "force", "init"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InputSelect> was created with unknown prop '${key}'`);
    	});

    	function select_1_change_handler() {
    		inner_val = select_value(this);
    		$$invalidate(2, inner_val);
    	}

    	function select_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			select = $$value;
    			$$invalidate(1, select);
    			$$invalidate(5, default_value_id);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(6, value = $$props.value);
    		if ("def" in $$props) $$invalidate(0, def = $$props.def);
    		if ("force" in $$props) $$invalidate(7, force = $$props.force);
    		if ("init" in $$props) $$invalidate(8, init = $$props.init);
    		if ("$$scope" in $$props) $$invalidate(9, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		value,
    		def,
    		force,
    		init,
    		defname,
    		select,
    		default_value_id,
    		inner_val,
    		findDefName,
    		error
    	});

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(6, value = $$props.value);
    		if ("def" in $$props) $$invalidate(0, def = $$props.def);
    		if ("force" in $$props) $$invalidate(7, force = $$props.force);
    		if ("init" in $$props) $$invalidate(8, init = $$props.init);
    		if ("defname" in $$props) $$invalidate(3, defname = $$props.defname);
    		if ("select" in $$props) $$invalidate(1, select = $$props.select);
    		if ("default_value_id" in $$props) $$invalidate(5, default_value_id = $$props.default_value_id);
    		if ("inner_val" in $$props) $$invalidate(2, inner_val = $$props.inner_val);
    		if ("error" in $$props) $$invalidate(4, error = $$props.error);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*def, inner_val*/ 5) {
    			 $$invalidate(6, value = def != null && inner_val == default_value_id
    			? null
    			: inner_val);
    		}

    		if ($$self.$$.dirty & /*select*/ 2) {
    			 findDefName(select);
    		}

    		if ($$self.$$.dirty & /*force, value, def*/ 193) {
    			 $$invalidate(4, error = force && value != null && value != def);
    		}
    	};

    	return [
    		def,
    		select,
    		inner_val,
    		defname,
    		error,
    		default_value_id,
    		value,
    		force,
    		init,
    		$$scope,
    		slots,
    		select_1_change_handler,
    		select_1_binding
    	];
    }

    class InputSelect extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { value: 6, def: 0, force: 7, init: 8 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputSelect",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get value() {
    		throw new Error("<InputSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<InputSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get def() {
    		throw new Error("<InputSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set def(value) {
    		throw new Error("<InputSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get force() {
    		throw new Error("<InputSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set force(value) {
    		throw new Error("<InputSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get init() {
    		throw new Error("<InputSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set init(value) {
    		throw new Error("<InputSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/draw/Cote.svelte generated by Svelte v3.31.2 */

    const file$f = "src/draw/Cote.svelte";

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (27:0) {#each dim2 as d}
    function create_each_block$a(ctx) {
    	let circle0;
    	let circle0_cx_value;
    	let circle0_cy_value;
    	let circle1;
    	let circle1_cx_value;
    	let circle1_cy_value;
    	let text_1;
    	let t0_value = /*d*/ ctx[9].text + "";
    	let t0;
    	let t1_value = /*d*/ ctx[9].length + "";
    	let t1;
    	let t2_value = /*d*/ ctx[9].text_suffix + "";
    	let t2;
    	let text_1_x_value;
    	let text_1_y_value;
    	let line0;
    	let line0_x__value;
    	let line0_y__value;
    	let line0_x__value_1;
    	let line0_y__value_1;
    	let line1;
    	let line1_x__value;
    	let line1_y__value;
    	let line1_x__value_1;
    	let line1_y__value_1;
    	let line2;
    	let line2_x__value;
    	let line2_y__value;
    	let line2_x__value_1;
    	let line2_y__value_1;

    	const block = {
    		c: function create() {
    			circle0 = svg_element("circle");
    			circle1 = svg_element("circle");
    			text_1 = svg_element("text");
    			t0 = text(t0_value);
    			t1 = text(t1_value);
    			t2 = text(t2_value);
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			line2 = svg_element("line");
    			attr_dev(circle0, "cx", circle0_cx_value = /*d*/ ctx[9].zstart);
    			attr_dev(circle0, "cy", circle0_cy_value = 20 * /*d*/ ctx[9].row + 15);
    			attr_dev(circle0, "r", "2");
    			attr_dev(circle0, "stroke", "black");
    			attr_dev(circle0, "stroke-width", "1");
    			attr_dev(circle0, "fill", "white");
    			add_location(circle0, file$f, 27, 0, 514);
    			attr_dev(circle1, "cx", circle1_cx_value = /*d*/ ctx[9].zstart + /*d*/ ctx[9].zlength);
    			attr_dev(circle1, "cy", circle1_cy_value = 20 * /*d*/ ctx[9].row + 15);
    			attr_dev(circle1, "r", "2");
    			attr_dev(circle1, "stroke", "black");
    			attr_dev(circle1, "stroke-width", "1");
    			attr_dev(circle1, "fill", "white");
    			add_location(circle1, file$f, 33, 0, 636);
    			attr_dev(text_1, "x", text_1_x_value = /*d*/ ctx[9].zstart + /*d*/ ctx[9].zlength / 2);
    			attr_dev(text_1, "y", text_1_y_value = 20 * /*d*/ ctx[9].row + 13);
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "font-size", "10pt");
    			add_location(text_1, file$f, 39, 0, 757);
    			attr_dev(line0, "x1", line0_x__value = /*d*/ ctx[9].zstart - 5 * /*reverse*/ ctx[2]);
    			attr_dev(line0, "y1", line0_y__value = 20 * /*d*/ ctx[9].row + 15);
    			attr_dev(line0, "x2", line0_x__value_1 = /*d*/ ctx[9].zstart + /*d*/ ctx[9].zlength + 5 * /*reverse*/ ctx[2]);
    			attr_dev(line0, "y2", line0_y__value_1 = 20 * /*d*/ ctx[9].row + 15);
    			set_style(line0, "stroke-width", "1");
    			set_style(line0, "stroke", "rgb(0,0,0)");
    			add_location(line0, file$f, 44, 0, 899);
    			attr_dev(line1, "x1", line1_x__value = /*d*/ ctx[9].zstart);
    			attr_dev(line1, "y1", line1_y__value = 20 * /*d*/ ctx[9].row + 10);
    			attr_dev(line1, "x2", line1_x__value_1 = /*d*/ ctx[9].zstart);
    			attr_dev(line1, "y2", line1_y__value_1 = 20 * /*d*/ ctx[9].row + 19);
    			set_style(line1, "stroke-width", "1");
    			set_style(line1, "stroke", "rgb(0,0,0)");
    			add_location(line1, file$f, 48, 0, 1069);
    			attr_dev(line2, "x1", line2_x__value = /*d*/ ctx[9].zstart + /*d*/ ctx[9].zlength);
    			attr_dev(line2, "y1", line2_y__value = 20 * /*d*/ ctx[9].row + 10);
    			attr_dev(line2, "x2", line2_x__value_1 = /*d*/ ctx[9].zstart + /*d*/ ctx[9].zlength);
    			attr_dev(line2, "y2", line2_y__value_1 = 20 * /*d*/ ctx[9].row + 19);
    			set_style(line2, "stroke-width", "1");
    			set_style(line2, "stroke", "rgb(0,0,0)");
    			add_location(line2, file$f, 52, 0, 1224);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle0, anchor);
    			insert_dev(target, circle1, anchor);
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t0);
    			append_dev(text_1, t1);
    			append_dev(text_1, t2);
    			insert_dev(target, line0, anchor);
    			insert_dev(target, line1, anchor);
    			insert_dev(target, line2, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dim2*/ 16 && circle0_cx_value !== (circle0_cx_value = /*d*/ ctx[9].zstart)) {
    				attr_dev(circle0, "cx", circle0_cx_value);
    			}

    			if (dirty & /*dim2*/ 16 && circle0_cy_value !== (circle0_cy_value = 20 * /*d*/ ctx[9].row + 15)) {
    				attr_dev(circle0, "cy", circle0_cy_value);
    			}

    			if (dirty & /*dim2*/ 16 && circle1_cx_value !== (circle1_cx_value = /*d*/ ctx[9].zstart + /*d*/ ctx[9].zlength)) {
    				attr_dev(circle1, "cx", circle1_cx_value);
    			}

    			if (dirty & /*dim2*/ 16 && circle1_cy_value !== (circle1_cy_value = 20 * /*d*/ ctx[9].row + 15)) {
    				attr_dev(circle1, "cy", circle1_cy_value);
    			}

    			if (dirty & /*dim2*/ 16 && t0_value !== (t0_value = /*d*/ ctx[9].text + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*dim2*/ 16 && t1_value !== (t1_value = /*d*/ ctx[9].length + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*dim2*/ 16 && t2_value !== (t2_value = /*d*/ ctx[9].text_suffix + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*dim2*/ 16 && text_1_x_value !== (text_1_x_value = /*d*/ ctx[9].zstart + /*d*/ ctx[9].zlength / 2)) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*dim2*/ 16 && text_1_y_value !== (text_1_y_value = 20 * /*d*/ ctx[9].row + 13)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}

    			if (dirty & /*dim2, reverse*/ 20 && line0_x__value !== (line0_x__value = /*d*/ ctx[9].zstart - 5 * /*reverse*/ ctx[2])) {
    				attr_dev(line0, "x1", line0_x__value);
    			}

    			if (dirty & /*dim2*/ 16 && line0_y__value !== (line0_y__value = 20 * /*d*/ ctx[9].row + 15)) {
    				attr_dev(line0, "y1", line0_y__value);
    			}

    			if (dirty & /*dim2, reverse*/ 20 && line0_x__value_1 !== (line0_x__value_1 = /*d*/ ctx[9].zstart + /*d*/ ctx[9].zlength + 5 * /*reverse*/ ctx[2])) {
    				attr_dev(line0, "x2", line0_x__value_1);
    			}

    			if (dirty & /*dim2*/ 16 && line0_y__value_1 !== (line0_y__value_1 = 20 * /*d*/ ctx[9].row + 15)) {
    				attr_dev(line0, "y2", line0_y__value_1);
    			}

    			if (dirty & /*dim2*/ 16 && line1_x__value !== (line1_x__value = /*d*/ ctx[9].zstart)) {
    				attr_dev(line1, "x1", line1_x__value);
    			}

    			if (dirty & /*dim2*/ 16 && line1_y__value !== (line1_y__value = 20 * /*d*/ ctx[9].row + 10)) {
    				attr_dev(line1, "y1", line1_y__value);
    			}

    			if (dirty & /*dim2*/ 16 && line1_x__value_1 !== (line1_x__value_1 = /*d*/ ctx[9].zstart)) {
    				attr_dev(line1, "x2", line1_x__value_1);
    			}

    			if (dirty & /*dim2*/ 16 && line1_y__value_1 !== (line1_y__value_1 = 20 * /*d*/ ctx[9].row + 19)) {
    				attr_dev(line1, "y2", line1_y__value_1);
    			}

    			if (dirty & /*dim2*/ 16 && line2_x__value !== (line2_x__value = /*d*/ ctx[9].zstart + /*d*/ ctx[9].zlength)) {
    				attr_dev(line2, "x1", line2_x__value);
    			}

    			if (dirty & /*dim2*/ 16 && line2_y__value !== (line2_y__value = 20 * /*d*/ ctx[9].row + 10)) {
    				attr_dev(line2, "y1", line2_y__value);
    			}

    			if (dirty & /*dim2*/ 16 && line2_x__value_1 !== (line2_x__value_1 = /*d*/ ctx[9].zstart + /*d*/ ctx[9].zlength)) {
    				attr_dev(line2, "x2", line2_x__value_1);
    			}

    			if (dirty & /*dim2*/ 16 && line2_y__value_1 !== (line2_y__value_1 = 20 * /*d*/ ctx[9].row + 19)) {
    				attr_dev(line2, "y2", line2_y__value_1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle0);
    			if (detaching) detach_dev(circle1);
    			if (detaching) detach_dev(text_1);
    			if (detaching) detach_dev(line0);
    			if (detaching) detach_dev(line1);
    			if (detaching) detach_dev(line2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$a.name,
    		type: "each",
    		source: "(27:0) {#each dim2 as d}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let g;
    	let g_transform_value;
    	let each_value = /*dim2*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$a(get_each_context$a(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g, "transform", g_transform_value = "translate(" + /*x*/ ctx[0] + ", " + /*y*/ ctx[1] + ") " + /*rotate*/ ctx[3]);
    			add_location(g, file$f, 25, 0, 451);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dim2, reverse*/ 20) {
    				each_value = /*dim2*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$a(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$a(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*x, y, rotate*/ 11 && g_transform_value !== (g_transform_value = "translate(" + /*x*/ ctx[0] + ", " + /*y*/ ctx[1] + ") " + /*rotate*/ ctx[3])) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let rotate;
    	let reverse;
    	let dim2;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Cote", slots, []);
    	let { dim = [] } = $$props;
    	let { zoom = 1 } = $$props;
    	let { suffix = "" } = $$props;
    	let { pos = "top" } = $$props;
    	let { x = 0 } = $$props;
    	let { y = 0 } = $$props;
    	const writable_props = ["dim", "zoom", "suffix", "pos", "x", "y"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cote> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("dim" in $$props) $$invalidate(5, dim = $$props.dim);
    		if ("zoom" in $$props) $$invalidate(6, zoom = $$props.zoom);
    		if ("suffix" in $$props) $$invalidate(7, suffix = $$props.suffix);
    		if ("pos" in $$props) $$invalidate(8, pos = $$props.pos);
    		if ("x" in $$props) $$invalidate(0, x = $$props.x);
    		if ("y" in $$props) $$invalidate(1, y = $$props.y);
    	};

    	$$self.$capture_state = () => ({
    		dim,
    		zoom,
    		suffix,
    		pos,
    		x,
    		y,
    		rotate,
    		reverse,
    		dim2
    	});

    	$$self.$inject_state = $$props => {
    		if ("dim" in $$props) $$invalidate(5, dim = $$props.dim);
    		if ("zoom" in $$props) $$invalidate(6, zoom = $$props.zoom);
    		if ("suffix" in $$props) $$invalidate(7, suffix = $$props.suffix);
    		if ("pos" in $$props) $$invalidate(8, pos = $$props.pos);
    		if ("x" in $$props) $$invalidate(0, x = $$props.x);
    		if ("y" in $$props) $$invalidate(1, y = $$props.y);
    		if ("rotate" in $$props) $$invalidate(3, rotate = $$props.rotate);
    		if ("reverse" in $$props) $$invalidate(2, reverse = $$props.reverse);
    		if ("dim2" in $$props) $$invalidate(4, dim2 = $$props.dim2);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*pos*/ 256) {
    			 $$invalidate(3, rotate = pos == "left" ? "rotate(-90)" : "");
    		}

    		if ($$self.$$.dirty & /*pos*/ 256) {
    			 $$invalidate(2, reverse = pos == "left" ? -1 : 1);
    		}

    		if ($$self.$$.dirty & /*dim, suffix, zoom, reverse*/ 228) {
    			 $$invalidate(4, dim2 = dim.map(x => ({
    				row: 0,
    				text: "",
    				text_suffix: suffix,
    				...x,
    				zstart: zoom * x.start * reverse,
    				zlength: zoom * x.length * reverse
    			})));
    		}
    	};

    	return [x, y, reverse, rotate, dim2, dim, zoom, suffix, pos];
    }

    class Cote extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			dim: 5,
    			zoom: 6,
    			suffix: 7,
    			pos: 8,
    			x: 0,
    			y: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cote",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get dim() {
    		throw new Error("<Cote>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dim(value) {
    		throw new Error("<Cote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zoom() {
    		throw new Error("<Cote>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zoom(value) {
    		throw new Error("<Cote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get suffix() {
    		throw new Error("<Cote>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set suffix(value) {
    		throw new Error("<Cote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pos() {
    		throw new Error("<Cote>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pos(value) {
    		throw new Error("<Cote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<Cote>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Cote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Cote>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Cote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    class Piece {

      constructor() {
        this.type       = 'Piece';
        this.longueur   = 0;
        this.largeur    = 0;
        this.epaisseur  = 0;
        this.arrasement = 0;
        this.x          = 0;
        this.y          = 0;
        this.z          = 0;
        this.orient     = 'xyz';
        this.names      = [];
        this.que        = 1;
        this.features   = [];
      }

      update(props) {
        if (props.features && props.features.length == 1 && props.features[0] == true) {
          console.log("WARNING: incorrect feature %o", props);
          throw new Exception()
        }
        return this.update_new({...this, props})
      }

      update_new(props) {
        let res = Object.assign(Object.create(Piece.prototype), props);
        if (res.features && res.features.length == 1 && res.features[0] == true) {
          console.log("WARNING: incorrect feature %o", res);
          throw new Exception()
        }
        return res
      }

      get epaisseur_plateau() {
        return (this.epaisseur <= 20 - 3) ? 20 :
               (this.epaisseur <= 27 - 3) ? 27 :
               (this.epaisseur <= 35 - 3) ? 35 :
               this.epaisseur + 10;
      }

      get nombre_tenons(){
        return (this.longueur_tenon1 ? 1 : 0) +
               (this.longueur_tenon2 ? 1 : 0)
      }

      get name(){
        return this.names.join(' ')
      }

      get name_list(){
        return (this.names_list || [this.names]).map(n => n.join(' '))
      }

      set_name() {
        return this.update_new({
          ...this,
          names: Array.from(arguments).filter(x => x),
        })
      }

      add_name() {
        return this.update_new({
          ...this,
          names: this.names.concat(Array.from(arguments).filter(x => x)),
        })
      }

      prefix_name() {
        return this.update_new({
          ...this,
          names: Array.from(arguments).filter(x => x).concat(this.names),
        })
      }

      // add features to the piece if they do not exist yet
      // example: group.add_features("traverse", "traverse-tenonee")
      add_features() {
        return this.update_new({
          ...this,
          features: [...this.features, ...Array.from(arguments).filter(x => x && !this.features.includes(x))],
        })
      }

      count_features() {
        return Array.from(arguments,
          feat => [feat, this.features.includes(feat) ? this.que : 0])
          .reduce(reduceToObject(0, 1), {})
      }

      multiply_que(que){
        return this.update_new({
          ...this,
          que: this.que * que
        })
      }

      build(longueur, largeur, epaisseur) {
        return this.update_new({
          ...this,
          arrasement:      longueur  || this.arrasement,
          longueur:        longueur  || this.longueur,
          largeur:         largeur   || this.largeur,
          epaisseur:       epaisseur || this.epaisseur,
        })
      }

      ajout_tenons(longueur_tenon1, longueur_tenon2) {
        if(longueur_tenon2 === undefined) longueur_tenon2 = longueur_tenon1;
        return this.update_new({
          ...this,
          arrasement:      this.arrasement || this.longueur,
          longueur:        this.longueur + longueur_tenon1 + longueur_tenon2,
          longueur_tenon1: (this.longueur_tenon1 || 0) + longueur_tenon1,
          longueur_tenon2: (this.longueur_tenon2 || 0) + longueur_tenon2,
        })
      }

      usine_tenons(longueur_tenon1, longueur_tenon2) {
        if(longueur_tenon2 === undefined) longueur_tenon2 = longueur_tenon1;
        return this.update_new({
          ...this,
          arrasement:      this.arrasement - longueur_tenon1 - longueur_tenon2,
          longueur_tenon1: (this.longueur_tenon1 || 0) + longueur_tenon1,
          longueur_tenon2: (this.longueur_tenon2 || 0) + longueur_tenon2,
        })
      }

      //  rx  ry  rz    x   y   z     orienté comme
      //
      //  0   0   0     ep  la  Lo    traverse coté       la  ep  Lo    une traverse de haut/bas direction av/ar
      //  0   0   1     la  ep  Lo    traverse bas av/ar  ep  la  Lo    une traverse de coté direction av/ar
      //  0   1   0     Lo  la  ep    traverse de porte   Lo  ep  la    une traverse de haut/bas direction g/d
      //  1   0   0     ep  Lo  la    montant coté        la  Lo  ep    un montant de porte
      //
      //  0   1   1     la  Lo  ep    montant porte       ep  Lo  la    un montant de coté
      //  1   1   0     la  Lo  ep    montant porte       ep  Lo  la    un montant de coté
      //  1   0   1     la  Lo  ep    montant porte       Lo  la  ep    une traverse de porte
      //  1   1   1     Lo  la  ep    traverse de porte
      //
      //  rotation  x   y   z   comme
      //            ep  la  Lo  traverse coté
      //  x         ep  Lo  la  montant coté
      //  y         Lo  la  ep  traverse de porte
      //  z         la  ep  Lo  traverse horizontale av/ar
      //  xy        la  Lo  ep  montant de porte
      //  xz        Lo  ep  la  traverse horizontale g/d
      //  yx        Lo  ep  la  traverse horizontale g/d
      //  yz        la  Lo  ep  montant de porte
      //  zx        la  Lo  ep  montant de porte
      //  zy        Lo  ep  la  traverse horizontale g/d
      //
      //  orientation   x   y   z
      //  xyz           Lo  la  ep    traverse de porte
      //  xzy           Lo  ep  la    traverse horiz g/d
      //  yxz           la  Lo  ep    montant de porte
      //  yzx           ep  Lo  la    montant de coté
      //  zxy           la  ep  Lo    traverse horiz av/ar
      //  zyx           ep  la  Lo    traverse de coté
      put(x, y, z, orient){
        return this.update_new({
          ...this,
          'x':      x || this.x,
          'y':      y || this.y,
          'z':      z || this.z,
          'orient': orient ? get_orient(orient) : this.orient,
        })
      }

      // axis := 'x' | 'y' | 'z' | 'X' | 'Y' | 'Z'
      // dim1 := 'longueur' | 'arrasement' | 'longueur_tenon1' | 'longueur_tenon2' | 0
      // dim2 := 'largeur' | 0
      // dim3 := 'epaisseur' | 0
      // returns [translation, dimension] (negated if axis is uppercase)
      dim(axis, dim1, dim2, dim3){
        dim1 = dim1 == undefined ? 'longueur'  : dim1;
        dim2 = dim2 == undefined ? 'largeur'   : dim2;
        dim3 = dim3 == undefined ? 'epaisseur' : dim3;
        let sign = (axis == axis.toLowerCase()) ? 1 : -1;
        axis = axis.toLowerCase();
        let dims = [
          dim1 == 0 ? 0 : this[dim1] || 0,
          dim2 == 0 ? 0 : this[dim2] || 0,
          dim3 == 0 ? 0 : this[dim3] || 0];
        return [sign*this[axis], sign*dims[this.orient.indexOf(axis)]]
      }

      bounding_box(){
        let [xmin, dx] = this.dim('x');
        let [ymin, dy] = this.dim('y');
        let [zmin, dz] = this.dim('z');
        return {
          dx, dy, dz,
          xmin, ymin, zmin,
          xmax: xmin + dx,
          ymax: ymin + dy,
          zmax: zmin + dz,
        }
      }

      projection_polyline(pos){
        pos = get_position(pos);
        let [x, dx] = this.dim(pos[0]);
        let [y, dy] = this.dim(pos[1]);
        let [_1, t1x] = this.dim(pos[0], 'longueur_tenon1', 0, 0);
        let [_2, t2x] = this.dim(pos[0], 'longueur_tenon2', 0, 0);
        let [_3, t1y] = this.dim(pos[1], 'longueur_tenon1', 0, 0);
        let [_4, t2y] = this.dim(pos[1], 'longueur_tenon2', 0, 0);
        //console.log(this)
        //console.log([pos, x, dx, y, dy])
        //console.log([pos[0], this.orient.indexOf(pos[0]), t1x, t2x])
        //console.log([pos[1], this.orient.indexOf(pos[1]), t1y, t2y])
        let dx1  = Math.floor(dx/3);
        let dx2 = dx - dx1;
        let dy1  = Math.floor(dy/3);
        let dy2 = dy - dy1;
        return [
          // t1y: tenon ou face du bas
          [x+t1x,     y+t1y],
          [x+dx1,     y+t1y],
          [x+dx1,     y],
          [x+dx2,     y],
          [x+dx2,     y+t1y],
          // t2x: tenon ou face de droite
          [x+dx-t2x,  y+t1y],
          [x+dx-t2x,  y+dy1],
          [x+dx,      y+dy1],
          [x+dx,      y+dy2],
          [x+dx-t2x,  y+dy2],
          // t2y: tenon ou face du haut
          [x+dx-t2x,  y+dy-t2y],
          [x+dx2,     y+dy-t2y],
          [x+dx2,     y+dy],
          [x+dx1,     y+dy],
          [x+dx1,     y+dy-t2y],
          // t1x: tenon ou face gauche
          [x+t1x,     y+dy-t2y],
          [x+t1x,     y+dy2],
          [x,         y+dy2],
          [x,         y+dy1],
          [x+t1x,     y+dy1],
          // fermeture de la figure
          [x+t1x,     y+t1y],
        ].map(c => [c[0], -c[1]])
      }

      string_arrasement(){
        if (this.arrasement && this.arrasement != this.longueur) {
          return this.arrasement
        } else {
          return ''
        }
      }

      string_dimentions(){
        return `${this.longueur} x ${this.largeur} x ${this.epaisseur}`
      }

      string_dimentions_plateau(){
        return `${this.longueur} x ${this.largeur} x ${this.epaisseur_plateau}`
      }

      surface(){
        return this.longueur * this.largeur * 1e-6
      }

      cubage(factor) {
        return this.longueur * this.largeur * this.epaisseur_plateau * 1e-9 * (factor || 1)
      }

      prix(prix_cube, factor) {
        return this.cubage(factor) * prix_cube
      }

      individual(){
        return [this]
      }

      signature() {
        return JSON.stringify(
          Object.keys(this)
            .sort()
            .filter(k => (! ['names', 'names_list', 'x', 'y', 'z', 'orient', 'que'].includes(k)))
            .map(k => [k, this[k]])
            .reduce((a, b) => a.concat(b), []))
      }

      merge(other){
        console.assert(this.signature() == other.signature());
        return this.update_new({
          ...this,
          que:   (this.que || 1) + (other.que || 1),
          names_list: [...(this.names_list||[this.names]), other.names],
          names: this.names
            .filter((n) => other.names.includes(n))
            .concat(this.names.filter((n) => !other.names.includes(n) && !other.names.includes(`(${n})`)).map(x => x[0] == '(' ? x : `(${x})`))
            .concat(other.names.filter((n) => !this.names.includes(n) && !this.names.includes(`(${n})`)).map(x => x[0] == '(' ? x : `(${x})`))
        })
      }
    }

    /* src/ensembles/Porte.svelte generated by Svelte v3.31.2 */
    const file$g = "src/ensembles/Porte.svelte";

    function get_each_context$b(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[38] = list[i];
    	return child_ctx;
    }

    // (197:8) {#each pieces as piece}
    function create_each_block$b(ctx) {
    	let svgpiece;
    	let current;

    	svgpiece = new SVGPiece({
    			props: { piece: /*piece*/ ctx[38], pos: "avant" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(svgpiece.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(svgpiece, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const svgpiece_changes = {};
    			if (dirty[0] & /*pieces*/ 128) svgpiece_changes.piece = /*piece*/ ctx[38];
    			svgpiece.$set(svgpiece_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgpiece.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgpiece.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(svgpiece, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$b.name,
    		type: "each",
    		source: "(197:8) {#each pieces as piece}",
    		ctx
    	});

    	return block;
    }

    // (156:2) <div slot="plan">
    function create_plan_slot$1(ctx) {
    	let div;
    	let svgdrawing;
    	let t0;
    	let p;
    	let t1;
    	let input;
    	let t2;
    	let t3_value = /*zoom*/ ctx[9] * 100 + "";
    	let t3;
    	let t4;
    	let t5;
    	let svg;
    	let cote0;
    	let cote1;
    	let g;
    	let g_transform_value;
    	let svg_width_value;
    	let svg_height_value;
    	let current;
    	let mounted;
    	let dispose;

    	svgdrawing = new SVGDrawing({
    			props: {
    				pieces: /*pieces*/ ctx[7],
    				name: `Porte ${/*data*/ ctx[1].name}`
    			},
    			$$inline: true
    		});

    	cote0 = new Cote({
    			props: {
    				zoom: /*zoom*/ ctx[9],
    				x: "20",
    				y: "0",
    				dim: [
    					{
    						text: "largeur: ",
    						start: 0,
    						length: /*opt*/ ctx[2].largeur,
    						row: 2
    					},
    					{
    						text: "lon. traverse: ",
    						start: /*traverse_h*/ ctx[6].x,
    						length: /*traverse_h*/ ctx[6].longueur,
    						row: 1
    					},
    					{
    						start: /*montant_g*/ ctx[4].x,
    						length: /*montant_g*/ ctx[4].largeur,
    						row: 0
    					},
    					{
    						start: /*montant_d*/ ctx[5].x,
    						length: /*montant_d*/ ctx[5].largeur,
    						row: 0
    					}
    				]
    			},
    			$$inline: true
    		});

    	cote1 = new Cote({
    			props: {
    				zoom: /*zoom*/ ctx[9],
    				x: "0",
    				y: "60",
    				pos: "left",
    				dim: [
    					{
    						text: "hauteur: ",
    						start: 0,
    						length: /*opt*/ ctx[2].hauteur,
    						row: 0
    					}
    				]
    			},
    			$$inline: true
    		});

    	let each_value = /*pieces*/ ctx[7];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$b(get_each_context$b(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(svgdrawing.$$.fragment);
    			t0 = space();
    			p = element("p");
    			t1 = text("Zoom : ");
    			input = element("input");
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = text(" %");
    			t5 = space();
    			svg = svg_element("svg");
    			create_component(cote0.$$.fragment);
    			create_component(cote1.$$.fragment);
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(input, "type", "range");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "max", "1");
    			attr_dev(input, "step", ".05");
    			add_location(input, file$g, 159, 14, 4871);
    			add_location(p, file$g, 159, 4, 4861);
    			attr_dev(g, "transform", g_transform_value = "translate(20, " + (60 + /*zoom*/ ctx[9] * /*opt*/ ctx[2].hauteur) + ") scale(" + /*zoom*/ ctx[9] + " " + /*zoom*/ ctx[9] + ")");
    			add_location(g, file$g, 195, 6, 5808);
    			attr_dev(svg, "width", svg_width_value = /*zoom*/ ctx[9] * /*opt*/ ctx[2].largeur + 25);
    			attr_dev(svg, "height", svg_height_value = /*zoom*/ ctx[9] * /*opt*/ ctx[2].hauteur + 65);
    			add_location(svg, file$g, 160, 4, 4950);
    			attr_dev(div, "slot", "plan");
    			add_location(div, file$g, 155, 2, 4740);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(svgdrawing, div, null);
    			append_dev(div, t0);
    			append_dev(div, p);
    			append_dev(p, t1);
    			append_dev(p, input);
    			set_input_value(input, /*zoom*/ ctx[9]);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(div, t5);
    			append_dev(div, svg);
    			mount_component(cote0, svg, null);
    			mount_component(cote1, svg, null);
    			append_dev(svg, g);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_input_handler*/ ctx[18]),
    					listen_dev(input, "input", /*input_change_input_handler*/ ctx[18])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const svgdrawing_changes = {};
    			if (dirty[0] & /*pieces*/ 128) svgdrawing_changes.pieces = /*pieces*/ ctx[7];
    			if (dirty[0] & /*data*/ 2) svgdrawing_changes.name = `Porte ${/*data*/ ctx[1].name}`;
    			svgdrawing.$set(svgdrawing_changes);

    			if (dirty[0] & /*zoom*/ 512) {
    				set_input_value(input, /*zoom*/ ctx[9]);
    			}

    			if ((!current || dirty[0] & /*zoom*/ 512) && t3_value !== (t3_value = /*zoom*/ ctx[9] * 100 + "")) set_data_dev(t3, t3_value);
    			const cote0_changes = {};
    			if (dirty[0] & /*zoom*/ 512) cote0_changes.zoom = /*zoom*/ ctx[9];

    			if (dirty[0] & /*opt, traverse_h, montant_g, montant_d*/ 116) cote0_changes.dim = [
    				{
    					text: "largeur: ",
    					start: 0,
    					length: /*opt*/ ctx[2].largeur,
    					row: 2
    				},
    				{
    					text: "lon. traverse: ",
    					start: /*traverse_h*/ ctx[6].x,
    					length: /*traverse_h*/ ctx[6].longueur,
    					row: 1
    				},
    				{
    					start: /*montant_g*/ ctx[4].x,
    					length: /*montant_g*/ ctx[4].largeur,
    					row: 0
    				},
    				{
    					start: /*montant_d*/ ctx[5].x,
    					length: /*montant_d*/ ctx[5].largeur,
    					row: 0
    				}
    			];

    			cote0.$set(cote0_changes);
    			const cote1_changes = {};
    			if (dirty[0] & /*zoom*/ 512) cote1_changes.zoom = /*zoom*/ ctx[9];

    			if (dirty[0] & /*opt*/ 4) cote1_changes.dim = [
    				{
    					text: "hauteur: ",
    					start: 0,
    					length: /*opt*/ ctx[2].hauteur,
    					row: 0
    				}
    			];

    			cote1.$set(cote1_changes);

    			if (dirty[0] & /*pieces*/ 128) {
    				each_value = /*pieces*/ ctx[7];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$b(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$b(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(g, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty[0] & /*zoom, opt*/ 516 && g_transform_value !== (g_transform_value = "translate(20, " + (60 + /*zoom*/ ctx[9] * /*opt*/ ctx[2].hauteur) + ") scale(" + /*zoom*/ ctx[9] + " " + /*zoom*/ ctx[9] + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}

    			if (!current || dirty[0] & /*zoom, opt*/ 516 && svg_width_value !== (svg_width_value = /*zoom*/ ctx[9] * /*opt*/ ctx[2].largeur + 25)) {
    				attr_dev(svg, "width", svg_width_value);
    			}

    			if (!current || dirty[0] & /*zoom, opt*/ 516 && svg_height_value !== (svg_height_value = /*zoom*/ ctx[9] * /*opt*/ ctx[2].hauteur + 65)) {
    				attr_dev(svg, "height", svg_height_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgdrawing.$$.fragment, local);
    			transition_in(cote0.$$.fragment, local);
    			transition_in(cote1.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgdrawing.$$.fragment, local);
    			transition_out(cote0.$$.fragment, local);
    			transition_out(cote1.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(svgdrawing);
    			destroy_component(cote0);
    			destroy_component(cote1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_plan_slot$1.name,
    		type: "slot",
    		source: "(156:2) <div slot=\\\"plan\\\">",
    		ctx
    	});

    	return block;
    }

    // (211:6) <InputSelect def={defaults.ferrage} bind:value={ui.ferrage} force={defaults.force_ferrage}>
    function create_default_slot_2(ctx) {
    	let option0;
    	let t1;
    	let option1;

    	const block = {
    		c: function create() {
    			option0 = element("option");
    			option0.textContent = "aucun";
    			t1 = space();
    			option1 = element("option");
    			option1.textContent = "charnières";
    			option0.__value = "aucun";
    			option0.value = option0.__value;
    			attr_dev(option0, "class", "svelte-18serza");
    			add_location(option0, file$g, 211, 8, 6340);
    			option1.__value = "charnieres";
    			option1.value = option1.__value;
    			attr_dev(option1, "class", "svelte-18serza");
    			add_location(option1, file$g, 212, 8, 6385);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, option1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(option1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(211:6) <InputSelect def={defaults.ferrage} bind:value={ui.ferrage} force={defaults.force_ferrage}>",
    		ctx
    	});

    	return block;
    }

    // (218:6) <InputSelect def={defaults.type} bind:value={ui.type}>
    function create_default_slot_1(ctx) {
    	let option0;
    	let t1;
    	let option1;

    	const block = {
    		c: function create() {
    			option0 = element("option");
    			option0.textContent = "tenon et mortaise";
    			t1 = space();
    			option1 = element("option");
    			option1.textContent = "contre profil";
    			option0.__value = "tenon-mortaise";
    			option0.value = option0.__value;
    			attr_dev(option0, "class", "svelte-18serza");
    			add_location(option0, file$g, 218, 8, 6574);
    			option1.__value = "contre-profil";
    			option1.value = option1.__value;
    			attr_dev(option1, "class", "svelte-18serza");
    			add_location(option1, file$g, 219, 8, 6640);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, option1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(option1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(218:6) <InputSelect def={defaults.type} bind:value={ui.type}>",
    		ctx
    	});

    	return block;
    }

    // (237:43) 
    function create_if_block_1$7(ctx) {
    	let label;
    	let span;
    	let inputnumber;
    	let updating_value;
    	let t1;
    	let current;

    	function inputnumber_value_binding_1(value) {
    		/*inputnumber_value_binding_1*/ ctx[32].call(null, value);
    	}

    	let inputnumber_props = {
    		min: "0",
    		def: /*defaults*/ ctx[10].profondeur_profil
    	};

    	if (/*ui*/ ctx[3].profondeur_profil !== void 0) {
    		inputnumber_props.value = /*ui*/ ctx[3].profondeur_profil;
    	}

    	inputnumber = new InputNumber({ props: inputnumber_props, $$inline: true });
    	binding_callbacks.push(() => bind(inputnumber, "value", inputnumber_value_binding_1));

    	const block = {
    		c: function create() {
    			label = element("label");
    			span = element("span");
    			span.textContent = "Profondeur profil : ";
    			create_component(inputnumber.$$.fragment);
    			t1 = text(" mm");
    			attr_dev(span, "class", "svelte-18serza");
    			add_location(span, file$g, 237, 11, 8421);
    			attr_dev(label, "class", "svelte-18serza");
    			add_location(label, file$g, 237, 4, 8414);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, span);
    			mount_component(inputnumber, label, null);
    			append_dev(label, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const inputnumber_changes = {};

    			if (!updating_value && dirty[0] & /*ui*/ 8) {
    				updating_value = true;
    				inputnumber_changes.value = /*ui*/ ctx[3].profondeur_profil;
    				add_flush_callback(() => updating_value = false);
    			}

    			inputnumber.$set(inputnumber_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputnumber.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputnumber.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			destroy_component(inputnumber);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$7.name,
    		type: "if",
    		source: "(237:43) ",
    		ctx
    	});

    	return block;
    }

    // (235:4) {#if opt.type == 'tenon-mortaise' }
    function create_if_block$8(ctx) {
    	let label;
    	let span;
    	let inputnumber;
    	let updating_value;
    	let t1;
    	let current;

    	function inputnumber_value_binding(value) {
    		/*inputnumber_value_binding*/ ctx[31].call(null, value);
    	}

    	let inputnumber_props = {
    		min: "0",
    		def: /*defaults*/ ctx[10].profondeur_tenons
    	};

    	if (/*ui*/ ctx[3].profondeur_tenons !== void 0) {
    		inputnumber_props.value = /*ui*/ ctx[3].profondeur_tenons;
    	}

    	inputnumber = new InputNumber({ props: inputnumber_props, $$inline: true });
    	binding_callbacks.push(() => bind(inputnumber, "value", inputnumber_value_binding));

    	const block = {
    		c: function create() {
    			label = element("label");
    			span = element("span");
    			span.textContent = "Profondeur tenons : ";
    			create_component(inputnumber.$$.fragment);
    			t1 = text(" mm");
    			attr_dev(span, "class", "svelte-18serza");
    			add_location(span, file$g, 235, 11, 8234);
    			attr_dev(label, "class", "svelte-18serza");
    			add_location(label, file$g, 235, 4, 8227);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, span);
    			mount_component(inputnumber, label, null);
    			append_dev(label, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const inputnumber_changes = {};

    			if (!updating_value && dirty[0] & /*ui*/ 8) {
    				updating_value = true;
    				inputnumber_changes.value = /*ui*/ ctx[3].profondeur_tenons;
    				add_flush_callback(() => updating_value = false);
    			}

    			inputnumber.$set(inputnumber_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputnumber.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputnumber.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			destroy_component(inputnumber);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(235:4) {#if opt.type == 'tenon-mortaise' }",
    		ctx
    	});

    	return block;
    }

    // (204:2) <div class="main" slot="dim">
    function create_dim_slot(ctx) {
    	let div;
    	let form;
    	let label0;
    	let span0;
    	let t1;
    	let inputselect0;
    	let updating_value;
    	let t2;
    	let label1;
    	let span1;
    	let t4;
    	let inputselect1;
    	let updating_value_1;
    	let t5;
    	let label2;
    	let span2;
    	let inputnumber0;
    	let updating_value_2;
    	let t7;
    	let t8;
    	let label3;
    	let span3;
    	let inputnumber1;
    	let updating_value_3;
    	let t10;
    	let t11;
    	let label4;
    	let span4;
    	let inputnumber2;
    	let updating_value_4;
    	let t13;
    	let t14;
    	let hr0;
    	let t15;
    	let label5;
    	let span5;
    	let inputnumber3;
    	let updating_value_5;
    	let t17;
    	let t18;
    	let label6;
    	let span6;
    	let inputnumber4;
    	let updating_value_6;
    	let t20;
    	let t21;
    	let label7;
    	let span7;
    	let inputnumber5;
    	let updating_value_7;
    	let t23;
    	let t24;
    	let label8;
    	let span8;
    	let inputnumber6;
    	let updating_value_8;
    	let t26;
    	let t27;
    	let hr1;
    	let t28;
    	let label9;
    	let span9;
    	let inputnumber7;
    	let updating_value_9;
    	let t30;
    	let t31;
    	let label10;
    	let span10;
    	let inputnumber8;
    	let updating_value_10;
    	let t33;
    	let t34;
    	let label11;
    	let span11;
    	let inputnumber9;
    	let updating_value_11;
    	let t36;
    	let t37;
    	let current_block_type_index;
    	let if_block;
    	let t38;
    	let label12;
    	let span12;
    	let inputcheckbox0;
    	let updating_checked;
    	let t40;
    	let hr2;
    	let t41;
    	let label13;
    	let span13;
    	let inputcheckbox1;
    	let updating_checked_1;
    	let t43;
    	let label14;
    	let span14;
    	let inputnumber10;
    	let updating_value_12;
    	let t45;
    	let current;

    	function inputselect0_value_binding(value) {
    		/*inputselect0_value_binding*/ ctx[19].call(null, value);
    	}

    	let inputselect0_props = {
    		def: /*defaults*/ ctx[10].ferrage,
    		force: /*defaults*/ ctx[10].force_ferrage,
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	};

    	if (/*ui*/ ctx[3].ferrage !== void 0) {
    		inputselect0_props.value = /*ui*/ ctx[3].ferrage;
    	}

    	inputselect0 = new InputSelect({
    			props: inputselect0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputselect0, "value", inputselect0_value_binding));

    	function inputselect1_value_binding(value) {
    		/*inputselect1_value_binding*/ ctx[20].call(null, value);
    	}

    	let inputselect1_props = {
    		def: /*defaults*/ ctx[10].type,
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	if (/*ui*/ ctx[3].type !== void 0) {
    		inputselect1_props.value = /*ui*/ ctx[3].type;
    	}

    	inputselect1 = new InputSelect({
    			props: inputselect1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputselect1, "value", inputselect1_value_binding));

    	function inputnumber0_value_binding(value) {
    		/*inputnumber0_value_binding*/ ctx[21].call(null, value);
    	}

    	let inputnumber0_props = {
    		min: "0",
    		def: /*defaults*/ ctx[10].largeur,
    		force: /*defaults*/ ctx[10].force_largeur
    	};

    	if (/*ui*/ ctx[3].largeur !== void 0) {
    		inputnumber0_props.value = /*ui*/ ctx[3].largeur;
    	}

    	inputnumber0 = new InputNumber({
    			props: inputnumber0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber0, "value", inputnumber0_value_binding));

    	function inputnumber1_value_binding(value) {
    		/*inputnumber1_value_binding*/ ctx[22].call(null, value);
    	}

    	let inputnumber1_props = {
    		min: "0",
    		def: /*defaults*/ ctx[10].hauteur,
    		force: /*defaults*/ ctx[10].force_hauteur
    	};

    	if (/*ui*/ ctx[3].hauteur !== void 0) {
    		inputnumber1_props.value = /*ui*/ ctx[3].hauteur;
    	}

    	inputnumber1 = new InputNumber({
    			props: inputnumber1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber1, "value", inputnumber1_value_binding));

    	function inputnumber2_value_binding(value) {
    		/*inputnumber2_value_binding*/ ctx[23].call(null, value);
    	}

    	let inputnumber2_props = {
    		min: "0",
    		def: /*defaults*/ ctx[10].epaisseur,
    		force: /*defaults*/ ctx[10].force_epaisseur
    	};

    	if (/*ui*/ ctx[3].epaisseur !== void 0) {
    		inputnumber2_props.value = /*ui*/ ctx[3].epaisseur;
    	}

    	inputnumber2 = new InputNumber({
    			props: inputnumber2_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber2, "value", inputnumber2_value_binding));

    	function inputnumber3_value_binding(value) {
    		/*inputnumber3_value_binding*/ ctx[24].call(null, value);
    	}

    	let inputnumber3_props = {
    		min: "0",
    		def: /*defaults*/ ctx[10].largeur_montants
    	};

    	if (/*ui*/ ctx[3].largeur_montants !== void 0) {
    		inputnumber3_props.value = /*ui*/ ctx[3].largeur_montants;
    	}

    	inputnumber3 = new InputNumber({
    			props: inputnumber3_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber3, "value", inputnumber3_value_binding));

    	function inputnumber4_value_binding(value) {
    		/*inputnumber4_value_binding*/ ctx[25].call(null, value);
    	}

    	let inputnumber4_props = {
    		min: "0",
    		def: /*defaults*/ ctx[10].largeur_traverses
    	};

    	if (/*ui*/ ctx[3].largeur_traverses !== void 0) {
    		inputnumber4_props.value = /*ui*/ ctx[3].largeur_traverses;
    	}

    	inputnumber4 = new InputNumber({
    			props: inputnumber4_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber4, "value", inputnumber4_value_binding));

    	function inputnumber5_value_binding(value) {
    		/*inputnumber5_value_binding*/ ctx[26].call(null, value);
    	}

    	let inputnumber5_props = {
    		min: "0",
    		def: /*opt*/ ctx[2].largeur_traverses
    	};

    	if (/*ui*/ ctx[3].largeur_traverse_h !== void 0) {
    		inputnumber5_props.value = /*ui*/ ctx[3].largeur_traverse_h;
    	}

    	inputnumber5 = new InputNumber({
    			props: inputnumber5_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber5, "value", inputnumber5_value_binding));

    	function inputnumber6_value_binding(value) {
    		/*inputnumber6_value_binding*/ ctx[27].call(null, value);
    	}

    	let inputnumber6_props = {
    		min: "0",
    		def: /*opt*/ ctx[2].largeur_traverses
    	};

    	if (/*ui*/ ctx[3].largeur_traverse_b !== void 0) {
    		inputnumber6_props.value = /*ui*/ ctx[3].largeur_traverse_b;
    	}

    	inputnumber6 = new InputNumber({
    			props: inputnumber6_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber6, "value", inputnumber6_value_binding));

    	function inputnumber7_value_binding(value) {
    		/*inputnumber7_value_binding*/ ctx[28].call(null, value);
    	}

    	let inputnumber7_props = {
    		min: "0",
    		def: /*defaults*/ ctx[10].epaisseur_panneau
    	};

    	if (/*ui*/ ctx[3].epaisseur_panneau !== void 0) {
    		inputnumber7_props.value = /*ui*/ ctx[3].epaisseur_panneau;
    	}

    	inputnumber7 = new InputNumber({
    			props: inputnumber7_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber7, "value", inputnumber7_value_binding));

    	function inputnumber8_value_binding(value) {
    		/*inputnumber8_value_binding*/ ctx[29].call(null, value);
    	}

    	let inputnumber8_props = {
    		min: "0",
    		def: /*defaults*/ ctx[10].profondeur_rainure
    	};

    	if (/*ui*/ ctx[3].profondeur_rainure !== void 0) {
    		inputnumber8_props.value = /*ui*/ ctx[3].profondeur_rainure;
    	}

    	inputnumber8 = new InputNumber({
    			props: inputnumber8_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber8, "value", inputnumber8_value_binding));

    	function inputnumber9_value_binding(value) {
    		/*inputnumber9_value_binding*/ ctx[30].call(null, value);
    	}

    	let inputnumber9_props = {
    		min: "0",
    		def: /*defaults*/ ctx[10].jeu_rainure
    	};

    	if (/*ui*/ ctx[3].jeu_rainure !== void 0) {
    		inputnumber9_props.value = /*ui*/ ctx[3].jeu_rainure;
    	}

    	inputnumber9 = new InputNumber({
    			props: inputnumber9_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber9, "value", inputnumber9_value_binding));
    	const if_block_creators = [create_if_block$8, create_if_block_1$7];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*opt*/ ctx[2].type == "tenon-mortaise") return 0;
    		if (/*opt*/ ctx[2].type == "contre-profil") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	function inputcheckbox0_checked_binding(value) {
    		/*inputcheckbox0_checked_binding*/ ctx[33].call(null, value);
    	}

    	let inputcheckbox0_props = {
    		def: /*defaults*/ ctx[10].inclure_panneau
    	};

    	if (/*ui*/ ctx[3].inclure_panneau !== void 0) {
    		inputcheckbox0_props.checked = /*ui*/ ctx[3].inclure_panneau;
    	}

    	inputcheckbox0 = new InputCheckbox({
    			props: inputcheckbox0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputcheckbox0, "checked", inputcheckbox0_checked_binding));

    	function inputcheckbox1_checked_binding(value) {
    		/*inputcheckbox1_checked_binding*/ ctx[34].call(null, value);
    	}

    	let inputcheckbox1_props = { def: /*defaults*/ ctx[10].encastree };

    	if (/*ui*/ ctx[3].encastree !== void 0) {
    		inputcheckbox1_props.checked = /*ui*/ ctx[3].encastree;
    	}

    	inputcheckbox1 = new InputCheckbox({
    			props: inputcheckbox1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputcheckbox1, "checked", inputcheckbox1_checked_binding));

    	function inputnumber10_value_binding(value) {
    		/*inputnumber10_value_binding*/ ctx[35].call(null, value);
    	}

    	let inputnumber10_props = {
    		min: "0",
    		def: /*defaults*/ ctx[10].jeu_encastrement
    	};

    	if (/*ui*/ ctx[3].jeu_encastrement !== void 0) {
    		inputnumber10_props.value = /*ui*/ ctx[3].jeu_encastrement;
    	}

    	inputnumber10 = new InputNumber({
    			props: inputnumber10_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber10, "value", inputnumber10_value_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			form = element("form");
    			label0 = element("label");
    			span0 = element("span");
    			span0.textContent = "Ferrage :";
    			t1 = space();
    			create_component(inputselect0.$$.fragment);
    			t2 = space();
    			label1 = element("label");
    			span1 = element("span");
    			span1.textContent = "Type :";
    			t4 = space();
    			create_component(inputselect1.$$.fragment);
    			t5 = space();
    			label2 = element("label");
    			span2 = element("span");
    			span2.textContent = "Largeur   : ";
    			create_component(inputnumber0.$$.fragment);
    			t7 = text(" mm");
    			t8 = space();
    			label3 = element("label");
    			span3 = element("span");
    			span3.textContent = "Hauteur   : ";
    			create_component(inputnumber1.$$.fragment);
    			t10 = text(" mm");
    			t11 = space();
    			label4 = element("label");
    			span4 = element("span");
    			span4.textContent = "Épaisseur : ";
    			create_component(inputnumber2.$$.fragment);
    			t13 = text(" mm");
    			t14 = space();
    			hr0 = element("hr");
    			t15 = space();
    			label5 = element("label");
    			span5 = element("span");
    			span5.textContent = "Largeur montants : ";
    			create_component(inputnumber3.$$.fragment);
    			t17 = text(" mm");
    			t18 = space();
    			label6 = element("label");
    			span6 = element("span");
    			span6.textContent = "largeur traverses : ";
    			create_component(inputnumber4.$$.fragment);
    			t20 = text(" mm");
    			t21 = space();
    			label7 = element("label");
    			span7 = element("span");
    			span7.textContent = "largeur traverse haut : ";
    			create_component(inputnumber5.$$.fragment);
    			t23 = text(" mm");
    			t24 = space();
    			label8 = element("label");
    			span8 = element("span");
    			span8.textContent = "largeur traverse bas : ";
    			create_component(inputnumber6.$$.fragment);
    			t26 = text(" mm");
    			t27 = space();
    			hr1 = element("hr");
    			t28 = space();
    			label9 = element("label");
    			span9 = element("span");
    			span9.textContent = "Épaisseur panneau : ";
    			create_component(inputnumber7.$$.fragment);
    			t30 = text(" mm");
    			t31 = space();
    			label10 = element("label");
    			span10 = element("span");
    			span10.textContent = "Profondeur rainures : ";
    			create_component(inputnumber8.$$.fragment);
    			t33 = text(" mm");
    			t34 = space();
    			label11 = element("label");
    			span11 = element("span");
    			span11.textContent = "Jeu paneau / rainure : ";
    			create_component(inputnumber9.$$.fragment);
    			t36 = text(" mm");
    			t37 = space();
    			if (if_block) if_block.c();
    			t38 = space();
    			label12 = element("label");
    			span12 = element("span");
    			span12.textContent = "Inclure le paneau";
    			create_component(inputcheckbox0.$$.fragment);
    			t40 = space();
    			hr2 = element("hr");
    			t41 = space();
    			label13 = element("label");
    			span13 = element("span");
    			span13.textContent = "Encastrée";
    			create_component(inputcheckbox1.$$.fragment);
    			t43 = space();
    			label14 = element("label");
    			span14 = element("span");
    			span14.textContent = "jeu encastrement (tout autour) : ";
    			create_component(inputnumber10.$$.fragment);
    			t45 = text(" mm");
    			attr_dev(span0, "class", "svelte-18serza");
    			add_location(span0, file$g, 209, 6, 6210);
    			attr_dev(label0, "class", "svelte-18serza");
    			add_location(label0, file$g, 208, 4, 6196);
    			attr_dev(span1, "class", "svelte-18serza");
    			add_location(span1, file$g, 216, 6, 6484);
    			attr_dev(label1, "class", "svelte-18serza");
    			add_location(label1, file$g, 215, 4, 6470);
    			attr_dev(span2, "class", "svelte-18serza");
    			add_location(span2, file$g, 222, 11, 6738);
    			attr_dev(label2, "class", "svelte-18serza");
    			add_location(label2, file$g, 222, 4, 6731);
    			attr_dev(span3, "class", "svelte-18serza");
    			add_location(span3, file$g, 223, 11, 6884);
    			attr_dev(label3, "class", "svelte-18serza");
    			add_location(label3, file$g, 223, 4, 6877);
    			attr_dev(span4, "class", "svelte-18serza");
    			add_location(span4, file$g, 224, 11, 7030);
    			attr_dev(label4, "class", "svelte-18serza");
    			add_location(label4, file$g, 224, 4, 7023);
    			attr_dev(hr0, "class", "svelte-18serza");
    			add_location(hr0, file$g, 225, 4, 7175);
    			attr_dev(span5, "class", "svelte-18serza");
    			add_location(span5, file$g, 226, 11, 7192);
    			attr_dev(label5, "class", "svelte-18serza");
    			add_location(label5, file$g, 226, 4, 7185);
    			attr_dev(span6, "class", "svelte-18serza");
    			add_location(span6, file$g, 227, 11, 7332);
    			attr_dev(label6, "class", "svelte-18serza");
    			add_location(label6, file$g, 227, 4, 7325);
    			attr_dev(span7, "class", "svelte-18serza");
    			add_location(span7, file$g, 228, 11, 7475);
    			attr_dev(label7, "class", "svelte-18serza");
    			add_location(label7, file$g, 228, 4, 7468);
    			attr_dev(span8, "class", "svelte-18serza");
    			add_location(span8, file$g, 229, 11, 7618);
    			attr_dev(label8, "class", "svelte-18serza");
    			add_location(label8, file$g, 229, 4, 7611);
    			attr_dev(hr1, "class", "svelte-18serza");
    			add_location(hr1, file$g, 230, 4, 7753);
    			attr_dev(span9, "class", "svelte-18serza");
    			add_location(span9, file$g, 231, 11, 7770);
    			attr_dev(label9, "class", "svelte-18serza");
    			add_location(label9, file$g, 231, 4, 7763);
    			attr_dev(span10, "class", "svelte-18serza");
    			add_location(span10, file$g, 232, 11, 7913);
    			attr_dev(label10, "class", "svelte-18serza");
    			add_location(label10, file$g, 232, 4, 7906);
    			attr_dev(span11, "class", "svelte-18serza");
    			add_location(span11, file$g, 233, 11, 8060);
    			attr_dev(label11, "class", "svelte-18serza");
    			add_location(label11, file$g, 233, 4, 8053);
    			attr_dev(span12, "class", "svelte-18serza");
    			add_location(span12, file$g, 239, 11, 8574);
    			attr_dev(label12, "class", "svelte-18serza");
    			add_location(label12, file$g, 239, 4, 8567);
    			attr_dev(hr2, "class", "svelte-18serza");
    			add_location(hr2, file$g, 240, 4, 8699);
    			attr_dev(span13, "class", "svelte-18serza");
    			add_location(span13, file$g, 241, 11, 8716);
    			attr_dev(label13, "class", "svelte-18serza");
    			add_location(label13, file$g, 241, 4, 8709);
    			attr_dev(span14, "class", "svelte-18serza");
    			add_location(span14, file$g, 242, 11, 8828);
    			attr_dev(label14, "class", "svelte-18serza");
    			add_location(label14, file$g, 242, 4, 8821);
    			attr_dev(form, "class", "svelte-18serza");
    			add_location(form, file$g, 204, 4, 6049);
    			attr_dev(div, "class", "main");
    			attr_dev(div, "slot", "dim");
    			add_location(div, file$g, 203, 2, 6015);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, form);
    			append_dev(form, label0);
    			append_dev(label0, span0);
    			append_dev(label0, t1);
    			mount_component(inputselect0, label0, null);
    			append_dev(form, t2);
    			append_dev(form, label1);
    			append_dev(label1, span1);
    			append_dev(label1, t4);
    			mount_component(inputselect1, label1, null);
    			append_dev(form, t5);
    			append_dev(form, label2);
    			append_dev(label2, span2);
    			mount_component(inputnumber0, label2, null);
    			append_dev(label2, t7);
    			append_dev(form, t8);
    			append_dev(form, label3);
    			append_dev(label3, span3);
    			mount_component(inputnumber1, label3, null);
    			append_dev(label3, t10);
    			append_dev(form, t11);
    			append_dev(form, label4);
    			append_dev(label4, span4);
    			mount_component(inputnumber2, label4, null);
    			append_dev(label4, t13);
    			append_dev(form, t14);
    			append_dev(form, hr0);
    			append_dev(form, t15);
    			append_dev(form, label5);
    			append_dev(label5, span5);
    			mount_component(inputnumber3, label5, null);
    			append_dev(label5, t17);
    			append_dev(form, t18);
    			append_dev(form, label6);
    			append_dev(label6, span6);
    			mount_component(inputnumber4, label6, null);
    			append_dev(label6, t20);
    			append_dev(form, t21);
    			append_dev(form, label7);
    			append_dev(label7, span7);
    			mount_component(inputnumber5, label7, null);
    			append_dev(label7, t23);
    			append_dev(form, t24);
    			append_dev(form, label8);
    			append_dev(label8, span8);
    			mount_component(inputnumber6, label8, null);
    			append_dev(label8, t26);
    			append_dev(form, t27);
    			append_dev(form, hr1);
    			append_dev(form, t28);
    			append_dev(form, label9);
    			append_dev(label9, span9);
    			mount_component(inputnumber7, label9, null);
    			append_dev(label9, t30);
    			append_dev(form, t31);
    			append_dev(form, label10);
    			append_dev(label10, span10);
    			mount_component(inputnumber8, label10, null);
    			append_dev(label10, t33);
    			append_dev(form, t34);
    			append_dev(form, label11);
    			append_dev(label11, span11);
    			mount_component(inputnumber9, label11, null);
    			append_dev(label11, t36);
    			append_dev(form, t37);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(form, null);
    			}

    			append_dev(form, t38);
    			append_dev(form, label12);
    			append_dev(label12, span12);
    			mount_component(inputcheckbox0, label12, null);
    			append_dev(form, t40);
    			append_dev(form, hr2);
    			append_dev(form, t41);
    			append_dev(form, label13);
    			append_dev(label13, span13);
    			mount_component(inputcheckbox1, label13, null);
    			append_dev(form, t43);
    			append_dev(form, label14);
    			append_dev(label14, span14);
    			mount_component(inputnumber10, label14, null);
    			append_dev(label14, t45);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const inputselect0_changes = {};

    			if (dirty[1] & /*$$scope*/ 1024) {
    				inputselect0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty[0] & /*ui*/ 8) {
    				updating_value = true;
    				inputselect0_changes.value = /*ui*/ ctx[3].ferrage;
    				add_flush_callback(() => updating_value = false);
    			}

    			inputselect0.$set(inputselect0_changes);
    			const inputselect1_changes = {};

    			if (dirty[1] & /*$$scope*/ 1024) {
    				inputselect1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_1 && dirty[0] & /*ui*/ 8) {
    				updating_value_1 = true;
    				inputselect1_changes.value = /*ui*/ ctx[3].type;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			inputselect1.$set(inputselect1_changes);
    			const inputnumber0_changes = {};

    			if (!updating_value_2 && dirty[0] & /*ui*/ 8) {
    				updating_value_2 = true;
    				inputnumber0_changes.value = /*ui*/ ctx[3].largeur;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			inputnumber0.$set(inputnumber0_changes);
    			const inputnumber1_changes = {};

    			if (!updating_value_3 && dirty[0] & /*ui*/ 8) {
    				updating_value_3 = true;
    				inputnumber1_changes.value = /*ui*/ ctx[3].hauteur;
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			inputnumber1.$set(inputnumber1_changes);
    			const inputnumber2_changes = {};

    			if (!updating_value_4 && dirty[0] & /*ui*/ 8) {
    				updating_value_4 = true;
    				inputnumber2_changes.value = /*ui*/ ctx[3].epaisseur;
    				add_flush_callback(() => updating_value_4 = false);
    			}

    			inputnumber2.$set(inputnumber2_changes);
    			const inputnumber3_changes = {};

    			if (!updating_value_5 && dirty[0] & /*ui*/ 8) {
    				updating_value_5 = true;
    				inputnumber3_changes.value = /*ui*/ ctx[3].largeur_montants;
    				add_flush_callback(() => updating_value_5 = false);
    			}

    			inputnumber3.$set(inputnumber3_changes);
    			const inputnumber4_changes = {};

    			if (!updating_value_6 && dirty[0] & /*ui*/ 8) {
    				updating_value_6 = true;
    				inputnumber4_changes.value = /*ui*/ ctx[3].largeur_traverses;
    				add_flush_callback(() => updating_value_6 = false);
    			}

    			inputnumber4.$set(inputnumber4_changes);
    			const inputnumber5_changes = {};
    			if (dirty[0] & /*opt*/ 4) inputnumber5_changes.def = /*opt*/ ctx[2].largeur_traverses;

    			if (!updating_value_7 && dirty[0] & /*ui*/ 8) {
    				updating_value_7 = true;
    				inputnumber5_changes.value = /*ui*/ ctx[3].largeur_traverse_h;
    				add_flush_callback(() => updating_value_7 = false);
    			}

    			inputnumber5.$set(inputnumber5_changes);
    			const inputnumber6_changes = {};
    			if (dirty[0] & /*opt*/ 4) inputnumber6_changes.def = /*opt*/ ctx[2].largeur_traverses;

    			if (!updating_value_8 && dirty[0] & /*ui*/ 8) {
    				updating_value_8 = true;
    				inputnumber6_changes.value = /*ui*/ ctx[3].largeur_traverse_b;
    				add_flush_callback(() => updating_value_8 = false);
    			}

    			inputnumber6.$set(inputnumber6_changes);
    			const inputnumber7_changes = {};

    			if (!updating_value_9 && dirty[0] & /*ui*/ 8) {
    				updating_value_9 = true;
    				inputnumber7_changes.value = /*ui*/ ctx[3].epaisseur_panneau;
    				add_flush_callback(() => updating_value_9 = false);
    			}

    			inputnumber7.$set(inputnumber7_changes);
    			const inputnumber8_changes = {};

    			if (!updating_value_10 && dirty[0] & /*ui*/ 8) {
    				updating_value_10 = true;
    				inputnumber8_changes.value = /*ui*/ ctx[3].profondeur_rainure;
    				add_flush_callback(() => updating_value_10 = false);
    			}

    			inputnumber8.$set(inputnumber8_changes);
    			const inputnumber9_changes = {};

    			if (!updating_value_11 && dirty[0] & /*ui*/ 8) {
    				updating_value_11 = true;
    				inputnumber9_changes.value = /*ui*/ ctx[3].jeu_rainure;
    				add_flush_callback(() => updating_value_11 = false);
    			}

    			inputnumber9.$set(inputnumber9_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(form, t38);
    				} else {
    					if_block = null;
    				}
    			}

    			const inputcheckbox0_changes = {};

    			if (!updating_checked && dirty[0] & /*ui*/ 8) {
    				updating_checked = true;
    				inputcheckbox0_changes.checked = /*ui*/ ctx[3].inclure_panneau;
    				add_flush_callback(() => updating_checked = false);
    			}

    			inputcheckbox0.$set(inputcheckbox0_changes);
    			const inputcheckbox1_changes = {};

    			if (!updating_checked_1 && dirty[0] & /*ui*/ 8) {
    				updating_checked_1 = true;
    				inputcheckbox1_changes.checked = /*ui*/ ctx[3].encastree;
    				add_flush_callback(() => updating_checked_1 = false);
    			}

    			inputcheckbox1.$set(inputcheckbox1_changes);
    			const inputnumber10_changes = {};

    			if (!updating_value_12 && dirty[0] & /*ui*/ 8) {
    				updating_value_12 = true;
    				inputnumber10_changes.value = /*ui*/ ctx[3].jeu_encastrement;
    				add_flush_callback(() => updating_value_12 = false);
    			}

    			inputnumber10.$set(inputnumber10_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputselect0.$$.fragment, local);
    			transition_in(inputselect1.$$.fragment, local);
    			transition_in(inputnumber0.$$.fragment, local);
    			transition_in(inputnumber1.$$.fragment, local);
    			transition_in(inputnumber2.$$.fragment, local);
    			transition_in(inputnumber3.$$.fragment, local);
    			transition_in(inputnumber4.$$.fragment, local);
    			transition_in(inputnumber5.$$.fragment, local);
    			transition_in(inputnumber6.$$.fragment, local);
    			transition_in(inputnumber7.$$.fragment, local);
    			transition_in(inputnumber8.$$.fragment, local);
    			transition_in(inputnumber9.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(inputcheckbox0.$$.fragment, local);
    			transition_in(inputcheckbox1.$$.fragment, local);
    			transition_in(inputnumber10.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputselect0.$$.fragment, local);
    			transition_out(inputselect1.$$.fragment, local);
    			transition_out(inputnumber0.$$.fragment, local);
    			transition_out(inputnumber1.$$.fragment, local);
    			transition_out(inputnumber2.$$.fragment, local);
    			transition_out(inputnumber3.$$.fragment, local);
    			transition_out(inputnumber4.$$.fragment, local);
    			transition_out(inputnumber5.$$.fragment, local);
    			transition_out(inputnumber6.$$.fragment, local);
    			transition_out(inputnumber7.$$.fragment, local);
    			transition_out(inputnumber8.$$.fragment, local);
    			transition_out(inputnumber9.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(inputcheckbox0.$$.fragment, local);
    			transition_out(inputcheckbox1.$$.fragment, local);
    			transition_out(inputnumber10.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(inputselect0);
    			destroy_component(inputselect1);
    			destroy_component(inputnumber0);
    			destroy_component(inputnumber1);
    			destroy_component(inputnumber2);
    			destroy_component(inputnumber3);
    			destroy_component(inputnumber4);
    			destroy_component(inputnumber5);
    			destroy_component(inputnumber6);
    			destroy_component(inputnumber7);
    			destroy_component(inputnumber8);
    			destroy_component(inputnumber9);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			destroy_component(inputcheckbox0);
    			destroy_component(inputcheckbox1);
    			destroy_component(inputnumber10);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_dim_slot.name,
    		type: "slot",
    		source: "(204:2) <div class=\\\"main\\\" slot=\\\"dim\\\">",
    		ctx
    	});

    	return block;
    }

    // (247:2) <div slot="tables">
    function create_tables_slot$1(ctx) {
    	let div;
    	let listedebit;
    	let current;

    	listedebit = new ListeDebit({
    			props: { pieces: /*state*/ ctx[8].pieces_group },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(listedebit.$$.fragment);
    			attr_dev(div, "slot", "tables");
    			add_location(div, file$g, 246, 2, 8995);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(listedebit, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listedebit_changes = {};
    			if (dirty[0] & /*state*/ 256) listedebit_changes.pieces = /*state*/ ctx[8].pieces_group;
    			listedebit.$set(listedebit_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listedebit.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listedebit.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(listedebit);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_tables_slot$1.name,
    		type: "slot",
    		source: "(247:2) <div slot=\\\"tables\\\">",
    		ctx
    	});

    	return block;
    }

    // (155:0) <Component bind:data={data} state={state} path={path} on:datachange>
    function create_default_slot$1(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(155:0) <Component bind:data={data} state={state} path={path} on:datachange>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let component;
    	let updating_data;
    	let current;

    	function component_data_binding(value) {
    		/*component_data_binding*/ ctx[36].call(null, value);
    	}

    	let component_props = {
    		state: /*state*/ ctx[8],
    		path: /*path*/ ctx[0],
    		$$slots: {
    			default: [create_default_slot$1],
    			tables: [create_tables_slot$1],
    			dim: [create_dim_slot],
    			plan: [create_plan_slot$1]
    		},
    		$$scope: { ctx }
    	};

    	if (/*data*/ ctx[1] !== void 0) {
    		component_props.data = /*data*/ ctx[1];
    	}

    	component = new Component({ props: component_props, $$inline: true });
    	binding_callbacks.push(() => bind(component, "data", component_data_binding));
    	component.$on("datachange", /*datachange_handler*/ ctx[37]);

    	const block = {
    		c: function create() {
    			create_component(component.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(component, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const component_changes = {};
    			if (dirty[0] & /*state*/ 256) component_changes.state = /*state*/ ctx[8];
    			if (dirty[0] & /*path*/ 1) component_changes.path = /*path*/ ctx[0];

    			if (dirty[0] & /*state, ui, opt, zoom, pieces, traverse_h, montant_g, montant_d, data*/ 1022 | dirty[1] & /*$$scope*/ 1024) {
    				component_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_data && dirty[0] & /*data*/ 2) {
    				updating_data = true;
    				component_changes.data = /*data*/ ctx[1];
    				add_flush_callback(() => updating_data = false);
    			}

    			component.$set(component_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(component.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(component.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(component, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let jeu_encastrement;
    	let montant;
    	let montant_g;
    	let montant_d;
    	let traverse;
    	let traverse_xpos;
    	let traverse_h;
    	let traverse_b;
    	let panneau;
    	let pieces;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Porte", slots, []);
    	let { path } = $$props;
    	let { initdata = {} } = $$props;
    	let data = { ...initdata };

    	let defaults = {
    		quantite: 1,
    		type: "contre-profil",
    		largeur: 400,
    		hauteur: 600,
    		epaisseur: 22,
    		largeur_montants: 70,
    		largeur_traverses: 70,
    		profondeur_tenons: 30,
    		profondeur_rainure: 10,
    		profondeur_profil: 15,
    		encastree: false,
    		jeu_encastrement: 2,
    		jeu_rainure: 1,
    		epaisseur_panneau: 15,
    		inclure_panneau: true,
    		ferrage: "charnieres",
    		...initdata.defaults
    	};

    	let opt = { ...initdata.opt };
    	let ui = { ...initdata.ui || initdata.opt };
    	let state = {};
    	let zoom = 0.25;
    	const writable_props = ["path", "initdata"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Porte> was created with unknown prop '${key}'`);
    	});

    	function input_change_input_handler() {
    		zoom = to_number(this.value);
    		$$invalidate(9, zoom);
    	}

    	function inputselect0_value_binding(value) {
    		ui.ferrage = value;
    		$$invalidate(3, ui);
    	}

    	function inputselect1_value_binding(value) {
    		ui.type = value;
    		$$invalidate(3, ui);
    	}

    	function inputnumber0_value_binding(value) {
    		ui.largeur = value;
    		$$invalidate(3, ui);
    	}

    	function inputnumber1_value_binding(value) {
    		ui.hauteur = value;
    		$$invalidate(3, ui);
    	}

    	function inputnumber2_value_binding(value) {
    		ui.epaisseur = value;
    		$$invalidate(3, ui);
    	}

    	function inputnumber3_value_binding(value) {
    		ui.largeur_montants = value;
    		$$invalidate(3, ui);
    	}

    	function inputnumber4_value_binding(value) {
    		ui.largeur_traverses = value;
    		$$invalidate(3, ui);
    	}

    	function inputnumber5_value_binding(value) {
    		ui.largeur_traverse_h = value;
    		$$invalidate(3, ui);
    	}

    	function inputnumber6_value_binding(value) {
    		ui.largeur_traverse_b = value;
    		$$invalidate(3, ui);
    	}

    	function inputnumber7_value_binding(value) {
    		ui.epaisseur_panneau = value;
    		$$invalidate(3, ui);
    	}

    	function inputnumber8_value_binding(value) {
    		ui.profondeur_rainure = value;
    		$$invalidate(3, ui);
    	}

    	function inputnumber9_value_binding(value) {
    		ui.jeu_rainure = value;
    		$$invalidate(3, ui);
    	}

    	function inputnumber_value_binding(value) {
    		ui.profondeur_tenons = value;
    		$$invalidate(3, ui);
    	}

    	function inputnumber_value_binding_1(value) {
    		ui.profondeur_profil = value;
    		$$invalidate(3, ui);
    	}

    	function inputcheckbox0_checked_binding(value) {
    		ui.inclure_panneau = value;
    		$$invalidate(3, ui);
    	}

    	function inputcheckbox1_checked_binding(value) {
    		ui.encastree = value;
    		$$invalidate(3, ui);
    	}

    	function inputnumber10_value_binding(value) {
    		ui.jeu_encastrement = value;
    		$$invalidate(3, ui);
    	}

    	function component_data_binding(value) {
    		data = value;
    		((($$invalidate(1, data), $$invalidate(2, opt)), $$invalidate(3, ui)), $$invalidate(10, defaults));
    	}

    	function datachange_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("initdata" in $$props) $$invalidate(11, initdata = $$props.initdata);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		cleanObject,
    		pipeline,
    		InputNumber,
    		InputCheckbox,
    		InputSelect,
    		Component,
    		Cote,
    		Piece,
    		Group,
    		SVGPiece,
    		SVGDrawing,
    		ListeDebit,
    		path,
    		initdata,
    		data,
    		defaults,
    		opt,
    		ui,
    		state,
    		zoom,
    		jeu_encastrement,
    		montant,
    		montant_g,
    		montant_d,
    		traverse,
    		traverse_xpos,
    		traverse_h,
    		traverse_b,
    		panneau,
    		pieces
    	});

    	$$self.$inject_state = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("initdata" in $$props) $$invalidate(11, initdata = $$props.initdata);
    		if ("data" in $$props) $$invalidate(1, data = $$props.data);
    		if ("defaults" in $$props) $$invalidate(10, defaults = $$props.defaults);
    		if ("opt" in $$props) $$invalidate(2, opt = $$props.opt);
    		if ("ui" in $$props) $$invalidate(3, ui = $$props.ui);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("zoom" in $$props) $$invalidate(9, zoom = $$props.zoom);
    		if ("jeu_encastrement" in $$props) $$invalidate(12, jeu_encastrement = $$props.jeu_encastrement);
    		if ("montant" in $$props) $$invalidate(13, montant = $$props.montant);
    		if ("montant_g" in $$props) $$invalidate(4, montant_g = $$props.montant_g);
    		if ("montant_d" in $$props) $$invalidate(5, montant_d = $$props.montant_d);
    		if ("traverse" in $$props) $$invalidate(14, traverse = $$props.traverse);
    		if ("traverse_xpos" in $$props) $$invalidate(15, traverse_xpos = $$props.traverse_xpos);
    		if ("traverse_h" in $$props) $$invalidate(6, traverse_h = $$props.traverse_h);
    		if ("traverse_b" in $$props) $$invalidate(16, traverse_b = $$props.traverse_b);
    		if ("panneau" in $$props) $$invalidate(17, panneau = $$props.panneau);
    		if ("pieces" in $$props) $$invalidate(7, pieces = $$props.pieces);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*ui*/ 8) {
    			 $$invalidate(2, opt = pipeline({ ...defaults, ...cleanObject(ui) }, opt => ({
    				largeur_traverse_h: opt.largeur_traverses,
    				largeur_traverse_b: opt.largeur_traverses,
    				...opt
    			})));
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 4) {
    			 $$invalidate(1, data.opt = opt, data);
    		}

    		if ($$self.$$.dirty[0] & /*ui*/ 8) {
    			 $$invalidate(1, data.ui = ui, data);
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 4) {
    			 $$invalidate(12, jeu_encastrement = opt.encastree ? opt.jeu_encastrement : 0);
    		}

    		if ($$self.$$.dirty[0] & /*opt, jeu_encastrement*/ 4100) {
    			 $$invalidate(13, montant = new Piece().add_name("Montant").add_features(opt.type == "contre-profil" ? "montant-cp" : "montant").build(opt.hauteur - 2 * jeu_encastrement, opt.largeur_montants, opt.epaisseur));
    		}

    		if ($$self.$$.dirty[0] & /*montant, jeu_encastrement*/ 12288) {
    			 $$invalidate(4, montant_g = montant.add_name("gauche").put(jeu_encastrement, jeu_encastrement, 0, "yxz"));
    		}

    		if ($$self.$$.dirty[0] & /*montant, jeu_encastrement, opt*/ 12292) {
    			 $$invalidate(5, montant_d = montant.add_name("droit").put(jeu_encastrement + opt.largeur - opt.largeur_montants, jeu_encastrement, 0, "yxz"));
    		}

    		if ($$self.$$.dirty[0] & /*opt, jeu_encastrement*/ 4100) {
    			 $$invalidate(14, traverse = opt.type == "contre-profil"
    			? new Piece().add_name("Traverse").add_features("traverse-cp").build(opt.largeur - 2 * (opt.largeur_montants - opt.profondeur_profil) - 2 * jeu_encastrement, 0, opt.epaisseur)
    			: opt.type == "tenon-mortaise"
    				? new Piece().add_name("Traverse").add_features("traverse").build(opt.largeur - 2 * opt.largeur_montants - 2 * jeu_encastrement, 0, opt.epaisseur).ajout_tenons(opt.profondeur_tenons)
    				: new Piece());
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 4) {
    			 $$invalidate(15, traverse_xpos = opt.type == "contre-profil"
    			? opt.largeur_montants - opt.profondeur_profil
    			: opt.type == "tenon-mortaise"
    				? opt.largeur_montants - opt.profondeur_tenons
    				: 0);
    		}

    		if ($$self.$$.dirty[0] & /*traverse, opt, jeu_encastrement, traverse_xpos*/ 53252) {
    			 $$invalidate(6, traverse_h = traverse.add_name("haut").build(null, opt.largeur_traverse_h).put(jeu_encastrement + traverse_xpos, jeu_encastrement + opt.hauteur - opt.largeur_traverse_h, 0, "xyz"));
    		}

    		if ($$self.$$.dirty[0] & /*traverse, opt, jeu_encastrement, traverse_xpos*/ 53252) {
    			 $$invalidate(16, traverse_b = traverse.add_name("bas").build(null, opt.largeur_traverse_b).put(jeu_encastrement + traverse_xpos, jeu_encastrement, 0, "xyz"));
    		}

    		if ($$self.$$.dirty[0] & /*opt, jeu_encastrement, montant, traverse_b*/ 77828) {
    			 $$invalidate(17, panneau = (opt.type == "contre-profil"
    			? new Piece().build(opt.largeur - 2 * (opt.largeur_montants - opt.profondeur_rainure + opt.jeu_rainure) - 2 * jeu_encastrement, opt.hauteur + 2 * (opt.profondeur_rainure - opt.jeu_rainure) - opt.largeur_traverse_h - opt.largeur_traverse_b - 2 * jeu_encastrement, opt.epaisseur_panneau)
    			: opt.type == "tenon-mortaise"
    				? new Piece().build(opt.largeur - 2 * (opt.largeur_montants - opt.profondeur_rainure + opt.jeu_rainure), opt.hauteur + 2 * (opt.profondeur_rainure - opt.jeu_rainure) - opt.largeur_traverse_h - opt.largeur_traverse_b, opt.epaisseur_panneau)
    				: new Piece()).add_name("Panneau").add_features("panneau").put(jeu_encastrement + montant.largeur - opt.profondeur_rainure + opt.jeu_rainure, jeu_encastrement + traverse_b.largeur - opt.profondeur_rainure + opt.jeu_rainure, 0, "xyz"));
    		}

    		if ($$self.$$.dirty[0] & /*opt, panneau, traverse_h, traverse_b, montant_g, montant_d*/ 196724) {
    			 $$invalidate(7, pieces = [
    				opt.inclure_panneau ? panneau : null,
    				traverse_h,
    				traverse_b,
    				montant_g,
    				montant_d
    			].filter(x => x != null).map(p => p.multiply_que(opt.quantite)));
    		}

    		if ($$self.$$.dirty[0] & /*pieces, data, opt*/ 134) {
    			 $$invalidate(8, state.pieces_group = new Group(pieces, `Porte ${data.name}`, "Porte").add_features(`ferrage-${opt.ferrage}`), state);
    		}
    	};

    	return [
    		path,
    		data,
    		opt,
    		ui,
    		montant_g,
    		montant_d,
    		traverse_h,
    		pieces,
    		state,
    		zoom,
    		defaults,
    		initdata,
    		jeu_encastrement,
    		montant,
    		traverse,
    		traverse_xpos,
    		traverse_b,
    		panneau,
    		input_change_input_handler,
    		inputselect0_value_binding,
    		inputselect1_value_binding,
    		inputnumber0_value_binding,
    		inputnumber1_value_binding,
    		inputnumber2_value_binding,
    		inputnumber3_value_binding,
    		inputnumber4_value_binding,
    		inputnumber5_value_binding,
    		inputnumber6_value_binding,
    		inputnumber7_value_binding,
    		inputnumber8_value_binding,
    		inputnumber9_value_binding,
    		inputnumber_value_binding,
    		inputnumber_value_binding_1,
    		inputcheckbox0_checked_binding,
    		inputcheckbox1_checked_binding,
    		inputnumber10_value_binding,
    		component_data_binding,
    		datachange_handler
    	];
    }

    class Porte extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { path: 0, initdata: 11 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Porte",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*path*/ ctx[0] === undefined && !("path" in props)) {
    			console.warn("<Porte> was created without expected prop 'path'");
    		}
    	}

    	get path() {
    		throw new Error("<Porte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Porte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get initdata() {
    		throw new Error("<Porte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set initdata(value) {
    		throw new Error("<Porte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ensembles/Caisson.svelte generated by Svelte v3.31.2 */

    const { console: console_1$5 } = globals;
    const file$h = "src/ensembles/Caisson.svelte";

    function get_each_context$c(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[107] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[110] = list[i];
    	child_ctx[111] = list;
    	child_ctx[112] = i;
    	return child_ctx;
    }

    function get_each_context_2$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[110] = list[i];
    	child_ctx[113] = list;
    	child_ctx[112] = i;
    	return child_ctx;
    }

    function get_each_context_3$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[107] = list[i];
    	return child_ctx;
    }

    function get_each_context_4$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[116] = list[i];
    	child_ctx[118] = i;
    	return child_ctx;
    }

    function get_each_context_5$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[119] = list[i];
    	child_ctx[121] = i;
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[116] = list[i];
    	child_ctx[122] = list;
    	child_ctx[118] = i;
    	return child_ctx;
    }

    function get_each_context_7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[119] = list[i];
    	child_ctx[123] = list;
    	child_ctx[121] = i;
    	return child_ctx;
    }

    function get_each_context_8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[116] = list[i];
    	child_ctx[124] = list;
    	child_ctx[118] = i;
    	return child_ctx;
    }

    function get_each_context_9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[116] = list[i];
    	child_ctx[125] = list;
    	child_ctx[118] = i;
    	return child_ctx;
    }

    function get_each_context_10(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[116] = list[i];
    	child_ctx[118] = i;
    	return child_ctx;
    }

    // (1160:2) <div slot="plan">
    function create_plan_slot$2(ctx) {
    	let div;
    	let svgdrawing;
    	let current;

    	svgdrawing = new SVGDrawing({
    			props: {
    				pieces: /*all_pieces*/ ctx[12],
    				name: `Caisson ${/*data*/ ctx[16].name}`
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(svgdrawing.$$.fragment);
    			attr_dev(div, "slot", "plan");
    			add_location(div, file$h, 1159, 2, 37400);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(svgdrawing, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const svgdrawing_changes = {};
    			if (dirty[0] & /*all_pieces*/ 4096) svgdrawing_changes.pieces = /*all_pieces*/ ctx[12];
    			if (dirty[0] & /*data*/ 65536) svgdrawing_changes.name = `Caisson ${/*data*/ ctx[16].name}`;
    			svgdrawing.$set(svgdrawing_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgdrawing.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgdrawing.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(svgdrawing);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_plan_slot$2.name,
    		type: "slot",
    		source: "(1160:2) <div slot=\\\"plan\\\">",
    		ctx
    	});

    	return block;
    }

    // (1177:8) {#each opt.colonnes as colonne, i}
    function create_each_block_10(ctx) {
    	let th;
    	let t0;
    	let t1_value = /*i*/ ctx[118] + 1 + "";
    	let t1;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t0 = text("Colonne n°");
    			t1 = text(t1_value);
    			add_location(th, file$h, 1177, 10, 38113);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t0);
    			append_dev(th, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_10.name,
    		type: "each",
    		source: "(1177:8) {#each opt.colonnes as colonne, i}",
    		ctx
    	});

    	return block;
    }

    // (1183:8) {#each opt.colonnes as colonne, i}
    function create_each_block_9(ctx) {
    	let td;
    	let input;
    	let input_placeholder_value;
    	let mounted;
    	let dispose;

    	function input_input_handler_1() {
    		/*input_input_handler_1*/ ctx[58].call(input, /*i*/ ctx[118]);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			input = element("input");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "placeholder", input_placeholder_value = /*colonne*/ ctx[116].largeur);
    			set_style(input, "width", "5em");
    			add_location(input, file$h, 1184, 10, 38292);
    			attr_dev(td, "class", "svelte-2d04f4");
    			add_location(td, file$h, 1183, 8, 38277);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, input);
    			set_input_value(input, /*largeur_colonnes*/ ctx[4][/*i*/ ctx[118]]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler_1);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*opt*/ 2 && input_placeholder_value !== (input_placeholder_value = /*colonne*/ ctx[116].largeur)) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty[0] & /*largeur_colonnes*/ 16 && to_number(input.value) !== /*largeur_colonnes*/ ctx[4][/*i*/ ctx[118]]) {
    				set_input_value(input, /*largeur_colonnes*/ ctx[4][/*i*/ ctx[118]]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_9.name,
    		type: "each",
    		source: "(1183:8) {#each opt.colonnes as colonne, i}",
    		ctx
    	});

    	return block;
    }

    // (1195:8) {#each opt.colonnes as colonne, i}
    function create_each_block_8(ctx) {
    	let td;
    	let input;
    	let mounted;
    	let dispose;

    	function input_input_handler_2() {
    		/*input_input_handler_2*/ ctx[59].call(input, /*i*/ ctx[118]);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			input = element("input");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "1");
    			set_style(input, "width", "5em");
    			add_location(input, file$h, 1196, 10, 38615);
    			attr_dev(td, "class", "svelte-2d04f4");
    			add_location(td, file$h, 1195, 8, 38600);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, input);
    			set_input_value(input, /*num_casiers_colonnes*/ ctx[5][/*i*/ ctx[118]]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler_2);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*num_casiers_colonnes*/ 32 && to_number(input.value) !== /*num_casiers_colonnes*/ ctx[5][/*i*/ ctx[118]]) {
    				set_input_value(input, /*num_casiers_colonnes*/ ctx[5][/*i*/ ctx[118]]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_8.name,
    		type: "each",
    		source: "(1195:8) {#each opt.colonnes as colonne, i}",
    		ctx
    	});

    	return block;
    }

    // (1209:12) {#if j > 0}
    function create_if_block_5$1(ctx) {
    	let br;

    	const block = {
    		c: function create() {
    			br = element("br");
    			add_location(br, file$h, 1209, 12, 38982);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(1209:12) {#if j > 0}",
    		ctx
    	});

    	return block;
    }

    // (1208:10) {#each colonne.casiers as casier, j}
    function create_each_block_7(ctx) {
    	let t;
    	let input;
    	let input_placeholder_value;
    	let mounted;
    	let dispose;
    	let if_block = /*j*/ ctx[121] > 0 && create_if_block_5$1(ctx);

    	function input_input_handler_3() {
    		/*input_input_handler_3*/ ctx[60].call(input, /*i*/ ctx[118], /*j*/ ctx[121]);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			input = element("input");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "1");
    			attr_dev(input, "placeholder", input_placeholder_value = /*colonne*/ ctx[116].casiers[/*j*/ ctx[121]].hauteur);
    			set_style(input, "width", "5em");
    			add_location(input, file$h, 1211, 12, 39018);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*hauteur_casiers_colonnes*/ ctx[6][/*i*/ ctx[118]][/*j*/ ctx[121]]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler_3);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*opt*/ 2 && input_placeholder_value !== (input_placeholder_value = /*colonne*/ ctx[116].casiers[/*j*/ ctx[121]].hauteur)) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty[0] & /*hauteur_casiers_colonnes*/ 64 && to_number(input.value) !== /*hauteur_casiers_colonnes*/ ctx[6][/*i*/ ctx[118]][/*j*/ ctx[121]]) {
    				set_input_value(input, /*hauteur_casiers_colonnes*/ ctx[6][/*i*/ ctx[118]][/*j*/ ctx[121]]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_7.name,
    		type: "each",
    		source: "(1208:10) {#each colonne.casiers as casier, j}",
    		ctx
    	});

    	return block;
    }

    // (1206:8) {#each opt.colonnes as colonne, i}
    function create_each_block_6(ctx) {
    	let td;
    	let each_value_7 = /*colonne*/ ctx[116].casiers;
    	validate_each_argument(each_value_7);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_7.length; i += 1) {
    		each_blocks[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
    	}

    	const block = {
    		c: function create() {
    			td = element("td");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(td, "class", "svelte-2d04f4");
    			add_location(td, file$h, 1206, 8, 38894);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(td, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*opt, hauteur_casiers_colonnes*/ 66) {
    				each_value_7 = /*colonne*/ ctx[116].casiers;
    				validate_each_argument(each_value_7);
    				let i;

    				for (i = 0; i < each_value_7.length; i += 1) {
    					const child_ctx = get_each_context_7(ctx, each_value_7, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(td, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_7.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(1206:8) {#each opt.colonnes as colonne, i}",
    		ctx
    	});

    	return block;
    }

    // (1223:4) {#if largeur_colonnes.filter(x => (x && x != 0)).length == largeur_colonnes.length}
    function create_if_block_4$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Attention : trop de largeurs sont définies en même temps";
    			add_location(p, file$h, 1223, 4, 39376);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(1223:4) {#if largeur_colonnes.filter(x => (x && x != 0)).length == largeur_colonnes.length}",
    		ctx
    	});

    	return block;
    }

    // (1236:10) {#each colonne.casiers as casier, j}
    function create_each_block_5$1(ctx) {
    	let label;
    	let input;
    	let mounted;
    	let dispose;

    	function func_1(...args) {
    		return /*func_1*/ ctx[63](/*j*/ ctx[121], /*i*/ ctx[118], ...args);
    	}

    	function func_3(...args) {
    		return /*func_3*/ ctx[64](/*j*/ ctx[121], /*i*/ ctx[118], ...args);
    	}

    	function func_5(...args) {
    		return /*func_5*/ ctx[65](/*j*/ ctx[121], /*i*/ ctx[118], ...args);
    	}

    	function func_7(...args) {
    		return /*func_7*/ ctx[66](/*j*/ ctx[121], /*i*/ ctx[118], ...args);
    	}

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			attr_dev(input, "type", "radio");
    			attr_dev(input, "name", "selection-casier");
    			input.__value = `${/*i*/ ctx[118]},${/*j*/ ctx[121]}`;
    			input.value = input.__value;
    			attr_dev(input, "class", "svelte-2d04f4");
    			/*$$binding_groups*/ ctx[62][0].push(input);
    			add_location(input, file$h, 1261, 12, 41425);
    			attr_dev(label, "class", "casier casier-" + /*i*/ ctx[118] + "-" + /*j*/ ctx[121] + " svelte-2d04f4");
    			set_style(label, "flex-grow", /*casier*/ ctx[119].hauteur);

    			toggle_class(label, "panneau-haut", /*j*/ ctx[121] == 0
    			? /*opt*/ ctx[1].panneau_dessus
    			: /*opt*/ ctx[1].colonnes[/*i*/ ctx[118]].casiers[/*j*/ ctx[121] - 1].panneau_dessous);

    			toggle_class(label, "panneau-bas", /*j*/ ctx[121] < /*ui_colonnes*/ ctx[7][/*i*/ ctx[118]].casiers.length - 1
    			? /*opt*/ ctx[1].colonnes[/*i*/ ctx[118]].casiers[/*j*/ ctx[121]].panneau_dessous
    			: /*opt*/ ctx[1].panneau_dessous);

    			toggle_class(label, "panneau-gauche", /*opt*/ ctx[1].montants[/*i*/ ctx[118]].panneaux.map(func_1).reduce(func_2, true));
    			toggle_class(label, "panneau-droit", /*opt*/ ctx[1].montants[/*i*/ ctx[118] + 1].panneaux.map(func_3).reduce(func_4, true));
    			toggle_class(label, "panneau-gauche-partiel", /*opt*/ ctx[1].montants[/*i*/ ctx[118]].panneaux.map(func_5).reduce(func_6, false));
    			toggle_class(label, "panneau-droit-partiel", /*opt*/ ctx[1].montants[/*i*/ ctx[118] + 1].panneaux.map(func_7).reduce(func_8, false));
    			toggle_class(label, "panneau-dos", /*opt*/ ctx[1].colonnes[/*i*/ ctx[118]].casiers[/*j*/ ctx[121]].panneau_dos);
    			toggle_class(label, "tiroir", /*opt*/ ctx[1].colonnes[/*i*/ ctx[118]].casiers[/*j*/ ctx[121]].tiroir);
    			add_location(label, file$h, 1236, 10, 39800);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = input.__value === /*selection_casier_input*/ ctx[9];

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[61]);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*selection_casier_input*/ 512) {
    				input.checked = input.__value === /*selection_casier_input*/ ctx[9];
    			}

    			if (dirty[0] & /*opt*/ 2) {
    				set_style(label, "flex-grow", /*casier*/ ctx[119].hauteur);
    			}

    			if (dirty[0] & /*opt*/ 2) {
    				toggle_class(label, "panneau-haut", /*j*/ ctx[121] == 0
    				? /*opt*/ ctx[1].panneau_dessus
    				: /*opt*/ ctx[1].colonnes[/*i*/ ctx[118]].casiers[/*j*/ ctx[121] - 1].panneau_dessous);
    			}

    			if (dirty[0] & /*ui_colonnes, opt*/ 130) {
    				toggle_class(label, "panneau-bas", /*j*/ ctx[121] < /*ui_colonnes*/ ctx[7][/*i*/ ctx[118]].casiers.length - 1
    				? /*opt*/ ctx[1].colonnes[/*i*/ ctx[118]].casiers[/*j*/ ctx[121]].panneau_dessous
    				: /*opt*/ ctx[1].panneau_dessous);
    			}

    			if (dirty[0] & /*opt*/ 2) {
    				toggle_class(label, "panneau-gauche", /*opt*/ ctx[1].montants[/*i*/ ctx[118]].panneaux.map(func_1).reduce(func_2, true));
    			}

    			if (dirty[0] & /*opt*/ 2) {
    				toggle_class(label, "panneau-droit", /*opt*/ ctx[1].montants[/*i*/ ctx[118] + 1].panneaux.map(func_3).reduce(func_4, true));
    			}

    			if (dirty[0] & /*opt*/ 2) {
    				toggle_class(label, "panneau-gauche-partiel", /*opt*/ ctx[1].montants[/*i*/ ctx[118]].panneaux.map(func_5).reduce(func_6, false));
    			}

    			if (dirty[0] & /*opt*/ 2) {
    				toggle_class(label, "panneau-droit-partiel", /*opt*/ ctx[1].montants[/*i*/ ctx[118] + 1].panneaux.map(func_7).reduce(func_8, false));
    			}

    			if (dirty[0] & /*opt*/ 2) {
    				toggle_class(label, "panneau-dos", /*opt*/ ctx[1].colonnes[/*i*/ ctx[118]].casiers[/*j*/ ctx[121]].panneau_dos);
    			}

    			if (dirty[0] & /*opt*/ 2) {
    				toggle_class(label, "tiroir", /*opt*/ ctx[1].colonnes[/*i*/ ctx[118]].casiers[/*j*/ ctx[121]].tiroir);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[62][0].splice(/*$$binding_groups*/ ctx[62][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5$1.name,
    		type: "each",
    		source: "(1236:10) {#each colonne.casiers as casier, j}",
    		ctx
    	});

    	return block;
    }

    // (1233:8) {#each opt.colonnes as colonne, i}
    function create_each_block_4$1(ctx) {
    	let div;
    	let t;
    	let each_value_5 = /*colonne*/ ctx[116].casiers;
    	validate_each_argument(each_value_5);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5$1(get_each_context_5$1(ctx, each_value_5, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "colonne colonne-" + /*i*/ ctx[118] + " svelte-2d04f4");
    			add_location(div, file$h, 1233, 8, 39667);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*opt, ui_colonnes, selection_casier_input*/ 642) {
    				each_value_5 = /*colonne*/ ctx[116].casiers;
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5$1(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_5$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_5.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4$1.name,
    		type: "each",
    		source: "(1233:8) {#each opt.colonnes as colonne, i}",
    		ctx
    	});

    	return block;
    }

    // (1276:12) <InputSelect init={opt.colonnes[selection_casier_i].porte.type} bind:value={ui_colonnes[selection_casier_i].porte.type}>
    function create_default_slot_2$1(ctx) {
    	let option0;
    	let t1;
    	let option1;
    	let t3;
    	let option2;
    	let t5;
    	let option3;

    	const block = {
    		c: function create() {
    			option0 = element("option");
    			option0.textContent = "Aucune";
    			t1 = space();
    			option1 = element("option");
    			option1.textContent = "Recouvrement total";
    			t3 = space();
    			option2 = element("option");
    			option2.textContent = "Recouvrement à moitié";
    			t5 = space();
    			option3 = element("option");
    			option3.textContent = "Encastré";
    			option0.__value = "";
    			option0.value = option0.__value;
    			add_location(option0, file$h, 1276, 14, 42027);
    			option1.__value = "total";
    			option1.value = option1.__value;
    			add_location(option1, file$h, 1277, 14, 42074);
    			option2.__value = "demi";
    			option2.value = option2.__value;
    			add_location(option2, file$h, 1278, 14, 42138);
    			option3.__value = "encastre";
    			option3.value = option3.__value;
    			add_location(option3, file$h, 1279, 14, 42204);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, option1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, option2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, option3, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(option1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(option2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(option3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(1276:12) <InputSelect init={opt.colonnes[selection_casier_i].porte.type} bind:value={ui_colonnes[selection_casier_i].porte.type}>",
    		ctx
    	});

    	return block;
    }

    // (1270:8) {#each [selection_casier] as sel (sel.key)}
    function create_each_block_3$1(key_1, ctx) {
    	let p;
    	let strong;
    	let t0;
    	let t1_value = /*selection_casier_i*/ ctx[14] + 1 + "";
    	let t1;
    	let t2;
    	let fieldset;
    	let legend;
    	let t3;
    	let t4_value = /*selection_casier_i*/ ctx[14] + 1 + "";
    	let t4;
    	let t5;
    	let label0;
    	let span;
    	let t7;
    	let inputselect;
    	let updating_value;
    	let t8;
    	let label1;
    	let inputcheckbox;
    	let updating_checked;
    	let t9;
    	let t10;
    	let current;

    	function inputselect_value_binding(value) {
    		/*inputselect_value_binding*/ ctx[67].call(null, value);
    	}

    	let inputselect_props = {
    		init: /*opt*/ ctx[1].colonnes[/*selection_casier_i*/ ctx[14]].porte.type,
    		$$slots: { default: [create_default_slot_2$1] },
    		$$scope: { ctx }
    	};

    	if (/*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].porte.type !== void 0) {
    		inputselect_props.value = /*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].porte.type;
    	}

    	inputselect = new InputSelect({ props: inputselect_props, $$inline: true });
    	binding_callbacks.push(() => bind(inputselect, "value", inputselect_value_binding));

    	function inputcheckbox_checked_binding(value) {
    		/*inputcheckbox_checked_binding*/ ctx[68].call(null, value);
    	}

    	let inputcheckbox_props = {
    		tristate: false,
    		def: /*opt*/ ctx[1].colonnes[/*selection_casier_i*/ ctx[14]].porte.double
    	};

    	if (/*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].porte.double !== void 0) {
    		inputcheckbox_props.checked = /*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].porte.double;
    	}

    	inputcheckbox = new InputCheckbox({
    			props: inputcheckbox_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputcheckbox, "checked", inputcheckbox_checked_binding));

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			p = element("p");
    			strong = element("strong");
    			t0 = text("Colonne n°");
    			t1 = text(t1_value);
    			t2 = space();
    			fieldset = element("fieldset");
    			legend = element("legend");
    			t3 = text("Porte colonne n°");
    			t4 = text(t4_value);
    			t5 = space();
    			label0 = element("label");
    			span = element("span");
    			span.textContent = "Type : ";
    			t7 = space();
    			create_component(inputselect.$$.fragment);
    			t8 = space();
    			label1 = element("label");
    			create_component(inputcheckbox.$$.fragment);
    			t9 = text(" porte double");
    			t10 = space();
    			add_location(strong, file$h, 1270, 11, 41685);
    			add_location(p, file$h, 1270, 8, 41682);
    			add_location(legend, file$h, 1272, 10, 41768);
    			add_location(span, file$h, 1274, 12, 41854);
    			add_location(label0, file$h, 1273, 10, 41834);
    			set_style(label1, "display", "none");
    			add_location(label1, file$h, 1282, 10, 42303);
    			add_location(fieldset, file$h, 1271, 8, 41747);
    			this.first = p;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, strong);
    			append_dev(strong, t0);
    			append_dev(strong, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, fieldset, anchor);
    			append_dev(fieldset, legend);
    			append_dev(legend, t3);
    			append_dev(legend, t4);
    			append_dev(fieldset, t5);
    			append_dev(fieldset, label0);
    			append_dev(label0, span);
    			append_dev(label0, t7);
    			mount_component(inputselect, label0, null);
    			append_dev(fieldset, t8);
    			append_dev(fieldset, label1);
    			mount_component(inputcheckbox, label1, null);
    			append_dev(label1, t9);
    			append_dev(fieldset, t10);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty[0] & /*selection_casier_i*/ 16384) && t1_value !== (t1_value = /*selection_casier_i*/ ctx[14] + 1 + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty[0] & /*selection_casier_i*/ 16384) && t4_value !== (t4_value = /*selection_casier_i*/ ctx[14] + 1 + "")) set_data_dev(t4, t4_value);
    			const inputselect_changes = {};
    			if (dirty[0] & /*opt, selection_casier_i*/ 16386) inputselect_changes.init = /*opt*/ ctx[1].colonnes[/*selection_casier_i*/ ctx[14]].porte.type;

    			if (dirty[4] & /*$$scope*/ 8) {
    				inputselect_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty[0] & /*ui_colonnes, selection_casier_i*/ 16512) {
    				updating_value = true;
    				inputselect_changes.value = /*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].porte.type;
    				add_flush_callback(() => updating_value = false);
    			}

    			inputselect.$set(inputselect_changes);
    			const inputcheckbox_changes = {};
    			if (dirty[0] & /*opt, selection_casier_i*/ 16386) inputcheckbox_changes.def = /*opt*/ ctx[1].colonnes[/*selection_casier_i*/ ctx[14]].porte.double;

    			if (!updating_checked && dirty[0] & /*ui_colonnes, selection_casier_i*/ 16512) {
    				updating_checked = true;
    				inputcheckbox_changes.checked = /*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].porte.double;
    				add_flush_callback(() => updating_checked = false);
    			}

    			inputcheckbox.$set(inputcheckbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputselect.$$.fragment, local);
    			transition_in(inputcheckbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputselect.$$.fragment, local);
    			transition_out(inputcheckbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(fieldset);
    			destroy_component(inputselect);
    			destroy_component(inputcheckbox);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3$1.name,
    		type: "each",
    		source: "(1270:8) {#each [selection_casier] as sel (sel.key)}",
    		ctx
    	});

    	return block;
    }

    // (1298:12) <InputSelect               init={opt.colonnes[selection_casier_i].casiers[selection_casier_j].porte.type}               bind:value={ui_colonnes[selection_casier_i].casiers[selection_casier_j].porte.type}>
    function create_default_slot_1$1(ctx) {
    	let option0;
    	let t1;
    	let option1;
    	let t3;
    	let option2;
    	let t5;
    	let option3;

    	const block = {
    		c: function create() {
    			option0 = element("option");
    			option0.textContent = "Aucune";
    			t1 = space();
    			option1 = element("option");
    			option1.textContent = "Recouvrement total";
    			t3 = space();
    			option2 = element("option");
    			option2.textContent = "Recouvrement à moitié";
    			t5 = space();
    			option3 = element("option");
    			option3.textContent = "Encastré";
    			option0.__value = "";
    			option0.value = option0.__value;
    			add_location(option0, file$h, 1300, 14, 43108);
    			option1.__value = "total";
    			option1.value = option1.__value;
    			add_location(option1, file$h, 1301, 14, 43155);
    			option2.__value = "demi";
    			option2.value = option2.__value;
    			add_location(option2, file$h, 1302, 14, 43219);
    			option3.__value = "encastre";
    			option3.value = option3.__value;
    			add_location(option3, file$h, 1303, 14, 43285);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, option1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, option2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, option3, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(option1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(option2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(option3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(1298:12) <InputSelect               init={opt.colonnes[selection_casier_i].casiers[selection_casier_j].porte.type}               bind:value={ui_colonnes[selection_casier_i].casiers[selection_casier_j].porte.type}>",
    		ctx
    	});

    	return block;
    }

    // (1340:10) {:else}
    function create_else_block_1(ctx) {
    	let label;
    	let inputcheckbox;
    	let updating_checked;
    	let t;
    	let current;

    	function inputcheckbox_checked_binding_2(value) {
    		/*inputcheckbox_checked_binding_2*/ ctx[75].call(null, value);
    	}

    	let inputcheckbox_props = {
    		tristate: false,
    		def: /*opt*/ ctx[1].colonnes[/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15] - 1].panneau_dessous
    	};

    	if (/*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15] - 1].panneau_dessous !== void 0) {
    		inputcheckbox_props.checked = /*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15] - 1].panneau_dessous;
    	}

    	inputcheckbox = new InputCheckbox({
    			props: inputcheckbox_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputcheckbox, "checked", inputcheckbox_checked_binding_2));

    	const block = {
    		c: function create() {
    			label = element("label");
    			create_component(inputcheckbox.$$.fragment);
    			t = text(" panneau dessus");
    			add_location(label, file$h, 1340, 10, 45161);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			mount_component(inputcheckbox, label, null);
    			append_dev(label, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const inputcheckbox_changes = {};
    			if (dirty[0] & /*opt, selection_casier_i, selection_casier_j*/ 49154) inputcheckbox_changes.def = /*opt*/ ctx[1].colonnes[/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15] - 1].panneau_dessous;

    			if (!updating_checked && dirty[0] & /*ui_colonnes, selection_casier_i, selection_casier_j*/ 49280) {
    				updating_checked = true;
    				inputcheckbox_changes.checked = /*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15] - 1].panneau_dessous;
    				add_flush_callback(() => updating_checked = false);
    			}

    			inputcheckbox.$set(inputcheckbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputcheckbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputcheckbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			destroy_component(inputcheckbox);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(1340:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1335:10) {#if selection_casier_j == 0}
    function create_if_block_3$2(ctx) {
    	let label;
    	let inputcheckbox;
    	let updating_checked;
    	let t;
    	let current;

    	function inputcheckbox_checked_binding_1(value) {
    		/*inputcheckbox_checked_binding_1*/ ctx[74].call(null, value);
    	}

    	let inputcheckbox_props = {
    		tristate: false,
    		def: /*opt*/ ctx[1].panneau_dessus
    	};

    	if (/*ui*/ ctx[2].panneau_dessus !== void 0) {
    		inputcheckbox_props.checked = /*ui*/ ctx[2].panneau_dessus;
    	}

    	inputcheckbox = new InputCheckbox({
    			props: inputcheckbox_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputcheckbox, "checked", inputcheckbox_checked_binding_1));

    	const block = {
    		c: function create() {
    			label = element("label");
    			create_component(inputcheckbox.$$.fragment);
    			t = text(" panneau dessus (tout le meuble)");
    			add_location(label, file$h, 1335, 10, 44957);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			mount_component(inputcheckbox, label, null);
    			append_dev(label, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const inputcheckbox_changes = {};
    			if (dirty[0] & /*opt*/ 2) inputcheckbox_changes.def = /*opt*/ ctx[1].panneau_dessus;

    			if (!updating_checked && dirty[0] & /*ui*/ 4) {
    				updating_checked = true;
    				inputcheckbox_changes.checked = /*ui*/ ctx[2].panneau_dessus;
    				add_flush_callback(() => updating_checked = false);
    			}

    			inputcheckbox.$set(inputcheckbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputcheckbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputcheckbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			destroy_component(inputcheckbox);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(1335:10) {#if selection_casier_j == 0}",
    		ctx
    	});

    	return block;
    }

    // (1355:10) {:else}
    function create_else_block$2(ctx) {
    	let label;
    	let inputcheckbox;
    	let updating_checked;
    	let t;
    	let current;

    	function inputcheckbox_checked_binding_4(value) {
    		/*inputcheckbox_checked_binding_4*/ ctx[78].call(null, value);
    	}

    	let inputcheckbox_props = {
    		tristate: false,
    		def: /*opt*/ ctx[1].panneau_dessous
    	};

    	if (/*ui*/ ctx[2].panneau_dessous !== void 0) {
    		inputcheckbox_props.checked = /*ui*/ ctx[2].panneau_dessous;
    	}

    	inputcheckbox = new InputCheckbox({
    			props: inputcheckbox_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputcheckbox, "checked", inputcheckbox_checked_binding_4));

    	const block = {
    		c: function create() {
    			label = element("label");
    			create_component(inputcheckbox.$$.fragment);
    			t = text(" panneau dessous (tout le meuble)");
    			add_location(label, file$h, 1355, 10, 46130);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			mount_component(inputcheckbox, label, null);
    			append_dev(label, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const inputcheckbox_changes = {};
    			if (dirty[0] & /*opt*/ 2) inputcheckbox_changes.def = /*opt*/ ctx[1].panneau_dessous;

    			if (!updating_checked && dirty[0] & /*ui*/ 4) {
    				updating_checked = true;
    				inputcheckbox_changes.checked = /*ui*/ ctx[2].panneau_dessous;
    				add_flush_callback(() => updating_checked = false);
    			}

    			inputcheckbox.$set(inputcheckbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputcheckbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputcheckbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			destroy_component(inputcheckbox);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(1355:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1350:10) {#if selection_casier_j < ui_colonnes[selection_casier_i].casiers.length-1}
    function create_if_block_2$3(ctx) {
    	let label;
    	let inputcheckbox;
    	let updating_checked;
    	let t;
    	let current;

    	function inputcheckbox_checked_binding_3(value) {
    		/*inputcheckbox_checked_binding_3*/ ctx[77].call(null, value);
    	}

    	let inputcheckbox_props = {
    		tristate: false,
    		def: /*opt*/ ctx[1].colonnes[/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].panneau_dessous
    	};

    	if (/*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].panneau_dessous !== void 0) {
    		inputcheckbox_props.checked = /*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].panneau_dessous;
    	}

    	inputcheckbox = new InputCheckbox({
    			props: inputcheckbox_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputcheckbox, "checked", inputcheckbox_checked_binding_3));

    	const block = {
    		c: function create() {
    			label = element("label");
    			create_component(inputcheckbox.$$.fragment);
    			t = text(" panneau dessous");
    			add_location(label, file$h, 1350, 10, 45826);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			mount_component(inputcheckbox, label, null);
    			append_dev(label, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const inputcheckbox_changes = {};
    			if (dirty[0] & /*opt, selection_casier_i, selection_casier_j*/ 49154) inputcheckbox_changes.def = /*opt*/ ctx[1].colonnes[/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].panneau_dessous;

    			if (!updating_checked && dirty[0] & /*ui_colonnes, selection_casier_i, selection_casier_j*/ 49280) {
    				updating_checked = true;
    				inputcheckbox_changes.checked = /*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].panneau_dessous;
    				add_flush_callback(() => updating_checked = false);
    			}

    			inputcheckbox.$set(inputcheckbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputcheckbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputcheckbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			destroy_component(inputcheckbox);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(1350:10) {#if selection_casier_j < ui_colonnes[selection_casier_i].casiers.length-1}",
    		ctx
    	});

    	return block;
    }

    // (1362:12) {#if panneau.droite == selection_casier_j}
    function create_if_block_1$8(ctx) {
    	let label;
    	let inputcheckbox;
    	let updating_checked;
    	let t0;
    	let t1_value = /*k*/ ctx[112] + 1 + "";
    	let t1;
    	let t2;
    	let current;

    	function inputcheckbox_checked_binding_5(value) {
    		/*inputcheckbox_checked_binding_5*/ ctx[79].call(null, value, /*k*/ ctx[112]);
    	}

    	let inputcheckbox_props = {
    		tristate: false,
    		def: /*opt*/ ctx[1].montants[/*selection_casier_i*/ ctx[14]].panneaux[/*k*/ ctx[112]].actif
    	};

    	if (/*ui_montants*/ ctx[8][/*selection_casier_i*/ ctx[14]].panneaux_actifs[/*k*/ ctx[112]] !== void 0) {
    		inputcheckbox_props.checked = /*ui_montants*/ ctx[8][/*selection_casier_i*/ ctx[14]].panneaux_actifs[/*k*/ ctx[112]];
    	}

    	inputcheckbox = new InputCheckbox({
    			props: inputcheckbox_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputcheckbox, "checked", inputcheckbox_checked_binding_5));

    	const block = {
    		c: function create() {
    			label = element("label");
    			create_component(inputcheckbox.$$.fragment);
    			t0 = text(" panneau gauche (n°");
    			t1 = text(t1_value);
    			t2 = text(")");
    			add_location(label, file$h, 1362, 14, 46468);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			mount_component(inputcheckbox, label, null);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const inputcheckbox_changes = {};
    			if (dirty[0] & /*opt, selection_casier_i*/ 16386) inputcheckbox_changes.def = /*opt*/ ctx[1].montants[/*selection_casier_i*/ ctx[14]].panneaux[/*k*/ ctx[112]].actif;

    			if (!updating_checked && dirty[0] & /*ui_montants, selection_casier_i*/ 16640) {
    				updating_checked = true;
    				inputcheckbox_changes.checked = /*ui_montants*/ ctx[8][/*selection_casier_i*/ ctx[14]].panneaux_actifs[/*k*/ ctx[112]];
    				add_flush_callback(() => updating_checked = false);
    			}

    			inputcheckbox.$set(inputcheckbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputcheckbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputcheckbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			destroy_component(inputcheckbox);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$8.name,
    		type: "if",
    		source: "(1362:12) {#if panneau.droite == selection_casier_j}",
    		ctx
    	});

    	return block;
    }

    // (1361:10) {#each opt.montants[selection_casier_i].panneaux as panneau, k}
    function create_each_block_2$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*panneau*/ ctx[110].droite == /*selection_casier_j*/ ctx[15] && create_if_block_1$8(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*panneau*/ ctx[110].droite == /*selection_casier_j*/ ctx[15]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*opt, selection_casier_i, selection_casier_j*/ 49154) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$8(ctx);
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
    		id: create_each_block_2$3.name,
    		type: "each",
    		source: "(1361:10) {#each opt.montants[selection_casier_i].panneaux as panneau, k}",
    		ctx
    	});

    	return block;
    }

    // (1370:12) {#if panneau.gauche == selection_casier_j}
    function create_if_block$9(ctx) {
    	let label;
    	let inputcheckbox;
    	let updating_checked;
    	let t0;
    	let t1_value = /*k*/ ctx[112] + 1 + "";
    	let t1;
    	let t2;
    	let current;

    	function inputcheckbox_checked_binding_6(value) {
    		/*inputcheckbox_checked_binding_6*/ ctx[80].call(null, value, /*k*/ ctx[112]);
    	}

    	let inputcheckbox_props = {
    		tristate: false,
    		def: /*opt*/ ctx[1].montants[/*selection_casier_i*/ ctx[14] + 1].panneaux[/*k*/ ctx[112]].actif
    	};

    	if (/*ui_montants*/ ctx[8][/*selection_casier_i*/ ctx[14] + 1].panneaux_actifs[/*k*/ ctx[112]] !== void 0) {
    		inputcheckbox_props.checked = /*ui_montants*/ ctx[8][/*selection_casier_i*/ ctx[14] + 1].panneaux_actifs[/*k*/ ctx[112]];
    	}

    	inputcheckbox = new InputCheckbox({
    			props: inputcheckbox_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputcheckbox, "checked", inputcheckbox_checked_binding_6));

    	const block = {
    		c: function create() {
    			label = element("label");
    			create_component(inputcheckbox.$$.fragment);
    			t0 = text(" panneau droite (n°");
    			t1 = text(t1_value);
    			t2 = text(")");
    			add_location(label, file$h, 1370, 14, 46895);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			mount_component(inputcheckbox, label, null);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const inputcheckbox_changes = {};
    			if (dirty[0] & /*opt, selection_casier_i*/ 16386) inputcheckbox_changes.def = /*opt*/ ctx[1].montants[/*selection_casier_i*/ ctx[14] + 1].panneaux[/*k*/ ctx[112]].actif;

    			if (!updating_checked && dirty[0] & /*ui_montants, selection_casier_i*/ 16640) {
    				updating_checked = true;
    				inputcheckbox_changes.checked = /*ui_montants*/ ctx[8][/*selection_casier_i*/ ctx[14] + 1].panneaux_actifs[/*k*/ ctx[112]];
    				add_flush_callback(() => updating_checked = false);
    			}

    			inputcheckbox.$set(inputcheckbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputcheckbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputcheckbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			destroy_component(inputcheckbox);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(1370:12) {#if panneau.gauche == selection_casier_j}",
    		ctx
    	});

    	return block;
    }

    // (1369:10) {#each opt.montants[selection_casier_i+1].panneaux as panneau, k}
    function create_each_block_1$5(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*panneau*/ ctx[110].gauche == /*selection_casier_j*/ ctx[15] && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*panneau*/ ctx[110].gauche == /*selection_casier_j*/ ctx[15]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*opt, selection_casier_i, selection_casier_j*/ 49154) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$9(ctx);
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
    		id: create_each_block_1$5.name,
    		type: "each",
    		source: "(1369:10) {#each opt.montants[selection_casier_i+1].panneaux as panneau, k}",
    		ctx
    	});

    	return block;
    }

    // (1292:8) {#each [selection_casier] as sel (sel.key)}
    function create_each_block$c(key_1, ctx) {
    	let p;
    	let strong;
    	let t0;
    	let t1_value = /*selection_casier_j*/ ctx[15] + 1 + "";
    	let t1;
    	let t2;
    	let fieldset0;
    	let legend0;
    	let t3;
    	let t4_value = /*selection_casier_i*/ ctx[14] + 1 + "";
    	let t4;
    	let t5;
    	let t6_value = /*selection_casier_j*/ ctx[15] + 1 + "";
    	let t6;
    	let t7;
    	let label2;
    	let span0;
    	let t9;
    	let inputselect;
    	let updating_value;
    	let t10;
    	let label0;
    	let inputcheckbox0;
    	let updating_checked;
    	let t11;
    	let t12;
    	let label1;
    	let inputcheckbox1;
    	let updating_checked_1;
    	let t13;
    	let t14;
    	let fieldset1;
    	let legend1;
    	let t15;
    	let t16_value = /*selection_casier_i*/ ctx[14] + 1 + "";
    	let t16;
    	let t17;
    	let t18_value = /*selection_casier_j*/ ctx[15] + 1 + "";
    	let t18;
    	let t19;
    	let label3;
    	let span1;
    	let t21;
    	let inputnumber;
    	let updating_value_1;
    	let t22;
    	let fieldset2;
    	let legend2;
    	let t23;
    	let t24_value = /*selection_casier_i*/ ctx[14] + 1 + "";
    	let t24;
    	let t25;
    	let t26_value = /*selection_casier_j*/ ctx[15] + 1 + "";
    	let t26;
    	let t27;
    	let label4;
    	let inputcheckbox2;
    	let updating_checked_2;
    	let t28;
    	let t29;
    	let fieldset3;
    	let legend3;
    	let t30;
    	let t31_value = /*selection_casier_i*/ ctx[14] + 1 + "";
    	let t31;
    	let t32;
    	let t33_value = /*selection_casier_j*/ ctx[15] + 1 + "";
    	let t33;
    	let t34;
    	let current_block_type_index;
    	let if_block0;
    	let t35;
    	let label5;
    	let inputcheckbox3;
    	let updating_checked_3;
    	let t36;
    	let t37;
    	let current_block_type_index_1;
    	let if_block1;
    	let t38;
    	let t39;
    	let t40;
    	let current;

    	function inputselect_value_binding_1(value) {
    		/*inputselect_value_binding_1*/ ctx[69].call(null, value);
    	}

    	let inputselect_props = {
    		init: /*opt*/ ctx[1].colonnes[/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].porte.type,
    		$$slots: { default: [create_default_slot_1$1] },
    		$$scope: { ctx }
    	};

    	if (/*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].porte.type !== void 0) {
    		inputselect_props.value = /*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].porte.type;
    	}

    	inputselect = new InputSelect({ props: inputselect_props, $$inline: true });
    	binding_callbacks.push(() => bind(inputselect, "value", inputselect_value_binding_1));

    	function inputcheckbox0_checked_binding(value) {
    		/*inputcheckbox0_checked_binding*/ ctx[70].call(null, value);
    	}

    	let inputcheckbox0_props = {
    		tristate: false,
    		def: /*opt*/ ctx[1].colonnes[/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].porte.double
    	};

    	if (/*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].porte.double !== void 0) {
    		inputcheckbox0_props.checked = /*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].porte.double;
    	}

    	inputcheckbox0 = new InputCheckbox({
    			props: inputcheckbox0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputcheckbox0, "checked", inputcheckbox0_checked_binding));

    	function inputcheckbox1_checked_binding(value) {
    		/*inputcheckbox1_checked_binding*/ ctx[71].call(null, value);
    	}

    	let inputcheckbox1_props = {
    		tristate: false,
    		def: /*opt*/ ctx[1].colonnes[/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].porte.facade
    	};

    	if (/*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].porte.facade !== void 0) {
    		inputcheckbox1_props.checked = /*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].porte.facade;
    	}

    	inputcheckbox1 = new InputCheckbox({
    			props: inputcheckbox1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputcheckbox1, "checked", inputcheckbox1_checked_binding));

    	function inputnumber_value_binding(value) {
    		/*inputnumber_value_binding*/ ctx[72].call(null, value);
    	}

    	let inputnumber_props = {
    		def: /*opt*/ ctx[1].colonnes[/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].num_etageres
    	};

    	if (/*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].num_etageres !== void 0) {
    		inputnumber_props.value = /*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].num_etageres;
    	}

    	inputnumber = new InputNumber({ props: inputnumber_props, $$inline: true });
    	binding_callbacks.push(() => bind(inputnumber, "value", inputnumber_value_binding));

    	function inputcheckbox2_checked_binding(value) {
    		/*inputcheckbox2_checked_binding*/ ctx[73].call(null, value);
    	}

    	let inputcheckbox2_props = {
    		tristate: false,
    		def: /*opt*/ ctx[1].colonnes[/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].tiroir
    	};

    	if (/*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].tiroir !== void 0) {
    		inputcheckbox2_props.checked = /*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].tiroir;
    	}

    	inputcheckbox2 = new InputCheckbox({
    			props: inputcheckbox2_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputcheckbox2, "checked", inputcheckbox2_checked_binding));
    	const if_block_creators = [create_if_block_3$2, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*selection_casier_j*/ ctx[15] == 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	function inputcheckbox3_checked_binding(value) {
    		/*inputcheckbox3_checked_binding*/ ctx[76].call(null, value);
    	}

    	let inputcheckbox3_props = {
    		tristate: false,
    		def: /*opt*/ ctx[1].colonnes[/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].panneau_dos
    	};

    	if (/*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].panneau_dos !== void 0) {
    		inputcheckbox3_props.checked = /*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].panneau_dos;
    	}

    	inputcheckbox3 = new InputCheckbox({
    			props: inputcheckbox3_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputcheckbox3, "checked", inputcheckbox3_checked_binding));
    	const if_block_creators_1 = [create_if_block_2$3, create_else_block$2];
    	const if_blocks_1 = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*selection_casier_j*/ ctx[15] < /*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers.length - 1) return 0;
    		return 1;
    	}

    	current_block_type_index_1 = select_block_type_1(ctx);
    	if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    	let each_value_2 = /*opt*/ ctx[1].montants[/*selection_casier_i*/ ctx[14]].panneaux;
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2$3(get_each_context_2$3(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value_1 = /*opt*/ ctx[1].montants[/*selection_casier_i*/ ctx[14] + 1].panneaux;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$5(get_each_context_1$5(ctx, each_value_1, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			p = element("p");
    			strong = element("strong");
    			t0 = text("Casier n° ");
    			t1 = text(t1_value);
    			t2 = space();
    			fieldset0 = element("fieldset");
    			legend0 = element("legend");
    			t3 = text("Porte col°");
    			t4 = text(t4_value);
    			t5 = text(" cas°");
    			t6 = text(t6_value);
    			t7 = space();
    			label2 = element("label");
    			span0 = element("span");
    			span0.textContent = "Type : ";
    			t9 = space();
    			create_component(inputselect.$$.fragment);
    			t10 = space();
    			label0 = element("label");
    			create_component(inputcheckbox0.$$.fragment);
    			t11 = text(" porte double");
    			t12 = space();
    			label1 = element("label");
    			create_component(inputcheckbox1.$$.fragment);
    			t13 = text(" façade seulement");
    			t14 = space();
    			fieldset1 = element("fieldset");
    			legend1 = element("legend");
    			t15 = text("Étagère col°");
    			t16 = text(t16_value);
    			t17 = text(" cas°");
    			t18 = text(t18_value);
    			t19 = space();
    			label3 = element("label");
    			span1 = element("span");
    			span1.textContent = "Nombre d'étagères";
    			t21 = space();
    			create_component(inputnumber.$$.fragment);
    			t22 = space();
    			fieldset2 = element("fieldset");
    			legend2 = element("legend");
    			t23 = text("Tiroir col°");
    			t24 = text(t24_value);
    			t25 = text(" cas°");
    			t26 = text(t26_value);
    			t27 = space();
    			label4 = element("label");
    			create_component(inputcheckbox2.$$.fragment);
    			t28 = text(" tiroir");
    			t29 = space();
    			fieldset3 = element("fieldset");
    			legend3 = element("legend");
    			t30 = text("Panneaux col°");
    			t31 = text(t31_value);
    			t32 = text(" cas°");
    			t33 = text(t33_value);
    			t34 = space();
    			if_block0.c();
    			t35 = space();
    			label5 = element("label");
    			create_component(inputcheckbox3.$$.fragment);
    			t36 = text(" panneau dos");
    			t37 = space();
    			if_block1.c();
    			t38 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t39 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t40 = space();
    			add_location(strong, file$h, 1292, 11, 42661);
    			add_location(p, file$h, 1292, 8, 42658);
    			add_location(legend0, file$h, 1294, 10, 42744);
    			add_location(span0, file$h, 1296, 12, 42851);
    			add_location(label0, file$h, 1305, 12, 43367);
    			add_location(label1, file$h, 1309, 12, 43652);
    			add_location(label2, file$h, 1295, 10, 42831);
    			add_location(fieldset0, file$h, 1293, 8, 42723);
    			add_location(legend1, file$h, 1316, 10, 43997);
    			add_location(span1, file$h, 1318, 12, 44106);
    			add_location(label3, file$h, 1317, 10, 44086);
    			add_location(fieldset1, file$h, 1315, 8, 43976);
    			add_location(legend2, file$h, 1326, 10, 44441);
    			add_location(label4, file$h, 1327, 10, 44529);
    			add_location(fieldset2, file$h, 1325, 8, 44420);
    			add_location(legend3, file$h, 1333, 10, 44827);
    			add_location(label5, file$h, 1345, 10, 45466);
    			add_location(fieldset3, file$h, 1332, 8, 44806);
    			this.first = p;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, strong);
    			append_dev(strong, t0);
    			append_dev(strong, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, fieldset0, anchor);
    			append_dev(fieldset0, legend0);
    			append_dev(legend0, t3);
    			append_dev(legend0, t4);
    			append_dev(legend0, t5);
    			append_dev(legend0, t6);
    			append_dev(fieldset0, t7);
    			append_dev(fieldset0, label2);
    			append_dev(label2, span0);
    			append_dev(label2, t9);
    			mount_component(inputselect, label2, null);
    			append_dev(label2, t10);
    			append_dev(label2, label0);
    			mount_component(inputcheckbox0, label0, null);
    			append_dev(label0, t11);
    			append_dev(label2, t12);
    			append_dev(label2, label1);
    			mount_component(inputcheckbox1, label1, null);
    			append_dev(label1, t13);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, fieldset1, anchor);
    			append_dev(fieldset1, legend1);
    			append_dev(legend1, t15);
    			append_dev(legend1, t16);
    			append_dev(legend1, t17);
    			append_dev(legend1, t18);
    			append_dev(fieldset1, t19);
    			append_dev(fieldset1, label3);
    			append_dev(label3, span1);
    			append_dev(label3, t21);
    			mount_component(inputnumber, label3, null);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, fieldset2, anchor);
    			append_dev(fieldset2, legend2);
    			append_dev(legend2, t23);
    			append_dev(legend2, t24);
    			append_dev(legend2, t25);
    			append_dev(legend2, t26);
    			append_dev(fieldset2, t27);
    			append_dev(fieldset2, label4);
    			mount_component(inputcheckbox2, label4, null);
    			append_dev(label4, t28);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, fieldset3, anchor);
    			append_dev(fieldset3, legend3);
    			append_dev(legend3, t30);
    			append_dev(legend3, t31);
    			append_dev(legend3, t32);
    			append_dev(legend3, t33);
    			append_dev(fieldset3, t34);
    			if_blocks[current_block_type_index].m(fieldset3, null);
    			append_dev(fieldset3, t35);
    			append_dev(fieldset3, label5);
    			mount_component(inputcheckbox3, label5, null);
    			append_dev(label5, t36);
    			append_dev(fieldset3, t37);
    			if_blocks_1[current_block_type_index_1].m(fieldset3, null);
    			append_dev(fieldset3, t38);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(fieldset3, null);
    			}

    			append_dev(fieldset3, t39);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(fieldset3, null);
    			}

    			append_dev(fieldset3, t40);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty[0] & /*selection_casier_j*/ 32768) && t1_value !== (t1_value = /*selection_casier_j*/ ctx[15] + 1 + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty[0] & /*selection_casier_i*/ 16384) && t4_value !== (t4_value = /*selection_casier_i*/ ctx[14] + 1 + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty[0] & /*selection_casier_j*/ 32768) && t6_value !== (t6_value = /*selection_casier_j*/ ctx[15] + 1 + "")) set_data_dev(t6, t6_value);
    			const inputselect_changes = {};
    			if (dirty[0] & /*opt, selection_casier_i, selection_casier_j*/ 49154) inputselect_changes.init = /*opt*/ ctx[1].colonnes[/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].porte.type;

    			if (dirty[4] & /*$$scope*/ 8) {
    				inputselect_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty[0] & /*ui_colonnes, selection_casier_i, selection_casier_j*/ 49280) {
    				updating_value = true;
    				inputselect_changes.value = /*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].porte.type;
    				add_flush_callback(() => updating_value = false);
    			}

    			inputselect.$set(inputselect_changes);
    			const inputcheckbox0_changes = {};
    			if (dirty[0] & /*opt, selection_casier_i, selection_casier_j*/ 49154) inputcheckbox0_changes.def = /*opt*/ ctx[1].colonnes[/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].porte.double;

    			if (!updating_checked && dirty[0] & /*ui_colonnes, selection_casier_i, selection_casier_j*/ 49280) {
    				updating_checked = true;
    				inputcheckbox0_changes.checked = /*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].porte.double;
    				add_flush_callback(() => updating_checked = false);
    			}

    			inputcheckbox0.$set(inputcheckbox0_changes);
    			const inputcheckbox1_changes = {};
    			if (dirty[0] & /*opt, selection_casier_i, selection_casier_j*/ 49154) inputcheckbox1_changes.def = /*opt*/ ctx[1].colonnes[/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].porte.facade;

    			if (!updating_checked_1 && dirty[0] & /*ui_colonnes, selection_casier_i, selection_casier_j*/ 49280) {
    				updating_checked_1 = true;
    				inputcheckbox1_changes.checked = /*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].porte.facade;
    				add_flush_callback(() => updating_checked_1 = false);
    			}

    			inputcheckbox1.$set(inputcheckbox1_changes);
    			if ((!current || dirty[0] & /*selection_casier_i*/ 16384) && t16_value !== (t16_value = /*selection_casier_i*/ ctx[14] + 1 + "")) set_data_dev(t16, t16_value);
    			if ((!current || dirty[0] & /*selection_casier_j*/ 32768) && t18_value !== (t18_value = /*selection_casier_j*/ ctx[15] + 1 + "")) set_data_dev(t18, t18_value);
    			const inputnumber_changes = {};
    			if (dirty[0] & /*opt, selection_casier_i, selection_casier_j*/ 49154) inputnumber_changes.def = /*opt*/ ctx[1].colonnes[/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].num_etageres;

    			if (!updating_value_1 && dirty[0] & /*ui_colonnes, selection_casier_i, selection_casier_j*/ 49280) {
    				updating_value_1 = true;
    				inputnumber_changes.value = /*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].num_etageres;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			inputnumber.$set(inputnumber_changes);
    			if ((!current || dirty[0] & /*selection_casier_i*/ 16384) && t24_value !== (t24_value = /*selection_casier_i*/ ctx[14] + 1 + "")) set_data_dev(t24, t24_value);
    			if ((!current || dirty[0] & /*selection_casier_j*/ 32768) && t26_value !== (t26_value = /*selection_casier_j*/ ctx[15] + 1 + "")) set_data_dev(t26, t26_value);
    			const inputcheckbox2_changes = {};
    			if (dirty[0] & /*opt, selection_casier_i, selection_casier_j*/ 49154) inputcheckbox2_changes.def = /*opt*/ ctx[1].colonnes[/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].tiroir;

    			if (!updating_checked_2 && dirty[0] & /*ui_colonnes, selection_casier_i, selection_casier_j*/ 49280) {
    				updating_checked_2 = true;
    				inputcheckbox2_changes.checked = /*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].tiroir;
    				add_flush_callback(() => updating_checked_2 = false);
    			}

    			inputcheckbox2.$set(inputcheckbox2_changes);
    			if ((!current || dirty[0] & /*selection_casier_i*/ 16384) && t31_value !== (t31_value = /*selection_casier_i*/ ctx[14] + 1 + "")) set_data_dev(t31, t31_value);
    			if ((!current || dirty[0] & /*selection_casier_j*/ 32768) && t33_value !== (t33_value = /*selection_casier_j*/ ctx[15] + 1 + "")) set_data_dev(t33, t33_value);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(fieldset3, t35);
    			}

    			const inputcheckbox3_changes = {};
    			if (dirty[0] & /*opt, selection_casier_i, selection_casier_j*/ 49154) inputcheckbox3_changes.def = /*opt*/ ctx[1].colonnes[/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].panneau_dos;

    			if (!updating_checked_3 && dirty[0] & /*ui_colonnes, selection_casier_i, selection_casier_j*/ 49280) {
    				updating_checked_3 = true;
    				inputcheckbox3_changes.checked = /*ui_colonnes*/ ctx[7][/*selection_casier_i*/ ctx[14]].casiers[/*selection_casier_j*/ ctx[15]].panneau_dos;
    				add_flush_callback(() => updating_checked_3 = false);
    			}

    			inputcheckbox3.$set(inputcheckbox3_changes);
    			let previous_block_index_1 = current_block_type_index_1;
    			current_block_type_index_1 = select_block_type_1(ctx);

    			if (current_block_type_index_1 === previous_block_index_1) {
    				if_blocks_1[current_block_type_index_1].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
    					if_blocks_1[previous_block_index_1] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks_1[current_block_type_index_1];

    				if (!if_block1) {
    					if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(fieldset3, t38);
    			}

    			if (dirty[0] & /*opt, selection_casier_i, ui_montants, selection_casier_j*/ 49410) {
    				each_value_2 = /*opt*/ ctx[1].montants[/*selection_casier_i*/ ctx[14]].panneaux;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$3(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_2$3(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(fieldset3, t39);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*opt, selection_casier_i, ui_montants, selection_casier_j*/ 49410) {
    				each_value_1 = /*opt*/ ctx[1].montants[/*selection_casier_i*/ ctx[14] + 1].panneaux;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$5(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(fieldset3, t40);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputselect.$$.fragment, local);
    			transition_in(inputcheckbox0.$$.fragment, local);
    			transition_in(inputcheckbox1.$$.fragment, local);
    			transition_in(inputnumber.$$.fragment, local);
    			transition_in(inputcheckbox2.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(inputcheckbox3.$$.fragment, local);
    			transition_in(if_block1);

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputselect.$$.fragment, local);
    			transition_out(inputcheckbox0.$$.fragment, local);
    			transition_out(inputcheckbox1.$$.fragment, local);
    			transition_out(inputnumber.$$.fragment, local);
    			transition_out(inputcheckbox2.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(inputcheckbox3.$$.fragment, local);
    			transition_out(if_block1);
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(fieldset0);
    			destroy_component(inputselect);
    			destroy_component(inputcheckbox0);
    			destroy_component(inputcheckbox1);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(fieldset1);
    			destroy_component(inputnumber);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(fieldset2);
    			destroy_component(inputcheckbox2);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(fieldset3);
    			if_blocks[current_block_type_index].d();
    			destroy_component(inputcheckbox3);
    			if_blocks_1[current_block_type_index_1].d();
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$c.name,
    		type: "each",
    		source: "(1292:8) {#each [selection_casier] as sel (sel.key)}",
    		ctx
    	});

    	return block;
    }

    // (1164:2) <div class="main" slot="dim">
    function create_dim_slot$1(ctx) {
    	let div0;
    	let h3;
    	let t1;
    	let form;
    	let label0;
    	let span0;
    	let inputnumber0;
    	let updating_value;
    	let t3;
    	let t4;
    	let label1;
    	let span1;
    	let inputnumber1;
    	let updating_value_1;
    	let t6;
    	let t7;
    	let label2;
    	let span2;
    	let inputnumber2;
    	let updating_value_2;
    	let t9;
    	let t10;
    	let label3;
    	let span3;
    	let input;
    	let t12;
    	let table;
    	let tr0;
    	let td0;
    	let t13;
    	let t14;
    	let tr1;
    	let td1;
    	let t16;
    	let t17;
    	let td2;
    	let t19;
    	let tr2;
    	let td3;
    	let t21;
    	let t22;
    	let td4;
    	let t23;
    	let tr3;
    	let td5;
    	let t25;
    	let t26;
    	let td6;
    	let t27;
    	let show_if = /*largeur_colonnes*/ ctx[4].filter(func).length == /*largeur_colonnes*/ ctx[4].length;
    	let t28;
    	let hr0;
    	let t29;
    	let div4;
    	let div1;
    	let t30;
    	let div2;
    	let each_blocks_1 = [];
    	let each5_lookup = new Map();
    	let t31;
    	let div3;
    	let each_blocks = [];
    	let each6_lookup = new Map();
    	let t32;
    	let hr1;
    	let t33;
    	let label4;
    	let span4;
    	let inputnumber3;
    	let updating_value_3;
    	let t35;
    	let t36;
    	let label5;
    	let span5;
    	let inputnumber4;
    	let updating_value_4;
    	let t38;
    	let t39;
    	let label6;
    	let span6;
    	let inputnumber5;
    	let updating_value_5;
    	let t41;
    	let t42;
    	let label7;
    	let span7;
    	let inputnumber6;
    	let updating_value_6;
    	let t44;
    	let t45;
    	let label8;
    	let span8;
    	let inputnumber7;
    	let updating_value_7;
    	let t47;
    	let t48;
    	let label9;
    	let span9;
    	let inputnumber8;
    	let updating_value_8;
    	let t50;
    	let t51;
    	let hr2;
    	let t52;
    	let label10;
    	let span10;
    	let inputnumber9;
    	let updating_value_9;
    	let t54;
    	let t55;
    	let label11;
    	let span11;
    	let inputnumber10;
    	let updating_value_10;
    	let t57;
    	let t58;
    	let label12;
    	let span12;
    	let inputnumber11;
    	let updating_value_11;
    	let t60;
    	let t61;
    	let label13;
    	let span13;
    	let t63;
    	let inputnumber12;
    	let updating_value_12;
    	let t64;
    	let current;
    	let mounted;
    	let dispose;

    	function inputnumber0_value_binding(value) {
    		/*inputnumber0_value_binding*/ ctx[54].call(null, value);
    	}

    	let inputnumber0_props = {
    		min: "0",
    		def: /*defaults*/ ctx[20].hauteur
    	};

    	if (/*ui*/ ctx[2].hauteur !== void 0) {
    		inputnumber0_props.value = /*ui*/ ctx[2].hauteur;
    	}

    	inputnumber0 = new InputNumber({
    			props: inputnumber0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber0, "value", inputnumber0_value_binding));

    	function inputnumber1_value_binding(value) {
    		/*inputnumber1_value_binding*/ ctx[55].call(null, value);
    	}

    	let inputnumber1_props = {
    		min: "0",
    		def: /*defaults*/ ctx[20].largeur
    	};

    	if (/*ui*/ ctx[2].largeur !== void 0) {
    		inputnumber1_props.value = /*ui*/ ctx[2].largeur;
    	}

    	inputnumber1 = new InputNumber({
    			props: inputnumber1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber1, "value", inputnumber1_value_binding));

    	function inputnumber2_value_binding(value) {
    		/*inputnumber2_value_binding*/ ctx[56].call(null, value);
    	}

    	let inputnumber2_props = {
    		min: "0",
    		def: /*defaults*/ ctx[20].profondeur
    	};

    	if (/*ui*/ ctx[2].profondeur !== void 0) {
    		inputnumber2_props.value = /*ui*/ ctx[2].profondeur;
    	}

    	inputnumber2 = new InputNumber({
    			props: inputnumber2_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber2, "value", inputnumber2_value_binding));
    	let each_value_10 = /*opt*/ ctx[1].colonnes;
    	validate_each_argument(each_value_10);
    	let each_blocks_6 = [];

    	for (let i = 0; i < each_value_10.length; i += 1) {
    		each_blocks_6[i] = create_each_block_10(get_each_context_10(ctx, each_value_10, i));
    	}

    	let each_value_9 = /*opt*/ ctx[1].colonnes;
    	validate_each_argument(each_value_9);
    	let each_blocks_5 = [];

    	for (let i = 0; i < each_value_9.length; i += 1) {
    		each_blocks_5[i] = create_each_block_9(get_each_context_9(ctx, each_value_9, i));
    	}

    	let each_value_8 = /*opt*/ ctx[1].colonnes;
    	validate_each_argument(each_value_8);
    	let each_blocks_4 = [];

    	for (let i = 0; i < each_value_8.length; i += 1) {
    		each_blocks_4[i] = create_each_block_8(get_each_context_8(ctx, each_value_8, i));
    	}

    	let each_value_6 = /*opt*/ ctx[1].colonnes;
    	validate_each_argument(each_value_6);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks_3[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	let if_block = show_if && create_if_block_4$1(ctx);
    	let each_value_4 = /*opt*/ ctx[1].colonnes;
    	validate_each_argument(each_value_4);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks_2[i] = create_each_block_4$1(get_each_context_4$1(ctx, each_value_4, i));
    	}

    	let each_value_3 = [/*selection_casier*/ ctx[19]];
    	validate_each_argument(each_value_3);
    	const get_key = ctx => /*sel*/ ctx[107].key;
    	validate_each_keys(ctx, each_value_3, get_each_context_3$1, get_key);

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context_3$1(ctx, each_value_3, i);
    		let key = get_key(child_ctx);
    		each5_lookup.set(key, each_blocks_1[i] = create_each_block_3$1(key, child_ctx));
    	}

    	let each_value = [/*selection_casier*/ ctx[19]];
    	validate_each_argument(each_value);
    	const get_key_1 = ctx => /*sel*/ ctx[107].key;
    	validate_each_keys(ctx, each_value, get_each_context$c, get_key_1);

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context$c(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each6_lookup.set(key, each_blocks[i] = create_each_block$c(key, child_ctx));
    	}

    	function inputnumber3_value_binding(value) {
    		/*inputnumber3_value_binding*/ ctx[81].call(null, value);
    	}

    	let inputnumber3_props = {
    		def: /*opt*/ ctx[1].epaisseur_montants,
    		min: "0"
    	};

    	if (/*ui*/ ctx[2].epaisseur_montants !== void 0) {
    		inputnumber3_props.value = /*ui*/ ctx[2].epaisseur_montants;
    	}

    	inputnumber3 = new InputNumber({
    			props: inputnumber3_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber3, "value", inputnumber3_value_binding));

    	function inputnumber4_value_binding(value) {
    		/*inputnumber4_value_binding*/ ctx[82].call(null, value);
    	}

    	let inputnumber4_props = {
    		def: /*opt*/ ctx[1].epaisseur_traverses,
    		min: "0"
    	};

    	if (/*ui*/ ctx[2].epaisseur_traverses !== void 0) {
    		inputnumber4_props.value = /*ui*/ ctx[2].epaisseur_traverses;
    	}

    	inputnumber4 = new InputNumber({
    			props: inputnumber4_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber4, "value", inputnumber4_value_binding));

    	function inputnumber5_value_binding(value) {
    		/*inputnumber5_value_binding*/ ctx[83].call(null, value);
    	}

    	let inputnumber5_props = {
    		def: /*opt*/ ctx[1].largeur_montants,
    		min: "0"
    	};

    	if (/*ui*/ ctx[2].largeur_montants !== void 0) {
    		inputnumber5_props.value = /*ui*/ ctx[2].largeur_montants;
    	}

    	inputnumber5 = new InputNumber({
    			props: inputnumber5_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber5, "value", inputnumber5_value_binding));

    	function inputnumber6_value_binding(value) {
    		/*inputnumber6_value_binding*/ ctx[84].call(null, value);
    	}

    	let inputnumber6_props = {
    		def: /*opt*/ ctx[1].largeur_traverses,
    		min: "0"
    	};

    	if (/*ui*/ ctx[2].largeur_traverses !== void 0) {
    		inputnumber6_props.value = /*ui*/ ctx[2].largeur_traverses;
    	}

    	inputnumber6 = new InputNumber({
    			props: inputnumber6_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber6, "value", inputnumber6_value_binding));

    	function inputnumber7_value_binding(value) {
    		/*inputnumber7_value_binding*/ ctx[85].call(null, value);
    	}

    	let inputnumber7_props = {
    		def: /*opt*/ ctx[1].profondeur_tenons_cotes,
    		min: "0"
    	};

    	if (/*ui*/ ctx[2].profondeur_tenons_cotes !== void 0) {
    		inputnumber7_props.value = /*ui*/ ctx[2].profondeur_tenons_cotes;
    	}

    	inputnumber7 = new InputNumber({
    			props: inputnumber7_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber7, "value", inputnumber7_value_binding));

    	function inputnumber8_value_binding(value) {
    		/*inputnumber8_value_binding*/ ctx[86].call(null, value);
    	}

    	let inputnumber8_props = {
    		def: /*opt*/ ctx[1].profondeur_tenons,
    		min: "0"
    	};

    	if (/*ui*/ ctx[2].profondeur_tenons !== void 0) {
    		inputnumber8_props.value = /*ui*/ ctx[2].profondeur_tenons;
    	}

    	inputnumber8 = new InputNumber({
    			props: inputnumber8_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber8, "value", inputnumber8_value_binding));

    	function inputnumber9_value_binding(value) {
    		/*inputnumber9_value_binding*/ ctx[87].call(null, value);
    	}

    	let inputnumber9_props = {
    		def: /*opt*/ ctx[1].epaisseur_panneau,
    		min: "0"
    	};

    	if (/*ui*/ ctx[2].epaisseur_panneau !== void 0) {
    		inputnumber9_props.value = /*ui*/ ctx[2].epaisseur_panneau;
    	}

    	inputnumber9 = new InputNumber({
    			props: inputnumber9_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber9, "value", inputnumber9_value_binding));

    	function inputnumber10_value_binding(value) {
    		/*inputnumber10_value_binding*/ ctx[88].call(null, value);
    	}

    	let inputnumber10_props = {
    		def: /*opt*/ ctx[1].profondeur_rainure,
    		min: "0"
    	};

    	if (/*ui*/ ctx[2].profondeur_rainure !== void 0) {
    		inputnumber10_props.value = /*ui*/ ctx[2].profondeur_rainure;
    	}

    	inputnumber10 = new InputNumber({
    			props: inputnumber10_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber10, "value", inputnumber10_value_binding));

    	function inputnumber11_value_binding(value) {
    		/*inputnumber11_value_binding*/ ctx[89].call(null, value);
    	}

    	let inputnumber11_props = {
    		def: /*opt*/ ctx[1].jeu_rainure,
    		min: "0"
    	};

    	if (/*ui*/ ctx[2].jeu_rainure !== void 0) {
    		inputnumber11_props.value = /*ui*/ ctx[2].jeu_rainure;
    	}

    	inputnumber11 = new InputNumber({
    			props: inputnumber11_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber11, "value", inputnumber11_value_binding));

    	function inputnumber12_value_binding(value) {
    		/*inputnumber12_value_binding*/ ctx[90].call(null, value);
    	}

    	let inputnumber12_props = {
    		def: /*opt*/ ctx[1].montants_inter_longueur_tenon,
    		min: "0"
    	};

    	if (/*ui*/ ctx[2].montants_inter_longueur_tenon !== void 0) {
    		inputnumber12_props.value = /*ui*/ ctx[2].montants_inter_longueur_tenon;
    	}

    	inputnumber12 = new InputNumber({
    			props: inputnumber12_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber12, "value", inputnumber12_value_binding));

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Mesures";
    			t1 = space();
    			form = element("form");
    			label0 = element("label");
    			span0 = element("span");
    			span0.textContent = "Hauteur    : ";
    			create_component(inputnumber0.$$.fragment);
    			t3 = text(" mm");
    			t4 = space();
    			label1 = element("label");
    			span1 = element("span");
    			span1.textContent = "Largeur    : ";
    			create_component(inputnumber1.$$.fragment);
    			t6 = text(" mm");
    			t7 = space();
    			label2 = element("label");
    			span2 = element("span");
    			span2.textContent = "Profondeur : ";
    			create_component(inputnumber2.$$.fragment);
    			t9 = text(" mm");
    			t10 = space();
    			label3 = element("label");
    			span3 = element("span");
    			span3.textContent = "Colonnes   : ";
    			input = element("input");
    			t12 = space();
    			table = element("table");
    			tr0 = element("tr");
    			td0 = element("td");
    			t13 = space();

    			for (let i = 0; i < each_blocks_6.length; i += 1) {
    				each_blocks_6[i].c();
    			}

    			t14 = space();
    			tr1 = element("tr");
    			td1 = element("td");
    			td1.textContent = "Largeur intérieure : ";
    			t16 = space();

    			for (let i = 0; i < each_blocks_5.length; i += 1) {
    				each_blocks_5[i].c();
    			}

    			t17 = space();
    			td2 = element("td");
    			td2.textContent = "mm";
    			t19 = space();
    			tr2 = element("tr");
    			td3 = element("td");
    			td3.textContent = "Casiers : ";
    			t21 = space();

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].c();
    			}

    			t22 = space();
    			td4 = element("td");
    			t23 = space();
    			tr3 = element("tr");
    			td5 = element("td");
    			td5.textContent = "Hauteur intérieure : ";
    			t25 = space();

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t26 = space();
    			td6 = element("td");
    			t27 = space();
    			if (if_block) if_block.c();
    			t28 = space();
    			hr0 = element("hr");
    			t29 = space();
    			div4 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t30 = space();
    			div2 = element("div");

    			for (let i = 0; i < 1; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t31 = space();
    			div3 = element("div");

    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

    			t32 = space();
    			hr1 = element("hr");
    			t33 = space();
    			label4 = element("label");
    			span4 = element("span");
    			span4.textContent = "Épaisseur montants : ";
    			create_component(inputnumber3.$$.fragment);
    			t35 = text(" mm");
    			t36 = space();
    			label5 = element("label");
    			span5 = element("span");
    			span5.textContent = "Épaisseur traverses : ";
    			create_component(inputnumber4.$$.fragment);
    			t38 = text(" mm");
    			t39 = space();
    			label6 = element("label");
    			span6 = element("span");
    			span6.textContent = "Largeur montants : ";
    			create_component(inputnumber5.$$.fragment);
    			t41 = text(" mm");
    			t42 = space();
    			label7 = element("label");
    			span7 = element("span");
    			span7.textContent = "Largeur traverses : ";
    			create_component(inputnumber6.$$.fragment);
    			t44 = text(" mm");
    			t45 = space();
    			label8 = element("label");
    			span8 = element("span");
    			span8.textContent = "Profondeur tenons cotés : ";
    			create_component(inputnumber7.$$.fragment);
    			t47 = text(" mm");
    			t48 = space();
    			label9 = element("label");
    			span9 = element("span");
    			span9.textContent = "Profondeur tenons : ";
    			create_component(inputnumber8.$$.fragment);
    			t50 = text(" mm");
    			t51 = space();
    			hr2 = element("hr");
    			t52 = space();
    			label10 = element("label");
    			span10 = element("span");
    			span10.textContent = "Épaisseur panneau : ";
    			create_component(inputnumber9.$$.fragment);
    			t54 = text(" mm");
    			t55 = space();
    			label11 = element("label");
    			span11 = element("span");
    			span11.textContent = "Profondeur rainure : ";
    			create_component(inputnumber10.$$.fragment);
    			t57 = text(" mm");
    			t58 = space();
    			label12 = element("label");
    			span12 = element("span");
    			span12.textContent = "Jeu panneau / rainure : ";
    			create_component(inputnumber11.$$.fragment);
    			t60 = text(" mm");
    			t61 = space();
    			label13 = element("label");
    			span13 = element("span");
    			span13.textContent = "Longueur tenons cloisons :";
    			t63 = space();
    			create_component(inputnumber12.$$.fragment);
    			t64 = text(" mm");
    			add_location(h3, file$h, 1165, 4, 37534);
    			attr_dev(span0, "class", "svelte-2d04f4");
    			add_location(span0, file$h, 1168, 11, 37574);
    			attr_dev(label0, "class", "svelte-2d04f4");
    			add_location(label0, file$h, 1168, 4, 37567);
    			attr_dev(span1, "class", "svelte-2d04f4");
    			add_location(span1, file$h, 1169, 11, 37692);
    			attr_dev(label1, "class", "svelte-2d04f4");
    			add_location(label1, file$h, 1169, 4, 37685);
    			attr_dev(span2, "class", "svelte-2d04f4");
    			add_location(span2, file$h, 1170, 11, 37808);
    			attr_dev(label2, "class", "svelte-2d04f4");
    			add_location(label2, file$h, 1170, 4, 37801);
    			attr_dev(span3, "class", "svelte-2d04f4");
    			add_location(span3, file$h, 1171, 11, 37931);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "1");
    			attr_dev(input, "class", "svelte-2d04f4");
    			add_location(input, file$h, 1171, 37, 37957);
    			attr_dev(label3, "class", "svelte-2d04f4");
    			add_location(label3, file$h, 1171, 4, 37924);
    			attr_dev(td0, "class", "svelte-2d04f4");
    			add_location(td0, file$h, 1175, 8, 38050);
    			add_location(tr0, file$h, 1174, 6, 38037);
    			attr_dev(td1, "class", "svelte-2d04f4");
    			add_location(td1, file$h, 1181, 8, 38185);
    			attr_dev(td2, "class", "svelte-2d04f4");
    			add_location(td2, file$h, 1190, 8, 38476);
    			add_location(tr1, file$h, 1180, 6, 38172);
    			attr_dev(td3, "class", "svelte-2d04f4");
    			add_location(td3, file$h, 1193, 8, 38519);
    			attr_dev(td4, "class", "svelte-2d04f4");
    			add_location(td4, file$h, 1201, 8, 38761);
    			add_location(tr2, file$h, 1192, 6, 38506);
    			attr_dev(td5, "class", "svelte-2d04f4");
    			add_location(td5, file$h, 1204, 8, 38802);
    			attr_dev(td6, "class", "svelte-2d04f4");
    			add_location(td6, file$h, 1218, 8, 39248);
    			add_location(tr3, file$h, 1203, 6, 38789);
    			add_location(table, file$h, 1173, 4, 38023);
    			add_location(hr0, file$h, 1226, 4, 39455);
    			attr_dev(div1, "class", "meuble svelte-2d04f4");
    			toggle_class(div1, "panneau-haut", /*opt*/ ctx[1].panneau_dessus);
    			toggle_class(div1, "panneau-bas", /*opt*/ ctx[1].panneau_dessous);
    			add_location(div1, file$h, 1229, 6, 39499);
    			attr_dev(div2, "class", "svelte-2d04f4");
    			add_location(div2, file$h, 1268, 6, 41616);
    			attr_dev(div3, "class", "svelte-2d04f4");
    			add_location(div3, file$h, 1290, 6, 42592);
    			attr_dev(div4, "class", "prefs-casier svelte-2d04f4");
    			add_location(div4, file$h, 1228, 4, 39466);
    			add_location(hr1, file$h, 1381, 4, 47246);
    			attr_dev(span4, "class", "svelte-2d04f4");
    			add_location(span4, file$h, 1383, 11, 47264);
    			attr_dev(label4, "class", "svelte-2d04f4");
    			add_location(label4, file$h, 1383, 4, 47257);
    			attr_dev(span5, "class", "svelte-2d04f4");
    			add_location(span5, file$h, 1384, 11, 47405);
    			attr_dev(label5, "class", "svelte-2d04f4");
    			add_location(label5, file$h, 1384, 4, 47398);
    			attr_dev(span6, "class", "svelte-2d04f4");
    			add_location(span6, file$h, 1385, 11, 47549);
    			attr_dev(label6, "class", "svelte-2d04f4");
    			add_location(label6, file$h, 1385, 4, 47542);
    			attr_dev(span7, "class", "svelte-2d04f4");
    			add_location(span7, file$h, 1386, 11, 47684);
    			attr_dev(label7, "class", "svelte-2d04f4");
    			add_location(label7, file$h, 1386, 4, 47677);
    			attr_dev(span8, "class", "svelte-2d04f4");
    			add_location(span8, file$h, 1387, 11, 47822);
    			attr_dev(label8, "class", "svelte-2d04f4");
    			add_location(label8, file$h, 1387, 4, 47815);
    			attr_dev(span9, "class", "svelte-2d04f4");
    			add_location(span9, file$h, 1388, 11, 47978);
    			attr_dev(label9, "class", "svelte-2d04f4");
    			add_location(label9, file$h, 1388, 4, 47971);
    			add_location(hr2, file$h, 1390, 4, 48110);
    			attr_dev(span10, "class", "svelte-2d04f4");
    			add_location(span10, file$h, 1392, 11, 48128);
    			attr_dev(label10, "class", "svelte-2d04f4");
    			add_location(label10, file$h, 1392, 4, 48121);
    			attr_dev(span11, "class", "svelte-2d04f4");
    			add_location(span11, file$h, 1393, 11, 48267);
    			attr_dev(label11, "class", "svelte-2d04f4");
    			add_location(label11, file$h, 1393, 4, 48260);
    			attr_dev(span12, "class", "svelte-2d04f4");
    			add_location(span12, file$h, 1394, 11, 48408);
    			attr_dev(label12, "class", "svelte-2d04f4");
    			add_location(label12, file$h, 1394, 4, 48401);
    			attr_dev(span13, "class", "svelte-2d04f4");
    			add_location(span13, file$h, 1395, 11, 48538);
    			attr_dev(label13, "class", "svelte-2d04f4");
    			add_location(label13, file$h, 1395, 4, 48531);
    			attr_dev(form, "class", "svelte-2d04f4");
    			add_location(form, file$h, 1167, 4, 37556);
    			attr_dev(div0, "class", "main");
    			attr_dev(div0, "slot", "dim");
    			add_location(div0, file$h, 1163, 2, 37499);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h3);
    			append_dev(div0, t1);
    			append_dev(div0, form);
    			append_dev(form, label0);
    			append_dev(label0, span0);
    			mount_component(inputnumber0, label0, null);
    			append_dev(label0, t3);
    			append_dev(form, t4);
    			append_dev(form, label1);
    			append_dev(label1, span1);
    			mount_component(inputnumber1, label1, null);
    			append_dev(label1, t6);
    			append_dev(form, t7);
    			append_dev(form, label2);
    			append_dev(label2, span2);
    			mount_component(inputnumber2, label2, null);
    			append_dev(label2, t9);
    			append_dev(form, t10);
    			append_dev(form, label3);
    			append_dev(label3, span3);
    			append_dev(label3, input);
    			set_input_value(input, /*num_colonnes*/ ctx[3]);
    			append_dev(form, t12);
    			append_dev(form, table);
    			append_dev(table, tr0);
    			append_dev(tr0, td0);
    			append_dev(tr0, t13);

    			for (let i = 0; i < each_blocks_6.length; i += 1) {
    				each_blocks_6[i].m(tr0, null);
    			}

    			append_dev(table, t14);
    			append_dev(table, tr1);
    			append_dev(tr1, td1);
    			append_dev(tr1, t16);

    			for (let i = 0; i < each_blocks_5.length; i += 1) {
    				each_blocks_5[i].m(tr1, null);
    			}

    			append_dev(tr1, t17);
    			append_dev(tr1, td2);
    			append_dev(table, t19);
    			append_dev(table, tr2);
    			append_dev(tr2, td3);
    			append_dev(tr2, t21);

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].m(tr2, null);
    			}

    			append_dev(tr2, t22);
    			append_dev(tr2, td4);
    			append_dev(table, t23);
    			append_dev(table, tr3);
    			append_dev(tr3, td5);
    			append_dev(tr3, t25);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(tr3, null);
    			}

    			append_dev(tr3, t26);
    			append_dev(tr3, td6);
    			append_dev(form, t27);
    			if (if_block) if_block.m(form, null);
    			append_dev(form, t28);
    			append_dev(form, hr0);
    			append_dev(form, t29);
    			append_dev(form, div4);
    			append_dev(div4, div1);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div1, null);
    			}

    			append_dev(div4, t30);
    			append_dev(div4, div2);

    			for (let i = 0; i < 1; i += 1) {
    				each_blocks_1[i].m(div2, null);
    			}

    			append_dev(div4, t31);
    			append_dev(div4, div3);

    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			append_dev(form, t32);
    			append_dev(form, hr1);
    			append_dev(form, t33);
    			append_dev(form, label4);
    			append_dev(label4, span4);
    			mount_component(inputnumber3, label4, null);
    			append_dev(label4, t35);
    			append_dev(form, t36);
    			append_dev(form, label5);
    			append_dev(label5, span5);
    			mount_component(inputnumber4, label5, null);
    			append_dev(label5, t38);
    			append_dev(form, t39);
    			append_dev(form, label6);
    			append_dev(label6, span6);
    			mount_component(inputnumber5, label6, null);
    			append_dev(label6, t41);
    			append_dev(form, t42);
    			append_dev(form, label7);
    			append_dev(label7, span7);
    			mount_component(inputnumber6, label7, null);
    			append_dev(label7, t44);
    			append_dev(form, t45);
    			append_dev(form, label8);
    			append_dev(label8, span8);
    			mount_component(inputnumber7, label8, null);
    			append_dev(label8, t47);
    			append_dev(form, t48);
    			append_dev(form, label9);
    			append_dev(label9, span9);
    			mount_component(inputnumber8, label9, null);
    			append_dev(label9, t50);
    			append_dev(form, t51);
    			append_dev(form, hr2);
    			append_dev(form, t52);
    			append_dev(form, label10);
    			append_dev(label10, span10);
    			mount_component(inputnumber9, label10, null);
    			append_dev(label10, t54);
    			append_dev(form, t55);
    			append_dev(form, label11);
    			append_dev(label11, span11);
    			mount_component(inputnumber10, label11, null);
    			append_dev(label11, t57);
    			append_dev(form, t58);
    			append_dev(form, label12);
    			append_dev(label12, span12);
    			mount_component(inputnumber11, label12, null);
    			append_dev(label12, t60);
    			append_dev(form, t61);
    			append_dev(form, label13);
    			append_dev(label13, span13);
    			append_dev(label13, t63);
    			mount_component(inputnumber12, label13, null);
    			append_dev(label13, t64);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[57]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const inputnumber0_changes = {};

    			if (!updating_value && dirty[0] & /*ui*/ 4) {
    				updating_value = true;
    				inputnumber0_changes.value = /*ui*/ ctx[2].hauteur;
    				add_flush_callback(() => updating_value = false);
    			}

    			inputnumber0.$set(inputnumber0_changes);
    			const inputnumber1_changes = {};

    			if (!updating_value_1 && dirty[0] & /*ui*/ 4) {
    				updating_value_1 = true;
    				inputnumber1_changes.value = /*ui*/ ctx[2].largeur;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			inputnumber1.$set(inputnumber1_changes);
    			const inputnumber2_changes = {};

    			if (!updating_value_2 && dirty[0] & /*ui*/ 4) {
    				updating_value_2 = true;
    				inputnumber2_changes.value = /*ui*/ ctx[2].profondeur;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			inputnumber2.$set(inputnumber2_changes);

    			if (dirty[0] & /*num_colonnes*/ 8 && to_number(input.value) !== /*num_colonnes*/ ctx[3]) {
    				set_input_value(input, /*num_colonnes*/ ctx[3]);
    			}

    			if (dirty[0] & /*opt*/ 2) {
    				each_value_10 = /*opt*/ ctx[1].colonnes;
    				validate_each_argument(each_value_10);
    				let i;

    				for (i = 0; i < each_value_10.length; i += 1) {
    					const child_ctx = get_each_context_10(ctx, each_value_10, i);

    					if (each_blocks_6[i]) {
    						each_blocks_6[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_6[i] = create_each_block_10(child_ctx);
    						each_blocks_6[i].c();
    						each_blocks_6[i].m(tr0, null);
    					}
    				}

    				for (; i < each_blocks_6.length; i += 1) {
    					each_blocks_6[i].d(1);
    				}

    				each_blocks_6.length = each_value_10.length;
    			}

    			if (dirty[0] & /*opt, largeur_colonnes*/ 18) {
    				each_value_9 = /*opt*/ ctx[1].colonnes;
    				validate_each_argument(each_value_9);
    				let i;

    				for (i = 0; i < each_value_9.length; i += 1) {
    					const child_ctx = get_each_context_9(ctx, each_value_9, i);

    					if (each_blocks_5[i]) {
    						each_blocks_5[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_5[i] = create_each_block_9(child_ctx);
    						each_blocks_5[i].c();
    						each_blocks_5[i].m(tr1, t17);
    					}
    				}

    				for (; i < each_blocks_5.length; i += 1) {
    					each_blocks_5[i].d(1);
    				}

    				each_blocks_5.length = each_value_9.length;
    			}

    			if (dirty[0] & /*num_casiers_colonnes, opt*/ 34) {
    				each_value_8 = /*opt*/ ctx[1].colonnes;
    				validate_each_argument(each_value_8);
    				let i;

    				for (i = 0; i < each_value_8.length; i += 1) {
    					const child_ctx = get_each_context_8(ctx, each_value_8, i);

    					if (each_blocks_4[i]) {
    						each_blocks_4[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_4[i] = create_each_block_8(child_ctx);
    						each_blocks_4[i].c();
    						each_blocks_4[i].m(tr2, t22);
    					}
    				}

    				for (; i < each_blocks_4.length; i += 1) {
    					each_blocks_4[i].d(1);
    				}

    				each_blocks_4.length = each_value_8.length;
    			}

    			if (dirty[0] & /*opt, hauteur_casiers_colonnes*/ 66) {
    				each_value_6 = /*opt*/ ctx[1].colonnes;
    				validate_each_argument(each_value_6);
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6(ctx, each_value_6, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_3[i] = create_each_block_6(child_ctx);
    						each_blocks_3[i].c();
    						each_blocks_3[i].m(tr3, t26);
    					}
    				}

    				for (; i < each_blocks_3.length; i += 1) {
    					each_blocks_3[i].d(1);
    				}

    				each_blocks_3.length = each_value_6.length;
    			}

    			if (dirty[0] & /*largeur_colonnes*/ 16) show_if = /*largeur_colonnes*/ ctx[4].filter(func).length == /*largeur_colonnes*/ ctx[4].length;

    			if (show_if) {
    				if (if_block) ; else {
    					if_block = create_if_block_4$1(ctx);
    					if_block.c();
    					if_block.m(form, t28);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*opt, ui_colonnes, selection_casier_input*/ 642) {
    				each_value_4 = /*opt*/ ctx[1].colonnes;
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4$1(ctx, each_value_4, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_4$1(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_4.length;
    			}

    			if (dirty[0] & /*opt*/ 2) {
    				toggle_class(div1, "panneau-haut", /*opt*/ ctx[1].panneau_dessus);
    			}

    			if (dirty[0] & /*opt*/ 2) {
    				toggle_class(div1, "panneau-bas", /*opt*/ ctx[1].panneau_dessous);
    			}

    			if (dirty[0] & /*opt, selection_casier_i, ui_colonnes, selection_casier*/ 540802) {
    				each_value_3 = [/*selection_casier*/ ctx[19]];
    				validate_each_argument(each_value_3);
    				group_outros();
    				validate_each_keys(ctx, each_value_3, get_each_context_3$1, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_3, each5_lookup, div2, outro_and_destroy_block, create_each_block_3$1, null, get_each_context_3$1);
    				check_outros();
    			}

    			if (dirty[0] & /*opt, selection_casier_i, ui_montants, selection_casier_j, ui_colonnes, ui, selection_casier*/ 573830) {
    				each_value = [/*selection_casier*/ ctx[19]];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$c, get_key_1);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each6_lookup, div3, outro_and_destroy_block, create_each_block$c, null, get_each_context$c);
    				check_outros();
    			}

    			const inputnumber3_changes = {};
    			if (dirty[0] & /*opt*/ 2) inputnumber3_changes.def = /*opt*/ ctx[1].epaisseur_montants;

    			if (!updating_value_3 && dirty[0] & /*ui*/ 4) {
    				updating_value_3 = true;
    				inputnumber3_changes.value = /*ui*/ ctx[2].epaisseur_montants;
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			inputnumber3.$set(inputnumber3_changes);
    			const inputnumber4_changes = {};
    			if (dirty[0] & /*opt*/ 2) inputnumber4_changes.def = /*opt*/ ctx[1].epaisseur_traverses;

    			if (!updating_value_4 && dirty[0] & /*ui*/ 4) {
    				updating_value_4 = true;
    				inputnumber4_changes.value = /*ui*/ ctx[2].epaisseur_traverses;
    				add_flush_callback(() => updating_value_4 = false);
    			}

    			inputnumber4.$set(inputnumber4_changes);
    			const inputnumber5_changes = {};
    			if (dirty[0] & /*opt*/ 2) inputnumber5_changes.def = /*opt*/ ctx[1].largeur_montants;

    			if (!updating_value_5 && dirty[0] & /*ui*/ 4) {
    				updating_value_5 = true;
    				inputnumber5_changes.value = /*ui*/ ctx[2].largeur_montants;
    				add_flush_callback(() => updating_value_5 = false);
    			}

    			inputnumber5.$set(inputnumber5_changes);
    			const inputnumber6_changes = {};
    			if (dirty[0] & /*opt*/ 2) inputnumber6_changes.def = /*opt*/ ctx[1].largeur_traverses;

    			if (!updating_value_6 && dirty[0] & /*ui*/ 4) {
    				updating_value_6 = true;
    				inputnumber6_changes.value = /*ui*/ ctx[2].largeur_traverses;
    				add_flush_callback(() => updating_value_6 = false);
    			}

    			inputnumber6.$set(inputnumber6_changes);
    			const inputnumber7_changes = {};
    			if (dirty[0] & /*opt*/ 2) inputnumber7_changes.def = /*opt*/ ctx[1].profondeur_tenons_cotes;

    			if (!updating_value_7 && dirty[0] & /*ui*/ 4) {
    				updating_value_7 = true;
    				inputnumber7_changes.value = /*ui*/ ctx[2].profondeur_tenons_cotes;
    				add_flush_callback(() => updating_value_7 = false);
    			}

    			inputnumber7.$set(inputnumber7_changes);
    			const inputnumber8_changes = {};
    			if (dirty[0] & /*opt*/ 2) inputnumber8_changes.def = /*opt*/ ctx[1].profondeur_tenons;

    			if (!updating_value_8 && dirty[0] & /*ui*/ 4) {
    				updating_value_8 = true;
    				inputnumber8_changes.value = /*ui*/ ctx[2].profondeur_tenons;
    				add_flush_callback(() => updating_value_8 = false);
    			}

    			inputnumber8.$set(inputnumber8_changes);
    			const inputnumber9_changes = {};
    			if (dirty[0] & /*opt*/ 2) inputnumber9_changes.def = /*opt*/ ctx[1].epaisseur_panneau;

    			if (!updating_value_9 && dirty[0] & /*ui*/ 4) {
    				updating_value_9 = true;
    				inputnumber9_changes.value = /*ui*/ ctx[2].epaisseur_panneau;
    				add_flush_callback(() => updating_value_9 = false);
    			}

    			inputnumber9.$set(inputnumber9_changes);
    			const inputnumber10_changes = {};
    			if (dirty[0] & /*opt*/ 2) inputnumber10_changes.def = /*opt*/ ctx[1].profondeur_rainure;

    			if (!updating_value_10 && dirty[0] & /*ui*/ 4) {
    				updating_value_10 = true;
    				inputnumber10_changes.value = /*ui*/ ctx[2].profondeur_rainure;
    				add_flush_callback(() => updating_value_10 = false);
    			}

    			inputnumber10.$set(inputnumber10_changes);
    			const inputnumber11_changes = {};
    			if (dirty[0] & /*opt*/ 2) inputnumber11_changes.def = /*opt*/ ctx[1].jeu_rainure;

    			if (!updating_value_11 && dirty[0] & /*ui*/ 4) {
    				updating_value_11 = true;
    				inputnumber11_changes.value = /*ui*/ ctx[2].jeu_rainure;
    				add_flush_callback(() => updating_value_11 = false);
    			}

    			inputnumber11.$set(inputnumber11_changes);
    			const inputnumber12_changes = {};
    			if (dirty[0] & /*opt*/ 2) inputnumber12_changes.def = /*opt*/ ctx[1].montants_inter_longueur_tenon;

    			if (!updating_value_12 && dirty[0] & /*ui*/ 4) {
    				updating_value_12 = true;
    				inputnumber12_changes.value = /*ui*/ ctx[2].montants_inter_longueur_tenon;
    				add_flush_callback(() => updating_value_12 = false);
    			}

    			inputnumber12.$set(inputnumber12_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputnumber0.$$.fragment, local);
    			transition_in(inputnumber1.$$.fragment, local);
    			transition_in(inputnumber2.$$.fragment, local);

    			for (let i = 0; i < 1; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < 1; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(inputnumber3.$$.fragment, local);
    			transition_in(inputnumber4.$$.fragment, local);
    			transition_in(inputnumber5.$$.fragment, local);
    			transition_in(inputnumber6.$$.fragment, local);
    			transition_in(inputnumber7.$$.fragment, local);
    			transition_in(inputnumber8.$$.fragment, local);
    			transition_in(inputnumber9.$$.fragment, local);
    			transition_in(inputnumber10.$$.fragment, local);
    			transition_in(inputnumber11.$$.fragment, local);
    			transition_in(inputnumber12.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputnumber0.$$.fragment, local);
    			transition_out(inputnumber1.$$.fragment, local);
    			transition_out(inputnumber2.$$.fragment, local);

    			for (let i = 0; i < 1; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			for (let i = 0; i < 1; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(inputnumber3.$$.fragment, local);
    			transition_out(inputnumber4.$$.fragment, local);
    			transition_out(inputnumber5.$$.fragment, local);
    			transition_out(inputnumber6.$$.fragment, local);
    			transition_out(inputnumber7.$$.fragment, local);
    			transition_out(inputnumber8.$$.fragment, local);
    			transition_out(inputnumber9.$$.fragment, local);
    			transition_out(inputnumber10.$$.fragment, local);
    			transition_out(inputnumber11.$$.fragment, local);
    			transition_out(inputnumber12.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(inputnumber0);
    			destroy_component(inputnumber1);
    			destroy_component(inputnumber2);
    			destroy_each(each_blocks_6, detaching);
    			destroy_each(each_blocks_5, detaching);
    			destroy_each(each_blocks_4, detaching);
    			destroy_each(each_blocks_3, detaching);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks_2, detaching);

    			for (let i = 0; i < 1; i += 1) {
    				each_blocks_1[i].d();
    			}

    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].d();
    			}

    			destroy_component(inputnumber3);
    			destroy_component(inputnumber4);
    			destroy_component(inputnumber5);
    			destroy_component(inputnumber6);
    			destroy_component(inputnumber7);
    			destroy_component(inputnumber8);
    			destroy_component(inputnumber9);
    			destroy_component(inputnumber10);
    			destroy_component(inputnumber11);
    			destroy_component(inputnumber12);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_dim_slot$1.name,
    		type: "slot",
    		source: "(1164:2) <div class=\\\"main\\\" slot=\\\"dim\\\">",
    		ctx
    	});

    	return block;
    }

    // (1401:2) <div slot="children">
    function create_children_slot$1(ctx) {
    	let div;
    	let childrenpositions;
    	let updating_childrenPos;
    	let updating_pieces;
    	let current;

    	function childrenpositions_childrenPos_binding(value) {
    		/*childrenpositions_childrenPos_binding*/ ctx[91].call(null, value);
    	}

    	function childrenpositions_pieces_binding(value) {
    		/*childrenpositions_pieces_binding*/ ctx[92].call(null, value);
    	}

    	let childrenpositions_props = {
    		children: /*children*/ ctx[11],
    		childrenState: /*childrenState*/ ctx[18],
    		defaultChildrenPos: /*children*/ ctx[11].map(func_9)
    	};

    	if (/*childrenPos*/ ctx[10] !== void 0) {
    		childrenpositions_props.childrenPos = /*childrenPos*/ ctx[10];
    	}

    	if (/*child_pieces*/ ctx[13] !== void 0) {
    		childrenpositions_props.pieces = /*child_pieces*/ ctx[13];
    	}

    	childrenpositions = new ChildrenPositions({
    			props: childrenpositions_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(childrenpositions, "childrenPos", childrenpositions_childrenPos_binding));
    	binding_callbacks.push(() => bind(childrenpositions, "pieces", childrenpositions_pieces_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(childrenpositions.$$.fragment);
    			attr_dev(div, "slot", "children");
    			add_location(div, file$h, 1400, 2, 48722);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(childrenpositions, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const childrenpositions_changes = {};
    			if (dirty[0] & /*children*/ 2048) childrenpositions_changes.children = /*children*/ ctx[11];
    			if (dirty[0] & /*childrenState*/ 262144) childrenpositions_changes.childrenState = /*childrenState*/ ctx[18];
    			if (dirty[0] & /*children*/ 2048) childrenpositions_changes.defaultChildrenPos = /*children*/ ctx[11].map(func_9);

    			if (!updating_childrenPos && dirty[0] & /*childrenPos*/ 1024) {
    				updating_childrenPos = true;
    				childrenpositions_changes.childrenPos = /*childrenPos*/ ctx[10];
    				add_flush_callback(() => updating_childrenPos = false);
    			}

    			if (!updating_pieces && dirty[0] & /*child_pieces*/ 8192) {
    				updating_pieces = true;
    				childrenpositions_changes.pieces = /*child_pieces*/ ctx[13];
    				add_flush_callback(() => updating_pieces = false);
    			}

    			childrenpositions.$set(childrenpositions_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(childrenpositions.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(childrenpositions.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(childrenpositions);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_children_slot$1.name,
    		type: "slot",
    		source: "(1401:2) <div slot=\\\"children\\\">",
    		ctx
    	});

    	return block;
    }

    // (1410:2) <div slot="tables">
    function create_tables_slot$2(ctx) {
    	let div;
    	let listedebit;
    	let current;

    	listedebit = new ListeDebit({
    			props: {
    				pieces: new Group(/*all_pieces*/ ctx[12], `Caisson ${/*data*/ ctx[16].name}`, "Caisson")
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(listedebit.$$.fragment);
    			attr_dev(div, "slot", "tables");
    			add_location(div, file$h, 1409, 2, 48978);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(listedebit, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listedebit_changes = {};
    			if (dirty[0] & /*all_pieces, data*/ 69632) listedebit_changes.pieces = new Group(/*all_pieces*/ ctx[12], `Caisson ${/*data*/ ctx[16].name}`, "Caisson");
    			listedebit.$set(listedebit_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listedebit.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listedebit.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(listedebit);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_tables_slot$2.name,
    		type: "slot",
    		source: "(1410:2) <div slot=\\\"tables\\\">",
    		ctx
    	});

    	return block;
    }

    // (1159:0) <Component bind:data={data} path={path} state={state} bind:childrenState={childrenState} bind:children={children} on:datachange>
    function create_default_slot$2(ctx) {
    	let t0;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    			t2 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(1159:0) <Component bind:data={data} path={path} state={state} bind:childrenState={childrenState} bind:children={children} on:datachange>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let component;
    	let updating_data;
    	let updating_childrenState;
    	let updating_children;
    	let current;

    	function component_data_binding(value) {
    		/*component_data_binding*/ ctx[93].call(null, value);
    	}

    	function component_childrenState_binding(value) {
    		/*component_childrenState_binding*/ ctx[94].call(null, value);
    	}

    	function component_children_binding(value) {
    		/*component_children_binding*/ ctx[95].call(null, value);
    	}

    	let component_props = {
    		path: /*path*/ ctx[0],
    		state: /*state*/ ctx[17],
    		$$slots: {
    			default: [create_default_slot$2],
    			tables: [create_tables_slot$2],
    			children: [create_children_slot$1],
    			dim: [create_dim_slot$1],
    			plan: [create_plan_slot$2]
    		},
    		$$scope: { ctx }
    	};

    	if (/*data*/ ctx[16] !== void 0) {
    		component_props.data = /*data*/ ctx[16];
    	}

    	if (/*childrenState*/ ctx[18] !== void 0) {
    		component_props.childrenState = /*childrenState*/ ctx[18];
    	}

    	if (/*children*/ ctx[11] !== void 0) {
    		component_props.children = /*children*/ ctx[11];
    	}

    	component = new Component({ props: component_props, $$inline: true });
    	binding_callbacks.push(() => bind(component, "data", component_data_binding));
    	binding_callbacks.push(() => bind(component, "childrenState", component_childrenState_binding));
    	binding_callbacks.push(() => bind(component, "children", component_children_binding));
    	component.$on("datachange", /*datachange_handler*/ ctx[96]);

    	const block = {
    		c: function create() {
    			create_component(component.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(component, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const component_changes = {};
    			if (dirty[0] & /*path*/ 1) component_changes.path = /*path*/ ctx[0];
    			if (dirty[0] & /*state*/ 131072) component_changes.state = /*state*/ ctx[17];

    			if (dirty[0] & /*all_pieces, data, children, childrenState, childrenPos, child_pieces, opt, ui, selection_casier, selection_casier_i, ui_montants, selection_casier_j, ui_colonnes, selection_casier_input, largeur_colonnes, hauteur_casiers_colonnes, num_casiers_colonnes, num_colonnes*/ 917502 | dirty[4] & /*$$scope*/ 8) {
    				component_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_data && dirty[0] & /*data*/ 65536) {
    				updating_data = true;
    				component_changes.data = /*data*/ ctx[16];
    				add_flush_callback(() => updating_data = false);
    			}

    			if (!updating_childrenState && dirty[0] & /*childrenState*/ 262144) {
    				updating_childrenState = true;
    				component_changes.childrenState = /*childrenState*/ ctx[18];
    				add_flush_callback(() => updating_childrenState = false);
    			}

    			if (!updating_children && dirty[0] & /*children*/ 2048) {
    				updating_children = true;
    				component_changes.children = /*children*/ ctx[11];
    				add_flush_callback(() => updating_children = false);
    			}

    			component.$set(component_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(component.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(component.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(component, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func = x => x && x != 0;
    const func_2 = (b, p) => b && p;
    const func_4 = (b, p) => b && p;
    const func_6 = (b, p) => b || p;
    const func_8 = (b, p) => b || p;
    const func_9 = c => c.defaultPosition;

    function instance$h($$self, $$props, $$invalidate) {
    	let selection_casier_i;
    	let selection_casier_j;
    	let selection_casier;
    	let montants_template;
    	let montant_ar_g;
    	let montant_av_g;
    	let montant_ar_d;
    	let montant_av_d;
    	let traverses_cote;
    	let traverse_cote_h_g;
    	let traverse_cote_b_g;
    	let traverse_cote_h_d;
    	let traverse_cote_b_d;
    	let traverses;
    	let traverse_ar_h;
    	let traverse_ar_b;
    	let traverse_av_h;
    	let traverse_av_b;
    	let panneaux_haut_bas;
    	let panneau_h;
    	let panneau_b;
    	let panneaux_dos;
    	let montants_cloisons;
    	let montants_cloisons_av;
    	let montants_cloisons_ar;
    	let traverses_cote_inter_caissons;
    	let panneaux_cote_et_cloisons;
    	let traverses_cloisons;
    	let traverses_cloisons_h;
    	let traverses_cloisons_b;
    	let traverses_inter2_av_ar;
    	let traverses_inter2_av;
    	let traverses_inter2_ar;
    	let panneau_inter2_dessous;
    	let pieces;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Caisson", slots, []);
    	let { path } = $$props;
    	let { initdata = {} } = $$props;
    	let data = { ...initdata };

    	//
    	// Defaults
    	//
    	let defaults = {
    		type: "contre-profil",
    		largeur: 400,
    		hauteur: 600,
    		profondeur: 300,
    		epaisseur_montants: 24,
    		epaisseur_traverses: 24,
    		largeur_montants: 50,
    		largeur_traverses: 50,
    		profondeur_tenons_cotes: 30,
    		profondeur_tenons: 20,
    		profondeur_rainure: 10,
    		jeu_rainure: 1,
    		epaisseur_panneau: 16,
    		panneau_dessus: true,
    		panneau_dessous: true,
    		montants_inter_longueur_tenon: 20,
    		montants: [{}, {}],
    		colonnes: [
    			{
    				porte: {},
    				casiers: [
    					{
    						tiroir: false,
    						panneau_dessous: true,
    						panneau_dos: true
    					}
    				]
    			}
    		],
    		...initdata.defaults
    	};

    	//
    	// Internal state (recomputed)
    	//
    	let state = {};

    	let childrenState = [];

    	//
    	// Option (internal state, saved)
    	//
    	let opt = { ...defaults, ...initdata.opt };

    	// Migrate
    	if (opt.profondeur_tenons_intermediaire) {
    		opt.profondeur_tenons_cotes = opt.profondeur_tenons;
    		opt.profondeur_tenons = opt.profondeur_tenons_intermediaire;
    		delete opt.profondeur_tenons_intermediaire;
    	}

    	if (opt.hauteur_traverses) {
    		opt.largeur_traverses = opt.hauteur_traverse;
    		delete opt.hauteur_traverses;
    	}

    	//
    	// UI (visible state)
    	//
    	let ui = { ...initdata.ui || initdata.opt };

    	let num_colonnes = Math.max(opt.colonnes.length, 1);
    	let largeur_colonnes = opt.colonnes.map(c => c.largeur_definie ? c.largeur : null);
    	let num_casiers_colonnes = opt.colonnes.map(c => (c.casiers || [{}]).length);
    	let hauteur_casiers_colonnes = opt.colonnes.map(c => (c.casiers || []).map(cas => cas.hauteur_definie ? cas.hauteur : null));
    	let ui_colonnes = opt.colonnes;
    	let ui_montants = opt.montants;
    	let selection_casier_input = "0,0";

    	//
    	// Update children then data from opt
    	//
    	let childrenPos = {};

    	let children = data.children;

    	//
    	// Fonctions de calcul
    	//
    	function updateSubdivisions(num_colonnes, opt) {
    		let opt2 = { ...opt };
    		opt2.colonnes = opt.colonnes.slice(0, num_colonnes);
    		opt2.montants = pipeline(opt.montants.slice(0, opt.montants.length - 1), m => Array(num_colonnes).fill(1).map((_, i) => m[i]), m => m.concat([opt.montants[opt.montants.length - 1]]));

    		for (let i = 0; i <= num_colonnes; i++) {
    			opt2.montants[i] = { ...opt2.montants[i] };
    			if (i >= num_colonnes) break;

    			opt2.colonnes[i] = {
    				largeur: null,
    				num_casiers: 1,
    				casiers: [
    					{
    						tiroir: false,
    						panneau_dessous: true,
    						panneau_dos: true
    					}
    				],
    				porte: {},
    				...opt2.colonnes[i]
    			};
    		}

    		return opt2;
    	}

    	function calculLargeurColonnes(largeurs, opt) {
    		let cols = opt.colonnes.length;
    		let espace_a_repartir = opt.largeur - (cols + 1) * opt.epaisseur_montants;
    		let largeurs_definies = largeurs.filter(x => x && x != 0);
    		let cols_a_calculer = largeurs.length - largeurs_definies.length;
    		let espace_reparti = largeurs_definies.reduce((a, b) => a + b, 0);
    		let espace_restant = espace_a_repartir - espace_reparti;
    		let espace_par_col = Math.floor(espace_restant / cols_a_calculer);
    		let colonnes = [...opt.colonnes];

    		for (let i = 0; i < cols; i++) {
    			if (largeurs[i] && largeurs[i] != 0) {
    				colonnes[i].largeur_definie = true;
    				colonnes[i].largeur = largeurs[i];
    			} else if (cols_a_calculer == 1) {
    				colonnes[i].largeur_definie = false;
    				colonnes[i].largeur = espace_restant;
    				cols_a_calculer = 0;
    				espace_restant = 0;
    			} else {
    				colonnes[i].largeur_definie = false;
    				colonnes[i].largeur = espace_par_col;
    				espace_restant -= espace_par_col;
    				cols_a_calculer -= 1;
    			}
    		}

    		return { ...opt, colonnes };
    	}

    	function calculColonnesCasiers(num_casiers_colonnes, hauteur_casiers_colonnes, ui_colonnes, opt) {
    		let cols = opt.colonnes.length;
    		let colonnes = [];

    		for (let i = 0; i < cols; i++) {
    			let num = num_casiers_colonnes[i];
    			let ui_colonne = ui_colonnes[i];
    			let xpos = opt.epaisseur_montants * (i + 1) + opt.colonnes.slice(0, i).reduce((n, c) => n + c.largeur, 0);

    			colonnes[i] = pipeline(
    				opt.colonnes[i] || {},
    				col => ({
    					...col,
    					xpos,
    					porte: { ...col.porte, ...ui_colonne.porte }
    				}),
    				col => {
    					col.casiers = (col.casiers || []).slice(0, num);
    					return col;
    				},
    				col => calculCasiers(i, col, hauteur_casiers_colonnes[i], num, ui_colonne),
    				col => ({
    					...col,
    					casiers: calculPositionCasiers(col.casiers, xpos)
    				})
    			);
    		}

    		return { ...opt, colonnes };
    	}

    	function calculCasiers(i, colonne, hauteurs, num, ui_colonne) {
    		let espace_a_repartir = opt.hauteur - (num + 1) * opt.epaisseur_traverses;
    		let hauteurs_definies = hauteurs.filter(x => x && x != 0);
    		let casiers_a_calculer = num - hauteurs_definies.length;
    		let espace_reparti = hauteurs_definies.reduce((a, b) => a + b, 0);
    		let espace_restant = espace_a_repartir - espace_reparti;
    		let espace_par_casier = Math.floor(espace_restant / casiers_a_calculer);

    		for (let j = 0; j < num; j++) {
    			let ui_casier = ui_colonne.casiers[j];

    			//console.log(`fusion casier ${i+1},${j+1}`, colonne.casiers[j], ui_casier)
    			let casier = {
    				hauteur: null,
    				panneau_dessous: true,
    				panneau_dos: true,
    				tiroir: false,
    				num_etageres: 0,
    				...colonne.casiers[j],
    				...cleanObject(ui_casier),
    				porte: {
    					double: false,
    					facade: false,
    					type: "",
    					...(colonne.casiers[j] || {}).porte,
    					...cleanObject(ui_casier.porte || {})
    				}
    			};

    			//console.log(`fusion casier ${i+1},${j+1} = `, casier)
    			if (hauteurs[j] && hauteurs[j] != 0) {
    				casier.hauteur_definie = true;
    				casier.hauteur = hauteurs[j];
    			} else if (casiers_a_calculer == 1) {
    				casier.hauteur_definie = false;
    				casier.hauteur = espace_restant;
    				casiers_a_calculer = 0;
    				espace_restant = 0;
    			} else {
    				casier.hauteur_definie = false;
    				casier.hauteur = espace_par_casier;
    				espace_restant -= espace_par_casier;
    				casiers_a_calculer -= 1;
    			}

    			colonne.casiers[j] = casier;
    		}

    		return colonne;
    	}

    	function calculPositionCasiers(casiers, xpos) {
    		for (let j = 0; j < casiers.length; j++) {
    			const jj = casiers.length - j - 1;
    			casiers[j].xpos = xpos;
    			casiers[j].ypos = opt.epaisseur_traverses * (jj + 1) + casiers.slice(j + 1).reduce((n, c) => n + c.hauteur, 0);
    		}

    		return casiers;
    	}

    	function calculSubdivisionMontants(opt, ui_montants) {
    		let subdivisions_montants = Array.from(Array(opt.colonnes.length + 1).keys()).map(i => {
    			let ui_montant_panneaux_actifs = (ui_montants[i] || {}).panneaux_actifs || [];

    			let ui_montant = {
    				...ui_montants[i],
    				panneaux_actifs: [...(ui_montants[i] || {}).panneaux_actifs || []]
    			};

    			let casiers_g = (opt.colonnes[i - 1] || {}).casiers || [];
    			let casiers_d = (opt.colonnes[i] || {}).casiers || [];

    			let hauteurs_g = casiers_g.slice(0, -1).map((casier, j) => ({
    				gauche: [j, j + 1],
    				[0]: casier.ypos - (casier.tiroir ? 0 : opt.epaisseur_traverses),
    				"h": casier.tiroir
    				? opt.largeur_traverses
    				: opt.epaisseur_traverses
    			}));

    			let hauteurs_d = casiers_d.slice(0, -1).map((casier, j) => ({
    				droite: [j, j + 1],
    				[0]: casier.ypos - (casier.tiroir ? 0 : opt.epaisseur_traverses),
    				"h": casier.tiroir
    				? opt.largeur_traverses
    				: opt.epaisseur_traverses
    			}));

    			let hauteurs = hauteurs_g.concat(hauteurs_d).sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0).map(h => ({ ...h, [1]: h[0] + h.h }));

    			//console.log(`opt.montants[${i}] opt.colonnes[${i-1}] =`, opt.colonnes[i-1])
    			//console.log(`opt.montants[${i}] opt.colonnes[${i}] =`, opt.colonnes[i])
    			//console.log(`opt.montants[${i}] hauteurs_g =`, hauteurs_g)
    			//console.log(`opt.montants[${i}] hauteurs_g =`, hauteurs_g.map(h => h[0]))
    			//console.log(`opt.montants[${i}] hauteurs_d =`, hauteurs_d)
    			//console.log(`opt.montants[${i}] hauteurs_d =`, hauteurs_d.map(h => h[0]))
    			//console.log(`opt.montants[${i}] hauteurs =`, hauteurs)
    			let traverses = hauteurs.reduce(
    				(hh, h1) => {
    					if (hh.length == 0) return [{ gauche: [0, 0], droite: [0, 0], ...h1 }];
    					let h0 = hh[hh.length - 1];

    					if (h1[1] - h0[0] <= opt.largeur_traverses) {
    						hh[hh.length - 1] = { ...h0, ...h1, [1]: h1[1] };
    						return hh;
    					}

    					return hh.concat([
    						{
    							gauche: [h0.gauche[1], h0.gauche[1]],
    							droite: [h0.droite[1], h0.droite[1]],
    							...h1
    						}
    					]);
    				},
    				[]
    			).map(h => ({
    				...h,
    				y1: h[0] + (h[1] - h[0]) / 2 - opt.largeur_traverses / 2,
    				y2: h[0] + (h[1] - h[0]) / 2 + opt.largeur_traverses / 2
    			}));

    			//console.log(`opt.montants[${i}].traverses =`, traverses)
    			let ui_panneaux_actifs = Array.from(Array(traverses.length + 1).keys()).map(j => typeof ui_montant.panneaux_actifs[j] == "boolean"
    			? ui_montant.panneaux_actifs[j]
    			: null).reduce(
    				(arr, x) => arr.concat([
    					typeof x == "boolean"
    					? x
    					: arr.length == 0 ? true : arr[arr.length - 1]
    				]),
    				[]
    			);

    			let panneaux = Array.from(Array(traverses.length + 1).keys()).map(j => {
    				let first = j == 0;
    				let last = j >= traverses.length;
    				let cote = i == 0 || i == opt.colonnes.length;

    				return {
    					first,
    					last,
    					cote,
    					y1: first
    					? opt.largeur_traverses + (cote ? 0 : opt.epaisseur_traverses)
    					: traverses[j - 1].y2,
    					y2: last
    					? opt.hauteur - opt.largeur_traverses - (cote ? 0 : opt.epaisseur_traverses)
    					: traverses[j].y1,
    					gauche: first ? 0 : traverses[j - 1].gauche[1],
    					droite: first ? 0 : traverses[j - 1].droite[1],
    					actif: ui_panneaux_actifs[j]
    				};
    			});

    			return { traverses, panneaux };
    		});

    		return {
    			...opt,
    			montants: opt.montants.map((m, i) => ({ ...m, ...subdivisions_montants[i] }))
    		};
    	}

    	function calculEnfants(opt, children) {
    		//console.log(`Caisson(${path}) Recalcul des enfants %o`, opt)
    		children = [...children || []];

    		// Migrate old portes
    		for (let i = 0; i < children.length; i++) {
    			if (!children[i].source) children[i].source = ["Porte", "colonne", i];
    		}

    		// Create new, remove old
    		for (let i = 0; i < opt.colonnes.length; i++) {
    			const colonne = opt.colonnes[i];
    			children = creePorteColonne(colonne, i, children);

    			for (let j = 0; j < colonne.casiers.length; j++) {
    				const casier = colonne.casiers[j];
    				children = creePorteCasier(colonne, i, casier, j, children);
    				children = creeTiroirCasier(colonne, i, casier, j, children);
    				children = supprimeEtageres(colonne, i, casier, j, children);
    				children = creeEtageres(colonne, i, casier, j, children);
    			}
    		}

    		// Update values
    		for (let i = 0; i < children.length; i++) {
    			let child = { name: `n°${i + 1}`, ...children[i] };
    			child = configurePorteColonne(child) || child;
    			child = configurePorteFacadeCasier(child) || child;
    			child = configureTiroir(child, children) || child;
    			child = configureEtagere(child) || child;
    			children[i] = child;
    		}

    		return children;

    		function creePorteColonne(colonne, i, children) {
    			const child_idx = children.findIndex(c => c.source.join("-") == `Porte-colonne-${i}`);

    			if (!colonne.porte.type) {
    				// Pas de porte
    				if (child_idx != -1) {
    					if (confirm(`Caisson ${data.name}\nSupprimer la porte ${children[child_idx].name} ?`)) {
    						children.splice(child_idx, 1);
    					} else {
    						children[child_idx].source.push("disabled");
    					}
    				}

    				return children;
    			}

    			if (child_idx != -1) return children; // Porte trouvée

    			children = [
    				...children,
    				{
    					source: ["Porte", "colonne", i],
    					name: prompt("Quel nom donner à la porte ?", `colonne n°${i + 1}`),
    					type: "Porte",
    					id: nextId(children)
    				}
    			];

    			return children;
    		}

    		function configurePorteColonne(child) {
    			let source = [...child.source];
    			let [i] = source.splice(2, 1);
    			if (source.join("-") != "Porte-colonne") return child;
    			const col = opt.colonnes[i];
    			if (!col) return child;
    			const total = col.porte.type == "total";
    			const demi = col.porte.type == "demi";
    			const encastre = col.porte.type == "encastre";
    			const epaisseur_porte = (child.opt || {}).epaisseur || (child.opt || {}).epaisseur_montants;

    			return {
    				...child,
    				type: "Porte",
    				defaults: {
    					force_largeur: true,
    					force_hauteur: true,
    					encastree: encastre,
    					largeur: total
    					? col.largeur + 2 * opt.epaisseur_montants
    					: demi
    						? col.largeur + opt.epaisseur_montants
    						: encastre ? col.largeur : 0,
    					hauteur: total
    					? opt.hauteur
    					: demi
    						? opt.hauteur - opt.epaisseur_traverses
    						: encastre ? opt.hauteur - 2 * opt.epaisseur_traverses : 0
    				},
    				defaultPosition: {
    					x: col.ypos - (total
    					? opt.epaisseur_montants
    					: demi ? opt.epaisseur_montants / 2 : 0),
    					y: opt.epaisseur_traverses - (total
    					? opt.epaisseur_traverses
    					: demi ? opt.epaisseur_traverses / 2 : 0),
    					z: opt.profondeur - (encastre ? epaisseur_porte : 0)
    				}
    			};
    		}

    		function typePorte(casier) {
    			return casier.porte.facade ? "Facade" : "Porte";
    		}

    		function supprimeEtageres(colonne, i, casier, j, children) {
    			const num_etageres = casier.num_etageres;

    			for (let idx = children.length - 1; idx >= 0; idx--) {
    				const child = children[idx];
    				let source = [...child.source]; // Etagere-col-i-cas-j-num-n
    				let [num] = source.splice(6, 1);
    				if (source.join("-") != `Etagere-col-${i}-cas-${j}-num`) continue;
    				if (num < num_etageres) continue;

    				if (confirm(`Caisson ${data.name}\nSupprimer l'étagère ${child.name} ?`)) {
    					children.splice(i, 1);
    				} else {
    					children[i].source.push("disabled");
    				}
    			}

    			return children;
    		}

    		function creeEtageres(colonne, i, casier, j, children) {
    			const num_etageres = casier.num_etageres;
    			let name = null;

    			for (let num = 0; num < num_etageres; num++) {
    				const src = `Etagere-col-${i}-cas-${j}-num-${num}`;
    				const child_idx = children.findIndex(c => c.source.join("-") == src);
    				if (child_idx != -1) continue;

    				if (name == null) {
    					name = `colonne n°${i + 1}, casier n°${j + 1}`;
    					name = prompt(`Quel nom donner aux étagères ?`, name) || name;
    				}

    				children = [
    					...children,
    					{
    						source: ["Etagere", "col", i, "cas", j, "num", num],
    						name: `${name} #${num + 1}`,
    						type: "Etagere",
    						id: nextId(children)
    					}
    				];
    			}

    			return children;
    		}

    		function configureEtagere(child) {
    			let source = [...child.source];
    			let [num] = source.splice(6, 1);
    			let [j] = source.splice(4, 1);
    			let [i] = source.splice(2, 1);
    			if (source.join("-") != "Etagere-col-cas-num") return child;
    			const col = opt.colonnes[i];
    			if (!col) return child;
    			const cas = col.casiers[j];
    			if (!cas) return child;
    			const step = cas.hauteur / (cas.num_etageres + 1);

    			return {
    				...child,
    				type: "Etagere",
    				defaults: {
    					force_largeur: true,
    					force_profondeur: true,
    					largeur: col.largeur,
    					profondeur: opt.profondeur
    				},
    				defaultPosition: {
    					x: col.xpos,
    					y: cas.ypos + (num + 1) * step,
    					z: 0
    				}
    			};
    		}

    		function creePorteCasier(colonne, i, casier, j, children) {
    			const type = typePorte(casier);

    			const variants = !casier.porte.type
    			? []
    			: casier.porte.double
    				? [`${type}-col-${i}-cas-${j}-g`, `${type}-col-${i}-cas-${j}-d`]
    				: [`${type}-col-${i}-cas-${j}`];

    			const all_variants = [
    				`Porte-col-${i}-cas-${j}`,
    				`Porte-col-${i}-cas-${j}-g`,
    				`Porte-col-${i}-cas-${j}-d`,
    				`Facade-col-${i}-cas-${j}`,
    				`Facade-col-${i}-cas-${j}-g`,
    				`Facade-col-${i}-cas-${j}-d`
    			];

    			// Supprimer la facade si elle n'est pas du bon type
    			for (let idx = children.length - 1; idx >= 0; idx--) {
    				const source = children[idx].source.join("-");

    				//console.log(source, variants, all_variants)
    				console.log(source, children[idx].name);

    				if (variants.includes(source) || !all_variants.includes(source)) break;

    				if (confirm(`Caisson ${data.name}\nSupprimer la ${children[idx].type}
        ${children[idx].name} ?`)) {
    					children.splice(idx, 1);
    				} else {
    					children[idx].source.push("disabled");
    				}
    			}

    			// pas de porte à créer
    			if (!casier.porte.type) return children;

    			if (casier.porte.double) {
    				const child_idx_g = children.findIndex(c => c.source.join("-") == variants[0]);
    				const child_idx_d = children.findIndex(c => c.source.join("-") == variants[1]);
    				let namePrefix = `colonne n°${i + 1}, casier n°${j + 1}`;

    				if (child_idx_g == -1 && child_idx_d == -1) {
    					namePrefix = prompt(`Quel nom donner aux ${type.toLowerCase()}s ?`, namePrefix) || namePrefix;
    				}

    				if (child_idx_g == -1) {
    					children = [
    						...children,
    						{
    							source: [type, "col", i, "cas", j, "g"],
    							name: `${namePrefix} gauche`,
    							type,
    							id: nextId(children)
    						}
    					];
    				}

    				if (child_idx_d == -1) {
    					children = [
    						...children,
    						{
    							source: [type, "col", i, "cas", j, "d"],
    							name: `${namePrefix} droite`,
    							type,
    							id: nextId(children)
    						}
    					];
    				}
    			} else {
    				const child_idx = children.findIndex(c => c.source.join("-") == variants[0]);

    				if (child_idx == -1) {
    					children = [
    						...children,
    						{
    							source: [type, "col", i, "cas", j],
    							name: prompt(`Quel nom donner à la ${type.toLowerCase()} ?`, `colonne n°${i + 1}, casier n°${j + 1}`),
    							type,
    							id: nextId(children)
    						}
    					];
    				}
    			}

    			return children;
    		}

    		function configurePorteFacadeCasier(child) {
    			let source = [...child.source];
    			let [side] = source.splice(5, 1);
    			let [j] = source.splice(4, 1);
    			let [i] = source.splice(2, 1);
    			let [type] = source.splice(0, 1);
    			if (source.join("-") != "col-cas") return child;
    			if (type != "Porte" && type != "Facade") return child;
    			if (side && side != "g" && side != "d") return child;
    			const col = opt.colonnes[i];
    			if (!col) return child;
    			const cas = col.casiers[j];
    			if (!cas) return child;
    			const double = !!side;
    			const total = cas.porte.type == "total";
    			const demi = cas.porte.type == "demi";
    			const encastre = cas.porte.type == "encastre";
    			const epaisseur_porte = (child.opt || {}).epaisseur || (child.opt || {}).epaisseur_montants;

    			const defaults = {
    				force_ferrage: true,
    				ferrage: cas.tiroir ? "aucun" : "charnieres",
    				encastree: encastre,
    				force_largeur: true,
    				force_hauteur: true,
    				largeur: 1 / (double ? 2 : 1) * (total
    				? col.largeur + 2 * opt.epaisseur_montants
    				: demi
    					? col.largeur + opt.epaisseur_montants
    					: encastre ? col.largeur : 0),
    				hauteur: total
    				? cas.hauteur + 2 * opt.epaisseur_traverses
    				: demi
    					? cas.hauteur + opt.epaisseur_traverses
    					: encastre ? cas.hauteur : 0
    			};

    			const defaultPosition = {
    				x: cas.xpos + (side == "d" ? defaults.largeur : 0) - (total
    				? opt.epaisseur_montants
    				: demi ? opt.epaisseur_montants / 2 : 0),
    				y: cas.ypos - (total
    				? opt.epaisseur_traverses
    				: demi ? opt.epaisseur_traverses / 2 : 0),
    				z: opt.profondeur - (encastre ? epaisseur_porte : 0)
    			};

    			return {
    				...child,
    				type,
    				defaults,
    				defaultPosition
    			};
    		}

    		function creeTiroirCasier(colonne, i, casier, j, children) {
    			const child_idx = children.findIndex(c => c.source.join("-") == `Tiroir-col-${i}-cas-${j}`);

    			// Supprimer le tiroir si il n'existe pas
    			// Si il existe, return
    			if (!casier.tiroir) {
    				// Pas de tiroir
    				if (child_idx != -1 && confirm(`Supprimer le tiroir ${children[child_idx].name} ?`)) {
    					children.splice(child_idx, 1);
    				}

    				return children;
    			}

    			if (child_idx != -1) return children; // Tiroir trouvé

    			// Créer le tiroir si il n'est pas encore créé
    			children = [
    				...children,
    				{
    					source: ["Tiroir", "col", i, "cas", j],
    					name: prompt(`Quel nom donner au tiroir ?`, `colonne n°${i + 1}, casier n°${j + 1}`),
    					type: "Tiroir",
    					id: nextId(children)
    				}
    			];

    			return children;
    		}

    		function configureTiroir(child, children) {
    			let source = [...child.source];
    			let [j] = source.splice(4, 1);
    			let [i] = source.splice(2, 1);
    			if (source.join("-") != "Tiroir-col-cas") return child;
    			const col = opt.colonnes[i];
    			if (!col) return child;
    			const cas = col.casiers[j];
    			if (!cas) return child;
    			const facade = children.find(c => c.source.join("-") == `${typePorte(cas)}-col-${i}-cas-${j}`) || {};

    			const epaisseur_porte = facade
    			? (facade.opt || {}).epaisseur || (facade.opt || {}).epaisseur_montants
    			: 0;

    			const retrait = cas.porte.type == "encastre" ? epaisseur_porte : 0;

    			return {
    				...child,
    				type: "Tiroir",
    				defaults: {
    					force_largeur: true,
    					force_hauteur: true,
    					largeur: col.largeur,
    					hauteur: Math.min(150, cas.hauteur),
    					profondeur: opt.profondeur - retrait
    				},
    				defaultPosition: {
    					x: cas.xpos,
    					y: cas.ypos,
    					z: cas.porte.type == "encastre" ? epaisseur_porte : 0
    				}
    			};
    		}
    	}

    	//
    	// Pièces
    	//
    	let montant = new Piece().add_name("Montant").add_features("montant");

    	let traverse = new Piece().add_name("Traverse").add_features("traverse");
    	let piece_panneau = new Piece().add_name("Panneau").add_features("panneau");
    	let all_pieces = [];
    	let child_pieces = [];
    	const writable_props = ["path", "initdata"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$5.warn(`<Caisson> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function inputnumber0_value_binding(value) {
    		ui.hauteur = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber1_value_binding(value) {
    		ui.largeur = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber2_value_binding(value) {
    		ui.profondeur = value;
    		$$invalidate(2, ui);
    	}

    	function input_input_handler() {
    		num_colonnes = to_number(this.value);
    		$$invalidate(3, num_colonnes);
    	}

    	function input_input_handler_1(i) {
    		largeur_colonnes[i] = to_number(this.value);
    		($$invalidate(4, largeur_colonnes), $$invalidate(3, num_colonnes));
    	}

    	function input_input_handler_2(i) {
    		num_casiers_colonnes[i] = to_number(this.value);
    		($$invalidate(5, num_casiers_colonnes), $$invalidate(3, num_colonnes));
    	}

    	function input_input_handler_3(i, j) {
    		hauteur_casiers_colonnes[i][j] = to_number(this.value);
    		(($$invalidate(6, hauteur_casiers_colonnes), $$invalidate(3, num_colonnes)), $$invalidate(5, num_casiers_colonnes));
    	}

    	function input_change_handler() {
    		selection_casier_input = this.__value;
    		$$invalidate(9, selection_casier_input);
    	}

    	const func_1 = (j, i, p, k) => p.droite != j || opt.montants[i].panneaux[k].actif;
    	const func_3 = (j, i, p, k) => p.gauche != j || opt.montants[i + 1].panneaux[k].actif;
    	const func_5 = (j, i, p, k) => p.droite == j && opt.montants[i].panneaux[k].actif;
    	const func_7 = (j, i, p, k) => p.gauche == j && opt.montants[i + 1].panneaux[k].actif;

    	function inputselect_value_binding(value) {
    		ui_colonnes[selection_casier_i].porte.type = value;
    		(($$invalidate(7, ui_colonnes), $$invalidate(3, num_colonnes)), $$invalidate(5, num_casiers_colonnes));
    	}

    	function inputcheckbox_checked_binding(value) {
    		ui_colonnes[selection_casier_i].porte.double = value;
    		(($$invalidate(7, ui_colonnes), $$invalidate(3, num_colonnes)), $$invalidate(5, num_casiers_colonnes));
    	}

    	function inputselect_value_binding_1(value) {
    		ui_colonnes[selection_casier_i].casiers[selection_casier_j].porte.type = value;
    		(($$invalidate(7, ui_colonnes), $$invalidate(3, num_colonnes)), $$invalidate(5, num_casiers_colonnes));
    	}

    	function inputcheckbox0_checked_binding(value) {
    		ui_colonnes[selection_casier_i].casiers[selection_casier_j].porte.double = value;
    		(($$invalidate(7, ui_colonnes), $$invalidate(3, num_colonnes)), $$invalidate(5, num_casiers_colonnes));
    	}

    	function inputcheckbox1_checked_binding(value) {
    		ui_colonnes[selection_casier_i].casiers[selection_casier_j].porte.facade = value;
    		(($$invalidate(7, ui_colonnes), $$invalidate(3, num_colonnes)), $$invalidate(5, num_casiers_colonnes));
    	}

    	function inputnumber_value_binding(value) {
    		ui_colonnes[selection_casier_i].casiers[selection_casier_j].num_etageres = value;
    		(($$invalidate(7, ui_colonnes), $$invalidate(3, num_colonnes)), $$invalidate(5, num_casiers_colonnes));
    	}

    	function inputcheckbox2_checked_binding(value) {
    		ui_colonnes[selection_casier_i].casiers[selection_casier_j].tiroir = value;
    		(($$invalidate(7, ui_colonnes), $$invalidate(3, num_colonnes)), $$invalidate(5, num_casiers_colonnes));
    	}

    	function inputcheckbox_checked_binding_1(value) {
    		ui.panneau_dessus = value;
    		$$invalidate(2, ui);
    	}

    	function inputcheckbox_checked_binding_2(value) {
    		ui_colonnes[selection_casier_i].casiers[selection_casier_j - 1].panneau_dessous = value;
    		(($$invalidate(7, ui_colonnes), $$invalidate(3, num_colonnes)), $$invalidate(5, num_casiers_colonnes));
    	}

    	function inputcheckbox3_checked_binding(value) {
    		ui_colonnes[selection_casier_i].casiers[selection_casier_j].panneau_dos = value;
    		(($$invalidate(7, ui_colonnes), $$invalidate(3, num_colonnes)), $$invalidate(5, num_casiers_colonnes));
    	}

    	function inputcheckbox_checked_binding_3(value) {
    		ui_colonnes[selection_casier_i].casiers[selection_casier_j].panneau_dessous = value;
    		(($$invalidate(7, ui_colonnes), $$invalidate(3, num_colonnes)), $$invalidate(5, num_casiers_colonnes));
    	}

    	function inputcheckbox_checked_binding_4(value) {
    		ui.panneau_dessous = value;
    		$$invalidate(2, ui);
    	}

    	function inputcheckbox_checked_binding_5(value, k) {
    		ui_montants[selection_casier_i].panneaux_actifs[k] = value;
    		($$invalidate(8, ui_montants), $$invalidate(3, num_colonnes));
    	}

    	function inputcheckbox_checked_binding_6(value, k) {
    		ui_montants[selection_casier_i + 1].panneaux_actifs[k] = value;
    		($$invalidate(8, ui_montants), $$invalidate(3, num_colonnes));
    	}

    	function inputnumber3_value_binding(value) {
    		ui.epaisseur_montants = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber4_value_binding(value) {
    		ui.epaisseur_traverses = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber5_value_binding(value) {
    		ui.largeur_montants = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber6_value_binding(value) {
    		ui.largeur_traverses = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber7_value_binding(value) {
    		ui.profondeur_tenons_cotes = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber8_value_binding(value) {
    		ui.profondeur_tenons = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber9_value_binding(value) {
    		ui.epaisseur_panneau = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber10_value_binding(value) {
    		ui.profondeur_rainure = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber11_value_binding(value) {
    		ui.jeu_rainure = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber12_value_binding(value) {
    		ui.montants_inter_longueur_tenon = value;
    		$$invalidate(2, ui);
    	}

    	function childrenpositions_childrenPos_binding(value) {
    		childrenPos = value;
    		$$invalidate(10, childrenPos);
    	}

    	function childrenpositions_pieces_binding(value) {
    		child_pieces = value;
    		$$invalidate(13, child_pieces);
    	}

    	function component_data_binding(value) {
    		data = value;
    		(((((((((((($$invalidate(16, data), $$invalidate(21, initdata)), $$invalidate(1, opt)), $$invalidate(2, ui)), $$invalidate(11, children)), $$invalidate(10, childrenPos)), $$invalidate(20, defaults)), $$invalidate(3, num_colonnes)), $$invalidate(4, largeur_colonnes)), $$invalidate(5, num_casiers_colonnes)), $$invalidate(6, hauteur_casiers_colonnes)), $$invalidate(7, ui_colonnes)), $$invalidate(8, ui_montants));
    	}

    	function component_childrenState_binding(value) {
    		childrenState = value;
    		$$invalidate(18, childrenState);
    	}

    	function component_children_binding(value) {
    		children = value;
    		((((((((($$invalidate(11, children), $$invalidate(1, opt)), $$invalidate(20, defaults)), $$invalidate(2, ui)), $$invalidate(3, num_colonnes)), $$invalidate(4, largeur_colonnes)), $$invalidate(5, num_casiers_colonnes)), $$invalidate(6, hauteur_casiers_colonnes)), $$invalidate(7, ui_colonnes)), $$invalidate(8, ui_montants));
    	}

    	function datachange_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("initdata" in $$props) $$invalidate(21, initdata = $$props.initdata);
    	};

    	$$self.$capture_state = () => ({
    		cleanObject,
    		pipeline,
    		nextId,
    		Component,
    		ChildrenPositions,
    		Piece,
    		Group,
    		SVGDrawing,
    		ListeDebit,
    		InputCheckbox,
    		InputNumber,
    		InputSelect,
    		path,
    		initdata,
    		data,
    		defaults,
    		state,
    		childrenState,
    		opt,
    		ui,
    		num_colonnes,
    		largeur_colonnes,
    		num_casiers_colonnes,
    		hauteur_casiers_colonnes,
    		ui_colonnes,
    		ui_montants,
    		selection_casier_input,
    		childrenPos,
    		children,
    		updateSubdivisions,
    		calculLargeurColonnes,
    		calculColonnesCasiers,
    		calculCasiers,
    		calculPositionCasiers,
    		calculSubdivisionMontants,
    		calculEnfants,
    		montant,
    		traverse,
    		piece_panneau,
    		all_pieces,
    		child_pieces,
    		selection_casier_i,
    		selection_casier_j,
    		selection_casier,
    		montants_template,
    		montant_ar_g,
    		montant_av_g,
    		montant_ar_d,
    		montant_av_d,
    		traverses_cote,
    		traverse_cote_h_g,
    		traverse_cote_b_g,
    		traverse_cote_h_d,
    		traverse_cote_b_d,
    		traverses,
    		traverse_ar_h,
    		traverse_ar_b,
    		traverse_av_h,
    		traverse_av_b,
    		panneaux_haut_bas,
    		panneau_h,
    		panneau_b,
    		panneaux_dos,
    		montants_cloisons,
    		montants_cloisons_av,
    		montants_cloisons_ar,
    		traverses_cote_inter_caissons,
    		panneaux_cote_et_cloisons,
    		traverses_cloisons,
    		traverses_cloisons_h,
    		traverses_cloisons_b,
    		traverses_inter2_av_ar,
    		traverses_inter2_av,
    		traverses_inter2_ar,
    		panneau_inter2_dessous,
    		pieces
    	});

    	$$self.$inject_state = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("initdata" in $$props) $$invalidate(21, initdata = $$props.initdata);
    		if ("data" in $$props) $$invalidate(16, data = $$props.data);
    		if ("defaults" in $$props) $$invalidate(20, defaults = $$props.defaults);
    		if ("state" in $$props) $$invalidate(17, state = $$props.state);
    		if ("childrenState" in $$props) $$invalidate(18, childrenState = $$props.childrenState);
    		if ("opt" in $$props) $$invalidate(1, opt = $$props.opt);
    		if ("ui" in $$props) $$invalidate(2, ui = $$props.ui);
    		if ("num_colonnes" in $$props) $$invalidate(3, num_colonnes = $$props.num_colonnes);
    		if ("largeur_colonnes" in $$props) $$invalidate(4, largeur_colonnes = $$props.largeur_colonnes);
    		if ("num_casiers_colonnes" in $$props) $$invalidate(5, num_casiers_colonnes = $$props.num_casiers_colonnes);
    		if ("hauteur_casiers_colonnes" in $$props) $$invalidate(6, hauteur_casiers_colonnes = $$props.hauteur_casiers_colonnes);
    		if ("ui_colonnes" in $$props) $$invalidate(7, ui_colonnes = $$props.ui_colonnes);
    		if ("ui_montants" in $$props) $$invalidate(8, ui_montants = $$props.ui_montants);
    		if ("selection_casier_input" in $$props) $$invalidate(9, selection_casier_input = $$props.selection_casier_input);
    		if ("childrenPos" in $$props) $$invalidate(10, childrenPos = $$props.childrenPos);
    		if ("children" in $$props) $$invalidate(11, children = $$props.children);
    		if ("montant" in $$props) $$invalidate(104, montant = $$props.montant);
    		if ("traverse" in $$props) $$invalidate(105, traverse = $$props.traverse);
    		if ("piece_panneau" in $$props) $$invalidate(106, piece_panneau = $$props.piece_panneau);
    		if ("all_pieces" in $$props) $$invalidate(12, all_pieces = $$props.all_pieces);
    		if ("child_pieces" in $$props) $$invalidate(13, child_pieces = $$props.child_pieces);
    		if ("selection_casier_i" in $$props) $$invalidate(14, selection_casier_i = $$props.selection_casier_i);
    		if ("selection_casier_j" in $$props) $$invalidate(15, selection_casier_j = $$props.selection_casier_j);
    		if ("selection_casier" in $$props) $$invalidate(19, selection_casier = $$props.selection_casier);
    		if ("montants_template" in $$props) $$invalidate(22, montants_template = $$props.montants_template);
    		if ("montant_ar_g" in $$props) $$invalidate(23, montant_ar_g = $$props.montant_ar_g);
    		if ("montant_av_g" in $$props) $$invalidate(24, montant_av_g = $$props.montant_av_g);
    		if ("montant_ar_d" in $$props) $$invalidate(25, montant_ar_d = $$props.montant_ar_d);
    		if ("montant_av_d" in $$props) $$invalidate(26, montant_av_d = $$props.montant_av_d);
    		if ("traverses_cote" in $$props) $$invalidate(27, traverses_cote = $$props.traverses_cote);
    		if ("traverse_cote_h_g" in $$props) $$invalidate(28, traverse_cote_h_g = $$props.traverse_cote_h_g);
    		if ("traverse_cote_b_g" in $$props) $$invalidate(29, traverse_cote_b_g = $$props.traverse_cote_b_g);
    		if ("traverse_cote_h_d" in $$props) $$invalidate(30, traverse_cote_h_d = $$props.traverse_cote_h_d);
    		if ("traverse_cote_b_d" in $$props) $$invalidate(31, traverse_cote_b_d = $$props.traverse_cote_b_d);
    		if ("traverses" in $$props) $$invalidate(32, traverses = $$props.traverses);
    		if ("traverse_ar_h" in $$props) $$invalidate(33, traverse_ar_h = $$props.traverse_ar_h);
    		if ("traverse_ar_b" in $$props) $$invalidate(34, traverse_ar_b = $$props.traverse_ar_b);
    		if ("traverse_av_h" in $$props) $$invalidate(35, traverse_av_h = $$props.traverse_av_h);
    		if ("traverse_av_b" in $$props) $$invalidate(36, traverse_av_b = $$props.traverse_av_b);
    		if ("panneaux_haut_bas" in $$props) $$invalidate(37, panneaux_haut_bas = $$props.panneaux_haut_bas);
    		if ("panneau_h" in $$props) $$invalidate(38, panneau_h = $$props.panneau_h);
    		if ("panneau_b" in $$props) $$invalidate(39, panneau_b = $$props.panneau_b);
    		if ("panneaux_dos" in $$props) $$invalidate(40, panneaux_dos = $$props.panneaux_dos);
    		if ("montants_cloisons" in $$props) $$invalidate(41, montants_cloisons = $$props.montants_cloisons);
    		if ("montants_cloisons_av" in $$props) $$invalidate(42, montants_cloisons_av = $$props.montants_cloisons_av);
    		if ("montants_cloisons_ar" in $$props) $$invalidate(43, montants_cloisons_ar = $$props.montants_cloisons_ar);
    		if ("traverses_cote_inter_caissons" in $$props) $$invalidate(44, traverses_cote_inter_caissons = $$props.traverses_cote_inter_caissons);
    		if ("panneaux_cote_et_cloisons" in $$props) $$invalidate(45, panneaux_cote_et_cloisons = $$props.panneaux_cote_et_cloisons);
    		if ("traverses_cloisons" in $$props) $$invalidate(46, traverses_cloisons = $$props.traverses_cloisons);
    		if ("traverses_cloisons_h" in $$props) $$invalidate(47, traverses_cloisons_h = $$props.traverses_cloisons_h);
    		if ("traverses_cloisons_b" in $$props) $$invalidate(48, traverses_cloisons_b = $$props.traverses_cloisons_b);
    		if ("traverses_inter2_av_ar" in $$props) $$invalidate(49, traverses_inter2_av_ar = $$props.traverses_inter2_av_ar);
    		if ("traverses_inter2_av" in $$props) $$invalidate(50, traverses_inter2_av = $$props.traverses_inter2_av);
    		if ("traverses_inter2_ar" in $$props) $$invalidate(51, traverses_inter2_ar = $$props.traverses_inter2_ar);
    		if ("panneau_inter2_dessous" in $$props) $$invalidate(52, panneau_inter2_dessous = $$props.panneau_inter2_dessous);
    		if ("pieces" in $$props) $$invalidate(53, pieces = $$props.pieces);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*num_colonnes, largeur_colonnes*/ 24) {
    			 $$invalidate(4, largeur_colonnes = Array.from(Array(num_colonnes).keys()).map(i => largeur_colonnes[i] || null));
    		}

    		if ($$self.$$.dirty[0] & /*num_colonnes, num_casiers_colonnes*/ 40) {
    			 $$invalidate(5, num_casiers_colonnes = Array.from(Array(num_colonnes).keys()).map(i => num_casiers_colonnes[i] || 1));
    		}

    		if ($$self.$$.dirty[0] & /*num_colonnes, hauteur_casiers_colonnes, num_casiers_colonnes*/ 104) {
    			 $$invalidate(6, hauteur_casiers_colonnes = Array.from(Array(num_colonnes).keys()).map(i => (hauteur_casiers_colonnes[i] || []).slice(0, num_casiers_colonnes[i])));
    		}

    		if ($$self.$$.dirty[0] & /*num_colonnes, ui_colonnes, num_casiers_colonnes*/ 168) {
    			 $$invalidate(7, ui_colonnes = Array.from(Array(num_colonnes).keys()).map(i => ui_colonnes[i] || {}).map((colonne, i) => {
    				return {
    					...colonne,
    					porte: { ...colonne.porte },
    					casiers: Array.from(Array(num_casiers_colonnes[i]).keys()).map(j => ({ porte: {}, ...(colonne.casiers || [])[j] }))
    				};
    			}));
    		}

    		if ($$self.$$.dirty[0] & /*ui_montants, num_colonnes*/ 264) {
    			 $$invalidate(8, ui_montants = pipeline(ui_montants.slice(0, ui_montants.length - 1), m => Array(num_colonnes).fill(1).map((_, i) => m[i] || { panneaux_actifs: [] }), m => m.concat([ui_montants[ui_montants.length - 1]])).map(montant => ({
    				...montant,
    				panneaux_actifs: [...montant.panneaux_actifs || []]
    			})));
    		}

    		if ($$self.$$.dirty[0] & /*selection_casier_input*/ 512) {
    			 $$invalidate(14, [selection_casier_i, selection_casier_j] = selection_casier_input.split(",").map(n => parseInt(n)), selection_casier_i, ($$invalidate(15, selection_casier_j), $$invalidate(9, selection_casier_input)));
    		}

    		if ($$self.$$.dirty[0] & /*selection_casier_i, selection_casier_j, selection_casier_input*/ 49664) {
    			 $$invalidate(19, selection_casier = {
    				i: selection_casier_i,
    				j: selection_casier_j,
    				key: selection_casier_input
    			});
    		}

    		if ($$self.$$.dirty[0] & /*ui, num_colonnes, largeur_colonnes, num_casiers_colonnes, hauteur_casiers_colonnes, ui_colonnes, ui_montants*/ 508) {
    			//
    			// Update opt from ui
    			//
    			 $$invalidate(1, opt = pipeline({ ...defaults, ...cleanObject({ ...ui }) }, opt => updateSubdivisions(num_colonnes, opt), opt => calculLargeurColonnes(largeur_colonnes, opt), opt => calculColonnesCasiers(num_casiers_colonnes, hauteur_casiers_colonnes, ui_colonnes, opt), opt => calculSubdivisionMontants(opt, ui_montants)));
    		}

    		if ($$self.$$.dirty[0] & /*opt, children*/ 2050) {
    			 $$invalidate(11, children = calculEnfants(opt, children));
    		}

    		if ($$self.$$.dirty[0] & /*initdata, opt, ui, children, childrenPos*/ 2100230) {
    			/*
    $: console.log('Caisson.initdata = ', initdata)
    $: console.log('Caisson.opt = ', opt)
    $: console.log('Caisson.ui = ', ui)
    $: console.log('Caisson.children = ', children)
    $: console.log('Caisson.childrenPos = ', childrenPos)
    $: console.log('Caisson.state = ', state)
    */
    			 $$invalidate(16, data = {
    				...initdata,
    				opt,
    				ui,
    				children,
    				childrenPos
    			});
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 2) {
    			 $$invalidate(22, montants_template = montant.build(opt.hauteur, opt.largeur_montants, opt.epaisseur_montants));
    		}

    		if ($$self.$$.dirty[0] & /*montants_template*/ 4194304) {
    			 $$invalidate(23, montant_ar_g = montants_template.add_name("arrière-gauche").put(0, 0, 0, "yzx"));
    		}

    		if ($$self.$$.dirty[0] & /*montants_template, opt*/ 4194306) {
    			 $$invalidate(24, montant_av_g = montants_template.add_name("avant-gauche").put(opt.largeur - montants_template.epaisseur, 0, opt.profondeur - montants_template.largeur, "yzx"));
    		}

    		if ($$self.$$.dirty[0] & /*montants_template, opt*/ 4194306) {
    			 $$invalidate(25, montant_ar_d = montants_template.add_name("arrière-droit").put(opt.largeur - montants_template.epaisseur, 0, 0, "yzx"));
    		}

    		if ($$self.$$.dirty[0] & /*montants_template, opt*/ 4194306) {
    			 $$invalidate(26, montant_av_d = montants_template.add_name("avant-droit").put(0, 0, opt.profondeur - montants_template.largeur, "yzx"));
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 2) {
    			 $$invalidate(27, traverses_cote = traverse.build(opt.profondeur - 2 * (opt.largeur_montants - opt.profondeur_tenons_cotes), opt.largeur_traverses, opt.epaisseur_traverses).usine_tenons(opt.profondeur_tenons_cotes).put(null, null, opt.largeur_montants - opt.profondeur_tenons_cotes, "zyx"));
    		}

    		if ($$self.$$.dirty[0] & /*traverses_cote*/ 134217728) {
    			 $$invalidate(28, traverse_cote_h_g = traverses_cote.add_name("haut-gauche").put(0, 0));
    		}

    		if ($$self.$$.dirty[0] & /*traverses_cote, opt*/ 134217730) {
    			 $$invalidate(29, traverse_cote_b_g = traverses_cote.add_name("bas-gauche").put(0, opt.hauteur - traverses_cote.largeur));
    		}

    		if ($$self.$$.dirty[0] & /*traverses_cote, opt*/ 134217730) {
    			 $$invalidate(30, traverse_cote_h_d = traverses_cote.add_name("haut-droit").put(opt.largeur - traverses_cote.epaisseur, 0));
    		}

    		if ($$self.$$.dirty[0] & /*traverses_cote, opt*/ 134217730) {
    			 $$invalidate(31, traverse_cote_b_d = traverses_cote.add_name("bas-droit").put(opt.largeur - traverses_cote.epaisseur, opt.hauteur - traverses_cote.largeur));
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 2) {
    			 $$invalidate(32, traverses = traverse.add_name("principale").build(opt.largeur - 2 * (opt.epaisseur_montants - opt.profondeur_tenons), opt.largeur_traverses, opt.epaisseur_traverses).usine_tenons(opt.profondeur_tenons).put(opt.epaisseur_montants - opt.profondeur_tenons, null, null, "xzy"));
    		}

    		if ($$self.$$.dirty[1] & /*traverses*/ 2) {
    			 $$invalidate(33, traverse_ar_h = traverses.add_name("arrière-haut").put(null, 0, 0));
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 2 | $$self.$$.dirty[1] & /*traverses*/ 2) {
    			 $$invalidate(34, traverse_ar_b = traverses.add_name("arrière-bas").put(null, opt.hauteur - traverses.epaisseur, 0));
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 2 | $$self.$$.dirty[1] & /*traverses*/ 2) {
    			 $$invalidate(35, traverse_av_h = traverses.add_name("avant-haut").put(null, 0, opt.profondeur - traverses.largeur));
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 2 | $$self.$$.dirty[1] & /*traverses*/ 2) {
    			 $$invalidate(36, traverse_av_b = traverses.add_name("avant-bas").put(null, opt.hauteur - traverses.epaisseur, opt.profondeur - traverses.largeur));
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 2) {
    			 $$invalidate(37, panneaux_haut_bas = piece_panneau.build(opt.largeur - 2 * (opt.epaisseur_montants - opt.profondeur_rainure + opt.jeu_rainure), opt.profondeur - 2 * (opt.largeur_traverses - opt.profondeur_rainure + opt.jeu_rainure), opt.epaisseur_panneau).put(opt.epaisseur_montants - opt.profondeur_rainure + opt.jeu_rainure, null, opt.largeur_montants - opt.profondeur_rainure + opt.jeu_rainure, "xzy"));
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 2 | $$self.$$.dirty[1] & /*panneaux_haut_bas*/ 64) {
    			 $$invalidate(38, panneau_h = !opt.panneau_dessus
    			? null
    			: panneaux_haut_bas.add_name("haut").put(null, 0));
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 2 | $$self.$$.dirty[1] & /*panneaux_haut_bas*/ 64) {
    			 $$invalidate(39, panneau_b = !opt.panneau_dessous
    			? null
    			: panneaux_haut_bas.add_name("bas").put(null, opt.hauteur - panneaux_haut_bas.epaisseur));
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 2) {
    			 $$invalidate(40, panneaux_dos = opt.colonnes.map((col, i) => col.casiers.map((casier, j) => casier.panneau_dos == false
    			? null
    			: piece_panneau.add_name("dos", `colonne n°${i + 1}`, `casier n°${j + 1}`).build(casier.hauteur + 2 * (opt.profondeur_rainure - opt.jeu_rainure), col.largeur + opt.epaisseur_montants - opt.largeur_montants / 2 + 2 * (opt.profondeur_rainure - opt.jeu_rainure), opt.epaisseur_panneau).put(casier.xpos - opt.profondeur_rainure + opt.jeu_rainure, casier.ypos - opt.profondeur_rainure + opt.jeu_rainure, 0, "yxz"))));
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 2) {
    			 $$invalidate(41, montants_cloisons = Array.from(Array(opt.colonnes.length - 1).keys()).map(i => montant.add_name(`cloison n°${i + 1}`).build(opt.hauteur - 2 * (opt.epaisseur_traverses - opt.montants_inter_longueur_tenon), opt.largeur_montants, opt.epaisseur_montants).usine_tenons(opt.montants_inter_longueur_tenon).put(opt.epaisseur_montants + opt.colonnes.slice(0, i + 1).map(x => x.largeur).reduce((a, b) => a + b, 0) + i * opt.epaisseur_montants, opt.epaisseur_traverses - opt.montants_inter_longueur_tenon, null, "yzx")));
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 2 | $$self.$$.dirty[1] & /*montants_cloisons*/ 1024) {
    			 $$invalidate(42, montants_cloisons_av = montants_cloisons.map((m, i) => m.add_name("avant").put(null, null, opt.profondeur - m.largeur)));
    		}

    		if ($$self.$$.dirty[1] & /*montants_cloisons*/ 1024) {
    			 $$invalidate(43, montants_cloisons_ar = montants_cloisons.map((m, i) => m.add_name("arrière").put(null, null, 0)));
    		}

    		if ($$self.$$.dirty[0] & /*opt, traverses_cote*/ 134217730) {
    			 $$invalidate(44, traverses_cote_inter_caissons = opt.montants.map((sub, i) => sub.traverses.map((h, j) => traverses_cote.add_name(i == 0
    			? "coté gauche"
    			: i < opt.colonnes.length
    				? `cloison n°${i}`
    				: "coté droit").add_name(`traverse n°${j + 1}`).put(opt.epaisseur_montants * i + opt.colonnes.slice(0, i).reduce((n, c) => n + c.largeur, 0), h.y1))));
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 2) {
    			 $$invalidate(45, panneaux_cote_et_cloisons = opt.montants.map((sub, i) => sub.panneaux.map((panneau, j) => !panneau.actif
    			? null
    			: piece_panneau.add_name(
    					i == 0
    					? "coté gauche"
    					: i >= opt.colonnes.length
    						? "coté droit"
    						: `cloison n°${i}`,
    					`caisson n°${j + 1}`
    				).build(panneau.y2 - panneau.y1 + 2 * (opt.profondeur_rainure - opt.jeu_rainure), opt.profondeur - 2 * (opt.largeur_traverses - opt.profondeur_rainure + opt.jeu_rainure), opt.epaisseur_panneau).put(opt.epaisseur_montants * i + opt.colonnes.slice(0, i).reduce((n, c) => n + c.largeur, 0), panneau.y1 - opt.profondeur_rainure + opt.jeu_rainure, opt.largeur_montants - opt.profondeur_rainure + opt.jeu_rainure, "yzx"))));
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 2) {
    			 $$invalidate(46, traverses_cloisons = Array.from(Array(opt.colonnes.length - 1).keys()).map(i => traverse.add_name(`cloison n°${i + 1}`).build(opt.profondeur - 2 * (opt.largeur_montants - opt.profondeur_tenons_cotes), opt.largeur_traverses, opt.epaisseur_traverses).usine_tenons(opt.profondeur_tenons_cotes).put(opt.epaisseur_montants + opt.colonnes.slice(0, i + 1).map(x => x.largeur).reduce((a, b) => a + b, 0) + i * opt.epaisseur_montants, null, opt.largeur_montants - opt.profondeur_tenons_cotes, "zyx")));
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 2 | $$self.$$.dirty[1] & /*traverses_cloisons*/ 32768) {
    			 $$invalidate(47, traverses_cloisons_h = traverses_cloisons.map((t, i) => t.add_name("haut").put(null, opt.epaisseur_traverses)));
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 2 | $$self.$$.dirty[1] & /*traverses_cloisons*/ 32768) {
    			 $$invalidate(48, traverses_cloisons_b = traverses_cloisons.map((t, i) => t.add_name("bas").put(null, opt.hauteur - opt.epaisseur_traverses - t.largeur)));
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 2) {
    			 $$invalidate(49, traverses_inter2_av_ar = opt.colonnes.map((col, i) => col.casiers.map((casier, j) => j == col.casiers.length - 1
    			? null
    			: traverse.add_name("intermédiaire").build(col.largeur, opt.largeur_traverses, opt.epaisseur_traverses).ajout_tenons(opt.profondeur_tenons).put(casier.xpos - opt.profondeur_tenons, casier.ypos - opt.epaisseur_traverses, null, "xzy"))));
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 2 | $$self.$$.dirty[1] & /*traverses_inter2_av_ar*/ 262144) {
    			 $$invalidate(50, traverses_inter2_av = traverses_inter2_av_ar.map((col, i) => col.map((tr, j) => tr == null
    			? null
    			: tr.add_name("avant", `cloison n°${i + 1}`, `caisson n°${j}`).put(null, null, opt.profondeur - opt.largeur_montants))));
    		}

    		if ($$self.$$.dirty[1] & /*traverses_inter2_av_ar*/ 262144) {
    			 $$invalidate(51, traverses_inter2_ar = traverses_inter2_av_ar.map((col, i) => col.map((tr, j) => tr == null
    			? null
    			: tr.add_name("arrière", `cloison n°${i + 1}`, `caisson n°${j}`).put(null, null, 0))));
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 2) {
    			 $$invalidate(52, panneau_inter2_dessous = opt.colonnes.map((col, i) => col.casiers.map((casier, j) => j == col.casiers.length - 1
    			? null
    			: casier.panneau_dessous === false
    				? null
    				: piece_panneau.add_name("dessous", `colonne n°${i + 1}`, `casier n°${j + 1}`).build(col.largeur + 2 * (opt.profondeur_rainure - opt.jeu_rainure), opt.profondeur - 2 * opt.largeur_traverses + 2 * (opt.profondeur_rainure - opt.jeu_rainure), opt.epaisseur_panneau).put(casier.xpos - opt.profondeur_rainure + opt.jeu_rainure, casier.ypos - opt.epaisseur_panneau, opt.largeur_traverses - opt.profondeur_rainure + opt.jeu_rainure, "xzy"))));
    		}

    		if ($$self.$$.dirty[0] & /*montant_ar_g, montant_av_g, montant_ar_d, montant_av_d, traverse_cote_b_g, traverse_cote_h_d, traverse_cote_h_g*/ 2004877312 | $$self.$$.dirty[1] & /*traverse_cote_b_d, traverse_av_h, traverse_av_b, traverse_ar_h, traverse_ar_b, panneau_h, panneau_b, panneaux_dos, panneaux_cote_et_cloisons, montants_cloisons_ar, montants_cloisons_av, traverses_cloisons_h, traverses_cloisons_b, traverses_inter2_av, traverses_inter2_ar, traverses_cote_inter_caissons, panneau_inter2_dessous*/ 3898301) {
    			 $$invalidate(53, pieces = [
    				montant_ar_g,
    				montant_av_g,
    				montant_ar_d,
    				montant_av_d,
    				traverse_cote_b_d,
    				traverse_cote_b_g,
    				traverse_cote_h_d,
    				traverse_cote_h_g,
    				traverse_av_h,
    				traverse_av_b,
    				traverse_ar_h,
    				traverse_ar_b,
    				panneau_h,
    				panneau_b
    			].concat(panneaux_dos.reduce((a, b) => a.concat(b), [])).concat(panneaux_cote_et_cloisons.reduce((a, b) => a.concat(b), [])).concat(montants_cloisons_ar).concat(montants_cloisons_av).concat(traverses_cloisons_h).concat(traverses_cloisons_b).concat(traverses_inter2_av.reduce((a, b) => a.concat(b), [])).concat(traverses_inter2_ar.reduce((a, b) => a.concat(b), [])).concat(traverses_cote_inter_caissons.reduce((a, b) => a.concat(b), [])).concat(panneau_inter2_dessous.reduce((a, b) => a.concat(b), [])).filter(x => x));
    		}

    		if ($$self.$$.dirty[0] & /*child_pieces*/ 8192 | $$self.$$.dirty[1] & /*pieces*/ 4194304) {
    			 $$invalidate(12, all_pieces = pieces.concat(child_pieces));
    		}

    		if ($$self.$$.dirty[0] & /*all_pieces*/ 4096) {
    			 $$invalidate(17, state.pieces = all_pieces, state);
    		}
    	};

    	return [
    		path,
    		opt,
    		ui,
    		num_colonnes,
    		largeur_colonnes,
    		num_casiers_colonnes,
    		hauteur_casiers_colonnes,
    		ui_colonnes,
    		ui_montants,
    		selection_casier_input,
    		childrenPos,
    		children,
    		all_pieces,
    		child_pieces,
    		selection_casier_i,
    		selection_casier_j,
    		data,
    		state,
    		childrenState,
    		selection_casier,
    		defaults,
    		initdata,
    		montants_template,
    		montant_ar_g,
    		montant_av_g,
    		montant_ar_d,
    		montant_av_d,
    		traverses_cote,
    		traverse_cote_h_g,
    		traverse_cote_b_g,
    		traverse_cote_h_d,
    		traverse_cote_b_d,
    		traverses,
    		traverse_ar_h,
    		traverse_ar_b,
    		traverse_av_h,
    		traverse_av_b,
    		panneaux_haut_bas,
    		panneau_h,
    		panneau_b,
    		panneaux_dos,
    		montants_cloisons,
    		montants_cloisons_av,
    		montants_cloisons_ar,
    		traverses_cote_inter_caissons,
    		panneaux_cote_et_cloisons,
    		traverses_cloisons,
    		traverses_cloisons_h,
    		traverses_cloisons_b,
    		traverses_inter2_av_ar,
    		traverses_inter2_av,
    		traverses_inter2_ar,
    		panneau_inter2_dessous,
    		pieces,
    		inputnumber0_value_binding,
    		inputnumber1_value_binding,
    		inputnumber2_value_binding,
    		input_input_handler,
    		input_input_handler_1,
    		input_input_handler_2,
    		input_input_handler_3,
    		input_change_handler,
    		$$binding_groups,
    		func_1,
    		func_3,
    		func_5,
    		func_7,
    		inputselect_value_binding,
    		inputcheckbox_checked_binding,
    		inputselect_value_binding_1,
    		inputcheckbox0_checked_binding,
    		inputcheckbox1_checked_binding,
    		inputnumber_value_binding,
    		inputcheckbox2_checked_binding,
    		inputcheckbox_checked_binding_1,
    		inputcheckbox_checked_binding_2,
    		inputcheckbox3_checked_binding,
    		inputcheckbox_checked_binding_3,
    		inputcheckbox_checked_binding_4,
    		inputcheckbox_checked_binding_5,
    		inputcheckbox_checked_binding_6,
    		inputnumber3_value_binding,
    		inputnumber4_value_binding,
    		inputnumber5_value_binding,
    		inputnumber6_value_binding,
    		inputnumber7_value_binding,
    		inputnumber8_value_binding,
    		inputnumber9_value_binding,
    		inputnumber10_value_binding,
    		inputnumber11_value_binding,
    		inputnumber12_value_binding,
    		childrenpositions_childrenPos_binding,
    		childrenpositions_pieces_binding,
    		component_data_binding,
    		component_childrenState_binding,
    		component_children_binding,
    		datachange_handler
    	];
    }

    class Caisson extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { path: 0, initdata: 21 }, [-1, -1, -1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Caisson",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*path*/ ctx[0] === undefined && !("path" in props)) {
    			console_1$5.warn("<Caisson> was created without expected prop 'path'");
    		}
    	}

    	get path() {
    		throw new Error("<Caisson>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Caisson>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get initdata() {
    		throw new Error("<Caisson>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set initdata(value) {
    		throw new Error("<Caisson>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ensembles/Etagere.svelte generated by Svelte v3.31.2 */
    const file$i = "src/ensembles/Etagere.svelte";

    // (67:2) <div slot="plan">
    function create_plan_slot$3(ctx) {
    	let div;
    	let svgdrawing;
    	let current;

    	svgdrawing = new SVGDrawing({
    			props: {
    				pieces: /*pieces*/ ctx[2],
    				name: `Étagère ${/*data*/ ctx[3].name}`
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(svgdrawing.$$.fragment);
    			attr_dev(div, "slot", "plan");
    			add_location(div, file$i, 66, 2, 1490);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(svgdrawing, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const svgdrawing_changes = {};
    			if (dirty & /*pieces*/ 4) svgdrawing_changes.pieces = /*pieces*/ ctx[2];
    			if (dirty & /*data*/ 8) svgdrawing_changes.name = `Étagère ${/*data*/ ctx[3].name}`;
    			svgdrawing.$set(svgdrawing_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgdrawing.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgdrawing.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(svgdrawing);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_plan_slot$3.name,
    		type: "slot",
    		source: "(67:2) <div slot=\\\"plan\\\">",
    		ctx
    	});

    	return block;
    }

    // (71:2) <div class="main" slot="dim">
    function create_dim_slot$2(ctx) {
    	let div;
    	let form;
    	let label0;
    	let span0;
    	let inputnumber0;
    	let updating_value;
    	let t1;
    	let t2;
    	let label1;
    	let span1;
    	let inputnumber1;
    	let updating_value_1;
    	let t4;
    	let t5;
    	let label2;
    	let span2;
    	let inputnumber2;
    	let updating_value_2;
    	let t7;
    	let current;

    	function inputnumber0_value_binding(value) {
    		/*inputnumber0_value_binding*/ ctx[9].call(null, value);
    	}

    	let inputnumber0_props = {
    		min: "0",
    		def: /*defaults*/ ctx[5].largeur,
    		force: /*defaults*/ ctx[5].force_largeur
    	};

    	if (/*ui*/ ctx[1].largeur !== void 0) {
    		inputnumber0_props.value = /*ui*/ ctx[1].largeur;
    	}

    	inputnumber0 = new InputNumber({
    			props: inputnumber0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber0, "value", inputnumber0_value_binding));

    	function inputnumber1_value_binding(value) {
    		/*inputnumber1_value_binding*/ ctx[10].call(null, value);
    	}

    	let inputnumber1_props = {
    		min: "0",
    		def: /*defaults*/ ctx[5].profondeur,
    		force: /*defaults*/ ctx[5].force_profondeur
    	};

    	if (/*ui*/ ctx[1].profondeur !== void 0) {
    		inputnumber1_props.value = /*ui*/ ctx[1].profondeur;
    	}

    	inputnumber1 = new InputNumber({
    			props: inputnumber1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber1, "value", inputnumber1_value_binding));

    	function inputnumber2_value_binding(value) {
    		/*inputnumber2_value_binding*/ ctx[11].call(null, value);
    	}

    	let inputnumber2_props = {
    		min: "0",
    		def: /*defaults*/ ctx[5].epaisseur,
    		force: /*defaults*/ ctx[5].force_epaisseur
    	};

    	if (/*ui*/ ctx[1].epaisseur !== void 0) {
    		inputnumber2_props.value = /*ui*/ ctx[1].epaisseur;
    	}

    	inputnumber2 = new InputNumber({
    			props: inputnumber2_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber2, "value", inputnumber2_value_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			form = element("form");
    			label0 = element("label");
    			span0 = element("span");
    			span0.textContent = "Largeur    : ";
    			create_component(inputnumber0.$$.fragment);
    			t1 = text(" mm");
    			t2 = space();
    			label1 = element("label");
    			span1 = element("span");
    			span1.textContent = "Profondeur : ";
    			create_component(inputnumber1.$$.fragment);
    			t4 = text(" mm");
    			t5 = space();
    			label2 = element("label");
    			span2 = element("span");
    			span2.textContent = "Épaisseur  : ";
    			create_component(inputnumber2.$$.fragment);
    			t7 = text(" mm");
    			attr_dev(span0, "class", "svelte-18serza");
    			add_location(span0, file$i, 72, 11, 1637);
    			attr_dev(label0, "class", "svelte-18serza");
    			add_location(label0, file$i, 72, 4, 1630);
    			attr_dev(span1, "class", "svelte-18serza");
    			add_location(span1, file$i, 73, 11, 1784);
    			attr_dev(label1, "class", "svelte-18serza");
    			add_location(label1, file$i, 73, 4, 1777);
    			attr_dev(span2, "class", "svelte-18serza");
    			add_location(span2, file$i, 74, 11, 1940);
    			attr_dev(label2, "class", "svelte-18serza");
    			add_location(label2, file$i, 74, 4, 1933);
    			attr_dev(form, "class", "svelte-18serza");
    			add_location(form, file$i, 71, 4, 1619);
    			attr_dev(div, "class", "main");
    			attr_dev(div, "slot", "dim");
    			add_location(div, file$i, 70, 2, 1585);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, form);
    			append_dev(form, label0);
    			append_dev(label0, span0);
    			mount_component(inputnumber0, label0, null);
    			append_dev(label0, t1);
    			append_dev(form, t2);
    			append_dev(form, label1);
    			append_dev(label1, span1);
    			mount_component(inputnumber1, label1, null);
    			append_dev(label1, t4);
    			append_dev(form, t5);
    			append_dev(form, label2);
    			append_dev(label2, span2);
    			mount_component(inputnumber2, label2, null);
    			append_dev(label2, t7);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const inputnumber0_changes = {};

    			if (!updating_value && dirty & /*ui*/ 2) {
    				updating_value = true;
    				inputnumber0_changes.value = /*ui*/ ctx[1].largeur;
    				add_flush_callback(() => updating_value = false);
    			}

    			inputnumber0.$set(inputnumber0_changes);
    			const inputnumber1_changes = {};

    			if (!updating_value_1 && dirty & /*ui*/ 2) {
    				updating_value_1 = true;
    				inputnumber1_changes.value = /*ui*/ ctx[1].profondeur;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			inputnumber1.$set(inputnumber1_changes);
    			const inputnumber2_changes = {};

    			if (!updating_value_2 && dirty & /*ui*/ 2) {
    				updating_value_2 = true;
    				inputnumber2_changes.value = /*ui*/ ctx[1].epaisseur;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			inputnumber2.$set(inputnumber2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputnumber0.$$.fragment, local);
    			transition_in(inputnumber1.$$.fragment, local);
    			transition_in(inputnumber2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputnumber0.$$.fragment, local);
    			transition_out(inputnumber1.$$.fragment, local);
    			transition_out(inputnumber2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(inputnumber0);
    			destroy_component(inputnumber1);
    			destroy_component(inputnumber2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_dim_slot$2.name,
    		type: "slot",
    		source: "(71:2) <div class=\\\"main\\\" slot=\\\"dim\\\">",
    		ctx
    	});

    	return block;
    }

    // (78:2) <div slot="tables">
    function create_tables_slot$3(ctx) {
    	let div;
    	let listedebit;
    	let current;

    	listedebit = new ListeDebit({
    			props: {
    				pieces: new Group(/*pieces*/ ctx[2], `Étagère ${/*data*/ ctx[3].name}`, "Etagere")
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(listedebit.$$.fragment);
    			attr_dev(div, "slot", "tables");
    			add_location(div, file$i, 77, 2, 2094);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(listedebit, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listedebit_changes = {};
    			if (dirty & /*pieces, data*/ 12) listedebit_changes.pieces = new Group(/*pieces*/ ctx[2], `Étagère ${/*data*/ ctx[3].name}`, "Etagere");
    			listedebit.$set(listedebit_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listedebit.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listedebit.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(listedebit);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_tables_slot$3.name,
    		type: "slot",
    		source: "(78:2) <div slot=\\\"tables\\\">",
    		ctx
    	});

    	return block;
    }

    // (66:0) <Component bind:data={data} path={path} state={state} on:datachange>
    function create_default_slot$3(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(66:0) <Component bind:data={data} path={path} state={state} on:datachange>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let component;
    	let updating_data;
    	let current;

    	function component_data_binding(value) {
    		/*component_data_binding*/ ctx[12].call(null, value);
    	}

    	let component_props = {
    		path: /*path*/ ctx[0],
    		state: /*state*/ ctx[4],
    		$$slots: {
    			default: [create_default_slot$3],
    			tables: [create_tables_slot$3],
    			dim: [create_dim_slot$2],
    			plan: [create_plan_slot$3]
    		},
    		$$scope: { ctx }
    	};

    	if (/*data*/ ctx[3] !== void 0) {
    		component_props.data = /*data*/ ctx[3];
    	}

    	component = new Component({ props: component_props, $$inline: true });
    	binding_callbacks.push(() => bind(component, "data", component_data_binding));
    	component.$on("datachange", /*datachange_handler*/ ctx[13]);

    	const block = {
    		c: function create() {
    			create_component(component.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(component, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const component_changes = {};
    			if (dirty & /*path*/ 1) component_changes.path = /*path*/ ctx[0];
    			if (dirty & /*state*/ 16) component_changes.state = /*state*/ ctx[4];

    			if (dirty & /*$$scope, pieces, data, ui*/ 32782) {
    				component_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_data && dirty & /*data*/ 8) {
    				updating_data = true;
    				component_changes.data = /*data*/ ctx[3];
    				add_flush_callback(() => updating_data = false);
    			}

    			component.$set(component_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(component.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(component.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(component, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let etagere;
    	let pieces;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Etagere", slots, []);
    	let { path } = $$props;
    	let { initdata = {} } = $$props;
    	let data = { ...initdata };

    	let defaults = {
    		largeur: 400,
    		profondeur: 300,
    		epaisseur: 18,
    		...initdata.defaults
    	};

    	let opt = { ...initdata.opt };
    	let ui = { ...initdata.ui || initdata.opt };
    	let state = {};
    	let zoom = 0.5;
    	const writable_props = ["path", "initdata"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Etagere> was created with unknown prop '${key}'`);
    	});

    	function inputnumber0_value_binding(value) {
    		ui.largeur = value;
    		$$invalidate(1, ui);
    	}

    	function inputnumber1_value_binding(value) {
    		ui.profondeur = value;
    		$$invalidate(1, ui);
    	}

    	function inputnumber2_value_binding(value) {
    		ui.epaisseur = value;
    		$$invalidate(1, ui);
    	}

    	function component_data_binding(value) {
    		data = value;
    		((($$invalidate(3, data), $$invalidate(7, opt)), $$invalidate(1, ui)), $$invalidate(5, defaults));
    	}

    	function datachange_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("initdata" in $$props) $$invalidate(6, initdata = $$props.initdata);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		cleanObject,
    		InputNumber,
    		InputCheckbox,
    		Component,
    		Cote,
    		Piece,
    		Group,
    		SVGPiece,
    		SVGDrawing,
    		ListeDebit,
    		path,
    		initdata,
    		data,
    		defaults,
    		opt,
    		ui,
    		state,
    		zoom,
    		etagere,
    		pieces
    	});

    	$$self.$inject_state = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("initdata" in $$props) $$invalidate(6, initdata = $$props.initdata);
    		if ("data" in $$props) $$invalidate(3, data = $$props.data);
    		if ("defaults" in $$props) $$invalidate(5, defaults = $$props.defaults);
    		if ("opt" in $$props) $$invalidate(7, opt = $$props.opt);
    		if ("ui" in $$props) $$invalidate(1, ui = $$props.ui);
    		if ("state" in $$props) $$invalidate(4, state = $$props.state);
    		if ("zoom" in $$props) zoom = $$props.zoom;
    		if ("etagere" in $$props) $$invalidate(8, etagere = $$props.etagere);
    		if ("pieces" in $$props) $$invalidate(2, pieces = $$props.pieces);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*ui*/ 2) {
    			 $$invalidate(7, opt = { ...defaults, ...cleanObject(ui) });
    		}

    		if ($$self.$$.dirty & /*opt*/ 128) {
    			 $$invalidate(3, data.opt = opt, data);
    		}

    		if ($$self.$$.dirty & /*ui*/ 2) {
    			 $$invalidate(3, data.ui = ui, data);
    		}

    		if ($$self.$$.dirty & /*opt*/ 128) {
    			 $$invalidate(8, etagere = new Piece().add_name("Étagère").build(opt.largeur, opt.profondeur, opt.epaisseur).put(0, 0, 0, "xzy").add_features("panneau-seul"));
    		}

    		if ($$self.$$.dirty & /*etagere*/ 256) {
    			 $$invalidate(2, pieces = [etagere]);
    		}

    		if ($$self.$$.dirty & /*pieces*/ 4) {
    			 $$invalidate(4, state.pieces = pieces, state);
    		}
    	};

    	return [
    		path,
    		ui,
    		pieces,
    		data,
    		state,
    		defaults,
    		initdata,
    		opt,
    		etagere,
    		inputnumber0_value_binding,
    		inputnumber1_value_binding,
    		inputnumber2_value_binding,
    		component_data_binding,
    		datachange_handler
    	];
    }

    class Etagere extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { path: 0, initdata: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Etagere",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*path*/ ctx[0] === undefined && !("path" in props)) {
    			console.warn("<Etagere> was created without expected prop 'path'");
    		}
    	}

    	get path() {
    		throw new Error("<Etagere>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Etagere>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get initdata() {
    		throw new Error("<Etagere>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set initdata(value) {
    		throw new Error("<Etagere>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ensembles/Facade.svelte generated by Svelte v3.31.2 */
    const file$j = "src/ensembles/Facade.svelte";

    // (67:2) <div slot="plan">
    function create_plan_slot$4(ctx) {
    	let div;
    	let svgdrawing;
    	let current;

    	svgdrawing = new SVGDrawing({
    			props: {
    				pieces: /*pieces*/ ctx[2],
    				name: `Façade ${/*data*/ ctx[3].name}`
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(svgdrawing.$$.fragment);
    			attr_dev(div, "slot", "plan");
    			add_location(div, file$j, 66, 2, 1481);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(svgdrawing, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const svgdrawing_changes = {};
    			if (dirty & /*pieces*/ 4) svgdrawing_changes.pieces = /*pieces*/ ctx[2];
    			if (dirty & /*data*/ 8) svgdrawing_changes.name = `Façade ${/*data*/ ctx[3].name}`;
    			svgdrawing.$set(svgdrawing_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgdrawing.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgdrawing.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(svgdrawing);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_plan_slot$4.name,
    		type: "slot",
    		source: "(67:2) <div slot=\\\"plan\\\">",
    		ctx
    	});

    	return block;
    }

    // (71:2) <div class="main" slot="dim">
    function create_dim_slot$3(ctx) {
    	let div;
    	let form;
    	let label0;
    	let span0;
    	let inputnumber0;
    	let updating_value;
    	let t1;
    	let t2;
    	let label1;
    	let span1;
    	let inputnumber1;
    	let updating_value_1;
    	let t4;
    	let t5;
    	let label2;
    	let span2;
    	let inputnumber2;
    	let updating_value_2;
    	let t7;
    	let current;

    	function inputnumber0_value_binding(value) {
    		/*inputnumber0_value_binding*/ ctx[9].call(null, value);
    	}

    	let inputnumber0_props = {
    		min: "0",
    		def: /*defaults*/ ctx[5].largeur,
    		force: /*defaults*/ ctx[5].force_largeur
    	};

    	if (/*ui*/ ctx[1].largeur !== void 0) {
    		inputnumber0_props.value = /*ui*/ ctx[1].largeur;
    	}

    	inputnumber0 = new InputNumber({
    			props: inputnumber0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber0, "value", inputnumber0_value_binding));

    	function inputnumber1_value_binding(value) {
    		/*inputnumber1_value_binding*/ ctx[10].call(null, value);
    	}

    	let inputnumber1_props = {
    		min: "0",
    		def: /*defaults*/ ctx[5].hauteur,
    		force: /*defaults*/ ctx[5].force_hauteur
    	};

    	if (/*ui*/ ctx[1].hauteur !== void 0) {
    		inputnumber1_props.value = /*ui*/ ctx[1].hauteur;
    	}

    	inputnumber1 = new InputNumber({
    			props: inputnumber1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber1, "value", inputnumber1_value_binding));

    	function inputnumber2_value_binding(value) {
    		/*inputnumber2_value_binding*/ ctx[11].call(null, value);
    	}

    	let inputnumber2_props = {
    		min: "0",
    		def: /*defaults*/ ctx[5].epaisseur,
    		force: /*defaults*/ ctx[5].force_epaisseur
    	};

    	if (/*ui*/ ctx[1].epaisseur !== void 0) {
    		inputnumber2_props.value = /*ui*/ ctx[1].epaisseur;
    	}

    	inputnumber2 = new InputNumber({
    			props: inputnumber2_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber2, "value", inputnumber2_value_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			form = element("form");
    			label0 = element("label");
    			span0 = element("span");
    			span0.textContent = "Largeur    : ";
    			create_component(inputnumber0.$$.fragment);
    			t1 = text(" mm");
    			t2 = space();
    			label1 = element("label");
    			span1 = element("span");
    			span1.textContent = "Hauteur    : ";
    			create_component(inputnumber1.$$.fragment);
    			t4 = text(" mm");
    			t5 = space();
    			label2 = element("label");
    			span2 = element("span");
    			span2.textContent = "Épaisseur  : ";
    			create_component(inputnumber2.$$.fragment);
    			t7 = text(" mm");
    			attr_dev(span0, "class", "svelte-18serza");
    			add_location(span0, file$j, 72, 11, 1627);
    			attr_dev(label0, "class", "svelte-18serza");
    			add_location(label0, file$j, 72, 4, 1620);
    			attr_dev(span1, "class", "svelte-18serza");
    			add_location(span1, file$j, 73, 11, 1774);
    			attr_dev(label1, "class", "svelte-18serza");
    			add_location(label1, file$j, 73, 4, 1767);
    			attr_dev(span2, "class", "svelte-18serza");
    			add_location(span2, file$j, 74, 11, 1921);
    			attr_dev(label2, "class", "svelte-18serza");
    			add_location(label2, file$j, 74, 4, 1914);
    			attr_dev(form, "class", "svelte-18serza");
    			add_location(form, file$j, 71, 4, 1609);
    			attr_dev(div, "class", "main");
    			attr_dev(div, "slot", "dim");
    			add_location(div, file$j, 70, 2, 1575);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, form);
    			append_dev(form, label0);
    			append_dev(label0, span0);
    			mount_component(inputnumber0, label0, null);
    			append_dev(label0, t1);
    			append_dev(form, t2);
    			append_dev(form, label1);
    			append_dev(label1, span1);
    			mount_component(inputnumber1, label1, null);
    			append_dev(label1, t4);
    			append_dev(form, t5);
    			append_dev(form, label2);
    			append_dev(label2, span2);
    			mount_component(inputnumber2, label2, null);
    			append_dev(label2, t7);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const inputnumber0_changes = {};

    			if (!updating_value && dirty & /*ui*/ 2) {
    				updating_value = true;
    				inputnumber0_changes.value = /*ui*/ ctx[1].largeur;
    				add_flush_callback(() => updating_value = false);
    			}

    			inputnumber0.$set(inputnumber0_changes);
    			const inputnumber1_changes = {};

    			if (!updating_value_1 && dirty & /*ui*/ 2) {
    				updating_value_1 = true;
    				inputnumber1_changes.value = /*ui*/ ctx[1].hauteur;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			inputnumber1.$set(inputnumber1_changes);
    			const inputnumber2_changes = {};

    			if (!updating_value_2 && dirty & /*ui*/ 2) {
    				updating_value_2 = true;
    				inputnumber2_changes.value = /*ui*/ ctx[1].epaisseur;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			inputnumber2.$set(inputnumber2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputnumber0.$$.fragment, local);
    			transition_in(inputnumber1.$$.fragment, local);
    			transition_in(inputnumber2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputnumber0.$$.fragment, local);
    			transition_out(inputnumber1.$$.fragment, local);
    			transition_out(inputnumber2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(inputnumber0);
    			destroy_component(inputnumber1);
    			destroy_component(inputnumber2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_dim_slot$3.name,
    		type: "slot",
    		source: "(71:2) <div class=\\\"main\\\" slot=\\\"dim\\\">",
    		ctx
    	});

    	return block;
    }

    // (78:2) <div slot="tables">
    function create_tables_slot$4(ctx) {
    	let div;
    	let listedebit;
    	let current;

    	listedebit = new ListeDebit({
    			props: {
    				pieces: new Group(/*pieces*/ ctx[2], `Façade ${/*data*/ ctx[3].name}`, "Facade")
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(listedebit.$$.fragment);
    			attr_dev(div, "slot", "tables");
    			add_location(div, file$j, 77, 2, 2075);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(listedebit, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listedebit_changes = {};
    			if (dirty & /*pieces, data*/ 12) listedebit_changes.pieces = new Group(/*pieces*/ ctx[2], `Façade ${/*data*/ ctx[3].name}`, "Facade");
    			listedebit.$set(listedebit_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listedebit.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listedebit.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(listedebit);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_tables_slot$4.name,
    		type: "slot",
    		source: "(78:2) <div slot=\\\"tables\\\">",
    		ctx
    	});

    	return block;
    }

    // (66:0) <Component bind:data={data} path={path} state={state} on:datachange>
    function create_default_slot$4(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(66:0) <Component bind:data={data} path={path} state={state} on:datachange>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let component;
    	let updating_data;
    	let current;

    	function component_data_binding(value) {
    		/*component_data_binding*/ ctx[12].call(null, value);
    	}

    	let component_props = {
    		path: /*path*/ ctx[0],
    		state: /*state*/ ctx[4],
    		$$slots: {
    			default: [create_default_slot$4],
    			tables: [create_tables_slot$4],
    			dim: [create_dim_slot$3],
    			plan: [create_plan_slot$4]
    		},
    		$$scope: { ctx }
    	};

    	if (/*data*/ ctx[3] !== void 0) {
    		component_props.data = /*data*/ ctx[3];
    	}

    	component = new Component({ props: component_props, $$inline: true });
    	binding_callbacks.push(() => bind(component, "data", component_data_binding));
    	component.$on("datachange", /*datachange_handler*/ ctx[13]);

    	const block = {
    		c: function create() {
    			create_component(component.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(component, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const component_changes = {};
    			if (dirty & /*path*/ 1) component_changes.path = /*path*/ ctx[0];
    			if (dirty & /*state*/ 16) component_changes.state = /*state*/ ctx[4];

    			if (dirty & /*$$scope, pieces, data, ui*/ 32782) {
    				component_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_data && dirty & /*data*/ 8) {
    				updating_data = true;
    				component_changes.data = /*data*/ ctx[3];
    				add_flush_callback(() => updating_data = false);
    			}

    			component.$set(component_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(component.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(component.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(component, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let facade;
    	let pieces;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Facade", slots, []);
    	let { path } = $$props;
    	let { initdata = {} } = $$props;
    	let data = { ...initdata };
    	let state = {};

    	let defaults = {
    		largeur: 400,
    		hauteur: 150,
    		epaisseur: 18,
    		...initdata.defaults
    	};

    	let opt = { ...initdata.opt };
    	let ui = { ...initdata.ui || initdata.opt };
    	let zoom = 0.5;
    	const writable_props = ["path", "initdata"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Facade> was created with unknown prop '${key}'`);
    	});

    	function inputnumber0_value_binding(value) {
    		ui.largeur = value;
    		$$invalidate(1, ui);
    	}

    	function inputnumber1_value_binding(value) {
    		ui.hauteur = value;
    		$$invalidate(1, ui);
    	}

    	function inputnumber2_value_binding(value) {
    		ui.epaisseur = value;
    		$$invalidate(1, ui);
    	}

    	function component_data_binding(value) {
    		data = value;
    		((($$invalidate(3, data), $$invalidate(7, opt)), $$invalidate(1, ui)), $$invalidate(5, defaults));
    	}

    	function datachange_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("initdata" in $$props) $$invalidate(6, initdata = $$props.initdata);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		cleanObject,
    		InputNumber,
    		InputCheckbox,
    		Component,
    		Cote,
    		Piece,
    		Group,
    		SVGPiece,
    		SVGDrawing,
    		ListeDebit,
    		path,
    		initdata,
    		data,
    		state,
    		defaults,
    		opt,
    		ui,
    		zoom,
    		facade,
    		pieces
    	});

    	$$self.$inject_state = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("initdata" in $$props) $$invalidate(6, initdata = $$props.initdata);
    		if ("data" in $$props) $$invalidate(3, data = $$props.data);
    		if ("state" in $$props) $$invalidate(4, state = $$props.state);
    		if ("defaults" in $$props) $$invalidate(5, defaults = $$props.defaults);
    		if ("opt" in $$props) $$invalidate(7, opt = $$props.opt);
    		if ("ui" in $$props) $$invalidate(1, ui = $$props.ui);
    		if ("zoom" in $$props) zoom = $$props.zoom;
    		if ("facade" in $$props) $$invalidate(8, facade = $$props.facade);
    		if ("pieces" in $$props) $$invalidate(2, pieces = $$props.pieces);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*ui*/ 2) {
    			 $$invalidate(7, opt = { ...defaults, ...cleanObject(ui) });
    		}

    		if ($$self.$$.dirty & /*opt*/ 128) {
    			 $$invalidate(3, data.opt = opt, data);
    		}

    		if ($$self.$$.dirty & /*ui*/ 2) {
    			 $$invalidate(3, data.ui = ui, data);
    		}

    		if ($$self.$$.dirty & /*opt*/ 128) {
    			 $$invalidate(8, facade = new Piece().add_name("Façade").build(opt.largeur, opt.hauteur, opt.epaisseur).put(0, 0, 0, "xyz").add_features("panneau-seul"));
    		}

    		if ($$self.$$.dirty & /*facade*/ 256) {
    			 $$invalidate(2, pieces = [facade]);
    		}

    		if ($$self.$$.dirty & /*pieces*/ 4) {
    			 $$invalidate(4, state.pieces = pieces, state);
    		}
    	};

    	return [
    		path,
    		ui,
    		pieces,
    		data,
    		state,
    		defaults,
    		initdata,
    		opt,
    		facade,
    		inputnumber0_value_binding,
    		inputnumber1_value_binding,
    		inputnumber2_value_binding,
    		component_data_binding,
    		datachange_handler
    	];
    }

    class Facade extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { path: 0, initdata: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Facade",
    			options,
    			id: create_fragment$j.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*path*/ ctx[0] === undefined && !("path" in props)) {
    			console.warn("<Facade> was created without expected prop 'path'");
    		}
    	}

    	get path() {
    		throw new Error("<Facade>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Facade>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get initdata() {
    		throw new Error("<Facade>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set initdata(value) {
    		throw new Error("<Facade>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ensembles/Tiroir.svelte generated by Svelte v3.31.2 */
    const file$k = "src/ensembles/Tiroir.svelte";

    // (141:2) <div slot="plan">
    function create_plan_slot$5(ctx) {
    	let div;
    	let svgdrawing;
    	let current;

    	svgdrawing = new SVGDrawing({
    			props: { pieces: /*pieces_group*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(svgdrawing.$$.fragment);
    			attr_dev(div, "slot", "plan");
    			add_location(div, file$k, 140, 2, 3609);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(svgdrawing, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const svgdrawing_changes = {};
    			if (dirty[0] & /*pieces_group*/ 16) svgdrawing_changes.pieces = /*pieces_group*/ ctx[4];
    			svgdrawing.$set(svgdrawing_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgdrawing.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgdrawing.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(svgdrawing);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_plan_slot$5.name,
    		type: "slot",
    		source: "(141:2) <div slot=\\\"plan\\\">",
    		ctx
    	});

    	return block;
    }

    // (145:2) <div class="main" slot="dim">
    function create_dim_slot$4(ctx) {
    	let div;
    	let form;
    	let label0;
    	let span0;
    	let inputnumber0;
    	let updating_value;
    	let t1;
    	let hr0;
    	let t2;
    	let label1;
    	let span1;
    	let inputnumber1;
    	let updating_value_1;
    	let t4;
    	let t5;
    	let label2;
    	let span2;
    	let inputnumber2;
    	let updating_value_2;
    	let t7;
    	let t8;
    	let label3;
    	let span3;
    	let inputnumber3;
    	let updating_value_3;
    	let t10;
    	let t11;
    	let hr1;
    	let t12;
    	let label4;
    	let span4;
    	let inputnumber4;
    	let updating_value_4;
    	let t14;
    	let t15;
    	let label5;
    	let span5;
    	let inputnumber5;
    	let updating_value_5;
    	let t17;
    	let t18;
    	let label6;
    	let span6;
    	let inputnumber6;
    	let updating_value_6;
    	let t20;
    	let t21;
    	let label7;
    	let span7;
    	let inputnumber7;
    	let updating_value_7;
    	let t23;
    	let t24;
    	let hr2;
    	let t25;
    	let label8;
    	let span8;
    	let inputnumber8;
    	let updating_value_8;
    	let t27;
    	let t28;
    	let label9;
    	let span9;
    	let inputnumber9;
    	let updating_value_9;
    	let t30;
    	let t31;
    	let label10;
    	let span10;
    	let inputnumber10;
    	let updating_value_10;
    	let t33;
    	let t34;
    	let label11;
    	let span11;
    	let inputnumber11;
    	let updating_value_11;
    	let t36;
    	let t37;
    	let label12;
    	let span12;
    	let inputnumber12;
    	let updating_value_12;
    	let t39;
    	let t40;
    	let label13;
    	let span13;
    	let inputcheckbox;
    	let updating_checked;
    	let current;

    	function inputnumber0_value_binding(value) {
    		/*inputnumber0_value_binding*/ ctx[17].call(null, value);
    	}

    	let inputnumber0_props = {
    		min: "1",
    		def: /*defaults*/ ctx[6].quantite
    	};

    	if (/*ui*/ ctx[2].quantite !== void 0) {
    		inputnumber0_props.value = /*ui*/ ctx[2].quantite;
    	}

    	inputnumber0 = new InputNumber({
    			props: inputnumber0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber0, "value", inputnumber0_value_binding));

    	function inputnumber1_value_binding(value) {
    		/*inputnumber1_value_binding*/ ctx[18].call(null, value);
    	}

    	let inputnumber1_props = {
    		min: "0",
    		def: /*defaults*/ ctx[6].largeur,
    		force: /*defaults*/ ctx[6].force_largeur
    	};

    	if (/*ui*/ ctx[2].largeur !== void 0) {
    		inputnumber1_props.value = /*ui*/ ctx[2].largeur;
    	}

    	inputnumber1 = new InputNumber({
    			props: inputnumber1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber1, "value", inputnumber1_value_binding));

    	function inputnumber2_value_binding(value) {
    		/*inputnumber2_value_binding*/ ctx[19].call(null, value);
    	}

    	let inputnumber2_props = {
    		min: "0",
    		def: /*defaults*/ ctx[6].hauteur,
    		force: /*defaults*/ ctx[6].force_hauteur
    	};

    	if (/*ui*/ ctx[2].hauteur !== void 0) {
    		inputnumber2_props.value = /*ui*/ ctx[2].hauteur;
    	}

    	inputnumber2 = new InputNumber({
    			props: inputnumber2_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber2, "value", inputnumber2_value_binding));

    	function inputnumber3_value_binding(value) {
    		/*inputnumber3_value_binding*/ ctx[20].call(null, value);
    	}

    	let inputnumber3_props = {
    		min: "0",
    		def: /*defaults*/ ctx[6].profondeur,
    		force: /*defaults*/ ctx[6].force_profondeur
    	};

    	if (/*ui*/ ctx[2].profondeur !== void 0) {
    		inputnumber3_props.value = /*ui*/ ctx[2].profondeur;
    	}

    	inputnumber3 = new InputNumber({
    			props: inputnumber3_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber3, "value", inputnumber3_value_binding));

    	function inputnumber4_value_binding(value) {
    		/*inputnumber4_value_binding*/ ctx[21].call(null, value);
    	}

    	let inputnumber4_props = {
    		min: "0",
    		def: /*tir*/ ctx[3].largeur_tir
    	};

    	if (/*ui*/ ctx[2].largeur_tir !== void 0) {
    		inputnumber4_props.value = /*ui*/ ctx[2].largeur_tir;
    	}

    	inputnumber4 = new InputNumber({
    			props: inputnumber4_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber4, "value", inputnumber4_value_binding));

    	function inputnumber5_value_binding(value) {
    		/*inputnumber5_value_binding*/ ctx[22].call(null, value);
    	}

    	let inputnumber5_props = {
    		min: "0",
    		def: /*tir*/ ctx[3].profondeur_tir
    	};

    	if (/*ui*/ ctx[2].profondeur_tir !== void 0) {
    		inputnumber5_props.value = /*ui*/ ctx[2].profondeur_tir;
    	}

    	inputnumber5 = new InputNumber({
    			props: inputnumber5_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber5, "value", inputnumber5_value_binding));

    	function inputnumber6_value_binding(value) {
    		/*inputnumber6_value_binding*/ ctx[23].call(null, value);
    	}

    	let inputnumber6_props = {
    		min: "0",
    		def: /*tir*/ ctx[3].hauteur_tir
    	};

    	if (/*ui*/ ctx[2].hauteur_tir !== void 0) {
    		inputnumber6_props.value = /*ui*/ ctx[2].hauteur_tir;
    	}

    	inputnumber6 = new InputNumber({
    			props: inputnumber6_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber6, "value", inputnumber6_value_binding));

    	function inputnumber7_value_binding(value) {
    		/*inputnumber7_value_binding*/ ctx[24].call(null, value);
    	}

    	let inputnumber7_props = {
    		min: "0",
    		def: /*defaults*/ ctx[6].hauteur_tir_max
    	};

    	if (/*ui*/ ctx[2].hauteur_tir_max !== void 0) {
    		inputnumber7_props.value = /*ui*/ ctx[2].hauteur_tir_max;
    	}

    	inputnumber7 = new InputNumber({
    			props: inputnumber7_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber7, "value", inputnumber7_value_binding));

    	function inputnumber8_value_binding(value) {
    		/*inputnumber8_value_binding*/ ctx[25].call(null, value);
    	}

    	let inputnumber8_props = {
    		min: "0",
    		def: /*defaults*/ ctx[6].profondeur_queues_arrondes
    	};

    	if (/*ui*/ ctx[2].profondeur_queues_arrondes !== void 0) {
    		inputnumber8_props.value = /*ui*/ ctx[2].profondeur_queues_arrondes;
    	}

    	inputnumber8 = new InputNumber({
    			props: inputnumber8_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber8, "value", inputnumber8_value_binding));

    	function inputnumber9_value_binding(value) {
    		/*inputnumber9_value_binding*/ ctx[26].call(null, value);
    	}

    	let inputnumber9_props = {
    		min: "0",
    		def: /*defaults*/ ctx[6].epaisseur,
    		force: /*defaults*/ ctx[6].force_epaisseur
    	};

    	if (/*ui*/ ctx[2].epaisseur !== void 0) {
    		inputnumber9_props.value = /*ui*/ ctx[2].epaisseur;
    	}

    	inputnumber9 = new InputNumber({
    			props: inputnumber9_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber9, "value", inputnumber9_value_binding));

    	function inputnumber10_value_binding(value) {
    		/*inputnumber10_value_binding*/ ctx[27].call(null, value);
    	}

    	let inputnumber10_props = {
    		min: "0",
    		def: /*defaults*/ ctx[6].epaisseur_fond
    	};

    	if (/*ui*/ ctx[2].epaisseur_fond !== void 0) {
    		inputnumber10_props.value = /*ui*/ ctx[2].epaisseur_fond;
    	}

    	inputnumber10 = new InputNumber({
    			props: inputnumber10_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber10, "value", inputnumber10_value_binding));

    	function inputnumber11_value_binding(value) {
    		/*inputnumber11_value_binding*/ ctx[28].call(null, value);
    	}

    	let inputnumber11_props = {
    		min: "0",
    		def: /*defaults*/ ctx[6].profondeur_rainure
    	};

    	if (/*ui*/ ctx[2].profondeur_rainure !== void 0) {
    		inputnumber11_props.value = /*ui*/ ctx[2].profondeur_rainure;
    	}

    	inputnumber11 = new InputNumber({
    			props: inputnumber11_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber11, "value", inputnumber11_value_binding));

    	function inputnumber12_value_binding(value) {
    		/*inputnumber12_value_binding*/ ctx[29].call(null, value);
    	}

    	let inputnumber12_props = {
    		min: "0",
    		def: /*defaults*/ ctx[6].jeu_rainure
    	};

    	if (/*ui*/ ctx[2].jeu_rainure !== void 0) {
    		inputnumber12_props.value = /*ui*/ ctx[2].jeu_rainure;
    	}

    	inputnumber12 = new InputNumber({
    			props: inputnumber12_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputnumber12, "value", inputnumber12_value_binding));

    	function inputcheckbox_checked_binding(value) {
    		/*inputcheckbox_checked_binding*/ ctx[30].call(null, value);
    	}

    	let inputcheckbox_props = { def: /*defaults*/ ctx[6].inclure_fond };

    	if (/*ui*/ ctx[2].inclure_fond !== void 0) {
    		inputcheckbox_props.checked = /*ui*/ ctx[2].inclure_fond;
    	}

    	inputcheckbox = new InputCheckbox({
    			props: inputcheckbox_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inputcheckbox, "checked", inputcheckbox_checked_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			form = element("form");
    			label0 = element("label");
    			span0 = element("span");
    			span0.textContent = "Quantité : ";
    			create_component(inputnumber0.$$.fragment);
    			t1 = space();
    			hr0 = element("hr");
    			t2 = space();
    			label1 = element("label");
    			span1 = element("span");
    			span1.textContent = "Largeur logement   : ";
    			create_component(inputnumber1.$$.fragment);
    			t4 = text(" mm");
    			t5 = space();
    			label2 = element("label");
    			span2 = element("span");
    			span2.textContent = "Hauteur logement  : ";
    			create_component(inputnumber2.$$.fragment);
    			t7 = text(" mm");
    			t8 = space();
    			label3 = element("label");
    			span3 = element("span");
    			span3.textContent = "Profondeur logement : ";
    			create_component(inputnumber3.$$.fragment);
    			t10 = text(" mm");
    			t11 = space();
    			hr1 = element("hr");
    			t12 = space();
    			label4 = element("label");
    			span4 = element("span");
    			span4.textContent = "Largeur   : ";
    			create_component(inputnumber4.$$.fragment);
    			t14 = text(" mm");
    			t15 = space();
    			label5 = element("label");
    			span5 = element("span");
    			span5.textContent = "Profondeur : ";
    			create_component(inputnumber5.$$.fragment);
    			t17 = text(" mm");
    			t18 = space();
    			label6 = element("label");
    			span6 = element("span");
    			span6.textContent = "Hauteur   : ";
    			create_component(inputnumber6.$$.fragment);
    			t20 = text(" mm");
    			t21 = space();
    			label7 = element("label");
    			span7 = element("span");
    			span7.textContent = "Hauteur max : ";
    			create_component(inputnumber7.$$.fragment);
    			t23 = text(" mm");
    			t24 = space();
    			hr2 = element("hr");
    			t25 = space();
    			label8 = element("label");
    			span8 = element("span");
    			span8.textContent = "Profondeur queues d'arrondes : ";
    			create_component(inputnumber8.$$.fragment);
    			t27 = text(" mm");
    			t28 = space();
    			label9 = element("label");
    			span9 = element("span");
    			span9.textContent = "Épaisseur : ";
    			create_component(inputnumber9.$$.fragment);
    			t30 = text(" mm");
    			t31 = space();
    			label10 = element("label");
    			span10 = element("span");
    			span10.textContent = "Épaisseur fond : ";
    			create_component(inputnumber10.$$.fragment);
    			t33 = text(" mm");
    			t34 = space();
    			label11 = element("label");
    			span11 = element("span");
    			span11.textContent = "Profondeur rainures : ";
    			create_component(inputnumber11.$$.fragment);
    			t36 = text(" mm");
    			t37 = space();
    			label12 = element("label");
    			span12 = element("span");
    			span12.textContent = "Jeu paneau / rainure : ";
    			create_component(inputnumber12.$$.fragment);
    			t39 = text(" mm");
    			t40 = space();
    			label13 = element("label");
    			span13 = element("span");
    			span13.textContent = "Inclure le fond";
    			create_component(inputcheckbox.$$.fragment);
    			attr_dev(span0, "class", "svelte-1e9ss2o");
    			add_location(span0, file$k, 146, 11, 3732);
    			attr_dev(label0, "class", "svelte-1e9ss2o");
    			add_location(label0, file$k, 146, 4, 3725);
    			attr_dev(hr0, "class", "svelte-1e9ss2o");
    			add_location(hr0, file$k, 147, 4, 3838);
    			attr_dev(span1, "class", "svelte-1e9ss2o");
    			add_location(span1, file$k, 148, 11, 3855);
    			attr_dev(label1, "class", "svelte-1e9ss2o");
    			add_location(label1, file$k, 148, 4, 3848);
    			attr_dev(span2, "class", "svelte-1e9ss2o");
    			add_location(span2, file$k, 149, 11, 4010);
    			attr_dev(label2, "class", "svelte-1e9ss2o");
    			add_location(label2, file$k, 149, 4, 4003);
    			attr_dev(span3, "class", "svelte-1e9ss2o");
    			add_location(span3, file$k, 150, 11, 4164);
    			attr_dev(label3, "class", "svelte-1e9ss2o");
    			add_location(label3, file$k, 150, 4, 4157);
    			attr_dev(hr1, "class", "svelte-1e9ss2o");
    			add_location(hr1, file$k, 151, 4, 4322);
    			attr_dev(span4, "class", "svelte-1e9ss2o");
    			add_location(span4, file$k, 152, 11, 4339);
    			attr_dev(label4, "class", "svelte-1e9ss2o");
    			add_location(label4, file$k, 152, 4, 4332);
    			attr_dev(span5, "class", "svelte-1e9ss2o");
    			add_location(span5, file$k, 153, 11, 4457);
    			attr_dev(label5, "class", "svelte-1e9ss2o");
    			add_location(label5, file$k, 153, 4, 4450);
    			attr_dev(span6, "class", "svelte-1e9ss2o");
    			add_location(span6, file$k, 154, 11, 4582);
    			attr_dev(label6, "class", "svelte-1e9ss2o");
    			add_location(label6, file$k, 154, 4, 4575);
    			attr_dev(span7, "class", "svelte-1e9ss2o");
    			add_location(span7, file$k, 155, 11, 4700);
    			attr_dev(label7, "class", "svelte-1e9ss2o");
    			add_location(label7, file$k, 155, 4, 4693);
    			attr_dev(hr2, "class", "svelte-1e9ss2o");
    			add_location(hr2, file$k, 156, 4, 4826);
    			attr_dev(span8, "class", "svelte-1e9ss2o");
    			add_location(span8, file$k, 157, 11, 4843);
    			attr_dev(label8, "class", "svelte-1e9ss2o");
    			add_location(label8, file$k, 157, 4, 4836);
    			attr_dev(span9, "class", "svelte-1e9ss2o");
    			add_location(span9, file$k, 158, 11, 5015);
    			attr_dev(label9, "class", "svelte-1e9ss2o");
    			add_location(label9, file$k, 158, 4, 5008);
    			attr_dev(span10, "class", "svelte-1e9ss2o");
    			add_location(span10, file$k, 159, 11, 5167);
    			attr_dev(label10, "class", "svelte-1e9ss2o");
    			add_location(label10, file$k, 159, 4, 5160);
    			attr_dev(span11, "class", "svelte-1e9ss2o");
    			add_location(span11, file$k, 160, 11, 5301);
    			attr_dev(label11, "class", "svelte-1e9ss2o");
    			add_location(label11, file$k, 160, 4, 5294);
    			attr_dev(span12, "class", "svelte-1e9ss2o");
    			add_location(span12, file$k, 161, 11, 5448);
    			attr_dev(label12, "class", "svelte-1e9ss2o");
    			add_location(label12, file$k, 161, 4, 5441);
    			attr_dev(span13, "class", "svelte-1e9ss2o");
    			add_location(span13, file$k, 162, 11, 5582);
    			attr_dev(label13, "class", "svelte-1e9ss2o");
    			add_location(label13, file$k, 162, 4, 5575);
    			attr_dev(form, "class", "svelte-1e9ss2o");
    			add_location(form, file$k, 145, 4, 3714);
    			attr_dev(div, "class", "main");
    			attr_dev(div, "slot", "dim");
    			add_location(div, file$k, 144, 2, 3680);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, form);
    			append_dev(form, label0);
    			append_dev(label0, span0);
    			mount_component(inputnumber0, label0, null);
    			append_dev(form, t1);
    			append_dev(form, hr0);
    			append_dev(form, t2);
    			append_dev(form, label1);
    			append_dev(label1, span1);
    			mount_component(inputnumber1, label1, null);
    			append_dev(label1, t4);
    			append_dev(form, t5);
    			append_dev(form, label2);
    			append_dev(label2, span2);
    			mount_component(inputnumber2, label2, null);
    			append_dev(label2, t7);
    			append_dev(form, t8);
    			append_dev(form, label3);
    			append_dev(label3, span3);
    			mount_component(inputnumber3, label3, null);
    			append_dev(label3, t10);
    			append_dev(form, t11);
    			append_dev(form, hr1);
    			append_dev(form, t12);
    			append_dev(form, label4);
    			append_dev(label4, span4);
    			mount_component(inputnumber4, label4, null);
    			append_dev(label4, t14);
    			append_dev(form, t15);
    			append_dev(form, label5);
    			append_dev(label5, span5);
    			mount_component(inputnumber5, label5, null);
    			append_dev(label5, t17);
    			append_dev(form, t18);
    			append_dev(form, label6);
    			append_dev(label6, span6);
    			mount_component(inputnumber6, label6, null);
    			append_dev(label6, t20);
    			append_dev(form, t21);
    			append_dev(form, label7);
    			append_dev(label7, span7);
    			mount_component(inputnumber7, label7, null);
    			append_dev(label7, t23);
    			append_dev(form, t24);
    			append_dev(form, hr2);
    			append_dev(form, t25);
    			append_dev(form, label8);
    			append_dev(label8, span8);
    			mount_component(inputnumber8, label8, null);
    			append_dev(label8, t27);
    			append_dev(form, t28);
    			append_dev(form, label9);
    			append_dev(label9, span9);
    			mount_component(inputnumber9, label9, null);
    			append_dev(label9, t30);
    			append_dev(form, t31);
    			append_dev(form, label10);
    			append_dev(label10, span10);
    			mount_component(inputnumber10, label10, null);
    			append_dev(label10, t33);
    			append_dev(form, t34);
    			append_dev(form, label11);
    			append_dev(label11, span11);
    			mount_component(inputnumber11, label11, null);
    			append_dev(label11, t36);
    			append_dev(form, t37);
    			append_dev(form, label12);
    			append_dev(label12, span12);
    			mount_component(inputnumber12, label12, null);
    			append_dev(label12, t39);
    			append_dev(form, t40);
    			append_dev(form, label13);
    			append_dev(label13, span13);
    			mount_component(inputcheckbox, label13, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const inputnumber0_changes = {};

    			if (!updating_value && dirty[0] & /*ui*/ 4) {
    				updating_value = true;
    				inputnumber0_changes.value = /*ui*/ ctx[2].quantite;
    				add_flush_callback(() => updating_value = false);
    			}

    			inputnumber0.$set(inputnumber0_changes);
    			const inputnumber1_changes = {};

    			if (!updating_value_1 && dirty[0] & /*ui*/ 4) {
    				updating_value_1 = true;
    				inputnumber1_changes.value = /*ui*/ ctx[2].largeur;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			inputnumber1.$set(inputnumber1_changes);
    			const inputnumber2_changes = {};

    			if (!updating_value_2 && dirty[0] & /*ui*/ 4) {
    				updating_value_2 = true;
    				inputnumber2_changes.value = /*ui*/ ctx[2].hauteur;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			inputnumber2.$set(inputnumber2_changes);
    			const inputnumber3_changes = {};

    			if (!updating_value_3 && dirty[0] & /*ui*/ 4) {
    				updating_value_3 = true;
    				inputnumber3_changes.value = /*ui*/ ctx[2].profondeur;
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			inputnumber3.$set(inputnumber3_changes);
    			const inputnumber4_changes = {};
    			if (dirty[0] & /*tir*/ 8) inputnumber4_changes.def = /*tir*/ ctx[3].largeur_tir;

    			if (!updating_value_4 && dirty[0] & /*ui*/ 4) {
    				updating_value_4 = true;
    				inputnumber4_changes.value = /*ui*/ ctx[2].largeur_tir;
    				add_flush_callback(() => updating_value_4 = false);
    			}

    			inputnumber4.$set(inputnumber4_changes);
    			const inputnumber5_changes = {};
    			if (dirty[0] & /*tir*/ 8) inputnumber5_changes.def = /*tir*/ ctx[3].profondeur_tir;

    			if (!updating_value_5 && dirty[0] & /*ui*/ 4) {
    				updating_value_5 = true;
    				inputnumber5_changes.value = /*ui*/ ctx[2].profondeur_tir;
    				add_flush_callback(() => updating_value_5 = false);
    			}

    			inputnumber5.$set(inputnumber5_changes);
    			const inputnumber6_changes = {};
    			if (dirty[0] & /*tir*/ 8) inputnumber6_changes.def = /*tir*/ ctx[3].hauteur_tir;

    			if (!updating_value_6 && dirty[0] & /*ui*/ 4) {
    				updating_value_6 = true;
    				inputnumber6_changes.value = /*ui*/ ctx[2].hauteur_tir;
    				add_flush_callback(() => updating_value_6 = false);
    			}

    			inputnumber6.$set(inputnumber6_changes);
    			const inputnumber7_changes = {};

    			if (!updating_value_7 && dirty[0] & /*ui*/ 4) {
    				updating_value_7 = true;
    				inputnumber7_changes.value = /*ui*/ ctx[2].hauteur_tir_max;
    				add_flush_callback(() => updating_value_7 = false);
    			}

    			inputnumber7.$set(inputnumber7_changes);
    			const inputnumber8_changes = {};

    			if (!updating_value_8 && dirty[0] & /*ui*/ 4) {
    				updating_value_8 = true;
    				inputnumber8_changes.value = /*ui*/ ctx[2].profondeur_queues_arrondes;
    				add_flush_callback(() => updating_value_8 = false);
    			}

    			inputnumber8.$set(inputnumber8_changes);
    			const inputnumber9_changes = {};

    			if (!updating_value_9 && dirty[0] & /*ui*/ 4) {
    				updating_value_9 = true;
    				inputnumber9_changes.value = /*ui*/ ctx[2].epaisseur;
    				add_flush_callback(() => updating_value_9 = false);
    			}

    			inputnumber9.$set(inputnumber9_changes);
    			const inputnumber10_changes = {};

    			if (!updating_value_10 && dirty[0] & /*ui*/ 4) {
    				updating_value_10 = true;
    				inputnumber10_changes.value = /*ui*/ ctx[2].epaisseur_fond;
    				add_flush_callback(() => updating_value_10 = false);
    			}

    			inputnumber10.$set(inputnumber10_changes);
    			const inputnumber11_changes = {};

    			if (!updating_value_11 && dirty[0] & /*ui*/ 4) {
    				updating_value_11 = true;
    				inputnumber11_changes.value = /*ui*/ ctx[2].profondeur_rainure;
    				add_flush_callback(() => updating_value_11 = false);
    			}

    			inputnumber11.$set(inputnumber11_changes);
    			const inputnumber12_changes = {};

    			if (!updating_value_12 && dirty[0] & /*ui*/ 4) {
    				updating_value_12 = true;
    				inputnumber12_changes.value = /*ui*/ ctx[2].jeu_rainure;
    				add_flush_callback(() => updating_value_12 = false);
    			}

    			inputnumber12.$set(inputnumber12_changes);
    			const inputcheckbox_changes = {};

    			if (!updating_checked && dirty[0] & /*ui*/ 4) {
    				updating_checked = true;
    				inputcheckbox_changes.checked = /*ui*/ ctx[2].inclure_fond;
    				add_flush_callback(() => updating_checked = false);
    			}

    			inputcheckbox.$set(inputcheckbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputnumber0.$$.fragment, local);
    			transition_in(inputnumber1.$$.fragment, local);
    			transition_in(inputnumber2.$$.fragment, local);
    			transition_in(inputnumber3.$$.fragment, local);
    			transition_in(inputnumber4.$$.fragment, local);
    			transition_in(inputnumber5.$$.fragment, local);
    			transition_in(inputnumber6.$$.fragment, local);
    			transition_in(inputnumber7.$$.fragment, local);
    			transition_in(inputnumber8.$$.fragment, local);
    			transition_in(inputnumber9.$$.fragment, local);
    			transition_in(inputnumber10.$$.fragment, local);
    			transition_in(inputnumber11.$$.fragment, local);
    			transition_in(inputnumber12.$$.fragment, local);
    			transition_in(inputcheckbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputnumber0.$$.fragment, local);
    			transition_out(inputnumber1.$$.fragment, local);
    			transition_out(inputnumber2.$$.fragment, local);
    			transition_out(inputnumber3.$$.fragment, local);
    			transition_out(inputnumber4.$$.fragment, local);
    			transition_out(inputnumber5.$$.fragment, local);
    			transition_out(inputnumber6.$$.fragment, local);
    			transition_out(inputnumber7.$$.fragment, local);
    			transition_out(inputnumber8.$$.fragment, local);
    			transition_out(inputnumber9.$$.fragment, local);
    			transition_out(inputnumber10.$$.fragment, local);
    			transition_out(inputnumber11.$$.fragment, local);
    			transition_out(inputnumber12.$$.fragment, local);
    			transition_out(inputcheckbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(inputnumber0);
    			destroy_component(inputnumber1);
    			destroy_component(inputnumber2);
    			destroy_component(inputnumber3);
    			destroy_component(inputnumber4);
    			destroy_component(inputnumber5);
    			destroy_component(inputnumber6);
    			destroy_component(inputnumber7);
    			destroy_component(inputnumber8);
    			destroy_component(inputnumber9);
    			destroy_component(inputnumber10);
    			destroy_component(inputnumber11);
    			destroy_component(inputnumber12);
    			destroy_component(inputcheckbox);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_dim_slot$4.name,
    		type: "slot",
    		source: "(145:2) <div class=\\\"main\\\" slot=\\\"dim\\\">",
    		ctx
    	});

    	return block;
    }

    // (167:2) <div slot="tables">
    function create_tables_slot$5(ctx) {
    	let div;
    	let listedebit;
    	let current;

    	listedebit = new ListeDebit({
    			props: { pieces: /*pieces_group*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(listedebit.$$.fragment);
    			attr_dev(div, "slot", "tables");
    			add_location(div, file$k, 166, 2, 5719);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(listedebit, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listedebit_changes = {};
    			if (dirty[0] & /*pieces_group*/ 16) listedebit_changes.pieces = /*pieces_group*/ ctx[4];
    			listedebit.$set(listedebit_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listedebit.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listedebit.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(listedebit);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_tables_slot$5.name,
    		type: "slot",
    		source: "(167:2) <div slot=\\\"tables\\\">",
    		ctx
    	});

    	return block;
    }

    // (140:0) <Component bind:data={data} state={state} path={path} on:datachange>
    function create_default_slot$5(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(140:0) <Component bind:data={data} state={state} path={path} on:datachange>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let component;
    	let updating_data;
    	let current;

    	function component_data_binding(value) {
    		/*component_data_binding*/ ctx[31].call(null, value);
    	}

    	let component_props = {
    		state: /*state*/ ctx[5],
    		path: /*path*/ ctx[0],
    		$$slots: {
    			default: [create_default_slot$5],
    			tables: [create_tables_slot$5],
    			dim: [create_dim_slot$4],
    			plan: [create_plan_slot$5]
    		},
    		$$scope: { ctx }
    	};

    	if (/*data*/ ctx[1] !== void 0) {
    		component_props.data = /*data*/ ctx[1];
    	}

    	component = new Component({ props: component_props, $$inline: true });
    	binding_callbacks.push(() => bind(component, "data", component_data_binding));
    	component.$on("datachange", /*datachange_handler*/ ctx[32]);

    	const block = {
    		c: function create() {
    			create_component(component.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(component, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const component_changes = {};
    			if (dirty[0] & /*state*/ 32) component_changes.state = /*state*/ ctx[5];
    			if (dirty[0] & /*path*/ 1) component_changes.path = /*path*/ ctx[0];

    			if (dirty[0] & /*pieces_group, ui, tir*/ 28 | dirty[1] & /*$$scope*/ 8) {
    				component_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_data && dirty[0] & /*data*/ 2) {
    				updating_data = true;
    				component_changes.data = /*data*/ ctx[1];
    				add_flush_callback(() => updating_data = false);
    			}

    			component.$set(component_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(component.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(component.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(component, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let cote;
    	let cote_g;
    	let cote_d;
    	let face;
    	let face_av;
    	let face_ar;
    	let fond;
    	let pieces;
    	let pieces_group;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tiroir", slots, []);
    	let { path } = $$props;
    	let { initdata = {} } = $$props;
    	let data = { ...initdata };

    	let defaults = {
    		quantite: 1,
    		largeur: 400,
    		hauteur: 150,
    		hauteur_tir_max: 150,
    		profondeur: 500,
    		epaisseur: 15,
    		profondeur_rainure: 9,
    		profondeur_queues_arrondes: 10,
    		jeu_rainure: 1,
    		jeu_lateral: 6,
    		jeu_dessous: 28,
    		jeu_dessus: 7,
    		epaisseur_fond: 10,
    		inclure_fond: true,
    		...initdata.defaults
    	};

    	let opt = { ...initdata.opt };
    	let ui = { ...initdata.ui || initdata.opt };
    	let tir = {};
    	let state = {};

    	function calculTiroir(opt) {
    		let largeur_tir = opt.largeur - 2 * opt.jeu_lateral;
    		let profondeur_tir = opt.profondeur - opt.profondeur % 50;
    		let hauteur_tir = Math.min(opt.hauteur_tir_max, opt.hauteur - opt.jeu_dessous - opt.jeu_dessus);
    		return { largeur_tir, profondeur_tir, hauteur_tir };
    	}

    	const writable_props = ["path", "initdata"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tiroir> was created with unknown prop '${key}'`);
    	});

    	function inputnumber0_value_binding(value) {
    		ui.quantite = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber1_value_binding(value) {
    		ui.largeur = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber2_value_binding(value) {
    		ui.hauteur = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber3_value_binding(value) {
    		ui.profondeur = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber4_value_binding(value) {
    		ui.largeur_tir = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber5_value_binding(value) {
    		ui.profondeur_tir = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber6_value_binding(value) {
    		ui.hauteur_tir = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber7_value_binding(value) {
    		ui.hauteur_tir_max = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber8_value_binding(value) {
    		ui.profondeur_queues_arrondes = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber9_value_binding(value) {
    		ui.epaisseur = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber10_value_binding(value) {
    		ui.epaisseur_fond = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber11_value_binding(value) {
    		ui.profondeur_rainure = value;
    		$$invalidate(2, ui);
    	}

    	function inputnumber12_value_binding(value) {
    		ui.jeu_rainure = value;
    		$$invalidate(2, ui);
    	}

    	function inputcheckbox_checked_binding(value) {
    		ui.inclure_fond = value;
    		$$invalidate(2, ui);
    	}

    	function component_data_binding(value) {
    		data = value;
    		(((($$invalidate(1, data), $$invalidate(8, opt)), $$invalidate(2, ui)), $$invalidate(6, defaults)), $$invalidate(3, tir));
    	}

    	function datachange_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("initdata" in $$props) $$invalidate(7, initdata = $$props.initdata);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		cleanObject,
    		pipeline,
    		InputNumber,
    		InputCheckbox,
    		Component,
    		Cote,
    		Piece,
    		Group,
    		SVGPiece,
    		SVGDrawing,
    		ListeDebit,
    		path,
    		initdata,
    		data,
    		defaults,
    		opt,
    		ui,
    		tir,
    		state,
    		calculTiroir,
    		cote,
    		cote_g,
    		cote_d,
    		face,
    		face_av,
    		face_ar,
    		fond,
    		pieces,
    		pieces_group
    	});

    	$$self.$inject_state = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("initdata" in $$props) $$invalidate(7, initdata = $$props.initdata);
    		if ("data" in $$props) $$invalidate(1, data = $$props.data);
    		if ("defaults" in $$props) $$invalidate(6, defaults = $$props.defaults);
    		if ("opt" in $$props) $$invalidate(8, opt = $$props.opt);
    		if ("ui" in $$props) $$invalidate(2, ui = $$props.ui);
    		if ("tir" in $$props) $$invalidate(3, tir = $$props.tir);
    		if ("state" in $$props) $$invalidate(5, state = $$props.state);
    		if ("cote" in $$props) $$invalidate(9, cote = $$props.cote);
    		if ("cote_g" in $$props) $$invalidate(10, cote_g = $$props.cote_g);
    		if ("cote_d" in $$props) $$invalidate(11, cote_d = $$props.cote_d);
    		if ("face" in $$props) $$invalidate(12, face = $$props.face);
    		if ("face_av" in $$props) $$invalidate(13, face_av = $$props.face_av);
    		if ("face_ar" in $$props) $$invalidate(14, face_ar = $$props.face_ar);
    		if ("fond" in $$props) $$invalidate(15, fond = $$props.fond);
    		if ("pieces" in $$props) $$invalidate(16, pieces = $$props.pieces);
    		if ("pieces_group" in $$props) $$invalidate(4, pieces_group = $$props.pieces_group);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*ui*/ 4) {
    			 $$invalidate(3, tir = calculTiroir({ ...defaults, ...cleanObject(ui) }));
    		}

    		if ($$self.$$.dirty[0] & /*tir, ui*/ 12) {
    			 $$invalidate(8, opt = { ...defaults, ...tir, ...cleanObject(ui) });
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 256) {
    			 $$invalidate(1, data.opt = opt, data);
    		}

    		if ($$self.$$.dirty[0] & /*ui*/ 4) {
    			 $$invalidate(1, data.ui = ui, data);
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 256) {
    			 $$invalidate(9, cote = new Piece().add_name("Coté").add_features("cote").build(opt.profondeur_tir - 2 * (opt.epaisseur - opt.profondeur_queues_arrondes), opt.hauteur_tir, opt.epaisseur));
    		}

    		if ($$self.$$.dirty[0] & /*cote, opt*/ 768) {
    			 $$invalidate(10, cote_g = cote.add_name("gauche").put(opt.jeu_lateral, opt.jeu_dessous, opt.epaisseur - opt.profondeur_queues_arrondes, "zyx"));
    		}

    		if ($$self.$$.dirty[0] & /*cote, opt*/ 768) {
    			 $$invalidate(11, cote_d = cote.add_name("droit").put(opt.jeu_lateral + opt.largeur_tir - opt.epaisseur, opt.jeu_dessous, opt.epaisseur - opt.profondeur_queues_arrondes, "zyx"));
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 256) {
    			 $$invalidate(12, face = new Piece().add_name("Face").add_features("cote").build(opt.largeur_tir, opt.hauteur_tir, opt.epaisseur));
    		}

    		if ($$self.$$.dirty[0] & /*face, opt*/ 4352) {
    			 $$invalidate(13, face_av = face.add_name("avant").put(opt.jeu_lateral, opt.jeu_dessous, 0, "xyz"));
    		}

    		if ($$self.$$.dirty[0] & /*face, opt*/ 4352) {
    			 $$invalidate(14, face_ar = face.add_name("arrière").put(opt.jeu_lateral, opt.jeu_dessous, opt.profondeur_tir - opt.epaisseur, "xyz"));
    		}

    		if ($$self.$$.dirty[0] & /*opt*/ 256) {
    			 $$invalidate(15, fond = new Piece().add_name("Fond tiroir").add_features("panneau").build(opt.largeur_tir - 2 * (opt.epaisseur - opt.profondeur_rainure + opt.jeu_rainure), opt.profondeur_tir - (opt.epaisseur - opt.profondeur_rainure + opt.jeu_rainure), opt.epaisseur_fond).put(opt.jeu_lateral + opt.epaisseur - opt.profondeur_rainure + opt.jeu_rainure, opt.jeu_dessous, opt.epaisseur - opt.profondeur_rainure + opt.jeu_rainure, "xzy"));
    		}

    		if ($$self.$$.dirty[0] & /*opt, fond, face_av, face_ar, cote_g, cote_d*/ 60672) {
    			 $$invalidate(16, pieces = [opt.inclure_fond ? fond : null, face_av, face_ar, cote_g, cote_d].filter(x => x != null).map(p => p.multiply_que(opt.quantite)));
    		}

    		if ($$self.$$.dirty[0] & /*pieces, data*/ 65538) {
    			 $$invalidate(4, pieces_group = new Group(pieces, `Tiroir ${data.name}`, "Tiroir"));
    		}

    		if ($$self.$$.dirty[0] & /*pieces_group*/ 16) {
    			 $$invalidate(5, state.pieces_group = pieces_group, state);
    		}
    	};

    	return [
    		path,
    		data,
    		ui,
    		tir,
    		pieces_group,
    		state,
    		defaults,
    		initdata,
    		opt,
    		cote,
    		cote_g,
    		cote_d,
    		face,
    		face_av,
    		face_ar,
    		fond,
    		pieces,
    		inputnumber0_value_binding,
    		inputnumber1_value_binding,
    		inputnumber2_value_binding,
    		inputnumber3_value_binding,
    		inputnumber4_value_binding,
    		inputnumber5_value_binding,
    		inputnumber6_value_binding,
    		inputnumber7_value_binding,
    		inputnumber8_value_binding,
    		inputnumber9_value_binding,
    		inputnumber10_value_binding,
    		inputnumber11_value_binding,
    		inputnumber12_value_binding,
    		inputcheckbox_checked_binding,
    		component_data_binding,
    		datachange_handler
    	];
    }

    class Tiroir extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { path: 0, initdata: 7 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tiroir",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*path*/ ctx[0] === undefined && !("path" in props)) {
    			console.warn("<Tiroir> was created without expected prop 'path'");
    		}
    	}

    	get path() {
    		throw new Error("<Tiroir>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Tiroir>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get initdata() {
    		throw new Error("<Tiroir>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set initdata(value) {
    		throw new Error("<Tiroir>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.2 */

    const { console: console_1$6 } = globals;
    const file$l = "src/App.svelte";

    // (249:2) {#if agencement == 'horizontal'}
    function create_if_block_2$4(ctx) {
    	let div1;
    	let select0;
    	let option0;
    	let treeitemoption;
    	let t1;
    	let button0;
    	let t3;
    	let button1;
    	let t5;
    	let button2;
    	let t7;
    	let button3;
    	let t9;
    	let t10;
    	let t11;
    	let a;
    	let t13;
    	let div0;
    	let label;
    	let t14;
    	let select1;
    	let option1;
    	let option2;
    	let t17;
    	let button4;
    	let current;
    	let mounted;
    	let dispose;

    	treeitemoption = new TreeItemOption({
    			props: { data: /*data*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Paramètres";
    			create_component(treeitemoption.$$.fragment);
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "Effacer";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "Enregistrer";
    			t5 = space();
    			button2 = element("button");
    			button2.textContent = "Enregistrer sous...";
    			t7 = space();
    			button3 = element("button");
    			button3.textContent = "Ouvrir...";
    			t9 = space();
    			t10 = text(/*filename*/ ctx[0]);
    			t11 = space();
    			a = element("a");
    			a.textContent = "✎";
    			t13 = space();
    			div0 = element("div");
    			label = element("label");
    			t14 = text("Agencement :\n        ");
    			select1 = element("select");
    			option1 = element("option");
    			option1.textContent = "Horizontal";
    			option2 = element("option");
    			option2.textContent = "Vertical";
    			t17 = space();
    			button4 = element("button");
    			button4.textContent = "Paramètres...";
    			option0.__value = "#/settings";
    			option0.value = option0.__value;
    			add_location(option0, file$l, 251, 6, 6699);
    			attr_dev(select0, "class", "tree-select svelte-1nrxsfu");
    			add_location(select0, file$l, 250, 4, 6643);
    			attr_dev(button0, "class", "svelte-1nrxsfu");
    			add_location(button0, file$l, 254, 4, 6800);
    			attr_dev(button1, "class", "svelte-1nrxsfu");
    			add_location(button1, file$l, 255, 4, 6846);
    			attr_dev(button2, "class", "svelte-1nrxsfu");
    			add_location(button2, file$l, 256, 4, 6901);
    			attr_dev(button3, "class", "svelte-1nrxsfu");
    			add_location(button3, file$l, 257, 4, 6960);
    			attr_dev(a, "href", "@");
    			add_location(a, file$l, 258, 15, 7018);
    			option1.__value = "horizontal";
    			option1.value = option1.__value;
    			add_location(option1, file$l, 263, 10, 7210);
    			option2.__value = "vertical";
    			option2.value = option2.__value;
    			add_location(option2, file$l, 264, 10, 7267);
    			attr_dev(select1, "class", "svelte-1nrxsfu");
    			if (/*agencement*/ ctx[3] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[13].call(select1));
    			add_location(select1, file$l, 262, 8, 7167);
    			set_style(label, "display", "inline");
    			add_location(label, file$l, 260, 6, 7106);
    			attr_dev(button4, "class", "svelte-1nrxsfu");
    			add_location(button4, file$l, 267, 6, 7349);
    			set_style(div0, "float", "right");
    			add_location(div0, file$l, 259, 4, 7073);
    			attr_dev(div1, "class", "toolbar svelte-1nrxsfu");
    			add_location(div1, file$l, 249, 2, 6617);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, select0);
    			append_dev(select0, option0);
    			mount_component(treeitemoption, select0, null);
    			append_dev(div1, t1);
    			append_dev(div1, button0);
    			append_dev(div1, t3);
    			append_dev(div1, button1);
    			append_dev(div1, t5);
    			append_dev(div1, button2);
    			append_dev(div1, t7);
    			append_dev(div1, button3);
    			append_dev(div1, t9);
    			append_dev(div1, t10);
    			append_dev(div1, t11);
    			append_dev(div1, a);
    			append_dev(div1, t13);
    			append_dev(div1, div0);
    			append_dev(div0, label);
    			append_dev(label, t14);
    			append_dev(label, select1);
    			append_dev(select1, option1);
    			append_dev(select1, option2);
    			select_option(select1, /*agencement*/ ctx[3]);
    			append_dev(div0, t17);
    			append_dev(div0, button4);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", moveTree, false, false, false),
    					listen_dev(button0, "click", /*clear*/ ctx[6], false, false, false),
    					listen_dev(button1, "click", /*simpleSave*/ ctx[9], false, false, false),
    					listen_dev(button2, "click", /*saveAs*/ ctx[8], false, false, false),
    					listen_dev(button3, "click", /*open*/ ctx[10], false, false, false),
    					listen_dev(a, "click", prevent_default(/*rename*/ ctx[7]), false, true, false),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[13]),
    					listen_dev(button4, "click", openSettings, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const treeitemoption_changes = {};
    			if (dirty & /*data*/ 4) treeitemoption_changes.data = /*data*/ ctx[2];
    			treeitemoption.$set(treeitemoption_changes);
    			if (!current || dirty & /*filename*/ 1) set_data_dev(t10, /*filename*/ ctx[0]);

    			if (dirty & /*agencement*/ 8) {
    				select_option(select1, /*agencement*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(treeitemoption.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(treeitemoption.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(treeitemoption);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(249:2) {#if agencement == 'horizontal'}",
    		ctx
    	});

    	return block;
    }

    // (274:4) {#if agencement == 'vertical'}
    function create_if_block_1$9(ctx) {
    	let div;
    	let select;
    	let option0;
    	let option1;
    	let t2;
    	let button0;
    	let t4;
    	let button1;
    	let t6;
    	let button2;
    	let t8;
    	let button3;
    	let t10;
    	let button4;
    	let t12;
    	let p;
    	let t13;
    	let t14;
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Agencement horizontal";
    			option1 = element("option");
    			option1.textContent = "Agencement vertical";
    			t2 = space();
    			button0 = element("button");
    			button0.textContent = "Paramètres...";
    			t4 = space();
    			button1 = element("button");
    			button1.textContent = "Enregistrer";
    			t6 = space();
    			button2 = element("button");
    			button2.textContent = "Enregistrer sous...";
    			t8 = space();
    			button3 = element("button");
    			button3.textContent = "Nouveau";
    			t10 = space();
    			button4 = element("button");
    			button4.textContent = "Ouvrir...";
    			t12 = space();
    			p = element("p");
    			t13 = text(/*filename*/ ctx[0]);
    			t14 = space();
    			a = element("a");
    			a.textContent = "✎";
    			option0.__value = "horizontal";
    			option0.value = option0.__value;
    			add_location(option0, file$l, 276, 10, 7578);
    			option1.__value = "vertical";
    			option1.value = option1.__value;
    			add_location(option1, file$l, 277, 10, 7646);
    			attr_dev(select, "class", "svelte-1nrxsfu");
    			if (/*agencement*/ ctx[3] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[14].call(select));
    			add_location(select, file$l, 275, 8, 7535);
    			attr_dev(button0, "class", "svelte-1nrxsfu");
    			add_location(button0, file$l, 279, 8, 7726);
    			attr_dev(button1, "class", "svelte-1nrxsfu");
    			add_location(button1, file$l, 280, 8, 7789);
    			attr_dev(button2, "class", "svelte-1nrxsfu");
    			add_location(button2, file$l, 281, 8, 7848);
    			attr_dev(button3, "class", "svelte-1nrxsfu");
    			add_location(button3, file$l, 282, 8, 7911);
    			attr_dev(button4, "class", "svelte-1nrxsfu");
    			add_location(button4, file$l, 283, 8, 7961);
    			attr_dev(div, "class", "open-save-buttons svelte-1nrxsfu");
    			add_location(div, file$l, 274, 6, 7495);
    			attr_dev(a, "href", "@");
    			add_location(a, file$l, 285, 20, 8037);
    			add_location(p, file$l, 285, 6, 8023);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			select_option(select, /*agencement*/ ctx[3]);
    			append_dev(div, t2);
    			append_dev(div, button0);
    			append_dev(div, t4);
    			append_dev(div, button1);
    			append_dev(div, t6);
    			append_dev(div, button2);
    			append_dev(div, t8);
    			append_dev(div, button3);
    			append_dev(div, t10);
    			append_dev(div, button4);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t13);
    			append_dev(p, t14);
    			append_dev(p, a);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[14]),
    					listen_dev(button0, "click", openSettings, false, false, false),
    					listen_dev(button1, "click", /*simpleSave*/ ctx[9], false, false, false),
    					listen_dev(button2, "click", /*saveAs*/ ctx[8], false, false, false),
    					listen_dev(button3, "click", /*clear*/ ctx[6], false, false, false),
    					listen_dev(button4, "click", /*open*/ ctx[10], false, false, false),
    					listen_dev(a, "click", prevent_default(/*rename*/ ctx[7]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*agencement*/ 8) {
    				select_option(select, /*agencement*/ ctx[3]);
    			}

    			if (dirty & /*filename*/ 1) set_data_dev(t13, /*filename*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(p);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$9.name,
    		type: "if",
    		source: "(274:4) {#if agencement == 'vertical'}",
    		ctx
    	});

    	return block;
    }

    // (292:6) {#if agencement == 'vertical'}
    function create_if_block$a(ctx) {
    	let li;
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			a.textContent = "Paramètres...";
    			attr_dev(a, "href", "@");
    			add_location(a, file$l, 292, 12, 8215);
    			add_location(li, file$l, 292, 8, 8211);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(openSettings), false, true, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(292:6) {#if agencement == 'vertical'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let div3;
    	let t0;
    	let div0;
    	let t1;
    	let ul;
    	let li;
    	let treeitem;
    	let t2;
    	let t3;
    	let div2;
    	let ensemble;
    	let t4;
    	let div1;
    	let details;
    	let summary;
    	let t6;
    	let pre;
    	let t7_value = JSON.stringify(/*data*/ ctx[2], null, 2) + "";
    	let t7;
    	let t8;
    	let settings_1;
    	let updating_settings;
    	let div3_class_value;
    	let current;
    	let if_block0 = /*agencement*/ ctx[3] == "horizontal" && create_if_block_2$4(ctx);
    	let if_block1 = /*agencement*/ ctx[3] == "vertical" && create_if_block_1$9(ctx);

    	treeitem = new TreeItem({
    			props: { data: /*data*/ ctx[2] },
    			$$inline: true
    		});

    	let if_block2 = /*agencement*/ ctx[3] == "vertical" && create_if_block$a(ctx);

    	ensemble = new Ensemble({
    			props: {
    				name: "Meuble",
    				initdata: /*initdata*/ ctx[1]
    			},
    			$$inline: true
    		});

    	ensemble.$on("datachange", /*onDataChange*/ ctx[11]);

    	function settings_1_settings_binding(value) {
    		/*settings_1_settings_binding*/ ctx[16].call(null, value);
    	}

    	let settings_1_props = {};

    	if (/*settings*/ ctx[4] !== void 0) {
    		settings_1_props.settings = /*settings*/ ctx[4];
    	}

    	settings_1 = new Settings({ props: settings_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(settings_1, "settings", settings_1_settings_binding));

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			ul = element("ul");
    			li = element("li");
    			create_component(treeitem.$$.fragment);
    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			div2 = element("div");
    			create_component(ensemble.$$.fragment);
    			t4 = space();
    			div1 = element("div");
    			details = element("details");
    			summary = element("summary");
    			summary.textContent = "Contenu du fichier";
    			t6 = space();
    			pre = element("pre");
    			t7 = text(t7_value);
    			t8 = space();
    			create_component(settings_1.$$.fragment);
    			add_location(li, file$l, 288, 6, 8117);
    			add_location(ul, file$l, 287, 4, 8106);
    			attr_dev(div0, "class", "tree svelte-1nrxsfu");
    			add_location(div0, file$l, 272, 2, 7435);
    			add_location(summary, file$l, 301, 8, 8497);
    			attr_dev(pre, "id", "json");
    			add_location(pre, file$l, 302, 8, 8543);
    			add_location(details, file$l, 300, 6, 8479);
    			attr_dev(div1, "class", "routable");
    			add_location(div1, file$l, 299, 4, 8426);
    			attr_dev(div2, "class", "main svelte-1nrxsfu");
    			add_location(div2, file$l, 297, 2, 8323);
    			attr_dev(div3, "class", div3_class_value = "root agencement-" + /*agencement*/ ctx[3] + " svelte-1nrxsfu");
    			add_location(div3, file$l, 246, 0, 6536);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			if (if_block0) if_block0.m(div3, null);
    			append_dev(div3, t0);
    			append_dev(div3, div0);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t1);
    			append_dev(div0, ul);
    			append_dev(ul, li);
    			mount_component(treeitem, li, null);
    			append_dev(ul, t2);
    			if (if_block2) if_block2.m(ul, null);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			mount_component(ensemble, div2, null);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, details);
    			append_dev(details, summary);
    			append_dev(details, t6);
    			append_dev(details, pre);
    			append_dev(pre, t7);
    			/*div1_binding*/ ctx[15](div1);
    			append_dev(div2, t8);
    			mount_component(settings_1, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*agencement*/ ctx[3] == "horizontal") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*agencement*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$4(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div3, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*agencement*/ ctx[3] == "vertical") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$9(ctx);
    					if_block1.c();
    					if_block1.m(div0, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			const treeitem_changes = {};
    			if (dirty & /*data*/ 4) treeitem_changes.data = /*data*/ ctx[2];
    			treeitem.$set(treeitem_changes);

    			if (/*agencement*/ ctx[3] == "vertical") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$a(ctx);
    					if_block2.c();
    					if_block2.m(ul, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			const ensemble_changes = {};
    			if (dirty & /*initdata*/ 2) ensemble_changes.initdata = /*initdata*/ ctx[1];
    			ensemble.$set(ensemble_changes);
    			if ((!current || dirty & /*data*/ 4) && t7_value !== (t7_value = JSON.stringify(/*data*/ ctx[2], null, 2) + "")) set_data_dev(t7, t7_value);
    			const settings_1_changes = {};

    			if (!updating_settings && dirty & /*settings*/ 16) {
    				updating_settings = true;
    				settings_1_changes.settings = /*settings*/ ctx[4];
    				add_flush_callback(() => updating_settings = false);
    			}

    			settings_1.$set(settings_1_changes);

    			if (!current || dirty & /*agencement*/ 8 && div3_class_value !== (div3_class_value = "root agencement-" + /*agencement*/ ctx[3] + " svelte-1nrxsfu")) {
    				attr_dev(div3, "class", div3_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(treeitem.$$.fragment, local);
    			transition_in(ensemble.$$.fragment, local);
    			transition_in(settings_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(treeitem.$$.fragment, local);
    			transition_out(ensemble.$$.fragment, local);
    			transition_out(settings_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(treeitem);
    			if (if_block2) if_block2.d();
    			destroy_component(ensemble);
    			/*div1_binding*/ ctx[15](null);
    			destroy_component(settings_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function moveTree(e) {
    	window.location.hash = e.target.value;
    }

    function openSettings() {
    	window.location.hash = "#/settings";
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	let components = {
    		Porte,
    		Caisson,
    		Ensemble,
    		Etagere,
    		Facade,
    		Tiroir
    	};

    	setContext("App-components", components);
    	let filename = `meuble_${new Date().toISOString().slice(0, 16).replace(/T/, "_").replace(/:/, "")}.json`;
    	let initdata = {};
    	let data = {};

    	//$: console.log('App data =', data)
    	let agencement = "horizontal";

    	let settings = writable(JSON.parse(localStorage.getItem("calcul-meubles-settings") || "{}"));
    	setContext("settings", settings);

    	settings.subscribe(settings => {
    		if (settings.agencement && agencement != settings.agencement) $$invalidate(3, agencement = settings.agencement);

    		//console.log("App data.settings =")
    		$$invalidate(2, data.settings = settings, data);

    		localStorage.setItem("calcul-meubles-settings", JSON.stringify(settings));
    	});

    	let item = JSON.parse(localStorage.getItem("calcul-meubles-data") || "null");
    	let fileData = localStorage.getItem("calcul-meubles-file-data");

    	if (item) {
    		initdata = item.data;
    		filename = item.filename;
    	}

    	function clear() {
    		if (!isSaved()) {
    			if (!confirm("Fichier non enregistré, voulez-vous continuer et perdre les modifications en cours?")) return;
    			localStorage.setItem("calcul-meubles-data-backup", localStorage.getItem("calcul-meubles-data"));
    			localStorage.setItem("calcul-meubles-file-data-backup", localStorage.getItem("calcul-meubles-file-data"));
    		}

    		localStorage.removeItem("calcul-meubles-data");
    		localStorage.removeItem("calcul-meubles-file-data");
    		window.location.reload();
    	}

    	function rename() {
    		let new_filename = prompt("Nom du fichier", filename);
    		if (new_filename == null) return false;
    		$$invalidate(0, filename = new_filename);
    		return true;
    	}

    	function saveAs() {
    		save(true);
    	}

    	function ensureSaved() {
    		let item = localStorage.getItem("calcul-meubles-data");

    		if (item) {
    			if (save(false) == "cancelled") return false;
    		}

    		return true;
    	}

    	function isSaved() {
    		if (data.children.length == 0) return true;
    		let json = JSON.stringify(data, null, 2);
    		if (json == fileData) return true;
    		console.log("isSaved() = false", json, fileData);
    		return false;
    	}

    	function simpleSave() {
    		if (save(false) == "already-saved") {
    			alert("Déjà enregistré");
    		}
    	}

    	function save(saveAs) {
    		if (!saveAs && isSaved()) {
    			return "already-saved";
    		}

    		let json = JSON.stringify(data, null, 2);
    		if (saveAs && !rename()) return "cancelled";
    		let file = new window.File([json], filename, { type: "application/json" });
    		let url = URL.createObjectURL(file);

    		try {
    			let a = document.createElement("a");
    			a.href = url;
    			a.style.display = "none";
    			a.setAttribute("download", filename);
    			document.body.appendChild(a);
    			a.click();
    			document.body.removeChild(a);
    			localStorage.removeItem("calcul-meubles-data");
    			$$invalidate(12, fileData = json);
    		} finally {
    			URL.revokeObjectURL(url);
    		}
    	}

    	function open() {
    		if (!isSaved()) {
    			alert("Fichier non enregistré, veuillez enregistrer le fichier avant d'en ouvrir un nouveau.");
    			return;
    		}

    		let input = document.createElement("input");
    		input.style.display = "none";
    		input.setAttribute("type", "file");

    		input.addEventListener(
    			"change",
    			e => {
    				let file = e.target.files[0];
    				if (!file) return;
    				let reader = new FileReader();

    				reader.onload = e => {
    					$$invalidate(1, initdata = JSON.parse(e.target.result));
    					settings.set(initdata.settings || {});
    					$$invalidate(0, filename = file.name);
    					$$invalidate(12, fileData = e.target.result);
    				};

    				reader.readAsText(file);
    			},
    			false
    		);

    		document.body.appendChild(input);
    		input.click();
    		document.body.removeChild(input);
    	}

    	let root_target;

    	routeDeclare(route => {
    		return route.root ? [root_target] : [];
    	});

    	function onDataChange(e) {
    		//console.log(`App datachange{${Object.keys(e.detail).join()}} = %o`, e.detail);
    		$$invalidate(2, data = e.detail.data);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$6.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function select1_change_handler() {
    		agencement = select_value(this);
    		$$invalidate(3, agencement);
    	}

    	function select_change_handler() {
    		agencement = select_value(this);
    		$$invalidate(3, agencement);
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			root_target = $$value;
    			$$invalidate(5, root_target);
    		});
    	}

    	function settings_1_settings_binding(value) {
    		settings = value;
    		$$invalidate(4, settings);
    	}

    	$$self.$capture_state = () => ({
    		setContext,
    		readable,
    		writable,
    		get: get_store_value,
    		routeDeclare,
    		Settings,
    		TreeItem,
    		TreeItemOption,
    		Ensemble,
    		Porte,
    		Caisson,
    		Etagere,
    		Facade,
    		Tiroir,
    		components,
    		filename,
    		initdata,
    		data,
    		agencement,
    		settings,
    		item,
    		fileData,
    		clear,
    		rename,
    		saveAs,
    		ensureSaved,
    		isSaved,
    		simpleSave,
    		save,
    		open,
    		moveTree,
    		openSettings,
    		root_target,
    		onDataChange
    	});

    	$$self.$inject_state = $$props => {
    		if ("components" in $$props) components = $$props.components;
    		if ("filename" in $$props) $$invalidate(0, filename = $$props.filename);
    		if ("initdata" in $$props) $$invalidate(1, initdata = $$props.initdata);
    		if ("data" in $$props) $$invalidate(2, data = $$props.data);
    		if ("agencement" in $$props) $$invalidate(3, agencement = $$props.agencement);
    		if ("settings" in $$props) $$invalidate(4, settings = $$props.settings);
    		if ("item" in $$props) item = $$props.item;
    		if ("fileData" in $$props) $$invalidate(12, fileData = $$props.fileData);
    		if ("root_target" in $$props) $$invalidate(5, root_target = $$props.root_target);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*initdata*/ 2) {
    			 $$invalidate(2, data = { ...initdata });
    		}

    		if ($$self.$$.dirty & /*initdata*/ 2) {
    			 console.log("App initdata =", initdata);
    		}

    		if ($$self.$$.dirty & /*settings, agencement*/ 24) {
    			 settings.update(settings => ({ ...settings, agencement }));
    		}

    		if ($$self.$$.dirty & /*data, filename*/ 5) {
    			 localStorage.setItem("calcul-meubles-data", JSON.stringify({ data, filename }));
    		}

    		if ($$self.$$.dirty & /*fileData*/ 4096) {
    			 localStorage.setItem("calcul-meubles-file-data", fileData);
    		}
    	};

    	return [
    		filename,
    		initdata,
    		data,
    		agencement,
    		settings,
    		root_target,
    		clear,
    		rename,
    		saveAs,
    		simpleSave,
    		open,
    		onDataChange,
    		fileData,
    		select1_change_handler,
    		select_change_handler,
    		div1_binding,
    		settings_1_settings_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
