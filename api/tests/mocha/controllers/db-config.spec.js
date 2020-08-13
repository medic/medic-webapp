const sinon = require('sinon');
const chai = require('chai');

const auth = require('../../../src/auth');
const controller = require('../../../src/controllers/db-config');
const serverUtils = require('../../../src/server-utils');
const service = require('../../../src/services/db-config');

let req;
let res;

describe('DB config Controller', () => {
  beforeEach(() => {
    req = {};
    res = { json: sinon.stub() };
    sinon.stub(auth, 'isDbAdmin');
    sinon.stub(serverUtils, 'error');
    sinon.stub(service, 'getConfig');
  });

  afterEach(() => sinon.restore());

  it('should respond with an error if the user is not logged in', () => {
    serverUtils.error.resolves();
    return controller.getAttachments(req, res).then(() => { 
      chai.expect(serverUtils.error.args[0][0].message).to.equal('Not logged in');
      chai.expect(serverUtils.error.args[0][0].code).to.equal(401);
      chai.expect(res.json.callCount).to.equal(0);
      chai.expect(serverUtils.error.callCount).to.equal(1);
    });
  });

  it('should respond with an error if the user does not have the correct permissions', () => {
    serverUtils.error.resolves();
    sinon.stub(auth, 'getUserCtx').resolves({ name: 'alpha' });
    auth.isDbAdmin.returns(false);
    return controller.getAttachments(req, res).then(() => { 
      chai.expect(auth.isDbAdmin.callCount).to.equal(1);
      chai.expect(serverUtils.error.args[0])
        .to.deep.equal([{ code: 401, message: 'Insufficient privileges' }, req, res]);
      chai.expect(res.json.callCount).to.equal(0);
      chai.expect(serverUtils.error.callCount).to.equal(1);
    });
  });

  it('should respond with the config when user has the required permissions', () => {
    sinon.stub(auth, 'getUserCtx').resolves({ name: 'alpha' });
    auth.isDbAdmin.returns(true);
    const attachmentsConfig = {'compressible_types':'text/*, application/*','compression_level':'8'};
    service.getConfig.returns(attachmentsConfig);
    return controller.getAttachments(req, res).then(() => {
      chai.expect(auth.isDbAdmin.callCount).to.equal(1);
      chai.expect(res.json.callCount).to.equal(1);
      chai.expect(serverUtils.error.callCount).to.equal(0);
      chai.expect(res.json.args[0][0]).to.deep.equal(attachmentsConfig);
    });
  });
});
