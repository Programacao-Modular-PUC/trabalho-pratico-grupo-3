package com.noairnobnb.model.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "residencias")
public class Residencia extends AuditableEntity {
  @Column(nullable = false, length = 200)
  private String endereco;

  @Column(nullable = false, length = 20)
  private String numero;

  @Column(nullable = false, length = 80)
  private String bairro;

  @Column(nullable = false, length = 12)
  private String cep;

  @Column(nullable = false, length = 30)
  private String telefone;

  @Column(nullable = false, length = 190)
  private String email;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "proprietario_id", nullable = false)
  private Proprietario proprietario;

  @OneToMany(mappedBy = "residencia", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Quarto> quartos = new ArrayList<>();

  public String getEndereco() {
    return endereco;
  }

  public void setEndereco(String endereco) {
    this.endereco = endereco;
  }

  public String getNumero() {
    return numero;
  }

  public void setNumero(String numero) {
    this.numero = numero;
  }

  public String getBairro() {
    return bairro;
  }

  public void setBairro(String bairro) {
    this.bairro = bairro;
  }

  public String getCep() {
    return cep;
  }

  public void setCep(String cep) {
    this.cep = cep;
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

  public Proprietario getProprietario() {
    return proprietario;
  }

  public void setProprietario(Proprietario proprietario) {
    this.proprietario = proprietario;
  }

  public List<Quarto> getQuartos() {
    return quartos;
  }

  public void setQuartos(List<Quarto> quartos) {
    this.quartos = quartos;
  }
}

