export type ProjectTemplateType = 'blank' | 'coin' | 'nft';

export interface Project {
    id: string;
    name: string;
    template: ProjectTemplateType;
    createdAt: number;
    lastModified: number;
}
