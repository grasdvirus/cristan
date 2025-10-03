
export type Project = {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    price: string;
    technologies: string[];
    liveUrl?: string;
};

export const projectsData: Project[] = [
  {
    id: 'project-1',
    title: 'Site Vitrine Moderne',
    description: 'Un site élégant pour présenter votre entreprise, optimisé pour le SEO et les mobiles.',
    longDescription: 'Ce site vitrine est la solution idéale pour toute entreprise souhaitant établir une présence en ligne professionnelle. Le design est épuré, moderne et entièrement responsive, assurant une expérience utilisateur parfaite sur tous les appareils. Nous intégrons les meilleures pratiques de SEO pour améliorer votre visibilité sur les moteurs de recherche.',
    price: 'Prix: 785 000 FCFA',
    technologies: ['Next.js', 'React', 'Tailwind CSS', 'Vercel'],
    liveUrl: '#',
  },
  {
    id: 'project-2',
    title: 'Application Web E-commerce',
    description: 'Une plateforme de vente en ligne complète avec gestion des stocks et paiement sécurisé.',
    longDescription: 'Lancez votre boutique en ligne avec notre solution e-commerce robuste et évolutive. Elle inclut un back-office complet pour la gestion de vos produits, de vos commandes et de vos clients. Les paiements en ligne sont sécurisés via des intégrations avec Stripe ou des solutions locales. Le design est personnalisable pour correspondre à votre marque.',
    price: 'Prix: 2 300 000 FCFA',
    technologies: ['Next.js', 'Firebase', 'Stripe', 'Redux', 'TypeScript'],
    liveUrl: '#',
  },
  {
    id: 'project-3',
    title: 'Portfolio pour Créatifs',
    description: 'Mettez en valeur vos créations avec ce portfolio au design minimaliste et percutant.',
    longDescription: 'Conçu pour les photographes, designers, et artistes, ce portfolio met l\'accent sur vos œuvres. La navigation est intuitive et le design minimaliste ne distrait pas du contenu principal. Une galerie d\'images élégante et des animations fluides captiveront vos visiteurs.',
    price: 'Prix: 525 000 FCFA',
    technologies: ['React', 'Gatsby', 'Contentful', 'GraphQL', 'Netlify'],
    liveUrl: '#',
  },
  {
    id: 'project-4',
    title: 'Tableau de Bord Analytique',
    description: 'Visualisez vos données clés avec un tableau de bord interactif et personnalisable.',
    longDescription: 'Prenez des décisions éclairées grâce à un tableau de bord qui centralise et visualise vos données. Connectez plusieurs sources de données, créez des graphiques personnalisés et suivez vos indicateurs de performance clés (KPIs) en temps réel. L\'interface est conçue pour être à la fois puissante et facile à utiliser.',
    price: 'Sur devis',
    technologies: ['React', 'D3.js', 'Node.js', 'PostgreSQL', 'Docker'],
    liveUrl: '#',
  },
];
