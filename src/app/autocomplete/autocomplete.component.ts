import {
  Component,
  HostListener,
  ChangeDetectorRef,
} from "@angular/core";
import {NgClass, NgFor} from "@angular/common";
import { constants, functions, operators, Option } from '../contants';

interface Variant extends Option {
  id: number
}


@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [NgClass, NgFor],
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.css'
})
export class AutocompleteComponent {
  tabIndex = 0;
  value = '';
  visibility = false;
  allVariants = [...functions,...operators, ...constants].map((item, i) => ({...item, id: i}))
  results = this.allVariants
  currentForm = {start: 0, end:0}
  currentOperators = [...operators.map(item => item.name), '(',')']

  constructor(private cdr: ChangeDetectorRef) {}

  @HostListener("keydown", ["$event"]) arrowKey(e: KeyboardEvent) {
    const isStartPosition: boolean = this.tabIndex > 0
    const isEndPosition: boolean = this.tabIndex < this.results.length-1
    if (this.visibility) {
      if (e.key === "ArrowUp" && isStartPosition) {
        this.tabIndex -= 1;
        this.focusElement();
      }
      if (e.key === "ArrowDown" && isEndPosition) {
        this.tabIndex += 1;
        this.focusElement();
      }
    }
    this.cdr.markForCheck();
  }

  @HostListener("keyup.Enter", ["$event"]) onEnter() {
    const variant = this.results[this.tabIndex];
    if (variant) {
      this.onSelect(variant);
    }   
  }

  @HostListener("keyup.Escape") onEscape(){
    this.hide();
  }
  

  show() {
    this.visibility = true;
  }

  hide() {
    this.visibility = false;
  }

  setCursorPosition(cursorPosition: number) {
    setTimeout(()=>{
      const inputElement = document.getElementById('autocomplete-input') as HTMLInputElement | null;
      if (inputElement) {
        inputElement.setSelectionRange(cursorPosition,cursorPosition);
      }
    }, 1)
    
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    const newValue: string = target.value
    const cursorPosition = target.selectionStart||0
    const lastChar: string = newValue[cursorPosition - 1]
    this.getCurrentSerch(newValue, cursorPosition - 1)
    if (lastChar==='('&& this.value.length < newValue.length){
      this.value = newValue + ')'
      target.setSelectionRange(cursorPosition,cursorPosition);
      this.setCursorPosition(cursorPosition)
      this.hide()
      return
    }
    if (newValue.length == 0) {
      return this.hide();
    }
    const {start, end} = this.currentForm
    const currentValue = newValue.slice(start ,end+1)
    this.filterOptionList(currentValue)
    this.value = newValue
      }

  onSelect(option: Variant) {
    const {start, end} = this.currentForm
    const newV = this.value.slice(0, start)+ option.value + this.value.slice(end + 1, this.value.length)   
    this.value = newV
    this.visibility = false
    const newCursorPosition = start + option.value.length-1
    this.setCursorPosition(newCursorPosition)
  }

  focusElement = (): void => {
    const currentVariantId = this.results[this.tabIndex].id 
    const el = document.getElementById(String(currentVariantId))
    el?.scrollIntoView()
  }

  private filterOptionList = (curentText: string): void => {
    const textToUpperCase: string = curentText.toUpperCase().trim()
    const newOptions = this.allVariants.filter(item => item.name.includes(textToUpperCase)&&item.value != textToUpperCase)
    this.cdr.markForCheck();
    this.results = newOptions
    if (this.results.length > 0){
      this.show();
      this.tabIndex = 0
    } else {
      this.hide();
    } 
  }

  private getCurrentSerch = (str: string, index: number): void => {
    let start: number = index
    let end: number = index
    let isOperator = this.currentOperators.includes(str[start-1])
    while (!isOperator&&str[start-1]){
      start--
      isOperator = this.currentOperators.includes(str[start-1])
    }
    isOperator = this.currentOperators.includes(str[end+1]) 
    while (!isOperator&&str[end+1]){
      isOperator = this.currentOperators.includes(str[end+1])
      end++
    }
    this.currentForm = {start, end}
  } 
}
