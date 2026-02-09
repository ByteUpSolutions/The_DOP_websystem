import { Component, signal, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Firestore, collection, addDoc, collectionData, query, orderBy, limit } from '@angular/fire/firestore';
import { Auth, signInWithCustomToken, authState } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CommunityService } from '../../core/services/community.service';
import { Community } from '../../core/models/community.model';

interface Message {
  id?: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
}

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full bg-gray-100 p-4 rounded-lg shadow-inner">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <span>{{ community()?.name || 'Carregando...' }}</span>
        <span *ngIf="!community() && communityId()" class="text-sm font-normal text-gray-500">({{ communityId() }})</span>
        
        <!-- Status Indicator -->
        <span *ngIf="connectionStatus() === 'connecting'" class="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Conectando...</span>
        <span *ngIf="connectionStatus() === 'connected'" class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Conectado</span>
        <span *ngIf="connectionStatus() === 'error'" class="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">Erro de Conexão</span>
      </h2>
      
      <!-- Error Message -->
      <div *ngIf="errorMessage()" class="bg-red-50 text-red-600 p-2 mb-2 rounded border border-red-200 text-sm">
        {{ errorMessage() }}
      </div>
      <div class="flex-1 overflow-y-auto mb-4 space-y-2 p-2 bg-white rounded-md shadow-sm">
        <div *ngIf="messages().length === 0" class="text-center text-gray-400 py-4">
          Nenhuma mensagem ainda.
        </div>
        
        @for (msg of messages(); track msg.id) {
          <div [ngClass]="{'text-right': msg.senderId === authService.currentUser()?.id, 'text-left': msg.senderId !== authService.currentUser()?.id}">
            <div [ngClass]="{'bg-blue-500 text-white': msg.senderId === authService.currentUser()?.id, 'bg-gray-300 text-gray-800': msg.senderId !== authService.currentUser()?.id}"
                 class="inline-block px-4 py-2 rounded-lg shadow-sm max-w-xs break-words text-left">
              <p class="text-xs font-semibold" *ngIf="msg.senderId !== authService.currentUser()?.id">{{ msg.senderName }}</p>
              <p class="text-sm">{{ msg.text }}</p>
              <p class="text-xs text-right opacity-75">
                 {{ msg.timestamp?.toDate ? (msg.timestamp?.toDate() | date:'shortTime') : (msg.timestamp | date:'shortTime') }}
              </p>
            </div>
          </div>
        }
      </div>
      
      <div class="flex gap-2">
        <input 
          [(ngModel)]="newMessage" 
          (keyup.enter)="sendMessage()"
          placeholder="Digite sua mensagem..." 
          class="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button 
          (click)="sendMessage()" 
          [disabled]="!newMessage.trim() || !authService.isAuthenticated()"
          class="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Enviar
        </button>
      </div>
    </div>
  `
})
export class ChatWindowComponent implements OnInit {
  private firestore = inject(Firestore);
  private _firebaseAuth = inject(Auth);

  private route = inject(ActivatedRoute);
  public authService = inject(AuthService);
  private communityService = inject(CommunityService);

  messages = signal<Message[]>([]);
  newMessage = '';
  communityId = signal<string | null>(null);
  community = signal<Community | undefined>(undefined);

  connectionStatus = signal<'connecting' | 'connected' | 'error'>('connecting');
  errorMessage = signal<string>('');

  constructor() {
    effect(() => {
      const chatToken = this.authService.chatToken();
      console.log('ChatWindow: Chat token changed', chatToken ? 'Token present' : 'Token missing');

      if (chatToken) {
        this.connectionStatus.set('connecting');
        signInWithCustomToken(this._firebaseAuth, chatToken)
          .then(userCredential => {
            console.log('ChatWindow: Firebase sign-in successful', userCredential.user.uid);
            this.connectionStatus.set('connected');
          })
          .catch(err => {
            console.error('ChatWindow: Firebase custom token sign-in failed:', err);
            this.connectionStatus.set('error');
            this.errorMessage.set('Erro na autenticação do chat: ' + err.message);
          });
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('communityId');
      this.communityId.set(id);
      if (id) {
        this.loadMessages(id);
        this.loadCommunityDetails(id);
      }
    });
  }

  loadCommunityDetails(id: string): void {
    this.communityService.getCommunityById(id).subscribe({
      next: (c) => this.community.set(c),
      error: (err) => console.error('Failed to load community', err)
    });
  }

  loadMessages(communityId: string): void {
    console.log('ChatWindow: Initializing message listener for community', communityId);

    authState(this._firebaseAuth).subscribe(user => {
      console.log('ChatWindow: Auth state changed', user ? 'User authenticated' : 'User not authenticated');

      if (user) {
        const msgCollection = collection(this.firestore, `communities/${communityId}/messages`);
        const q = query(msgCollection, orderBy('timestamp', 'desc'), limit(50));

        (collectionData(q, { idField: 'id' }) as Observable<Message[]>).subscribe({
          next: (msgs) => {
            // Firestore retorna do mais novo para o mais antigo (desc), 
            // mas queremos exibir do antigo para o novo (asc) na interface
            this.messages.set([...msgs].reverse());
          },
          error: (err) => {
            console.error('ChatWindow: Error fetching messages:', err);
            this.errorMessage.set('Erro ao carregar mensagens: ' + err.message);
          }
        });
      }
    });
  }

  async sendMessage() {
    if (!this.newMessage.trim() || !this.communityId() || !this.authService.currentUser()) return;

    try {
      const msgCollection = collection(this.firestore, `communities/${this.communityId()}/messages`);
      await addDoc(msgCollection, {
        text: this.newMessage,
        senderId: this.authService.currentUser()?.id,
        senderName: this.authService.currentUser()?.fullName,
        timestamp: new Date()
      });
      console.log('ChatWindow: Message sent successfully');
      this.newMessage = '';
    } catch (err: any) {
      console.error('ChatWindow: Error sending message', err);
      alert('Erro ao enviar mensagem: ' + err.message);
    }
  }
}
