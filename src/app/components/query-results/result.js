import Component from '@glimmer/component';
import _ from 'lodash';

export default class QueryResultsResultComponent extends Component {
  get rawData() {
    return this.args.queryResult && this.args.queryResult.source || {};
  }

  get filteredProperties() {
    return this.args.filteredProperties || {};
  }

  get visualisedProperties() {
    return this.visualiseProperties();
  }

  visualiseProperties() {
    const visualisedProperties = [];
    const filteredPropertiesInfoQueue = [this.filteredProperties];
    const pathsQueue = [''];
    const dataQueue = [this.rawData];

    while (filteredPropertiesInfoQueue.length) {
      const filteredPropertiesInfo = filteredPropertiesInfoQueue.pop();
      const pathBase = pathsQueue.pop();
      const data = dataQueue.pop();

      if (typeof data === 'string') {
        visualisedProperties.push({
          key: _.escape(pathBase),
          value: `"${_.escape(data)}"`,
        });
      } else if (_.isArray(data)) {
        const arrayVisualisation =
          this.visualisePropertySubtreeInArray(filteredPropertiesInfo, data);
        if (arrayVisualisation) {
          visualisedProperties.push({
            key: _.escape(pathBase),
            value: this.visualisePropertySubtreeInArray(filteredPropertiesInfo, data),
          });
        }
      } else if (typeof data === 'object' && data !== null) {
        for (const key of Object.keys(data).sort().reverse()) {
          if (filteredPropertiesInfo[key]) {
            filteredPropertiesInfoQueue.push(filteredPropertiesInfo[key]);
            pathsQueue.push(`${pathBase}.${key}`);
            dataQueue.push(data[key]);
          }
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

  visualisePropertySubtreeInArray(filteredProperties, dataArray) {
    const arrayElements = [];
    for (const element of dataArray) {
      const elementStringified = this.visualiseObjectInArray(filteredProperties, element);
      if (elementStringified) {
        arrayElements.push(elementStringified);
      }
    }

    return arrayElements.length ? `[${arrayElements.join(',')}]` : null;
  }

  visualiseObjectInArray(filteredProperties, data) {
    if (typeof data === 'string') {
      return `"${_.escape(data)}"`;
    } else if (_.isArray(data)) {
      return this.visualisePropertySubtreeInArray(filteredProperties, data);
    } else if (typeof data === 'object' && data !== null) {
      const resultObjEntries = [];
      for (const key of Object.keys(data).sort()) {
        if (filteredProperties[key]) {
          const stringifiedSubvalue =
            this.visualiseObjectInArray(filteredProperties[key], data[key]);
          if (stringifiedSubvalue) {
            resultObjEntries.push(`"${_.escape(key)}":${stringifiedSubvalue}`);
          }
        }
      }
      return resultObjEntries.length ? `{${resultObjEntries.join(',')}}` : null;
    } else {
      return _.escape(JSON.stringify(data));
    }
  }
}
