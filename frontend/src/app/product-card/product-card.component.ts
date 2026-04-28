import { Component, input, OnInit, signal } from '@angular/core';
import { Iproduct } from '../product';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCardSubtitle,
  IonChip,
  IonIcon,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  imports: [
    IonIcon,
    IonChip,
    IonCardSubtitle,
    IonCardContent,
    IonCardTitle,
    IonCard,
    IonCardHeader,
  ],
})
export class ProductCardComponent implements OnInit {
  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  product = input<Iproduct>();
  lifeLeft = signal<number>(0); // How many days until expires
  expirationDate = signal<string>('');
  constructor() {}

  getDaysLeft(ISODate: string) {
    const nonISODate = Date.parse(ISODate); //conver ISOdate to milliseconds
    const dateDiff = nonISODate - Date.now(); //calculate millisecond difference between 2 dates
    const dayDiff = Math.ceil(dateDiff / (1000 * 3600 * 24)); //Conver milliseconds to days
    return dayDiff;
  }
  ngOnInit() {
    this.lifeLeft.set(this.getDaysLeft(this.product()!.expirationDate));
    this.expirationDate.set(
      `${this.months[new Date(this.product()!.expirationDate).getMonth()]} ${new Date(this.product()!.expirationDate).getDate()}`,
    ); // Set date to dd.mm.
  }
  // Sets the chip color to green, yellow or red
  getColor() {
    if (this.lifeLeft() > 3) {
      return 'success';
    } else if (this.lifeLeft() >= 0) {
      return 'warning';
    } else {
      return 'danger';
    }
  }
  // Sets the chip icon based on lifeLeft
  getIcon() {
    if (this.lifeLeft() > 3) {
      return 'checkmark-circle-outline';
    } else if (this.lifeLeft() >= 0) {
      return 'time-outline';
    } else {
      return 'alert-circle-outline';
    }
  }
}
