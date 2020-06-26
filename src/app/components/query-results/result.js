import Component from '@glimmer/component';
import _ from 'lodash';

export default class QueryResultsResultComponent extends Component {
  get rawData() {
    return this.args.queryResult && this.args.queryResult.source || {};
  }

  get visibleProperties() {
    console.log(this.args.visibleProperties);
    return this.args.visibleProperties || {};
  }

  get visualisedProperties() {
    return this.visualiseProperties();
  }

  visualiseProperties() {
    const visualisedProperties = [];
    const visiblePropertiesInfoQueue = [this.visibleProperties];
    const pathsQueue = [''];
    const dataQueue = [this.rawData];

    while (visiblePropertiesInfoQueue.length) {
      const visiblePropertiesInfo = visiblePropertiesInfoQueue.pop();
      const pathBase = pathsQueue.pop();
      const data = dataQueue.pop();

      if (typeof data === 'string') {
        visualisedProperties.push({
          key: _.escape(pathBase),
          value: `"${_.escape(data)}"`,
        });
      } else if (_.isArray(data)) {
        const arrayVisualisation =
          this.visualisePropertySubtreeInArray(visiblePropertiesInfo, data);
        if (arrayVisualisation) {
          visualisedProperties.push({
            key: _.escape(pathBase),
            value: this.visualisePropertySubtreeInArray(visiblePropertiesInfo, data),
          });
        }
      } else if (typeof data === 'object' && data !== null) {
        for (const key of Object.keys(data).sort().reverse()) {
          if (visiblePropertiesInfo[key]) {
            visiblePropertiesInfoQueue.push(visiblePropertiesInfo[key]);
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

  visualisePropertySubtreeInArray(visibleProperties, dataArray) {
    const arrayElements = [];
    for (const element of dataArray) {
      const elementStringified = this.visualiseObjectInArray(visibleProperties, element);
      if (elementStringified) {
        arrayElements.push(elementStringified);
      }
    }

    return arrayElements.length ? `[${arrayElements.join(',')}]` : null;
  }

  visualiseObjectInArray(visibleProperties, data) {
    if (typeof data === 'string') {
      return `"${_.escape(data)}"`;
    } else if (_.isArray(data)) {
      return this.visualisePropertySubtreeInArray(visibleProperties, data);
    } else if (typeof data === 'object' && data !== null) {
      const resultObjEntries = [];
      for (const key of Object.keys(data).sort()) {
        if (visibleProperties[key]) {
          const stringifiedSubvalue =
            this.visualiseObjectInArray(visibleProperties[key], data[key]);
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
