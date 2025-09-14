
'use client';

import { useState, useEffect, ChangeEvent, useRef } from 'react';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/components/auth-provider';
import type { Product } from '@/lib/products';
import type { Slide } from '@/lib/slides';
import type { Contract } from '@/lib/contracts';
import type { Video } from '@/lib/videos';
import type { Order } from '@/lib/orders';
import type { Subscription, SubscriptionPlans, SubscriptionPlanId } from '@/lib/subscriptions';
import type { PaymentDetails, PaymentMethod } from '@/lib/payment';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useCategoryStore } from '@/lib/data';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger } from '@/components/ui/sidebar';
import { Loader2, ChevronDown, Trash2, PlusCircle, Save, CheckCircle, AlertTriangle, Upload, Inbox, FileText, ShoppingCart, SlidersHorizontal, Users, Newspaper, Grip, LayoutDashboard, Home as HomeIcon, Globe, Tv, Video as VideoIcon, CreditCard, ShoppingBag, Eye, Star, Crown, Tag, Lock, Youtube } from "lucide-react";
import { useProducts } from '@/hooks/use-products';
import { useSlides } from '@/hooks/use-slides';
import { useContracts } from '@/hooks/use-contracts';
import { useVideos } from '@/hooks/use-videos';
import { useOrders } from '@/hooks/use-orders';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import Link from 'next/link';
import { Progress } from "@/components/ui/progress";
import { produce } from 'immer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';


type CategoryItem = { id: string; label: string };
type AllCategories = {
    articleCategories: CategoryItem[];
    productCollections: CategoryItem[];
    internetClasses: CategoryItem[];
    tvChannels: CategoryItem[];
}

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';
type ActiveView = 'articles' | 'products' | 'internet' | 'tv' | 'slides' | 'contracts' | 'orders' | 'subscriptions' | 'subscriptionPrices' | 'categories' | 'payment';


async function updateProductsClient(products: Product[]): Promise<void> {
  const productsCollection = collection(db, 'products');
  const batch = writeBatch(db);

  const existingDocsSnapshot = await getDocs(productsCollection);
  const existingIds = new Set(existingDocsSnapshot.docs.map(doc => doc.id));

  products.forEach(product => {
    const { id, ...data } = product;
    // Firestore does not accept 'undefined' values.
    const sanitizedData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));

    const docRef = doc(db, 'products', id);
    batch.set(docRef, sanitizedData);
    existingIds.delete(id);
  });

  existingIds.forEach(idToDelete => {
    batch.delete(doc(db, 'products', idToDelete));
  });

  await batch.commit();
}

async function updateSlidesClient(slides: Slide[]): Promise<void> {
  const slidesCollection = collection(db, 'slides');
  const batch = writeBatch(db);

  const existingDocsSnapshot = await getDocs(slidesCollection);
  const existingIds = new Set(existingDocsSnapshot.docs.map(doc => doc.id));

  slides.forEach(slide => {
    const { id, ...data } = slide;
    const docRef = doc(db, 'slides', id);
    batch.set(docRef, data);
    existingIds.delete(id);
  });

  existingIds.forEach(idToDelete => {
    batch.delete(doc(db, 'slides', idToDelete));
  });

  await batch.commit();
}

async function updateVideosClient(videos: Video[]): Promise<void> {
  const videosCollection = collection(db, 'videos');
  const batch = writeBatch(db);

  const existingDocsSnapshot = await getDocs(videosCollection);
  const existingIds = new Set(existingDocsSnapshot.docs.map(doc => doc.id));

  videos.forEach(video => {
    const { id, ...data } = video;
    const docRef = doc(db, 'videos', id);
    batch.set(docRef, data);
    existingIds.delete(id);
  });

  existingIds.forEach(idToDelete => {
    batch.delete(doc(db, 'videos', idToDelete));
  });

  await batch.commit();
}

async function updateCategoriesClient(categories: AllCategories): Promise<void> {
    const categoriesDocRef = doc(db, 'config', 'categories');
    await setDoc(categoriesDocRef, categories, { merge: true });
}

async function updatePaymentDetailsClient(details: PaymentDetails): Promise<void> {
    const paymentDocRef = doc(db, 'config', 'payment');
    await setDoc(paymentDocRef, details, { merge: true });
}

async function fetchPaymentDetailsClient(): Promise<PaymentDetails> {
    const paymentDocRef = doc(db, 'config', 'payment');
    const docSnap = await getDoc(paymentDocRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        // Ensure 'methods' is always an array
        return { methods: data.methods || [] };
    }
    // Return default structure
    return { 
        methods: [
            { id: '1', name: 'ORANGE MONEY', details: '', color: '#FFA500' },
            { id: '2', name: 'WAVE', details: '', color: '#4DD2FF' },
        ]
    };
}

async function fetchSubscriptionPlansClient(): Promise<SubscriptionPlans> {
    const plansDocRef = doc(db, 'config', 'subscriptionPlans');
    const docSnap = await getDoc(plansDocRef);
    if (docSnap.exists()) {
        return docSnap.data() as SubscriptionPlans;
    }
    // Return default structure
    return {
      '24h': { id: '24h', name: '24 Heures', price: 1000, features: ['Accès complet', 'Qualité HD'] },
      '1w': { id: '1w', name: '1 Semaine', price: 5000, features: ['Accès complet', 'Qualité HD', 'Hors ligne'] },
      '1m': { id: '1m', name: '1 Mois', price: 15000, features: ['Accès complet', 'Qualité HD', 'Hors ligne', 'Support prioritaire'] }
    };
}

async function updateSubscriptionPlansClient(plans: SubscriptionPlans): Promise<void> {
    const plansDocRef = doc(db, 'config', 'subscriptionPlans');
    await setDoc(plansDocRef, plans, { merge: true });
}


