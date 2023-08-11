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

/**
 * @argument {Utils.QueryResult} queryResult
 * @argument {Utils.Index} index
 * @argument {Function} onSelectionChange
 */
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
   * @type {Object}
   */
  lastFilteredProperties = {};

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
   * @type {Object}
   */
  get filteredProperties() {
    return this.args.filteredProperties || {};
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
    return this.flatModel.filter(({ isChecked }) => isChecked).length;
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
    let newModel = null;
    let newFlatModel = null;

    // Recalculate model structure only if query results have been changed
    if (this.queryResults !== this.lastQueryResults) {
      const resultsPropertiesTree = this.queryResults ?
        this.queryResults.getPropertiesTree() : {};
      const schemaPropertiesTree = this.index ? this.index.getPropertiesTree() : {};
      const newPropertiesTree =
        _.merge({}, this.lastPropertiesTree, resultsPropertiesTree, schemaPropertiesTree);
      newModel = [];
      newFlatModel = [];

      const propertiesSubtreeQueue = [newPropertiesTree];
      const modelChildrenTargetQueue = [newModel];
      const oldModelChildrenTargetQueue = [this.calculatedModel];
      let uniqueId = 0;

      while (propertiesSubtreeQueue.length) {
        const modelChildrenTarget = modelChildrenTargetQueue.pop();
        const oldModelChildrenTarget = oldModelChildrenTargetQueue.pop();
        const propertiesSubtree = propertiesSubtreeQueue.pop();

        for (const key of Object.keys(propertiesSubtree).sort()) {
          const oldModelNode = oldModelChildrenTarget.find(({ name }) => name === key);
          const oldModelChildren = oldModelNode ? oldModelNode.children : [];

          const newModelNode = new TreeNode();
          newModelNode.id = uniqueId++;
          newModelNode.name = key;
          newModelNode.isExpanded = oldModelNode ? oldModelNode.isExpanded : false;
          modelChildrenTarget.push(newModelNode);

          newFlatModel.push(newModelNode);
          propertiesSubtreeQueue.push(propertiesSubtree[key]);
          modelChildrenTargetQueue.push(newModelNode.children);
          oldModelChildrenTargetQueue.push(oldModelChildren);
        }
      }

      this.lastQueryResults = this.queryResults;
      this.lastPropertiesTree = newPropertiesTree;
    }

    // Recalculate model selection only if structure or filtered properties have changed
    if (newModel || this.lastFilteredProperties !== this.filteredProperties) {
      if (!newModel) {
        newModel = this.calculatedModel;
      }

      const filteredPropertiesQueue = [this.filteredProperties];
      const modelQueue = [{ children: newModel }];

      while (filteredPropertiesQueue.length) {
        const filteredPropertiesNode = filteredPropertiesQueue.pop();
        const modelNode = modelQueue.pop();

        const filteredPropertiesNodeKeys = Object.keys(filteredPropertiesNode);
        if (filteredPropertiesNodeKeys.length && modelNode.children.length) {
          for (const nodeKey of filteredPropertiesNodeKeys) {
            const modelNodeForNodeKey = modelNode.children
              .find(({ name }) => name === nodeKey);
            if (modelNodeForNodeKey) {
              filteredPropertiesQueue.push(filteredPropertiesNode[nodeKey]);
              modelQueue.push(modelNodeForNodeKey);
            }
          }
        } else if (modelNode.children !== newModel) {
          this.markModelNodeAsChecked(modelNode);
        }
      }

      newModel.forEach(node => this.fixTreeSelectionState(node));
      this.lastFilteredProperties = this.filteredProperties;
    }

    if (newModel) {
      this.calculatedModel = newModel;
    }
    if (newFlatModel) {
      this.calculatedFlatModel = A(newFlatModel);
    }
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
      const childrenCheckedState = children.map(({ isChecked }) => isChecked);
      const childrenIndeterminateState = children
        .map(({ isIndeterminate }) => isIndeterminate);
      const isChecked = !childrenCheckedState.includes(false);
      const isIndeterminate = !isChecked && (
        childrenCheckedState.includes(true) || childrenIndeterminateState.includes(true)
      );
      node.isChecked = isChecked;
      node.isIndeterminate = isIndeterminate;
    }
  }

  markModelNodeAsChecked(modelNode) {
    modelNode.isChecked = true;
    modelNode.isIndeterminate = false;
    modelNode.children.forEach(child => this.markModelNodeAsChecked(child));
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
