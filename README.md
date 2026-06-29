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

## Usage example

Fetch US funding rounds above $1M announced since the start of 2026:

1. Add the **Datahyena** node and select your **Datahyena API** credential.
2. Set **Resource** to `Funding Event` and **Operation** to `Get Many`.
3. Configure the filters:
   - **HQ Country**: `United States`
   - **Funding Rounds**: `Seed`, `Series A` (or leave empty for all rounds)
   - **Min Amount (USD)**: `1000000`
   - **Since (ISO-8601)**: `2026-01-01T00:00:00.000Z`
4. Set **Limit** to `25` (or enable **Return All** to page through every match).
5. Execute. Each item is one funding round, for example:

```json
{
  "company": { "name": "Acme AI", "domain": "acme.ai" },
  "round": "series-a",
  "amountUsd": 12000000,
  "announcedAt": "2026-02-14",
  "investors": [{ "name": "Sequoia" }],
  "sources": [{ "url": "https://techcrunch.com/..." }]
}
```

You can then pass these items to Slack, a spreadsheet, an AI node, or your CRM. The Datahyena node also works as a tool for AI Agents — attach it to an Agent's **Tool** input and it can fetch signals on demand.

## Links

[datahyena.com](https://datahyena.com) · [Docs](https://datahyena.com/docs) · [API reference](https://datahyena.com/docs)
