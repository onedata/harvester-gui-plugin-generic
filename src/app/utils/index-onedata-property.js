/**
 * Represents a special, "Onedata" property. It should correspond to the values
 * inside `__onedata` key. Oneddata properties are not nested and should have
 * no subproperties.
 *
 * @module utils/index-onedata-property
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import IndexProperty from 'harvester-gui-plugin-generic/utils/index-property';

export default class IndexOnedataProperty extends IndexProperty {
  /**
   * @override
   */
  isRealProperty = false;

  /**
   * @override
   */
  get path() {
    // Onedata properties are not nested
    return this.readableName;
  }

  /**
   * @type {string}
   */
  get readableName() {
    // converts `__onedata.xyz` to `xyz`
    return this.name.substring('__onedata.'.length);
  }

  constructor() {
    super(...arguments);

    this.extractType();
  }

  /**
   * @override
   */
  extractType() {
    // For now it's a good-enough simplification. In case of additional Onedata properties,
    // algorithm of type extraction should be more complex.
    this.type = this.readableName;
  }
}
