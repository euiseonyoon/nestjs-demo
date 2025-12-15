export class EvmAddress {
    public readonly address: string;

    constructor(address: string) {
        const cleanAddress = address.trim();
        
        this.validateAddress(cleanAddress)
        
        this.address = cleanAddress.toLowerCase();
    }

    private validateAddress(address: string) {
        const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

        if (!EVM_ADDRESS_REGEX.test(address)) {
            throw new Error(
                `Invalid EVM address format: ${address}. 
                Must start with '0x' and be 42 characters long (40 hex digits).`
            );
        }
    }

    public equals(other: string | EvmAddress): boolean {
        if (other instanceof EvmAddress) {
            return this.address === other.address;
        }
        return this.address === other.trim().toLowerCase();
    }
}
