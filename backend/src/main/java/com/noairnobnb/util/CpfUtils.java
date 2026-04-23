package com.noairnobnb.util;

public final class CpfUtils {
  private CpfUtils() {}

  public static String apenasDigitos(String cpf) {
    if (cpf == null) {
      return "";
    }
    return cpf.replaceAll("\\D", "");
  }
}
