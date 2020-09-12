import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient) {
  }

  getMusicFile(musicId: string): Observable<Blob> {
    return this.http.get(`${environment.apiHost}file?id=${musicId}`, {responseType: 'blob'});
  }

  getMusicFileToObjectUrl(musicId: string): Observable<string> {
    return this.getMusicFile(musicId).pipe(map(blob => window.URL.createObjectURL(blob)));
  }

  getMusicFileUrl(musicId: string): string {
    return `${environment.apiHost}file?id=${musicId}`;
  }
}
