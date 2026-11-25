package com.tableorder.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

public class TablePasswordValidator implements ConstraintValidator<ValidTablePassword, String> {
    
    private static final Pattern PATTERN = Pattern.compile("^\\d{4}$");
    
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return false;
        }
        return PATTERN.matcher(value).matches();
    }
}
