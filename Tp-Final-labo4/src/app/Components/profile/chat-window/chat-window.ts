import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
import { ChatMessage } from '../../../Interfaces/chat';
import { ChatService } from '../../../Services/chat-service';
import { AuthService } from '../../../auth/auth-service';
import { Profile } from '../../../Interfaces/profilein';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.css',
})
export class ChatWindow {

  private chatService = inject(ChatService);
  private auth = inject(AuthService);

  friend = input<Profile | null>(null);
  messages = signal<ChatMessage[]>([]);

  activeUser = this.auth.getActiveUser()();


  messageControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(200), this.noWhitespaceValidator]
  });

  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const value = String(control.value ?? '');
    return value.trim().length === 0 ? { whitespace: true } : null;
  }

 

  constructor() {
    effect(() => {
      const f = this.friend();
      if (!f || !this.activeUser) return;

      this.loadMessages();
    });
  }

   loadMessages() {

  const friend = this.friend();
  const user = this.activeUser;

  if (!friend || !user) return;

  this.chatService
    .getConversation(user.id!, friend.id!)
    .subscribe(list => {

      this.messages.set(list);

      // marcar como leídos
      this.chatService
        .markAsRead(user.id!, friend.id!)
        .subscribe();
    });
}


  send() {
    if (this.messageControl.invalid) {
      this.messageControl.markAsTouched();
      return;
    }

    const f = this.friend();
    if (!f || !this.activeUser) return;

    const text = this.messageControl.value.trim();

    const msg: ChatMessage = {
      userAId: this.activeUser.id!,
      userBId: f.id!,
      senderId: this.activeUser.id!,
      content: text,
      createdAt: new Date().toISOString(),
    };

    this.chatService.sendMessage(msg).subscribe(() => {
      this.messageControl.reset(''); 
      this.loadMessages();
    });
  }

  isMine(msg: ChatMessage) {
    return String(msg.senderId) === String(this.activeUser?.id);
  }
}
