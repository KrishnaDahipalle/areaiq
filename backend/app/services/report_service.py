from typing import Dict, Any, List, Optional
from app.services.ranking_service import ranking_engine
from app.api.schemas.locality import CompleteCityPayloadModel, UnifiedLocalityModel, AssetPricing, GrowthTimeline

class ReportService:
    def generate_report(self, locality_id: str) -> Dict[str, Any]:
        """
        Synthesizes an uncompressed, certified executive intelligence report 
        mapping long-term growth analytics and structural infrastructure vectors
        extracted from validated Pydantic model domains.
        """
        # 1. Ingest data via strict Pydantic model payloads
        raw_data = ranking_engine._load_dataset()
        city_payload = CompleteCityPayloadModel.model_validate(raw_data)
        localities: List[UnifiedLocalityModel] = city_payload.localities
        
        # 2. Extract specific model instance using clean object properties
        locality: Optional[UnifiedLocalityModel] = next(
            (loc for loc in localities if loc.id.lower() == locality_id.lower()),
            None
        )

        if not locality:
            raise ValueError(f"Dossier compiler abort: Locality reference node '{locality_id}' not found.")
        
        # 3. Safe attribute extraction from nested Pydantic sub-schemas
        prices: AssetPricing = locality.prices
        growth: GrowthTimeline = locality.growth_analytics
        time_series: Dict[str, int] = growth.time_series_data
        
        # Compute real mathematical growth span delta metrics on verified timeline data
        years = sorted(list(time_series.keys()))
        price_delta_pct = 0.0
        if len(years) >= 2:
            start_val = float(time_series[years[0]])
            end_val = float(time_series[years[-1]])
            if start_val > 0:
                price_delta_pct = round(((end_val - start_val) / start_val) * 100, 1)

        return {
            "document_control": {
                "scope": "AreaIQ Locality Intelligence Dossier",
                "target_node": locality.id.upper(),
                "certified_timestamp": city_payload.last_updated
            },
            "profile": {
                "name": locality.name,
                "market_tier": prices.market_tier,
                "abstract_overview": locality.overview
            },
            "quantitative_matrix": {
                "dimension_scores": locality.scores,
                "financial_baselines": {
                    "estimated_price_per_sqft": prices.avg_price_per_sqft,
                    "avg_monthly_rent_2bhk": prices.rent_2bhk_avg,
                    "avg_monthly_rent_3bhk": prices.rent_3bhk_avg
                }
            },
            "growth_trajectory": {
                "current_momentum": growth.market_status,
                "compounded_annual_cagr_pct": growth.cagr_5_year_pct,
                "historical_appreciation_span_pct": price_delta_pct,
                "raw_timeline_data": time_series
            },
            "qualitative_synthesis": {
                "neighborhood_advantages": locality.pros,
                "infrastructure_vulnerabilities": locality.cons,
                "strategic_advisor_anchor": locality.ai_insights_anchor
            }
        }

report_service = ReportService()