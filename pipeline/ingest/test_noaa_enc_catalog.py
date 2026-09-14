"""Tests du parseur de catalogue NOAA — fixture locale, aucun réseau."""

from __future__ import annotations

import io
import sys
import unittest
from io import BytesIO
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import noaa_enc_catalog as cat

FIXTURE = b"""<?xml version="1.0" encoding="UTF-8" ?>
<EncProductCatalog>
  <Header>
    <title>ENC Product Catalog</title>
    <date_created>2026-09-11</date_created>
    <dt_valid>2026-09-11T05:03:00Z</dt_valid>
  </Header>
  <cell>
    <name>US5VA22M</name>
    <lname>Chesapeake Bay - Cape Charles</lname>
    <cscale>20000</cscale>
    <status>Active</status>
    <states><state>VA</state><state>MD</state></states>
    <zipfile_location>https://www.charts.noaa.gov/ENCs/US5VA22M.zip</zipfile_location>
    <zipfile_size>1500000</zipfile_size>
    <edtn>12</edtn>
    <updn>3</updn>
    <isdt>2026-08-04</isdt>
    <uadt>2026-09-01</uadt>
  </cell>
  <cell>
    <name>US1EEZ1M</name>
    <lname>West Pacific (cancelled)</lname>
    <cscale>3000000</cscale>
    <status>Cancelled</status>
    <states><state>HI</state></states>
    <zipfile_location>https://www.charts.noaa.gov/ENCs/US1EEZ1M.zip</zipfile_location>
    <zipfile_size>100</zipfile_size>
  </cell>
</EncProductCatalog>
"""


class CatalogTests(unittest.TestCase):
    def test_parse_two_cells(self):
        header, cells = cat.iter_cells_from_xml(BytesIO(FIXTURE))
        self.assertEqual(header["dt_valid"], "2026-09-11T05:03:00Z")
        self.assertEqual([c["name"] for c in cells], ["US5VA22M", "US1EEZ1M"])
        va = cells[0]
        self.assertEqual(va["status"], "Active")
        self.assertEqual(va["scale"], 20000)
        self.assertEqual(va["states"], ["VA", "MD"])
        self.assertTrue(va["zip_url"].endswith("US5VA22M.zip"))

    def test_filter_active_and_state(self):
        _, cells = cat.iter_cells_from_xml(BytesIO(FIXTURE))
        active = cat.filter_cells(cells, status="Active")
        self.assertEqual([c["name"] for c in active], ["US5VA22M"])
        hi = cat.filter_cells(cells, state="hi")
        self.assertEqual([c["name"] for c in hi], ["US1EEZ1M"])
        exact = cat.filter_cells(cells, name="us5va22m")
        self.assertEqual(len(exact), 1)

    def test_list_from_local_file(self):
        import tempfile

        with tempfile.TemporaryDirectory() as tmp:
            xml = Path(tmp) / "cat.xml"
            xml.write_bytes(FIXTURE)
            buf = io.StringIO()
            old = sys.stdout
            sys.stdout = buf
            try:
                rc = cat.main(["list", "--catalog", str(xml), "--status", "Active"])
            finally:
                sys.stdout = old
            self.assertEqual(rc, 0)
            out = buf.getvalue()
            self.assertIn("US5VA22M", out)
            self.assertNotIn("US1EEZ1M", out)
            self.assertIn("NOT FOR NAVIGATION", out)

    def test_download_without_match_exits_2(self):
        import tempfile

        with tempfile.TemporaryDirectory() as tmp:
            xml = Path(tmp) / "cat.xml"
            xml.write_bytes(FIXTURE)
            rc = cat.main(["download", "--catalog", str(xml), "--cell", "US9XXXXX"])
            self.assertEqual(rc, 2)


if __name__ == "__main__":
    unittest.main()
