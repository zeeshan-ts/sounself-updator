export async function checkInternetConnectivity() {
  try {
    const isOnlineModule = await import('is-online');
    const online = await isOnlineModule.default();
    return online;
  } catch (error) {
    return false;
  }
}
