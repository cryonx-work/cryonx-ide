export const FILE_EXTENSIONS = {
    MOVE: '.move',
    MARKDOWN: '.md',
    TEXT: '.txt',
    TOML: '.toml',
    JSON: '.json',
};

export const LANGUAGE_MAPPING: Record<string, string> = {
    [FILE_EXTENSIONS.MOVE]: 'move',
    [FILE_EXTENSIONS.MARKDOWN]: 'markdown',
    [FILE_EXTENSIONS.TEXT]: 'text',
    [FILE_EXTENSIONS.TOML]: 'toml',
    [FILE_EXTENSIONS.JSON]: 'json',
};

export const DEFAULT_LANGUAGE = 'text';
