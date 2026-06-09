# NoAirNoBnb

TP de hospedagem — Spring Boot + React.

## Rodar

Java 21, Maven, Node.

Terminal 1:

```bash
cd backend
mvn spring-boot:run
```

→ http://localhost:8080

Terminal 2:

```bash
cd frontend
npm install   # só na 1ª vez
npm run dev
```

→ http://localhost:5173

## Logins (seed)

| Perfil       | E-mail                      | Senha              |
|--------------|-----------------------------|--------------------|
| ADMIN        | admin@noairnobnb.com        | Admin@123          |
| PROPRIETARIO | proprietario@noairnobnb.com | Proprietario@123   |
| CLIENTE      | cliente@noairnobnb.com      | Cliente@123        |

Não vem com quarto cadastrado — loga como proprietário e cria antes de testar como cliente.
