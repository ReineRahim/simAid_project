import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ScenarioEntity } from './scenario.entity';

@ObjectType()
export class ScenarioStepOptions {
  @Field()
  A: string;

  @Field()
  B: string;

  @Field()
  C: string;

  @Field()
  D: string;
}

@ObjectType()
@Entity({ name: 'scenario_steps' })
export class ScenarioStepEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'step_id', type: 'int' })
  step_id!: number;

  @Field(() => Int)
  @Column({ name: 'scenario_id', type: 'int' })
  scenario_id!: number;

  @Field(() => Int)
  @Column({ name: 'step_order', type: 'int' })
  step_order!: number;

  @Field()
  @Column({ name: 'question_text', type: 'text' })
  question_text!: string;

  @Column({ name: 'option_a', type: 'text' })
  option_a!: string;

  @Column({ name: 'option_b', type: 'text' })
  option_b!: string;

  @Column({ name: 'option_c', type: 'text' })
  option_c!: string;

  @Column({ name: 'option_d', type: 'text' })
  option_d!: string;

  @Field()
  @Column({ type: 'varchar', length: 1 })
  correct_action!: string;

@Field(() => String, { nullable: true })
@Column({ name: 'feedback_message', type: 'text', nullable: true })
feedback_message?: string | null;


  @ManyToOne(() => ScenarioEntity, (scenario) => scenario.steps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'scenario_id' })
  scenario?: ScenarioEntity;

  @Field(() => ScenarioStepOptions)
  get options(): ScenarioStepOptions {
    return {
      A: this.option_a,
      B: this.option_b,
      C: this.option_c,
      D: this.option_d,
    };
  }
}
