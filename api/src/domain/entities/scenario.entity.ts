import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { LevelEntity } from './level.entity';
import { ScenarioStepEntity } from './scenario-step.entity';

@ObjectType()
@Entity({ name: 'scenarios' })
export class ScenarioEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'scenario_id', type: 'int' })
  scenario_id!: number;

  @Field(() => Int)
  @Column({ name: 'level_id', type: 'int' })
  level_id!: number;

  @Field()
  @Column({ name: 'title', type: 'varchar', length: 255 })
  title!: string;

@Field(() => String, { nullable: true })
@Column({ name: 'description', type: 'text', nullable: true })
description?: string | null;

@Field(() => String, { nullable: true })
@Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
image_url?: string | null;

  @ManyToOne(() => LevelEntity, (level) => level.level_id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'level_id' })
  level?: LevelEntity;

  @Field(() => [ScenarioStepEntity], { nullable: true })
  @OneToMany(() => ScenarioStepEntity, (step) => step.scenario)
  steps?: ScenarioStepEntity[];
}
