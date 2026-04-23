package com.noairnobnb.util;

import com.noairnobnb.dto.response.PageResponse;
import java.util.function.Function;
import org.springframework.data.domain.Page;

public final class PageUtils {
  private PageUtils() {}

  public static <E, D> PageResponse<D> map(Page<E> page, Function<E, D> mapper) {
    return new PageResponse<>(
        page.map(mapper).getContent(),
        page.getNumber(),
        page.getSize(),
        page.getTotalElements(),
        page.getTotalPages(),
        page.isLast(),
        page.isFirst());
  }
}
