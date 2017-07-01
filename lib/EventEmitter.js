"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _Listener = require("./Listener");

var _Listener2 = _interopRequireDefault(_Listener);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _listeners = Symbol();
var _createListener = Symbol();
var _addListener = Symbol();
var _compareListenerPriorities = Symbol();
var _getEventListeners = Symbol();
var _executeEventListeners = Symbol();
var _executeEventListener = Symbol();

var EventEmitter = class EventEmitter {
    constructor() {
        this[_listeners] = new Map();
    }

    *emit(name) {
        for (var _len = arguments.length, parameters = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            parameters[_key - 1] = arguments[_key];
        }

        yield this[_executeEventListeners](name, parameters);
    }

    on(name, handler, options) {
        if (typeof handler !== "function") {
            throw new TypeError("Event (named \"" + name + "\") listener must be a function");
        }

        var listener = this[_createListener](handler, options);

        this[_addListener](name, listener);
    }

    [_createListener](handler, options) {
        var listener = new _Listener2.default();
        listener.handler = handler;
        listener.priority = 0;

        if (options instanceof Object === false) {
            options = {};
        }

        if (options.hasOwnProperty("priority")) {
            var priority = options.priority;
            listener.priority = priority;
        }

        return listener;
    }

    [_addListener](name, listener) {
        var listeners = this[_getEventListeners](name);
        listeners.push(listener);

        listeners.sort(this[_compareListenerPriorities]);
    }

    [_compareListenerPriorities](firstListener, secondListener) {
        if (firstListener.priority > secondListener.priority) {
            return -1;
        }

        if (firstListener.priority < secondListener.priority) {
            return 1;
        }

        return 0;
    }

    [_getEventListeners](name) {
        var listeners = [];

        if (this[_listeners].has(name)) {
            listeners = this[_listeners].get(name);
        } else {
            this[_listeners].set(name, listeners);
        }

        return listeners;
    }

    *[_executeEventListeners](name, args) {
        var listeners = this[_getEventListeners](name);

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = listeners[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var listener = _step.value;

                try {
                    yield this[_executeEventListener](listener, args);
                } catch (error) {
                    yield this.emit("error", error);
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }

    *[_executeEventListener](listener, args) {
        var handler = listener.handler;

        if (handler.constructor.name === "GeneratorFunction") {
            yield* handler.apply(this, args);
        } else {
            handler.apply(this, args);
        }
    }
};
exports.default = EventEmitter;
module.exports = exports["default"];