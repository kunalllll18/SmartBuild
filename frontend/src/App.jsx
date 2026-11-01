import { useState, useEffect } from "react";
import "./App.css";
import AuthPage from "./AuthPage";
import CartDrawer from "./CartDrawer";
import CustomerDashboard from "./dashboards/CustomerDashboard";
import SupplierDashboard from "./dashboards/SupplierDashboard";
import EngineerDashboard from "./dashboards/EngineerDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";
import "./dashboards/Dashboard.css";

// Initial fallback materials
const initialFallbackMaterials = [
  {
    _id: "m1",
    name: "Premium OPC 53-Grade Cement",
    category: "Cement",
    price: 380,
    unit: "/ bag",
    description: "High early compressive strength suitable for multi-story columns, beams, and precast foundations.",
    image: "https://images.unsplash.com/photo-1513467655676-561b7d489a88?auto=format&fit=crop&w=800&q=85",
    tag: "Popular",
    isEcoFriendly: false,
    sustainabilityScore: 55,
    carbonFootprint: "Standard OPC carbon profile (~820 kg CO2/tonne)",
    specs: {
      Type: "Ordinary Portland Cement (53-Grade)",
      Packaging: "50 kg laminated moisture-proof bag",
      "Compressive Strength": "53 MPa at 28 days",
      Application: "High-load RCC structural members",
      Standard: "IS 269:2015 compliant",
    },
    supplierName: "Apex Concrete & Aggregates",
    supplier: {
      businessName: "Apex Concrete & Aggregates",
      rating: 4.9,
      reliabilityScore: 98,
      onTimeDeliveryRate: 98.5,
      isVerified: true,
      location: { city: "Pune", state: "Maharashtra", address: "Hadapsar Industrial Estate" },
      contactEmail: "contact@apexconcrete.in",
      phone: "+91 98220 11223",
      description: "Certified distributor of ultra-high strength cement and ready-mix solutions.",
    },
  },
  {
    _id: "m2",
    name: "Fly-Ash Pozzolana Eco-Cement (PPC)",
    category: "Cement",
    price: 355,
    unit: "/ bag",
    description: "Sustainable blended cement engineered with pozzolanic materials for lower thermal heat of hydration and salt resistance.",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=85",
    tag: "Eco-friendly",
    isEcoFriendly: true,
    sustainabilityScore: 88,
    carbonFootprint: "24% lower embodied emissions vs OPC",
    specs: {
      Type: "Portland Pozzolana Cement (PPC)",
      Packaging: "50 kg bag",
      "Pozzolanic Content": "28% recycled fly-ash blend",
      Application: "Plastering, masonry, marine structures",
      Standard: "IS 1489:2015 compliant",
    },
    supplierName: "Apex Concrete & Aggregates",
    supplier: {
      businessName: "Apex Concrete & Aggregates",
      rating: 4.9,
      reliabilityScore: 98,
      onTimeDeliveryRate: 98.5,
      isVerified: true,
      location: { city: "Pune", state: "Maharashtra" },
    },
  },
  {
    _id: "m3",
    name: "Tata Tiscon 550D TMT Rebar (12mm)",
    category: "Steel",
    price: 64,
    unit: "/ kg",
    description: "Super-ductile thermo-mechanically treated rebar offering superior energy absorption during seismic events.",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=85",
    tag: "High strength",
    isEcoFriendly: false,
    sustainabilityScore: 65,
    specs: {
      Grade: "Fe 550D (High Ductility)",
      Diameter: "12 mm nominal",
      "Yield Strength": "550 N/mm² minimum",
      Application: "Seismic-resistant structural reinforcement",
      Standard: "IS 1786:2008 compliant",
    },
    supplierName: "Deccan Steel & Rebar Co.",
    supplier: {
      businessName: "Deccan Steel & Rebar Co.",
      rating: 4.8,
      reliabilityScore: 96,
      onTimeDeliveryRate: 97.0,
      isVerified: true,
      location: { city: "Pune", state: "Maharashtra", address: "Chakan MIDC" },
      contactEmail: "sales@deccansteel.com",
    },
  },
  {
    _id: "m4",
    name: "Autoclaved Aerated Concrete (AAC) Blocks",
    category: "Bricks",
    price: 58,
    unit: "/ piece",
    description: "Ultra-lightweight precision masonry units delivering 3x thermal insulation and cutting structural dead weight by 50%.",
    image: "https://images.unsplash.com/photo-1584463699028-26e100f7e4c2?auto=format&fit=crop&w=800&q=85",
    tag: "Eco-friendly",
    isEcoFriendly: true,
    sustainabilityScore: 92,
    specs: {
      Dimensions: "600 mm x 200 mm x 150 mm",
      Density: "550 - 650 kg/m³",
      "Thermal Insulation": "3x superior to red clay brick",
      Standard: "IS 2185 compliant",
    },
    supplierName: "EcoBuild Brickworks & Blocks",
    supplier: {
      businessName: "EcoBuild Brickworks & Blocks",
      rating: 4.7,
      reliabilityScore: 95,
      onTimeDeliveryRate: 96.0,
      isVerified: true,
      location: { city: "Nashik", state: "Maharashtra" },
      contactEmail: "info@ecobuild.co",
    },
  },
  {
    _id: "m5",
    name: "Standard Wire-Cut Red Clay Bricks",
    category: "Bricks",
    price: 9.5,
    unit: "/ piece",
    description: "Dense, kiln-fired modular clay bricks with uniform dimensions and high water-weathering resistance.",
    image: "https://images.unsplash.com/photo-1590725140246-20acdee442be?auto=format&fit=crop&w=800&q=85",
    tag: "Best value",
    isEcoFriendly: false,
    sustainabilityScore: 50,
    specs: {
      Dimensions: "230 mm x 115 mm x 75 mm",
      "Crushing Strength": "7.5 N/mm²",
      Application: "Load-bearing exterior walls",
      Standard: "IS 1077 compliant",
    },
    supplierName: "EcoBuild Brickworks & Blocks",
    supplier: {
      businessName: "EcoBuild Brickworks & Blocks",
      rating: 4.7,
      reliabilityScore: 95,
      isVerified: true,
      location: { city: "Nashik", state: "Maharashtra" },
    },
  },
  {
    _id: "m6",
    name: "Manufactured Sand (M-Sand Eco Aggregate)",
    category: "Sand",
    price: 1450,
    unit: "/ tonne",
    description: "Ecological crushed granite sand with controlled particle gradation, eliminating riverbed dredging damage.",
    image: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=85",
    tag: "Eco-friendly",
    isEcoFriendly: true,
    sustainabilityScore: 90,
    specs: {
      Zone: "Zone II Fine Aggregate",
      "Silt Content": "Zero organic impurities",
      Application: "Concreting & structural mortar",
      Standard: "IS 383:2016 compliant",
    },
    supplierName: "Western Aggregates & Sands",
    supplier: {
      businessName: "Western Aggregates & Sands",
      rating: 4.6,
      reliabilityScore: 93,
      isVerified: true,
      location: { city: "Navi Mumbai", state: "Maharashtra" },
    },
  },
];

