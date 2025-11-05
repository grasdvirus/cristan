'use client';

import Image from 'next/image';
import { Mail, LogOut, KeyRound, Info, MessageSquare, Send, Shield, CornerDownRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { NeumorphicCard } from '@/components/neumorphic-card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useState } from 'react';
import { collection, query, orderBy, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AuthGuard } from '@/components/auth-guard';

type Avis = {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  createdAt: Timestamp;
};

type ReponseAvis = Avis & {
  avisId: string;
}

function AvisForm() {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || text.trim() === '') return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, 'avis'), {
        text,
        userId: user.uid,
        userName: user.displayName,
        userPhotoURL: user.photoURL,
        createdAt: serverTimestamp(),
      });
      setText('');
      toast({ variant: 'success', title: 'Avis envoyé !' });
    } catch (error) {
      console.error('Error submitting avis:', error);
      toast({ variant: 'destructive', title: "Erreur lors de l'envoi" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="font-semibold mb-4">Laissez votre avis</h3>
      <div className="space-y-4">
        <NeumorphicCard inset className="p-4">
          <Textarea
            placeholder="Votre message..."
            className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSubmitting || !user}
          />
        </NeumorphicCard>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !user} className="btn-neumorphic-light dark:btn-neumorphic-dark">
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Envoi...' : 'Envoyer'}
          </Button>
        </div>
      </div>
    </form>
  )
}

function ReplyForm({ avisId, onReplySuccess }: { avisId: string, onReplySuccess: () => void }) {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || text.trim() === '') return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, 'avis', avisId, 'reponses'), {
        avisId,
        text,
        userId: user.uid,
        userName: user.displayName,
        userPhotoURL: user.photoURL,
        createdAt: serverTimestamp(),
      });
      setText('');
      toast({ variant: 'success', title: 'Réponse envoyée !' });
      onReplySuccess();
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast({ variant: 'destructive', title: "Erreur lors de l'envoi" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
     <form onSubmit={handleSubmit} className="mt-4 ml-8">
        <NeumorphicCard inset className="p-2">
            <Textarea
                placeholder="Votre réponse..."
                className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                value={text}
                onChange={e => setText(e.target.value)}
                disabled={isSubmitting || !user}
            />
        </NeumorphicCard>
        <div className="flex justify-end mt-2">
            <Button type="submit" size="sm" disabled={isSubmitting || !user} className="btn-neumorphic-light dark:btn-neumorphic-dark">
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Envoi...' : 'Envoyer'}
            </Button>
        </div>
     </form>
  )
}

function AvisItem({ avis }: { avis: Avis }) {
  const { firestore, user } = useFirebase();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const reponsesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'avis', avis.id, 'reponses'), orderBy('createdAt', 'asc')) : null, [firestore, avis.id]);
  const { data: reponses } = useCollection<ReponseAvis>(reponsesQuery);

  const formatRelativeTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'à l\'instant';
    return formatDistanceToNow(timestamp.toDate(), { addSuffix: true, locale: fr });
  }

  return (
     <NeumorphicCard className="p-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={avis.userPhotoURL || undefined} />
          <AvatarFallback>{avis.userName?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm">{avis.userName}</p>
          <p className="text-xs text-muted-foreground">{formatRelativeTime(avis.createdAt)}</p>
          <p className="text-sm mt-2">{avis.text}</p>
          <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-2" onClick={() => setShowReplyForm(!showReplyForm)} disabled={!user}>Répondre</Button>
        </div>
      </div>
      
      {reponses && reponses.length > 0 && (
         <div className="ml-8 mt-4 space-y-4">
           {reponses.map(reponse => (
             <div key={reponse.id} className="flex items-start gap-3">
                <CornerDownRight className="h-4 w-4 mt-1 text-muted-foreground shrink-0"/>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={reponse.userPhotoURL || undefined} />
                  <AvatarFallback>{reponse.userName?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{reponse.userName}</p>
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(reponse.createdAt)}</p>
                  <p className="text-sm mt-1">{reponse.text}</p>
                </div>
            </div>
           ))}
         </div>
      )}

      {showReplyForm && (
        <ReplyForm avisId={avis.id} onReplySuccess={() => setShowReplyForm(false)} />
      )}
     </NeumorphicCard>
  )
}

