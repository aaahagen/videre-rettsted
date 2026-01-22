
export interface Storage {
  uploadFile(path: string, file: File): Promise<string>;
  deleteFile(path: string): Promise<void>;
  getDownloadURL(path: string): Promise<string>;
}
