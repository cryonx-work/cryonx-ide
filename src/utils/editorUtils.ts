export const extensionMap: Record<string, string> = {
    // Web
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    html: "html",
    css: "css",
    scss: "scss",
    less: "less",

    // Data
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    xml: "xml",

    // Backend
    py: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    php: "php",
    rb: "ruby",
    go: "go",
    rs: "rust",

      // Smart contracts
    sol: "solidity",   // Ethereum
    vy: "vyper",       // Ethereum
    move: "move",      // Aptos, Sui, Cedra, Diem
    ink: "rust",       // Parity Substrate (smart contracts in Rust)
    clarity: "clarity",// Stacks
    cairo: "cairo",    // StarkNet

    // Shell & config
    sh: "shell",
    bash: "shell",
    md: "markdown",
    txt: "plaintext",
};

export function getFileLanguage(fileName: string): string{
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    return extensionMap[ext] || "";
};

export function highlightSearchTerm(text: string, searchTerm: string){
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-400 text-black">$1</mark>');
  };