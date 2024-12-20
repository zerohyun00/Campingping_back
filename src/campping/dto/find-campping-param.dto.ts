import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

export class CamppingParamDto {
    @Type(() => Number)
    @IsNumber()
    id: number;
}