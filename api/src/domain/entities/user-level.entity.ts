import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

const tinyBool = {
  to: (v: boolean) => (v ? 1 : 0),
  from: (v: any) => Boolean(v),
};

@ObjectType()
@Index(['user_id', 'level_id'], { unique: true })
@Entity({ name: 'user_levels' })
export class UserLevelEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'user_level_id', type: 'int' })
  user_level_id!: number;

  @Field(() => Int)
  @Column({ type: 'int' })
  user_id!: number;

  @Field(() => Int)
  @Column({ type: 'int' })
  level_id!: number;

  @Field(() => Boolean)
  @Column({ name: 'unlocked', type: 'tinyint', transformer: tinyBool })
  unlocked!: boolean;

  @Field(() => Boolean)
  @Column({ name: 'completed', type: 'tinyint', transformer: tinyBool })
  completed!: boolean;
}
