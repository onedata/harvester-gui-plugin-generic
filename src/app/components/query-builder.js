/**
 * Shows query builder - blocks editor, query trigger and curl generator.
 *
 * @module components/query-builder
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import RootOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/root-operator-query-block';
import OperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/operator-query-block';

const allowedPropertyTypes = [
  'text',
  'number',
  'keyword',
  'date',
  'boolean',
  'object',
  'space',
  'anyProperty',
];

/**
 * @argument {Utils.QueryValueComponentsBuilder} valuesBuilder
 * @argument {Utils.Index} index
 * @argument {Function} onPerformQuery
 * @argument {Utils.EsIndexProperty} sortProperty
 * @argument {String} sortDirection
 * @argument {Function} onGenerateCurl
 * @argument {Object} filteredProperties
 */
export default class QueryBuilderComponent extends Component {
  /**
   * @type {String}
   */
  intlPrefix = 'components.query-builder';

  /**
   * @type {Utils.QueryBuilder.RootOperatorQueryBlock}
   */
  @tracked rootQueryBlock = new RootOperatorQueryBlock();

  /**
   * Contains state of the condition blocks edition. Each state has only one field
   * (for now):
   * isValid: boolean.
   * @type {Map<Utils.QueryBuilder.ConditionQueryBlock,Object>}
   */
  @tracked editedConditions = new Map();

  /**
   * @type {Function}
   * @param {Utils.QueryBuilder.RootOperatorQueryBlock} rootQueryBlock
   */
  get onPerformQuery() {
    return this.args.onPerformQuery || (() => {});
  }

  /**
   * @type {Array<Utils.EsIndexProperty>}
   */
  get indexProperties() {
    const allProperties =
      (this.args.index ? this.args.index.getFlattenedProperties() : [])
      .filter(property => this.isSupportedProperty(property))
      .sortBy('path');

    const specialProperties = allProperties.rejectBy('isRealProperty');
    const ordinaryProperties = allProperties
      .filter(prop => prop.isRealProperty && !prop.path.startsWith('_'));
    const internalProperties = allProperties
      .filter(prop => prop.isRealProperty && prop.path.startsWith('_'));

    return [...specialProperties, ...ordinaryProperties, ...internalProperties];
  }

  /**
   * @type {boolean}
   */
  get hasInvalidCondition() {
    return [...this.editedConditions.values()].mapBy('isValid').some(isValid => !isValid);
  }

  @action
  performQuery() {
    this.onPerformQuery(this.rootQueryBlock);
  }

  /**
   * @param {Utils.QueryBuilder.ConditionQueryBlock} conditionBlock
   */
  @action
  onConditionEditionStart(conditionBlock) {
    this.editedConditions.set(conditionBlock, { isValid: true });
    // trigger change
    this.editedConditions = new Map(this.editedConditions);
  }

  /**
   * @param {Utils.QueryBuilder.ConditionQueryBlock} conditionBlock
   */
  @action
  onConditionEditionEnd(conditionBlock) {
    this.editedConditions.delete(conditionBlock);
    // trigger change
    this.editedConditions = new Map(this.editedConditions);
  }

  /**
   * @param {Utils.QueryBuilder.ConditionQueryBlock} conditionBlock
   * @param {boolean} isValid
   */
  @action
  onConditionEditionValidityChange(conditionBlock, isValid) {
    const editedConditionEntry = this.editedConditions.get(conditionBlock);
    if (editedConditionEntry) {
      const updatedConditionEntry = {
        ...editedConditionEntry,
        isValid,
      };
      this.editedConditions.set(conditionBlock, updatedConditionEntry);
      // trigger change
      this.editedConditions = new Map(this.editedConditions);
    }
  }

  /**
   * @param {Utils.QueryBuilder.QueryBlock} block
   */
  @action
  onBlockRemoved(block) {
    // building list of all conditions inside passed block (including block itself)
    const flattenedConditionsList = [];
    const blocksToFlatten = [block];
    while (blocksToFlatten.length) {
      const blockToFlatten = blocksToFlatten.pop();
      if (blockToFlatten instanceof OperatorQueryBlock) {
        blocksToFlatten.push(...blockToFlatten.operands);
      } else {
        flattenedConditionsList.push(blockToFlatten);
      }
    }

    flattenedConditionsList.forEach(condition => this.editedConditions.delete(condition));

    // trigger change
    this.editedConditions = new Map(this.editedConditions);
  }

  /**
   * @param {Utils.EsIndexProperty} property
   * @returns {boolean}
   */
  isSupportedProperty(property) {
    if (property.type === 'object') {
      return false;
    }

    let propertyInPath = property;
    do {
      if (!allowedPropertyTypes.includes(propertyInPath.type)) {
        return false;
      }
      propertyInPath = propertyInPath.parentProperty;
    } while (propertyInPath);

    return true;
  }
}
