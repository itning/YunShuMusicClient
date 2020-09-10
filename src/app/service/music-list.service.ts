import {Injectable} from '@angular/core';
import {Music} from '../entity/Music';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Page} from '../entity/page/Page';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MusicListService {
  private readonly host = 'http://localhost:8888/';

  constructor(private http: HttpClient) {
  }

  private listLoopToGetTheNextSong(nowPlayingMusicId: string, originalResponse: Page<Music>): Observable<Music> {
    let index = 0;
    if (nowPlayingMusicId !== undefined) {
      for (let i = 0; i < originalResponse.content.length; i++) {
        if (originalResponse.content[i].musicId === nowPlayingMusicId) {
          if (i + 1 >= originalResponse.content.length) {
            // 最后一页 发送请求拿第一页的
            if (originalResponse.last) {
              return this.getMusicList(0, originalResponse.size).pipe(map(m => m.content[0]));
            } else {
              // 获取下一页第一首
              return this.getMusicList(originalResponse.number + 1, originalResponse.size).pipe(map(m => m.content[0]));
            }
          }
          index = i + 1;
          break;
        }
      }
    } else {
      return this.getMusicList(0, originalResponse.size).pipe(map(m => m.content[0]));
    }
    return of(originalResponse.content[index]);
  }

  private listLoopToGetThePreviousSong(nowPlayingMusicId: string, originalResponse: Page<Music>): Observable<Music> {
    let index = 0;
    if (nowPlayingMusicId !== undefined) {
      for (let i = 0; i < originalResponse.content.length; i++) {
        if (originalResponse.content[i].musicId === nowPlayingMusicId) {
          if (i - 1 === -1) {
            return this.getMusicList(originalResponse.totalPages - 1, originalResponse.size)
              .pipe(map(m => m.content[m.content.length - 1]));
          } else {
            index = i - 1;
          }
        }
      }
    } else {
      return this.getMusicList(originalResponse.totalPages - 1, originalResponse.size)
        .pipe(map(m => m.content[m.content.length - 1]));
    }
    return of(originalResponse.content[index]);
  }

  getMusicList(page = 0, size = 20): Observable<Page<Music>> {
    return this.http.get<Page<Music>>(`${this.host}music?page=${page}&size=${size}`);
  }

  search(keywords: string, page = 0, size = 20): Observable<Page<Music>> {
    return this.http.get<Page<Music>>(`${this.host}music/search?keyword=${keywords}&page=${page}&size=${size}`);
  }

  getNextMusic(mode: PlayMode, nowPlayingMusicId: string, originalResponse: Page<Music>): Observable<Music> {
    switch (mode) {
      case PlayMode.LOOP:
      case PlayMode.REPEAT:
        return this.listLoopToGetTheNextSong(nowPlayingMusicId, originalResponse);
      case PlayMode.RANDOM:
        // TODO 随机歌曲算法
        return this.listLoopToGetTheNextSong(nowPlayingMusicId, originalResponse);
    }
  }

  getPreviousMusic(mode: PlayMode, nowPlayingMusicId: string, originalResponse: Page<Music>): Observable<Music> {
    switch (mode) {
      case PlayMode.LOOP:
      case PlayMode.REPEAT:
        return this.listLoopToGetThePreviousSong(nowPlayingMusicId, originalResponse);
      case PlayMode.RANDOM:
        // TODO 随机歌曲算法
        return this.listLoopToGetThePreviousSong(nowPlayingMusicId, originalResponse);
    }
  }
}

/**
 *  列表循环 loop
 *  单曲循环 repeat
 *  随机 shuffle
 */
export enum PlayMode {
  LOOP = 'loop',
  REPEAT = 'repeat',
  RANDOM = 'shuffle'
}
