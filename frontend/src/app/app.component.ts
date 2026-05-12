import { Component } from '@angular/core';
import {
  IonApp,
  IonRouterOutlet,
  IonIcon,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonMenuToggle,
  IonButtons,
  IonButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { RouterLink } from '@angular/router';
import {
  personAdd,
  camera,
  ellipse,
  square,
  logIn,
  mail,
  home,
  alertCircleOutline,
  timeOutline,
  checkmarkCircleOutline,
  add,
  arrowBack,
  settings,
  trash,
  settingsOutline,
  informationCircleOutline,
  menuOutline,
  closeOutline,
  sparkles,
} from 'ionicons/icons';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    IonApp,
    IonRouterOutlet,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonMenuToggle,
    RouterLink,
    IonButtons,
    IonButton,
  ],
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
      camera,
      ellipse,
      square,
      logIn,
      mail,
      home,
      alertCircleOutline,
      timeOutline,
      checkmarkCircleOutline,
      add,
      arrowBack,
      settings,
      trash,
      settingsOutline,
      informationCircleOutline,
      menuOutline,
      closeOutline,
      sparkles,
    });
  }
}
