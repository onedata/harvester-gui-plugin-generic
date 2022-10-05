/**
 * Shows spinner/error/content depending on status of passed promise.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

/**
 * @typedef {'pending'|'fulfilled'|'rejected'} PromiseStatus
 */

/**
 * @argument {Promise} promise
 * @argument {boolean} [useCustomPending]
 * @argument {boolean} [useCustomRejected]
 * @argument {number} [spinnerScale]
 * @argument {(data: unknown) => void} [onResolve]
 * @argument {(error: unknown) => void} [onReject]
 */
export default class PromiseLoaderComponent extends Component {
  /**
   * @type {Promise|null}
   */
  promiseCache = null;

  /**
   * @type {{ status: PromiseStatus, data?: unknown, error?: unknown }}
   */
  @tracked
  promiseState = null;

  /**
   * @type {Promise}
   */
  get promise() {
    if (!this.promiseCache || this.args.promise !== this.promiseCache) {
      this.updatePromiseCache();
    }
    return this.promiseCache;
  }

  /**
   * @type {PromiseStatus}
   */
  get promiseStatus() {
    if (!this.promise || !this.promiseState?.status) {
      return 'pending';
    } else {
      return this.promiseState.status;
    }
  }

  /**
   * @type {unknown}
   */
  get promiseResult() {
    if (!this.promise || this.promiseState?.status !== 'fulfilled') {
      return null;
    } else {
      return this.promiseState.data;
    }
  }

  /**
   * @type {unknown}
   */
  get promiseError() {
    if (!this.promise || this.promiseState?.status !== 'rejected') {
      return null;
    } else {
      return this.promiseState.error;
    }
  }

  constructor() {
    super(...arguments);
    this.resetPromiseState();
  }

  resetPromiseState() {
    this.promiseState = { status: 'pending' };
  }

  updatePromiseCache() {
    const currentPromise = this.args.promise;
    this.promiseCache = currentPromise;
    this.resetPromiseState();
    currentPromise
      ?.then((data) => {
        if (this.promiseCache === currentPromise) {
          this.promiseState = { status: 'fulfilled', data };
          this.args.onResolve?.(data);
        }
      })
      ?.catch((error) => {
        if (this.promiseCache === currentPromise) {
          this.promiseState = { status: 'rejected', error };
          this.args.onReject?.(error);
        }
      });
  }
}
