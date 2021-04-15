import { Component } from '@angular/core';
import * as firebase from "firebase";
const config = {
  apiKey: 'AIzaSyAo0c2SHHGdHpjXgBw0ddmZIF0VBEtZPQw',
  databaseURL: 'https://laba-f00f4-default-rtdb.firebaseio.com'
};
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chat-app';
  constructor() {
    firebase.initializeApp(config);
  }
}
