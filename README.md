# n8n-nodes-datahyena

n8n community node for [Datahyena](https://datahyena.com): B2B growth signals as one API. Pull funding rounds, acquisitions (M&A), executive moves, company data, and investor data, deduped and matched to a single company.

## Installation

In n8n: Settings, Community Nodes, Install, enter `n8n-nodes-datahyena`.

## Credentials

Create a **Datahyena API** credential with your API key. Free key (50 credits, no card) at https://app.datahyena.com/register. The node adds the `X-API-Key` header for you, so you only paste the key.

## Resources

- **Funding Event**: company, amount, round, date, investors
- **Acquisition**: acquirer, target, deal value, payment type, date
- **Executive Move**: person, company, role, seniority, move type
- **Company**: domain, LinkedIn, HQ, industry, employee count, founded year
- **Investor**: name, type, HQ, domain

Each supports **Get Many** with filters (date, country, round, amount, move type, seniority, investor type, and more) and returns all results via cursor pagination.

## Links

[datahyena.com](https://datahyena.com) · [Docs](https://datahyena.com/docs) · [API reference](https://datahyena.com/docs)
