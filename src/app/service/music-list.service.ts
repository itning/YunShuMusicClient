import {Injectable} from '@angular/core';
import {Music} from '../entity/Music';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Page} from '../entity/page/Page';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MusicListService {
  private static randomPlayedList = new Set<string>();
  private static randomPlayedStack: string[] = [];

  constructor(private http: HttpClient) {
  }

  private static listLoopToGetTheNextSong(nowPlayingMusicId: string, originalResponse: Page<Music>): Music {
    let index = 0;
    if (nowPlayingMusicId !== undefined) {
      const findIndex = originalResponse.content.findIndex(music => music.musicId === nowPlayingMusicId);
      if (findIndex !== -1) {
        if (findIndex + 1 < originalResponse.content.length) {
          index = findIndex + 1;
        }
      }
    }
    return originalResponse.content[index];
  }

  private static listLoopToGetThePreviousSong(nowPlayingMusicId: string, originalResponse: Page<Music>): Music {
    let index = originalResponse.content.length - 1;
    if (nowPlayingMusicId !== undefined) {
      const findIndex = originalResponse.content.findIndex(music => music.musicId === nowPlayingMusicId);
      if (findIndex !== -1) {
        if (findIndex - 1 >= 0) {
          index = findIndex - 1;
        }
      }
    }
    return originalResponse.content[index];
  }

  private static getPreviousSongRandomly(originalResponse: Page<Music>): Music {
    const musicId = MusicListService.randomPlayedStack.pop();
    if (musicId === undefined) {
      return MusicListService.getSongsRandomly(undefined, originalResponse);
    }
    return originalResponse.content.find(music => music.musicId === musicId);
  }

  private static getSongsRandomly(nowPlayingMusicId: string, originalResponse: Page<Music>): Music {
    if (nowPlayingMusicId === undefined) {
      return originalResponse.content[Math.floor(Math.random() * originalResponse.content.length)];
    }
    // 播放列表只有一个或零个
    if (originalResponse.content.length < 2) {
      return originalResponse.content.find(music => music.musicId === nowPlayingMusicId);
    }
    // 播放列表只有两首歌
    if (originalResponse.content.length === 2) {
      return originalResponse.content.find(music => music.musicId !== nowPlayingMusicId);
    }
    MusicListService.randomPlayedStack.push(nowPlayingMusicId);
    MusicListService.randomPlayedList.add(nowPlayingMusicId);
    let canPlayList = originalResponse.content.filter(music => !MusicListService.randomPlayedList.has(music.musicId));
    if (canPlayList.length === 0) {
      MusicListService.randomPlayedList.clear();
      MusicListService.randomPlayedList.add(nowPlayingMusicId);
      canPlayList = originalResponse.content.filter(music => !MusicListService.randomPlayedList.has(music.musicId));
    }
    const index = Math.floor(Math.random() * canPlayList.length);
    return canPlayList[index];
  }

  getMusicList(page = 0, size = 2000): Observable<Page<Music>> {
    return this.http.get<Page<Music>>(`${environment.apiHost}music?page=${page}&size=${size}`);
  }

  search(keywords: string, page = 0, size = 2000): Observable<Page<Music>> {
    return this.http.get<Page<Music>>(`${environment.apiHost}music/search?keyword=${keywords}&page=${page}&size=${size}`);
  }

  getNextMusic(mode: PlayMode, nowPlayingMusicId: string, originalResponse: Page<Music>): Music {
    switch (mode) {
      case PlayMode.LOOP:
      case PlayMode.REPEAT:
        return MusicListService.listLoopToGetTheNextSong(nowPlayingMusicId, originalResponse);
      case PlayMode.RANDOM:
        return MusicListService.getSongsRandomly(nowPlayingMusicId, originalResponse);
    }
  }

  getPreviousMusic(mode: PlayMode, nowPlayingMusicId: string, originalResponse: Page<Music>): Music {
    switch (mode) {
      case PlayMode.LOOP:
      case PlayMode.REPEAT:
        return MusicListService.listLoopToGetThePreviousSong(nowPlayingMusicId, originalResponse);
      case PlayMode.RANDOM:
        return MusicListService.getPreviousSongRandomly(originalResponse);
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
  REPEAT = 'repeat_one',
  RANDOM = 'shuffle'
}
