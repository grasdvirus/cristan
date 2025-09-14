
export type FAQItem = {
    id: string;
    question: string;
    answer: string;
};

export type AboutContent = {
    history: string;
    howItWorks: string;
    faqs: FAQItem[];
};
