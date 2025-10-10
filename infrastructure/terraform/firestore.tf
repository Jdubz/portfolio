# Firestore Database Configuration
# This file defines the Firestore databases for each environment

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "static-sites-257923"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

# Production Firestore Database
resource "google_firestore_database" "portfolio_production" {
  project     = var.project_id
  name        = "portfolio"
  location_id = "nam5"
  type        = "FIRESTORE_NATIVE"

  # Concurrency mode
  concurrency_mode = "PESSIMISTIC"

  # App Engine integration (disabled for standalone Firestore)
  app_engine_integration_mode = "DISABLED"

  # Point-in-time recovery (disabled for free tier)
  point_in_time_recovery_enablement = "POINT_IN_TIME_RECOVERY_DISABLED"

  # Delete protection
  delete_protection_state = "DELETE_PROTECTION_ENABLED"

  lifecycle {
    prevent_destroy = true
  }
}

# Staging Firestore Database
resource "google_firestore_database" "portfolio_staging" {
  project     = var.project_id
  name        = "portfolio-staging"
  location_id = "nam5"
  type        = "FIRESTORE_NATIVE"

  # Concurrency mode
  concurrency_mode = "PESSIMISTIC"

  # App Engine integration (disabled for standalone Firestore)
  app_engine_integration_mode = "DISABLED"

  # Point-in-time recovery (disabled for staging)
  point_in_time_recovery_enablement = "POINT_IN_TIME_RECOVERY_DISABLED"

  # Delete protection (disabled for staging to allow recreation)
  delete_protection_state = "DELETE_PROTECTION_DISABLED"
}

# Outputs
output "production_database_name" {
  description = "Production Firestore database name"
  value       = google_firestore_database.portfolio_production.name
}

output "staging_database_name" {
  description = "Staging Firestore database name"
  value       = google_firestore_database.portfolio_staging.name
}
