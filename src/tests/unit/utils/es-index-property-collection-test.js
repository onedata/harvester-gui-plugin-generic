import { module, test } from 'qunit';
import EsIndexPropertyCollection from 'harvester-gui-plugin-generic/utils/es-index-property-collection';

module('Unit | Utility | es-index-property-collection', () => {
  test('has "properties" field equal to empty object on init', function (assert) {
    const collection = new EsIndexPropertyCollection();
    assert.deepEqual(collection.properties, {});
  });

  test(
    'creates properties instances based on passed properties raw object and places it in "properties" field',
    function (assert) {
      const collection = new EsIndexPropertyCollection();

      const field1Def = { type: 'text' };
      const field2Def = { type: 'object' };
      const field3Def = { type: 'object' };
      collection.extractProperties({
        field1: field1Def,
        field2: field2Def,
      }, {
        field3: field3Def,
      });

      assert.strictEqual(Object.keys(collection.properties).length, 3);
      assert.propContains(collection.properties.field1, {
        name: 'field1',
        rawMapping: field1Def,
        isField: false,
      });
      assert.propContains(collection.properties.field2, {
        name: 'field2',
        rawMapping: field2Def,
        isField: false,
      });
      assert.propContains(collection.properties.field3, {
        name: 'field3',
        rawMapping: field3Def,
        isField: true,
      });
    }
  );
});
