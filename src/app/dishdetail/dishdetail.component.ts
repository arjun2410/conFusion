import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { DishService } from '../services/dish.service';
import { Dish } from '../shared/dish';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { expand, flyInOut, visibility } from '../animations/app.animation';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
    animations: [
      flyInOut(),
      visibility(),
      expand()
    ]
})
export class DishdetailComponent implements OnInit {

  feedbackForm: FormGroup;
  dish: Dish;
  dishcopy: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  formErrors = {
    'author': '',
    'comment': ''
  };

  validationMessages = {
    'author': {
      'required':      'First Name is required.',
      'minlength':     'First Name must be at least 2 characters long.'
    },
    'comment': {
      'required':      'Comment is required.'
    }
  };

  errMess: string;
  visibility = 'shown';

  @ViewChild('fform') feedbackFormDirective;

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('baseURL') public BaseURL) {
      this.createForm();
     }

  ngOnInit() {
    this.dishservice.getDishIds().subscribe((dishIds) => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => {this.visibility = 'hidden'; return this.dishservice.getDish(params['id']);}))
    .subscribe(dish => { this.dish = dish; 
      this.dishcopy = dish; 
      this.setPrevNext(dish.id);
      this.visibility = 'shown'; },
    errmess => this.errMess = errmess);
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

  createForm() {

    this.feedbackForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2)] ],
      rating: [5, [Validators.required, Validators.pattern] ],
      comment: ['', [Validators.required] ],
      date: this.getIsoDate()
    });

    this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  getIsoDate(){
    var d = new Date();
    return d.toISOString();
  }

  onValueChanged(data?: any) {
    if (!this.feedbackForm) { return; }
    const form = this.feedbackForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit(){
    this.dishcopy.comments.push(this.feedbackForm.value);
    this.dishservice.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
      errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });
    this.feedbackFormDirective.resetForm();
    this.feedbackForm.reset({
      author: '',
      rating: 5,
      comment: '',
      date: this.getIsoDate()
    });
  }

}
