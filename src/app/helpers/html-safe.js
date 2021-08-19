/**
 * Converts string to SafeString using `htmlSafe()`.
 *
 * @module helpers/html-safe
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { htmlSafe } from '@ember/template';
import { helper } from '@ember/component/helper';

export function htmlSafeHelper([string]) {
  return htmlSafe(string);
}

export default helper(htmlSafeHelper);
