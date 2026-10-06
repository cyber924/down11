
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [instances, setInstances] = useState<{
    firebaseApp: FirebaseApp;
    firestore: Firestore;
    auth: Auth;
  } | null>(null);

  useEffect(() => {
    setInstances(initializeFirebase());
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={instances?.firebaseApp ?? null}
      firestore={instances?.firestore ?? null}
      auth={instances?.auth ?? null}
    >
      {children}
    </FirebaseProvider>
  );
}
