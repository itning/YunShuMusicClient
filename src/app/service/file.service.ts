import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private readonly host = 'http://localhost:8888/';

  constructor(private http: HttpClient) {
  }

  getMusicFile(musicId: string): Observable<Blob> {
    return this.http.get(`${this.host}file?id=${musicId}`, {responseType: 'blob'});
  }

  getMusicFileToObjectUrl(musicId: string): Observable<string> {
    return this.getMusicFile(musicId).pipe(map(blob => window.URL.createObjectURL(blob)));
  }

  getMusicFileUrl(musicId: string): string {
    return `${this.host}file?id=${musicId}`;
  }
}
