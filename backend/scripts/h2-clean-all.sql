-- Zera dados de negócio e usuários. Depois reinicie a API para o SeedDataRunner recriar roles + 3 contas.
-- (Alternativa: subir com perfil db-reset - ver README.)
SET REFERENTIAL_INTEGRITY FALSE;
DELETE FROM pagamentos;
DELETE FROM aluguels;
DELETE FROM reservas;
DELETE FROM quarto_imagens;
DELETE FROM quartos;
DELETE FROM residencias;
DELETE FROM clientes;
DELETE FROM proprietarios;
DELETE FROM usuario_roles;
DELETE FROM usuarios;
DELETE FROM roles;
SET REFERENTIAL_INTEGRITY TRUE;
