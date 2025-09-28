/* eslint-disable no-undef */
import { Client, Databases } from "appwrite";

// Sanity używa SANITY_STUDIO_ prefix i process.env!
const endpoint = process.env.SANITY_STUDIO_APPWRITE_ENDPOINT;
const projectId = process.env.SANITY_STUDIO_APPWRITE_PROJECT_ID;
const databaseId = process.env.SANITY_STUDIO_APPWRITE_DATABASE_ID;
const appointmentsCollectionId = process.env.SANITY_STUDIO_APPWRITE_APPOINTMENTS_COLLECTION_ID;

const client = new Client();
client.setEndpoint(endpoint).setProject(projectId);

export const databases = new Databases(client);
export { databaseId, appointmentsCollectionId };