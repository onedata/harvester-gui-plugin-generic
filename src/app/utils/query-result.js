import { tracked } from '@glimmer/tracking';
import _ from 'lodash';

export default class QueryResult {
  parseHelpers = {};
  rawObject = undefined;
  source = undefined;
  fileId = undefined;
  stringifiedJson = '';
  simplyFormattedJson = '';
  @tracked fileBrowserUrl = '';

  constructor(rawObject, parseHelpers) {
    this.parseHelpers = parseHelpers || {};
    if (rawObject) {
      this.rawObject = rawObject;
      this.recalculateFields();
    }
  }

  recalculateFields() {
    const rawObject = this.rawObject || {};
    this.source = rawObject._source;
    this.fileId = rawObject._id;

    if (this.source) {
      this.stringifiedJson = JSON.stringify(this.source);
      this.simplyFormattedJson = this.stringifyAndFormat(this.source);
    } else {
      this.stringifiedJson = '';
    }

    if (this.parseHelpers.fileBrowserUrlRequest && this.fileId) {
      this.parseHelpers.fileBrowserUrlRequest(this.fileId)
        .then(url => this.fileBrowserUrl = url);
    }
  }

  stringifyAndFormat(valueToFormat, isNestedCall = false) {
    if (typeof valueToFormat === 'string') {
      return `"${_.escape(valueToFormat)}"`;
    } else if (_.isArray(valueToFormat)) {
      return `[${valueToFormat.map(subvalue => this.stringifyAndFormat(subvalue, true)).join(', ')}]`;
    } else if (typeof valueToFormat === 'object' && valueToFormat !== null) {
      const objectRepresentation = Object.keys(valueToFormat).sort().map(key =>
        `<strong>${_.escape(key)}</strong>: ${this.stringifyAndFormat(valueToFormat[key], true)}`
      ).join(', ');
      return isNestedCall ? `{${objectRepresentation}}` : objectRepresentation;
    } else {
      return _.escape(JSON.stringify(valueToFormat));
    }
  }
}
