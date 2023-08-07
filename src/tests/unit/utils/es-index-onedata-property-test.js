import { module, test } from 'qunit';
import EsIndexOnedataProperty from 'harvester-gui-plugin-generic/utils/es-index-onedata-property';

module('Unit | Utility | es-index-onedata-property', () => {
  test('handles spaceId property', function (assert) {
    const property = new EsIndexOnedataProperty(null, '__onedata.space');
    assert.strictEqual(property.name, '__onedata.space');
    assert.strictEqual(property.type, 'space');
    assert.false(property.isField);
    assert.strictEqual(property.path, 'space');
  });
});
