const genericForm = require('../page-objects/forms/generic-form.po');
const utils = require('../../utils');

const searchBox = () => $('#freetext');
const searchButton = () => $('#search');
const refreshButton = () => $('.fa fa-undo');
const newDistrictButton = () => $('a[href="#/contacts/add/district_hospital?from=list"]');
const newPlaceName = () => $('[name="/data/init/custom_place_name"]');
const districtHospitalName = () => $('[name="/data/district_hospital/name"]');
const newPrimaryContactName = () => $('[name="/data/contact/name"]');
const personNotes = () => $('[name="/data/contact/notes"]');
const newPrimaryContactButton = () => $('[name="/data/init/create_new_person"][value="new_person"]');
const manualDistrictHospitalName = () => $('[name="/data/district_hospital/is_name_generated"][value="false"]');
const contactName = () => $('contacts-content .body.meta .heading-content h2');
const dateOfBirthField = () => $('[placeholder="yyyy-mm-dd"]');
const contactSexField = () => $('[data-name="/data/contact/sex"][value="female"]');
const editContact = () => $('.detail-actions:not(.ng-hide)').$('.fa fa-pencil');
const newActions = () => $('.detail-actions:not(.ng-hide)').$('.dropdown-toggle');
const contactsTab = () => $('#contacts-tab');
const personName = () => $('[name="/data/person/name"]');
const personSexField = () => $('[data-name="/data/person/sex"][value="female"]');
const topContact = () => $('#contacts-list > ul > li:nth-child(1) > a > div.content > div > h4 > span');

module.exports = {
  contactsList: () => $('#contacts-list'),
  contactContent: () => module.exports.contactsList().$('.content'),
  cardFieldLabel:  (label) => $(`.cell.${label} label`),
  searchBox,
  searchButton,
  contactsTab,
  contactName,
  editContact,
  newActions,
  topContact,
  formById: (id) => $(`form:${id}`),
  center: () => $('.card h2'),
  name: () =>  $('.children h4 span'),
  selectLHSRowByText: async (text) => {
    await module.exports.search(text);
    await module.exports.clickRowByName(text);
    await module.exports.contactLoaded();
    expect(await contactName.getText()).toBe(text);
    return contactName.getText();
  },

  loadContact: async (uuid) => {
    await browser.get(utils.getBaseUrl() + 'contacts/' + uuid);
    await module.exports.contactLoaded();
  },

  addNewDistrict: async (districtName) => {
    await (await newDistrictButton()).click();
    await (await newPrimaryContactButton()).click();
    await (await newPrimaryContactName()).setValue('Bede');
    await (await personNotes()).setValue('Main CHW');
    await (await dateOfBirthField()).setValue('2000-01-01');
    await (await contactSexField()).click();
    await genericForm.nextPageNative();
    await (await manualDistrictHospitalName()).click();
    await (await newPlaceName()).setValue(districtName);
    return (await genericForm.submitButton()).click();
  },

  editDistrict: async (districtName, editedName) => {
    await module.exports.selectLHSRowByText(districtName);
    await (await districtHospitalName()).clear();
    await await(districtHospitalName()).setValue(editedName);
    // trigger blur to trigger Enketo validation
    await $('[name="/data/district_hospital/notes"]').click();
    await (await genericForm.submitButton()).click();
  },

  addHealthCenter: async (name = 'Mavuvu Clinic') => {
    await newPrimaryContactButton.click();
    await newPrimaryContactName.setValue('Gareth');
    await dateOfBirthField.setValue('2000-01-01');
    await contactSexField.click();
    await genericForm.nextPageNative();
    const writeNameHC = () => $('[name="/data/health_center/is_name_generated"][value="false"]');
    await writeNameHC.click();
    await newPlaceName.setValue(name);
    await $('[name="/data/health_center/external_id"]').setValue('1234457');
    await $('[name="/data/health_center/notes"]').setValue('some notes');
    return genericForm.submitButton.click();
  },

  addClinic: async (name = 'Clinic 1') => {
    await newPrimaryContactButton.click();
    await newPrimaryContactName.setValue('Todd');
    await dateOfBirthField.setValue('2000-01-01');
    await contactSexField.click();
    await genericForm.nextPageNative();
    const writeNameHC = () => $('[name="/data/clinic/is_name_generated"][value="false"]');
    await writeNameHC.click();
    await newPlaceName.setValue(name);
    await $('[name="/data/clinic/external_id"]').setValue('1234457');
    await $('[name="/data/clinic/notes"]').setValue('some notes');
    await genericForm.submitButton.click();
  },

  addPerson: async (name, dob = '2000-01-01') => {
    await personName.setValue(name);
    await dateOfBirthField.setValue(dob);
    await personName.click(); // blur the datepicker field so the sex field is visible
    await personSexField.click();
    await $('[name="/data/person/notes"]').setValue('some notes');
    await genericForm.submitButton.click();
  },

  editPerson: async (name, editedName) => {
    await module.exports.selectLHSRowByText(name);
    await genericForm.nextPageNative();
    await personName.clear();
    await personName.setValue(editedName);
    await dateOfBirthField.setValue('2000-01-01');
    await personName.click(); // blur the datepicker field so the sex field is visible
    await genericForm.submitButton.click();
  },

  refresh: async () => {
    await (await refreshButton()).click();
  },

  search: async (query) => {
    await (await searchBox()).clearValue();
    await (await searchBox()).setValue(query);
    await (await searchButton()).click();
  }
};
