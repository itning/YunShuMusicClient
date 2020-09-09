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

  getMusicList(page = 0, size = 20): Observable<Page<Music>> {
    return this.http.get<Page<Music>>(`${this.host}music?page=${page}&size=${size}`);
  }

  search(keywords: string, page = 0, size = 20): Observable<Page<Music>> {
    return this.http.get<Page<Music>>(`${this.host}music/search?keyword=${keywords}&page=${page}&size=${size}`);
  }
}
