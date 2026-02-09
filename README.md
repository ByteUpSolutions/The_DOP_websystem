# Sistema de Comunidade e Chat - Arquitetura Fullstack (Clean Architecture)

Este projeto implementa uma plataforma de gestão de comunidades com chat em tempo real, seguindo uma arquitetura moderna, segura e baseada em **Clean Architecture** e princípios **SOLID**.

## Arquitetura e Tecnologias

### Backend (Spring Boot 3)
O backend segue a Clean Architecture, com separação clara de responsabilidades por camadas e domínios.

| Camada | Pacote Java | Responsabilidade |
| :--- | :--- | :--- |
| **Domain** | `com.community.app.domain.*` | Entidades de Domínio (Records), Interfaces de Repositório (Ports). **Regras de Negócio.** |
| **Application** | `com.community.app.application.*` | Casos de Uso (Use Cases). Orquestra o fluxo de dados. |
| **Infrastructure** | `com.community.app.infrastructure.*` | Adaptadores de Persistência (JPA), Segurança (JWT), Firebase. Implementa as Ports. |
| **Web** | `com.community.app.web.*` | Controladores REST (Adaptadores), DTOs de Entrada/Saída. |

- **Segurança**: Spring Security 6 com filtro JWT customizado.
- **Identidade Híbrida**: Autenticação via PostgreSQL para API REST e geração de `Custom Token` do Firebase para o chat.
- **DTOs**: Uso estrito de Java `Records` para todas as entradas e saídas.
- **Exceções**: Tratamento global via `@ControllerAdvice` (a ser implementado na classe principal do Spring Boot).
- **Banco de Dados**: PostgreSQL com UUIDs.

### Frontend (Angular 17+)
- **Standalone Components**: Arquitetura sem `NgModules`.
- **Reatividade**: Uso de `Angular Signals` para gerenciamento de estado.
- **Estilização**: `TailwindCSS` para design responsivo.
- **Integração Firebase**: Conexão direta com Firestore usando autenticação delegada pelo Backend.

### Infraestrutura
- **Docker Compose**: Orquestração de containers para PostgreSQL, Backend (Java) e Frontend (Nginx).

## Como Executar

1. **Firebase Setup**:
   - Coloque o arquivo `service-account.json` do Firebase Admin SDK em `backend/src/main/resources/`.
   - Configure as credenciais do Firebase no ambiente do Frontend.

2. **Docker**:
   O `docker-compose.yml` foi corrigido para usar caminhos explícitos, garantindo que o build funcione corretamente a partir do diretório raiz do projeto.

   ```bash
   docker-compose up --build
   ```

3. **Acesso**:
   - Frontend: `http://localhost`
   - API Docs (Swagger): `http://localhost:8080/swagger-ui.html`

## Estrutura de Pastas
- `/backend`: Código fonte Java/Spring Boot.
- `/frontend`: Aplicação Angular 17.
- `/infra`: Configurações de Nginx e Postgres (incluindo `init.sql` para inicialização do DB).
- `docker-compose.yml`: Definição dos serviços.
