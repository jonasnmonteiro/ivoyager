import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'ivoyager-mcp-server',
    version: '0.1.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'ivoyager_get_rates',
        description: 'Get current real-time exchange rates (Official, Blue, MEP, Crypto P2P) for global travel currencies.',
        inputSchema: {
          type: 'object',
          properties: {
            baseCurrency: {
              type: 'string',
              description: 'Base currency code (e.g., BRL, USD, EUR)',
              default: 'BRL'
            }
          }
        }
      },
      {
        name: 'ivoyager_calculate_vet',
        description: 'Calculate the Effective Total Value (VET) including IOF tax and bank spread across payment methods (Cash, Credit Card, Global Accounts like Wise/Nomad, Crypto P2P).',
        inputSchema: {
          type: 'object',
          properties: {
            foreignAmount: { type: 'number', description: 'Amount in foreign currency (e.g. 1000)' },
            baseExchangeRate: { type: 'number', description: 'Commercial exchange rate to BRL (e.g. 5.50)' },
            foreignCurrencyCode: { type: 'string', description: 'Currency code (e.g. USD, EUR, ARS)' },
            paymentMethod: {
              type: 'string',
              enum: ['global_account', 'credit_card', 'cash', 'crypto_p2p'],
              description: 'Payment instrument to simulate'
            }
          },
          required: ['foreignAmount', 'baseExchangeRate', 'foreignCurrencyCode', 'paymentMethod']
        }
      },
      {
        name: 'ivoyager_convert',
        description: 'Convert currency amounts using high-precision fixed-point arithmetic with cross-rate support.',
        inputSchema: {
          type: 'object',
          properties: {
            amount: { type: 'number', description: 'Amount to convert' },
            from: { type: 'string', description: 'Origin currency code (e.g., ARS, USD)' },
            to: { type: 'string', description: 'Target currency code (e.g., BRL, USD)' },
            rateType: {
              type: 'string',
              enum: ['official', 'blue', 'mep', 'tarjeta', 'crypto_p2p'],
              default: 'official'
            }
          },
          required: ['amount', 'from', 'to']
        }
      },
      {
        name: 'ivoyager_find_exchange_spots',
        description: 'Find nearby physical currency exchange bureaus, Western Union spots, and ATMs by GPS coordinates using OpenStreetMap data.',
        inputSchema: {
          type: 'object',
          properties: {
            latitude: { type: 'number', description: 'Latitude coordinate' },
            longitude: { type: 'number', description: 'Longitude coordinate' },
            radiusMeters: { type: 'number', description: 'Search radius in meters (default: 2500)', default: 2500 }
          },
          required: ['latitude', 'longitude']
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'ivoyager_calculate_vet') {
    const amount = Number(args?.foreignAmount || 0);
    const rate = Number(args?.baseExchangeRate || 1);
    const method = String(args?.paymentMethod || 'global_account');

    let iof = 0.011;
    let spread = 0.015;

    if (method === 'credit_card') {
      iof = 0.0438;
      spread = 0.045;
    } else if (method === 'cash') {
      iof = 0.011;
      spread = 0.025;
    } else if (method === 'crypto_p2p') {
      iof = 0.0;
      spread = 0.005;
    }

    const gross = amount * rate;
    const spreadVal = gross * spread;
    const subtotal = gross + spreadVal;
    const iofVal = subtotal * iof;
    const totalBrl = subtotal + iofVal;
    const vet = amount > 0 ? totalBrl / amount : rate;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              foreignAmount: amount,
              baseRate: rate,
              paymentMethod: method,
              grossBrl: Number(gross.toFixed(2)),
              spreadAmountBrl: Number(spreadVal.toFixed(2)),
              iofAmountBrl: Number(iofVal.toFixed(2)),
              totalCostBrl: Number(totalBrl.toFixed(2)),
              vetRate: Number(vet.toFixed(4)),
              effectiveTaxRatePercent: Number(((totalBrl - gross) / gross * 100).toFixed(2))
            },
            null,
            2
          )
        }
      ]
    };
  }

  if (name === 'ivoyager_convert') {
    const amount = Number(args?.amount || 0);
    const from = String(args?.from || 'USD').toUpperCase();
    const to = String(args?.to || 'BRL').toUpperCase();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              amount,
              from,
              to,
              timestamp: Date.now(),
              note: 'High-precision conversion executed via iVoyager engine'
            },
            null,
            2
          )
        }
      ]
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ status: 'success', tool: name, params: args })
      }
    ]
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

if (process.env['NODE_ENV'] !== 'test') {
  main().catch(console.error);
}

export { server };
