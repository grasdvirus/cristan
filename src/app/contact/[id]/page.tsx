
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, Paperclip } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

// Mock data, replace with real data fetching
const conversations = [
  { id: '1', name: "Léa Martin", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026701d", messages: [
      { sender: 'other', text: "Bonjour, j'aimerais discuter d'un projet.", time: "10:42" },
      { sender: 'me', text: "Bonjour Léa, bien sûr ! Je suis à votre écoute.", time: "10:43" },
  ]},
  { id: '2', name: "Atelier Créatif", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026702d", messages: [
       { sender: 'other', text: "Merci pour votre retour !", time: "09:15" },
  ]},
  { id: '3', name: "Jean Dupont", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026703d", messages: [
        { sender: 'other', text: "C'est parfait, merci beaucoup.", time: "Hier" },
  ]},
];


export default function DialoguePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const conversation = conversations.find(c => c.id === id);

  if (!conversation) {
    // Handle case where conversation is not found
    return (
        <div className="flex flex-col h-full items-center justify-center text-muted-foreground">
            <p>Conversation non trouvée.</p>
            <Button variant="link" onClick={() => router.push('/contact')}>Retour aux messages</Button>
        </div>
    );
  }

  return (
    <Card className="flex flex-col h-full w-full shadow-none border-none">
      <CardHeader className="flex flex-row items-center gap-4 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.push('/contact')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar>
            <AvatarImage src={conversation.avatar} alt={conversation.name} />
            <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-semibold">{conversation.name}</h2>
      </CardHeader>
      
      <CardContent className="flex-grow p-4 overflow-y-auto space-y-4">
        {conversation.messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender === 'me' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
              <p>{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.time}</p>
            </div>
          </div>
        ))}
      </CardContent>

      <CardFooter className="p-4 border-t bg-background">
        <div className="flex w-full items-center gap-2">
            <Button variant="ghost" size="icon">
                <Paperclip className="h-5 w-5" />
            </Button>
            <Input placeholder="Écrivez votre message..." className="flex-grow" />
            <Button size="icon">
                <Send className="h-5 w-5" />
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
