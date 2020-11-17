import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MatSliderChange} from '@angular/material/slider';
import {PlayMode} from '../../../../service/music-list.service';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControlComponent implements OnInit {
  @ViewChild('musicControlInfo', {static: true})
  musicControlInfo: ElementRef<HTMLDivElement>;
  musicControlInfoDiv: HTMLDivElement;
  @Input()
  nowPlaying: boolean;
  @Input()
  nowTime: number;
  @Input()
  totalTime: number;
  @Input()
  info: string;
  @Input()
  nowPlayMode = PlayMode.LOOP;
  @Output()
  timeChange: EventEmitter<number> = new EventEmitter<number>();
  @Output()
  playStatusChange: EventEmitter<PlayEvent> = new EventEmitter<PlayEvent>();
  @Output()
  playModeChange: EventEmitter<PlayMode> = new EventEmitter<PlayMode>();

  sliderStep = 1;

  private intervalNumber = 0;
  private speed = 100;
  private lastScrollLeft = -1;
  private isRightDirection = true;

  constructor() {
  }

  ngOnInit(): void {
    this.musicControlInfoDiv = this.musicControlInfo.nativeElement;
    this.intervalNumber = setInterval(
      this.scrollHorizontally(this.musicControlInfoDiv, this.isRightDirection, this.lastScrollLeft), this.speed);
  }

  private scrollHorizontally(musicControlInfoDiv: HTMLDivElement, isRightDirection: boolean, lastScrollLeft: number): () => void {
    return () => {
      if (lastScrollLeft === musicControlInfoDiv.scrollLeft || !isRightDirection) {
        isRightDirection = false;
        lastScrollLeft = -1;
        musicControlInfoDiv.scrollLeft--;
        if (musicControlInfoDiv.scrollLeft <= 0) {
          isRightDirection = true;
        }
      } else {
        lastScrollLeft = musicControlInfoDiv.scrollLeft;
        isRightDirection = true;
        musicControlInfoDiv.scrollLeft++;
      }
    };
  }

  stopInterval(): void {
    clearInterval(this.intervalNumber);
  }

  startInterval(): void {
    this.intervalNumber = setInterval(
      this.scrollHorizontally(this.musicControlInfoDiv, this.isRightDirection, this.lastScrollLeft), this.speed);
  }

  onTimeChange(change: MatSliderChange): void {
    this.timeChange.emit(change.value);
  }

  onPlayChange(event: PlayEvent = null): void {
    if (event === null) {
      if (this.nowPlaying) {
        event = PlayEvent.PAUSE;
      } else {
        event = PlayEvent.PLAY;
      }
    }
    this.playStatusChange.emit(event);
  }

  changePlayMode(): void {
    switch (this.nowPlayMode) {
      case PlayMode.LOOP:
        this.nowPlayMode = PlayMode.REPEAT;
        break;
      case PlayMode.REPEAT:
        this.nowPlayMode = PlayMode.RANDOM;
        break;
      case PlayMode.RANDOM:
        this.nowPlayMode = PlayMode.LOOP;
        break;
    }
    this.playModeChange.emit(this.nowPlayMode);
  }

  getNowPlayModeDesc(): string {
    switch (this.nowPlayMode) {
      case PlayMode.LOOP:
        return '列表循环';
      case PlayMode.REPEAT:
        return '单曲循环';
      case PlayMode.RANDOM:
        return '随机';
    }
  }

}

export enum PlayEvent {
  PLAY,
  PAUSE,
  NEXT,
  PREVIOUS
}
