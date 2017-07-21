const utils = require('../../utils'),
  auth = require('../../auth')(),
  helper = require('../../helper'),
  path = require('path'),
  fs = require('fs');

const FILE = path.join(__dirname, '..', '..', 'resources/xml/new-pregnancy.xml');
const userSettingsDocId = `org.couchdb.user:${auth.user}`;
const contactId = '3b3d50d275280d2568cd36281d00348b';
const docs = [
  {
    _id: 'form:pregnancy',
    internalId: 'P',
    title: 'New Pregnancy',
    type: 'form',
    _attachments: {
      xml: {
        content_type: 'application/octet-stream',
        data: Buffer.from(fs.readFileSync(FILE, 'utf8')).toString('base64')
      }
    }
  }];

const datePicker = $('[placeholder="yyyy-mm-dd"]');
module.exports = {
  configureForm: (done) => {

    utils.seedTestData(done, contactId, docs);
  },
  teardown: done => {
    utils.afterEach()
      .then(() => utils.getDoc(userSettingsDocId))
      .then((user) => {
        user.contact_id = undefined;
        return utils.saveDoc(user);
      })
      .then(done, done);
  },

  nextPage: () => {
    const nextButton = element(by.css('button.btn.btn-primary.next-page'));
    helper.waitElementToBeClickable(nextButton);
    nextButton.click();
  },

  goBack: () => {
    element(by.css('.btn btn-default previous-page')).click();
  },

  submit: () => {
    element(by.css('.btn submit btn-primary')).click();
  },
  
  selectPatientName: (name) => {
    browser.driver.navigate().refresh();
    helper.waitElementToBeClickable(element(by.css('button.btn.btn-primary.next-page')));
    element(by.css('.selection')).click();
    const search = element(by.css('.select2-search__field'));
    search.click();
    search.sendKeys(name);
    helper.waitElementToBeVisisble(element(by.css('.name')));
    element(by.css('.name')).click();
  },

  selectLMPYesButton: () => {
    element(by.css('[value="calendar"]')).click();
  },

  selectLMPNoButton: () => {
    element(by.css('[value="approx"]')).click();
  },

  setLastCycleDate: (lmpDate) => {
    datePicker.sendKeys(lmpDate);
    datePicker.sendKeys(protractor.Key.ENTER);
    datePicker.getAttribute('value').then(value => {
      expect(value).toBe(lmpDate);
    });
  },

  select2Months: () => {
    element(by.css('[value="61"]')).click();
  },

  reset: () => {
    element(by.css('.icon.icon-refresh')).click();
  },
  getEstimatedDeliveryDate: () => {
    return element(by.css('[data-value=" /pregnancy/group_lmp/g_edd "]')).getText();
  },

  checkFirstPregnancyCheckBox: () => {
    element(by.css('[value="r1"]')).click();
  },
  checkMoreThanFourChildrenCheckBox: () => {
    element(by.css('[value="r2"]')).click();
  },
  checkMastBabyYearBeforeCheckBox: () => {
    element(by.css('[value="r3"]')).click();
  },
  checkPreviousMiscarriagesCheckBox: () => {
    element(by.css('[value="r4"]')).click();
  },

  checkConditionsCheckBox: () => {
    element(by.css('[value="r5"]')).click();
  },
  checkHIVPisotiveCheckBox: () => {
    element(by.css('[value="r6"]')).click();
  },
  selectAllBoxes: () => {
    element.all(by.css('[type="checkbox"]')).each(item => {
      item.click();
    });
  },

  checkPainCheckBox: () => {
    element(by.css('[value="d1"]')).click();
  },

  checkBleedingCheckBox: () => {
    element(by.css('[value="d2"]')).click();
  },
  checkNauseaCheckBox: () => {
    element(by.css('[value="d3"]')).click();
  },
  checkFeverCheckBox: () => {
    element(by.css('[value="d4"]')).click();
  },

  checkHeadacheCheckBox: () => {
    element(by.css('[value="d5"]')).click();
  },
  checkWeightGainCheckBox: () => {
    element(by.css('[value="d6"]')).click();
  },
  checkLessMovementCheckBox: () => {
    element(by.css('[value="d7"]')).click();
  },

  checkBloodCheckBox: () => {
    element(by.css('[value="d8"]')).click();
  },
  checkDiarrheaCheckBox: () => {
    element(by.css('[value="d9"]')).click();
  },

   getNoteToCHW: () => {
    return element(by.css('textarea')).getAttribute('value');
  },

  getId: () => {
    return element(by.css('[data-value=" /pregnancy/group_review/r_patient_id "]'));
  },

  getFollowUpMessage: () => {
    return element(by.css('[data-value=" /pregnancy/group_note/g_chw_sms "]'));
  },

  isRiskFactorDisplayed: (riskFactor) => {
    return helper.isTextDisplayed(riskFactor);
  },
  
  isDangerSignDisplayed: (dangerSign) => {
    return helper.isTextDisplayed(dangerSign);
  }
};
