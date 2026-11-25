package com.tableorder.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = TablePasswordValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidTablePassword {
    String message() default "비밀번호는 4자리 숫자여야 합니다";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
