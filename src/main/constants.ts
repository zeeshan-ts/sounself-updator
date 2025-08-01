/* eslint-disable import/prefer-default-export */
export const ConfigKeys = Object.freeze({
  API_URL: 'apiUrl',
});

export const LoggingMessage = Object.freeze({
  APPLICATION_STARTED: 'Application started',
  SAVE_HARDWARE_CONFIGURATION:
    'Saving hardware configurations: Light brightness={{lightBrightness}}, Volume={{volume}}, Microphone sensitivity={{microphoneSensitivity}}, Vibroacoustics={{vibroacoustics}}',
  SAVE_HARDWARE_CONFIGURATION_ERROR:
    'Something went wrong while saving hardware configurations. Error: {{error}}',
  SAVED_HARDWARE_CONFIGURATION: 'Hardware configuration saved successfully',
  CREATE_SESSION_FILES:
    'Creating session files: Session Id={{sessionId}}, Mode={{mode}}, Sub Mode={{subMode}}, Duration={{duration}}, Outcomes={{outcomes}}',
  CREATED_SESSION_FILES: 'Session files created successfully',
  CREATE_SESSION_FILES_ERROR:
    'Something went wrong while creating session files. Error={{error}}',
  READING_HARDWARE_CONFIGURATION: 'Reading hardware configurations',
  READ_HARDWARE_CONFIGURATION:
    'Read hardware configurations successfully. Data: {{data}}',
  READING_HARDWARE_CONFIGURATION_ERROR:
    'Something went wrong while reading hardware configurations. Error={{error}}',
  DETECTING_HARDWARE: 'Detecting hardware device, DEVICE_TYPE={{deviceType}}',
  CUSTOM_AUDIO_DEVICE:
    'Custom audio device detected. DEVICE_DETAILS={{deviceDetails}}',
  SET_HEADSET_AUDIO_INPUT_OUTPUT:
    'Need to set headset default audio input/output. DEVICE_DETAILS={{deviceDetails}}',
  LOADING_SESSION_DATA: 'Loading session data. Session Id={{sessionId}}',
  LOADING_SESSION_DATA_ERROR:
    'Something went wrong while loading session data. Error: {{error}}',
  LOADED_SESSION_DATA: 'Loaded session data successfully. Data={{data}}',
  CHANGING_SESSION_STATUS:
    'Changing session data. Session Id={{sessionId}}, isPaused={{isPaused}}',
  CHANGING_SESSION_STATUS_ERROR:
    'Something went wrong while changing session status. Error={{error}}',
  CHANGED_SESSION_STATUS: 'Changed session status successfully',
  CREATED_RESULTS_FILE:
    'Session result file created successfully. File path={{filePath}}',
  STARTED_WATCHING_RESULTS_FILE:
    'Started watching result file. File path={{filePath}}',
  LOADING_SESSION_RESULTS: 'Loading session results. Session Id={{sessionId}}',
  LOADING_SESSION_RESULTS_ERROR:
    'Something went wrong while loading session results. Error={{error}}',
  LOADED_SESSION_RESULTS: 'Loaded sessoin results successfully. Data={{data}}',
  CLOSING_SOUNDSELF: 'Closing Soundself',
  LAUNCHING_SOUNDSELF: 'Launching Soundself',
  LAUNCHED_SOUNDSELF: 'Launched Soundself successfully',
  SOUNDSELF_NOT_INSTALLED: 'Soundself is not installed',
  LOGIN_ATTEMPT: 'Login attempt. Username={{username}}',
  USER_LOGIN_CHECK: 'Checking user login',
  LOADING_USERNAME: 'Loading username',
  LOADING_TERMS: 'Loading terms and conditions',
  SENDING_VERIFICATION_EMAIL:
    'Sending registration verification email. Username={{username}}',
  REGISTERING_USER: 'Registering user. Username={{username}}',
  USER_REGISTERED_SUCCESSFULLY:
    'User registered successfully. Username={{username}}',
  SENDING_RESET_CODE: 'Sending reset password code. Username={{username}}',
  UPDATING_PASSWORD: 'Updating user password. Username={{username}}',
  LOGGED_OUT: 'Logged out user',
  REMOVING_SOFTWARE_EXE_ERROR: 'Error removing file: {{error}}',
  FILE_REMOVED: 'File {{filePath}} has been removed.',
  INSTALLATION_ERROR: 'Installation error: {{error}}',
  INSTALLATION_COMPLETED: 'Installation stdout: {{stdout}}',
  DOWNLOADING_ERROR:
    'Something went wrong while downloading software. Error={{error}}',
  UPDATE_SESSION_ERROR: 'Error in updating session status. Error={{error}}',
  UPLOADED_SESSION: 'Session {{sessionId}} data has been uploaded.',
  FETCH_SESSION_ERROR: 'Failed to fetch the sessions data. Error={{error}}',
  DELETE_SESSION_DATA:
    'Failed to delete session {{sessionId}} data. Error={{error}}',
  INTERNET_DISCONNECT: 'Internet Disconnected. Check your network.',
  FETCH_SESSION_DATA_ERROR:
    'Failed to fetch the session {{sessionId}} data. Error={{error}}',
  ACCOUNT_STATUS_ERROR: 'Error in fetching account status. Error={{error}}',
  UPGRADE_PLAN_ATTEMPT: 'Upgrade Plan Attempt.',
  FETCH_PROFILE: 'Fetching the user profile.',
  FETCH_PROFILE_ERROR: 'Error in fetching user profile.',
  UPDATING_PROFILE: 'Updating the user profile',
  COMPLETE_SESSION_ERROR: 'Error in complete session update. Error={{error}}',
  CLOSE_READY_SESSION_ERROR: 'Error in closing ready sessions. Error={{error}}',
  DMG_MOUNT: 'Successfully mounted the dmg file.',
  DMG_MOUNT_ERROR: 'Failed to mount the dmg file. Error={{error}}',
  DMG_INSTALLED: 'Successfully installed the .dmg file.',
  DMG_CP_ERROR:
    'Failed to copy the installation file (.dmg) to the Applications folder. Command={{command}}. Error={{error}}',
  DMG_UNMOUNT_ERROR: 'Failed to unmount the dmg file. Error={{error}}',
  DMG_UNMOUNT: 'Successfully un-mounted the dmg file.',
  SUBSCRIBING: 'Subscribing the monthly subscription.',
  SUBSCRIBED: 'Successfully subscribed.',
  RETRY_PAYMENT: 'Payment retry attempt.',
  ERROR_RETRY_PAYMENT: 'Error in retrying payment. Error={{error}}',
  ERROR_SUBSCRIPTION:
    'Error in subscribing the monthly subscription. Error={{error}}',
  UN_SUBSCRIBING: 'UnSubscribing the subscription.',
  UN_SUBSCRIBED: 'Successfully unsubscribed.',
  ERROR_UN_SUBSCRIBING:
    'Error in un-subscribing the subscription. Error={{error}}',
  SAVE_DEVICE_DETAILS_IN_FILE: 'Saved connected device details in file',
  ERROR_IN_SAVING_DEVICE_DETAILS_IN_FILE:
    'Error in saving device details in file. Error={{error}}',
  ERROR_CLOSE_DEVICE: 'Error closing device. Error={{error}}',
  ERROR_GETTING_CONNECTED_DEVICE_NAME:
    'Error in getting product name of connected device. Error={{error}}',
  DOWNLOADING_REQUEST: 'Downloading request. URL = {{url}}',
  DOWNLOADING_PROGRESS:
    'Downloading progress. Percent = {{percent}} and progressObj = {{obj}}',
  PREPARING_SILENT_INSTALL: 'Preparing silent install',
  AUTO_UPDATE_ERROR: 'Error in auto update. Error={{error}}',
  ERROR_IN_OPENING_NETWORK_SETTINGS:
    'Error in opening network settings. Error={{error}}',
  FAILED_DETECT_WIFI: 'Failed to detect Wi-Fi, Error={{error}}',
  ERROR_IN_GETTING_BATTERY_INFO:
    'Error in getting battery info. Error={{error}}',
  USB_DEVICE_CONNECTED: 'USB device connected: {{vendorId}}:{{productId}}',
  USB_DEVICE_DISCONNECTED:
    'USB device disconnected: {{vendorId}}:{{productId}}',
});

export const StorageKeys = Object.freeze({
  DOWNLOAD_PROGRESS: 'download_progress',
  ACCESS_TOKEN: 'accessToken',
  USERNAME: 'username',
  REFRESH_TOKEN: 'refreshToken',
  LOGIN_TIME: 'loginTime',
  ACCOUNT_DETAILS: 'accountDetails',
  PROFILE_DATA: 'profileData',
  SUBSCRIPTION: 'subscription',
  BATTERY_INFO: 'batteryInfo',
  UPDATE_INFO: 'updateInfo',
  SHOULD_POPUP_SHOW: 'shouldPopupShow',
  DEVICE_DETECTION: 'deviceDetection',
  REMEMBERED_CREDENTIALS: 'rememberedCredentials',
});
