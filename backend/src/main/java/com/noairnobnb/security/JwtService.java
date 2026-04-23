package com.noairnobnb.security;

import com.noairnobnb.config.NoAirNoBnbProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final NoAirNoBnbProperties.Security.Jwt props;
  private final SecretKey key;

  public JwtService(NoAirNoBnbProperties props) {
    this.props = props.security().jwt();
    var secretBytes = this.props.secret().getBytes(StandardCharsets.UTF_8);
    if (secretBytes.length < 64) {
      throw new IllegalStateException(
          "JWT_SECRET inválido: para HS512 são necessários pelo menos 64 bytes (defina uma string longa e aleatória).");
    }
    this.key = Keys.hmacShaKeyFor(secretBytes);
  }

  public String generateToken(AppUserPrincipal principal) {
    var now = Instant.now();
    var exp = now.plusSeconds(props.expiresInMinutes() * 60);

    var roles =
        principal.getAuthorities().stream()
            .map(a -> a.getAuthority().replace("ROLE_", ""))
            .collect(Collectors.toList());

    return Jwts.builder()
        .issuer(props.issuer())
        .subject(principal.getUsername())
        .issuedAt(Date.from(now))
        .expiration(Date.from(exp))
        .claim("uid", principal.getUserId())
        .claim("roles", roles)
        .signWith(key, Jwts.SIG.HS512)
        .compact();
  }

  public Claims parseClaims(String token) {
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
  }

  @SuppressWarnings("unchecked")
  public List<String> rolesFromClaims(Claims claims) {
    return (List<String>) claims.get("roles");
  }
}
