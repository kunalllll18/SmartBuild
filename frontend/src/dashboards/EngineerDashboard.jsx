import { useState } from "react";

export default function EngineerDashboard({ user }) {
  const [reviews, setReviews] = useState([
    {
      id: "REV-401",
      projectName: "Greenfield Residential Villa (G+2)",
      customer: "Kunal Bachhav",
      location: "Pune, Sector 4",
      projectType: "Residential Structure",
      soilType: "Black Cotton Soil",
      requestedMaterial: "Standard OPC 43 Grade Cement",
      aiRecommendation: "Pozzolana Portland Cement (PPC) + Admixture",
      rationale:
        "Higher chemical resistance to soil sulfates and reduces thermal cracking in slab casting.",
      carbonReduction: "26% lower embodied carbon",
      status: "Pending Review",
      engineerNote: "",
    },
    {
      id: "REV-402",
      projectName: "Commercial Logistics Hub - Bay 3",
      customer: "Apex Infra Projects",
      location: "Navi Mumbai Industrial Zone",
      projectType: "Heavy Commercial",
      soilType: "Coastal Sandy-Clay",
      requestedMaterial: "Fe415 Structural Steel",
      aiRecommendation: "Fe550D High Ductility Corrosion-Resistant Rebar (CRS)",
      rationale:
        "Coastal humidity requires corrosion-resistant steel; higher yield strength reduces rebar congestion by 18%.",
      carbonReduction: "14% material weight reduction",
      status: "Approved",
      engineerNote: "Approved for coastal salinity exposure. Conforms to IS 1786 specifications.",
    },
    {
      id: "REV-403",
      projectName: "Hillside Retaining Wall",
      customer: "Sahyadri Estates",
      location: "Lonavala High-Rainfall Zone",
      projectType: "Civil Infrastructure",
      soilType: "Laterite Rock & Silt",
      requestedMaterial: "Unreinforced Clay Brick Masonry",
      aiRecommendation: "Interlocking Concrete Geogrid Blocks with M30 Grade Core",
      rationale:
        "High hydrostatic pressure during monsoons makes unreinforced masonry susceptible to shear failure.",
      carbonReduction: "Enhanced 50-year structural lifespan",
      status: "Pending Review",
      engineerNote: "",
    },
  ]);

  const [activeReviewId, setActiveReviewId] = useState(null);
  const [engineerComment, setEngineerComment] = useState("");

  function handleDecision(reviewId, decision) {
    setReviews(
      reviews.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              status: decision,
              engineerNote: engineerComment || (decision === "Approved" ? "Technical suitability verified & certified." : "Alternative required due to structural safety parameters."),
            }
          : r
      )
    );
    setActiveReviewId(null);
    setEngineerComment("");
  }

  const pendingCount = reviews.filter((r) => r.status === "Pending Review").length;
  const approvedCount = reviews.filter((r) => r.status === "Approved").length;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-eyebrow">ENGINEERING & TECHNICAL VERIFICATION</div>
          <h1 className="dashboard-title">Technical Review Desk: Eng. {user.name}</h1>
          <p className="dashboard-sub">
            Validate ML-generated material recommendations against Indian Standards (IS Codes), structural load requirements, and environmental resilience.
          </p>
        </div>
        <div className="engineer-tag-wrap">
          <span className="engineer-spec-badge">
            📐 {user.specialization || "Structural & Environmental Engineering"}
          </span>
          <span className="certified-badge">✓ Certified SmartBuild Reviewer</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-metrics">
        <div className="metric-card">
          <span className="metric-label">Pending Verifications</span>
          <span className="metric-value">{pendingCount}</span>
          <span className="metric-hint text-amber">Requires engineering sign-off</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Approved Recommendations</span>
          <span className="metric-value">{approvedCount}</span>
          <span className="metric-hint text-green">100% IS Code compliance</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Average Carbon Offset Verified</span>
          <span className="metric-value">22.4%</span>
          <span className="metric-hint">Green building benchmarks achieved</span>
        </div>
      </div>

      {/* Verification Queue */}
      <div className="dashboard-section">
        <div className="section-title-row">
          <div>
            <h2>Project Recommendation Review Queue</h2>
            <p>Assess proposed materials for safety, structural longevity, and sustainable substitution.</p>
          </div>
        </div>

        <div className="reviews-list">
          {reviews.map((item) => (
            <div className="review-card" key={item.id}>
              <div className="review-card-top">
                <div>
                  <span className="review-id">{item.id}</span>
                  <h3>{item.projectName}</h3>
                  <span className="project-meta">
                    Client: <strong>{item.customer}</strong> · {item.location} · {item.projectType}
                  </span>
                </div>
                <span
                  className={`status-pill ${
                    item.status === "Approved"
                      ? "pill-delivered"
                      : item.status === "Rejected"
                      ? "pill-pending text-red"
                      : "pill-in-transit"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className="review-comparison-grid">
                <div className="comparison-box conventional-box">
                  <span className="box-tag">CONVENTIONAL REQUEST</span>
                  <h4>{item.requestedMaterial}</h4>
                  <p className="meta-text">Site Context: {item.soilType}</p>
                </div>

                <div className="comparison-arrow">➔</div>

                <div className="comparison-box ml-box">
                  <span className="box-tag ai-tag">AI SUSTAINABILITY RECOMMENDATION</span>
                  <h4>{item.aiRecommendation}</h4>
                  <p>{item.rationale}</p>
                  <span className="carbon-badge">🌱 {item.carbonReduction}</span>
                </div>
              </div>

              {item.engineerNote && (
                <div className="engineer-note-box">
                  <strong>Engineering Remarks:</strong> {item.engineerNote}
                </div>
              )}

              {item.status === "Pending Review" && (
                <div className="review-actions-bar">
                  {activeReviewId === item.id ? (
                    <div className="review-action-form">
                      <textarea
                        placeholder="Provide technical feedback, alternative suggestions, or compliance notes..."
                        value={engineerComment}
                        onChange={(e) => setEngineerComment(e.target.value)}
                        rows={3}
                      />
                      <div className="action-button-group">
                        <button
                          className="table-action-btn btn-success"
                          onClick={() => handleDecision(item.id, "Approved")}
                        >
                          ✓ Confirm & Approve
                        </button>
                        <button
                          className="table-action-btn btn-danger"
                          onClick={() => handleDecision(item.id, "Rejected")}
                        >
                          ✕ Reject / Suggest Alternate
                        </button>
                        <button
                          className="outline-button"
                          onClick={() => setActiveReviewId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="primary-button"
                      onClick={() => setActiveReviewId(item.id)}
                    >
                      Conduct Technical Review ↗
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
