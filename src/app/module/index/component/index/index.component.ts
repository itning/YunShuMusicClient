import {Component, OnInit} from '@angular/core';
import {Page} from '../../../../entity/page/Page';
import {Music} from '../../../../entity/Music';
import {PageEvent} from '@angular/material/paginator';
import {HttpClient} from '@angular/common/http';
import {FormControl, Validators} from '@angular/forms';
import {MusicService} from '../../../../service/music.service';
import {FileService} from '../../../../service/file.service';
import {mergeMap} from 'rxjs/operators';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  private host = 'http://localhost:8888/';

  list: Music[];
  originalResponse: Page<Music> = new Page();
  nowPlayingMusicId: string;
  isPlay = false;
  musicSearchFormControl = new FormControl('', [
    Validators.required
  ]);

  constructor(private http: HttpClient,
              private musicService: MusicService,
              private fileService: FileService) {
  }

  ngOnInit(): void {
    this.initMusicList();
    this.musicService.onPlayChangeEvent.subscribe((status) => {
      console.log('play status changed:', status);
      this.isPlay = status;
    });
  }

  private initMusicList(page = 0, size = 20): void {
    this.http.get<Page<Music>>(`${this.host}music?page=${page}&size=${size}`)
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
      this.fileService.getMusicFileToObjectUrl(musicId)
        .pipe(
          mergeMap((value: string) => this.musicService.changePlay(value))
        )
        .subscribe((status) => {
          if (status) {
            this.nowPlayingMusicId = musicId;
          } else {
            alert('播放失败');
          }
        });
    } else {
      if (this.musicService.isPlayingNow()) {
        this.musicService.pause().subscribe();
      } else {
        this.musicService.play().subscribe();
      }
    }
  }

  onPageChange(pageEvent: PageEvent): void {
    console.log(pageEvent);
    this.initMusicList(pageEvent.pageIndex, pageEvent.pageSize);
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
