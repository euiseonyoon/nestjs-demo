export function generateRandomHexString(lenght: number): string {
    const hexBody = Array.from({ length: lenght }, () => {
        return Math.floor(Math.random() * 16).toString(16);
    }).join('');
    return `0x${hexBody}`;
}
