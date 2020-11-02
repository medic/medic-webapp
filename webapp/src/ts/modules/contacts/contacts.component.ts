import { Component, OnInit, OnDestroy } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash-es';

import { GlobalActions } from '@mm-actions/global';
import { ChangesService } from '@mm-services/changes.service';
import { ServicesActions } from '@mm-actions/services';
import { ContactsActions } from '@mm-actions/contacts';
import { UserSettingsService } from '@mm-services/user-settings.service';
import { GetDataRecordsService } from '@mm-services/get-data-records.service';
import { SessionService } from '@mm-services/session.service';
import { AuthService } from '@mm-services/auth.service';
import { SettingsService } from '@mm-services/settings.service';
import { UHCSettingsService } from '@mm-services/uhc-settings.service';
import { SimprintsService } from '@mm-services/simprints.service';
import { Selectors } from '@mm-selectors/index';
import { isMobile } from '@mm-providers/responsive.provider';
import { SearchService } from '@mm-services/search.service';
import { ContactTypesService } from '@mm-services/contact-types.service';
import { ScrollLoaderProvider } from '@mm-providers/scroll-loader.provider';

const PAGE_SIZE = 50;

@Component({
  templateUrl: './contacts.component.html'
})
export class ContactsComponent implements OnInit, OnDestroy{
  private subscription: Subscription = new Subscription();
  private globalActions;
  private contactsActions;
  private servicesActions;
  private listContains;

