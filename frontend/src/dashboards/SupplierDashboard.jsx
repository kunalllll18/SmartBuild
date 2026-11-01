import { useState, useEffect } from "react";

export default function SupplierDashboard({ user }) {
  const [inventory, setInventory] = useState([
    {
      id: "MAT-01",
      name: "Premium OPC 53-Grade Cement",
      category: "Cement",
      price: 380,
      unit: "bag",
      stock: 450,
      status: "In Stock",
    },
    {
      id: "MAT-02",
      name: "Tata Tiscon 550D TMT Rebar (12mm)",
      category: "Steel",
      price: 64,
      unit: "kg",
      stock: 3200,
      status: "In Stock",
    },
    {
      id: "MAT-03",
      name: "Manufactured Sand (M-Sand)",
      category: "Sand",
      price: 1450,
      unit: "tonne",
      stock: 120,
      status: "In Stock",
    },
    {
      id: "MAT-04",
      name: "Autoclaved Aerated Concrete (AAC) Blocks",
      category: "Bricks",
      price: 58,
      unit: "piece",
      stock: 2500,
      status: "In Stock",
    },
  ]);

  const [orders, setOrders] = useState([
    {
      id: "ORD-9281",
      customer: "Kunal Bachhav",
      item: "Premium OPC 53 Cement (50 bags)",
      value: "₹19,000",
      status: "In Transit",
      date: "Oct 28, 2026",
      shippingAddress: "Plot 42, Baner Hills, Pune",
    },
    {
      id: "ORD-9290",
      customer: "Apex Infra Projects",
      item: "Tata Tiscon 550D (1,500 kg)",
      value: "₹96,000",
      status: "Confirmed",
      date: "Oct 30, 2026",
      shippingAddress: "Site B, Hinjewadi Phase 3, Pune",
    },
    {
      id: "ORD-9304",
      customer: "Greenfield Villa",
      item: "M-Sand Eco Aggregate (10 tonnes)",
      value: "₹14,500",
      status: "Placed",
      date: "Oct 31, 2026",
      shippingAddress: "Sector 4, Pune",
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Cement",
    price: "",
    unit: "bag",
    stock: "",
  });

  // Fetch supplier inventory & orders if API is live
  useEffect(() => {
    const token =
      sessionStorage.getItem("smartbuild_token") ||
      localStorage.getItem("smartbuild_token");

    if (!token) return;

    fetch("http://localhost:5050/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.orders && data.orders.length > 0) {
          const mapped = data.orders.map((o) => ({
            id: o.orderNumber || o._id,
            rawId: o._id,
            customer: o.customerName,
            item: o.items.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(", "),
            value: `₹${o.totalAmount.toLocaleString("en-IN")}`,
            status: o.orderStatus,
            date: new Date(o.createdAt).toLocaleDateString(),
            shippingAddress: `${o.shippingAddress?.street || ""}, ${o.shippingAddress?.city || "Pune"}`,
          }));
          setOrders(mapped);
        }
      })
      .catch(() => {});
  }, []);

  function handleAddItem(e) {
    e.preventDefault();
    if (!newItem.name.trim() || !newItem.price) return;

    const item = {
      id: `MAT-0${inventory.length + 1}`,
      name: newItem.name.trim(),
      category: newItem.category,
      price: Number(newItem.price),
      unit: newItem.unit,
      stock: Number(newItem.stock || 0),
      status: Number(newItem.stock) > 20 ? "In Stock" : "Low Stock",
    };

    setInventory([...inventory, item]);
    setNewItem({ name: "", category: "Cement", price: "", unit: "bag", stock: "" });
    setShowAddModal(false);
  }

  async function updateOrderStatus(orderId, newStatus) {
    const token =
      sessionStorage.getItem("smartbuild_token") ||
      localStorage.getItem("smartbuild_token");

    const orderObj = orders.find((o) => o.id === orderId);
    const targetId = orderObj?.rawId || orderId;

    if (token && targetId) {
      try {
        await fetch(`http://localhost:5050/api/orders/${targetId}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (err) {
        console.warn("Status update fallback:", err.message);
      }
    }

    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  }

  return (
    <div className="dashboard-container">
      {/* Supplier Profile Banner */}
      <div className="supplier-profile-banner">
        <div className="supplier-banner-info">
          <div className="supplier-banner-avatar">🏭</div>
          <div>
            <div className="dashboard-eyebrow">SUPPLIER PORTAL</div>
            <h2>{user.companyName || user.name + " Building Supplies"}</h2>
            <div className="supplier-badges">
              <span className={`status-pill ${user.isVerified ? "pill-delivered" : "pill-pending"}`}>
                {user.isVerified ? "✓ Verified Stockist" : "⏳ Verification Pending"}
              </span>
              <span className="supplier-meta-tag">Contact: {user.phone || "+91 98220 11223"}</span>
              <span className="supplier-meta-tag">Email: {user.email}</span>
            </div>
          </div>
        </div>

        <div className="supplier-score-card">
          <div className="score-item">
            <span className="score-number">4.9 / 5.0</span>
            <span className="score-title">Reliability Score</span>
          </div>
          <div className="score-divider" />
          <div className="score-item">
            <span className="score-number">98.2%</span>
            <span className="score-title">On-Time Fulfillment</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-metrics">
        <div className="metric-card">
          <span className="metric-label">Active Listed Materials</span>
          <span className="metric-value">{inventory.length}</span>
          <span className="metric-hint">Live in public SmartBuild catalog</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Fulfillment Queue</span>
          <span className="metric-value">{orders.filter((o) => o.status !== "Delivered").length} Active</span>
          <span className="metric-hint text-blue">Orders requiring dispatch</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Gross Fulfillment Value</span>
          <span className="metric-value">₹1,29,500</span>
          <span className="metric-hint text-green">↑ 16% MoM Growth</span>
        </div>
      </div>

      {/* Live Order Fulfillment Operations */}
      <div className="dashboard-section">
        <div className="section-title-row">
          <div>
            <h2>Order Fulfillment & Logistics Dispatch Queue</h2>
            <p>Advance consignment milestones to inform customers and update live GPS freight telemetry.</p>
          </div>
        </div>

        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Site Customer</th>
                <th>Material Manifest</th>
                <th>Consignment Value</th>
                <th>Destination</th>
                <th>Order Status</th>
                <th>Fulfillment Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong></td>
                  <td>{order.customer}</td>
                  <td>{order.item}</td>
                  <td><strong>{order.value}</strong></td>
                  <td><small>{order.shippingAddress}</small></td>
                  <td>
                    <span className={`status-pill pill-${order.status.toLowerCase().replace(" ", "-")}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-button-group">
                      {order.status === "Placed" && (
                        <button
                          className="table-action-btn btn-success"
                          onClick={() => updateOrderStatus(order.id, "Confirmed")}
                        >
                          Confirm Order ✓
                        </button>
                      )}
                      {order.status === "Confirmed" && (
                        <button
                          className="table-action-btn btn-complete"
                          onClick={() => updateOrderStatus(order.id, "In Transit")}
                        >
                          Dispatch Freight ➔
                        </button>
                      )}
                      {order.status === "In Transit" && (
                        <button
                          className="table-action-btn btn-success"
                          onClick={() => updateOrderStatus(order.id, "Delivered")}
                        >
                          Confirm Delivery ✓
                        </button>
                      )}
                      {order.status === "Delivered" && (
                        <span className="text-muted">Fulfilled ✓</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Management Section */}
      <div className="dashboard-section">
        <div className="section-title-row">
          <div>
            <h2>Material Listings & Live Stock Management</h2>
            <p>Update quantities, pricing, and availability visible across the SmartBuild catalog.</p>
          </div>
          <button className="primary-button" onClick={() => setShowAddModal(true)}>
            + Add New Material
          </button>
        </div>

        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Material Name</th>
                <th>Category</th>
                <th>Price / Unit</th>
                <th>Available Stock</th>
                <th>Inventory Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.id}</strong></td>
                  <td>{item.name}</td>
                  <td><span className="category-pill">{item.category}</span></td>
                  <td>₹{item.price} / {item.unit}</td>
                  <td><strong>{item.stock} {item.unit}s</strong></td>
                  <td>
                    <span className={`status-pill ${item.status === "In Stock" ? "pill-delivered" : "pill-pending"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="table-action-btn"
                      onClick={() => {
                        const newStock = prompt(`Update stock for ${item.name}:`, item.stock);
                        if (newStock !== null) {
                          setInventory(
                            inventory.map((inv) =>
                              inv.id === item.id
                                ? { ...inv, stock: Number(newStock), status: Number(newStock) > 20 ? "In Stock" : "Low Stock" }
                                : inv
                            )
                          );
                        }
                      }}
                    >
                      Update Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>List New Construction Material</h3>
              <button className="close-modal-btn" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleAddItem}>
              <div className="form-group">
                <label>Material Name & Grade</label>
                <input
                  type="text"
                  placeholder="e.g. Pozzolana Portland Cement 53-Grade"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                >
                  <option value="Cement">Cement</option>
                  <option value="Steel">Steel & Rebar</option>
                  <option value="Bricks">Bricks & Blocks</option>
                  <option value="Sand">Sand & Aggregates</option>
                  <option value="Timber">Timber & Plywood</option>
                  <option value="Finishing">Finishing & Paints</option>
                </select>
              </div>
              <div className="form-group">
                <label>Unit of Measure</label>
                <select
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                >
                  <option value="bag">Bag (50 kg)</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="tonne">Tonne</option>
                  <option value="piece">Piece</option>
                  <option value="sqft">Square Feet (sqft)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Unit Price (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 380"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Initial Stock Quantity</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={newItem.stock}
                  onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="outline-button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Publish to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
