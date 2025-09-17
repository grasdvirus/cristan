
export type AdminReply = {
    text: string;
    createdAt: any; // Date or Firestore Timestamp
}

export type FeatureFeedback = {
  id: string;
  authorId: string;
  authorEmail: string;
  text: string;
  createdAt: any; // Date or Firestore Timestamp
  adminReply?: AdminReply;
};

export type Feature = {
  id: string;
  title: string;
  description: string;
  createdAt: any; // Firestore Timestamp
  feedback: FeatureFeedback[];
};
