import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppContext from "../Context/Context"; // Assuming Context.js is in the same directory
import axios from "../axios"; // Assuming axios config is in the same directory
import '../assets/css/Product.css'; // Import the CSS file

const Product = () => {
  const { id } = useParams();
  const { data, addToCart, removeFromCart, refreshData } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();

  // Function to fetch product details and its image
  const fetchProductDetails = useCallback(async () => {
    try {
      const productResponse = await axios.get(`/product/${id}`);
      setProduct(productResponse.data);

      if (productResponse.data.imageName) {
        try {
          const imageResponse = await axios.get(
            `/product/${id}/image`,
            { responseType: "blob" }
          );
          // Create object URL for the image blob
          setImageUrl(URL.createObjectURL(imageResponse.data));
        } catch (imageError) {
          console.error("Error fetching image for product:", productResponse.data.id, imageError);
          // Fallback to a placeholder image URL on error
          setImageUrl("https://placehold.co/400x400/E0E0E0/808080?text=No+Image");
        }
      } else {
        // If no image name, set a placeholder directly
        setImageUrl("https://placehold.co/400x400/E0E0E0/808080?text=No+Image");
      }
    } catch (productError) {
      console.error("Error fetching product details:", productError);
      // Handle product not found or other API errors (e.g., navigate to a 404 page)
      setProduct(null); // Explicitly set product to null if fetch fails
      navigate('/not-found'); // Example: navigate to a not-found page
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProductDetails();

    // Cleanup function to revoke the object URL when component unmounts or image changes
    return () => {
      if (imageUrl && imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [fetchProductDetails, imageUrl]); // Depend on fetchProductDetails and imageUrl for cleanup

  // Handles product deletion
  const handleDeleteProduct = async () => {
    // In a real application, you'd add a confirmation modal here instead of `alert`
    if (window.confirm("Are you sure you want to delete this product?")) { // Using confirm for demo purposes
      try {
        await axios.delete(`/product/${id}`);
        removeFromCart(id); // Remove from cart context
        refreshData(); // Refresh global product data
        navigate("/"); // Navigate back to the home page
      } catch (error) {
        console.error("Error deleting product:", error);
        // Display user-friendly error message
      }
    }
  };

  // Handles navigation to the update product page
  const handleEditClick = () => {
    navigate(`/product/update/${id}`);
  };

  // Handles adding the product to the cart
  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      // In a real application, display a success toast/notification
      console.log("Product added to cart!");
    }
  };

  // Display loading state
  if (!product) {
    return (
      <div className="product-loading">
        <h2>Loading product details...</h2>
      </div>
    );
  }

  // Destructure product properties for cleaner JSX
  const { name, brand, category, desc, price, available, quantity, releaseDate } = product;
  const formattedReleaseDate = new Date(releaseDate).toLocaleDateString();

  return (
    <div className="product-container">
      <img
        className="product-image"
        src={imageUrl}
        alt={name}
      />

      <div className="product-details-column">
        <div className="product-header">
          <span className="product-category">
            {category}
          </span>
          <p className="product-release-date">
            <h6>Listed : <span><i>{formattedReleaseDate}</i></span></h6>
          </p>
        </div>
        
        <h1 className="product-name">
          {name}
        </h1>
        <i className="product-brand">{brand}</i>
        <p className="product-description-label">PRODUCT DESCRIPTION :</p>
        <p className="product-description-text">{desc}</p>

        <div className="product-price-section">
          <span className="product-price-value">
            {"$" + price}
          </span>
          <button
            className={`add-to-cart-btn ${!available ? "disabled-btn" : ""}`}
            onClick={handleAddToCart}
            disabled={!available}
          >
            {available ? "Add to cart" : "Out of Stock"}
          </button>
          <h6 className="product-stock-quantity">
            Stock Available :{" "}
            <i className="stock-count">
              {quantity}
            </i>
          </h6>
        </div>
        <div className="product-actions">
          <button
            className="btn-action primary-action"
            type="button"
            onClick={handleEditClick}
          >
            Update
          </button>
          <button
            className="btn-action danger-action"
            type="button"
            onClick={handleDeleteProduct}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;
