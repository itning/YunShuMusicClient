import {Injectable} from '@angular/core';
import {Music} from '../entity/Music';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Page} from '../entity/page/Page';

@Injectable({
  providedIn: 'root'
})
export class MusicListService {
  private readonly host = 'http://localhost:8888/';

  constructor(private http: HttpClient) {
  }

  private static listLoopToGetTheNextSong(nowPlayingMusicId: string, originalResponse: Page<Music>): Music {
    let index = 0;
    if (nowPlayingMusicId !== undefined) {
      for (let i = 0; i < originalResponse.content.length; i++) {
        if (originalResponse.content[i].musicId === nowPlayingMusicId) {
          if (i + 1 < originalResponse.content.length) {
            index = i + 1;
          }
          break;
        }
      }
    }
    return originalResponse.content[index];
  }

  private static listLoopToGetThePreviousSong(nowPlayingMusicId: string, originalResponse: Page<Music>): Music {
    let index = originalResponse.content.length - 1;
    if (nowPlayingMusicId !== undefined) {
      for (let i = 0; i < originalResponse.content.length; i++) {
        if (originalResponse.content[i].musicId === nowPlayingMusicId) {
          if (i - 1 >= 0) {
            index = i - 1;
          }
          break;
        }
      }
    }
    return originalResponse.content[index];
  }

  getMusicList(page = 0, size = 1000): Observable<Page<Music>> {
    return this.http.get<Page<Music>>(`${this.host}music?page=${page}&size=${size}`);
  }

  search(keywords: string, page = 0, size = 1000): Observable<Page<Music>> {
    return this.http.get<Page<Music>>(`${this.host}music/search?keyword=${keywords}&page=${page}&size=${size}`);
  }

  getNextMusic(mode: PlayMode, nowPlayingMusicId: string, originalResponse: Page<Music>): Music {
    switch (mode) {
      case PlayMode.LOOP:
      case PlayMode.REPEAT:
        return MusicListService.listLoopToGetTheNextSong(nowPlayingMusicId, originalResponse);
      case PlayMode.RANDOM:
        // TODO 随机歌曲算法
        return MusicListService.listLoopToGetTheNextSong(nowPlayingMusicId, originalResponse);
    }
  }

  getPreviousMusic(mode: PlayMode, nowPlayingMusicId: string, originalResponse: Page<Music>): Music {
    switch (mode) {
      case PlayMode.LOOP:
      case PlayMode.REPEAT:
        return MusicListService.listLoopToGetThePreviousSong(nowPlayingMusicId, originalResponse);
      case PlayMode.RANDOM:
        // TODO 随机歌曲算法
        return MusicListService.listLoopToGetThePreviousSong(nowPlayingMusicId, originalResponse);
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
