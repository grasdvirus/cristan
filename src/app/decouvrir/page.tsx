

'use client'

import { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProductCollections, useInternetClasses, useTvChannels } from '@/lib/data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Filter, Loader2, ArrowRight, Clock, Star as StarIcon } from 'lucide-react';
import { ContactForm } from '@/components/contact-form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/products';
import type { Video } from '@/lib/videos';
import { useProducts } from '@/hooks/use-products';
import { useVideos } from '@/hooks/use-videos';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

type Category = 'all' | 'internet' | 'tv' | 'contrat';
type SubFilter = 'all' | 'recommended' | string;

const categories: { id: Category, label: string }[] = [
    { id: 'all', label: 'Produit' },
    { id: 'internet', label: 'Internet' },
    { id: 'tv', label: 'TV' },
    { id: 'contrat', label: 'Contrat' },
];

function formatViews(num: number) {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    return num.toString();
}

function ProductCard({ product }: { product: Product }) {
    const router = useRouter();
    const [isActive, setIsActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        if (isActive && product.shortPreviewUrl) {
            videoElement.currentTime = 0;
            const playPromise = videoElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    if (error.name !== 'AbortError') {
                        console.error("Autoplay error:", error);
                    }
                });
            }
        } else {
            videoElement.pause();
        }
    }, [isActive, product.shortPreviewUrl]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
                setIsActive(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInteractionStart = () => !isActive && setIsActive(true);
    const handleInteractionEnd = () => isActive && setIsActive(false);

    const handleClick = (e: React.MouseEvent) => {
        if (!product.shortPreviewUrl || !isTouchDevice) {
            router.push(`/artwork/${product.id}`);
            return;
        }

        if (!isActive) {
            e.preventDefault();
            setIsActive(true);
        }
    };
    
    return (
        <div ref={cardRef} className="break-inside-avoid">
            <Link
                href={`/artwork/${product.id}`}
                onClick={handleClick}
                onMouseEnter={!isTouchDevice ? handleInteractionStart : undefined}
                onMouseLeave={!isTouchDevice ? handleInteractionEnd : undefined}
                className="group block"
            >
                <Card className="overflow-hidden group-hover:shadow-primary/20 transition-all duration-300 flex flex-col h-full">
                    <CardContent className="p-0 relative">
                        <div className="aspect-[4/3] overflow-hidden">
                             {isActive && product.shortPreviewUrl ? (
                                <video
                                    ref={videoRef}
                                    src={product.shortPreviewUrl}
                                    muted
                                    loop
                                    playsInline
                                    className="object-cover w-full h-full transition-all duration-300"
                                    preload="metadata"
                                />
                            ) : (
                                product.mediaUrls && product.mediaUrls.length > 0 ? (
                                    <Image 
                                        src={product.mediaUrls[0]} 
                                        alt={product.title} 
                                        width={600} 
                                        height={400} 
                                        className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105" 
                                        data-ai-hint={product.dataAiHint} 
                                    />
                                ) : (
                                    <div className="flex aspect-[4/3] items-center justify-center bg-muted">
                                        <span className="text-sm text-muted-foreground">Pas d'image</span>
                                    </div>
                                )
                            )}
                        </div>
                        {product.isRecommended && <Badge className="absolute top-2 left-2 pointer-events-none" variant="destructive"><StarIcon className="h-3 w-3 mr-1" /> Recommandé</Badge>}
                    </CardContent>
                    <CardHeader className="p-4 flex-grow">
                        <CardTitle className="text-base font-medium line-clamp-2">{product.title}</CardTitle>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0">
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-primary">{new Intl.NumberFormat('fr-FR').format(product.price)} FCFA</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-sm text-muted-foreground line-through">
                                    {new Intl.NumberFormat('fr-FR').format(product.originalPrice)} FCFA
                                </span>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </Link>
        </div>
    );
}

