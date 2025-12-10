import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Index(['user_id', 'badge_id'], { unique: true })
@Entity({ name: 'user_badges' })
export class UserBadgeEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'user_badge_id', type: 'int' })
  user_badge_id!: number;

  @Field(() => Int)
  @Column({ name: 'user_id', type: 'int' })
  user_id!: number;

  @Field(() => Int)
  @Column({ name: 'badge_id', type: 'int' })
  badge_id!: number;

  @Field()
  @Column({ name: 'earned_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  earned_at!: Date;
}
