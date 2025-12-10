import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'levels' })
export class LevelEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'level_id', type: 'int' })
  level_id!: number;

  @Field()
  @Column({ type: 'varchar', length: 100 })
  title!: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Field(() => Int)
  @Column({ type: 'int', name: 'difficulty_order' })
  difficulty_order!: number;
}
