import { ValidationArguments } from 'class-validator';

export const enumValidationMessage = (args: ValidationArguments) => {
  const allowedValues = Array.isArray(args.constraints[0])
    ? args.constraints[0] // 배열인 경우 그대로 사용
    : Object.values(args.constraints[0]); // 객체인 경우 배열로 변환

  return `${args.property} 필드는 유효하지 않은 값입니다. 허용되는 값은 [${allowedValues.join(', ')}] 입니다.`;
};
