import IndexProperty from 'harvester-gui-plugin-generic/utils/index-property';

export default class IndexAnyProperty extends IndexProperty {
  isRealProperty = false;

  get path() {
    return 'any property';
  }

  constructor() {
    super(...arguments);

    this.extractType();
    this.name = null;
  }

  extractType() {
    this.type = 'anyProperty';
  }
}
