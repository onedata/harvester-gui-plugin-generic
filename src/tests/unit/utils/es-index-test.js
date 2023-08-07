import { module, test } from 'qunit';
import EsIndex from 'harvester-gui-plugin-generic/utils/es-index';
import EsIndexProperty from 'harvester-gui-plugin-generic/utils/es-index-property';
import EsIndexOnedataProperty from 'harvester-gui-plugin-generic/utils/es-index-onedata-property';
import EsIndexAnyProperty from 'harvester-gui-plugin-generic/utils/es-index-any-property';

module('Unit | Utility | es-index', (hooks) => {
  hooks.beforeEach(function () {
    this.rawMapping = {
      mappings: {
        properties: {
          a: {
            type: 'text',
          },
          b: {
            type: 'object',
            properties: {
              ba: {
                type: 'keyword',
              },
            },
          },
          __onedata: {
            properties: {
              spaceId: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                  },
                },
              },
            },
          },
        },
      },
    };
  });

  test('persists raw mapping in "rawMapping" field', function (assert) {
    const index = new EsIndex(Object.freeze(this.rawMapping));

    assert.deepEqual(index.rawMapping, this.rawMapping);
  });

  test('extracts properties', function (assert) {
    const index = new EsIndex(Object.freeze(this.rawMapping));

    assert.strictEqual(Object.keys(index.properties).length, 4);
    assert.ok(index.properties.a instanceof EsIndexProperty);
    assert.propContains(index.properties.a, {
      name: 'a',
      rawMapping: this.rawMapping.mappings.properties.a,
    });
    assert.ok(index.properties.b instanceof EsIndexProperty);
    assert.propContains(index.properties.b, {
      name: 'b',
      rawMapping: this.rawMapping.mappings.properties.b,
    });
    assert.ok(index.properties['__onedata.space'] instanceof EsIndexOnedataProperty);
    assert.propContains(index.properties['__onedata.space'], {
      name: '__onedata.space',
      type: 'space',
    });
    assert.ok(index.properties['__anyProperty'] instanceof EsIndexAnyProperty);
    assert.strictEqual(Object.keys(index.properties.a.properties).length, 0);
    assert.strictEqual(Object.keys(index.properties.b.properties).length, 1);
    assert.strictEqual(
      Object.keys(index.properties['__onedata.space'].properties).length,
      0
    );
    assert.ok(index.properties.b.properties.ba instanceof EsIndexProperty);
    assert.propContains(index.properties.b.properties.ba, {
      name: 'ba',
      rawMapping: this.rawMapping.mappings.properties.b.properties.ba,
    });
  });

  test(
    'returns flattened list of properties on getFlattenedProperties call',
    function (assert) {
      const index = new EsIndex(Object.freeze(this.rawMapping));

      const flattened = index.getFlattenedProperties();
      assert.strictEqual(flattened.length, 5);
      [
        'a',
        'b',
        'b.ba',
        'space',
        'any property',
      ].forEach((propertyPath, index) => {
        const flattenedProperty = flattened[index];
        assert.ok(flattenedProperty instanceof EsIndexProperty);
        assert.strictEqual(flattenedProperty.path, propertyPath);
      });
    }
  );

  test('builds properties tree', function (assert) {
    const index = new EsIndex(Object.freeze(this.rawMapping));
    const propertiesTree = index.getPropertiesTree();
    assert.deepEqual(propertiesTree, {
      a: {},
      b: {
        ba: {},
      },
      __onedata: {
        spaceId: {},
      },
    });
  });
});
