package com.noairnobnb.model.entity;

import com.noairnobnb.model.enums.RoleName;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

@Entity
@Table(name = "roles")
public class Role extends BaseEntity {
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, unique = true, length = 20)
  private RoleName name;

  public RoleName getName() {
    return name;
  }

  public void setName(RoleName name) {
    this.name = name;
  }
}

