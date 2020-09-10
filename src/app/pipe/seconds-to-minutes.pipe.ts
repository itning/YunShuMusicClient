import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'secondsToMinutes'
})
export class SecondsToMinutesPipe implements PipeTransform {

  transform(seconds: number): string {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secondsRemaining = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secondsRemaining}`;
  }

}
