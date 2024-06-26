var utils = require('../utils')[0]();

function lifecycleNoop(resourceName, attrs, cb) {
  cb(null, attrs);
}

function Defaults() {
}

Defaults.prototype.idAttribute = 'id';
Defaults.prototype.defaultAdapter = 'DSHttpAdapter';
Defaults.prototype.filter = function (collection, resourceName, params, options) {
  var _this = this;
  var filtered = collection;
  var where = null;
  var reserved = {
    skip: '',
    offset: '',
    where: '',
    limit: '',
    orderBy: '',
    sort: ''
  };

  if (this.utils.isObject(params.where)) {
    where = params.where;
  } else {
    where = {};
  }

  if (options.allowSimpleWhere) {
    this.utils.forOwn(params, function (value, key) {
      if (!(key in reserved) && !(key in where)) {
        where[key] = {
          '==': value
        };
      }
    });
  }

  if (this.utils.isEmpty(where)) {
    where = null;
  }

  if (where) {
    filtered = this.utils.filter(filtered, function (attrs) {
      var first = true;
      var keep = true;
      _this.utils.forOwn(where, function (clause, field) {
        if (_this.utils.isString(clause)) {
          clause = {
            '===': clause
          };
        } else if (_this.utils.isNumber(clause) || _this.utils.isBoolean(clause)) {
          clause = {
            '==': clause
          };
        }
        if (_this.utils.isObject(clause)) {
          _this.utils.forOwn(clause, function (val, op) {
            if (op === '==') {
              keep = first ? (attrs[field] == val) : keep && (attrs[field] == val);
            } else if (op === '===') {
              keep = first ? (attrs[field] === val) : keep && (attrs[field] === val);
            } else if (op === '!=') {
              keep = first ? (attrs[field] != val) : keep && (attrs[field] != val);
            } else if (op === '!==') {
              keep = first ? (attrs[field] !== val) : keep && (attrs[field] !== val);
            } else if (op === '>') {
              keep = first ? (attrs[field] > val) : keep && (attrs[field] > val);
            } else if (op === '>=') {
              keep = first ? (attrs[field] >= val) : keep && (attrs[field] >= val);
            } else if (op === '<') {
              keep = first ? (attrs[field] < val) : keep && (attrs[field] < val);
            } else if (op === '<=') {
              keep = first ? (attrs[field] <= val) : keep && (attrs[field] <= val);
            } else if (op === 'in') {
              keep = first ? _this.utils.contains(val, attrs[field]) : keep && _this.utils.contains(val, attrs[field]);
            } else if (op === '|==') {
              keep = first ? (attrs[field] == val) : keep || (attrs[field] == val);
            } else if (op === '|===') {
              keep = first ? (attrs[field] === val) : keep || (attrs[field] === val);
            } else if (op === '|!=') {
              keep = first ? (attrs[field] != val) : keep || (attrs[field] != val);
            } else if (op === '|!==') {
              keep = first ? (attrs[field] !== val) : keep || (attrs[field] !== val);
            } else if (op === '|>') {
              keep = first ? (attrs[field] > val) : keep || (attrs[field] > val);
            } else if (op === '|>=') {
              keep = first ? (attrs[field] >= val) : keep || (attrs[field] >= val);
            } else if (op === '|<') {
              keep = first ? (attrs[field] < val) : keep || (attrs[field] < val);
            } else if (op === '|<=') {
              keep = first ? (attrs[field] <= val) : keep || (attrs[field] <= val);
            } else if (op === '|in') {
              keep = first ? _this.utils.contains(val, attrs[field]) : keep || _this.utils.contains(val, attrs[field]);
            }
            first = false;
          });
        }
      });
      return keep;
    });
  }

  var orderBy = null;

  if (this.utils.isString(params.orderBy)) {
    orderBy = [
      [params.orderBy, 'ASC']
    ];
  } else if (this.utils.isArray(params.orderBy)) {
    orderBy = params.orderBy;
  }

  if (!orderBy && this.utils.isString(params.sort)) {
    orderBy = [
      [params.sort, 'ASC']
    ];
  } else if (!orderBy && this.utils.isArray(params.sort)) {
    orderBy = params.sort;
  }

  // Apply 'orderBy'
  if (orderBy) {
    angular.forEach(orderBy, function (def) {
      if (_this.utils.isString(def)) {
        def = [def, 'ASC'];
      } else if (!_this.utils.isArray(def)) {
        throw new _this.errors.IllegalArgumentError('DS.filter(resourceName[, params][, options]): ' + angular.toJson(def) + ': Must be a string or an array!', { params: { 'orderBy[i]': { actual: typeof def, expected: 'string|array' } } });
      }
      filtered = _this.utils.sort(filtered, function (a, b) {
        var cA = a[def[0]], cB = b[def[0]];
        if (_this.utils.isString(cA)) {
          cA = _this.utils.upperCase(cA);
        }
        if (_this.utils.isString(cB)) {
          cB = _this.utils.upperCase(cB);
        }
        if (def[1] === 'DESC') {
          if (cB < cA) {
            return -1;
          } else if (cB > cA) {
            return 1;
          } else {
            return 0;
          }
        } else {
          if (cA < cB) {
            return -1;
          } else if (cA > cB) {
            return 1;
          } else {
            return 0;
          }
        }
      });
    });
  }

  var limit = angular.isNumber(params.limit) ? params.limit : null;
  var skip = null;

  if (angular.isNumber(params.skip)) {
    skip = params.skip;
  } else if (angular.isNumber(params.offset)) {
    skip = params.offset;
  }

  // Apply 'limit' and 'skip'
  if (limit && skip) {
    filtered = this.utils.slice(filtered, skip, Math.min(filtered.length, skip + limit));
  } else if (this.utils.isNumber(limit)) {
    filtered = this.utils.slice(filtered, 0, Math.min(filtered.length, limit));
  } else if (this.utils.isNumber(skip)) {
    if (skip < filtered.length) {
      filtered = this.utils.slice(filtered, skip);
    } else {
      filtered = [];
    }
  }

  return filtered;
};
Defaults.prototype.baseUrl = '';
Defaults.prototype.endpoint = '';
/**
 * @doc property
 * @id DSProvider.properties:defaults.beforeValidate
 * @name defaults.beforeValidate
 * @description
 * Called before the `validate` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * beforeValidate(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.beforeValidate = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.beforeValidate = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.validate
 * @name defaults.validate
 * @description
 * Called before the `afterValidate` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * validate(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.validate = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.validate = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.afterValidate
 * @name defaults.afterValidate
 * @description
 * Called before the `beforeCreate` or `beforeUpdate` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * afterValidate(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.afterValidate = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.afterValidate = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.beforeCreate
 * @name defaults.beforeCreate
 * @description
 * Called before the `create` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * beforeCreate(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.beforeCreate = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.beforeCreate = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.afterCreate
 * @name defaults.afterCreate
 * @description
 * Called after the `create` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * afterCreate(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.afterCreate = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.afterCreate = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.beforeUpdate
 * @name defaults.beforeUpdate
 * @description
 * Called before the `update` or `save` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * beforeUpdate(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.beforeUpdate = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.beforeUpdate = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.afterUpdate
 * @name defaults.afterUpdate
 * @description
 * Called after the `update` or `save` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * afterUpdate(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.afterUpdate = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.afterUpdate = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.beforeDestroy
 * @name defaults.beforeDestroy
 * @description
 * Called before the `destroy` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * beforeDestroy(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.beforeDestroy = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.beforeDestroy = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.afterDestroy
 * @name defaults.afterDestroy
 * @description
 * Called after the `destroy` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * afterDestroy(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.afterDestroy = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.afterDestroy = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.beforeInject
 * @name defaults.beforeInject
 * @description
 * Called before the `inject` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * beforeInject(resourceName, attrs)
 * ```
 *
 * Throwing an error inside this step will cancel the injection.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.beforeInject = function (resourceName, attrs) {
 *      // do somthing/inspect/modify attrs
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.beforeInject = function (resourceName, attrs) {
  return attrs;
};
/**
 * @doc property
 * @id DSProvider.properties:defaults.afterInject
 * @name defaults.afterInject
 * @description
 * Called after the `inject` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * afterInject(resourceName, attrs)
 * ```
 *
 * Throwing an error inside this step will cancel the injection.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.afterInject = function (resourceName, attrs) {
 *      // do somthing/inspect/modify attrs
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.afterInject = function (resourceName, attrs) {
  return attrs;
};
/**
 * @doc property
 * @id DSProvider.properties:defaults.serialize
 * @name defaults.serialize
 * @description
 * Your server might expect a custom request object rather than the plain POJO payload. Use `serialize` to
 * create your custom request object.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.serialize = function (resourceName, data) {
 *      return {
 *          payload: data
 *      };
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource to serialize.
 * @param {object} data Data to be sent to the server.
 * @returns {*} By default returns `data` as-is.
 */
