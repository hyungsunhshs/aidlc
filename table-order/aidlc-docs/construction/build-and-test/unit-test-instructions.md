# Unit Test Execution

## Overview

단위 테스트는 각 유닛의 개별 컴포넌트를 독립적으로 검증합니다.

---

## Backend Unit Tests (table-order-api)

### Test Framework
- **JUnit 5**: 테스트 프레임워크
- **Mockito**: 목(Mock) 객체 생성
- **AssertJ**: 풍부한 assertion
- **Spring Boot Test**: 통합 테스트 지원

### Run All Unit Tests

```bash
cd table-order-api

# Run all tests
./gradlew test

# Run with detailed output
./gradlew test --info

# Run specific test class
./gradlew test --tests "com.tableorder.order.usecase.CreateOrderUseCaseTest"

# Run with coverage report
./gradlew test jacocoTestReport
```

### Test Report Location
- **HTML Report**: `table-order-api/build/reports/tests/test/index.html`
- **JaCoCo Coverage**: `table-order-api/build/reports/jacoco/test/html/index.html`

### Expected Test Coverage
- **Target**: 80%+ line coverage
- **Critical Paths**: UseCase classes should have 90%+ coverage

### Key Test Classes to Verify

| Class | Description | Priority |
|-------|-------------|----------|
| `CreateOrderUseCaseTest` | 주문 생성 로직 | High |
| `StartSessionUseCaseTest` | 세션 시작 로직 | High |
| `AdminAuthUseCaseTest` | 관리자 인증 로직 | High |
| `MenuServiceTest` | 메뉴 CRUD 로직 | Medium |
| `OrderNumberGeneratorTest` | 주문번호 생성 로직 | Medium |

---

## Frontend Unit Tests

### Test Framework
- **Vitest**: Vite 네이티브 테스트 러너 (권장)
- **React Testing Library**: 컴포넌트 테스트
- **Jest DOM**: DOM assertion 확장

### Setup (If Not Already Configured)

```bash
# customer-ordering-app
cd customer-ordering-app
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# store-management-app
cd store-management-app
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Add Test Configuration

**vite.config.ts** (both apps):
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

**src/test/setup.ts**:
```typescript
import '@testing-library/jest-dom';
```

**package.json** (add script):
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Run Frontend Unit Tests

```bash
# customer-ordering-app
cd customer-ordering-app
npm test          # Watch mode
npm run test:run  # Single run

# store-management-app
cd store-management-app
npm test          # Watch mode
npm run test:run  # Single run
```

### Key Components to Test

**customer-ordering-app:**
| Component | Test Focus |
|-----------|------------|
| `CartContext` | 장바구니 추가/수정/삭제 로직 |
| `SessionContext` | 세션 저장/복원 로직 |
| `MenuCard` | 렌더링, 담기 버튼 클릭 |
| `CartItem` | 수량 조절, 삭제 |
| `QuantityControl` | 증가/감소 버튼 |

**store-management-app:**
| Component | Test Focus |
|-----------|------------|
| `AuthContext` | 로그인/로그아웃 로직 |
| `useSSE` | SSE 연결/재연결 로직 |
| `OrderStatusBadge` | 상태별 렌더링 |
| `TableCard` | 테이블 정보 표시 |
| `MenuForm` | 폼 유효성 검사 |

---

## Sample Unit Test Examples

### Backend (Java)

```java
@ExtendWith(MockitoExtension.class)
class CreateOrderUseCaseTest {

    @Mock
    private OrderRepository orderRepository;
    
    @Mock
    private MenuRepository menuRepository;
    
    @InjectMocks
    private CreateOrderUseCase useCase;
    
    @Test
    void should_create_order_successfully() {
        // Given
        var menu = new Menu(1L, "김치찌개", 10000, true);
        var request = new CreateOrderRequest(List.of(
            new OrderItemRequest(1L, 2)
        ));
        
        when(menuRepository.findById(1L)).thenReturn(Optional.of(menu));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        
        // When
        var result = useCase.execute(1L, request);
        
        // Then
        assertThat(result.getTotalAmount()).isEqualTo(20000);
        assertThat(result.getItems()).hasSize(1);
    }
}
```

### Frontend (React)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider, useCart } from '../contexts/CartContext';
import { MenuCard } from '../components/MenuCard';

const TestComponent = () => {
  const { items, addItem } = useCart();
  const menu = { id: 1, name: '김치찌개', price: 10000, isAvailable: true };
  
  return (
    <div>
      <MenuCard menu={menu} onAddToCart={addItem} />
      <span data-testid="cart-count">{items.length}</span>
    </div>
  );
};

describe('MenuCard', () => {
  it('should add item to cart when clicking add button', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    fireEvent.click(screen.getByText('담기'));
    
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
  });
});
```

---

## Fix Failing Tests

1. **Review test output** to identify the failing test
2. **Check the assertion** - is the expected value correct?
3. **Verify mock setup** - are mocks returning expected values?
4. **Debug with breakpoints** or logging
5. **Fix the code or test** as appropriate
6. **Rerun tests** to verify the fix

```bash
# Backend - run specific test with debug
./gradlew test --tests "CreateOrderUseCaseTest" --debug-jvm

# Frontend - run specific test file
npm test -- MenuCard.test.tsx
```
