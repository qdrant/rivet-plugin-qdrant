import { QdrantClient } from '@qdrant/js-client-rest';
import { randomUUID } from "crypto";

export async function listCollections(
  url: string,
  apiKey?: string,
): Promise<string[]> {

  const client = new QdrantClient({ url, apiKey });

  const result = await client.getCollections();

  return result.collections.map((collection) => collection.name);
}

export async function upsertPoint(
  url: string,
  collectionName: string,
  id: string | number,
  vector: number[],
  payload: Record<string, any>,
  vectorName?: string,
  apiKey?: string,
) {
  const client = new QdrantClient({ url, apiKey });

  id = id || randomUUID();
  // Each point in a Qdrant collection can have multiple named vectors and one default(unnamed) vector.
  // If `vectorName` is provided, the vector will be stored under that name.
  // If not, the vector will be stored as the default vector.
  const vectorObj = vectorName ? { [vectorName]: vector } : vector;

  const response = await client.upsert(collectionName, {
    points: [
      {
        id,
        vector: vectorObj,
        payload
      }
    ]
  });

  return response.status;
}

export async function searchPoints(
  url: string,
  collectionName: string,
  vector: number[],
  filter?: Record<string, any>,
  limit?: number,
  scoreThreshold?: number,
  vectorName?: string,
  apiKey?: string,
) {
  const client = new QdrantClient({ url, apiKey });
  // Each point in a Qdrant collection can have multiple named vectors and one default(unnamed) vector.
  // If `vectorName` is provided, the vector will be stored under that name.
  // If not, the vector will be stored as the default vector.
  const vectorObj = vectorName ? { name: vectorName, vector: vector } : vector;

  const response = await client.search(collectionName, {
    vector: vectorObj,
    filter,
    limit,
    score_threshold: scoreThreshold,
    with_payload: true,
    with_vector: false,
  });

  return response.map((scoredPoint) => ({
    id: scoredPoint.id,
    payload: scoredPoint.payload,
    score: scoredPoint.score
  }));

}

export async function deleteCollection(
  url: string,
  collectionName: string,
  apiKey?: string,
) {
  const client = new QdrantClient({ url, apiKey });

  const response = await client.deleteCollection(collectionName);

  return response
}

export async function getPoints(
  url: string,
  collectionName: string,
  ids: unknown[],
  apiKey?: string,
) {
  const client = new QdrantClient({ url, apiKey });

  const parsedIds = ids.map((id) => {
    if (typeof id === 'string' || typeof id === 'number') {
      return id;
    }
    throw new Error(`Invalid ID type: ${typeof id}. Can only be string or number.`);
  });

  const response = await client.retrieve(collectionName, {
    ids: parsedIds,
    with_payload: true,
    with_vector: true,
  });

  return response.map((point) => ({
    id: point.id,
    payload: point.payload,
    vector: point.vector
  }));
}

export async function scrollPoints(
  url: string,
  collectionName: string,
  filter: Record<string, any>,
  limit?: number,
  offset?: string | number,
  apiKey?: string,
) {
  const client = new QdrantClient({ url, apiKey });

  if (typeof offset !== 'string' && typeof offset !== 'number') {
    throw new Error(`Invalid offset type: ${typeof offset}. Can only be string or number.`);
  }

  const response = await client.scroll(collectionName, {
    filter,
    limit,
    offset,
    with_payload: true,
    with_vector: true,
  });

  return response.points.map((point) => ({
    id: point.id,
    payload: point.payload,
    vector: point.vector
  }));
}
export async function deletePoints(
  url: string,
  collectionName: string,
  filter: Record<string, any>,
  apiKey?: string,
) {
  const client = new QdrantClient({ url, apiKey });
  
  const response = await client.delete(collectionName, {
    filter,
  });

  return response.status;
}