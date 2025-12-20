export class EvmAddress {
    public readonly address: string;

    constructor(address: string) {
        const cleanAddress = address.trim();
        
        if (!EvmAddress.validateAddress(cleanAddress)) {
            throw new Error(
                `Invalid EVM address format: ${address}. 
                Must start with '0x' and be 42 characters long (40 hex digits).`
            );
        }
        
        this.address = cleanAddress.toLowerCase();
    }

    static validateAddress(address: string): boolean {
        const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
        return EVM_ADDRESS_REGEX.test(address)
    }

    public equals(other: string | EvmAddress): boolean {
        if (other instanceof EvmAddress) {
            return this.address === other.address;
        }
        return this.address === other.trim().toLowerCase();
    }
}
