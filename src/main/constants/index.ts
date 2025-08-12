export const IPC_METHODS = {
  hasInternetConnection: 'hasInternetConnection',
  openNetworkSettings: 'openNetworkSettings',
  logger: 'logger',
  checkUpdates: 'checkUpdates',
} as const;
export const OperatingSystems = Object.freeze({
  WINDOWS: 'win32',
  MACOS: 'darwin',
});

export const applySubstitutions = (
  message: string,
  subscriptions: { [key: string]: unknown },
) => {
  return message.replace(/{{(\w+)}}/g, (match, key) => {
    return typeof subscriptions[key] === 'string'
      ? (subscriptions[key] as string)
      : typeof subscriptions[key] === 'number'
        ? String(subscriptions[key])
        : match;
  });
};

export const LoggingMessage = Object.freeze({
  INTERNET_DISCONNECT: 'Internet Disconnected. Check your network.',
  ERROR_CHECKING_INTERNET:
    'Error checking internet connection., Error: {{error}}',
  CHECK_FOR_UPDATES: 'Checking for updates...',
  ERROR_CHECKING_UPDATES: 'Error checking for updates., Error: {{error}}',
});
