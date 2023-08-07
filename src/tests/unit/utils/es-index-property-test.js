import { module, test } from 'qunit';
import EsIndexProperty from 'harvester-gui-plugin-generic/utils/es-index-property';

module('Unit | Utility | es-index-property', (hooks) => {
  hooks.beforeEach(function () {
    this.rawMapping = {
      properties: {
        a: { type: 'text' },
        b: { type: 'date' },
      },
      fields: {
        c: { type: 'text' },
      },
    };
  });

  test('places property name in "name" field', function (assert) {
    const property = new EsIndexProperty(null, 'myfield');
    assert.strictEqual(property.name, 'myfield');
  });

  test('places raw mapping in "rawMapping" field', function (assert) {
    const property = new EsIndexProperty(null, 'myfield', Object.freeze(this.rawMapping));
    assert.strictEqual(property.rawMapping, this.rawMapping);
  });

  test('extracts type, when it is described in rawMapping', function (assert) {
    this.rawMapping.type = 'text';

    const property = new EsIndexProperty(null, 'myfield', Object.freeze(this.rawMapping));
    assert.strictEqual(property.type, 'text');
  });

  test('sets type to "object" when type is not described in rawMapping',
    function (assert) {
      const property =
        new EsIndexProperty(null, 'myfield', Object.freeze(this.rawMapping));
      assert.strictEqual(property.type, 'object');
    }
  );

  [
    'long',
    'integer',
    'short',
    'byte',
    'double',
    'float',
    'half_float',
    'scaled_float',
  ].forEach(type =>
    test(`sets type to "number" when type in rawMapping equals "${type}"`,
      function (assert) {
        this.rawMapping.type = type;

        const property =
          new EsIndexProperty(null, 'myfield', Object.freeze(this.rawMapping));
        assert.strictEqual(property.type, 'number');
      }
    )
  );

  test('extracts subproperties', function (assert) {
    const property = new EsIndexProperty(null, 'myfield', Object.freeze(this.rawMapping));

    assert.strictEqual(Object.keys(property.properties).length, 3);
    assert.ok(property.properties.a instanceof EsIndexProperty);
    assert.propContains(property.properties.a, {
      name: 'a',
      rawMapping: this.rawMapping.properties.a,
      isField: false,
    });
    assert.strictEqual(property.properties.a.parentProperty, property);
    assert.ok(property.properties.b instanceof EsIndexProperty);
    assert.propContains(property.properties.b, {
      name: 'b',
      rawMapping: this.rawMapping.properties.b,
      isField: false,
    });
    assert.strictEqual(property.properties.b.parentProperty, property);
    assert.ok(property.properties.c instanceof EsIndexProperty);
    assert.propContains(property.properties.c, {
      name: 'c',
      rawMapping: this.rawMapping.fields.c,
      isField: true,
    });
    assert.strictEqual(property.properties.c.parentProperty, property);
  });

  test(
    'has "isField" flag set to false, when it represents an index property',
    function (assert) {
      const property =
        new EsIndexProperty(null, 'myfield', Object.freeze(this.rawMapping));
      assert.false(property.isField);
    }
  );

  test(
    'has "isField" flag set to true, when it represents an index property field',
    function (assert) {
      const property =
        new EsIndexProperty(null, 'myfield', Object.freeze(this.rawMapping), true);
      assert.true(property.isField);
    }
  );

  test(
    'remembers reference to parent property in "parentProperty"',
    function (assert) {
      const parent = {};
      const property =
        new EsIndexProperty(parent, 'myfield', Object.freeze(this.rawMapping), true);
      assert.strictEqual(property.parentProperty, parent);
    }
  );
});
