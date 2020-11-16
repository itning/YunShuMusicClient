import {Injectable} from '@angular/core';
import {FileService} from './file.service';

@Injectable({
  providedIn: 'root'
})
export class LyricService {

  private lyricArray: LrcResult[] = [];

  private offset = 0;

  constructor(private fileService: FileService) {
  }

  private lyricType(line: string): LrcResult | null {
    const hourSplitIndex: number = line.indexOf(':');
    const type: string = line.substring(1, hourSplitIndex).trim();
    switch (type) {
      case 'ti': {
        // 歌词(歌曲)的标题
        return new LrcResult(0, line.substring(hourSplitIndex + 1, line.indexOf(']')));
      }
      case 'ar': {
        // 演出者-歌手
        return new LrcResult(0, line.substring(hourSplitIndex + 1, line.indexOf(']')));
      }
      case 'al': {
        // 本歌所在的唱片集
        return new LrcResult(0, line.substring(hourSplitIndex + 1, line.indexOf(']')));
      }
      case 'au': {
        // 歌詞作者-作曲家
        return new LrcResult(0, line.substring(hourSplitIndex + 1, line.indexOf(']')));
      }
      case 're': {
        // 创建此LRC文件的播放器或编辑器
        return new LrcResult(0, line.substring(hourSplitIndex + 1, line.indexOf(']')));
      }
      case 've': {
        // 程序的版本
        return new LrcResult(0, line.substring(hourSplitIndex + 1, line.indexOf(']')));
      }
      case 'by': {
        // 此LRC文件的创建者
        return new LrcResult(0, line.substring(hourSplitIndex + 1, line.indexOf(']')));
      }
      case 'offset': {
        // +/- 以毫秒为单位加快或延後歌詞的播放
        this.offset = Number(line.substring(hourSplitIndex + 1, line.indexOf(']')));
        return null;
      }
      default: {
        // 可能是时间
        const metaInfoEndIndex: number = line.indexOf(']');
        const minuteSplitIndex: number = line.indexOf('.');
        const text: string = line.substring(metaInfoEndIndex + 1);
        const time: string = line.substring(1, metaInfoEndIndex);

        const minute: number = Number(time.substring(0, hourSplitIndex - 1));
        const second: number = Number(time.substring(hourSplitIndex, minuteSplitIndex - 1));
        const hundredthsOfASecond: number = Number(time.substring(minuteSplitIndex));

        const totalSeconds: number = minute * 60 + second + hundredthsOfASecond / 100;

        return new LrcResult(totalSeconds - 0.5 + this.offset, text);
      }
    }
  }

  getLyric(now: number): string {
    for (let index = 0; index < this.lyricArray.length; index++) {
      if (this.lyricArray[index].seconds <= now) {
        if (this.lyricArray.length === index + 1) {
          // 到末尾了
          return this.lyricArray[index].text;
        }
        if (this.lyricArray[index + 1].seconds >= now) {
          return this.lyricArray[index].text;
        }
      }
    }
    return '';
  }

  init(lyricId: string): void {
    this.offset = 0;
    this.fileService.getLyricFile(lyricId)
      .subscribe(file => {
        const line = file.split('\n');
        line.forEach(item => {
          const lrcResult = this.lyricType(item);
          if (lrcResult) {
            this.lyricArray.push(lrcResult);
          }
        });
      });
  }
}

class LrcResult {
  seconds: number;
  text: string;

  constructor(seconds: number, text: string) {
    this.seconds = seconds;
    this.text = text;
  }
}
