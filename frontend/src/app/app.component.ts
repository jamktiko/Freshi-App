import { Component, inject, OnInit } from '@angular/core';
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
  leafOutline,
  sparkles,
} from 'ionicons/icons';
import { StorageService } from './storage';
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
  storage = inject(StorageService);
  async ngOnInit() {
    // Use matchMedia to check the user preference
    const settings = await this.storage.getSettings();
    let prefersDark = false;
    console.log(settings);
    if (settings) {
      prefersDark = settings.darkMode;
    } else {
      prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Initialize the dark palette based on the initial
    // value of the prefers-color-scheme media query
    this.toggleDarkPalette(prefersDark);
  }

  // Add or remove the "ion-palette-dark" class on the html element
  toggleDarkPalette(shouldAdd: boolean) {
    document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);
  }

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
      leafOutline,
      sparkles,
    });
  }
}
