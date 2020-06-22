import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import IndexProperty from 'harvester-gui-plugin-generic/utils/index-property';

describe('Unit | Utility | index-property', function () {
  beforeEach(function () {
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

  it('places property name in "name" field', function () {
    const property = new IndexProperty(null, 'myfield');
    expect(property.name).to.equal('myfield');
  });

  it('places raw mapping in "rawMapping" field', function () {
    const property = new IndexProperty(null, 'myfield', Object.freeze(this.rawMapping));
    expect(property.rawMapping).to.equal(this.rawMapping);
  });

  it('extracts type, when it is described in rawMapping', function () {
    this.rawMapping.type = 'text';

    const property = new IndexProperty(null, 'myfield', Object.freeze(this.rawMapping));
    expect(property.type).to.equal('text');
  });

  it('sets type to "object" when type is not described in rawMapping', function () {
    const property = new IndexProperty(null, 'myfield', Object.freeze(this.rawMapping));
    expect(property.type).to.equal('object');
  });

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
    it(`sets type to "number" when type in rawMapping equals "${type}"`, function () {
      this.rawMapping.type = type;

      const property = new IndexProperty(null, 'myfield', Object.freeze(this.rawMapping));
      expect(property.type).to.equal('number');
    })
  );

  it('extracts subproperties', function () {
    const property = new IndexProperty(null, 'myfield', Object.freeze(this.rawMapping));

    expect(Object.keys(property.properties)).to.have.length(3);
    expect(property.properties.a).to.be.an.instanceOf(IndexProperty)
      .and.to.deep.include({
        parentProperty: property,
        name: 'a',
        rawMapping: this.rawMapping.properties.a,
        isField: false,
      });
    expect(property.properties.b).to.be.an.instanceOf(IndexProperty)
      .and.to.deep.include({
        parentProperty: property,
        name: 'b',
        rawMapping: this.rawMapping.properties.b,
        isField: false,
      });
    expect(property.properties.c).to.be.an.instanceOf(IndexProperty)
      .and.to.deep.include({
        parentProperty: property,
        name: 'c',
        rawMapping: this.rawMapping.fields.c,
        isField: true,
      });
  });

  it(
    'has "isField" flag set to false, when it represents an index property',
    function () {
      const property = new IndexProperty(null, 'myfield', Object.freeze(this.rawMapping));
      expect(property.isField).to.be.false;
    }
  );

  it(
    'has "isField" flag set to true, when it represents an index property field',
    function () {
      const property =
        new IndexProperty(null, 'myfield', Object.freeze(this.rawMapping), true);
      expect(property.isField).to.be.true;
    }
  );

  it(
    'remembers reference to parent property in "parentProperty"',
    function () {
      const parent = {};
      const property =
        new IndexProperty(parent, 'myfield', Object.freeze(this.rawMapping), true);
      expect(property.parentProperty).to.equal(parent);
    }
  );
});
