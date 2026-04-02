
export interface Storage {
  uploadFile(path: string, file: File, metadata?: object): Promise<string>;
  deleteFile(path: string): Promise<void>;
  getDownloadURL(path: string): Promise<string>;
}
