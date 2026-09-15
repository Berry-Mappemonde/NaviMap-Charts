# PR GitHub et Cloud Agents Cursor

## Dépôt officiel

https://github.com/Berry-Mappemonde/NaviMap-Charts

Pas `NAVIGUIDE-for-Berry-Mappemonde/NaviMap-Charts`. Cursor affiche alors
*You do not have access to this repository*. Trop d’essais →
*GitHub is rate limiting requests*.

## Deux réglages GitHub (organisation)

Dans **Berry-Mappemonde → Settings → Actions → General** :

1. Workflow permissions = **Read and write**
2. Case **Allow GitHub Actions to create and approve pull requests** cochée

Sans (2), `ManagePullRequest` répond `must be a collaborator` et le workflow
**Ouvrir les PR Cursor** échoue avec
`GitHub Actions is not permitted to create or approve pull requests`.

## Secours

Après un `git push` sur `cursor/**`, [`.github/workflows/open-cursor-pr.yml`](../.github/workflows/open-cursor-pr.yml)
lance [`scripts/open_cursor_prs.py`](../scripts/open_cursor_prs.py).
La CI tourne aussi sur ces branches.

```bash
python3 scripts/open_cursor_prs.py --dry-run
```
