/*!
* js-data
* @version 3.0.0-alpha.10 - Homepage <http://www.js-data.io/>
* @author Jason Dobry <jason.dobry@gmail.com>
* @copyright (c) 2014-2015 Jason Dobry
* @license MIT <https://github.com/js-data/js-data/blob/master/LICENSE>
*
* @overview Robust framework-agnostic data store.
*/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.JSData = {})));
}(this, function (exports) { 'use strict';

  var babelHelpers = {};
  babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  babelHelpers.defineProperty = function (obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  };

  babelHelpers;

  /**
   * @module utils
   * @memberof module:js-data
   */

  var INFINITY = 1 / 0;
  var MAX_INTEGER = 1.7976931348623157e+308;
  var BOOL_TAG = '[object Boolean]';
  var DATE_TAG = '[object Date]';
  var FUNC_TAG = '[object Function]';
  var NUMBER_TAG = '[object Number]';
  var OBJECT_TAG = '[object Object]';
  var REGEXP_TAG = '[object RegExp]';
  var STRING_TAG = '[object String]';
  var objToString = Object.prototype.toString;

  var toString = function toString(value) {
    return objToString.call(value);
  };
  var toInteger = function toInteger(value) {
    if (!value) {
      return value === 0 ? value : 0;
    }
    value = +value;
    if (value === INFINITY || value === -INFINITY) {
      var sign = value < 0 ? -1 : 1;
      return sign * MAX_INTEGER;
    }
    var remainder = value % 1;
    return value === value ? remainder ? value - remainder : value : 0;
  };

  /**
   * Return whether the provided value is an array.
   * @method
   * @param {*} [value] - The value to test.
   */
  var isArray = Array.isArray;
  /**
   * Return whether the provided value is an object type.
   * @param {*} [value] - The value to test.
   */
  function isObject(value) {
    return toString(value) === OBJECT_TAG;
  }
  function isPlainObject(value) {
    return !!value && (typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object' && value.constructor === Object;
  }
  /**
   * Return whether the provided value is a regular expression type.
   * @param {*} [value] - The value to test.
   */
  function isRegExp(value) {
    return toString(value) === REGEXP_TAG;
  }
  /**
   * Return whether the provided value is a string type.
   * @param {*} [value] - The value to test.
   */
  var isString = function isString(value) {
    return typeof value === 'string' || value && (typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object' && toString(value) === STRING_TAG;
  };
  /**
   * Return whether the provided value is null.
   * @param {*} [value] - The value to test.
   */
  var isNull = function isNull(value) {
    return value === null;
  };
  /**
   * Return whether the provided value is undefined.
   * @param {*} [value] - The value to test.
   */
  var isUndefined = function isUndefined(value) {
    return value === undefined;
  };
  /**
   * Return whether the provided value is a date type.
   * @param {*} [value] - The value to test.
   */
  var isDate = function isDate(value) {
    return value && (typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object' && toString(value) === DATE_TAG;
  };
  /**
   * Return whether the provided value is a number type.
   * @param {*} [value] - The value to test.
   */
  var isNumber = function isNumber(value) {
    var type = typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value);
    return type === 'number' || value && type === 'object' && toString(value) === NUMBER_TAG;
  };
  /**
   * Return whether the provided value is an integer.
   * @param {*} [value] - The value to test.
   */
  var isInteger = function isInteger(value) {
    return toString(value) === NUMBER_TAG && value == toInteger(value);
  };
  /**
   * Return whether the provided value is a boolean type.
   * @param {*} [value] - The value to test.
   */
  function isBoolean(value) {
    return toString(value) === BOOL_TAG;
  }
  /**
   * Return whether the provided value is a function.
   * @param {*} [value] - The value to test.
   */
  function isFunction(value) {
    return typeof value === 'function' || value && toString(value) === FUNC_TAG;
  }
  /**
   * Return whether the provided value is a string or a number.
   * @param {*} [value] - The value to test.
   */
  function isSorN(value) {
    return isString(value) || isNumber(value);
  }
  /**
   * Get the value at the provided key or path.
   * @param {Object} object - The object from which to retrieve a property.
   * @param {string} prop - The key or path to the property.
   */
  function get(object, prop) {
    if (!prop) {
      return;
    }
    var parts = prop.split('.');
    var last = parts.pop();

    while (prop = parts.shift()) {
      // eslint-disable-line
      object = object[prop];
      if (object == null) return;
    }

    return object[last];
  }
  /**
   * Unset the value at the provided key or path.
   * @param {Object} object - The object on which to unset a property.
   * @param {string} prop - The key or path to the property.
   */
  function unset(object, prop) {
    var parts = prop.split('.');
    var last = parts.pop();

    while (prop = parts.shift()) {
      // eslint-disable-line
      object = object[prop];
      if (object == null) return;
    }

    object[last] = undefined;
    delete object[last];
  }
  function mkdirP(object, path) {
    if (!path) {
      return object;
    }
    var parts = path.split('.');
    parts.forEach(function (key) {
      if (!object[key]) {
        object[key] = {};
      }
      object = object[key];
    });
    return object;
  }
  var PATH = /^(.+)\.(.+)$/;
  /**
   * Set the value at the provided key or path.
   * @param {Object} object - The object on which to set a property.
   * @param {(string|Object)} path - The key or path to the property. Can also
   * pass in an object of path/value pairs, which will all be set on the target
   * object.
   * @param {*} [value] - The value to set.
   */
  function _set(object, path, value) {
    if (isObject(path)) {
      forOwn(path, function (value, _path) {
        _set(object, _path, value);
      });
    } else {
      var parts = PATH.exec(path);
      if (parts) {
        mkdirP(object, parts[1])[parts[2]] = value;
      } else {
        object[path] = value;
      }
    }
  }
  /**
   * Iterate over an object's own enumerable properties.
   * @param {Object} object - The object whose properties are to be enumerated.
   * @param {Function} fn - Iteration function.
   * @param {Object} [thisArg] - Content to which to bind `fn`.
   */
  function forOwn(obj, fn, thisArg) {
    var keys = Object.keys(obj);
    var len = keys.length;
    var i = undefined;
    for (i = 0; i < len; i++) {
      fn.call(thisArg, obj[keys[i]], keys[i], obj);
    }
  }
  /**
   * Recursively shallow copy own enumberable properties from `source` to `dest`.
   * @param {Object} dest - The destination object.
   * @param {Object} source - The source object.
   */
  function deepMixIn(dest, source) {
    if (source) {
      forOwn(source, function (value, key) {
        var existing = this[key];
        if (isPlainObject(value) && isPlainObject(existing)) {
          deepMixIn(existing, value);
        } else {
          this[key] = value;
        }
      }, dest);
    }
    return dest;
  }
  /**
   * Proxy for `Promise.resolve`.
   * @param {*} [value] - Value with which to resolve the Promise.
   * @return {Promise} Promise resolved with `value`.
   */
  function resolve$1(value) {
    return Promise.resolve(value);
  }
  /**
   * Proxy for `Promise.reject`.
   * @param {*} [value] - Value with which to reject the Promise.
   * @return {Promise} Promise reject with `value`.
   */
  function reject(value) {
    return Promise.reject(value);
  }
  /**
   * Shallow copy own enumerable non-function properties from `Model` to `opts`.
   * @param {Model} Model - The source Model.
   * @param {Object} opts - The target object.
   */
  function _(Model, opts) {
    for (var key in Model) {
      var value = Model[key];
      if (opts[key] === undefined && !isFunction(value) && key && key.indexOf('_') !== 0) {
        opts[key] = value;
      }
    }
  }
  /**
   * Return the intersection of two arrays.
   * @param {Array} array1 - First array.
   * @param {Array} array2 - Second array.
   * @return {Array} Array of elements common to both arrays.
   */
  function intersection(array1, array2) {
    if (!array1 || !array2) {
      return [];
    }
    var result = [];
    var item = undefined;
    var i = undefined;
    var len = array1.length;
    for (i = 0; i < len; i++) {
      item = array1[i];
      if (result.indexOf(item) !== -1) {
        continue;
      }
      if (array2.indexOf(item) !== -1) {
        result.push(item);
      }
    }
    return result;
  }
  /**
   * Shallow copy own enumerable properties from `src` to `dest` that are on `src`
   * but are missing from `dest.
   * @param {Object} dest - The destination object.
   * @param {Object} source - The source object.
   */
  function fillIn(dest, src) {
    forOwn(src, function (value, key) {
      if (dest[key] === undefined) {
        dest[key] = value;
      }
    });
  }
  /**
   * Return whether `prop` is matched by any string or regular expression in `bl`.
   * @param {string} prop - The name of a property.
   * @param {Array} bl - Array of strings and regular expressions.
   * @return {boolean} Whether `prop` was matched.
   */
  function isBlacklisted(prop, bl) {
    if (!bl || !bl.length) {
      return false;
    }
    var matches = undefined;
    for (var i = 0; i < bl.length; i++) {
      if (toString(bl[i]) === '[object RegExp]' && bl[i].test(prop) || bl[i] === prop) {
        matches = prop;
        return matches;
      }
    }
    return !!matches;
  }
  /**
   * Proxy for `JSON.parse`.
   * @param {string} json - JSON to parse.
   * @return {Object} Parsed object.
   */
  function fromJson(json) {
    return isString(json) ? JSON.parse(json) : json;
  }
  /**
   * Proxy for `JSON.stringify`.
   * @method
   * @param {*} value - Value to serialize to JSON.
   * @return {string} JSON string.
   */
  var toJson = JSON.stringify;
  /**
   * Deep copy a value.
   * @param {*} from - Value to deep copy.
   * @return {*} Deep copy of `from`.
   */
  function copy(from, to, stackFrom, stackTo, blacklist) {
    if (!to) {
      to = from;
      if (from) {
        if (isArray(from)) {
          to = copy(from, [], stackFrom, stackTo, blacklist);
        } else if (isDate(from)) {
          to = new Date(from.getTime());
        } else if (isRegExp(from)) {
          to = new RegExp(from.source, from.toString().match(/[^\/]*$/)[0]);
          to.lastIndex = from.lastIndex;
        } else if (isObject(from)) {
          to = copy(from, Object.create(Object.getPrototypeOf(from)), stackFrom, stackTo, blacklist);
        }
      }
    } else {
      if (from === to) {
        throw new Error('Cannot copy! Source and destination are identical.');
      }

      stackFrom = stackFrom || [];
      stackTo = stackTo || [];

      if (isObject(from)) {
        var index = stackFrom.indexOf(from);
        if (index !== -1) {
          return stackTo[index];
        }

        stackFrom.push(from);
        stackTo.push(to);
      }

      var result = undefined;
      if (isArray(from)) {
        var i = undefined;
        to.length = 0;
        for (i = 0; i < from.length; i++) {
          result = copy(from[i], null, stackFrom, stackTo, blacklist);
          if (isObject(from[i])) {
            stackFrom.push(from[i]);
            stackTo.push(result);
          }
          to.push(result);
        }
      } else {
        if (isArray(to)) {
          to.length = 0;
        } else {
          forOwn(to, function (value, key) {
            delete to[key];
          });
        }
        for (var key in from) {
          if (from.hasOwnProperty(key)) {
            if (isBlacklisted(key, blacklist)) {
              continue;
            }
            result = copy(from[key], null, stackFrom, stackTo, blacklist);
            if (isObject(from[key])) {
              stackFrom.push(from[key]);
              stackTo.push(result);
            }
            to[key] = result;
          }
        }
      }
    }
    return to;
  }
  var SPLIT = /\s+/;
  var NON_ALPHA = /[^A-Za-z]/g;
  var PASCAL_CASE = /(\w)(\w*)/g;
  function pascalize(g0, g1, g2) {
    return '' + g1.toUpperCase() + g2.toLowerCase();
  }
  function mapToPascal(x) {
    return x.replace(NON_ALPHA, '').replace(PASCAL_CASE, pascalize);
  }
  /**
   * Convert a string to pascalcase.
   * @param {string} str - String to convert.
   * @return {string} Converted string.
   */
  function pascalCase(str) {
    return str.split(SPLIT).map(mapToPascal).join('');
  }
  /**
   * Convert a string to camelcase.
   * @param {string} str - String to convert.
   * @return {string} Converted string.
   */
  function camelCase(str) {
    str = pascalCase(str);
    if (str) {
      return str.charAt(0).toLowerCase() + str.slice(1);
    }
    return str;
  }
  /**
   * Add eventing capabilities into the target object.
   * @param {Object} target - Target object.
   * @param {Function} [getter] - Custom getter for retrieving the object's event
   * listeners.
   * @param {Function} [setter] - Custom setter for setting the object's event
   * listeners.
   */
  function eventify(target, getter, setter, enumerable) {
    target = target || this;
    var _events = {};
    if (!getter && !setter) {
      getter = function getter() {
        return _events;
      };
      setter = function setter(value) {
        _events = value;
      };
    }
    Object.defineProperties(target, {
      on: {
        enumerable: !!enumerable,
        value: function value(type, func, ctx) {
          if (!getter.call(this)) {
            setter.call(this, {});
          }
          var events = getter.call(this);
          events[type] = events[type] || [];
          events[type].push({
            f: func,
            c: ctx
          });
        }
      },
      off: {
        enumerable: !!enumerable,
        value: function value(type, func) {
          var events = getter.call(this);
          var listeners = events[type];
          if (!listeners) {
            setter.call(this, {});
          } else if (func) {
            for (var i = 0; i < listeners.length; i++) {
              if (listeners[i].f === func) {
                listeners.splice(i, 1);
                break;
              }
            }
          } else {
            listeners.splice(0, listeners.length);
          }
        }
      },
      emit: {
        enumerable: !!enumerable,
        value: function value() {
          var events = getter.call(this) || {};

          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          var type = args.shift();
          var listeners = events[type] || [];
          var i = undefined;
          for (i = 0; i < listeners.length; i++) {
            listeners[i].f.apply(listeners[i].c, args);
          }
          listeners = events.all || [];
          args.unshift(type);
          for (i = 0; i < listeners.length; i++) {
            listeners[i].f.apply(listeners[i].c, args);
          }
        }
      }
    });
  }

  /*eslint-disable*/
  // RiveraGroup/node-tiny-uuid
  // DO WTF YOU WANT TO PUBLIC LICENSE
  function uuid(a, b) {
    for (b = a = ''; // b - result , a - numeric variable
    a++ < 36; b += a * 51 & 52 // if "a" is not 9 or 14 or 19 or 24
    ? //  return a random number or 4
    (a ^ 15 // if "a" is not 15
    ? // genetate a random number from 0 to 15
    8 ^ Math.random() * (a ^ 20 ? 16 : 4) // unless "a" is 20, in which case a random number from 8 to 11
    : 4 //  otherwise 4
    ).toString(16) : '-' //  in other cases (if "a" is 9,14,19,24) insert "-"
    ) {}
    return b;
  }
  /*eslint-enable*/

  function classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError('Cannot call a class as a function');
    }
  }

  function possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }

    return call && ((typeof call === 'undefined' ? 'undefined' : babelHelpers.typeof(call)) === 'object' || typeof call === 'function') ? call : self;
  }

  function addHiddenPropsToTarget(target, props) {
    forOwn(props, function (value, key) {
      props[key] = {
        value: value
      };
    });
    Object.defineProperties(target, props);
  }

  function extend(props, classProps) {
    var Parent = this;
    var _Child = undefined;

    props || (props = {});
    classProps || (classProps = {});

    if (props.hasOwnProperty('constructor')) {
      _Child = props.constructor;
      delete props.constructor;
    } else {
      _Child = function Child() {
        classCallCheck(this, _Child);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        var _this = possibleConstructorReturn(this, (_Child.__super__ || Object.getPrototypeOf(_Child)).apply(this, args));
        return _this;
      };
    }

    _Child.prototype = Object.create(Parent && Parent.prototype, {
      constructor: {
        value: _Child,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });

    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(_Child, Parent);
    } else if (classProps.strictEs6Class) {
      _Child.__proto__ = Parent; // eslint-disable-line
    } else {
        forOwn(Parent, function (value, key) {
          _Child[key] = value;
        });
      }
    Object.defineProperty(_Child, '__super__', {
      configurable: true,
      value: Parent
    });

    deepMixIn(_Child.prototype, props);
    deepMixIn(_Child, classProps);

    return _Child;
  }

