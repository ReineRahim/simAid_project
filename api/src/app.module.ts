import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { LevelsModule } from './modules/levels/levels.module';
import { ScenariosModule } from './modules/scenarios/scenarios.module';
import { ScenarioStepsModule } from './modules/scenario-steps/scenario-steps.module';
import { AttemptsModule } from './modules/attempts/attempts.module';
import { UserLevelsModule } from './modules/user-levels/user-levels.module';
import { BadgesModule } from './modules/badges/badges.module';
import { UserBadgesModule } from './modules/user-badges/user-badges.module';
import { StepAttemptsModule } from './modules/step-attempts/step-attempts.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    AuthModule,
    SharedModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      path: '/graphql',
      sortSchema: true,
      playground: true,
      introspection: true,
    }),
    LevelsModule,
    ScenarioStepsModule,
    ScenariosModule,
    AttemptsModule,
    UserLevelsModule,
    BadgesModule,
    UserBadgesModule,
    StepAttemptsModule,
    UsersModule,
  ],
})
export class AppModule {}
