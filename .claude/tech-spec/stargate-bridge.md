# 목적
bridge in 토큰 정보 + 수량이 주어졋을 때, stargate 브릿지 defi를 사용하여 bridge 할 수 있는지 quote를 구한다.

## 토큰 정보
src/doamin/token.class.ts의 `Token`클래스를 활용한다.

## 기존 코드 base에서 활용가능 한 코드
src/application/x-swap.routing/finder/swap/helper/x-swap.route.swap.helper.ts 처럼 helper 클래스를 만들어야 할 것 같다. 
src/application/bridges/stargate/stargate.service.ts의 `StargateService`의 getQuote() 메소드를 사용한다.

## 가정 (Assumption)
Bridge in & out을 하는 주소가 같은 유저의 지갑주소라고 가정한다.

## 구현
1. src/application/x-swap.routing/finder/x-swap.route.service.ts 의 findRoutes()에 
// 2. bridge로만 가능한지 판단 하위
아레에 구현 하도록 한다. 

2. findRoutes()의 파라미터에 user accont (EvmAddress)를 추가한다. 




