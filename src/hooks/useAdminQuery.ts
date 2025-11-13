import { useFirebase } from '@/firebase';
import { useEffect, useState } from 'react';

export function useAdminQuery<T>(
  queryFn: () => any, // La fonction qui fait la requête Firestore
  dependencies: any[] = []
) {
  const { user, isUserLoading } = useFirebase();
  const [shouldExecute, setShouldExecute] = useState(false);
  
  const isAdmin = user?.email === 'grasdvirus@gmail.com';

  useEffect(() => {
    // N'exécute la requête que si l'utilisateur est admin ET chargé
    if (!isUserLoading && isAdmin) {
      setShouldExecute(true);
    } else {
      setShouldExecute(false);
    }
  }, [isUserLoading, isAdmin]);

  // Retourne null si pas admin, sinon retourne la référence de la requête
  return shouldExecute ? queryFn() : null;
}