function TVCard({ video }: { video: Video }) {
    const router = useRouter();
    const [isActive, setIsActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        if (isActive && video.shortPreviewUrl) {
            videoElement.currentTime = 0;
            const playPromise = videoElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    if (error.name !== 'AbortError') {
                        console.error("Autoplay error:", error);
                    }
                });
            }
        } else {
            videoElement.pause();
        }
    }, [isActive, video.shortPreviewUrl]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
                setIsActive(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const handleInteractionStart = () => !isActive && setIsActive(true);
    const handleInteractionEnd = () => isActive && setIsActive(false);

    const handleClick = (e: React.MouseEvent) => {
        // If there's no preview, or if on desktop, navigate immediately.
        if (!video.shortPreviewUrl || !isTouchDevice) {
            router.push(`/video/${video.id}`);
            return;
        }

        // On touch device:
        if (!isActive) {
            // 1st tap: prevent navigation, activate preview.
            e.preventDefault();
            setIsActive(true);
        }
        // 2nd tap: will proceed with navigation as isActive is true.
    };

    return (
        <div ref={cardRef}>
            <Link
                href={`/video/${video.id}`}
                onClick={handleClick}
                onMouseEnter={!isTouchDevice ? handleInteractionStart : undefined}
                onMouseLeave={!isTouchDevice ? handleInteractionEnd : undefined}
                className="group block"
                aria-label={video.title}
            >
                <Card className="overflow-hidden h-full flex flex-col transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/20">
                    <CardContent className="p-0 relative">
                        <div className="aspect-video overflow-hidden">
                             {isActive && video.shortPreviewUrl ? (
                                <video
                                    ref={videoRef}
                                    src={video.shortPreviewUrl}
                                    muted
                                    loop
                                    playsInline
                                    className="object-cover w-full h-full transition-all duration-300"
                                    preload="metadata"
                                />
                            ) : (
                                video.imageUrl ? (
                                    <Image
                                        src={video.imageUrl}
                                        alt={video.title}
                                        width={600}
                                        height={400}
                                        className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
                                        data-ai-hint={video.dataAiHint}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center" />
                                )
                            )}
                            {video.duration && (
                                <Badge variant="secondary" className="absolute bottom-2 right-2 flex items-center gap-1 pointer-events-none">
                                    <Clock className="h-3 w-3" />
                                    {video.duration} min
                                </Badge>
                            )}
                            {video.isPaid && (
                                <Badge className="absolute top-2 left-2 flex items-center gap-1 pointer-events-none">
                                    <StarIcon className="h-3 w-3" />
                                    Payant
                                </Badge>
                            )}
                            {video.isRecommended && <Badge className="absolute top-2 right-2 pointer-events-none" variant="destructive"><StarIcon className="h-3 w-3 mr-1" /> Recommandé</Badge>}
                        </div>
                    </CardContent>
                    <CardHeader className="p-4 flex-grow">
                        <CardTitle className="text-lg font-semibold line-clamp-2">{video.title}</CardTitle>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0">
                        <div className="text-xs text-muted-foreground">
                            <span>{formatViews(video.views)} vues</span>
                            <span className="mx-1.5">•</span>
                            <span>{video.uploadDate ? format(new Date(video.uploadDate), "d MMM yyyy", { locale: fr }) : ''}</span>
                        </div>
                    </CardFooter>
                </Card>
            </Link>
        </div>
    );
}

