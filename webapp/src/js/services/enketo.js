var uuid = require('uuid/v4'),
    pojo2xml = require('pojo2xml'),
    xpathPath = require('../modules/xpath-element-path'),
    medicXpathExtensions = require('../enketo/medic-xpath-extensions');

/* globals EnketoForm */
angular.module('inboxServices').service('Enketo',
  function(
    $log,
    $ngRedux,
    $q,
    $timeout,
    $translate,
    $window,
    AddAttachment,
    ContactSummary,
    DB,
    EnketoPrepopulationData,
    EnketoTranslation,
    ExtractLineage,
    FileReader,
    GetReportContent,
    GlobalActions,
    Language,
    LineageModelGenerator,
    Search,
    SubmitFormBySms,
    TranslateFrom,
    UserContact,
    XmlForms,
    ZScore
  ) {
    'use strict';
    'ngInject';

    var objUrls = [];
    var FORM_ATTACHMENT_NAME = 'xml';

    var currentForm;
    this.getCurrentForm = function() {
      return currentForm;
    };

    const self = this;
    const mapDispatchToTarget = (dispatch) => {
      const globalActions = GlobalActions(dispatch);
      return {
        setLastChangedDoc: globalActions.setLastChangedDoc
      };
    };
    $ngRedux.connect(null, mapDispatchToTarget)(self);

    var init = function() {
      ZScore()
        .then(function(zscoreUtil) {
          medicXpathExtensions.init(zscoreUtil);
        })
        .catch(function(err) {
          $log.error('Error initialising zscore util', err);
        });
    };
    var inited = init();

    var replaceJavarosaMediaWithLoaders = function(id, form) {
      form.find('[data-media-src]').each(function() {
        var elem = $(this);
        var src = elem.attr('data-media-src');
        elem.css('visibility', 'hidden');
        elem.wrap('<div class="loader">');
        DB()
          .getAttachment(formDoc._id, src)
          .then(function(blob) {
            var objUrl = ($window.URL || $window.webkitURL).createObjectURL(blob);
            objUrls.push(objUrl);
            elem.attr('src', objUrl);
            elem.css('visibility', '');
            elem.unwrap();
          })
          .catch(function(err) {
            $log.error('Error fetching media file', formDoc._id, src, err);
          });
      });
    };

    var transformXml = function(form) {
      return $q.all([
        getFormAttachment(form._id, 'form.html'),
        getFormAttachment(form._id, 'model.xml')
      ])
      .then(function(results) {
        const $html = $(results[0]);
        const model = results[1];
        // TODO move this down to `translateXml`
        $html.find('[data-i18n]').each(function() {
          var $this = $(this);
          $this.text($translate.instant('enketo.' + $this.attr('data-i18n')));
        });
        var hasContactSummary = $(model).find('> instance[id="contact-summary"]').length === 1;
        return {
          html: $html,
          model: model,
          hasContactSummary: hasContactSummary
        };
      });
    };

    // TODO call this somewhere?!
    var translateXml = function(text, language, title) {
      var xml = $.parseXML(text);
      var $xml = $(xml);
      // set the user's language as default so it'll be used for itext translations
      $xml.find('model itext translation[lang="' + language + '"]').attr('default', '');
      // manually translate the title as enketo-core doesn't have any way to do this
      // https://github.com/enketo/enketo-core/issues/405
      if (title) {
        $xml.find('h\\:title,title').text(TranslateFrom(title));
      }
      return xml;
    };

    var getFormAttachment = function(id, name) {
      return DB().getAttachment(id, name).then(FileReader.utf8);
    };

    // var getFormXml = function(form, language) {
    //   return getFormAttachment(form._id).then(function(text) {
    //     return translateXml(text, language, form.title);
    //   });
    // };

    var withForm = function(id, language) {
      // if (!xmlCache[id]) {
      //   xmlCache[id] = {};
      // }
      // if (!xmlCache[id][language]) {
      //   xmlCache[id][language] = DB()
      //     .get(id)
      //     // .then(function(form) {
      //     //   return getFormXml(form, language);
      //     // })
      //     .then(transformXml);
      // }
      return DB().get(id)
        .then(transformXml)
        .then(function(form) {
          // clone form to avoid leaking of data between instances of a form
          return {
            html: form.html.clone(),
            model: form.model,
            hasContactSummary: form.hasContactSummary
          };
        });
    };

    var handleKeypressOnInputField = function(e) {
      // Here we capture both CR and TAB characters, and handle field-skipping
      if(!$window.medicmobile_android || (e.keyCode !== 9 && e.keyCode !== 13)) {
        return;
      }

      var $this = $(this);

      // stop the keypress from being handled elsewhere
      e.preventDefault();

      var $thisQuestion = $this.closest('.question');

      // If there's another question on the current page, focus on that
      if($thisQuestion.attr('role') !== 'page') {
        var $nextQuestion = $thisQuestion.find('~ .question:not(.disabled):not(.or-appearance-hidden), ~ .repeat-buttons button.repeat:not(:disabled)');
        if($nextQuestion.length) {
          if($nextQuestion[0].tagName !== 'LABEL') {
            // The next question is something complicated, so we can't just
            // focus on it.  Next best thing is to blur the current selection
            // so the on-screen keyboard closes.
            $this.trigger('blur');
          } else {
            // Delay focussing on the next field, so that keybaord close and
            // open events both register.  This should mean that the on-screen
            // keyboard is maintained between fields.
            $timeout(function() {
              $nextQuestion.first().trigger('focus');
            }, 10);
          }
          return;
        }
      }

      // Trigger the change listener on the current field to update the enketo
      // model
      $this.trigger('change');

      var enketoContainer = $thisQuestion.closest('.enketo');

      // If there's no question on the current page, try to go to change page,
      // or submit the form.
      var next = enketoContainer.find('.btn.next-page:enabled:not(.disabled)');
      if(next.length) {
        next.trigger('click');
      } else {
        angular.element(enketoContainer.find('.btn.submit')).triggerHandler('click');
      }
    };

    var getLineage = function(contact) {
      return LineageModelGenerator.contact(contact._id)
        .then(function(model) {
          return model.lineage;
        })
        .catch(function(err) {
          if (err.code === 404) {
            $log.warn(`Enketo failed to get lineage of contact '${contact._id}' because document does not exist`, err);
            return [];
          }

          throw err;
        });
    };

    var getContactReports = function(contact) {
      var subjectIds = [ contact._id ];
      var shortCode = contact.patient_id || contact.place_id;
      if (shortCode) {
        subjectIds.push(shortCode);
      }
      return Search('reports', { subjectIds: subjectIds }, { include_docs: true });
    };

    var getContactSummary = function(doc, instanceData) {
      var contact = instanceData && instanceData.contact;
      if (!doc.hasContactSummary || !contact) {
        return $q.resolve();
      }
      return $q.all([
        getContactReports(contact),
        getLineage(contact)
      ])
        .then(function(results) {
          return ContactSummary(contact, results[0], results[1]);
        })
        .then(function(summary) {
          if (!summary) {
            return;
          }

          try {
            return {
              id: 'contact-summary',
              xmlStr: pojo2xml({ context: summary.context })
            };
          } catch (e) {
            $log.error('Error while converting app_summary.contact_summary.context to xml.');
            throw new Error('contact_summary context is misconfigured');
          }
        });
    };

    var getEnketoOptions = function(doc, instanceData) {
      return $q.all([
        EnketoPrepopulationData(doc.model, instanceData),
        getContactSummary(doc, instanceData)
      ])
        .then(function(results) {
          var instanceStr = results[0];
          var contactSummary = results[1];
          var options = {
            modelStr: doc.model,
            instanceStr: instanceStr
          };
          if (contactSummary) {
            options.external = [ contactSummary ];
          }
          return options;
        });
    };

    var renderFromXmls = function(doc, selector, instanceData) {
      var wrapper = $(selector);
      wrapper.find('.form-footer')
             .addClass('end')
             .find('.previous-page,.next-page')
             .addClass('disabled');

      var formContainer = wrapper.find('.container').first();
      formContainer.html(doc.html);

      return getEnketoOptions(doc, instanceData).then(function(options) {
        currentForm = new EnketoForm(wrapper.find('form').first(), options);
        var loadErrors = currentForm.init();
        if (loadErrors && loadErrors.length) {
          return $q.reject(new Error(JSON.stringify(loadErrors)));
        }
        wrapper.show();

        wrapper.find('input').on('keydown', handleKeypressOnInputField);

        // handle page turning using browser history
        $window.history.replaceState({ enketo_page_number: 0 }, '');
        overrideNavigationButtons(currentForm, wrapper);
        addPopStateHandler(currentForm, wrapper);
        forceRecalculate(currentForm);

        return currentForm;
      });
    };

    var overrideNavigationButtons = function(form, $wrapper) {
      $wrapper.find('.btn.next-page')
        .off('.pagemode')
        .on('click.pagemode', function() {
          form.pages.next()
            .then(function(newPageIndex) {
              if(typeof newPageIndex === 'number') {
                $window.history.pushState({ enketo_page_number: newPageIndex }, '');
              }
              forceRecalculate(form);
            });
          return false;
        });

      $wrapper.find('.btn.previous-page')
        .off('.pagemode')
        .on('click.pagemode', function() {
          $window.history.back();
          forceRecalculate(form);
          return false;
        });
    };

    var addPopStateHandler = function(form, $wrapper) {
      $($window).on('popstate.enketo-pagemode', function(event) {
        if(event.originalEvent &&
            event.originalEvent.state &&
            typeof event.originalEvent.state.enketo_page_number === 'number') {
          var targetPage = event.originalEvent.state.enketo_page_number;

          if ($wrapper.find('.container').not(':empty')) {
            var pages = form.pages;
            pages.flipTo(pages.getAllActive()[targetPage], targetPage);
          }
        }
      });
    };

    var registerEditedListener = function(selector, listener) {
      if (listener) {
        $(selector).on('edited.enketo', listener);
      }
    };

    var registerValuechangeListener = function(selector, listener) {
      if (listener) {
        $(selector).on('valuechange.enketo', listener);
      }
    };
                        
    var renderForm = function(selector, form, instanceData, editedListener, valuechangeListener) {
      return Language()
        .then(language => withForm(form, language))
        .then(function(doc) {
          replaceJavarosaMediaWithLoaders(form, doc.html);
          return renderFromXmls(doc, selector, instanceData);
        })
        .then(function(form) {
          registerEditedListener(selector, editedListener);
          registerValuechangeListener(selector, valuechangeListener);
          return form;
        });
    };

    this.render = function(selector, form, instanceData, editedListener, valuechangeListener) {
      return $q.all([inited, getUserContact()]).then(function() {
        return renderForm(selector, form, instanceData, editedListener, valuechangeListener);
      });
    };

    this.renderContactForm = renderForm;

    var xmlToDocs = function(doc, record) {

      function mapOrAssignId(e, id) {
        if (!id) {
          var $id = $(e).children('_id');
          if ($id.length) {
            id = $id.text();
          }
          if (!id) {
            id = uuid();
          }
        }
        e._couchId = id;
      }

      function getId(xpath) {
        return recordDoc
          .evaluate(xpath, recordDoc, null, XPathResult.ANY_TYPE, null)
          .iterateNext()
          ._couchId;
      }

      // Chrome 30 doesn't support $xml.outerHTML: #3880
      function getOuterHTML(xml) {
        if (xml.outerHTML) {
          return xml.outerHTML;
        }
        return $('<temproot>').append($(xml).clone()).html();
      }

      var recordDoc = $.parseXML(record);
      var $record = $($(recordDoc).children()[0]);
      mapOrAssignId($record[0], doc._id || uuid());

      $record.find('[db-doc]')
        .filter(function() {
          return $(this).attr('db-doc').toLowerCase() === 'true';
        })
        .each(function() {
          mapOrAssignId(this);
        });

      $record.find('[db-doc-ref]').each(function() {
        var $ref = $(this);
        var refId = getId($ref.attr('db-doc-ref'));
        $ref.text(refId);
      });

      var docsToStore = $record.find('[db-doc=true]').map(function() {
        var docToStore = EnketoTranslation.reportRecordToJs(getOuterHTML(this));
        docToStore._id = getId(xpathPath(this));
        docToStore.reported_date = Date.now();
        return docToStore;
      }).get();

      record = getOuterHTML($record[0]);

      AddAttachment(doc, GetReportContent.REPORT_ATTACHMENT_NAME, record, 'application/xml');
      doc._id = getId('/*');
      doc.hidden_fields = EnketoTranslation.getHiddenFieldList(record);

      var attach = function(elem, file, type, alreadyEncoded, xpath) {
        xpath = xpath || xpathPath(elem);
        // replace instance root element node name with form internal ID
        var filename = 'user-file' +
                       (xpath.startsWith('/' + doc.form) ? xpath : xpath.replace(/^\/[^/]+/, '/' + doc.form));
        AddAttachment(doc, filename, file, type, alreadyEncoded);
      };

      $record.find('[type=file]').each(function() {
        var xpath = xpathPath(this);
        var $input = $('input[type=file][name="' + xpath + '"]');
        var file = $input[0].files[0];
        if (file) {
          attach(this, file, file.type, false, xpath);
        }
      });

      $record.find('[type=binary]').each(function() {
        var file = $(this).text();
        if (file) {
          attach(this, file, 'image/png', true);
        }
      });

      docsToStore.unshift(doc);

      return XmlForms.get(doc.form)
        .then(getFormAttachment)
        .then(function(form) {
          doc.fields = EnketoTranslation.reportRecordToJs(record, form);
          return docsToStore;
        });
    };

    var saveDocs = function(docs) {
      return DB().bulkDocs(docs)
        .then(function(results) {
          results.forEach(function(result) {
            if (result.error) {
              $log.error('Error saving report', result);
              throw new Error('Error saving report');
            }
            docs.forEach(function(doc) {
              if (doc._id === result.id) {
                doc._rev = result.rev;
              }
            });
          });
          return docs;
        });
    };

    var update = function(docId) {
      // update an existing doc.  For convenience, get the latest version
      // and then modify the content.  This will avoid most concurrent
      // edits, but is not ideal.
      return DB().get(docId).then(function(doc) {
        // previously XML was stored in the content property
        // TODO delete this and other "legacy" code support commited against
        //      the same git commit at some point in the future?
        delete doc.content;
        return doc;
      });
    };

    var getUserContact = function() {
      return UserContact().then(function(contact) {
        if (!contact) {
          var err = new Error('Your user does not have an associated contact, or does not have access to the associated contact. Talk to your administrator to correct this.');
          err.translationKey = 'error.loading.form.no_contact';
          throw err;
        }
        return contact;
      });
    };

    var create = function(formInternalId) {
      return getUserContact().then(function(contact) {
        return {
          form: formInternalId,
          type: 'data_record',
          content_type: 'xml',
          reported_date: Date.now(),
          contact: ExtractLineage(contact),
          from: contact && contact.phone
        };
      });
    };

    var forceRecalculate = function(form) {
      // Work-around for stale jr:choice-name() references in labels.  ref #3870
      form.calc.update();

      // Force forms to update jr:itext references in output fields that contain
      // calculated values.  ref #4111
      form.output.update();
    };

    this.save = function(formInternalId, form, geolocation, docId) {
      return $q.resolve(form.validate())
        .then(function(valid) {
          if (!valid) {
            throw new Error('Form is invalid');
          }

          $('form.or').trigger('beforesave');

          if (docId) {
            return update(docId);
          }
          return create(formInternalId);
        })
        .then(function(doc) {
          return xmlToDocs(doc, form.getDataStr({ irrelevant: false }));
        })
        .then(function(docs) {
          if (geolocation) {
            // Only update geolocation if one is provided.  Otherwise, maintain
            // whatever is already set in the docs.
            docs.forEach(function(doc) {
              doc.geolocation = geolocation;
            });
          }
          self.setLastChangedDoc(docs[0]);
          return docs;
        })
        .then(saveDocs)
        .then(function(docs) {
          // submit by sms _after_ saveDocs so that the main doc's ID is available
          SubmitFormBySms(docs[0]);
          return docs;
        });
    };

    this.unload = function(form) {
      $($window).off('.enketo-pagemode');
      if (form) {
        form.resetView();
      }
      // unload blobs
      objUrls.forEach(function(url) {
        ($window.URL || $window.webkitURL).revokeObjectURL(url);
      });
      objUrls.length = 0;
    };

    // TODO remove
    this.clearXmlCache = function() {
      // xmlCache = {};
    };
  }
);
