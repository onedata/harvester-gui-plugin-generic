/**
 * Represents a special "any property" property and does not exist in a real index mapping.
 * It is used to build queries with a condition for any property.
 *
 * @module utils/es-index-any-property
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EsIndexProperty from 'harvester-gui-plugin-generic/utils/es-index-property';

export default class EsIndexAnyProperty extends EsIndexProperty {
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
