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
