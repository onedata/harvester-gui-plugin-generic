import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { resolve, Promise } from 'rsvp';
import { settled } from '@ember/test-helpers';
import sinon from 'sinon';

describe('Integration | Component | promise-loader', function () {
  setupRenderingTest();

  it('yields result of fulfilled promise', async function () {
    this.promise = resolve('test');
    await render(hbs `
      <PromiseLoader @promise={{this.promise}} as |result|>
        {{result}}
      </PromiseLoader>
    `);

    expect(this.element.textContent.trim()).to.equal('test');
  });

  it('shows spinner when promise is pending', async function () {
    this.promise = new Promise(() => {});
    await render(hbs `
      <PromiseLoader @promise={{this.promise}} as |result|>
        {{result}}
      </PromiseLoader>
    `);

    expect(this.element.querySelector('.spinner')).to.exist;
  });

  it('shows error from rejected promise', async function () {
    let rejectCallback;
    this.promise = new Promise((resolve, reject) => rejectCallback = reject);

    await render(hbs `
      <PromiseLoader @promise={{this.promise}} as |result|>
        {{result}}
      </PromiseLoader>
    `);
    rejectCallback('test');
    await settled();

    const resourceLoadError = this.element.querySelector('.resource-load-error');
    expect(resourceLoadError).to.exist;
    expect(resourceLoadError.querySelector('.details-json').textContent.trim())
      .to.equal('"test"');
  });

  it('notifies about promise resolve', async function () {
    this.spy = sinon.spy();
    this.promise = resolve('test');

    await render(hbs `
      <PromiseLoader @promise={{this.promise}} @onResolve={{this.spy}} as |result|>
        {{result}}
      </PromiseLoader>
    `);

    expect(this.spy).to.be.calledOnce.and.to.be.calledWith('test');
  });

  it('notifies about promise reject', async function () {
    this.spy = sinon.spy();
    let rejectCallback;
    this.promise = new Promise((resolve, reject) => rejectCallback = reject);

    await render(hbs `
      <PromiseLoader @promise={{this.promise}} @onReject={{this.spy}} as |result|>
        {{result}}
      </PromiseLoader>
    `);
    rejectCallback('test');
    await settled();

    expect(this.spy).to.be.calledOnce.and.to.be.calledWith('test');
  });

  it('allows to use custom template for "pending" promise state', async function () {
    this.promise = new Promise(() => {});

    await render(hbs `
      <PromiseLoader
        @promise={{this.promise}}
        @useCustomPending={{true}}
        as |result state|
      >
        {{#if (eq state "pending")}}
          <div class="loading-test"></div>
        {{/if}}
      </PromiseLoader>
    `);

    expect(this.element.querySelector('.loading-test')).to.exist;
  });

  it('allows to use custom template for "rejected" promise state', async function () {
    let rejectCallback;
    this.promise = new Promise((resolve, reject) => rejectCallback = reject);

    await render(hbs `
      <PromiseLoader
        @promise={{this.promise}}
        @useCustomRejected={{true}}
        as |data state|
      >
        {{#if (eq state "rejected")}}
          <div class="error-test">{{data}}</div>
        {{/if}}
      </PromiseLoader>
    `);
    rejectCallback('test');
    await settled();

    expect(this.element.querySelector('.error-test')).to.exist;
    expect(this.element).to.contain.text('test');
  });

  it('does not notify about promise reject when that promise has been replaced with another promise',
    async function () {
      this.spy = sinon.spy();
      let rejectCallback;
      this.promise = new Promise((resolve, reject) => rejectCallback = reject);

      await render(hbs `
        <PromiseLoader @promise={{this.promise}} @onReject={{this.spy}} as |result|>
          {{result}}
        </PromiseLoader>
      `);
      this.set('promise', Promise.resolve('abc'));
      await settled();
      rejectCallback('test');
      await settled();

      expect(this.spy).not.to.be.called;
      expect(this.element).to.contain.trimmed.text('abc');
    }
  );
});
