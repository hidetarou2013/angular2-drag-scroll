import {
  NgModule,
  Directive,
  ElementRef,
  Renderer,
  OnDestroy,
  Input,
  OnInit,
  OnChanges,
  AfterViewChecked,
  HostListener
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

@Directive({
  selector: '[drag-scroll]'
})
export class DragScroll implements OnDestroy, OnInit, OnChanges, AfterViewChecked {

  private _scrollbarHidden: boolean;

  private _disabled: boolean;

  private _xDisabled: boolean;

  private _yDisabled: boolean;

  /**
   * Is the user currently pressing the element
   */
  isPressed: boolean = false;

  /**
   * The x coordinates on the element
   */
  downX: number = 0;

  /**
   * The y coordinates on the element
   */
  downY: number = 0;

  /**
   * The bounding ClientRect on the element
   */
  rect: ClientRect;

  parentNode: HTMLElement;

  wrapper: HTMLDivElement;

  /**
   * Whether the scrollbar is hidden
   */
  @Input('scrollbar-hidden')
  get scrollbarHidden() { return this._scrollbarHidden; }
  set scrollbarHidden(value: boolean) { this._scrollbarHidden = value; };

  /**
   * Whether horizontally and vertically draging and scrolling is be disabled
   */
  @Input('drag-scroll-disabled')
  get disabled() { return this._disabled; }
  set disabled(value: boolean) { this._disabled = value; };

  /**
   * Whether horizontally dragging and scrolling is be disabled
   */
  @Input('drag-scroll-x-disabled')
  get xDisabled() { return this._xDisabled; }
  set xDisabled(value: boolean) { this._xDisabled = value; };

  /**
   * Whether vertically dragging and scrolling events is disabled
   */
  @Input('drag-scroll-y-disabled')
  get yDisabled() { return this._yDisabled; }
  set yDisabled(value: boolean) { this._yDisabled = value; };

  @HostListener('mousedown', ['$event'])
  onMouseDown(e: MouseEvent) {
    e.preventDefault();
    this.isPressed = true;
    this.downX = e.clientX;
    this.downY = e.clientY;
    return false;
  }

  onMouseMoveHandler = this.onMouseMove.bind(this);
  onMouseUpHandler = this.onMouseUp.bind(this);

  constructor(
    private el: ElementRef, private renderer: Renderer
  ) {
    el.nativeElement.style.overflow = 'auto';
    el.nativeElement.style.whiteSpace = 'noWrap';
    document.addEventListener('mousemove', this.onMouseMoveHandler, false);
    document.addEventListener('mouseup', this.onMouseUpHandler, false);
  }

  ngOnChanges() {
    if (this.scrollbarHidden) {
      this.hideScrollbar();
    } else {
      this.showScrollbar();
    }

    if (this.xDisabled || this.disabled) {
      this.disableScroll('x');
    } else {
      this.enableScroll('x');
    }

    if (this.yDisabled || this.disabled) {
      this.disableScroll('y');
    } else {
      this.enableScroll('y');
    }
  }

  ngOnInit(): void {
    this.rect = this.el.nativeElement.getBoundingClientRect();
    this.renderer.setElementAttribute(this.el.nativeElement, 'drag-scroll', 'true');
  }

  ngAfterViewChecked() {
    // avoid extra ckecks
    if (this.wrapper) {
      this.checkScrollbar();
    }
  }

  ngOnDestroy() {
    this.renderer.setElementAttribute(this.el.nativeElement, 'drag-scroll', 'false');
    document.removeEventListener('mousemove', this.onMouseMoveHandler, false);
    document.removeEventListener('mouseup', this.onMouseUpHandler, false);
  }

  onMouseMove(e: MouseEvent) {
    if (this.isPressed && !this.disabled) {
      e.preventDefault();
      // Drag X
      if (!this.xDisabled) {
        this.el.nativeElement.scrollLeft =
          this.el.nativeElement.scrollLeft - e.clientX + this.downX;
        this.downX = e.clientX;
      }

      // Drag Y
      if (!this.yDisabled) {
        this.el.nativeElement.scrollTop =
          this.el.nativeElement.scrollTop - e.clientY + this.downY;
        this.downY = e.clientY;
      }
    }
    return false;
  }

  onMouseUp(e: MouseEvent) {
    e.preventDefault();
    this.isPressed = false;
    return false;
  }

  private disableScroll(axis: string): void {
    this.el.nativeElement.style[`overflow-${axis}`] = 'hidden';
  }

  private enableScroll(axis: string): void {
    this.el.nativeElement.style[`overflow-${axis}`] = 'auto';
  }

  private hideScrollbar(): void {
    this.parentNode = this.el.nativeElement.parentNode;
    this.wrapper = document.createElement('div');
    this.wrapper.style.width = this.el.nativeElement.offsetWidth + 'px';
    this.wrapper.style.height = this.el.nativeElement.offsetHeight + 'px';
    this.wrapper.style.overflow = 'hidden';
    this.el.nativeElement.style.width = 'calc(100% + 20px)';
    this.el.nativeElement.style.height = 'calc(100% + 20px)';
    // set the wrapper as child (instead of the element)
    this.parentNode.replaceChild(this.wrapper, this.el.nativeElement);
    // set element as child of wrapper
    this.wrapper.appendChild(this.el.nativeElement);
  }

  private showScrollbar(): void {
    if (this.wrapper) {
      this.el.nativeElement.style.width = this.wrapper.style.width;
      this.el.nativeElement.style.height = this.wrapper.style.height;
      this.parentNode.removeChild(this.wrapper);
      this.parentNode.appendChild(this.el.nativeElement);
      this.wrapper = null;
    }
  }

  private checkScrollbar() {
    if (this.el.nativeElement.scrollWidth <= this.el.nativeElement.clientWidth) {
      this.el.nativeElement.style.height = '100%';
    } else {
      this.el.nativeElement.style.height = 'calc(100% + 20px)';
    }
    if (this.el.nativeElement.scrollHeight <= this.el.nativeElement.clientHeight) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = 'calc(100% + 20px)';
    }
  }
}

@NgModule({
  imports: [BrowserModule],
  exports: [DragScroll],
  declarations: [DragScroll]
})
export class DragScrollModule { }