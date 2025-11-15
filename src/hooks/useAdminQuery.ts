import { useFirebase } from '@/firebase';
import { useEffect, useState } from 'react';

export function useAdminQuery<T>(
  queryFn: () => T, // La fonction qui fait la requête Firestore
  dependencies: any[] = []
): T | null {
  const { user, isUserLoading } = useFirebase();
  const [shouldExecute, setShouldExecute] = useState(false);
  
  const isAdmin = user?.email === 'grasdvirus@gmail.com';

  useEffect(() => {
    if (!isUserLoading && isAdmin) {
      setShouldExecute(true);
    } else if (!isUserLoading && !isAdmin) {
      setShouldExecute(false);
    }
  }, [isUserLoading, isAdmin, ...dependencies]);

  if (shouldExecute) {
    return queryFn();
  }

  return null;
}
