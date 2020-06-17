import { expect } from 'chai';
import { describe, it } from 'mocha';
import IndexPropertyCollection from 'harvester-gui-plugin-generic/utils/index-property-collection';

describe('Unit | Utility | index-property-collection', function () {
  it('has "properties" field equal to empty object on init', function () {
    const collection = new IndexPropertyCollection();
    expect(collection.properties).to.be.ok;
  });

  it(
    'creates properties instances based on passed properties raw object and places it in "properties" field',
    function () {
      const collection = new IndexPropertyCollection();

      const field1Def = { type: 'text' };
      const field2Def = { type: 'object' };
      const field3Def = { type: 'object' };
      collection.extractProperties({
        field1: field1Def,
        field2: field2Def,
      }, {
        field3: field3Def,
      });

      expect(Object.keys(collection.properties)).to.have.length(3);
      expect(collection.properties.field1)
        .to.deep.include({ name: 'field1', rawMapping: field1Def, isField: false });
      expect(collection.properties.field2)
        .to.deep.include({ name: 'field2', rawMapping: field2Def, isField: false });
      expect(collection.properties.field3)
        .to.deep.include({ name: 'field3', rawMapping: field3Def, isField: true });
    }
  );
});
