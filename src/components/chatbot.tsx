'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader2, Send, User } from 'lucide-react';
import { NeumorphicCard } from './neumorphic-card';
import { cn } from '@/lib/utils';
import { chatWithBot } from '@/ai/flows/chatbot';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useFirebase } from '@/firebase';

type Message = {
  text: string;
  sender: 'user' | 'bot';
};

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useFirebase();

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithBot(input);
      const botMessage: Message = { text: response, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = { text: "Désolé, je rencontre un problème. Veuillez réessayer plus tard.", sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name || name.length === 0) return '?';
    return name[0].toUpperCase();
  }

  return (
    <NeumorphicCard inset className="p-4 sm:p-6 h-[500px] flex flex-col">
      <ScrollArea className="flex-grow h-0 pr-4 -mr-4 mb-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-3',
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.sender === 'bot' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/favico.png" alt="Bot" />
                  <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
              )}
              <NeumorphicCard
                className={cn(
                  'p-3 max-w-[80%] rounded-xl',
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background'
                )}
              >
                <p className="text-sm">{message.text}</p>
              </NeumorphicCard>
              {message.sender === 'user' && (
                <Avatar className="h-8 w-8">
                   <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
                   <AvatarFallback>{user ? getInitials(user?.displayName) : <User />}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
           {isLoading && (
            <div className="flex items-start gap-3 justify-start">
               <Avatar className="h-8 w-8">
                  <AvatarImage src="/favico.png" alt="Bot" />
                  <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
              <NeumorphicCard className="p-3">
                <Loader2 className="h-5 w-5 animate-spin" />
              </NeumorphicCard>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="flex items-center gap-2 pt-4 border-t">
        <Input
          type="text"
          placeholder="Posez votre question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
          className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark"
        />
        <Button onClick={handleSend} disabled={isLoading || input.trim() === ''} className="btn-neumorphic-light dark:btn-neumorphic-dark" size="icon">
          <Send className="h-4 w-4" />
          <span className="sr-only">Envoyer</span>
        </Button>
      </div>
    </NeumorphicCard>
  );
}
