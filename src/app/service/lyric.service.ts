import {Injectable} from '@angular/core';
import {FileService} from './file.service';
import {Observable, Subscriber} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LyricService {
  /**
   * 歌词数组，每一项都是一行歌词
   * @private
   */
  private lyricArray: LrcResult[] = [];
  /**
   * 歌词元数据信息
   * @private
   */
  private metaInfoArray: LrcResult[] = [];
  /**
   * 歌词的偏移量（ +/- 以毫秒为单位加快或延後歌詞的播放）
   * @private
   */
  private offset = 0;
  /**
   * 播放状态改变事件发射器
   */
  private lyricObserver: Subscriber<string>;
  /**
   * 播放状态改变事件
   */
  onLyricChangeEvent: Observable<string>;

  constructor(private fileService: FileService) {
    this.onLyricChangeEvent = new Observable<string>((observer) => {
      this.lyricObserver = observer;
    });
  }

  /**
   * 按行解析歌词文件
   * @param line 每一行
   * @private
   */
  private lyricType(line: string): LrcResult | null {
    const hourSplitIndex: number = line.indexOf(':');
    const type: string = line.substring(1, hourSplitIndex).trim();
    switch (type) {
      case 'ti': {
        // 歌词(歌曲)的标题
        return new LrcResult(LrcType.META_INFO, 0, line.substring(hourSplitIndex + 1, line.indexOf(']')));
      }
      case 'ar': {
        // 演出者-歌手
        return new LrcResult(LrcType.META_INFO, 0, line.substring(hourSplitIndex + 1, line.indexOf(']')));
      }
      case 'al': {
        // 本歌所在的唱片集
        return new LrcResult(LrcType.META_INFO, 0, line.substring(hourSplitIndex + 1, line.indexOf(']')));
      }
      case 'au': {
        // 歌詞作者-作曲家
        return new LrcResult(LrcType.META_INFO, 0, line.substring(hourSplitIndex + 1, line.indexOf(']')));
      }
      case 're': {
        // 创建此LRC文件的播放器或编辑器
        return new LrcResult(LrcType.META_INFO, 0, line.substring(hourSplitIndex + 1, line.indexOf(']')));
      }
      case 've': {
        // 程序的版本
        return new LrcResult(LrcType.META_INFO, 0, line.substring(hourSplitIndex + 1, line.indexOf(']')));
      }
      case 'by': {
        // 此LRC文件的创建者
        return new LrcResult(LrcType.META_INFO, 0, line.substring(hourSplitIndex + 1, line.indexOf(']')));
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

        const totalSeconds: number = (minute * 60 + second + hundredthsOfASecond / 100) + this.offset;

        const trueTotalSeconds: number = totalSeconds < 0.2 ? 0 : totalSeconds - 0.2;

        return new LrcResult(LrcType.LYRIC, trueTotalSeconds, text);
      }
    }
  }

  /**
   * 更新播放时间
   * @param now
   */
  update(now: number): void {
    for (let index = 0; index < this.lyricArray.length; index++) {
      if (this.lyricArray[index].seconds > now) {
        continue;
      }
      if (this.lyricArray.length === index + 1
        || this.lyricArray[index + 1].seconds >= now) {
        this.lyricObserver.next(this.lyricArray[index].text);
      }
    }
  }

  /**
   * 歌词元数据信息
   */
  metaInfo(): string[] {
    return this.metaInfoArray.map(item => item.text);
  }

  /**
   * 初始化解析歌词
   * @param lyricId 歌词ID
   */
  load(lyricId: string): void {
    this.offset = 0;
    this.lyricArray = [];
    this.metaInfoArray = [];
    this.fileService.getLyricFile(lyricId)
      .subscribe(file => {
        const line = file.split('\n');
        line.forEach(item => {
          const lrcResult = this.lyricType(item);
          if (lrcResult) {
            if (lrcResult.type === LrcType.LYRIC) {
              this.lyricArray.push(lrcResult);
            }
            if (lrcResult.type === LrcType.META_INFO) {
              this.metaInfoArray.push(lrcResult);
            }
          }
        });
        this.lyricArray.sort((a, b) => a.seconds > b.seconds ? 1 : a.seconds === b.seconds ? 0 : -1);
        console.log(this.lyricArray);
      });
  }
}

/**
 * 歌词信息
 */
class LrcResult {
  /**
   * 歌词类型
   */
  type: LrcType;
  /**
   * 对应时间
   */
  seconds: number;
  /**
   * 歌词
   */
  text: string;

  constructor(type: LrcType, seconds: number, text: string) {
    this.type = type;
    this.seconds = seconds;
    this.text = text;
  }
}

/**
 * 歌词类型
 */
enum LrcType {
  /**
   * 歌词
   */
  LYRIC,
  /**
   * 元数据信息
   */
  META_INFO
}