function FileUpload({ value, onChange, label, acceptedFileTypes, mediaType = 'image' }: { value: string, onChange: (url: string) => void, label: string, acceptedFileTypes: string, mediaType?: 'image' | 'video' }) {
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadProgress(0);
        
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload', true);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const progress = (event.loaded / event.total) * 100;
                setUploadProgress(progress);
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                onChange(response.url);
                toast({ title: `${mediaType === 'image' ? 'Image' : 'Vidéo'} téléversée`, description: `Le fichier a été téléversé avec succès.` });
            } else {
                console.error("Upload error:", xhr.responseText);
                toast({ variant: 'destructive', title: 'Erreur de téléversement', description: 'Une erreur est survenue.' });
            }
            setUploadProgress(null);
        };

        xhr.onerror = () => {
            console.error("Upload error:", xhr.statusText);
            toast({ variant: 'destructive', title: 'Erreur de téléversement', description: xhr.statusText });
            setUploadProgress(null);
        };

        xhr.send(formData);
    };

    const isUploading = uploadProgress !== null;
    const canShowPreview = value && !isUploading;

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="relative w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/20 overflow-hidden">
                {canShowPreview ? (
                    mediaType === 'image' ? (
                       value && <Image src={value} alt="Aperçu" fill={true} className="object-contain rounded-lg" />
                    ) : (
                         value.startsWith('/uploads/') && <video src={value} controls className="object-contain rounded-lg max-h-full max-w-full" />
                    )
                ) : (
                    !isUploading && <span className="text-sm text-muted-foreground">Aucun fichier</span>
                )}
                 {isUploading && (
                    <div className="w-full px-4 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Téléversement...</p>
                        <Progress value={uploadProgress} className="w-full" />
                        <p className="text-xs text-muted-foreground mt-1">{Math.round(uploadProgress!)}%</p>
                    </div>
                )}
                <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    className="absolute top-2 right-2 z-10"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    {isUploading ? <Loader2 className="animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
            </div>
            <Input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept={acceptedFileTypes}
                disabled={isUploading}
            />
        </div>
    );
}

