from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class GeoContext(BaseModel):
    country_code: str = Field(..., description="ISO 2-character country indicator, e.g., 'IN'")
    state_code: str = Field(..., description="Regional/State code indicator, e.g., 'TS'")
    city_name: str = Field(..., description="Target urban center name, e.g., 'Hyderabad'")

class AssetPricing(BaseModel):
    avg_price_per_sqft: int = Field(..., description="Weighted average acquisition value per square foot")
    rent_2bhk_avg: int = Field(..., description="Average monthly rental index for a standard 2BHK unit")
    rent_3bhk_avg: int = Field(..., description="Average monthly rental index for a standard 3BHK unit")
    market_tier: str = Field(..., description="Classification category: Value, Mid-Range, Premium, Ultra-Luxury")

class GrowthTimeline(BaseModel):
    market_status: str = Field(..., description="Trend flag: 'Aggressive Growth', 'Steady Growth', 'Stable / Stagnant'")
    cagr_5_year_pct: float = Field(..., description="Calculated 5-year Compound Annual Growth Rate percentage")
    time_series_data: Dict[str, int] = Field(..., description="Chronological map pairing yearly string keys to valuations")

class InfrastructureAmenities(BaseModel):
    schools: List[str] = Field(default_factory=list, description="Top primary educational institutions nearby")
    hospitals: List[str] = Field(default_factory=list, description="Top clinical healthcare operations nearby")
    metro_stations: List[str] = Field(default_factory=list, description="Operational high-capacity mass transit entry points")

class UnifiedLocalityModel(BaseModel):
    id: str = Field(..., description="URL-safe unique text identifier key, matching dataset keys")
    name: str = Field(..., description="Clean display name of the area sector")
    overview: str = Field(..., description="Factual abstract detailing layout context")
    scores: Dict[str, float] = Field(..., description="Calculated quality ratings mapped across 6 target dimensions")
    prices: AssetPricing
    growth_analytics: GrowthTimeline
    amenities: InfrastructureAmenities
    pros: List[str] = Field(..., description="Deterministic or analyzed local layout advantages")
    cons: List[str] = Field(..., description="Deterministic or analyzed real-time local layout vulnerabilities")
    ai_insights_anchor: str = Field(..., description="Baseline reference profile string to guide text rendering layers")

class CompleteCityPayloadModel(BaseModel):
    last_updated: str
    country_code: str
    state_code: str
    city_name: str
    localities: List[UnifiedLocalityModel]