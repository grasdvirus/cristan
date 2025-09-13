
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Mail, Search, MessageSquarePlus, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';

const discoverUsers = [
    { name: "Alice", handle: "alice_art", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
    { name: "Bob", handle: "bob_codes", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d" },
    { name: "Charlie", handle: "charlie_design", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026706d" },
    { name: "Diana", handle: "diana_creates", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026707d" }
];

const conversations = [
  { id: '1', name: "Léa Martin", lastMessage: "Bonjour, j'aimerais discuter d'un projet.", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026701d", time: "10:42" },
  { id: '2', name: "Atelier Créatif", lastMessage: "Merci pour votre retour !", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026702d", time: "09:15" },
  { id: '3', name: "Jean Dupont", lastMessage: "C'est parfait, merci beaucoup.", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026703d", time: "Hier" },
];


export default function ContactPage() {
    const [activeTab, setActiveTab] = useState('email');

    return (
        <div className="w-full h-full flex flex-col">
            <Tabs defaultValue="email" value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col h-full">
                <div className="p-4 border-b">
                    <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                        <TabsTrigger value="email">
                            <Mail className="mr-2 h-4 w-4" />
                            Email
                        </TabsTrigger>
                        <TabsTrigger value="discover">
                            <Search className="mr-2 h-4 w-4" />
                            Découvrir
                        </TabsTrigger>
                        <TabsTrigger value="community">
                            <Users className="mr-2 h-4 w-4" />
                            Communauté
                        </TabsTrigger>
                    </TabsList>
                    <div className="relative pt-4 max-w-md mx-auto w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder={activeTab === 'email' ? "Chercher une conversation..." : "Chercher un utilisateur..."} 
                            className="pl-10 w-full" 
                        />
                    </div>
                </div>

                <div className="flex-grow">
                    <TabsContent value="email" className="m-0 h-full">
                        <div className="space-y-0 h-full overflow-y-auto">
                            {conversations.map(convo => (
                                <Link href={`/contact/${convo.id}`} key={convo.id} className="block hover:bg-muted/50 transition-colors border-b">
                                    <div className="flex items-center gap-4 p-3">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={convo.avatar} alt={convo.name} />
                                            <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-grow">
                                            <p className="font-semibold">{convo.name}</p>
                                            <p className="text-sm text-muted-foreground truncate max-w-xs">{convo.lastMessage}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground self-start mt-1">{convo.time}</p>
                                    </div>
                                </Link>
                            ))}
                            <div className="flex justify-center p-4">
                                <Button>
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    Nouvelle Conversation
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="discover" className="m-0 h-full">
                         <div className="p-4 space-y-4 h-full overflow-y-auto">
                            {discoverUsers.map(user => (
                                <div key={user.handle} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{user.name}</p>
                                            <p className="text-sm text-muted-foreground">@{user.handle}</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <MessageSquarePlus className="mr-2 h-4 w-4" />
                                        Suivre
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="community" className="m-0 h-full">
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                            <h3 className="text-xl font-semibold mb-2">Rejoignez la Communauté</h3>
                            <p>Participez aux discussions, posez des questions et partagez vos idées.</p>
                            <p className="mt-4">Le forum de la communauté est en cours de construction.</p>
                            <p>Revenez bientôt pour vous connecter avec d'autres créatifs !</p>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
