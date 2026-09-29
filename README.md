# CRUD Viagem — Java Spring

Projeto baseado na estrutura do CRUD de plantas enviado como referência, adaptado para o tema **viagens**.

## Tecnologias

- Java 17+
- Spring Boot 4.1.1
- Spring Web MVC
- Spring Data JPA
- H2 Database
- Lombok
- Maven Wrapper

## Estrutura

```text
src/main/java/com/viagem/cadastro_viagem/
├── business/                       # regras de negócio
├── controller/                     # endpoints REST
└── infrastructure/
    ├── entitys/                    # entidades JPA
    └── repository/                 # repositórios JPA
```

## Como executar

No terminal, dentro da pasta do projeto:

```bash
./mvnw spring-boot:run
```

Ou abra a pasta no IntelliJ e execute `CadastroViagemApplication`.

O servidor inicia em `http://localhost:8080`.

## Endpoints

| Método | Endpoint | Função |
|---|---|---|
| POST | `/viagem` | Cadastrar uma viagem |
| GET | `/viagem` | Listar todas as viagens |
| GET | `/viagem/{id}` | Buscar por ID |
| GET | `/viagem/destino/{destino}` | Buscar destino exato |
| GET | `/viagem/pesquisa?destino=paris` | Pesquisar destino parcialmente |
| PUT | `/viagem/{id}` | Atualizar uma viagem |
| DELETE | `/viagem/{id}` | Excluir por ID |
| DELETE | `/viagem/destino/{destino}` | Excluir pelo destino |

## Exemplo de cadastro

```json
{
  "destino": "Paris, França",
  "dataIda": "2026-12-10",
  "dataVolta": "2026-12-20",
  "preco": 6500.00,
  "observacoes": "Viagem de férias"
}
```

As datas devem ser enviadas no formato `AAAA-MM-DD`.

## Console H2

Durante a execução, o console pode ser acessado em:

`http://localhost:8080/h2-console`

Configuração:

- JDBC URL: `jdbc:h2:mem:viagemdb`
- Usuário: `sa`
- Senha: deixar em branco
