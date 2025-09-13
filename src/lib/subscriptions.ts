
export type SubscriptionPlanId = '24h' | '1w' | '1m';

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  name: string;
  price: number;
  features: string[];
};

export type SubscriptionPlans = {
  '24h': SubscriptionPlan;
  '1w': SubscriptionPlan;
  '1m': SubscriptionPlan;
};

export type Subscription = {
  id: string;
  userId: string;
  userEmail: string;
  plan: SubscriptionPlanId;
  amount: number;
  transactionId: string;
  createdAt: any; // Firestore Timestamp
  expiryDate?: any; // Firestore Timestamp, set on confirmation
  status: 'pending' | 'active' | 'expired';
};
