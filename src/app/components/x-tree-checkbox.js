import XTreeCheckboxBase from 'ember-simple-tree/components/x-tree-checkbox';

export default class XTreeCheckbox extends XTreeCheckboxBase {
  get fakeClickEvent() {
    return document.createEvent('MouseEvents');
  }
}
