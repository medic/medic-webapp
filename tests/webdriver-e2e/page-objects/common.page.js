const hamburgerMenu = () => $('#header-dropdown-link');
const logoutButton =  () => $('.fa-power-off');
const modalBody = () => $('div.modal-body');
const yesButton = () => $('a.btn.submit.btn-danger');
const tabLink = (name) => $(`a#${name}-tab`);

const navigateToLogoutModal = async () => {
  await (await hamburgerMenu()).click();
  await (await logoutButton()).click();
  await (await modalBody()).waitForDisplayed();
};

const logout = async () => {
  await navigateToLogoutModal();
  await (await yesButton()).click();
};

const getLogoutMessage = async () => {
  await navigateToLogoutModal();
  return (await modalBody()).getText();
};

const navigateToTab = async (name) => {
  await (await tabLink(name)).click();
};

module.exports = {
  logout,
  getLogoutMessage,
  navigateToTab
};
