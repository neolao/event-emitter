/* @flow */
import Listener from "./Listener"

// Private properties and methods
const _listeners:Symbol = Symbol();
const _createListener:Symbol = Symbol();
const _addListener:Symbol = Symbol();
const _compareListenerPriorities:Symbol = Symbol();
const _getEventListeners:Symbol = Symbol();
const _executeEventListeners:Symbol = Symbol();
const _executeEventListener:Symbol = Symbol();

/**
 * An event emitter written with generators
 */
export default class EventEmitter
{
    /**
     * Listeners
     */
    // $FlowFixMe
    [_listeners]:Map<string, Listener>;

    /**
     * Constructor
     */
    constructor():void
    {
        // Initialize the map of listeners
        // $FlowFixMe
        this[_listeners] = new Map();
    }

    /**
     * Emit an event
     *
     * @param   {string}    name        Event name
     * @param   {...*}      parameters  Parameters
     */
    *emit(name:string, ...parameters?:Array<*>):Generator<*,void,*>
    {
        // Execute each listener
        // $FlowFixMe
        yield this[_executeEventListeners](name, parameters);
    }

    /**
     * Add a listener
     *
     * @param   {string}    name        Event name
     * @param   {Function}  handler     Handler function
     * @param   {Object}    options     Options
     */
    on(name:string, handler:Function, options?:Object):void
    {
        if (typeof handler !== "function") {
            throw new TypeError(`Event (named "${name}") listener must be a function`);
        }

        // Create listener instance
        // $FlowFixMe
        const listener = this[_createListener](handler, options);

        // Add listener to the dedicated list of the event name
        // $FlowFixMe
        this[_addListener](name, listener);
    }

    /**
     * Create listener instance
     *
     * @private
     * @param   {Function}  handler     Handler function
     * @param   {Object}    options     Options
     * @return  {Listener}              Listener instance
     */
    // $FlowFixMe
    [_createListener](handler:Function, options?:Object):Listener
    {
        let listener = new Listener;
        listener.handler = handler;
        listener.priority = 0;

        // Create options if necessary
        if (options instanceof Object === false) {
            options = {};
        }

        // Set priority
        if (options.hasOwnProperty("priority")) {
            const priority:number = options.priority;
            listener.priority = priority;
        }

        return listener;
    }

    /**
     * Add listener
     *
     * @private
     * @param   {string}    name        Event name
     * @param   {Listener}  listener    Listener instance
     */
    // $FlowFixMe
    [_addListener](name:string, listener:Listener):void
    {
        let listeners:Array<Listener> = this[_getEventListeners](name);
        listeners.push(listener);

        // Sort by priority
        listeners.sort(this[_compareListenerPriorities]);
    }

    /**
     * Compare priorities of 2 listeners
     *
     * @private
     * @param   {Listener}  firstListener       First listener instance
     * @param   {Listener}  secondListener      Second listener instance
     * @return  {number}                        -1 if the first priority is higher than the second,
     *                                          1 if the first priority is lower than the second,
     *                                          0 otherwise
     */
    // $FlowFixMe
    [_compareListenerPriorities](firstListener:Listener, secondListener:Listener):void
    {
        if (firstListener.priority > secondListener.priority) {
            return -1;
        }

        if (firstListener.priority < secondListener.priority) {
            return 1;
        }

        return 0;
    }

    /**
     * Get the listeners of an event name
     *
     * @private
     * @param   {string}            name    Event name
     * @return  {Array<Listener>}           Listeners of the specified event
     */
    // $FlowFixMe
    [_getEventListeners](name:string):Array<Listener>
    {
        let listeners:Array<Listener> = [];

        // Get listener list from Map
        // Create the entry if necessary
        if (this[_listeners].has(name)) {
            listeners = this[_listeners].get(name);
        } else {
            this[_listeners].set(name, listeners);
        }

        return listeners;
    }

    /**
     * Execute the listeners of an event name
     *
     * @private
     * @param   {string}    name    Event name
     * @param   {Array<*>}  args    Arguments of the listeners
     */
    // $FlowFixMe
    *[_executeEventListeners](name:string, args?:Array<*>):Generator<*,void,*>
    {
        // Get the listeners
        const listeners:Array<Listener> = this[_getEventListeners](name);

        for (let listener:Listener of listeners) {
            yield this[_executeEventListener](listener, args);
        }
    }

    /**
     * Execute a listener
     *
     * @private
     * @param   {Listener}  listener    Listener
     * @param   {Array<*>}  args        Listener arguments
     */
    // $FlowFixMe
    *[_executeEventListener](listener:Listener, args?:Array<*>):Generator<*,void,*>
    {
        const handler = listener.handler;

        if (handler.constructor.name === "GeneratorFunction") {
            yield *handler.apply(this, args);
        } else {
            handler.apply(this, args);
        }
    }
}

