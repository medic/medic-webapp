import { Component, EventEmitter, OnDestroy, Input, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Selectors } from '../../../selectors';
import { combineLatest, Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { GlobalActions } from '../../../actions/global';
import { AbstractFilter } from '@mm-components/filters/abstract-filter';

@Component({
  selector: 'mm-freetext-filter',
  templateUrl: './freetext-filter.component.html'
})
export class FreetextFilterComponent implements OnDestroy, AbstractFilter {
  private subscription: Subscription = new Subscription();
  private globalActions;

  inputText;
  private inputTextChanged: Subject<string> = new Subject<string>();

  currentTab;

  @Input() disabled;
  @Output() search: EventEmitter<any> = new EventEmitter();

  constructor(
    private store: Store,
  ) {
    const subscription = combineLatest(
      this.store.pipe(select(Selectors.getCurrentTab)),
    ).subscribe(([
      currentTab,
    ]) => {
      this.currentTab = currentTab;
    });
    this.subscription.add(subscription);
    this.globalActions = new GlobalActions(store);

    this
      .inputTextChanged
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.applyFilter();
      });
  }

  onFieldChange(inputText) {
    this.inputTextChanged.next(inputText);
  }

  applyFilter() {
    this.globalActions.setFilter({ search: this.inputText });
    this.search.emit();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  clear() {
    this.inputText = '';
  }
}
