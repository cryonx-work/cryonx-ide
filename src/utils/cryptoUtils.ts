
export const generateSalt = (): Uint8Array => {
    return window.crypto.getRandomValues(new Uint8Array(16));
};

export const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt as any,
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
};

export const encryptData = async (text: string, password: string): Promise<string> => {
    const salt = generateSalt();
    const key = await deriveKey(password, salt);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();

    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv as any },
        key,
        enc.encode(text)
    );

    const buffer = new Uint8Array(encrypted);
    const data = {
        salt: Array.from(salt),
        iv: Array.from(iv),
        ciphertext: Array.from(buffer)
    };
    return JSON.stringify(data);
};

export const decryptData = async (encryptedJson: string, password: string): Promise<string> => {
    try {
        const data = JSON.parse(encryptedJson);
        const salt = new Uint8Array(data.salt);
        const iv = new Uint8Array(data.iv);
        const ciphertext = new Uint8Array(data.ciphertext);

        const key = await deriveKey(password, salt);

        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv as any },
            key,
            ciphertext
        );

        const dec = new TextDecoder();
        return dec.decode(decrypted);
    } catch (e) {
        throw new Error("Decryption failed");
    }
};
