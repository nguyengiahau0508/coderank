import { HintsEntity } from "src/modules/problems/entities/hints.entity";
import { ProblemsEntity } from "src/modules/problems/entities/problems.entity";
import { SolutionsEntity } from "src/modules/problems/entities/solutions.entity";
import { TagsEntity } from "src/modules/problems/entities/tags.entity";
import { TestcasesEntity } from "src/modules/problems/entities/testcases.entity";
import { AuthProvidersEntity } from "src/modules/users/entities/auth-provider.entity";
import { SessionsEntity } from "src/modules/users/entities/session.entity";
import { TokensEntity } from "src/modules/users/entities/token.entity";
import { UsersEntity } from "src/modules/users/entities/user.entity";
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
    SolutionsEntity,
    TestcasesEntity,
    TagsEntity,
    HintsEntity
  ],
  synchronize: false, // ❌ không dùng prod
});
