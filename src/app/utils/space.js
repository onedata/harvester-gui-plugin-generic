/**
 * Represents Onedata Space model.
 * 
 * @module utils/space
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default class Space {
  /**
   * @type {String}
   */
  id;

  /**
   * @type {String}
   */
  name;

  /**
   * @param {String} id 
   * @param {String} name 
   */
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}
