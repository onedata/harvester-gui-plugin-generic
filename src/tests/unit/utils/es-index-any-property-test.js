import { module, test } from 'qunit';
import EsIndexAnyProperty from 'harvester-gui-plugin-generic/utils/es-index-any-property';

module('Unit | Utility | es-index-any-property', () => {
  test('properly instantiates', function (assert) {
    const property = new EsIndexAnyProperty(null);
    assert.strictEqual(property.name, undefined);
    assert.strictEqual(property.type, 'anyProperty');
    assert.false(property.isField);
    assert.strictEqual(property.path, 'any property');
  });
});
