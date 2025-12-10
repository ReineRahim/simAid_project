import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'step_attempts' })
export class StepAttemptEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'step_attempt_id', type: 'int' })
  step_attempt_id!: number;

  @Field(() => Int)
  @Column({ name: 'attempt_id', type: 'int' })
  attempt_id!: number;

  @Field(() => Int)
  @Column({ name: 'step_id', type: 'int' })
  step_id!: number;

  @Field()
  @Column({ name: 'user_action', type: 'varchar', length: 10 })
  user_action!: string;

  @Field()
  @Column({ name: 'is_correct', type: 'tinyint', width: 1, default: () => '0' })
  is_correct!: boolean;
}
