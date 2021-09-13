/**
 * Invoke the passed action if the invoking event is caused by the Enter key,
 * eg. onkeydown event.
 *
 * See examples in tests.
 *
 * @module helpers/invoke-on-enter
 * @author Jakub Liput
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';

function _invoke(action, event) {
  if (event.key === 'Enter' && typeof action === 'function') {
    event.stopPropagation();
    return action(event);
  }
}

export function invokeOnEnter([action]) {
  return (event) => _invoke(action, event);
}

export default helper(invokeOnEnter);
