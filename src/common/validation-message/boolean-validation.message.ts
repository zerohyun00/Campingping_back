import { ValidationArguments } from 'class-validator';

export const booleanValidationMessage = (args: ValidationArguments) => {
  return `${args.property}에 Boolean 값을 입력해주세요!`;
};
