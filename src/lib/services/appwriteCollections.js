import { ID, Query } from "appwrite";
import { databases, getEnvVar } from "../appwrite";

function assert(value, label) {
  if (!value) {
    throw new Error(`${label} is required`);
  }
  return value;
}

export function getCollectionEnv({ databaseKey, collectionKey, required = true }) {
  const databaseId = getEnvVar(databaseKey, { required });
  const collectionId = getEnvVar(collectionKey, { required });

  return {
    databaseId,
    collectionId
  };
}

export function createCollectionClient({ databaseId, collectionId }) {
  const resolvedDatabaseId = assert(databaseId, "databaseId");
  const resolvedCollectionId = assert(collectionId, "collectionId");

  /**
   * @param {{ queries?: string[] }} [options]
   * @returns {Promise<any[]>}
   */
  async function list({ queries = [] } = {}) {
    const { documents } = await databases.listDocuments(
      resolvedDatabaseId,
      resolvedCollectionId,
      queries
    );

    return documents ?? [];
  }

  /**
   * @param {number} [limit]
   * @param {string[]} [extraQueries]
   */
  async function listLatest(limit = 10, extraQueries = []) {
    return list({
      queries: [Query.orderDesc("$createdAt"), Query.limit(limit), ...extraQueries]
    });
  }

  /**
   * @param {Record<string, unknown>} data
   * @param {{ documentId?: string; permissions?: string[] }} [options]
   */
  async function create(data, { documentId = ID.unique(), permissions = undefined } = {}) {
    return databases.createDocument(
      resolvedDatabaseId,
      resolvedCollectionId,
      documentId,
      data,
      permissions
    );
  }

  /**
   * @param {string} documentId
   * @param {Record<string, unknown>} data
   * @param {{ permissions?: string[] }} [options]
   */
  async function update(documentId, data, { permissions = undefined } = {}) {
    assert(documentId, "documentId");

    return databases.updateDocument(
      resolvedDatabaseId,
      resolvedCollectionId,
      documentId,
      data,
      permissions
    );
  }

  /**
   * @param {string} documentId
   */
  async function remove(documentId) {
    assert(documentId, "documentId");

    await databases.deleteDocument(resolvedDatabaseId, resolvedCollectionId, documentId);
  }

  /**
   * @param {string} documentId
   * @returns {Promise<any>}
   */
  async function get(documentId) {
    assert(documentId, "documentId");

    return databases.getDocument(resolvedDatabaseId, resolvedCollectionId, documentId);
  }

  return {
    list,
    listLatest,
    create,
    update,
    remove,
    get
  };
}
