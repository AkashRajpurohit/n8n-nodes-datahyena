import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

const ROUTES: Record<string, string> = {
  fundingEvent: 'funding-events',
  acquisition: 'acquisitions',
  execMove: 'exec-moves',
  company: 'companies',
  investor: 'investors',
};

// Which filter params each resource accepts (matches the API DTOs).
const ALLOWED: Record<string, string[]> = {
  fundingEvent: ['since', 'round', 'minAmountUsd', 'maxAmountUsd', 'country'],
  acquisition: ['since', 'minAmountUsd', 'maxAmountUsd', 'paymentType', 'isMerger'],
  execMove: ['since', 'until', 'moveType', 'roleSeniority'],
  company: ['since', 'search', 'country', 'industryGroup', 'employeeCountBucket'],
  investor: ['since', 'search', 'country', 'type'],
};

const COUNTRIES = [
  ['AE', 'United Arab Emirates'], ['AR', 'Argentina'], ['AT', 'Austria'], ['AU', 'Australia'],
  ['BD', 'Bangladesh'], ['BE', 'Belgium'], ['BR', 'Brazil'], ['BS', 'Bahamas'], ['CA', 'Canada'],
  ['CH', 'Switzerland'], ['CL', 'Chile'], ['CN', 'China'], ['CO', 'Colombia'], ['CY', 'Cyprus'],
  ['CZ', 'Czechia'], ['DE', 'Germany'], ['DK', 'Denmark'], ['EE', 'Estonia'], ['EG', 'Egypt'],
  ['ES', 'Spain'], ['FI', 'Finland'], ['FR', 'France'], ['GB', 'United Kingdom'], ['GR', 'Greece'],
  ['HK', 'Hong Kong'], ['HU', 'Hungary'], ['ID', 'Indonesia'], ['IE', 'Ireland'], ['IL', 'Israel'],
  ['IN', 'India'], ['IT', 'Italy'], ['JP', 'Japan'], ['KE', 'Kenya'], ['KR', 'South Korea'],
  ['LT', 'Lithuania'], ['LU', 'Luxembourg'], ['LV', 'Latvia'], ['MX', 'Mexico'], ['MY', 'Malaysia'],
  ['NG', 'Nigeria'], ['NL', 'Netherlands'], ['NO', 'Norway'], ['NZ', 'New Zealand'],
  ['PH', 'Philippines'], ['PK', 'Pakistan'], ['PL', 'Poland'], ['PT', 'Portugal'], ['RO', 'Romania'],
  ['RU', 'Russia'], ['SA', 'Saudi Arabia'], ['SE', 'Sweden'], ['SG', 'Singapore'], ['TH', 'Thailand'],
  ['TR', 'Turkey'], ['TW', 'Taiwan'], ['UA', 'Ukraine'], ['US', 'United States'], ['VN', 'Vietnam'],
  ['ZA', 'South Africa'],
].map(([value, name]) => ({ name, value }));

const FUNDING_ROUNDS = ['pre-seed', 'seed', 'angel', 'series-a', 'series-b', 'series-c', 'series-d', 'series-e', 'series-f', 'growth', 'extension', 'bridge', 'convertible', 'safe', 'debt', 'grant', 'pre-ipo', 'secondary', 'pipe', 'other'].map((v) => ({ name: v, value: v }));

const show = (resources: string[]) => ({ displayOptions: { show: { resource: resources } } });