function DecouvrirContent() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category') as Category;

    const [activeCategory, setActiveCategory] = useState<Category>(initialCategory && categories.some(c => c.id === initialCategory) ? initialCategory : 'all');
    const [activeSubFilter, setActiveSubFilter] = useState<SubFilter>('all');
    const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
    
    const { products, loading: loadingProducts, error: productsError } = useProducts();
    const { videos, loading: loadingVideos, error: videosError } = useVideos();
    
    const productCollections = useProductCollections();
    const internetClasses = useInternetClasses();
    const tvChannels = useTvChannels();
    
    const loadingDataFromStore = !productCollections.length || !internetClasses.length || !tvChannels.length;
    
    const loading = loadingProducts || loadingVideos || loadingDataFromStore;
    const error = productsError || videosError;

    useEffect(() => {
        const categoryFromUrl = searchParams.get('category') as Category;
        if (categoryFromUrl && categories.some(c => c.id === categoryFromUrl)) {
            setActiveCategory(categoryFromUrl);
        }
        setActiveSubFilter('all');
    }, [searchParams]);

    const currentFilters = useMemo(() => {
        switch (activeCategory) {
            case 'all': return productCollections;
            case 'internet': return internetClasses;
            case 'tv': return tvChannels;
            default: return [];
        }
    }, [activeCategory, productCollections, internetClasses, tvChannels]);

    const sortedProducts = useMemo(() => {
        return [...products].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }, [products]);

    const sortedVideos = useMemo(() => {
        return [...videos].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }, [videos]);

    const filteredProducts = useMemo(() => {
        return sortedProducts.filter(product => {
            if (activeSubFilter === 'recommended') {
                 if (activeCategory === 'all' && product.collection) return product.isRecommended;
                 if (activeCategory === 'internet' && product.internetClass) return product.isRecommended;
                 return false;
            }
            if (activeCategory === 'all') return product.collection && (activeSubFilter === 'all' || product.collection === activeSubFilter);
            if (activeCategory === 'internet') return product.internetClass && (activeSubFilter === 'all' || product.internetClass === activeSubFilter);
            return false;
        });
    }, [sortedProducts, activeCategory, activeSubFilter]);

    const filteredVideos = useMemo(() => {
        return sortedVideos.filter(video => {
            if (activeCategory !== 'tv') return false;
            if (activeSubFilter === 'recommended') return video.isRecommended;
            return activeSubFilter === 'all' || video.channel === activeSubFilter;
        });
    }, [sortedVideos, activeCategory, activeSubFilter]);

    const handleSubFilterChange = (filterId: SubFilter) => {
        setActiveSubFilter(filterId);
        setFilterPopoverOpen(false);
    };

    const FilterButton = () => {
        if (!['all', 'internet', 'tv'].includes(activeCategory)) return null;
        
        const getActiveFilterLabel = () => {
            if (activeSubFilter === 'all') return 'Filtre';
            if (activeSubFilter === 'recommended') return 'Les Plus Recommandés';
            return currentFilters.find(f => f.id === activeSubFilter)?.label || 'Filtre';
        }

        return (
            <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="rounded-full">
                        <Filter className="mr-2 h-4 w-4" />
                        {getActiveFilterLabel()}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2">
                    <div className="flex flex-col space-y-1">
                        <Button variant={activeSubFilter === 'all' ? 'secondary' : 'ghost'} onClick={() => handleSubFilterChange('all')} className="justify-start px-2">
                            Toutes les catégories
                        </Button>
                        <Button variant={activeSubFilter === 'recommended' ? 'secondary' : 'ghost'} onClick={() => handleSubFilterChange('recommended')} className="justify-start px-2">
                            <StarIcon className="mr-2 h-4 w-4 text-yellow-500" />
                            Les Plus Recommandés
                        </Button>
                        {currentFilters.map((filter) => (
                            <Button key={filter.id} variant={activeSubFilter === filter.id ? 'secondary' : 'ghost'} onClick={() => handleSubFilterChange(filter.id)} className="justify-start px-2">
                                {filter.label}
                            </Button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        )
    }
    
    const renderContent = () => {
        if(loading) {
            return null;
        }

        if (error) {
            return <div className="text-center text-red-500">Erreur: {error}</div>
        }

        if (activeCategory === 'all' || activeCategory === 'internet') {
             return (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )
        }
        if (activeCategory === 'tv') {
            return (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVideos.map(video => (
                        <TVCard key={video.id} video={video} />
                    ))}
                </div>
            )
        }
         if (activeCategory === 'contrat') {
            return (
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader><CardTitle className="font-headline text-3xl text-center text-primary">Devenez Partenaire</CardTitle><p className="text-center text-muted-foreground">Remplissez ce formulaire pour discuter d'une collaboration.</p></CardHeader>
                        <CardContent><ContactForm partnerForm={true} /></CardContent>
                    </Card>
                </div>
            )
         }
         return null;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
                <div className="flex items-center gap-2 rounded-full p-1 bg-card border">
                     {categories.map((category) => (
                        <Button key={category.id} variant={activeCategory === category.id ? 'default' : 'ghost'} onClick={() => setActiveCategory(category.id)} className="rounded-full px-6 transition-all">{category.label}</Button>
                    ))}
                </div>
                <FilterButton />
            </div>
            {renderContent()}
        </div>
    );
}

export default function DecouvrirPage() {
    return (
        <Suspense fallback={null}>
            <DecouvrirContent />
        </Suspense>
    )
}
