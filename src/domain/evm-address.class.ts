export class EvmAddress {
    private address: string;

    constructor(address: string) {
        const cleanAddress = address.trim();
        
        this.validateAddress(cleanAddress)
        
        this.address = cleanAddress;
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

    public getAddress(): string {
        return this.address;
    }
}
