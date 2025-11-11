
# Comment Résoudre l'Erreur de Connexion Google

Suivez ces étapes pour autoriser votre application à utiliser la connexion Google. Cela devrait prendre moins de 2 minutes.

### Étape 1 : Obtenir l'URL de votre application

L'URL de votre application est celle que vous voyez dans la barre d'adresse de votre navigateur. Elle ressemble à ceci :
`https://...cloudworkstations.dev`

**Copiez cette URL.**

### Étape 2 : Aller dans les Paramètres d'Authentification de Firebase

1.  Ouvrez la console Firebase de votre projet. Vous pouvez utiliser ce lien : [https://console.firebase.google.com/](https://console.firebase.google.com/)
2.  Dans le menu de gauche, cliquez sur **Authentication**.
3.  En haut de la page, cliquez sur l'onglet **Settings**.



### Étape 3 : Ajouter le Domaine Autorisé

1.  Dans l'onglet **Settings**, cliquez sur la sous-section **Authorized domains**.
2.  Cliquez sur le bouton **Add domain**.
3.  Dans le champ qui apparaît, **collez l'URL de votre application** que vous avez copiée à l'étape 1. Assurez-vous de coller uniquement le nom de domaine, sans `https://`. Par exemple : `votre-longue-url.cloudworkstations.dev`
4.  Cliquez sur **Add**.



### Étape 4 : Tester la Connexion

C'est tout ! Retournez sur votre application et essayez de vous connecter avec Google. L'erreur devrait avoir disparu.

Si le problème persiste, rafraîchissez la page de votre application (CTRL+R ou CMD+R) avant de réessayer.
