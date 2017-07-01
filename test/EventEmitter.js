import chai from "chai"
import EventEmitter from "../lib/EventEmitter"

const expect = chai.expect;
const should = chai.should;

/**
 * Test EventEmitter class
 */
describe("EventEmitter", () => {
    /**
     * Test "on()" method
     */
    describe("#on()", () => {
        /**
         * Add a function
         */
        it("should add a listener", function *() {
            let emitter = new EventEmitter;
            expect(() => {
                emitter.on("foo", () => {
                    console.log("bar");
                });
            }).to.not.throw(Error);
        });

        /**
         * Add something else
         */
        it("should throw a TypeError if the listener is not a function", function *() {
            let emitter = new EventEmitter;
            expect(() => {
                emitter.on("foo", 42);
            }).to.throw(TypeError);
        });
    });

    /**
     * Test "emit()" method
     */
    describe("#emit()", () => {
        /**
         * Add 1 listener
         */
        it("should call listener", function *() {
            let emitter = new EventEmitter;
            let called = false;

            // Add listener
            emitter.on("foo", () => {
                called = true;
            });

            // Emit event
            yield emitter.emit("foo");

            // Test
            expect(called).to.be.true;
        });

        /**
         * Add 2 listeners
         */
        it("should call several listeners", function *() {
            let emitter = new EventEmitter;
            let callCount = 0;

            // Add first listener
            emitter.on("foo", () => {
                callCount++;
            });

            // Add second listener
            emitter.on("foo", () => {
                callCount++;
            });

            // Emit event
            yield emitter.emit("foo");

            // Test
            expect(callCount).to.equal(2);
        });

        /**
         * Emit arguments
         */
        it("should call several listeners with arguments", function *() {
            let emitter = new EventEmitter;
            let symbol = Symbol();
            let collected = [];

            // Add first listener
            emitter.on("foo", (a, b, c, d) => {
                collected.push(a, b, c, d);
            });

            // Add second listener
            emitter.on("foo", (a, b, c, d) => {
                collected.push(a, b, c, d);
            });

            // Emit event
            yield emitter.emit("foo", "a", 42, true, symbol);

            // Test
            expect(collected).to.deep.equal(["a", 42, true, symbol, "a", 42, true, symbol]);
        });

        /**
         * Handle generator listener
         */
        it("should call generator listener", function *() {
            let emitter = new EventEmitter;
            let symbol = Symbol();
            let collected = [];

            // Add generator listener
            emitter.on("foo", function *(a, b, c, d) {
                collected.push(a, b, c, d);
            });

            // Emit event
            yield emitter.emit("foo", "a", 42, true, symbol);

            // Test
            expect(collected).to.deep.equal(["a", 42, true, symbol]);
        });

        /**
         * Handle priority
         */
        it("should call listener in correct order", function *() {
            let emitter = new EventEmitter;
            let collected = [];

            // Add first listener
            emitter.on("foo", function *() {
                collected.push("b");
            });

            // Add second listener
            emitter.on("foo", function *() {
                collected.push("a");
            }, {priority: 2});

            // Emit event
            yield emitter.emit("foo");

            // Test
            expect(collected).to.deep.equal(["a", "b"]);
        });
    });
});
