import { Component, OnInit } from '@angular/core';
import {Page} from '../../../../entity/page/Page';
import {Music} from '../../../../entity/Music';
import {PageEvent} from '@angular/material/paginator';
import {HttpClient} from '@angular/common/http';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  private host = 'http://192.168.1.102:8888/';
  list: Music[];
  originalResponse: Page<Music> = new Page();
  nowPlayingMusicId: string;
  audio: HTMLAudioElement;
  isPlay = false;
  musicSearchFormControl = new FormControl('', [
    Validators.required
  ]);

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.initMusicList();
  }

  private initMusicList(page = 0): void {
    this.http.get<Page<Music>>(`${this.host}music?page=${page}`)
      .subscribe(musics => {
        this.refreshMusicList(musics);
        console.log(musics.content);
      });
  }

  private refreshMusicList(originalResponse: Page<Music>): void {
    this.list = originalResponse.content;
    this.originalResponse = originalResponse;
  }

  doOnClick(musicId: string): void {
    if (this.nowPlayingMusicId !== musicId) {
      if (this.audio !== undefined) {
        this.audio.pause();
      }
      this.http.get(`${this.host}file?id=${musicId}`, {responseType: 'blob'})
        .subscribe(v => {
          const objectURL: string = window.URL.createObjectURL(v);
          console.log(objectURL);
          this.audio = new Audio(objectURL);
          this.audio.play().then(() => {
            console.log('改变');
            this.isPlay = true;
            this.nowPlayingMusicId = musicId;
          });
        });
    } else {
      if (this.isPlay) {
        this.audio.pause();
      } else {
        this.audio.play();
      }
      this.isPlay = !this.isPlay;
    }
  }

  onPageChange(pageEvent: PageEvent): void {
    console.log(pageEvent);
    this.initMusicList(pageEvent.pageIndex);
  }

  onSearch(): void {
    console.log(this.musicSearchFormControl.value);
    this.http.get<Page<Music>>(`${this.host}music/search?keyword=${this.musicSearchFormControl.value}`)
      .subscribe(musics => {
        this.refreshMusicList(musics);
        console.log(musics.content);
      });
  }
}
