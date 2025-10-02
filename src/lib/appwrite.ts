import { Client, TablesDB } from "appwrite";

// Sanity używa SANITY_STUDIO_ prefix i process.env!
const endpoint = process.env.SANITY_STUDIO_APPWRITE_ENDPOINT;
const projectId = process.env.SANITY_STUDIO_APPWRITE_PROJECT_ID;

export const databaseId: string | undefined = process.env.SANITY_STUDIO_APPWRITE_DATABASE_ID;
export const appointmentsCollectionId: string | undefined =
  process.env.SANITY_STUDIO_APPWRITE_APPOINTMENTS_COLLECTION_ID;

const client = new Client();
client.setEndpoint(endpoint as string).setProject(projectId as string);

// Nowe TablesDB API zamiast starego Databases
export const tablesDB: TablesDB = new TablesDB(client);

export function getEnvVar(key: string, { required = true }: { required?: boolean } = {}): string | undefined {
  const val = process.env[key];
  if (!val && required) {
    throw new Error(`${key} is required`);
  }
  return val;
}