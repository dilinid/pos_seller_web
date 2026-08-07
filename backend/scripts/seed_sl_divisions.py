"""One-time import of Sri Lanka's District / DS Division / GN Division hierarchy
from openadmindata.org (sourced from UN OCHA's COD-AB, CC BY-IGO licensed) into
sl_district / sl_ds_division / sl_gn_division. Idempotent — safe to re-run.

Usage: .venv/Scripts/python.exe scripts/seed_sl_divisions.py
"""

import json
import sys
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlmodel import Session  # noqa: E402

from app.database import engine, init_db  # noqa: E402
from app.models.sl_district import SlDistrict  # noqa: E402
from app.models.sl_ds_division import SlDsDivision  # noqa: E402
from app.models.sl_gn_division import SlGnDivision  # noqa: E402

SOURCE_URL = "https://api.openadmindata.org/api/v1/countries/lk.json"


def fetch_data() -> dict:
    with urllib.request.urlopen(SOURCE_URL, timeout=60) as resp:
        return json.load(resp)


def main() -> None:
    init_db()

    print(f"Fetching {SOURCE_URL} ...")
    payload = fetch_data()
    data = payload["data"]
    districts = data["district"]
    ds_divisions = data["dsd"]
    gn_divisions = data["gnd"]
    print(f"Fetched {len(districts)} districts, {len(ds_divisions)} DS divisions, {len(gn_divisions)} GN divisions")

    with Session(engine) as session:
        for d in districts:
            session.merge(
                SlDistrict(
                    id=d["id"],
                    name_en=d["name_en"],
                    name_local=d.get("name_local"),
                    province_id=d.get("parent_id"),
                    province_name_en=d.get("parent_name_en"),
                )
            )
        session.commit()
        print(f"Upserted {len(districts)} districts")

        for d in ds_divisions:
            session.merge(
                SlDsDivision(
                    id=d["id"],
                    name_en=d["name_en"],
                    name_local=d.get("name_local"),
                    district_id=d["parent_id"],
                )
            )
        session.commit()
        print(f"Upserted {len(ds_divisions)} DS divisions")

        batch = []
        for i, d in enumerate(gn_divisions, start=1):
            batch.append(
                SlGnDivision(
                    id=d["id"],
                    name_en=d["name_en"],
                    name_local=d.get("name_local"),
                    ds_division_id=d["parent_id"],
                )
            )
            if len(batch) >= 1000 or i == len(gn_divisions):
                for row in batch:
                    session.merge(row)
                session.commit()
                print(f"Upserted {i}/{len(gn_divisions)} GN divisions")
                batch = []

    print("Done.")


if __name__ == "__main__":
    main()
