import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import {
  defaultComparatorEditors,
} from 'harvester-gui-plugin-generic/utils/query-builder/condition-comparator-editors';

export default class QueryBuilderConditionBlockComponent extends Component {
  intlPrefix = 'components.query-builder.condition-block';

  @tracked mode = 'view';
  @tracked editComparatorValue = null;
  @tracked comparatorEditorsSet = defaultComparatorEditors;

  get queryBlock() {
    return this.args.queryBlock || {};
  }

  get onConditionEditionStart() {
    return this.args.onConditionEditionStart || (() => {});
  }

  get onConditionEditionEnd() {
    return this.args.onConditionEditionEnd || (() => {});
  }

  get onConditionEditionValidityChange() {
    return this.args.onConditionEditionValidityChange || (() => {});
  }

  get comparatorEditor() {
    return this.comparatorEditorsSet[this.queryBlock.comparator];
  }

  get isEditComparatorValueValid() {
    return this.comparatorEditor ?
      this.comparatorEditor.isValidValue(this.editComparatorValue) : false;
  }

  @action
  startEdit() {
    this.mode = 'edit';
    this.editComparatorValue = this.queryBlock.comparatorValue;
    this.onConditionEditionStart(this.queryBlock);
  }

  @action
  comparatorValueChange(newValue) {
    this.editComparatorValue = newValue;
    this.onConditionEditionValidityChange(
      this.queryBlock,
      this.isEditComparatorValueValid
    );
  }

  @action
  finishEdit() {
    if (!this.isEditComparatorValueValid) {
      return;
    }

    this.mode = 'view';
    this.queryBlock.comparatorValue = this.editComparatorValue;
    this.onConditionEditionEnd(this.queryBlock);
  }

  @action
  cancelEdit() {
    this.mode = 'view';
    this.onConditionEditionEnd(this.queryBlock);
  }
}
