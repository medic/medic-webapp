const loginPage = require('../page-objects/login.page');
const commonPage = require('../page-objects/common.page');
const auth = require('../../auth')();
const contactPage = require('../page-objects/contacts.po');

describe('Create new lineage structure', () => {

  beforeEach(async () => {
    await loginPage.cookieLogin(auth.username, auth.password);
  });

  it('Create new district', async () => {
    await commonPage.navigateToTab('contacts');
    await contactPage.addNewDistrict('ANewDistrict');
    await commonPage.navigateToTab('contacts');
    const contact = await (await contactPage.topContact()).getText();
    expect(contact).toEqual('ANewDistrict');
  });
});
