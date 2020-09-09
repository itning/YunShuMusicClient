import {Injectable} from '@angular/core';
import {Observable, Subscriber} from 'rxjs';

/**
 * 音乐服务
 * 我只关心播放状态和播放什么
 */
@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private audio = new Audio();
  /**
   * 当前正在播放吗
   */
  private isPlaying = false;
  /**
   * 播放状态改变事件发射器
   */
  private playObserver: Subscriber<boolean>;
  /**
   * 播放状态改变事件
   */
  onPlayChangeEvent: Observable<boolean>;

  constructor() {
    this.onPlayChangeEvent = new Observable<boolean>((observer) => {
      this.playObserver = observer;
    });
  }

  start(objectUrl: string): Observable<boolean> {
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
