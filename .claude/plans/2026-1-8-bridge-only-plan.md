# Stargate Bridge Route Implementation Plan

## 목표
Stargate 브릿지를 사용한 cross-chain 라우팅 기능을 XSwapRouteService에 추가

## 요구사항 (from stargate-bridge.md)
1. Bridge helper 클래스 생성 (XSwapRouteSwapHelper 패턴 따르기)
2. `findRoutes()`에 `userAccount: EvmAddress` 파라미터 추가
3. "// 2. bridge로만 가능한지 판단" 하위에 구현
4. `StargateService.getQuote()` 메소드 활용

## 구현 개요

### 새로 생성할 파일
```
src/application/x-swap.routing/finder/bridge/
├── helper/
│   └── x-swap.route.bridge.helper.ts          (메인 브릿지 라우팅 로직)
└── required_port/
    └── x-swap.route.bridge.helper.interface.ts (인터페이스 정의)
```

### 수정할 파일
1. `src/application/x-swap.routing/finder/x-swap.route.service.ts` - 브릿지 라우트 로직 추가
2. `src/module/module.token.ts` - X_SWAP_ROUTE_BRIDGE_HELPER 토큰 추가
3. `src/module/x-swap.route.helper.module.ts` - 브릿지 헬퍼 프로바이더 등록

## 상세 구현

### 1. Interface 정의 (x-swap.route.bridge.helper.interface.ts)

```typescript
import { Token } from "src/domain/token.class";
import { QuoteRoute } from "src/domain/x-swap.type";
import { EvmAddress } from "src/domain/evm-address.class";

export type BridgeRouteRequest = {
    srcToken: Token;
    dstToken: Token;
    srcAmount: string;
    userAccount: EvmAddress;
}

export interface IXSwapRouteBridgeHelper {
    checkOneBridgeRoute(request: BridgeRouteRequest): Promise<QuoteRoute | null>;
}
```

### 2. Bridge Helper 구현 (x-swap.route.bridge.helper.ts)

**핵심 로직**:
```typescript
@Injectable()
export class XSwapRouteBridgeHelper implements IXSwapRouteBridgeHelper {
    constructor(
        @Inject(BRIDGE_SERVICES)
        private readonly bridgeServices: AbstractBridgeService[],
    ) {}

    async checkOneBridgeRoute(request: BridgeRouteRequest): Promise<QuoteRoute | null> {
        // 1. Cross-chain 체크 (same chain이면 null 반환)
        if (request.srcToken.chain.id === request.dstToken.chain.id) {
            return null;
        }

        // 2. 각 브릿지 서비스 순회 (현재는 Stargate만)
        for (const bridgeService of this.bridgeServices) {
            const quote = await this.getBridgeQuote(
                request.srcToken,
                request.dstToken,
                request.srcAmount,
                request.userAccount,
                bridgeService
            );

            if (quote) {
                const step = makeQuoteRouteStep(
                    request.srcToken,
                    request.dstToken,
                    bridgeService.protocol,
                    quote
                );
                return { steps: [step] };
            }
        }

        return null;
    }

    private async getBridgeQuote(
        srcToken: Token,
        dstToken: Token,
        srcAmount: string,
        userAccount: EvmAddress,
        bridgeService: AbstractBridgeService,
    ): Promise<TokenAmount | null> {
        try {
            const bridgeInAmount = parseFloat(srcAmount);
            if (isNaN(bridgeInAmount) || bridgeInAmount <= 0) return null;

            const bridgeRequest: NavieBridgeQuoteRequest = {
                srcChainId: srcToken.chain.id,
                dstChainId: dstToken.chain.id,
                srcTokenAddress: srcToken.address,
                dstTokenAddress: dstToken.address,
                bridgeInAmount: bridgeInAmount,
                receiverAddress: userAccount,
                senderAddresss: userAccount, // Note: 타입에 오타 존재
            };

            return await bridgeService.getQuote(bridgeRequest);
        } catch (error) {
            console.error(`Bridge quote failed for ${bridgeService.protocol}:`, error);
            return null;
        }
    }
}
```

### 3. XSwapRouteService 통합

**메소드 시그니처 변경**:
```typescript
async findRoutes(
    srcToken: Token,
    dstToken: Token,
    srcAmount: string,
    slippagePercentStr: string,
    userAccount: EvmAddress,  // 🆕 NEW PARAMETER
): Promise<QuoteRoute[]>
```

**Constructor 업데이트**:
```typescript
constructor(
    @Inject(X_SWAP_ROUTE_SWAP_HELPER)
    private readonly swapRouteHelper: IXSwapRouteSwapHelper,
    @Inject(X_SWAP_ROUTE_BRIDGE_HELPER)  // 🆕 NEW
    private readonly bridgeRouteHelper: IXSwapRouteBridgeHelper,  // 🆕 NEW
) {}
```

