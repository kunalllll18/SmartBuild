# SmartBuild Machine Learning Microservice (`ml/`)

This microservice provides intelligent predictive modeling and multi-attribute decision analysis for the **Smart Build Construction Material Procurement and Recommendation Platform**.

---

## 1. Machine Learning Engines

### A. Multi-Criteria Material Recommendation Engine (`ml/models/recommender.py`)
- **Objective:** Suggests optimal construction materials tailored to project specifications (Residential, Commercial, Industrial, Infrastructure) while actively identifying eco-friendly substitutes.
- **Algorithm:** Analytic Hierarchy Process (AHP) & Multi-Attribute Utility Scoring combining:
  1. Structural Load Bearing & Seismic Capacity
  2. Environmental Durability & Moisture Resistance
  3. Cost Efficiency (Relative to procurement budget)
  4. Sustainability & Embodied Carbon Offset
- **Sustainable Substitution:** Analyzes conventional requests and computes carbon footprint reductions (e.g., 24.4% reduction via Pozzolana Fly-Ash, 72.3% reduction via AAC Blocks).

### B. Price Trend Prediction Model (`ml/models/price_predictor.py`)
- **Objective:** Forecasts future wholesale price trajectories (1-month, 3-month, 6-month horizons) to guide strategic procurement timing.
- **Algorithm:** Ordinary Least Squares (OLS) Time-Series Regression with seasonal market demand factors ($R^2 > 0.85$).
- **Output:** Predicted price, confidence interval, trend slope (`rising`, `stable`, `falling`), and procurement timing recommendations.

### C. Supplier Multi-Factor Reliability Evaluator (`ml/models/supplier_evaluator.py`)
- **Objective:** Evaluates commercial vendor fulfillment consistency, reducing delay risks on construction job sites.
- **Algorithm:** Weighted Multi-Factor Supply Chain Operations Reference (SCOR) index:
  - On-Time Logistics Rate ($35\%$)
  - Consignment Fulfillment Accuracy ($25\%$)
  - Technical Material Quality & Customer Rating ($20\%$)
  - Low Dispute Index ($10\%$)
  - Commercial Operating Tenure ($10\%$)
- **Output:** Composite reliability score (0–100%), fulfillment tier (`Tier-1 Premier Stockist`, `Tier-2 Certified Standard Partner`, `Probationary`), and risk classification.

---

## 2. API Endpoints

- `GET /`: Service health check and registered model catalog.
- `POST /recommend`: Suggests materials and sustainable alternatives.
  - Payload: `{ "project_type": "Residential", "budget": 450000, "sustainability_preference": true }`
- `POST /predict-price`: Computes regression forecasts based on historical points.
  - Payload: `{ "material_name": "Premium Cement", "category": "Cement", "current_price": 380, "price_history": [...] }`
- `POST /evaluate-supplier`: Computes composite reliability rating.
  - Payload: `{ "on_time_delivery_rate": 98.2, "fulfillment_rate": 96.5, "rating": 4.8, "dispute_rate": 0.5, "years_in_business": 6, "is_verified": true }`
- `GET /models/status`: Reports runtime framework and status.

---

## 3. Running the Service

```bash
cd ml
pip install -r requirements.txt
python app.py
```

The Flask microservice listens on `http://localhost:5001`.
The Node.js backend communicates with it via `/api/ml` endpoints.
