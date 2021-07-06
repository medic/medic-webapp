{
  'use strict';
  const Widget = require('enketo-core/src/js/Widget');
  const $ = require('jquery');
  const utils = require('../widget-utils');
  require('enketo-core/src/js/plugins');

  const pluginName = 'rdtoolkitcapturewidget';

  /**
   * @constructor
   * @param {Element} element [description]
   * @param {(boolean|{touch: boolean, repeat: boolean})} options options
   */
  function Rdtoolkitcapturewidget(element, options) {
    this.namespace = pluginName;
    Widget.call(this, element, options);
    this._init();
  }

  // Copy the prototype functions from the Widget super class
  Rdtoolkitcapturewidget.prototype = Object.create(Widget.prototype);

  // Ensure the constructor is the new one
  Rdtoolkitcapturewidget.prototype.constructor = Rdtoolkitcapturewidget;

  Rdtoolkitcapturewidget.prototype.destroy = function(element) {};  // eslint-disable-line no-unused-vars

  Rdtoolkitcapturewidget.prototype._init = function() {
    const $widget = $(this.element);
    const rdToolkitService = window.CHTCore.RDToolkit;

    if (!rdToolkitService.enabled()) {
      window.CHTCore.Translate
        .get('rdtoolkit.disabled')
        .then(label => $widget.append(`<label>${label}</label>`));
      return;
    }

    displayActions($widget);

    $widget.on('click', '.btn.rdtoolkit-capture-test', () => captureRDTestResult($widget, rdToolkitService));
  };

  function captureRDTestResult($widget, rdToolkitService) {
    const dateFormat = 'LLL';
    const sessionId = utils.getFieldValue($widget, '.or-appearance-rdtoolkit-session-id input');

    rdToolkitService
      .captureRDTest(sessionId)
      .then((response = {}) => {
        const capturedTest = {
          sessionId: response.sessionId || '',
          state: response.state || '',
          timeStarted: utils.formatDate(response.timeStarted, dateFormat),
          timeResolved: utils.formatDate(response.timeResolved, dateFormat),
          timeRead: utils.formatDate(response.timeRead, dateFormat),
          results: response.results || [],
          resultsDescription: getFormattedResult(response.results),
          image: response.croppedImage
        };

        updateFields($widget, capturedTest);
        hideActions($widget);
        displayPreview($widget, capturedTest);
      });
  }

  function displayActions($widget) {
    window.CHTCore.Translate
      .get('rdtoolkit-capture.title')
      .then(label => {
        $widget
          .append(`
            <div class="rdtoolkit-actions">
              <a class="btn btn-primary rdtoolkit-capture-test">${label}</a>
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

  function displayPreview($widget, capturedTest) {
    const imageTag = `<img src="data:image/png;base64,${capturedTest.image}">`;

    $widget
      .find('.rdtoolkit-preview')
      .append(`
        <div>
          ${window.CHTCore.Translate.instant('rdtoolkit-capture.preview.title')}
        </div>
        <br>
        <div>
          <span class="rdt-label">
            ${window.CHTCore.Translate.instant('rdtoolkit-capture.preview.results')} 
          </span>
          <span class="rdt-value">${capturedTest.resultsDescription}</span>
        </div>
        <div>
          <span class="rdt-label">
            ${window.CHTCore.Translate.instant('rdtoolkit-capture.preview.time_read')} 
          </span>
          <span class="rdt-value">${capturedTest.timeRead}</span>
        </div>
        <div>
          <span class="rdt-label">
            ${window.CHTCore.Translate.instant('rdtoolkit-capture.preview.image')} 
          </span>
          ${capturedTest.image ? imageTag : ''}
        </div>
        <br>
        <div>
           ${window.CHTCore.Translate.instant('rdtoolkit-capture.preview.next_action')} 
        </div>
      `);
  }

  function updateFields($widget, capturedTest) {
    utils.setFieldValue($widget, '.or-appearance-rdtoolkit-time-read input', capturedTest.timeRead);
    utils.setFieldValue($widget, '.or-appearance-rdtoolkit-state input', capturedTest.state);
    utils.setFieldValue($widget, '.or-appearance-rdtoolkit-time-started input', capturedTest.timeStarted);
    utils.setFieldValue($widget, '.or-appearance-rdtoolkit-image input', capturedTest.image);
    utils.setFieldValue($widget, '.or-appearance-rdtoolkit-time-resolved input', capturedTest.timeResolved);
    utils.setFieldValue(
      $widget,
      '.or-appearance-rdtoolkit-results input',
      JSON.stringify(capturedTest.results)
    );
    utils.setFieldValue(
      $widget,
      '.or-appearance-rdtoolkit-results-description input',
      capturedTest.resultsDescription
    );
  }

  function getFormattedResult(results) {
    if (!results) {
      return '';
    }

    const formattedResults = results.map(item => {
      const test = window.CHTCore.Translate.instant(item.test);
      const result = window.CHTCore.Translate.instant(item.result);

      return `${test}: ${result}`;
    });

    return formattedResults.join(', ');
  }

  $.fn[pluginName] = utils.getBindFunction(pluginName, Rdtoolkitcapturewidget);

  module.exports = {
    'name': pluginName,
    'selector': '.or-appearance-rdtoolkit-capture',
  };

}
