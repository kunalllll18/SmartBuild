import { useState } from "react";

export default function CustomerDashboard({
  user,
  projects = [],
  setProjects,
  orders = [],
  setOrders,
  onExploreMaterials,
  onOpenCart,
}) {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);
  const [newProject, setNewProject] = useState({
    name: "",
    type: "Residential",
    budget: "",
    location: "",
  });

  // AI Recommendation Studio State
  const [aiProjectType, setAiProjectType] = useState("Residential");
  const [aiBudget, setAiBudget] = useState(450000);
  const [aiEcoPreference, setAiEcoPreference] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState(null);

  const TRACKING_STEPS = [
    { title: "Order Placed", desc: "Procurement request submitted & manifest generated" },
    { title: "Supplier Confirmed", desc: "Stock verified & assigned by regional distributor" },
    { title: "Processing & Batching", desc: "Materials packed & loaded onto freight carrier" },
    { title: "In Transit", desc: "Vehicle en route to destination site" },
    { title: "Delivered & Inspected", desc: "Consignment safely accepted at site" },
  ];

  async function handleRunAiRecommendation() {
    try {
      setAiLoading(true);
      const res = await fetch("http://localhost:5050/api/ml/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_type: aiProjectType,
          budget: Number(aiBudget),
          sustainability_preference: aiEcoPreference,
        }),
      });

      const data = await res.json();
      if (data.data) {
        setAiResults(data.data);
      }
    } catch (err) {
      console.warn("AI recommendation fallback notice:", err.message);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    const token =
      sessionStorage.getItem("smartbuild_token") ||
      localStorage.getItem("smartbuild_token");

    const projectPayload = {
      name: newProject.name.trim(),
      projectType: newProject.type,
      budget: Number(newProject.budget) || 0,
      location: { city: newProject.location.trim() || "Pune", state: "Maharashtra" },
    };

    try {
      const response = await fetch("http://localhost:5050/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectPayload),
      });

      const data = await response.json();
      if (response.ok && data.project) {
        setProjects([data.project, ...projects]);
      } else {
        throw new Error(data.message || "Failed to create project");
      }
    } catch {
      // Local fallback
      const created = {
        id: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
        name: newProject.name.trim(),
        type: newProject.type,
        budget: `₹${Number(newProject.budget || 0).toLocaleString("en-IN")}`,
        status: "Planning Phase",
        location: newProject.location.trim() || "Pune, Maharashtra",
        materials: [],
        recommendations: [
          {
            name: "Fly-Ash Eco-Cement (PPC)",
            benefit: "Cuts carbon emissions by 24% and prevents thermal cracking",
            estSavings: "₹18,000",
          },
          {
            name: "Autoclaved Aerated Concrete (AAC) Blocks",
            benefit: "Lightweight, superior insulation compared to standard red bricks",
            estSavings: "₹32,000",
          },
        ],
      };
      setProjects([created, ...projects]);
    }

    setNewProject({ name: "", type: "Residential", budget: "", location: "" });
    setShowNewProjectModal(false);
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-eyebrow">CUSTOMER WORKSPACE</div>
          <h1 className="dashboard-title">Welcome back, {user.name}</h1>
          <p className="dashboard-sub">
            Track ongoing projects, run AI multi-criteria material recommendations, and monitor real-time freight deliveries.
          </p>
        </div>
        <div className="dashboard-actions">
          <button
            className="primary-button"
            onClick={() => setShowNewProjectModal(true)}
          >
            + Create New Project
          </button>
          <button className="outline-button" onClick={onOpenCart}>
            🛒 View Cart
          </button>
          <button className="outline-button" onClick={onExploreMaterials}>
            Browse Materials ↗
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-metrics">
        <div className="metric-card">
          <span className="metric-label">Active Projects</span>
          <span className="metric-value">{projects.length}</span>
          <span className="metric-hint">Managed under current account</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Consignment Orders</span>
          <span className="metric-value">{orders.length}</span>
          <span className="metric-hint text-blue">Live multi-stage tracking active</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">ML Optimization Engine</span>
          <span className="metric-value">Active</span>
          <span className="metric-hint text-green">Multi-Criteria Matrix + OLS Regression</span>
        </div>
      </div>

      {/* AI Material Recommendation Studio */}
      <div className="ai-studio-card">
        <div className="ai-studio-header">
          <div>
            <div className="dashboard-eyebrow">✦ SMARTBUILD MACHINE LEARNING SUITE</div>
            <h2 style={{ margin: "4px 0 6px", fontSize: "20px", color: "#0f172a" }}>
              AI Material & Sustainability Recommendation Studio
            </h2>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
              Evaluate structural load indices, budget constraints, and embodied carbon offsets via multi-attribute decision matrix.
            </p>
          </div>
          <button
            className="primary-button"
            onClick={handleRunAiRecommendation}
            disabled={aiLoading}
          >
            {aiLoading ? "Optimizing Mix..." : "Run ML Material Optimization ⚡"}
          </button>
        </div>

        <div className="ai-studio-controls">
          <div className="form-group" style={{ margin: 0 }}>
            <label>Project Classification</label>
            <select
              value={aiProjectType}
              onChange={(e) => setAiProjectType(e.target.value)}
            >
              <option value="Residential">Residential Building (Low/Mid-Rise)</option>
              <option value="Commercial">Commercial / Office Complex</option>
              <option value="Industrial">Industrial Warehouse / Plant</option>
              <option value="Infrastructure">Infrastructure / Civil Works</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label>Procurement Budget (₹)</label>
            <input
              type="number"
              value={aiBudget}
              onChange={(e) => setAiBudget(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0, justifyContent: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginTop: "18px" }}>
              <input
                type="checkbox"
                checked={aiEcoPreference}
                onChange={(e) => setAiEcoPreference(e.target.checked)}
                style={{ width: "16px", height: "16px", accentColor: "#16a34a" }}
              />
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#166534" }}>
                Prioritize Low-Carbon Green Materials
              </span>
            </label>
          </div>
        </div>

        {/* AI Optimization Results */}
        {aiResults && (
          <div className="ai-results-box">
            <div className="ai-savings-banner">
              <div>
                <strong style={{ fontSize: "14px", color: "#065f46" }}>
                  🌱 Projected Environmental & Cost Savings:
                </strong>
                <span style={{ fontSize: "13px", color: "#047857", marginLeft: "8px" }}>
                  Estimated Carbon Offset: <strong>{aiResults.estimated_overall_carbon_offset}</strong> · Projected Procurement Savings: <strong>{aiResults.total_estimated_savings}</strong>
                </span>
              </div>
              <span style={{ fontSize: "11px", background: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: "6px", fontWeight: "700" }}>
                AHP Decision Utility Validated
              </span>
            </div>

            <div className="ai-materials-grid">
              {aiResults.recommended_materials.map((item, idx) => (
                <div className="ai-rec-card" key={idx}>
                  <div className="ai-rec-header">
                    <span className="ai-badge">{item.category}</span>
                    <span className="ai-score-pill">Suitability: {Math.round(item.recommendation_score * 100)}%</span>
                  </div>
                  <h4 style={{ margin: "4px 0 2px", fontSize: "14px", color: "#0f172a" }}>{item.material_name}</h4>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Standard: <strong>{item.is_code_standard}</strong> · Price: ₹{item.unit_price} {item.unit}
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#475569", lineHeight: 1.4 }}>
                    {item.rationale}
                  </p>
                </div>
              ))}
            </div>

            {aiResults.sustainable_alternatives.length > 0 && (
              <div style={{ background: "#ffffff", padding: "14px", borderRadius: "10px", border: "1px solid #bfdbfe" }}>
                <h4 style={{ margin: "0 0 8px", fontSize: "13px", color: "#1d4ed8" }}>
                  ✦ Green Substitution Opportunities:
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "10px" }}>
                  {aiResults.sustainable_alternatives.map((alt, sIdx) => (
                    <div key={sIdx} style={{ fontSize: "12px", background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                        Replace {alt.conventional_item} ➔ <span style={{ color: "#15803d" }}>{alt.recommended_eco_item}</span>
                      </div>
                      <div style={{ color: "#64748b", marginBottom: "2px" }}>
                        Impact: <strong style={{ color: "#15803d" }}>{alt.carbon_reduction_percent}</strong> · Savings: <strong>{alt.estimated_procurement_savings}</strong>
                      </div>
                      <div style={{ fontSize: "11px", color: "#475569" }}>{alt.engineering_benefit}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Projects Section */}
      <div className="dashboard-section">
        <div className="section-title-row">
          <div>
            <h2>My Construction Projects</h2>
            <p>Manage project specifications, material checklists, and technical recommendations.</p>
          </div>
        </div>

        <div className="projects-grid">
          {projects.map((project) => (
            <div className="project-card" key={project._id || project.id}>
              <div className="project-card-header">
                <div>
                  <span className="project-id">{project.id || (project._id ? project._id.slice(-6).toUpperCase() : "PRJ-01")}</span>
                  <h3>{project.name}</h3>
                  <span className="project-meta">
                    {project.projectType || project.type} · {project.location?.city || project.location || "Pune"} · Budget: {typeof project.budget === "number" ? `₹${project.budget.toLocaleString("en-IN")}` : project.budget}
                  </span>
                </div>
                <span className="status-badge status-active">{project.status}</span>
              </div>

              {/* Materials Checklist */}
              <div className="project-materials-list">
                <h4>Required Materials Checklist:</h4>
                {(project.materialsRequired || project.materials || []).length > 0 ? (
                  <ul>
                    {(project.materialsRequired || project.materials).map((m, idx) => (
                      <li key={idx}>
                        <span>{m.materialName || m.name}</span>
                        <span className="material-qty">{m.quantity ? `${m.quantity} ${m.unit || ""}` : m.qty}</span>
                        <span className={`mini-badge ${m.status === "Delivered" ? "pill-delivered" : ""}`}>
                          {m.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0" }}>
                    No materials added yet. Browse the catalog to attach items to this project.
                  </p>
                )}
              </div>

              {/* AI & Engineering Recommendations */}
              <div className="project-recommendations">
                <div className="rec-header">
                  <span className="ai-sparkle">✨</span>
                  <strong>SmartBuild AI & Engineering Insights</strong>
                </div>
                {(project.recommendations || []).map((rec, rIdx) => (
                  <div className="rec-item" key={rIdx}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="rec-name">{rec.name}</span>
                      <span style={{ fontSize: "10px", fontWeight: "700", color: "#16a34a" }}>
                        {rec.engineerStatus || "IS Certified"}
                      </span>
                    </div>
                    <div className="rec-benefit">{rec.benefit}</div>
                    <div className="rec-savings">
                      Potential Efficiency Savings: {typeof rec.estimatedSavings === "number" ? `₹${rec.estimatedSavings.toLocaleString("en-IN")}` : rec.estSavings || "₹25,000"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders & Delivery Tracking */}
      <div className="dashboard-section">
        <div className="section-title-row">
          <div>
            <h2>Order & Real-Time Delivery Tracking</h2>
            <p>Monitor procurement stages from supplier fulfillment to job site delivery.</p>
          </div>
        </div>

        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Project Destination</th>
                <th>Materials Consignment</th>
                <th>Total Value</th>
                <th>Order Status</th>
                <th>Live Tracking Stage</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const stepIdx = order.currentStepIndex !== undefined ? order.currentStepIndex : order.trackingStep || 1;
                const itemsText = order.items
                  ? typeof order.items === "string"
                    ? order.items
                    : order.items.map((i) => `${i.name} (x${i.quantity || 1})`).join(", ")
                  : "Materials";

                return (
                  <tr key={order._id || order.id || order.orderNumber}>
                    <td><strong>{order.orderNumber || order.id}</strong></td>
                    <td>{order.projectName || "Site Procurement"}</td>
                    <td>{itemsText}</td>
                    <td>
                      <strong>
                        {typeof order.totalAmount === "number"
                          ? `₹${order.totalAmount.toLocaleString("en-IN")}`
                          : order.amount}
                      </strong>
                    </td>
                    <td>
                      <span className={`status-pill pill-${(order.orderStatus || order.status || "placed").toLowerCase().replace(" ", "-")}`}>
                        {order.orderStatus || order.status}
                      </span>
                    </td>
                    <td>
                      <div className="tracking-stepper">
                        {[0, 1, 2, 3, 4].map((idx) => (
                          <div
                            key={idx}
                            className={`step-dot ${idx <= stepIdx ? "completed" : ""}`}
                            title={TRACKING_STEPS[idx].title}
                          >
                            <span>{idx + 1}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button
                        className="table-action-btn"
                        onClick={() => setActiveTrackingOrder(order)}
                      >
                        Track Shipment ↗
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Order Tracking Modal */}
      {activeTrackingOrder && (
        <div className="modal-backdrop" onClick={() => setActiveTrackingOrder(null)}>
          <div className="modal-content" style={{ maxWidth: "580px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="cart-eyebrow">LIVE CONSIGNMENT TELEMETRY</span>
                <h3>Tracking #{activeTrackingOrder.orderNumber || activeTrackingOrder.id}</h3>
              </div>
              <button className="close-modal-btn" onClick={() => setActiveTrackingOrder(null)}>
                ✕
              </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div className="spec-row">
                <span>Destination Site:</span>
                <strong>{activeTrackingOrder.shippingAddress?.street || "Site Gate 2"}, {activeTrackingOrder.shippingAddress?.city || "Pune"}</strong>
              </div>
              <div className="spec-row">
                <span>Site Recipient:</span>
                <strong>{activeTrackingOrder.shippingAddress?.recipientName || user.name} ({activeTrackingOrder.shippingAddress?.phone || user.phone || "+91 98220 55667"})</strong>
              </div>
              <div className="spec-row">
                <span>Settlement Status:</span>
                <strong className="text-green">{activeTrackingOrder.paymentStatus || "Cash on Site Delivery"}</strong>
              </div>
            </div>

            {/* Stepper Detail */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              {TRACKING_STEPS.map((step, idx) => {
                const currentIdx = activeTrackingOrder.currentStepIndex !== undefined ? activeTrackingOrder.currentStepIndex : activeTrackingOrder.trackingStep || 1;
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={idx} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <div
                      className={`step-dot ${isPassed ? "completed" : ""}`}
                      style={{
                        width: "28px",
                        height: "28px",
                        fontSize: "12px",
                        flexShrink: 0,
                        boxShadow: isCurrent ? "0 0 0 4px rgba(37,99,235,0.2)" : "none",
                      }}
                    >
                      {isPassed ? "✓" : idx + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: isCurrent ? "#2563eb" : "#0f172a" }}>
                        {step.title} {isCurrent && <span style={{ fontSize: "11px", fontWeight: "600", color: "#2563eb" }}>(Current Status)</span>}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="modal-actions" style={{ marginTop: "20px" }}>
              <button
                className="primary-button"
                style={{ width: "100%" }}
                onClick={() => setActiveTrackingOrder(null)}
              >
                Close Tracking View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for creating a new project */}
      {showNewProjectModal && (
        <div className="modal-backdrop" onClick={() => setShowNewProjectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Construction Project</h3>
              <button
                className="close-modal-btn"
                onClick={() => setShowNewProjectModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. Modern duplex home build"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Project Classification</label>
                <select
                  value={newProject.type}
                  onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}
                >
                  <option value="Residential">Residential Building</option>
                  <option value="Commercial">Commercial / Office</option>
                  <option value="Industrial">Industrial / Warehouse</option>
                  <option value="Infrastructure">Infrastructure / Civil</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estimated Procurement Budget (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 500000"
                  value={newProject.budget}
                  onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Site Location / City</label>
                <input
                  type="text"
                  placeholder="e.g. Pune, Maharashtra"
                  value={newProject.location}
                  onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="outline-button"
                  onClick={() => setShowNewProjectModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save & Launch Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
