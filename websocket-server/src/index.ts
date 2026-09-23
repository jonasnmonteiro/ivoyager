import { Server } from 'socket.io';
import { createServer } from 'node:http';

export interface LiveTickerItem {
  pair: string;
  rate: number;
  bid: number;
  ask: number;
  change24h: number;
  direction: 'up' | 'down' | 'neutral';
  timestamp: number;
}

const PORT = parseInt(process.env.PORT || '3001', 10);
const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const state: Record<string, { baseRate: number; rate: number; bid: number; ask: number; change24h: number }> = {
  'USD/ARS_BLUE': { baseRate: 1420.0, rate: 1420.0, bid: 1400.0, ask: 1420.0, change24h: 1.25 },
  'USDT/ARS_P2P': { baseRate: 1445.0, rate: 1445.0, bid: 1435.0, ask: 1445.0, change24h: 0.85 },
  'USD/BRL': { baseRate: 5.42, rate: 5.42, bid: 5.418, ask: 5.422, change24h: -0.32 },
  'EUR/BRL': { baseRate: 6.31, rate: 6.31, bid: 6.305, ask: 6.315, change24h: 0.15 },
  'BRL/ARS': { baseRate: 261.99, rate: 261.99, bid: 258.0, ask: 262.0, change24h: 1.10 }
};

function generateTick(): LiveTickerItem[] {
  const now = Date.now();
  const ticks: LiveTickerItem[] = [];

  for (const [pair, val] of Object.entries(state)) {
    const deltaPercent = (Math.random() - 0.49) * 0.003;
    const previousRate = val.rate;
    const newRate = Number((val.rate * (1 + deltaPercent)).toFixed(pair.includes('BRL') && !pair.includes('ARS') ? 4 : 2));
    const direction: 'up' | 'down' | 'neutral' = newRate > previousRate ? 'up' : newRate < previousRate ? 'down' : 'neutral';

    const spread = pair.includes('ARS') ? 10.0 : 0.004;
    val.rate = newRate;
    val.bid = Number((newRate - spread / 2).toFixed(pair.includes('BRL') && !pair.includes('ARS') ? 4 : 2));
    val.ask = Number((newRate + spread / 2).toFixed(pair.includes('BRL') && !pair.includes('ARS') ? 4 : 2));
    val.change24h = Number((val.change24h + deltaPercent * 10).toFixed(2));

    ticks.push({
      pair,
      rate: val.rate,
      bid: val.bid,
      ask: val.ask,
      change24h: val.change24h,
      direction,
      timestamp: now
    });
  }

  return ticks;
}

io.on('connection', (socket) => {
  const currentSnapshot = Object.entries(state).map(([pair, val]) => ({
    pair,
    rate: val.rate,
    bid: val.bid,
    ask: val.ask,
    change24h: val.change24h,
    direction: 'neutral' as const,
    timestamp: Date.now()
  }));

  socket.emit('ticker:snapshot', currentSnapshot);

  socket.on('disconnect', () => {
  });
});

setInterval(() => {
  const ticks = generateTick();
  io.emit('ticker:update', ticks);
}, 2000);

httpServer.listen(PORT, () => {
  console.log(`iVoyager WebSocket ticker server listening on port ${PORT}`);
});
