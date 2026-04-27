import { Component, input, OnInit } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-summary-card',
  templateUrl: './summary-card.component.html',
  styleUrls: ['./summary-card.component.scss'],
  imports: [IonIcon],
})
export class SummaryCardComponent implements OnInit {
  // Inputs/props from parent-component
  icon = input<string>();
  amount = input<string>();
  freshness = input<'Expired' | 'Expiring' | 'Fresh'>();
  constructor() {}

  ngOnInit() {}
}
