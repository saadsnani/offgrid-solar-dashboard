import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

const DATA_FILE = path.join(process.cwd(), 'data', 'sensor-readings.json');
const BATTERY_TEMP_FILE = path.join(process.cwd(), 'data', 'battery-temperature.json');
const MAX_READINGS = 1000;

function ensureDataFile() {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  ensureDataFile();

  if (req.method === 'GET') {
    const { type, limit: limitRaw } = req.query;
    const limit = Math.min(parseInt((limitRaw as string) || '100') || 100, 500);
    if (limit < 1) {
      return res.status(400).json({ error: 'Invalid limit parameter', current: null, readings: [], count: 0 });
    }

    if (type === 'all') {
      let batteryReadings = [];
      let standardReadings = [];
      try {
        if (fs.existsSync(BATTERY_TEMP_FILE)) {
          const batteryContent = fs.readFileSync(BATTERY_TEMP_FILE, 'utf-8');
          batteryReadings = JSON.parse(batteryContent);
        }
      } catch {}
      try {
        if (fs.existsSync(DATA_FILE)) {
          const dataContent = fs.readFileSync(DATA_FILE, 'utf-8');
          standardReadings = JSON.parse(dataContent);
        }
      } catch {}
      const allReadings = [...batteryReadings, ...standardReadings]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
      const current = allReadings.length > 0 ? allReadings[0] : null;
      return res.status(200).json({ current, readings: allReadings, count: allReadings.length, source: 'file', timestamp: new Date().toISOString() });
    }

    if (type === 'battery') {
      if (!fs.existsSync(BATTERY_TEMP_FILE)) {
        return res.status(200).json({ current: null, readings: [], count: 0, source: 'file', timestamp: new Date().toISOString() });
      }
      try {
        const batteryContent = fs.readFileSync(BATTERY_TEMP_FILE, 'utf-8');
        const readings = JSON.parse(batteryContent);
        const current = readings.length > 0 ? readings[readings.length - 1] : null;
        return res.status(200).json({ current, readings: readings.slice(-limit), count: readings.length, source: 'file', timestamp: new Date().toISOString() });
      } catch {
        return res.status(200).json({ current: null, readings: [], count: 0, source: 'file', timestamp: new Date().toISOString() });
      }
    }

    // Default: return standard sensor data
    if (!fs.existsSync(DATA_FILE)) {
      return res.status(200).json({ current: null, readings: [], count: 0, source: 'file', timestamp: new Date().toISOString() });
    }
    try {
      const dataContent = fs.readFileSync(DATA_FILE, 'utf-8');
      const readings = JSON.parse(dataContent);
      return res.status(200).json({ current: readings.length > 0 ? readings[readings.length - 1] : null, readings: readings.slice(-limit), count: readings.length, source: 'file', timestamp: new Date().toISOString() });
    } catch {
      return res.status(200).json({ current: null, readings: [], count: 0, source: 'file', timestamp: new Date().toISOString() });
    }
  }

  // POST: add new sensor data
  if (req.method === 'POST') {
    try {
      const body = req.body;
      const reading = {
        ...body,
        timestamp: body.timestamp || new Date().toISOString(),
      };
      // Save to main file
      let readings = [];
      if (fs.existsSync(DATA_FILE)) {
        readings = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      }
      readings.push(reading);
      if (readings.length > MAX_READINGS) {
        readings = readings.slice(-MAX_READINGS);
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(readings, null, 2));
      // Save to battery file if batteryTemperature present
      if (body.batteryTemperature !== undefined) {
        let batteryReadings = [];
        if (fs.existsSync(BATTERY_TEMP_FILE)) {
          batteryReadings = JSON.parse(fs.readFileSync(BATTERY_TEMP_FILE, 'utf-8'));
        }
        batteryReadings.push(reading);
        if (batteryReadings.length > MAX_READINGS) {
          batteryReadings = batteryReadings.slice(-MAX_READINGS);
        }
        fs.writeFileSync(BATTERY_TEMP_FILE, JSON.stringify(batteryReadings, null, 2));
      }
      return res.status(201).json({ success: true, message: 'Sensor data received', data: reading });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to process sensor data', details: String(error) });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
