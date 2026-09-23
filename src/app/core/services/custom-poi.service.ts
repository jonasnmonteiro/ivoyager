import { AppDatabase, CustomPoiRecord, db } from '../storage/database.js';

export class CustomPoiService {
  private database: AppDatabase;
  private memoryPois: Map<string, CustomPoiRecord> = new Map();

  constructor(customDatabase?: AppDatabase) {
    this.database = customDatabase || db;
  }

  public async createPoi(data: Omit<CustomPoiRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomPoiRecord> {
    const id = `poi-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const now = Date.now();
    const record: CustomPoiRecord = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };

    this.memoryPois.set(id, record);

    try {
      if (this.database?.customPois) {
        await this.database.customPois.put(record);
      }
    } catch {
    }

    return record;
  }

  public async getAllPois(): Promise<CustomPoiRecord[]> {
    try {
      if (this.database?.customPois) {
        const stored = await this.database.customPois.toArray();
        if (stored && stored.length > 0) {
          stored.forEach((item) => this.memoryPois.set(item.id, item));
          return stored;
        }
      }
    } catch {
    }

    return Array.from(this.memoryPois.values());
  }

  public async getPoiById(id: string): Promise<CustomPoiRecord | undefined> {
    if (this.memoryPois.has(id)) {
      return this.memoryPois.get(id);
    }

    try {
      if (this.database?.customPois) {
        const stored = await this.database.customPois.get(id);
        if (stored) {
          this.memoryPois.set(id, stored);
          return stored;
        }
      }
    } catch {
    }

    return undefined;
  }

  public async updatePoi(id: string, updates: Partial<Omit<CustomPoiRecord, 'id' | 'createdAt'>>): Promise<CustomPoiRecord | undefined> {
    const existing = await this.getPoiById(id);
    if (!existing) return undefined;

    const updated: CustomPoiRecord = {
      ...existing,
      ...updates,
      updatedAt: Date.now()
    };

    this.memoryPois.set(id, updated);

    try {
      if (this.database?.customPois) {
        await this.database.customPois.put(updated);
      }
    } catch {
    }

    return updated;
  }

  public async deletePoi(id: string): Promise<boolean> {
    this.memoryPois.delete(id);

    try {
      if (this.database?.customPois) {
        await this.database.customPois.delete(id);
      }
    } catch {
    }

    return true;
  }

  public async getPoisNearLocation(
    latitude: number,
    longitude: number,
    radiusMeters: number
  ): Promise<(CustomPoiRecord & { distanceMeters: number })[]> {
    const all = await this.getAllPois();
    const result: (CustomPoiRecord & { distanceMeters: number })[] = [];

    for (const poi of all) {
      const distanceMeters = this.calculateHaversineDistance(latitude, longitude, poi.latitude, poi.longitude);
      if (distanceMeters <= radiusMeters) {
        result.push({
          ...poi,
          distanceMeters
        });
      }
    }

    return result.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  public async exportGeoJson(): Promise<object> {
    const all = await this.getAllPois();
    return {
      type: 'FeatureCollection',
      features: all.map((poi) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [poi.longitude, poi.latitude]
        },
        properties: {
          id: poi.id,
          name: poi.name,
          category: poi.category,
          address: poi.address,
          notes: poi.notes,
          createdAt: poi.createdAt,
          updatedAt: poi.updatedAt
        }
      }))
    };
  }

  private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }
}
