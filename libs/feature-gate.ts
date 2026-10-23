import { notFound } from "next/navigation";

import { FEATURES, type Feature } from "@/constants/features";

/** 404s a route while its feature is off. Call it in the route's layout. */
export function requireFeature(feature: Feature) {
  if (!FEATURES[feature]) notFound();
}
