import {Component, OnInit} from '@angular/core';
import {Page} from '../../../../entity/page/Page';
import {Music} from '../../../../entity/Music';
import {PageEvent} from '@angular/material/paginator';
import {HttpClient} from '@angular/common/http';
import {FormControl, Validators} from '@angular/forms';
import {MusicPlayService} from '../../../../service/music-play.service';
import {FileService} from '../../../../service/file.service';
import {mergeMap} from 'rxjs/operators';
import {MusicListService} from '../../../../service/music-list.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  list: Music[];
  originalResponse: Page<Music> = new Page();
  nowPlayingMusicId: string;
  isPlay = false;
  isSearch = false;
  searchKeyword: string;
  musicSearchFormControl = new FormControl('', [
    Validators.required
  ]);

  constructor(private http: HttpClient,
              private musicPlayService: MusicPlayService,
              private musicListService: MusicListService,
              private fileService: FileService) {
  }

  ngOnInit(): void {
    this.musicListService.getMusicList().subscribe(music => this.refreshMusicList(music));

    this.musicPlayService.onPlayChangeEvent.subscribe((status) => {
      console.log('play status changed:', status);
      this.isPlay = status;
    });
    this.musicPlayService.onTimeChangeEvent.subscribe(time => {
      console.log(time);
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
          mergeMap((url: string) => this.musicPlayService.start(url))
        )
        .subscribe((status) => {
          if (status) {
            this.nowPlayingMusicId = musicId;
          } else {
            alert('播放失败');
          }
        });
    } else {
      if (this.musicPlayService.isPlayingNow()) {
        this.musicPlayService.pause().subscribe();
      } else {
        this.musicPlayService.play().subscribe();
      }
    }
  }

  onPageChange(pageEvent: PageEvent): void {
    console.log(pageEvent);
    if (this.isSearch) {
      this.musicListService.search(this.searchKeyword, pageEvent.pageIndex, pageEvent.pageSize)
        .subscribe(music => this.refreshMusicList(music));
    } else {
      this.musicListService.getMusicList(pageEvent.pageIndex, pageEvent.pageSize)
        .subscribe(music => this.refreshMusicList(music));
    }
  }

  onSearch(): void {
    console.log(this.musicSearchFormControl.value);

    this.searchKeyword = this.musicSearchFormControl.value;
    if (this.searchKeyword) {
      this.isSearch = true;
      this.musicListService.search(this.searchKeyword).subscribe(music => this.refreshMusicList(music));
    } else {
      this.isSearch = false;
      this.musicListService.getMusicList().subscribe(music => this.refreshMusicList(music));
    }
  }
}
