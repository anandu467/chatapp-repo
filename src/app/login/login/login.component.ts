import { Router, ActivatedRoute } from '@angular/router';
import { loginModal } from './../../loginModal';
import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';

export const snapshotToArray = (snapshot: any) => {
  const returnArr = [];

  snapshot.forEach((childSnapshot: any) => {
    const item = childSnapshot.val();
    item.key = childSnapshot.key;
    returnArr.push(item);
  });

  return returnArr;
};
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  db = firebase.database().ref('users/').child('email');
  loginObj: loginModal = new loginModal();
  username: any;
  chats: any[];
  flag: number;
  i: number;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {}

  login() {
    console.log('herere rfe rer ');
    this.loginObj.status = 'online';

    firebase
      .database()
      .ref('/users/')
      .on('value', (resp) => {
        this.chats = [];
        this.chats = snapshotToArray(resp);

        for (this.i = 0; this.i < this.chats.length; this.i++) {
          if (resp.exists()) {
            const userData: string = this.chats[this.i].email;

            if (
              userData == this.loginObj.email &&
              this.chats[this.i].password == this.loginObj.password
            ) {
              this.flag = 1;

              break;
            }
          }
        }
      });
    if (this.flag == 1) {
      firebase
        .database()
        .ref('/users/' + this.chats[this.i].key)
        .update({ status: 'online' });
      localStorage.setItem('LoginSuccess', 'true');
      localStorage.setItem('Online', 'true');
      this.router.navigate(['chat', this.loginObj.email]);
    }
  }
}