**브릿지 로직 추가**:
```typescript
// 2. bridge로만 가능한지 판단
if (srcToken.chain.id !== dstToken.chain.id) {
    const bridgeRoute = await this.bridgeRouteHelper.checkOneBridgeRoute({
        srcToken,
        dstToken,
        srcAmount,
        userAccount,
    });

    if (bridgeRoute) {
        allRoutes.push(bridgeRoute);
    }
}
```

### 4. Module 설정

**module.token.ts에 추가**:
```typescript
// Line ~53 근처에 추가
export const X_SWAP_ROUTE_BRIDGE_HELPER = Symbol('XSwapRouteBridgeHelper')
```

**x-swap.route.helper.module.ts 업데이트**:
```typescript
import { XSwapRouteBridgeHelper } from 'src/application/x-swap.routing/finder/bridge/helper/x-swap.route.bridge.helper';
import { BridgeModule } from './bridge.module';

@Module({
    imports: [
        SwapModule,
        BridgeModule,  // 🆕 NEW
        InfoProviderModule,
    ],
    providers: [
        { provide: X_SWAP_ROUTE_SWAP_HELPER, useClass: XSwapRouteSwapHelper },
        { provide: X_SWAP_ROUTE_BRIDGE_HELPER, useClass: XSwapRouteBridgeHelper }, // 🆕 NEW
    ],
    exports: [
        X_SWAP_ROUTE_SWAP_HELPER,
        X_SWAP_ROUTE_BRIDGE_HELPER,  // 🆕 NEW
    ]
})
export class XSwapRouteHelperModule {}
```

## Error Handling 전략

| 상황 | 처리 방법 |
|------|----------|
| Invalid amount (NaN, ≤0) | Return null, 계속 진행 |
| Bridge service 에러 | Try-catch로 잡아서 로그, null 반환 |
| Same-chain 요청 | Early return null |
| Quote 없음 | Null 전파 |

**철학**: Graceful failure - 브릿지 실패가 전체 라우팅을 막지 않도록

## 구현 순서

1. **인터페이스 파일 생성** (5분)
   - `x-swap.route.bridge.helper.interface.ts`
   - BridgeRouteRequest 타입 + IXSwapRouteBridgeHelper 인터페이스

2. **Helper 클래스 구현** (20분)
   - `x-swap.route.bridge.helper.ts`
   - checkOneBridgeRoute() + getBridgeQuote() 메소드

3. **Module 설정** (10분)
   - module.token.ts에 심볼 추가
   - x-swap.route.helper.module.ts 업데이트

4. **XSwapRouteService 통합** (10분)
   - Constructor injection
   - findRoutes() 시그니처 변경
   - 브릿지 로직 추가

5. **호출 지점 업데이트** (10분)
   - findRoutes() 호출하는 모든 곳에 userAccount 파라미터 추가

6. **테스트 및 검증** (15분)
   - 수동 테스트
   - 로그 확인

## 주요 파일 경로

### 생성할 파일
- `/Users/eyoon/Desktop/workspace/nestjs/shop-nestjs/src/application/x-swap.routing/finder/bridge/required_port/x-swap.route.bridge.helper.interface.ts`
- `/Users/eyoon/Desktop/workspace/nestjs/shop-nestjs/src/application/x-swap.routing/finder/bridge/helper/x-swap.route.bridge.helper.ts`

### 수정할 파일
- `/Users/eyoon/Desktop/workspace/nestjs/shop-nestjs/src/application/x-swap.routing/finder/x-swap.route.service.ts`
- `/Users/eyoon/Desktop/workspace/nestjs/shop-nestjs/src/module/module.token.ts`
- `/Users/eyoon/Desktop/workspace/nestjs/shop-nestjs/src/module/x-swap.route.helper.module.ts`

## 참고 파일
- `/Users/eyoon/Desktop/workspace/nestjs/shop-nestjs/src/application/x-swap.routing/finder/swap/helper/x-swap.route.swap.helper.ts` (패턴 참고)
- `/Users/eyoon/Desktop/workspace/nestjs/shop-nestjs/src/application/bridges/stargate/stargate.service.ts` (StargateService)
- `/Users/eyoon/Desktop/workspace/nestjs/shop-nestjs/src/application/bridges/request.type.ts` (NavieBridgeQuoteRequest)

## 향후 확장 가능성
- Bridge + Swap 조합 라우트
- 다중 브릿지 프로토콜 지원 (LayerZero 추가시 자동 지원)
- Quote 캐싱 (30초 TTL)

---

## 작업 체크리스트

- [ ] 1. Create interface file with BridgeRouteRequest type and IXSwapRouteBridgeHelper
- [ ] 2. Implement XSwapRouteBridgeHelper class with checkOneBridgeRoute and getBridgeQuote methods
- [ ] 3. Add X_SWAP_ROUTE_BRIDGE_HELPER symbol to module.token.ts
- [ ] 4. Update x-swap.route.helper.module.ts with bridge helper provider
- [ ] 5. Update XSwapRouteService constructor and findRoutes signature
- [ ] 6. Add bridge route logic to findRoutes method
- [ ] 7. Find and update all findRoutes() call sites with userAccount parameter
- [ ] 8. Test and verify the implementation
