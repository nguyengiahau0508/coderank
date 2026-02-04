import { HintsEntity } from "src/module/problems/entities/hints.entity";
import { ProblemsEntity } from "src/module/problems/entities/problems.entity";
import { TagsEntity } from "src/module/problems/entities/tags.entity";
import { TestcasesEntity } from "src/module/problems/entities/testcases.entity";
import { UsersEntity } from "src/module/users/entities/user.entity";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "mariadb",
  host: process.env.DB_MARIADB_HOST,
  port: Number(process.env.DB_MARIADB_PORT),
  username: process.env.DB_MARIADB_USERNAME,
  password: process.env.DB_MARIADB_PASSWORD,
  database: process.env.DB_MARIADB_NAME,
  entities: [
    UsersEntity,
    ProblemsEntity,
    TestcasesEntity,
    TagsEntity,
    HintsEntity
  ],
  synchronize: false, // ❌ không dùng prod
});
