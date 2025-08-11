export const hasInternetConnection = async () => {
  try {
    const isInternetConnected =
      await window.electron.invokeMainProcessMethod<boolean>(
        'hasInternetConnection',
      );
    if (isInternetConnected.data) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

export const openNetworkSettings = async () => {
  try {
    await window.electron.invokeMainProcessMethod<boolean>(
      'openNetworkSettings',
    );
    return true;
  } catch (error) {
    return false;
  }
};
