/**
 * A spinner component made using spin.js library.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { Spinner } from 'spin.js';

/**
 * @argument {number} [scale]
 * @argument {number} [lines]
 * @argument {number} [length]
 */
export default class EmberSpinnerComponent extends Component {
  /**
   * @type {Spinner|null}
   */
  spinner = null;

  /**
   * @type {number}
   */
  get scale() {
    return this.args.scale ?? 1;
  }

  /**
   * @type {number}
   */
  get lines() {
    return this.args.lines ?? 12;
  }

  /**
   * @type {number}
   */
  get length() {
    return this.args.length ?? 12;
  }

  /**
   * @type {Object}
   */
  get spinnerConfig() {
    return {
      animation: 'spinner-line-fade-quick',
      color: '#333',
      corners: 1,
      direction: 1,
      fps: 20,
      left: '50%',
      length: this.length,
      lines: this.lines,
      radius: 10,
      rotate: 0,
      scale: this.scale,
      shadow: false,
      speed: 1,
      top: '50%',
      width: 5,
      zIndex: 0,
      position: 'absolute',
    };
  }

  @action
  didInsertComponent(element) {
    this.spinner = new Spinner(this.spinnerConfig).spin(element);
  }

  @action
  willDestroyComponent() {
    this.spinner?.stop();
  }
}