  contactsList;
  loading = false;
  error;
  appending;
  filtered = false;
  hasContacts = true;
  filters:any = {};
  defaultFilters:any = {};
  moreItems;
  usersHomePlace;
  contactTypes;
  isAdmin;
  childPlaces;
  lastVisitedDateExtras;
  visitCountSettings;
  defaultSortDirection = 'alpha';
  sortDirection = this.defaultSortDirection;
  additionalListItem = false;
  simprintsEnabled;
  enketoEdited;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private changesService: ChangesService,
    private translateService: TranslateService,
    private searchService: SearchService,
    private contactTypesService: ContactTypesService,
    private userSettingsService:UserSettingsService,
    private getDataRecordsService: GetDataRecordsService,
    private sessionService: SessionService,
    private authService: AuthService,
    private settingsService: SettingsService,
    private UHCSettings: UHCSettingsService,
    private simprintsService: SimprintsService,
    private scrollLoaderProvider: ScrollLoaderProvider,
  ) {
    this.globalActions = new GlobalActions(store);
    this.contactsActions = new ContactsActions(store);
    this.servicesActions = new ServicesActions(store);
  }

  ngOnInit() {
    const reduxSubscription = combineLatest(
      this.store.select(Selectors.getContactsList),
      this.store.select(Selectors.getIsAdmin),
      this.store.select(Selectors.getFilters),
      this.store.select(Selectors.contactListContains)
    ).subscribe(([contactsList, isAdmin, filters, listContains]) => {
      this.contactsList = contactsList;
      this.isAdmin = isAdmin;
      this.filters = filters;
      this.listContains = listContains;
    });
    this.subscription.add(reduxSubscription);

    const changesSubscription = this.changesService.subscribe({
      key: 'contacts-list',
      callback: (change) => {
        if (change.deleted) {
          // TODO: implement deletion logic
        }
        const withIds =
          this.isSortedByLastVisited() &&
          !!this.isRelevantVisitReport(change.doc) &&
          !change.deleted;
        return this.query({
          limit: this.contactsList.length,
          withIds,
          silent: true,
        });
      },
      filter: (change) => {
        return (
          this.contactTypes.includes(change.doc) ||
          (change.deleted && this.listContains(change.id)) ||
          this.isRelevantVisitReport(change.doc) ||
          this.listContains(change.id)
        );
      },
    });
    this.subscription.add(changesSubscription);
    this.simprintsEnabled = this.simprintsService.enabled();

    Promise.all([
      this.getUserHomePlaceSummary(),
      this.canViewLastVisitedDate(),
      this.settingsService.get(),
      this.contactTypesService.getAll()
    ])
    .then(([homePlaceSummary, viewLastVisitedDate, settings, contactTypes]) => {
      this.usersHomePlace = homePlaceSummary;
      this.lastVisitedDateExtras = viewLastVisitedDate;
      this.visitCountSettings = this.UHCSettings.getVisitCountSettings(settings);
      if(this.lastVisitedDateExtras && this.UHCSettings.getContactsDefaultSort(settings)) {
        this.sortDirection = this.defaultSortDirection = this.UHCSettings.getContactsDefaultSort(settings);
      }
      this.contactTypes = contactTypes;
      return this.getChildren()
    })
    .then((children) => {
      this.childPlaces = children;
      this.defaultFilters = {
        types: {
          selected: this.childPlaces.map(type => type.id)
        }
      };
      this.search();
    })
    .catch((err) => {
      this.error = true;
      this.loading = false;
      this.appending = false;
      console.error('Error searching for contacts', err);
    });
      
  }

  ngOnDestroy() {
    this.contactsActions.updateContactsList([]);
    this.subscription.unsubscribe();
  }

  private isRelevantVisitReport (doc) {
    const isRelevantDelete = doc && doc._deleted && this.isSortedByLastVisited();
    return (
      doc &&
      this.lastVisitedDateExtras &&
      doc.type === 'data_record' &&
      doc.form &&
      doc.fields &&
      doc.fields.visited_contact_uuid &&
      (this.listContains(doc.fields.visited_contact_uuid) ||
        isRelevantDelete)
    );
  };

  private getUserHomePlaceSummary() {
    return this.userSettingsService.get()
      .then((userSettings:any) => {
        if (userSettings.facility_id) {
          return this.getDataRecordsService.get(userSettings.facility_id, {include_docs: false});
        }
      })
      .then((summary) => {
        if (summary) {
          summary.home = true;
        }
        return summary;
      });
  };

  private canViewLastVisitedDate() {
    if (this.sessionService.isDbAdmin()) {
    // disable UHC for DB admins
      return Promise.resolve(false);
    }
    return this.authService.has('can_view_last_visited_date');
  }

  private formatContacts(contacts) {
    return contacts.map(contact => {
      const typeId = contact.contact_type || contact.type;
      const type = this.contactTypes.find(type => type.id === typeId);
      contact.route = 'contacts';
      contact.icon = type && type.icon;
      contact.heading = contact.name;
      contact.valid = true;
      contact.summary = null;
      contact.primary = contact.home;
      contact.simprintsTier = contact.simprints && contact.simprints.tierNumber;
      contact.dod = contact.date_of_death;
      contact.muted = contact.muted;
      if (type && type.count_visits && Number.isInteger(contact.lastVisitedDate)) {
        if (contact.lastVisitedDate === 0) {
          contact.overdue = true;
          contact.summary = this.translateService.instant('contact.last.visited.unknown');
        } else {
          const now = new Date().getTime();
          const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
          contact.overdue = contact.lastVisitedDate <= oneMonthAgo;
          // TODO: fix this
          // contact.summary = this.translateService.instant(
          //   'contact.last.visited.date',
          //   { date: relativeDayFilter(contact.lastVisitedDate, true) }
          // );
        }

        const visitCount = Math.min(contact.visitCount, 99) + (contact.visitCount > 99 ? '+' : '');
        contact.visits = {
          count: this.translateService.instant('contacts.visits.count', { count: visitCount }),
          summary: this.translateService.instant(
            'contacts.visits.visits',
            { VISITS: contact.visitCount }
          )
        };

        if (contact.visitCountGoal) {
          if (!contact.visitCount) {
            contact.visits.status = 'pending';
          } else if (contact.visitCount < contact.visitCountGoal) {
            contact.visits.status = 'started';
          } else {
            contact.visits.status = 'done';
          }
        }
      }

      return contact
    });
  }

  private getChildren() {
    let p;
    if (this.usersHomePlace) {
      // backwards compatibility with pre-flexible hierarchy users
      const homeType = this.usersHomePlace.contact_type || this.usersHomePlace.type;
      p = this.contactTypesService.getChildren(homeType);
    } else if (this.isAdmin) {
      p = this.contactTypesService.getChildren();
    } else {
      return Promise.resolve([]);
    }
    return p.then(children => children.filter(child => !child.person));
  };

  private initScroll() {
    this.scrollLoaderProvider.init(() => {
      if (!this.loading && this.moreItems) {
        this.query({
          paginating: true,
        });
      }
    });
  };

  private isSortedByLastVisited() {
    return this.sortDirection === 'last_visited_date';
  }

  private query(opts) {
    const options = Object.assign({ limit: PAGE_SIZE }, opts);
    if (options.limit < PAGE_SIZE) {
      options.limit = PAGE_SIZE;
    }

    if (!options.silent) {
      this.error = false;
      this.loading = true;
    }
    if (options.paginating) {
      this.appending = true;
      options.skip = this.contactsList.length;
    } else if (!options.silent) {
      this.contactsActions.resetContactsList();
      this.additionalListItem = false;
    }

    if (this.additionalListItem) {
      if (options.skip) {
        options.skip -= 1;
      } else {
        options.limit -= 1;
      }
    }

    let searchFilters = this.defaultFilters;
    if (this.filters.search || this.filters.simprintsIdentities) {
      searchFilters = this.filters;
    }

    const extensions:any = {};
    if (this.lastVisitedDateExtras) {
      extensions.displayLastVisitedDate = true;
      extensions.visitCountSettings = this.visitCountSettings;
    }
    if (this.isSortedByLastVisited()) {
      extensions.sortByLastVisitedDate = true;
    }

    let docIds;
      if (options.withIds) {
        docIds = this.contactsList.map((item) => {
          return item._id;
        });
      }

    return this.searchService
      .search('contacts', searchFilters, options, extensions, docIds)
      .then((updatedContacts) => {
        updatedContacts = this.formatContacts(updatedContacts);

        // If you have a home place make sure its at the top
        if(this.usersHomePlace) {
          const homeIndex = _.findIndex(updatedContacts, (contact:any) => {
            return contact._id === this.usersHomePlace._id;
          })
          this.additionalListItem = 
            this.filters.search &&
            this.filters.simprintsIdentities &&
            (this.additionalListItem || !this.appending) &&
            homeIndex === -1;

          if(!this.appending) {
            if (homeIndex !== -1) {
              // move it to the top
              updatedContacts.splice(homeIndex, 1);
              updatedContacts.unshift(this.usersHomePlace);
            } else if (
              !this.filters.search &&
              !this.filters.simprintsIdentities
            ) {
              
              updatedContacts.unshift(this.usersHomePlace);
            }
            if (this.filters.simprintsIdentities) {
              updatedContacts.forEach((contact) => {
                const identity = this.filters.simprintsIdentities.find(
                  function(identity) {
                    return identity.id === contact.simprints_id;
                  }
                );
                contact.simprints = identity || {
                  confidence: 0,
                  tierNumber: 5,
                };
              });
            }
          }
        }
        
        this.contactsActions.updateContactsList(updatedContacts);

        this.moreItems = updatedContacts.length >= options.limit;
        this.hasContacts = !!updatedContacts.length;
        this.loading = false;
        this.appending = false;
        this.error = false;
        this.initScroll();
      })
      .catch(err => {
        this.error = true;
        this.loading = false;
        console.error('Error loading messages', err);
      });
  }

  search() {
    if(this.filters.search && !this.enketoEdited) {
      // TODO: migrate line below
      // $state.go('contacts.detail', { id: null }, { notify: false });
      this.contactsActions.clearSelection();
    }

    this.loading = true;
    if (this.filters.search || this.filters.simprintsIdentities) {
      this.filtered = true;
      this.contactsActions.updateContactsList([]);
      return this.query({});
    } else {
      this.filtered = false;
      return this.query({});
    }
  }

  sort(sortDirection?) {
    this.sortDirection = sortDirection ? sortDirection : this.defaultSortDirection;
    this.contactsActions.updateContactsList([]);
    this.query({});
  }

  simprintsIdentify() {
    this.loading = true;
    this.simprintsService.identify().then((identities) => {
      this.filters.simprintsIdentities = identities;
      this.search();
    });
  };

  listTrackBy(index, contact) {
    return contact._id + contact._rev;
  }
}
