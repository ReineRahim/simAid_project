import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Index(['user_id', 'scenario_id'], { unique: true })
@Entity({ name: 'attempts' })
export class AttemptEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'attempt_id', type: 'int' })
  attempt_id!: number;

  @Field(() => Int)
  @Column({ name: 'user_id', type: 'int' })
  user_id!: number;

  @Field(() => Int)
  @Column({ name: 'scenario_id', type: 'int' })
  scenario_id!: number;

  @Field(() => Int)
  @Column({ name: 'score', type: 'int' })
  score!: number;

  @Field()
  @Column({ name: 'completed_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  completed_at!: Date;
}
