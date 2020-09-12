import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatSliderChange} from '@angular/material/slider';
import {PlayMode} from '../../../../service/music-list.service';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControlComponent implements OnInit {
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

  constructor() {
  }

  ngOnInit(): void {
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
