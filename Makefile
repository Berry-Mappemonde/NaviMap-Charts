.PHONY: viewer list-noaa test

viewer:
	cd client && npm install && npm run dev

list-noaa:
	python3 pipeline/ingest/noaa_enc_catalog.py list --status Active --limit 15

test:
	python3 -m unittest pipeline/ingest/test_noaa_enc_catalog.py -q
	cd client && npm ci && npm run build
