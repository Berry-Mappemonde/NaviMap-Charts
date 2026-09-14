#!/usr/bin/env python3
"""Catalogue et téléchargement des cellules ENC NOAA (domaine public).

Le catalogue officiel est un XML (~10 Mo) :
https://www.charts.noaa.gov/ENCs/ENCProdCat.xml

Par défaut on LISTE. Le téléchargement est explicite (--cell ou download).
Aucune cellule SHOM / UKHO / autre HO n'est jamais visée ici.
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

CATALOG_URL = "https://www.charts.noaa.gov/ENCs/ENCProdCat.xml"
USER_AGENT = (
    "NaviMap-Charts/0.1 "
    "(+https://github.com/NAVIGUIDE-for-Berry-Mappemonde/NaviMap-Charts)"
)
DEFAULT_DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "noaa-enc"


def _text(el: ET.Element | None, tag: str, default: str = "") -> str:
    child = None if el is None else el.find(tag)
    if child is None or child.text is None:
        return default
    return child.text.strip()


def _texts(el: ET.Element | None, path: str) -> list[str]:
    if el is None:
        return []
    return [c.text.strip() for c in el.findall(path) if c.text and c.text.strip()]


def parse_cell(el: ET.Element) -> dict:
    """Transforme un nœud <cell> du catalogue NOAA en dictionnaire plat."""
    return {
        "name": _text(el, "name"),
        "title": _text(el, "lname"),
        "scale": int(_text(el, "cscale", "0") or 0),
        "status": _text(el, "status"),
        "zip_url": _text(el, "zipfile_location"),
        "zip_size": int(_text(el, "zipfile_size", "0") or 0),
        "edition": _text(el, "edtn"),
        "update": _text(el, "updn"),
        "issued": _text(el, "isdt"),
        "updated": _text(el, "uadt"),
        "states": _texts(el, "states/state"),
        "districts": _texts(el, "coast_guard_districts/coast_guard_district"),
    }


def iter_cells_from_xml(source) -> tuple[dict, list[dict]]:
    """Lit le catalogue en flux. `source` = chemin, fichier, ou handle."""
    header: dict = {}
    cells: list[dict] = []
    for event, el in ET.iterparse(source, events=("end",)):
        if el.tag == "Header":
            header = {
                "title": _text(el, "title"),
                "date_created": _text(el, "date_created"),
                "dt_valid": _text(el, "dt_valid"),
            }
            el.clear()
        elif el.tag == "cell":
            cell = parse_cell(el)
            if cell["name"]:
                cells.append(cell)
            el.clear()
    return header, cells


def fetch_catalog(url: str = CATALOG_URL, timeout: int = 60) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def filter_cells(
    cells: list[dict],
    *,
    status: str | None = None,
    state: str | None = None,
    name: str | None = None,
    active_only: bool = False,
) -> list[dict]:
    out = cells
    if active_only:
        out = [c for c in out if c["status"].lower() == "active"]
    if status:
        wanted = status.lower()
        out = [c for c in out if c["status"].lower() == wanted]
    if state:
        code = state.upper()
        out = [c for c in out if code in [s.upper() for s in c["states"]]]
    if name:
        key = name.upper()
        out = [c for c in out if c["name"].upper() == key]
    return out


def download_cell(cell: dict, dest_dir: Path, timeout: int = 120) -> Path:
    dest_dir.mkdir(parents=True, exist_ok=True)
    url = cell["zip_url"]
    if not url:
        raise ValueError(f"Pas d'URL ZIP pour {cell['name']}")
    target = dest_dir / f"{cell['name']}.zip"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as resp, target.open("wb") as fh:
        fh.write(resp.read())
    return target


def _print_table(cells: list[dict]) -> None:
    print(f"{'CELLULE':<12} {'STATUT':<10} {'ÉCHELLE':>10} {'MO':>6}  TITRE")
    for cell in cells:
        mb = cell["zip_size"] / 1_000_000
        title = cell["title"][:62]
        print(
            f"{cell['name']:<12} {cell['status']:<10} "
            f"1:{cell['scale']:<8} {mb:6.2f}  {title}"
        )


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="Catalogue ENC NOAA (domaine public). Liste par défaut."
    )
    p.add_argument(
        "command",
        choices=("list", "download"),
        help="list = afficher ; download = écrire les ZIP dans data/noaa-enc/",
    )
    p.add_argument("--status", help="Filtrer par statut (Active, Cancelled…)")
    p.add_argument("--state", help="Code État US (VA, CA, AK…)")
    p.add_argument("--cell", help="Nom exact d'une cellule (ex. US5VA22M)")
    p.add_argument("--limit", type=int, default=0, help="Couper après N cellules")
    p.add_argument(
        "--catalog",
        help="Fichier XML local (évite le réseau, utile aux tests)",
    )
    p.add_argument(
        "--json",
        action="store_true",
        help="Sortie JSON au lieu du tableau",
    )
    p.add_argument(
        "--dest",
        default=str(DEFAULT_DATA_DIR),
        help="Dossier des ZIP (défaut : data/noaa-enc/)",
    )
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if args.catalog:
        header, cells = iter_cells_from_xml(args.catalog)
    else:
        from io import BytesIO

        raw = fetch_catalog()
        header, cells = iter_cells_from_xml(BytesIO(raw))

    filtered = filter_cells(
        cells,
        status=args.status,
        state=args.state,
        name=args.cell,
    )
    if args.limit:
        filtered = filtered[: args.limit]

    if args.command == "list":
        meta = {
            "catalog_date": header.get("dt_valid") or header.get("date_created"),
            "count": len(filtered),
            "total_in_catalog": len(cells),
        }
        if args.json:
            print(json.dumps({"header": meta, "cells": filtered}, ensure_ascii=False, indent=2))
        else:
            print(
                f"Catalogue NOAA du {meta['catalog_date']} — "
                f"{meta['count']} cellule(s) affichée(s) / {meta['total_in_catalog']} au total"
            )
            print("Licence : domaine public. Citation : doi.org/10.25923/jyyk-j845")
            print("NOT FOR NAVIGATION — NaviMap Charts n'est pas un ECDIS.\n")
            _print_table(filtered)
        return 0

    if not filtered:
        print("Aucune cellule à télécharger (filtre trop étroit).", file=sys.stderr)
        return 2
    dest = Path(args.dest)
    for cell in filtered:
        if cell["status"].lower() != "active":
            print(f"Ignore {cell['name']} (statut {cell['status']})", file=sys.stderr)
            continue
        path = download_cell(cell, dest)
        print(f"OK {cell['name']} → {path}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except urllib.error.URLError as exc:
        print(f"Réseau : impossible de joindre NOAA ({exc})", file=sys.stderr)
        raise SystemExit(1)
