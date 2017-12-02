import {Directive, Input, Output, EventEmitter, Inject, ElementRef, OnInit, OnDestroy,} from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser'
import {Observable}  from 'rxjs/Observable';
import { sampleTime } from 'rxjs/operators';
import 'rxjs/add/observable/fromEvent';
import { CompositeDisposable, Disposable } from 'ts-disposables';
import * as _$ from 'jquery';
const $ : any = _$;

@Directive({
  selector: '[resizer]',
  host: {'(mousedown)': 'startDrag()'}
})
export class ResizerDirective implements OnInit, OnDestroy {
  private dragInProgress: boolean = false;
  private vertical: boolean = true;
  private first: string;
  private second: string;
  private _size: number;
  private _splitSize: number;
  private _subscriptions = new CompositeDisposable();
  private mouseMoveHandler = (e: any) => {
    if (this.dragInProgress) {
      this.mousemove(e);
    }
  };
  @Input()
  maxSplitSize: number;

  @Input()
  set splitSize(splitSize : number) {

    if (this.maxSplitSize && splitSize > this.maxSplitSize) {
      splitSize = this.maxSplitSize;
    }

    if (this.vertical) {
      // Handle vertical resizer
      $(this.element.nativeElement).css({
        left: splitSize + 'px'
      });

      $(this.first).css({
        width: splitSize + 'px'
      });
      $(this.second).css({
        left: (splitSize + this._size) + 'px'
      });
    } else {
      // Handle horizontal resizer
      $(this.element.nativeElement).css({
        bottom: splitSize + 'px'
      });

      $(this.first).css({
        bottom: (splitSize + this._size) + 'px'
      });
      $(this.second).css({
        height: splitSize + 'px'
      });
    }

    this._splitSize = splitSize;

    // Update the local field
    this.sizeChange.emit(splitSize);
  }

  @Output()
  sizeChange = new EventEmitter<number>();

  @Input()
  set resizerWidth(width : number) {
    this._size = width;
    this.vertical = true;
  }

  @Input()
  set resizerHeight(height : number) {
    this._size = height;
    this.vertical = false;
  }

  @Input()
  set resizerLeft(first : string) {
    this.first = first;
  }

  @Input()
  set resizerTop(first : string) {
    this.first = first;
  }

  @Input()
  set resizerRight(second : string) {
    this.second = second;
  }

  @Input()
  set resizerBottom(second : string) {
    this.second = second;
  }

  constructor(private element: ElementRef, @Inject(DOCUMENT) private document: any) {
  }

  private startDrag() {
    this.dragInProgress = true;
  }

  private mousemove(event: any) {
    let size: number;
    if (this.vertical) {       // Handle vertical resizer. Calculate new size relative to palette container DOM node 
      size = event.pageX - $(this.first).offset().left;
    } else {
      // Handle horizontal resizer Calculate new size relative to palette container DOM node 
      size = window.innerHeight - event.pageY - $(this.second).offset().top;
    }
    this.splitSize = size;
  }

  ngOnInit() {
    // Need to set left and right elements width and fire events on init when DOM is built 
    this.splitSize = this._splitSize;

    let subscription1 = Observable.fromEvent($(this.document).get(0), 'mousemove')
      .pipe(sampleTime(300))
      .subscribe(this.mouseMoveHandler);
    this._subscriptions.add(Disposable.create(() => subscription1.unsubscribe()));
    let subscription2 = Observable.fromEvent($(this.document).get(0), 'mouseup')
      .subscribe(e => {
        if (this.dragInProgress) {
          this.mousemove(e);
          this.dragInProgress = false;
        }
      });
    this._subscriptions.add(Disposable.create(() => subscription2.unsubscribe()));

  }

  ngOnDestroy() {
    this._subscriptions.dispose();
  }
} 
