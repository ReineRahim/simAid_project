import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'badges' })
export class BadgeEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'badge_id', type: 'int' })
  badge_id!: number;

  @Field(() => Int)
  @Column({ name: 'level_id', type: 'int' })
  level_id!: number;

  @Field()
  @Column({ name: 'name', type: 'varchar', length: 255 })
  name!: string;

  @Field()
  @Column({ name: 'description', type: 'text' })
  description!: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'icon_url', type: 'varchar', length: 255, nullable: true })
  icon_url?: string | null;
}
