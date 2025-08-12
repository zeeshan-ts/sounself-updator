import { StorageKeys } from './constants';

let store: any;

async function getStore() {
  if (!store) {
    const module = await import('electron-store');
    const ElectronStore = module.default;
    store = new ElectronStore();
  }
  return store;
}

export async function saveDownloadProgress(data: any) {
  const storeInstance = await getStore();
  return storeInstance.set(StorageKeys.DOWNLOAD_PROGRESS, data);
}

export async function saveUpdateInfo(data: any) {
  const storeInstance = await getStore();
  return storeInstance.set(StorageKeys.UPDATE_INFO, data);
}

export async function getUpdateInfo() {
  const storeInstance = await getStore();
  return storeInstance.get(StorageKeys.UPDATE_INFO);
}

export async function getDownloadProgress() {
  const storeInstance = await getStore();
  return storeInstance.get(StorageKeys.DOWNLOAD_PROGRESS);
}
