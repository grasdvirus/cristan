
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

type PartnerMessage = {
  id: string;
  createdAt: Timestamp;
};

export function UnreadMessagesButton() {
  const { firestore } = useFirebase();
  const [unreadCount, setUnreadCount] = useState(0);

  // Requête pour récupérer tous les messages, triés par date
  const messagesQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'partnerMessages'), orderBy('createdAt', 'desc')) : null,
    [firestore]
  );
  const { data: messages } = useCollection<PartnerMessage>(messagesQuery);

  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastSeenTimestamp = Number(localStorage.getItem('lastSeenPartnerMessageTimestamp') || '0');
      const newUnreadCount = messages.filter(
        msg => msg.createdAt.seconds > lastSeenTimestamp
      ).length;
      setUnreadCount(newUnreadCount);
    }
  }, [messages]);
  
  const handlePress = () => {
    if (messages && messages.length > 0) {
        localStorage.setItem('lastSeenPartnerMessageTimestamp', messages[0].createdAt.seconds.toString());
        setUnreadCount(0);
    }
  }

  return (
    <Button asChild variant="secondary" className="flex-1 btn-neumorphic-light dark:btn-neumorphic-dark" onClick={handlePress}>
      <Link href="/partner/messages">
        <Mail className="mr-2 h-4 w-4" />
        {unreadCount > 0
          ? `+${unreadCount} message${unreadCount > 1 ? 's' : ''} non lu${unreadCount > 1 ? 's' : ''}`
          : 'Boîte de réception'}
        {unreadCount > 0 && (
          <span className="relative flex h-3 w-3 ml-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary/80"></span>
          </span>
        )}
      </Link>
    </Button>
  );
}
