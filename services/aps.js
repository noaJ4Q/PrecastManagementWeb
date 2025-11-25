import { AuthenticationClient, Scopes } from "@aps_sdk/authentication";
import { OssClient, Region, PolicyKey } from "@aps_sdk/oss";
import { ModelDerivativeClient, View, OutputType } from "@aps_sdk/model-derivative";
import { APS_CLIENT_ID, APS_CLIENT_SECRET, APS_BUCKET } from "../config.js";

const authenticationClient = new AuthenticationClient();
const ossClient = new OssClient();
const modelDerivativeClient = new ModelDerivativeClient();

async function getInternalToken() {
  const credentials = await authenticationClient.getTwoLeggedToken(APS_CLIENT_ID, APS_CLIENT_SECRET, [
    Scopes.DataRead,
    Scopes.DataCreate,
    Scopes.DataWrite,
    Scopes.BucketCreate,
    Scopes.BucketRead
  ]);
  return credentials.access_token;
}

export async function getViewerToken() {
  return await authenticationClient.getTwoLeggedToken(APS_CLIENT_ID, APS_CLIENT_SECRET, [Scopes.ViewablesRead]);
}

export async function ensureBucketExists(bucketKey) {
  const accessToken = await getInternalToken();
  try {
    await ossClient.getBucketDetails(bucketKey, { accessToken });
  } catch (err) {
    if (err.axiosError.response.status === 404) {
      await ossClient.createBucket(Region.Us, { bucketKey: bucketKey, policyKey: PolicyKey.Persistent }, { accessToken });
    } else {
      throw err;
    }
  }
}

export async function listObjects() {
  await ensureBucketExists(APS_BUCKET);
  const accessToken = await getInternalToken();
  let resp = await ossClient.getObjects(APS_BUCKET, { limit: 64, accessToken });
  let objects = resp.items;
  while (resp.next) {
    const startAt = new URL(resp.next).searchParams.get('startAt');
    resp = await ossClient.getObjects(APS_BUCKET, { limit: 64, startAt, accessToken });
    objects = objects.concat(resp.items);
  }
  return objects;
}

export async function getObject(objectName) {
  await ensureBucketExists(APS_BUCKET);
  const accessToken = await getInternalToken();
  try {
    const obj = await ossClient.getObjectDetails(APS_BUCKET, objectName, { accessToken });
    return obj;
  } catch (err) {
    if (err.axiosError.response.status === 404) {
      return null;
    } else {
      throw err;
    }
  }
}

export async function uploadObject(objectName, filePath) {
  await ensureBucketExists(APS_BUCKET);
  const accessToken = await getInternalToken();
  const obj = await ossClient.uploadObject(APS_BUCKET, objectName, filePath, { accessToken });
  return obj;
}

export async function translateObject(urn, rootFilename) {
  const accessToken = await getInternalToken();
  const job = await modelDerivativeClient.startJob({
    input: {
      urn,
      compressedUrn: !!rootFilename,
      rootFilename
    },
    output: {
      formats: [{
        views: [View._2d, View._3d],
        type: OutputType.Svf2
      }]
    }
  }, { accessToken });
  return job.result;
}

export async function getManifest(urn) {
  const accessToken = await getInternalToken();
  try {
    const manifest = await modelDerivativeClient.getManifest(urn, { accessToken });
    return manifest;
  } catch (err) {
    if (err.axiosError.response.status === 404) {
      return null;
    } else {
      throw err;
    }
  }
}

export function urnify(id) {
  return Buffer.from(id).toString('base64').replace(/=/g, '');
}