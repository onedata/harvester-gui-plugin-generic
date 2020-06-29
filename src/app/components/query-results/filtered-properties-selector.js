import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

class TreeNode {
  id = null;
  name = null;
  isExpanded = false;

  @tracked isChecked = false;

  @tracked isIndeterminate = false;

  isVisible = true;
  children = [];
}

export default class QueryResultsFilteredPropertiesSelectorComponent extends Component {
  intlPrefix = 'components.query-results.filtered-properties-selector';

  lastQueryResults = null;
  calculatedModel = [];
  calculatedFlatModel = [];

  @tracked propertiesCount = 0;

  get model() {
    this.calculateModelIfNeeded();
    return this.calculatedModel;
  }

  get flatModel() {
    this.calculateModelIfNeeded();
    return this.calculatedFlatModel;
  }

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
    if (this.args.onSelectionChange) {
      this.args.onSelectionChange(this.dumpSelectedPropertiesTree());
    }
  }

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
    if (this.args.queryResults === this.lastQueryResults) {
      return;
    }

    const propertiesTree = this.args.queryResults ?
      this.args.queryResults.getPropertiesTree() : {};
    const model = [];
    const flatModel = [];

    const propertiesSubtreeQueue = [propertiesTree];
    const modelChildrenTargetQueue = [model];
    let uniqueId = 0;

    while (propertiesSubtreeQueue.length) {
      const modelChildrenTarget = modelChildrenTargetQueue.pop();
      const propertiesSubtree = propertiesSubtreeQueue.pop();

      for (const key of Object.keys(propertiesSubtree).sort()) {
        const newModelNode = new TreeNode();
        newModelNode.id = uniqueId++;
        newModelNode.name = key;
        modelChildrenTarget.push(newModelNode);
        flatModel.push(newModelNode);
        propertiesSubtreeQueue.push(propertiesSubtree[key]);
        modelChildrenTargetQueue.push(newModelNode.children);
      }
    }

    this.lastQueryResults = this.args.queryResults;
    this.calculatedModel = model;
    this.calculatedFlatModel = A(flatModel);
  }
}
