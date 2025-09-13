
'use client';

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, Fingerprint, LogIn, LayoutGrid } from "lucide-react";
import Link from 'next/link';

export default function ProfilePage() {
  const { user, signOutUser, loading } = useAuth();

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-[400px]">
              <Fingerprint className="h-10 w-10 text-primary animate-pulse" />
          </div>
      )
  }

  return (
    <div className="flex justify-center items-start py-8">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary rounded-full p-4 w-fit mb-4">
                <User className="h-10 w-10 text-primary-foreground" />
            </div>
            <CardTitle className="font-headline text-4xl text-primary">Votre Profil</CardTitle>
            <CardDescription className="text-lg">
                Gérez les informations de votre compte.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
           {user ? (
                <div className="space-y-4 text-center">
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold">Bienvenue !</h3>
                        <p className="text-muted-foreground break-words">{user.email}</p>
                    </div>

                    <div className="flex flex-col gap-3 max-w-xs mx-auto">
                        {user.email === 'grasdvirus@gmail.com' && (
                            <Button asChild variant="secondary">
                                <Link href="/admin">
                                    <LayoutGrid className="mr-2 h-4 w-4" />
                                    Panneau d'Administration
                                </Link>
                            </Button>
                        )}
                        <Button onClick={signOutUser}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Se déconnecter
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 text-center">
                     <div className="space-y-2">
                        <h3 className="text-xl font-semibold">Vous n'êtes pas connecté</h3>
                        <p className="text-muted-foreground">Créez un compte ou connectez-vous pour accéder à votre profil.</p>
                    </div>
                    <Button asChild className="w-full max-w-xs mx-auto">
                        <Link href="/login">
                            <LogIn className="mr-2 h-4 w-4" />
                            Inscription / Connexion
                        </Link>
                    </Button>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
