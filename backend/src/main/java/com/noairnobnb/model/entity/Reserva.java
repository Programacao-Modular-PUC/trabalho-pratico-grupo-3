package com.noairnobnb.model.entity;

import com.noairnobnb.model.enums.ReservaStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservas")
public class Reserva extends AuditableEntity {
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

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private ReservaStatus status = ReservaStatus.ATIVA;

  @Column(precision = 12, scale = 2)
  private BigDecimal valorPrevisto;

  @Column(name = "numero_hospedes")
  private Integer numeroHospedes;

  @Column(name = "solicita_berco", nullable = false)
  private boolean solicitaBerco = false;

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

  public ReservaStatus getStatus() {
    return status;
  }

  public void setStatus(ReservaStatus status) {
    this.status = status;
  }

  public BigDecimal getValorPrevisto() {
    return valorPrevisto;
  }

  public void setValorPrevisto(BigDecimal valorPrevisto) {
    this.valorPrevisto = valorPrevisto;
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
}

