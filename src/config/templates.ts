import { FileSystemItem, ProjectTemplateType } from '@/types';

const BASIC_COIN_TEMPLATE: FileSystemItem[] = [
    {
        id: 'root-readme',
        parentId: null,
        name: 'README.md',
        type: 'file',
        language: 'markdown',
        content: `# Basic Coin Project\n\nA simple fungible token implementation on Cedra Network.`
    },
    { id: 'folder-sources', parentId: null, name: 'sources', type: 'folder' },
    {
        id: '1',
        parentId: 'folder-sources',
        name: 'BasicCoin.move',
        type: 'file',
        language: 'move',
        content: `module 0x1::BasicCoin {
    use std::signer;

    struct Coin has key {
        value: u64,
    }

    public fun mint(account: &signer, value: u64) {
        move_to(account, Coin { value })
    }

    public fun transfer(from: &signer, to: address, amount: u64) acquires Coin {
        // Implementation
    }
}`
    }
];

const NFT_TEMPLATE: FileSystemItem[] = [
    {
        id: 'root-readme',
        parentId: null,
        name: 'README.md',
        type: 'file',
        language: 'markdown',
        content: `# NFT Collection\n\nManage unique digital assets.`
    },
    { id: 'folder-sources', parentId: null, name: 'sources', type: 'folder' },
    {
        id: 'nft-1',
        parentId: 'folder-sources',
        name: 'NFT.move',
        type: 'file',
        language: 'move',
        content: `module 0x1::NFTCollection {
    use std::string;
    use std::signer;

    struct NFT has key, store {
        id: u64,
        name: string::String,
        uri: string::String
    }

    public entry fun mint_nft(account: &signer, name: vector<u8>, uri: vector<u8>) {
        // Mint logic
    }
}`
    }
];

const BLANK_TEMPLATE: FileSystemItem[] = [
    {
        id: 'root-readme',
        parentId: null,
        name: 'README.md',
        type: 'file',
        language: 'markdown',
        content: `# New Project\n\nStart building on Cedra.`
    },
    { id: 'folder-sources', parentId: null, name: 'sources', type: 'folder' }
];

export const TEMPLATES: Record<ProjectTemplateType, FileSystemItem[]> = {
    'coin': BASIC_COIN_TEMPLATE,
    'nft': NFT_TEMPLATE,
    'blank': BLANK_TEMPLATE
};