var _utils = Object.freeze({
    isArray: isArray,
    isObject: isObject,
    isRegExp: isRegExp,
    isString: isString,
    isNull: isNull,
    isUndefined: isUndefined,
    isDate: isDate,
    isNumber: isNumber,
    isInteger: isInteger,
    isBoolean: isBoolean,
    isFunction: isFunction,
    isSorN: isSorN,
    get: get,
    unset: unset,
    set: _set,
    forOwn: forOwn,
    deepMixIn: deepMixIn,
    resolve: resolve$1,
    reject: reject,
    _: _,
    intersection: intersection,
    fillIn: fillIn,
    isBlacklisted: isBlacklisted,
    fromJson: fromJson,
    toJson: toJson,
    copy: copy,
    pascalCase: pascalCase,
    camelCase: camelCase,
    eventify: eventify,
    uuid: uuid,
    classCallCheck: classCallCheck,
    possibleConstructorReturn: possibleConstructorReturn,
    addHiddenPropsToTarget: addHiddenPropsToTarget,
    extend: extend
  });

  /**
   * A class used by the @{link Collection} class to build queries to be executed
   * against the collection's data. An instance of `Query` is returned by
   * {@link Model.query} and {@link Collection.query}.
   * @class Query
   * @param {Collection} collection - The collection on which this query operates.
   */
  function Query(collection) {
    classCallCheck(this, Query);

    /**
     * The collection on which this query operates.
     * @type {Collection}
     */
    this.collection = collection;
    /**
     * The data result of this query.
     * @type {Array}
     */
    this.data = null;
  }

  var reserved = {
    skip: '',
    offset: '',
    where: '',
    limit: '',
    orderBy: '',
    sort: ''
  };

  var escapeRegExp = /([.*+?^=!:${}()|[\]\/\\])/g;
  var percentRegExp = /%/g;
  var underscoreRegExp = /_/g;

  function escape(pattern) {
    return pattern.replace(escapeRegExp, '\\$1');
  }

  Query.ops = {
    '==': function _(value, predicate) {
      return value == predicate; // eslint-disable-line
    },
    '===': function _(value, predicate) {
      return value === predicate;
    },
    '!=': function _(value, predicate) {
      return value != predicate; // eslint-disable-line
    },
    '!==': function _(value, predicate) {
      return value !== predicate;
    },
    '>': function _(value, predicate) {
      return value > predicate;
    },
    '>=': function _(value, predicate) {
      return value >= predicate;
    },
    '<': function _(value, predicate) {
      return value < predicate;
    },
    '<=': function _(value, predicate) {
      return value <= predicate;
    },
    'isectEmpty': function isectEmpty(value, predicate) {
      return !intersection(value || [], predicate || []).length;
    },
    'isectNotEmpty': function isectNotEmpty(value, predicate) {
      return intersection(value || [], predicate || []).length;
    },
    'in': function _in(value, predicate) {
      return predicate.indexOf(value) !== -1;
    },
    'notIn': function notIn(value, predicate) {
      return predicate.indexOf(value) === -1;
    },
    'contains': function contains(value, predicate) {
      return (value || []).indexOf(predicate) !== -1;
    },
    'notContains': function notContains(value, predicate) {
      return (value || []).indexOf(predicate) === -1;
    }
  };

  addHiddenPropsToTarget(Query.prototype, {
    compare: function compare(orderBy, index, a, b) {
      var def = orderBy[index];
      var cA = get(a, def[0]);
      var cB = get(b, def[0]);
      if (cA && isString(cA)) {
        cA = cA.toUpperCase();
      }
      if (cB && isString(cB)) {
        cB = cB.toUpperCase();
      }
      a || (a = null);
      b || (b = null);
      if (def[1] === 'DESC') {
        if (cB < cA) {
          return -1;
        } else if (cB > cA) {
          return 1;
        } else {
          if (index < orderBy.length - 1) {
            return this.compare(orderBy, index + 1, a, b);
          } else {
            return 0;
          }
        }
      } else {
        if (cA < cB) {
          return -1;
        } else if (cA > cB) {
          return 1;
        } else {
          if (index < orderBy.length - 1) {
            return this.compare(orderBy, index + 1, a, b);
          } else {
            return 0;
          }
        }
      }
    },
    evaluate: function evaluate(value, op, predicate) {
      if (Query.ops[op]) {
        return Query.ops[op](value, predicate);
      }
      if (op.indexOf('like') === 0) {
        return this.like(predicate, op.substr(4)).exec(value) !== null;
      } else if (op.indexOf('notLike') === 0) {
        return this.like(predicate, op.substr(7)).exec(value) === null;
      }
    },
    like: function like(pattern, flags) {
      return new RegExp('^' + escape(pattern).replace(percentRegExp, '.*').replace(underscoreRegExp, '.') + '$', flags);
    },

    /**
     * Return the current data result of this query.
     * @memberof Query
     * @instance
     * @return {Array} The data in this query.
     */
    getData: function getData() {
      if (!this.data) {
        this.data = this.collection.index.getAll();
      }
      return this.data;
    },

    /**
     * Find all entities between two boundaries.
     *
     * Get the users ages 18 to 30
     * ```js
     * const users = query.between(18, 30, { index: 'age' }).run()
     * ```
     * Same as above
     * ```js
     * const users = query.between([18], [30], { index: 'age' }).run()
     * ```
     *
     * @memberof Query
     * @instance
     * @param {Array} leftKeys - Keys defining the left boundary.
     * @param {Array} rightKeys - Keys defining the right boundary.
     * @param {Object} [opts] - Configuration options.
     * @param {string} [opts.index] - Name of the secondary index to use in the
     * query. If no index is specified, the main index is used.
     * @param {boolean} [opts.leftInclusive=true] - Whether to include entities
     * on the left boundary.
     * @param {boolean} [opts.rightInclusive=false] - Whether to include entities
     * on the left boundary.
     * @param {boolean} [opts.limit] - Limit the result to a certain number.
     * @param {boolean} [opts.offset] - The number of resulting entities to skip.
     * @return {Query} A reference to itself for chaining.
     */
    between: function between(leftKeys, rightKeys, opts) {
      opts || (opts = {});
      var collection = this.collection;
      var index = opts.index ? collection.indexes[opts.index] : collection.index;
      if (this.data) {
        throw new Error('Cannot access index after first operation!');
      }
      this.data = index.between(leftKeys, rightKeys, opts);
      return this;
    },

    /**
     * Find the entity or entities that match the provided key.
     *
     * #### Example
     *
     * Get the entity whose primary key is 25
     * ```js
     * const entities = query.get(25).run()
     * ```
     * Same as above
     * ```js
     * const entities = query.get([25]).run()
     * ```
     * Get all users who are active and have the "admin" role
     * ```js
     * const activeAdmins = query.get(['active', 'admin'], {
     *   index: 'activityAndRoles'
     * }).run()
     * ```
     * Get all entities that match a certain weather condition
     * ```js
     * const niceDays = query.get(['sunny', 'humid', 'calm'], {
     *   index: 'weatherConditions'
     * }).run()
     * ```
     *
     * @memberof Query
     * @instance
     * @param {Array} keyList - Key(s) defining the entity to retrieve. If
     * `keyList` is not an array (i.e. for a single-value key), it will be
     * wrapped in an array.
     * @param {Object} [opts] - Configuration options.
     * @param {string} [opts.string] - Name of the secondary index to use in the
     * query. If no index is specified, the main index is used.
     * @return {Query} A reference to itself for chaining.
     */
    get: function get() {
      var keyList = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
      var opts = arguments[1];

      opts || (opts = {});
      if (this.data) {
        throw new Error('Cannot access index after first operation!');
      }
      if (keyList && !isArray(keyList)) {
        keyList = [keyList];
      }
      if (!keyList.length) {
        this.getData();
        return this;
      }
      var collection = this.collection;
      var index = opts.index ? collection.indexes[opts.index] : collection.index;
      this.data = index.get(keyList);
      return this;
    },

    /**
     * Find the entity or entities that match the provided keyLists.
     *
     * #### Example
     *
     * Get the posts where "status" is "draft" or "inReview"
     * ```js
     * const posts = query.getAll('draft', 'inReview', { index: 'status' }).run()
     * ```
     * Same as above
     * ```js
     * const posts = query.getAll(['draft'], ['inReview'], { index: 'status' }).run()
     * ```
     *
     * @memberof Query
     * @instance
     * @param {...Array} [keyList] - Provide one or more keyLists, and all
     * entities matching each keyList will be retrieved. If no keyLists are
     * provided, all entities will be returned.
     * @param {Object} [opts] - Configuration options.
     * @param {string} [opts.index] - Name of the secondary index to use in the
     * query. If no index is specified, the main index is used.
     * @return {Query} A reference to itself for chaining.
     */
    getAll: function getAll() {
      var _this = this;

      var opts = {};
      if (this.data) {
        throw new Error('Cannot access index after first operation!');
      }

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (!args.length || args.length === 1 && isObject(args[0])) {
        this.getData();
        return this;
      } else if (args.length && isObject(args[args.length - 1])) {
        opts = args[args.length - 1];
        args.pop();
      }
      var collection = this.collection;
      var index = opts.index ? collection.indexes[opts.index] : collection.index;
      this.data = [];
      args.forEach(function (keyList) {
        _this.data = _this.data.concat(index.get(keyList));
      });
      return this;
    },

    /**
     * Find the entity or entities that match the provided query or pass the
     * provided filter function.
     *
     * #### Example
     *
     * Get the draft posts created less than three months
     * ```js
     * const posts = query.filter({
     *   where: {
     *     status: {
     *       '==': 'draft'
     *     },
     *     created_at_timestamp: {
     *       '>=': (new Date().getTime() - (1000 * 60 * 60 * 24 * 30 * 3)) // 3 months ago
     *     }
     *   }
     * }).run()
     * ```
     * Use a custom filter function
     * ```js
     * const posts = query.filter(function (post) {
     *   return post.isReady()
     * }).run()
     * ```
     *
     * @memberof Query
     * @instance
     * @param {(Object|Function)} [queryOrFn={}] - Selection query or filter
     * function.
     * @param {Function} [thisArg] - Context to which to bind `queryOrFn` if
     * `queryOrFn` is a function.
     * @return {Query} A reference to itself for chaining.
     */
    filter: function filter(query, thisArg) {
      var self = this;
      query || (query = {});
      self.getData();
      if (isObject(query)) {
        (function () {
          var where = {};
          // Filter
          if (isObject(query.where)) {
            where = query.where;
          }
          forOwn(query, function (value, key) {
            if (!(key in reserved) && !(key in where)) {
              where[key] = {
                '==': value
              };
            }
          });

          var fields = [];
          var ops = [];
          var predicates = [];
          forOwn(where, function (clause, field) {
            if (!isObject(clause)) {
              clause = {
                '==': clause
              };
            }
            forOwn(clause, function (expr, op) {
              fields.push(field);
              ops.push(op);
              predicates.push(expr);
            });
          });
          if (fields.length) {
            (function () {
              var i = undefined;
              var len = fields.length;
              self.data = self.data.filter(function (item) {
                var first = true;
                var keep = true;

                for (i = 0; i < len; i++) {
                  var op = ops[i];
                  var isOr = op.charAt(0) === '|';
                  op = isOr ? op.substr(1) : op;
                  var expr = self.evaluate(get(item, fields[i]), op, predicates[i]);
                  if (expr !== undefined) {
                    keep = first ? expr : isOr ? keep || expr : keep && expr;
                  }
                  first = false;
                }
                return keep;
              });
            })();
          }

          // Sort
          var orderBy = query.orderBy || query.sort;

          if (isString(orderBy)) {
            orderBy = [[orderBy, 'ASC']];
          }
          if (!isArray(orderBy)) {
            orderBy = null;
          }

          // Apply 'orderBy'
          if (orderBy) {
            (function () {
              var index = 0;
              orderBy.forEach(function (def, i) {
                if (isString(def)) {
                  orderBy[i] = [def, 'ASC'];
                }
              });
              self.data.sort(function (a, b) {
                return self.compare(orderBy, index, a, b);
              });
            })();
          }

          // Skip
          if (isNumber(query.skip)) {
            self.skip(query.skip);
          } else if (isNumber(query.offset)) {
            self.skip(query.offset);
          }
          // Limit
          if (isNumber(query.limit)) {
            self.limit(query.limit);
          }
        })();
      } else if (isFunction(query)) {
        self.data = self.data.filter(query, thisArg);
      }
      return self;
    },

    /**
     * Skip a number of results.
     *
     * #### Example
     *
     * Get all but the first 10 draft posts
     * ```js
     * const posts = query.get('draft', { index: 'status' }).skip(10).run()
     * ```
     *
     * @memberof Query
     * @instance
     * @param {number} num - The number of entities to skip.
     * @return {Query} A reference to itself for chaining.
     */
    skip: function skip(num) {
      if (!isNumber(num)) {
        throw new TypeError('skip: Expected number but found ' + (typeof num === 'undefined' ? 'undefined' : babelHelpers.typeof(num)) + '!');
      }
      var data = this.getData();
      if (num < data.length) {
        this.data = data.slice(num);
      } else {
        this.data = [];
      }
      return this;
    },

    /**
     * Limit the result.
     *
     * #### Example
     *
     * Get only the first 10 draft posts
     * ```js
     * const posts = query.get('draft', { index: 'status' }).limit(10).run()
     * ```
     *
     * @memberof Query
     * @instance
     * @param {number} num - The maximum number of entities to keep in the result.
     * @return {Query} A reference to itself for chaining.
     */
    limit: function limit(num) {
      if (!isNumber(num)) {
        throw new TypeError('limit: Expected number but found ' + (typeof num === 'undefined' ? 'undefined' : babelHelpers.typeof(num)) + '!');
      }
      var data = this.getData();
      this.data = data.slice(0, Math.min(data.length, num));
      return this;
    },

    /**
     * Iterate over all entities.
     *
     * @memberof Query
     * @instance
     * @param {Function} forEachFn - Iteration function.
     * @param {*} [thisArg] - Context to which to bind `forEachFn`.
     * @return {Query} A reference to itself for chaining.
     */
    forEach: function forEach(forEachFn, thisArg) {
      this.getData().forEach(forEachFn, thisArg);
      return this;
    },

    /**
     * Apply a mapping function to the result data.
     *
     * @memberof Query
     * @instance
     * @param {Function} mapFn - Mapping function.
     * @param {*} [thisArg] - Context to which to bind `mapFn`.
     * @return {Query} A reference to itself for chaining.
     */
    map: function map(mapFn, thisArg) {
      this.data = this.getData().map(mapFn, thisArg);
      return this;
    },

    /**
     * Return the result of calling the specified function on each item in this
     * collection's main index.
     * @memberof Query
     * @instance
     * @param {string} funcName - Name of function to call
     * @parama {...*} [args] - Remaining arguments to be passed to the function.
     * @return {Query} A reference to itself for chaining.
     */
    mapCall: function mapCall(funcName) {
      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      this.data = this.getData().map(function (item) {
        return item[funcName].apply(item, args);
      });
      return this;
    },

    /**
     * Complete the execution of the query and return the resulting data.
     *
     * @memberof Query
     * @instance
     * @return {Array} The result of executing this query.
     */
    run: function run() {
      var data = this.data;
      this.data = null;
      return data;
    }
  });

  function sort(a, b, hashCode) {
    // Short-curcuit comparison if a and b are strictly equal
    // This is absolutely necessary for indexed objects that
    // don't have the idAttribute field
    if (a === b) {
      return 0;
    }
    if (hashCode) {
      a = hashCode(a);
      b = hashCode(b);
    }
    if (a === null && b === null) {
      return 0;
    }

    if (a === null) {
      return -1;
    }

    if (b === null) {
      return 1;
    }

    if (a < b) {
      return -1;
    }

    if (a > b) {
      return 1;
    }

    return 0;
  }

  function insertAt(array, index, value) {
    array.splice(index, 0, value);
    return array;
  }

  function removeAt(array, index) {
    array.splice(index, 1);
    return array;
  }

  function binarySearch(array, value, field) {
    var lo = 0;
    var hi = array.length;
    var compared = undefined;
    var mid = undefined;

    while (lo < hi) {
      mid = (lo + hi) / 2 | 0;
      compared = sort(value, array[mid], field);
      if (compared === 0) {
        return {
          found: true,
          index: mid
        };
      } else if (compared < 0) {
        hi = mid;
      } else {
        lo = mid + 1;
      }
    }

    return {
      found: false,
      index: hi
    };
  }

  var blacklist = { '>': 1, '>=': 1, '<': 1, '<=': 1 };

  function Index(fieldList, opts) {
    classCallCheck(this, Index);
    fieldList || (fieldList = []);

    if (!isArray(fieldList)) {
      throw new Error('fieldList must be an array.');
    }

    opts || (opts = {});
    this.fieldList = fieldList;
    this.fieldGetter = opts.fieldGetter;
    this.hashCode = opts.hashCode;
    this.isIndex = true;
    this.keys = [];
    this.values = [];
  }

  addHiddenPropsToTarget(Index.prototype, {
    set: function set(keyList, value) {
      if (!isArray(keyList)) {
        keyList = [keyList];
      }

      var key = keyList.shift() || null;
      var pos = binarySearch(this.keys, key);

      if (keyList.length === 0) {
        if (pos.found) {
          var dataLocation = binarySearch(this.values[pos.index], value, this.hashCode);
          if (!dataLocation.found) {
            insertAt(this.values[pos.index], dataLocation.index, value);
          }
        } else {
          insertAt(this.keys, pos.index, key);
          insertAt(this.values, pos.index, [value]);
        }
      } else {
        if (pos.found) {
          this.values[pos.index].set(keyList, value);
        } else {
          insertAt(this.keys, pos.index, key);
          var newIndex = new Index([], { hashCode: this.hashCode });
          newIndex.set(keyList, value);
          insertAt(this.values, pos.index, newIndex);
        }
      }
    },
    get: function get(keyList) {
      if (!isArray(keyList)) {
        keyList = [keyList];
      }

      var key = keyList.shift() || null;
      var pos = binarySearch(this.keys, key);

      if (keyList.length === 0) {
        if (pos.found) {
          if (this.values[pos.index].isIndex) {
            return this.values[pos.index].getAll();
          } else {
            return this.values[pos.index];
          }
        } else {
          return [];
        }
      } else {
        if (pos.found) {
          return this.values[pos.index].get(keyList);
        } else {
          return [];
        }
      }
    },
    getAll: function getAll() {
      var results = [];
      this.values.forEach(function (value) {
        if (value.isIndex) {
          results = results.concat(value.getAll());
        } else {
          results = results.concat(value);
        }
      });
      return results;
    },
    visitAll: function visitAll(cb, thisArg) {
      this.values.forEach(function (value) {
        if (value.isIndex) {
          value.visitAll(cb, thisArg);
        } else {
          value.forEach(cb, thisArg);
        }
      });
    },
    query: function query(_query) {
      var leftKeys = undefined;
      var rightKeys = undefined;

      if (_query['>']) {
        leftKeys = _query['>'];
        _query.leftInclusive = false;
      } else if (_query['>=']) {
        leftKeys = _query['>='];
        _query.leftInclusive = true;
      }

      if (_query['<']) {
        rightKeys = _query['<'];
        _query.rightInclusive = false;
      } else if (_query['<=']) {
        rightKeys = _query['<='];
        _query.rightInclusive = true;
      }

      if (leftKeys.length !== rightKeys.length) {
        throw new Error('Key arrays must be same length');
      }

      var _opts = {};
      forOwn(_query, function (value, key) {
        if (!blacklist[key]) {
          _opts[key] = value;
        }
      });
      return this.between(leftKeys, rightKeys, _opts);
    },
    between: function between(leftKeys, rightKeys) {
      var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      if (!isArray(leftKeys)) {
        leftKeys = [leftKeys];
      }
      if (!isArray(rightKeys)) {
        rightKeys = [rightKeys];
      }
      fillIn(opts, {
        leftInclusive: true,
        rightInclusive: false,
        limit: undefined,
        offset: 0
      });

      var results = this._between(leftKeys, rightKeys, opts);

      if (opts.limit) {
        return results.slice(opts.offset, opts.limit + opts.offset);
      } else {
        return results.slice(opts.offset);
      }
    },
    _between: function _between(leftKeys, rightKeys, opts) {
      var results = [];

      var leftKey = leftKeys.shift();
      var rightKey = rightKeys.shift();

      var pos = undefined;

      if (leftKey !== undefined) {
        pos = binarySearch(this.keys, leftKey);
      } else {
        pos = {
          found: false,
          index: 0
        };
      }

      if (leftKeys.length === 0) {
        if (pos.found && opts.leftInclusive === false) {
          pos.index += 1;
        }

        for (var i = pos.index; i < this.keys.length; i += 1) {
          if (rightKey !== undefined) {
            if (opts.rightInclusive) {
              if (this.keys[i] > rightKey) {
                break;
              }
            } else {
              if (this.keys[i] >= rightKey) {
                break;
              }
            }
          }

          if (this.values[i].isIndex) {
            results = results.concat(this.values[i].getAll());
          } else {
            results = results.concat(this.values[i]);
          }

          if (opts.limit) {
            if (results.length >= opts.limit + opts.offset) {
              break;
            }
          }
        }
      } else {
        for (var i = pos.index; i < this.keys.length; i += 1) {
          var currKey = this.keys[i];
          if (currKey > rightKey) {
            break;
          }

          if (this.values[i].isIndex) {
            if (currKey === leftKey) {
              results = results.concat(this.values[i]._between(copy(leftKeys), rightKeys.map(function () {
                return undefined;
              }), opts));
            } else if (currKey === rightKey) {
              results = results.concat(this.values[i]._between(leftKeys.map(function () {
                return undefined;
              }), copy(rightKeys), opts));
            } else {
              results = results.concat(this.values[i].getAll());
            }
          } else {
            results = results.concat(this.values[i]);
          }

          if (opts.limit) {
            if (results.length >= opts.limit + opts.offset) {
              break;
            }
          }
        }
      }

      if (opts.limit) {
        return results.slice(0, opts.limit + opts.offset);
      } else {
        return results;
      }
    },
    peek: function peek() {
      if (this.values.length) {
        if (this.values[0].isIndex) {
          return this.values[0].peek();
        } else {
          return this.values[0];
        }
      }
      return [];
    },
    remove: function remove(keyList, value) {
      if (!isArray(keyList)) {
        keyList = [keyList];
      }

      var key = keyList.shift();
      var pos = binarySearch(this.keys, key);

      if (keyList.length === 0) {
        if (pos.found) {
          var dataLocation = binarySearch(this.values[pos.index], value, this.hashCode);
          if (dataLocation.found) {
            removeAt(this.values[pos.index], dataLocation.index);
            if (this.values[pos.index].length === 0) {
              removeAt(this.keys, pos.index);
              removeAt(this.values, pos.index);
            }
          }
        }
      } else {
        if (pos.found) {
          this.values[pos.index].delete(keyList, value);
        }
      }
    },
    clear: function clear() {
      this.keys = [];
      this.values = [];
    },
    insertRecord: function insertRecord(data) {
      var keyList = this.fieldList.map(function (field) {
        if (isFunction(field)) {
          return field(data) || null;
        } else {
          return data[field] || null;
        }
      });
      this.set(keyList, data);
    },
    removeRecord: function removeRecord(data) {
      var _this = this;

      var removed = undefined;
      this.values.forEach(function (value, i) {
        if (value.isIndex) {
          if (value.removeRecord(data)) {
            if (value.keys.length === 0) {
              removeAt(_this.keys, i);
              removeAt(_this.values, i);
            }
            removed = true;
            return false;
          }
        } else {
          var dataLocation = binarySearch(value, data, _this.hashCode);
          if (dataLocation.found) {
            removeAt(value, dataLocation.index);
            if (value.length === 0) {
              removeAt(_this.keys, i);
              removeAt(_this.values, i);
            }
            removed = true;
            return false;
          }
        }
      });
      return removed ? data : undefined;
    },
    updateRecord: function updateRecord(data) {
      this.removeRecord(data);
      this.insertRecord(data);
    }
  });

  /**
   * Holds a set of Model instances. Use a Collection to store and manage
   * instances of Model.
   *
   * ```javascript
   * import {Collection, Model} from 'js-data'
   * class User extends Model {}
   * const UserCollection = new Collection({ model: User })
   * const OtherUserCollection = new Collection([{ id: 1 }, { id: 2 }], { model: User })
   * ```
   *
   * @class Collection
   * @param {Model[]} [models=[]] - Initial set of models to insert into the
   * collection.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.autoPk=false]
   * @param {string} [opts.idAttribute]
   * @param {Model} [opts.model] - Reference to the Model type that will be stored
   * by this Collection.
   * @param {Object} [opts.modelOpts={}]
   * @param {string} [opts.onConflict=merge]
   */
  function Collection(models, opts) {
    var self = this;

    classCallCheck(self, Collection);

    if (isObject(models) && !isArray(models)) {
      opts = models;
      models = [];
    }

    // Default values for arguments
    models || (models = []);
    opts || (opts = {});

    /**
     * Reference to this Collection's Model.
     *
     * @name Collection#model
     * @type {Model}
     */
    self.model = opts.model;

    // Re-emit any events emitted by this Collection's model.
    if (self.model) {
      self.model.on('all', self._onModelEvent, self);
    }

    /**
     * AutoPk.
     *
     * @name Collection#autoPk
     * @type {boolean}
     * @default false
     */
    self.autoPk = opts.autoPk === undefined ? false : opts.autoPk;

    /**
     * Field to be used as the unique identifier for models in this collection.
     * Defaults to `"id"` unless {@link Collection#model} is set, in which case
     * this will default to {@link Model.idAttribute}.
     *
     * @name Collection#idAttribute
     * @type {string}
     */
    self.idAttribute = opts.idAttribute;

    /**
     * Any options set here will override any options of {@link Collection#model}.
     * Useful for making multiple collection that use the same Model in different
     * ways.
     *
     * @name Collection#modelOpts
     * @type {Object}
     * @default {}
     */
    self.modelOpts = opts.modelOpts || {};

    /**
     * Event listeners attached to this Collection.
     *
     * @name Collection#_listeners
     * @instance
     * @type {Model}
     * @private
     */
    self._listeners = {};

    /**
     * What to do when inserting a model into this Collection that shares a
     * primary key with a model already in this Collection.
     *
     * Possible values:
     * - merge
     * - replace
     *
     * Merge:
     *
     * Recursively shallow copy properties from the new model onto the existing
     * model.
     *
     * Replace:
     *
     * Shallow copy top-level properties from the new model onto the existing model.
     * Any top-level own properties of the existing model that are _not_ on the new
     * model will be removed.
     *
     * @name Collection#onConflict
     * @type {string}
     * @default merge
     */
    self.onConflict = opts.onConflict || 'merge';

    var idAttribute = self.modelId();

    /**
     * The main index, which uses @{link Collection#modelId} as the key.
     * @name Collection#index
     * @type {Index}
     */
    self.index = new Index([idAttribute], {
      hashCode: function hashCode(obj) {
        return get(obj, idAttribute);
      }
    });

    /**
     * Object that holds the secondary indexes of this collection.
     * @name Collection#indexes
     * @type {Object.<string, Index>}
     */
    self.indexes = {};

    /**
     * Object that holds the timestamps of when models were added to this
     * collection.
     * @name Collection#added
     * @type {Object.<number, Model>}
     */
    self.added = {};

    /**
     * Object that holds the autoPks of models which needed ids to be generated.
     * @name Collection#autoPks
     * @type {Object.<number, Model>}
     */
    self.autoPks = {};

    self.createIndex('addedTimestamps', ['$'], {
      fieldGetter: function fieldGetter(obj) {
        return self.added[get(obj, idAttribute)];
      }
    });
    models.forEach(function (model) {
      self.index.insertRecord(model);
      if (model && isFunction(model.on)) {
        model.on('all', self._onModelEvent, self);
      }
    });
  }

  /**
   * TODO
   *
   * @name Collection#on
   * @instance
   * @method
   * @param {string} event - TODO.
   * @param {Function} handler - TODO
   */

  /**
  * TODO
  *
  * @name Collection#off
  * @instance
  * @method
  * @param {string} [event] - TODO.
  * @param {Function} [handler] - TODO
  */

  /**
  * TODO
  *
  * @name Collection#emit
  * @instance
  * @method
  * @param {string} event - TODO.
  * @param {...*} [arg] - TODO
  */

  addHiddenPropsToTarget(Collection.prototype, {
    /**
     * TODO
     *
     * @memberof Collection
     * @instance
     * @private
     * @param {Object} data - TODO.
     * @param {Object} [opts] - Configuration options.
     * @param {boolean} [opts.autoAdd] - TODO
     */

    _end: function _end(data, opts) {
      var self = this;
      if (opts.raw) {
        if (opts.autoAdd) {
          data.data = self.add(data.data, opts);
        }
        return data;
      } else if (opts.autoAdd) {
        data = self.add(data, opts);
      }
      return data;
    },

    /**
     * Used to bind to events emitted by this Collection's Model or models in this
     * Collection.
     *
     * @memberof Collection
     * @instance
     * @private
     * @param {...*} [arg] - Args passed to {@link Collection#emit}.
     */
    _onModelEvent: function _onModelEvent() {
      this.emit.apply(this, arguments);
    },

    /**
     * Insert the provided model or models.
     *
     * If a model is already in the collection then the provided model will
     * either merge with or replace the existing model based on the value of the
     * `onConflict` option.
     *
     * The collection's secondary indexes will be updated as each entity is
     * visited.
     *
     * @memberof Collection
     * @instance
     * @param {(Object|Object[]|Model|Model[])} data - The model or models to insert.
     * @param {Object} [opts] - Configuration options.
     * @param {boolean} [opts.autoPk={@link Collection.autoPk}] - Whether to
     * generate primary keys for the models to be inserted. Useful for inserting
     * temporary, unsaved data into the collection.
     * @param {string} [opts.onConflict] - What to do when a model is already in
     * the collection. Possible values are `merge` or `replace`.
     * @return {(Model|Model[])} The added model or models.
     */
    add: function add(models, opts) {
      var self = this;

      // Default values for arguments
      opts || (opts = {});

      // Fill in "opts" with the Collection's configuration
      _(self, opts);
      models = self.beforeAdd(models, opts) || models;

      // Track whether just one or an array of models is being inserted
      var singular = false;
      var idAttribute = self.modelId();
      var relationList = self.model ? self.model.relationList || [] : [];
      var timestamp = new Date().getTime();
      if (!isArray(models)) {
        models = [models];
        singular = true;
      }

      // Map the provided models to existing models.
      // New models will be inserted. If any props map to existing models,
      // they will be merged into the existing models according to the onConflict
      // option.
      models = models.map(function (props) {
        var id = self.modelId(props);
        // Track whether we had to generate an id for this model
        // Validate that the primary key attached to the model is a string or
        // number
        var autoPk = false;
        if (!isSorN(id)) {
          // No id found, generate one
          if (opts.autoPk) {
            id = uuid();
            _set(props, idAttribute, id);
            autoPk = true;
          } else {
            // Not going to generate one, throw an error
            throw new TypeError(idAttribute + ': Expected string or number, found ' + (typeof id === 'undefined' ? 'undefined' : babelHelpers.typeof(id)) + '!');
          }
        }
        // Grab existing model if there is one
        var existing = self.get(id);
        // If the currently visited props are just reference to the existing
        // model, then there is nothing to be done. Exit early.
        if (props === existing) {
          return existing;
        }

        // Check the currently visited props for relations that need to be
        // inserted as well
        relationList.forEach(function (def) {
          // A reference to the Model that this Model is related to
          var Relation = def.getRelation();
          if (!Relation.idAttribute) {
            return;
          }
          // The field used by the related Model as the primary key
          var relationIdAttribute = Relation.idAttribute;
          // Grab the foreign key in this relationship, if there is one
          var foreignKey = def.foreignKey;

          // Grab a reference to the related data attached or linked to the
          // currently visited props
          var toInsert = get(props, def.getLocalField());

          // If the user provided a custom insertion function for this relation,
          // call it
          if (isFunction(def.add)) {
            def.add(self, def, props);
          } else if (toInsert && def.add !== false) {
            // Otherwise, if there is something to be added, add it
            if (isArray(toInsert)) {
              // Handle inserting hasMany relations
              toInsert = toInsert.map(function (toInsertItem) {
                // Check that this item isn't the same item that is already in the
                // store
                if (!Relation.is(toInsertItem)) {
                  try {
                    // Make sure this item has its foreignKey
                    if (foreignKey) {
                      _set(toInsertItem, foreignKey, id);
                    }
                    // Finally add this related item
                    toInsertItem = Relation.createInstance(toInsertItem);
                  } catch (err) {
                    throw new Error('Failed to insert ' + def.type + ' relation: "' + def.relation + '"! ' + err.message);
                  }
                }
                return toInsertItem;
              });
              // If it's the parent that has the localKeys
              if (def.localKeys) {
                _set(props, def.localKeys, toInsert.map(function (inserted) {
                  return get(inserted, relationIdAttribute);
                }));
              }
            } else {
              // Handle inserting belongsTo and hasOne relations
              if (!Relation.is(toInsert)) {
                try {
                  // Make sure this item has its foreignKey
                  if (foreignKey) {
                    _set(toInsert, def.foreignKey, id);
                  }
                  // Finally insert this related item
                  toInsert = Relation.createInstance(toInsert);
                } catch (err) {
                  throw new Error('Failed to insert ' + def.type + ' relation: "' + def.relation + '"!');
                }
              }
            }
          }
          _set(props, def.localField, toInsert);
        });

        if (existing) {
          // Here, the currently visited props corresponds to an entity already
          // in the collection, so we need to merge them
          var onConflict = opts.onConflict || self.onConflict;
          if (onConflict === 'merge') {
            deepMixIn(existing, props);
          } else if (onConflict === 'replace') {
            forOwn(existing, function (value, key) {
              if (key !== idAttribute && !props.hasOwnProperty(key)) {
                delete existing[key];
              }
            });
            existing.set(props);
          }
          props = existing;
          // Update all indexes in the collection
          self.updateIndexes(props);
        } else {
          // Here, the currently visted props does not correspond to any model
          // in the collection, so make this props is an instance of this Model
          // and insert it into the collection
          props = self.model ? self.model.createInstance(props) : props;
          self.index.insertRecord(props);
          forOwn(self.indexes, function (index, name) {
            index.insertRecord(props);
          });
          if (props && isFunction(props.on)) {
            props.on('all', self._onModelEvent, self);
            self.emit('add', props);
          }
        }
        // Track when this model was added
        self.added[id] = timestamp;
        if (autoPk) {
          self.autoPks[id] = props;
        }
        return props;
      });
      // Finally, return the inserted data
      var result = singular ? models.length ? models[0] : undefined : models;
      return self.afterAdd(models, opts, result) || result;
    },

    /**
     * Lifecycle hook called by {@link Collection#add}. If this method returns a
     * value then {@link Collection#add} will return that same value.
     *
     * @memberof Collection
     * @instance
     * @param {(Model|Model[])} result - The model or models that were added to
     * this Collection by {@link Collection#add}.
     * @param {Object} opts - The `opts` argument passed to {@link Collection#add}.
     */
    afterAdd: function afterAdd() {},

    /**
     * Lifecycle hook called by {@link Collection#remove}. If this method returns
     * a value then {@link Collection#remove} will return that same value.
     *
     * @memberof Collection
     * @instance
     * @param {(string|number)} id - The `id` argument passed to {@link Collection#remove}.
     * @param {Object} opts - The `opts` argument passed to {@link Collection#remove}.
     * @param {Object} model - The result that will be returned by {@link Collection#remove}.
     */
    afterRemove: function afterRemove() {},

    /**
     * Lifecycle hook called by {@link Collection#removeAll}. If this method
     * returns a value then {@link Collection#removeAll} will return that same
     * value.
     *
     * @memberof Collection
     * @instance
     * @param {Object} query - The `query` argument passed to {@link Collection#removeAll}.
     * @param {Object} opts - The `opts` argument passed to {@link Collection#removeAll}.
     * @param {Object} models - The result that will be returned by {@link Collection#removeAll}.
     */
    afterRemoveAll: function afterRemoveAll() {},

    /**
     * Lifecycle hook called by {@link Collection#add}. If this method returns a
     * value then the `models` argument in {@link Collection#add} will be
     * re-assigned to the returned value.
     *
     * @memberof Collection
     * @instance
     * @param {(Model|Model[])} models - The `models` argument passed to {@link Collection#add}.
     * @param {Object} opts - The `opts` argument passed to {@link Collection#add}.
     */
    beforeAdd: function beforeAdd() {},

    /**
     * Lifecycle hook called by {@link Collection#remove}.
     *
     * @memberof Collection
     * @instance
     * @param {(string|number)} id - The `id` argument passed to {@link Collection#remove}.
     * @param {Object} opts - The `opts` argument passed to {@link Collection#remove}.
     */
    beforeRemove: function beforeRemove() {},

    /**
     * Lifecycle hook called by {@link Collection#removeAll}.
     *
     * @memberof Collection
     * @instance
     * @param {Object} query - The `query` argument passed to {@link Collection#removeAll}.
     * @param {Object} opts - The `opts` argument passed to {@link Collection#removeAll}.
     */
    beforeRemoveAll: function beforeRemoveAll() {},

    /**
     * Find all entities between two boundaries.
     *
     * Shortcut for `collection.query().between(18, 30, { index: 'age' }).run()`
     *
     * Get all users ages 18 to 30:
     * ```javascript
     * const users = collection.between(18, 30, { index: 'age' })
     * ```
     * Same as above:
     * ```javascript
     * const users = collection.between([18], [30], { index: 'age' })
     * ```
     *
     * @memberof Collection
     * @instance
     * @param {Array} leftKeys - Keys defining the left boundary.
     * @param {Array} rightKeys - Keys defining the right boundary.
     * @param {Object} [opts] - Configuration options.
     * @param {string} [opts.index] - Name of the secondary index to use in the
     * query. If no index is specified, the main index is used.
     * @param {boolean} [opts.leftInclusive=true] - Whether to include entities
     * on the left boundary.
     * @param {boolean} [opts.rightInclusive=false] - Whether to include entities
     * on the left boundary.
     * @param {boolean} [opts.limit] - Limit the result to a certain number.
     * @param {boolean} [opts.offset] - The number of resulting entities to skip.
     * @return {Array} The result.
     */
    between: function between(leftKeys, rightKeys, opts) {
      return this.query().between(leftKeys, rightKeys, opts).run();
    },

    /**
     * TODO
     *
     * @memberof Collection
     * @instance
     * @param {Object} props - Passed to {@link Model.create}.
     * @param {Object} [opts] - Passed to {@link Model.create}. See
     * {@link Model.create} for more configuration options.
     * @param {boolean} [opts.autoAdd] - TODO
     * @return {Promise}
     */
    create: function create(props, opts) {
      var self = this;
      var id = self.modelId(props);
      opts || (opts = {});
      fillIn(opts, self.modelOpts);
      return self.model.create(props, opts).then(function (data) {
        // If the created model was already in this Collection via an autoPk id,
        // remove it from the collection
        // TODO: Fix this?
        if (self.autoPks[id]) {
          self.remove(id);
        }
        return self._end(data, opts);
      });
    },

    /**
     * Create a new secondary index on the contents of the collection.
     *
     * Index users by age:
     * ```javascript
     * collection.createIndex('age')
     * ```
     * Index users by status and role:
     * ```javascript
     * collection.createIndex('statusAndRole', ['status', 'role'])
     * ```
     *
     * @memberof Collection
     * @instance
     * @param {string} name - The name of the new secondary index.
     * @param {string[]} [fieldList] - Array of field names to use as the key or
     * compound key of the new secondary index. If no fieldList is provided, then
     * the name will also be the field that is used to index the collection.
     * @return {Collection} A reference to itself for chaining.
     */
    createIndex: function createIndex(name, fieldList, opts) {
      var self = this;
      if (isString(name) && fieldList === undefined) {
        fieldList = [name];
      }
      opts || (opts = {});
      opts.hashCode = opts.hashCode || function (obj) {
        return self.modelId(obj);
      };
      var index = self.indexes[name] = new Index(fieldList, opts);
      self.index.visitAll(index.insertRecord, index);
      return self;
    },

    /**
     * TODO
     *
     * @memberof Collection
     * @instance
     * @param {Array} models - Passed to {@link Model.createMany}.
     * @param {Object} [opts] - Passed to {@link Model.createMany}. See
     * {@link Model.createMany} for more configuration options.
     * @param {boolean} [opts.autoAdd] - TODO
     * @return {Promise}
     */
    createMany: function createMany(models, opts) {
      var self = this;
      opts || (opts = {});
      fillIn(opts, self.modelOpts);
      return self.model.createMany(models, opts).then(function (data) {
        // If the created models were already in this Collection via an autoPk
        // id, remove them from the Collection
        // TODO: Fix this?
        models.forEach(function (model) {
          var id = self.modelId(model);
          if (self.autoPks[id]) {
            self.remove(id);
          }
        });
        return self._end(data, opts);
      });
    },

    /**
     * TODO
     *
     * @memberof Collection
     * @instance
     * @param {(string|number)} id - Passed to {@link Model.destroy}.
     * @param {Object} [opts] - Passed to {@link Model.destroy}. See
     * {@link Model.destroy} for more configuration options.
     * @return {Promise}
     */
    destroy: function destroy(id, opts) {
      var self = this;
      opts || (opts = {});
      fillIn(opts, self.modelOpts);
      return self.model.destroy(id, opts).then(function (data) {
        if (opts.raw) {
          data.data = self.remove(id, opts);
        } else {
          data = self.remove(id, opts);
        }
        return data;
      });
    },

    /**
     * TODO
     *
     * @memberof Collection
     * @instance
     * @param {Object} [query] - Passed to {@link Model.destroyAll}.
     * @param {Object} [opts] - Passed to {@link Model.destroyAll}. See
     * {@link Model.destroyAll} for more configuration options.
     * @return {Promise}
     */
    destroyAll: function destroyAll(query, opts) {
      var self = this;
      opts || (opts = {});
      fillIn(opts, self.modelOpts);
      return self.model.destroyAll(query, opts).then(function (data) {
        if (opts.raw) {
          data.data = self.removeAll(query, opts);
        } else {
          data = self.removeAll(query, opts);
        }
        return data;
      });
    },

    /**
     * Find the entity or entities that match the provided query or pass the
     * provided filter function.
     *
     * Shortcut for `collection.query().filter(queryOrFn[, thisArg]).run()`
     *
     * Get the draft posts created less than three months:
     * ```javascript
     * const posts = collection.filter({
     *   where: {
     *     status: {
     *       '==': 'draft'
     *     },
     *     created_at_timestamp: {
     *       '>=': (new Date().getTime() - (1000 * 60 * 60 * 24 * 30 * 3)) // 3 months ago
     *     }
     *   }
     * })
     * ```
     * Use a custom filter function:
     * ```javascript
     * const posts = collection.filter(function (post) {
     *   return post.isReady()
     * })
     * ```
     *
     * @memberof Collection
     * @instance
     * @param {(Object|Function)} [queryOrFn={}] - Selection query or filter
     * function.
     * @param {Object} [thisArg] - Context to which to bind `queryOrFn` if
     * `queryOrFn` is a function.
     * @return {Array} The result.
     */
    filter: function filter(query, thisArg) {
      return this.query().filter(query, thisArg).run();
    },

    /**
     * TODO
     *
     * @memberof Collection
     * @instance
     * @param {(string|number)} id - Passed to {@link Model.find}.
     * @param {Object} [opts] - Passed to {@link Model.find}.
     * @param {boolean} [opts.autoAdd] - TODO
     * @return {Promise}
     */
    find: function find(id, opts) {
      var self = this;
      opts || (opts = {});
      fillIn(opts, self.modelOpts);
      return self.model.find(id, opts).then(function (data) {
        return self._end(data, opts);
      });
    },

    /**
     * TODO
     *
     * @memberof Collection
     * @instance
     * @param {Object} [query] - Passed to {@link Model.findAll}.
     * @param {Object} [opts] - Passed to {@link Model.findAll}.
     * @param {boolean} [opts.autoAdd] - TODO
     * @return {Promise}
     */
    findAll: function findAll(query, opts) {
      var self = this;
      opts || (opts = {});
      fillIn(opts, self.modelOpts);
      return self.model.findAll(query, opts).then(function (data) {
        return self._end(data, opts);
      });
    },

    /**
     * Iterate over all entities.
     *
     * ```javascript
     * collection.forEach(function (entity) {
     *   // do something
     * })
     * ```
     *
     * @memberof Collection
     * @instance
     * @param {Function} forEachFn - Iteration function.
     * @param {*} [thisArg] - Context to which to bind `forEachFn`.
     * @return {Array} The result.
     */
    forEach: function forEach(cb, thisArg) {
      this.index.visitAll(cb, thisArg);
    },

    /**
     * Get the model with the given id.
     *
     * @memberof Collection
     * @instance
     * @param {(string|number)} id - The primary key of the model to get.
     * @return {Model} The model with the given id.
     */
    get: function get(id) {
      var instances = this.query().get(id).run();
      return instances.length ? instances[0] : undefined;
    },

    /**
     * Find the entity or entities that match the provided keyLists.
     *
     * Shortcut for `collection.query().getAll(keyList1, keyList2, ...).run()`
     *
     * Get the posts where "status" is "draft" or "inReview":
     * ```javascript
     * const posts = collection.getAll('draft', 'inReview', { index: 'status' })
     * ```
     * Same as above:
     * ```javascript
     * const posts = collection.getAll(['draft'], ['inReview'], { index: 'status' })
     * ```
     *
     * @memberof Collection
     * @instance
     * @param {...Array} [keyList] - Provide one or more keyLists, and all
     * entities matching each keyList will be retrieved. If no keyLists are
     * provided, all entities will be returned.
     * @param {Object} [opts] - Configuration options.
     * @param {string} [opts.index] - Name of the secondary index to use in the
     * query. If no index is specified, the main index is used.
     * @return {Array} The result.
     */
    getAll: function getAll() {
      var _query;

      return (_query = this.query()).getAll.apply(_query, arguments).run();
    },

    /**
     * Return the entities in this Collection that have a primary key that
     * was automatically generated when they were inserted.
     *
     * @memberof Collection
     * @instance
     * @return {Model[]} The models that have autoPks.
     */
    getAutoPkItems: function getAutoPkItems() {
      var self = this;
      return self.getAll().filter(function (model) {
        return self.autoPks[self.modelId(model)];
      });
    },

    /**
     * Limit the result.
     *
     * Shortcut for `collection.query().limit(maximumNumber).run()`
     *
     * ```javascript
     * const posts = collection.limit(10)
     * ```
     *
     * @memberof Collection
     * @instance
     * @param {number} num - The maximum number of entities to keep in the result.
     * @return {Array} The result.
     */
    limit: function limit(num) {
      return this.query().limit(num).run();
    },

    /**
     * Apply a mapping function to all entities.
     *
     * ```javascript
     * const names = collection.map(function (user) {
     *   return user.name
     * })
     * ```
     *
     * @memberof Collection
     * @instance
     * @param {Function} mapFn - Mapping function.
     * @param {*} [thisArg] - Context to which to bind `mapFn`.
     * @return {Array} The result of the mapping.
     */
    map: function map(cb, thisArg) {
      var data = [];
      this.index.visitAll(function (value) {
        data.push(cb.call(thisArg, value));
      });
      return data;
    },

    /**
     * Return the result of calling the specified function on each item in this
     * collection's main index.
     *
     * @memberof Collection
     * @instance
     * @param {string} funcName - Name of function to call
     * @parama {...*} [args] - Remaining arguments to be passed to the function.
     * @return {Array} The result.
     */
    mapCall: function mapCall(funcName) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var data = [];
      this.index.visitAll(function (item) {
        data.push(item[funcName].apply(item, args));
      });
      return data;
    },

    /**
     * Return the primary key of the given, or if no model is provided, return the
     * name of the field that holds the primary key of models in this Collection.
     *
     * @memberof Collection
     * @instance
     * @param {Model} [model] - The model whose primary key is to be returned.
     * @return {(string|number)} - Primary key or name of field that holds primary
     * key.
     */
    modelId: function modelId(model) {
      var self = this;
      if (!model) {
        return self.model ? self.model.idAttribute : self.idAttribute || 'id';
      }
      return get(model, self.modelId());
    },

    /**
     * Create a new query to be executed against the contents of the collection.
     * The result will be all or a subset of the contents of the collection.
     *
     * Grab page 2 of users between ages 18 and 30:
     * ```javascript
     * collection.query()
     *   .between(18, 30, { index: 'age' }) // between ages 18 and 30
     *   .skip(10) // second page
     *   .limit(10) // page size
     *   .run()
     * ```
     *
     * @memberof Collection
     * @instance
     * @return {Query} New query object.
     */
    query: function query() {
      return new Query(this);
    },

    /**
     * Reduce the data in the collection to a single value and return the result.
     *
     * ```javascript
     * const totalVotes = collection.reduce(function (prev, entity) {
     *   return prev + entity.upVotes + entity.downVotes
     * }, 0)
     * ```
     *
     * @memberof Collection
     * @instance
     * @param {Function} cb - Reduction callback.
     * @param {*} initialValue - Initial value of the reduction.
     * @return {*} The result.
     */
    reduce: function reduce(cb, initialValue) {
      var data = this.getAll();
      return data.reduce(cb, initialValue);
    },

    /**
     * Remove the model with the given id from this Collection.
     *
     * @memberof Collection
     * @instance
     * @param {(string|number)} id - The primary key of the entity to be removed.
     * @param {Object} [opts] - Configuration options.
     * @return {Model} The removed entity, if any.
     */
    remove: function remove(id, opts) {
      var self = this;

      // Default values for arguments
      opts || (opts = {});
      self.beforeRemove(id, opts);
      var model = self.get(id);

      // The model is in the collection, remove it
      if (model) {
        delete self.added[id];
        delete self.autoPks[id];
        self.index.removeRecord(model);
        forOwn(self.indexes, function (index, name) {
          index.removeRecord(model);
        });
        if (model && isFunction(model.off)) {
          model.off('all', self._onModelEvent, self);
          self.emit('remove', model);
        }
      }
      return self.afterRemove(id, opts, model) || model;
    },

    /**
     * Remove the instances selected by "query" from the Collection instance of
     * this Model.
     *
     * @memberof Collection
     * @instance
     * @param {Object} [query={}] - Selection query.
     * @param {Object} [query.where] - Filtering criteria.
     * @param {number} [query.skip] - Number to skip.
     * @param {number} [query.limit] - Number to limit to.
     * @param {Array} [query.orderBy] - Sorting criteria.
     * @param {Object} [opts] - Configuration options.
     * @return {Model[]} The removed entites, if any.
     */
    removeAll: function removeAll(query, opts) {
      var self = this;
      // Default values for arguments
      opts || (opts = {});
      self.beforeRemoveAll(query, opts);
      var models = self.filter(query);

      // Remove each selected entity from the collection
      models.forEach(function (item) {
        self.remove(self.modelId(item));
      });
      return self.afterRemoveAll(query, opts, models) || models;
    },

    /**
     * Skip a number of results.
     *
     * Shortcut for `collection.query().skip(numberToSkip).run()`
     *
     * ```javascript
     * const posts = collection.skip(10)
     * ```
     *
     * @memberof Collection
     * @instance
     * @param {number} num - The number of entities to skip.
     * @return {Array} The result.
     */
    skip: function skip(num) {
      return this.query().skip(num).run();
    },

    /**
     * Return the plain JSON representation of all items in this collection.
     * Assumes entities in this collection have a toJSON method.
     *
     * @memberof Collection
     * @instance
     * @param {Object} [opts] - Configuration options.
     * @param {string[]} [opts.with] - Array of relation names or relation fields
     * to include in the representation.
     * @return {Array} The entities.
     */
    toJSON: function toJSON(opts) {
      return this.mapCall('toJSON', opts);
    },

    /**
     * TODO
     *
     * @memberof Collection
     * @instance
     * @param {(string|number)} id - Passed to {@link Model.update}.
     * @param {Object} props - Passed to {@link Model.update}.
     * @param {Object} [opts] - Passed to {@link Model.update}. See
     * {@link Model.update} for more configuration options.
     * @param {boolean} [opts.autoAdd] - TODO
     * @return {Promise}
     */
    update: function update(id, props, opts) {
      var self = this;
      opts || (opts = {});
      fillIn(opts, self.modelOpts);
      return self.model.update(id, props, opts).then(function (data) {
        return self._end(data, opts);
      });
    },

    /**
     * TODO
     *
     * @memberof Collection
     * @instance
     * @param {Object?} query - Passed to {@link Model.updateAll}.
     * @param {Object} props - Passed to {@link Model.updateAll}.
     * @param {Object} [opts] - Passed to {@link Model.updateAll}. See
     * {@link Model.updateAll} for more configuration options.
     * @param {boolean} [opts.autoAdd] - TODO
     * @return {Promise}
     */
    updateAll: function updateAll(query, props, opts) {
      var self = this;
      opts || (opts = {});
      fillIn(opts, self.modelOpts);
      return self.model.updateAll(query, props, opts).then(function (data) {
        return self._end(data, opts);
      });
    },

    /**
     * Update a record's position in a single index of this collection. See
     * {@link Collection#updateIndexes} to update a record's position in all
     * indexes at once.
     *
     * @memberof Collection
     * @instance
     * @param {Object} record - The record to update.
     * @param {Object} [opts] - Configuration options.
     * @param {string} [opts.index] The index in which to update the record's
     * position. If you don't specify an index then the record will be updated
     * in the main index.
     */
    updateIndex: function updateIndex(record, opts) {
      opts || (opts = {});
      var index = opts.index ? this.indexes[opts.index] : this.index;
      index.updateRecord(record);
    },

    /**
     * TODO
     *
     * @memberof Collection
     * @instance
     * @param {Object} record - TODO
     * @param {Object} [opts] - Configuration options.
     */
    updateIndexes: function updateIndexes(record) {
      var self = this;
      self.index.updateRecord(record);
      forOwn(self.indexes, function (index, name) {
        index.updateRecord(record);
      });
    },

    /**
     * TODO
     *
     * @memberof Collection
     * @instance
     * @param {Model[]} models - Passed to {@link Model.updateMany}.
     * @param {Object} [opts] - Passed to {@link Model.updateMany}. See
     * {@link Model.updateMany} for more configuration options.
     * @param {boolean} [opts.autoAdd] - TODO
     * @return {Promise}
     */
    updateMany: function updateMany(models, opts) {
      var self = this;
      opts || (opts = {});
      fillIn(opts, self.modelOpts);
      return self.model.updateMany(models, opts).then(function (data) {
        return self._end(data, opts);
      });
    }
  });

  eventify(Collection.prototype, function () {
    return this._listeners;
  }, function (value) {
    this._listeners = value;
  });

  var op = 'belongsTo';

  /**
   * Steps to apply a "belongsTo" relationship
   * 1. Choose the localField and foreignKey
   * 2. Configure property descriptor, possibly including custom getter/setter
   * 3. Add property to prototype of target Model
   *
   * The added property is where an instance of the related Model will be
   * attached to an instance of the target Model, e.g. if Comment belongsTo
   * User and "localField" is set to "user", "comment.user" will be a reference to
   * the user.
   *
   * @ignore
   */
  function applyBelongsTo(Model, Relation, opts) {
    opts || (opts = {});

    function getRelation() {
      var fake = {
        name: Relation
      };
      if (isString(Relation)) {
        if (isFunction(Model.getModel)) {
          return Model.getModel(Relation) || fake;
        }
        return fake;
      }
      return Relation;
    }

    function getLocalField() {
      return opts.localField || camelCase(getRelation().name);
    }

    function getForeignKey() {
      return opts.foreignKey || opts.localKey || camelCase(getRelation().name) + 'Id';
    }

    // Setup configuration of the property
    var descriptor = {
      // Whether the field specified by "localField" will show up in "for...in"
      enumerable: opts.enumerable !== undefined ? !!opts.enumerable : false,
      // Set default method for retrieving the linked relation
      get: function get() {
        return this._get('links.' + getLocalField());
      },

      // Set default method for setting the linked relation
      set: function set(parent) {
        if (!parent) {
          return;
        }
        this._set('links.' + getLocalField(), parent);
        _set(this, getForeignKey(), parent[getRelation().idAttribute]);
        return get(this, getLocalField());
      }
    };

    var originalGet = descriptor.get;
    var originalSet = descriptor.set;

    // Check for user-defined getter
    if (opts.get) {
      // Set user-defined getter
      descriptor.get = function () {
        var _this = this;

        // Call user-defined getter, passing in:
        //  - target Model
        //  - related Model
        //  - instance of target Model
        //  - the original getter function, in case the user wants to use it
        return opts.get(Model, getRelation(), this, function () {
          return originalGet.call(_this);
        });
      };
      delete descriptor.writable;
    }

    // Check for user-defined setter
    if (opts.set) {
      // Set user-defined setter
      descriptor.set = function (parent) {
        var _this2 = this;

        // Call user-defined getter, passing in:
        //  - target Model
        //  - related Model
        //  - instance of target Model
        //  - instance of related Model
        //  - the original setter function, in case the user wants to use it
        return opts.set(Model, getRelation(), this, parent, function (value) {
          return originalSet.call(_this2, value === undefined ? parent : value);
        });
      };
      delete descriptor.writable;
    }

    if (descriptor.get) {
      descriptor.set || (descriptor.set = function () {});
    }

    // Finally, added property to prototype of target Model
    Object.defineProperty(Model.prototype, getLocalField(), descriptor);

    if (!Model.relationList) {
      Model.relationList = [];
    }
    if (!Model.relationFields) {
      Model.relationFields = [];
    }
    opts.type = 'belongsTo';
    opts.name = Model.name;
    opts.relation = Relation.name;
    opts.Relation = Relation;
    opts.getRelation = getRelation;
    opts.getLocalField = getLocalField;
    opts.getForeignKey = getForeignKey;
    Model.relationList.push(opts);
    Model.relationFields.push(getLocalField());

    // Return target Model for chaining
    return Model;
  }

  /**
   * @memberof! module:js-data
   * @example
   * // ES6
   * import {belongsTo, Model} from 'js-data'
   * class User extends Model {}
   *
   * // @belongsTo(User) (ES7)
   * class Comment extends Model {}
   * belongsTo(User)(Comment)
   *
   * // ES5
   * var JSData = require('js-data')
   * var User = JSData.Model.extend({}, { name: 'User' })
   * var Comment = JSDataModel.extend({}, { name: 'Comment' })
   * JSData.belongsTo(User)(Comment)
   *
   * @param {Model} Relation - The Relation the target belongs to.
   * @param {Object} [opts] - Configuration options.
   * @param {string} [opts.localField] - The field on the target where the relation
   * will be attached.
   * @return {Function} Invocation function, which accepts the target as the only
   * parameter.
   */
  function belongsTo(Relation, opts) {
    return function (Model) {
      Model.dbg(op, Relation, opts);
      return applyBelongsTo(Model, Relation, opts);
    };
  }

  /**
   * @memberof! module:js-data
   * @example
   * // ES6
   * import {configure, Model} from 'js-data'
   *
   * // @configure(opts) (ES7)
   * class User extends JSData.Model {}
   * configure(opts)(User)
   *
   * // ES5
   * var JSData = require('js-data')
   * var User = JSData.Model.extend()
   * User.configure(opts)
   *
   * @param {Object} opts - Properties to apply to the target.
   * @param {boolean} [overwrite=true] - Whether to overwrite properties that
   * already exist on the target.
   */
  function configure(opts) {
    var overwrite = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

    opts = opts || {};
    return function (target) {
      forOwn(opts, function (value, key) {
        if (target[key] === undefined || overwrite) {
          target[key] = copy(value);
        }
      });
      return target;
    };
  }

  var op$1 = 'hasMany';

  /**
   * Steps to apply a "hasMany" relationship
   * 1. Choose the localField and foreignKey or localKeys
   * 2. Configure property descriptor, possibly including custom getter/setter
   * 3. Add property to prototype of target Model
   *
   * The added property is where instances of the related Model will be
   * attached to an instance of the target Model, e.g. if User hasMany Comment
   * and "localField" is set to "comments", "user.comments" will be a reference to
   * the array of comments.
   *
   * @ignore
   */
  function applyHasMany(Model, Relation, opts) {
    opts || (opts = {});

    function getRelation() {
      var fake = {
        name: Relation
      };
      if (isString(Relation)) {
        if (isFunction(Model.getModel)) {
          return Model.getModel(Relation) || fake;
        }
        return fake;
      }
      return Relation;
    }

    function getLocalField() {
      return opts.localField || camelCase(getRelation().name) + 'Collection';
    }

    // Choose field on related instances that holds the primary key of instances
    // of the target Model
    var foreignKey = opts.foreignKey;
    var localKeys = opts.localKeys;
    var foreignKeys = opts.foreignKeys;

    if (!foreignKey && !localKeys && !foreignKeys) {
      foreignKey = opts.foreignKey = camelCase(Model.name) + 'Id';
    }

    // Setup configuration of the property
    var descriptor = {
      // Whether the field specified by "localField" will show up in "for...in"
      enumerable: opts.enumerable !== undefined ? !!opts.enumerable : false,
      // Set default method for retrieving the linked relation
      get: function get() {
        return this._get('links.' + getLocalField());
      },

      // Set default method for setting the linked relation
      set: function set(children) {
        var _this = this;

        if (!children) {
          return;
        }
        this._set('links.' + getLocalField(), children);
        if (children && children.length) {
          (function () {
            var id = get(_this, Model.idAttribute);
            if (foreignKey) {
              children.forEach(function (child) {
                _set(child, foreignKey, id);
              });
            } else if (localKeys) {
              (function () {
                var keys = [];
                children.forEach(function (child) {
                  keys.push(get(child, getRelation().idAttribute));
                });
                _set(_this, localKeys, keys);
              })();
            } else if (foreignKeys) {
              children.forEach(function (child) {
                var keys = get(child, foreignKeys);
                if (keys) {
                  if (keys.indexOf(id) === -1) {
                    keys.push(id);
                  }
                } else {
                  _set(child, foreignKeys, [id]);
                }
              });
            }
          })();
        }
        return get(this, getLocalField());
      }
    };

    var originalGet = descriptor.get;
    var originalSet = descriptor.set;

    // Check for user-defined getter
    if (opts.get) {
      // Set user-defined getter
      descriptor.get = function () {
        var _this2 = this;

        // Call user-defined getter, passing in:
        //  - target Model
        //  - related Model
        //  - instance of target Model
        //  - the original getter function, in case the user wants to use it
        return opts.get(Model, getRelation(), this, function () {
          return originalGet.call(_this2);
        });
      };
    }

    // Check for user-defined setter
    if (opts.set) {
      // Set user-defined setter
      descriptor.set = function (children) {
        var _this3 = this;

        // Call user-defined getter, passing in:
        //  - target Model
        //  - related Model
        //  - instance of target Model
        //  - instances of related Model
        //  - the original setter function, in case the user wants to use it
        return opts.set(Model, getRelation(), this, children, function (value) {
          return originalSet.call(_this3, value === undefined ? children : value);
        });
      };
    }

    // Finally, added property to prototype of target Model
    Object.defineProperty(Model.prototype, getLocalField(), descriptor);

    if (!Model.relationList) {
      Model.relationList = [];
    }
    if (!Model.relationFields) {
      Model.relationFields = [];
    }
    opts.type = 'hasMany';
    opts.name = Model.name;
    opts.relation = getRelation().name;
    opts.Relation = getRelation();
    opts.getRelation = getRelation;
    opts.getLocalField = getLocalField;
    Model.relationList.push(opts);
    Model.relationFields.push(getLocalField());

    // Return target Model for chaining
    return Model;
  }

  /**
   * @memberof! module:js-data
   * @example
   * // ES6
   * import {hasMany, Model} from 'js-data'
   * class Comment extends Model {}
   *
   * // @hasMany(Comment)
   * class User extends Model {}
   * hasMany(Comment)(User)
   *
   * // ES5
   * var JSData = require('js-data')
   * var User = JSData.Model.extend({}, { name: 'User' })
   * var Comment = JSDataModel.extend({}, { name: 'Comment' })
   * JSData.hasMany(User)(Comment)
   *
   * @param {Model} Model - The Model of which the target has many.
   * @param {Object} [opts] - Configuration options.
   * @param {string} [opts.localField] - The field on the target where the relation
   * will be attached.
   * @return {Function} Invocation function, which accepts the target as the only
   * parameter.
   */
  function hasMany(Relation, opts) {
    return function (target) {
      target.dbg(op$1, Relation, opts);
      return applyHasMany(target, Relation, opts);
    };
  }

  var op$2 = 'hasOne';

  /**
   * Steps to apply a "hasOne" relationship
   * 1. Choose the foreignKey and localKey
   * 2. Configure property descriptor, possibly including custom getter/setter
   * 3. Add property to prototype of target Model
   *
   * The added property is where an instance of the related Model will be
   * attached to an instance of the target Model, e.g. if User hasOne
   * Profile and "localField" is set to "profile", "user.profile" will be a
   * reference to the profile.
   *
   * @ignore
   */
  function applyHasOne(Model, Relation, opts) {
    opts || (opts = {});

    function getRelation() {
      var fake = {
        name: Relation
      };
      if (isString(Relation)) {
        if (isFunction(Model.getModel)) {
          return Model.getModel(Relation) || fake;
        }
        return fake;
      }
      return Relation;
    }

    function getLocalField() {
      return opts.localField || camelCase(getRelation().name);
    }

    function getForeignKey() {
      return opts.foreignKey || opts.localKey || camelCase(Model.name) + 'Id';
    }

    // Setup configuration of the property
    var descriptor = {
      // Whether the field specified by "localField" will show up in "for...in"
      enumerable: opts.enumerable !== undefined ? !!opts.enumerable : false,
      // Set default method for retrieving the linked relation
      get: function get() {
        return this._get('links.' + getLocalField());
      },

      // Set default method for setting the linked relation
      set: function set(child) {
        if (!child) {
          return;
        }
        this._set('links.' + getLocalField(), child);
        _set(child, getForeignKey(), get(this, Model.idAttribute));
        return get(this, getLocalField());
      }
    };

    // Check for user-defined getter
    if (opts.get) {
      (function () {
        var originalGet = descriptor.get;
        // Set user-defined getter
        descriptor.get = function () {
          var _this = this;

          // Call user-defined getter, passing in:
          //  - target Model
          //  - related Model
          //  - instance of target Model
          //  - the original getter function, in case the user wants to use it
          return opts.get(Model, Relation, this, originalGet ? function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            return originalGet.apply(_this, args);
          } : undefined);
        };
      })();
    }

    // Check for user-defined setter
    if (opts.set) {
      (function () {
        var originalSet = descriptor.set;
        // Set user-defined setter
        descriptor.set = function (child) {
          var _this2 = this;

          // Call user-defined getter, passing in:
          //  - target Model
          //  - related Model
          //  - instance of target Model
          //  - instance of related Model
          //  - the original setter function, in case the user wants to use it
          return opts.set(Model, Relation, this, child, originalSet ? function () {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
              args[_key2] = arguments[_key2];
            }

            return originalSet.apply(_this2, args);
          } : undefined);
        };
      })();
    }

    // Finally, added property to prototype of target Model
    Object.defineProperty(Model.prototype, getLocalField(), descriptor);

    if (!Model.relationList) {
      Model.relationList = [];
    }
    if (!Model.relationFields) {
      Model.relationFields = [];
    }
    opts.type = 'hasOne';
    opts.name = Model.name;
    opts.relation = Relation.name;
    opts.Relation = Relation;
    opts.getRelation = getRelation;
    opts.getLocalField = getLocalField;
    opts.getForeignKey = getForeignKey;
    Model.relationList.push(opts);
    Model.relationFields.push(getLocalField());

    // Return target Model for chaining
    return Model;
  }

  /**
   * @memberof! module:js-data
   * @example
   * // ES6
   * import {hasOne, Model} from 'js-data'
   * class User extends Model {}
   *
   * // @hasOne(User) (ES7)
   * class Comment extends Model {}
   * hasOne(User, {...})(Comment)
   *
   * // ES5
   * var JSData = require('js-data')
   * var User = JSData.Model.extend({}, { name: 'User' })
   * var Comment = JSDataModel.extend({}, { name: 'Comment' })
   * JSData.hasOne(User, {...})(Comment)
   *
   * @param {Model} Model - The Model of which the target has one.
   * @param {Object} [opts] - Configuration options.
   * @param {string} [opts.localField] - The field on the target where the relation
   * will be attached.
   * @return {Function} Invocation function, which accepts the target as the only
   * parameter.
   */
  function hasOne(Model, opts) {
    return function (target) {
      target.dbg(op$2, 'Model:', Model, 'opts:', opts);
      return applyHasOne(target, Model, opts);
    };
  }

  var op$3 = 'setSchema';

  /**
   * @param {Model} target - Target Model.
   * @param {string} key - Key for new property.
   * @param {Object} opts - Configuration options.
   * @ignore
   */
  function makeDescriptor(target, key, opts) {
    var descriptor = {
      enumerable: opts.enumerable !== undefined ? opts.enumerable : true
    };
    descriptor.get = function () {
      return this._get('props.' + key);
    };
    descriptor.set = function (value) {
      var _this = this;

      // TODO: rework this
      // if (isFunction(opts.validate) && !opts.validate(value)) {
      //   return false
      // }
      var _get = this._get;
      var _set = this._set;
      var _unset = this._unset;
      // if (!_get('noValidate')) {
      //   const errors = validate(opts, value)
      //   if (errors) {
      //     throw new Error(errors.join(', '))
      //   }
      // }
      if (opts.track && !_get('creating')) {
        (function () {
          var changing = _get('changing');
          var previous = _get('previous.' + key);
          var current = _get('props.' + key);
          var changed = _get('changed');
          if (!changing) {
            changed = [];
          }
          var index = changed.indexOf(key);
          if (current !== value && index === -1) {
            changed.push(key);
          }
          if (previous !== value) {
            _set('changes.' + key, value);
          } else {
            _unset('changes.' + key);
            if (index >= 0) {
              changed.splice(index, 1);
            }
          }
          if (!changed.length) {
            changing = false;
            _unset('changing');
            _unset('changed');
            if (_get('eventId')) {
              clearTimeout(_get('eventId'));
              _unset('eventId');
            }
          }
          if (!changing && changed.length) {
            _set('changed', changed);
            _set('changing', true);
            _set('eventId', setTimeout(function () {
              _unset('changed');
              _unset('eventId');
              _unset('changing');
              if (!_get('silent')) {
                var i = undefined;
                for (i = 0; i < changed.length; i++) {
                  _this.emit('change:' + changed[i], _this, get(_this, changed[i]));
                }
                _this.emit('change', _this, _get('changes'));
              }
              _unset('silent');
            }, 0));
          }
        })();
      }
      _set('props.' + key, value);
      // if (_get('$') && opts.indexed) {
      //   target.getCollection().updateIndex(this, { index: key })
      // }
      return value;
    };
    // if (opts.indexed) {
    //   // Update index
    //   // TODO: Make this configurable, ie. immediate or lazy update
    //   target.createIndex(key)
    // }
    if (opts.get) {
      if (descriptor.get) {
        (function () {
          var originalGet = descriptor.get;
          descriptor.get = function () {
            return opts.get.call(this, originalGet);
          };
        })();
      } else {
        descriptor.get = opts.get;
      }
    }
    if (opts.set) {
      if (descriptor.set) {
        (function () {
          var originalSet = descriptor.set;
          descriptor.set = function (value) {
            return opts.set.call(this, value, originalSet);
          };
        })();
      } else {
        descriptor.set = opts.set;
      }
    }
    return descriptor;
  }

  /**
   * @memberof! module:js-data
   * @example
   * // ES6
   * import {setSchema, Model} from 'js-data'
   * const properties = {
   *   first: {},
   *   last: {},
   *   role: {
   *     value: 'dev'
   *   },
   *   // computed property
   *   name: {
   *     get() { return `${this.first} ${this.last}` },
   *     set(value) {
   *       let parts = value.split(' ')
   *       this.first = parts[0]
   *       this.last = parts[1]
   *       return this
   *     }
   *   }
   * }
   *
   * // @setSchema(properties) (ES7)
   * class User extends Model {}
   * User.setSchema(properties)
   *
   * // ES5
   * var JSData = require('js-data')
   * var User = JSData.Model.extend({}, { name: 'User' })
   * User.setSchema(properties)
   *
   * @param {Object.<string, Object>} opts - Property configurations.
   * @return {Function} Invocation function, which accepts the target as the only
   * parameter.
   */
  function setSchema(opts) {
    opts || (opts = {});

    return function (target) {
      target.dbg(op$3, 'opts:', opts);

      target.schema || (target.schema = {});
      configure(target.schema, opts);

      forOwn(opts, function (prop, key) {
        var descriptor = makeDescriptor(target, key, prop);
        // TODO: This won't work for properties of Object type, because all
        // instances will share the prototype value
        if (!descriptor.writable) {
          Object.defineProperty(target.prototype, key, descriptor);
        }
      });
      return target;
    };
  }

  var op$4 = 'registerAdapter';

  /**
   * Add the provided adapter to the target's "adapters" property, registering it
   * with the specified.
   * @memberof! module:js-data
   * @param {string} name - The name under which to register the adapter.
   * @param {Adapter} adapter - The adapter to register.
   * @param {Object} opts - Configuration options.
   * @param {boolean} [opts.default=false] - Whether to make the adapter the
   * default adapter for the target.
   * @return {Function} Invocation function, which accepts the target as the only
   * parameter.
   */
  function registerAdapter(name, adapter, opts) {
    opts || (opts = {});
    opts.op = op$4;
    return function (target) {
      target.dbg(op$4, 'name:', name, 'adapter:', adapter, 'opts:', opts);
      // Register the adapter
      target.getAdapters()[name] = adapter;
      // Optionally make it the default adapter for the target.
      if (opts === true || opts.default) {
        target.defaultAdapter = name;
      }
    };
  }

  var resolve = resolve$1;

  var notify = function notify() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var self = this;
    var opts = args.pop();
    self.dbg.apply(self, [opts.op].concat(args));
    if (opts.notify || opts.notify === undefined && self.notify) {
      setTimeout(function () {
        self.emit.apply(self, [opts.op].concat(args));
      });
    }
  };

  /**
   * js-data's Model class.
   * @class Model
   * @example {@lang javascript}class User extends Model {}
   *
   * @abstract
   * @param {Object} [props] The initial properties of the new instance.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.noValidate=false] Whether to skip validation on the
   * initial properties.
   */
  function Model(props, opts) {
    var self = this;
    classCallCheck(self, Model);

    props || (props = {});
    opts || (opts = {});
    var _props = {};
    Object.defineProperties(self, {
      _get: {
        value: function value(key) {
          return get(_props, key);
        }
      },
      _set: {
        value: function value(key, _value) {
          return _set(_props, key, _value);
        }
      },
      _unset: {
        value: function value(key) {
          return unset(_props, key);
        }
      }
    });
    self._set('creating', true);
    if (opts.noValidate) {
      self._set('noValidate', true);
    }
    fillIn(self, props);
    self._unset('creating');
    self._set('changes', {});
    self._unset('noValidate');
    self._set('previous', copy(props));
  }

  /**
   * Instance members
   */
  addHiddenPropsToTarget(Model.prototype, {
    schema: function schema(key) {
      var _schema = this.constructor.schema;
      return key ? _schema[key] : _schema;
    },

    // validate (obj, value) {
    //   let errors = []
    //   let _schema = this.schema()
    //   if (!obj) {
    //     obj = this
    //   } else if (utils.isString(obj)) {
    //     const prop = _schema[obj]
    //     if (prop) {
    //       errors = validate.validate(prop, value) || []
    //     }
    //   } else {
    //     utils.forOwn(_schema, function (prop, key) {
    //       errors = errors.concat(validate.validate(prop, utils.get(obj, key)) || [])
    //     })
    //   }
    //   return errors.length ? errors : undefined
    // },

    /**
     * @param {Object} [opts] Configuration options. @see {@link Model.create}.
     */
    create: function create(opts) {
      return this.constructor.create(this, opts);
    },
    beforeSave: function beforeSave() {},
    save: function save(opts) {
      var op = undefined,
          adapter = undefined;
      var self = this;
      var Ctor = self.constructor;

      // Default values for arguments
      opts || (opts = {});

      // Fill in "opts" with the Model's configuration
      _(self, opts);
      adapter = opts.adapter = self.getAdapterName(opts);

      // beforeSave lifecycle hook
      op = opts.op = 'beforeSave';
      return resolve(self[op](opts)).then(function () {
        // Now delegate to the adapter
        op = opts.op = 'save';
        Ctor.dbg(op, self, opts);
        return self.getAdapter(adapter)[op](Ctor, self, opts);
      }).then(function (data) {
        // afterSave lifecycle hook
        op = opts.op = 'afterSave';
        return resolve(self[op](data, opts)).then(function (_data) {
          // Allow for re-assignment from lifecycle hook
          data = _data || data;
          if (opts.raw) {
            self.set(data.data);
            data.data = self;
          } else {
            self.set(data);
          }
          return Ctor.end(data, opts);
        });
      });
    },
    afterSave: function afterSave() {},
    beforeLoadRelations: function beforeLoadRelations() {},
    loadRelations: function loadRelations(relations, opts) {
      var op = undefined;
      var self = this;
      var Ctor = self.constructor;
      var relationList = Ctor.relationList || [];

      // Default values for arguments
      relations || (relations = []);
      opts || (opts = {});

      // Fill in "opts" with the Model's configuration
      _(Ctor, opts);
      opts.adapter = Ctor.getAdapterName(opts);

      // beforeLoadRelations lifecycle hook
      op = opts.op = 'beforeLoadRelations';
      return resolve(self[op](relations, opts)).then(function () {
        if (isString(relations)) {
          relations = [relations];
        }
        // Now delegate to the adapter
        op = opts.op = 'loadRelations';
        Ctor.dbg(op, self, relations, opts);
        return Promise.all(relationList.map(function (def) {
          if (isFunction(def.load)) {
            return def.load(Ctor, def, self, opts);
          }
          var task = undefined;
          if (def.type === 'hasMany' && def.foreignKey) {
            // hasMany
            task = def.Relation.findAll(babelHelpers.defineProperty({}, def.foreignKey, get(self, Ctor.idAttribute)), opts);
          } else if (def.foreignKey) {
            // belongsTo or hasOne
            var key = get(self, def.foreignKey);
            if (isSorN(key)) {
              task = def.Relation.find(key, opts);
            }
          } else if (def.localKeys) {
            // hasMany
            task = def.Relation.findAll(babelHelpers.defineProperty({}, def.Relation.idAttribute, {
              'in': get(self, def.localKeys)
            }), opts);
          } else if (def.foreignKeys) {
            // hasMany
            task = def.Relation.findAll(babelHelpers.defineProperty({}, def.Relation.idAttribute, {
              'contains': get(self, Ctor.idAttribute)
            }), opts);
          }
          if (task) {
            task = task.then(function (data) {
              if (opts.raw) {
                data = data.data;
              }
              _set(self, def.localField, def.type === 'hasOne' ? data.length ? data[0] : undefined : data);
            });
          }
          return task;
        }));
      }).then(function () {
        // afterLoadRelations lifecycle hook
        op = opts.op = 'afterLoadRelations';
        return resolve(self[op](relations, opts)).then(function () {
          return self;
        });
      });
    },
    afterLoadRelations: function afterLoadRelations() {},

    /**
     * @param {Object} [opts] Configuration options. @see {@link Model.destroy}.
     */
    destroy: function destroy(opts) {
      // TODO: move actual destroy logic here
      var Ctor = this.constructor;
      return Ctor.destroy(get(this, Ctor.idAttribute), opts);
    },

    // TODO: move logic for single-item async operations onto the instance.

    /**
     * Return the value at the given path for this instance.
     *
     * @param {string} key - Path of value to retrieve.
     * @return {*} Value at path.
     */
    get: function get$$(key) {
      return get(this, key);
    },

    /**
     * Set the value for a given key, or the values for the given keys if "key" is
     * an object.
     *
     * @param {(string|Object)} key - Key to set or hash of key-value pairs to set.
     * @param {*} [value] - Value to set for the given key.
     * @param {Object} [opts] - Optional configuration.
     * @param {boolean} [opts.silent=false] - Whether to trigger change events.
     */
    set: function set(key, value, opts) {
      var self = this;
      if (isObject(key)) {
        opts = value;
      }
      opts || (opts = {});
      if (opts.silent) {
        self._set('silent', true);
      }
      _set(self, key, value);
      if (!self._get('eventId')) {
        self._unset('silent');
      }
    },

    /**
     * Unset the value for a given key.
     *
     * @param {string} key - Key to unset.
     * @param {Object} [opts] - Optional configuration.
     * @param {boolean} [opts.silent=false] - Whether to trigger change events.
     */
    unset: function unset$$(key, opts) {
      opts || (opts = {});
      if (opts.silent) {
        this._set('silent', true);
      }
      unset(this, key);
      if (!this._get('eventId')) {
        this._unset('silent');
      }
    },
    hashCode: function hashCode() {
      return get(this, this.constructor.idAttribute);
    },
    changes: function changes(key) {
      if (key) {
        return this._get('changes.' + key);
      }
      return this._get('changes');
    },
    hasChanges: function hasChanges() {
      return !!(this._get('changed') || []).length;
    },
    commit: function commit() {
      this._unset('changed');
      this._set('changes', {});
      this._set('previous', copy(this));
      return this;
    },
    previous: function previous(key) {
      if (key) {
        return this._get('previous.' + key);
      }
      return this._get('previous');
    },
    revert: function revert(opts) {
      var _this2 = this;

      var previous = this._get('previous') || {};
      opts || (opts = {});
      opts.preserve || (opts.preserve = []);
      forOwn(this, function (value, key) {
        if (key !== _this2.constructor.idAttribute && !previous.hasOwnProperty(key) && _this2.hasOwnProperty(key) && opts.preserve.indexOf(key) === -1) {
          delete _this2[key];
        }
      });
      forOwn(previous, function (value, key) {
        if (opts.preserve.indexOf(key) === -1) {
          _this2[key] = value;
        }
      });
      this.commit();
      return this;
    },
    toJSON: function toJSON(opts) {
      return this.constructor.toJSON(this, opts);
    }
  });

  /**
   * Static members
   */
  fillIn(Model, {
    /**
     * Hash of registered adapters. Don't modify. Use {@link Model.registerAdapter}.
     *
     * @memberOf Model
     * @private
     */
    _adapters: null,

    /**
     * @ignore
     */
    _adaptersOwner: null,

    /**
     * Hash of registered listeners. Don't modify. Use {@link Model.on} and
     * {@link Model.off}.
     *
     * @memberOf Model
     * @private
     */
    _listeners: null,

    /**
     * @ignore
     */
    _listenersOwner: null,

    /**
     * Whether to disallow the use of `new Function` in {@link Model.extend}.
     *
     * You may set this to `true` if you so desire, but the class (constructor
     * function) produced by {@link Model.extend} will not be a named function,
     * which makes for slightly less debuggability.
     *
     * @memberof Model
     * @type {boolean}
     * @default false
     */
    csp: false,

    /**
     * The name of the registered adapter that should be used by default by any
     * of the Model's static methods that use an adapter.
     *
     * @memberof Model
     * @type {string}
     * @default http
     */
    defaultAdapter: 'http',

    /**
     * Whether to enable debug-level logs.
     *
     * @memberof Model
     * @type {boolean}
     * @default false
     */
    debug: false,

    /**
     * The field on instances of {@link Model} that should be used as the unique
     * identifier for instances of the Model.
     *
     * @memberof Model
     * @type {string}
     * @default id
     */
    idAttribute: 'id',

    /**
     * Whether this Model should emit operational events.
     *
     * @memberof Model
     * @type {boolean}
     * @default true
     */
    notify: true,

    pojo: false,

    /**
     * Whether the relation property accessors should be enumerable. It's
     * recommended that this stay false.
     *
     * @memberof Model
     * @type {boolean}
     * @default false
     */
    relationsEnumerable: false,

    /**
     * Whether {@link Model.create}, {@link Model.createMany}, {@link Model.save},
     * {@link Model.update}, {@link Model.updateAll}, {@link Model.updateMany},
     * {@link Model.find}, {@link Model.findAll}, {@link Model.destroy}, and
     * {@link Model.destroyAll} should return a raw result object that contains
     * both the instance data returned by the adapter _and_ metadata about the
     * operation.
     *
     * The default is to NOT return the result object, and instead return just the
     * instance data.
     *
     * @memberof Model
     * @type {boolean}
     * @default false
     */
    raw: false,

    /**
     * Whether {@link Model.create} and {@link Model.createMany} should instead
     * call {@link Model.update} and {@link Model.updateMany} if the provided
     * props/entities already contain a primary key.
     *
     * @memberof Model
     * @type {boolean}
     * @default true
     */
    upsert: true,

    /**
     * @memberOf Model
     * @method
     * @private
     */
    _events: function _events(value) {
      if (value) {
        this._listeners = value;
      } else if (this._listenersOwner !== this) {
        this._listeners = {};
        this._listenersOwner = this;
      }
      return this._listeners;
    },
    end: function end(data, opts) {
      var self = this;
      if (opts.raw) {
        _(opts, data);
      }
      if (!opts.pojo) {
        var _data = opts.raw ? data.data : data;
        if (isArray(_data)) {
          _data = _data.map(function (item) {
            return self.createInstance(item);
          });
        } else {
          _data = self.createInstance(_data);
        }
        if (opts.raw) {
          data.data = _data;
        } else {
          data = _data;
        }
      }
      if (opts.notify) {
        setTimeout(function () {
          self.emit(opts.op, data, opts);
        });
      }
      return data;
    },

    /**
     * Return new instance of this Model from the given properties. Equivalent to
     * `new Model([props][, opts])`. Returns `props` if `props` is already an
     * instance of this Model.
     *
     * @memberof Model
     * @method
     * @param {Object} props - The initial properties of the new instance.
     * @param {Object} [opts] - Configuration options.
     * @param {boolean} [opts.noValidate=false] Whether to skip validation on the
     * initial properties.
     * @return {Model} The instance.
     */
    createInstance: function createInstance(props, opts) {
      var Ctor = this;
      // Check to make sure "props" is not already an instance of this Model.
      return props instanceof Ctor ? props : new Ctor(props, opts);
    },

    /**
     * Return whether `instance` is an instance of this Model's instance class.
     *
     * @memberof Model
     * @method
     * @param {Object} instance - The instance to check.
     * @return {boolean} Whether `instance` is an instance of this Model's
     * instance class.
     */
    is: function is(instance, modelOnly) {
      var self = this;
      return self.instanceClass && !modelOnly ? instance instanceof self.instanceClass : instance instanceof self;
    },

    /**
     * Return a plain object representation of the given entity.
     *
     * @memberOf Model
     * @method
     * @param {Object} - Entity of which to return the plain
     * representation.
     * @param {Object} [opts] - Configuration options.
     * @param {string[]} [opts.with] - Array of relation names or relation fields
     * to include in the representation.
     * @return {Object} Plain object representation of instance.
     */
    toJSON: function toJSON(data, opts) {
      var self = this;
      opts || (opts = {});
      var json = data;
      if (self.is(data)) {
        json = {};
        for (var key in data) {
          json[key] = data[key];
        }
        // The user wants to include relations in the resulting plain object
        // representation
        if (self && self.relationList && opts.with) {
          if (isString(opts.with)) {
            opts.with = [opts.with];
          }
          self.relationList.forEach(function (def) {
            var containedName = undefined;
            if (opts.with.indexOf(def.relation) !== -1) {
              containedName = def.relation;
            } else if (opts.with.indexOf(def.localField) !== -1) {
              containedName = def.localField;
            }
            if (containedName) {
              (function () {
                var optsCopy = { with: opts.with.slice() };

                // Prepare to recurse into deeply nested relations
                optsCopy.with.splice(optsCopy.with.indexOf(containedName), 1);
                optsCopy.with.forEach(function (relation, i) {
                  if (relation && relation.indexOf(containedName) === 0 && relation.length >= containedName.length && relation[containedName.length] === '.') {
                    optsCopy.with[i] = relation.substr(containedName.length + 1);
                  } else {
                    optsCopy.with[i] = '';
                  }
                });
                var relationData = get(data, def.localField);

                if (relationData) {
                  // The actual recursion
                  if (isArray(relationData)) {
                    _set(json, def.localField, relationData.map(function (item) {
                      return def.Relation.toJSON(item, optsCopy);
                    }));
                  } else {
                    _set(json, def.localField, def.Relation.toJSON(relationData, optsCopy));
                  }
                }
              })();
            }
          });
        }
      }
      return json;
    },

    /**
     * Return the registered adapter with the given name or the default adapter if
     * no name is provided.
     *
     * @memberof Model
     * @method
     * @param {string} [name]- The name of the adapter to retrieve.
     * @return {Adapter} The adapter, if any.
     */
    getAdapter: function getAdapter(name) {
      this.dbg('getAdapter', 'name:', name);
      var adapter = this.getAdapterName(name);
      if (!adapter) {
        throw new ReferenceError(adapter + ' not found!');
      }
      return this.getAdapters()[adapter];
    },

    /**
     * Return the name of a registered adapter based on the given name or options,
     * or the name of the default adapter if no name provided.
     *
     * @memberof Model
     * @method
     * @param {(Object|string)} [opts] - The name of an adapter or options, if any.
     * @return {string} The name of the adapter.
     */
    getAdapterName: function getAdapterName(opts) {
      opts || (opts = {});
      if (isString(opts)) {
        opts = { adapter: opts };
      }
      return opts.adapter || opts.defaultAdapter;
    },
    getAdapters: function getAdapters() {
      if (this._adaptersOwner !== this) {
        var prevAdapters = this._adapters;
        this._adapters = {};
        if (prevAdapters) {
          fillIn(this._adapters, prevAdapters);
        }
        this._adaptersOwner = this;
      }
      return this._adapters;
    },
    getSchema: function getSchema() {
      return this._schema;
    },

    /**
     * Model lifecycle hook called by {@link Model.create}. If this method
     * returns a promise then {@link Model.create} will wait for the promise
     * to resolve before continuing.
     *
     * @memberof Model
     * @method
     * @param {Object} props - The `props` argument passed to {@link Model.create}.
     * @param {Object} opts - The `opts` argument passed to {@link Model.create}.
     */
    beforeCreate: notify,

    checkUpsertCreate: function checkUpsertCreate(props, opts) {
      var self = this;
      return (opts.upsert || opts.upsert === undefined && self.upsert) && get(props, self.idAttribute);
    },

    /**
     * Using an adapter, create a new the entity from the provided `props`.
     *
     * {@link Model.beforeCreate} will be called before calling the adapter.
     * {@link Model.afterCreate} will be called after calling the adapter.
     *
     * @memberof Model
     * @method
     * @param {Object} props - The properties from which to create the entity.
     * @param {Object} [opts] - Configuration options.
     * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
     * lifecycle events.
     * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
     * created data. If `true` return a response object that includes the created
     * data and metadata about the operation.
     * @param {string[]} [opts.with=[]] Relations to create in a cascading
     * create if `props` contains nested relations. NOT performed in a transaction.
     */
    create: function create(props, opts) {
      var op = undefined,
          adapter = undefined;
      var self = this;

      // Default values for arguments
      props || (props = {});
      opts || (opts = {});

      // Check whether we should do an upsert instead
      if (self.checkUpsertCreate(props, opts)) {
        return self.update(get(props, self.idAttribute), props, opts);
      }

      // Fill in "opts" with the Model's configuration
      _(self, opts);
      adapter = opts.adapter = self.getAdapterName(opts);

      // beforeCreate lifecycle hook
      op = opts.op = 'beforeCreate';
      return resolve(self[op](props, opts)).then(function (_props) {
        // Allow for re-assignment from lifecycle hook
        props = _props || props;
        // Now delegate to the adapter
        op = opts.op = 'create';
        var json = self.toJSON(props, opts);
        self.dbg(op, json, opts);
        return self.getAdapter(adapter)[op](self, json, opts);
      }).then(function (data) {
        // afterCreate lifecycle hook
        op = opts.op = 'afterCreate';
        return resolve(self[op](data, opts)).then(function (_data) {
          // Allow for re-assignment from lifecycle hook
          data = _data || data;
          // Possibly formulate result object
          return self.end(data, opts);
        });
      });
    },

    /**
     * Model lifecycle hook called by {@link Model.create}. If this method
     * returns a promise then {@link Model.create} will wait for the promise
     * to resolve before continuing.
     *
     * @memberof Model
     * @method
     * @param {Object} data - The `data` return by the adapter.
     * @param {Object} opts - The `opts` argument passed to {@link Model.create}.
     */
    afterCreate: notify,

    /**
     * Model lifecycle hook called by {@link Model.createMany}. If this method
     * returns a promise then {@link Model.createMany} will wait for the promise
     * to resolve before continuing.
     *
     * @memberof Model
     * @method
     * @param {Array} entities - The `entities` argument passed to {@link Model.createMany}.
     * @param {Object} opts - The `opts` argument passed to {@link Model.createMany}.
     */
    beforeCreateMany: notify,

    checkUpsertCreateMany: function checkUpsertCreateMany(entities, opts) {
      var self = this;
      if (opts.upsert || opts.upsert === undefined && self.upsert) {
        return entities.reduce(function (hasId, item) {
          return hasId && get(item, self.idAttribute);
        }, true);
      }
    },

    /**
     * Given an array of entities, batch create them via an adapter.
     *
     * {@link Model.beforeCreateMany} will be called before calling the adapter.
     * {@link Model.afterCreateMany} will be called after calling the adapter.
     *
     * @memberof Model
     * @method
     * @param {Array} entities - Array up entities to be created.
     * @param {Object} [opts] - Configuration options.
     * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
     * lifecycle events.
     * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
     * updated data. If `true` return a response object that includes the updated
     * data and metadata about the operation.
     * @param {string[]} [opts.with=[]] Relations to create in a cascading create
     * if the entities to be created have linked/nested relations. NOT performed
     * in a transaction.
     */
    createMany: function createMany(entities, opts) {
      var op = undefined,
          adapter = undefined;
      var self = this;

      // Default values for arguments
      entities || (entities = []);
      opts || (opts = {});

      // Check whether we should do an upsert instead
      if (self.checkUpsertCreateMany(entities, opts)) {
        return self.updateMany(entities, opts);
      }

      // Fill in "opts" with the Model's configuration
      _(self, opts);
      adapter = opts.adapter = self.getAdapterName(opts);

      // beforeCreateMany lifecycle hook
      op = opts.op = 'beforeCreateMany';
      return resolve(self[op](entities, opts)).then(function (_entities) {
        // Allow for re-assignment from lifecycle hook
        entities = _entities || entities;
        // Now delegate to the adapter
        op = opts.op = 'createMany';
        var json = entities.map(function (item) {
          return self.toJSON(item, opts);
        });
        self.dbg(op, json, opts);
        return self.getAdapter(adapter)[op](self, json, opts);
      }).then(function (data) {
        // afterCreateMany lifecycle hook
        op = opts.op = 'afterCreateMany';
        return resolve(self[op](data, opts)).then(function (_data) {
          // Allow for re-assignment from lifecycle hook
          data = _data || data;
          // Possibly inject result and/or formulate result object
          return self.end(data, opts);
        });
      });
    },

    /**
     * Model lifecycle hook called by {@link Model.createMany}. If this method
     * returns a promise then {@link Model.createMany} will wait for the promise
     * to resolve before continuing.
     *
     * @memberof Model
     * @method
     * @param {Array} entities - The `entities` argument passed to {@link Model.createMany}.
     * @param {Object} opts - The `opts` argument passed to {@link Model.createMany}.
     */
    afterCreateMany: notify,

    /**
     * Model lifecycle hook called by {@link Model.find}. If this method
     * returns a promise then {@link Model.find} will wait for the promise
     * to resolve before continuing.
     *
     * @memberof Model
     * @method
     * @param {(string|number)} id - The `id` argument passed to {@link Model.find}.
     * @param {Object} opts - The `opts` argument passed to {@link Model.find}.
     */
    beforeFind: notify,

    /**
     * Retrieve via an adapter the entity with the given primary key.
     *
     * {@link Model.beforeFind} will be called before calling the adapter.
     * {@link Model.afterFind} will be called after calling the adapter.
     *
     * @memberof Model
     * @method
     * @param {(string|number)} id - The primary key of the entity to retrieve.
     * @param {Object} [opts] - Configuration options.
     * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
     * lifecycle events.
     * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
     * updated data. If `true` return a response object that includes the updated
     * data and metadata about the operation.
     * @param {string[]} [opts.with=[]] Relations to eager load in the request.
     */
    find: function find(id, opts) {
      var op = undefined,
          adapter = undefined;
      var self = this;

      // Default values for arguments
      opts || (opts = {});

      // Fill in "opts" with the Model's configuration
      _(self, opts);
      adapter = opts.adapter = self.getAdapterName(opts);

      // beforeFind lifecycle hook
      op = opts.op = 'beforeFind';
      return resolve(self[op](id, opts)).then(function (_id) {
        // Allow for re-assignment from lifecycle hook
        id = _id === undefined ? id : _id;
        // Now delegate to the adapter
        op = opts.op = 'find';
        self.dbg(op, id, opts);
        return self.getAdapter(adapter)[op](self, id, opts);
      }).then(function (data) {
        // afterFind lifecycle hook
        op = opts.op = 'afterFind';
        return resolve(self[op](data, opts)).then(function (_data) {
          // Allow for re-assignment from lifecycle hook
          data = _data || data;
          // Possibly inject result and/or formulate result object
          return self.end(data, opts);
        });
      });
    },

    /**
     * Model lifecycle hook called by {@link Model.find}. If this method
     * returns a promise then {@link Model.find} will wait for the promise
     * to resolve before continuing.
     *
     * @memberof Model
     * @method
     * @param {(string|number)} id - The `id` argument passed to {@link Model.find}.
     * @param {Object} opts - The `opts` argument passed to {@link Model.find}.
     */
    afterFind: notify,

    /**
     * Model lifecycle hook called by {@link Model.findAll}. If this method
     * returns a promise then {@link Model.findAll} will wait for the promise
     * to resolve before continuing.
     *
     * @memberof Model
     * @method
     * @param {Object} query - The `query` argument passed to {@link Model.findAll}.
     * @param {Object} opts - The `opts` argument passed to {@link Model.findAll}.
     */
    beforeFindAll: notify,

    /**
     * Using the `query` argument, select entities to pull from an adapter.
     * Expects back from the adapter the array of selected entities.
     *
     * {@link Model.beforeFindAll} will be called before calling the adapter.
     * {@link Model.afterFindAll} will be called after calling the adapter.
     *
     * @memberof Model
     * @method
     * @param {Object} [query={}] - Selection query.
     * @param {Object} [query.where] - Filtering criteria.
     * @param {number} [query.skip] - Number to skip.
     * @param {number} [query.limit] - Number to limit to.
     * @param {Array} [query.orderBy] - Sorting criteria.
     * @param {Object} [opts] - Configuration options.
     * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
     * lifecycle events.
     * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
     * resulting data. If `true` return a response object that includes the
     * resulting data and metadata about the operation.
     * @param {string[]} [opts.with=[]] Relations to eager load in the request.
     */
    findAll: function findAll(query, opts) {
      var op = undefined,
          adapter = undefined;
      var self = this;

      // Default values for arguments
      query || (query = {});
      opts || (opts = {});

      // Fill in "opts" with the Model's configuration
      _(self, opts);
      adapter = opts.adapter = self.getAdapterName(opts);

      // beforeFindAll lifecycle hook
      op = opts.op = 'beforeFindAll';
      return resolve(self[op](query, opts)).then(function (_query) {
        // Allow for re-assignment from lifecycle hook
        query = _query || query;
        // Now delegate to the adapter
        op = opts.op = 'findAll';
        self.dbg(op, query, opts);
        return self.getAdapter(adapter)[op](self, query, opts);
      }).then(function (data) {
        // afterFindAll lifecycle hook
        op = opts.op = 'afterFindAll';
        return resolve(self[op](data, query, opts)).then(function (_data) {
          // Allow for re-assignment from lifecycle hook
          data = _data || data;
          // Possibly inject result and/or formulate result object
          return self.end(data, opts);
        });
      });
    },

    /**
     * Model lifecycle hook called by {@link Model.findAll}. If this method
     * returns a promise then {@link Model.findAll} will wait for the promise
     * to resolve before continuing.
     *
     * @memberof Model
     * @method
     * @param {Object} data - The `data` returned by the adapter.
     * @param {Object} query - The `query` argument passed to {@link Model.findAll}.
     * @param {Object} opts - The `opts` argument passed to {@link Model.findAll}.
     */
    afterFindAll: notify,

    /**
     * Model lifecycle hook called by {@link Model.update}. If this method
     * returns a promise then {@link Model.update} will wait for the promise
     * to resolve before continuing.
     *
     * @memberof Model
     * @method
     * @param {(string|number)} id - The `id` argument passed to {@link Model.update}.
     * @param {props} props - The `props` argument passed to {@link Model.update}.
     * @param {Object} opts - The `opts` argument passed to {@link Model.update}.
     */
    beforeUpdate: notify,

    /**
     * Using an adapter, update the entity with the primary key specified by the
     * `id` argument.
     *
     * {@link Model.beforeUpdate} will be called before updating the entity.
     * {@link Model.afterUpdate} will be called after updating the entity.
     *
     * @memberof Model
     * @method
     * @param {(string|number)} id - The primary key of the entity to update.
     * @param {Object} props - The update to apply to the entity.
     * @param {Object} [opts] - Configuration options.
     * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
     * lifecycle events.
     * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
     * updated data. If `true` return a response object that includes the updated
     * data and metadata about the operation.
     * @param {string[]} [opts.with=[]] Relations to update in a cascading
     * update if `props` contains nested updates to relations. NOT performed in a
     * transaction.
     */
    update: function update(id, props, opts) {
      var op = undefined,
          adapter = undefined;
      var self = this;

      // Default values for arguments
      props || (props = {});
      opts || (opts = {});

      // Fill in "opts" with the Model's configuration
      _(self, opts);
      adapter = opts.adapter = self.getAdapterName(opts);

      // beforeUpdate lifecycle hook
      op = opts.op = 'beforeUpdate';
      return resolve(self[op](id, props, opts)).then(function (_props) {
        // Allow for re-assignment from lifecycle hook
        props = _props || props;
        // Now delegate to the adapter
        op = opts.op = 'update';
        var json = self.toJSON(props, opts);
        self.dbg(op, id, json, opts);
        return self.getAdapter(adapter)[op](self, id, json, opts);
      }).then(function (data) {
        // afterUpdate lifecycle hook
        op = opts.op = 'afterUpdate';
        return resolve(self[op](id, data, opts)).then(function (_data) {
          // Allow for re-assignment from lifecycle hook
          data = _data || data;
          // Possibly inject result and/or formulate result object
          return self.end(data, opts);
        });
      });
    },

    /**
     * Model lifecycle hook called by {@link Model.update}. If this method
     * returns a promise then {@link Model.update} will wait for the promise
     * to resolve before continuing.
     *
     * @memberof Model
     * @method
     * @param {(string|number)} id - The `id` argument passed to {@link Model.update}.
     * @param {props} props - The `props` argument passed to {@link Model.update}.
     * @param {Object} opts - The `opts` argument passed to {@link Model.update}.
     */
    afterUpdate: notify,

    /**
     * Model lifecycle hook called by {@link Model.updateMany}. If this method
     * returns a promise then {@link Model.updateMany} will wait for the promise
     * to resolve before continuing.
     *
     * @memberof Model
     * @method
     * @param {Array} entities - The `entities` argument passed to {@link Model.updateMany}.
     * @param {Object} opts - The `opts` argument passed to {@link Model.updateMany}.
     */
    beforeUpdateMany: notify,

    /**
     * Given an array of updates, perform each of the updates via an adapter. Each
     * "update" is a hash of properties with which to update an entity. Each
     * update must contain the primary key to be updated.
     *
     * {@link Model.beforeUpdateMany} will be called before making the update.
     * {@link Model.afterUpdateMany} will be called after making the update.
     *
     * @memberof Model
     * @method
     * @param {Array} entities - Array up entity updates.
     * @param {Object} [opts] - Configuration options.
     * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
     * lifecycle events.
     * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
     * updated data. If `true` return a response object that includes the updated
     * data and metadata about the operation.
     * @param {string[]} [opts.with=[]] Relations to update in a cascading
     * update if each entity update contains nested updates for relations. NOT
     * performed in a transaction.
     */
    updateMany: function updateMany(entities, opts) {
      var op = undefined,
          adapter = undefined;
      var self = this;

      // Default values for arguments
      entities || (entities = []);
      opts || (opts = {});

      // Fill in "opts" with the Model's configuration
      _(self, opts);
      adapter = opts.adapter = self.getAdapterName(opts);

      // beforeUpdateMany lifecycle hook
      op = opts.op = 'beforeUpdateMany';
      return resolve(self[op](entities, opts)).then(function (_entities) {
        // Allow for re-assignment from lifecycle hook
        entities = _entities || entities;
        // Now delegate to the adapter
        op = opts.op = 'updateMany';
        var json = entities.map(function (item) {
          return self.toJSON(item, opts);
        });
        self.dbg(op, json, opts);
        return self.getAdapter(adapter)[op](self, json, opts);
      }).then(function (data) {
        // afterUpdateMany lifecycle hook
        op = opts.op = 'afterUpdateMany';
        return resolve(self[op](data, opts)).then(function (_data) {
          // Allow for re-assignment from lifecycle hook
          data = _data || data;
          // Possibly inject result and/or formulate result object
          return self.end(data, opts);
        });
      });
    },

    /**
     * Model lifecycle hook called by {@link Model.updateMany}. If this method
     * returns a promise then {@link Model.updateMany} will wait for the promise
     * to resolve before continuing.
     *
     * @memberof Model
     * @method
     * @param {Array} entities - The `entities` argument passed to {@link Model.updateMany}.
     * @param {Object} opts - The `opts` argument passed to {@link Model.updateMany}.
     */
    afterUpdateMany: notify,

    /**
     * Model lifecycle hook called by {@link Model.updateAll}. If this method
     * returns a promise then {@link Model.updateAll} will wait for the promise
     * to resolve before continuing.
     *
     * @memberof Model
     * @method
     * @param {Object} query - The `query` argument passed to {@link Model.updateAll}.
     * @param {Object} props - The `props` argument passed to {@link Model.updateAll}.
     * @param {Object} opts - The `opts` argument passed to {@link Model.updateAll}.
     */
    beforeUpdateAll: notify,

    /**
     * Using the `query` argument, perform the a single updated to the selected
     * entities. Expects back from the adapter an array of the updated entities.
     *
     * {@link Model.beforeUpdateAll} will be called before making the update.
     * {@link Model.afterUpdateAll} will be called after making the update.
     *
     * @memberof Model
     * @method
     * @param {Object} [query={}] - Selection query.
     * @param {Object} [query.where] - Filtering criteria.
     * @param {number} [query.skip] - Number to skip.
     * @param {number} [query.limit] - Number to limit to.
     * @param {Array} [query.orderBy] - Sorting criteria.
     * @param {Object} props - Update to apply to selected entities.
     * @param {Object} [opts] - Configuration options.
     * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
     * lifecycle events.
     * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
     * updated data. If `true` return a response object that includes the updated
     * data and metadata about the operation.
     * @param {string[]} [opts.with=[]] Relations to update in a cascading
     * update if `props` contains nested updates to relations. NOT performed in a
     * transaction.
     */
    updateAll: function updateAll(query, props, opts) {
      var op = undefined,
          adapter = undefined;
      var self = this;

      // Default values for arguments
      query || (query = {});
      props || (props = {});
      opts || (opts = {});

      // Fill in "opts" with the Model's configuration
      _(self, opts);
      adapter = opts.adapter = self.getAdapterName(opts);

      // beforeUpdateAll lifecycle hook
      op = opts.op = 'beforeUpdateAll';
      return resolve(self[op](query, props, opts)).then(function (_props) {
        // Allow for re-assignment from lifecycle hook
        props = _props || props;
        // Now delegate to the adapter
        op = opts.op = 'updateAll';
        var json = self.toJSON(props, opts);
        self.dbg(op, query, json, opts);
        return self.getAdapter(adapter)[op](self, query, json, opts);
      }).then(function (data) {
        // afterUpdateAll lifecycle hook
        op = opts.op = 'afterUpdateAll';
        return resolve(self[op](query, data, opts)).then(function (_data) {
          // Allow for re-assignment from lifecycle hook
          data = _data || data;
          // Possibly inject result and/or formulate result object
          return self.end(data, opts);
        });
      });
    },

    /**
     * Model lifecycle hook called by {@link Model.updateAll}. If this method
     * returns a promise then {@link Model.updateAll} will wait for the promise
     * to resolve before continuing.
     *
     * @memberof Model
     * @method
     * @param {Object} query - The `query` argument passed to {@link Model.updateAll}.
     * @param {Object} props - The `props` argument passed to {@link Model.updateAll}.
     * @param {Object} opts - The `opts` argument passed to {@link Model.updateAll}.
     */
    afterUpdateAll: notify,

    /**
     * Model lifecycle hook called by {@link Model.destroy}. If this method
     * returns a promise then {@link Model.destroy} will wait for the promise
     * to resolve before continuing.
     *
     * @memberof Model
     * @method
     * @param {(string|number)} id - The `id` argument passed to {@link Model.destroy}.
     * @param {Object} opts - The `opts` argument passed to {@link Model.destroy}.
     */
    beforeDestroy: notify,

    /**
     * Using an adapter, destroy the entity with the primary key specified by the
     * `id` argument.
     *
     * {@link Model.beforeDestroy} will be called before destroying the entity.
     * {@link Model.afterDestroy} will be called after destroying the entity.
     *
     * @memberof Model
     * @method
     * @param {(string|number)} id - The primary key of the entity to destroy.
     * @param {Object} [opts] - Configuration options.
     * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
     * lifecycle events.
     * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
     * ejected data (if any). If `true` return a response object that includes the
     * ejected data (if any) and metadata about the operation.
     * @param {string[]} [opts.with=[]] Relations to destroy in a cascading
     * delete. NOT performed in a transaction.
     */
    destroy: function destroy(id, opts) {
      var op = undefined,
          adapter = undefined;
      var self = this;

      // Default values for arguments
      opts || (opts = {});

      // Fill in "opts" with the Model's configuration
      _(self, opts);
      adapter = opts.adapter = self.getAdapterName(opts);

      // beforeDestroy lifecycle hook
      op = opts.op = 'beforeDestroy';
      return resolve(self[op](id, opts)).then(function (_id) {
        // Allow for re-assignment from lifecycle hook
        id = _id === undefined ? id : _id;
        // Now delegate to the adapter
        op = opts.op = 'destroy';
        self.dbg(op, id, opts);
        return self.getAdapter(adapter)[op](self, id, opts);
      }).then(function (data) {
        // afterDestroy lifecycle hook
        op = opts.op = 'afterDestroy';
        return resolve(self[op](data, opts)).then(function (_data) {
          // Allow for re-assignment from lifecycle hook
          data = _data || data;
          if (opts.raw) {
            _(opts, data);
            return data;
          }
          return data;
        });
      });
    },

    /**
     * Model lifecycle hook called by {@link Model.destroy}. If this method
     * returns a promise then {@link Model.destroy} will wait for the promise
     * to resolve before continuing.
     *
     * @memberof Model
     * @method
     * @param {(string|number)} id - The `id` argument passed to {@link Model.destroy}.
     * @param {Object} opts - The `opts` argument passed to {@link Model.destroy}.
     */
    afterDestroy: notify,

    /**
     * Model lifecycle hook called by {@link Model.destroyAll}. If this method
     * returns a promise then {@link Model.destroyAll} will wait for the promise
     * to resolve before continuing.
     *
     * @memberof Model
     * @method
     * @param {query} query - The `query` argument passed to {@link Model.destroyAll}.
     * @param {Object} opts - The `opts` argument passed to {@link Model.destroyAll}.
     */
    beforeDestroyAll: notify,

    /**
     * Using the `query` argument, destroy the selected entities via an adapter.
     * If no `query` is provided then all entities will be destroyed.
     *
     * {@link Model.beforeDestroyAll} will be called before destroying the entities.
     * {@link Model.afterDestroyAll} will be called after destroying the entities.
     *
     * @memberof Model
     * @method
     * @param {Object} [query={}] - Selection query.
     * @param {Object} [query.where] - Filtering criteria.
     * @param {number} [query.skip] - Number to skip.
     * @param {number} [query.limit] - Number to limit to.
     * @param {Array} [query.orderBy] - Sorting criteria.
     * @param {Object} [opts] - Configuration options.
     * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
     * lifecycle events.
     * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
     * ejected data (if any). If `true` return a response object that includes the
     * ejected data (if any) and metadata about the operation.
     * @param {string[]} [opts.with=[]] Relations to destroy in a cascading
     * delete. NOT performed in a transaction.
     */
    destroyAll: function destroyAll(query, opts) {
      var op = undefined,
          adapter = undefined;
      var self = this;

      // Default values for arguments
      query || (query = {});
      opts || (opts = {});

      // Fill in "opts" with the Model's configuration
      _(self, opts);
      adapter = opts.adapter = self.getAdapterName(opts);

      // beforeDestroyAll lifecycle hook
      op = opts.op = 'beforeDestroyAll';
      return resolve(self[op](query, opts)).then(function (_query) {
        // Allow for re-assignment from lifecycle hook
        query = _query || query;
        // Now delegate to the adapter
        op = opts.op = 'destroyAll';
        self.dbg(op, query, opts);
        return self.getAdapter(adapter)[op](self, query, opts);
      }).then(function (data) {
        // afterDestroyAll lifecycle hook
        op = opts.op = 'afterDestroyAll';
        return resolve(self[op](data, query, opts)).then(function (_data) {
          // Allow for re-assignment from lifecycle hook
          data = _data || data;
          if (opts.raw) {
            _(opts, data);
            return data;
          }
          return data;
        });
      });
    },

    /**
     * Model lifecycle hook called by {@link Model.destroyAll}. If this method
     * returns a promise then {@link Model.destroyAll} will wait for the promise
     * to resolve before continuing.
     *
     * @memberof Model
     * @method
     * @param {*} data - The `data` returned by the adapter.
     * @param {query} query - The `query` argument passed to {@link Model.destroyAll}.
     * @param {Object} opts - The `opts` argument passed to {@link Model.destroyAll}.
     */
    afterDestroyAll: notify,

    log: function log(level) {
      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      if (level && !args.length) {
        args.push(level);
        level = 'debug';
      }
      if (level === 'debug' && !this.debug) {
        return;
      }
      var prefix = level.toUpperCase() + ': (' + this.name + ')';
      if (console[level]) {
        var _console;

        (_console = console)[level].apply(_console, [prefix].concat(args));
      } else {
        var _console2;

        (_console2 = console).log.apply(_console2, [prefix].concat(args));
      }
    },
    dbg: function dbg() {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      this.log.apply(this, ['debug'].concat(args));
    },

    /**
     * Usage:
     *
     * Post.belongsTo(User, {
     *   localKey: 'myUserId'
     * })
     *
     * Comment.belongsTo(User)
     * Comment.belongsTo(Post, {
     *   localField: '_post'
     * })
     */
    belongsTo: function belongsTo$$(model, opts) {
      return belongsTo(model, opts)(this);
    },

    /**
     * Usage:
     *
     * User.hasMany(Post, {
     *   localField: 'my_posts'
     * })
     */
    hasMany: function hasMany$$(model, opts) {
      return hasMany(model, opts)(this);
    },

    /**
     * Usage:
     *
     * User.hasOne(Profile, {
     *   localField: '_profile'
     * })
     */
    hasOne: function hasOne$$(model, opts) {
      return hasOne(model, opts)(this);
    },

    /**
     * Invoke the {@link module:js-data.exports.setSchema setSchema} decorator on
     * this Model.
     * @param {Object} opts - Property configurations.
     * @return {Model} A reference to the Model for chaining.
     */
    setSchema: function setSchema$$(opts) {
      return setSchema(opts)(this);
    },

    /**
     * Invoke the {@link module:js-data.exports.configure configure} decorator on
     * this Model.
     * @param {Object} opts - Configuration
     * @return {Model} A reference to the Model for chaining.
     */
    configure: function configure$$(opts) {
      return configure(opts)(this);
    },

    /**
     * Invoke the {@link module:js-data.exports.registerAdapter registerAdapter}
     * decorator on this Model.
     * @param {string} name - The name of the adapter to register.
     * @param {Adapter} adapter - The adapter to register.
     * @param {Object} [opts] - Configuration options.
     * @param {boolean} [opts.default=false] - Whether to make the adapter the
     * default for this Model.
     * @return {Model} A reference to the Model for chaining.
     */
    registerAdapter: function registerAdapter$$(name, adapter, opts) {
      return registerAdapter(name, adapter, opts)(this);
    },

    /**
     * Extend this Model and return a new child Model. Static properties on this
     * Model will be shallow copied to the child Model. The child Model's
     * prototype will point to the parent Model.
     *
     * @example
     * var User = JSData.Model.extend({}, { name: 'User' })
     * @param {Object} props={} - Properties to add to the prototype of the class.
     * @param {Function} [props.initialize] - Optional function to invoke during
     * construction of instances of the class. Will receive any arguments passed
     * to the constructor. "this" will refer to the instance being constructed.
     * @param {Object} classProps - Static properties to add to the class.
     * @param {string} classProps.name - Name of the class. Required.
     * @param {string} [classProps.idAttribute='id'] - Field to use as the unique
     * identifier for instances of the class.
     * @param {Object} [classProps.schema] - Value to pass to the {@link Model.setSchema setSchema}
     * method of the class after the class is created.
     */
    extend: function extend(props, classProps) {
      var Parent = this;
      var _Child = undefined;

      Parent.dbg('extend', 'props:', props, 'classProps:', classProps);

      props || (props = {});
      classProps || (classProps = {});

      var initialize = props.initialize;
      delete props.initialize;

      if (props.hasOwnProperty('constructor')) {
        _Child = props.constructor;
        delete props.constructor;
      } else {
        if (!classProps.name) {
          throw new TypeError('name: Expected string, found ' + babelHelpers.typeof(classProps.name) + '!');
        }
        if (classProps.csp) {
          _Child = function Child() {
            classCallCheck(this, _Child);

            for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
              args[_key4] = arguments[_key4];
            }

            var _this = possibleConstructorReturn(this, (_Child.__super__ || Object.getPrototypeOf(_Child)).apply(this, args));
            if (initialize) {
              initialize.apply(_this, args);
            }
            return _this;
          };
        } else {
          var name = pascalCase(classProps.name);
          var func = 'return function ' + name + '() {\n                        classCallCheck(this, ' + name + ')\n                        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {\n                          args[_key] = arguments[_key];\n                        }\n                        var _this = possibleConstructorReturn(this, (' + name + '.__super__ || Object.getPrototypeOf(' + name + ')).apply(this, args));\n                        if (initialize) {\n                          initialize.apply(_this, arguments)\n                        }\n                        return _this\n                      }';
          _Child = new Function('classCallCheck', 'possibleConstructorReturn', 'Parent', 'initialize', func)(classCallCheck, possibleConstructorReturn, Parent, initialize); // eslint-disable-line
        }
      }

      classProps.shortname = classProps.shortname || camelCase(_Child.name || classProps.name);
      delete classProps.name;

      var _schema = classProps.schema;
      delete classProps.schema;

      _Child.prototype = Object.create(Parent && Parent.prototype, {
        constructor: {
          value: _Child,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });

      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(_Child, Parent);
      } else if (classProps.strictEs6Class) {
        _Child.__proto__ = Parent; // eslint-disable-line
      } else {
          forOwn(Parent, function (value, key) {
            _Child[key] = value;
          });
        }
      Object.defineProperty(_Child, '__super__', {
        configurable: true,
        value: Parent
      });

      configure(props)(_Child.prototype);
      configure(classProps)(_Child);
      if (_schema) {
        setSchema(_schema)(_Child);
      }

      return _Child;
    }
  });

  /**
   * Register a new event listener on this Model.
   *
   * @name on
   * @memberOf! Model
   * @method
   */

  /**
   * Remove an event listener from this Model.
   *
   * @name off
   * @memberOf! Model
   * @method
   */

  /**
   * Trigger an event on this Model.
   *
   * @name emit
   * @memberOf! Model
   * @method
   */

  /**
   * Allow Models themselves emit events.
   *
   * A Model's registered listeners are stored on the Model's `__events` property.
   */
  eventify(Model, function () {
    return this._events();
  }, function (value) {
    this._events(value);
  }, true);

  /**
   * Allow instancess to emit events.
   *
   * An instance's registered listeners are stored in the instance's private data
   * hash.
   */
  eventify(Model.prototype, function () {
    return this._get('events');
  }, function (value) {
    this._set('events', value);
  });

  function DS(opts) {
    var self = this;
    classCallCheck(self, DS);

    opts || (opts = {});
    self.defaults = {};

    for (var key in opts) {
      self.defaults[key] = opts[key];
    }
    self.models = {};
    self.collections = {};
  }

  addHiddenPropsToTarget(DS.prototype, {
    defineModel: function defineModel(name, opts) {
      var self = this;

      if (isObject(name)) {
        opts = name;
        name = opts.name;
      }
      opts || (opts = {});
      opts.relations || (opts.relations = {});
      fillIn(opts, self.defaults);

      var methods = opts.methods || {};
      delete opts.methods;
      var Parent = self.models[opts.extends];

      var Child = (Parent || Model).extend(methods, opts);
      self.models[name] = Child;

      Child.getModel = function (name) {
        return self.models[name];
      };

      forOwn(opts.relations, function (group, type) {
        forOwn(group, function (relations, name) {
          if (isObject(relations)) {
            relations = [relations];
          }
          relations.forEach(function (def) {
            var Relation = self.models[name] || name;
            if (type === 'belongsTo') {
              return Child.belongsTo(Relation, def);
            }
            if (type === 'hasOne') {
              return Child.hasOne(Relation, def);
            }
            return Child.hasMany(Relation, def);
          });
        });
      });

      return Child;
    },
    defineCollection: function defineCollection(name, opts, Ctor) {
      var self = this;
      opts || (opts = {});
      if (isString(opts.model)) {
        opts.model = self.models[name];
      }
      var collection = new (Ctor || Collection)([], opts);
      self.collection[name] = collection;
      return collection;
    },
    model: function model(name) {
      return this.models[name];
    },
    collection: function collection(name) {
      return this.collections[name];
    },
    registerAdapter: function registerAdapter() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      forOwn(this.models, function (Model) {
        Model.registerAdapter.apply(Model, args);
      });
    }
  });

  DS.prototype.defineResource = DS.prototype.defineModel;

  var types = {
    array: isArray,
    boolean: isBoolean,
    integer: isInteger,
    'null': isNull,
    number: isNumber,
    object: isObject,
    string: isString
  };

  var typeGroupValidators = {};
  var validationKeywords = {};

  var segmentToString = function segmentToString(segment, prev) {
    var str = '';
    if (segment) {
      if (isNumber(segment)) {
        str += '[' + segment + ']';
      } else if (prev) {
        str += '.' + segment;
      } else {
        str += '' + segment;
      }
    }
    return str;
  };

  var makePath = function makePath(opts) {
    opts || (opts = {});
    var path = '';
    var segments = opts.path || [];
    segments.forEach(function (segment) {
      path += segmentToString(segment, path);
    });
    path += segmentToString(opts.prop, path);
    return path;
  };

  var makeError = function makeError(actual, expected, opts) {
    return {
      expected: expected,
      actual: '' + actual,
      path: makePath(opts)
    };
  };

  var addError = function addError(actual, expected, opts, errors) {
    errors.push(makeError(actual, expected, opts));
  };

  var maxLengthCommon = function maxLengthCommon(keyword, value, schema, opts) {
    var max = schema[keyword];
    if (value.length > max) {
      return makeError(value.length, 'length no more than ' + max, opts);
    }
  };

  var minLengthCommon = function minLengthCommon(keyword, value, schema, opts) {
    var min = schema[keyword];
    if (value.length < min) {
      return makeError(value.length, 'length no less than ' + min, opts);
    }
  };

  var validateKeyword = function validateKeyword(op, value, schema, opts) {
    return !isUndefined(schema[op]) && validationKeywords[op](value, schema, opts);
  };

  var runOps = function runOps(ops, value, schema, opts) {
    var errors = [];
    ops.forEach(function (op) {
      errors = errors.concat(validateKeyword(op, value, schema, opts) || []);
    });
    return errors.length ? errors : undefined;
  };

  var ANY_OPS = ['enum', 'type', 'allOf', 'anyOf', 'oneOf', 'not'];
  var ARRAY_OPS = ['items', 'maxItems', 'minItems', 'uniqueItems'];
  var NUMERIC_OPS = ['multipleOf', 'maximum', 'minimum'];
  var OBJECT_OPS = ['maxProperties', 'minProperties', 'required', 'properties', 'dependencies'];
  var STRING_OPS = ['maxLength', 'minLength', 'pattern'];

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor75
   * @param {*} value
   * @param {Object} [schema]
   * @param {Object} [opts] Configuration options.
   */
  var validateAny = function validateAny(value, schema, opts) {
    return runOps(ANY_OPS, value, schema, opts);
  };

  /**
   * @param {*} value
   * @param {Object} [schema]
   * @param {Object} [opts]
   */
  var validate = function validate(value, schema, opts) {
    var errors = [];
    opts || (opts = {});
    var shouldPop = undefined;
    var prevProp = opts.prop;
    if (isUndefined(schema)) {
      return;
    }
    if (!isObject(schema)) {
      throw new Error('Invalid schema at path: "' + opts.path + '"');
    }
    if (isUndefined(opts.path)) {
      opts.path = [];
    }
    // Track our location as we recurse
    if (!isUndefined(opts.prop)) {
      shouldPop = true;
      opts.path.push(opts.prop);
      opts.prop = undefined;
    }
    // Validate against parent schema
    if (schema['extends']) {
      // opts.path = path
      // opts.prop = prop
      if (isFunction(schema['extends'].validate)) {
        errors = errors.concat(schema['extends'].validate(value, opts) || []);
      } else {
        errors = errors.concat(validate(value, schema['extends'], opts) || []);
      }
    }
    if (isUndefined(value)) {
      // Check if property is required
      if (schema.required === true) {
        addError(value, 'a value', opts, errors);
      }
      if (shouldPop) {
        opts.path.pop();
        opts.prop = prevProp;
      }
      return errors.length ? errors : undefined;
    }
    errors = errors.concat(validateAny(value, schema, opts) || []);
    if (shouldPop) {
      opts.path.pop();
      opts.prop = prevProp;
    }
    return errors.length ? errors : undefined;
  };

  fillIn(validationKeywords, {
    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor82
     */

    allOf: function allOf(value, schema, opts) {
      var allErrors = [];
      schema.allOf.forEach(function (_schema) {
        allErrors = allErrors.concat(validate(value, _schema, opts) || []);
      });
      return allErrors.length ? undefined : allErrors;
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor85
     */
    anyOf: function anyOf(value, schema, opts) {
      var validated = false;
      var allErrors = [];
      schema.anyOf.forEach(function (_schema) {
        var errors = validate(value, _schema, opts);
        if (errors) {
          allErrors = allErrors.concat(errors);
        } else {
          validated = true;
        }
      });
      return validated ? undefined : allErrors;
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor70
     */
    dependencies: function dependencies(value, schema, opts) {
      // TODO
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor76
     */
    enum: function _enum(value, schema, opts) {
      var possibleValues = schema['enum'];
      if (possibleValues.indexOf(value) === -1) {
        return makeError(value, 'one of (' + possibleValues.join(', ') + ')', opts);
      }
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor37
     */
    items: function items(value, schema, opts) {
      opts || (opts = {});
      // TODO: additionalItems
      var items = schema.items;
      var errors = [];
      var checkingTuple = isArray(items);
      var length = value.length;
      for (var prop = 0; prop < length; prop++) {
        if (checkingTuple) {
          // Validating a tuple, instead of just checking each item against the
          // same schema
          items = schema.items[prop];
        }
        opts.prop = prop;
        errors = errors.concat(validate(value[prop], items, opts) || []);
      }
      return errors.length ? errors : undefined;
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor17
     */
    maximum: function maximum(value, schema, opts) {
      // Must be a number
      var maximum = schema.maximum;
      // Must be a boolean
      // Depends on maximum
      // default: false
      var exclusiveMaximum = schema.exclusiveMaximum;
      if ((typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === (typeof maximum === 'undefined' ? 'undefined' : babelHelpers.typeof(maximum)) && (exclusiveMaximum ? maximum < value : maximum <= value)) {
        // TODO: Account for value of exclusiveMaximum in messaging
        return makeError(value, 'no more than ' + maximum, opts);
      }
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor42
     */
    maxItems: function maxItems(value, schema, opts) {
      return maxLengthCommon('maxItems', value, schema, opts);
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor26
     */
    maxLength: function maxLength(value, schema, opts) {
      return maxLengthCommon('maxLength', value, schema, opts);
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor54
     */
    maxProperties: function maxProperties(value, schema, opts) {
      var maxProperties = schema.maxProperties;
      var length = Object.keys(value).length;
      if (length > maxProperties) {
        return makeError(length, 'no more than ' + maxProperties + ' properties', opts);
      }
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor21
     */
    minimum: function minimum(value, schema, opts) {
      // Must be a number
      var minimum = schema.minimum;
      // Must be a boolean
      // Depends on minimum
      // default: false
      var exclusiveMinimum = schema.exclusiveMinimum;
      if ((typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === (typeof minimum === 'undefined' ? 'undefined' : babelHelpers.typeof(minimum)) && (exclusiveMinimum ? minimum > value : minimum >= value)) {
        // TODO: Account for value of exclusiveMinimum in messaging
        return makeError(value, 'no less than ' + minimum, opts);
      }
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor42
     */
    minItems: function minItems(value, schema, opts) {
      return minLengthCommon('minItems', value, schema, opts);
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor29
     */
    minLength: function minLength(value, schema, opts) {
      return minLengthCommon('minLength', value, schema, opts);
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor57
     */
    minProperties: function minProperties(value, schema, opts) {
      var minProperties = schema.minProperties;
      var length = Object.keys(value).length;
      if (length < minProperties) {
        return makeError(length, 'no more than ' + minProperties + ' properties', opts);
      }
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor14
     */
    multipleOf: function multipleOf(value, schema, opts) {
      // TODO
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor91
     */
    not: function not(value, schema, opts) {
      if (!validate(value, schema.not, opts)) {
        // TODO: better messaging
        return makeError('succeeded', 'should have failed', opts);
      }
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor88
     */
    oneOf: function oneOf(value, schema, opts) {
      var validated = false;
      var allErrors = [];
      schema.oneOf.forEach(function (_schema) {
        var errors = validate(value, _schema, opts);
        if (errors) {
          allErrors = allErrors.concat(errors);
        } else if (validated) {
          allErrors = [makeError('valid against more than one', 'valid against only one', opts)];
          validated = false;
          return false;
        } else {
          validated = true;
        }
      });
      return validated ? undefined : allErrors;
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor33
     */
    pattern: function pattern(value, schema, opts) {
      var pattern = schema.pattern;
      if (isString(value) && !value.match(pattern)) {
        return makeError(value, pattern, opts);
      }
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor64
     */
    properties: function properties(value, schema, opts) {
      opts || (opts = {});
      // Can be a boolean or an object
      // Technically the default is an "empty schema", but here "true" is
      // functionally the same
      var additionalProperties = isUndefined(schema.additionalProperties) ? true : schema.additionalProperties;
      // "s": The property set of the instance to validate.
      var toValidate = {};
      // "p": The property set from "properties".
      // Default is an object
      var properties = schema.properties || {};
      // "pp": The property set from "patternProperties".
      // Default is an object
      var patternProperties = schema.patternProperties || {};
      var errors = [];

      // Collect set "s"
      forOwn(value, function (_value, prop) {
        toValidate[prop] = undefined;
      });
      // Remove from "s" all elements of "p", if any.
      forOwn(properties || {}, function (_schema, prop) {
        if (isUndefined(value[prop]) && !isUndefined(_schema['default'])) {
          value[prop] = copy(_schema['default']);
        }
        opts.prop = prop;
        errors = errors.concat(validate(value[prop], _schema, opts) || []);
        delete toValidate[prop];
      });
      // For each regex in "pp", remove all elements of "s" which this regex
      // matches.
      forOwn(patternProperties, function (_schema, pattern) {
        forOwn(toValidate, function (undef, prop) {
          if (prop.match(pattern)) {
            opts.prop = prop;
            errors = errors.concat(validate(value[prop], _schema, opts) || []);
            delete toValidate[prop];
          }
        });
      });
      var keys = Object.keys(toValidate);
      // If "s" is not empty, validation fails
      if (additionalProperties === false) {
        if (keys.length) {
          addError('extra fields: ' + keys.join(', '), 'no extra fields', opts, errors);
        }
      } else if (isObject(additionalProperties)) {
        // Otherwise, validate according to provided schema
        keys.forEach(function (prop) {
          opts.prop = prop;
          errors = errors.concat(validate(value[prop], additionalProperties, opts) || []);
        });
      }
      return errors.length ? errors : undefined;
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor61
     */
    required: function required(value, schema, opts) {
      var required = schema.required;
      var errors = [];
      if (!opts.existingOnly) {
        required.forEach(function (prop) {
          if (isUndefined(get(value, prop))) {
            var prevProp = opts.prop;
            opts.prop = prop;
            addError(undefined, 'a value', opts, errors);
            opts.prop = prevProp;
          }
        });
      }
      return errors.length ? errors : undefined;
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor79
     */
    type: function type(value, schema, opts) {
      var type = schema.type;
      var validType = undefined;
      // Can be one of several types
      if (isString(type)) {
        type = [type];
      }
      // Try to match the value against an expected type
      type.forEach(function (_type) {
        // TODO: throw an error if type is not defined
        if (types[_type](value, schema, opts)) {
          // Matched a type
          validType = _type;
          return false;
        }
      });
      // Value did not match any expected type
      if (!validType) {
        return makeError(value ? typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value) : '' + value, 'one of (' + type.join(', ') + ')', opts);
      }
      // Run keyword validators for matched type
      // http://json-schema.org/latest/json-schema-validation.html#anchor12
      var validator = typeGroupValidators[validType];
      if (validator) {
        return validator(value, schema, opts);
      }
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor49
     */
    uniqueItems: function uniqueItems(value, schema, opts) {
      if (value && value.length && schema.uniqueItems) {
        var length = value.length;
        var item = undefined,
            i = undefined,
            j = undefined;
        // Check n - 1 items
        for (i = length - 1; i > 0; i--) {
          item = value[i];
          // Only compare against unchecked items
          for (j = i - 1; j >= 0; j--) {
            // Found a duplicate
            if (item === value[j]) {
              return makeError(item, 'no duplicates', opts);
            }
          }
        }
      }
    }
  });

  fillIn(typeGroupValidators, {
    array: function array(value, schema, opts) {
      return runOps(ARRAY_OPS, value, schema, opts);
    },

    integer: function integer(value, schema, opts) {
      // Additional validations for numerics are the same
      return typeGroupValidators.numeric(value, schema, opts);
    },

    number: function number(value, schema, opts) {
      // Additional validations for numerics are the same
      return typeGroupValidators.numeric(value, schema, opts);
    },

    /**
     * See http://json-schema.org/latest/json-schema-validation.html#anchor13
     * @param {*} value
     * @param {Object} [schema]
     * @param {Object} [opts] Configuration options.
     */
    numeric: function numeric(value, schema, opts) {
      return runOps(NUMERIC_OPS, value, schema, opts);
    },

    /**
     * See http://json-schema.org/latest/json-schema-validation.html#anchor53
     * @param {*} value
     * @param {Object} [schema]
     * @param {Object} [opts] Configuration options.
     */
    object: function object(value, schema, opts) {
      return runOps(OBJECT_OPS, value, schema, opts);
    },

    /**
     * See http://json-schema.org/latest/json-schema-validation.html#anchor25
     * @param {*} value
     * @param {Object} [schema]
     * @param {Object} [opts] Configuration options.
     */
    string: function string(value, schema, opts) {
      return runOps(STRING_OPS, value, schema, opts);
    }
  });

  /**
   * js-data's Schema class.
   * @class Schema
   *
   * @param {Object} definition Schema definition according to json-schema.org
   */
  function Schema(definition) {
    // const self = this
    definition || (definition = {});
    // TODO: schema validation
    fillIn(this, definition);

    // TODO: rework this to make sure all possible keywords are converted
    // if (definition.properties) {
    //   forOwn(definition.properties, function (_definition, prop) {
    //     definition.properties[prop] = new Schema(_definition)
    //   })
    // }
  }

  /**
   * Validate the provided value against this schema.
   *
   * @param {*} value Value to validate.
   * @param {Object} [opts] Configuration options.
   * @return {(array|undefined)} Array of errors or `undefined` if valid.
   */
  Schema.prototype.validate = function (value, opts) {
    return validate(value, this, opts);
  };

  var utils = _utils;

  var version = {
    full: '3.0.0-alpha.10',
    major: parseInt('3', 10),
    minor: parseInt('0', 10),
    patch: parseInt('0', 10),
    alpha: '10' !== 'false' ? '10' : false,
    beta: 'false' !== 'false' ? 'false' : false
  };

  exports.utils = utils;
  exports.version = version;
  exports.Collection = Collection;
  exports.Query = Query;
  exports.DS = DS;
  exports.belongsTo = belongsTo;
  exports.configure = configure;
  exports.hasMany = hasMany;
  exports.hasOne = hasOne;
  exports.setSchema = setSchema;
  exports.registerAdapter = registerAdapter;
  exports.Model = Model;
  exports.types = types;
  exports.typeGroupValidators = typeGroupValidators;
  exports.validationKeywords = validationKeywords;
  exports.validate = validate;
  exports.Schema = Schema;

}));
//# sourceMappingURL=js-data.js.map