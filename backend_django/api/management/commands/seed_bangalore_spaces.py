"""
Management command: seed_bangalore_spaces
==========================================
Creates real DB records for all 30 Bangalore parking lots from the dataset.

What it does:
  1. Creates one system 'owner' user  (smartpark@bangalore.ai)
  2. Creates 30 Parking rows — one per lot from BANGALORE_LOTS
  3. Creates 6 Space rows per lot   — slot labels + times based on lot type
     → 30 × 6 = 180 total Space records in the DB

Run locally:
    python manage.py seed_bangalore_spaces

Run on Render (one-time, via Shell):
    python manage.py seed_bangalore_spaces

Use --clear to wipe and re-seed:
    python manage.py seed_bangalore_spaces --clear
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta

from api.models import User, Parking, Space
from api.bangalore_lots import BANGALORE_LOTS


# ── Slot definitions per lot type ────────────────────────────────────────────
SLOT_CONFIG = {
    "Mall": {
        "slots": [
            ("Level 1 – Bay A",  "8:00am",  "10:00am", 0),
            ("Level 1 – Bay B",  "10:00am", "12:00pm", 5),
            ("Level 2 – Bay A",  "12:00pm", "2:00pm",  5),
            ("Level 2 – Bay B",  "2:00pm",  "4:00pm",  5),
            ("Level 3 – Bay A",  "4:00pm",  "6:00pm",  10),
            ("Terrace Park",     "6:00pm",  "8:00pm",  10),
        ]
    },
    "Office": {
        "slots": [
            ("Block A – Fl. 1",  "8:00am",  "10:00am", 0),
            ("Block A – Fl. 2",  "10:00am", "12:00pm", 0),
            ("Block B – Fl. 1",  "12:00pm", "2:00pm",  0),
            ("Block B – Fl. 2",  "2:00pm",  "4:00pm",  0),
            ("Visitor Bay",      "4:00pm",  "6:00pm",  5),
            ("Reserved Zone",    "6:00pm",  "8:00pm",  5),
        ]
    },
    "Hospital": {
        "slots": [
            ("Emergency Bay",    "8:00am",  "10:00am", 0),
            ("OPD Parking",      "10:00am", "12:00pm", 0),
            ("Visitor Zone A",   "12:00pm", "2:00pm",  0),
            ("Visitor Zone B",   "2:00pm",  "4:00pm",  0),
            ("Night Parking",    "4:00pm",  "6:00pm",  5),
            ("Staff Reserved",   "6:00pm",  "8:00pm",  5),
        ]
    },
    "Airport": {
        "slots": [
            ("P1 – Level 1",     "8:00am",  "10:00am", 20),
            ("P1 – Level 2",     "10:00am", "12:00pm", 20),
            ("P2 – Level 1",     "12:00pm", "2:00pm",  20),
            ("P2 – Level 2",     "2:00pm",  "4:00pm",  20),
            ("Short Stay",       "4:00pm",  "6:00pm",  30),
            ("Long Stay",        "6:00pm",  "8:00pm",  10),
        ]
    },
    "Transit": {
        "slots": [
            ("Platform Bay 1",   "8:00am",  "10:00am", 0),
            ("Platform Bay 2",   "10:00am", "12:00pm", 0),
            ("Short Stop",       "12:00pm", "2:00pm",  0),
            ("Day Parking",      "2:00pm",  "4:00pm",  0),
            ("Night Parking",    "4:00pm",  "6:00pm",  5),
            ("Commuter Zone",    "6:00pm",  "8:00pm",  0),
        ]
    },
    "Street": {
        "slots": [
            ("North Side",       "8:00am",  "10:00am", 0),
            ("South Side",       "10:00am", "12:00pm", 0),
            ("East Corner",      "12:00pm", "2:00pm",  0),
            ("West Corner",      "2:00pm",  "4:00pm",  0),
            ("Near Junction",    "4:00pm",  "6:00pm",  0),
            ("Service Lane",     "6:00pm",  "8:00pm",  0),
        ]
    },
    "Residential": {
        "slots": [
            ("Block A",          "8:00am",  "10:00am", 0),
            ("Block B",          "10:00am", "12:00pm", 0),
            ("Visitor Slot",     "12:00pm", "2:00pm",  0),
            ("Two-Wheeler",      "2:00pm",  "4:00pm",  -5),
            ("EV Charging",      "4:00pm",  "6:00pm",  10),
            ("Night Slot",       "6:00pm",  "8:00pm",  0),
        ]
    },
}

# Fallback for unknown types
DEFAULT_SLOTS = [
    ("Zone A", "8:00am",  "10:00am", 0),
    ("Zone B", "10:00am", "12:00pm", 0),
    ("Zone C", "12:00pm", "2:00pm",  0),
    ("Zone D", "2:00pm",  "4:00pm",  0),
    ("Zone E", "4:00pm",  "6:00pm",  0),
    ("Zone F", "6:00pm",  "8:00pm",  0),
]

SYSTEM_OWNER_EMAIL    = "smartpark@bangalore.ai"
SYSTEM_OWNER_PASSWORD = "SmartPark@2025!"
SYSTEM_OWNER_NAME     = "SmartPark System"


class Command(BaseCommand):
    help = "Seed all 30 Bangalore lots + 6 spaces each into the database"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing seeded Parking + Space records before re-seeding",
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("\n🌱  SmartPark — Bangalore Seed Starting...\n"))

        # ── 1. Clear if requested ──────────────────────────────────────────
        if options["clear"]:
            try:
                owner = User.objects.get(email=SYSTEM_OWNER_EMAIL)
                deleted_p, _ = Parking.objects.filter(user_id=owner).delete()
                self.stdout.write(self.style.WARNING(f"  🗑️  Cleared {deleted_p} existing Parking records"))
            except User.DoesNotExist:
                pass

        # ── 2. Get or create system owner ─────────────────────────────────
        owner, created = User.objects.get_or_create(
            email=SYSTEM_OWNER_EMAIL,
            defaults={
                "username":  SYSTEM_OWNER_EMAIL,
                "name":      SYSTEM_OWNER_NAME,
                "type":      "owner",
                "is_staff":  False,
                "is_active": True,
            },
        )
        if created:
            owner.set_password(SYSTEM_OWNER_PASSWORD)
            owner.save()
            self.stdout.write(self.style.SUCCESS(f"  ✅  Created owner user: {SYSTEM_OWNER_EMAIL}"))
        else:
            self.stdout.write(f"  ℹ️   Using existing owner: {SYSTEM_OWNER_EMAIL}")

        # ── 3. Seed each lot ─────────────────────────────────────────────
        today       = date.today()
        tomorrow    = today + timedelta(days=1)

        parking_created = 0
        space_created   = 0
        skipped         = 0

        for lot in BANGALORE_LOTS:
            # Create Parking record (skip if already exists for this owner + name)
            parking, p_new = Parking.objects.get_or_create(
                name    = lot["lot_name"],
                user_id = owner,
                defaults={
                    "address": lot["location_area"],
                    "city":    "Bangalore",
                    "lat":     str(lot["lat"]),
                    "long":    str(lot["lng"]),
                },
            )

            if p_new:
                parking_created += 1
            else:
                skipped += 1

            # Determine slot definitions for this lot type
            slot_defs = SLOT_CONFIG.get(lot["lot_type"], {}).get("slots", DEFAULT_SLOTS)
            base_price = lot["price_per_hour"]

            for slot_name, start_t, end_t, price_delta in slot_defs:
                price = max(5, base_price + price_delta)

                # Create for today AND tomorrow so the user always sees upcoming slots
                for booking_date in [today, tomorrow]:
                    Space.objects.get_or_create(
                        name       = slot_name,
                        parking_id = parking,
                        date       = booking_date,
                        defaults={
                            "slot_start_time": start_t,
                            "slot_end_time":   end_t,
                            "price":           price,
                        },
                    )
                    space_created += 1

        # ── 4. Summary ────────────────────────────────────────────────────
        total_spaces = Space.objects.filter(parking_id__user_id=owner).count()
        total_parks  = Parking.objects.filter(user_id=owner).count()

        self.stdout.write("\n" + "─" * 52)
        self.stdout.write(self.style.SUCCESS(
            f"  🏁  Done!\n"
            f"      Parking lots  : {total_parks}  ({parking_created} new, {skipped} already existed)\n"
            f"      Space records : {total_spaces}  (today + tomorrow × 6 slots)\n"
            f"\n  ℹ️   Owner login  : {SYSTEM_OWNER_EMAIL}\n"
            f"      Password      : {SYSTEM_OWNER_PASSWORD}\n"
            f"{'─' * 52}\n"
        ))
