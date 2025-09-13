
export type Contract = {
  id: string;
  name: string;
  firstname: string;
  email: string;
  phone: string;
  reason: string;
  createdAt: any; // Firestore Timestamp
  status: 'pending' | 'completed' | 'failed';
};
