import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'secondsToMinutes'
})
export class SecondsToMinutesPipe implements PipeTransform {

  transform(seconds: number): string {
    const minutes = (seconds / 60).toFixed(0).padStart(2, '0');
    const secondsRemaining = (seconds % 60).toFixed(0).padStart(2, '0');
    return `${minutes}:${secondsRemaining}`;
  }

}
