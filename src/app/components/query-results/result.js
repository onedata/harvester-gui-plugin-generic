/**
 * Renders single query result.
 *
 * @module components/query-results/result
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import _ from 'lodash';

/**
 * @argument {Utils.QueryResult} queryResult
 * @argument {Object} [filteredProperties]
 */
export default class QueryResultsResultComponent extends Component {
  /**
   * @type {String}
   */
  intlPrefix = 'components.query-results.result';

  /**
   * @type {boolean}
   */
  @tracked isExpanded = false;

  /**
   * @type {Object}
   */
  get rawData() {
    return this.args.queryResult?.source || {};
  }

  /**
   * @type {Object}
   */
  get filteredProperties() {
    const filteredProperties = typeof this.args.filteredProperties === 'object' ?
      (this.args.filteredProperties || {}) : {};
    return Object.keys(filteredProperties).length > 0 ? filteredProperties : null;
  }

  /**
   * NOTE: contains HTML tags, which should be rendered
   * @type {String}
   */
  get readableJson() {
    return (this.visualiseJsonValue(this.filteredProperties, this.rawData) || '')
      // slice to remove brackets { }
      .slice(1, -1);
  }

  /**
   * @type {Array<{ key: String, value: String }>}
   */
  get propertiesForTable() {
    return this.visualiseJsonForTable();
  }

  /**
   * @type {String}
   */
  get stringifiedJsonForTextarea() {
    return JSON.stringify(this.rawData, null, 2);
  }

  @action
  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  visualiseJsonForTable() {
    const visualisedProperties = [];
    const pathsQueue = [''];
    const dataQueue = [this.rawData];

    while (dataQueue.length) {
      const pathBase = pathsQueue.pop();
      const data = dataQueue.pop();

      if (typeof data === 'string') {
        visualisedProperties.push({
          key: _.escape(pathBase),
          value: `"${_.escape(data)}"`,
        });
      } else if (_.isArray(data)) {
        const arrayVisualisation =
          this.visualiseJsonArray(null, data);
        if (arrayVisualisation) {
          visualisedProperties.push({
            key: _.escape(pathBase),
            value: arrayVisualisation,
          });
        }
      } else if (typeof data === 'object' && data !== null) {
        for (const key of this.getSortedJsonObjectKeys(data).reverse()) {
          pathsQueue.push(`${pathBase}.${key}`);
          dataQueue.push(data[key]);
        }
      } else {
        visualisedProperties.push({
          key: _.escape(pathBase),
          value: _.escape(JSON.stringify(data)),
        });
      }
    }

    // remove '.' (dot) from the keys beginning
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
    // Sort keys and move properties starting with the underscore to the end
    return Object.keys(obj).sort((a, b) => {
      const a0 = a[0];
      const b0 = b[0];
      if (a === b) {
        return 0;
      } else if (a0 !== '_' && b0 === '_') {
        return -1;
      } else if (a0 === '_' && b0 !== '_') {
        return 1;
      } else if (a < b) {
        return -1;
      } else {
        return 1;
      }
    });
  }
}
