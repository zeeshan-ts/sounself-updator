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

async function saveDownloadProgress(data: any) {
  const storeInstance = await getStore();
  return storeInstance.set(StorageKeys.DOWNLOAD_PROGRESS, data);
}

async function saveUpdateInfo(data: any) {
  const storeInstance = await getStore();
  return storeInstance.set(StorageKeys.UPDATE_INFO, data);
}

async function getUpdateInfo() {
  const storeInstance = await getStore();
  return storeInstance.get(StorageKeys.UPDATE_INFO);
}

async function getDownloadProgress() {
  const storeInstance = await getStore();
  return storeInstance.get(StorageKeys.DOWNLOAD_PROGRESS);
}

export {
  saveDownloadProgress,
  saveUpdateInfo,
  getUpdateInfo,
  getDownloadProgress,
};
