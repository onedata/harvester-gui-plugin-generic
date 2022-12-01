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
 * @argument {() => false|undefined} [onShowEventTriggered] Called after
 * DOM-caused show event occurred and before actual popover rendering. It will
 * not be fired by changing `isOpen` to `true` in `'manual'` mode. You can
 * cancel show procedure by returning false from this handler (only in
 * non-`'manual'` mode).
 * @argument {() => void} [onWillShow] Called before popover is shown and after
 * possible `onShowEventTriggered` event has been handled.
 * @argument {() => void} [onDidShow] Called after popover has been shown.
 * @argument {() => false|undefined} [onHideEventTriggered] Called after
 * DOM-caused hide event occurred and before actual popover unrendering. It will
 * not be fired by changing `isOpen` to `false` in `'manual'` mode. You can
 * cancel hide procedure by returning false from this handler (only in
 * non-`'manual'` mode).
 * @argument {() => void} [onWillHide] Called before popover is
 * hidden and after possible `onHideEventTriggered` event has been handled.
 * @argument {() => void} [onDidHide] Called after popover is hidden.
 */
export default class OnePopoverComponent extends Component {
  /**
   * @type {tippy.js/Instance|null}
   */
  tippyInstance = null;

  /**
   * @type {HTMLElement|null}
   */
  appRootElement = null;

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
   * @type {() => false|undefined}
   */
  get onShowEventTriggered() {
    return this.args.onShowEventTriggered;
  }

  /**
   * @type {() => void}
   */
  get onWillShow() {
    return this.args.onWillShow;
  }

  /**
   * @type {() => void}
   */
  get onDidShow() {
    return this.args.onDidShow;
  }

  /**
   * @type {() => false|undefined}
   */
  get onHideEventTriggered() {
    return this.args.onHideEventTriggered;
  }

  /**
   * @type {() => void}
   */
  get onWillHide() {
    return this.args.onWillHide;
  }

  /**
   * @type {() => void}
   */
  get onDidHide() {
    return this.args.onDidHide;
  }

  /**
   * @type {boolean}
   */
  get isTippyOpen() {
    return Boolean(this.tippyInstance?.state?.isVisible);
  }

  constructor(owner) {
    super(...arguments);
    this.appRootElement = document.querySelector(owner.rootElement);
  }

  @action
  didInsertComponent(element) {
    const animation = ENV.environment === 'test' ? false : 'fade';

    let cancelNextShow = false;
    let cancelNextHide = false;
    let ignoreNextHide = false;

    const untriggerHandler = () => {
      const onHideEventTriggeredResult = this.onHideEventTriggered?.() !== false;
      if (this.trigger === OnePopoverTrigger.Manual || !onHideEventTriggeredResult) {
        cancelNextHide = true;
      }
    };

    this.tippyInstance = tippy(element.parentElement, {
      content: element,
      interactive: true,
      appendTo: this.appRootElement ?? document.body,
      // Always using `'click'` to let `onTrigger` and `onUntrigger` callbacks
      // fire on user click. When `this.trigger` is `'manual'` then `onShow` and
      // `onHide` always return false (so click is cancelled) which is a
      // functional equivalent of `'manual'` trigger in tippy.js.
      trigger: 'click',
      theme: 'light-border',
      placement: this.placement,
      animation,
      // Using `1` in tests, because `0` causes the `aria-expanded` value to be
      // not always changed after async wait in test cases closing popover by
      // clicking trigger element. It's probably because when `delay` is `0`
      // tippy.js uses `requestAnimationFrame` for scheduling popover hiding
      // instead of `setTimeout`.
      delay: ENV.environment === 'test' ? 1 : 0,
      onTrigger: () => {
        const onShowEventTriggeredResult = this.onShowEventTriggered?.() !== false;
        if (this.trigger === OnePopoverTrigger.Manual || !onShowEventTriggeredResult) {
          cancelNextShow = true;
        }
      },
      onShow: () => {
        if (cancelNextShow) {
          cancelNextShow = false;

          // Canceling show is a little buggy in Tippy.js.
          // It lefts tippy instance in some mixed open-closed state.
          // To fix that, we patch tippy instance a bit to let it think,
          // that it is open and then close it manually.
          ignoreNextHide = true;
          this.tippyInstance.state.isVisible = true;
          this.toggleTippy(false);

          return false;
        }

        this.onWillShow?.();

        if (!animation) {
          next(() => {
            if (this.isTippyOpen) {
              // `onShown` event is not triggered by tippy.js when there is
              // no animation, so we have to do it manually. On the other hand
              // `onHidden` is triggered regardless lack of animation...
              this.onDidShow?.();
            }
          });
        }
      },
      onShown: () => {
        if (this.isDestroying || this.isDestroyed) {
          return;
        }
        this.onDidShow?.();
      },
      onUntrigger: () => {
        untriggerHandler();
      },
      onClickOutside: () => {
        if (!this.isTippyOpen) {
          return;
        }
        untriggerHandler();
      },
      onHide: () => {
        if (!this.isTippyOpen || ignoreNextHide) {
          ignoreNextHide = false;
          return;
        }

        // When component is destroyed, then the popover is closed due to the
        // component cleanup. It should be closed unconditionally and without
        // calling component event handlers.
        if (this.isDestroying || this.isDestroyed) {
          return;
        } else if (cancelNextHide) {
          cancelNextHide = false;
          return false;
        }
        this.onWillHide?.();
      },
      onHidden: () => {
        if (this.isDestroying || this.isDestroyed) {
          return;
        }
        this.onDidHide?.();
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
    this.tippyInstance?.destroy();
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
