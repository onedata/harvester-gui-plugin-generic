/**
 * A component showing popover, which will be positioned relative to it's parent.
 * Internally it uses tippy.js library.
 *
 * WARNING: It is not allowed to use this component as an immediate child of
 * the application root element. Such situation would cause rendering errors.
 * If you want to use the popover in the application root, surround the popover
 * invocation with some HTML tag (like `<span>`).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import tippy from 'tippy.js';
import ENV from 'harvester-gui-plugin-generic/config/environment';
import { next } from '@ember/runloop';

/**
 * @typedef {'click'|'manual'} OnePopoverTrigger
 */

/**
 * @type {Object<string, OnePopoverTrigger>}
 */
export const OnePopoverTrigger = Object.freeze({
  Click: 'click',
  Manual: 'manual',
});

/**
 * @type {Array<OnePopoverTrigger>}
 */
const onePopoverTriggersArray = Object.values(OnePopoverTrigger);

/**
 * @typedef {'top'|'top-start'|'top-end'|'right'|'right-start'|'right-end'|'bottom'|'bottom-start'|'bottom-end'|'left'|'left-start'|'left-end'|'auto'|'auto-start'|'auto-end'} OnePopoverPlacement
 */

/**
 * @type {Object<string, OnePopoverPlacement>}
 */
export const OnePopoverPlacement = Object.freeze({
  Top: 'top',
  TopStart: 'top-start',
  TopEnd: 'top-end',
  Right: 'right',
  RightStart: 'right-start',
  RightEnd: 'right-end',
  Bottom: 'bottom',
  BottomStart: 'bottom-start',
  BottomEnd: 'bottom-end',
  Left: 'left',
  LeftStart: 'left-start',
  LeftEnd: 'left-end',
  Auto: 'auto',
  AutoStart: 'auto-start',
  AutoEnd: 'auto-end',
});

/**
 * @type {Array<OnePopoverPlacement>}
 */
const onePopoverPlacementsArray = Object.values(OnePopoverPlacement);

/**
 * @argument {OnePopoverTrigger} [trigger]
 * @argument {boolean} [isOpen] Controls open state of the popover. It's taken
 * into account only when `trigger` is `'manual'`.
 * @argument {OnePopoverPlacement} [placement]
 * @argument {() => boolean|undefined} [onShow] Called before popover is shown.
 * If returns `false`, the show procedure is aborted. It's called also when
 * `trigger` is `'manual'` - in that case it means that popover wants to be
 * shown (but it will not without `isOpen` change).
 * @argument {() => void} [onShown] Called after popover is shown.
 * @argument {() => boolean|undefined} [onHide] Called before popover is hidden.
 * If returns `false`, the hiding procedure is aborted. It's called also when
 * `trigger` is `'manual'` - in that case it means that popover wants to be
 * hidden (but it will not without `isOpen` change).
 * @argument {() => void} [onHidden] Called after popover is hidden.
 */
export default class OnePopoverComponent extends Component {
  /**
   * @type {OnePopoverTrigger}
   */
  get trigger() {
    return onePopoverTriggersArray.includes(this.args.trigger) ?
      this.args.trigger : OnePopoverTrigger.Click;
  }

  /**
   * @type {boolean}
   */
  get isOpen() {
    return Boolean(this.args.isOpen);
  }

  /**
   * @type {OnePopoverPlacement}
   */
  get placement() {
    return onePopoverPlacementsArray.includes(this.args.placement) ?
      this.args.placement : OnePopoverPlacement.Auto;
  }

  /**
   * @type {() => boolean|undefined}
   */
  get onShow() {
    return this.args.onShow;
  }

  /**
   * @type {() => void}
   */
  get onShown() {
    return this.args.onShown;
  }

  /**
   * @type {() => boolean|undefined}
   */
  get onHide() {
    return this.args.onHide;
  }

  /**
   * @type {() => void}
   */
  get onHidden() {
    return this.args.onHidden;
  }

  /**
   * @type {boolean}
   */
  get isTippyOpen() {
    return Boolean(this.tippyInstance?.state?.isVisible);
  }

  /**
   * @type {tippy.js/Instance|null}
   */
  tippyInstance = null;

  /**
   * @type {HTMLElement|null}
   */
  appRootElement = null;

  constructor(owner) {
    super(...arguments);
    this.appRootElement = document.querySelector(owner.rootElement);
  }

  @action
  didInsertComponent(element) {
    const animation = ENV.environment === 'test' ? false : 'fade';

    this.tippyInstance = tippy(element.parentElement, {
      content: element,
      interactive: true,
      appendTo: this.appRootElement ?? document.body,
      // Always using `'click'` to let `onShow` and `onHide` callbacks fire on
      // user click. When `this.trigger` is `'manual'` then `onShow` and
      // `onHide` always return false (so click is cancelled) which is
      // a functional equivalent of `'manual'` trigger in tippy.js.
      trigger: 'click',
      theme: 'light-border',
      placement: this.placement,
      animation,
      // Using `1` because with `0` in tests which closes popover by clicking
      // trigger element the `aria-expanded` value is not always changed after
      // async wait. It's probably because when `delay` is `0` tippy.js
      // uses `requestAnimationFrame` for scheduling popover hiding instead of
      // `setTimeout`.
      delay: ENV.environment === 'test' ? 1 : 0,
      onShow: () => {
        const onShowResult = this.onShow?.() !== false;
        const shouldBeShown = (this.trigger === OnePopoverTrigger.Manual && this.isOpen) ||
          (this.trigger !== OnePopoverTrigger.Manual && onShowResult);

        if (shouldBeShown && !animation) {
          next(() => {
            if (this.isTippyOpen) {
              // `onShown` event is not triggered by tippy.js when there is
              // no animation. So we have to do it manually. On the other hand
              // `onHidden` is triggered regardless lack of animation...
              this.onShown?.();
            }
          });
        }

        return shouldBeShown;
      },
      onShown: () => {
        if (this.isDestroying || this.isDestroyed) {
          return;
        }

        this.onShown?.();
      },
      onHide: () => {
        // When component is destroyed, then the popover is closed due to the
        // component cleanup. It should be closed unconditionally and without
        // calling component event handlers.
        if (this.isDestroying || this.isDestroyed) {
          return true;
        }

        const onHideResult = this.onHide?.() !== false;
        return (this.trigger === OnePopoverTrigger.Manual && !this.isOpen) ||
          (this.trigger !== OnePopoverTrigger.Manual && onHideResult);
      },
      onHidden: () => {
        if (this.isDestroying || this.isDestroyed) {
          return;
        }

        this.onHidden?.();
      },
    });

    if (this.trigger === OnePopoverTrigger.Manual) {
      this.toggleTippy(this.isOpen);
    }
  }

  @action
  handleIsOpenChange() {
    if (this.trigger === OnePopoverTrigger.Manual) {
      this.toggleTippy(this.isOpen);
    }
  }

  @action
  willDestroyComponent() {
    this.toggleTippy(false);
    this.tippyInstance?.destroy?.();
    this.tippyInstance = null;
  }

  @action
  hide() {
    this.toggleTippy(false);
  }

  /**
   * @param {boolean} isOpen
   */
  toggleTippy(isOpen) {
    if (this.isTippyOpen !== Boolean(isOpen)) {
      if (isOpen) {
        this.tippyInstance?.show?.();
      } else {
        this.tippyInstance?.hide?.();
      }
    }
  }
}
