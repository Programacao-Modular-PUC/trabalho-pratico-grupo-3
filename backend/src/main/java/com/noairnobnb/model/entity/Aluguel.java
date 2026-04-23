package com.noairnobnb.model.entity;

import com.noairnobnb.model.enums.AluguelStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "aluguels")
public class Aluguel extends AuditableEntity {
  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "cliente_id", nullable = false)
  private Cliente cliente;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "quarto_id", nullable = false)
  private Quarto quarto;

  @Column(nullable = false)
  private LocalDateTime dataHoraEntrada;

  @Column(nullable = false)
  private LocalDateTime dataHoraSaida;

  @Column(nullable = false)
  private int numeroDiarias;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal valorTotal;

  @Column(name = "numero_hospedes")
  private Integer numeroHospedes;

  @Column(name = "solicita_berco", nullable = false)
  private boolean solicitaBerco = false;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private AluguelStatus status = AluguelStatus.ATIVO;

  @OneToOne(mappedBy = "aluguel")
  private Pagamento pagamento;

  public Cliente getCliente() {
    return cliente;
  }

  public void setCliente(Cliente cliente) {
    this.cliente = cliente;
  }

  public Quarto getQuarto() {
    return quarto;
  }

  public void setQuarto(Quarto quarto) {
    this.quarto = quarto;
  }

  public LocalDateTime getDataHoraEntrada() {
    return dataHoraEntrada;
  }

  public void setDataHoraEntrada(LocalDateTime dataHoraEntrada) {
    this.dataHoraEntrada = dataHoraEntrada;
  }

  public LocalDateTime getDataHoraSaida() {
    return dataHoraSaida;
  }

  public void setDataHoraSaida(LocalDateTime dataHoraSaida) {
    this.dataHoraSaida = dataHoraSaida;
  }

  public int getNumeroDiarias() {
    return numeroDiarias;
  }

  public void setNumeroDiarias(int numeroDiarias) {
    this.numeroDiarias = numeroDiarias;
  }

  public BigDecimal getValorTotal() {
    return valorTotal;
  }

  public void setValorTotal(BigDecimal valorTotal) {
    this.valorTotal = valorTotal;
  }

  public Integer getNumeroHospedes() {
    return numeroHospedes;
  }

  public void setNumeroHospedes(Integer numeroHospedes) {
    this.numeroHospedes = numeroHospedes;
  }

  public boolean isSolicitaBerco() {
    return solicitaBerco;
  }

  public void setSolicitaBerco(boolean solicitaBerco) {
    this.solicitaBerco = solicitaBerco;
  }

  public AluguelStatus getStatus() {
    return status;
  }

  public void setStatus(AluguelStatus status) {
    this.status = status;
  }

  public Pagamento getPagamento() {
    return pagamento;
  }

  public void setPagamento(Pagamento pagamento) {
    this.pagamento = pagamento;
  }
}

