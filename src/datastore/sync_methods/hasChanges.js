var errorPrefix = 'DS.hasChanges(resourceName, id): ';

function diffIsEmpty(utils, diff) {
  return !(utils.isEmpty(diff.added) &&
    utils.isEmpty(diff.removed) &&
    utils.isEmpty(diff.changed));
}

/**
 * @doc method
 * @id DS.sync_methods:hasChanges
 * @name hasChanges
 * @description
 * Synchronously return whether object of the item of the type specified by `resourceName` that has the primary key
 * specified by `id` has changes.
 *
 * ## Signature:
 * ```js
 * DS.hasChanges(resourceName, id)
 * ```
 *
 * ## Example:
 *
 * ```js
 * var d = DS.get('document', 5); // { author: 'John Anderson', id: 5 }
 *
 * d.author = 'Sally';
 *
 * DS.hasChanges('document', 5); // true
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item.
 * @returns {boolean} Whether the item of the type specified by `resourceName` with the primary key specified by `id` has changes.
 */
function hasChanges(resourceName, id) {
  if (!this.definitions[resourceName]) {
    throw new this.errors.NER(errorPrefix + resourceName);
  } else if (!this.utils.isString(id) && !this.utils.isNumber(id)) {
    throw new this.errors.IA(errorPrefix + 'id: Must be a string or a number!');
  }

  // return resource from cache
  if (this.get(resourceName, id)) {
    return diffIsEmpty(this.utils, this.changes(resourceName, id));
  } else {
    return false;
  }
}

module.exports = hasChanges;
