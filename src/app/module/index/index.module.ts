import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IndexComponent} from './component/index/index.component';
import {SharedModule} from '../shared/shared.module';
import {ControlComponent} from './component/control/control.component';


@NgModule({
  declarations: [IndexComponent, ControlComponent],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class IndexModule {
}
