import { tracked } from '@glimmer/tracking';
import { get } from '@ember/object';

export default class QueryResult {
  parseHelpers = {};
  rawObject = undefined;
  source = undefined;
  fileId = undefined;
  fileName = '';
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
    this.fileName = get(rawObject._source || {}, '__onedata.fileName');

    if (this.parseHelpers.fileBrowserUrlRequest && this.fileId) {
      this.parseHelpers.fileBrowserUrlRequest(this.fileId)
        .then(url => this.fileBrowserUrl = url);
    }
  }
}
