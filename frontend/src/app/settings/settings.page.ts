import { Component, inject, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    IonText,
    IonLabel,
    IonRange,
    IonToggle,
    IonList,
    IonItem,
    IonListHeader,
    IonIcon,
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
  cognito = inject(Cognito);
  router = inject(Router);
  paletteToggle = false;
  constructor() {}

  ngOnInit() {}

  // Listen for the toggle check/uncheck to toggle the dark palette
  toggleChange(event: CustomEvent) {
    this.toggleDarkPalette(event.detail.checked);
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
}
