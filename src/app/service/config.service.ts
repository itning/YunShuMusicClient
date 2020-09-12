import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly VOLUME = 'volume';

  constructor() {
  }

  getDefaultVolume(): number {
    const defaultVolumeString: string | null = window.localStorage.getItem(this.VOLUME);
    const defaultVolume = Number(defaultVolumeString);
    if (isNaN(defaultVolume)) {
      return 1;
    } else {
      if (defaultVolume > 1) {
        return 1;
      } else if (defaultVolume < 0) {
        return 0;
      } else {
        return defaultVolume;
      }
    }
  }

  setDefaultVolume(defaultVolume: number): void {
    let volume: number;
    if (defaultVolume > 1) {
      volume = 1;
    } else if (defaultVolume < 0) {
      volume = 0;
    } else {
      volume = defaultVolume ? defaultVolume : 1;
    }
    window.localStorage.setItem(this.VOLUME, volume.toString());
  }
}
