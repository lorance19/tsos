import {useMutation, useQuery} from "@tanstack/react-query";
import axios from "axios";
import {ADMIN_MANAGEMENTS, PRODUCT, SVG} from "@/app/Util/constants/paths";
import {useState} from "react";
import {AddNewProductForm} from "@/app/services/ProductService";

export function useCreateProduct() {
    return useMutation({
        mutationFn: async (data: FormData)=> {
            const res = await axios.post(ADMIN_MANAGEMENTS.ADD_PRODUCT.API, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.status === 201) {
                return res.data;
            } else {
                throw new Error(res.statusText);
            }
        }
    })
}

export function useUpdateProduct(productId: string) {
    return useMutation({
        mutationFn: async (data: FormData) => {
            const res = await axios.patch(`${ADMIN_MANAGEMENTS.PRODUCT_PROFILE(productId).API}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.status === 200) {
                return res.data;
            } else {
                throw new Error(res.statusText);
            }
        }
    });
}

export interface UseGetAllProductsParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    filterType?: string;
}

export function useGetProductById(productId: string) {
    return useQuery({
        queryKey: [GET_PRODUCT_BY_ID_QUERY_KEY + productId],
        queryFn: async (data) => {
            const res = await axios.get(ADMIN_MANAGEMENTS.PRODUCT_PROFILE(productId).API)
            return res.data;
        },
        enabled: !!productId, // Only fetch if productId exists
    })
}

export function useGetAllProducts(params: UseGetAllProductsParams = {}) {
    const page = params.page || 1;
    const limit = params.limit || 50;

    return useQuery({
        queryKey: [GET_ALL_PRODUCTS_QUERY_KEY, page, limit],
        queryFn: async() => {
            const res = await axios.get(ADMIN_MANAGEMENTS.PRODUCTS.API, {
                params: { page, limit }
            });
            return res.data;
        },
        staleTime: 1000 * 60 * 5,// cache for 5 minutes
    });
}

export function useGetAllProductsForView(params: UseGetAllProductsParams = {}) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const sortBy = params.sortBy || 'newest';
    const filterType = params.filterType || 'all';

    return useQuery({
        queryKey: [GET_ALL_PRODUCTS_VIEW_QUERY_KEY, page, limit, sortBy, filterType],
        queryFn: async() => {
            const res = await axios.get(PRODUCT.LIST.API, {
                params: { page, limit, sortBy, filterType }
            });
            return res.data;
        },
        staleTime: 1000 * 60 * 50,// cache for 50 minutes
    });
}

export const GET_ALL_PRODUCTS_QUERY_KEY = "products";
export const GET_PRODUCT_BY_ID_QUERY_KEY = "product-";
export const GET_ALL_PRODUCTS_VIEW_QUERY_KEY = "products-view";
// ============= Image Handling Utilities =============

export interface SecondaryImageState {
    file: File | null;
    preview: string;
}

/**
 * Custom hook for managing product images (primary + secondary)
 * Handles all image state and provides handlers for image operations
 */
export function useProductImageHandlers(maxSecondaryImages: number = 6) {
    const [primaryImage, setPrimaryImage] = useState<File | null>(null);
    const [primaryImagePreview, setPrimaryImagePreview] = useState<string>(SVG.DEFAULT_IMAGE_SVG);
    const [secondaryImages, setSecondaryImages] = useState<SecondaryImageState[]>([
        { file: null, preview: SVG.DEFAULT_IMAGE_SVG }
    ]);

    // Handle secondary image selection
    const handleSecondaryImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSecondaryImages(prev => {
                    const updated = [...prev];
                    updated[index] = { file, preview: reader.result as string };
                    return updated;
                });
            };
            reader.readAsDataURL(file);
        }
    };

    // Add new secondary image card
    const handleAddSecondaryImage = () => {
        if (secondaryImages.length < maxSecondaryImages) {
            setSecondaryImages(prev => [
                ...prev,
                { file: null, preview: SVG.DEFAULT_IMAGE_SVG }
            ]);
        }
    };

    // Clear uploaded image (keeps the card)
    const handleClearSecondaryImage = (index: number) => {
        setSecondaryImages(prev => {
            const updated = [...prev];
            updated[index] = { file: null, preview: SVG.DEFAULT_IMAGE_SVG };
            return updated;
        });
        const fileInput = document.getElementById(`secondary-image-input-${index}`) as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    // Remove entire secondary image card
    const handleRemoveSecondaryImageCard = (index: number) => {
        setSecondaryImages(prev => prev.filter((_, i) => i !== index));
    };

    // Reset all images to default
    const resetImages = () => {
        setPrimaryImage(null);
        setPrimaryImagePreview(SVG.DEFAULT_IMAGE_SVG);
        setSecondaryImages([{ file: null, preview: SVG.DEFAULT_IMAGE_SVG }]);
    };

    return {
        // State
        primaryImage,
        primaryImagePreview,
        secondaryImages,
        // Setters
        setPrimaryImage,
        setPrimaryImagePreview,
        setSecondaryImages,
        // Handlers
        handleSecondaryImageChange,
        handleAddSecondaryImage,
        handleClearSecondaryImage,
        handleRemoveSecondaryImageCard,
        resetImages,
    };
}

/**
 * Builds FormData from product form data and images
 * Used for both create and update operations
 */
export function buildProductFormData(
    data: AddNewProductForm,
    primaryImage: File | null,
    secondaryImages: SecondaryImageState[]
): FormData {
    const formData = new FormData();

    // Add regular fields
    formData.append('name', data.name);
    formData.append('code', data.code);
    formData.append('type', data.type);
    formData.append('price', data.price.toString());
    formData.append('inventory', data.inventory.toString());
    formData.append('isCustomizable', data.isCustomizable.toString());
    formData.append('detailDescription', data.detailDescription);
    formData.append('careDescription', data.careDescription);
    if (data.note) formData.append('note', data.note);
    if (data.deal) formData.append('deal', data.deal);

    // Add primary image (if provided)
    if (primaryImage) {
        formData.append('imageValidation.mainImage', primaryImage);
    }

    // Add secondary images (only those with actual files)
    const validSecondaryImages = secondaryImages
        .filter(img => img.file !== null)
        .map(img => img.file as File);

    validSecondaryImages.forEach((file) => {
        formData.append('imageValidation.secondaryImages', file);
    });

    return formData;
}