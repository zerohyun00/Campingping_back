import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Campping {
    @PrimaryGeneratedColumn()
    id: number;
    
}
