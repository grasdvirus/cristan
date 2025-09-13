
export type PaymentMethod = {
    id: string;
    name: string;
    details: string;
    color: string;
};

export type PaymentDetails = {
  methods: PaymentMethod[];
};
