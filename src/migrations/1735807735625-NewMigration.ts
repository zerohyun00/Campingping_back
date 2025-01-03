import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1735807735625 implements MigrationInterface {
    name = 'NewMigration1735807735625'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "username" character varying NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_email" UNIQUE ("email")
            )
        `);
        await queryRunner.query(`CREATE TABLE "community" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "title" character varying NOT NULL, "content" character varying NOT NULL, "location" character varying NOT NULL, "people" integer NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "view" integer NOT NULL DEFAULT '0', "coordinate" geometry NOT NULL, "userId" uuid, CONSTRAINT "PK_cae794115a383328e8923de4193" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "content" character varying NOT NULL, "userId" uuid, "communityId" integer, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "message" character varying NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "authorId" uuid, "chatRoomId" integer, CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat_room" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, CONSTRAINT "PK_8aa3a52cf74c96469f0ef9fbe3e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "favorite" ("id" SERIAL NOT NULL, "contentId" character varying NOT NULL, "status" boolean NOT NULL DEFAULT false, "userId" uuid, CONSTRAINT "PK_495675cec4fb09666704e4f610f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "review" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "content" character varying NOT NULL, "contentId" character varying NOT NULL, "scope" integer NOT NULL, "userId" uuid, CONSTRAINT "PK_2e4299a343a81574217255c00ca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "image" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "url" character varying, "typeId" character varying, "type" character varying, CONSTRAINT "PK_d6db1ab4ee9ad9dbe86c64e4cc3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "camping" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "lineIntro" character varying, "intro" character varying, "facltNm" character varying, "factDivNm" character varying, "manageDivNm" character varying, "bizrno" character varying, "manageSttus" character varying, "hvofBgnde" character varying, "hvofEndde" character varying, "featureNm" character varying, "induty" character varying, "lccl" character varying, "doNm" character varying, "addr1" character varying, "addr2" character varying, "location" geometry, "tel" character varying, "homepage" character varying, "gplnInnerFclty" character varying, "caravnInnerFclty" character varying, "operPdCl" character varying, "operDeCl" character varying, "trlerAcmpnyAt" character varying, "caravAcmpnyAt" character varying, "sbrsCl" character varying, "toiletCo" character varying, "swrmCo" character varying, "posblFcltyCl" character varying, "themaEnvrnCl" character varying, "eqpmnLendCl" character varying, "animalCmgCl" character varying, "firstImageUrl" character varying, "sigunguNm" character varying, "contentId" character varying NOT NULL, CONSTRAINT "UQ_d94d8247c5cc7587c86f752409f" UNIQUE ("contentId"), CONSTRAINT "PK_6f83c263e368573c880d34f75e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat_room_users_user" ("chatRoomId" integer NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_78b0004f767c1273a6d13c1220b" PRIMARY KEY ("chatRoomId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4abf95f2b061eff07204eb6928" ON "chat_room_users_user" ("chatRoomId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8fc13654c02f47079cdd00935b" ON "chat_room_users_user" ("userId") `);
        await queryRunner.query(`ALTER TABLE "user" ADD "role" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "nickname" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_e2364281027b926b879fa2fa1e0" UNIQUE ("nickname")`);
        await queryRunner.query(`CREATE TYPE "public"."user_type_enum" AS ENUM('NORMAL', 'KAKAO')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "type" "public"."user_type_enum" NOT NULL DEFAULT 'NORMAL'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "community" ADD CONSTRAINT "FK_38d243246340bda9905ff8fd1e0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_4493ee4f6338bc3fef81c14c445" FOREIGN KEY ("communityId") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_ac7ca6f6fbe56f2a231369f2171" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_e49029a11d5d42ae8a5dd9919a2" FOREIGN KEY ("chatRoomId") REFERENCES "chat_room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorite" ADD CONSTRAINT "FK_83b775fdebbe24c29b2b5831f2d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "review" ADD CONSTRAINT "FK_1337f93918c70837d3cea105d39" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_room_users_user" ADD CONSTRAINT "FK_4abf95f2b061eff07204eb69288" FOREIGN KEY ("chatRoomId") REFERENCES "chat_room"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "chat_room_users_user" ADD CONSTRAINT "FK_8fc13654c02f47079cdd00935b7" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_room_users_user" DROP CONSTRAINT "FK_8fc13654c02f47079cdd00935b7"`);
        await queryRunner.query(`ALTER TABLE "chat_room_users_user" DROP CONSTRAINT "FK_4abf95f2b061eff07204eb69288"`);
        await queryRunner.query(`ALTER TABLE "review" DROP CONSTRAINT "FK_1337f93918c70837d3cea105d39"`);
        await queryRunner.query(`ALTER TABLE "favorite" DROP CONSTRAINT "FK_83b775fdebbe24c29b2b5831f2d"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_e49029a11d5d42ae8a5dd9919a2"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_ac7ca6f6fbe56f2a231369f2171"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_4493ee4f6338bc3fef81c14c445"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b"`);
        await queryRunner.query(`ALTER TABLE "community" DROP CONSTRAINT "FK_38d243246340bda9905ff8fd1e0"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_type_enum"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_e2364281027b926b879fa2fa1e0"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "nickname"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8fc13654c02f47079cdd00935b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4abf95f2b061eff07204eb6928"`);
        await queryRunner.query(`DROP TABLE "chat_room_users_user"`);
        await queryRunner.query(`DROP TABLE "camping"`);
        await queryRunner.query(`DROP TABLE "image"`);
        await queryRunner.query(`DROP TABLE "review"`);
        await queryRunner.query(`DROP TABLE "favorite"`);
        await queryRunner.query(`DROP TABLE "chat_room"`);
        await queryRunner.query(`DROP TABLE "chat"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "community"`);
        
    }

}
