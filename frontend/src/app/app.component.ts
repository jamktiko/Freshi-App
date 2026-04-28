import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personAdd,
  ellipse,
  square,
  logIn,
  mail,
  home,
  alertCircleOutline,
  timeOutline,
  checkmarkCircleOutline,
  settings,
} from 'ionicons/icons';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    /**
     * Any icons you want to use in your application
     * can be registered in app.component.ts and then
     * referenced by name anywhere in your application.
     */
    addIcons({
      personAdd,
      ellipse,
      square,
      logIn,
      mail,
      home,
      alertCircleOutline,
      timeOutline,
      checkmarkCircleOutline,
      settings,
    });
  }
}
