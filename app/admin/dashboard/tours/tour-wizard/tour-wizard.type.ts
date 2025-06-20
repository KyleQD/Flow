export type WizardStep = "basic-info" | "locations" | "events" | "team" | "review"

import type { TourBasicInfo } from "./tour-wizard.schema"
 
export interface TourWizardData {
  basicInfo: TourBasicInfo
  // locations, events, team, etc. to be added in later steps
} 