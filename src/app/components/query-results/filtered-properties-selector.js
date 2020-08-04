/**
 * A selector, which allows to choose which properties should be visible or not.
 * No property selected should be interpreted as "all selected" (otherwise empty selection
 * would be useless).
 * 
 * @module components/query-results/filtered-properties-selector
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import _ from 'lodash';

export default class QueryResultsFilteredPropertiesSelectorComponent extends Component {
  /**
   * @type {String}
   */
  intlPrefix = 'components.query-results.filtered-properties-selector';

  /**
   * @type {Utils.QueryResults}
   */
  lastQueryResults = null;

  /**
   * @type {Object}
   */
  lastPropertiesTree = {};

  /**
   * @type {Array<TreeNode>}
   */
  calculatedModel = [];

  /**
   * @type {Array<TreeNode>}
   */
  calculatedFlatModel = [];

  /**
   * @type {number}
   */
  @tracked propertiesCount = 0;

  /**
   * @type {Utils.QueryResults}
   */
  get queryResults() {
    return this.args.queryResults;
  }

  /**
   * @type {Utils.Index}
   */
  get index() {
    return this.args.index;
  }

  /**
   * @type {Function}
   * @param {Object} filteredProperties
   */
  get onSelectionChange() {
    return this.args.onSelectionChange || (() => {});
  }

  /**
   * @type {Array<TreeNode>}
   */
  get model() {
    this.calculateModelIfNeeded();
    return this.calculatedModel;
  }

  /**
   * @type {Array<TreeNode>}
   */
  get flatModel() {
    this.calculateModelIfNeeded();
    return this.calculatedFlatModel;
  }

  /**
   * @type {number}
   */
  get selectedPropertiesCount() {
    return this.flatModel.filterBy('isChecked').length;
  }

  @action
  onCheck() {
    this.notifyChange();
  }

  @action
  selectAll() {
    this.flatModel.forEach(node => {
      node.isIndeterminate = false;
      node.isChecked = true;
    });
    this.notifyChange();
  }

  @action
  deselectAll() {
    this.flatModel.forEach(node => {
      node.isIndeterminate = false;
      node.isChecked = false;
    });
    this.notifyChange();
  }

  notifyChange() {
    this.onSelectionChange(this.dumpSelectedPropertiesTree());
  }

  /**
   * Returns properties tree representation of selected properties
   * @returns {Object}
   */
  dumpSelectedPropertiesTree() {
    const propertiesTree = {};
    const treeTargetQueue = [propertiesTree];
    const modelNodesQueue = [this.calculatedModel];

    while (modelNodesQueue.length) {
      const nodes = modelNodesQueue.pop();
      const treeTarget = treeTargetQueue.pop();

      for (const node of nodes) {
        if (node.isChecked || node.isIndeterminate) {
          const newTreeElement = treeTarget[node.name] = {};
          if (node.children && node.children.length) {
            treeTargetQueue.push(newTreeElement);
            modelNodesQueue.push(node.children);
          }
        }
      }
    }

    return propertiesTree;
  }

  calculateModelIfNeeded() {
    // Recalculate model only if query results have been changed
    if (this.args.queryResults === this.lastQueryResults) {
      return;
    }

    const resultsPropertiesTree = this.queryResults ?
      this.queryResults.getPropertiesTree() : {};
    const schemaPropertiesTree = this.index ? this.index.getPropertiesTree() : {};
    const newPropertiesTree =
      _.merge({}, this.lastPropertiesTree, resultsPropertiesTree, schemaPropertiesTree);
    const model = [];
    const flatModel = [];

    const propertiesSubtreeQueue = [newPropertiesTree];
    const modelChildrenTargetQueue = [model];
    const oldModelChildrenTargetQueue = [this.calculatedModel];
    let uniqueId = 0;

    while (propertiesSubtreeQueue.length) {
      const modelChildrenTarget = modelChildrenTargetQueue.pop();
      const oldModelChildrenTarget = oldModelChildrenTargetQueue.pop();
      const propertiesSubtree = propertiesSubtreeQueue.pop();

      for (const key of Object.keys(propertiesSubtree).sort()) {
        const oldModelNode = oldModelChildrenTarget.findBy('name', key);
        const oldModelChildren = oldModelNode ? oldModelNode.children : [];

        const newModelNode = new TreeNode();
        newModelNode.id = uniqueId++;
        newModelNode.name = key;
        newModelNode.isChecked = oldModelNode ? oldModelNode.isChecked : false;
        newModelNode.isIndeterminate =
          oldModelNode ? oldModelNode.isIndeterminate : false;
        newModelNode.isExpanded = oldModelNode ? oldModelNode.isExpanded : false;
        modelChildrenTarget.push(newModelNode);

        flatModel.push(newModelNode);
        propertiesSubtreeQueue.push(propertiesSubtree[key]);
        modelChildrenTargetQueue.push(newModelNode.children);
        oldModelChildrenTargetQueue.push(oldModelChildren);
      }
    }

    model.forEach(node => this.fixTreeSelectionState(node));

    this.lastQueryResults = this.args.queryResults;
    this.lastPropertiesTree = newPropertiesTree;
    this.calculatedModel = model;
    this.calculatedFlatModel = A(flatModel);
  }

  /**
   * Fixes (with recursion) selection state of the TreeNode - recalculates isChecked
   * and isIndeterminate according to the TreeNode leaves selection state.
   * @param {TreeNode} node 
   */
  fixTreeSelectionState(node) {
    const children = node.children || [];
    if (children.length > 0) {
      children.forEach(subnode => this.fixTreeSelectionState(subnode));
      const childrenCheckedState = children.mapBy('isChecked');
      const childrenIndeterminateState = children.mapBy('isIndeterminate');
      node.isChecked = !childrenCheckedState.includes(false);
      node.isIndeterminate = !node.isChecked && (
        childrenCheckedState.includes(true) || childrenIndeterminateState.includes(true)
      );
    }
  }
}

/**
 * Class used to generate tree structure for x-tree component
 */
class TreeNode {
  /**
   * @type {boolean}
   */
  @tracked isChecked = false;

  /**
   * @type {boolean}
   */
  @tracked isIndeterminate = false;

  /**
   * @type {any}
   */
  id = null;

  /**
   * @type {String}
   */
  name = null;

  /**
   * @type {boolean}
   */
  isExpanded = false;

  /**
   * @type {boolean}
   */
  isVisible = true;

  /**
   * @type {Array<TreeNode>}
   */
  children = [];
}
