const chai = require('chai');
const sinon = require('sinon');

const config = require('../../../src/config');
const db = require('../../../src/db');
const service = require('../../../src/services/token-login');

const oneDayInMS = 24 * 60 * 60 * 1000;

let clock;

describe('TokenLogin service', () => {
  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });
  afterEach(() => {
    clock.restore();
    sinon.restore();
  });

  describe('validTokenLoginConfig', () => {
    it('should return falsy when no setting', () => {
      sinon.stub(config, 'get').returns();
      chai.expect(service.validTokenLoginConfig()).to.equal(false);
      chai.expect(config.get.callCount).to.deep.equal(2);
      chai.expect(config.get.args[0]).to.deep.equal(['token_login']);
      chai.expect(config.get.args[1]).to.deep.equal(['app_url']);
    });

    it('should return falsy when not enabled', () => {
      sinon.stub(config, 'get')
        .withArgs('token_login').returns({ enabled: false })
        .withArgs('app_url').returns('someString');
      chai.expect(service.validTokenLoginConfig()).to.equal(false);
    });

    it('should return falsy when not missing fields', () => {
      sinon.stub(config, 'get')
        .withArgs('token_login').returns({ enabled: true })
        .withArgs('app_url').returns('someString');

      chai.expect(service.validTokenLoginConfig()).to.equal(false);
      config.get
        .withArgs('token_login').returns({ enabled: true })
        .withArgs('app_url').returns('aaa');
      chai.expect(service.validTokenLoginConfig()).to.equal(false);

      config.get
        .withArgs('token_login').returns({ enabled: true, translation_key: 'aaaa' })
        .withArgs('app_url').returns();
      chai.expect(service.validTokenLoginConfig()).to.equal(false);
    });

    it('should return true when required fields are present', () => {
      sinon.stub(config, 'get')
        .withArgs('token_login').returns({ enabled: true, translation_key: 'aaaa' })
        .withArgs('app_url').returns('bbb');
      chai.expect(service.validTokenLoginConfig()).to.equal(true);
    });
  });

  describe('shouldEnableTokenLogin', () => {
    it('should return falsey when not token login not configured', () => {
      sinon.stub(config, 'get').returns({});
      chai.expect(service.shouldEnableTokenLogin({ token_login: true })).to.equal(false);
    });

    it('should return falsey when data does not request token_login to be enabled', () => {
      sinon.stub(config, 'get')
        .withArgs('token_login').returns({ enabled: true, message: 'message' })
        .withArgs('app_url').returns('some_url');
      chai.expect(service.shouldEnableTokenLogin({})).to.equal(undefined);
    });

    it('should return true when configured and requested', () => {
      sinon.stub(config, 'get')
        .withArgs('token_login').returns({ enabled: true, message: 'message' })
        .withArgs('app_url').returns('some_url');
      chai.expect(service.shouldEnableTokenLogin({ token_login: true })).to.equal(true);
    });
  });

  describe('validateTokenLogin', () => {
    beforeEach(() => {
      sinon.stub(config, 'get')
        .withArgs('token_login').returns({ enabled: true, message: 'message' })
        .withArgs('app_url').returns('some_url');
    });

    describe('on create', () => {
      it('should do nothing when token login not required', () => {
        const data = {};
        service.validateTokenLogin(data, true);
        chai.expect(data).to.deep.equal({});
      });

      it('should return an error when phone number is not present', () => {
        const data = { token_login: true };
        const result = service.validateTokenLogin(data, true);
        chai.expect(result).to.deep.equal({
          msg: 'A valid phone number is required for SMS login.',
          key: 'configuration.enable.token.login.phone'
        });
        chai.expect(data).to.deep.equal({ token_login: true });
      });

      it('should return an error when phone number is not valid', () => {
        const data = { token_login: true, phone: 'aaaaa' };
        const result = service.validateTokenLogin(data, true);
        chai.expect(result).to.deep.equal({
          msg: 'A valid phone number is required for SMS login.',
          key: 'configuration.enable.token.login.phone'
        });
        chai.expect(data).to.deep.equal({ token_login: true, phone: 'aaaaa' });
      });

      it('should assign password and normalize phone when phone is valid', () => {
        const data = { token_login: true, phone: '+40 755 336-699' };
        const result = service.validateTokenLogin(data, true);
        chai.expect(result).to.equal(undefined);
        chai.expect(data).to.have.keys(['token_login', 'phone', 'password']);
        chai.expect(data).to.include({ token_login: true, phone: '+40755336699' });
        chai.expect(data.password.length).to.equal(20);
      });
    });

    describe('on edit', () => {
      it('should do nothing when no changes', () => {
        const user = { _id: 'user', name: 'user', known: true, facility_id: 'aaa' };
        const settings = { _id: 'user', name: 'user', contact_id: 'bbb' };
        const data = {};
        const result = service.validateTokenLogin(data, false, user, settings);
        // no changes to provided data
        chai.expect(result).to.equal(undefined);
        chai.expect(user).to.deep.equal({ _id: 'user', name: 'user', known: true, facility_id: 'aaa' });
        chai.expect(settings).to.deep.equal({ _id: 'user', name: 'user', contact_id: 'bbb' });
      });

      describe('when disabling', () => {
        it('should do nothing when token login not enabled', () => {
          const user = { _id: 'user', name: 'user', known: true, facility_id: 'aaa' };
          const settings = { _id: 'user', name: 'user', contact_id: 'bbb' };
          const data = { token_login: false };
          const result = service.validateTokenLogin(data, false, user, settings);
          // no changes to provided data
          chai.expect(result).to.equal(undefined);
          chai.expect(user).to.deep.equal({ _id: 'user', name: 'user', known: true, facility_id: 'aaa' });
          chai.expect(settings).to.deep.equal({ _id: 'user', name: 'user', contact_id: 'bbb' });
        });

        it('should require password', () => {
          const user = { _id: 'user', name: 'user', token_login: true };
          const settings = { _id: 'user', name: 'user', contact_id: 'bbb', token_login: true };
          const data = { token_login: false };
          const result = service.validateTokenLogin(data, false, user, settings);
          chai.expect(result).to.deep.equal({
            msg: 'Password is required when disabling token login.',
            key: 'password.length.minimum',
          });
          // no changes to provided data
          chai.expect(user).to.deep.equal({ _id: 'user', name: 'user', token_login: true });
          chai.expect(settings).to.deep.equal({ _id: 'user', name: 'user', contact_id: 'bbb', token_login: true });
          chai.expect(data).to.deep.equal({ token_login: false });
        });

        it('should do nothing when password is present', () => {
          const user = { _id: 'user', name: 'user', token_login: true };
          const settings = { _id: 'user', name: 'user', contact_id: 'bbb', token_login: true };
          const data = { token_login: false, password: 'superSecret' };
          const result = service.validateTokenLogin(data, false, user, settings);
          chai.expect(result).to.deep.equal(undefined);
          // no changes to provided data
          chai.expect(user).to.deep.equal({ _id: 'user', name: 'user', token_login: true });
          chai.expect(settings).to.deep.equal({ _id: 'user', name: 'user', contact_id: 'bbb', token_login: true });
          chai.expect(data).to.deep.equal({ token_login: false, password: 'superSecret' });
        });
      });

      describe('when enabling', () => {
        it('should return an error when no phone number', () => {
          const user = { _id: 'user', name: 'user' };
          const settings = { _id: 'user', name: 'user', contact_id: 'aaa' };
          const data = { token_login: true };
          const result = service.validateTokenLogin(data, false, user, settings);
          chai.expect(result).to.deep.equal({
            msg: 'A valid phone number is required for SMS login.',
            key: 'configuration.enable.token.login.phone'
          });
          // no changes to provided data
          chai.expect(user).to.deep.equal({ _id: 'user', name: 'user' });
          chai.expect(settings).to.deep.equal({ _id: 'user', name: 'user', contact_id: 'aaa' });
          chai.expect(data).to.deep.equal({ token_login: true });
        });

        it('should return an error when phone is invalid', () => {
          const user = { _id: 'user', name: 'user' };
          const settings = { _id: 'user', name: 'user', contact_id: 'aaa', phone: 'aaaa' };
          const data = { token_login: true };
          const result = service.validateTokenLogin(data, false, user, settings);
          chai.expect(result).to.deep.equal({
            msg: 'A valid phone number is required for SMS login.',
            key: 'configuration.enable.token.login.phone'
          });
          // no changes to provided data
          chai.expect(user).to.deep.equal({ _id: 'user', name: 'user' });
          chai.expect(settings).to.deep.equal({ _id: 'user', name: 'user', contact_id: 'aaa', phone: 'aaaa' });
          chai.expect(data).to.deep.equal({ token_login: true });
        });

        it('should normalize phone and reset password when phone is valid', () => {
          const user = { _id: 'user', name: 'user' };
          const settings = { _id: 'user', name: 'user', contact_id: 'aaa', phone: '+40 (766) 23-23-23' };
          const data = { token_login: true };
          const result = service.validateTokenLogin(data, false, user, settings);
          chai.expect(result).to.deep.equal(undefined);
          // new password
          chai.expect(user).to.have.all.keys(['_id', 'name', 'password']);
          chai.expect(user.password.length).to.equal(20);
          // normalized phone
          chai.expect(settings).to.deep.equal({ _id: 'user', name: 'user', contact_id: 'aaa', phone: '+40766232323' });
          chai.expect(data).to.deep.equal({ token_login: true });
        });
      });
    });
  });

  describe('getUserByToken', () => {
    const base64Decode = string => Buffer.from(string, 'base64').toString('utf8');

    it('should reject with no input', () => {
      sinon.stub(db.users, 'get');
      return service
        .getUserByToken()
        .then(() => chai.assert.fail('Should have thrown'))
        .catch(err => {
          chai.expect(err).to.deep.equal({ status: 401, error: 'invalid' });
          chai.expect(db.users.get.callCount).to.equal(0);
        });
    });

    it('should throw when user not found', () => {
      sinon.stub(db.users, 'get').rejects({ status: 404 });
      return service
        .getUserByToken('token', 'base64')
        .then(() => chai.assert.fail('Should have thrown'))
        .catch(err => {
          chai.expect(err).to.deep.equal({ status: 401, error: 'invalid' });
          chai.expect(db.users.get.callCount).to.equal(1);
          chai.expect(db.users.get.args[0]).to.deep.equal([`org.couchdb.user:${base64Decode('base64')}`]);
        });
    });

    it('should return false when no matches found', () => {
      sinon.stub(db.users, 'get').resolves({ token_login: { token: 'not token' } });
      return service
        .getUserByToken('token', 'somebase64')
        .then(() => chai.assert.fail('Should have thrown'))
        .catch(err => {
          chai.expect(err).to.deep.equal({ status: 401, error: 'invalid' });
          chai.expect(db.users.get.callCount).to.equal(1);
          chai.expect(db.users.get.args[0]).to.deep.equal([`org.couchdb.user:${base64Decode('somebase64')}`]);
        });
    });

    it('should throw when match is expired', () => {
      sinon.stub(db.users, 'get').resolves({ token_login: { active: true, token: 'the_token', expiration_date: 0 } });
      return service
        .getUserByToken('the_token', 'the_base64')
        .then(() => chai.assert.fail('Should have thrown'))
        .catch(err => {
          chai.expect(err).to.deep.equal({ status: 401, error: 'expired' });
          chai.expect(db.users.get.callCount).to.equal(1);
          chai.expect(db.users.get.args[0]).to.deep.equal([`org.couchdb.user:${base64Decode('the_base64')}`]);
        });
    });

    it('should return the row id when match is not expired', () => {
      const future = new Date().getTime() + 1000;
      sinon.stub(db.users, 'get').resolves({
        _id: 'user_id',
        token_login: {
          active: true,
          token: 'the_token',
          expiration_date: future
        },
      });
      return service.getUserByToken('the_token', 'the_base64').then(response => {
        chai.expect(response).to.equal('user_id');
        chai.expect(db.users.get.callCount).to.equal(1);
        chai.expect(db.users.get.args[0]).to.deep.equal([`org.couchdb.user:${base64Decode('the_base64')}`]);
      });
    });

    it('should throw when get errors', () => {
      sinon.stub(db.users, 'get').rejects({ some: 'err' });
      return service
        .getUserByToken('t', 'h')
        .then(() => chai.assert.fail('should have thrown'))
        .catch(err => chai.expect(err).to.deep.equal({ status: 401, error: 'invalid' }));
    });
  });

  describe('resetPassword', () => {
    it('should throw an error when user not found', () => {
      sinon.stub(db.users, 'get').rejects({ status: 404 });

      return service
        .resetPassword('userId')
        .then(() => chai.assert.fail('should have thrown'))
        .catch(err => {
          chai.expect(err).to.include({ status: 404 });
        });
    });

    it('should throw an error when user is invalid', () => {
      sinon.stub(db.users, 'get').resolves({ name: 'user' });
      return service
        .resetPassword('userId')
        .then(() => chai.assert.fail('should have thrown'))
        .catch(err => {
          chai.expect(err).to.deep.equal({ code: 400, message: 'invalid user' });
        });
    });

    it('should throw an error when user token not active', () => {
      sinon.stub(db.users, 'get').resolves({ name: 'user', token_login: { active: false } });
      return service
        .resetPassword('userId')
        .then(() => chai.assert.fail('should have thrown'))
        .catch(err => {
          chai.expect(err).to.deep.equal({ code: 400, message: 'invalid user' });
        });
    });

    it('should update the users password', () => {
      const user = {
        name: 'sally',
        roles: ['a', 'b'],
        facilty_id: 'c',
        type: 'user',
        token_login: {
          active: true,
          token: 'aaaa',
          expiration_date: 0,
        },
      };

      sinon.stub(db.users, 'get').resolves(user);
      sinon.stub(db.users, 'put').resolves();

      return service.resetPassword('userID').then(response => {
        chai.expect(response).to.deep.equal({
          password: user.password,
          user: 'sally'
        });
        chai.expect(user.password.length).to.equal(8);

        chai.expect(db.users.get.callCount).to.equal(1);
        chai.expect(db.users.get.args[0]).to.deep.equal(['userID']);

        chai.expect(db.users.put.callCount).to.equal(1);
        chai.expect(db.users.put.args[0]).to.deep.equal([{
          name: 'sally',
          roles: ['a', 'b'],
          facilty_id: 'c',
          type: 'user',
          token_login: {
            active: true,
            token: 'aaaa',
            expiration_date: 0,
          },
          password: user.password,
        }]);
      });
    });
  });

  describe('deactivate token login', () => {
    it('should throw an error when user not found', () => {
      sinon.stub(db.users, 'get').rejects({ status: 404 });
      sinon.stub(db.medic, 'get').rejects({ status: 404 });

      return service
        .deactivateTokenLogin('userId')
        .then(() => chai.assert.fail('should have thrown'))
        .catch(err => {
          chai.expect(err).to.include({ status: 404 });
        });
    });

    it('should throw an error when user is invalid', () => {
      sinon.stub(db.users, 'get').resolves({ name: 'user' });
      sinon.stub(db.medic, 'get').resolves({ name: 'user' });
      return service
        .deactivateTokenLogin('userId')
        .then(() => chai.assert.fail('should have thrown'))
        .catch(err => {
          chai.expect(err).to.deep.equal({ code: 400, message: 'invalid user' });
        });
    });

    it('should throw an error when user token not active', () => {
      sinon.stub(db.users, 'get').resolves({ name: 'user', token_login: { active: false } });
      sinon.stub(db.medic, 'get').resolves({ name: 'user', token_login: { active: false } });
      return service
        .deactivateTokenLogin('userId')
        .then(() => chai.assert.fail('should have thrown'))
        .catch(err => {
          chai.expect(err).to.deep.equal({ code: 400, message: 'invalid user' });
        });
    });

    it('should de-activate token login', () => {
      const user = {
        name: 'sally',
        roles: ['a', 'b'],
        facilty_id: 'c',
        type: 'user',
        token_login: {
          active: true,
          token: 'aaaa',
          expiration_date: 0,
        },
      };
      const userSettings = {
        name: 'sally',
        roles: ['a', 'b'],
        phone: 'c',
        type: 'user-settings',
        token_login: { active: true, expiration_date: 0 },
      };

      sinon.stub(db.users, 'get').resolves(user);
      sinon.stub(db.medic, 'get').resolves(userSettings);
      sinon.stub(db.users, 'put').resolves();
      sinon.stub(db.medic, 'put').resolves();
      clock.tick(123);

      return service.deactivateTokenLogin('userID').then(() => {
        chai.expect(db.users.get.callCount).to.equal(1);
        chai.expect(db.users.get.args[0]).to.deep.equal(['userID']);
        chai.expect(db.medic.get.callCount).to.equal(1);
        chai.expect(db.medic.get.args[0]).to.deep.equal(['userID']);

        chai.expect(db.users.put.callCount).to.equal(1);
        chai.expect(db.users.put.args[0]).to.deep.equal([{
          name: 'sally',
          roles: ['a', 'b'],
          facilty_id: 'c',
          type: 'user',
          token_login: {
            active: false,
            login_date: 123,
            token: 'aaaa',
            expiration_date: 0,
          },
        }]);
        chai.expect(db.medic.put.callCount).to.equal(1);
        chai.expect(db.medic.put.args[0]).to.deep.equal([{
          name: 'sally',
          roles: ['a', 'b'],
          phone: 'c',
          type: 'user-settings',
          token_login: { active: false, expiration_date: 0, login_date: 123 },
        }]);
      });
    });
  });

  describe('manageTokenLogin', () => {
    it('should do nothing when undefined', () => {
      return service.manageTokenLogin({}, { user: { id: 'user' } }).then(actual => {
        chai.expect(actual).to.deep.equal({ user: { id: 'user' } });
      });
    });

    it('should do nothing when no config', () => {
      sinon.stub(config, 'get').withArgs('token_login').returns();
      return service.manageTokenLogin({ token_login: true }, { user: { id: 'user' } }).then(actual => {
        chai.expect(actual).to.deep.equal({ user: { id: 'user' } });
      });
    });

    describe('disabling token login', () => {
      it('should do nothing when user does not have token_login configured', () => {
        const response = { user: { id: 'userID' }, 'user-settings': { id: 'userID' } };
        sinon.stub(db.medic, 'get').withArgs('userID').resolves({ _id: 'userID' });
        sinon.stub(db.users, 'get').withArgs('userID').resolves({ _id: 'userID' });

        return service.manageTokenLogin({ token_login: false }, response).then(actual => {
          chai.expect(actual).to.deep.equal({ user: { id: 'userID' }, 'user-settings': { id: 'userID' } });
        });
      });

      it('should disable token login when requested', () => {
        const response = { user: { id: 'userID' }, 'user-settings': { id: 'userID' } };
        const responseCopy = Object.assign({}, response);
        sinon.stub(db.medic, 'get')
          .withArgs('userID').resolves({
            _id: 'userID',
            name: 'user',
            roles: ['a', 'b'],
            token_login: { active: true, expiration_date: 123 },
          })
          .withArgs('the_sms_doc').resolves({
            _id: 'the_sms_doc',
            type: 'sms_doc',
            tasks: [
              { state: 'pending', messages: [{ message: 'sms1' }] },
              { state: 'pending', messages: [{ message: 'sms2' }] },
            ]
          });
        sinon.stub(db.users, 'get').withArgs('userID').resolves({
          _id: 'userID',
          name: 'user',
          roles: ['a', 'b'],
          token_login: {
            active: true,
            expiration_date: 123,
            token: 'aaa',
            doc_id: 'the_sms_doc',
          }
        });

        sinon.stub(db.medic, 'put').resolves();
        sinon.stub(db.users, 'put').resolves();

        return service.manageTokenLogin({ token_login: false }, response).then(actual => {
          chai.expect(db.medic.put.callCount).to.equal(2);
          chai.expect(db.medic.put.args[0]).to.deep.equal([{
            _id: 'the_sms_doc',
            type: 'sms_doc',
            tasks: [
              {
                state: 'cleared',
                messages: [{ message: 'sms1' }],
                gateway_ref: undefined,
                state_details: undefined,
                state_history: [{ state: 'cleared', state_details: undefined, timestamp: new Date().toISOString() }],
              },
              {
                state: 'cleared',
                messages: [{ message: 'sms2' }],
                gateway_ref: undefined,
                state_details: undefined,
                state_history: [{ state: 'cleared', state_details: undefined, timestamp: new Date().toISOString() }],
              },
            ]
          }]);
          chai.expect(db.medic.put.args[1]).to.deep.equal([{
            _id: 'userID',
            name: 'user',
            roles: ['a', 'b'],
          }]);

          chai.expect(db.users.put.callCount).to.equal(1);
          chai.expect(db.users.put.args[0]).to.deep.equal([{
            _id: 'userID',
            name: 'user',
            roles: ['a', 'b'],
          }]);
          chai.expect(actual).to.deep.equal(responseCopy);
        });
      });

      it('should only clear pending messages', () => {
        const response = { user: { id: 'userID' }, 'user-settings': { id: 'userID' } };
        const responseCopy = Object.assign({}, response);
        sinon.stub(db.medic, 'get')
          .withArgs('userID').resolves({
            _id: 'userID',
            name: 'user',
            roles: ['a', 'b'],
            token_login: { active: true, expiration_date: 123 },
          })
          .withArgs('the_sms_doc').resolves({
            _id: 'the_sms_doc',
            type: 'sms_doc',
            tasks: [
              { state: 'sent', messages: [{ message: 'sms1' }] },
              { state: 'forwarded-by-gateway', messages: [{ message: 'sms2' }] },
            ]
          });
        sinon.stub(db.users, 'get').withArgs('userID').resolves({
          _id: 'userID',
          name: 'user',
          roles: ['a', 'b'],
          token_login: {
            active: true,
            expiration_date: 123,
            token: 'aaa',
            doc_id: 'the_sms_doc',
          }
        });

        sinon.stub(db.medic, 'put').resolves();
        sinon.stub(db.users, 'put').resolves();

        return service.manageTokenLogin({ token_login: false }, response).then(actual => {
          chai.expect(db.medic.put.callCount).to.equal(1);
          chai.expect(db.medic.put.args[0]).to.deep.equal([{
            _id: 'userID',
            name: 'user',
            roles: ['a', 'b'],
          }]);

          chai.expect(db.users.put.callCount).to.equal(1);
          chai.expect(db.users.put.args[0]).to.deep.equal([{
            _id: 'userID',
            name: 'user',
            roles: ['a', 'b'],
          }]);
          chai.expect(actual).to.deep.equal(responseCopy);
        });
      });

      it('should work when old sms message not found', () => {
        const response = { user: { id: 'userID' }, 'user-settings': { id: 'userID' } };
        sinon.stub(db.medic, 'get')
          .withArgs('userID').resolves({
            _id: 'userID',
            name: 'user',
            roles: ['a', 'b'],
            token_login: { active: true, expiration_date: 123 },
          })
          .withArgs('the_sms_doc').rejects({ status: 404 });

        sinon.stub(db.users, 'get').withArgs('userID').resolves({
          _id: 'userID',
          name: 'user',
          roles: ['a', 'b'],
          token_login: {
            active: true,
            expiration_date: 123,
            token: 'aaa',
            doc_id: 'the_sms_doc',
          }
        });

        sinon.stub(db.medic, 'put').resolves();
        sinon.stub(db.users, 'put').resolves();

        return service.manageTokenLogin({ token_login: false }, response).then(actual => {
          chai.expect(db.medic.put.callCount).to.equal(1);
          chai.expect(db.medic.put.args[0]).to.deep.equal([{
            _id: 'userID',
            name: 'user',
            roles: ['a', 'b'],
          }]);

          chai.expect(db.users.put.callCount).to.equal(1);
          chai.expect(db.users.put.args[0]).to.deep.equal([{
            _id: 'userID',
            name: 'user',
            roles: ['a', 'b'],
          }]);
          chai.expect(actual).to.deep.equal(response);
        });
      });
    });

    describe('enabling token login', () => {
      it('should generate password, token, create sms and update user docs', () => {
        sinon.stub(config, 'get')
          .withArgs('token_login').returns({ message: 'the sms', enabled: true })
          .withArgs('app_url').returns('http://host');
        const response = { user: { id: 'userID' }, 'user-settings': { id: 'userID' } };

        sinon.stub(db.medic, 'get').withArgs('userID').resolves({
          _id: 'userID',
          name: 'user',
          roles: ['a', 'b'],
          phone: '+40755232323',
        });

        sinon.stub(db.users, 'get').withArgs('userID').resolves({
          _id: 'userID',
          name: 'user',
          roles: ['a', 'b'],
        });

        sinon.stub(db.medic, 'put').resolves();
        sinon.stub(db.users, 'put').resolves();
        sinon.stub(db.medic, 'post').resolves({ id: 'someId' });

        clock.tick(2000);

        return service.manageTokenLogin({ token_login: true }, response).then(actual => {
          chai.expect(db.users.put.callCount).to.equal(1);
          chai.expect(db.users.put.args[0][0]).to.deep.include({
            _id: 'userID',
            name: 'user',
            roles: ['a', 'b'],
          });
          chai.expect(db.users.put.args[0][0].token_login).to.deep.include({
            active: true,
            expiration_date: 2000 + oneDayInMS,
            doc_id: 'someId',
          });
          const token = db.users.put.args[0][0].token_login.token;
          const encoded = Buffer.from('user').toString('base64');

          chai.expect(db.medic.post.callCount).to.equal(1);
          chai.expect(db.medic.post.args[0][0]).to.deep.nested.include({
            type: 'token_login_sms',
            reported_date: 2000,
            user: 'userID',
            'tasks[0].state': 'pending',
            'tasks[0].messages[0].to': '+40755232323',
            'tasks[0].messages[0].message': 'the sms',
            'tasks[1].messages[0].to': '+40755232323',
            'tasks[1].messages[0].message': `http://host/medic/login/token/${token}/${encoded}`,
          });
          chai.expect(db.medic.put.callCount).to.equal(1);
          chai.expect(db.medic.put.args[0]).to.deep.equal([{
            _id: 'userID',
            name: 'user',
            phone: '+40755232323',
            roles: ['a', 'b'],
            token_login: { active: true, expiration_date: 2000 + oneDayInMS },
          }]);

          chai.expect(actual).to.deep.equal({
            user: { id: 'userID' },
            'user-settings': { id: 'userID' },
            token_login: { id: 'someId', expiration_date: 2000 + oneDayInMS }
          });
        });
      });

      it('should clear previous token_login sms', () => {
        sinon.stub(config, 'get')
          .withArgs('token_login').returns({ message: 'the sms', enabled: true })
          .withArgs('app_url').returns('http://host');
        const response = { user: { id: 'my_user' }, 'user-settings': { id: 'my_user' } };

        sinon.stub(db.medic, 'get').withArgs('my_user').resolves({
          _id: 'my_user',
          name: 'user',
          roles: ['a', 'b'],
          phone: 'phone',
          token_login: { active: true, expiration_date: 2500 },
        });
        db.medic.get.withArgs('oldSms').resolves({
          _id: 'oldSms',
          type: 'token_login_sms',
          reported_date: 1000,
          user: 'my_user',
          tasks: [
            {
              state: 'pending',
              messages: [{ to: 'oldphone', message: 'old message' }],
            },
            {
              state: 'pending',
              messages: [{ to: 'oldphone', message: 'old link' }],
            },
          ],
        });

        sinon.stub(db.users, 'get').withArgs('my_user').resolves({
          _id: 'my_user',
          name: 'user',
          roles: ['a', 'b'],
          token_login: {
            active: true,
            doc_id: 'oldSms',
            expiration_date: 2500,
            token: 'oldtoken',
          },
        });

        sinon.stub(db.medic, 'put').resolves();
        sinon.stub(db.users, 'put').resolves();
        sinon.stub(db.medic, 'post').resolves({ id: 'someId' });

        clock.tick(2000);

        return service.manageTokenLogin({ token_login: true }, response).then(actual => {
          chai.expect(db.users.put.callCount).to.equal(1);
          chai.expect(db.users.put.args[0][0]).to.deep.include({
            _id: 'my_user',
            name: 'user',
            roles: ['a', 'b'],
          });
          chai.expect(db.users.put.args[0][0].token_login).to.deep.include({
            active: true,
            expiration_date: 2000 + oneDayInMS,
            doc_id: 'someId',
          });
          const token = db.users.put.args[0][0].token_login.token;
          const encoded = Buffer.from('user').toString('base64');

          chai.expect(token).not.to.equal('oldtoken');
          chai.expect(token.length).to.equal(50);

          chai.expect(db.medic.post.callCount).to.equal(1);
          chai.expect(db.medic.post.args[0][0]).to.deep.nested.include({
            type: 'token_login_sms',
            reported_date: 2000,
            user: 'my_user',
            'tasks[0].state': 'pending',
            'tasks[0].messages[0].to': 'phone',
            'tasks[0].messages[0].message': 'the sms',
            'tasks[1].messages[0].to': 'phone',
            'tasks[1].messages[0].message': `http://host/medic/login/token/${token}/${encoded}`,
          });

          chai.expect(db.medic.put.callCount).to.equal(2);
          chai.expect(db.medic.put.args[0]).to.deep.equal([{
            _id: 'oldSms',
            type: 'token_login_sms',
            reported_date: 1000,
            user: 'my_user',
            tasks: [
              {
                state: 'cleared',
                messages: [{ to: 'oldphone', message: 'old message' }],
                gateway_ref: undefined,
                state_details: undefined,
                state_history: [{ state: 'cleared', state_details: undefined, timestamp: new Date().toISOString() }]
              },
              {
                state: 'cleared',
                messages: [{ to: 'oldphone', message: 'old link' }],
                gateway_ref: undefined,
                state_details: undefined,
                state_history: [{ state: 'cleared', state_details: undefined, timestamp: new Date().toISOString() }]
              },
            ],
          }]);
          chai.expect(db.medic.put.args[1]).to.deep.equal([{
            _id: 'my_user',
            name: 'user',
            phone: 'phone',
            roles: ['a', 'b'],
            token_login: { active: true, expiration_date: 2000 + oneDayInMS },
          }]);

          chai.expect(actual).to.deep.equal({
            user: { id: 'my_user' },
            'user-settings': { id: 'my_user' },
            token_login: { id: 'someId', expiration_date: 2000 + oneDayInMS }
          });
        });
      });

      it('should only clear pending tasks in previous token_login sms', () => {
        sinon.stub(config, 'get')
          .withArgs('token_login').returns({ message: 'the sms', enabled: true })
          .withArgs('app_url').returns('http://host');
        const response = { user: { id: 'userID' }, 'user-settings': { id: 'userID' } };

        sinon.stub(db.medic, 'get').withArgs('userID').resolves({
          _id: 'userID',
          name: 'username',
          roles: ['a', 'b'],
          phone: 'newphone',
          token_login: { active: true, expiration_date: 2500 },
        });
        db.medic.get.withArgs('oldSms').resolves({
          _id: 'oldSms',
          type: 'token_login_sms',
          reported_date: 1000,
          user: 'userID',
          tasks: [
            {
              state: 'pending',
              messages: [{ to: 'oldphone', message: 'old message' }],
            },
            {
              state: 'sent',
              messages: [{ to: 'oldphone', message: 'old link' }],
            },
          ],
        });

        sinon.stub(db.users, 'get').withArgs('userID').resolves({
          _id: 'userID',
          name: 'username',
          roles: ['a', 'b'],
          token_login: {
            active: true,
            doc_id: 'oldSms',
            expiration_date: 2500,
            token: 'oldtoken',
          },
        });

        sinon.stub(db.medic, 'put').resolves();
        sinon.stub(db.users, 'put').resolves();
        sinon.stub(db.medic, 'post').resolves({ id: 'otherId' });

        clock.tick(5000);

        return service.manageTokenLogin({ token_login: true }, response).then(actual => {
          chai.expect(db.users.put.callCount).to.equal(1);
          chai.expect(db.users.put.args[0][0].token_login).to.deep.include({
            active: true,
            expiration_date: 5000 + oneDayInMS,
            doc_id: 'otherId',
          });
          const token = db.users.put.args[0][0].token_login.token;
          const encoded = Buffer.from('username').toString('base64');

          chai.expect(db.medic.post.callCount).to.equal(1);
          chai.expect(db.medic.post.args[0][0]).to.deep.nested.include({
            type: 'token_login_sms',
            reported_date: 5000,
            user: 'userID',
            'tasks[0].state': 'pending',
            'tasks[0].messages[0].to': 'newphone',
            'tasks[0].messages[0].message': 'the sms',
            'tasks[1].messages[0].to': 'newphone',
            'tasks[1].messages[0].message': `http://host/medic/login/token/${token}/${encoded}`,
          });

          chai.expect(db.medic.put.callCount).to.equal(2);
          chai.expect(db.medic.put.args[0]).to.deep.equal([{
            _id: 'oldSms',
            type: 'token_login_sms',
            reported_date: 1000,
            user: 'userID',
            tasks: [
              {
                state: 'cleared',
                messages: [{ to: 'oldphone', message: 'old message' }],
                gateway_ref: undefined,
                state_details: undefined,
                state_history: [{ state: 'cleared', state_details: undefined, timestamp: new Date().toISOString() }]
              },
              {
                state: 'sent',
                messages: [{ to: 'oldphone', message: 'old link' }],
              },
            ],
          }]);

          chai.expect(actual).to.deep.equal({
            user: { id: 'userID' },
            'user-settings': { id: 'userID' },
            token_login: { id: 'otherId', expiration_date: 5000 + oneDayInMS }
          });
        });
      });
    });
  });

});
