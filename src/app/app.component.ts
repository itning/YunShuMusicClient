import {Component} from '@angular/core';
import {PwaService} from './service/pwa.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private pwaService: PwaService) {
    pwaService.start();
  }
}
