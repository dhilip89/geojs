var vgl = require('vgl');
var inherit = require('./inherit');

/**
 * Create a new instance of class object
 *
 * @class
 * @alias geo.object
 * @extends vgl.object
 * @returns {geo.object}
 */
var object = function () {
  'use strict';
  if (!(this instanceof object)) {
    return new object();
  }

  var m_this = this,
      m_eventHandlers = {},
      m_idleHandlers = [],
      m_promiseCount = 0;

  /**
   *  Bind a handler that will be called once when all internal promises are
   *  resolved.
   *
   *  @param {function} handler A function taking no arguments.
   *  @returns {this}
   */
  this.onIdle = function (handler) {
    if (m_promiseCount) {
      m_idleHandlers.push(handler);
    } else {
      handler();
    }
    return m_this;
  };

  /**
   *  Add a new promise object preventing idle event handlers from being called
   *  until it is resolved.
   *
   *  @param {Promise} promise A promise object.
   *  @returns {this}
   */
  this.addPromise = function (promise) {
    // called on any resolution of the promise
    function onDone() {
      m_promiseCount -= 1;
      if (!m_promiseCount) {
        m_idleHandlers.splice(0, m_idleHandlers.length)
          .forEach(function (handler) {
            handler();
          });
      }
    }
    m_promiseCount += 1;
    promise.then(onDone, onDone);
    return m_this;
  };

  /**
   *  Bind an event handler to this object.
   *
   *  @param {string} event An event from {@link geo.event} or a user-defined
   *    value.
   *  @param {function} handler A function that is called when `event` is
   *    triggered.  The function is passed a {@link geo.event} object.
   *  @returns {this}
   */
  this.geoOn = function (event, handler) {
    if (Array.isArray(event)) {
      event.forEach(function (e) {
        m_this.geoOn(e, handler);
      });
      return m_this;
    }
    if (!m_eventHandlers.hasOwnProperty(event)) {
      m_eventHandlers[event] = [];
    }
    m_eventHandlers[event].push(handler);
    return m_this;
  };

  /**
   *  Trigger an event (or events) on this object and call all handlers.
   *
   *  @param {string|string[]} event An event or list of events from
   *        {@link geo.event} or defined by the user.
   *  @param {object} [args] Additional information to add to the
   *    {@link geo.event} object passed to the handlers.
   *  @returns {this}
   */
  this.geoTrigger = function (event, args) {

    // if we have an array of events, recall with single events
    if (Array.isArray(event)) {
      event.forEach(function (e) {
        m_this.geoTrigger(e, args);
      });
      return m_this;
    }

    // append the event type to the argument object
    args = args || {};
    args.event = event;

    if (m_eventHandlers.hasOwnProperty(event)) {
      m_eventHandlers[event].forEach(function (handler) {
        handler.call(m_this, args);
      });
    }

    return m_this;
  };

  /**
   *  Remove handlers from one event or an array of events.  If no event is
   *  provided all handlers will be removed.
   *
   *  @param {string|string[]} [event] An event or a list of events from
   *        {@link geo.event} or defined by the user, or `undefined` to remove
   *        all events (in which case `arg` is ignored).
   *  @param {(function|function[])?} [arg] A function or array of functions to
   *        remove from the events or a falsey value to remove all handlers
   *        from the events.
   */
  this.geoOff = function (event, arg) {
    if (event === undefined) {
      m_eventHandlers = {};
      m_idleHandlers = [];
      m_promiseCount = 0;
    }
    if (Array.isArray(event)) {
      event.forEach(function (e) {
        m_this.geoOff(e, arg);
      });
      return m_this;
    }
    if (!arg) {
      m_eventHandlers[event] = [];
    } else if (Array.isArray(arg)) {
      arg.forEach(function (handler) {
        m_this.geoOff(event, handler);
      });
      return m_this;
    }
    if (m_eventHandlers.hasOwnProperty(event)) {
      m_eventHandlers[event] = m_eventHandlers[event].filter(function (f) {
        return f !== arg;
      }
      );
    }
    return m_this;
  };

  /**
   * Free all resources and destroy the object.
   */
  this._exit = function () {
    m_this.geoOff();
  };

  vgl.object.call(this);

  return this;
};

inherit(object, vgl.object);
module.exports = object;
