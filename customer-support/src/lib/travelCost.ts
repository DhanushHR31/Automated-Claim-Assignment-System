export interface TravelCostSettings {
  costPerKm: number;
  stayThresholdKm: number;
  stayCost: number;
}

export const DEFAULT_TRAVEL_COST_SETTINGS: TravelCostSettings = {
  costPerKm: 8,
  stayThresholdKm: 200,
  stayCost: 3500,
};

const STORAGE_KEY = "support_travel_cost_settings";

export function getTravelCostSettings(): TravelCostSettings {
  if (typeof window === "undefined") return DEFAULT_TRAVEL_COST_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TRAVEL_COST_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      costPerKm: Number(parsed.costPerKm) || DEFAULT_TRAVEL_COST_SETTINGS.costPerKm,
      stayThresholdKm: Number(parsed.stayThresholdKm) || DEFAULT_TRAVEL_COST_SETTINGS.stayThresholdKm,
      stayCost: Number(parsed.stayCost) || DEFAULT_TRAVEL_COST_SETTINGS.stayCost,
    };
  } catch {
    return DEFAULT_TRAVEL_COST_SETTINGS;
  }
}

export function saveTravelCostSettings(settings: TravelCostSettings) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event("travel-cost-settings-changed"));
}

export function calculateTravelCost(distanceKm: number, settings = getTravelCostSettings()) {
  const distance = Math.max(0, Number(distanceKm) || 0);
  const travelCost = Math.round(distance * settings.costPerKm);
  const hotelCost = distance > settings.stayThresholdKm ? settings.stayCost : 0;
  return {
    distance,
    travelCost,
    hotelCost,
    totalCost: travelCost + hotelCost,
  };
}
