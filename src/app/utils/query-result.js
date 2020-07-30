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
    this.fillInWithRawResult(rawObject);
  }

  fillInWithRawResult(rawObject) {
    this.rawObject = rawObject;
    const normalizedRawObject = rawObject || {};

    this.source = normalizedRawObject._source;
    this.fileId = normalizedRawObject._id;
    this.fileName = get(normalizedRawObject._source || {}, '__onedata.fileName');

    this.loadFileBrowserUrl();
  }

  loadFileBrowserUrl() {
    this.fileBrowserUrl = '';

    if (this.parseHelpers.fileBrowserUrlRequest && this.fileId) {
      this.parseHelpers.fileBrowserUrlRequest(this.fileId)
        .then(url => this.fileBrowserUrl = url);
    }
  }
}
