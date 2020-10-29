import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';

import { HeaderLogoPipe, PartnerImagePipe, ResourceIconPipe } from '@mm-pipes/resource-icon.pipe';
import {
  AgePipe,
  AutoreplyPipe,
  DateOfDeathPipe,
  DayMonthPipe,
  FullDatePipe,
  RelativeDatePipe,
  RelativeDayPipe,
  SimpleDatePipe,
  SimpleDateTimePipe,
  StatePipe,
  TaskDueDatePipe,
  WeeksPregnantPipe
} from '@mm-pipes/date.pipe'
import {
  ClinicPipe, LineagePipe, SummaryPipe, TitlePipe
} from '@mm-pipes/message.pipe';
import { FormIconNamePipe } from '@mm-pipes/form-icon-name.pipe';
import { FormIconPipe } from '@mm-pipes/form-icon.pipe';
import { SafeHtmlPipe } from '@mm-pipes/safe-html.pipe';
import { PhonePipe } from '@mm-pipes/phone.pipe';
import { TranslateFromPipe } from '@mm-pipes/translate-from.pipe';

@Injectable({
  providedIn: 'root'
})
export class PipesService {
  pipesMap = new Map();

  constructor(
    private headerLogoPipe:HeaderLogoPipe,
    private partnerImagePipe: PartnerImagePipe,
    private resourceIconPipe:ResourceIconPipe,
    private agePipe:AgePipe,
    private autoreplyPipe:AutoreplyPipe,
    private dateOfDeathPipe:DateOfDeathPipe,
    private dayMonthPipe:DayMonthPipe,
    private fullDatePipe:FullDatePipe,
    private relativeDatePipe:RelativeDatePipe,
    private relativeDayPipe:RelativeDayPipe,
    private simpleDatePipe:SimpleDatePipe,
    private simpleDateTimePipe:SimpleDateTimePipe,
    private statePipe:StatePipe,
    private taskDueDatePipe:TaskDueDatePipe,
    private weeksPregnantPipe:WeeksPregnantPipe,
    private clinicPipe:ClinicPipe,
    private lineagePipe:LineagePipe,
    private summaryPipe:SummaryPipe,
    private titlePipe:TitlePipe,
    private formIconNamePipe:FormIconNamePipe,
    private formIconPipe:FormIconPipe,
    private safeHtmlPipe:SafeHtmlPipe,
    private phonePipe:PhonePipe,
    private translateFromPipe:TranslateFromPipe,
    private datePipe:DatePipe,
  ) {
    this.pipesMap.set('resourceIcon', this.resourceIconPipe);
    this.pipesMap.set('headerLogo', this.headerLogoPipe);
    this.pipesMap.set('partnerImage', this.partnerImagePipe);
    this.pipesMap.set('autoreply', this.autoreplyPipe);
    this.pipesMap.set('state', this.statePipe);
    this.pipesMap.set('dateOfDeath', this.dateOfDeathPipe);
    this.pipesMap.set('age', this.agePipe);
    this.pipesMap.set('dayMonth', this.dayMonthPipe);
    this.pipesMap.set('relativeDate', this.relativeDatePipe);
    this.pipesMap.set('relativeDay', this.relativeDayPipe);
    this.pipesMap.set('taskDueDate', this.taskDueDatePipe);
    this.pipesMap.set('simpleDate', this.simpleDatePipe);
    this.pipesMap.set('simpleDateTime', this.simpleDateTimePipe);
    this.pipesMap.set('fullDate', this.fullDatePipe);
    this.pipesMap.set('weeksPregnant', this.weeksPregnantPipe);
    this.pipesMap.set('summary', this.summaryPipe);
    this.pipesMap.set('title', this.titlePipe);
    this.pipesMap.set('clinic', this.clinicPipe);
    this.pipesMap.set('lineage', this.lineagePipe);
    this.pipesMap.set('formIconName', this.formIconNamePipe);
    this.pipesMap.set('formIcon', this.formIconPipe);
    this.pipesMap.set('phone', this.phonePipe);
    this.pipesMap.set('safeHtml', this.safeHtmlPipe);
    this.pipesMap.set('translateFrom', this.translateFromPipe);

    this.pipesMap.set('date', this.datePipe);
  }

  transform(pipe, value, ...params) {
    if (!pipe || this.pipesMap.has(pipe)) {
      return;
    }

    return this.pipesMap.get(pipe).transform(value, ...params);
  }

  getPipeNameVsIsPureMap() {
    const pureMap = new Map();
    this.pipesMap.forEach((value, key) => pureMap.set(key, true));
    return pureMap;
  }

  meta(pipeName) {
    if (this.pipesMap.has(pipeName)) {
      return { pure: true };
    }
  }

  getInstance(pipeName) {
    return this.pipesMap.get(pipeName);
  }

}
