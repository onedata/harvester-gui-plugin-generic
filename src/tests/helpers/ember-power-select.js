import { click, find } from '@ember/test-helpers';
export { typeInSearch, selectChoose } from 'ember-power-select/test-support/helpers';

const triggerSelector = '.ember-power-select-trigger';

/**
 * Fixes ember-power-select clickTrigger helpers. It's native implementation
 * does not allow to click on dropdown trigger with selector pointing directly
 * to the trigger element.
 * @param {string} [selector]
 */
export async function clickTrigger(selector) {
  let triggerElement;
  if (selector) {
    const selectorElement = find(selector);
    if (!selectorElement) {
      throw new Error('Dropdown trigger not found.');
    } else if (selectorElement.matches(triggerSelector)) {
      triggerElement = selectorElement;
    } else {
      triggerElement = selectorElement.querySelector(triggerSelector);
    }
  } else {
    triggerElement = find(triggerSelector);
  }

  await click(triggerElement);
}
