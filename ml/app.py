import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from models.recommender import MaterialRecommender
from models.price_predictor import PriceTrendPredictor
from models.supplier_evaluator import SupplierPerformanceEvaluator

app = Flask(__name__)
CORS(app)

# Initialize ML engines
recommender = MaterialRecommender()
price_predictor = PriceTrendPredictor()
supplier_evaluator = SupplierPerformanceEvaluator()

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "online",
        "service": "SmartBuild Machine Learning Microservice",
        "version": "1.0.0",
        "active_models": [
            "Material Recommendation Engine (AHP Multi-Attribute Matrix)",
            "Price Trend Prediction Model (Time-Series OLS Regression)",
            "Supplier Multi-Factor Reliability Evaluator (SCOR Index)",
        ],
        "endpoints": {
            "recommendations": "POST /recommend",
            "price_prediction": "POST /predict-price",
            "supplier_evaluation": "POST /evaluate-supplier",
            "models_status": "GET /models/status",
        },
    })

@app.route("/recommend", methods=["POST"])
def get_material_recommendations():
    """
    Suggests optimal construction materials and sustainable alternatives
    based on project classification, budget, and environmental goals.
    """
    try:
        data = request.get_json() or {}
        project_type = data.get("project_type", "Residential")
        budget = float(data.get("budget", 500000))
        sustainability_preference = bool(data.get("sustainability_preference", True))
        categories = data.get("categories", None)

        result = recommender.get_recommendations(
            project_type=project_type,
            budget=budget,
            sustainability_preference=sustainability_preference,
            categories=categories,
        )

        return jsonify({"success": True, "data": result}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/predict-price", methods=["POST"])
def predict_price():
    """
    Uses empirical and time-series historical price data
    to forecast future price trends (1m, 3m, 6m).
    """
    try:
        data = request.get_json() or {}
        material_name = data.get("material_name", "Construction Material")
        category = data.get("category", "Cement")
        current_price = float(data.get("current_price", 0)) if data.get("current_price") else None
        price_history = data.get("price_history", [])

        result = price_predictor.predict_price_trend(
            material_name=material_name,
            category=category,
            current_price=current_price,
            price_history=price_history,
        )

        return jsonify({"success": True, "data": result}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/evaluate-supplier", methods=["POST"])
def evaluate_supplier():
    """
    Evaluates supplier trustworthiness and on-time performance
    via weighted multi-factor indexing.
    """
    try:
        data = request.get_json() or {}
        on_time = float(data.get("on_time_delivery_rate", 98.0))
        fulfillment = float(data.get("fulfillment_rate", 96.0))
        rating = float(data.get("rating", 4.8))
        dispute = float(data.get("dispute_rate", 1.0))
        tenure = int(data.get("years_in_business", 5))
        is_verified = bool(data.get("is_verified", True))

        result = supplier_evaluator.evaluate_supplier(
            on_time_delivery_rate=on_time,
            fulfillment_rate=fulfillment,
            rating=rating,
            dispute_rate=dispute,
            years_in_business=tenure,
            is_verified=is_verified,
        )

        return jsonify({"success": True, "data": result}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/models/status", methods=["GET"])
def models_status():
    return jsonify({
        "models": [
            {
                "name": "Material Recommendation Engine",
                "framework": "Scikit-Learn & Multi-Criteria Decision Analysis",
                "status": "Ready & Serving",
                "dataset": "Accredited IS Code Specifications",
            },
            {
                "name": "Price Trend Regression Engine",
                "framework": "Scikit-Learn OLS Time-Series Modeling",
                "status": "Ready & Serving",
                "dataset": "Regional Wholesale Historical Price Series",
            },
            {
                "name": "Supplier Reliability Index",
                "framework": "Multi-Factor Weighted SCOR Framework",
                "status": "Ready & Serving",
                "dataset": "Commercial Fulfillment Tracking Metrics",
            },
        ]
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"SmartBuild ML Service running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
