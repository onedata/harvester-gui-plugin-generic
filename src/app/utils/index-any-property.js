/**
 * Represents a special "any property" property and does not exist in a real index mapping.
 * It is used to build queries with a condition for any property.
 * 
 * @module utils/index-any-property
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import IndexProperty from 'harvester-gui-plugin-generic/utils/index-property';

export default class IndexAnyProperty extends IndexProperty {
  /**
   * @override
   */
  isRealProperty = false;

  /**
   * @override
   */
  get path() {
    // "path" of any property is just a description
    return 'any property';
  }

  constructor() {
    super(...arguments);

    this.extractType();
  }

  /**
   * @override
   */
  extractType() {
    this.type = 'anyProperty';
  }
}
