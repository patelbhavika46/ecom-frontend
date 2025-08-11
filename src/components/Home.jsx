import React, { useContext, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import AppContext from "../Context/Context"; // Assuming Context.js is in the same directory
import unplugged from "../assets/unplugged.png"; // Assuming assets folder is in the same directory
import axios from "../axios"; // Assuming axios config is in the same directory
import '../assets/css/Home.css'; // Import the CSS file

// Memoized Product Card component for performance
const ProductCard = React.memo(({ product, addToCart }) => {
  const { id, brand, name, price, available, imageUrl } = product;

  // Conditionally apply a class based on product availability
  const cardClassName = `card-item ${!available ? 'out-of-stock' : ''}`;

  return (
    <div className={cardClassName} key={id}>
      <Link to={`/product/${id}`} className="card-link">
        <img
          src={imageUrl}
          alt={name}
          loading="lazy" // Lazy loading for better performance
          className="card-image"
        />
        <div className="card-body-content">
          <div>
            <h5 className="card-title-text">
              {name.toUpperCase()}
            </h5>
            <i className="card-brand-text">
              {"~ " + brand}
            </i>
          </div>
          <hr className="hr-line" />
          <div className="home-cart-price">
            <h5 className="card-price-text">
              <i className="bi bi-currency-rupee"></i>
              {price}
            </h5>
          </div>
          <button
            className="btn-hover color-9"
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            disabled={!available}
          >
            {available ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </Link>
    </div>
  );
});

const Home = ({ selectedCategory }) => {
  const { data, isError, addToCart, refreshData } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  // New state to control product availability filter
  const [showOnlyAvailableProducts, setShowOnlyAvailableProducts] = useState(false); 

  // Use useCallback to memoize the data fetching and image processing function
  const fetchDataAndImages = useCallback(async () => {
    if (!data || data.length === 0) {
      return; // Await initial data from context
    }
    
    const updatedProducts = await Promise.all(
      data.map(async (product) => {
        try {
          const response = await axios.get(
            `/product/${product.id}/image`,
            { responseType: "blob" }
          );
          const imageUrl = URL.createObjectURL(response.data);
          return { ...product, imageUrl };
        } catch (error) {
          console.error("Error fetching image for product ID:", product.id, error);
          return { ...product, imageUrl: "https://placehold.co/150x150/E0E0E0/808080?text=No+Image" }; // Placeholder image
        }
      })
    );
    setProducts(updatedProducts);
  }, [data]);

  useEffect(() => {
    // Only call refreshData once on component mount
    if (!isDataFetched) {
      refreshData();
      setIsDataFetched(true);
    }
  }, [refreshData, isDataFetched]);

  useEffect(() => {
    // Fetch images when 'data' from context changes
    fetchDataAndImages();
  }, [data, fetchDataAndImages]);

  // Cleanup function to revoke object URLs
  useEffect(() => {
    return () => {
      products.forEach(product => {
        if (product.imageUrl && product.imageUrl.startsWith("blob:")) {
          URL.revokeObjectURL(product.imageUrl);
        }
      });
    };
  }, [products]);

  // Combined filter logic for category and availability
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesAvailability = showOnlyAvailableProducts ? product.available : true;
    return matchesCategory && matchesAvailability;
  });

  if (isError) {
    return (
      <div className="error-container">
        <img src={unplugged} alt="Error" className="error-icon" />
        <p>Something went wrong. Please try again later.</p>
      </div>
    );
  }

  return (
    <>
      <div className="filter-controls">
        <button 
          className="btn-filter"
          onClick={() => setShowOnlyAvailableProducts(!showOnlyAvailableProducts)}
        >
          {showOnlyAvailableProducts ? "Show All Products" : "Show Only Available"}
        </button>
      </div>
      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <h2 className="no-products-message">
            {showOnlyAvailableProducts && products.some(p => p.available) ? 
              "No available products in this category." : 
              "No Products Available"
            }
          </h2>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
            />
          ))
        )}
      </div>
    </>
  );
};

export default Home;
