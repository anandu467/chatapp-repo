import { loginModal } from './../loginModal';
import { ChatClass } from './../chatForm';
import { DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as firebase from 'firebase';
import { Message } from './key';

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
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css'],
})
export class ChatRoomComponent implements OnInit, AfterViewInit {
  @ViewChild('chatcontent') chatcontent: ElementRef;
  chatMessage: string;
  shouldDisplayTyping: boolean = false;
  calculateScroll: boolean = false;
  message = '';
  users: loginModal = new loginModal();
  name = '';
  chatDisplyMainSection: any;
  messageArray: Message[] = [];

  isChatInitialed: boolean = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public datepipe: DatePipe
  ) {}
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.name = params['username'];
      this.users.email = this.name;
    });
    if (localStorage.getItem('LoginSuccess') !== 'true') {
      this.router.navigate(['/login']);
      console.log(localStorage.getItem('LoginSuccess'));
    }
    this.loadChats();
  }

  loadChats() {
    let message = new Message();
    let messages = [];
    firebase
      .database()
      .ref('chats/')
      .on('value', (resp) => {
        this.messageArray = [];

        let chats = resp.toJSON();
        let isPollingMessage = 0;

        for (let date in chats) {
          message.date = date;
          message.data = [];

          for (let chat in chats[date]) {
            if (chats[date][chat]['type'] == 'typing') {
              isPollingMessage = 1;
              this.deleteChat(date + '/' + chat);
              if (chats[date][chat]['name'] != this.name) {
                this.displayTyping();
                continue;
              }
              break;
            }
            message.data.push(chats[date][chat]);
          }
          if (isPollingMessage == 0) {
            this.messageArray.push({ ...message });
          }
        }

        this.scrollDown();
      });
    console.log(messages);
  }

  deleteChat(key: string) {
    firebase
      .database()
      .ref('chats/' + key)
      .remove()
      .then(() => {
        console.log('deleted');
      })
      .catch((e) => console.log(e));
  }

  pollTyping(event) {
    let message = event.target.value;
    if (message.length % 3 == 0) {
      let chat = this.createNewChat(this.name, 'typing', '');
      this.pushChatToDb(chat);
    }
  }

  shouldDisplayScrollbar() {
    return true;
    if (this.chatDisplyMainSection == undefined) {
      return false;
    }
    if (this.chatDisplyMainSection) {
      return (
        this.chatDisplyMainSection.scrollHeight -
          this.chatDisplyMainSection.scrollTop >
        1000
      );
    }
    return true;
  }
  ngAfterViewInit() {
    this.messageArray = [];

    setTimeout(() => {
      this.scrollDown();
    }, 600);
    console.log('hello');
    this.chatDisplyMainSection = document.querySelector('main');
    this.messageArray = [];
    this.isChatInitialed = true;
  }
  displayTyping() {
    this.shouldDisplayTyping = true;
    setTimeout(() => (this.shouldDisplayTyping = false), 2500);
  }
  createNewChat(name: string, type: string, message: string): any {
    let newChat = new ChatClass();
    newChat.name = name;
    newChat.type = type;
    newChat.message = message;
    newChat.time = this.datepipe.transform(new Date(), 'hh:mm a');
    return newChat;
  }
  pushChatToDb(chat: any) {
    let date = this.datepipe.transform(new Date(), 'dd-MM-yyyy');

    const newMessage = firebase.database().ref('chats/').child(date).push();
    newMessage.set(chat);
  }

  onFromSubmit() {
    if (this.chatMessage == undefined) {
      return;
    }
    let chat = this.createNewChat(this.name, 'message', this.chatMessage);
    this.pushChatToDb(chat);
    this.chatMessage = '';
    this.scrollDown();
  }
  scrollDown() {
    setTimeout(() => {
      this.chatDisplyMainSection.scrollTop = this.chatDisplyMainSection.scrollHeight;
    }, 300);
  }
  exitChat() {
    this.name = '';
    console.log('🚀 => ChatRoomComponent => exitChat => this.name', this.name);
    localStorage.setItem('LoginSuccess', 'false');
    localStorage.setItem('Online', 'false');
    this.router.navigate(['/login']);
    firebase.database().ref('chats/').off();
  }
}
