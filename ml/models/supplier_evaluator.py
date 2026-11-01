import numpy as np

class SupplierPerformanceEvaluator:
    """
    Supplier Multi-Factor Reliability Evaluator:
    Evaluates commercial supplier trustworthiness, fulfillment resilience,
    and quality consistency using multi-criteria weighted performance modeling.
    """

    def __init__(self):
        # Operational factor weights based on construction supply chain benchmarks
        self.weights = {
            "on_time_delivery": 0.35,
            "fulfillment_accuracy": 0.25,
            "quality_rating": 0.20,
            "dispute_freedom": 0.10,
            "operational_tenure": 0.10,
        }

    def evaluate_supplier(
        self,
        on_time_delivery_rate=98.0,
        fulfillment_rate=96.0,
        rating=4.8,
        dispute_rate=1.0,
        years_in_business=6,
        is_verified=True,
    ):
        """
        Calculates composite reliability score (0 - 100) and risk tier.
        """
        # Normalize metrics to 0-100 scale
        s_on_time = min(100.0, max(0.0, float(on_time_delivery_rate)))
        s_fulfillment = min(100.0, max(0.0, float(fulfillment_rate)))
        s_quality = min(100.0, max(0.0, (float(rating) / 5.0) * 100.0))
        s_dispute = min(100.0, max(0.0, 100.0 - (float(dispute_rate) * 10.0)))
        s_tenure = min(100.0, max(20.0, float(years_in_business) * 15.0))

        # Weighted composite reliability index
        composite_score = (
            self.weights["on_time_delivery"] * s_on_time
            + self.weights["fulfillment_accuracy"] * s_fulfillment
            + self.weights["quality_rating"] * s_quality
            + self.weights["dispute_freedom"] * s_dispute
            + self.weights["operational_tenure"] * s_tenure
        )

        # Verification bonus/penalty
        if not is_verified:
            composite_score = max(40.0, composite_score * 0.90)

        composite_score = round(composite_score, 1)

        # Tier Classification & Risk Assessment
        if composite_score >= 94.0:
            tier = "Tier-1 Premier Accredited Stockist"
            risk_level = "Very Low Risk (Approved for High-Value Infrastructure & Commercial Builds)"
            fulfillment_grade = "A+"
        elif composite_score >= 85.0:
            tier = "Tier-2 Certified Standard Partner"
            risk_level = "Low Risk (Approved for Residential & Standard Construction)"
            fulfillment_grade = "A"
        elif composite_score >= 70.0:
            tier = "Tier-3 Qualified Supplier"
            risk_level = "Moderate Risk (Requires On-Site Material Sampling Verification)"
            fulfillment_grade = "B"
        else:
            tier = "Probationary Listing"
            risk_level = "Elevated Risk (Manual Engineering Verification Required Prior to Dispatch)"
            fulfillment_grade = "C"

        return {
            "composite_reliability_score": composite_score,
            "fulfillment_grade": fulfillment_grade,
            "tier_classification": tier,
            "risk_assessment": risk_level,
            "factor_breakdown": {
                "on_time_logistics": f"{s_on_time:.1f}%",
                "fulfillment_accuracy": f"{s_fulfillment:.1f}%",
                "material_quality_rating": f"{float(rating):.1f} / 5.0",
                "low_dispute_index": f"{s_dispute:.1f}%",
                "commercial_stability": f"{s_tenure:.1f}%",
            },
            "is_verified_accreditation": is_verified,
            "evaluation_engine": "Multi-Factor Weighted Supply Chain Performance Index (SCOR Framework)",
        }
