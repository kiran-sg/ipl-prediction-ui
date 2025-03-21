import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-loading',
  imports: [
    CommonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent implements OnInit {

  loading$;

  constructor(private readonly loadingService: LoadingService, 
    private el: ElementRef, private renderer: Renderer2
  ) {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnInit() {
    this.loadingService.isLoading.subscribe(isLoading => {
      if (isLoading) {
        this.renderer.setAttribute(this.el.nativeElement, 'aria-hidden', 'false');
        (this.el.nativeElement as HTMLElement).focus(); // Move focus to the loading element
      } else {
        this.renderer.removeAttribute(this.el.nativeElement, 'aria-hidden');
      }
    });
  }

}
