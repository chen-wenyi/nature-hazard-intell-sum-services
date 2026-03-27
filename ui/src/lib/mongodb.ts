import type {
  AISevereWeatherOutlookSummaryDocument,
  AIThunderstormOutlookSummaryDocument,
  IssuedAlertEntriesDocument,
  SevereWeatherOutlookDocument,
  ThunderstormOutlookDocument,
} from '@/types';
import { attachDatabasePool } from '@vercel/functions';
import type { Document } from 'mongodb';
import { MongoClient, ServerApiVersion } from 'mongodb';

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 5000,
};
let client: MongoClient | null = null;

export async function getDatabase() {
  if (!client) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not set');
    }

    console.log('Connecting to MongoDB');
    const nextClient = new MongoClient(uri, options);

    try {
      await nextClient.connect();
      await nextClient.db('admin').command({ ping: 1 });
      console.log('Connected to MongoDB');
      attachDatabasePool(nextClient);
      client = nextClient;
    } catch (error) {
      await nextClient.close().catch(() => undefined);
      const message = `Failed to connect to MongoDB: ${error instanceof Error ? error.message : String(error)}`;
      console.error(message);
      throw new Error(message);
    }
  }
  return client.db('natural_hazard_intelligence_summary');
}

export async function getCollection<T extends Document>(
  collectionName: string,
) {
  const db = await getDatabase();
  return db.collection<T>(collectionName);
}

export async function getSevereWeatherOutlookCollection() {
  return getCollection<SevereWeatherOutlookDocument>('severe_weather_outlook');
}

export async function getThunderstormOutlookCollection() {
  return getCollection<ThunderstormOutlookDocument>('thunderstorm_outlook');
}

export async function getIssuedAlertCollection() {
  return getCollection<IssuedAlertEntriesDocument>('issued_alert_entries');
}

export async function getAISevereWeatherOutlookSummaryCollection() {
  return getCollection<AISevereWeatherOutlookSummaryDocument>(
    'ai_severe_weather_outlook_summary',
  );
}

export async function getAIThunderstormOutlookSummaryCollection() {
  return getCollection<AIThunderstormOutlookSummaryDocument>(
    'ai_thunderstorm_outlook_summary',
  );
}
