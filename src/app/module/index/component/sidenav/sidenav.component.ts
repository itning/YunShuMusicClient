import {ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {MusicPlaybackDurationChangeEvent} from '../../../../service/music-play.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidenavComponent implements OnInit {
  @ViewChild('musicCanvas', {static: true})
  musicCanvas: ElementRef<HTMLCanvasElement>;
  @Input()
  onTimeChangeEvent: Subject<MusicPlaybackDurationChangeEvent>;

  private canvasContext: CanvasRenderingContext2D;

  constructor() {
  }

  ngOnInit(): void {
    this.canvasContext = this.getCanvasContext();
    this.onTimeChangeEvent.subscribe((time) => {
      this.drawTimeRanges(time.totalTime, time.timeRanges);
      this.drawCurrentTime(time.nowTime, time.totalTime);
    });
  }

  private getCanvasContext(): CanvasRenderingContext2D {
    const context: CanvasRenderingContext2D = this.musicCanvas.nativeElement.getContext('2d');
    context.fillStyle = 'lightgray';
    context.fillRect(0, 0, this.musicCanvas.nativeElement.width, this.musicCanvas.nativeElement.height);
    return context;
  }

  private drawCurrentTime(currentTime: number, duration: number): void {
    const width = this.musicCanvas.nativeElement.width;
    const height = this.musicCanvas.nativeElement.height;
    const inc = width / duration;
    this.canvasContext.globalAlpha = 0.5;
    this.canvasContext.fillStyle = '#FFC75F';
    this.canvasContext.fillRect(0, 0, currentTime * inc, height);
  }

  private drawTimeRanges(duration: number, timeRanges: TimeRanges): void {
    const width = this.musicCanvas.nativeElement.width;
    const height = this.musicCanvas.nativeElement.height;
    const inc = width / duration;

    this.canvasContext.globalAlpha = 1;
    this.canvasContext.fillStyle = 'lightgray';
    this.canvasContext.fillRect(0, 0, this.musicCanvas.nativeElement.width, this.musicCanvas.nativeElement.height);
    this.canvasContext.fillStyle = '#ff4081';
    for (let i = 0; i < timeRanges.length; i++) {
      const startX = timeRanges.start(i) * inc;
      const endX = timeRanges.end(i) * inc;
      const widthX = endX - startX;
      this.canvasContext.fillRect(startX, 0, widthX, height);
    }
  }
}
