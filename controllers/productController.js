// 



import { v2 as cloudinary } from 'cloudinary';
import Product from '../models/product.js'; // Renamed to avoid conflict

// Add Product - POST: /api/product/add
export const addProduct = async (req, res) => {
    try {
        const { productData } = req.body;

        if (!productData || productData === 'undefined') {
            return res.status(400).json({ success: false, message: "Invalid product data" });
        }

        const parsedData = JSON.parse(productData);
        const images = req.files;

        if (!images || images.length === 0) {
            return res.status(400).json({ success: false, message: "No images uploaded" });
        }

        const imageUrls = await Promise.all(
            images.map(async (file) => {
                const result = await cloudinary.uploader.upload(file.path, {
                    resource_type: 'image',
                });
                return result.secure_url;
            })
        );

        await Product.create({ ...parsedData, image: imageUrls });

        res.status(201).json({ success: true, message: "Product added successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Products - GET: /api/product/list
export const ProductList = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Single Product by ID - POST: /api/product/by-id
export const productById = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }

        const productItem = await Product.findById(id);

        if (!productItem) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, product: productItem });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Change Product Stock - PATCH: /api/product/change-stock
export const changeStock = async (req, res) => {
    try {

        const { id, inStock } = req.body

        if (!id || typeof inStock === 'undefined') {
            return res.status(400).json({ success: false, message: "Missing ID or stock status" });
        }

        await Product.findByIdAndUpdate(id, { inStock });

        res.json({ success: true, message: "Stock updated successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
