---
applyTo: '**'
---

# Instruções do Projeto - ChromaMind

## Contexto
**ChromaMind** é uma aplicação web para geração de paletas de cores harmônicas baseadas em Teoria das Cores. O sistema recebe uma cor base e calcula harmonias (Complementar, Análoga, Tríade, etc.), gera variações (Tints & Shades) e valida acessibilidade (WCAG) para uso em UI Design.

**Status**: 🚀 Em desenvolvimento ativo (Dezembro 2025)

## Regras Críticas

### 🚨 Prioridade Máxima
- **NUNCA** remova código de produção sem validação completa dos impactos
- **NUNCA** use `any` em código TypeScript novo - sempre defina interfaces/tipos
- **NUNCA** use `# type: ignore` em Python sem justificativa
- **SEMPRE** use Pydantic models para validação de dados na API
- **SEMPRE** use async/await para endpoints FastAPI
- **SEMPRE** destrua Subscriptions Angular (unsubscribe, takeUntilDestroyed, async pipe)
- **SEMPRE** utilize classes utilitárias do **Tailwind CSS** para estilização (evite CSS/SCSS puro quando possível)

### Compatibilidade
- Backend: Python 3.11+
- Frontend: Angular 17+ (Standalone Components obrigatório)
- Node: 18.16+

### Qualidade de Código
- **Clean Architecture**: Mantenha a separação clara entre camadas (Services, Components, Models).
- **Acessibilidade**: Todas as cores geradas devem passar por verificação de contraste.
- **Design System**: Siga o padrão visual minimalista definido (sombras suaves, bordas arredondadas).

## Stack Técnica

### Backend (Python)
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Python** | 3.11+ | Linguagem principal |
| **FastAPI** | 0.104+ | Framework REST API |
| **Uvicorn** | 0.24+ | ASGI Server |
| **Pydantic** | 2.5+ | Validação e schemas |
| **Colorsys** | Std Lib | Conversão de espaços de cor |
| **NumPy** | Opcional | Cálculos vetoriais de cor |
| **pytest** | 7.4+ | Testes unitários |

### Frontend (Angular)
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Angular** | 17.3+ | Framework UI |
| **Tailwind CSS** | 3.4+ | Framework de Estilização |
| **RxJS** | 7.8+ | Programação reativa |
| **TypeScript** | 5.4+ | Linguagem |

---

## Arquitetura do Projeto

### Estrutura de Pastas
```
ChromaMind/
├── .github/
│   └── copilot-instructions.md   # Este arquivo
│
├── backend/
│   ├── app/
│   │   ├── main.py               # Entry point FastAPI
│   │   ├── api/
│   │   │   └── v1/
│   │   │       └── endpoints/    # Rotas da API
│   │   ├── core/
│   │   │   └── config.py         # Configurações
│   │   ├── services/             # Lógica de negócio (Color Theory)
│   │   │   └── color_theory.py
│   │   └── schemas/              # Pydantic models
│   │       └── palette.py
│   ├── tests/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.ts
│   │   │   ├── app.config.ts
│   │   │   ├── app.routes.ts
│   │   │   ├── components/       # Componentes reutilizáveis (PaletteDisplay)
│   │   │   ├── pages/            # Páginas (Home)
│   │   │   ├── services/         # Services HTTP
│   │   │   └── shared/
│   │   └── environments/
│   ├── angular.json
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── README.md
```

---

## Padrões de Código

### Backend (Python)

#### Convenções de Nomenclatura
```python
# Classes: PascalCase
class ColorTheoryService:

# Funções e métodos: snake_case
def generate_palette():
def calculate_contrast_ratio():

# Pydantic Models: PascalCase
class ColorPalette(BaseModel):
class ColorSwatch(BaseModel):
```

#### Pydantic Schemas
```python
class ColorSwatch(BaseModel):
    hex: str = Field(..., pattern=r"^#[0-9a-fA-F]{6}$")
    rgb: Tuple[int, int, int]
    hsl: Tuple[float, float, float]
    contrast_text: str = Field(..., description="Hex color for text (black or white)")

class PaletteResponse(BaseModel):
    base_color: ColorSwatch
    harmony_type: str
    colors: List[ColorSwatch]
```

### Frontend (Angular)

#### Tailwind CSS Usage
Use classes utilitárias diretamente no HTML. Evite criar classes CSS customizadas a menos que seja estritamente necessário (ex: animações complexas).

```html
<!-- ✅ BOM -->
<div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
  <h2 class="text-2xl font-bold text-gray-800">Palette Name</h2>
</div>

<!-- ❌ EVITAR -->
<div class="palette-card">...</div>
```

#### Standalone Components
```typescript
@Component({
  selector: 'app-palette-display',
  standalone: true,
  imports: [CommonModule, MatIconModule], // Importe apenas o necessário
  templateUrl: './palette-display.component.html'
})
export class PaletteDisplayComponent {
  @Input({ required: true }) palette!: IPalette;
}
```

---

## Domínio de Negócio - Teoria das Cores

### Harmonias Suportadas
1. **Complementar**: 180º no círculo cromático.
2. **Análoga**: ±30º da cor base.
3. **Tríade**: ±120º da cor base.
4. **Split-Complementary**: 180º ± 30º.

### Acessibilidade (WCAG)
- O backend deve calcular a taxa de contraste (Luminância Relativa).
- Se contraste com branco < 4.5:1, sugerir texto preto (e vice-versa).

---

## Comandos de Desenvolvimento

### Backend
```bash
cd backend
# Ativar venv
source .venv/bin/activate # ou .venv\Scripts\activate
# Rodar servidor
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
# Rodar servidor
ng serve
```

---

**Última Atualização**: 9 de Dezembro de 2025

**Nota**: Este arquivo é lido pelo Copilot em toda interação. Mantenha atualizado com padrões e decisões do projeto.
