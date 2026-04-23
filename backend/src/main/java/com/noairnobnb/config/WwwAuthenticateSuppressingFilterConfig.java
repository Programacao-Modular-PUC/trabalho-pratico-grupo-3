package com.noairnobnb.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

@Configuration
public class WwwAuthenticateSuppressingFilterConfig {

  @Bean
  FilterRegistrationBean<WwwAuthenticateSuppressingFilter> wwwAuthenticateSuppressingFilterRegistration() {
    var reg = new FilterRegistrationBean<>(new WwwAuthenticateSuppressingFilter());
    reg.setOrder(Ordered.HIGHEST_PRECEDENCE + 5);
    reg.addUrlPatterns("/*");
    return reg;
  }
}
