import { Token, E_ADDRESS, E_ADDRESS_LOWER } from "./token.class";
import { EvmAddress } from "./evm-address.class";
import { ChainInfo } from "./chain-info.type";

describe("Token Test", () => {
    const ethereumChain: ChainInfo = {
        id: 1,
        name: "Ethereum",
        testnet: false
    };

    const polygonChain: ChainInfo = {
        id: 137,
        name: "Polygon",
        testnet: false
    };

    const usdtAddress = new EvmAddress("0xdAC17F958D2ee523a2206206994597C13D831ec7");
    const usdcAddress = new EvmAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
    const nativeTokenAddress = new EvmAddress(E_ADDRESS);

    describe("Token 생성 테스트", () => {
        describe("성공 케이스", () => {
            it("정상 ERC20 토큰 생성", () => {
                expect(() => {
                    new Token(
                        ethereumChain,
                        usdtAddress,
                        "USDT",
                        6,
                        "Tether USD",
                        "https://example.com/usdt.png",
                        false
                    );
                }).not.toThrow();
            });

            it("Native 토큰 생성 (E_ADDRESS 사용)", () => {
                expect(() => {
                    new Token(
                        ethereumChain,
                        nativeTokenAddress,
                        "ETH",
                        18,
                        "Ethereum",
                        "https://example.com/eth.png",
                        true
                    );
                }).not.toThrow();
            });

            it("logoUri가 null인 토큰 생성", () => {
                expect(() => {
                    new Token(
                        ethereumChain,
                        usdtAddress,
                        "USDT",
                        6,
                        "Tether USD",
                        null,
                        false
                    );
                }).not.toThrow();
            });
        });

        describe("실패 케이스", () => {
            it("isNativeToken=true인데 주소가 E_ADDRESS가 아닌 경우", () => {
                expect(() => {
                    new Token(
                        ethereumChain,
                        usdtAddress,
                        "ETH",
                        18,
                        "Ethereum",
                        "https://example.com/eth.png",
                        true // isNativeToken=true 하지만 주소는 USDT
                    );
                }).toThrow(`Native token address should be ${E_ADDRESS}`);
            });

            it("isNativeToken=true인데 대문자 E_ADDRESS가 아닌 경우", () => {
                expect(() => {
                    // 대문자 E_ADDRESS를 소문자로 변환한 주소
                    const wrongNativeAddr = new EvmAddress(E_ADDRESS_LOWER);
                    new Token(
                        ethereumChain,
                        wrongNativeAddr,
                        "ETH",
                        18,
                        "Ethereum",
                        null,
                        true
                    );
                }).not.toThrow(); // EvmAddress.equals()는 case-insensitive이므로 통과
            });
        });
    });

    describe("Token convertToBigIntAmount 테스트", () => {
        it("decimals 18인 토큰 (ETH) 변환", () => {
            // GIVEN
            const token = new Token(
                ethereumChain,
                nativeTokenAddress,
                "ETH",
                18,
                "Ethereum",
                null,
                true
            );

            // WHEN & THEN
            expect(token.convertToBigIntAmount("1")).toBe(BigInt("1000000000000000000")); // 1 ETH
            expect(token.convertToBigIntAmount("0.5")).toBe(BigInt("500000000000000000")); // 0.5 ETH
            expect(token.convertToBigIntAmount("10.5")).toBe(BigInt("10500000000000000000")); // 10.5 ETH
        });

        it("decimals 6인 토큰 (USDT) 변환", () => {
            // GIVEN
            const token = new Token(
                ethereumChain,
                usdtAddress,
                "USDT",
                6,
                "Tether USD",
                null,
                false
            );

            // WHEN & THEN
            expect(token.convertToBigIntAmount("1")).toBe(BigInt("1000000")); // 1 USDT
            expect(token.convertToBigIntAmount("100")).toBe(BigInt("100000000")); // 100 USDT
            expect(token.convertToBigIntAmount("0.5")).toBe(BigInt("500000")); // 0.5 USDT
        });

        it("decimals 8인 토큰 변환", () => {
            // GIVEN
            const token = new Token(
                ethereumChain,
                usdcAddress,
                "USDC",
                8,
                "USD Coin",
                null,
                false
            );

            // WHEN & THEN
            expect(token.convertToBigIntAmount("1")).toBe(BigInt("100000000")); // 1 USDC
            expect(token.convertToBigIntAmount("1000")).toBe(BigInt("100000000000")); // 1000 USDC
        });

        it("소수점이 있는 금액 변환", () => {
            // GIVEN
            const token = new Token(
                ethereumChain,
                usdtAddress,
                "USDT",
                6,
                "Tether USD",
                null,
                false
            );

            // WHEN & THEN
            expect(token.convertToBigIntAmount("123.456789")).toBe(BigInt("123456789"));
        });

        it("반올림 테스트 (ROUND_DOWN 사용)", () => {
            // GIVEN
            const token = new Token(
                ethereumChain,
                usdtAddress,
                "USDT",
                6,
                "Tether USD",
                null,
                false
            );

            // WHEN & THEN (반올림이 아닌 내림 처리)
            expect(token.convertToBigIntAmount("0.0000001")).toBe(BigInt("0")); // 0.1 microUSDT = 0
        });
    });

    describe("Token equals 테스트", () => {
        describe("동일한 토큰 테스트", () => {
            it("동일한 chain과 동일한 address", () => {
                // GIVEN
                const token1 = new Token(
                    ethereumChain,
                    usdtAddress,
                    "USDT",
                    6,
                    "Tether USD",
                    null,
                    false
                );
                const token2 = new Token(
                    ethereumChain,
                    usdtAddress,
                    "USDT",
                    6,
                    "Tether USD",
                    null,
                    false
                );

                // THEN
                expect(token1.equals(token2)).toBe(true);
            });

            it("동일한 chain, 다른 symbol/decimals/name이어도 address 동일하면 같음", () => {
                // GIVEN
                const token1 = new Token(
                    ethereumChain,
                    usdtAddress,
                    "USDT",
                    6,
                    "Tether USD",
                    null,
                    false
                );
                const token2 = new Token(
                    ethereumChain,
                    usdtAddress,
                    "USDT_WRAPPED",
                    8,
                    "Tether USD Wrapped",
                    "https://example.com/usdt.png",
                    false
                );

                // THEN (address와 chain id만 같으면 equals는 true)
                expect(token1.equals(token2)).toBe(true);
            });
        });

        describe("상이한 토큰 테스트", () => {
            it("동일한 chain, 다른 address", () => {
                // GIVEN
                const token1 = new Token(
                    ethereumChain,
                    usdtAddress,
                    "USDT",
                    6,
                    "Tether USD",
                    null,
                    false
                );
                const token2 = new Token(
                    ethereumChain,
                    usdcAddress,
                    "USDC",
                    6,
                    "USD Coin",
                    null,
                    false
                );

                // THEN
                expect(token1.equals(token2)).toBe(false);
            });

            it("다른 chain, 동일한 address", () => {
                // GIVEN
                const token1 = new Token(
                    ethereumChain,
                    usdtAddress,
                    "USDT",
                    6,
                    "Tether USD",
                    null,
                    false
                );
                const token2 = new Token(
                    polygonChain,
                    usdtAddress,
                    "USDT",
                    6,
                    "Tether USD",
                    null,
                    false
                );

                // THEN
                expect(token1.equals(token2)).toBe(false);
            });
        });
    });

    describe("Token 정적 메서드 테스트", () => {
        describe("isNativeToken 테스트", () => {
            it("E_ADDRESS는 native token", () => {
                expect(Token.isNativeToken(E_ADDRESS)).toBe(true);
            });

            it("E_ADDRESS_LOWER는 native token", () => {
                expect(Token.isNativeToken(E_ADDRESS_LOWER)).toBe(true);
            });

            it("E_ADDRESS 대문자는 native token", () => {
                expect(Token.isNativeToken(E_ADDRESS.toUpperCase())).toBe(true);
            });

            it("다른 주소는 native token이 아님", () => {
                expect(Token.isNativeToken(usdtAddress.equals(E_ADDRESS) ? E_ADDRESS : "0xdAC17F958D2ee523a2206206994597C13D831ec7")).toBe(false);
            });
        });
    });

    describe("Token 속성 테스트", () => {
        it("Token의 모든 속성이 올바르게 설정됨", () => {
            // GIVEN
            const token = new Token(
                ethereumChain,
                usdtAddress,
                "USDT",
                6,
                "Tether USD",
                "https://example.com/usdt.png",
                false
            );

            // THEN
            expect(token.chain).toBe(ethereumChain);
            expect(token.address).toBe(usdtAddress);
            expect(token.symbol).toBe("USDT");
            expect(token.decimals).toBe(6);
            expect(token.name).toBe("Tether USD");
            expect(token.logoUri).toBe("https://example.com/usdt.png");
            expect(token.isNativeToken).toBe(false);
        });

        it("Native Token의 isNativeToken은 true", () => {
            // GIVEN
            const token = new Token(
                ethereumChain,
                nativeTokenAddress,
                "ETH",
                18,
                "Ethereum",
                null,
                true
            );

            // THEN
            expect(token.isNativeToken).toBe(true);
        });
    });
});
