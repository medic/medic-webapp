describe('GetSubjectSummaries service', () => {

  'use strict';

  let service,
    query;

  beforeEach(() => {
    query = sinon.stub();
    module('inboxApp');
    module($provide => {
      $provide.factory('DB', KarmaUtils.mockDB({ query: query }));
      $provide.value('$q', Q); // bypass $q so we don't have to digest
    });
    inject($injector => service = $injector.get('GetSubjectSummaries'));
  });

  afterEach(() => {
    KarmaUtils.restore(query);
  });

  it('returns empty array when given no summaries', () => {
    return service([]).then(actual => {
      chai.expect(actual).to.deep.equal([]);
    });
  });

  it('does nothing when input has no `form` (not a report)', () => {
    const given = [
      { id: 'a', type: 'person' }
    ];

    query.returns(Promise.resolve({ rows: [] }));
    return service(given).then(actual => {
      chai.expect(actual).to.deep.equal(given);
      chai.expect(query.callCount).to.equal(0);
    });
  });

  it('does nothing when summaries not found', () => {
    const given = [
      { form: 'a', subject: { type: 'reference', value: '12345' } },
      { form: 'a', subject: { type: 'id', value: 'a' } }
    ];

    query.returns(Promise.resolve({ rows: [] }));
    return service(given).then(actual => {
      chai.expect(actual).to.deep.equal(given);
    });
  });

  it('replaces `references` with `ids`', () => {
    const given = [
      { form: 'a', subject: { type: 'reference', value: '12345' } },
      { form: 'a', subject: { type: 'reference', value: '67890' } },
      { form: 'a', subject: { type: 'reference', value: '11111' } }
    ];

    const contactReferences = [
      { id: 'a', key: ['shortcode', '12345'] },
      { id: 'b', key: ['shortcode', '67890'] }
    ];

    query
      .withArgs('medic-client/contacts_by_reference')
      .returns(Promise.resolve({ rows: contactReferences }));
    query
      .withArgs('medic-client/doc_summaries_by_id')
      .returns(Promise.resolve({ rows: [] }));

    return service(given).then(actual => {
      chai.expect(actual[0]).to.deep.equal({
        form: 'a',
        subject: {
          type: 'id',
          value: 'a'
        },
        valid_subject: false
      });

      chai.expect(actual[1]).to.deep.equal({
        form: 'a',
        subject: {
          type: 'id',
          value: 'b'
        },
        valid_subject: false
      });

      chai.expect(actual[2]).to.deep.equal({
        form: 'a',
        subject: {
          type: 'reference',
          value: '11111'
        },
        valid_subject: false
      });

      chai.expect(query.callCount).to.equal(2);
    });
  });

  it('replaces `id` with names', () => {
    const given = [
      { form: 'a', subject: { type: 'id', value: 'a' } },
      { form: 'a', subject: { type: 'id', value: 'b' } },
      { form: 'a', subject: { type: 'id', value: 'c' } }
    ];

    const summaries = [
      {id: 'a', value: { name: 'tom' } },
      {id: 'b', value: { name: 'helen' } }
    ];

    query.returns(Promise.resolve({ rows: summaries }));
    return service(given).then(actual => {
      chai.expect(actual[0]).to.deep.equal({
        form: 'a',
        subject: {
          type: 'name',
          value: 'tom'
        },
        valid_subject: true
      });

      chai.expect(actual[1]).to.deep.equal({
        form: 'a',
        subject: {
          type: 'name',
          value: 'helen'
        },
        valid_subject: true
      });

      chai.expect(actual[2]).to.deep.equal({
        form: 'a',
        subject: {
          type: 'id',
          value: 'c'
        },
        valid_subject: false
      });

      chai.expect(query.callCount).to.equal(1);
    });
  });

  it('returns provided `name`', () => {
    const given = [
      { form: 'a', subject: { type: 'name', value: 'tom' } },
    ];

    query.returns(Promise.resolve({ rows: [] }));
    return service(given).then(actual => {
      chai.expect(actual[0]).to.deep.equal({
        form: 'a',
        subject: {
          type: 'name',
          value: 'tom'
        },
        valid_subject: true
      });
      chai.expect(query.callCount).to.equal(0);
    });
  });

  it('replaces `references` with `names`', () => {
    const given = [
      { form: 'a', subject: { type: 'reference', value: '12345' } },
      { form: 'a', subject: { type: 'reference', value: '56789' } },
      { form: 'a', subject: { type: 'reference', value: '00000' } },
      { form: 'a', subject: { type: 'reference', value: '11111' } },
    ];

    const contactReferences = [
      { key: ['shortcode', '12345'], id: 'a' },
      { key: ['shortcode', '56789'], id: 'b' },
      { key: ['shortcode', '00000'], id: 'c' }
    ];

    const summaries = [
      {id: 'a', value: { name: 'tom' } },
      {id: 'b', value: { name: 'helen' } }
    ];

    query
      .withArgs('medic-client/contacts_by_reference')
      .returns(Promise.resolve({ rows: contactReferences }));
    query
      .withArgs('medic-client/doc_summaries_by_id')
      .returns(Promise.resolve({ rows: summaries }));

    return service(given).then(actual => {
      chai.expect(actual[0]).to.deep.equal({
        form: 'a',
        subject: {
          type: 'name',
          value: 'tom'
        },
        valid_subject: true
      });

      chai.expect(actual[1]).to.deep.equal({
        form: 'a',
        subject: {
          type: 'name',
          value: 'helen'
        },
        valid_subject: true
      });

      chai.expect(actual[2]).to.deep.equal({
        form: 'a',
        subject: {
          type: 'id',
          value: 'c'
        },
        valid_subject: false
      });

      chai.expect(actual[3]).to.deep.equal({
        form: 'a',
        subject: {
          type: 'reference',
          value: '11111'
        },
        valid_subject: false
      });

      chai.expect(query.callCount).to.equal(2);
    });

  });

  it('uses `contact.name` or `from` when subject is empty', () => {
    const given = [
      { form: 'a', contact: 'tom', subject: {} },
      { form: 'a', from: 'helen', subject: {} }
    ];

    query.returns(Promise.resolve({ rows: [] }));
    return service(given).then(actual => {
      chai.expect(actual[0]).to.deep.equal({
        form: 'a',
        contact: 'tom',
        subject: {
          value: 'tom'
        },
        valid_subject: true
      });

      chai.expect(actual[1]).to.deep.equal({
        form: 'a',
        from: 'helen',
        subject: {
          value: 'helen'
        },
        valid_subject: true
      });

      chai.expect(query.callCount).to.equal(0);
    });
  });

  it('invalidates subject when info is missing', () => {
    const given = [
      { form: 'a', contact: 'a', subject: { type: 'reference', value: null } },
      { form: 'a', contact: 'b', subject: { type: 'name', value: null } },
      { form: 'a', contact: 'c', subject: { type: 'id', value: null } }
    ];

    query.returns(Promise.resolve({ rows: [] }));
    return service(given).then(actual => {
      chai.expect(actual[0]).to.deep.equal({
        form: 'a',
        contact: 'a',
        subject: {
          type: 'reference',
          value: null
        },
        valid_subject: false
      });

      chai.expect(actual[1]).to.deep.equal({
        form: 'a',
        contact: 'b',
        subject: {
          type: 'name',
          value: null
        },
        valid_subject: false
      });

      chai.expect(actual[2]).to.deep.equal({
        form: 'a',
        contact: 'c',
        subject: {
          type: 'id',
          value: null
        },
        valid_subject: false
      });
    });
  });
});
