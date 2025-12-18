import { EvmAddress } from "./evm-address.class";

describe("EvmAddress Test", () => {
    const usdtEtheruemAddr = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
    const usdcEthereumAddr = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

    const checkThrowingErorr = (address: string) => {
        expect(() => {
            return new EvmAddress(address);
        }).toThrow();
    }

    describe("EvmAddress 생성 테스트", () => {
        describe("성공 케이스", () => {
            it("USDT@Ethereum Hash 확인", async () => {
                expect(() => {
                    return new EvmAddress(usdtEtheruemAddr)
                }).not.toThrow()
            });
        });

        describe("부적절한 Hash 길이", () => {
            it("빈 값의 hash ", async () => {
                // GIVEN
                const emptyHash = ''
                // WHEN & THEN
                checkThrowingErorr(emptyHash)
            });

            it("짦은 hash ", async () => {
                // GIVEN
                const shortAddr = usdtEtheruemAddr.substring(0, 20)
                // WHEN & THEN
                checkThrowingErorr(shortAddr)
            });

            it("너무 긴 hash", async () => {
                // GIVEN
                const longAddr = usdtEtheruemAddr + "aaaaa"
                // WHEN & THEN
                checkThrowingErorr(longAddr)
            });
        });

        describe("부적절한 Hash 구성", () => {
            it("0x로 시작하지 않는 Hash", async () => {
                // GIVEN
                const noOxHash = usdtEtheruemAddr.replace("0x", "");
                // WHEN & THEN
                checkThrowingErorr(noOxHash)
            });

            it("잘못된 Hex value", async () => {
                // GIVEN
                const wrongValueHash = usdtEtheruemAddr.slice(0, -3) + "WYZ";
                // WHEN & THEN
                checkThrowingErorr(wrongValueHash)
            });
        });
    });

    describe("EvmAddrss 비교 테스트", () => {
        describe("동일한 주소 테스트", () => {
            it("EvmAddress vs EvmAddress 동일 테스트", async () => {
                // GIVEN
                const usdt = new EvmAddress(usdtEtheruemAddr)
                const otherUsdt = new EvmAddress(usdtEtheruemAddr)
                const usdtLower = new EvmAddress(usdtEtheruemAddr.toLowerCase())
                
                expect(usdt.equals(otherUsdt)).toBe(true)
                expect(usdt.equals(usdtLower)).toBe(true)
            });

            it("EvmAddress vs string 동일 테스트", async () => {
                // GIVEN
                const usdt = new EvmAddress(usdtEtheruemAddr)
                
                // THEN
                expect(usdt.equals(usdtEtheruemAddr)).toBe(true)
            });
        });

        describe("상이한 주소 테스트", () => {
            it("EvmAddress vs Evmaddress 상이함 테스트", async () => {
                // GIVEN
                const usdt = new EvmAddress(usdtEtheruemAddr)
                const usdc = new EvmAddress(usdcEthereumAddr)
                const usdcLower = new EvmAddress(usdcEthereumAddr.toLowerCase())
                
                // THEN
                expect(usdt.equals(usdc)).toBe(false)
                expect(usdt.equals(usdcLower)).toBe(false)
            });

            it("EvmAddress vs string 상이함 테스트", async () => {
                // GIVEN
                const usdt = new EvmAddress(usdtEtheruemAddr)
                
                // THEN
                expect(usdt.equals(usdcEthereumAddr)).toBe(false)
            });
        });
    });
});
