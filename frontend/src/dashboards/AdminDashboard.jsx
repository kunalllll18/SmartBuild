import { useState, useEffect } from "react";

export default function AdminDashboard({ user }) {
  const [suppliers, setSuppliers] = useState([
    {
      id: "SUP-01",
      companyName: "Apex Concrete & Aggregates",
      representative: "Rajesh Sharma",
      email: "rajesh@apexconcrete.in",
      location: "Pune Industrial Area",
      materialsCount: 8,
      status: "Verified",
      reliabilityScore: "96%",
    },
    {
      id: "SUP-02",
      companyName: "Deccan Steel & Rebar Co.",
      representative: "Amit Patil",
      email: "sales@deccansteel.com",
      location: "Chakan MIDC, Maharashtra",
      materialsCount: 14,
      status: "Pending Verification",
      reliabilityScore: "New",
    },
    {
      id: "SUP-03",
      companyName: "EcoBuild Brickworks",
      representative: "Sunita Deshmukh",
      email: "contact@ecobuild.co",
      location: "Nashik Green Zone",
      materialsCount: 4,
      status: "Verified",
      reliabilityScore: "98%",
    },
  ]);

  const [mlModels, setMlModels] = useState([
    {
      name: "Material Recommendation Model",
      algorithm: "Multi-Criteria Decision Matrix (AHP) + Cosine Utility",
      lastTrained: "Oct 29, 2026",
      datasetRecords: "12,450 Project Specs",
      status: "Active & Serving",
    },
    {
      name: "Price Prediction Engine",
      algorithm: "Time-Series Regression & Seasonal Trend Analysis (OLS)",
      lastTrained: "Oct 30, 2026",
      datasetRecords: "85,200 Historic Material Price Points",
      status: "Active & Serving",
    },
    {
      name: "Supplier Reliability Evaluator",
      algorithm: "Multi-Factor Weighted SCOR Supply Chain Performance Index",
      lastTrained: "Oct 31, 2026",
      datasetRecords: "3,120 Order Fulfillment Cycles",
      status: "Active & Serving",
    },
  ]);

  useEffect(() => {
    fetch("http://localhost:5050/api/ml/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.models && data.models.length > 0) {
          setMlModels((prev) =>
            prev.map((m, idx) => ({
              ...m,
              status: "Active & Serving",
              framework: data.models[idx]?.framework || m.algorithm,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  function toggleSupplierVerification(supId) {
    setSuppliers(
      suppliers.map((s) =>
        s.id === supId
          ? {
              ...s,
              status: s.status === "Verified" ? "Pending Verification" : "Verified",
            }
          : s
      )
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-eyebrow">PLATFORM ADMINISTRATION & GOVERNANCE</div>
          <h1 className="dashboard-title">Platform Operations Center</h1>
          <p className="dashboard-sub">
            Logged in as Super Administrator ({user.email}). Oversee platform users, verify commercial suppliers, monitor order transactions, and inspect ML model pipelines.
          </p>
        </div>
        <div className="admin-status-pill">
          <span className="live-dot" /> System Operational · All Services Healthy
        </div>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-metrics">
        <div className="metric-card">
          <span className="metric-label">Registered Platform Users</span>
          <span className="metric-value">1,428</span>
          <span className="metric-hint">1,120 Customers · 185 Suppliers · 120 Engineers · 3 Admins</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Supplier Verification Queue</span>
          <span className="metric-value">1 Pending</span>
          <span className="metric-hint text-amber">Review business registration</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Cumulative Transaction Volume</span>
          <span className="metric-value">₹42.8 Lakh</span>
          <span className="metric-hint text-green">↑ 28% MoM Growth</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Active ML Models</span>
          <span className="metric-value">3 / 3</span>
          <span className="metric-hint text-blue">100,000+ data points ingested</span>
        </div>
      </div>

      {/* Supplier Verification Management Section */}
      <div className="dashboard-section">
        <div className="section-title-row">
          <div>
            <h2>Supplier Verification & Quality Auditing</h2>
            <p>Ensure suppliers meet legal commercial standards and inventory reliability prior to public listing.</p>
          </div>
        </div>

        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Supplier ID</th>
                <th>Enterprise Name</th>
                <th>Representative</th>
                <th>Email</th>
                <th>Operating Base</th>
                <th>Catalog Items</th>
                <th>Reliability Score</th>
                <th>Status</th>
                <th>Governance Action</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((sup) => (
                <tr key={sup.id}>
                  <td><strong>{sup.id}</strong></td>
                  <td><strong>{sup.companyName}</strong></td>
                  <td>{sup.representative}</td>
                  <td>{sup.email}</td>
                  <td>{sup.location}</td>
                  <td>{sup.materialsCount} items</td>
                  <td>{sup.reliabilityScore}</td>
                  <td>
                    <span
                      className={`status-pill ${
                        sup.status === "Verified" ? "pill-delivered" : "pill-pending"
                      }`}
                    >
                      {sup.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`table-action-btn ${
                        sup.status === "Verified" ? "btn-danger" : "btn-success"
                      }`}
                      onClick={() => toggleSupplierVerification(sup.id)}
                    >
                      {sup.status === "Verified" ? "Revoke Verification" : "Grant Verification ✓"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Machine Learning Pipeline Supervision */}
      <div className="dashboard-section">
        <div className="section-title-row">
          <div>
            <h2>Machine Learning Models & Analytics Status</h2>
            <p>Monitor datasets, algorithms, and training schedules powering SmartBuild intelligent features.</p>
          </div>
        </div>

        <div className="projects-grid">
          {mlModels.map((model, idx) => (
            <div className="project-card" key={idx}>
              <div className="project-card-header">
                <div>
                  <span className="project-id">MODEL #{idx + 1}</span>
                  <h3>{model.name}</h3>
                  <span className="project-meta">Algorithm: {model.algorithm}</span>
                </div>
                <span className="status-badge status-active">{model.status}</span>
              </div>
              <div className="model-details-list">
                <div className="spec-row">
                  <span>Training Dataset Size:</span>
                  <strong>{model.datasetRecords}</strong>
                </div>
                <div className="spec-row">
                  <span>Last Automated Retrain:</span>
                  <strong>{model.lastTrained}</strong>
                </div>
              </div>
              <div className="model-card-footer">
                <span className="status-indicator-green">● High Inference Health (p99 &lt; 45ms)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
