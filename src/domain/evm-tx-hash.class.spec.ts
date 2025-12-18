import { EvmTxHash } from "./evm-tx-hash.class";

describe("EvmTxHash Test", () => {
    const validTxHash = "0x62ef7565fb26ef1b8072970731dbf42e7ed87bc524c7b4c80a4d69bf48248b19"
    const anotherValidTxHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"

    const checkThrowingError = (hash: string) => {
        expect(() => {
            return new EvmTxHash(hash);
        }).toThrow();
    }

    describe("EvmTxHash 생성 테스트", () => {
        describe("성공 케이스", () => {
            it("정상 TxHash 확인", async () => {
                expect(() => {
                    return new EvmTxHash(validTxHash)
                }).not.toThrow()
            });

            it("다른 정상 TxHash 확인", async () => {
                expect(() => {
                    return new EvmTxHash(anotherValidTxHash)
                }).not.toThrow()
            });

            it("대문자 hex 부분도 허용 (0x는 소문자 유지)", async () => {
                // GIVEN
                const mixedCaseTxHash = "0x" + validTxHash.slice(2).toUpperCase()
                expect(() => {
                    return new EvmTxHash(mixedCaseTxHash)
                }).not.toThrow()
            });
        });

        describe("부적절한 Hash 길이", () => {
            it("빈 값의 hash", async () => {
                // GIVEN
                const emptyHash = ''
                // WHEN & THEN
                checkThrowingError(emptyHash)
            });

            it("짧은 hash", async () => {
                // GIVEN
                const shortHash = validTxHash.substring(0, 32)
                // WHEN & THEN
                checkThrowingError(shortHash)
            });

            it("너무 긴 hash", async () => {
                // GIVEN
                const longHash = validTxHash + "aa"
                // WHEN & THEN
                checkThrowingError(longHash)
            });

        });

        describe("부적절한 Hash 구성", () => {
            it("0x로 시작하지 않는 Hash", async () => {
                // GIVEN
                const noOxHash = validTxHash.replace("0x", "");
                // WHEN & THEN
                checkThrowingError(noOxHash)
            });

            it("잘못된 Hex value (정상 길이지만 비hex 문자 포함)", async () => {
                // GIVEN
                const wrongValueHash = validTxHash.slice(0, -3) + "WYZ";
                // WHEN & THEN
                checkThrowingError(wrongValueHash)
            });

            it("0x 대신 다른 prefix 사용", async () => {
                // GIVEN
                const wrongPrefixHash = "0y" + validTxHash.slice(2);
                // WHEN & THEN
                checkThrowingError(wrongPrefixHash)
            });

            it("모든 문자가 hex가 아닌 경우", async () => {
                // GIVEN
                const nonHexHash = "0x" + "G".repeat(64)
                // WHEN & THEN
                checkThrowingError(nonHexHash)
            });
        });
    });

    describe("EvmTxHash 비교 테스트", () => {
        describe("동일한 해시 테스트", () => {
            it("EvmTxHash vs EvmTxHash 동일 테스트", async () => {
                // GIVEN
                const txHash1 = new EvmTxHash(validTxHash)
                const txHash2 = new EvmTxHash(validTxHash)
                const txHashLower = new EvmTxHash(validTxHash.toLowerCase())

                expect(txHash1.equals(txHash2)).toBe(true)
                expect(txHash1.equals(txHashLower)).toBe(true)
            });

            it("EvmTxHash vs string 동일 테스트", async () => {
                // GIVEN
                const txHash = new EvmTxHash(validTxHash)

                // THEN
                expect(txHash.equals(validTxHash)).toBe(true)
            });

            it("EvmTxHash vs 대문자 string 동일 테스트", async () => {
                // GIVEN
                const txHash = new EvmTxHash(validTxHash)

                // THEN
                expect(txHash.equals(validTxHash.toUpperCase())).toBe(true)
            });

            it("EvmTxHash vs 공백이 있는 string 동일 테스트", async () => {
                // GIVEN
                const txHash = new EvmTxHash(validTxHash)

                // THEN
                expect(txHash.equals("  " + validTxHash + "  ")).toBe(true)
            });
        });

        describe("상이한 해시 테스트", () => {
            it("EvmTxHash vs EvmTxHash 상이함 테스트", async () => {
                // GIVEN
                const txHash1 = new EvmTxHash(validTxHash)
                const txHash2 = new EvmTxHash(anotherValidTxHash)

                // THEN
                expect(txHash1.equals(txHash2)).toBe(false)
            });

            it("EvmTxHash vs string 상이함 테스트", async () => {
                // GIVEN
                const txHash = new EvmTxHash(validTxHash)

                // THEN
                expect(txHash.equals(anotherValidTxHash)).toBe(false)
            });
        });
    });

    describe("EvmTxHash 변환 테스트", () => {
        it("toViemHash()는 동일한 값을 반환", async () => {
            // GIVEN
            const txHash = new EvmTxHash(validTxHash)

            // WHEN
            const viemHash = txHash.toViemHash()

            // THEN
            expect(viemHash).toBe(validTxHash.toLowerCase())
        });

        it("hash property는 소문자 형태로 저장됨", async () => {
            // GIVEN
            const mixedCaseTxHash = "0x" + validTxHash.slice(2).toUpperCase()

            // WHEN
            const txHash = new EvmTxHash(mixedCaseTxHash)

            // THEN
            expect(txHash.hash).toBe(validTxHash.toLowerCase())
        });
    });
});
