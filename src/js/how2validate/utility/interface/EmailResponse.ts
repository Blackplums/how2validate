import { SecretStatusMessage } from "./secretStatusMessage";

// Extend SecretStatusMessage to include provider and service
export interface EmailResponse extends SecretStatusMessage {
    provider: string;
    service: string;
  }