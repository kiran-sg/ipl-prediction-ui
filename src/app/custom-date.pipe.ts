import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe extends DatePipe implements PipeTransform {

  override transform(value: any, ...args: any[]): any {
    return super.transform(value, 'EEE, dd MMMM yyyy, hh:mm a') + ' IST';
  }

}
