import { HintsEntity } from "src/module/problems/entities/hints.entity";
import { ProblemsEntity } from "src/module/problems/entities/problems.entity";
import { TagsEntity } from "src/module/problems/entities/tags.entity";
import { TestcasesEntity } from "src/module/problems/entities/testcases.entity";
import { AuthProvidersEntity } from "src/module/users/entities/auth-provider.entity";
import { SessionsEntity } from "src/module/users/entities/session.entity";
import { TokensEntity } from "src/module/users/entities/token.entity";
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
    TokensEntity,
    SessionsEntity,
    AuthProvidersEntity,
    ProblemsEntity,
    TestcasesEntity,
    TagsEntity,
    HintsEntity
  ],
  synchronize: false, // ❌ không dùng prod
});