Defaults.prototype.serialize = function (resourceName, data) {
  return data;
};

/**
 * @doc property
 * @id DSProvider.properties:defaults.deserialize
 * @name DSProvider.properties:defaults.deserialize
 * @description
 * Your server might return a custom response object instead of the plain POJO payload. Use `deserialize` to
 * pull the payload out of your response object so angular-data can use it.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.deserialize = function (resourceName, data) {
 *      return data ? data.payload : data;
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource to deserialize.
 * @param {object} data Response object from `$http()`.
 * @returns {*} By default returns `data.data`.
 */
Defaults.prototype.deserialize = function (resourceName, data) {
  return data.data;
};

/**
 * @doc function
 * @id DSProvider
 * @name DSProvider
 */
function DSProvider() {

  /**
   * @doc property
   * @id DSProvider.properties:defaults
   * @name defaults
   * @description
   * See the [configuration guide](/documentation/guide/configure/global).
   *
   * Properties:
   *
   * - `{string}` - `baseUrl` - The url relative to which all AJAX requests will be made.
   * - `{string}` - `idAttribute` - Default: `"id"` - The attribute that specifies the primary key for resources.
   * - `{string}` - `defaultAdapter` - Default: `"DSHttpAdapter"`
   * - `{function}` - `filter` - Default: See [angular-data query language](/documentation/guide/queries/custom).
   * - `{function}` - `beforeValidate` - See [DSProvider.defaults.beforeValidate](/documentation/api/angular-data/DSProvider.properties:defaults.beforeValidate). Default: No-op
   * - `{function}` - `validate` - See [DSProvider.defaults.validate](/documentation/api/angular-data/DSProvider.properties:defaults.validate). Default: No-op
   * - `{function}` - `afterValidate` - See [DSProvider.defaults.afterValidate](/documentation/api/angular-data/DSProvider.properties:defaults.afterValidate). Default: No-op
   * - `{function}` - `beforeCreate` - See [DSProvider.defaults.beforeCreate](/documentation/api/angular-data/DSProvider.properties:defaults.beforeCreate). Default: No-op
   * - `{function}` - `afterCreate` - See [DSProvider.defaults.afterCreate](/documentation/api/angular-data/DSProvider.properties:defaults.afterCreate). Default: No-op
   * - `{function}` - `beforeUpdate` - See [DSProvider.defaults.beforeUpdate](/documentation/api/angular-data/DSProvider.properties:defaults.beforeUpdate). Default: No-op
   * - `{function}` - `afterUpdate` - See [DSProvider.defaults.afterUpdate](/documentation/api/angular-data/DSProvider.properties:defaults.afterUpdate). Default: No-op
   * - `{function}` - `beforeDestroy` - See [DSProvider.defaults.beforeDestroy](/documentation/api/angular-data/DSProvider.properties:defaults.beforeDestroy). Default: No-op
   * - `{function}` - `afterDestroy` - See [DSProvider.defaults.afterDestroy](/documentation/api/angular-data/DSProvider.properties:defaults.afterDestroy). Default: No-op
   * - `{function}` - `afterInject` - See [DSProvider.defaults.afterInject](/documentation/api/angular-data/DSProvider.properties:defaults.afterInject). Default: No-op
   * - `{function}` - `beforeInject` - See [DSProvider.defaults.beforeInject](/documentation/api/angular-data/DSProvider.properties:defaults.beforeInject). Default: No-op
   * - `{function}` - `serialize` - See [DSProvider.defaults.serialize](/documentation/api/angular-data/DSProvider.properties:defaults.serialize). Default: No-op
   * - `{function}` - `deserialize` - See [DSProvider.defaults.deserialize](/documentation/api/angular-data/DSProvider.properties:defaults.deserialize). Default: No-op
   */
  var defaults = this.defaults = new Defaults();

  this.$get = [
    '$rootScope', '$log', '$q', 'DSHttpAdapter', 'DSLocalStorageAdapter', 'DSUtils', 'DSErrors',
    function ($rootScope, $log, $q, DSHttpAdapter, DSLocalStorageAdapter, DSUtils, DSErrors) {

      var syncMethods = require('./sync_methods'),
        asyncMethods = require('./async_methods'),
        cache;

      try {
        cache = angular.injector(['angular-data.DSCacheFactory']).get('DSCacheFactory');
      } catch (err) {
        $log.warn(err);
        $log.warn('DSCacheFactory is unavailable. Resorting to the lesser capabilities of $cacheFactory.');
        cache = angular.injector(['ng']).get('$cacheFactory');
      }

      /**
       * @doc interface
       * @id DS
       * @name DS
       * @description
       * Public data store interface. Consists of several properties and a number of methods. Injectable as `DS`.
       *
       * See the [guide](/documentation/guide/overview/index).
       */
      var DS = {
        $rootScope: $rootScope,
        $log: $log,
        $q: $q,

        cacheFactory: cache,

        /**
         * @doc property
         * @id DS.properties:defaults
         * @name defaults
         * @description
         * Reference to [DSProvider.defaults](/documentation/api/api/DSProvider.properties:defaults).
         */
        defaults: defaults,

        /*!
         * @doc property
         * @id DS.properties:store
         * @name store
         * @description
         * Meta data for each registered resource.
         */
        store: {},

        /*!
         * @doc property
         * @id DS.properties:definitions
         * @name definitions
         * @description
         * Registered resource definitions available to the data store.
         */
        definitions: {},

        /**
         * @doc property
         * @id DS.properties:adapters
         * @name adapters
         * @description
         * Registered adapters available to the data store. Object consists of key-values pairs where the key is
         * the name of the adapter and the value is the adapter itself.
         */
        adapters: {
          DSHttpAdapter: DSHttpAdapter,
          DSLocalStorageAdapter: DSLocalStorageAdapter
        },

        /**
         * @doc property
         * @id DS.properties:errors
         * @name errors
         * @description
         * References to the various [error types](/documentation/api/api/errors) used by angular-data.
         */
        errors: DSErrors,

        /*!
         * @doc property
         * @id DS.properties:utils
         * @name utils
         * @description
         * Utility functions used internally by angular-data.
         */
        utils: DSUtils
      };

      DSUtils.deepFreeze(syncMethods);
      DSUtils.deepFreeze(asyncMethods);

      DSUtils.deepMixIn(DS, syncMethods);
      DSUtils.deepMixIn(DS, asyncMethods);

      DSUtils.deepFreeze(DS.errors);
      DSUtils.deepFreeze(DS.utils);

      var $dirtyCheckScope = $rootScope.$new();

      $dirtyCheckScope.$watch(function () {
        // Throttle angular-data's digest loop to tenths of a second
        // TODO: Is this okay?
        return new Date().getTime() / 100 | 0;
      }, function () {
        DS.digest();
      });

      return DS;
    }
  ];
}

module.exports = DSProvider;