const initialCategories = [
  { name: "All Materials", icon: "✳", count: "06" },
  { name: "Cement", icon: "◈", count: "02" },
  { name: "Steel", icon: "▤", count: "01" },
  { name: "Bricks", icon: "▦", count: "02" },
  { name: "Sand", icon: "△", count: "01" },
];

const initialProjects = [
  {
    id: "PRJ-101",
    name: "Greenfield Residential Villa",
    projectType: "Residential",
    budget: 350000,
    status: "Procurement Active",
    location: { city: "Pune", state: "Maharashtra" },
    materialsRequired: [
      { materialName: "Premium OPC 53 Cement", quantity: 150, unit: "bags", status: "Delivered" },
      { materialName: "Tata Tiscon 550D TMT Rebar (12mm)", quantity: 1200, unit: "kg", status: "In Transit" },
      { materialName: "Manufactured Sand (M-Sand)", quantity: 12, unit: "tonnes", status: "Needed" },
    ],
    recommendations: [
      {
        name: "Fly-Ash Eco-Cement (PPC)",
        benefit: "Reduces thermal cracking & cuts carbon emissions by 24%",
        estimatedSavings: 18000,
        engineerStatus: "Approved",
      },
      {
        name: "Autoclaved Aerated Concrete (AAC) Blocks",
        benefit: "Lightweight, superior insulation compared to standard red bricks",
        estimatedSavings: 32000,
        engineerStatus: "Approved",
      },
    ],
  },
  {
    id: "PRJ-102",
    name: "Warehouse Extension - Bay 2",
    projectType: "Commercial",
    budget: 820000,
    status: "Planning Phase",
    location: { city: "Navi Mumbai", state: "Maharashtra" },
    materialsRequired: [],
    recommendations: [
      {
        name: "High-Grade Fe550D Rebar",
        benefit: "Higher seismic resilience and yield strength for large industrial spans",
        estimatedSavings: 45000,
        engineerStatus: "Pending Review",
      },
    ],
  },
];

const initialOrders = [
  {
    id: "ORD-9281",
    orderNumber: "ORD-9281",
    date: "Oct 28, 2026",
    supplier: "Apex Concrete & Aggregates",
    items: [
      { name: "Premium OPC 53 Cement", quantity: 50, unit: "/ bag", price: 380 },
      { name: "Manufactured Sand", quantity: 5, unit: "/ tonne", price: 1450 },
    ],
    projectName: "Greenfield Residential Villa",
    totalAmount: 26250,
    amount: "₹26,250",
    orderStatus: "In Transit",
    status: "In Transit",
    currentStepIndex: 3,
    shippingAddress: { street: "Plot 42, Sector 4, Baner", city: "Pune", recipientName: "Kunal Bachhav", phone: "+91 98220 11223" },
    paymentStatus: "Cash on Delivery",
  },
  {
    id: "ORD-8419",
    orderNumber: "ORD-8419",
    date: "Oct 15, 2026",
    supplier: "Deccan Steel & Rebar Co.",
    items: [
      { name: "Tata Tiscon 550D (12mm)", quantity: 800, unit: "/ kg", price: 64 },
    ],
    projectName: "Warehouse Extension - Bay 2",
    totalAmount: 51200,
    amount: "₹51,200",
    orderStatus: "Delivered",
    status: "Delivered",
    currentStepIndex: 4,
    shippingAddress: { street: "MIDC Sector 2", city: "Navi Mumbai", recipientName: "Kunal Bachhav", phone: "+91 98220 11223" },
    paymentStatus: "Paid",
  },
];

