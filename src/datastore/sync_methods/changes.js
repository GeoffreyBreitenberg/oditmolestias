var errorPrefix = 'DS.changes(resourceName, id): ';

/**
 * @doc method
 * @id DS.sync_methods:changes
 * @name changes
 * @description
 * Synchronously return the changes object of the item of the type specified by `resourceName` that has the primary key
 * specified by `id`. This object represents the diff between the item in its current state and the state of the item
 * the last time it was saved via an async adapter.
 *
 * ## Signature:
 * ```js
 * DS.changes(resourceName, id)
 * ```
 *
 * ## Example:
 *
 * ```js
 * var d = DS.get('document', 5); // { author: 'John Anderson', id: 5 }
 *
 * d.author = 'Sally';
 *
 * DS.changes('document', 5); // {...} Object describing changes
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item of the changes to retrieve.
 * @returns {object} The changes of the item of the type specified by `resourceName` with the primary key specified by `id`.
 */
function changes(resourceName, id) {
  if (!this.definitions[resourceName]) {
    throw new this.errors.NER(errorPrefix + resourceName);
  } else if (!this.utils.isString(id) && !this.utils.isNumber(id)) {
    throw new this.errors.IA(errorPrefix + 'id: Must be a string or a number!');
  }

  var item = this.get(resourceName, id);
  if (item) {
    this.store[resourceName].observers[id].deliver();
    return this.utils.diffObjectFromOldObject(item, this.store[resourceName].previousAttributes[id]);
  }
}

module.exports = changes;
