
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

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
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
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
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor, options.customElement);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.37.0' }, detail)));
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

    const getRows = (grid) => {
        let rows = [];
        for (let i = 0; i < 9; i++) {
            rows = [...rows, grid.slice(i * 9, 9 + i * 9)];
        }
        return rows;
    };
    const getColumns = (grid) => {
        let columns = [];
        for (let i = 0; i < 9; i++) {
            columns = [
                ...columns,
                [
                    grid[i + 9 * 0],
                    grid[i + 9 * 1],
                    grid[i + 9 * 2],
                    grid[i + 9 * 3],
                    grid[i + 9 * 4],
                    grid[i + 9 * 5],
                    grid[i + 9 * 6],
                    grid[i + 9 * 7],
                    grid[i + 9 * 8],
                ],
            ];
        }
        return columns;
    };
    const getSquares = (grid) => {
        let squares = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                squares = [
                    ...squares,
                    [
                        grid[0 + j * 3 + i * 27],
                        grid[1 + j * 3 + i * 27],
                        grid[2 + j * 3 + i * 27],
                        grid[9 + j * 3 + i * 27],
                        grid[10 + j * 3 + i * 27],
                        grid[11 + j * 3 + i * 27],
                        grid[18 + j * 3 + i * 27],
                        grid[19 + j * 3 + i * 27],
                        grid[20 + j * 3 + i * 27],
                    ],
                ];
            }
        }
        return squares;
    };
    const copyGrid = (grid) => {
        let newGrid = [];
        grid.forEach(cell => {
            newGrid.push(Object.assign({}, cell));
        });
        return newGrid;
    };
    const reducer = (accumulator, cell) => (cell.value) ? [...accumulator, cell.value] : accumulator;
    const calculateCandidates = (grid) => {
        grid = copyGrid(grid);
        //lines work
        for (let i = 0; i < 9; i++) {
            let lineNumbers = grid.slice(i * 9, i * 9 + 9).reduce(reducer, []);
            let candidates = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            candidates = candidates.filter(number => lineNumbers.indexOf(number) == -1);
            for (let index = 0; index < 9; index++) {
                let cell = grid[index + 9 * i];
                if (cell.value == undefined) {
                    cell.candidates = candidates;
                }
                else {
                    cell.candidates = [];
                }
            }
        }
        //columns work
        for (let i = 0; i < 9; i++) {
            let columnNumbers = [];
            for (let j = 0; j < 9; j++) {
                let value = grid[i + j * 9].value;
                if (value != undefined)
                    columnNumbers.push(value);
            }
            //@ts-ignore
            columnNumbers = [...new Set(columnNumbers)];
            for (let index = 0; index < 9; index++) {
                let cell = grid[i + index * 9];
                cell.candidates = cell.candidates.filter(number => columnNumbers.indexOf(number) == -1);
            }
        }
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let indexes = [
                    0 + j * 3 + i * 27,
                    1 + j * 3 + i * 27,
                    2 + j * 3 + i * 27,
                    9 + j * 3 + i * 27,
                    10 + j * 3 + i * 27,
                    11 + j * 3 + i * 27,
                    18 + j * 3 + i * 27,
                    19 + j * 3 + i * 27,
                    20 + j * 3 + i * 27,
                ];
                let squareNumbers = indexes.map(index => grid[index].value);
                //@ts-ignore
                squareNumbers = [...new Set(squareNumbers)].filter(number => number != undefined);
                for (let iter = 0; iter < 9; iter++) {
                    let index = indexes[iter];
                    let cell = grid[index];
                    cell.candidates = cell.candidates.filter(number => squareNumbers.indexOf(number) == -1);
                }
            }
        }
        return grid;
    };

    const currentFocus = writable(undefined);

    const highlightCase = writable(undefined);


    let board = JSON.parse("[{\"index\":0,\"candidates\":[3,4,6,7,8,9]},{\"index\":1,\"candidates\":[1,3,4,7,9]},{\"index\":2,\"candidates\":[1,3,4,6,8,9]},{\"index\":3,\"candidates\":[1,2,3,5,7]},{\"index\":4,\"candidates\":[1,2,4,5,6]},{\"index\":5,\"candidates\":[1,2,4,6,7,9]},{\"index\":6,\"candidates\":[1,3,4,5]},{\"index\":7,\"candidates\":[1,2,6]},{\"index\":8,\"candidates\":[2,3,6]},{\"index\":9,\"value\":2,\"candidates\":[]},{\"index\":10,\"candidates\":[1,3,4,7]},{\"index\":11,\"candidates\":[1,3,4,6]},{\"index\":12,\"candidates\":[1,3,5,7]},{\"index\":13,\"candidates\":[1,4,5,6]},{\"index\":14,\"candidates\":[1,4,6,7]},{\"index\":15,\"candidates\":[1,3,4,5]},{\"index\":16,\"value\":8,\"candidates\":[]},{\"index\":17,\"value\":9,\"candidates\":[]},{\"index\":18,\"value\":5,\"candidates\":[]},{\"index\":19,\"candidates\":[1,3,4,9]},{\"index\":20,\"candidates\":[1,3,4,6,9]},{\"index\":21,\"candidates\":[1,2,3]},{\"index\":22,\"candidates\":[1,2,4,6]},{\"index\":23,\"value\":8,\"candidates\":[]},{\"index\":24,\"value\":7,\"candidates\":[]},{\"index\":25,\"candidates\":[1,2,6]},{\"index\":26,\"candidates\":[2,3,6]},{\"index\":27,\"candidates\":[6,7,8]},{\"index\":28,\"candidates\":[1,7]},{\"index\":29,\"value\":5,\"candidates\":[]},{\"index\":30,\"candidates\":[1,7,8]},{\"index\":31,\"value\":9,\"candidates\":[]},{\"index\":32,\"candidates\":[1,6,7]},{\"index\":33,\"value\":2,\"candidates\":[]},{\"index\":34,\"value\":3,\"candidates\":[]},{\"index\":35,\"value\":4,\"candidates\":[]},{\"index\":36,\"candidates\":[4,8]},{\"index\":37,\"candidates\":[1,2,4]},{\"index\":38,\"candidates\":[1,4,8]},{\"index\":39,\"candidates\":[1,2,8]},{\"index\":40,\"value\":3,\"candidates\":[]},{\"index\":41,\"value\":5,\"candidates\":[]},{\"index\":42,\"value\":6,\"candidates\":[]},{\"index\":43,\"value\":9,\"candidates\":[]},{\"index\":44,\"value\":7,\"candidates\":[]},{\"index\":45,\"candidates\":[3,6,7,9]},{\"index\":46,\"candidates\":[2,3,7,9]},{\"index\":47,\"candidates\":[3,6,9]},{\"index\":48,\"value\":4,\"candidates\":[]},{\"index\":49,\"candidates\":[2,6]},{\"index\":50,\"candidates\":[2,6,7]},{\"index\":51,\"value\":8,\"candidates\":[]},{\"index\":52,\"value\":5,\"candidates\":[]},{\"index\":53,\"value\":1,\"candidates\":[]},{\"index\":54,\"candidates\":[3,4,9]},{\"index\":55,\"candidates\":[3,4,5,9]},{\"index\":56,\"value\":7,\"candidates\":[]},{\"index\":57,\"candidates\":[1,2,5,8]},{\"index\":58,\"candidates\":[1,2,4,5,8]},{\"index\":59,\"candidates\":[1,2,4]},{\"index\":60,\"candidates\":[1,3]},{\"index\":61,\"candidates\":[1,2,6]},{\"index\":62,\"candidates\":[2,3,6]},{\"index\":63,\"value\":1,\"candidates\":[]},{\"index\":64,\"value\":8,\"candidates\":[]},{\"index\":65,\"value\":2,\"candidates\":[]},{\"index\":66,\"value\":6,\"candidates\":[]},{\"index\":67,\"value\":7,\"candidates\":[]},{\"index\":68,\"value\":3,\"candidates\":[]},{\"index\":69,\"value\":9,\"candidates\":[]},{\"index\":70,\"value\":4,\"candidates\":[]},{\"index\":71,\"value\":5,\"candidates\":[]},{\"index\":72,\"candidates\":[3,4]},{\"index\":73,\"value\":6,\"candidates\":[]},{\"index\":74,\"candidates\":[3,4]},{\"index\":75,\"value\":9,\"candidates\":[]},{\"index\":76,\"candidates\":[1,2,4,5]},{\"index\":77,\"candidates\":[1,2,4]},{\"index\":78,\"candidates\":[1,3]},{\"index\":79,\"candidates\":[1,2,7]},{\"index\":80,\"value\":8,\"candidates\":[]}]");

    for (let i = 0; i < 81; i++) {
        let cell = board[i];
        board[i] = { index: cell.index, value: cell.value, candidates: cell.candidates };
    }

    const createSudokuStore = () => {
        const { subscribe, update } = writable(board);

        return {
            subscribe,
            setCellValue: (index, value) => {
                update(currentGrid => {
                    currentGrid[index].value = value;
                    return currentGrid
                });
            },
            updateCandidates: () => {
                update(currentGrid => calculateCandidates(currentGrid));
            }
        }
    };


    let sudoku = createSudokuStore();

    //console.log("sudoku store: ", sudoku.updateCandidates)

    let current_id = 0;

    const createNotificationStore = () => {
        const { subscribe, set, update } = writable(undefined);

        return {
            subscribe,
            notify: (type, message, status, seconds = 30) => {
                set({ id: ++current_id, type, message, status, seconds });
                return current_id
            },
            dismiss: (id) => {
                if (id == current_id) {
                    update((object) => ({ ...object, dismiss: true }));
                    setTimeout(() => {
                        set(undefined);
                    }, 200);
                }
            },
        }
    };

    const notificationManager = createNotificationStore();

    /* src\Utils.svelte generated by Svelte v3.37.0 */

    const { console: console_1$1 } = globals;
    const file$e = "src\\Utils.svelte";

    function create_fragment$f(ctx) {
    	let div;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[2]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "svelte-uyw1xw");
    			add_location(div, file$e, 40, 0, 767);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(window, "resize", /*onwindowresize*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
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
    	let $sudoku;
    	validate_store(sudoku, "sudoku");
    	component_subscribe($$self, sudoku, $$value => $$invalidate(4, $sudoku = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Utils", slots, []);
    	let innerWidth;
    	let innerHeight;
    	let id;

    	const logClick = () => {
    		console.log($sudoku);
    	};

    	const updateClick = () => {
    		sudoku.updateCandidates();
    	};

    	const notification = () => {
    		id = notificationManager.notify("This is a notif", "success", 4);
    	};

    	const closeNotif = () => {
    		notificationManager.dismiss(id);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Utils> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(0, innerWidth = window.innerWidth);
    		$$invalidate(1, innerHeight = window.innerHeight);
    	}

    	$$self.$capture_state = () => ({
    		innerWidth,
    		innerHeight,
    		id,
    		sudoku,
    		notificationManager,
    		logClick,
    		updateClick,
    		notification,
    		closeNotif,
    		$sudoku
    	});

    	$$self.$inject_state = $$props => {
    		if ("innerWidth" in $$props) $$invalidate(0, innerWidth = $$props.innerWidth);
    		if ("innerHeight" in $$props) $$invalidate(1, innerHeight = $$props.innerHeight);
    		if ("id" in $$props) id = $$props.id;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [innerWidth, innerHeight, onwindowresize];
    }

    class Utils extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Utils",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    class Hint$1 {
        constructor(index, value, hint) {
            this.index = index;
            this.value = value;
            this.hint = hint;
        }
        getIndex() {
            return this.index;
        }
        getValue() {
            return this.value;
        }
        getHint() {
            return this.hint;
        }
        getAsObject() {
            return {
                index: this.getIndex(),
                value: this.getValue(),
                hint: this.getHint(),
            };
        }
    }

    const nakedSingle = (grid) => {
        for (let cell of grid) {
            if (cell.candidates.length == 1) {
                let value = cell.candidates[0];
                return new Hint$1(cell.index, value, `La case mise en valeur ne peut contenir que un ${value}`);
            }
        }
        return undefined;
    };
    const hiddenSingle = (grid) => {
        const rows = getRows(grid);
        const columns = getColumns(grid);
        const squares = getSquares(grid);
        const searchHiddenSingleInArray = (array) => {
            for (let subarray of array) {
                let count = {
                    1: { number: 0, index: -1 },
                    2: { number: 0, index: -1 },
                    3: { number: 0, index: -1 },
                    4: { number: 0, index: -1 },
                    5: { number: 0, index: -1 },
                    6: { number: 0, index: -1 },
                    7: { number: 0, index: -1 },
                    8: { number: 0, index: -1 },
                    9: { number: 0, index: -1 },
                };
                for (let cell of subarray) {
                    for (let candidate of cell.candidates) {
                        count[candidate].number = count[candidate].number + 1;
                        count[candidate].index = cell.index;
                    }
                }
                for (let i = 1; i <= 9; i++) {
                    if (count[i].number == 1)
                        return { index: count[i].index, value: i };
                }
            }
            return undefined;
        };
        let hint = searchHiddenSingleInArray(rows);
        if (hint != undefined)
            return new Hint$1(hint.index, hint.value, `La case mise en valeur est la seul de la ligne à pouvoir contenir le chiffre ${hint.value}`);
        hint = searchHiddenSingleInArray(columns);
        if (hint != undefined)
            return new Hint$1(hint.index, hint.value, `La case mise en valeur est la seul de la colones à pouvoir contenir le chiffre ${hint.value}`);
        hint = searchHiddenSingleInArray(squares);
        if (hint != undefined)
            return new Hint$1(hint.index, hint.value, `La case mise en valeur est la seul du carré à pouvoir contenir le chiffre ${hint.value}`);
        return undefined;
    };

    const getHint = (grid) => {
        let hint;
        hint = nakedSingle(grid);
        if (hint != undefined)
            return hint;
        hint = hiddenSingle(grid);
        if (hint != undefined)
            return hint;
        return undefined;
    };

    const activeTask = writable(undefined);

    activeTask.subscribe((task) => {

    });

    /* src\components\HintPopup.svelte generated by Svelte v3.37.0 */

    // (77:0) {#if show}
    function create_if_block$4(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(77:0) {#if show}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let if_block_anchor;
    	let if_block = /*show*/ ctx[0] && create_if_block$4(ctx);

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
    			if (/*show*/ ctx[0]) {
    				if (if_block) ; else {
    					if_block = create_if_block$4(ctx);
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
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $sudoku;
    	validate_store(sudoku, "sudoku");
    	component_subscribe($$self, sudoku, $$value => $$invalidate(2, $sudoku = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("HintPopup", slots, []);

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

    	let show = false;
    	let hint;

    	activeTask.subscribe(task => __awaiter(void 0, void 0, void 0, function* () {
    		var _a;

    		if (task == "hint") {
    			yield sudoku.updateCandidates();

    			hint = (_a = getHint($sudoku)) === null || _a === void 0
    			? void 0
    			: _a.getAsObject();

    			if (hint != undefined) {
    				highlightCase.set(hint.index);
    				notificationManager.notify("hint", hint.hint, "success");
    			} else {
    				notificationManager.notify("hint", "Pas d'indice disponible", "danger");
    			}

    			activeTask.set(undefined);
    		}
    	}));

    	function handleClick() {
    		$$invalidate(0, show = false);
    		hint = undefined;
    		activeTask.set(undefined);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<HintPopup> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		__awaiter,
    		sudoku,
    		highlightCase,
    		notificationManager,
    		getHint,
    		activeTask,
    		show,
    		hint,
    		handleClick,
    		$sudoku
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("show" in $$props) $$invalidate(0, show = $$props.show);
    		if ("hint" in $$props) hint = $$props.hint;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [show];
    }

    class HintPopup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HintPopup",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\components\CheckPopup.svelte generated by Svelte v3.37.0 */

    const { console: console_1 } = globals;
    const file$d = "src\\components\\CheckPopup.svelte";

    // (84:0) {#if show}
    function create_if_block$3(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let p;

    	let t0_value = (/*asSolution*/ ctx[1]
    	? "Le sudoku peut être résolu"
    	: "Je ne peux pas résoudre le sudoku") + "";

    	let t0;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			button = element("button");
    			button.textContent = "Ok";
    			attr_dev(p, "class", "svelte-1c4m0xj");
    			add_location(p, file$d, 87, 12, 2616);
    			attr_dev(button, "class", "svelte-1c4m0xj");
    			add_location(button, file$d, 88, 12, 2718);
    			attr_dev(div0, "class", "content svelte-1c4m0xj");
    			add_location(div0, file$d, 86, 8, 2581);
    			attr_dev(div1, "class", "popup svelte-1c4m0xj");
    			add_location(div1, file$d, 85, 4, 2552);
    			attr_dev(div2, "class", "graybackground svelte-1c4m0xj");
    			add_location(div2, file$d, 84, 0, 2518);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(p, t0);
    			append_dev(div0, t1);
    			append_dev(div0, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleClick*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*asSolution*/ 2 && t0_value !== (t0_value = (/*asSolution*/ ctx[1]
    			? "Le sudoku peut être résolu"
    			: "Je ne peux pas résoudre le sudoku") + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(84:0) {#if show}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let if_block_anchor;
    	let if_block = /*show*/ ctx[0] && create_if_block$3(ctx);

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
    			if (/*show*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
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
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $sudoku;
    	validate_store(sudoku, "sudoku");
    	component_subscribe($$self, sudoku, $$value => $$invalidate(3, $sudoku = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CheckPopup", slots, []);

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

    	let show = false;
    	let asSolution = true;

    	activeTask.subscribe(task => __awaiter(void 0, void 0, void 0, function* () {
    		var _a;

    		if (task == "check") {
    			console.log("go");
    			$$invalidate(0, show = true);
    			let hint;
    			let grid = copyGrid($sudoku);

    			do {
    				grid = calculateCandidates(grid);

    				hint = (_a = getHint(grid)) === null || _a === void 0
    				? void 0
    				: _a.getAsObject();

    				if (hint != undefined) {
    					grid[hint.index].value = hint.value;
    				}
    			} while (hint != undefined);

    			for (let i = 0; i < 81; i++) {
    				if (grid[i].value == undefined) {
    					$$invalidate(1, asSolution = false);
    					break;
    				}
    			}
    		}
    	}));

    	function handleClick() {
    		$$invalidate(0, show = false);
    		$$invalidate(1, asSolution = true);
    		activeTask.set(undefined);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<CheckPopup> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		__awaiter,
    		sudoku,
    		getHint,
    		copyGrid,
    		calculateCandidates,
    		activeTask,
    		show,
    		asSolution,
    		handleClick,
    		$sudoku
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("show" in $$props) $$invalidate(0, show = $$props.show);
    		if ("asSolution" in $$props) $$invalidate(1, asSolution = $$props.asSolution);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [show, asSolution, handleClick];
    }

    class CheckPopup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CheckPopup",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    const gridSize = 450;
    const cellSize = Math.round(gridSize / 9);

    /* src\components\NumberButton.svelte generated by Svelte v3.37.0 */
    const file$c = "src\\components\\NumberButton.svelte";

    function create_fragment$c(ctx) {
    	let div;
    	let span;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t = text(/*value*/ ctx[0]);
    			attr_dev(span, "class", "svelte-1wj0fh");
    			add_location(span, file$c, 39, 4, 768);
    			attr_dev(div, "class", "svelte-1wj0fh");
    			add_location(div, file$c, 38, 0, 734);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*handleClick*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value*/ 1) set_data_dev(t, /*value*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
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

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NumberButton", slots, []);
    	let { value } = $$props;
    	const dispatch = createEventDispatcher();

    	const handleClick = () => {
    		dispatch("numberInput", { value });
    	};

    	const writable_props = ["value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NumberButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		value,
    		createEventDispatcher,
    		dispatch,
    		handleClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, handleClick];
    }

    class NumberButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NumberButton",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<NumberButton> was created without expected prop 'value'");
    		}
    	}

    	get value() {
    		throw new Error("<NumberButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<NumberButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Keypad.svelte generated by Svelte v3.37.0 */
    const file$b = "src\\components\\Keypad.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (69:4) {#each Array(9) as _, i}
    function create_each_block$1(ctx) {
    	let numberbutton;
    	let current;

    	numberbutton = new NumberButton({
    			props: { value: /*i*/ ctx[8] + 1 },
    			$$inline: true
    		});

    	numberbutton.$on("numberInput", /*numberInput_handler*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(numberbutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(numberbutton, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(numberbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(numberbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(numberbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(69:4) {#each Array(9) as _, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = Array(9);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "keypad svelte-1t1j92y");
    			set_style(div, "top", /*cell*/ ctx[0].getBoundingClientRect().y - cellSize + "px");
    			set_style(div, "left", /*cell*/ ctx[0].getBoundingClientRect().x - cellSize + "px");
    			add_location(div, file$b, 62, 0, 1408);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			/*div_binding*/ ctx[4](div);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "click", /*handleClick*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*cell*/ 1) {
    				set_style(div, "top", /*cell*/ ctx[0].getBoundingClientRect().y - cellSize + "px");
    			}

    			if (!current || dirty & /*cell*/ 1) {
    				set_style(div, "left", /*cell*/ ctx[0].getBoundingClientRect().x - cellSize + "px");
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
    			/*div_binding*/ ctx[4](null);
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

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Keypad", slots, []);
    	let { cell } = $$props;
    	let activate = false;
    	let keypad;

    	const handleClick = e => {
    		if (!activate) {
    			activate = true;
    			return;
    		}

    		let { left, top, width, height } = keypad.getBoundingClientRect();
    		let x = e.clientX;
    		let y = e.clientY;

    		if (x <= left || x >= left + width || y <= top || y >= top + height) {
    			currentFocus.set(undefined);
    		}
    	};

    	const writable_props = ["cell"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Keypad> was created with unknown prop '${key}'`);
    	});

    	function numberInput_handler(event) {
    		bubble($$self, event);
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			keypad = $$value;
    			$$invalidate(1, keypad);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("cell" in $$props) $$invalidate(0, cell = $$props.cell);
    	};

    	$$self.$capture_state = () => ({
    		cell,
    		cellSize,
    		currentFocus,
    		activate,
    		keypad,
    		handleClick,
    		NumberButton
    	});

    	$$self.$inject_state = $$props => {
    		if ("cell" in $$props) $$invalidate(0, cell = $$props.cell);
    		if ("activate" in $$props) activate = $$props.activate;
    		if ("keypad" in $$props) $$invalidate(1, keypad = $$props.keypad);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cell, keypad, handleClick, numberInput_handler, div_binding];
    }

    class Keypad extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { cell: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keypad",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cell*/ ctx[0] === undefined && !("cell" in props)) {
    			console.warn("<Keypad> was created without expected prop 'cell'");
    		}
    	}

    	get cell() {
    		throw new Error("<Keypad>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cell(value) {
    		throw new Error("<Keypad>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Cell.svelte generated by Svelte v3.37.0 */
    const file$a = "src\\components\\Cell.svelte";

    // (105:0) {#if isSelected}
    function create_if_block$2(ctx) {
    	let keypad;
    	let current;

    	keypad = new Keypad({
    			props: { cell: /*cell*/ ctx[2] },
    			$$inline: true
    		});

    	keypad.$on("numberInput", /*handleInput*/ ctx[10]);

    	const block = {
    		c: function create() {
    			create_component(keypad.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(keypad, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const keypad_changes = {};
    			if (dirty & /*cell*/ 4) keypad_changes.cell = /*cell*/ ctx[2];
    			keypad.$set(keypad_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(keypad.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(keypad.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(keypad, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(105:0) {#if isSelected}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let t0;
    	let div;
    	let span;
    	let t1_value = (/*value*/ ctx[1] || "") + "";
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*isSelected*/ ctx[3] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			div = element("div");
    			span = element("span");
    			t1 = text(t1_value);
    			attr_dev(span, "class", "svelte-1s4y4he");
    			add_location(span, file$a, 119, 4, 2651);
    			attr_dev(div, "class", "cell svelte-1s4y4he");
    			toggle_class(div, "borderRight", /*borderRight*/ ctx[5]);
    			toggle_class(div, "borderBottom", /*borderBottom*/ ctx[6]);
    			toggle_class(div, "largeRight", /*largeRight*/ ctx[7]);
    			toggle_class(div, "largeBottom", /*largeBottom*/ ctx[8]);
    			toggle_class(div, "isSelected", /*isSelected*/ ctx[3]);
    			toggle_class(div, "isHighlighted", /*$highlightCase*/ ctx[4] == /*index*/ ctx[0]);
    			add_location(div, file$a, 108, 0, 2405);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t1);
    			/*div_binding*/ ctx[12](div);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*handleClick*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isSelected*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isSelected*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty & /*value*/ 2) && t1_value !== (t1_value = (/*value*/ ctx[1] || "") + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*isSelected*/ 8) {
    				toggle_class(div, "isSelected", /*isSelected*/ ctx[3]);
    			}

    			if (dirty & /*$highlightCase, index*/ 17) {
    				toggle_class(div, "isHighlighted", /*$highlightCase*/ ctx[4] == /*index*/ ctx[0]);
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
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[12](null);
    			mounted = false;
    			dispose();
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
    	let isSelected;
    	let $currentFocus;
    	let $highlightCase;
    	let $notificationManager;
    	let $activeTask;
    	validate_store(currentFocus, "currentFocus");
    	component_subscribe($$self, currentFocus, $$value => $$invalidate(11, $currentFocus = $$value));
    	validate_store(highlightCase, "highlightCase");
    	component_subscribe($$self, highlightCase, $$value => $$invalidate(4, $highlightCase = $$value));
    	validate_store(notificationManager, "notificationManager");
    	component_subscribe($$self, notificationManager, $$value => $$invalidate(13, $notificationManager = $$value));
    	validate_store(activeTask, "activeTask");
    	component_subscribe($$self, activeTask, $$value => $$invalidate(14, $activeTask = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Cell", slots, []);
    	let { index } = $$props;
    	let { value } = $$props;
    	let borderRight = index % 9 != 8;
    	let borderBottom = Math.floor(index / 9) != 8;
    	let largeRight = [2, 5].includes(index % 9);
    	let largeBottom = [2, 5].includes(Math.floor(index / 9));

    	const handleClick = () => {
    		if ($highlightCase != undefined) highlightCase.set(undefined);

    		if ($notificationManager?.type == "hint") {
    			notificationManager.dismiss($notificationManager.id);
    		}

    		if ($activeTask == "erase") {
    			if (value == undefined) activeTask.set(undefined);
    			sudoku.setCellValue(index, undefined);
    			return;
    		}

    		if (!isSelected) {
    			currentFocus.set(index);
    		} else {
    			currentFocus.set(undefined);
    		}
    	};

    	let cell;

    	const handleInput = e => {
    		sudoku.setCellValue(index, e.detail.value);

    		//value = e.detail.value
    		currentFocus.set(undefined);
    	};

    	const writable_props = ["index", "value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cell> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			cell = $$value;
    			$$invalidate(2, cell);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		index,
    		value,
    		borderRight,
    		borderBottom,
    		largeRight,
    		largeBottom,
    		currentFocus,
    		sudoku,
    		highlightCase,
    		activeTask,
    		notificationManager,
    		Keypad,
    		handleClick,
    		cell,
    		handleInput,
    		isSelected,
    		$currentFocus,
    		$highlightCase,
    		$notificationManager,
    		$activeTask
    	});

    	$$self.$inject_state = $$props => {
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("borderRight" in $$props) $$invalidate(5, borderRight = $$props.borderRight);
    		if ("borderBottom" in $$props) $$invalidate(6, borderBottom = $$props.borderBottom);
    		if ("largeRight" in $$props) $$invalidate(7, largeRight = $$props.largeRight);
    		if ("largeBottom" in $$props) $$invalidate(8, largeBottom = $$props.largeBottom);
    		if ("cell" in $$props) $$invalidate(2, cell = $$props.cell);
    		if ("isSelected" in $$props) $$invalidate(3, isSelected = $$props.isSelected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$currentFocus, index*/ 2049) {
    			$$invalidate(3, isSelected = $currentFocus == index);
    		}
    	};

    	return [
    		index,
    		value,
    		cell,
    		isSelected,
    		$highlightCase,
    		borderRight,
    		borderBottom,
    		largeRight,
    		largeBottom,
    		handleClick,
    		handleInput,
    		$currentFocus,
    		div_binding
    	];
    }

    class Cell extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { index: 0, value: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cell",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*index*/ ctx[0] === undefined && !("index" in props)) {
    			console.warn("<Cell> was created without expected prop 'index'");
    		}

    		if (/*value*/ ctx[1] === undefined && !("value" in props)) {
    			console.warn("<Cell> was created without expected prop 'value'");
    		}
    	}

    	get index() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Grid.svelte generated by Svelte v3.37.0 */
    const file$9 = "src\\components\\Grid.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (20:4) {#each $sudoku as cell}
    function create_each_block(ctx) {
    	let cell;
    	let current;

    	cell = new Cell({
    			props: {
    				index: /*cell*/ ctx[1].index,
    				value: /*cell*/ ctx[1].value
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cell.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cell, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const cell_changes = {};
    			if (dirty & /*$sudoku*/ 1) cell_changes.index = /*cell*/ ctx[1].index;
    			if (dirty & /*$sudoku*/ 1) cell_changes.value = /*cell*/ ctx[1].value;
    			cell.$set(cell_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cell.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cell.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cell, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(20:4) {#each $sudoku as cell}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let current;
    	let each_value = /*$sudoku*/ ctx[0];
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

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "svelte-od9zxa");
    			add_location(div, file$9, 18, 0, 472);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$sudoku*/ 1) {
    				each_value = /*$sudoku*/ ctx[0];
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
    	let $sudoku;
    	validate_store(sudoku, "sudoku");
    	component_subscribe($$self, sudoku, $$value => $$invalidate(0, $sudoku = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Grid", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Grid> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Cell, sudoku, $sudoku });
    	return [$sudoku];
    }

    class Grid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Grid",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\icons\Candidates.svelte generated by Svelte v3.37.0 */

    const file$8 = "src\\icons\\Candidates.svelte";

    function create_fragment$8(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			attr_dev(path0, "d", "M40.28 12.7201V14.8401H45.58C46.1662 14.8401 46.64 14.3663 46.64 13.7801V5.3001C46.64 4.71392 46.1662 4.2401 45.58 4.2401H40.28V6.3601H44.52V8.4801H40.28V10.6001H44.52V12.7201H40.28Z");
    			attr_dev(path0, "fill", /*color*/ ctx[2]);
    			add_location(path0, file$8, 7, 4, 188);
    			attr_dev(path1, "d", "M10.4156 12.5473V5.12733C10.4156 4.69909 10.158 4.31113 9.76157 4.14789C9.36513 3.98253 8.90933 4.07369 8.60617 4.37791L5.42617 7.55791L6.92501 9.05675L8.29559 7.68617V12.5473H6.17559V14.6673H12.5356V12.5473H10.4156Z");
    			attr_dev(path1, "fill", /*color*/ ctx[2]);
    			add_location(path1, file$8, 8, 4, 401);
    			attr_dev(path2, "d", "M29.4913 23.2692V21.1492H24.1913C23.6051 21.1492 23.1313 21.623 23.1313 22.2092V26.4492C23.1313 27.0354 23.6051 27.5092 24.1913 27.5092H27.3713V29.6292H23.1313V31.7492H28.4313C29.0175 31.7492 29.4913 31.2754 29.4913 30.6892V26.4492C29.4913 25.863 29.0175 25.3892 28.4313 25.3892H25.2513V23.2692H29.4913Z");
    			attr_dev(path2, "fill", /*color*/ ctx[2]);
    			add_location(path2, file$8, 9, 4, 648);
    			attr_dev(path3, "d", "M53.0001 1.06043C53.0001 0.474247 52.5263 0.000427246 51.9401 0.000427246H1.06018C0.474002 0.000427246 0.000183105 0.474247 0.000183105 1.06043V51.9404C0.000183105 52.5265 0.474002 53.0004 1.06018 53.0004H51.9401C52.5263 53.0004 53.0001 52.5265 53.0001 51.9404V1.06043ZM19.0802 33.9204V19.0804H33.9201V33.9204H19.0802ZM33.9201 36.0404V50.8804H19.0802V36.0404H33.9201ZM16.9602 33.9204H2.12018V19.0804H16.9602V33.9204ZM19.0802 16.9604V2.12042H33.9201V16.9604H19.0802ZM36.0401 19.0804H50.8801V33.9204H36.0401V19.0804ZM50.8801 16.9604H36.0401V2.12042H50.8801V16.9604ZM16.9602 2.12042V16.9604H2.12018V2.12042H16.9602ZM2.12018 36.0404H16.9602V50.8804H2.12018V36.0404ZM36.0401 50.8804V36.0404H50.8801L50.9914 50.8443L36.0401 50.8804Z");
    			attr_dev(path3, "fill", /*color*/ ctx[2]);
    			add_location(path3, file$8, 10, 4, 982);
    			attr_dev(svg, "width", /*width*/ ctx[0]);
    			attr_dev(svg, "height", /*height*/ ctx[1]);
    			attr_dev(svg, "viewBox", "0 0 53 53");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$8, 6, 0, 93);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*color*/ 4) {
    				attr_dev(path0, "fill", /*color*/ ctx[2]);
    			}

    			if (dirty & /*color*/ 4) {
    				attr_dev(path1, "fill", /*color*/ ctx[2]);
    			}

    			if (dirty & /*color*/ 4) {
    				attr_dev(path2, "fill", /*color*/ ctx[2]);
    			}

    			if (dirty & /*color*/ 4) {
    				attr_dev(path3, "fill", /*color*/ ctx[2]);
    			}

    			if (dirty & /*width*/ 1) {
    				attr_dev(svg, "width", /*width*/ ctx[0]);
    			}

    			if (dirty & /*height*/ 2) {
    				attr_dev(svg, "height", /*height*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Candidates", slots, []);
    	let { width } = $$props;
    	let { height } = $$props;
    	let { color } = $$props;
    	const writable_props = ["width", "height", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Candidates> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({ width, height, color });

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width, height, color];
    }

    class Candidates extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { width: 0, height: 1, color: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Candidates",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*width*/ ctx[0] === undefined && !("width" in props)) {
    			console.warn("<Candidates> was created without expected prop 'width'");
    		}

    		if (/*height*/ ctx[1] === undefined && !("height" in props)) {
    			console.warn("<Candidates> was created without expected prop 'height'");
    		}

    		if (/*color*/ ctx[2] === undefined && !("color" in props)) {
    			console.warn("<Candidates> was created without expected prop 'color'");
    		}
    	}

    	get width() {
    		throw new Error("<Candidates>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Candidates>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Candidates>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Candidates>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Candidates>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Candidates>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\icons\Hint.svelte generated by Svelte v3.37.0 */

    const file$7 = "src\\icons\\Hint.svelte";

    function create_fragment$7(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M17.2694 34.0833H27.9783H17.2694ZM22.625 2V4.29167V2ZM37.2092 8.04083L35.589 9.66104L37.2092 8.04083ZM43.25 22.625H40.9583H43.25ZM4.29167 22.625H2H4.29167ZM9.66104 9.66104L8.04083 8.04083L9.66104 9.66104ZM14.5217 30.7283C12.9195 29.1257 11.8285 27.0841 11.3866 24.8614C10.9447 22.6388 11.1718 20.3351 12.0392 18.2415C12.9065 16.148 14.3752 14.3586 16.2594 13.0997C18.1437 11.8407 20.3589 11.1688 22.625 11.1688C24.8911 11.1688 27.1063 11.8407 28.9906 13.0997C30.8748 14.3586 32.3435 16.148 33.2108 18.2415C34.0782 20.3351 34.3053 22.6388 33.8634 24.8614C33.4215 27.0841 32.3305 29.1257 30.7283 30.7283L29.4725 31.9819C28.7545 32.7 28.1851 33.5524 27.7966 34.4906C27.4081 35.4288 27.2082 36.4344 27.2083 37.4498V38.6667C27.2083 39.8822 26.7254 41.048 25.8659 41.9076C25.0064 42.7671 23.8406 43.25 22.625 43.25C21.4094 43.25 20.2436 42.7671 19.3841 41.9076C18.5246 41.048 18.0417 39.8822 18.0417 38.6667V37.4498C18.0417 35.3988 17.2258 33.4302 15.7775 31.9819L14.5217 30.7283Z");
    			attr_dev(path, "stroke", /*color*/ ctx[2]);
    			attr_dev(path, "stroke-width", "3");
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			add_location(path, file$7, 7, 4, 188);
    			attr_dev(svg, "width", /*width*/ ctx[0]);
    			attr_dev(svg, "height", /*height*/ ctx[1]);
    			attr_dev(svg, "viewBox", "0 0 45 45");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$7, 6, 0, 93);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*color*/ 4) {
    				attr_dev(path, "stroke", /*color*/ ctx[2]);
    			}

    			if (dirty & /*width*/ 1) {
    				attr_dev(svg, "width", /*width*/ ctx[0]);
    			}

    			if (dirty & /*height*/ 2) {
    				attr_dev(svg, "height", /*height*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
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
    	validate_slots("Hint", slots, []);
    	let { width } = $$props;
    	let { height } = $$props;
    	let { color } = $$props;
    	const writable_props = ["width", "height", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hint> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({ width, height, color });

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width, height, color];
    }

    class Hint extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { width: 0, height: 1, color: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hint",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*width*/ ctx[0] === undefined && !("width" in props)) {
    			console.warn("<Hint> was created without expected prop 'width'");
    		}

    		if (/*height*/ ctx[1] === undefined && !("height" in props)) {
    			console.warn("<Hint> was created without expected prop 'height'");
    		}

    		if (/*color*/ ctx[2] === undefined && !("color" in props)) {
    			console.warn("<Hint> was created without expected prop 'color'");
    		}
    	}

    	get width() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\icons\Check.svelte generated by Svelte v3.37.0 */

    const file$6 = "src\\icons\\Check.svelte";

    function create_fragment$6(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M2 15.5785L13.0701 26.5L22.7011 10.227L28 2");
    			attr_dev(path, "stroke", /*color*/ ctx[2]);
    			attr_dev(path, "stroke-width", "4");
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			add_location(path, file$6, 7, 4, 188);
    			attr_dev(svg, "width", /*width*/ ctx[0]);
    			attr_dev(svg, "height", /*height*/ ctx[1]);
    			attr_dev(svg, "viewBox", "0 0 30 29");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$6, 6, 0, 93);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*color*/ 4) {
    				attr_dev(path, "stroke", /*color*/ ctx[2]);
    			}

    			if (dirty & /*width*/ 1) {
    				attr_dev(svg, "width", /*width*/ ctx[0]);
    			}

    			if (dirty & /*height*/ 2) {
    				attr_dev(svg, "height", /*height*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
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
    	validate_slots("Check", slots, []);
    	let { width } = $$props;
    	let { height } = $$props;
    	let { color } = $$props;
    	const writable_props = ["width", "height", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Check> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({ width, height, color });

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width, height, color];
    }

    class Check extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { width: 0, height: 1, color: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Check",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*width*/ ctx[0] === undefined && !("width" in props)) {
    			console.warn("<Check> was created without expected prop 'width'");
    		}

    		if (/*height*/ ctx[1] === undefined && !("height" in props)) {
    			console.warn("<Check> was created without expected prop 'height'");
    		}

    		if (/*color*/ ctx[2] === undefined && !("color" in props)) {
    			console.warn("<Check> was created without expected prop 'color'");
    		}
    	}

    	get width() {
    		throw new Error("<Check>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Check>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Check>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Check>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Check>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Check>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\icons\Solve.svelte generated by Svelte v3.37.0 */

    const file$5 = "src\\icons\\Solve.svelte";

    function create_fragment$5(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M12.5 2V5.5V2ZM23 2V5.5V2ZM12.5 30V33.5V30ZM23 30V33.5V30ZM5.5 12.5H2H5.5ZM5.5 23H2H5.5ZM33.5 12.5H30H33.5ZM33.5 23H30H33.5ZM9 30H26.5C27.4283 30 28.3185 29.6313 28.9749 28.9749C29.6313 28.3185 30 27.4283 30 26.5V9C30 8.07174 29.6313 7.1815 28.9749 6.52513C28.3185 5.86875 27.4283 5.5 26.5 5.5H9C8.07174 5.5 7.1815 5.86875 6.52513 6.52513C5.86875 7.1815 5.5 8.07174 5.5 9V26.5C5.5 27.4283 5.86875 28.3185 6.52513 28.9749C7.1815 29.6313 8.07174 30 9 30ZM12.5 12.5H23V23H12.5V12.5Z");
    			attr_dev(path, "stroke", /*color*/ ctx[2]);
    			attr_dev(path, "stroke-width", "3");
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			add_location(path, file$5, 7, 4, 188);
    			attr_dev(svg, "width", /*width*/ ctx[0]);
    			attr_dev(svg, "height", /*height*/ ctx[1]);
    			attr_dev(svg, "viewBox", "0 0 35 35");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$5, 6, 0, 93);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*color*/ 4) {
    				attr_dev(path, "stroke", /*color*/ ctx[2]);
    			}

    			if (dirty & /*width*/ 1) {
    				attr_dev(svg, "width", /*width*/ ctx[0]);
    			}

    			if (dirty & /*height*/ 2) {
    				attr_dev(svg, "height", /*height*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
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
    	validate_slots("Solve", slots, []);
    	let { width } = $$props;
    	let { height } = $$props;
    	let { color } = $$props;
    	const writable_props = ["width", "height", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Solve> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({ width, height, color });

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width, height, color];
    }

    class Solve extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { width: 0, height: 1, color: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Solve",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*width*/ ctx[0] === undefined && !("width" in props)) {
    			console.warn("<Solve> was created without expected prop 'width'");
    		}

    		if (/*height*/ ctx[1] === undefined && !("height" in props)) {
    			console.warn("<Solve> was created without expected prop 'height'");
    		}

    		if (/*color*/ ctx[2] === undefined && !("color" in props)) {
    			console.warn("<Solve> was created without expected prop 'color'");
    		}
    	}

    	get width() {
    		throw new Error("<Solve>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Solve>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Solve>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Solve>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Solve>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Solve>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\icons\Erase.svelte generated by Svelte v3.37.0 */

    const file$4 = "src\\icons\\Erase.svelte";

    function create_fragment$4(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M287.55,260.218H149.47l131.846-131.846c10.437-10.437,10.437-27.419,0-37.856l-64.808-64.808\r\n\t\t\tc-10.437-10.437-27.419-10.436-37.856,0L11.788,192.573c-5.055,5.056-7.84,11.778-7.84,18.928c0,7.15,2.785,13.872,7.84,18.928\r\n\t\t\tl29.79,29.79H9.45c-5.218,0-9.45,4.231-9.45,9.45c0,5.219,4.231,9.45,9.45,9.45h278.1c5.218,0,9.45-4.231,9.45-9.45\r\n\t\t\tC297,264.45,292.769,260.218,287.55,260.218z M192.016,39.072c3.069-3.069,8.063-3.067,11.128,0l64.808,64.808\r\n\t\t\tc1.487,1.486,2.305,3.462,2.305,5.565c0,2.101-0.819,4.078-2.305,5.564L159.309,223.651l-75.936-75.936L192.016,39.072z\r\n\t\t\t M122.742,260.219H68.306l-43.154-43.155c-3.068-3.067-3.068-8.06,0-11.127l44.858-44.858l75.936,75.936L122.742,260.219z");
    			attr_dev(path, "fill", /*color*/ ctx[2]);
    			add_location(path, file$4, 7, 1, 175);
    			attr_dev(svg, "width", /*width*/ ctx[0]);
    			attr_dev(svg, "height", /*height*/ ctx[1]);
    			attr_dev(svg, "viewBox", "0 0 297 297");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$4, 6, 0, 93);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*color*/ 4) {
    				attr_dev(path, "fill", /*color*/ ctx[2]);
    			}

    			if (dirty & /*width*/ 1) {
    				attr_dev(svg, "width", /*width*/ ctx[0]);
    			}

    			if (dirty & /*height*/ 2) {
    				attr_dev(svg, "height", /*height*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
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
    	validate_slots("Erase", slots, []);
    	let { width } = $$props;
    	let { height } = $$props;
    	let { color } = $$props;
    	const writable_props = ["width", "height", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Erase> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({ width, height, color });

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width, height, color];
    }

    class Erase extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { width: 0, height: 1, color: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Erase",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*width*/ ctx[0] === undefined && !("width" in props)) {
    			console.warn("<Erase> was created without expected prop 'width'");
    		}

    		if (/*height*/ ctx[1] === undefined && !("height" in props)) {
    			console.warn("<Erase> was created without expected prop 'height'");
    		}

    		if (/*color*/ ctx[2] === undefined && !("color" in props)) {
    			console.warn("<Erase> was created without expected prop 'color'");
    		}
    	}

    	get width() {
    		throw new Error("<Erase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Erase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Erase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Erase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Erase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Erase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\ToolbarElement.svelte generated by Svelte v3.37.0 */
    const file$3 = "src\\components\\ToolbarElement.svelte";

    // (64:30) 
    function create_if_block_4(ctx) {
    	let erase;
    	let current;

    	erase = new Erase({
    			props: {
    				width: 25,
    				height: 25,
    				color: /*color*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(erase.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(erase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const erase_changes = {};
    			if (dirty & /*color*/ 4) erase_changes.color = /*color*/ ctx[2];
    			erase.$set(erase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(erase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(erase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(erase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(64:30) ",
    		ctx
    	});

    	return block;
    }

    // (62:30) 
    function create_if_block_3(ctx) {
    	let solve;
    	let current;

    	solve = new Solve({
    			props: {
    				width: 25,
    				height: 25,
    				color: /*color*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(solve.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(solve, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const solve_changes = {};
    			if (dirty & /*color*/ 4) solve_changes.color = /*color*/ ctx[2];
    			solve.$set(solve_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(solve.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(solve.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(solve, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(62:30) ",
    		ctx
    	});

    	return block;
    }

    // (60:30) 
    function create_if_block_2(ctx) {
    	let check;
    	let current;

    	check = new Check({
    			props: {
    				width: 25,
    				height: 25,
    				color: /*color*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(check.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(check, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const check_changes = {};
    			if (dirty & /*color*/ 4) check_changes.color = /*color*/ ctx[2];
    			check.$set(check_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(check.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(check.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(check, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(60:30) ",
    		ctx
    	});

    	return block;
    }

    // (58:29) 
    function create_if_block_1(ctx) {
    	let hint;
    	let current;

    	hint = new Hint({
    			props: {
    				width: 35,
    				height: 35,
    				color: /*color*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(hint.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(hint, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const hint_changes = {};
    			if (dirty & /*color*/ 4) hint_changes.color = /*color*/ ctx[2];
    			hint.$set(hint_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hint.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hint.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(hint, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(58:29) ",
    		ctx
    	});

    	return block;
    }

    // (56:4) {#if name == 'candidates'}
    function create_if_block$1(ctx) {
    	let candidates;
    	let current;

    	candidates = new Candidates({
    			props: {
    				width: 35,
    				height: 35,
    				color: /*color*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(candidates.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(candidates, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const candidates_changes = {};
    			if (dirty & /*color*/ 4) candidates_changes.color = /*color*/ ctx[2];
    			candidates.$set(candidates_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(candidates.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(candidates.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(candidates, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(56:4) {#if name == 'candidates'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let t0;
    	let span;
    	let t1_value = /*capitalize*/ ctx[3](/*name*/ ctx[0]) + "";
    	let t1;
    	let current;
    	let mounted;
    	let dispose;

    	const if_block_creators = [
    		create_if_block$1,
    		create_if_block_1,
    		create_if_block_2,
    		create_if_block_3,
    		create_if_block_4
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*name*/ ctx[0] == "candidates") return 0;
    		if (/*name*/ ctx[0] == "hint") return 1;
    		if (/*name*/ ctx[0] == "check") return 2;
    		if (/*name*/ ctx[0] == "solve") return 3;
    		if (/*name*/ ctx[0] == "erase") return 4;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			attr_dev(span, "class", "svelte-1aga6ss");
    			toggle_class(span, "isSelected", /*isSelected*/ ctx[1]);
    			add_location(span, file$3, 67, 4, 1695);
    			attr_dev(div, "class", "tool svelte-1aga6ss");
    			add_location(div, file$3, 54, 0, 1222);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			append_dev(div, t0);
    			append_dev(div, span);
    			append_dev(span, t1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*handleClick*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
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
    					if_block.m(div, t0);
    				} else {
    					if_block = null;
    				}
    			}

    			if ((!current || dirty & /*name*/ 1) && t1_value !== (t1_value = /*capitalize*/ ctx[3](/*name*/ ctx[0]) + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*isSelected*/ 2) {
    				toggle_class(span, "isSelected", /*isSelected*/ ctx[1]);
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
    			if (detaching) detach_dev(div);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			mounted = false;
    			dispose();
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
    	let isSelected;
    	let color;
    	let $activeTask;
    	validate_store(activeTask, "activeTask");
    	component_subscribe($$self, activeTask, $$value => $$invalidate(5, $activeTask = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ToolbarElement", slots, []);
    	let { name } = $$props;
    	name = name.toLowerCase();
    	let defaultIconColor = "#D3D3D3";
    	let selectedIconColor = "#04CDAA";

    	const capitalize = text => {
    		return text[0].toUpperCase() + text.slice(1).toLowerCase();
    	};

    	const handleClick = () => {
    		if ($activeTask == name) {
    			activeTask.set(undefined);
    		} else {
    			activeTask.set(name);
    		}
    	};

    	const writable_props = ["name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ToolbarElement> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		name,
    		Candidates,
    		Hint,
    		Check,
    		Solve,
    		Erase,
    		activeTask,
    		defaultIconColor,
    		selectedIconColor,
    		capitalize,
    		handleClick,
    		$activeTask,
    		isSelected,
    		color
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("defaultIconColor" in $$props) $$invalidate(6, defaultIconColor = $$props.defaultIconColor);
    		if ("selectedIconColor" in $$props) $$invalidate(7, selectedIconColor = $$props.selectedIconColor);
    		if ("isSelected" in $$props) $$invalidate(1, isSelected = $$props.isSelected);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeTask, name*/ 33) {
    			$$invalidate(1, isSelected = $activeTask == name);
    		}

    		if ($$self.$$.dirty & /*isSelected*/ 2) {
    			$$invalidate(2, color = isSelected ? selectedIconColor : defaultIconColor);
    		}
    	};

    	return [name, isSelected, color, capitalize, handleClick, $activeTask];
    }

    class ToolbarElement extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToolbarElement",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<ToolbarElement> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<ToolbarElement>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<ToolbarElement>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Toolbar.svelte generated by Svelte v3.37.0 */
    const file$2 = "src\\components\\Toolbar.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let toolbarelement0;
    	let t0;
    	let toolbarelement1;
    	let t1;
    	let toolbarelement2;
    	let t2;
    	let toolbarelement3;
    	let t3;
    	let toolbarelement4;
    	let current;

    	toolbarelement0 = new ToolbarElement({
    			props: { name: "candidates" },
    			$$inline: true
    		});

    	toolbarelement1 = new ToolbarElement({ props: { name: "hint" }, $$inline: true });
    	toolbarelement2 = new ToolbarElement({ props: { name: "check" }, $$inline: true });
    	toolbarelement3 = new ToolbarElement({ props: { name: "solve" }, $$inline: true });
    	toolbarelement4 = new ToolbarElement({ props: { name: "erase" }, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(toolbarelement0.$$.fragment);
    			t0 = space();
    			create_component(toolbarelement1.$$.fragment);
    			t1 = space();
    			create_component(toolbarelement2.$$.fragment);
    			t2 = space();
    			create_component(toolbarelement3.$$.fragment);
    			t3 = space();
    			create_component(toolbarelement4.$$.fragment);
    			attr_dev(div, "class", "svelte-j6jm7q");
    			add_location(div, file$2, 32, 0, 887);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(toolbarelement0, div, null);
    			append_dev(div, t0);
    			mount_component(toolbarelement1, div, null);
    			append_dev(div, t1);
    			mount_component(toolbarelement2, div, null);
    			append_dev(div, t2);
    			mount_component(toolbarelement3, div, null);
    			append_dev(div, t3);
    			mount_component(toolbarelement4, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toolbarelement0.$$.fragment, local);
    			transition_in(toolbarelement1.$$.fragment, local);
    			transition_in(toolbarelement2.$$.fragment, local);
    			transition_in(toolbarelement3.$$.fragment, local);
    			transition_in(toolbarelement4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toolbarelement0.$$.fragment, local);
    			transition_out(toolbarelement1.$$.fragment, local);
    			transition_out(toolbarelement2.$$.fragment, local);
    			transition_out(toolbarelement3.$$.fragment, local);
    			transition_out(toolbarelement4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(toolbarelement0);
    			destroy_component(toolbarelement1);
    			destroy_component(toolbarelement2);
    			destroy_component(toolbarelement3);
    			destroy_component(toolbarelement4);
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
    	let $sudoku;
    	validate_store(sudoku, "sudoku");
    	component_subscribe($$self, sudoku, $$value => $$invalidate(0, $sudoku = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Toolbar", slots, []);

    	activeTask.subscribe(async task => {
    		if (task == "solve") {
    			let hint = -1;

    			let interval = setInterval(
    				async () => {
    					if (hint == undefined) {
    						clearInterval(interval);
    						activeTask.set(undefined);
    						return;
    					}

    					await sudoku.updateCandidates();
    					hint = getHint($sudoku)?.getAsObject();

    					if (hint != undefined) {
    						//@ts-ignore
    						sudoku.setCellValue(hint.index, hint.value);
    					}
    				},
    				50
    			);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Toolbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ToolbarElement,
    		sudoku,
    		activeTask,
    		getHint,
    		$sudoku
    	});

    	return [];
    }

    class Toolbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toolbar",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\Notification.svelte generated by Svelte v3.37.0 */
    const file$1 = "src\\components\\Notification.svelte";

    // (80:0) {#if $notificationManager != undefined}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let p;
    	let t0_value = /*$notificationManager*/ ctx[0].message + "";
    	let t0;
    	let t1;
    	let svg;
    	let path;
    	let div1_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			svg = svg_element("svg");
    			path = svg_element("path");
    			add_location(p, file$1, 83, 8, 1637);
    			attr_dev(div0, "class", "content svelte-1mhkz0i");
    			add_location(div0, file$1, 82, 4, 1606);
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M6 18L18 6M6 6l12 12");
    			add_location(path, file$1, 87, 8, 1814);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "fill", "white");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "white");
    			attr_dev(svg, "class", "svelte-1mhkz0i");
    			add_location(svg, file$1, 86, 4, 1694);
    			attr_dev(div1, "class", div1_class_value = "notification " + /*$notificationManager*/ ctx[0].status + " svelte-1mhkz0i");
    			toggle_class(div1, "hide", /*$notificationManager*/ ctx[0].dismiss);
    			add_location(div1, file$1, 81, 0, 1502);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(p, t0);
    			append_dev(div1, t1);
    			append_dev(div1, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(svg, "click", /*crossClick*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$notificationManager*/ 1 && t0_value !== (t0_value = /*$notificationManager*/ ctx[0].message + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$notificationManager*/ 1 && div1_class_value !== (div1_class_value = "notification " + /*$notificationManager*/ ctx[0].status + " svelte-1mhkz0i")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*$notificationManager, $notificationManager*/ 1) {
    				toggle_class(div1, "hide", /*$notificationManager*/ ctx[0].dismiss);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(80:0) {#if $notificationManager != undefined}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*$notificationManager*/ ctx[0] != undefined && create_if_block(ctx);

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
    			if (/*$notificationManager*/ ctx[0] != undefined) {
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $notificationManager;
    	validate_store(notificationManager, "notificationManager");
    	component_subscribe($$self, notificationManager, $$value => $$invalidate(0, $notificationManager = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Notification", slots, []);

    	const crossClick = () => {
    		notificationManager.dismiss($notificationManager.id);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Notification> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		notificationManager,
    		crossClick,
    		$notificationManager
    	});

    	return [$notificationManager, crossClick];
    }

    class Notification extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Notification",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.37.0 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let div1;
    	let div0;
    	let grid;
    	let t0;
    	let toolbar;
    	let t1;
    	let hintpopup;
    	let t2;
    	let checkpopup;
    	let t3;
    	let utils;
    	let t4;
    	let notification;
    	let current;
    	grid = new Grid({ $$inline: true });
    	toolbar = new Toolbar({ $$inline: true });
    	hintpopup = new HintPopup({ $$inline: true });
    	checkpopup = new CheckPopup({ $$inline: true });
    	utils = new Utils({ $$inline: true });
    	notification = new Notification({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(grid.$$.fragment);
    			t0 = space();
    			create_component(toolbar.$$.fragment);
    			t1 = space();
    			create_component(hintpopup.$$.fragment);
    			t2 = space();
    			create_component(checkpopup.$$.fragment);
    			t3 = space();
    			create_component(utils.$$.fragment);
    			t4 = space();
    			create_component(notification.$$.fragment);
    			attr_dev(div0, "class", "column svelte-t580z7");
    			add_location(div0, file, 28, 4, 673);
    			attr_dev(div1, "class", "container svelte-t580z7");
    			add_location(div1, file, 27, 0, 645);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(grid, div0, null);
    			append_dev(div0, t0);
    			mount_component(toolbar, div0, null);
    			insert_dev(target, t1, anchor);
    			mount_component(hintpopup, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(checkpopup, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(utils, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(notification, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(grid.$$.fragment, local);
    			transition_in(toolbar.$$.fragment, local);
    			transition_in(hintpopup.$$.fragment, local);
    			transition_in(checkpopup.$$.fragment, local);
    			transition_in(utils.$$.fragment, local);
    			transition_in(notification.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(grid.$$.fragment, local);
    			transition_out(toolbar.$$.fragment, local);
    			transition_out(hintpopup.$$.fragment, local);
    			transition_out(checkpopup.$$.fragment, local);
    			transition_out(utils.$$.fragment, local);
    			transition_out(notification.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(grid);
    			destroy_component(toolbar);
    			if (detaching) detach_dev(t1);
    			destroy_component(hintpopup, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(checkpopup, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(utils, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(notification, detaching);
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
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Utils,
    		HintPopup,
    		CheckPopup,
    		Grid,
    		Toolbar,
    		Notification
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    //@ts-ignore
    var app = new App({
        target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
