
export type Video = {
    id: string;
    title: string;
    thumbnailId: string;
    uploadDate: string;
    views: number;
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
  },
  {
    id: 'video-2',
    title: 'Tutoriel : Le Neumorphisme en CSS',
    thumbnailId: 'project-2',
    uploadDate: 'Il y a 1 mois',
    views: formatViews(48200),
  },
   {
    id: 'video-3',
    title: 'Les secrets d\'un Portfolio qui convertit',
    thumbnailId: 'project-3',
    uploadDate: 'Il y a 3 mois',
    views: formatViews(112000),
  },
  {
    id: 'video-4',
    title: 'Data-visualisation : Nos meilleurs outils',
    thumbnailId: 'project-4',
    uploadDate: 'Il y a 6 mois',
    views: formatViews(7500),
  }
];