function AvisList() {
  const { firestore, user } = useFirebase();
  const avisQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'avis'), orderBy('createdAt', 'desc')) : null, [firestore]);
  const { data: avisList, isLoading } = useCollection<Avis>(avisQuery);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Avis récents</h3>
      {isLoading && <p>Chargement des avis...</p>}
      {avisList?.map(avis => (
        <AvisItem key={avis.id} avis={avis} />
      ))}
      {!isLoading && avisList?.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">Soyez le premier à laisser un avis !</p>
      )}
    </div>
  )
}

function ProfilePageContent() {
  const { auth, user } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/login');
    }
  };

  const handlePasswordReset = async () => {
    if (!auth || !user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({
        variant: "success",
        title: 'E-mail envoyé',
        description: 'Un lien pour réinitialiser votre mot de passe a été envoyé à votre adresse e-mail.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message,
      });
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name || name.length === 0) return '?';
    return name[0].toUpperCase();
  }

  const isAdmin = user?.email === 'grasdvirus@gmail.com';

  return (
    <div className="container mx-auto px-4 py-16 sm:py-24 space-y-8">
      <NeumorphicCard className="max-w-4xl mx-auto relative">
        {user && (
            <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className={cn(
                'rounded-full transition-all duration-300 absolute top-4 right-4',
                'dark:btn-neumorphic-dark btn-neumorphic-light'
            )}
            aria-label="Déconnexion"
            >
            <LogOut className="h-[1.2rem] w-[1.2rem]" />
            </Button>
        )}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0">
             <NeumorphicCard className="w-full h-full rounded-full p-2">
                <Avatar className='w-full h-full text-4xl'>
                    <AvatarImage src={user?.photoURL || '/favico.png'} alt={user?.displayName || 'Avatar'} />
                    <AvatarFallback className='bg-muted'>
                        {getInitials(user?.displayName)}
                    </AvatarFallback>
                </Avatar>
            </NeumorphicCard>
          </div>
          <div className="text-center sm:text-left w-full">
            <h1 className="text-4xl font-bold font-headline">{ user?.displayName || 'Jean Dupont' }</h1>
            <div className="mt-4 flex flex-col items-center sm:items-start gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{ user?.email || 'jean.dupont@email.com' }</span>
              </div>
               {user?.providerData.some(p => p.providerId === 'password') && (
                <Button onClick={handlePasswordReset} variant="outline" className="btn-neumorphic-light dark:btn-neumorphic-dark">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Réinitialiser le mot de passe
                </Button>
              )}
            </div>
          </div>
        </div>
      </NeumorphicCard>

      {isAdmin && (
        <NeumorphicCard className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold font-headline">Administration</h2>
                    <p className="text-muted-foreground text-sm mt-1">Accéder au panneau d'administration.</p>
                </div>
                <Button asChild variant="outline" className="btn-neumorphic-light dark:btn-neumorphic-dark">
                    <Link href="/admin">
                        <Shield className="mr-2 h-4 w-4" />
                        Panneau d'administration
                    </Link>
                </Button>
            </div>
        </NeumorphicCard>
      )}

      <NeumorphicCard className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold font-headline">Informations</h2>
                <p className="text-muted-foreground text-sm mt-1">En savoir plus sur notre projet.</p>
            </div>
            <Button asChild variant="outline" className="btn-neumorphic-light dark:btn-neumorphic-dark">
                <Link href="/about">
                    <Info className="mr-2 h-4 w-4" />
                    À propos de cristan
                </Link>
            </Button>
        </div>
      </NeumorphicCard>

      <NeumorphicCard className="max-w-4xl mx-auto">
        <div>
          <h2 className="text-xl font-bold font-headline">Fonctionnalités & Avis</h2>
          <p className="text-muted-foreground text-sm mt-1">Découvrez les nouveautés et partagez votre opinion.</p>
        </div>
        <Separator className="my-6" />

        <div className="space-y-6">
            <div>
                <h3 className="font-semibold mb-2">Nouvelle fonctionnalité : Thème Sombre Intelligent</h3>
                <p className="text-sm text-muted-foreground">
                    Votre application choisit désormais automatiquement entre le thème clair et le thème sombre en fonction de l'heure de la journée pour un confort visuel optimal.
                </p>
            </div>
             <Separator className="my-4" />
            <AvisForm />
            <Separator className="my-4" />
            <AvisList />
        </div>
      </NeumorphicCard>
    </div>
  );
}


export default function ProfilePage() {
    return (
        <AuthGuard>
            <ProfilePageContent />
        </AuthGuard>
    )
}
