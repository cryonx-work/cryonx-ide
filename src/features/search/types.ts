export interface SearchResult {
    fileId: string;
    fileName: string;
    matches: { line: number; text: string }[];
}
