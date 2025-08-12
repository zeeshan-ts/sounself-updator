export interface CheckHummingbirdUpdatesParams {
  operatingSystem: string;
  currentVersion: string;
}

export interface HummingbirdUpdateResponse {
  data: {
    version: string;
    buildLink: string;
  };
  code: number;
  success: boolean;
  message: string;
}
