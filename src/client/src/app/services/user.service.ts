import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  usernameKey = 'ws-username';

  getUsername(): string | null {
    return localStorage.getItem(this.usernameKey);
  }

  setUsername(username: string) {
    localStorage.setItem(this.usernameKey, username);
  }
}
