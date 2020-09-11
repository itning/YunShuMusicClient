import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IndexComponent} from './component/index/index.component';
import {SharedModule} from '../shared/shared.module';
import {ControlComponent} from './component/control/control.component';
import {SidenavComponent} from './component/sidenav/sidenav.component';

@NgModule({
  declarations: [IndexComponent, ControlComponent, SidenavComponent],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class IndexModule {
}
