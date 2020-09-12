import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatInputModule} from '@angular/material/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSliderModule} from '@angular/material/slider';
import {SecondsToMinutesPipe} from '../../pipe/seconds-to-minutes.pipe';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@NgModule({
  declarations: [
    SecondsToMinutesPipe
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatListModule,
    MatPaginatorModule,
    MatInputModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatSliderModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressBarModule
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatListModule,
    MatPaginatorModule,
    MatInputModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatSliderModule,
    SecondsToMinutesPipe,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressBarModule
  ]
})
export class SharedModule {
}
