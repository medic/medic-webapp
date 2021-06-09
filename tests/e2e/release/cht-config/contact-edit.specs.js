const utils = require('../../../utils');
const commonElements = require('../../../page-objects/common/common.po.js');
const contactPage = require('../../../page-objects/contacts/contacts.po.js');
const helper = require('../../../helper.js');
const uuid = require('uuid');
const districtId = uuid.v4();
const districtName = uuid.v4();
const healthCenterId = uuid.v4();
const healtchCenterName = uuid.v4();
const personName = uuid.v4();
const personId = uuid.v4();

describe('Editing contacts with the CHT config', () => {
  beforeAll(() => utils.saveDocs(expectedDocs));
  afterAll(() => utils.revertDb());

  const expectedDocs = [
    {
      _id: districtId,
      name: districtName,
      type: 'district_hospital',
      reported_date: Date.now()
    },
    {
      _id: healthCenterId,
      parent: {
        _id: districtId
      },
      name: healtchCenterName,
      type: 'health_center',
      reported_date: Date.now(),
      contact: {
        _id: personId,
        parent: {
          _id: healthCenterId,
          parent: { _id: districtId }
        }
      }
    },
    {
      type: 'person',
      _id: personId,
      name: personName,
      date_of_birth: '2000-02-01',
      sex: 'female',
      role: 'patient',
      parent: {
        _id: healthCenterId,
        parent: { _id: districtId }
      }
    }
  ];

  it('should remove the primary contact from the health center when the contact is deleted', async () => {
    await commonElements.goToPeople();
    await contactPage.selectLHSRowByText(healtchCenterName);
    await contactPage.deleteContactByName(expectedDocs[2].name);
    await commonElements.confirmDelete();
    await contactPage.selectLHSRowByText(healtchCenterName);
    expect(await contactPage.peopleRows.count()).toBe(0);
  });

  it('should change primary contact', async () => {
    const contacts = [
      {
        _id: 'three_district',
        type: 'district_hospital',
        name: 'Maria\'s district',
        contact: { _id: 'one_person' },
        reported_at: new Date().getTime(),
      },
      {
        _id: 'three_person',
        type: 'person',
        name: 'Maria',
        parent: { _id: 'three_district' },
        reported_at: new Date().getTime(),
      },

      {
        _id: 'four_person',
        type: 'person',
        name: 'Marta',
        parent: { _id: 'three_district' },
        reported_at: new Date().getTime(),
      },
    ];

    await utils.saveDocs(contacts);

    await commonElements.goToPeople();
    await contactPage.selectLHSRowByText('Maria\'s district');
    await helper.waitUntilReadyNative(contactPage.center());
    expect(await contactPage.center().getText()).toBe('Maria\'s district');
    // change contact
    await utils.request({
      path: '/api/v1/places/three_district',
      method: 'POST',
      body: {
        contact: 'four_person'
      }
    });

    await browser.refresh();
    await helper.waitUntilReadyNative(contactPage.center());
    expect(await contactPage.cardFieldText('contact')).toBe('Marta');
  });
});
