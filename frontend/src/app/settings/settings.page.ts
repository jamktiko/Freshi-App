import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonButton,
  IonIcon,
  IonListHeader,
  IonItem,
  IonList,
  IonToggle,
  IonRange,
  IonLabel,
  IonText,
} from '@ionic/angular/standalone';
import { Cognito } from '../cognito';
import { Router } from '@angular/router';
import { getCurrentUser } from 'aws-amplify/auth';
import { ApiService } from '../api-service';
import { StorageService } from '../storage';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    IonLabel,

    IonToggle,
    IonList,
    IonItem,
    IonListHeader,

    IonButton,
    IonButtons,
    IonBackButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class SettingsPage implements OnInit {
  storage = inject(StorageService);
  api = inject(ApiService);
  cognito = inject(Cognito);
  router = inject(Router);
  paletteToggle = false;
  user = signal<string>('');
  constructor() {}

  async ngOnInit() {
    await this.getUser();
    const settings = await this.storage.getSettings();
    if (settings) {
      this.paletteToggle = settings.darkMode;
    } else {
      this.paletteToggle = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
    }
  }
  // Gets user
  async getUser() {
    const user = await this.cognito.getUser();
    if (user.signInDetails?.loginId) {
      this.user.set(user.signInDetails.loginId);
    } else {
      this.user.set('');
    }
  }
  // Listen for the toggle check/uncheck to toggle the dark palette
  toggleChange(event: CustomEvent) {
    this.toggleDarkPalette(event.detail.checked);
    // Save darkmode preference to settings
    this.storage.setSettings({
      darkMode: event.detail.checked,
    });
  }
  // Add or remove the "ion-palette-dark" class on the html element
  toggleDarkPalette(shouldAdd: boolean) {
    document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);
  }

  // Log the user out
  async logOut() {
    try {
      await this.cognito.logoutUser();
      this.router.navigate(['/tabs/welcome']);
    } catch (error) {
      alert(error);
    }
  }

  async lahetaIlmoitus() {
    // 1. Tarkistetaan ja pyydetään luvat käyttäjältä (erityisesti iOS ja Android 13+)
    const luvat = await LocalNotifications.requestPermissions();

    if (luvat.display === 'granted') {
      // 2. Ajastetaan ilmoitus tulevaksi esim. 5 sekunnin kuluttua
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Moikka! 👋',
            body: 'Tämä on paikallinen ilmoitus Ionic-sovelluksestasi.',
            id: 1, // Uniikki ID jokaiselle ilmoitukselle
            schedule: { at: new Date(Date.now() + 1000 * 5) }, // 5 sekuntia tästä hetkestä
            sound: 'default', // Käytetään laitteen oletusääntä
            actionTypeId: '',
            extra: null,
          },
        ],
      });

      alert('Ilmoitus ajastettu onnistuneesti!');
    } else {
      alert('Käyttäjä ei antanut lupaa ilmoituksille.');
    }
  }
}
