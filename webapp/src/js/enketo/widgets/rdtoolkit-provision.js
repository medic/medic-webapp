{
  'use strict';
  const Widget = require('enketo-core/src/js/Widget');
  const $ = require('jquery');
  const utils = require('../widget-utils');
  require('enketo-core/src/js/plugins');

  const pluginName = 'rdtoolkitprovisionwidget';

  /**
   * @constructor
   * @param {Element} element [description]
   * @param {(boolean|{touch: boolean, repeat: boolean})} options options
   */
  function Rdtoolkitprovisionwidget(element, options) {
    this.namespace = pluginName;
    Widget.call(this, element, options);
    this._init();
  }

  // Copy the prototype functions from the Widget super class
  Rdtoolkitprovisionwidget.prototype = Object.create(Widget.prototype);

  // Ensure the constructor is the new one
  Rdtoolkitprovisionwidget.prototype.constructor = Rdtoolkitprovisionwidget;

  Rdtoolkitprovisionwidget.prototype.destroy = function(element) {};  // eslint-disable-line no-unused-vars

  Rdtoolkitprovisionwidget.prototype._init = function() {
    const $widget = $(this.element);
    const rdToolkitService = window.CHTCore.RDToolkit;

    if (!rdToolkitService.enabled()) {
      window.CHTCore.Translate
        .get('rdtoolkit.disabled')
        .then(label => $widget.append(`<label>${label}</label>`));
      return;
    }

    displayActions($widget);

    $widget.on('click', '.btn.rdtoolkit-provision-test', () => provisionRDTest($widget, rdToolkitService));
  };

  function provisionRDTest($widget, rdToolkitService) {
    const dateFormat = 'LLL';
    const form = utils.getForm();
    // Using form's instance ID as RD Test ID
    const sessionId = form.instanceID.replace('uuid:', '');

    if (!sessionId) {
      return;
    }

    const patientId = utils.getFieldValue($widget, '.or-appearance-rdtoolkit-patient-id input');
    const patientName = utils.getFieldValue($widget, '.or-appearance-rdtoolkit-patient-name input');
    const rdtFilter = utils.getFieldValue($widget, '.or-appearance-rdtoolkit-filter input');
    const monitorApiURL = utils.getFieldValue($widget, '.or-appearance-rdtoolkit-api-url input');

    rdToolkitService
      .provisionRDTest(sessionId, patientId, patientName, rdtFilter, monitorApiURL)
      .then((response = {}) => {
        const timeStarted = utils.formatDate(response.timeStarted, dateFormat);
        const timeResolved = utils.formatDate(response.timeResolved, dateFormat);
        const state = response.state || '';

        updateFields($widget, state, timeStarted, timeResolved);
        hideActions($widget);
        displayPreview($widget, state, timeStarted, timeResolved);
      });
  }

  function displayActions($widget) {
    window.CHTCore.Translate
      .get('rdtoolkit-provision.title')
      .then(label => {
        $widget
          .append(`
            <div class="rdtoolkit-actions">
              <a class="btn btn-primary rdtoolkit-provision-test">${label}</a>
            </div>
          `)
          .append('<div class="rdtoolkit-preview"></div>');
      });
  }

  function hideActions($widget) {
    $widget
      .find('.rdtoolkit-actions')
      .hide();
  }

  function displayPreview($widget, state, timeStarted, timeResolved) {
    $widget
      .find('.rdtoolkit-preview')
      .append(`
        <div>
          ${window.CHTCore.Translate.instant('rdtoolkit-provision.preview.title')}
        </div>
        <br>
        <div>
          <span class="rdt-label">
            ${window.CHTCore.Translate.instant('rdtoolkit-provision.preview.state')}
          </span>
          <span class="rdt-value">${window.CHTCore.Translate.instant(state)}</span>
        </div>
        <div>
          <span class="rdt-label">
            ${window.CHTCore.Translate.instant('rdtoolkit-provision.preview.time_started')}
          </span>
          <span class="rdt-value">${timeStarted}</span>
        </div>
        <div>
          <span class="rdt-label">
            ${window.CHTCore.Translate.instant('rdtoolkit-provision.preview.time_resolved')}
          </span>
          <span class="rdt-value">${timeResolved}</span>
        </div>
        <br>
        <div>
          <span>
            ${window.CHTCore.Translate.instant('rdtoolkit-provision.preview.next_action')}
          </span>
        </div>
      `);
  }

  function updateFields($widget, state, timeStarted, timeResolved) {
    utils.setFieldValue($widget, '.or-appearance-rdtoolkit-state input', state);
    utils.setFieldValue($widget, '.or-appearance-rdtoolkit-time-started input', timeStarted);
    utils.setFieldValue($widget, '.or-appearance-rdtoolkit-time-resolved input', timeResolved);
  }

  $.fn[ pluginName ] = utils.getBindFunction(pluginName, Rdtoolkitprovisionwidget);

  module.exports = {
    'name': pluginName,
    'selector': '.or-appearance-rdtoolkit-provision',
  };
}
