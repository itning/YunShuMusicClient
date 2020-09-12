import {Injectable} from '@angular/core';
import {PlayMode} from './music-list.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly VOLUME = 'volume';
  private readonly PLAY_MODE = 'play_mode';

  constructor() {
  }

  getDefaultVolume(): number {
    const defaultVolumeString: string | null = window.localStorage.getItem(this.VOLUME);
    if (!defaultVolumeString) {
      this.setDefaultVolume(1);
      return 1;
    }
    const defaultVolume = Number(defaultVolumeString);
    if (isNaN(defaultVolume)) {
      this.setDefaultVolume(1);
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
      volume = defaultVolume;
    }
    window.localStorage.setItem(this.VOLUME, volume.toString());
  }

  setDefaultMusicPlayMode(mode: PlayMode): void {
    window.localStorage.setItem(this.PLAY_MODE, mode);
  }

  getDefaultMusicPlayMode(): PlayMode {
    const mode = window.localStorage.getItem(this.PLAY_MODE);
    switch (mode) {
      case PlayMode.LOOP:
      case PlayMode.REPEAT:
      case PlayMode.RANDOM:
        return mode;
      default:
        window.localStorage.removeItem(this.PLAY_MODE);
        return PlayMode.LOOP;
    }
  }
}