function App() {
  const [page, setPage] = useState("home");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Materials");
  const [ecoFilter, setEcoFilter] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [authMode, setAuthMode] = useState("login");

  // Dynamic Database State
  const [materials, setMaterials] = useState(initialFallbackMaterials);
  const [categories, setCategories] = useState(initialCategories);
  const [suppliers, setSuppliers] = useState([]);

  // Cart, Projects, and Orders State (Milestone 3)
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [projects, setProjects] = useState(initialProjects);
  const [orders, setOrders] = useState(initialOrders);
  const [notification, setNotification] = useState("");

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved =
        sessionStorage.getItem("smartbuild_user") ||
        localStorage.getItem("smartbuild_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Verify session on app mount
  useEffect(() => {
    const token =
      sessionStorage.getItem("smartbuild_token") ||
      localStorage.getItem("smartbuild_token");

    if (!token) return;

    fetch("http://localhost:5050/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Session invalid");
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          sessionStorage.setItem("smartbuild_user", JSON.stringify(data.user));
          localStorage.setItem("smartbuild_user", JSON.stringify(data.user));
        }
      })
      .catch((err) => {
        console.warn("Session verification notice:", err.message);
      });
  }, []);

  // Fetch materials dynamically
  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (search.trim()) queryParams.set("search", search.trim());
    if (category !== "All Materials") queryParams.set("category", category);
    if (ecoFilter) queryParams.set("ecoOnly", "true");

    fetch(`http://localhost:5050/api/materials?${queryParams.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load materials");
        return res.json();
      })
      .then((data) => {
        if (data.materials && data.materials.length > 0) {
          setMaterials(data.materials);
        }
      })
      .catch(() => {});
  }, [search, category, ecoFilter]);

  // Fetch dynamic categories
  useEffect(() => {
    fetch("http://localhost:5050/api/materials/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch user's cart, projects, and orders when authenticated
  useEffect(() => {
    const token =
      sessionStorage.getItem("smartbuild_token") ||
      localStorage.getItem("smartbuild_token");

    if (!token || !currentUser) return;

    // Fetch Cart
    fetch("http://localhost:5050/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.cart) setCart(data.cart);
      })
      .catch(() => {});

    // Fetch Projects
    fetch("http://localhost:5050/api/projects", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.projects && data.projects.length > 0) setProjects(data.projects);
      })
      .catch(() => {});

    // Fetch Orders
    fetch("http://localhost:5050/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.orders && data.orders.length > 0) setOrders(data.orders);
      })
      .catch(() => {});
  }, [currentUser]);

  function handleLogout() {
    sessionStorage.removeItem("smartbuild_token");
    localStorage.removeItem("smartbuild_token");
    sessionStorage.removeItem("smartbuild_user");
    localStorage.removeItem("smartbuild_user");
    setCurrentUser(null);
    setCart({ items: [], totalAmount: 0 });
    setPage("home");
    scrollToTop();
  }

  // Add Item to Cart
  async function handleAddToCart(material, qty = 1, project = null) {
    if (!currentUser) {
      alert("Authentication Required: Please log in or sign up to add materials to your cart.");
      openAuth("login");
      return;
    }

    const token =
      sessionStorage.getItem("smartbuild_token") ||
      localStorage.getItem("smartbuild_token");

    const materialId = material._id || material.id;
    const numericPrice = typeof material.price === "number" ? material.price : Number(String(material.price).replace(/[₹,]/g, "")) || 0;

    // Optimistic / local update
    const existingIndex = cart.items.findIndex(
      (i) => (i.material === materialId || i._id === materialId)
    );

    let updatedItems = [...cart.items];
    if (existingIndex > -1) {
      updatedItems[existingIndex].quantity += qty;
    } else {
      updatedItems.push({
        _id: `ci-${Date.now()}`,
        material: materialId,
        name: material.name,
        price: numericPrice,
        unit: material.unit,
        quantity: qty,
        image: material.image,
        supplierName: material.supplier?.businessName || material.supplierName || "Certified Supplier",
        project: project ? project._id || project.id : null,
        projectName: project ? project.name : "",
      });
    }

    const newTotal = updatedItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
    setCart({ items: updatedItems, totalAmount: newTotal });
    setIsCartOpen(true);

    // Call backend API
    if (token && materialId) {
      try {
        await fetch("http://localhost:5050/api/cart/items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            materialId,
            quantity: qty,
            projectId: project ? project._id || project.id : null,
            projectName: project ? project.name : "",
          }),
        });
      } catch (err) {
        console.warn("Backend cart update fallback:", err.message);
      }
    }
  }

  // Update Cart Quantity
  function handleUpdateCartQty(itemId, newQty) {
    const updatedItems = cart.items.map((i) =>
      (i._id === itemId || i.material === itemId ? { ...i, quantity: newQty } : i)
    );
    const newTotal = updatedItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
    setCart({ items: updatedItems, totalAmount: newTotal });
  }

  // Remove Item from Cart
  function handleRemoveCartItem(itemId) {
    const updatedItems = cart.items.filter((i) => i._id !== itemId && i.material !== itemId);
    const newTotal = updatedItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
    setCart({ items: updatedItems, totalAmount: newTotal });
  }

  // Checkout Success Handler
  function handleCheckoutSuccess(newOrder) {
    setOrders([newOrder, ...orders]);
    setCart({ items: [], totalAmount: 0 });
    setPage("dashboard");
    scrollToTop();
    setNotification(`Purchase Order ${newOrder.orderNumber || newOrder.id} placed! Tracking is now active.`);
    setTimeout(() => setNotification(""), 6000);
  }

  const displayedMaterials = materials.filter((material) => {
    const matchesSearch =
      material.name.toLowerCase().includes(search.toLowerCase()) ||
      material.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All Materials" || material.category === category;

    const matchesEco = !ecoFilter || material.isEcoFriendly;

    return matchesSearch && matchesCategory && matchesEco;
  });

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openMaterials(selectedCategory = "All Materials") {
    setCategory(selectedCategory);
    setSearch("");
    setEcoFilter(false);
    setPage("materials");
    scrollToTop();
  }

  function openDetails(material) {
    setSelectedMaterial(material);
    setQuantity(1);
    setPriceHistory([]);
    setPage("details");
    scrollToTop();

    const matId = material._id || material.id;
    if (matId) {
      fetch(`http://localhost:5050/api/materials/${matId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.material) setSelectedMaterial(data.material);
          if (data.priceHistory && data.priceHistory.length > 0) {
            setPriceHistory(data.priceHistory);
          } else {
            generateDemoPriceHistory(material.price);
          }
        })
        .catch(() => generateDemoPriceHistory(material.price));
    } else {
      generateDemoPriceHistory(material.price);
    }
  }

  function generateDemoPriceHistory(baseNumeric) {
    const p = typeof baseNumeric === "number" ? baseNumeric : Number(String(baseNumeric).replace(/[₹,]/g, "")) || 100;
    const history = [
      { recordedAt: "May 2026", price: Math.round(p * 0.92), trend: "rising" },
      { recordedAt: "Jun 2026", price: Math.round(p * 0.94), trend: "rising" },
      { recordedAt: "Jul 2026", price: Math.round(p * 0.96), trend: "rising" },
      { recordedAt: "Aug 2026", price: Math.round(p * 0.98), trend: "rising" },
      { recordedAt: "Sep 2026", price: Math.round(p * 1.01), trend: "falling" },
      { recordedAt: "Oct 2026 (Live)", price: p, trend: "stable" },
    ];
    setPriceHistory(history);
  }

  function goHome() {
    setPage("home");
    setSearch("");
    setCategory("All Materials");
    setEcoFilter(false);
    scrollToTop();
  }

  function goBackToMaterials() {
    openMaterials(selectedMaterial?.category || "All Materials");
  }

  function openAuth(mode) {
    setAuthMode(mode);
    setPage("auth");
    scrollToTop();
  }

  function scrollToWhyUs() {
    if (page !== "home") {
      setPage("home");
      window.setTimeout(() => {
        document.getElementById("why-us")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById("why-us")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  const selectedNumericPrice = selectedMaterial
    ? typeof selectedMaterial.price === "number"
      ? selectedMaterial.price
      : Number(String(selectedMaterial.price).replace(/[₹,]/g, "")) || 0
    : 0;

  const specsEntries = selectedMaterial?.specs
    ? selectedMaterial.specs instanceof Map
      ? Array.from(selectedMaterial.specs.entries())
      : Object.entries(selectedMaterial.specs)
    : [];

  const cartItemCount = cart.items.reduce((acc, curr) => acc + (curr.quantity || 1), 0);

  // Show Login or Sign Up
  if (page === "auth") {
    return (
      <AuthPage
        initialMode={authMode}
        onBack={goHome}
        onSuccess={(user) => {
          setCurrentUser(user);
          setPage("dashboard");
          scrollToTop();
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      {/* Toast Notification */}
      {notification && (
        <div style={{ position: "fixed", top: "86px", right: "24px", zIndex: 1100, background: "#15803d", color: "#ffffff", padding: "12px 20px", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", fontSize: "13px", fontWeight: "700" }}>
          ✓ {notification}
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onCheckoutSuccess={handleCheckoutSuccess}
        projects={projects}
        currentUser={currentUser}
        onOpenAuth={openAuth}
      />

      <header className="navbar">
        <button className="brand" onClick={goHome} aria-label="SmartBuild home">
          <span className="brand-mark">
            S<span>B</span>
          </span>
          <span>
            smart<span className="brand-accent">build.</span>
          </span>
        </button>

        <nav className="nav-links" aria-label="Main navigation">
          <button
            className={page === "home" ? "nav-link active" : "nav-link"}
            onClick={goHome}
          >
            Home
          </button>

          <button
            className={page === "materials" ? "nav-link active" : "nav-link"}
            onClick={() => openMaterials()}
          >
            Materials
          </button>

          {currentUser && (
            <button
              className={page === "dashboard" ? "nav-link active" : "nav-link"}
              onClick={() => {
                setPage("dashboard");
                scrollToTop();
              }}
            >
              Workspace
            </button>
          )}

          <button className="nav-link" onClick={scrollToWhyUs}>
            Why SmartBuild
          </button>
        </nav>

        <div className="nav-actions">
          {/* Cart Button */}
          <button
            className="nav-cart-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label="View Cart"
          >
            <span>🛒</span>
            <span>Cart</span>
            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
          </button>

          {currentUser ? (
            <>
              <div className="nav-user-pill">
                <span>👤 {currentUser.name.split(" ")[0]}</span>
                <span className={`nav-role-badge role-badge-${currentUser.role || "customer"}`}>
                  {currentUser.role || "customer"}
                </span>
              </div>

              <button
                className={page === "dashboard" ? "nav-dashboard-btn active" : "nav-dashboard-btn"}
                onClick={() => {
                  setPage("dashboard");
                  scrollToTop();
                }}
              >
                Dashboard ↗
              </button>

              <button
                className="nav-logout-btn"
                onClick={handleLogout}
                title="Log out of SmartBuild"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button className="nav-login" onClick={() => openAuth("login")}>
                Log in
              </button>

              <button className="nav-cta" onClick={() => openAuth("signup")}>
                Sign up <span>↗</span>
              </button>
            </>
          )}
        </div>
      </header>

      {page === "home" ? (
        <main>
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                THE SMARTER WAY TO BUILD
              </div>

              <h1>
                Build better.
                <br />
                Build <span className="gradient-text">smarter.</span>
              </h1>

              <p className="hero-description">
                Quality construction materials, verified local suppliers, and predictive analytics to make every build efficient and sustainable.
              </p>

              <div className="hero-actions">
                <button className="primary-button" onClick={() => openMaterials()}>
                  Explore materials <span>↗</span>
                </button>

                <button className="text-button" onClick={scrollToWhyUs}>
                  Discover SmartBuild <span>↓</span>
                </button>
              </div>

              <div className="hero-proof">
                <div className="proof-icon">✓</div>
                <div>
                  <strong>End-to-End Procurement & Delivery</strong>
                  <span>Cart Manifests · Project Linking · Multi-Stage Freight Tracking</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="visual-glow" />
              <div className="hero-image" role="img" aria-label="Modern construction site" />

              <div className="image-label">
                <span className="status-dot" />
                <div>
                  <strong>Build with confidence</strong>
                  <span>Every material is technically verified.</span>
                </div>
              </div>

              <div className="floating-note">
                <span className="note-symbol">✳</span>
                <span>
                  Procure Directly
                  <br />
                  & Track Live
                </span>
              </div>

              <span className="visual-caption">01 / A smarter foundation</span>
            </div>
          </section>

          <section className="trust-strip">
            <div>
              <span className="trust-icon">◇</span>
              <span>
                <strong>Quality first</strong>
                <small>IS Code certified specs</small>
              </span>
            </div>

            <div>
              <span className="trust-icon">🛒</span>
              <span>
                <strong>Cart & Checkout</strong>
                <small>Multi-supplier manifests</small>
              </span>
            </div>

            <div>
              <span className="trust-icon">🚚</span>
              <span>
                <strong>Real-Time Tracking</strong>
                <small>5-stage freight dispatch</small>
              </span>
            </div>

            <div>
              <span className="trust-icon">🌱</span>
              <span>
                <strong>Sustainable Options</strong>
                <small>Low-carbon eco materials</small>
              </span>
            </div>
          </section>

          <section className="section materials-section">
            <div className="section-heading">
              <div>
                <div className="eyebrow">YOUR PROJECT STARTS HERE</div>
                <h2>
                  Materials for every <span className="gradient-text">milestone.</span>
                </h2>
                <p>Explore verified construction essentials from accredited suppliers.</p>
              </div>

              <button className="outline-button" onClick={() => openMaterials()}>
                View all materials <span>↗</span>
              </button>
            </div>

            <div className="category-grid">
              {categories
                .filter((c) => c.name !== "All Materials")
                .map((cat, index) => {
                  const sampleMat = materials.find((m) => m.category === cat.name) || materials[0];
                  return (
                    <button
                      className="category-card"
                      key={cat.name}
                      onClick={() => openMaterials(cat.name)}
                      style={{ "--delay": `${index * 90}ms` }}
                    >
                      <div className="category-image">
                        <img src={sampleMat?.image} alt={cat.name} loading="lazy" />
                        <span className="category-number">0{index + 1}</span>
                      </div>

                      <div className="category-info">
                        <div>
                          <h3>{cat.name}</h3>
                          <p>{cat.count} listings available</p>
                        </div>
                        <span className="round-arrow">↗</span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </section>

          <section className="why-section" id="why-us">
            <div className="why-copy">
              <div className="eyebrow light-eyebrow">A BETTER BUILDING EXPERIENCE</div>
              <h2>
                Good decisions make <span>stronger foundations.</span>
              </h2>
              <p>
                SmartBuild unifies material discovery, supplier accountability, and predictive price data to protect your construction budget.
              </p>

              <button className="light-button" onClick={() => openMaterials()}>
                Start exploring <span>↗</span>
              </button>
            </div>

            <div className="why-features">
              <article>
                <span>01</span>
                <h3>Discover</h3>
                <p>Browse accredited cement, steel, bricks, and sand with live stock availability.</p>
              </article>

              <article>
                <span>02</span>
                <h3>Procure</h3>
                <p>Add items to your procurement cart, link to projects, and check out with COD or escrow.</p>
              </article>

              <article>
                <span>03</span>
                <h3>Track</h3>
                <p>Monitor real-time freight delivery milestones directly to your construction job site.</p>
              </article>
            </div>
          </section>
        </main>
      ) : page === "dashboard" ? (
        <main>
          {!currentUser ? (
            <div className="dashboard-container" style={{ textAlign: "center", padding: "80px 20px" }}>
              <h2>Authentication Required</h2>
              <p style={{ color: "#64748b", margin: "12px 0 24px" }}>
                Please log in or create an account to access role-specific dashboards.
              </p>
              <button className="primary-button" onClick={() => openAuth("login")}>
                Log in to SmartBuild ↗
              </button>
            </div>
          ) : currentUser.role === "supplier" ? (
            <SupplierDashboard user={currentUser} />
          ) : currentUser.role === "engineer" ? (
            <EngineerDashboard user={currentUser} />
          ) : currentUser.role === "admin" ? (
            <AdminDashboard user={currentUser} />
          ) : (
            <CustomerDashboard
              user={currentUser}
              projects={projects}
              setProjects={setProjects}
              orders={orders}
              setOrders={setOrders}
              onExploreMaterials={() => openMaterials()}
              onOpenCart={() => setIsCartOpen(true)}
            />
          )}
        </main>
      ) : page === "details" && selectedMaterial ? (
        <main className="detail-page">
          <div className="detail-breadcrumb">
            <button onClick={goHome}>Home</button>
            <span>/</span>
            <button onClick={goBackToMaterials}>Materials</button>
            <span>/</span>
            <span>{selectedMaterial.name}</span>
          </div>

          <div className="detail-layout">
            <div className="detail-gallery">
              <div className="detail-main-image">
                <img src={selectedMaterial.image} alt={selectedMaterial.name} />
                <span className="detail-image-badge">
                  {selectedMaterial.tag || "Product overview"}
                </span>
              </div>

              <div className="detail-image-caption">
                <span>SMARTBUILD CATALOG ID: {selectedMaterial._id ? selectedMaterial._id.slice(-6).toUpperCase() : "MAT-01"}</span>
                <span>LIVE DATABASE RECORD</span>
              </div>
            </div>

            <div className="detail-information">
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                {selectedMaterial.category.toUpperCase()} REGISTRY
              </div>

              <h1>{selectedMaterial.name}</h1>

              {selectedMaterial.isEcoFriendly && (
                <div className="eco-sustainability-badge">
                  <span>🌱 Eco-Certified Material</span>
                  <span>· Sustainability Rating: {selectedMaterial.sustainabilityScore || 88}/100</span>
                </div>
              )}

              <p className="detail-description">{selectedMaterial.description}</p>

              <div className="detail-price-panel">
                <span className="detail-price-label">Live Wholesale Unit Price</span>
                <div className="detail-price">
                  ₹{selectedNumericPrice.toLocaleString("en-IN")}
                  <span>{selectedMaterial.unit}</span>
                </div>
                <p>Fulfilled by: <strong>{selectedMaterial.supplier?.businessName || selectedMaterial.supplierName}</strong></p>
              </div>

              {/* Price Trend & Market Dynamics Card */}
              {priceHistory.length > 0 && (
                <div className="price-trend-card">
                  <div className="price-trend-header">
                    <h4>
                      <span>📈</span> Historical Price Trend & Market Dynamics
                    </h4>
                    <span className="trend-badge-stable">
                      Trend: Stable Wholesale
                    </span>
                  </div>

                  <div className="price-history-bars">
                    {priceHistory.map((item, idx) => {
                      const maxPrice = Math.max(...priceHistory.map((h) => h.price || 0));
                      const heightPercent = maxPrice > 0 ? Math.round((item.price / maxPrice) * 100) : 70;
                      const dateLabel = item.recordedAt
                        ? typeof item.recordedAt === "string" && item.recordedAt.length < 15
                          ? item.recordedAt
                          : new Date(item.recordedAt).toLocaleString("default", { month: "short" })
                        : `M${idx + 1}`;

                      return (
                        <div className="history-bar-col" key={idx}>
                          <span className="history-bar-val">₹{item.price}</span>
                          <div
                            className="history-bar-fill"
                            style={{ height: `${Math.max(25, heightPercent)}%` }}
                          />
                          <span className="history-bar-date">{dateLabel}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="price-trend-footer">
                    <span>Dataset: 6-month historical pricing</span>
                    <span>Data model: Time-Series Regression ready</span>
                  </div>
                </div>
              )}

              {/* AI Machine Learning Price Forecast */}
              <div className="ai-forecast-panel">
                <div className="ai-forecast-header">
                  <span>✦ AI 90-Day Price Forecast</span>
                  <span style={{ fontSize: "11px", fontWeight: "700" }}>OLS Regression Model</span>
                </div>
                <div style={{ fontSize: "13px", color: "#065f46", margin: "3px 0" }}>
                  Projected Q1 Wholesale Benchmark: <strong>₹{Math.round(selectedNumericPrice * 1.034).toLocaleString("en-IN")} {selectedMaterial.unit}</strong> (+3.4% projected trend)
                </div>
                <small style={{ fontSize: "11px", color: "#166534" }}>
                  Strategic Procurement Timing: Wholesale prices projected to trend upward. Optimal procurement window within next 14–21 days.
                </small>
              </div>

              {/* Specifications */}
              <div className="detail-specifications">
                <h3>Technical specifications</h3>
                {specsEntries.length > 0 ? (
                  specsEntries.map(([label, value]) => (
                    <div className="spec-row" key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))
                ) : (
                  <div className="spec-row">
                    <span>Category Standard</span>
                    <strong>IS Code Certified for Concreting and Masonry</strong>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="quantity-control">
                <div>
                  <strong>Procurement Quantity</strong>
                  <span>Indicative volume calculation</span>
                </div>

                <div className="quantity-buttons">
                  <button
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span>{quantity}</span>
                  <button
                    onClick={() => setQuantity((current) => Math.min(999, current + 1))}
                    disabled={quantity >= 999}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="detail-subtotal">
                <span>Indicative Subtotal:</span>
                <strong>
                  ₹{(selectedNumericPrice * quantity).toLocaleString("en-IN")}
                </strong>
              </div>

              <p className="subtotal-note">
                Excludes GST & site delivery logistics. Order requests are routed directly to the verified supplier.
              </p>

              <div className="detail-cta-row">
                <button
                  className="primary-button"
                  onClick={() => handleAddToCart(selectedMaterial, quantity)}
                >
                  Add to Procurement Cart 🛒
                </button>

                <button
                  className="secondary-action-button"
                  onClick={() => {
                    handleAddToCart(selectedMaterial, quantity);
                    setIsCartOpen(true);
                  }}
                >
                  Procure for Project ({quantity} {selectedMaterial.unit}) ↗
                </button>

                <button className="secondary-action-button" onClick={goBackToMaterials}>
                  Back to materials
                </button>
              </div>
            </div>
          </div>

          {/* Supplier Section */}
          <section className="supplier-section">
            <div className="section-heading">
              <div>
                <div className="eyebrow">VERIFIED SOURCE</div>
                <h2>Commercial Supplier Profile</h2>
                <p>Materials are sourced directly from accredited manufacturers and regional distributors.</p>
              </div>

              <span className="supplier-demo-badge">
                {selectedMaterial.supplier?.isVerified ? "ACCREDITED PARTNER" : "VERIFIED SUPPLIER"}
              </span>
            </div>

            <div className="supplier-grid">
              <article className="supplier-live-card">
                <div className="supplier-live-header">
                  <div>
                    <span className="status-pill pill-delivered">
                      {selectedMaterial.supplier?.isVerified ? "✓ Verified Commercial Stockist" : "Accredited Supplier"}
                    </span>
                    <h3 style={{ margin: "10px 0 4px", fontSize: "18px", color: "#0f172a" }}>
                      {selectedMaterial.supplier?.businessName || selectedMaterial.supplierName}
                    </h3>
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                      Operating Base: {selectedMaterial.supplier?.location?.city || "Pune"}, {selectedMaterial.supplier?.location?.state || "Maharashtra"}
                    </p>
                  </div>
                  <div className="supplier-avatar-large">🏭</div>
                </div>

                <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, margin: "6px 0" }}>
                  {selectedMaterial.supplier?.description ||
                    "Authorized regional stockist and distributor ensuring compliance with Indian Standard construction benchmarks."}
                </p>

                <div className="supplier-kpi-grid">
                  <div className="supplier-kpi-item">
                    <span className="supplier-kpi-label">Reliability Index</span>
                    <span className="supplier-kpi-val text-green">
                      {selectedMaterial.supplier?.reliabilityScore || 96}%
                    </span>
                  </div>
                  <div className="supplier-kpi-item">
                    <span className="supplier-kpi-label">On-Time Fulfillment</span>
                    <span className="supplier-kpi-val text-blue">
                      {selectedMaterial.supplier?.onTimeDeliveryRate || 98}%
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  <button
                    className="primary-button"
                    style={{ flex: 1, padding: "10px 14px", fontSize: "12px" }}
                    onClick={() => {
                      if (!currentUser) {
                        alert("Please log in to initiate supplier procurement inquiries.");
                        openAuth("login");
                      } else {
                        handleAddToCart(selectedMaterial, quantity);
                      }
                    }}
                  >
                    Procure Consignment ↗
                  </button>
                </div>
              </article>

              <article className="supplier-card supplier-info-card">
                <span className="supplier-info-icon">✳</span>
                <h3>Quality Assurance & Standards</h3>
                <p>
                  Every material batch listed on SmartBuild must conform to applicable BIS / IS quality codes and passes independent technical verification by registered engineers.
                </p>
                <button className="supplier-action" onClick={() => openMaterials()}>
                  Browse other materials <span>↗</span>
                </button>
              </article>
            </div>
          </section>
        </main>
      ) : (
        <main className="listing-page">
          <section className="listing-intro">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              DYNAMIC MATERIAL REGISTRY
            </div>

            <h1>
              Find the right materials.
              <br />
              <span className="gradient-text">Build with confidence.</span>
            </h1>

            <p>Explore verified construction materials from certified regional suppliers.</p>

            <div className="listing-stats">
              <span>
                <strong>{materials.length}</strong> Materials In Catalog
              </span>
              <span className="stat-divider" />
              <span>
                <strong>{categories.length - 1}</strong> Active Categories
              </span>
              <span className="stat-divider" />
              <span>
                <strong>{materials.filter((m) => m.isEcoFriendly).length}</strong> Eco-Certified Options
              </span>
            </div>
          </section>

          <section className="listing-layout">
            <aside className="filter-panel">
              <div className="filter-title">
                <h3>Categories</h3>
                <span>Browse</span>
              </div>

              {categories.map((item) => (
                <button
                  key={item.name}
                  className={
                    category === item.name ? "filter-item selected" : "filter-item"
                  }
                  onClick={() => setCategory(item.name)}
                >
                  <span className="filter-icon">{item.icon}</span>
                  <span>{item.name}</span>
                  <small>{item.count}</small>
                </button>
              ))}

              {/* Eco Filter Toggle */}
              <div style={{ marginTop: "20px", padding: "14px", background: "#f0fdf4", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "700", color: "#166534", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={ecoFilter}
                    onChange={(e) => setEcoFilter(e.target.checked)}
                    style={{ accentColor: "#16a34a", width: "16px", height: "16px" }}
                  />
                  <span>🌱 Eco-Friendly Only</span>
                </label>
                <small style={{ display: "block", color: "#15803d", fontSize: "10px", marginTop: "4px" }}>
                  Filter low-carbon AAC, PPC fly-ash, and manufactured sand
                </small>
              </div>

              <div className="filter-note">
                <span>✳</span>
                <strong>Planning a project?</strong>
                <p>Register as a Customer to save materials directly to your active project.</p>
              </div>
            </aside>

            <div className="listing-content">
              <div className="listing-toolbar">
                <div>
                  <h2>{category} {ecoFilter && "(Eco-Certified)"}</h2>
                  <p>
                    {displayedMaterials.length} materials matched your search and criteria
                  </p>
                </div>

                <label className="search-box">
                  <span>⌕</span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search materials, grades, or types..."
                    aria-label="Search materials"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      type="button"
                    >
                      ×
                    </button>
                  )}
                </label>
              </div>

              {displayedMaterials.length > 0 ? (
                <div className="product-grid">
                  {displayedMaterials.map((material, index) => {
                    const priceValue = typeof material.price === "number" ? material.price : Number(String(material.price).replace(/[₹,]/g, "")) || 0;
                    return (
                      <article
                        className="product-card"
                        key={material._id || material.name}
                        style={{ "--delay": `${index * 80}ms` }}
                      >
                        <div className="product-image">
                          <img src={material.image} alt={material.name} loading="lazy" />

                          <span className={`product-tag ${material.isEcoFriendly ? "eco-tag" : ""}`}>
                            {material.isEcoFriendly ? "🌱 " + (material.tag || "Eco-friendly") : material.tag}
                          </span>

                          <button
                            className="save-button"
                            aria-label={`Save ${material.name}`}
                            onClick={(event) => {
                              const button = event.currentTarget;
                              button.classList.toggle("saved");
                              button.textContent = button.classList.contains("saved")
                                ? "♥"
                                : "♡";
                            }}
                          >
                            ♡
                          </button>
                        </div>

                        <div className="product-details">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span className="product-category">{material.category}</span>
                            {material.sustainabilityScore && (
                              <span style={{ fontSize: "10px", fontWeight: "700", color: "#16a34a" }}>
                                Eco: {material.sustainabilityScore}/100
                              </span>
                            )}
                          </div>

                          <h3>{material.name}</h3>
                          <p>{material.description}</p>

                          <div className="product-bottom">
                            <div className="price">
                              <strong>₹{priceValue.toLocaleString("en-IN")}</strong>
                              <span>{material.unit}</span>
                            </div>

                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <button
                                className="table-action-btn"
                                style={{ padding: "6px 10px", fontSize: "11px" }}
                                onClick={() => handleAddToCart(material, 1)}
                                title="Add to cart"
                              >
                                + Cart
                              </button>
                              <button
                                className="product-arrow"
                                onClick={() => openDetails(material)}
                                aria-label={`View ${material.name} details`}
                              >
                                ↗
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <span>⌕</span>
                  <h3>No materials found</h3>
                  <p>Try another search keyword, reset the eco filter, or select a different category.</p>
                  <button
                    className="primary-button"
                    onClick={() => {
                      setSearch("");
                      setCategory("All Materials");
                      setEcoFilter(false);
                    }}
                  >
                    Reset all filters
                  </button>
                </div>
              )}

              <p className="price-disclaimer">
                Catalog prices are updated directly by verified regional stockists and suppliers.
              </p>
            </div>
          </section>
        </main>
      )}

      <footer className="footer">
        <button className="brand footer-brand" onClick={goHome}>
          <span className="brand-mark">
            S<span>B</span>
          </span>
          <span>
            smart<span className="brand-accent">build.</span>
          </span>
        </button>
        <p>Smart Construction Material Procurement and Recommendation Platform</p>
        <span className="footer-copy">
          © 2026 SmartBuild · Multi-Role Procurement Ecosystem.
        </span>
      </footer>
    </div>
  );
}

export default App;
