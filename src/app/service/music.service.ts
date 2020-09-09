import {Injectable} from '@angular/core';
import {Observable, Subscriber} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private audio = new Audio();
  private isPlaying = false;
  private playObserver: Subscriber<boolean>;
  onPlayChangeEvent: Observable<boolean>;

  constructor() {
    this.onPlayChangeEvent = new Observable<boolean>((observer) => {
      this.playObserver = observer;
    });
  }

  changePlay(objectUrl: string): Observable<boolean> {
    this.audio.src = objectUrl;
    this.audio.load();
    this.isPlaying = false;
    this.audio.pause();
    return this.play();
  }

  play(): Observable<boolean> {
    return new Observable((observer) => {
      if (!this.isPlaying) {
        this.audio.play()
          .then(() => {
            this.changePlayStatus(true);
            observer.next(true);
          })
          .catch(error => {
            console.error(error);
            observer.next(false);
          })
          .finally(() => {
            observer.complete();
          });
      } else {
        observer.next(false);
        observer.complete();
      }
    });
  }

  pause(): Observable<boolean> {
    return new Observable((observer) => {
      if (this.isPlaying) {
        this.audio.pause();
        this.changePlayStatus(false);
        observer.next(true);
      } else {
        observer.next(false);
      }
      observer.complete();
    });
  }

  private changePlayStatus(status: boolean): void {
    this.isPlaying = status;
    this.playObserver.next(status);
  }

  isPlayingNow(): boolean {
    return this.isPlaying;
  }
}
