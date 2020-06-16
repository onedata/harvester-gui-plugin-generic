import { tracked } from '@glimmer/tracking';

export default class QueryResult {
  parseHelpers = {};
  rawObject = undefined;
  source = undefined;
  fileId = undefined;
  stringifiedJson = '';
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
    } else {
      this.stringifiedJson = '';
    }

    if (this.parseHelpers.fileBrowserUrlRequest && this.fileId) {
      this.parseHelpers.fileBrowserUrlRequest(this.fileId)
        .then(url => this.fileBrowserUrl = url);
    }
  }
}
