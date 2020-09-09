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
  private readonly audio = new Audio();
  /**
   * 播放状态改变事件发射器
   */
  private playObserver: Subscriber<boolean>;
  /**
   * 时间状态改变事件发射器
   */
  private timeObserver: Subscriber<MusicPlaybackDurationChangeEvent>;
  /**
   * 播放状态改变事件
   */
  onPlayChangeEvent: Observable<boolean>;
  /**
   * 时间状态改变事件
   */
  onTimeChangeEvent: Observable<MusicPlaybackDurationChangeEvent>;

  constructor() {
    this.onPlayChangeEvent = new Observable<boolean>((observer) => {
      this.playObserver = observer;
    });
    this.onTimeChangeEvent = new Observable<MusicPlaybackDurationChangeEvent>((observer) => {
      this.timeObserver = observer;
    });

    this.audio.ondurationchange = this.musicChangeEventHandlers;
    this.audio.ontimeupdate = this.musicChangeEventHandlers;

    this.audio.onended = () => this.playObserver.next(false);
  }

  private musicChangeEventHandlers = () => {
    this.timeObserver.next(new MusicPlaybackDurationChangeEvent(this.audio.currentTime, this.audio.duration));
    // tslint:disable-next-line
  };

  start(objectUrl: string): Observable<boolean> {
    this.audio.src = objectUrl;
    this.audio.load();
    this.audio.pause();
    return this.play();
  }

  play(): Observable<boolean> {
    return new Observable((observer) => {
      if (!this.isPlayingNow()) {
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
      if (this.isPlayingNow()) {
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
    this.playObserver.next(status);
  }

  isPlayingNow(): boolean {
    return !this.audio.paused;
  }
}

/**
 * 音乐时长改变事件
 */
export class MusicPlaybackDurationChangeEvent {
  readonly nowTime: number;
  readonly totalTime: number;

  constructor(nowTime: number, totalTime: number) {
    this.nowTime = nowTime;
    this.totalTime = totalTime;
  }
}
