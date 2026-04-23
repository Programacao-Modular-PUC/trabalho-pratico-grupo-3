package com.noairnobnb;

import com.noairnobnb.config.NoAirNoBnbProperties;
import com.noairnobnb.config.UploadProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({NoAirNoBnbProperties.class, UploadProperties.class})
public class NoAirNoBnbApplication {
  public static void main(String[] args) {
    SpringApplication.run(NoAirNoBnbApplication.class, args);
  }
}

