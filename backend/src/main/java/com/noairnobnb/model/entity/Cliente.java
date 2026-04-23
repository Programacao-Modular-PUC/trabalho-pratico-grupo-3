package com.noairnobnb.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "clientes")
public class Cliente extends AuditableEntity {
  @Column(nullable = false, length = 120)
  private String nome;

  @Column(nullable = false, unique = true, length = 14)
  private String cpf;

  @Column(nullable = false, length = 255)
  private String endereco;

  @Column(nullable = false, length = 30)
  private String telefone;

  @Column(nullable = false, length = 190)
  private String email;

  @OneToOne(optional = false)
  @JoinColumn(name = "usuario_id", nullable = false, unique = true)
  private Usuario usuario;

  public String getNome() {
    return nome;
  }

  public void setNome(String nome) {
    this.nome = nome;
  }

  public String getCpf() {
    return cpf;
  }

  public void setCpf(String cpf) {
    this.cpf = cpf;
  }

  public String getEndereco() {
    return endereco;
  }

  public void setEndereco(String endereco) {
    this.endereco = endereco;
  }

  public String getTelefone() {
    return telefone;
  }

  public void setTelefone(String telefone) {
    this.telefone = telefone;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public Usuario getUsuario() {
    return usuario;
  }

  public void setUsuario(Usuario usuario) {
    this.usuario = usuario;
  }
}

