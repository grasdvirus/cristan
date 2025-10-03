
export type Video = {
    id: string;
    title: string;
    thumbnailId: string;
    uploadDate: string;
    views: number;
    description: string;
    videoUrl: string;
};

function formatViews(views: number): string {
    if (views >= 1_000_000) {
        return (views / 1_000_000).toFixed(1).replace('.', ',') + ' M de vues';
    }
    if (views >= 1_000) {
        return (views / 1_000).toFixed(0) + ' k vues';
    }
    return views + ' vues';
}

export const videosData: (Omit<Video, 'views'> & { views: number | string })[] = [
  {
    id: 'video-1',
    title: 'Démo : Créer un site vitrine avec Next.js',
    thumbnailId: 'project-1',
    uploadDate: 'Il y a 2 semaines',
    views: formatViews(12500),
    description: "Apprenez à construire un site vitrine moderne et performant de A à Z avec Next.js 14, Tailwind CSS et le déploiement sur Vercel. Ce tutoriel couvre les bases du App Router, la création de composants réutilisables et les meilleures pratiques pour le SEO.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: 'video-2',
    title: 'Tutoriel : Le Neumorphisme en CSS',
    thumbnailId: 'project-2',
    uploadDate: 'Il y a 1 mois',
    views: formatViews(48200),
    description: "Plongez dans la tendance du Neumorphisme et découvrez comment créer des interfaces utilisateur douces et élégantes en utilisant uniquement du CSS. Nous explorons les ombres, les lumières et les techniques pour donner vie à ce style unique.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
   {
    id: 'video-3',
    title: 'Les secrets d\'un Portfolio qui convertit',
    thumbnailId: 'project-3',
    uploadDate: 'Il y a 3 mois',
    views: formatViews(112000),
    description: "Votre portfolio est votre meilleur atout. Dans cette vidéo, je partage des conseils essentiels sur la structure, le contenu et le design pour créer un portfolio qui non seulement met en valeur vos compétences, mais qui attire aussi des clients.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: 'video-4',
    title: 'Data-visualisation : Nos meilleurs outils',
    thumbnailId: 'project-4',
    uploadDate: 'Il y a 6 mois',
    views: formatViews(7500),
    description: "Transformer des données brutes en graphiques percutants est un art. Nous passons en revue les meilleures bibliothèques et outils de data-visualisation (D3.js, Recharts, etc.) pour vous aider à raconter des histoires avec vos données.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  }
];
