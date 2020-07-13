import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { later, cancel } from '@ember/runloop';
import _ from 'lodash';

export default class QueryResultsResultComponent extends Component {
  intlPrefix = 'components.query-results.result';

  @tracked isExpanded = false;
  @tracked isFileIdCopiedNotificationVisible = false;

  get rawData() {
    return this.args.queryResult && this.args.queryResult.source || {};
  }

  get filteredProperties() {
    const filteredProperties = typeof this.args.filteredProperties === 'object' ?
      (this.args.filteredProperties || {}) : {};
    return Object.keys(filteredProperties).length > 0 ? filteredProperties : null;
  }

  get readableJson() {
    return (this.visualiseJsonValue(this.filteredProperties, this.rawData) || '')
      .slice(1, -1);
  }

  get propertiesForTable() {
    return this.visualiseJsonForTable();
  }

  get stringifiedJsonForTextarea() {
    return JSON.stringify(this.rawData, null, 2);
  }

  @action toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  @action copyFileIdSuccess() {
    cancel(this.fileIdCopiedNotificationTimer);

    this.isFileIdCopiedNotificationVisible = true;
    this.fileIdCopiedNotificationTimer = later(
      this,
      () => this.isFileIdCopiedNotificationVisible = false,
      2000
    );
  }

  visualiseJsonForTable() {
    const visualisedProperties = [];
    // const filteredPropertiesInfoQueue = [this.filteredProperties];
    const pathsQueue = [''];
    const dataQueue = [this.rawData];

    // while (filteredPropertiesInfoQueue.length) {
    while (dataQueue.length) {
      // const filteredPropertiesInfo = filteredPropertiesInfoQueue.pop();
      const pathBase = pathsQueue.pop();
      const data = dataQueue.pop();

      if (typeof data === 'string') {
        visualisedProperties.push({
          key: _.escape(pathBase),
          value: `"${_.escape(data)}"`,
        });
      } else if (_.isArray(data)) {
        const arrayVisualisation =
          // this.visualiseJsonArray(filteredPropertiesInfo, data);
          this.visualiseJsonArray(null, data);
        if (arrayVisualisation) {
          visualisedProperties.push({
            key: _.escape(pathBase),
            value: arrayVisualisation,
          });
        }
      } else if (typeof data === 'object' && data !== null) {
        for (const key of this.getSortedJsonObjectKeys(data).reverse()) {
          // if (filteredPropertiesInfo[key]) {
          // filteredPropertiesInfoQueue.push(filteredPropertiesInfo[key]);
          pathsQueue.push(`${pathBase}.${key}`);
          dataQueue.push(data[key]);
          // }
        }
      } else {
        visualisedProperties.push({
          key: _.escape(pathBase),
          value: _.escape(JSON.stringify(data)),
        });
      }
    }

    visualisedProperties.forEach(record => record.key = record.key.substring(1));

    return visualisedProperties;
  }

  visualiseJsonArray(filteredProperties, dataArray) {
    const arrayElements = [];
    for (const element of dataArray) {
      const elementStringified = this.visualiseJsonValue(filteredProperties, element);
      if (elementStringified) {
        arrayElements.push(elementStringified);
      }
    }

    return arrayElements.length ? `[${arrayElements.join(', ')}]` : null;
  }

  visualiseJsonValue(filteredProperties, data) {
    if (typeof data === 'string') {
      return `"${_.escape(data)}"`;
    } else if (_.isArray(data)) {
      return this.visualiseJsonArray(filteredProperties, data);
    } else if (typeof data === 'object' && data !== null) {
      const resultObjEntries = [];
      for (const key of this.getSortedJsonObjectKeys(data)) {
        if (!filteredProperties || filteredProperties[key]) {
          const filteredSubproperties =
            filteredProperties ? filteredProperties[key] : null;
          const stringifiedSubvalue =
            this.visualiseJsonValue(filteredSubproperties, data[key]);
          if (stringifiedSubvalue) {
            resultObjEntries.push(`<strong>${_.escape(key)}</strong>: ${stringifiedSubvalue}`);
          }
        }
      }
      return resultObjEntries.length ? `{${resultObjEntries.join(', ')}}` : null;
    } else {
      return _.escape(JSON.stringify(data));
    }
  }

  getSortedJsonObjectKeys(obj) {
    const keys = Object.keys(obj).sort();
    return [
      ...keys.filter(k => !k.startsWith('_')),
      ...keys.filter(k => k.startsWith('_')),
    ];
  }
}
