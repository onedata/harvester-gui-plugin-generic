// import { expect } from 'chai';
import { describe /*, it */ } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
// import { render } from '@ember/test-helpers';
// import hbs from 'htmlbars-inline-precompile';
// import { resolve, Promise } from 'rsvp';
// import { settled } from '@ember/test-helpers';
// import sinon from 'sinon';

describe('Integration | Component | promise-loader', function () {
  setupRenderingTest();
  // FIXME: test commented due to bamboo tests passing problem. Uncomment after Chrome upgrade
  // it('yields result of fulfilled promise', async function () {
  //   this.set('promise', resolve('test'));
  //   await render(hbs `
  //     <PromiseLoader @promise={{this.promise}} as |result|>
  //       {{result}}
  //     </PromiseLoader>
  //   `);

  //   expect(this.element.textContent.trim()).to.equal('test');
  // });

  // it('shows spinner when promise is pending', async function () {
  //   this.set('promise', new Promise(() => {}));
  //   await render(hbs `
  //     <PromiseLoader @promise={{this.promise}} as |result|>
  //       {{result}}
  //     </PromiseLoader>
  //   `);

  //   expect(this.element.querySelector('.spinner')).to.exist;
  // });

  // it('shows error from rejected promise', async function () {
  //   let rejectCallback;
  //   this.set('promise', new Promise((resolve, reject) => rejectCallback = reject));

  //   await render(hbs `
  //     <PromiseLoader @promise={{this.promise}} as |result|>
  //       {{result}}
  //     </PromiseLoader>
  //   `);
  //   rejectCallback('test');
  //   await settled();

  //   const resourceLoadError = this.element.querySelector('.resource-load-error');
  //   expect(resourceLoadError).to.exist;
  //   expect(resourceLoadError.querySelector('.details-json').textContent.trim())
  //     .to.equal('"test"');
  // });

  // it('notifies about promise resolve', async function () {
  //   const spy = sinon.spy();
  //   this.setProperties({
  //     promise: resolve('test'),
  //     spy,
  //   });
  //   await render(hbs `
  //     <PromiseLoader @promise={{this.promise}} @onResolve={{this.spy}} as |result|>
  //       {{result}}
  //     </PromiseLoader>
  //   `);

  //   expect(spy).to.be.calledOnce.and.to.be.calledWith('test');
  // });

  // it('notifies about promise reject', async function () {
  //   const spy = sinon.spy();
  //   let rejectCallback;
  //   this.setProperties({
  //     promise: new Promise((resolve, reject) => rejectCallback = reject),
  //     spy,
  //   });

  //   await render(hbs `
  //     <PromiseLoader @promise={{this.promise}} @onReject={{this.spy}} as |result|>
  //       {{result}}
  //     </PromiseLoader>
  //   `);
  //   rejectCallback('test');
  //   await settled();

  //   expect(spy).to.be.calledOnce.and.to.be.calledWith('test');
  // });
});
