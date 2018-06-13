require('chai').should();

const sinon = require('sinon').sandbox.create(),
      auth = require('../../../auth'),
      serverUtils = require('../../../server-utils');

const controller = require('../../../controllers/export-data'),
      exportDataV2 = require('../../../services/export-data-2');

let set;

describe('Export Data controller', () => {
  beforeEach(() => {
    sinon.stub(serverUtils, 'error');
    sinon.stub(auth, 'check');
    sinon.stub(auth, 'getUserCtx');
    sinon.stub(auth, 'isOnlineOnly');
    sinon.stub(exportDataV2, 'export');

    set = sinon.stub().returns({ set });
  });

  afterEach(() => sinon.restore());

  describe('V2', () => {
    it('Throws an error if you try to query for an unsupported export', () => {
      controller.routeV2({req: true, params: {type: 'fake'}}, {res: true});
      serverUtils.error.callCount.should.equal(1);
      serverUtils.error.args[0][0].message.should.contain('v2 export only supports');
      serverUtils.error.args[0][1].req.should.equal(true);
      serverUtils.error.args[0][2].res.should.equal(true);
    });
    it('Checks permissions', () => {
      auth.check.returns(Promise.reject({message: 'Bad permissions'}));
      auth.getUserCtx.returns(Promise.resolve({}));
      auth.isOnlineOnly.returns(true);
      return controller.routeV2({req: true, params: {type: 'reports'}}, {res: true})
        .then(() => {
          auth.check.callCount.should.equal(1);
          serverUtils.error.callCount.should.equal(1);
          serverUtils.error.args[0][0].message.should.contain('Bad permissions');
          serverUtils.error.args[0][1].req.should.equal(true);
          serverUtils.error.args[0][2].res.should.equal(true);
        });
    });

    it('corrects filter types', () => {
      const req = {
        params: {
          type: 'reports'
        },
        body: {
          filters: {
            date: { from: '1525813200000', to: '1528232399999' },
            valid: 'true',
            verified: 'false'
          }
        }
      };
      auth.check.resolves();
      auth.getUserCtx.returns(Promise.resolve({}));
      auth.isOnlineOnly.returns(true);
      return controller.routeV2(req, { set: set, flushHeaders: sinon.stub() }).then(() => {
        exportDataV2.export.callCount.should.equal(1);
        exportDataV2.export.args[0].should.deep.equal([
          'reports',
          {
            date: { from: 1525813200000, to: 1528232399999 },
            valid: true,
            verified: false
          },
          {}
        ]);
      });
    });
  });
});