export class Datahyena implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Datahyena',
    name: 'datahyena',
    icon: 'file:datahyena.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{ $parameter["resource"] }}',
    description: 'B2B growth signals: funding rounds, acquisitions, exec moves, companies, investors',
    usableAsTool: true,
    defaults: { name: 'Datahyena' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'datahyenaApi', required: true }],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Acquisition', value: 'acquisition' },
          { name: 'Company', value: 'company' },
          { name: 'Executive Move', value: 'execMove' },
          { name: 'Funding Event', value: 'fundingEvent' },
          { name: 'Investor', value: 'investor' },
        ],
        default: 'fundingEvent',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [{ name: 'Get Many', value: 'getMany', action: 'Get many records' }],
        default: 'getMany',
      },
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        default: false,
        description: 'Whether to return all results or only up to a given limit',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        typeOptions: { minValue: 1 },
        default: 50,
        description: 'Max number of results to return',
        displayOptions: { show: { returnAll: [false] } },
      },
      // Filters
      { displayName: 'Since (ISO-8601)', name: 'since', type: 'string', default: '', placeholder: '2026-01-01T00:00:00.000Z', description: 'Only records after this timestamp' },
      { displayName: 'Until (ISO-8601)', name: 'until', type: 'string', default: '', ...show(['execMove']) },
      { displayName: 'HQ Country', name: 'country', type: 'options', default: '', options: [{ name: 'Any', value: '' }, ...COUNTRIES], ...show(['fundingEvent', 'company', 'investor']) },
      { displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Keyword search by name or domain', ...show(['company', 'investor']) },
      { displayName: 'Industry Group', name: 'industryGroup', type: 'string', default: '', ...show(['company']) },
      { displayName: 'Employee Count', name: 'employeeCountBucket', type: 'options', default: '', options: [{ name: 'Any', value: '' }, ...['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10001+'].map((v) => ({ name: v, value: v }))], ...show(['company']) },
      { displayName: 'Funding Rounds', name: 'round', type: 'multiOptions', default: [], options: FUNDING_ROUNDS, ...show(['fundingEvent']) },
      { displayName: 'Min Amount (USD)', name: 'minAmountUsd', type: 'number', default: 0, ...show(['fundingEvent', 'acquisition']) },
      { displayName: 'Max Amount (USD)', name: 'maxAmountUsd', type: 'number', default: 0, ...show(['fundingEvent', 'acquisition']) },
      { displayName: 'Payment Type', name: 'paymentType', type: 'options', default: '', options: [{ name: 'Any', value: '' }, ...['cash', 'stock', 'mixed', 'undisclosed'].map((v) => ({ name: v, value: v }))], ...show(['acquisition']) },
      { displayName: 'Only Mergers', name: 'isMerger', type: 'boolean', default: false, ...show(['acquisition']) },
      { displayName: 'Move Type', name: 'moveType', type: 'options', default: '', options: [{ name: 'Any', value: '' }, ...['appointment', 'promotion', 'departure', 'transition'].map((v) => ({ name: v, value: v }))], ...show(['execMove']) },
      { displayName: 'Role Seniority', name: 'roleSeniority', type: 'multiOptions', default: [], options: [{ name: 'C-Level', value: 'c_level' }, { name: 'VP-Level', value: 'vp_level' }, { name: 'Founder', value: 'founder' }], ...show(['execMove']) },
      { displayName: 'Investor Type', name: 'type', type: 'options', default: '', options: [{ name: 'Any', value: '' }, ...[['vc', 'VC'], ['angel', 'Angel'], ['cvc', 'Corporate VC'], ['pe', 'Private Equity'], ['growth', 'Growth'], ['accelerator', 'Accelerator'], ['family_office', 'Family Office'], ['syndicate', 'Syndicate'], ['unknown', 'Unknown']].map(([value, name]) => ({ name, value }))], ...show(['investor']) },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const resource = this.getNodeParameter('resource', 0) as string;
    const returnAll = this.getNodeParameter('returnAll', 0) as boolean;
    const limit = returnAll ? Number.POSITIVE_INFINITY : (this.getNodeParameter('limit', 0) as number);
    const route = ROUTES[resource];
    const allowed = ALLOWED[resource] ?? [];

    const filters: IDataObject = {};
    for (const key of allowed) {
      const value = this.getNodeParameter(key, 0, undefined) as unknown;
      if (value === undefined || value === null || value === '' || value === 0) continue;
      if (Array.isArray(value) && value.length === 0) continue;
      filters[key] = value;
    }

    const out: INodeExecutionData[] = [];
    let cursor: string | undefined;
    let fetched = 0;

    do {
      const pageLimit = Math.min(100, returnAll ? 100 : limit - fetched);
      const qs: IDataObject = { ...filters, limit: pageLimit };
      if (cursor) qs.cursor = cursor;

      const response = (await this.helpers.httpRequestWithAuthentication.call(this, 'datahyenaApi', {
        method: 'GET',
        baseURL: 'https://api.datahyena.com/v1',
        url: `/${route}`,
        qs,
        json: true,
      })) as { data?: IDataObject[]; pagination?: { hasMore?: boolean; nextCursor?: string } };

      const data = Array.isArray(response.data) ? response.data : [];
      for (const item of data) {
        out.push({ json: item });
        fetched += 1;
        if (fetched >= limit) break;
      }

      cursor = response.pagination?.hasMore ? response.pagination?.nextCursor : undefined;
    } while (cursor && fetched < limit);

    return [out];
  }
}