function AdminContent() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    
    const { products, setProducts, loading: loadingProducts } = useProducts();
    const { slides, setSlides, loading: loadingSlides } = useSlides();
    const { contracts, setContracts, loading: loadingContracts } = useContracts();
    const { videos, setVideos, loading: loadingVideos } = useVideos();
    const { orders, setOrders, loading: loadingOrders } = useOrders();
    const { subscriptions, setSubscriptions, loading: loadingSubscriptions } = useSubscriptions();
    
    // Global category state from Zustand
    const { articleCategories, productCollections, internetClasses, tvChannels, loading: loadingCategories, fetchCategories } = useCategoryStore();
    
    // Local state for editing categories and payment
    const [localCategories, setLocalCategories] = useState<AllCategories>({ articleCategories: [], productCollections: [], internetClasses: [], tvChannels: [] });
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({ methods: [] });
    const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlans | null>(null);
    const [loadingPayment, setLoadingPayment] = useState(true);
    const [loadingPlans, setLoadingPlans] = useState(true);
        
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [hasChanges, setHasChanges] = useState(false);
    const [activeView, setActiveView] = useState<ActiveView>('articles');
    const [passwordInput, setPasswordInput] = useState('');
    const [isPaymentUnlocked, setIsPaymentUnlocked] = useState(false);
    const [isSubsPriceUnlocked, setIsSubsPriceUnlocked] = useState(false);
    
    const loadingData = authLoading || loadingProducts || loadingSlides || loadingContracts || loadingVideos || loadingCategories || loadingOrders || loadingSubscriptions || loadingPayment || loadingPlans;

    useEffect(() => {
        if (user && user.email !== 'grasdvirus@gmail.com') {
            // This case is handled in the main component return
        }
    }, [user]);

    // Sync local category state with global Zustand store once loaded
    useEffect(() => {
        if (!loadingCategories) {
            setLocalCategories({
                articleCategories: articleCategories || [],
                productCollections: productCollections || [],
                internetClasses: internetClasses || [],
                tvChannels: tvChannels || []
            });
        }
    }, [loadingCategories, articleCategories, productCollections, internetClasses, tvChannels]);


    // Fetch payment details and subscription plans
    useEffect(() => {
        setLoadingPayment(true);
        fetchPaymentDetailsClient().then(details => {
            setPaymentDetails(details);
            setLoadingPayment(false);
        }).catch(() => {
            setPaymentDetails({ methods: [] });
            setLoadingPayment(false);
        });

        setLoadingPlans(true);
        fetchSubscriptionPlansClient().then(plans => {
            setSubscriptionPlans(plans);
            setLoadingPlans(false);
        }).catch(() => {
            setSubscriptionPlans(null);
            setLoadingPlans(false);
        });
    }, []);

    const updateProduct = (id: string, field: keyof Product, value: any) => {
        setProducts(produce(draft => {
            const product = draft.find(p => p.id === id);
            if (product) {
                (product as any)[field] = value;
            }
        }));
        setHasChanges(true);
    };

     const updateProductImage = (id: string, index: number, url: string) => {
        setProducts(prev => prev.map(p => {
            if (p.id === id) {
                const newImageUrls = [...(p.imageUrls || [])];
                newImageUrls[index] = url;
                return { ...p, imageUrls: newImageUrls };
            }
            return p;
        }));
        setHasChanges(true);
    };
    
    const addProduct = ({ isArticle, isInternet, isShop }: { isArticle?: boolean; isInternet?: boolean, isShop?: boolean }) => {
        const newProduct: Product = {
            id: uuidv4(),
            title: 'Nouveau Produit',
            description: '',
            imageUrls: [],
            dataAiHint: '',
            price: 0,
            ...(isShop && { collection: productCollections[0]?.id || '' }),
            ...(isInternet && { 
                internetClass: internetClasses[0]?.id || '',
                redirectUrl: ''
            }),
            ...(isArticle && { articleCategory: articleCategories[0]?.id || '' })
        };
        setProducts(prev => [newProduct, ...prev]);
        setHasChanges(true);
    };


    const deleteProduct = (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
        setHasChanges(true);
    };
    
    const updateSlide = (id: string, field: keyof Slide, value: any) => {
        setSlides(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
        setHasChanges(true);
    };

    const addSlide = () => {
        const newSlide: Slide = {
            id: uuidv4(),
            title: 'Nouveau Slide',
            subtitle: '',
            imageUrl: '',
            dataAiHint: ''
        };
        setSlides(prev => [newSlide, ...prev]);
        setHasChanges(true);
    };

    const deleteSlide = (id: string) => {
        setSlides(prev => prev.filter(s => s.id !== id));
        setHasChanges(true);
    };
    
     const updateVideo = (id: string, field: keyof Video, value: any) => {
        setVideos(produce(draft => {
            const video = draft.find(v => v.id === id);
            if (video) {
                if (field.startsWith('creator.')) {
                    const creatorField = field.split('.')[1] as keyof Video['creator'];
                    (video.creator as any)[creatorField] = value;
                } else {
                    (video as any)[field] = value;
                }
            }
        }));
        setHasChanges(true);
    };

    const addVideo = () => {
        const newVideo: Video = {
            id: uuidv4(),
            title: 'Nouvelle Vidéo',
            description: '',
            imageUrl: '',
            dataAiHint: '',
            src: '',
            views: 0,
            channel: tvChannels[0]?.id || '',
            uploadDate: new Date().toISOString(),
            creator: {
                name: 'Artisan Codeur',
                avatar: '',
                subscribers: 0,
            },
            likes: 0,
            isPaid: false,
            duration: 0
        };
        setVideos(prev => [newVideo, ...prev]);
        setHasChanges(true);
    };

    const deleteVideo = (id: string) => {
        setVideos(prev => prev.filter(v => v.id !== id));
        setHasChanges(true);
    };

    const handleCategoryChange = (list: keyof AllCategories, index: number, value: string) => {
        const updatedList = [...localCategories[list]];
        updatedList[index] = { ...updatedList[index], label: value };
        setLocalCategories(prev => ({ ...prev, [list]: updatedList }));
        setHasChanges(true);
    }

    const addCategory = (list: keyof AllCategories) => {
        const newId = uuidv4().slice(0, 8); // simple unique id
        const newItem = { id: newId, label: 'Nouvelle catégorie' };
        setLocalCategories(prev => ({ ...prev, [list]: [...prev[list], newItem] }));
        setHasChanges(true);
    }

    const deleteCategory = (list: keyof AllCategories, index: number) => {
        const updatedList = [...localCategories[list]];
        updatedList.splice(index, 1);
        setLocalCategories(prev => ({ ...prev, [list]: updatedList }));
        setHasChanges(true);
    }

    const handlePaymentMethodChange = (index: number, field: keyof PaymentMethod, value: string) => {
        setPaymentDetails(produce(draft => {
            draft.methods[index][field] = value;
        }));
        setHasChanges(true);
    };

    const addPaymentMethod = () => {
        if (paymentDetails.methods.length < 3) {
            setPaymentDetails(produce(draft => {
                draft.methods.push({ id: uuidv4(), name: 'Nouveau Moyen', details: '', color: '#000000' });
            }));
            setHasChanges(true);
        }
    };

    const deletePaymentMethod = (index: number) => {
        setPaymentDetails(produce(draft => {
            draft.methods.splice(index, 1);
        }));
        setHasChanges(true);
    };

    const handlePlanPriceChange = (planId: SubscriptionPlanId, price: string) => {
        const numericPrice = parseInt(price, 10);
        if (subscriptionPlans) {
            setSubscriptionPlans(produce(draft => {
                if(draft) {
                    draft[planId].price = isNaN(numericPrice) ? 0 : numericPrice;
                }
            }));
            setHasChanges(true);
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { status });
            setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, status } : o));
            toast({ title: "Statut mis à jour", description: `La commande a été marquée comme ${status === 'completed' ? 'vue' : 'en attente'}.` });
        } catch (error) {
            console.error("Failed to update order status", error);
            toast({ variant: 'destructive', title: "Erreur", description: "Impossible de mettre à jour le statut." });
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        try {
            await deleteDoc(doc(db, 'orders', orderId));
            setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
            toast({ title: "Commande supprimée", description: "La commande a été supprimée avec succès." });
        } catch (error) {
            console.error("Failed to delete order", error);
            toast({ variant: 'destructive', title: "Erreur", description: "Impossible de supprimer la commande." });
        }
    };

    const handleUpdateContractStatus = async (contractId: string, status: Contract['status']) => {
        try {
            const contractRef = doc(db, 'contracts', contractId);
            await updateDoc(contractRef, { status });
            setContracts(prevContracts => prevContracts.map(c => c.id === contractId ? { ...c, status } : c));
            toast({ title: "Statut mis à jour", description: `Le contrat a été marqué comme ${status === 'completed' ? 'vu' : 'en attente'}.` });
        } catch (error) {
            console.error("Failed to update contract status", error);
            toast({ variant: 'destructive', title: "Erreur", description: "Impossible de mettre à jour le statut." });
        }
    };

    const handleDeleteContract = async (contractId: string) => {
        try {
            await deleteDoc(doc(db, 'contracts', contractId));
            setContracts(prevContracts => prevContracts.filter(c => c.id !== contractId));
            toast({ title: "Contrat supprimé", description: "Le contrat a été supprimé avec succès." });
        } catch (error) {
            console.error("Failed to delete contract", error);
            toast({ variant: 'destructive', title: "Erreur", description: "Impossible de supprimer le contrat." });
        }
    };

    const handleConfirmSubscription = async (subscription: Subscription) => {
        try {
            const userRef = doc(db, 'users', subscription.userId);
            const subscriptionRef = doc(db, 'subscriptions', subscription.id);

            let expiryDate = new Date();
            if (subscription.plan === '24h') expiryDate.setDate(expiryDate.getDate() + 1);
            if (subscription.plan === '1w') expiryDate.setDate(expiryDate.getDate() + 7);
            if (subscription.plan === '1m') expiryDate.setMonth(expiryDate.getMonth() + 1);
            
            const expiryTimestamp = Timestamp.fromDate(expiryDate);
            const startTimestamp = Timestamp.now();

            await writeBatch(db)
                .update(userRef, { subscriptionExpiry: expiryTimestamp })
                .update(subscriptionRef, { status: 'active', expiryDate: expiryTimestamp, startDate: startTimestamp })
                .commit();
            
            const updatedSub: Partial<Subscription> = { 
                status: 'active', 
                expiryDate: { seconds: expiryTimestamp.seconds, nanoseconds: expiryTimestamp.nanoseconds } as any,
                startDate: { seconds: startTimestamp.seconds, nanoseconds: startTimestamp.nanoseconds } as any,
            };

            setSubscriptions(prev => prev.map(s => s.id === subscription.id ? { ...s, ...updatedSub } : s));
            toast({ title: 'Abonnement confirmé!', description: `L'accès de ${subscription.userEmail} est actif jusqu'au ${format(expiryDate, 'd MMM yyyy, HH:mm', { locale: fr })}.` });

        } catch (error) {
            console.error("Failed to confirm subscription:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de confirmer l'abonnement." });
        }
    };

    const handleDeleteSubscription = async (subscriptionId: string, userId: string) => {
        const batch = writeBatch(db);
        try {
            const subRef = doc(db, 'subscriptions', subscriptionId);
            const userRef = doc(db, 'users', userId);

            // Revoke access by setting expiry to a past date
            batch.update(userRef, { subscriptionExpiry: new Date(0) });
            batch.delete(subRef);
            
            await batch.commit();

            setSubscriptions(prev => prev.filter(s => s.id !== subscriptionId));
            toast({ title: "Abonnement supprimé", description: "L'abonnement et l'accès de l'utilisateur ont été révoqués."});
        } catch (error) {
            console.error("Failed to delete subscription:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de supprimer l'abonnement." });
        }
    };

    const handleSaveChanges = async () => {
        setSaveStatus('saving');
        try {
            await Promise.all([
                updateProductsClient(products),
                updateSlidesClient(slides),
                updateVideosClient(videos),
                updateCategoriesClient(localCategories),
                updatePaymentDetailsClient(paymentDetails),
                subscriptionPlans ? updateSubscriptionPlansClient(subscriptionPlans) : Promise.resolve(),
            ]);
            
            // Re-fetch categories to update the app state globally
            await fetchCategories();

            setSaveStatus('success');
            setHasChanges(false);
            toast({ title: "Sauvegarde réussie", description: "Toutes les modifications ont été enregistrées." });
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error: any) {
            console.error("Failed to save data on client", error);
            setSaveStatus('error');
            const errorMessage = error.code === 'permission-denied' 
                ? "Permission refusée. Assurez-vous d'être connecté avec un compte autorisé."
                : error.message || "Impossible d'enregistrer les modifications.";
            toast({ variant: "destructive", title: "Erreur de sauvegarde", description: errorMessage });
            setTimeout(() => setSaveStatus('idle'), 4000);
        }
    };

    const handlePasswordSubmit = (section: 'payment' | 'subsPrice') => {
        if (passwordInput === 'virusgrasd') {
            if (section === 'payment') setIsPaymentUnlocked(true);
            if (section === 'subsPrice') setIsSubsPriceUnlocked(true);
            setPasswordInput('');
        } else {
            toast({ variant: 'destructive', title: 'Mot de passe incorrect' });
        }
    };
    
    const sidebarNav = [
        { id: 'articles', label: 'Articles (Blog)', icon: Newspaper },
        { id: 'products', label: 'Produits (Boutique)', icon: ShoppingCart },
        { id: 'internet', label: 'Produits (Internet)', icon: Globe },
        { id: 'tv', label: 'Contenus (TV)', icon: Tv },
        { id: 'slides', label: 'Slides Carrousel', icon: SlidersHorizontal },
        { id: 'contracts', label: 'Contrats Partenaires', icon: FileText },
        { id: 'orders', label: 'Commandes', icon: ShoppingBag },
        { id: 'subscriptions', label: 'Abonnements TV', icon: Crown },
        { id: 'subscriptionPrices', label: 'Prix des Abonnements', icon: Tag },
        { id: 'categories', label: 'Catégories & Filtres', icon: Grip },
        { id: 'payment', label: 'Moyens de Paiement', icon: CreditCard },
    ];

    if (loadingData) {
        return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
    }

    if (!user || user.email !== 'grasdvirus@gmail.com') {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Card className="max-w-md text-center">
                    <CardHeader><CardTitle>Accès non autorisé</CardTitle></CardHeader>
                    <CardContent><p>Vous devez être connecté en tant qu'administrateur pour voir cette page.</p></CardContent>
                </Card>
            </div>
        );
    }
    
    const articles = products.filter(p => p.articleCategory);
    const shopProducts = products.filter(p => p.collection);
    const internetProducts = products.filter(p => p.internetClass !== undefined);


    const CategoryEditor = ({ title, categoryList, listKey }: { title: string; categoryList: CategoryItem[]; listKey: keyof AllCategories; }) => (
        <Card>
            <CardHeader className='flex-row items-center justify-between'>
                <CardTitle className="text-lg">{title}</CardTitle>
                <Button size="sm" variant="outline" onClick={() => addCategory(listKey)}><PlusCircle className='mr-2 h-4 w-4' />Ajouter</Button>
            </CardHeader>
            <CardContent className="space-y-2">
                {categoryList && categoryList.map((cat, index) => (
                    <div key={cat.id} className="flex items-center gap-2">
                        <Input 
                            value={cat.label}
                            onChange={(e) => handleCategoryChange(listKey, index, e.target.value)}
                        />
                        <Button variant="destructive" size="icon" onClick={() => deleteCategory(listKey, index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                {(!categoryList || categoryList.length === 0) && <p className="text-sm text-muted-foreground">Aucune catégorie.</p>}
            </CardContent>
        </Card>
    );

    const PasswordWall = ({ section }: { section: 'payment' | 'subsPrice' }) => (
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Accès Restreint</CardTitle>
                <CardDescription>Veuillez entrer le mot de passe pour accéder à cette section.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2">
                    <Input
                        type="password"
                        placeholder="Mot de passe"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit(section)}
                    />
                    <Button onClick={() => handlePasswordSubmit(section)}>Déverrouiller</Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-background text-foreground">
                <Sidebar>
                    <SidebarHeader>
                        <div className="flex items-center gap-2">
                             <LayoutDashboard className="h-6 w-6 text-primary" />
                             <h2 className="text-xl font-bold font-headline">Admin</h2>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarMenu>
                            {sidebarNav.map(item => (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton 
                                        onClick={() => setActiveView(item.id as ActiveView)}
                                        isActive={activeView === item.id}
                                    >
                                        <item.icon />
                                        {item.label}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter>
                        <SidebarMenu>
                           <SidebarMenuItem>
                             <SidebarMenuButton asChild>
                                <Link href="/">
                                    <HomeIcon />
                                    Retour au site
                                </Link>
                             </SidebarMenuButton>
                           </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="md:hidden pb-4">
                        <SidebarTrigger />
                    </div>
                    {activeView === 'articles' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold">Gérer les Articles (Blog)</h1>
                                    <p className="text-muted-foreground">Gérez ici les articles qui apparaissent sur la page d'accueil.</p>
                                </div>
                                <Button onClick={() => addProduct({ isArticle: true })}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un article</Button>
                            </div>
                            <div className="space-y-4">
                                {articles.map(product => (
                                    <Collapsible key={product.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold">{product.title}</h3>
                                            <div className="flex items-center gap-2">
                                                <Button variant="destructive" size="icon" onClick={() => deleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4" /></Button>
                                                </CollapsibleTrigger>
                                            </div>
                                        </div>
                                        <CollapsibleContent className="mt-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor={`title-${product.id}`}>Titre</Label>
                                                    <Input id={`title-${product.id}`} value={product.title} onChange={(e) => updateProduct(product.id, 'title', e.target.value)} />
                                                </div>
                                                <div>
                                                    <Label>Catégorie de l'article</Label>
                                                     <Select value={product.articleCategory} onValueChange={(value) => updateProduct(product.id, 'articleCategory', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner une catégorie" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {articleCategories.map(cat => (
                                                                <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor={`desc-${product.id}`}>Description</Label>
                                                <Textarea id={`desc-${product.id}`} value={product.description} onChange={(e) => updateProduct(product.id, 'description', e.target.value)} />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <FileUpload label="Image 1" value={product.imageUrls?.[0] || ''} onChange={(url) => updateProductImage(product.id, 0, url)} acceptedFileTypes="image/*" />
                                                <FileUpload label="Image 2" value={product.imageUrls?.[1] || ''} onChange={(url) => updateProductImage(product.id, 1, url)} acceptedFileTypes="image/*" />
                                                <FileUpload label="Image 3" value={product.imageUrls?.[2] || ''} onChange={(url) => updateProductImage(product.id, 2, url)} acceptedFileTypes="image/*" />
                                            </div>
                                            <div>
                                                <Label htmlFor={`ai-hint-${product.id}`}>Indice IA pour l'image</Label>
                                                <Input id={`ai-hint-${product.id}`} value={product.dataAiHint} onChange={(e) => updateProduct(product.id, 'dataAiHint', e.target.value)} />
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeView === 'products' && (
                        <div>
                             <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold">Gérer les Produits (Boutique)</h1>
                                    <p className="text-muted-foreground">Gérez ici les produits de la page "Découvrir".</p>
                                </div>
                                <Button onClick={() => addProduct({ isShop: true })}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un produit</Button>
                            </div>
                            <div className="space-y-4">
                                {shopProducts.map(product => (
                                    <Collapsible key={product.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold">{product.title}</h3>
                                            <div className="flex items-center gap-2">
                                                <Button variant="destructive" size="icon" onClick={() => deleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4" /></Button>
                                                </CollapsibleTrigger>
                                            </div>
                                        </div>
                                        <CollapsibleContent className="mt-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor={`title-${product.id}`}>Titre</Label>
                                                    <Input id={`title-${product.id}`} value={product.title} onChange={(e) => updateProduct(product.id, 'title', e.target.value)} />
                                                </div>
                                                 <div>
                                                    <Label htmlFor={`price-${product.id}`}>Prix (FCFA)</Label>
                                                    <Input id={`price-${product.id}`} type="text" value={product.price} onChange={(e) => updateProduct(product.id, 'price', parseFloat(e.target.value) || 0)} />
                                                </div>
                                                <div>
                                                    <Label>Collection</Label>
                                                     <Select value={product.collection} onValueChange={(value) => updateProduct(product.id, 'collection', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner une collection" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {productCollections.map(cat => (
                                                                <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor={`desc-${product.id}`}>Description</Label>
                                                <Textarea id={`desc-${product.id}`} value={product.description} onChange={(e) => updateProduct(product.id, 'description', e.target.value)} />
                                            </div>
                                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <FileUpload label="Image 1" value={product.imageUrls?.[0] || ''} onChange={(url) => updateProductImage(product.id, 0, url)} acceptedFileTypes="image/*" />
                                                <FileUpload label="Image 2" value={product.imageUrls?.[1] || ''} onChange={(url) => updateProductImage(product.id, 1, url)} acceptedFileTypes="image/*" />
                                                <FileUpload label="Image 3" value={product.imageUrls?.[2] || ''} onChange={(url) => updateProductImage(product.id, 2, url)} acceptedFileTypes="image/*" />
                                            </div>
                                            <div>
                                                <Label htmlFor={`ai-hint-${product.id}`}>Indice IA pour l'image</Label>
                                                <Input id={`ai-hint-${product.id}`} value={product.dataAiHint} onChange={(e) => updateProduct(product.id, 'dataAiHint', e.target.value)} />
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {activeView === 'internet' && (
                        <div>
                             <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold">Gérer les Produits (Internet)</h1>
                                    <p className="text-muted-foreground">Gérez ici les produits de la catégorie "Internet".</p>
                                </div>
                                <Button onClick={() => addProduct({ isInternet: true })}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un produit Internet</Button>
                            </div>
                            <div className="space-y-4">
                                {internetProducts.map(product => (
                                    <Collapsible key={product.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold">{product.title}</h3>
                                            <div className="flex items-center gap-2">
                                                <Button variant="destructive" size="icon" onClick={() => deleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4" /></Button>
                                                </CollapsibleTrigger>
                                            </div>
                                        </div>
                                        <CollapsibleContent className="mt-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor={`title-${product.id}`}>Titre</Label>
                                                    <Input id={`title-${product.id}`} value={product.title} onChange={(e) => updateProduct(product.id, 'title', e.target.value)} />
                                                </div>
                                                 <div>
                                                    <Label htmlFor={`price-${product.id}`}>Prix (FCFA)</Label>
                                                    <Input id={`price-${product.id}`} type="text" value={product.price} onChange={(e) => updateProduct(product.id, 'price', parseFloat(e.target.value) || 0)} />
                                                </div>
                                                <div>
                                                    <Label>Classe Internet</Label>
                                                     <Select value={product.internetClass} onValueChange={(value) => updateProduct(product.id, 'internetClass', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner une classe" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {internetClasses.map(cat => (
                                                                <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                 <div>
                                                    <Label htmlFor={`redirect-url-${product.id}`}>URL de visite du site</Label>
                                                    <Input id={`redirect-url-${product.id}`} value={product.redirectUrl} onChange={(e) => updateProduct(product.id, 'redirectUrl', e.target.value)} placeholder="https://exemple.com" />
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor={`desc-${product.id}`}>Description</Label>
                                                <Textarea id={`desc-${product.id}`} value={product.description} onChange={(e) => updateProduct(product.id, 'description', e.target.value)} />
                                            </div>
                                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <FileUpload label="Image 1" value={product.imageUrls?.[0] || ''} onChange={(url) => updateProductImage(product.id, 0, url)} acceptedFileTypes="image/*" />
                                                <FileUpload label="Image 2" value={product.imageUrls?.[1] || ''} onChange={(url) => updateProductImage(product.id, 1, url)} acceptedFileTypes="image/*" />
                                                <FileUpload label="Image 3" value={product.imageUrls?.[2] || ''} onChange={(url) => updateProductImage(product.id, 2, url)} acceptedFileTypes="image/*" />
                                            </div>
                                            <div>
                                                <Label htmlFor={`ai-hint-${product.id}`}>Indice IA pour l'image</Label>
                                                <Input id={`ai-hint-${product.id}`} value={product.dataAiHint} onChange={(e) => updateProduct(product.id, 'dataAiHint', e.target.value)} />
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {activeView === 'tv' && (
                        <div>
                             <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold">Gérer les Contenus (TV)</h1>
                                    <p className="text-muted-foreground">
                                        Gérez ici les vidéos et leurs statistiques.
                                    </p>
                                </div>
                                 <Button onClick={addVideo}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter une vidéo</Button>
                            </div>
                             <div className="space-y-4">
                                {videos.map(video => (
                                    <Collapsible key={video.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div className='w-full pr-8'>
                                                <h3 className="font-semibold">{video.title}</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                                                    <div>
                                                        <Label htmlFor={`video-views-${video.id}`}>Vues</Label>
                                                        <Input id={`video-views-${video.id}`} type="text" value={video.views} onChange={(e) => updateVideo(video.id, 'views', parseInt(e.target.value, 10) || 0)} />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`video-likes-${video.id}`}>J'aime</Label>
                                                        <Input id={`video-likes-${video.id}`} type="text" value={video.likes} onChange={(e) => updateVideo(video.id, 'likes', parseInt(e.target.value, 10) || 0)} />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`video-subs-${video.id}`}>Abonnés</Label>
                                                        <Input id={`video-subs-${video.id}`} type="text" value={video.creator.subscribers} onChange={(e) => updateVideo(video.id, 'creator.subscribers', parseInt(e.target.value, 10) || 0)} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="destructive" size="icon" onClick={() => deleteVideo(video.id)}><Trash2 className="h-4 w-4" /></Button>
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4" /></Button>
                                                </CollapsibleTrigger>
                                            </div>
                                        </div>
                                        <CollapsibleContent className="mt-4 space-y-4">
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor={`video-title-${video.id}`}>Titre</Label>
                                                    <Input id={`video-title-${video.id}`} value={video.title} onChange={(e) => updateVideo(video.id, 'title', e.target.value)} />
                                                </div>
                                                <div>
                                                    <Label>Chaîne TV</Label>
                                                     <Select value={video.channel} onValueChange={(value) => updateVideo(video.id, 'channel', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner une chaîne" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {tvChannels.map(cat => (
                                                                <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label htmlFor={`video-duration-${video.id}`}>Durée (minutes)</Label>
                                                    <Input id={`video-duration-${video.id}`} type="text" value={video.duration} onChange={(e) => updateVideo(video.id, 'duration', parseInt(e.target.value, 10) || 0)} />
                                                </div>
                                                <div className="flex items-center space-x-2 pt-6">
                                                    <Switch id={`video-paid-${video.id}`} checked={video.isPaid} onCheckedChange={(checked) => updateVideo(video.id, 'isPaid', checked)} />
                                                    <Label htmlFor={`video-paid-${video.id}`} className="flex items-center gap-2">
                                                        <Star className="h-4 w-4 text-primary" />
                                                        Vidéo Payante
                                                    </Label>
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor={`video-desc-${video.id}`}>Description</Label>
                                                <Textarea id={`video-desc-${video.id}`} value={video.description} onChange={(e) => updateVideo(video.id, 'description', e.target.value)} />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FileUpload label="Miniature (Image)" value={video.imageUrl} onChange={(url) => updateVideo(video.id, 'imageUrl', url)} acceptedFileTypes="image/*" mediaType="image"/>
                                                <FileUpload label="Fichier Vidéo" value={video.src.startsWith('/uploads/') ? video.src : ''} onChange={(url) => updateVideo(video.id, 'src', url)} acceptedFileTypes="video/*" mediaType="video"/>
                                            </div>
                                            <div>
                                                <Label htmlFor={`video-ai-hint-${video.id}`}>Indice IA pour la miniature</Label>
                                                <Input id={`video-ai-hint-${video.id}`} value={video.dataAiHint} onChange={(e) => updateVideo(video.id, 'dataAiHint', e.target.value)} />
                                            </div>
                                            <div className="relative">
                                                <Label htmlFor={`video-yt-url-${video.id}`}>Ou coller le lien YouTube</Label>
                                                <Input id={`video-yt-url-${video.id}`} value={video.src.includes('youtube.com') ? video.src : ''} onChange={(e) => updateVideo(video.id, 'src', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
                                                {video.src.includes('youtube.com') && (
                                                    <div className="absolute right-2 top-7 p-1 rounded-md bg-green-500/20 text-green-500">
                                                        <Youtube className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                ))}
                            </div>
                        </div>
                    )}


                    {activeView === 'slides' && (
                         <div>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                     <h1 className="text-3xl font-bold">Gérer les Slides du Carrousel</h1>
                                     <p className="text-muted-foreground">Modifiez les slides de la page d'accueil.</p>
                                </div>
                                <Button onClick={addSlide}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter une slide</Button>
                            </div>
                            <div className="space-y-4">
                            {slides.map(slide => (
                                    <Collapsible key={slide.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold">{slide.title}</h3>
                                            <div className="flex items-center gap-2">
                                                <Button variant="destructive" size="icon" onClick={() => deleteSlide(slide.id)}><Trash2 className="h-4 w-4" /></Button>
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4" /></Button>
                                                </CollapsibleTrigger>
                                            </div>
                                        </div>
                                        <CollapsibleContent className="mt-4 space-y-4">
                                            <div>
                                                <Label htmlFor={`slide-title-${slide.id}`}>Titre</Label>
                                                <Input id={`slide-title-${slide.id}`} value={slide.title} onChange={(e) => updateSlide(slide.id, 'title', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label htmlFor={`slide-subtitle-${slide.id}`}>Sous-titre</Label>
                                                <Textarea id={`slide-subtitle-${slide.id}`} value={slide.subtitle} onChange={(e) => updateSlide(slide.id, 'subtitle', e.target.value)} />
                                            </div>
                                            <FileUpload label="Image de la slide" value={slide.imageUrl} onChange={(url) => updateSlide(slide.id, 'imageUrl', url)} acceptedFileTypes="image/*" />
                                            <div>
                                                <Label htmlFor={`slide-ai-hint-${slide.id}`}>Indice IA pour l'image</Label>
                                                <Input id={`slide-ai-hint-${slide.id}`} value={slide.dataAiHint} onChange={(e) => updateSlide(slide.id, 'dataAiHint', e.target.value)} />
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeView === 'contracts' && (
                        <div>
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold">Demandes de Partenariat</h1>
                                <p className="text-muted-foreground">Voici les demandes de contrat soumises par les utilisateurs.</p>
                            </div>
                            <div className="space-y-4">
                                {contracts.length > 0 ? contracts.map(contract => (
                                    <Collapsible key={contract.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                 <span className={cn("h-3 w-3 rounded-full", {
                                                    'bg-green-500': contract.status === 'pending',
                                                    'bg-gray-400': contract.status === 'completed',
                                                })} />
                                                <div>
                                                    <h3 className="font-semibold">{contract.firstname} {contract.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{contract.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {contract.createdAt ? format(new Date(contract.createdAt.seconds * 1000), 'd MMM yyyy, HH:mm', { locale: fr }) : 'Date inconnue'}
                                                </span>
                                                {contract.status === 'pending' && (
                                                    <Button variant="outline" size="icon" title="Marquer comme vu" onClick={() => handleUpdateContractStatus(contract.id, 'completed')}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Cette action est irréversible et supprimera définitivement cette demande.
                                                        </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteContract(contract.id)}>Supprimer</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4" /></Button>
                                                </CollapsibleTrigger>
                                            </div>
                                        </div>
                                        <CollapsibleContent className="mt-4 space-y-2">
                                            <p><strong>Téléphone:</strong> {contract.phone}</p>
                                            <p><strong>Motif:</strong> {contract.reason}</p>
                                        </CollapsibleContent>
                                    </Collapsible>
                                )) : (
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                                            <Inbox className="h-12 w-12 mb-4" />
                                            <h3 className="text-xl font-semibold">Aucun contrat pour le moment</h3>
                                            <p>Les demandes de partenariat apparaîtront ici.</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}

                    {activeView === 'orders' && (
                        <div>
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold">Commandes Clients</h1>
                                <p className="text-muted-foreground">Liste des commandes passées sur le site.</p>
                            </div>
                            <div className="space-y-4">
                                {orders.length > 0 ? orders.map(order => (
                                    <Collapsible key={order.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <span className={cn("h-3 w-3 rounded-full", {
                                                    'bg-green-500': order.status === 'pending',
                                                    'bg-gray-400': order.status === 'completed',
                                                })} />
                                                <div>
                                                    <h3 className="font-semibold">Commande de {order.customerName}</h3>
                                                    <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {order.createdAt ? format(new Date(order.createdAt.seconds * 1000), 'd MMM yyyy, HH:mm', { locale: fr }) : 'Date inconnue'}
                                                </span>
                                                {order.status === 'pending' && (
                                                    <Button variant="outline" size="icon" title="Marquer comme vue" onClick={() => handleUpdateOrderStatus(order.id, 'completed')}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Cette action est irréversible et supprimera définitivement la commande.
                                                        </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteOrder(order.id)}>Supprimer</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4" /></Button>
                                                </CollapsibleTrigger>
                                            </div>
                                        </div>
                                        <CollapsibleContent className="mt-4 space-y-2">
                                            <p><strong>Téléphone:</strong> {order.customerPhone}</p>
                                            <p><strong>ID de transaction:</strong> {order.transactionId}</p>
                                            <p><strong>Total:</strong> {new Intl.NumberFormat('fr-FR').format(order.totalAmount)} FCFA</p>
                                            {order.customerNotes && <p><strong>Notes:</strong> {order.customerNotes}</p>}
                                            <h4 className="font-semibold mt-2">Articles :</h4>
                                            <ul className="list-disc pl-5">
                                                {order.items.map(item => <li key={item.id}>{item.title} ({new Intl.NumberFormat('fr-FR').format(item.price)} FCFA)</li>)}
                                            </ul>
                                        </CollapsibleContent>
                                    </Collapsible>
                                )) : (
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                                            <ShoppingBag className="h-12 w-12 mb-4" />
                                            <h3 className="text-xl font-semibold">Aucune commande pour le moment</h3>
                                            <p>Les commandes des clients apparaîtront ici.</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}

                    {activeView === 'subscriptions' && (
                        <div>
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold">Abonnements TV</h1>
                                <p className="text-muted-foreground">Gérez ici les abonnements des utilisateurs.</p>
                            </div>
                             <div className="space-y-4">
                                {subscriptions.length > 0 ? subscriptions.map(sub => (
                                    <Collapsible key={sub.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                             <div className="flex items-center gap-3">
                                                <span className={cn("h-3 w-3 rounded-full", {
                                                    'bg-yellow-400': sub.status === 'pending',
                                                    'bg-green-500': sub.status === 'active',
                                                    'bg-gray-400': sub.status === 'expired',
                                                })} />
                                                <div>
                                                    <h3 className="font-semibold">Abonnement de {sub.userEmail}</h3>
                                                    <p className="text-sm text-muted-foreground capitalize">Forfait: {sub.plan.replace('1w', '1 Semaine').replace('1m', '1 Mois').replace('24h', '24 Heures')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                 <span className="text-xs text-muted-foreground">
                                                    {(sub.createdAt as any)?.seconds ? format(new Date((sub.createdAt as any).seconds * 1000), 'd MMM yyyy', { locale: fr }) : 'Date inconnue'}
                                                </span>
                                                {sub.status === 'pending' && (
                                                    <Button variant="outline" size="sm" onClick={() => handleConfirmSubscription(sub)}>
                                                        <CheckCircle className="mr-2 h-4 w-4"/> Confirmer
                                                    </Button>
                                                )}
                                                 <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Cette action supprimera l'abonnement et révoquera l'accès de l'utilisateur.
                                                        </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteSubscription(sub.id, sub.userId)}>Supprimer</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4" /></Button>
                                                </CollapsibleTrigger>
                                            </div>
                                        </div>
                                        <CollapsibleContent className="mt-4 space-y-2 text-sm">
                                            <p><strong>ID Transaction:</strong> {sub.transactionId}</p>
                                            <p><strong>Montant:</strong> {new Intl.NumberFormat('fr-FR').format(sub.amount)} FCFA</p>
                                            {sub.startDate?.seconds && (<p><strong>Début:</strong> {format(new Date(sub.startDate.seconds * 1000), 'd MMM yyyy, HH:mm', { locale: fr })}</p>)}
                                            {sub.expiryDate?.seconds && (<p><strong>Expire le:</strong> {format(new Date(sub.expiryDate.seconds * 1000), 'd MMM yyyy, HH:mm', { locale: fr })}</p>)}
                                        </CollapsibleContent>
                                    </Collapsible>
                                )) : (
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                                            <Crown className="h-12 w-12 mb-4" />
                                            <h3 className="text-xl font-semibold">Aucun abonnement pour le moment</h3>
                                            <p>Les abonnements souscrits par les utilisateurs apparaîtront ici.</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {activeView === 'subscriptionPrices' && (
                         <div>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                     <h1 className="text-3xl font-bold">Gérer les Prix des Abonnements</h1>
                                     <p className="text-muted-foreground">Modifiez les tarifs des forfaits vidéos.</p>
                                </div>
                            </div>
                             {!isSubsPriceUnlocked ? <PasswordWall section="subsPrice" /> :
                             loadingPlans ? (
                                <div className="flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                            ) : subscriptionPlans ? (
                                <div className="max-w-2xl mx-auto space-y-4">
                                     {Object.values(subscriptionPlans).map(plan => (
                                         <Card key={plan.id}>
                                            <CardHeader>
                                                <CardTitle className="text-xl">{plan.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <Label htmlFor={`price-${plan.id}`}>Prix (FCFA)</Label>
                                                <Input
                                                    id={`price-${plan.id}`}
                                                    type="text"
                                                    value={plan.price}
                                                    onChange={(e) => handlePlanPriceChange(plan.id, e.target.value)}
                                                />
                                            </CardContent>
                                         </Card>
                                     ))}
                                </div>
                            ) : (
                                <Card><CardContent className="py-12 text-center text-muted-foreground">Impossible de charger les forfaits.</CardContent></Card>
                            )}
                        </div>
                    )}


                    {activeView === 'categories' && (
                        <div>
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold">Gérer les Filtres & Catégories</h1>
                                <p className="text-muted-foreground">Modifiez les catégories utilisées à travers le site.</p>
                            </div>
                            {loadingCategories ? (
                                <div className="flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <CategoryEditor title="Catégories d'articles" categoryList={localCategories.articleCategories} listKey="articleCategories" />
                                    <CategoryEditor title="Collections de produits" categoryList={localCategories.productCollections} listKey="productCollections" />
                                    <CategoryEditor title="Classes Internet" categoryList={localCategories.internetClasses} listKey="internetClasses" />
                                    <CategoryEditor title="Chaînes TV" categoryList={localCategories.tvChannels} listKey="tvChannels" />
                                </div>
                            )}
                        </div>
                    )}

                    {activeView === 'payment' && (
                        <div>
                             <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold">Gérer les Moyens de Paiement</h1>
                                    <p className="text-muted-foreground">Configurez les informations de paiement manuel (jusqu'à 3).</p>
                                </div>
                                <Button onClick={addPaymentMethod} disabled={!paymentDetails || paymentDetails.methods.length >= 3 || !isPaymentUnlocked}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter</Button>
                            </div>
                             {!isPaymentUnlocked ? <PasswordWall section="payment" /> :
                             loadingPayment ? (
                                <div className="flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                            ) : (
                                <div className="space-y-4">
                                {paymentDetails && paymentDetails.methods.map((method, index) => (
                                     <Collapsible key={method.id} className="border rounded-lg p-4" defaultOpen={true}>
                                         <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: method.color }} />
                                                <h3 className="font-semibold">{method.name || "Nouveau moyen"}</h3>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="destructive" size="icon" onClick={() => deletePaymentMethod(index)}><Trash2 className="h-4 w-4" /></Button>
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4" /></Button>
                                                </CollapsibleTrigger>
                                            </div>
                                        </div>
                                        <CollapsibleContent className="mt-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor={`payment-name-${index}`}>Nom du moyen de paiement</Label>
                                                    <Input id={`payment-name-${index}`} value={method.name} onChange={(e) => handlePaymentMethodChange(index, 'name', e.target.value)} placeholder="Ex: WAVE"/>
                                                </div>
                                                <div>
                                                    <Label htmlFor={`payment-color-${index}`}>Couleur</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Input id={`payment-color-${index}`} type="color" value={method.color} onChange={(e) => handlePaymentMethodChange(index, 'color', e.target.value)} className="w-12 h-10 p-1" />
                                                        <Input value={method.color} onChange={(e) => handlePaymentMethodChange(index, 'color', e.target.value)} placeholder="#FFA500"/>
                                                    </div>
                                                </div>
                                            </div>
                                             <div>
                                                <Label htmlFor={`payment-details-${index}`}>Détails (numéro, nom, etc.)</Label>
                                                <Textarea id={`payment-details-${index}`} value={method.details} onChange={(e) => handlePaymentMethodChange(index, 'details', e.target.value)} placeholder="Ex: +225 0102030405 (John Doe)" />
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                ))}
                                {paymentDetails && paymentDetails.methods.length === 0 && (
                                     <Card>
                                        <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                                            <CreditCard className="h-12 w-12 mb-4" />
                                            <h3 className="text-xl font-semibold">Aucun moyen de paiement</h3>
                                            <p>Cliquez sur "Ajouter" pour commencer.</p>
                                        </CardContent>
                                    </Card>
                                )}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
             {hasChanges && (
                <div className="fixed bottom-4 right-4 z-50">
                    <Button
                        size="lg"
                        onClick={handleSaveChanges}
                        disabled={saveStatus === 'saving' || saveStatus === 'success'}
                        className={`transition-all duration-300 ${
                            saveStatus === 'saving' ? 'bg-blue-600' :
                            saveStatus === 'success' ? 'bg-green-600' :
                            saveStatus === 'error' ? 'bg-red-600' : 'bg-primary'
                        }`}
                    >
                        {saveStatus === 'saving' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {saveStatus === 'success' && <CheckCircle className="mr-2 h-4 w-4" />}
                        {saveStatus === 'error' && <AlertTriangle className="mr-2 h-4 w-4" />}
                        {saveStatus === 'idle' && <Save className="mr-2 h-4 w-4" />}
                        
                        {saveStatus === 'saving' ? 'Sauvegarde...' :
                         saveStatus === 'success' ? 'Enregistré !' :
                         saveStatus === 'error' ? 'Échec' :
                         'Enregistrer les modifications'}
                    </Button>
                </div>
            )}
        </SidebarProvider>
    );
}

export default function AdminPageWrapper() {
    return <AdminContent />;
}

    

    