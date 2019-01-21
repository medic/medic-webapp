const lib = require('../../../src/db-batch'),
      db = require('../../../src/db-pouch'),
      chai = require('chai'),
      sinon = require('sinon'),
      viewName = 'myddoc/myview',
      viewKey = 'mykey';

let iteratee;

describe('DB batch', () => {

  beforeEach(() => {
    iteratee = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('errors if the query errors', done => {
    sinon.stub(db.medic, 'query').returns(Promise.reject('boom'));
    lib.view(viewName, { key: viewKey }, iteratee).catch(err => {
      chai.expect(err).to.equal('boom');
      done();
    });
  });

  it('errors if the iteratee errors', done => {
    sinon.stub(db.medic, 'query').resolves({ offset: 0, rows: [ { doc: { _id: 'a' } } ] });
    iteratee.returns(Promise.reject('boo'));
    lib.view(viewName, { key: viewKey }, iteratee).catch(err => {
      chai.expect(err).to.equal('boo');
      done();
    });
  });

  it('works with a single page', () => {
    const doc1 = { _id: 'a' };
    const doc2 = { _id: 'b' };
    const view = sinon.stub(db.medic, 'query').resolves({ offset: 1, rows: [ { doc: doc1 }, { doc: doc2 } ] });
    iteratee.resolves();
    return lib.view(viewName, { key: viewKey }, iteratee).then(() => {
      chai.expect(view.callCount).to.equal(1);
      chai.expect(view.args[0][0]).to.equal(viewName);
      chai.expect(view.args[0][1].key).to.equal(viewKey);
      chai.expect(view.args[0][1].include_docs).to.equal(true);
      chai.expect(view.args[0][1].limit).to.equal(101); // default limit is 100
      chai.expect(iteratee.callCount).to.equal(1);
      chai.expect(iteratee.args[0][0]).to.deep.equal([ doc1, doc2 ]);
    });
  });

  it('works with multiple pages', () => {
    const row1 = { key: viewKey, id: 'a', doc: { _id: 'a' } };
    const row2 = { key: viewKey, id: 'b', doc: { _id: 'b' } };
    const row3 = { key: viewKey, id: 'c', doc: { _id: 'c' } };
    const row4 = { key: viewKey, id: 'd', doc: { _id: 'd' } };
    const row5 = { key: viewKey, id: 'e', doc: { _id: 'e' } };
    const row6 = { key: viewKey, id: 'f', doc: { _id: 'f' } };
    const view = sinon.stub(db.medic, 'query');
    view.onCall(0).resolves({ offset: 0, rows: [ row1, row2, row3 ] });
    view.onCall(1).resolves({ offset: 2, rows: [ row3, row4, row5 ] });
    view.onCall(2).resolves({ offset: 4, rows: [ row5, row6 ] });
    iteratee.resolves();
    return lib.view(viewName, { key: viewKey, limit: 2 }, iteratee).then(() => {
      chai.expect(view.callCount).to.equal(3);
      chai.expect(view.args[0][1].limit).to.equal(3); // given limit plus 1
      chai.expect(view.args[0][1].startkey).to.equal(undefined);
      chai.expect(view.args[0][1].startkey_docid).to.equal(undefined);
      chai.expect(view.args[1][1].limit).to.equal(3);
      chai.expect(view.args[1][1].startkey).to.equal(viewKey);
      chai.expect(view.args[1][1].startkey_docid).to.equal('c');
      chai.expect(view.args[2][1].limit).to.equal(3);
      chai.expect(view.args[2][1].startkey).to.equal(viewKey);
      chai.expect(view.args[2][1].startkey_docid).to.equal('e');
      chai.expect(iteratee.callCount).to.equal(3);
      chai.expect(iteratee.args[0][0]).to.deep.equal([ row1.doc, row2.doc ]);
      chai.expect(iteratee.args[1][0]).to.deep.equal([ row3.doc, row4.doc ]);
      chai.expect(iteratee.args[2][0]).to.deep.equal([ row5.doc, row6.doc ]);
    });
  });

});
